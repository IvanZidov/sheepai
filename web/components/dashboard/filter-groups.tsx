"use client";

import { useUserPreferences, DateRange } from "@/lib/user-preferences";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Priority } from "@/lib/types";
import { Calendar, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CollapsibleFilter } from "@/components/dashboard/collapsible-filter";

export function FilterGroups() {
  const { 
    priorityFilter, togglePriority,
    dateRange, setDateRange 
  } = useUserPreferences();

  const priorities: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
  
  const dateOptions: { value: DateRange, label: string }[] = [
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "all", label: "All Time" },
  ];

  return (
    <div className="space-y-6">
      {/* Priority Filter */}
      <CollapsibleFilter 
        title="Severity Level" 
        icon={ShieldAlert}
        badge={priorityFilter.length > 0 ? (
           <Badge 
             variant="secondary" 
             className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer h-5" 
             onClick={(e) => {
               e.stopPropagation();
               priorities.forEach(p => priorityFilter.includes(p) && togglePriority(p));
             }}
           >
             Clear
           </Badge>
        ) : undefined}
      >
        <div className="space-y-2">
          {priorities.map((p) => (
            <div key={p} className="flex items-center space-x-2">
              <Checkbox 
                id={`p-${p}`}
                checked={priorityFilter.includes(p)}
                onCheckedChange={() => togglePriority(p)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label 
                htmlFor={`p-${p}`} 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground hover:text-foreground cursor-pointer flex-1 flex justify-between"
              >
                {p}
              </Label>
            </div>
          ))}
        </div>
      </CollapsibleFilter>

      {/* Date Filter */}
      <CollapsibleFilter title="Time Range" icon={Calendar}>
        <div className="space-y-1">
          {dateOptions.map((opt) => (
            <div 
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={cn(
                "text-sm px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                dateRange === opt.value 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </CollapsibleFilter>
    </div>
  );
}
