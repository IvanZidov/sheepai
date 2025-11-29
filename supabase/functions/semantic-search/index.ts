import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_URL = "https://api.openai.com/v1/embeddings";
const EMBEDDING_MODEL = "text-embedding-3-small";

// Environment variables
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface SearchRequest {
  query: string;                    // Search query text
  categories?: string[];            // Filter by categories
  technologies?: string[];          // Filter by tech stack
  from_date?: string;               // Filter from date (ISO string)
  to_date?: string;                 // Filter to date (ISO string)
  tags?: string[];                  // Filter by tags/topics
  priority?: string[];              // Filter by priority levels
  regions?: string[];               // Filter by regions
  match_threshold?: number;         // Similarity threshold (0-1, default 0.3)
  match_count?: number;             // Max results (default 10)
}

/**
 * Compute embedding for text using OpenAI
 */
async function computeEmbedding(text: string): Promise<number[]> {
  const response = await fetch(OPENAI_API_URL, {
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
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Search articles using the database function
 */
async function searchArticles(
  embedding: number[],
  filters: SearchRequest
): Promise<any[]> {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // Format embedding as pgvector string
  const embeddingStr = `[${embedding.join(",")}]`;

  const { data, error } = await supabase.rpc("search_articles", {
    query_embedding: embeddingStr,
    filter_categories: filters.categories || null,
    filter_technologies: filters.technologies || null,
    filter_from_date: filters.from_date || null,
    filter_to_date: filters.to_date || null,
    filter_tags: filters.tags || null,
    filter_priority: filters.priority || null,
    filter_regions: filters.regions || null,
    match_threshold: filters.match_threshold ?? 0.3,
    match_count: filters.match_count ?? 10,
  });

  if (error) {
    throw new Error(`Database search error: ${error.message}`);
  }

  return data || [];
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
    const request: SearchRequest = await req.json();

    if (!request.query || request.query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Query text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Searching for: "${request.query.substring(0, 50)}..."`);
    console.log(`Filters:`, JSON.stringify({
      categories: request.categories,
      technologies: request.technologies,
      from_date: request.from_date,
      to_date: request.to_date,
      tags: request.tags,
      priority: request.priority,
      regions: request.regions,
    }));

    // Compute embedding for query
    const embedding = await computeEmbedding(request.query);
    console.log(`Computed embedding (${embedding.length} dimensions)`);

    // Search articles
    const results = await searchArticles(embedding, request);
    console.log(`Found ${results.length} matching articles`);

    return new Response(
      JSON.stringify({
        success: true,
        query: request.query,
        filters_applied: {
          categories: request.categories || null,
          technologies: request.technologies || null,
          from_date: request.from_date || null,
          to_date: request.to_date || null,
          tags: request.tags || null,
          priority: request.priority || null,
          regions: request.regions || null,
        },
        match_threshold: request.match_threshold ?? 0.3,
        result_count: results.length,
        results: results.map((r) => ({
          id: r.id,
          article_url: r.article_url,
          article_title: r.article_title,
          headline: r.headline,
          tldr: r.tldr,
          short_summary: r.short_summary,
          priority: r.priority,
          categories: r.categories,
          technologies: r.mentioned_technologies,
          regions: r.regions,
          analyzed_at: r.analyzed_at,
          relevance_score: r.relevance_score,
          similarity: r.similarity,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Search error:", error.message);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

