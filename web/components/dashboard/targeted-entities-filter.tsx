"use client";

import { useEffect, useState } from "react";
import { useUserPreferences } from "@/lib/user-preferences";
import { fetchTopTargeted, TargetedEntity } from "@/lib/dashboard-data";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CollapsibleFilter } from "@/components/dashboard/collapsible-filter";
import { Target } from "lucide-react";

export function TargetedEntitiesFilter() {
  const { targetedEntities, toggleEntity } = useUserPreferences();
  const [entities, setEntities] = useState<TargetedEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopTargeted().then((data) => {
      setEntities(data);
      setLoading(false);
    });
  }, []);

  return (
    <CollapsibleFilter 
      title="Targeted Entities" 
      icon={Target} 
      badge={
        targetedEntities.length > 0 ? (
          <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground font-mono">
            {targetedEntities.length}
          </Badge>
        ) : undefined
      }
    >
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
            ))
          ) : entities.length > 0 ? (
            entities.map((entity) => (
              <div key={entity.name} className="flex items-center space-x-2">
                <Checkbox 
                  id={`entity-${entity.name}`} 
                  checked={targetedEntities.includes(entity.name)}
                  onCheckedChange={() => toggleEntity(entity.name)}
                  className="border-border data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <label
                  htmlFor={`entity-${entity.name}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex-1 truncate"
                  title={entity.name}
                >
                  {entity.name}
                </label>
                <span className="text-[10px] text-muted-foreground/60 font-mono">
                  {entity.count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No data available</p>
          )}
        </div>
      </ScrollArea>
    </CollapsibleFilter>
  );
}

