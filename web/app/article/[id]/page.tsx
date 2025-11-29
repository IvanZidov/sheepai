"use client";

import { use, useEffect, useState } from "react";
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { ShepherdChat } from "@/components/chat/shepherd-chat";
import { fetchArticleById } from "@/lib/articles";
import { Article, Priority } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  MessageSquare,
  Share2,
  ShieldCheck,
  Clock,
  Zap,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { ActionItems } from "@/components/article/action-items";
import { AffectedEntities } from "@/components/article/affected-entities";
import { TrustBadge } from "@/components/feed/trust-badge";
import { KeyTakeaways } from "@/components/article/key-takeaways";
import { ScoreGauge } from "@/components/article/score-gauge";
import { MetaTags } from "@/components/article/meta-tags";
import { cn } from "@/lib/utils";

export default function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticleById(id).then((data) => {
      setArticle(data);
      setLoading(false);
    });
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground font-mono text-sm">
            Loading Intelligence...
          </span>
        </div>
      </div>
    );

  if (!article)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Article not found.</p>
          <Link href="/">
            <Button variant="outline">Return to Feed</Button>
          </Link>
        </div>
      </div>
    );

  const priorityConfig: Record<
    Priority,
    { badge: string; border: string; glow: string }
  > = {
    CRITICAL: {
      badge: "bg-destructive/10 text-destructive border-destructive/30",
      border: "border-l-destructive",
      glow: "shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    },
    HIGH: {
      badge: "bg-warning/10 text-warning border-warning/30",
      border: "border-l-warning",
      glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    },
    MEDIUM: {
      badge: "bg-amber-500/10 text-amber-500 border-amber-500/30",
      border: "border-l-amber-500",
      glow: "",
    },
    LOW: {
      badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
      border: "border-l-emerald-500",
      glow: "",
    },
    INFO: {
      badge: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      border: "border-l-blue-500",
      glow: "",
    },
  };

  const config = priorityConfig[article.priority] || priorityConfig.INFO;

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/20 selection:text-emerald-500">
      <ShepherdNav />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </Link>

        {/* Header */}
        <header
          className={cn(
            "mb-12 border-b border-border pb-12 relative",
            article.priority === "CRITICAL" && "animate-pulse-subtle"
          )}
        >
          {/* Top badges row */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Breaking News Badge */}
            {article.is_breaking_news && (
              <Badge
                variant="outline"
                className="bg-destructive/10 text-destructive border-destructive/30 animate-pulse"
              >
                <Zap className="w-3 h-3 mr-1" />
                BREAKING
              </Badge>
            )}

            {/* Sponsored Badge */}
            {article.is_sponsored && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              >
                <Megaphone className="w-3 h-3 mr-1" />
                SPONSORED
              </Badge>
            )}

            {/* Priority Badge */}
            <Badge variant="outline" className={cn("uppercase tracking-wider font-mono", config.badge)}>
              {article.priority}
            </Badge>

            {/* Content Type */}
            <Badge variant="secondary" className="bg-muted text-muted-foreground capitalize">
              {article.content_type?.replace("_", " ")}
            </Badge>

            {/* Categories */}
            {article.categories.slice(0, 3).map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="bg-muted/50 text-muted-foreground hover:bg-muted/80"
              >
                #{cat}
              </Badge>
            ))}
            {article.categories.length > 3 && (
              <span className="text-xs text-muted-foreground self-center font-mono">
                +{article.categories.length - 3}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground font-heading leading-tight mb-6">
            {article.headline || article.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{article.source}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.read_time_minutes} min read</span>
            </div>
            {article.worth_full_read && (
              <div className="flex items-center gap-2 text-primary">
                <BookOpen className="w-4 h-4" />
                <span>Worth Full Read</span>
              </div>
            )}
            <TrustBadge
              status={article.verificationStatus}
              note={article.verificationNote}
            />
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_320px] gap-12">
          {/* Main Content */}
          <div className="space-y-12">
            {/* TLDR */}
            <section
              className={cn(
                "p-6 rounded-xl border-l-4",
                config.border,
                config.glow,
                "bg-muted/30 border border-border"
              )}
            >
              <h3 className="text-primary font-bold mb-2 uppercase tracking-widest text-xs flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Executive Summary
              </h3>
              <p className="text-lg text-foreground leading-relaxed italic">
                "{article.tldr}"
              </p>
            </section>

            {/* Key Takeaways */}
            <KeyTakeaways items={article.key_takeaways} />

            {/* Analysis */}
            <section className="prose dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Full Analysis
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {article.long_summary}
              </p>
            </section>

            <ActionItems items={article.action_items} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Scores */}
            <div className="bg-muted/30 border border-border rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground font-heading">
                Analysis Scores
              </h3>
              <div className="flex justify-around">
                <ScoreGauge
                  score={article.relevance_score}
                  label="Relevance"
                  variant="primary"
                />
                <ScoreGauge
                  score={article.confidence_score}
                  label="Confidence"
                  variant="success"
                />
              </div>
            </div>

            {/* Affected Entities */}
            <AffectedEntities entities={article.affected_entities} />

            {/* Meta Tags */}
            <div className="bg-muted/30 border border-border rounded-xl p-6">
              <MetaTags
                technologies={article.mentioned_technologies}
                companies={article.mentioned_companies}
                topics={article.related_topics}
                regions={article.regions}
              />
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground font-heading">
                Actions
              </h3>
              <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Share2 className="w-4 h-4" />
                Share Report
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 border-border hover:bg-muted"
                asChild
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                  Original Source
                </a>
              </Button>
              <Button
                variant="ghost"
                className="w-full gap-2 text-muted-foreground hover:text-foreground"
              >
                <MessageSquare className="w-4 h-4" />
                Discussion
              </Button>
            </div>
          </div>
        </div>
      </main>

      <ShepherdChat />
    </div>
  );
}
