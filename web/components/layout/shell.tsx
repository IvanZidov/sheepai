import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode; // Feed
  filters?: React.ReactNode; // Left Sidebar
  visuals?: React.ReactNode; // Right Sidebar
  className?: string;
}

export function DashboardShell({ children, filters, visuals, className }: DashboardShellProps) {
  return (
    <div className={cn("container max-w-screen-2xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 py-6", className)}>
      
      {/* Left Sidebar: Filters & Navigation */}
      <aside className="hidden lg:block sticky top-20 h-[calc(100vh-7rem)]">
        <ScrollArea className="h-full pr-4">
          {filters}
        </ScrollArea>
      </aside>

      {/* Main Feed */}
      <main className="min-w-0 space-y-6">
        {children}
      </main>
    </div>
  );
}

