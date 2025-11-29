# Supabase Edge Functions

This folder contains the Supabase Edge Functions for the SheepAI project.

## Functions

### 1. `compute-embedding`

Computes embeddings for article analyses using OpenAI's `text-embedding-3-small` model.

**Trigger:** Called via database trigger on INSERT to `article_analyses`

**What it does:**
1. Receives a record with `id` and `long_summary`
2. Calls OpenAI to compute 1536-dimensional embedding
3. Updates the `embedding` column in `article_analyses`

**Endpoint:**
```
POST https://<project>.supabase.co/functions/v1/compute-embedding
```

**Payload:**
```json
{
  "record": {
    "id": "uuid",
    "long_summary": "Article summary text..."
  }
}
```

---

### 2. `semantic-search`

Performs filtered semantic search across analyzed articles.

**What it does:**
1. Accepts search query and filters
2. Computes embedding for the query
3. Calls `search_articles` database function
4. Returns matching articles sorted by similarity

**Endpoint:**
```
POST https://<project>.supabase.co/functions/v1/semantic-search
```

**Request:**
```json
{
  "query": "ransomware attacks on healthcare",
  "categories": ["security", "malware"],
  "technologies": ["python", "aws"],
  "from_date": "2025-11-01T00:00:00Z",
  "to_date": "2025-11-30T00:00:00Z",
  "tags": ["healthcare", "ransomware"],
  "priority": ["critical", "high"],
  "regions": ["usa", "europe"],
  "match_threshold": 0.3,
  "match_count": 10
}
```

**Response:**
```json
{
  "success": true,
  "query": "ransomware attacks on healthcare",
  "filters_applied": { ... },
  "result_count": 5,
  "results": [
    {
      "id": "uuid",
      "article_title": "...",
      "headline": "...",
      "similarity": 0.85,
      ...
    }
  ]
}
```

---

## Environment Variables (Secrets)

Set these in Supabase Dashboard or via CLI:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-key --project-ref <project-ref>
```

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for embeddings |
| `SUPABASE_URL` | Auto-set by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set by Supabase |

---

## Deployment

### Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref <project-ref>

# Deploy a function
supabase functions deploy compute-embedding
supabase functions deploy semantic-search
```

### Using MCP (already deployed)

The functions in this repo are reference copies. The actual deployed versions are managed via Supabase MCP.

---

## Database Function

The `semantic-search` edge function uses this PostgreSQL function:

```sql
CREATE OR REPLACE FUNCTION search_articles(
  query_embedding text,
  filter_categories text[] DEFAULT NULL,
  filter_technologies text[] DEFAULT NULL,
  filter_from_date timestamptz DEFAULT NULL,
  filter_to_date timestamptz DEFAULT NULL,
  filter_tags text[] DEFAULT NULL,
  filter_priority text[] DEFAULT NULL,
  filter_regions text[] DEFAULT NULL,
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10
)
RETURNS TABLE (...)
```

This function:
1. Casts the embedding string to `vector(1536)`
2. Applies all filters using `&&` (array overlap) for array columns
3. Computes cosine similarity: `1 - (embedding <=> query_embedding)`
4. Returns results above threshold, ordered by similarity

