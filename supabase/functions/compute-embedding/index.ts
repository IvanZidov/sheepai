import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENAI_API_URL = "https://api.openai.com/v1/embeddings";
const EMBEDDING_MODEL = "text-embedding-3-small";

// Get environment variables
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

/**
 * Compute embedding for text using OpenAI text-embedding-3-small
 */
async function computeEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Empty text provided for embedding");
  }

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
 * Update the article_analyses row with the computed embedding
 */
async function updateEmbedding(id: string, embedding: number[]): Promise<void> {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // Convert embedding array to pgvector format string
  const embeddingStr = `[${embedding.join(",")}]`;

  const { error } = await supabase
    .from("article_analyses")
    .update({ embedding: embeddingStr })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update embedding: ${error.message}`);
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    // Validate environment variables
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Parse webhook payload
    const payload = await req.json();

    // Handle both direct calls and webhook format
    const record = payload.record || payload;

    if (!record.id) {
      throw new Error("Missing record ID");
    }

    const longSummary = record.long_summary;

    if (!longSummary) {
      console.log(`No long_summary for record ${record.id}, skipping embedding`);
      return new Response(
        JSON.stringify({ success: true, message: "No long_summary, skipped" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Computing embedding for record ${record.id}...`);

    // Compute embedding
    const embedding = await computeEmbedding(longSummary);

    // Update the record
    await updateEmbedding(record.id, embedding);

    console.log(`Successfully computed and stored embedding for record ${record.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        record_id: record.id,
        embedding_dimensions: embedding.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});

