"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Clock, AlertTriangle, Bug, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const LIVE_VULNERABILITIES = [
  { id: 1, cve: "CVE-2025-0847", severity: "CRITICAL", title: "Apache Struts RCE", tech: "Java", time: "2m ago" },
  { id: 2, cve: "CVE-2025-1293", severity: "HIGH", title: "React XSS in SSR", tech: "React", time: "8m ago" },
  { id: 3, cve: "CVE-2025-0512", severity: "CRITICAL", title: "PostgreSQL Auth Bypass", tech: "PostgreSQL", time: "15m ago" },
  { id: 4, cve: "CVE-2025-2104", severity: "HIGH", title: "Node.js Path Traversal", tech: "Node.js", time: "23m ago" },
  { id: 5, cve: "CVE-2025-0991", severity: "MEDIUM", title: "Django CSRF Weakness", tech: "Python", time: "31m ago" },
  { id: 6, cve: "CVE-2025-1847", severity: "CRITICAL", title: "Kubernetes API Exposure", tech: "K8s", time: "45m ago" },
];

export function HeroSection() {
  const [visibleVulns, setVisibleVulns] = useState(LIVE_VULNERABILITIES.slice(0, 3));
  const [currentIndex, setCurrentIndex] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleVulns(prev => {
        const nextIndex = currentIndex % LIVE_VULNERABILITIES.length;
        const newVuln = LIVE_VULNERABILITIES[nextIndex];
        setCurrentIndex(c => c + 1);
        return [newVuln, ...prev.slice(0, 2)];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background - works in both modes */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Logo */}
          <div className="mb-6 animate-fade-in">
            <Image 
              src="/logo.png" 
              alt="CyberShepherd" 
              width={120} 
              height={120} 
              className="mx-auto drop-shadow-lg"
            />
          </div>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Your guide in the wolf-filled web
          </div>

          {/* Main headline with Shepherd reference */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight font-heading leading-[1.1] mb-8 animate-fade-in-up">
            <span className="text-zinc-900 dark:text-white">Silence the</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
              Noise
            </span>
          </h1>

          {/* Sub-headline - The Shepherd promise */}
          <p className="text-xl sm:text-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-4 animate-fade-in-up animation-delay-200">
            CyberShepherd guards your flock from the wolves.
          </p>
          <p className="text-lg text-zinc-500 dark:text-zinc-500 leading-relaxed max-w-xl mx-auto mb-10 animate-fade-in-up animation-delay-300">
            AI-filtered security news tailored to <span className="text-emerald-600 dark:text-emerald-400 font-medium">your</span> tech stack.
            <br />
            Summarized. Verified. Delivered.
          </p>

          {/* Live Vulnerability Feed */}
          <div className="mb-10 animate-fade-in-up animation-delay-350">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              LIVE THREAT FEED
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              {visibleVulns.map((vuln, index) => (
                <div 
                  key={`${vuln.id}-${index}`}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-900/5 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 text-left transition-all duration-500 ${index === 0 ? 'animate-slide-in-down' : ''}`}
                  style={{ opacity: 1 - index * 0.2 }}
                >
                  <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                    vuln.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse' :
                    vuln.severity === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`} />
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    vuln.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                    vuln.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' :
                    'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {vuln.severity}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">{vuln.cve}</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate flex-1">{vuln.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">{vuln.tech}</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{vuln.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-12 animate-fade-in-up animation-delay-400">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">500+</span>
              <span className="text-sm text-zinc-500">analyzed</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-500" />
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">95%</span>
              <span className="text-sm text-zinc-500">filtered</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">2 min</span>
              <span className="text-sm text-zinc-500">reads</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-500">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105"
              >
                Enter the Fold
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 px-8 text-lg border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
              onClick={() => document.getElementById('pain-points')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-600 animate-fade-in-up animation-delay-600">
            100% free • No signup required • Sources from The Hacker News
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-6 h-10 rounded-full border-2 border-zinc-300 dark:border-zinc-700 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-emerald-500 rounded-full animate-scroll-indicator" />
        </div>
      </div>
    </section>
  );
}
