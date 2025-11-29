"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import {
  fetchThreatPulseData,
  fetchTrendingTags,
  ThreatCategory,
  TrendingTag,
} from "@/lib/dashboard-data";

export function ThreatPulse() {
  const [categories, setCategories] = useState<ThreatCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchThreatPulseData().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  const getColor = (index: number, percent: number) => {
    if (percent > 40) return "red";
    if (percent > 20) return "amber";
    return "emerald";
  };

  return (
    <Card className="bg-card border-border backdrop-blur-sm">
      <CardHeader className="p-4 pb-2 border-b border-border/50">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
          <Activity className="w-4 h-4 text-emerald-500" />
          Threat Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 bg-muted rounded animate-pulse w-24" />
                <div className="w-full bg-muted h-1.5 rounded-full" />
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          categories.map((cat, i) => {
            const color = getColor(i, cat.percentChange);
            const colorClasses = {
              red: { text: "text-red-500", bg: "bg-red-500" },
              amber: { text: "text-amber-500", bg: "bg-amber-500" },
              emerald: { text: "text-emerald-500", bg: "bg-emerald-500" },
            }[color];

            return (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-muted-foreground">{cat.name}</span>
                  <div className={`flex items-center ${colorClasses.text} text-xs font-bold`}>
                    {cat.percentChange > 0 ? (
                      <ArrowUp className="w-3 h-3 mr-0.5" />
                    ) : cat.percentChange < 0 ? (
                      <ArrowDown className="w-3 h-3 mr-0.5" />
                    ) : (
                      <span className="text-muted-foreground font-normal mr-1">Stable</span>
                    )}
                    {cat.percentChange}%
                  </div>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${colorClasses.bg} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(cat.percentChange, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">No threat data available</p>
        )}
      </CardContent>
    </Card>
  );
}

export function TrendingTags() {
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTags().then((data) => {
      setTags(data);
      setLoading(false);
    });
  }, []);

  return (
    <Card className="bg-card border-border backdrop-blur-sm mt-6">
      <CardHeader className="p-4 pb-2 border-b border-border/50">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          Trending
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 w-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((item, i) => (
              <span
                key={item.tag}
                className={`
                  text-xs px-2 py-1 rounded border cursor-pointer transition-colors
                  ${
                    i < 3
                      ? "bg-muted text-foreground border-border hover:border-primary/50"
                      : "bg-card text-muted-foreground border-border hover:border-border/80"
                  }
                `}
                title={`${item.count} mentions`}
              >
                #{item.tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No trending tags</p>
        )}
      </CardContent>
    </Card>
  );
}
