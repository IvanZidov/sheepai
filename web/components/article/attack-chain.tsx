"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

export function AttackChain() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'monospace',
      themeVariables: {
        primaryColor: '#10b981',
        primaryTextColor: '#fff',
        primaryBorderColor: '#064e3b',
        lineColor: '#71717a',
        secondaryColor: '#0d9488',
        tertiaryColor: '#1e293b',
      }
    });
    
    if (chartRef.current) {
      mermaid.contentLoaded();
    }
  }, []);

  const chart = `
    graph LR
    A[Attacker] -->|Injects Code| B(PyPI Package)
    B -->|User Installs| C{Setup Script}
    C -->|Executes| D[Download Payload]
    D -->|Exfiltrates| E[AWS Keys]
    style A fill:#ef4444,stroke:#7f1d1d,stroke-width:2px
    style E fill:#ef4444,stroke:#7f1d1d,stroke-width:2px
    style B fill:#f59e0b,stroke:#78350f,stroke-width:2px
  `;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white font-heading">Attack Chain Visualization</h3>
      <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 overflow-x-auto">
        <div className="mermaid flex justify-center" ref={chartRef}>
            {chart}
        </div>
      </div>
    </div>
  );
}

