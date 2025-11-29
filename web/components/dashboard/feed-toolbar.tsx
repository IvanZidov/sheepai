"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import { CreateSubscriptionDialog } from "@/components/dashboard/create-subscription-dialog";
import { useUserPreferences, SortOption } from "@/lib/user-preferences";
import { Search, ArrowUpDown, Calendar, Zap, Star, Sparkles, X } from "lucide-react";

export function FeedToolbar() {
  const { 
    searchQuery, setSearchQuery, 
    sortBy, setSortBy 
  } = useUserPreferences();

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest First",
    relevance: "Most Relevant",
    priority: "Highest Priority"
  };

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search with AI... (e.g., 'latest ransomware attacks on healthcare')" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-20 bg-card/50 border-border focus:border-primary/50 focus:ring-primary/20 transition-all"
        />
        {hasSearch && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              AI
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <CreateSubscriptionDialog />
        
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="shrink-0 gap-2 border-dashed border-border bg-card/50">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <span className="hidden sm:inline">Sort by:</span>
            <span className="font-medium text-foreground">{sortLabels[sortBy]}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSortBy("newest")}>
            <Calendar className="mr-2 h-4 w-4 opacity-70" />
            Newest First
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("relevance")}>
            <Star className="mr-2 h-4 w-4 opacity-70" />
            Most Relevant
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSortBy("priority")}>
            <Zap className="mr-2 h-4 w-4 opacity-70" />
            Highest Priority
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
