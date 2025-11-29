"use client";

import { useState } from "react";
import { Settings, Filter, Bell, MessageSquare, ArrowRight, Check } from "lucide-react";

const steps = [
  {
    id: 1,
    icon: Settings,
    title: "Define Your Stack",
    subtitle: "30 seconds setup",
    description: "Tell us what technologies you use. AWS? Python? Kubernetes? We'll remember.",
    visual: (
      <div className="space-y-3">
        <div className="text-xs text-zinc-500 font-mono mb-4">SELECT YOUR TECHNOLOGIES</div>
        <div className="flex flex-wrap gap-2">
          {["AWS", "Python", "Kubernetes", "Docker", "Node.js", "PostgreSQL"].map((tech, i) => (
            <div 
              key={tech}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                ${i < 3 
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'}`}
            >
              {i < 3 && <Check className="inline w-3 h-3 mr-1.5" />}
              {tech}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-500">Priority threshold</div>
          <div className="mt-2 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
            <span>All</span>
            <span className="text-emerald-600 dark:text-emerald-400">High + Critical</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    icon: Filter,
    title: "AI Filters 10,000+ Articles",
    subtitle: "Real-time processing",
    description: "Our AI reads every security article, CVE, and advisory. It understands context, not just keywords.",
    visual: (
      <div className="space-y-3">
        <div className="text-xs text-zinc-500 font-mono mb-4">PROCESSING PIPELINE</div>
        
        <div className="relative">
          {/* Input */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-20 text-right text-xs text-zinc-500">10,847</div>
            <div className="flex-1 h-3 bg-zinc-200 dark:bg-zinc-800 rounded overflow-hidden">
              <div className="h-full bg-red-500/50 w-full animate-pulse" />
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Raw feeds</div>
          </div>
          
          {/* Filter 1 */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-20 text-right text-xs text-zinc-500">2,341</div>
            <div className="flex-1 h-3 bg-zinc-200 dark:bg-zinc-800 rounded overflow-hidden">
              <div className="h-full bg-orange-500/50 w-[22%]" />
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Deduplicated</div>
          </div>
          
          {/* Filter 2 */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-20 text-right text-xs text-zinc-500">127</div>
            <div className="flex-1 h-3 bg-zinc-200 dark:bg-zinc-800 rounded overflow-hidden">
              <div className="h-full bg-yellow-500/50 w-[1.2%]" />
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Stack-relevant</div>
          </div>
          
          {/* Final */}
          <div className="flex items-center gap-3">
            <div className="w-20 text-right text-xs text-emerald-600 dark:text-emerald-400 font-bold">7</div>
            <div className="flex-1 h-3 bg-zinc-200 dark:bg-zinc-800 rounded overflow-hidden">
              <div className="h-full bg-emerald-500 w-[0.07%] min-w-[4px]" />
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Action needed</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
            99.93% noise eliminated
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    icon: Bell,
    title: "Get Notified Your Way",
    subtitle: "Email, Slack, or Dashboard",
    description: "Immediate alerts for critical issues. Daily or weekly digests for everything else. You choose.",
    visual: (
      <div className="space-y-4">
        <div className="text-xs text-zinc-500 font-mono mb-4">NOTIFICATION CHANNELS</div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <span className="text-lg">📧</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Email Digest</div>
              <div className="text-xs text-zinc-500">Daily @ 9am • Weekly @ Mon</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Slack Alerts</div>
              <div className="text-xs text-zinc-500">Instant for critical • #security</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/50 opacity-50">
            <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
              <span className="text-lg">📱</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Mobile Push</div>
              <div className="text-xs text-zinc-400 dark:text-zinc-600">Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    icon: MessageSquare,
    title: "Ask Questions in Natural Language",
    subtitle: "RAG-powered assistant",
    description: "\"What Python vulnerabilities affect us?\" Get instant answers from 30 days of analyzed threats.",
    visual: (
      <div className="space-y-3">
        <div className="text-xs text-zinc-500 font-mono mb-4">SHEPHERD ASSISTANT</div>
        
        <div className="space-y-3">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-100 text-sm px-4 py-2 rounded-2xl rounded-br-md max-w-[85%]">
              What CVEs affect our Python Lambda functions?
            </div>
          </div>
          
          {/* AI response */}
          <div className="flex justify-start">
            <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm px-4 py-3 rounded-2xl rounded-bl-md max-w-[85%]">
              <p className="mb-2">Found <span className="text-emerald-600 dark:text-emerald-400 font-semibold">3 relevant CVEs</span> from the last 7 days:</p>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>• <span className="text-red-600 dark:text-red-400">CVE-2024-3400</span> - PAN-OS injection</li>
                <li>• <span className="text-orange-600 dark:text-orange-400">CVE-2024-1234</span> - boto3 SSRF</li>
                <li>• <span className="text-yellow-600 dark:text-yellow-400">CVE-2024-5678</span> - requests SSL</li>
              </ul>
              <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500">
                Based on 847 analyzed articles
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-white dark:bg-zinc-950/50 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2" />
      
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            HOW IT WORKS
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mb-4 text-zinc-900 dark:text-white">
            From chaos to clarity in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">
              4 steps
            </span>
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-muted-foreground max-w-2xl mx-auto">
            Set up once, stay informed forever. No more RSS feeds, no more endless scrolling.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
          {/* Left: Step list */}
          <div className="space-y-3 sm:space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full text-left p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all duration-300 group
                    ${isActive 
                      ? 'bg-zinc-50 dark:bg-zinc-900/80 border-emerald-500/30 shadow-lg shadow-emerald-500/5' 
                      : 'bg-white dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
                      ${isActive 
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1">
                        <span className={`text-xs font-mono ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                          0{step.id}
                        </span>
                        <span className={`text-xs ${isActive ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
                          {step.subtitle}
                        </span>
                      </div>
                      <h3 className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 transition-colors ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-xs sm:text-sm transition-colors line-clamp-2 ${isActive ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-500 dark:text-zinc-500'}`}>
                        {step.description}
                      </p>
                    </div>
                    <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-all duration-300
                      ${isActive 
                        ? 'text-emerald-500 dark:text-emerald-400 translate-x-0 opacity-100' 
                        : 'text-zinc-400 dark:text-zinc-600 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'}`} 
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Visual */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 min-h-[350px] sm:min-h-[400px]">
              {steps.find(s => s.id === activeStep)?.visual}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
