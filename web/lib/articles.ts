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
  };
}

export async function fetchArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("article_analyses")
    .select(
      `
      *,
      news_articles (
        source,
        timestamp
      )
    `
    )
    .order("analyzed_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching articles:", error);
    return [];
  }

  return (data as DBArticleAnalysis[]).map(mapDBToArticle);
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("article_analyses")
    .select(
      `
      *,
      news_articles (
        source,
        timestamp
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

export async function verifyArticle(id: string): Promise<Article | undefined> {
  // For now, just fetch and return the article
  // In the future, this could trigger a re-analysis or verification workflow
  const article = await fetchArticleById(id);
  return article || undefined;
}

