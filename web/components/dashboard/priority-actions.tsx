"use client";

import { useEffect, useState } from "react";
import { fetchPriorityActions, PriorityAction } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export function PriorityActions() {
  const [actions, setActions] = useState<PriorityAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPriorityActions().then(data => {
      setActions(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Card className="border-l-4 border-l-destructive">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Priority Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
           <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-destructive shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          Priority Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((item) => (
          <div key={item.id} className="relative pl-6 pb-1 group">
             <div className="absolute left-0 top-1 w-4 h-4 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive/40 group-hover:bg-destructive transition-colors" />
             </div>
             
             <p className="text-sm font-medium text-foreground leading-snug mb-1">
               {item.action}
             </p>
             
             <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/article/${item.article_id}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors">
                  Source <ArrowRight className="w-3 h-3" />
                </Link>
                <span className="text-[10px] text-muted-foreground/60">•</span>
                <span className="text-[10px] text-muted-foreground/80 font-mono uppercase truncate max-w-[150px]">
                  {item.target_audience}
                </span>
             </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

