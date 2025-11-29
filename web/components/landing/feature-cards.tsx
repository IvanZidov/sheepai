"use client";

import { Bot, Layers, Network, SearchCheck, Zap } from "lucide-react";

export function FeatureCards() {
  const features = [
    {
      icon: <Layers className="w-6 h-6 text-emerald-400" />,
      title: "Your Stack. Your News.",
      description: "Tell us you use AWS Lambda and Python. We filter 10,000 articles down to the 5 that actually affect your infrastructure.",
      gradient: "from-emerald-500/10 to-cyan-500/10"
    },
    {
      icon: <SearchCheck className="w-6 h-6 text-blue-400" />,
      title: "Trust, But Verify.",
      description: "AI hallucinations are the new vulnerabilities. Every critical alert is fact-checked against live CISA and NVD sources.",
      gradient: "from-blue-500/10 to-indigo-500/10"
    },
    {
      icon: <Network className="w-6 h-6 text-purple-400" />,
      title: "Understand in Seconds.",
      description: "Don't parse 3,000-word PDF reports. See the attack vector visualized in a clear diagram in 3 seconds.",
      gradient: "from-purple-500/10 to-pink-500/10"
    }
  ];

  return (
    <section className="py-24 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 group overflow-hidden shadow-sm"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-border">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3 font-heading">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
