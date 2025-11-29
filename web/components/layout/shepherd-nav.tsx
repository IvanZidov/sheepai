import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function ShepherdNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
        <div className="mr-4 flex items-center gap-3">
          <div className="relative w-8 h-8">
             <Image 
               src="/logo.png" 
               alt="CyberShepherd Logo" 
               fill
               className="object-contain"
             />
          </div>
          <div className="font-heading font-bold text-xl tracking-tight flex items-center">
            <span className="text-zinc-100">CYBER</span>
            <span className="text-brand-green">SHEPHERD</span>
          </div>
          <Badge variant="secondary" className="text-[10px] h-5 ml-1 font-mono text-muted-foreground border-zinc-800 bg-zinc-900">BETA</Badge>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or pulse indicator could go here */}
          </div>
          <nav className="flex items-center gap-2">
             <Button variant="ghost" size="sm" className="text-sm font-medium hidden sm:inline-flex hover:text-primary hover:bg-primary/10 transition-colors">
                Pulse Feed
             </Button>
             <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hidden sm:inline-flex hover:text-primary hover:bg-primary/10 transition-colors">
                Threat Map
             </Button>
             <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-green/20 to-brand-teal/20 border border-zinc-700 ml-2 ring-offset-background" />
          </nav>
        </div>
      </div>
    </header>
  );
}
