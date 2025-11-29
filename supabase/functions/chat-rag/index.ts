import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_URL = "https://api.openai.com/v1";
const EMBEDDING_MODEL = "text-embedding-3-small";
const CHAT_MODEL = "gpt-4o-mini";

// Environment variables
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  query: string;
  filters?: {
    categories?: string[];
    technologies?: string[];
    regions?: string[];
    priority?: string[];
  };
  history?: Message[];
}

interface Article {
  id: string;
  article_title: string;
  short_summary: string;
  long_summary: string;
  categories: string[];
  priority: string;
  regions: { region: string; flag: string }[];
  mentioned_technologies: string[];
  article_url: string;
}

/**
 * Enrich user query for better semantic search
 * - Expands abbreviations and technical terms
 * - Adds context from conversation history
 * - Reformulates for optimal embedding retrieval
 */
async function enrichQuery(
  query: string, 
  history: Message[]
): Promise<string> {
  // Build context from recent history
  const recentContext = history.slice(-3).map(m => 
    `${m.role}: ${m.content}`
  ).join("\n");

  const enrichmentPrompt = `You are a query enrichment system for cybersecurity news search. Your task is to expand user queries for optimal semantic search.

${recentContext ? `Recent conversation:\n${recentContext}\n\n` : ""}User query: "${query}"

Create an enriched search query that:
1. ALWAYS PRESERVE specific vendor/product names (NVIDIA, Microsoft, Cisco, etc.) - these are critical!
2. Expands abbreviations (e.g., "APT" → "Advanced Persistent Threat APT", "RCE" → "Remote Code Execution RCE")
3. Adds relevant technical synonyms (e.g., "bugs" → "bugs vulnerabilities flaws CVE")
4. Incorporates context from the conversation if relevant
5. Keeps it concise (max 80 words)

IMPORTANT: Never remove or replace specific company/product names from the original query!

Output ONLY the enriched query, nothing else.`;

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: enrichmentPrompt }],
      temperature: 0.3,
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    console.error("Query enrichment failed, using original query");
    return query;
  }

  const data = await response.json();
  const enrichment = data.choices?.[0]?.message?.content?.trim() || "";
  
  // HYBRID: Combine original query with enrichment to preserve key terms
  const enrichedQuery = `${query} ${enrichment}`.trim();
  
  console.log(`Original query: "${query}"`);
  console.log(`Enrichment: "${enrichment}"`);
  console.log(`Combined query: "${enrichedQuery.substring(0, 100)}..."`);
  
  return enrichedQuery;
}

/**
 * Compute embedding for text using OpenAI
 */
async function computeEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${OPENAI_API_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      model: EMBEDDING_MODEL,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI Embedding API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Key vendor/product names that trigger direct keyword search
const IMPORTANT_TERMS = [
  'nvidia', 'microsoft', 'google', 'apple', 'amazon', 'cisco', 'intel', 'amd',
  'oracle', 'ibm', 'vmware', 'adobe', 'citrix', 'fortinet', 'paloalto',
  'triton', 'kubernetes', 'docker', 'windows', 'linux', 'android', 'ios'
];

function extractImportantKeywords(query: string): string[] {
  const queryLower = query.toLowerCase();
  return IMPORTANT_TERMS.filter(term => queryLower.includes(term));
}

/**
 * Search articles using hybrid approach: keyword pre-search + semantic
 */
async function searchArticles(
  embedding: number[],
  filters: ChatRequest["filters"],
  originalQuery: string
): Promise<Article[]> {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // Step 1: Find important keywords (vendor/product names)
  const importantKeywords = extractImportantKeywords(originalQuery);
  console.log(`Important keywords found: ${importantKeywords.join(", ") || "none"}`);

  // Step 2: If important keywords found, do keyword search first
  let keywordResults: Article[] = [];
  if (importantKeywords.length > 0) {
    const keyword = importantKeywords[0];
    const { data: kwData } = await supabase
      .from("article_analyses")
      .select("id, article_title, short_summary, long_summary, categories, priority, regions, mentioned_technologies, article_url")
      .or(`article_title.ilike.%${keyword}%,short_summary.ilike.%${keyword}%`)
      .order("analyzed_at", { ascending: false })
      .limit(5);
    
    if (kwData) {
      keywordResults = kwData as Article[];
      console.log(`Keyword search for "${keyword}" found ${keywordResults.length} articles`);
    }
  }

  // Step 3: Semantic search
  const embeddingStr = `[${embedding.join(",")}]`;
  const { data: semanticResults, error } = await supabase.rpc("search_articles", {
    query_embedding: embeddingStr,
    filter_categories: filters?.categories || null,
    filter_technologies: filters?.technologies || null,
    filter_from_date: null,
    filter_to_date: null,
    filter_tags: null,
    filter_priority: filters?.priority || null,
    filter_regions: filters?.regions || null,
    match_threshold: 0.05,
    match_count: 10,
  });

  if (error) {
    throw new Error(`Database search error: ${error.message}`);
  }

  // Step 4: Merge - keyword results first (they're more specific), then semantic
  const seenIds = new Set(keywordResults.map(a => a.id));
  const semanticFiltered = (semanticResults || []).filter((a: Article) => !seenIds.has(a.id));
  
  const combinedResults = [...keywordResults, ...semanticFiltered];
  console.log(`Combined: ${keywordResults.length} keyword + ${semanticFiltered.length} semantic`);

  return combinedResults.slice(0, 10);
}

/**
 * Build the system prompt with article context
 */
function buildSystemPrompt(articles: Article[]): string {
  const articleContext = articles.map((a, i) => `
[Article ${i + 1}]
Title: ${a.article_title}
Summary: ${a.short_summary}
${a.long_summary ? `Details: ${a.long_summary}` : ""}
Categories: ${a.categories?.join(", ") || "N/A"}
Priority: ${a.priority || "N/A"}
Regions: ${a.regions?.map(r => `${r.flag} ${r.region}`).join(", ") || "Global"}
Technologies: ${a.mentioned_technologies?.join(", ") || "N/A"}
URL: ${a.article_url}
`).join("\n---\n");

  return `You are SheepAI, a helpful cybersecurity and tech news assistant. You help users understand recent security threats, vulnerabilities, and technology news.

Your knowledge is based on the following recent articles:

${articleContext}

Guidelines:
- Answer questions based on the provided articles
- Be concise but informative
- If asked about something not covered in the articles, say so
- Always cite the relevant article when possible
- Use markdown formatting for better readability
- For security issues, emphasize actionable advice when relevant
- If multiple articles are relevant, synthesize the information
- Be conversational and helpful`;
}

/**
 * Stream chat completion from OpenAI
 */
async function* streamChatCompletion(
  systemPrompt: string,
  history: Message[],
  userQuery: string
): AsyncGenerator<string> {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-5), // Last 5 messages
    { role: "user", content: userQuery },
  ];

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI Chat API error: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("No response body");
  }

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;
      if (!trimmed.startsWith("data: ")) continue;

      try {
        const json = JSON.parse(trimmed.slice(6));
        const content = json.choices?.[0]?.delta?.content;
        if (content) {
          yield content;
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }
}

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Parse request
    const request: ChatRequest = await req.json();

    if (!request.query || request.query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Chat query: "${request.query.substring(0, 50)}..."`);
    console.log(`Filters:`, JSON.stringify(request.filters));
    console.log(`History length: ${request.history?.length || 0}`);

    // Step 1: Enrich the query for better retrieval
    const enrichedQuery = await enrichQuery(request.query, request.history || []);

    // Step 2: Compute embedding for the enriched query
    const embedding = await computeEmbedding(enrichedQuery);
    console.log(`Computed embedding (${embedding.length} dimensions)`);

    // Step 2: Search for relevant articles
    const articles = await searchArticles(embedding, request.filters, request.query);
    console.log(`Found ${articles.length} relevant articles`);

    // Step 3: Build system prompt with article context
    const systemPrompt = buildSystemPrompt(articles);

    // Step 4: Stream chat response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Send article metadata first
        const metadata = JSON.stringify({
          type: "metadata",
          articles: articles.map(a => ({
            id: a.id,
            title: a.article_title,
            url: a.article_url,
          })),
        });
        controller.enqueue(encoder.encode(`data: ${metadata}\n\n`));

        // Stream the chat response
        try {
          for await (const chunk of streamChatCompletion(
            systemPrompt,
            request.history || [],
            request.query
          )) {
            const data = JSON.stringify({ type: "content", content: chunk });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          const errorData = JSON.stringify({ type: "error", error: error.message });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        }
        
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error.message);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

