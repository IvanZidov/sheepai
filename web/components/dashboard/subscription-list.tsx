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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchSubscriptions, deleteSubscription, updateSubscription, Subscription } from "@/lib/subscriptions";
import { getSlackStatus, SlackStatus } from "@/lib/slack";
import { Trash2, Mail, Zap, Calendar, Pencil, Filter, Settings, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function SubscriptionList() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const load = async () => {
    const data = await fetchSubscriptions();
    setSubs(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
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

  const handleToggleActive = async (sub: Subscription) => {
    const result = await updateSubscription(sub.id, { is_active: !sub.is_active });
    if (result) {
      setSubs(prev => prev.map(s => s.id === sub.id ? { ...s, is_active: !s.is_active } : s));
      toast.success(sub.is_active ? "Subscription paused" : "Subscription activated");
    } else {
      toast.error("Failed to update subscription");
    }
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setEditDialogOpen(true);
  };

  const handleEditSaved = () => {
    setEditDialogOpen(false);
    setEditingSub(null);
    load(); // Refresh the list
  };

  if (loading) return <div className="text-muted-foreground text-sm">Loading subscriptions...</div>;

  if (subs.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
        No active subscriptions. Use &quot;Subscribe to Filters&quot; on the dashboard to create one.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subs.map((sub) => (
          <Card key={sub.id} className={`relative overflow-hidden ${!sub.is_active ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{sub.name}</CardTitle>
                <Badge 
                  variant={sub.is_active ? "outline" : "secondary"} 
                  className={`ml-2 cursor-pointer ${sub.is_active ? 'border-emerald-500/50 text-emerald-600' : ''}`}
                  onClick={() => handleToggleActive(sub)}
                >
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
                {sub.filters.alertThreshold && sub.filters.alertThreshold > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    Score≥{sub.filters.alertThreshold}
                  </Badge>
                )}
                {sub.filters.techStack?.map(t => (
                  <Badge key={t} variant="secondary" className="text-[10px] px-1 py-0">{t}</Badge>
                ))}
                {/* Handle both old (priorityFilter) and new (priority) keys */}
                {(sub.filters.priority || sub.filters.priorityFilter)?.map(p => (
                  <Badge key={p} variant="outline" className="text-[10px] px-1 py-0 border-red-200 text-red-600">{p}</Badge>
                ))}
                {sub.filters.targetedEntities?.map(e => (
                  <Badge key={e} variant="outline" className="text-[10px] px-1 py-0">@{e}</Badge>
                ))}
                {(!sub.filters.techStack?.length && 
                  !sub.filters.priority?.length && 
                  !sub.filters.priorityFilter?.length &&
                  !sub.filters.targetedEntities?.length &&
                  (!sub.filters.alertThreshold || sub.filters.alertThreshold === 0)) && (
                    <span className="text-muted-foreground italic text-xs">All articles</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs mt-2">
                <Mail className="w-3 h-3" />
                {sub.channels.join(", ")}
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-end gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleEdit(sub)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
                onClick={() => handleDelete(sub.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Subscription Dialog */}
      <EditSubscriptionDialog
        subscription={editingSub}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSaved={handleEditSaved}
      />
    </>
  );
}

// Edit Subscription Dialog Component
interface EditDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function EditSubscriptionDialog({ subscription, open, onOpenChange, onSaved }: EditDialogProps) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"immediate" | "daily" | "weekly">("immediate");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackStatus, setSlackStatus] = useState<SlackStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Populate form when subscription changes
  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setFrequency(subscription.frequency);
      setEmailEnabled(subscription.channels.includes("email"));
      setSlackEnabled(subscription.channels.includes("slack"));
    }
  }, [subscription]);

  // Fetch Slack status when dialog opens
  useEffect(() => {
    if (open) {
      getSlackStatus()
        .then(setSlackStatus)
        .catch(() => setSlackStatus({ connected: false }));
    }
  }, [open]);

  const handleSave = async () => {
    if (!subscription || !name) return;
    setLoading(true);

    const channels = [];
    if (emailEnabled) channels.push("email");
    if (slackEnabled && slackStatus?.connected) channels.push("slack");

    const result = await updateSubscription(subscription.id, {
      name,
      channels,
      frequency,
    });
    
    if (result) {
      toast.success("Subscription updated successfully!");
      onSaved();
    } else {
      toast.error("Failed to update subscription.");
    }
    
    setLoading(false);
  };

  if (!subscription) return null;

  // Get filters for display
  const priority = subscription.filters.priority || subscription.filters.priorityFilter || [];
  const techStack = subscription.filters.techStack || [];
  const entities = subscription.filters.targetedEntities || [];
  const threshold = subscription.filters.alertThreshold || 0;
  const hasFilters = priority.length > 0 || techStack.length > 0 || entities.length > 0 || threshold > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Update your notification settings for this subscription.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Subscription Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Critical Python Alerts"
            />
          </div>

          {/* Filter Preview Section (read-only) */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-2 border">
            <div className="flex items-center gap-2 font-medium text-muted-foreground mb-1">
              <Filter className="w-3 h-3" />
              Saved filters:
            </div>
            
            {!hasFilters ? (
              <div className="text-muted-foreground italic pl-5">
                All articles (no filters)
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 pl-1">
                {threshold > 0 && (
                  <Badge variant="outline" className="bg-background">
                    Score {'>'}= {threshold}
                  </Badge>
                )}
                {priority.map((p: string) => (
                  <Badge key={p} variant="outline" className="bg-background border-red-200 text-red-600">
                    {p}
                  </Badge>
                ))}
                {techStack.map((t: string) => (
                  <Badge key={t} variant="outline" className="bg-background">
                    {t}
                  </Badge>
                ))}
                {entities.map((e: string) => (
                  <Badge key={e} variant="outline" className="bg-background">
                    @{e}
                  </Badge>
                ))}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2 italic">
              To change filters: set them on the dashboard, then create a new subscription.
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate (As it happens)</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">Notification Channels</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-email" 
                checked={emailEnabled} 
                onCheckedChange={(c) => setEmailEnabled(!!c)} 
              />
              <Label htmlFor="edit-email" className="cursor-pointer font-normal">
                Email Notifications
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-slack" 
                checked={slackEnabled}
                disabled={!slackStatus?.connected}
                onCheckedChange={(c) => setSlackEnabled(!!c)} 
              />
              <Label 
                htmlFor="edit-slack" 
                className={`cursor-pointer font-normal flex items-center gap-2 ${!slackStatus?.connected ? 'text-muted-foreground' : ''}`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                </svg>
                Slack Notifications
                {slackStatus?.channel_name && (
                  <span className="text-xs text-muted-foreground">(#{slackStatus.channel_name})</span>
                )}
              </Label>
            </div>
            
            {!slackStatus?.connected && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Link href="/dashboard/settings?tab=notifications" className="text-primary hover:underline flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Connect Slack
                </Link>
                to enable Slack notifications
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name || loading}>
            {loading ? "Saving..." : "Update Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
