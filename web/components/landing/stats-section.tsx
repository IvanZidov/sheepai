"use client";

import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 12847, suffix: "+", label: "Articles filtered daily", duration: 2000 },
  { value: 99.9, suffix: "%", label: "Noise eliminated", duration: 1800 },
  { value: 2, suffix: " min", label: "Average read time", duration: 1200 },
  { value: 847, suffix: "+", label: "CVEs tracked this month", duration: 1600 },
];

function AnimatedCounter({ 
  value, 
  suffix, 
  duration,
  isVisible 
}: { 
  value: number; 
  suffix: string; 
  duration: number;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(value * easeOutQuart);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, isVisible]);

  const displayValue = value % 1 === 0 ? Math.floor(count) : count.toFixed(1);

  return (
    <span className="tabular-nums">
      {displayValue}{suffix}
    </span>
  );
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-zinc-950 to-background border-y border-zinc-800/50 relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(16,185,129,0.5) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                <AnimatedCounter 
                  value={stat.value} 
                  suffix={stat.suffix} 
                  duration={stat.duration}
                  isVisible={isVisible}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trust logos placeholder */}
        <div className="mt-16 pt-12 border-t border-zinc-800/50">
          <p className="text-center text-xs text-zinc-600 uppercase tracking-wider mb-8">
            Trusted by security teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {["TechCorp", "SecureBase", "CloudGuard", "DataShield", "NetProtect"].map((company) => (
              <div 
                key={company}
                className="text-zinc-700 hover:text-zinc-500 transition-colors text-lg font-semibold font-heading"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

