import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ShepherdNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
        <div className="mr-4 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary fill-primary/20" />
          <span className="font-bold text-lg tracking-tight">
            CyberShepherd
          </span>
          <Badge variant="secondary" className="text-[10px] h-5 ml-2 font-mono text-muted-foreground border-zinc-800 bg-zinc-900">BETA</Badge>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or pulse indicator could go here */}
          </div>
          <nav className="flex items-center gap-2">
             <Button variant="ghost" size="sm" className="text-sm font-medium hidden sm:inline-flex">
                Pulse Feed
             </Button>
             <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hidden sm:inline-flex">
                Threat Map
             </Button>
             <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-zinc-700 ml-2 ring-offset-background" />
          </nav>
        </div>
      </div>
    </header>
  );
}

