import { AffectedEntity } from "@/lib/types";
import { Building2, Cpu, Globe, Layers, Users } from "lucide-react";

interface AffectedEntitiesProps {
  entities: AffectedEntity[];
}

export function AffectedEntities({ entities }: AffectedEntitiesProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "company": return <Building2 className="w-3 h-3" />;
      case "product": return <Layers className="w-3 h-3" />;
      case "technology": return <Cpu className="w-3 h-3" />;
      case "region": return <Globe className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground font-heading">Affected Scope</h3>
      <div className="flex flex-wrap gap-2">
        {entities.map((entity, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-foreground">
            {getIcon(entity.entity_type)}
            <span className="font-medium">{entity.name}</span>
            {entity.details && <span className="text-muted-foreground text-xs border-l border-border pl-2 ml-1">{entity.details}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
