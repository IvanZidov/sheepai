"use client";

import { useEffect, useState } from "react";
import { useUserPreferences } from "@/lib/user-preferences";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CollapsibleFilter } from "@/components/dashboard/collapsible-filter";
import { getAvailableCategories } from "@/lib/articles";
import { Tag, Loader2 } from "lucide-react";

// Category display names and groupings
const CATEGORY_GROUPS: Record<string, { label: string; categories: string[] }> = {
  security: {
    label: "🔒 Security",
    categories: ["security", "vulnerability", "malware", "data_breach", "privacy"],
  },
  development: {
    label: "💻 Development",
    categories: ["programming", "web_dev", "mobile_dev", "devops", "open_source"],
  },
  ai: {
    label: "🤖 AI & Data",
    categories: ["ai_ml", "llm", "data_science", "automation"],
  },
  cloud: {
    label: "☁️ Cloud & Infra",
    categories: ["cloud", "infrastructure", "networking", "database"],
  },
  business: {
    label: "💼 Business",
    categories: ["startup", "enterprise", "acquisition", "funding", "layoffs"],
  },
  other: {
    label: "📦 Other",
    categories: ["hardware", "gaming", "crypto", "regulation", "other"],
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  security: "Security",
  vulnerability: "Vulnerability",
  malware: "Malware",
  data_breach: "Data Breach",
  privacy: "Privacy",
  programming: "Programming",
  web_dev: "Web Dev",
  mobile_dev: "Mobile Dev",
  devops: "DevOps",
  open_source: "Open Source",
  ai_ml: "AI/ML",
  llm: "LLM",
  data_science: "Data Science",
  automation: "Automation",
  cloud: "Cloud",
  infrastructure: "Infrastructure",
  networking: "Networking",
  database: "Database",
  startup: "Startup",
  enterprise: "Enterprise",
  acquisition: "Acquisition",
  funding: "Funding",
  layoffs: "Layoffs",
  product_launch: "Product Launch",
  update: "Update",
  tutorial: "Tutorial",
  guide: "Guide",
  research: "Research",
  hardware: "Hardware",
  gaming: "Gaming",
  crypto: "Crypto",
  regulation: "Regulation",
  other: "Other",
};

export function CategoryFilter() {
  const { categoryFilter, toggleCategory, setCategories } = useUserPreferences();
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAvailableCategories().then((cats) => {
      setAvailableCategories(cats);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading categories...</span>
      </div>
    );
  }

  const clearBadge = categoryFilter.length > 0 ? (
    <Badge 
      variant="secondary" 
      className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer h-5" 
      onClick={(e) => {
        e.stopPropagation();
        setCategories([]);
      }}
    >
      Clear ({categoryFilter.length})
    </Badge>
  ) : undefined;

  return (
    <CollapsibleFilter title="Categories" icon={Tag} badge={clearBadge} defaultOpen={false}>
      <div className="space-y-4">
        {Object.entries(CATEGORY_GROUPS).map(([groupKey, group]) => {
          const groupCategories = group.categories.filter(c => 
            availableCategories.includes(c)
          );
          
          if (groupCategories.length === 0) return null;

          return (
            <div key={groupKey} className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                {group.label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {groupCategories.map((cat) => {
                  const isSelected = categoryFilter.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`
                        px-2 py-1 text-xs rounded-md transition-colors
                        ${isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                    >
                      {CATEGORY_LABELS[cat] || cat}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </CollapsibleFilter>
  );
}

