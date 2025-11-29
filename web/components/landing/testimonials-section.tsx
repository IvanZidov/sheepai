"use client";

import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "I used to spend 2 hours every morning reading security news. Now it's 15 minutes. CyberShepherd knows exactly what matters to our AWS + Python stack.",
    author: "Sarah Chen",
    role: "Security Lead",
    company: "CloudStartup Inc.",
    avatar: "SC",
    gradient: "from-emerald-500 to-cyan-500"
  },
  {
    quote: "The Slack integration is a game-changer. Our team gets critical alerts in real-time. We patched the Log4j follow-up before most people knew it existed.",
    author: "Marcus Rodriguez",
    role: "CISO",
    company: "FinTech Solutions",
    avatar: "MR",
    gradient: "from-violet-500 to-purple-500"
  },
  {
    quote: "Finally, a tool that understands context. I'm not drowning in WordPress vulnerabilities when we're a pure Kubernetes shop. It just works.",
    author: "Alex Kim",
    role: "DevSecOps Engineer",
    company: "ScaleUp Corp",
    avatar: "AK",
    gradient: "from-amber-500 to-orange-500"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-mono mb-6">
            TESTIMONIALS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Loved by{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              security teams
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From startups to enterprises, security professionals trust CyberShepherd to cut through the noise.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="relative group"
            >
              {/* Hover glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              
              <div className="relative h-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all duration-300">
                {/* Quote icon */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${testimonial.gradient} p-[1px] mb-6`}>
                  <div className="w-full h-full rounded-xl bg-zinc-900 flex items-center justify-center">
                    <Quote className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-foreground leading-relaxed mb-8">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-zinc-800">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-semibold text-sm`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

