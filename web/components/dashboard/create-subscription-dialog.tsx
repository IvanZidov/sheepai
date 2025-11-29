"use client";

import { useState } from "react";
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
import { Bell, Plus } from "lucide-react";
import { useUserPreferences } from "@/lib/user-preferences";
import { createSubscription } from "@/lib/subscriptions";
import { toast } from "sonner";

export function CreateSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"immediate" | "daily" | "weekly">("immediate");
  const [emailEnabled, setEmailEnabled] = useState(true);
  
  const preferences = useUserPreferences();

  const handleSave = async () => {
    if (!name) return;

    const channels = [];
    if (emailEnabled) channels.push("email");

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

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
                id="email" 
                checked={emailEnabled} 
                onCheckedChange={(c) => setEmailEnabled(!!c)} 
            />
            <Label htmlFor="email" className="cursor-pointer font-normal">
                Send Email Notifications
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSave} disabled={!name}>Save Subscription</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

