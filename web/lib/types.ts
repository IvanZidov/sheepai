export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type ContentCategory = 
  // Security
  | "security" | "vulnerability" | "malware" | "data_breach" | "privacy"
  // Development
  | "programming" | "web_dev" | "mobile_dev" | "devops" | "open_source"
  // AI & Data
  | "ai_ml" | "llm" | "data_science" | "automation"
  // Cloud & Infrastructure
  | "cloud" | "infrastructure" | "networking" | "database"
  // Business & Industry
  | "startup" | "enterprise" | "acquisition" | "funding" | "layoffs"
  // Product & Releases
  | "product_launch" | "update" | "deprecation" | "tool_release"
  // Learning & Resources
  | "tutorial" | "guide" | "best_practices" | "case_study"
  // Research & Insights
  | "research" | "analysis" | "trends" | "opinion"
  // Regulatory & Policy
  | "regulation" | "compliance" | "legal"
  // Other
  | "hardware" | "gaming" | "crypto" | "other";

export type ContentType = 
  | "breaking_news" | "news" | "tutorial" | "guide" | "review" 
  | "analysis" | "opinion" | "announcement" | "case_study" 
  | "interview" | "research" | "roundup" | "sponsored";

export type AffectedEntity = {
  entity_type: "company" | "product" | "technology" | "platform" | "industry" | "users" | "region";
  name: string;
  details?: string;
};

export type ActionItem = {
  priority: "immediate" | "soon" | "when_possible";
  action: string;
  target_audience: string;
};

export type KeyTakeaway = {
  point: string;
  is_technical: boolean;
  highlight: boolean;
};

export type Region = {
  region: string;
  flag: string;
};

export type VerificationStatus = "VERIFIED" | "UNVERIFIED" | "DISPUTED";

export interface ArticleAnalysis {
  headline: string;
  tldr: string;
  
  priority: Priority;
  categories: ContentCategory[];
  content_type: ContentType;
  
  key_takeaways: KeyTakeaway[];
  affected_entities: AffectedEntity[];
  action_items: ActionItem[];
  
  short_summary: string;
  long_summary: string;
  
  relevance_score: number; // 1-10
  confidence_score: number; // 1-10
  
  is_breaking_news: boolean;
  is_sponsored: boolean;
  worth_full_read: boolean;
  
  read_time_minutes: number;
  related_topics: string[];
  
  mentioned_technologies: string[];
  mentioned_companies: string[];
}

// Legacy Article wrapper to maintain some compatibility or for feed display
export interface Article extends ArticleAnalysis {
  id: string;
  url: string;
  source: "The Hacker News" | "BleepingComputer" | "Dark Reading" | string;
  publishedAt: string;
  
  // Fields for UI compatibility/augmentation
  title?: string;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  
  // Geographic regions affected
  regions: Region[];
}
