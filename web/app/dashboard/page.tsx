"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/shell";
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { ThreatCard } from "@/components/feed/threat-card";
import { ShepherdChat } from "@/components/chat/shepherd-chat";
import { TechStackFilters } from "@/components/dashboard/tech-stack-filters";
import { AlertThreshold } from "@/components/dashboard/alert-threshold";
import { ThreatPulse, TrendingTags } from "@/components/dashboard/threat-pulse";
import { useUserPreferences } from "@/lib/user-preferences";
import { fetchArticles, verifyArticle } from "@/lib/articles";
import { Article } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { techStack, alertThreshold } = useUserPreferences();

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

    // 2. Check Tech Stack Match
    // If user has no stack selected, show everything (or nothing? safer to show everything or ask to select)
    // Let's assume if stack is empty, we show popular stuff or everything.
    if (techStack.length === 0) return true;

    // Check if any mentioned tech matches user stack
    const hasMatch = article.mentioned_technologies.some(tech => 
      techStack.includes(tech)
    ) || article.categories.some(cat => 
       // Map some categories to tech stack loosely if needed, but relying on direct tech match is better
       false
    );
    
    // Always show CRITICAL priority items regardless of tech stack filter
    // This ensures critical security alerts are never missed
    
    const isCritical = article.priority === "CRITICAL";
    
    return hasMatch || isCritical; 
  });

  const filters = (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Filter className="w-4 h-4 text-emerald-500" />
        <h2 className="font-semibold text-sm text-foreground">Filters</h2>
      </div>
      <TechStackFilters />
      <AlertThreshold />
    </div>
  );

  const visuals = (
    <div className="space-y-6">
      <ThreatPulse />
      <TrendingTags />
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/20 selection:text-emerald-500">
      <ShepherdNav />
      
      <DashboardShell filters={filters} visuals={visuals}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground font-heading">My Feed</h1>
            <div className="text-xs text-muted-foreground font-mono">
                {filteredArticles.length} RELEVANT THREATS
            </div>
          </div>

          <div className="space-y-6 pb-20">
            {loading ? (
                Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="h-64 rounded-xl bg-muted/50 border border-border animate-pulse" />
                ))
            ) : filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                    <ThreatCard key={article.id} article={article} onVerify={onVerify} />
                ))
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-border border-dashed">
                    <h3 className="text-foreground font-medium mb-2">All Quiet on the Western Front</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        No threats found matching your tech stack and threshold ({alertThreshold}+).
                    </p>
                    <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground">
                        Adjust Filters
                    </Button>
                </div>
            )}
          </div>
      </DashboardShell>

      <ShepherdChat />
    </div>
  );
}
