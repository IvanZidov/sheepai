"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Clock, AlertTriangle, Lock, Radar, Wifi, Database, Server, Activity } from "lucide-react";
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

// Floating decorative icons
const FLOATING_ICONS = [
  { Icon: Shield, position: "top-[18%] left-[5%]", delay: "0s", size: "w-8 h-8", opacity: "opacity-[0.08]" },
  { Icon: Lock, position: "top-[35%] right-[5%]", delay: "0.5s", size: "w-6 h-6", opacity: "opacity-[0.06]" },
  { Icon: AlertTriangle, position: "bottom-[25%] left-[8%]", delay: "1s", size: "w-7 h-7", opacity: "opacity-[0.07]" },
  { Icon: Radar, position: "top-[55%] right-[3%]", delay: "1.5s", size: "w-5 h-5", opacity: "opacity-[0.08]" },
  { Icon: Wifi, position: "top-[12%] right-[25%]", delay: "2s", size: "w-5 h-5", opacity: "opacity-[0.06]" },
  { Icon: Database, position: "bottom-[35%] right-[8%]", delay: "0.8s", size: "w-6 h-6", opacity: "opacity-[0.05]" },
  { Icon: Server, position: "top-[45%] left-[3%]", delay: "1.2s", size: "w-5 h-5", opacity: "opacity-[0.07]" },
  { Icon: Activity, position: "top-[8%] left-[20%]", delay: "1.8s", size: "w-4 h-4", opacity: "opacity-[0.06]" },
];

export function HeroSection() {
  const [visibleVulns, setVisibleVulns] = useState(LIVE_VULNERABILITIES.slice(0, 4));
  const [currentIndex, setCurrentIndex] = useState(4);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleVulns(prev => {
        const nextIndex = currentIndex % LIVE_VULNERABILITIES.length;
        const newVuln = LIVE_VULNERABILITIES[nextIndex];
        setCurrentIndex(c => c + 1);
        return [newVuln, ...prev.slice(0, 3)];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Subtle parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20" />
      
      {/* Animated mesh gradient */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-50"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(16, 185, 129, 0.12), transparent),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(6, 182, 212, 0.08), transparent),
            radial-gradient(ellipse 40% 30% at 40% 80%, rgba(245, 158, 11, 0.04), transparent)
          `,
        }}
      />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating decorative icons */}
      {FLOATING_ICONS.map(({ Icon, position, delay, size, opacity }, i) => (
        <div
          key={i}
          className={`absolute ${position} ${opacity} text-emerald-600 dark:text-emerald-400 animate-float-slow hidden lg:block`}
          style={{ 
            animationDelay: delay,
            transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`,
            transition: 'transform 0.4s ease-out'
          }}
        >
          <Icon className={size} strokeWidth={1.5} />
        </div>
      ))}

      {/* Glowing orbs */}
      <div 
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 dark:bg-emerald-500/15 rounded-full blur-[150px] pointer-events-none animate-pulse-slow"
        style={{ 
          transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
          transition: 'transform 0.6s ease-out'
        }}
      />
      <div 
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"
        style={{ 
          transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
          transition: 'transform 0.6s ease-out'
        }}
      />

      {/* Main content - Split layout */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-16 lg:py-0">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-16 items-center min-h-[85vh]">
          
          {/* Left side - Headlines and CTA (7 cols) */}
          <div className="lg:col-span-7 order-2 lg:order-1 text-center lg:text-left">
            {/* Logo - mobile/tablet only */}
            <div className="mb-6 animate-fade-in lg:hidden">
              <Image 
                src="/logo.png" 
                alt="CyberShepherd" 
                width={100} 
                height={100} 
                className="mx-auto drop-shadow-lg"
              />
            </div>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-8 animate-fade-in-up hero-stagger-1 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Your guide in the wolf-filled web
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight font-heading leading-[1.05] mb-6 animate-fade-in-up hero-stagger-2">
              <span className="text-zinc-900 dark:text-white block mb-1">Silence the</span>
              <span 
                className="inline-block text-transparent bg-clip-text animate-gradient-text"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #f97316, #ef4444)',
                  backgroundSize: '200% 100%',
                }}
              >
                Noise
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-zinc-700 dark:text-zinc-300 leading-relaxed mb-2 animate-fade-in-up hero-stagger-3 font-medium">
              CyberShepherd guards your flock from the wolves.
            </p>
            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8 animate-fade-in-up hero-stagger-4">
              AI-filtered security news tailored to <span className="text-emerald-600 dark:text-emerald-400 font-semibold">your</span> tech stack.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Summarized. Verified. Delivered.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-5 mb-8 animate-fade-in-up hero-stagger-5">
              {[
                { icon: Shield, value: "500+", label: "analyzed" },
                { icon: Zap, value: "95%", label: "filtered" },
                { icon: Clock, value: "2min", label: "reads" },
              ].map(({ icon: Icon, value, label }, i) => (
                <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/60 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm group hover:border-emerald-500/30 transition-all">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <span className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">{value}</span>
                    <span className="text-xs sm:text-sm text-zinc-500 ml-1">{label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 animate-fade-in-up hero-stagger-6">
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className="h-12 sm:h-14 px-7 sm:px-8 text-base sm:text-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02] group border-0"
                >
                  Enter the Fold
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 sm:h-14 px-7 sm:px-8 text-base sm:text-lg border-zinc-300 dark:border-zinc-600 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500 transition-all"
                onClick={() => document.getElementById('pain-points')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>

            {/* Trust line */}
            <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500 animate-fade-in-up hero-stagger-7">
              100% free • No signup required • Sources from The Hacker News
            </p>
          </div>

          {/* Right side - Live Feed + Visual (5 cols) */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col items-center">
            {/* Logo with glow effect - desktop only */}
            <div className="hidden lg:flex mb-6 justify-center relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full scale-[2]" />
              <Image 
                src="/logo.png" 
                alt="CyberShepherd" 
                width={130} 
                height={130} 
                className="relative drop-shadow-2xl animate-float-slow"
              />
            </div>
            
            {/* Live Vulnerability Feed */}
            <div className="w-full max-w-md animate-fade-in-up hero-stagger-3">
              <div className="flex items-center justify-center gap-2.5 text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="tracking-wider">LIVE THREAT FEED</span>
              </div>
              
              <div className="space-y-2 relative p-1">
                {/* Decorative border glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-transparent to-cyan-500/20 rounded-2xl blur-xl pointer-events-none opacity-50" />
                
                {visibleVulns.map((vuln, index) => (
                  <div 
                    key={`${vuln.id}-${index}`}
                    className={`
                      relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl 
                      bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md
                      border border-zinc-200 dark:border-zinc-700/80 
                      shadow-sm hover:shadow-md
                      text-left transition-all duration-500 
                      hover:border-emerald-500/40 hover:bg-white dark:hover:bg-zinc-800
                      ${index === 0 ? 'animate-slide-in-scale ring-1 ring-emerald-500/20' : ''}
                    `}
                    style={{ 
                      opacity: 1 - index * 0.12,
                      transform: `scale(${1 - index * 0.015})`,
                    }}
                  >
                    {/* Severity indicator with glow */}
                    <div className={`relative flex-shrink-0 w-2 h-2 rounded-full ${
                      vuln.severity === 'CRITICAL' ? 'bg-red-500' :
                      vuln.severity === 'HIGH' ? 'bg-orange-500' : 
                      'bg-yellow-500'
                    }`}>
                      {vuln.severity === 'CRITICAL' && (
                        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                      )}
                    </div>
                    
                    {/* Severity badge */}
                    <span className={`text-[10px] sm:text-[11px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-md ${
                      vuln.severity === 'CRITICAL' ? 'bg-red-500/15 text-red-600 dark:text-red-400' :
                      vuln.severity === 'HIGH' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' :
                      'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {vuln.severity}
                    </span>
                    
                    {/* CVE */}
                    <span className="hidden sm:inline text-[11px] font-mono text-zinc-400 dark:text-zinc-500">{vuln.cve}</span>
                    
                    {/* Title */}
                    <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 truncate flex-1 font-medium">{vuln.title}</span>
                    
                    {/* Tech tag */}
                    <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-500/20 hidden sm:inline">{vuln.tech}</span>
                    
                    {/* Time */}
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap font-mono">{vuln.time}</span>
                  </div>
                ))}
                
                {/* Gradient fade at bottom */}
                <div className="absolute -bottom-1 left-0 right-0 h-8 bg-gradient-to-t from-zinc-100 dark:from-zinc-950 via-zinc-100/80 dark:via-zinc-950/80 to-transparent pointer-events-none z-10 rounded-b-xl" />
              </div>
              
              {/* Feed footer */}
              <div className="mt-4 text-center">
                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                  Scanning 10,000+ sources in real-time
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-6 h-10 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex items-start justify-center p-2 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm">
          <div className="w-1 h-2 bg-emerald-500 rounded-full animate-scroll-indicator" />
        </div>
      </div>

      {/* Corner decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/5 via-emerald-500/2 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-500/5 via-cyan-500/2 to-transparent pointer-events-none" />
    </section>
  );
}
