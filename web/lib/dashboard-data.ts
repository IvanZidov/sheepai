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

export interface PriorityAction {
  id: string;
  action: string;
  priority: string;
  target_audience: string;
  article_id: string;
  article_headline: string;
  analyzed_at: string;
}

export interface TargetedEntity {
  name: string;
  count: number;
  type: string;
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

export async function fetchPriorityActions(): Promise<PriorityAction[]> {
  // Fetch recent high/critical articles
  const { data, error } = await supabase
    .from("article_analyses")
    .select("id, headline, action_items, analyzed_at")
    .in("priority", ["CRITICAL", "HIGH"])
    .order("analyzed_at", { ascending: false })
    .limit(30); // Limit to recent critical items

  if (error || !data) {
    console.error("Error fetching priority actions:", error);
    return [];
  }

  const actions: PriorityAction[] = [];
  
  data.forEach(article => {
    const items = article.action_items as any[];
    if (!items) return;

    // Filter for immediate/soon actions
    items.filter(item => item.priority === "immediate").forEach((item, idx) => {
      actions.push({
        id: `${article.id}-${idx}`,
        action: item.action,
        priority: item.priority,
        target_audience: item.target_audience,
        article_id: article.id,
        article_headline: article.headline,
        analyzed_at: article.analyzed_at || ""
      });
    });
  });

  // Return top 5 immediate actions
  return actions.slice(0, 5);
}

export async function fetchTopTargeted(): Promise<TargetedEntity[]> {
  const { data, error } = await supabase
    .from("article_analyses")
    .select("affected_entities")
    .order("analyzed_at", { ascending: false })
    .limit(100);

  if (error || !data) {
    console.error("Error fetching top targeted:", error);
    return [];
  }

  const entityMap: Record<string, { count: number, type: string }> = {};

  data.forEach(article => {
    const entities = article.affected_entities as any[];
    if (!entities) return;

    entities.forEach(entity => {
      if (["company", "product", "platform"].includes(entity.entity_type)) {
        const name = entity.name;
        if (!entityMap[name]) {
          entityMap[name] = { count: 0, type: entity.entity_type };
        }
        entityMap[name].count++;
      }
    });
  });

  return Object.entries(entityMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([name, info]) => ({
      name,
      count: info.count,
      type: info.type
    }));
}
