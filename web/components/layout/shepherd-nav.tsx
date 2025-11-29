"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function ShepherdNav() {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/article");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
        <div className="mr-4 flex items-center gap-3">
          <Link href="/" className="relative w-8 h-8 hover:opacity-80 transition-opacity">
             <Image 
               src="/logo.png" 
               alt="CyberShepherd Logo" 
               fill
               className="object-contain"
             />
          </Link>
          <Link href="/" className="font-heading font-bold text-xl tracking-tight flex items-center hover:opacity-80 transition-opacity">
            <span className="text-foreground">CYBER</span>
            <span className="text-primary">SHEPHERD</span>
          </Link>
          <Badge variant="secondary" className="text-[10px] h-5 ml-1 font-mono text-muted-foreground border-border bg-muted">BETA</Badge>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search could go here if needed global */}
          </div>
          
          <nav className="flex items-center gap-4">
             {isDashboard ? (
                 <>
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="text-sm font-medium hidden sm:inline-flex hover:text-primary hover:bg-primary/10 transition-colors">
                            Dashboard
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Bell className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Settings className="w-4 h-4" />
                    </Button>
                    <ThemeToggle />
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-green/20 to-brand-teal/20 border border-border ml-2 flex items-center justify-center text-brand-green cursor-pointer hover:bg-brand-green/20 transition-colors">
                        <User className="w-4 h-4" />
                    </div>
                 </>
             ) : (
                 <>
                    <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                        Features
                    </Link>
                    <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                        Pricing
                    </Link>
                    <ThemeToggle />
                    <Link href="/dashboard">
                        <Button variant="default" size="sm" className="ml-2">
                            Login
                        </Button>
                    </Link>
                 </>
             )}
          </nav>
        </div>
      </div>
    </header>
  );
}
