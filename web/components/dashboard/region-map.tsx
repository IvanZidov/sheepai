"use client";

import { useEffect, useState, useMemo } from "react";
import { useUserPreferences } from "@/lib/user-preferences";
import { CollapsibleFilter } from "@/components/dashboard/collapsible-filter";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { Map, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Region positions on the world.png map (percentage-based x, y coordinates)
// Generated from map-annotator.html tool
const REGION_POSITIONS: Record<string, { x: number; y: number; name: string }> = {
  usa: { x: 21, y: 40, name: "USA" },
  russia: { x: 72, y: 28, name: "Russia" },
  china: { x: 79, y: 42, name: "China" },
  south_korea: { x: 86, y: 42, name: "South Korea" },
  europe: { x: 52, y: 35, name: "Europe" },
  ukraine: { x: 58, y: 33, name: "Ukraine" },
  canada: { x: 22, y: 28, name: "Canada" },
  uk: { x: 47, y: 32, name: "UK" },
  brazil: { x: 32, y: 65, name: "Brazil" },
  north_korea: { x: 85, y: 38, name: "North Korea" },
  germany: { x: 51, y: 33, name: "Germany" },
  taiwan: { x: 84, y: 48, name: "Taiwan" },
  asia: { x: 75, y: 45, name: "Asia" },
  australia: { x: 87, y: 72, name: "Australia" },
  india: { x: 72, y: 50, name: "India" },
  italy: { x: 52, y: 40, name: "Italy" },
  japan: { x: 90, y: 40, name: "Japan" },
  middle_east: { x: 60, y: 45, name: "Middle East" },
  africa: { x: 52, y: 58, name: "Africa" },
  france: { x: 49, y: 36, name: "France" },
  israel: { x: 58, y: 44, name: "Israel" },
  netherlands: { x: 50, y: 31, name: "Netherlands" },
  north_america: { x: 20, y: 35, name: "North America" },
  iran: { x: 63, y: 44, name: "Iran" },
  poland: { x: 54, y: 32, name: "Poland" },
  mexico: { x: 17, y: 48, name: "Mexico" },
  south_america: { x: 30, y: 70, name: "South America" },
  spain: { x: 46, y: 40, name: "Spain" },
  vietnam: { x: 80, y: 52, name: "Vietnam" },
  saudi_arabia: { x: 61, y: 48, name: "Saudi Arabia" },
  singapore: { x: 80, y: 60, name: "Singapore" },
  kazakhstan: { x: 67, y: 35, name: "Kazakhstan" },
  kyrgyzstan: { x: 70, y: 38, name: "Kyrgyzstan" },
  uae: { x: 63, y: 48, name: "UAE" },
  indonesia: { x: 82, y: 62, name: "Indonesia" },
  new_zealand: { x: 95, y: 78, name: "New Zealand" },
  uzbekistan: { x: 67, y: 38, name: "Uzbekistan" },
  global: { x: 50, y: 88, name: "Global" },
};

interface RegionStats {
  region: string;
  flag: string;
  count: number;
}

export function RegionMap() {
  const { regionFilter, toggleRegion, setRegions } = useUserPreferences();
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegionStats() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("article_analyses")
          .select("regions");

        if (error) throw error;

        const counts: Record<string, { count: number; flag: string }> = {};
        
        data?.forEach((article) => {
          (article.regions || []).forEach((r: { region: string; flag: string }) => {
            if (!counts[r.region]) {
              counts[r.region] = { count: 0, flag: r.flag };
            }
            counts[r.region].count++;
          });
        });

        const stats = Object.entries(counts)
          .map(([region, data]) => ({
            region,
            flag: data.flag,
            count: data.count,
          }))
          .sort((a, b) => b.count - a.count);

        setRegionStats(stats);
      } catch (error) {
        console.error("Error fetching region stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRegionStats();
  }, []);

  const maxCount = useMemo(() => 
    Math.max(...regionStats.map(r => r.count), 1), 
    [regionStats]
  );

  const getRegionSize = (count: number) => {
    const minSize = 8;
    const maxSize = 20;
    return minSize + (count / maxCount) * (maxSize - minSize);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading map...</span>
      </div>
    );
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
    <CollapsibleFilter title="News Map" icon={Map} badge={clearBadge} defaultOpen={true}>
      <div className="space-y-3">
        {/* World Map with dots */}
        <div className="relative rounded-lg overflow-hidden border border-border/50">
          <img 
            src="/world.png" 
            alt="World Map" 
            className="w-full h-auto opacity-80"
            draggable={false}
          />
          
          {/* Region dots overlay */}
          <div className="absolute inset-0">
            {regionStats.map((stat) => {
              const pos = REGION_POSITIONS[stat.region];
              if (!pos) return null;
              
              const size = getRegionSize(stat.count);
              const isSelected = regionFilter.includes(stat.region);
              const isHovered = hoveredRegion === stat.region;
              
              return (
                <div
                  key={stat.region}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ 
                    left: `${pos.x}%`, 
                    top: `${pos.y}%`,
                  }}
                  onClick={() => toggleRegion(stat.region)}
                  onMouseEnter={() => setHoveredRegion(stat.region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  {/* Pulse ring for selected */}
                  {isSelected && (
                    <div 
                      className="absolute rounded-full bg-primary/30 animate-ping"
                      style={{
                        width: size + 10,
                        height: size + 10,
                        left: -(size + 10) / 2 + size / 2,
                        top: -(size + 10) / 2 + size / 2,
                      }}
                    />
                  )}
                  
                  {/* Main dot */}
                  <div
                    className={cn(
                      "rounded-full border-2 transition-all duration-200 flex items-center justify-center text-[8px] font-bold shadow-lg",
                      isSelected 
                        ? "bg-primary border-primary-foreground scale-125 z-20" 
                        : isHovered
                        ? "bg-emerald-400 border-white scale-110 z-10"
                        : "bg-emerald-500 border-emerald-300/50"
                    )}
                    style={{
                      width: size,
                      height: size,
                    }}
                  >
                    {stat.count >= 10 && (
                      <span className="text-white drop-shadow-md">
                        {stat.count > 99 ? "99" : stat.count}
                      </span>
                    )}
                  </div>
                  
                  {/* Hover tooltip */}
                  {(isHovered || isSelected) && (
                    <div 
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover/95 backdrop-blur border border-border rounded-md shadow-xl text-[10px] whitespace-nowrap z-30 pointer-events-none"
                    >
                      <span className="mr-1">{stat.flag}</span>
                      <span className="font-medium">{pos.name}</span>
                      <span className="text-muted-foreground ml-1">({stat.count})</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Region List */}
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {regionStats.slice(0, 12).map((stat) => {
            const isSelected = regionFilter.includes(stat.region);
            const pos = REGION_POSITIONS[stat.region];
            return (
              <button
                key={stat.region}
                onClick={() => toggleRegion(stat.region)}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  !pos && "opacity-50"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span>{stat.flag}</span>
                  <span className="capitalize truncate">
                    {REGION_POSITIONS[stat.region]?.name || stat.region.replace(/_/g, " ")}
                  </span>
                </span>
                <Badge 
                  variant={isSelected ? "secondary" : "outline"} 
                  className={cn(
                    "h-5 text-[10px] shrink-0",
                    isSelected && "bg-primary-foreground/20 text-primary-foreground"
                  )}
                >
                  {stat.count}
                </Badge>
              </button>
            );
          })}
        </div>

        {regionStats.length > 12 && (
          <p className="text-[10px] text-muted-foreground text-center">
            +{regionStats.length - 12} more regions
          </p>
        )}
      </div>
    </CollapsibleFilter>
  );
}
