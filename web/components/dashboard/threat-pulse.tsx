import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowUp, TrendingUp } from "lucide-react";

export function ThreatPulse() {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardHeader className="p-4 pb-2 border-b border-zinc-800/50">
           <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Threat Pulse
           </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-zinc-200">Ransomware</span>
                    <div className="flex items-center text-red-400 text-xs font-bold">
                        <ArrowUp className="w-3 h-3 mr-0.5" />
                        40%
                    </div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-[70%] rounded-full" />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-zinc-200">Supply Chain</span>
                    <div className="flex items-center text-amber-400 text-xs font-bold">
                        <ArrowUp className="w-3 h-3 mr-0.5" />
                        12%
                    </div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[45%] rounded-full" />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-zinc-200">Zero-Day</span>
                    <div className="flex items-center text-emerald-400 text-xs font-bold">
                        <span className="text-zinc-500 font-normal mr-1">Stable</span>
                        0%
                    </div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[10%] rounded-full" />
                </div>
            </div>
        </CardContent>
    </Card>
  );
}

export function TrendingTags() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm mt-6">
            <CardHeader className="p-4 pb-2 border-b border-zinc-800/50">
               <CardTitle className="text-sm font-medium flex items-center gap-2">
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
                                ${i < 3 ? "bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-500" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"}
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

