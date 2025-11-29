"use client";

import { useUserPreferences } from "@/lib/user-preferences";
import { Slider } from "@/components/ui/slider";

export function AlertThreshold() {
  const { alertThreshold, setThreshold } = useUserPreferences();

  const getColor = (val: number) => {
    if (val >= 80) return "text-red-500";
    if (val >= 50) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className="space-y-4 py-4 border-t border-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Alert Threshold</h3>
        <span className={`font-mono text-xs font-bold ${getColor(alertThreshold)}`}>
          {alertThreshold}+ SCORE
        </span>
      </div>
      
      <Slider 
        defaultValue={[alertThreshold]} 
        max={100} 
        step={1}
        onValueChange={(vals) => setThreshold(vals[0])}
        className="py-2"
      />
      
      <p className="text-xs text-zinc-500">
        You will only receive notifications for threats with a relevance score above {alertThreshold}.
      </p>
    </div>
  );
}

