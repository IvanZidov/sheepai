"use client";

import { 
  Layers, 
  FileText, 
  CalendarClock, 
  ShieldCheck, 
  BarChart3,
  Bell,
  X,
  Check,
  ArrowRight
} from "lucide-react";

const painPoints = [
  {
    icon: Layers,
    problem: "Drowning in irrelevant news",
    solution: "Filtered for YOUR stack",
    description: "Only see articles about technologies you actually use. AWS admin? No WordPress exploits.",
    visual: (
      <div className="relative h-full flex flex-col justify-center">
        {/* Before: Chaos */}
        <div className="absolute -left-2 top-2 bottom-2 w-1/2 overflow-hidden opacity-40">
          <div className="space-y-1 transform -rotate-3 scale-90">
            {["WordPress", "Java CVE", "iOS Bug", "PHP Vuln"].map((item, i) => (
              <div key={i} className="px-2 py-1 bg-zinc-300 dark:bg-zinc-800/50 rounded text-[9px] text-zinc-500 truncate">
                {item}
              </div>
            ))}
          </div>
        </div>
        {/* After: Clean */}
        <div className="relative ml-auto w-3/4 space-y-2 z-10">
          {["Python Supply Chain ⚠️", "AWS Lambda CVE 🔴"].map((item, i) => (
            <div 
              key={i} 
              className="px-2 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5"
            >
              <Check className="w-3 h-3 shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    icon: FileText,
    problem: "Articles too long to read",
    solution: "AI summaries in 30 seconds",
    description: "Get the TL;DR, key takeaways, and action items. Decide if it's worth a deep dive.",
    visual: (
      <div className="space-y-2 h-full flex flex-col justify-center">
        {/* Before: Wall of text */}
        <div className="relative p-2 bg-zinc-200 dark:bg-zinc-800/30 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-100/90 dark:bg-zinc-900/80 z-10">
            <span className="text-[10px] text-zinc-500 font-mono">2,847 words</span>
          </div>
          <div className="space-y-1 blur-sm">
            {[1,2,3].map(i => (
              <div key={i} className="h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded w-full" />
            ))}
          </div>
        </div>
        {/* After: Summary */}
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="text-[9px] text-emerald-600 dark:text-emerald-500 font-mono mb-1">TL;DR</div>
          <div className="text-[10px] text-zinc-700 dark:text-zinc-300 leading-tight">
            Critical RCE in popular package. Patch now.
          </div>
          <div className="flex gap-1.5 mt-1.5">
            <span className="text-[8px] px-1 py-0.5 bg-red-500/20 text-red-600 dark:text-red-400 rounded">CRITICAL</span>
            <span className="text-[8px] px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded">2 min</span>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: CalendarClock,
    problem: "Manually checking sites daily",
    solution: "Updates come to you",
    description: "Instant, daily, or weekly alerts via Email and Slack. Your security news, delivered automatically.",
    visual: (
      <div className="space-y-1.5 h-full flex flex-col justify-center">
        <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
          <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center text-[10px]">⚡</div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-zinc-700 dark:text-zinc-300 font-medium">Instant</div>
            <div className="text-[8px] text-zinc-500 truncate">Critical alerts → Slack</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
          <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center text-[10px]">📧</div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-zinc-700 dark:text-zinc-300 font-medium">Daily Digest</div>
            <div className="text-[8px] text-zinc-500 truncate">9am email summary</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
          <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-[10px]">📅</div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-zinc-700 dark:text-zinc-300 font-medium">Weekly</div>
            <div className="text-[8px] text-zinc-500 truncate">Monday roundup</div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: ShieldCheck,
    problem: "Worried about fake news",
    solution: "Source-linked & verifiable",
    description: "Every analysis links to originals. Cross-referenced with CISA and NVD for high-confidence info.",
    visual: (
      <div className="h-full flex flex-col justify-center">
        <div className="p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Verified</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[9px]">
              <span className="text-zinc-500 shrink-0">Source:</span>
              <span className="text-blue-600 dark:text-blue-400 truncate">thehackernews.com</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px]">
              <span className="text-zinc-500 shrink-0">CVE:</span>
              <span className="text-zinc-700 dark:text-zinc-300">CVE-2024-3400</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px]">
              <span className="text-zinc-500 shrink-0">NVD:</span>
              <span className="text-emerald-600 dark:text-emerald-400">✓ Confirmed</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    icon: BarChart3,
    problem: "Plain text is hard to scan",
    solution: "Visual scoring & badges",
    description: "Priority badges, relevance scores, and threat levels at a glance. Decide in seconds.",
    visual: (
      <div className="h-full flex flex-col justify-center">
        {/* Mock threat card preview */}
        <div className="relative p-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] px-1.5 py-0.5 bg-red-500/20 text-red-600 dark:text-red-400 rounded font-mono">🔴 CRITICAL</span>
            <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-emerald-500 text-emerald-600 dark:text-emerald-500 text-[9px] font-bold">
              9
            </div>
          </div>
          <div className="text-[10px] text-zinc-700 dark:text-zinc-300 font-medium mb-1">
            Critical RCE in OpenSSH
          </div>
          <div className="flex gap-1">
            <span className="text-[8px] px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded">linux</span>
            <span className="text-[8px] px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded">ssh</span>
          </div>
        </div>
        <div className="flex justify-center gap-1.5 mt-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" title="Critical" />
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" title="High" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" title="Medium" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Low" />
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" title="Info" />
        </div>
      </div>
    )
  },
  {
    icon: Bell,
    problem: "Missing critical alerts",
    solution: "Email + Slack integration",
    description: "Get notified instantly on Slack for urgent threats. Daily/weekly email digests for the rest.",
    visual: (
      <div className="h-full flex flex-col justify-center space-y-2">
        {/* Slack notification */}
        <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">💬</span>
            <span className="text-[9px] text-purple-700 dark:text-purple-400 font-medium">Slack #security</span>
          </div>
          <div className="text-[9px] text-zinc-600 dark:text-zinc-400">
            🔴 New critical: CVE-2024-3400
          </div>
        </div>
        {/* Email notification */}
        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">📧</span>
            <span className="text-[9px] text-blue-700 dark:text-blue-400 font-medium">Daily Digest</span>
          </div>
          <div className="text-[9px] text-zinc-600 dark:text-zinc-400">
            3 high, 7 medium threats today
          </div>
        </div>
      </div>
    )
  }
];

export function PainPointsSection() {
  return (
    <section id="pain-points" className="py-20 sm:py-24 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/5 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono mb-6">
            <X className="w-3 h-3" />
            THE PROBLEM
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mb-4 text-zinc-900 dark:text-white">
            Security news is{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              broken
            </span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            You follow The Hacker News to stay informed, but end up overwhelmed and still missing what matters.
          </p>
        </div>

        {/* Pain points grid - 2x3 on desktop, 1 column on mobile */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                {/* Icon + Solution header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 group-hover:bg-emerald-500/10 flex items-center justify-center transition-colors shrink-0">
                    <Icon className="w-4 h-4 text-red-500 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-zinc-400 line-through truncate">
                      {point.problem}
                    </div>
                    <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3 shrink-0" />
                      <span className="truncate">{point.solution}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2">
                  {point.description}
                </p>

                {/* Visual demo */}
                <div className="h-28 p-2 bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  {point.visual}
                </div>
              </div>
            );
          })}
        </div>

        {/* Transition to solution */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">The Shepherd protects the flock</span>
            <ArrowRight className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
