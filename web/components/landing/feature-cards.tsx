"use client";

import { Filter, FileText, Bell, ShieldCheck, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Filter,
    title: "Category Filtering",
    problem: "Too much irrelevant noise",
    solution: "Follow only Malware, Phishing, AI Agents, or any category you care about. Everything else gets filtered out.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: FileText,
    title: "AI Summaries",
    problem: "Articles are too lengthy",
    solution: "Every article gets a 2-minute summary with key takeaways. Decide quickly if it's worth your time.",
    color: "text-violet-500",
    bg: "bg-violet-500/10"
  },
  {
    icon: Bell,
    title: "Scheduled Alerts",
    problem: "Manually checking for updates",
    solution: "Get daily or weekly digests via Email or Slack. Never miss critical news, never waste time checking.",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    icon: ShieldCheck,
    title: "Verified Content",
    problem: "Worried about false information",
    solution: "Every analysis links to original sources. Cross-referenced with CISA and NVD for accuracy.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    icon: BarChart3,
    title: "Visual Scoring",
    problem: "Hard to prioritize quickly",
    solution: "Color-coded priority levels and relevance scores. Know what needs attention at a glance.",
    color: "text-rose-500",
    bg: "bg-rose-500/10"
  }
];

export function FeatureCards() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
            Your problems, solved
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We built CyberShepherd because we had the same frustrations with security news.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                
                <p className="text-sm text-muted-foreground mb-3">
                  <span className="text-destructive font-medium">Problem:</span> {feature.problem}
                </p>
                
                <p className="text-sm text-muted-foreground">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Solution:</span> {feature.solution}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
