"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CollapsibleFilterProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  badge?: React.ReactNode;
}

export function CollapsibleFilter({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  className,
  badge
}: CollapsibleFilterProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("space-y-2", className)}>
      <Button 
        variant="ghost" 
        className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent hover:text-primary group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {badge}
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </Button>
      
      {isOpen && (
        <div className="animate-in slide-in-from-top-1 fade-in duration-200 pl-1">
          {children}
        </div>
      )}
    </div>
  );
}

