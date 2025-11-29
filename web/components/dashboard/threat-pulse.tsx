import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowUp, TrendingUp } from "lucide-react";

export function ThreatPulse() {
  return (
    <Card className="bg-card border-border backdrop-blur-sm">
        <CardHeader className="p-4 pb-2 border-b border-border/50">
           <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
              <Activity className="w-4 h-4 text-emerald-500" />
              Threat Pulse
           </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">Ransomware</span>
                    <div className="flex items-center text-red-500 text-xs font-bold">
                        <ArrowUp className="w-3 h-3 mr-0.5" />
                        40%
                    </div>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-[70%] rounded-full" />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">Supply Chain</span>
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                        <ArrowUp className="w-3 h-3 mr-0.5" />
                        12%
                    </div>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[45%] rounded-full" />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">Zero-Day</span>
                    <div className="flex items-center text-emerald-500 text-xs font-bold">
                        <span className="text-muted-foreground font-normal mr-1">Stable</span>
                        0%
                    </div>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[10%] rounded-full" />
                </div>
            </div>
        </CardContent>
    </Card>
  );
}

export function TrendingTags() {
    return (
        <Card className="bg-card border-border backdrop-blur-sm mt-6">
            <CardHeader className="p-4 pb-2 border-b border-border/50">
               <CardTitle className="text-sm font-medium flex items-center gap-2 text-card-foreground">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Trending
               </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                    {["#Log4j", "#Python", "#AWS", "#Kubernetes", "#Lazarus", "#NPM", "#ZeroDay"].map((tag, i) => (
                        <span 
                            key={tag} 
                            className={`
                                text-xs px-2 py-1 rounded border cursor-pointer transition-colors
                                ${i < 3 ? "bg-muted text-foreground border-border hover:border-primary/50" : "bg-card text-muted-foreground border-border hover:border-border/80"}
                            `}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
