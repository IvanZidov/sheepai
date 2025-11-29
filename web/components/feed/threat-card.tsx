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
    <Link href={`/article/${article.id}`} className="h-full">
      <Card className="group relative overflow-hidden border border-border bg-card transition-all hover:shadow-md hover:border-primary/50 h-full flex flex-col">
        
        {/* Priority Stripe */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.border.replace("border-", "bg-"))} />

        {/* Image Thumbnail */}
        {article.thumbnail && (
           <div className="relative h-32 w-full overflow-hidden bg-muted">
              <img 
                src={article.thumbnail} 
                alt={article.headline}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-2 left-4 right-4 flex justify-between items-end">
                 <div className="flex gap-1">
                    {article.regions?.map((r, i) => (
                       <span key={i} title={r.region} className="text-sm drop-shadow-md">{r.flag}</span>
                    ))}
                 </div>
              </div>
           </div>
        )}

        <CardHeader className={cn("pb-2 pl-5 pr-4", article.thumbnail ? "pt-3" : "pt-4")}>
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              {/* Meta Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-0 font-mono uppercase tracking-wider gap-1 shrink-0", config.bg, config.text)}>
                  {config.icon}
                  {article.priority}
                </Badge>

                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider truncate">
                  {article.source} • {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                </span>
              </div>

              <h3 className="font-heading font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {article.headline}
              </h3>
            </div>

            {/* Relevance Score Circle */}
            <div className="shrink-0 flex flex-col items-center">
               <div className={cn(
                 "flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold text-[10px]",
                 article.relevance_score >= 8 ? "border-emerald-500 text-emerald-500" : 
                 article.relevance_score >= 5 ? "border-yellow-500 text-yellow-500" : "border-muted text-muted-foreground"
               )}>
                 {article.relevance_score}
               </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3 pl-5 pr-4 flex-1">
          <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
            {article.short_summary}
          </p>

          {/* Compact Key Takeaways - Only show if no thumbnail to save space, or just 1 */}
          {!article.thumbnail && (
            <div className="space-y-1 mt-auto">
                {article.key_takeaways.slice(0, 1).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground/80">
                    <div className="mt-1 w-1 h-1 rounded-full bg-primary/50 shrink-0" />
                    <span className={item.highlight ? "text-foreground" : ""}>{item.point}</span>
                </div>
                ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="pl-5 pr-4 pt-0 pb-3 flex items-center justify-between mt-auto border-t border-border/50 pt-2">
           <div className="flex gap-1 overflow-hidden w-full mr-2">
              {article.categories.slice(0, 2).map(cat => (
                  <Badge 
                      key={cat} 
                      variant="secondary" 
                      className="text-[9px] px-1.5 h-4 font-mono text-muted-foreground bg-muted/50 hover:bg-muted whitespace-nowrap"
                  >
                      {cat.replace(/_/g, ' ')}
                  </Badge>
              ))}
           </div>

           <div className="flex gap-0.5 shrink-0">
             <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 gap-1 text-[10px] text-muted-foreground hover:text-primary group/verify px-2"
                  onClick={handleVerify}
                  disabled={isVerifying}
                >
                    <Sparkles className={cn("w-3 h-3 transition-all group-hover/verify:text-amber-400", isVerifying && "animate-spin")} />
                    <span className={cn(isVerifying && "animate-pulse")}>
                      {isVerifying ? "Check" : "Check"}
                    </span>
             </Button>
           </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
