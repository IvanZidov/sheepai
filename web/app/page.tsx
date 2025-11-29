"use client";

import { useEffect, useState } from "react";
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { ThreatCard } from "@/components/feed/threat-card";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { HeroSection } from "@/components/landing/hero-section";
import { PainPointsSection } from "@/components/landing/pain-points-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { NewsletterInline } from "@/components/landing/newsletter-inline";
import { fetchArticles } from "@/lib/articles";
import { Article } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Sparkles, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchArticles().then((result) => {
      setArticles(result.data);
      setLoading(false);
    });
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesPriority = activeFilter === "All" || article.priority === activeFilter;
    const matchesSearch = article.headline.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.tldr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans">
      <ShepherdNav />
      
      <main>
        {/* Hero - Dramatic entry */}
        <HeroSection />

        {/* Pain Points - Address all 6 challenges */}
        <PainPointsSection />

        {/* How It Works - Interactive explainer */}
        <HowItWorks />

        {/* Live Feed Preview */}
        <section id="feed" className="py-20 sm:py-24 bg-zinc-50 dark:bg-zinc-900/30 relative">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
          
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            {/* Section header */}
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono mb-6">
                <Sparkles className="w-3 h-3" />
                LIVE PREVIEW
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mb-4 text-zinc-900 dark:text-white">
                See the Shepherd in{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
                  action
                </span>
              </h2>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
                Real articles from The Hacker News, analyzed and scored by our AI. 
                Updated every hour.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8">
              {["All", "CRITICAL", "HIGH", "MEDIUM"].map((f) => (
                <Button 
                  key={f} 
                  variant={activeFilter === f ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setActiveFilter(f)}
                  className={`transition-all ${
                    activeFilter === f 
                      ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-600 text-white" 
                      : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {f === "CRITICAL" && <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />}
                  {f === "HIGH" && <span className="w-2 h-2 rounded-full bg-orange-500 mr-2" />}
                  {f === "MEDIUM" && <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />}
                  {f}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-md mx-auto mb-8 sm:mb-10">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="Search analyzed articles..." 
                className="pl-11 h-12 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Articles Grid */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {loading ? (
                Array.from({length: 4}).map((_, i) => (
                  <div key={i} className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800/50 animate-pulse" />
                ))
              ) : filteredArticles.length > 0 ? (
                <>
                  {filteredArticles.slice(0, 4).map((article, index) => (
                    <div key={article.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <ThreatCard article={article} />
                    </div>
                  ))}
                </>
              ) : (
                <div className="col-span-2 text-center py-16 bg-zinc-100 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <p className="text-zinc-500 dark:text-zinc-400 mb-3">No articles match your filters.</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {setActiveFilter("All"); setSearchQuery("");}}
                    className="border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>

            {/* Newsletter inline between content */}
            <div className="my-10 sm:my-12">
              <NewsletterInline />
            </div>
            
            {/* CTA to Dashboard */}
            <div className="text-center">
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg bg-emerald-600 hover:bg-emerald-500 font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-105"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Open Full Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <p className="mt-4 text-sm text-zinc-500">
                Free access • Login only needed for personalized alerts
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 sm:py-24 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/50 via-white dark:via-zinc-950 to-white dark:to-zinc-950" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              {/* Logo */}
              <div className="mb-6 sm:mb-8 flex justify-center">
                <Image 
                  src="/logo.png" 
                  alt="CyberShepherd" 
                  width={128} 
                  height={128} 
                  className="drop-shadow-lg"
                />
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mb-4 sm:mb-6 text-zinc-900 dark:text-white">
                Join the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
                  protected flock
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-8 sm:mb-10 max-w-xl mx-auto">
                Stop letting the wolves in. Let CyberShepherd guard your security awareness.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg bg-emerald-600 hover:bg-emerald-500 font-semibold shadow-lg shadow-emerald-500/25"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-600">
                No credit card • No signup to browse • Set up alerts in 30 seconds
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 sm:py-8 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="CyberShepherd" width={32} height={32} />
              <span className="font-heading font-bold text-lg">
                <span className="text-zinc-900 dark:text-white">Cyber</span>
                <span className="text-emerald-500">Shepherd</span>
              </span>
            </div>
            
            <p className="text-sm text-zinc-500 text-center">
              Your guide in the wolf-filled web • © 2025 CyberShepherd
            </p>
            
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Dashboard
              </Link>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <Link href="/dashboard/settings" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <ChatSidebar />
    </div>
  );
}
