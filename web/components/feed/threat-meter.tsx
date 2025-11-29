"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ThreatMeterProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ThreatMeter({ score, size = "md", className }: ThreatMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score on mount
    const duration = 1000; // 1s
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedScore(Math.floor(score * easeProgress));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const getLevel = (s: number) => {
    if (s >= 80) return { label: "CRITICAL", color: "text-red-500", fill: "#ef4444" };
    if (s >= 50) return { label: "MEDIUM", color: "text-amber-500", fill: "#f59e0b" };
    return { label: "LOW", color: "text-emerald-500", fill: "#10b981" };
  };

  const { label, color, fill } = getLevel(score);

  // Calculate gauge path
  // Semi-circle is 180 degrees
  const radius = 40;
  const strokeWidth = 8;
  const center = 50;
  const circumference = Math.PI * radius; // Half circle circumference
  
  // 100 score = 100% of semi-circle
  const offset = circumference - (animatedScore / 100) * circumference;

  const sizeClasses = {
    sm: "w-24 h-14",
    md: "w-32 h-20",
    lg: "w-40 h-24",
  };

  return (
    <div className={cn("relative flex flex-col items-center justify-end", sizeClasses[size], className)}>
      {/* SVG Gauge */}
      <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
        {/* Background Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#27272a" // Zinc 800
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Progress Arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={fill}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-75 ease-out"
        />
        
        {/* Score Text */}
        <text
          x="50"
          y="45"
          textAnchor="middle"
          className="text-[14px] font-bold fill-current font-mono"
          style={{ fill: 'currentColor' }}
        >
          {animatedScore}/100
        </text>
      </svg>
      
      {/* Label */}
      <div className={cn("text-xs font-bold tracking-wider mt-1 font-mono", color)}>
        {label}
      </div>
    </div>
  );
}

