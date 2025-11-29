import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VerificationStatus } from "@/lib/types";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  status: VerificationStatus;
  note?: string;
  className?: string;
}

export function TrustBadge({ status, note, className }: TrustBadgeProps) {
  const config = {
    VERIFIED: {
      icon: ShieldCheck,
      text: "Verified Source",
      color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20",
    },
    UNVERIFIED: {
      icon: AlertTriangle,
      text: "Unverified",
      color: "text-amber-500 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20",
    },
    DISPUTED: {
      icon: XCircle,
      text: "Disputed",
      color: "text-red-500 border-red-500/20 bg-red-500/10 hover:bg-red-500/20",
    },
  };

  const { icon: Icon, text, color } = config[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn("gap-1.5 py-1 pl-1 pr-2.5 transition-all cursor-help", color, className)}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{text}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-popover border-border">
          <p className="font-semibold mb-1 text-sm text-popover-foreground">Gemini Fact Check</p>
          <p className="text-xs text-muted-foreground">{note || "No details available."}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
