"use client";

import { useEffect, useState } from "react";
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { ThreatCard } from "@/components/feed/threat-card";
import { ShepherdChat } from "@/components/chat/shepherd-chat";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureCards } from "@/components/landing/feature-cards";
import { NewsletterInline } from "@/components/landing/newsletter-inline";
import { fetchArticles, verifyArticle } from "@/lib/mock-data";
import { Article } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredArticles = articles.filter(article => {
    const matchesPriority = activeFilter === "All" || article.priority === activeFilter;
    const matchesSearch = article.headline.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.tldr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-emerald-500/20 selection:text-emerald-500">
      <ShepherdNav />
      
      <main>
        <HeroSection />
        <FeatureCards />

        {/* Public Feed Section */}
        <section id="feed" className="py-24 bg-zinc-950 relative">
          <div className="container mx-auto px-4 max-w-5xl">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 font-heading">Latest Intelligence</h2>
                <p className="text-zinc-400">Real-time threats monitored by CyberShepherd.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input 
                    placeholder="Search threats..." 
                    className="pl-10 bg-zinc-900 border-zinc-800 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {/* Mobile Filter Toggle could go here */}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
               {["All", "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].map((f) => (
                 <Button 
                    key={f} 
                    variant={activeFilter === f ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setActiveFilter(f)}
                    className={`text-xs font-mono uppercase tracking-wider ${
                      activeFilter === f 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent" 
                        : "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                 >
                    {f === "CRITICAL" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 animate-pulse" />}
                    {f}
                 </Button>
              ))}
            </div>

            {/* Feed Grid */}
            <div className="space-y-6">
                {loading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="h-64 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
                    ))
                ) : filteredArticles.length > 0 ? (
                    filteredArticles.map((article, index) => (
                        <div key={article.id}>
                           <ThreatCard article={article} onVerify={onVerify} />
                           {/* Inline Newsletter every 2 items */}
                           {index === 1 && <div className="my-8"><NewsletterInline /></div>}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
                        <div className="text-zinc-500 mb-2">No threats found matching your criteria.</div>
                        <Button variant="link" onClick={() => {setActiveFilter("All"); setSearchQuery("");}} className="text-emerald-500">
                          Clear filters
                        </Button>
                    </div>
                )}
            </div>
            
            <div className="mt-12 text-center">
               <Button variant="outline" size="lg" className="h-12 px-8 border-zinc-800 hover:bg-zinc-900 text-zinc-400">
                  Load More Articles
               </Button>
            </div>

          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-zinc-900 py-12 bg-zinc-950">
         <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
            <p>© 2025 CyberShepherd. Silence the noise.</p>
         </div>
      </footer>

      <ShepherdChat />
    </div>
  );
}
