import { supabase } from "./supabase/client";
import { Article, Priority, VerificationStatus } from "./types";

interface DBArticleAnalysis {
  id: string;
  article_id: number | null;
  article_url: string;
  article_title: string;
  headline: string;
  tldr: string;
  short_summary: string;
  long_summary: string;
  priority: string;
  categories: string[];
  content_type: string;
  key_takeaways: Array<{ point: string; is_technical: boolean; highlight: boolean }>;
  affected_entities: Array<{ entity_type: string; name: string; details?: string }>;
  action_items: Array<{ priority: string; action: string; target_audience: string }>;
  relevance_score: number;
  confidence_score: number;
  is_breaking_news: boolean | null;
  is_sponsored: boolean | null;
  worth_full_read: boolean | null;
  read_time_minutes: number;
  related_topics: string[] | null;
  mentioned_technologies: string[] | null;
  mentioned_companies: string[] | null;
  model_used: string;
  analyzed_at: string | null;
  regions: Array<{ region: string; flag: string }>;
  // Joined from news_articles
  news_articles?: {
    source: string | null;
    timestamp: string | null;
    thumbnail?: string | null;
  } | null;
}

function mapPriority(dbPriority: string): Priority {
  const priorityMap: Record<string, Priority> = {
    critical: "CRITICAL",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
    info: "INFO",
  };
  return priorityMap[dbPriority.toLowerCase()] || "INFO";
}

function mapDBToArticle(db: DBArticleAnalysis): Article {
  return {
    id: db.id,
    url: db.article_url,
    title: db.article_title,
    source: db.news_articles?.source || "Unknown",
    publishedAt: db.news_articles?.timestamp || db.analyzed_at || new Date().toISOString(),

    headline: db.headline,
    tldr: db.tldr,
    short_summary: db.short_summary,
    long_summary: db.long_summary,

    priority: mapPriority(db.priority),
    categories: db.categories as Article["categories"],
    content_type: db.content_type as Article["content_type"],

    key_takeaways: db.key_takeaways,
    affected_entities: db.affected_entities.map((e) => ({
      entity_type: e.entity_type as Article["affected_entities"][0]["entity_type"],
      name: e.name,
      details: e.details,
    })),
    action_items: db.action_items.map((a) => ({
      priority: a.priority as Article["action_items"][0]["priority"],
      action: a.action,
      target_audience: a.target_audience,
    })),

    relevance_score: db.relevance_score,
    confidence_score: db.confidence_score,

    is_breaking_news: db.is_breaking_news ?? false,
    is_sponsored: db.is_sponsored ?? false,
    worth_full_read: db.worth_full_read ?? true,

    read_time_minutes: db.read_time_minutes,
    related_topics: db.related_topics ?? [],
    mentioned_technologies: db.mentioned_technologies ?? [],
    mentioned_companies: db.mentioned_companies ?? [],

    verificationStatus: "VERIFIED" as VerificationStatus,
    verificationNote: `Analyzed by ${db.model_used} on ${new Date(db.analyzed_at || "").toLocaleDateString()}`,
    
    regions: db.regions ?? [],
    thumbnail: db.news_articles?.thumbnail || undefined,
  };
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface ArticleFilters {
  categories?: string[];
  technologies?: string[];
  priorities?: string[];
  regions?: string[];
  tags?: string[];
  fromDate?: string;
  toDate?: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

/**
 * Fetch articles with optional filters and pagination
 */
export async function fetchArticles(
  filters?: ArticleFilters,
  pagination?: PaginationOptions
): Promise<PaginatedResult<Article>> {
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 24;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("article_analyses")
    .select(
      `
      *,
      news_articles (
        source,
        timestamp,
        thumbnail
      )
    `,
      { count: "exact" }
    );

  // Apply filters
  if (filters?.categories && filters.categories.length > 0) {
    query = query.overlaps("categories", filters.categories);
  }

  if (filters?.technologies && filters.technologies.length > 0) {
    query = query.overlaps("mentioned_technologies", filters.technologies);
  }

  if (filters?.priorities && filters.priorities.length > 0) {
    query = query.in("priority", filters.priorities.map(p => p.toLowerCase()));
  }

  if (filters?.regions && filters.regions.length > 0) {
    // regions is JSONB array, need to use contains for each
    // Using raw filter for JSONB array matching
    const regionFilters = filters.regions.map(r => `regions.cs.[{"region":"${r}"}]`).join(',');
    // Alternative: filter on client side for now
  }

  if (filters?.fromDate) {
    query = query.gte("analyzed_at", filters.fromDate);
  }

  if (filters?.toDate) {
    query = query.lte("analyzed_at", filters.toDate);
  }

  // Apply pagination and ordering
  query = query
    .order("analyzed_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching articles:", error);
    return { data: [], total: 0, page, pageSize, hasMore: false };
  }

  const articles = (data as DBArticleAnalysis[]).map(mapDBToArticle);
  
  // Client-side filter for regions (JSONB array is tricky with Supabase)
  const filteredArticles = filters?.regions && filters.regions.length > 0
    ? articles.filter(a => 
        a.regions.some(r => filters.regions!.includes(r.region))
      )
    : articles;

  const total = count ?? 0;

  return {
    data: filteredArticles,
    total,
    page,
    pageSize,
    hasMore: offset + pageSize < total,
  };
}

/**
 * Fetch a single article by ID
 */
export async function fetchArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("article_analyses")
    .select(
      `
      *,
      news_articles (
        source,
        timestamp,
        thumbnail
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching article:", error);
    return null;
  }

  return mapDBToArticle(data as DBArticleAnalysis);
}

/**
 * Verify an article (re-fetch for now, could trigger re-analysis)
 */
export async function verifyArticle(id: string): Promise<Article | undefined> {
  const article = await fetchArticleById(id);
  return article || undefined;
}

// =============================================================================
// SEMANTIC SEARCH
// =============================================================================

interface SemanticSearchRequest {
  query: string;
  categories?: string[];
  technologies?: string[];
  from_date?: string;
  to_date?: string;
  tags?: string[];
  priority?: string[];
  regions?: string[];
  match_threshold?: number;
  match_count?: number;
}

interface SemanticSearchResult {
  id: string;
  article_url: string;
  article_title: string;
  headline: string;
  tldr: string;
  short_summary: string;
  priority: string;
  categories: string[];
  technologies: string[];
  regions: Array<{ region: string; flag: string }>;
  analyzed_at: string;
  relevance_score: number;
  similarity: number;
}

interface SemanticSearchResponse {
  success: boolean;
  query: string;
  result_count: number;
  results: SemanticSearchResult[];
  error?: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Edge Functions require the anon key (JWT format), NOT the publishable key
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
/**
 * Perform semantic search using the Supabase Edge Function
 */
export async function semanticSearch(
  query: string,
  filters?: ArticleFilters,
  matchCount: number = 20
): Promise<Article[]> {
  if (!query.trim()) {
    return [];
  }

  const requestBody: SemanticSearchRequest = {
    query: query.trim(),
    match_count: matchCount,
    match_threshold: 0.25, // Lower threshold for more results
  };

  // Map filters to edge function format
  if (filters?.categories && filters.categories.length > 0) {
    requestBody.categories = filters.categories;
  }

  if (filters?.technologies && filters.technologies.length > 0) {
    requestBody.technologies = filters.technologies;
  }

  if (filters?.priorities && filters.priorities.length > 0) {
    requestBody.priority = filters.priorities.map(p => p.toLowerCase());
  }

  if (filters?.regions && filters.regions.length > 0) {
    requestBody.regions = filters.regions;
  }

  if (filters?.fromDate) {
    requestBody.from_date = filters.fromDate;
  }

  if (filters?.toDate) {
    requestBody.to_date = filters.toDate;
  }

  if (filters?.tags && filters.tags.length > 0) {
    requestBody.tags = filters.tags;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/semantic-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Semantic search error:", errorText);
      return [];
    }

    const result: SemanticSearchResponse = await response.json();

    if (!result.success || !result.results) {
      console.error("Semantic search failed:", result.error);
      return [];
    }

    // Map search results to Article type
    // We need to fetch full articles for the matching IDs
    const articleIds = result.results.map(r => r.id);
    
    if (articleIds.length === 0) {
      return [];
    }

    // Fetch full article data for the search results
    const { data, error } = await supabase
      .from("article_analyses")
      .select(
        `
        *,
        news_articles (
          source,
          timestamp,
          thumbnail
        )
      `
      )
      .in("id", articleIds);

    if (error || !data) {
      console.error("Error fetching search result articles:", error);
      return [];
    }

    const articlesMap = new Map(
      (data as DBArticleAnalysis[]).map(a => [a.id, mapDBToArticle(a)])
    );

    // Return articles in order of similarity score
    return result.results
      .map(r => articlesMap.get(r.id))
      .filter((a): a is Article => a !== undefined);

  } catch (error) {
    console.error("Semantic search error:", error);
    return [];
  }
}

// =============================================================================
// DEBOUNCE UTILITY
// =============================================================================

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// =============================================================================
// AGGREGATION FUNCTIONS
// =============================================================================

/**
 * Get unique categories from all articles
 */
export async function getAvailableCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("article_analyses")
    .select("categories");

  if (error || !data) {
    return [];
  }

  const allCategories = data.flatMap(d => d.categories || []);
  return [...new Set(allCategories)].sort();
}

/**
 * Get unique technologies from all articles
 */
export async function getAvailableTechnologies(): Promise<string[]> {
  const { data, error } = await supabase
    .from("article_analyses")
    .select("mentioned_technologies");

  if (error || !data) {
    return [];
  }

  const allTechs = data.flatMap(d => d.mentioned_technologies || []);
  return [...new Set(allTechs)].sort();
}

/**
 * Get unique regions from all articles
 */
export async function getAvailableRegions(): Promise<Array<{ region: string; flag: string }>> {
  const { data, error } = await supabase
    .from("article_analyses")
    .select("regions");

  if (error || !data) {
    return [];
  }

  const regionMap = new Map<string, string>();
  data.forEach(d => {
    (d.regions || []).forEach((r: { region: string; flag: string }) => {
      if (!regionMap.has(r.region)) {
        regionMap.set(r.region, r.flag);
      }
    });
  });

  return Array.from(regionMap.entries())
    .map(([region, flag]) => ({ region, flag }))
    .sort((a, b) => a.region.localeCompare(b.region));
}

/**
 * Get article statistics
 */
export async function getArticleStats(): Promise<{
  total: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  last24h: number;
}> {
  const { count: total } = await supabase
    .from("article_analyses")
    .select("*", { count: "exact", head: true });

  const { data } = await supabase
    .from("article_analyses")
    .select("priority, categories, analyzed_at");

  const byPriority: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let last24h = 0;

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  (data || []).forEach(a => {
    // Count by priority
    const p = a.priority?.toLowerCase() || "info";
    byPriority[p] = (byPriority[p] || 0) + 1;

    // Count by category
    (a.categories || []).forEach((c: string) => {
      byCategory[c] = (byCategory[c] || 0) + 1;
    });

    // Count last 24h
    if (a.analyzed_at && new Date(a.analyzed_at) > yesterday) {
      last24h++;
    }
  });

  return {
    total: total || 0,
    byPriority,
    byCategory,
    last24h,
  };
}
