"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/shell";
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { ThreatCard } from "@/components/feed/threat-card";
import { ShepherdChat } from "@/components/chat/shepherd-chat";
import { fetchArticles, verifyArticle } from "@/lib/mock-data";
import { Article } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Filter, Globe, ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

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

  // Left Sidebar: Filters
  const filters = (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          Threat Severity
        </h3>
        <div className="grid gap-1">
          {["All", "Critical", "High", "Medium", "Low"].map((f) => (
             <Button 
                key={f} 
                variant={activeFilter === f ? "secondary" : "ghost"} 
                size="sm" 
                className="h-8 text-sm justify-start w-full font-normal"
                onClick={() => setActiveFilter(f)}
             >
                {f === "Critical" && <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />}
                {f === "High" && <span className="w-2 h-2 rounded-full bg-orange-500 mr-2" />}
                {f === "Medium" && <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />}
                {f === "Low" && <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />}
                {f}
             </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
         <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Trending Tags
         </h3>
         <div className="flex flex-wrap gap-2">
             {["Ransomware", "Python", "Zero-Day", "Cloud", "AI", "Phishing", "Supply Chain"].map(tag => (
                 <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors px-2 py-1 text-xs"
                 >
                     #{tag}
                 </Badge>
             ))}
         </div>
      </div>
    </div>
  );

  // Right Sidebar: Visuals
  const visuals = (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden backdrop-blur-sm">
        <CardHeader className="p-4 pb-3 border-b border-zinc-800/50">
           <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Global Threat Activity
           </CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative h-48 bg-zinc-950/50">
            {/* Mock Map Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 to-transparent" />
            
            {/* Ping 1: US */}
            <div className="absolute top-[30%] left-[20%]">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75" />
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full absolute top-0.5 left-0.5" />
            </div>

            {/* Ping 2: Europe */}
            <div className="absolute top-[25%] left-[48%]">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-ping delay-300 opacity-75" />
                <div className="w-2 h-2 bg-orange-500 rounded-full absolute top-0.5 left-0.5" />
            </div>
            
             {/* Ping 3: Asia */}
            <div className="absolute top-[40%] left-[75%]">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping delay-700 opacity-75" />
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full absolute top-0.5 left-0.5" />
            </div>

            <div className="absolute bottom-2 right-2 text-[10px] text-zinc-500 font-mono">
                LIVE FEED • 3 REGIONS
            </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardHeader className="p-4 pb-3 border-b border-zinc-800/50">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                System Status
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Scraper Status</span>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-500 font-mono text-xs">ONLINE</span>
                </div>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Articles Processed</span>
                <span className="font-mono text-xs text-foreground">1,248</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Threats Detected</span>
                <span className="text-red-400 font-mono text-xs font-bold">12 CRITICAL</span>
             </div>
        </CardContent>
      </Card>
    </div>
  );

  const filteredArticles = activeFilter === "All" 
    ? articles 
    : articles.filter(a => a.threatLevel.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary">
      <ShepherdNav />
      
      <DashboardShell filters={filters} visuals={visuals}>
          {/* Hero / Intro */}
          <div className="mb-8 p-8 rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-900/50 to-transparent border border-zinc-800 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 opacity-20" />
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
             
             <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-white">
                Silence the Noise. Spot the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Wolves</span>.
             </h1>
             <p className="text-zinc-400 max-w-2xl text-base leading-relaxed">
                CyberShepherd uses Gemini AI to filter, verify, and summarize cybersecurity news, so you can focus on defending the flock.
             </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                    Latest Intelligence
                </h2>
                <span className="text-xs text-muted-foreground font-mono">
                    UPDATED: {new Date().toLocaleTimeString()}
                </span>
            </div>
            
            <div className="grid gap-4 pb-20">
                {loading ? (
                    // Skeletons
                    Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="h-48 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
                    ))
                ) : filteredArticles.length > 0 ? (
                    filteredArticles.map(article => (
                        <ThreatCard key={article.id} article={article} onVerify={onVerify} />
                    ))
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        No threats found for this filter. Stay vigilant.
                    </div>
                )}
            </div>
          </div>
      </DashboardShell>

      <ShepherdChat />
    </div>
  );
}
