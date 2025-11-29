"use client";

import { use, useEffect, useState, useCallback } from "react";
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { ShepherdChat } from "@/components/chat/shepherd-chat";
import { fetchArticleById } from "@/lib/articles";
import { Article, Priority } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Clock,
  Zap,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Megaphone,
  Mail,
  Copy,
  Check,
  Loader2,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { ActionItems } from "@/components/article/action-items";
import { AffectedEntities } from "@/components/article/affected-entities";
import { TrustBadge } from "@/components/feed/trust-badge";
import { KeyTakeaways } from "@/components/article/key-takeaways";
import { ScoreGauge } from "@/components/article/score-gauge";
import { MetaTags } from "@/components/article/meta-tags";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import {
  shareViaEmail,
  shareViaSlack,
  copyArticleLink,
} from "@/lib/share";

// Slack icon component
const SlackIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.124 2.521a2.528 2.528 0 0 1 2.52-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.52V8.834zm-1.271 0a2.528 2.528 0 0 1-2.521 2.521 2.528 2.528 0 0 1-2.521-2.521V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.521 2.522v6.312zm-2.521 10.124a2.528 2.528 0 0 1 2.521 2.52A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.521-2.522v-2.52h2.521zm0-1.271a2.528 2.528 0 0 1-2.521-2.521 2.528 2.528 0 0 1 2.521-2.521h6.312A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.521h-6.312z" />
  </svg>
);

export default function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, slackStatus } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  // Share states
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [shareLoading, setShareLoading] = useState<"email" | "slack" | "copy" | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchArticleById(id).then((data) => {
      setArticle(data);
      setLoading(false);
    });
  }, [id]);

  // Reset email dialog state when closed
  useEffect(() => {
    if (!emailDialogOpen) {
      setTimeout(() => {
        setEmailRecipient("");
        setPersonalMessage("");
        setShareError(null);
        setShareSuccess(null);
      }, 200);
    }
  }, [emailDialogOpen]);

  const handleCopyLink = useCallback(async () => {
    setShareLoading("copy");
    const success = await copyArticleLink(id);
    setShareLoading(null);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [id]);

  const handleShareEmail = useCallback(async () => {
    if (!emailRecipient.trim()) {
      setShareError("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRecipient.trim())) {
      setShareError("Please enter a valid email address");
      return;
    }

    setShareLoading("email");
    setShareError(null);

    try {
      const result = await shareViaEmail({
        article_id: id,
        recipient_emails: [emailRecipient.trim()],
        personal_message: personalMessage.trim() || undefined,
      });

      setShareSuccess(result.message);
      setTimeout(() => {
        setEmailDialogOpen(false);
        setShareSuccess(null);
      }, 2000);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "Failed to send email"
      );
    } finally {
      setShareLoading(null);
    }
  }, [id, emailRecipient, personalMessage]);

  const handleShareSlack = useCallback(async () => {
    if (!user) return;
    
    setShareLoading("slack");
    setShareError(null);

    try {
      await shareViaSlack({
        article_id: id,
      });
      // Brief visual feedback
      setShareSuccess("Sent to Slack!");
      setTimeout(() => setShareSuccess(null), 2000);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "Failed to send to Slack"
      );
      setTimeout(() => setShareError(null), 3000);
    } finally {
      setShareLoading(null);
    }
  }, [id, user]);

  const canShareSlack = user && slackStatus.connected && slackStatus.channelId;

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
            {article.is_breaking_news && (
              <Badge
                variant="outline"
                className="bg-destructive/10 text-destructive border-destructive/30 animate-pulse"
              >
                <Zap className="w-3 h-3 mr-1" />
                BREAKING
              </Badge>
            )}

            {article.is_sponsored && (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              >
                <Megaphone className="w-3 h-3 mr-1" />
                SPONSORED
              </Badge>
            )}

            <Badge variant="outline" className={cn("uppercase tracking-wider font-mono", config.badge)}>
              {article.priority}
            </Badge>

            <Badge variant="secondary" className="bg-muted text-muted-foreground capitalize">
              {article.content_type?.replace("_", " ")}
            </Badge>

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
                &quot;{article.tldr}&quot;
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
              
              {/* Share Report - Copy Link */}
              <Button
                variant="outline"
                className="w-full gap-2 border-border hover:bg-muted"
                onClick={handleCopyLink}
                disabled={shareLoading === "copy"}
              >
                {shareLoading === "copy" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>

              {/* Share via Email */}
              <Button
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setEmailDialogOpen(true)}
              >
                <Mail className="w-4 h-4" />
                Share via Email
              </Button>

              {/* Share to Slack */}
              {user ? (
                canShareSlack ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-border hover:bg-muted"
                    onClick={handleShareSlack}
                    disabled={shareLoading === "slack"}
                  >
                    {shareLoading === "slack" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <SlackIcon className="w-4 h-4" />
                    )}
                    {shareLoading === "slack" 
                      ? "Sending..." 
                      : shareSuccess === "Sent to Slack!"
                        ? "Sent to Slack!"
                        : `Send to #${slackStatus.channelName}`}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-border text-muted-foreground"
                    asChild
                  >
                    <Link href="/dashboard/settings">
                      <SlackIcon className="w-4 h-4" />
                      Connect Slack in Settings
                    </Link>
                  </Button>
                )
              ) : (
                <Button
                  variant="outline"
                  className="w-full gap-2 border-border text-muted-foreground"
                  asChild
                >
                  <Link href="/login">
                    <LogIn className="w-4 h-4" />
                    Sign in to Share via Slack
                  </Link>
                </Button>
              )}

              {/* Error message */}
              {shareError && (
                <p className="text-sm text-destructive text-center">{shareError}</p>
              )}

              <div className="border-t border-border pt-4 space-y-4">
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
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Share via Email
            </DialogTitle>
            <DialogDescription>
              Send this security report to a colleague via email.
            </DialogDescription>
          </DialogHeader>

          {shareSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-center text-foreground font-medium">
                {shareSuccess}
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Check out this security report..."
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  rows={3}
                />
              </div>

              {shareError && (
                <p className="text-sm text-destructive">{shareError}</p>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={() => setEmailDialogOpen(false)}
                  disabled={shareLoading === "email"}
                >
                  Cancel
                </Button>
                <Button onClick={handleShareEmail} disabled={shareLoading === "email"}>
                  {shareLoading === "email" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ShepherdChat />
    </div>
  );
}
