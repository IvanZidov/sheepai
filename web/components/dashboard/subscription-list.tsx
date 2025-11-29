"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchSubscriptions, deleteSubscription, Subscription } from "@/lib/subscriptions";
import { Trash2, Mail, Zap, Calendar } from "lucide-react";
import { toast } from "sonner";

export function SubscriptionList() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const data = await fetchSubscriptions();
    setSubs(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Poll for updates or re-fetch when dialog closes? 
    // Ideally use a global state or context, but for now simple fetch on mount.
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
        const success = await deleteSubscription(id);
        if (success) {
            setSubs(prev => prev.filter(s => s.id !== id));
            toast.success("Subscription deleted");
        } else {
            toast.error("Failed to delete");
        }
    }
  };

  if (loading) return <div className="text-muted-foreground text-sm">Loading subscriptions...</div>;

  if (subs.length === 0) {
    return (
        <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
            No active subscriptions.
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {subs.map((sub) => (
        <Card key={sub.id} className="relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
                <CardTitle className="text-base">{sub.name}</CardTitle>
                <Badge variant={sub.is_active ? "outline" : "secondary"} className="ml-2">
                    {sub.is_active ? "Active" : "Paused"}
                </Badge>
            </div>
            <CardDescription className="text-xs flex items-center gap-2">
                {sub.frequency === "immediate" ? <Zap className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                {sub.frequency === "immediate" ? "Immediate Alerts" : "Weekly Digest"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3 text-sm space-y-2">
            <div className="flex flex-wrap gap-1">
                {sub.filters.techStack?.map(t => (
                    <Badge key={t} variant="secondary" className="text-[10px] px-1 py-0">{t}</Badge>
                ))}
                {sub.filters.priorityFilter?.map(p => (
                    <Badge key={p} variant="outline" className="text-[10px] px-1 py-0 border-red-200 text-red-600">{p}</Badge>
                ))}
                {(!sub.filters.techStack?.length && !sub.filters.priorityFilter?.length) && (
                    <span className="text-muted-foreground italic text-xs">All articles</span>
                )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs mt-2">
                <Mail className="w-3 h-3" />
                {sub.channels.join(", ")}
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex justify-end">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(sub.id)}>
                <Trash2 className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

