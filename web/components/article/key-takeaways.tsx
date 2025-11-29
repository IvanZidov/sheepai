import { KeyTakeaway } from "@/lib/types";
import { Lightbulb, Code, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyTakeawaysProps {
  items: KeyTakeaway[];
}

export function KeyTakeaways({ items }: KeyTakeawaysProps) {
  if (!items?.length) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground font-heading flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        Key Takeaways
      </h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg border transition-colors",
              item.highlight
                ? "bg-primary/5 border-primary/30"
                : "bg-muted/30 border-border"
            )}
          >
            <div
              className={cn(
                "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                item.highlight
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </div>
            <div className="flex-1 space-y-1">
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  item.highlight
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item.point}
              </p>
              {item.is_technical && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-primary/70 uppercase tracking-wider">
                  <Code className="w-3 h-3" />
                  Technical
                </div>
              )}
            </div>
            {item.highlight && (
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

