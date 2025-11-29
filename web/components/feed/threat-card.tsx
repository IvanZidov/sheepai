import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Article, Priority } from "@/lib/types";
import { TrustBadge } from "./trust-badge";
import { MessageSquare, Share2, Sparkles, ChevronRight, Megaphone, ShieldAlert, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

interface ThreatCardProps {
  article: Article;
  onVerify: (id: string) => Promise<void>;
}

export function ThreatCard({ article, onVerify }: ThreatCardProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const priorityConfig: Record<Priority, { border: string, bg: string, text: string, icon: React.ReactNode }> = {
    CRITICAL: { 
        border: "border-red-500", 
        bg: "bg-red-500/10",
        text: "text-red-500",
        icon: <ShieldAlert className="w-3 h-3" />
    },
    HIGH: { 
        border: "border-orange-500", 
        bg: "bg-orange-500/10",
        text: "text-orange-500",
        icon: <ShieldAlert className="w-3 h-3" />
    },
    MEDIUM: { 
        border: "border-yellow-500", 
        bg: "bg-yellow-500/10",
        text: "text-yellow-500",
        icon: <ShieldAlert className="w-3 h-3" />
    },
    LOW: { 
        border: "border-emerald-500", 
        bg: "bg-emerald-500/10",
        text: "text-emerald-500",
        icon: <ShieldAlert className="w-3 h-3" />
    },
    INFO: {
        border: "border-blue-500",
        bg: "bg-blue-500/10",
        text: "text-blue-500",
        icon: <ShieldAlert className="w-3 h-3" />
    }
  };

  const config = priorityConfig[article.priority] || priorityConfig.INFO;

  const handleVerify = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVerifying(true);
    await onVerify(article.id);
    setIsVerifying(false);
  };

  return (
    <Link href={`/article/${article.id}`}>
      <Card className="group relative overflow-hidden border border-border bg-card transition-all hover:shadow-md hover:border-primary/50">
        
        {/* Priority Stripe */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.border.replace("border-", "bg-"))} />

        <CardHeader className="pb-3 pl-5">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              {/* Meta Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-0 font-mono uppercase tracking-wider gap-1", config.bg, config.text)}>
                  {config.icon}
                  {article.priority}
                </Badge>

                {article.regions?.map((r, i) => (
                   <span key={i} title={r.region} className="text-sm cursor-help grayscale hover:grayscale-0 transition-all">{r.flag}</span>
                ))}

                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                  {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                </span>

                {article.is_sponsored && (
                   <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">Sponsored</Badge>
                )}
              </div>

              <h3 className="font-heading font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
                {article.headline}
              </h3>
            </div>

            {/* Relevance Score Circle */}
            <div className="shrink-0 flex flex-col items-center">
               <div className={cn(
                 "flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-xs",
                 article.relevance_score >= 8 ? "border-emerald-500 text-emerald-500" : 
                 article.relevance_score >= 5 ? "border-yellow-500 text-yellow-500" : "border-muted text-muted-foreground"
               )}>
                 {article.relevance_score}
               </div>
               <span className="text-[9px] text-muted-foreground uppercase mt-1 font-mono">Score</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3 pl-5">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {article.short_summary}
          </p>

          {/* Compact Key Takeaways */}
          <div className="space-y-1">
            {article.key_takeaways.slice(0, 2).map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground/80">
                <div className="mt-1.5 w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                <span className={item.highlight ? "text-foreground" : ""}>{item.point}</span>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="pl-5 pt-0 pb-4 flex items-center justify-between">
           <div className="flex gap-1.5 overflow-hidden mask-image-linear-to-r from-black to-transparent w-full mr-4">
              {article.categories.slice(0, 3).map(cat => (
                  <Badge 
                      key={cat} 
                      variant="secondary" 
                      className="text-[10px] px-2 h-5 font-mono text-muted-foreground bg-muted/50 hover:bg-muted whitespace-nowrap"
                  >
                      {cat.replace(/_/g, ' ')}
                  </Badge>
              ))}
           </div>

           <div className="flex gap-1 shrink-0">
             <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                    e.preventDefault(); 
                    // Discuss logic
                }}
             >
                <MessageSquare className="w-4 h-4" />
             </Button>
             <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                 onClick={(e) => {
                    e.preventDefault(); 
                    // Share logic
                }}
             >
                <Share2 className="w-4 h-4" />
             </Button>
             <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary group/verify"
                  onClick={handleVerify}
                  disabled={isVerifying}
                >
                    <Sparkles className={cn("w-3.5 h-3.5 transition-all group-hover/verify:text-amber-400", isVerifying && "animate-spin")} />
                    <span className={cn(isVerifying && "animate-pulse")}>
                      {isVerifying ? "Checking..." : "Check"}
                    </span>
             </Button>
           </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
