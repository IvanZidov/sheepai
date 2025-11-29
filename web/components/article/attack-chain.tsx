"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";

export function AttackChain() {
  const chartRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const isDark = resolvedTheme === 'dark';
    
    mermaid.initialize({
      startOnLoad: true,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'monospace',
      themeVariables: isDark ? {
        primaryColor: '#10b981',
        primaryTextColor: '#fff',
        primaryBorderColor: '#064e3b',
        lineColor: '#71717a',
        secondaryColor: '#0d9488',
        tertiaryColor: '#1e293b',
      } : {
        primaryColor: '#10b981',
        primaryTextColor: '#000',
        primaryBorderColor: '#064e3b',
        lineColor: '#71717a',
        secondaryColor: '#ccfbf1',
        tertiaryColor: '#f0fdf4',
      }
    });
    
    if (chartRef.current) {
       // Mermaid contentLoaded doesn't re-render if already rendered. 
       // We might need to clear and re-insert content if we want dynamic switching,
       // but simpler is to just let it render once with the correct theme on load.
       // For full dynamic switching, we'd need to use mermaid.render() explicitly.
       chartRef.current.removeAttribute('data-processed');
       mermaid.contentLoaded();
    }
  }, [mounted, resolvedTheme]);

  const chart = `
    graph LR
    A[Attacker] -->|Injects Code| B(PyPI Package)
    B -->|User Installs| C{Setup Script}
    C -->|Executes| D[Download Payload]
    D -->|Exfiltrates| E[AWS Keys]
    style A fill:#ef4444,stroke:#7f1d1d,stroke-width:2px,color:#fff
    style E fill:#ef4444,stroke:#7f1d1d,stroke-width:2px,color:#fff
    style B fill:#f59e0b,stroke:#78350f,stroke-width:2px,color:#fff
  `;

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground font-heading">Attack Chain Visualization</h3>
      <div className="p-4 bg-muted/30 rounded-xl border border-border overflow-x-auto">
        <div className="mermaid flex justify-center" ref={chartRef}>
            {chart}
        </div>
      </div>
    </div>
  );
}
