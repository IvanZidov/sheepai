import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Article, Priority } from "@/lib/types";
import { TrustBadge } from "./trust-badge";
import { ExternalLink, MessageSquare, Share2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThreatMeter } from "./threat-meter";

interface ThreatCardProps {
  article: Article;
  onVerify: (id: string) => Promise<void>;
}

export function ThreatCard({ article, onVerify }: ThreatCardProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const priorityConfig: Record<Priority, { border: string, shadow: string, badge: string, text: string }> = {
    CRITICAL: { 
        border: "border-l-destructive", 
        shadow: "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        badge: "bg-destructive/10 text-destructive",
        text: "text-destructive"
    },
    HIGH: { 
        border: "border-l-warning", 
        shadow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
        badge: "bg-warning/10 text-warning",
        text: "text-warning"
    },
    MEDIUM: { 
        border: "border-l-warning", 
        shadow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
        badge: "bg-warning/10 text-warning",
        text: "text-warning"
    },
    LOW: { 
        border: "border-l-safe", 
        shadow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
        badge: "bg-safe/10 text-safe",
        text: "text-safe"
    },
    INFO: {
        border: "border-l-secondary",
        shadow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
        badge: "bg-secondary/10 text-secondary",
        text: "text-secondary"
    }
  };

  const config = priorityConfig[article.priority] || priorityConfig.INFO;

  const handleVerify = async () => {
    setIsVerifying(true);
    await onVerify(article.id);
    setIsVerifying(false);
  };

  // Calculate gauge score (1-10 -> 10-100)
  const gaugeScore = article.relevance_score * 10;

  return (
    <Card className={cn(
        "bg-card border-y border-r border-border border-l-4 backdrop-blur-sm transition-all duration-300 ease-out overflow-hidden relative group hover:-translate-y-[2px]",
        config.border,
        config.shadow
    )}>
      {/* Shimmer Overlay when Verifying */}
      {isVerifying && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -skew-x-12 animate-shimmer z-10 pointer-events-none" />
      )}

      <CardHeader className="pb-3 space-y-2.5 relative z-20">
        <div className="flex justify-between items-start gap-4">
            <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 mb-2">
                   <span className={cn(
                       "text-[10px] font-bold px-1.5 py-0.5 rounded-sm font-mono uppercase tracking-wider", 
                       config.badge
                   )}>
                     {article.priority}
                   </span>
                   <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                     {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                   </span>
                   <TrustBadge status={article.verificationStatus} note={article.verificationNote} />
                </div>
                <h3 className="font-heading font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        {article.headline}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                    </a>
                </h3>
            </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 flex flex-col sm:flex-row gap-4 relative z-20">
         <div className="flex-1 space-y-3">
            {/* TL;DR Section */}
            <p className="text-sm text-muted-foreground italic border-l-2 border-zinc-700 pl-3 py-1">
                "{article.tldr}"
            </p>

            {/* Key Takeaways */}
            <ul className="space-y-1.5">
                {article.key_takeaways.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className={cn("block w-1 h-1 mt-1.5 rounded-full shrink-0", item.highlight ? "bg-primary" : "bg-zinc-600")} />
                        <span className={cn(item.highlight && "text-foreground font-medium")}>{item.point}</span>
                    </li>
                ))}
            </ul>
         </div>
         {/* Gauge positioned to the right of content */}
         <div className="shrink-0 hidden sm:flex flex-col items-center justify-center bg-zinc-900/30 rounded-lg p-2 border border-zinc-800/50">
            <span className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Relevance</span>
            <ThreatMeter score={gaugeScore} size="sm" />
         </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-0 relative z-20">
          <div className="flex gap-2 flex-wrap">
             {article.categories.slice(0, 4).map(cat => (
                 <Badge 
                    key={cat} 
                    variant="outline" 
                    className="text-[10px] px-2 py-0.5 h-5 font-mono text-zinc-400 border-zinc-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer hover:scale-105 uppercase"
                 >
                    #{cat.replace('_', '-')}
                 </Badge>
             ))}
             {article.categories.length > 4 && (
                 <span className="text-[10px] text-muted-foreground font-mono self-center">+{article.categories.length - 4}</span>
             )}
          </div>

          <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
               >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Discuss
               </Button>

               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
               >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
               </Button>

               <Button 
                 variant="outline" 
                 size="sm" 
                 className="h-8 gap-1.5 text-xs border-dashed border-zinc-700 hover:border-primary/50 hover:bg-primary/5"
                 onClick={handleVerify}
                 disabled={isVerifying}
               >
                  <Sparkles className={cn("w-3 h-3", isVerifying && "animate-spin")} />
                  <span className={cn(isVerifying && "animate-pulse")}>
                    {isVerifying ? "Verifying..." : "Fact-Check"}
                  </span>
               </Button>
          </div>
      </CardFooter>
    </Card>
  );
}
