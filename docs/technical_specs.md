# ⚙️ Technical Architecture & User Flow - CyberShepherd

## 🎯 Core Value Proposition

**CyberShepherd is NOT a security tool. It's a *relevance* tool for cybersecurity professionals.**

* **Problem:** Security teams drown in 100+ daily articles. 95% are irrelevant to their stack.
* **Solution:** AI-powered filtering that understands YOUR company's tech stack and delivers only what matters.
* **Outcome:** A CISO using AWS + Python doesn't see WordPress exploits. They see the Python supply chain attack that could hit them Monday morning.

---

## 🌐 Deployment Architecture

### Production URLs
| Component | URL | Platform |
|-----------|-----|----------|
| **Web App** | https://www.cybershepherd.app/ | Vercel |
| **API** | https://sheepai-api-production.up.railway.app | Railway |
| **API Docs** | https://sheepai-api-production.up.railway.app/docs | Railway |
| **Database** | Supabase (PostgreSQL) | Supabase |
| **Edge Functions** | Supabase Edge Functions | Supabase |

### Tech Stack Overview
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend API | FastAPI (Python), LangChain, APScheduler |
| Database | Supabase (PostgreSQL), pgvector |
| AI/LLM | OpenAI GPT-4o-mini, text-embedding-3-small |
| Email | Brevo (Sendinblue) Transactional API |
| Slack | Slack OAuth 2.0, Slack SDK |
| Web Scraping | BeautifulSoup4, Requests |
| Deployment | Vercel (Frontend), Railway (API), Supabase (DB + Edge) |

---

## 🗺️ User Flow

### 1. Landing Page (Public)

**URL:** https://www.cybershepherd.app/

The landing page showcases the latest security intelligence publicly:

* **Hero Section:** Headline "Silence the Noise" with animated threat indicators
* **Public Feed:** Real-time threat cards filtered by priority (CRITICAL, HIGH, MEDIUM, LOW, INFO)
* **Search:** Full-text search across headlines and TL;DR summaries
* **Newsletter Inline:** Embedded subscription prompt between articles
* **Chat Widget:** Floating Shepherd Assistant button for AI queries

---

### 2. Authentication

**Provider:** Supabase Auth (Google/GitHub SSO)

* **Entry:** User clicks "Dashboard" or any authenticated feature
* **Flow:** Redirects to `/login` → Supabase OAuth → Returns with session
* **Session:** JWT stored in cookies, managed by Supabase client

---

### 3. Dashboard (Authenticated)

**URL:** https://www.cybershepherd.app/dashboard

The main intelligence hub with advanced filtering and semantic search:

#### Layout
| Section | Description |
|---------|-------------|
| **Left Sidebar** | Multi-dimensional filters |
| **Main Feed** | Paginated article cards (24 per page) |
| **Chat Widget** | RAG-powered AI assistant |

#### Filter Categories
* **Region Map:** Interactive geographic filter (40+ countries/regions with flags)
* **Priority Groups:** CRITICAL, HIGH, MEDIUM, LOW, INFO
* **Categories:** 40+ content categories (security, ai_ml, cloud, etc.)
* **Technologies:** Filter by mentioned tech (Python, Kubernetes, AWS, etc.)
* **Date Range:** 24h, 7d, 30d, All time
* **Alert Threshold:** Relevance score slider (0-100)
* **Sort Options:** Newest, Relevance Score, Priority

#### Semantic Search
* **Trigger:** User types in search box
* **Backend:** Query → OpenAI embedding → pgvector similarity search
* **Results:** Ranked by cosine similarity with applied filters
* **Edge Function:** `semantic-search` (Supabase Edge)

---

### 4. Article Detail Page

**URL:** https://www.cybershepherd.app/article/[id]

Comprehensive analysis view for a single article:

* **Header:** Headline, priority badge, relevance score gauge
* **TL;DR:** 2-3 sentence executive summary
* **Key Takeaways:** Bulleted critical points (highlighted, technical badges)
* **Detailed Summary:** Full 3-5 sentence analysis
* **Action Items:** Remediation plan with urgency levels (Immediate/Soon/When Possible)
* **Affected Entities:** Companies, products, technologies, regions involved
* **Technologies:** Tagged tech mentions
* **Regions:** Geographic flags and labels
* **Share Actions:** Email, Slack, Copy Link

---

### 5. Settings Page

**URL:** https://www.cybershepherd.app/dashboard/settings

User preferences and integrations management:

#### Subscriptions Tab
* **Create/Edit Subscriptions:** Name, filters, channels, frequency
* **Frequencies:** Immediate (instant), Daily (9 AM), Weekly (Monday 9 AM)
* **Channels:** Email, Slack
* **Filter Options:** Tech stack, priority, alert threshold, targeted entities

#### Slack Integration Tab
* **OAuth Flow:** "Connect to Slack" → Slack authorization → Callback
* **Channel Selection:** Choose target channel from workspace
* **Status:** Connected workspace name, selected channel

---

### 6. Chat with Filter (RAG)

**Trigger:** Click floating chat button or "Ask Shepherd" on any card

#### Flow
1. User asks a question (e.g., "What NVIDIA vulnerabilities were reported recently?")
2. **Query Enrichment:** GPT-4o-mini expands query with synonyms and context
3. **Embedding:** OpenAI text-embedding-3-small computes query vector
4. **Hybrid Search:** Keyword search (for vendor names) + Semantic search (pgvector)
5. **Context Building:** Top 10 relevant articles form the system prompt
6. **Streaming Response:** GPT-4o-mini answers with article citations

#### Edge Function: `chat-rag`
```
Request:
{
  "query": "What NVIDIA vulnerabilities were reported?",
  "filters": { "categories": ["vulnerability"], "regions": ["usa"] },
  "history": [{ "role": "user", "content": "..." }, ...]
}

Response: Server-Sent Events (SSE)
- metadata: { articles: [...] }
- content: { content: "..." } (streamed)
- [DONE]
```

---

## 🏗️ Technical Specifications

### 1. Database Schema (Supabase PostgreSQL)

#### `news_articles` (517 rows)
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary Key |
| `url` | TEXT | Unique constraint (dedup) |
| `title` | TEXT | Original article title |
| `thumbnail` | TEXT | Article image URL |
| `text` | TEXT | Full article body (scraped) |
| `tags` | TEXT | Source tags (e.g., "Security / Malware") |
| `timestamp` | TEXT | Original publish date string |
| `source` | TEXT | Author/source name |
| `is_sponsored` | BOOLEAN | Sponsored content flag |
| `created_at` | TIMESTAMPTZ | Ingestion timestamp |

#### `article_analyses` (517 rows)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `article_id` | INTEGER | FK to news_articles |
| `article_url` | TEXT | Unique constraint |
| `article_title` | TEXT | Original title |
| `headline` | TEXT | AI-generated catchy headline |
| `tldr` | TEXT | 2-3 sentence executive summary |
| `short_summary` | TEXT | 1-2 sentence summary |
| `long_summary` | TEXT | 3-5 sentence detailed summary |
| `priority` | TEXT | CHECK: critical, high, medium, low, info |
| `categories` | TEXT[] | Content categories array |
| `content_type` | TEXT | Article type (news, tutorial, etc.) |
| `key_takeaways` | JSONB | Array of {point, is_technical, highlight} |
| `affected_entities` | JSONB | Array of {entity_type, name, details} |
| `action_items` | JSONB | Array of {priority, action, target_audience} |
| `relevance_score` | INTEGER | 1-10 practical value score |
| `confidence_score` | INTEGER | 1-10 analysis accuracy |
| `is_breaking_news` | BOOLEAN | Breaking news flag |
| `is_sponsored` | BOOLEAN | Sponsored content flag |
| `worth_full_read` | BOOLEAN | Should user read full article |
| `read_time_minutes` | INTEGER | Estimated read time |
| `related_topics` | TEXT[] | Related search terms |
| `mentioned_technologies` | TEXT[] | Tech mentions |
| `mentioned_companies` | TEXT[] | Company mentions |
| `regions` | JSONB | Array of {region, flag} |
| `model_used` | TEXT | LLM model (default: gpt-4o-mini) |
| `analyzed_at` | TIMESTAMPTZ | Analysis timestamp |
| `embedding` | VECTOR(1536) | OpenAI text-embedding-3-small |

#### `subscriptions` (1 row)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | FK to auth.users |
| `name` | TEXT | Subscription name |
| `filters` | JSONB | {techStack, priority, alertThreshold, targetedEntities} |
| `channels` | JSONB | ["email", "slack"] |
| `frequency` | TEXT | CHECK: immediate, daily, weekly |
| `is_active` | BOOLEAN | Active subscription flag |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `last_notified_at` | TIMESTAMPTZ | Last notification sent |

#### `slack_connections` (1 row)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | FK to auth.users (unique) |
| `team_id` | TEXT | Slack workspace ID |
| `team_name` | TEXT | Workspace display name |
| `access_token` | TEXT | Bot OAuth token (encrypted) |
| `bot_user_id` | TEXT | Bot user ID |
| `channel_id` | TEXT | Selected notification channel |
| `channel_name` | TEXT | Channel display name |
| `scope` | TEXT | OAuth scopes granted |
| `connected_at` | TIMESTAMPTZ | Initial connection time |
| `updated_at` | TIMESTAMPTZ | Last update time |

---

### 2. API Routes (FastAPI)

**Base URL:** https://sheepai-api-production.up.railway.app

#### Articles Router (`/articles`)
| Route | Method | Description |
|-------|--------|-------------|
| `/articles` | GET | List articles (pagination, tag filter) |
| `/articles/{id}` | GET | Get single article by ID |
| `/articles/scrape` | POST | Manually trigger scrape job |
| `/articles/stats/summary` | GET | Database statistics |

#### Analysis Router (`/analysis`)
| Route | Method | Description |
|-------|--------|-------------|
| `/analysis` | GET | List analyses (limit, priority filter) |
| `/analysis/{id}` | GET | Get analysis by UUID |
| `/analysis/by-url` | GET | Get analysis by article URL |
| `/analysis` | POST | Analyze article (custom text) |
| `/analysis/article/{id}` | POST | Analyze article from DB by ID |
| `/analysis/{id}/slack` | GET | Get Slack-formatted analysis |

#### Company Router (`/company`)
| Route | Method | Description |
|-------|--------|-------------|
| `/company/profile` | POST | Full company profile + suggested filters |
| `/company/suggest-filters` | POST | Lightweight filter suggestions |
| `/company/filter-options` | GET | All available filter taxonomy |

#### Notifications Router (`/notifications`)
| Route | Method | Description |
|-------|--------|-------------|
| `/notifications/test-email` | POST | Send test email |

#### Slack Router (`/slack`)
| Route | Method | Description |
|-------|--------|-------------|
| `/slack/install` | GET | Start OAuth flow (redirect) |
| `/slack/callback` | GET | OAuth callback handler |
| `/slack/status` | GET | Check connection status |
| `/slack/channels` | GET | List available channels |
| `/slack/channel` | POST | Set notification channel |
| `/slack/disconnect` | DELETE | Remove Slack connection |

#### Share Router (`/share`)
| Route | Method | Description |
|-------|--------|-------------|
| `/share/email` | POST | Share article via email |
| `/share/slack` | POST | Share article to Slack channel |
| `/share/slack/status` | GET | Check if user can share via Slack |

#### Scheduler Router (`/scheduler`)
| Route | Method | Description |
|-------|--------|-------------|
| `/scheduler/status` | GET | Get scheduler job status |
| `/scheduler/run-now` | POST | Manually trigger scrape |

---

### 3. Supabase Edge Functions

#### `semantic-search`
Performs vector similarity search with filters.

```typescript
// Request
{
  query: string;
  categories?: string[];
  technologies?: string[];
  priority?: string[];
  regions?: string[];
  from_date?: string;
  to_date?: string;
  match_threshold?: number; // default: 0.5
  match_count?: number;     // default: 10
}

// Response
{
  success: boolean;
  query: string;
  result_count: number;
  results: Array<{
    id, article_url, headline, tldr, short_summary,
    priority, categories, technologies, regions,
    analyzed_at, relevance_score, similarity
  }>
}
```

#### `chat-rag`
RAG-based conversational search with streaming responses.

```typescript
// Request
{
  query: string;
  filters?: { categories?, technologies?, priority?, regions? };
  history?: Array<{ role: 'user'|'assistant', content: string }>;
}

// Response (SSE Stream)
data: {"type":"metadata","articles":[...]}
data: {"type":"content","content":"..."}
data: [DONE]
```

#### `compute-embedding`
Triggered by database webhook when new articles are inserted.

```typescript
// Automatic via pg_net trigger
// Computes embedding for article_analyses.headline + short_summary
// Stores in article_analyses.embedding (vector 1536)
```

---

### 4. AI Pipeline

#### Agent A: The Analyst (Article Analysis)
* **Trigger:** New article scraped and saved
* **Input:** Article title, body text, URL, is_sponsored flag
* **Model:** OpenAI GPT-4o-mini via LangChain
* **Prompt:** Structured output for ArticleAnalysis schema
* **Output:** Full analysis saved to `article_analyses`

```python
class ArticleAnalysis(BaseModel):
    headline: str           # Catchy 1-line summary (max 100 chars)
    tldr: str              # 2-3 sentence executive summary
    priority: Priority     # critical, high, medium, low, info
    categories: list[ContentCategory]  # Max 3 categories
    content_type: ContentType
    key_takeaways: list[KeyTakeaway]   # 2-5 items
    affected_entities: list[AffectedEntity]  # Max 5
    action_items: list[ActionItem]     # Max 3
    short_summary: str     # 1-2 sentences
    long_summary: str      # 3-5 sentences
    relevance_score: int   # 1-10 practical value
    confidence_score: int  # 1-10 analysis accuracy
    is_breaking_news: bool
    is_sponsored: bool
    worth_full_read: bool
    read_time_minutes: int
    related_topics: list[str]
    mentioned_technologies: list[str]
    mentioned_companies: list[str]
    regions: list[RegionInfo]  # {region, flag}
```

#### Agent B: The Profiler (Company Analysis)
* **Trigger:** User submits company URL + description
* **Input:** Company website (scraped via Firecrawl), user description
* **Model:** OpenAI GPT-4o-mini
* **Output:** Company profile + suggested filter configuration

#### Agent C: The Counselor (RAG Chat)
* **Trigger:** User asks question in chat
* **Pipeline:**
  1. Query enrichment (expand abbreviations, add synonyms)
  2. Compute embedding (text-embedding-3-small)
  3. Hybrid search (keyword + semantic)
  4. Build context from top 10 articles
  5. Stream GPT-4o-mini response
* **Output:** Streamed markdown answer with article citations

---

### 5. Scheduled Jobs (APScheduler)

| Job | Schedule | Description |
|-----|----------|-------------|
| `scrape_hackernews` | Every 1 hour | Scrapes The Hacker News homepage, saves new articles, analyzes them |
| `weekly_digest` | Monday 9:00 AM | Sends weekly summary emails to subscribers |

#### Scrape Pipeline
```
1. GET https://thehackernews.com/
2. Extract article URLs from homepage
3. Filter out existing URLs (dedup)
4. For each new article:
   a. Fetch full article page
   b. Extract title, body, thumbnail, tags, timestamp
   c. Save to news_articles
   d. Analyze with LLM → Save to article_analyses
   e. Trigger notifications for matching subscriptions
```

---

### 6. Notification System

#### Immediate Notifications
* **Trigger:** New article matches active subscription with `frequency: immediate`
* **Matching:** Check filters (techStack, priority, alertThreshold, targetedEntities)
* **Channels:** Email (Brevo) and/or Slack

#### Daily Digests
* **Trigger:** Scheduled job at 9:00 AM
* **Content:** Articles from last 24 hours matching subscription filters

#### Weekly Digests
* **Trigger:** Monday 9:00 AM
* **Content:** Top 10 articles (by relevance) from last 7 days

#### Email Format (Brevo)
* Branded HTML template with CyberShepherd header
* Priority-colored badges
* Key takeaways list
* Technology tags
* CTA buttons: "View Analysis", "Read Source"

#### Slack Format (Block Kit)
* Priority emoji header (🔴🟠🟡🟢🔵)
* Summary section
* Key takeaways bullets
* Technology tags in backticks
* Action buttons: "🛡️ View Analysis", "🔗 Read Source"

---

### 7. Content Taxonomy

#### Priority Levels
| Priority | Emoji | Description |
|----------|-------|-------------|
| CRITICAL | 🔴 | Breaking news, active exploits, urgent patches |
| HIGH | 🟠 | Important vulnerabilities, significant threats |
| MEDIUM | 🟡 | Notable news, worth knowing |
| LOW | 🟢 | Nice to know, minor updates |
| INFO | 🔵 | Reference material, tutorials |

#### Content Categories (40+)
**Security:** security, vulnerability, malware, data_breach, privacy
**Development:** programming, web_dev, mobile_dev, devops, open_source
**AI & Data:** ai_ml, llm, data_science, automation
**Cloud:** cloud, infrastructure, networking, database
**Business:** startup, enterprise, acquisition, funding, layoffs
**Product:** product_launch, update, deprecation, tool_release
**Learning:** tutorial, guide, best_practices, case_study
**Research:** research, analysis, trends, opinion
**Regulatory:** regulation, compliance, legal
**Other:** hardware, gaming, crypto, other

#### Geographic Regions (40+)
Global, North America, Europe, Asia, Middle East, Africa
Individual countries with flag emojis (🇺🇸🇬🇧🇨🇳🇷🇺🇰🇷🇰🇵🇺🇦🇮🇷🇮🇱🇯🇵🇩🇪...)

---

### 8. Security & Performance

#### Authentication
* Supabase Auth with JWT tokens
* OAuth providers: Google, GitHub
* RLS disabled on public tables (read-only public access)

#### API Security
* CORS: Allow all origins (public API)
* Rate limiting: Managed by Railway/Vercel
* JWT verification for protected endpoints

#### Database
* pgvector extension for embeddings
* pg_net extension for webhook triggers
* Indexes on frequently queried columns

#### Caching
* Vercel Edge caching for static assets
* Client-side state management with React hooks

---

### 9. Environment Variables

#### API (Railway)
```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
BREVO_API_KEY=xkeysib-...
EMAIL_FROM_ADDRESS=noreply@cybershepherd.app
SLACK_CLIENT_ID=xxx
SLACK_CLIENT_SECRET=xxx
SLACK_REDIRECT_URI=https://sheepai-api-production.up.railway.app/slack/callback
FRONTEND_URL=https://www.cybershepherd.app
JWT_SECRET=xxx
SCRAPE_INTERVAL_HOURS=1
```

#### Web (Vercel)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://sheepai-api-production.up.railway.app
```

#### Supabase Edge Functions
```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

### 10. Current Statistics

| Metric | Value |
|--------|-------|
| Total Articles Scraped | 517 |
| Total Analyses | 517 |
| Critical Priority | 152 (29%) |
| High Priority | 365 (71%) |
| Active Subscriptions | 1 |
| Edge Functions | 3 (semantic-search, chat-rag, compute-embedding) |
| Scrape Frequency | Every 1 hour |

---

## 📊 Data Flow Diagrams

### Article Ingestion Flow
```
┌──────────────────┐     ┌──────────────┐     ┌────────────────┐
│  The Hacker News │────▶│  Scraper     │────▶│  news_articles │
│  Homepage        │     │  (FastAPI)   │     │  (Supabase)    │
└──────────────────┘     └──────────────┘     └────────────────┘
                                │
                                ▼
                         ┌──────────────┐     ┌──────────────────┐
                         │  Analyzer    │────▶│article_analyses  │
                         │  (LangChain) │     │  (Supabase)      │
                         └──────────────┘     └──────────────────┘
                                │
                                ▼
                         ┌──────────────┐     ┌──────────────────┐
                         │  DB Trigger  │────▶│compute-embedding │
                         │  (pg_net)    │     │  (Edge Function) │
                         └──────────────┘     └──────────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │  Notifier    │────▶ Email (Brevo)
                         │  (FastAPI)   │────▶ Slack (SDK)
                         └──────────────┘
```

### Search Flow
```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  User Query  │────▶│  semantic-search │────▶│  OpenAI Embed    │
│  (Frontend)  │     │  (Edge Function) │     │  (API)           │
└──────────────┘     └──────────────────┘     └──────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  search_articles │
                         │  (Postgres RPC)  │
                         │  pgvector <->    │
                         └──────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  Results +       │
                         │  Similarity      │
                         └──────────────────┘
```

### RAG Chat Flow
```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  User Query  │────▶│  chat-rag    │────▶│  Query Enrichment│
│  + History   │     │  (Edge Func) │     │  (GPT-4o-mini)   │
└──────────────┘     └──────────────┘     └──────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  Hybrid Search   │
                         │  Keyword + Vector│
                         └──────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  Build Context   │
                         │  (Top 10 Articles│
                         └──────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  Stream Response │
                         │  (GPT-4o-mini)   │
                         └──────────────────┘
```

---

## 🔮 Future Enhancements

* [ ] Multi-source scraping (BleepingComputer, Dark Reading, KrebsOnSecurity)
* [ ] Real-time CVE correlation with NVD/CISA
* [ ] Attack chain visualization (Mermaid.js diagrams)
* [ ] Team/Organization features
* [ ] Threat intelligence feeds integration
* [ ] Browser extension for quick article analysis
* [ ] Mobile app (React Native)
