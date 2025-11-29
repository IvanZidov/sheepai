import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Cpu, Building2, Tag, Globe } from "lucide-react";
import { Region } from "@/lib/types";

interface MetaTagsProps {
  technologies?: string[];
  companies?: string[];
  topics?: string[];
  regions?: Region[];
}

export function MetaTags({ technologies, companies, topics, regions }: MetaTagsProps) {
  const sections = [
    {
      items: technologies,
      icon: Cpu,
      label: "Technologies",
      color: "text-blue-500 border-blue-500/30 bg-blue-500/10",
    },
    {
      items: companies,
      icon: Building2,
      label: "Companies",
      color: "text-purple-500 border-purple-500/30 bg-purple-500/10",
    },
    {
      items: topics,
      icon: Tag,
      label: "Related Topics",
      color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
    },
  ].filter(s => s.items && s.items.length > 0);

  const hasRegions = regions && regions.length > 0;

  if (sections.length === 0 && !hasRegions) return null;

  return (
    <div className="space-y-4">
      {sections.map(({ items, icon: Icon, label, color }) => (
        <div key={label} className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            {label}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {items!.map((item, i) => (
              <Badge
                key={i}
                variant="outline"
                className={cn(
                  "text-[10px] px-2 py-0.5 font-mono hover:scale-105 transition-transform cursor-default",
                  color
                )}
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      ))}

      {hasRegions && (
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Affected Regions
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {regions!.map((region, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[10px] px-2 py-0.5 font-mono text-amber-500 border-amber-500/30 bg-amber-500/10 hover:scale-105 transition-transform cursor-default"
              >
                <span className="mr-1">{region.flag}</span>
                {region.region}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

