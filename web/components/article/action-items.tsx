import { ActionItem } from "@/lib/types";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface ActionItemsProps {
  items: ActionItem[];
}

export function ActionItems({ items }: ActionItemsProps) {
  const getIcon = (priority: string) => {
    switch (priority) {
      case "immediate": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "soon": return <Clock className="w-4 h-4 text-warning" />;
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
      case "immediate": return "border-l-destructive bg-destructive/5";
      case "soon": return "border-l-warning bg-warning/5";
      default: return "border-l-emerald-500 bg-emerald-500/5";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground font-heading">Remediation Plan</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={`p-4 border border-border border-l-4 rounded-r-lg ${getBorder(item.priority)}`}>
            <div className="flex items-center gap-2 mb-1">
              {getIcon(item.priority)}
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{getLabel(item.priority)}</span>
            </div>
            <div className="font-medium text-foreground mb-1">{item.action}</div>
            <div className="text-xs text-muted-foreground font-mono">Assignee: {item.target_audience}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
