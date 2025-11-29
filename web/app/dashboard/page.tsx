"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { DashboardShell } from "@/components/layout/shell";
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { ThreatCard } from "@/components/feed/threat-card";
import { ShepherdChat } from "@/components/chat/shepherd-chat";
import { TechStackFilters } from "@/components/dashboard/tech-stack-filters";
import { FeedToolbar } from "@/components/dashboard/feed-toolbar";
import { FilterGroups } from "@/components/dashboard/filter-groups";
import { CategoryFilter } from "@/components/dashboard/category-filter";
import { RegionFilter } from "@/components/dashboard/region-filter";
import { TechnologyFilter } from "@/components/dashboard/technology-filter";
import { useUserPreferences } from "@/lib/user-preferences";
import { 
  fetchArticles, 
  verifyArticle, 
  semanticSearch,
  ArticleFilters,
  PaginatedResult 
} from "@/lib/articles";
import { Article, Priority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Filter, Loader2, Search, Sparkles } from "lucide-react";

const PAGE_SIZE = 24;
const DEBOUNCE_MS = 400;

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    alertThreshold, 
    searchQuery, 
    dateRange, 
    priorityFilter,
    categoryFilter,
    regionFilter,
    technologyFilter,
    sortBy, 
    resetFilters 
  } = useUserPreferences();

  // Build filter object from preferences
  const getFilters = useCallback((): ArticleFilters => {
    const filters: ArticleFilters = {};
    
    if (categoryFilter.length > 0) {
      filters.categories = categoryFilter;
    }
    
    if (regionFilter.length > 0) {
      filters.regions = regionFilter;
    }
    
    if (technologyFilter.length > 0) {
      filters.technologies = technologyFilter;
    }
    
    if (priorityFilter.length > 0) {
      filters.priorities = priorityFilter;
    }
    
    // Date range
    if (dateRange !== "all") {
      const now = new Date();
      let fromDate: Date;
      
      if (dateRange === "24h") {
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (dateRange === "7d") {
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      filters.fromDate = fromDate.toISOString();
    }
    
    return filters;
  }, [categoryFilter, regionFilter, technologyFilter, priorityFilter, dateRange]);

  // Load articles with filters
  const loadArticles = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const filters = getFilters();
      const result = await fetchArticles(filters, { page: pageNum, pageSize: PAGE_SIZE });
      
      if (append) {
        setArticles(prev => [...prev, ...result.data]);
      } else {
        setArticles(result.data);
      }
      
      setHasMore(result.hasMore);
      setTotal(result.total);
      setPage(pageNum);
      setIsSemanticSearch(false);
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [getFilters]);

  // Perform semantic search
  const performSemanticSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadArticles(1);
      return;
    }
    
    setIsSearching(true);
    setLoading(true);
    
    try {
      const filters = getFilters();
      const results = await semanticSearch(query, filters, 50);
      
      setArticles(results);
      setHasMore(false);
      setTotal(results.length);
      setIsSemanticSearch(true);
    } catch (error) {
      console.error("Semantic search error:", error);
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  }, [getFilters, loadArticles]);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (!query.trim()) {
      loadArticles(1);
      return;
    }
    
    setIsSearching(true);
    
    searchTimeoutRef.current = setTimeout(() => {
      performSemanticSearch(query);
    }, DEBOUNCE_MS);
  }, [loadArticles, performSemanticSearch]);

  // Watch for search query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, debouncedSearch]);

  // Reload when filters change (but not search query)
  useEffect(() => {
    if (!searchQuery.trim()) {
      loadArticles(1);
    } else {
      // If searching, re-run semantic search with new filters
      performSemanticSearch(searchQuery);
    }
  }, [categoryFilter, regionFilter, technologyFilter, priorityFilter, dateRange]);

  // Initial load
  useEffect(() => {
    if (!searchQuery.trim()) {
      loadArticles(1);
    }
  }, []);

  const onVerify = async (id: string) => {
    const updated = await verifyArticle(id);
    if (updated) {
      setArticles(prev => prev.map(a => a.id === id ? updated : a));
    }
  };

  const loadMoreArticles = () => {
    if (!loadingMore && hasMore && !isSemanticSearch) {
      loadArticles(page + 1, true);
    }
  };

  // Client-side filtering for threshold and sorting
  const filteredArticles = articles
    .filter(article => {
      // Check threshold
      const score = article.relevance_score * 10;
      if (score < alertThreshold) return false;
      return true;
    })
    .sort((a, b) => {
      if (isSemanticSearch) {
        // Keep semantic search order (by similarity)
        return 0;
      }
      
      if (sortBy === "relevance") {
        return b.relevance_score - a.relevance_score;
      }
      if (sortBy === "priority") {
        const pMap: Record<Priority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 0 };
        return pMap[b.priority] - pMap[a.priority];
      }
      // Default: newest
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  // Count active filters
  const activeFilterCount = [
    categoryFilter.length > 0,
    regionFilter.length > 0,
    technologyFilter.length > 0,
    priorityFilter.length > 0,
    dateRange !== "all",
  ].filter(Boolean).length;

  const filters = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-500" />
          <h2 className="font-semibold text-sm text-foreground">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => resetFilters()}
        >
          Clear All
        </Button>
      </div>
      
      <FilterGroups />
      <CategoryFilter />
      <RegionFilter />
      <TechnologyFilter />
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/20 selection:text-emerald-500">
      <ShepherdNav />
      
      <DashboardShell filters={filters} visuals={null}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground font-heading">My Feed</h1>
                {isSemanticSearch && searchQuery && (
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Semantic search results for &quot;{searchQuery}&quot;</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                {isSearching && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>
                  {filteredArticles.length} 
                  {!isSemanticSearch && total > 0 && ` of ${total}`} 
                  {" "}ARTICLES
                </span>
              </div>
            </div>

            <FeedToolbar />

            <div className="pb-20">
              {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({length: 6}).map((_, i) => (
                        <div key={i} className="h-80 rounded-xl bg-muted/50 border border-border animate-pulse" />
                    ))}
                  </div>
              ) : filteredArticles.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredArticles.map(article => (
                          <ThreatCard key={article.id} article={article} onVerify={onVerify} />
                      ))}
                    </div>
                    
                    {/* Load More Button */}
                    {hasMore && !isSemanticSearch && (
                      <div className="flex justify-center mt-8">
                        <Button
                          variant="outline"
                          onClick={loadMoreArticles}
                          disabled={loadingMore}
                          className="gap-2"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>Load More Articles</>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
              ) : (
                  <div className="text-center py-20 bg-muted/30 rounded-xl border border-border border-dashed">
                      {searchQuery ? (
                        <>
                          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-foreground font-medium mb-2">No Results Found</h3>
                          <p className="text-muted-foreground max-w-md mx-auto mb-6">
                              No articles match &quot;{searchQuery}&quot; with your current filters.
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-foreground font-medium mb-2">All Quiet on the Western Front</h3>
                          <p className="text-muted-foreground max-w-md mx-auto mb-6">
                              No articles found matching your active filters.
                          </p>
                        </>
                      )}
                      <Button 
                          variant="outline" 
                          className="border-border text-muted-foreground hover:text-foreground"
                          onClick={() => resetFilters()}
                      >
                          Clear All Filters
                      </Button>
                  </div>
              )}
            </div>
          </div>
      </DashboardShell>

      <ShepherdChat />
    </div>
  );
}
