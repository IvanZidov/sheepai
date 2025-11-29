# SheepAI Web Frontend

AI-powered news aggregation and personalization platform built with Next.js 14.

## Features

- 🔍 **Semantic Search** - AI-powered search using embeddings for better results
- 🏷️ **Smart Filtering** - Filter by categories, regions, technologies, and priority
- 🏢 **Company Profiling** - Analyze your company to get personalized filter suggestions
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Dark Mode** - Built-in theme support
- 🔐 **Authentication** - Supabase Auth with Google/Email login

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Supabase project with:
  - `article_analyses` table with embeddings
  - `semantic-search` Edge Function deployed
- FastAPI backend running (for company profile analysis)

### Environment Variables

Create a `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# FastAPI Backend URL (for company profile analysis)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Architecture

### Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js Web   │────▶│    Supabase     │────▶│  Edge Functions │
│   (Frontend)    │     │   (Database)    │     │ (Semantic Search│
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         │ Company Profile
         ▼
┌─────────────────┐
│  FastAPI API    │
│ (Filter Suggest)│
└─────────────────┘
```

### Key Files

| File | Description |
|------|-------------|
| `lib/articles.ts` | Article fetching, semantic search, pagination |
| `lib/api.ts` | FastAPI backend calls for company profile |
| `lib/user-preferences.ts` | Zustand store for filters and preferences |
| `lib/supabase/client.ts` | Supabase client initialization |

### Components

| Component | Description |
|-----------|-------------|
| `dashboard/page.tsx` | Main feed with filters and search |
| `dashboard/settings/page.tsx` | Company profile onboarding |
| `feed/threat-card.tsx` | Article card component |
| `dashboard/category-filter.tsx` | Category filter component |
| `dashboard/region-filter.tsx` | Region filter component |
| `dashboard/technology-filter.tsx` | Technology filter component |

## Features in Detail

### Semantic Search

When you type in the search bar, the app:
1. Waits 400ms for debounce
2. Sends query to `semantic-search` Supabase Edge Function
3. Edge Function computes embedding and searches with pgvector
4. Returns articles sorted by semantic similarity

### Company Profile Onboarding

1. Go to Settings → Smart Feed Personalization
2. Enter your company URL and description
3. AI analyzes your company and suggests filters
4. Apply suggested filters to your feed

### Filtering

- **Categories**: Security, AI/ML, Cloud, etc.
- **Regions**: Geographic regions with flags
- **Technologies**: Tech stack (Python, AWS, etc.)
- **Priority**: Critical, High, Medium, Low, Info
- **Date Range**: 24h, 7d, 30d, All time

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

Deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or use the Vercel CLI:

```bash
vercel
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Database**: Supabase (PostgreSQL + pgvector)
- **Auth**: Supabase Auth
- **Search**: OpenAI Embeddings + pgvector
