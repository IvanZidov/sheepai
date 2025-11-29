"use client";

import { useEffect, useState } from "react";
import { fetchTopTargeted, TargetedEntity } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Building2, Box, Monitor } from "lucide-react";

export function TopTargeted() {
  const [entities, setEntities] = useState<TargetedEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopTargeted().then(data => {
      setEntities(data);
      setLoading(false);
    });
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'company': return <Building2 className="w-3 h-3" />;
      case 'product': return <Box className="w-3 h-3" />;
      case 'platform': return <Monitor className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-20 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (entities.length === 0) return null;

  return (
    <div className="space-y-4">
       <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Most Targeted</h3>
       </div>
       
       <div className="grid grid-cols-1 gap-2">
         {entities.map((entity, i) => (
           <div 
             key={i} 
             className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/20 transition-all"
           >
             <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                   {getIcon(entity.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {entity.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono capitalize">
                    {entity.type}
                  </p>
                </div>
             </div>
             
             <Badge variant="secondary" className="font-mono text-[10px] ml-2 shrink-0">
                {entity.count}
             </Badge>
           </div>
         ))}
       </div>
    </div>
  );
}

