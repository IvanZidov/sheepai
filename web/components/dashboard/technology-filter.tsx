"use client";

import { useEffect, useState } from "react";
import { useUserPreferences } from "@/lib/user-preferences";
import { Badge } from "@/components/ui/badge";
import { CollapsibleFilter } from "@/components/dashboard/collapsible-filter";
import { getAvailableTechnologies } from "@/lib/articles";
import { Cpu, Loader2 } from "lucide-react";

// Common technologies to show first
const PRIORITY_TECHS = [
  "python", "javascript", "typescript", "go", "rust", "java",
  "aws", "azure", "gcp", "kubernetes", "docker",
  "react", "node", "next.js", "postgresql", "mongodb",
  "linux", "windows", "macos", "android", "ios",
];

export function TechnologyFilter() {
  const { technologyFilter, toggleTechnology, setTechnologies } = useUserPreferences();
  const [availableTechs, setAvailableTechs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getAvailableTechnologies().then((techs) => {
      // Sort: priority techs first, then alphabetically
      const sorted = techs.sort((a, b) => {
        const aIdx = PRIORITY_TECHS.indexOf(a.toLowerCase());
        const bIdx = PRIORITY_TECHS.indexOf(b.toLowerCase());
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.localeCompare(b);
      });
      setAvailableTechs(sorted);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading technologies...</span>
      </div>
    );
  }

  if (availableTechs.length === 0) {
    return null;
  }

  const clearBadge = technologyFilter.length > 0 ? (
    <Badge 
      variant="secondary" 
      className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer h-5" 
      onClick={(e) => {
        e.stopPropagation();
        setTechnologies([]);
      }}
    >
      Clear ({technologyFilter.length})
    </Badge>
  ) : undefined;

  const displayedTechs = showAll ? availableTechs : availableTechs.slice(0, 20);
  const hasMore = availableTechs.length > 20;

  return (
    <CollapsibleFilter title="Technologies" icon={Cpu} badge={clearBadge} defaultOpen={false}>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {displayedTechs.map((tech) => {
            const isSelected = technologyFilter.includes(tech);
            return (
              <button
                key={tech}
                onClick={() => toggleTechnology(tech)}
                className={`
                  px-2 py-1 text-xs rounded-md transition-colors font-mono
                  ${isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                {tech}
              </button>
            );
          })}
        </div>
        
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-primary hover:underline"
          >
            {showAll ? "Show less" : `Show ${availableTechs.length - 20} more...`}
          </button>
        )}
      </div>
    </CollapsibleFilter>
  );
}

