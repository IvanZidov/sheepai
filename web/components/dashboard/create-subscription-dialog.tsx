"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Bell, Plus, Settings } from "lucide-react";
import { useUserPreferences } from "@/lib/user-preferences";
import { createSubscription } from "@/lib/subscriptions";
import { getSlackStatus, SlackStatus } from "@/lib/slack";
import { toast } from "sonner";
import Link from "next/link";

export function CreateSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"immediate" | "daily" | "weekly">("immediate");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackStatus, setSlackStatus] = useState<SlackStatus | null>(null);
  
  const preferences = useUserPreferences();

  // Fetch Slack status when dialog opens
  useEffect(() => {
    if (open) {
      getSlackStatus()
        .then(setSlackStatus)
        .catch(() => setSlackStatus({ connected: false }));
    }
  }, [open]);

  const handleSave = async () => {
    if (!name) return;

    const channels = [];
    if (emailEnabled) channels.push("email");
    if (slackEnabled && slackStatus?.connected) channels.push("slack");

    const sub = {
        name,
        filters: {
            techStack: preferences.techStack,
            alertThreshold: preferences.alertThreshold,
            searchQuery: preferences.searchQuery,
            priorityFilter: preferences.priorityFilter,
            targetedEntities: preferences.targetedEntities,
        },
        channels,
        frequency,
        is_active: true
    };

    const result = await createSubscription(sub);
    
    if (result) {
        toast.success("Subscription created successfully!");
        setOpen(false);
        setName("");
    } else {
        toast.error("Failed to create subscription. Try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Subscribe to Filters</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Alert Subscription</DialogTitle>
          <DialogDescription>
            Receive notifications based on your current filters.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Subscription Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Critical Python Alerts"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="immediate">Immediate (As it happens)</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                    {/* Daily not implemented in backend yet for this plan */}
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">Notification Channels</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                  id="email" 
                  checked={emailEnabled} 
                  onCheckedChange={(c) => setEmailEnabled(!!c)} 
              />
              <Label htmlFor="email" className="cursor-pointer font-normal">
                  Email Notifications
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                  id="slack" 
                  checked={slackEnabled}
                  disabled={!slackStatus?.connected}
                  onCheckedChange={(c) => setSlackEnabled(!!c)} 
              />
              <Label 
                htmlFor="slack" 
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
                <Link href="/dashboard/settings?tab=integrations" className="text-primary hover:underline flex items-center gap-1">
                  <Settings className="w-3 h-3" />
                  Connect Slack in Settings
                </Link>
                to enable Slack notifications
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave} disabled={!name}>Save Subscription</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

