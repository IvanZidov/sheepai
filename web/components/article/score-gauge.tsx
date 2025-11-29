"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number; // 1-10
  label: string;
  variant?: "primary" | "success" | "warning";
  className?: string;
}

export function ScoreGauge({ score, label, variant = "primary", className }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 800;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedScore(score * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const percentage = (animatedScore / 10) * 100;

  const variantColors = {
    primary: {
      fill: "stroke-primary",
      text: "text-primary",
      bg: "bg-primary/10",
    },
    success: {
      fill: "stroke-emerald-500",
      text: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    warning: {
      fill: "stroke-amber-500",
      text: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  };

  const colors = variantColors[variant];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            className="stroke-muted"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            className={cn(colors.fill, "transition-all duration-75")}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 0.88} 100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-lg font-bold font-mono", colors.text)}>
            {Math.round(animatedScore)}
          </span>
        </div>
      </div>
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1.5">
        {label}
      </span>
    </div>
  );
}

