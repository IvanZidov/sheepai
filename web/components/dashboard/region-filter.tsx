"use client";

import { useEffect, useState } from "react";
import { useUserPreferences } from "@/lib/user-preferences";
import { Badge } from "@/components/ui/badge";
import { CollapsibleFilter } from "@/components/dashboard/collapsible-filter";
import { getAvailableRegions } from "@/lib/articles";
import { Globe, Loader2 } from "lucide-react";

export function RegionFilter() {
  const { regionFilter, toggleRegion, setRegions } = useUserPreferences();
  const [availableRegions, setAvailableRegions] = useState<Array<{ region: string; flag: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAvailableRegions().then((regions) => {
      setAvailableRegions(regions);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading regions...</span>
      </div>
    );
  }

  if (availableRegions.length === 0) {
    return null;
  }

  const clearBadge = regionFilter.length > 0 ? (
    <Badge 
      variant="secondary" 
      className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer h-5" 
      onClick={(e) => {
        e.stopPropagation();
        setRegions([]);
      }}
    >
      Clear ({regionFilter.length})
    </Badge>
  ) : undefined;

  return (
    <CollapsibleFilter title="Regions" icon={Globe} badge={clearBadge} defaultOpen={false}>
      <div className="flex flex-wrap gap-1.5">
        {availableRegions.map(({ region, flag }) => {
          const isSelected = regionFilter.includes(region);
          return (
            <button
              key={region}
              onClick={() => toggleRegion(region)}
              className={`
                px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1
                ${isSelected 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <span>{flag}</span>
              <span className="capitalize">{region.replace(/_/g, " ")}</span>
            </button>
          );
        })}
      </div>
    </CollapsibleFilter>
  );
}

