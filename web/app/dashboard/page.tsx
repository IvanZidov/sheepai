"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/shell";
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { ThreatCard } from "@/components/feed/threat-card";
import { ShepherdChat } from "@/components/chat/shepherd-chat";
import { TechStackFilters } from "@/components/dashboard/tech-stack-filters";
import { FeedToolbar } from "@/components/dashboard/feed-toolbar";
import { FilterGroups } from "@/components/dashboard/filter-groups";
import { TargetedEntitiesFilter } from "@/components/dashboard/targeted-entities-filter";
import { useUserPreferences } from "@/lib/user-preferences";
import { fetchArticles, verifyArticle } from "@/lib/articles";
import { Article, Priority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { 
    techStack, 
    alertThreshold, 
    searchQuery, 
    dateRange, 
    priorityFilter,
    targetedEntities,
    sortBy, 
    resetFilters 
  } = useUserPreferences();

  useEffect(() => {
    fetchArticles().then((data) => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  const onVerify = async (id: string) => {
    const updated = await verifyArticle(id);
    if (updated) {
      setArticles(prev => prev.map(a => a.id === id ? updated : a));
    }
  };

  // Personalization Logic
  const filteredArticles = articles.filter(article => {
    // 1. Check Threshold (relevance_score * 10 >= threshold)
    const score = article.relevance_score * 10;
    if (score < alertThreshold) return false;

    // 2. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        article.headline.toLowerCase().includes(q) ||
        article.short_summary.toLowerCase().includes(q) ||
        article.mentioned_technologies.some(t => t.toLowerCase().includes(q)) ||
        article.affected_entities.some(e => e.name.toLowerCase().includes(q));
      
      if (!match) return false;
    }

    // 3. Date Range
    if (dateRange !== "all") {
      const pubDate = new Date(article.publishedAt);
      const now = new Date();
      const diffHours = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60);
      
      if (dateRange === "24h" && diffHours > 24) return false;
      if (dateRange === "7d" && diffHours > 24 * 7) return false;
      if (dateRange === "30d" && diffHours > 24 * 30) return false;
    }

    // 4. Priority Filter
    if (priorityFilter.length > 0 && !priorityFilter.includes(article.priority)) {
      return false;
    }

    // 5. Targeted Entities Filter
    if (targetedEntities.length > 0) {
       const hasEntity = article.affected_entities.some(e => targetedEntities.includes(e.name));
       if (!hasEntity) return false;
    }

    // 6. Check Tech Stack Match
    // If user has no stack selected, show everything
    if (techStack.length === 0) return true;

    // Check if any mentioned tech matches user stack (case-insensitive)
    const hasMatch = article.mentioned_technologies.some(tech => 
      techStack.some(selected => selected.toLowerCase() === tech.toLowerCase())
    ) || article.categories.some(cat => 
       // Also allow filtering by category if it matches a selected "tech" (if tech stack includes categories)
       techStack.some(selected => selected.toLowerCase() === cat.toLowerCase())
    );
    
    // Always show CRITICAL priority items regardless of tech stack filter
    const isCritical = article.priority === "CRITICAL";
    
    return hasMatch || isCritical; 
  }).sort((a, b) => {
    // Sorting Logic
    if (sortBy === "relevance") {
      return b.relevance_score - a.relevance_score;
    }
    if (sortBy === "priority") {
      const pMap: Record<Priority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 0 };
      return pMap[b.priority] - pMap[a.priority];
    }
    // Default: newest
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const filters = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-500" />
          <h2 className="font-semibold text-sm text-foreground">Filters</h2>
        </div>
        <Button 
          variant="ghost" 
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => resetFilters()}
        >
          Clear All
        </Button>
      </div>
      <FilterGroups />
      <TargetedEntitiesFilter />
      <TechStackFilters />
    </div>
  );

  // No visuals for now, or we can put back the pulse if needed, 
  // but the user asked to remove "this" (new widgets). 
  // So I will leave visuals undefined or empty to remove the right sidebar or keep it minimal.
  // The DashboardShell will hide the right sidebar if visuals is null/undefined?
  // Let's check DashboardShell. 
  // It renders aside hidden xl:block. If visuals is empty, it will be an empty aside.
  // Let's pass null.

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/20 selection:text-emerald-500">
      <ShepherdNav />
      
      <DashboardShell filters={filters} visuals={null}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground font-heading">My Feed</h1>
              <div className="text-xs text-muted-foreground font-mono">
                  {filteredArticles.length} RELEVANT THREATS
              </div>
            </div>

            <FeedToolbar />

            <div className="pb-20">
              {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({length: 6}).map((_, i) => (
                        <div key={i} className="h-80 rounded-xl bg-muted/50 border border-border animate-pulse" />
                    ))}
                  </div>
              ) : filteredArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredArticles.map(article => (
                        <ThreatCard key={article.id} article={article} onVerify={onVerify} />
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-20 bg-muted/30 rounded-xl border border-border border-dashed">
                      <h3 className="text-foreground font-medium mb-2">All Quiet on the Western Front</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                          No threats found matching your active filters.
                      </p>
                      <Button 
                          variant="outline" 
                          className="border-border text-muted-foreground hover:text-foreground"
                          onClick={() => resetFilters()}
                      >
                          Clear All Filters
                      </Button>
                  </div>
              )}
            </div>
          </div>
      </DashboardShell>

      <ShepherdChat />
    </div>
  );
}
