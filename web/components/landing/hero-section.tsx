"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background py-20 sm:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-tr from-primary/5 to-transparent opacity-30 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground font-heading">
            Stop Reading. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Start Knowing.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Cybersecurity news filtered for YOUR tech stack. AI-summarized. Fact-checked. Zero noise.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                Get Relevant News <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base border-border text-muted-foreground hover:bg-muted">
              See How It Works
            </Button>
          </div>
        </div>

        {/* Before / After Visual */}
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center max-w-5xl mx-auto">
          
          {/* BEFORE: Chaos */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-card border border-border rounded-xl p-6 h-[280px] overflow-hidden">
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <div className="bg-background/90 border border-border px-4 py-2 rounded-full text-xs font-mono text-red-500 mb-4">
                  BEFORE (Chaos)
                </div>
              </div>
              {/* Blurred Content Background */}
              <div className="space-y-3 opacity-30 blur-[2px]">
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-full"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
                <div className="h-20 bg-muted rounded w-full mt-4"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mt-4"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-full"></div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex justify-center">
             <ArrowRight className="w-8 h-8 text-muted-foreground" />
          </div>

          {/* AFTER: Clean */}
          <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
             <div className="relative bg-card border border-border rounded-xl p-0 h-[280px] flex flex-col overflow-hidden">
                <div className="bg-card/90 border-b border-border px-4 py-3 flex items-center justify-between">
                   <div className="text-xs font-mono text-emerald-500">AFTER (Clarity)</div>
                   <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-center relative">
                   <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                   <div className="ml-2">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-red-500/10 text-red-500 uppercase tracking-wider">CRITICAL</span>
                         <span className="text-[10px] text-muted-foreground">2h ago</span>
                      </div>
                      <h3 className="text-sm font-bold text-card-foreground mb-2">Python Supply Chain Attack</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                         Malicious package "py-helper-v2" detected targeting AWS Lambda environments. Contains exfiltration hooks.
                      </p>
                      <div className="mt-3 flex gap-2">
                         <span className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground bg-muted">#Python</span>
                         <span className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground bg-muted">#AWS</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* Social Proof */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-muted-foreground font-mono">
           <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
              <span>12,000+ Articles Filtered Daily</span>
           </div>
           <div className="hidden sm:block w-1 h-1 bg-muted-foreground/20 rounded-full" />
           <div>2 min Avg Read Time (vs 45m)</div>
           <div className="hidden sm:block w-1 h-1 bg-muted-foreground/20 rounded-full" />
           <div>Verified by Gemini 1.5 Pro</div>
        </div>

      </div>
    </div>
  );
}
