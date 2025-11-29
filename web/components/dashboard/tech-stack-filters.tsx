"use client";

import { useUserPreferences, AVAILABLE_TECH } from "@/lib/user-preferences";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// Create Label component if it doesn't exist, otherwise import it
// For now I'll define a simple label wrapper since I didn't check if label exists but I saw @radix-ui/react-label in package.json
// Wait, I should probably create components/ui/label.tsx to be safe or check if it exists.
// I will rely on the fact that I installed @radix-ui/react-label but I'll just use a primitive label for now to save a step or check.
// Actually, let's just use a span/label tag.

export function TechStackFilters() {
  const { techStack, toggleTech } = useUserPreferences();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">My Tech Stack</h3>
        <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400 font-mono">
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
                className="border-zinc-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <label
                htmlFor={`filter-${tech.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300 cursor-pointer"
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

