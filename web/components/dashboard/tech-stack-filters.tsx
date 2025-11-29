"use client";

import { useUserPreferences, AVAILABLE_TECH } from "@/lib/user-preferences";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function TechStackFilters() {
  const { techStack, toggleTech } = useUserPreferences();

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
          {AVAILABLE_TECH.map((tech) => (
            <div key={tech.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`filter-${tech.id}`} 
                checked={techStack.includes(tech.id)}
                onCheckedChange={() => toggleTech(tech.id)}
                className="border-border data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <label
                htmlFor={`filter-${tech.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {tech.label}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
