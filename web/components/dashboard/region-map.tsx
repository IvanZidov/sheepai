"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useUserPreferences } from "@/lib/user-preferences";
import { CollapsibleFilter } from "@/components/dashboard/collapsible-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { Map, Loader2, Maximize2, X, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

// Region positions on the world.png map (percentage-based x, y coordinates)
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

interface ArticlePreview {
  id: string;
  article_title: string;
  short_summary: string;
  categories: string[];
  priority: string;
  article_url: string;
}

// Preview card colors based on priority
const PRIORITY_COLORS: Record<string, string> = {
  critical: "from-red-500/20 to-red-600/10 border-red-500/30",
  high: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
  medium: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30",
  low: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  informational: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
};

export function RegionMap() {
  const { regionFilter, toggleRegion, setRegions } = useUserPreferences();
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewArticles, setPreviewArticles] = useState<ArticlePreview[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

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

  // Fetch article previews when hovering a region in expanded mode
  const fetchArticlePreview = useCallback(async (region: string) => {
    if (!isExpanded) return;
    
    setLoadingPreview(true);
    try {
      // Use raw filter for JSONB containment since .contains() has serialization issues
      const { data, error } = await supabase
        .from("article_analyses")
        .select("id, article_title, short_summary, categories, priority, article_url, regions")
        .filter("regions", "cs", JSON.stringify([{ region }]))
        .order("analyzed_at", { ascending: false })
        .limit(8);

      if (error) throw error;

      const mapped = (data || []).map((a) => ({
        id: a.id,
        article_title: a.article_title || "Untitled",
        short_summary: a.short_summary || "",
        categories: a.categories || [],
        priority: a.priority || "informational",
        article_url: a.article_url,
      }));

      setPreviewArticles(mapped);
    } catch (error) {
      console.error("Error fetching article preview:", error);
      setPreviewArticles([]);
    } finally {
      setLoadingPreview(false);
    }
  }, [isExpanded]);

  // Handle hover with debounce for preview
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleRegionHover = useCallback((region: string | null) => {
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    if (region) {
      setHoveredRegion(region);
      if (isExpanded) {
        // Small delay before fetching to avoid excessive requests
        hoverTimeoutRef.current = setTimeout(() => {
          fetchArticlePreview(region);
        }, 150);
      }
    } else {
      // Delay clearing to allow mouse to move to preview panel
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredRegion(null);
        setPreviewArticles([]);
      }, 200);
    }
  }, [isExpanded, fetchArticlePreview]);

  // Close expanded view on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const maxCount = useMemo(() => 
    Math.max(...regionStats.map(r => r.count), 1), 
    [regionStats]
  );

  const getRegionSize = (count: number, expanded: boolean = false) => {
    const minSize = expanded ? 28 : 12;
    const maxSize = expanded ? 56 : 28;
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

  // Region marker component
  const RegionMarker = ({ 
    stat, 
    expanded = false,
    showPreview = false 
  }: { 
    stat: RegionStats; 
    expanded?: boolean;
    showPreview?: boolean;
  }) => {
    const pos = REGION_POSITIONS[stat.region];
    if (!pos) return null;
    
    const size = getRegionSize(stat.count, expanded);
    const isSelected = regionFilter.includes(stat.region);
    const isHovered = hoveredRegion === stat.region;
    
    return (
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
        style={{ 
          left: `${pos.x}%`, 
          top: `${pos.y}%`,
          zIndex: isHovered ? 50 : isSelected ? 40 : 10,
        }}
        onClick={() => toggleRegion(stat.region)}
        onMouseEnter={() => handleRegionHover(stat.region)}
        onMouseLeave={() => handleRegionHover(null)}
      >
        {/* Outer glow ring */}
        <div 
          className={cn(
            "absolute rounded-full transition-all duration-300",
            isSelected 
              ? "bg-primary/40 animate-pulse" 
              : isHovered 
              ? "bg-emerald-400/30"
              : "bg-transparent"
          )}
          style={{
            width: size + (expanded ? 20 : 12),
            height: size + (expanded ? 20 : 12),
            left: -(size + (expanded ? 20 : 12)) / 2 + size / 2,
            top: -(size + (expanded ? 20 : 12)) / 2 + size / 2,
          }}
        />
        
        {/* Main marker */}
        <div
          className={cn(
            "rounded-full transition-all duration-200 flex items-center justify-center font-bold",
            "shadow-lg backdrop-blur-sm border-2",
            isSelected 
              ? "bg-gradient-to-br from-primary to-primary/80 border-primary-foreground/50 scale-110" 
              : isHovered
              ? "bg-gradient-to-br from-emerald-400 to-emerald-500 border-white scale-105"
              : "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-300/30"
          )}
          style={{
            width: size,
            height: size,
            boxShadow: isHovered || isSelected 
              ? `0 0 20px ${isSelected ? 'rgba(var(--primary), 0.5)' : 'rgba(16, 185, 129, 0.5)'}` 
              : '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span 
            className={cn(
              "text-white font-mono drop-shadow-md",
              expanded ? "text-sm" : "text-[10px]"
            )}
          >
            {stat.count}
          </span>
        </div>
        
        {/* Hover tooltip (non-expanded mode) */}
        {!showPreview && (isHovered || isSelected) && (
          <div 
            className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5",
              "bg-popover/95 backdrop-blur-md border border-border rounded-lg shadow-xl",
              "whitespace-nowrap pointer-events-none",
              expanded ? "text-sm" : "text-xs"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{stat.flag}</span>
              <div>
                <div className="font-semibold">{pos.name}</div>
                <div className="text-muted-foreground text-[10px]">{stat.count} articles</div>
              </div>
            </div>
          </div>
        )}

        {/* Article preview cloud (expanded mode only) */}
        {showPreview && isHovered && (
          <div 
            className={cn(
              "absolute left-full top-1/2 -translate-y-1/2 ml-4",
              "w-80 max-h-96 overflow-hidden",
              "bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl",
              "pointer-events-none"
            )}
            style={{ zIndex: 100 }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-muted/50 to-transparent">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{stat.flag}</span>
                <div>
                  <h4 className="font-bold text-sm">{pos.name}</h4>
                  <p className="text-xs text-muted-foreground">{stat.count} articles</p>
                </div>
              </div>
            </div>
            
            {/* Article mosaic */}
            <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
              {loadingPreview ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : previewArticles.length > 0 ? (
                previewArticles.map((article, idx) => (
                  <div
                    key={article.id}
                    className={cn(
                      "p-2.5 rounded-lg border bg-gradient-to-br transition-all",
                      PRIORITY_COLORS[article.priority] || PRIORITY_COLORS.informational,
                      "hover:scale-[1.02]"
                    )}
                    style={{ 
                      animationDelay: `${idx * 50}ms`,
                      animation: 'fadeIn 0.3s ease-out forwards',
                    }}
                  >
                    <h5 className="font-medium text-xs line-clamp-2 mb-1">
                      {article.article_title}
                    </h5>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">
                      {article.short_summary}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {article.categories.slice(0, 2).map((cat, i) => (
                        <Badge 
                          key={`${cat}-${i}`}
                          variant="outline" 
                          className="text-[8px] px-1.5 py-0 h-4"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Newspaper className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">No preview available</p>
                </div>
              )}
            </div>
            
            {/* Click hint */}
            <div className="px-3 py-2 border-t border-border bg-muted/20 text-center">
              <p className="text-[10px] text-muted-foreground">
                Click to filter • {previewArticles.length < stat.count && `${stat.count - previewArticles.length} more`}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Map content component
  const MapContent = ({ expanded = false }: { expanded?: boolean }) => (
    <div className={cn(
      "relative rounded-lg overflow-hidden",
      expanded ? "border-2 border-border" : "border border-border/50"
    )}>
      <img 
        src="/world.png" 
        alt="World Map" 
        className={cn("w-full h-auto", expanded ? "opacity-95" : "opacity-80")}
        draggable={false}
      />
      
      {/* Region markers overlay */}
      <div className="absolute inset-0">
        {regionStats.map((stat) => (
          <RegionMarker 
            key={stat.region} 
            stat={stat} 
            expanded={expanded}
            showPreview={expanded}
          />
        ))}
      </div>
      
      {/* Expand button (mini map only) */}
      {!expanded && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 bg-background/90 backdrop-blur hover:bg-background shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* Legend (expanded only) */}
      {expanded && (
        <div className="absolute bottom-3 left-3 px-3 py-2 bg-card/90 backdrop-blur-md rounded-lg border border-border shadow-lg">
          <div className="flex items-center gap-4 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Size = article count</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <CollapsibleFilter title="News Map" icon={Map} badge={clearBadge} defaultOpen={true}>
        <div className="space-y-3">
          <MapContent expanded={false} />

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

      {/* Expanded Map Modal */}
      {isExpanded && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          style={{ zIndex: 99999 }}
          onClick={() => setIsExpanded(false)}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div 
            className="relative w-[92vw] max-w-5xl max-h-[92vh] bg-card border-2 border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-muted/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Map className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Global News Map</h2>
                  <p className="text-xs text-muted-foreground">
                    Hover regions to preview articles • Click to filter
                  </p>
                </div>
                {regionFilter.length > 0 && (
                  <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">
                    {regionFilter.length} selected
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {regionFilter.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRegions([])}
                    className="text-xs"
                  >
                    Clear filters
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Map */}
            <div className="p-5">
              <MapContent expanded={true} />
            </div>
            
            {/* Region grid */}
            <div className="px-5 pb-4 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                {regionStats.map((stat) => {
                  const isSelected = regionFilter.includes(stat.region);
                  const pos = REGION_POSITIONS[stat.region];
                  return (
                    <button
                      key={stat.region}
                      onClick={() => toggleRegion(stat.region)}
                      onMouseEnter={() => handleRegionHover(stat.region)}
                      onMouseLeave={() => handleRegionHover(null)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : hoveredRegion === stat.region
                          ? "bg-emerald-500/20 border-emerald-500/40 text-foreground"
                          : "bg-muted/30 hover:bg-muted/60 border-transparent text-muted-foreground hover:text-foreground",
                        !pos && "opacity-50"
                      )}
                    >
                      <span className="text-base">{stat.flag}</span>
                      <span className="truncate text-xs font-medium">
                        {pos?.name || stat.region.replace(/_/g, " ")}
                      </span>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "ml-auto text-[10px] px-1.5 h-5",
                          isSelected && "bg-primary-foreground/20 text-primary-foreground"
                        )}
                      >
                        {stat.count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd> to close
              </p>
              <p className="text-xs text-muted-foreground">
                {regionStats.length} regions • {regionStats.reduce((sum, r) => sum + r.count, 0)} total articles
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
