"use client";

import { use, useEffect, useState } from "react";
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { ShepherdChat } from "@/components/chat/shepherd-chat";
import { fetchArticles } from "@/lib/mock-data";
import { Article } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ExternalLink, MessageSquare, Share2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ActionItems } from "@/components/article/action-items";
import { AffectedEntities } from "@/components/article/affected-entities";
import { AttackChain } from "@/components/article/attack-chain";
import { TrustBadge } from "@/components/feed/trust-badge";

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles().then((data) => {
      const found = data.find(a => a.id === id);
      setArticle(found || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading Intelligence...</div>;
  if (!article) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Article not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-emerald-500/20 selection:text-emerald-500">
      <ShepherdNav />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-emerald-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Link>

        {/* Header */}
        <header className="mb-12 border-b border-zinc-800 pb-12">
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="outline" className={`uppercase tracking-wider ${
                article.priority === "CRITICAL" ? "text-red-500 border-red-500/50 bg-red-500/10" : "text-zinc-400 border-zinc-700"
            }`}>
                {article.priority}
            </Badge>
            {article.categories.map(cat => (
                <Badge key={cat} variant="secondary" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700">#{cat}</Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white font-heading leading-tight mb-6">
            {article.title || article.headline}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-mono">
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{article.source}</span>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
            <TrustBadge status={article.verificationStatus} />
          </div>
        </header>

        <div className="grid md:grid-cols-[2fr_1fr] gap-12">
            
            {/* Main Content */}
            <div className="space-y-12">
                
                {/* TLDR */}
                <section className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl">
                    <h3 className="text-emerald-400 font-bold mb-2 uppercase tracking-widest text-xs">Executive Summary</h3>
                    <p className="text-lg text-zinc-200 leading-relaxed italic">
                        "{article.tldr}"
                    </p>
                </section>

                {/* Analysis */}
                <section className="prose prose-invert max-w-none prose-headings:font-heading prose-a:text-emerald-400">
                    <h3 className="text-xl font-bold text-white mb-4">Analysis</h3>
                    <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                        {article.long_summary}
                    </p>
                </section>

                <AttackChain />

                <ActionItems items={article.action_items} />

            </div>

            {/* Sidebar */}
            <div className="space-y-8">
                
                <AffectedEntities entities={article.affected_entities} />

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white font-heading">Actions</h3>
                    <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500">
                        <Share2 className="w-4 h-4" />
                        Share Report
                    </Button>
                    <Button variant="outline" className="w-full gap-2 border-zinc-700 hover:bg-zinc-800">
                        <ExternalLink className="w-4 h-4" />
                        Original Source
                    </Button>
                     <Button variant="ghost" className="w-full gap-2 text-zinc-400 hover:text-white">
                        <MessageSquare className="w-4 h-4" />
                        Discussion (12)
                    </Button>
                </div>

            </div>

        </div>

      </main>

      <ShepherdChat />
    </div>
  );
}

