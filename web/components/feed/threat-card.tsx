import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Article } from "@/lib/types";
import { TrustBadge } from "./trust-badge";
import { ExternalLink, MoreHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ThreatCardProps {
  article: Article;
  onVerify: (id: string) => Promise<void>;
}

export function ThreatCard({ article, onVerify }: ThreatCardProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const threatColors: Record<string, string> = {
    CRITICAL: "bg-red-500",
    HIGH: "bg-orange-500",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-blue-500",
  };
  
  const threatTextColors: Record<string, string> = {
    CRITICAL: "text-red-500",
    HIGH: "text-orange-500",
    MEDIUM: "text-yellow-500",
    LOW: "text-blue-500",
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    await onVerify(article.id);
    setIsVerifying(false);
  };

  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/20 transition-colors overflow-hidden relative group">
      {/* Top Border Gradient for Threat Level */}
      <div className={cn("absolute top-0 left-0 w-full h-1 opacity-80", threatColors[article.threatLevel])} />

      <CardHeader className="pb-3 space-y-2.5">
        <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                     {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                   </span>
                   <TrustBadge status={article.verificationStatus} note={article.verificationNote} />
                </div>
                <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        {article.title}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                    </a>
                </h3>
            </div>
             <div className="flex flex-col items-end gap-1 min-w-[80px]">
                <span className={cn("text-xs font-bold font-mono", threatTextColors[article.threatLevel])}>
                    {article.threatLevel}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">SCORE: {article.threatScore}</span>
            </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
         <ul className="space-y-1.5">
            {article.summary.map((point, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="block w-1 h-1 mt-1.5 rounded-full bg-zinc-600 shrink-0" />
                    {point}
                </li>
            ))}
         </ul>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-0">
          <div className="flex gap-2 flex-wrap">
             {article.tags.map(tag => (
                 <Badge key={tag.id} variant="secondary" className="text-[10px] px-1.5 py-0.5 h-5 font-mono text-zinc-400 bg-zinc-900 hover:bg-zinc-800 border-zinc-800">
                    #{tag.label}
                 </Badge>
             ))}
          </div>

          <div className="flex gap-2">
              {/* Action Buttons */}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                 <MoreHorizontal className="w-4 h-4" />
              </Button>
              
               <Button 
                 variant="outline" 
                 size="sm" 
                 className="h-8 gap-1.5 text-xs border-dashed border-zinc-700 hover:border-primary/50 hover:bg-primary/5"
                 onClick={handleVerify}
                 disabled={isVerifying}
               >
                  <Sparkles className={cn("w-3 h-3", isVerifying && "animate-spin")} />
                  {isVerifying ? "Checking..." : "Re-Verify"}
               </Button>
          </div>
      </CardFooter>
    </Card>
  );
}

