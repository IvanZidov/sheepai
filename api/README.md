# 🐑 SheepAI News Analyzer API

AI-powered news analysis API that automatically scrapes, analyzes, and summarizes articles from The Hacker News.

## Features

- 🔄 **Auto-scraping** - Hourly scraping of The Hacker News
- 🤖 **AI Analysis** - GPT-powered article summarization with structured output
- 🌍 **Region Detection** - Identifies geographic relevance with flags
- ⚡ **Async Processing** - Concurrent article analysis for speed
- 📊 **Priority Scoring** - Critical/High/Medium/Low/Info classification
- 🏷️ **Smart Tagging** - Auto-categorization (Security, AI, Programming, etc.)

## Quick Start

### Docker (Recommended)

```bash
# 1. Create .env file
cat > .env << EOF
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
OPENAI_API_KEY=sk-your-api-key
EOF

# 2. Run with Docker Compose
docker-compose up -d

# 3. Check health
curl http://localhost:8000/health
```

### Local Development

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_KEY=your-anon-key
export OPENAI_API_KEY=sk-your-api-key

# 3. Run from parent directory
cd ..
uvicorn api.main:app --reload --port 8000
```

## API Endpoints

### Articles

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/articles` | List all articles |
| `GET` | `/articles/{id}` | Get article by ID |
| `POST` | `/articles/scrape` | Trigger manual scrape |
| `GET` | `/articles/stats/summary` | Database statistics |

### Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analysis` | List all analyses |
| `GET` | `/analysis/{id}` | Get analysis by ID |
| `POST` | `/analysis/analyze/{article_id}` | Analyze specific article |
| `POST` | `/analysis/batch` | Batch analyze unanalyzed articles |

### Scheduler

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/scheduler/status` | Get scheduler status |
| `POST` | `/scheduler/start` | Start scheduler |
| `POST` | `/scheduler/stop` | Stop scheduler |
| `POST` | `/scheduler/trigger` | Trigger immediate scrape |

### Company Profile (Text-to-Filter)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/company/profile` | Analyze company & generate filter suggestions |
| `POST` | `/company/suggest-filters` | Lightweight filter suggestions only |
| `GET` | `/company/filter-options` | Get all available filter options |

**Example Request:**
```json
POST /company/profile
{
  "company_url": "https://acme-security.com",
  "description": "We are a fintech company using AWS and Kubernetes. Our clients are banks. We're concerned about data breaches."
}
```

**Example Response:**
```json
{
  "profile": {
    "name": "Acme Security",
    "industry": "fintech",
    "tech_stack": ["aws", "kubernetes"]
  },
  "suggested_filters": {
    "categories": ["security", "data_breach", "cloud"],
    "regions": ["usa", "global"],
    "threat_concerns": ["data_breach", "api_security"],
    "technologies": ["aws", "kubernetes"]
  }
}
```

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Service info |
| `GET` | `/health` | Health check |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | ✅ | - | Supabase project URL |
| `SUPABASE_KEY` | ✅ | - | Supabase anon/service key |
| `OPENAI_API_KEY` | ✅ | - | OpenAI API key |
| `OPENAI_MODEL` | ❌ | `gpt-4o-mini` | Model for analysis |
| `SCRAPE_INTERVAL_HOURS` | ❌ | `1` | Hours between scrapes |
| `MAX_CONCURRENT` | ❌ | `5` | Concurrent LLM calls |
| `FIRECRAWL_API_KEY` | ❌* | - | Firecrawl API key (for `/company` endpoints) |

*Required only for company profile endpoints.

## Project Structure

```
api/
├── main.py              # FastAPI app entry point
├── config.py            # Configuration settings
├── database.py          # Supabase client
├── models/
│   ├── article.py       # Pydantic models for analysis
│   └── schemas.py       # API request/response schemas
├── routers/
│   ├── articles.py      # Article endpoints
│   ├── analysis.py      # Analysis endpoints
│   └── scheduler.py     # Scheduler endpoints
├── services/
│   ├── scraper.py       # Web scraping logic
│   ├── analyzer.py      # LLM analysis logic
│   └── slack.py         # Slack formatting
└── utils/
    └── __init__.py      # Utility functions
```

## Analysis Output

Each article analysis includes:

```json
{
  "headline": "Catchy 1-line summary",
  "tldr": "2-3 sentence executive summary",
  "short_summary": "1-2 sentence quick summary",
  "long_summary": "3-5 sentence detailed summary",
  "priority": "critical|high|medium|low|info",
  "categories": ["security", "ai", "programming"],
  "content_type": "news|tutorial|analysis|...",
  "key_takeaways": [
    {"point": "Main insight", "highlight": true, "is_technical": false}
  ],
  "action_items": [
    {"action": "Update systems", "priority": "immediate", "target_audience": "IT teams"}
  ],
  "regions": [
    {"region": "usa", "flag": "🇺🇸"}
  ],
  "relevance_score": 8,
  "confidence_score": 9,
  "read_time_minutes": 5,
  "worth_full_read": true
}
```

## Database Schema

### `news_articles`
Raw scraped articles from The Hacker News.

### `article_analyses`
AI-generated analysis with summaries, priorities, and metadata.

## Deployment

### Railway

```bash
# Link to Railway
railway link

# Deploy
railway up
```

### Docker

```bash
docker build -t sheepai-api .
docker run -p 8000:8000 --env-file .env sheepai-api
```

## License

Built for SheepAI Hackathon 2025

