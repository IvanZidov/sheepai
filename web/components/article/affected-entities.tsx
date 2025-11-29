import { AffectedEntity } from "@/lib/types";
import { Building2, Cpu, Globe, Layers, Users } from "lucide-react";

interface AffectedEntitiesProps {
  entities: AffectedEntity[];
}

export function AffectedEntities({ entities }: AffectedEntitiesProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "company": return <Building2 className="w-4 h-4" />;
      case "product": return <Layers className="w-4 h-4" />;
      case "technology": return <Cpu className="w-4 h-4" />;
      case "region": return <Globe className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  if (!entities?.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground font-heading">Affected Scope</h3>
      <div className="flex flex-col gap-3">
        {entities.map((entity, i) => (
          <div 
            key={i} 
            className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="mt-0.5 p-2 rounded-lg bg-background border border-border text-muted-foreground shrink-0">
              {getIcon(entity.entity_type)}
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="font-medium text-sm text-foreground break-words">
                {entity.name}
              </div>
              {entity.details && (
                <div className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-2">
                  {entity.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
