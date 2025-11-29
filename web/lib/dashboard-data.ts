import { supabase } from "./supabase/client";

export interface ThreatCategory {
  name: string;
  count: number;
  percentChange: number;
  total: number;
}

export interface TrendingTag {
  tag: string;
  count: number;
}

export async function fetchThreatPulseData(): Promise<ThreatCategory[]> {
  // Get counts for key threat categories
  const { data, error } = await supabase.rpc("get_threat_pulse");

  if (error) {
    // Fallback: query directly if RPC doesn't exist
    console.warn("RPC not available, using direct query");
    return fetchThreatPulseDirectly();
  }

  return data || [];
}

async function fetchThreatPulseDirectly(): Promise<ThreatCategory[]> {
  const { data, error } = await supabase
    .from("article_analyses")
    .select("categories, priority")
    .order("analyzed_at", { ascending: false })
    .limit(200);

  if (error || !data) {
    console.error("Error fetching threat pulse:", error);
    return [];
  }

  // Count categories
  const categoryMap: Record<string, number> = {};
  const priorityMap: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  const total = data.length;

  data.forEach((article) => {
    // Count by category
    (article.categories as string[]).forEach((cat) => {
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    // Count by priority
    const priority = (article.priority as string).toLowerCase();
    if (priority in priorityMap) {
      priorityMap[priority]++;
    }
  });

  // Map to display names and calculate percentages
  const threatCategories: ThreatCategory[] = [
    {
      name: "Malware",
      count: categoryMap["malware"] || 0,
      percentChange: Math.round(((categoryMap["malware"] || 0) / total) * 100),
      total,
    },
    {
      name: "Vulnerabilities",
      count: categoryMap["vulnerability"] || 0,
      percentChange: Math.round(((categoryMap["vulnerability"] || 0) / total) * 100),
      total,
    },
    {
      name: "Data Breach",
      count: categoryMap["data_breach"] || 0,
      percentChange: Math.round(((categoryMap["data_breach"] || 0) / total) * 100),
      total,
    },
  ];

  return threatCategories;
}

export interface TechFilter {
  id: string;
  label: string;
  count: number;
}

export async function fetchAvailableTech(): Promise<TechFilter[]> {
  const { data, error } = await supabase
    .from("article_analyses")
    .select("mentioned_technologies")
    .order("analyzed_at", { ascending: false })
    .limit(500);

  if (error || !data) {
    console.error("Error fetching available tech:", error);
    return [];
  }

  // Count all technologies
  const techMap: Record<string, number> = {};

  data.forEach((article) => {
    (article.mentioned_technologies as string[] | null)?.forEach((tech) => {
      if (tech && tech.length > 1 && !tech.includes("malware")) {
        techMap[tech] = (techMap[tech] || 0) + 1;
      }
    });
  });

  // Sort by count and take top 20
  const sorted = Object.entries(techMap)
    .filter(([_, count]) => count >= 3) // At least 3 mentions
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([tech, count]) => ({ 
      id: tech, 
      label: tech,
      count 
    }));

  return sorted;
}

export async function fetchTrendingTags(): Promise<TrendingTag[]> {
  const { data, error } = await supabase
    .from("article_analyses")
    .select("mentioned_technologies, related_topics")
    .order("analyzed_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    console.error("Error fetching trending tags:", error);
    return [];
  }

  // Count all technologies and topics
  const tagMap: Record<string, number> = {};

  data.forEach((article) => {
    // Count technologies
    (article.mentioned_technologies as string[] | null)?.forEach((tech) => {
      if (tech && tech.length > 1) {
        tagMap[tech] = (tagMap[tech] || 0) + 1;
      }
    });
    // Also count related topics
    (article.related_topics as string[] | null)?.forEach((topic) => {
      if (topic && topic.length > 1 && !topic.includes(" ")) {
        tagMap[topic] = (tagMap[topic] || 0) + 1;
      }
    });
  });

  // Sort by count and take top 8
  const sorted = Object.entries(tagMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  return sorted;
}

