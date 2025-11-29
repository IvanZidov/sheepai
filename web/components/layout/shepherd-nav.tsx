"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, User, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ShepherdNav() {
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/article");

  // Get user initials or icon
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";
  const userImage = user?.user_metadata?.avatar_url;

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
             {user ? (
                 <>
                    <Link href="/dashboard">
                        <Button variant={isDashboard ? "secondary" : "ghost"} size="sm" className="text-sm font-medium hidden sm:inline-flex transition-colors">
                            Dashboard
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Bell className="w-4 h-4" />
                    </Button>
                    <ThemeToggle />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-green/20 to-brand-teal/20 border border-border ml-2 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden">
                            {userImage ? (
                               <img src={userImage} alt="User" className="w-full h-full object-cover" />
                            ) : (
                               <span className="text-xs font-medium text-brand-green">{userInitials}</span>
                            )}
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-100/10">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                 </>
             ) : (
                 <>
                    <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                        Dashboard
                    </Link>
                    <ThemeToggle />
                    {!isLoading && (
                        <Link href="/login">
                            <Button variant="default" size="sm" className="ml-2">
                                Login
                            </Button>
                        </Link>
                    )}
                 </>
             )}
          </nav>
        </div>
      </div>
    </header>
  );
}
