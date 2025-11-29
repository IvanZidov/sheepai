"use client";

import { useEffect, useState } from "react";
import { useUserPreferences } from "@/lib/user-preferences";
import { fetchAvailableTech, TechFilter } from "@/lib/dashboard-data";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function TechStackFilters() {
  const { techStack, toggleTech } = useUserPreferences();
  const [availableTech, setAvailableTech] = useState<TechFilter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableTech().then((data) => {
      setAvailableTech(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">My Tech Stack</h3>
        <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground font-mono">
          {techStack.length} SELECTED
        </Badge>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
            ))
          ) : availableTech.length > 0 ? (
            availableTech.map((tech) => (
              <div key={tech.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`filter-${tech.id}`} 
                  checked={techStack.includes(tech.id)}
                  onCheckedChange={() => toggleTech(tech.id)}
                  className="border-border data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <label
                  htmlFor={`filter-${tech.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex-1"
                >
                  {tech.label}
                </label>
                <span className="text-[10px] text-muted-foreground/60 font-mono">
                  {tech.count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No technologies found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
