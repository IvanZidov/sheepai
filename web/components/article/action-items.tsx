import { ActionItem } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface ActionItemsProps {
  items: ActionItem[];
}

export function ActionItems({ items }: ActionItemsProps) {
  const getIcon = (priority: string) => {
    switch (priority) {
      case "immediate": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "soon": return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getLabel = (priority: string) => {
    switch (priority) {
      case "immediate": return "IMMEDIATE ACTION REQUIRED";
      case "soon": return "PLAN FOR PATCHING";
      default: return "WHEN POSSIBLE";
    }
  };

  const getBorder = (priority: string) => {
    switch (priority) {
      case "immediate": return "border-l-red-500 bg-red-500/5";
      case "soon": return "border-l-amber-500 bg-amber-500/5";
      default: return "border-l-emerald-500 bg-emerald-500/5";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white font-heading">Remediation Plan</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={`p-4 border border-zinc-800 border-l-4 rounded-r-lg ${getBorder(item.priority)}`}>
            <div className="flex items-center gap-2 mb-1">
              {getIcon(item.priority)}
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{getLabel(item.priority)}</span>
            </div>
            <div className="font-medium text-zinc-200 mb-1">{item.action}</div>
            <div className="text-xs text-zinc-500 font-mono">Assignee: {item.target_audience}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

