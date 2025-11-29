"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Settings, Filter, Check, Pencil, BellRing, Lock } from "lucide-react";
import { useUserPreferences } from "@/lib/user-preferences";
import { createSubscription, updateSubscription, fetchSubscriptions, Subscription } from "@/lib/subscriptions";
import { getSlackStatus, SlackStatus } from "@/lib/slack";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

interface CreateSubscriptionDialogProps {
  editSubscription?: Subscription | null;
  onSaved?: () => void;
  triggerButton?: React.ReactNode;
}

export function CreateSubscriptionDialog({ 
  editSubscription = null, 
  onSaved,
  triggerButton 
}: CreateSubscriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"immediate" | "daily" | "weekly">("immediate");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [slackStatus, setSlackStatus] = useState<SlackStatus | null>(null);
  const [existingMatch, setExistingMatch] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingMatch, setCheckingMatch] = useState(true);
  
  const preferences = useUserPreferences();
  const isEditMode = !!editSubscription;

  // Combine techStack and technologyFilter for saving (both map to techStack in notifier)
  const activeTechFilters = useMemo(() => 
    [...new Set([...preferences.techStack, ...preferences.technologyFilter])],
    [preferences.techStack, preferences.technologyFilter]
  );

  // Check for existing match function
  const checkForExistingMatch = useCallback(async () => {
    setCheckingMatch(true);
    try {
      const subs = await fetchSubscriptions();
      
      // Find subscription with matching filters
      const match = subs.find(sub => {
        const subPriority = sub.filters.priority || sub.filters.priorityFilter || [];
        const subTechStack = sub.filters.techStack || [];
        const subEntities = sub.filters.targetedEntities || [];
        const subThreshold = sub.filters.alertThreshold || 0;
        
        // Compare arrays (order doesn't matter)
        const priorityMatch = 
          subPriority.length === preferences.priorityFilter.length &&
          subPriority.every((p: string) => preferences.priorityFilter.includes(p as any));
        
        // Compare with combined tech filters
        const techMatch = 
          subTechStack.length === activeTechFilters.length &&
          subTechStack.every((t: string) => activeTechFilters.includes(t));
        
        const entityMatch = 
          subEntities.length === preferences.targetedEntities.length &&
          subEntities.every((e: string) => preferences.targetedEntities.includes(e));
        
        const thresholdMatch = subThreshold === preferences.alertThreshold;
        
        return priorityMatch && techMatch && entityMatch && thresholdMatch;
      });
      
      setExistingMatch(match || null);
    } catch (error) {
      console.error("Error checking for existing match:", error);
      setExistingMatch(null);
    } finally {
      setCheckingMatch(false);
    }
  }, [preferences.priorityFilter, activeTechFilters, preferences.targetedEntities, preferences.alertThreshold]);

  // Check for existing match on mount and when filters change
  useEffect(() => {
    if (!editSubscription) {
      checkForExistingMatch();
    }
  }, [checkForExistingMatch, editSubscription]);

  // Reset form when dialog opens/closes or editSubscription changes
  useEffect(() => {
    if (open) {
      if (editSubscription) {
        // Edit mode - populate from existing subscription
        setName(editSubscription.name);
        setFrequency(editSubscription.frequency);
        setEmailEnabled(editSubscription.channels.includes("email"));
        setSlackEnabled(editSubscription.channels.includes("slack"));
      } else {
        // Create mode - generate default name
        const parts = [];
        if (preferences.priorityFilter.length > 0) parts.push(`${preferences.priorityFilter[0]}+`);
        if (activeTechFilters.length > 0) parts.push(activeTechFilters[0]);
        
        if (parts.length > 0) {
          setName(`${parts.join(" ")} Alerts`);
        } else {
          setName("My Feed Alerts");
        }
      }
    } else {
      // Reset on close
      setName("");
    }
  }, [open, editSubscription, preferences.priorityFilter, activeTechFilters]);

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
    setLoading(true);

    const channels = [];
    if (emailEnabled) channels.push("email");
    if (slackEnabled && slackStatus?.connected) channels.push("slack");

    // Use combined tech filters (technologyFilter + techStack) as techStack for the notifier
    const filtersToSave = {
      techStack: activeTechFilters,
      alertThreshold: preferences.alertThreshold,
      priority: preferences.priorityFilter,
      targetedEntities: preferences.targetedEntities,
    };

    if (isEditMode && editSubscription) {
      // Update existing subscription
      const result = await updateSubscription(editSubscription.id, {
        name,
        filters: filtersToSave,
        channels,
        frequency,
      });
      
      if (result) {
        toast.success("Subscription updated successfully!");
        setOpen(false);
        onSaved?.();
      } else {
        toast.error("Failed to update subscription.");
      }
    } else {
      // Create new subscription
      const sub = {
        name,
        filters: filtersToSave,
        channels,
        frequency,
        is_active: true
      };

      const result = await createSubscription(sub);
      
      if (result) {
        toast.success("Subscription created successfully!");
        setOpen(false);
        setName("");
        // Refresh the match check
        checkForExistingMatch();
        onSaved?.();
      } else {
        toast.error("Failed to create subscription.");
      }
    }
    
    setLoading(false);
  };

  // Filter count logic - include technologyFilter
  const hasFilters = 
    activeTechFilters.length > 0 || 
    preferences.priorityFilter.length > 0 || 
    preferences.targetedEntities.length > 0 || 
    preferences.alertThreshold > 0;

  // Dynamic button based on subscription state
  const renderTriggerButton = () => {
    if (triggerButton) return triggerButton;
    
    if (!user) {
        return (
            <Button 
              variant="outline" 
              className="gap-2 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push("/login");
              }}
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Login to Subscribe</span>
            </Button>
        );
    }
    
    if (existingMatch) {
      return (
        <Button 
          variant="outline" 
          className="gap-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
        >
          <BellRing className="h-4 w-4" />
          <span className="hidden sm:inline">Subscribed</span>
          <Check className="h-3 w-3" />
        </Button>
      );
    }
    
    return (
      <Button 
        variant="outline" 
        className="gap-2 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Subscribe to Filters</span>
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {renderTriggerButton()}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Subscription" : existingMatch ? "Manage Subscription" : "Create Alert Subscription"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update your subscription settings and filters."
              : existingMatch 
                ? "You already have a subscription for these filters."
                : "Receive notifications based on your current filters."
            }
          </DialogDescription>
        </DialogHeader>
        
        {/* Show existing match banner */}
        {!isEditMode && existingMatch && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-emerald-500/20">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-emerald-700 dark:text-emerald-400">
                  Already subscribed!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  &quot;{existingMatch.name}&quot; matches these filters.
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {existingMatch.channels.map(ch => (
                    <Badge key={ch} variant="secondary" className="text-xs">
                      {ch}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">
                    {existingMatch.frequency}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // Switch to edit mode for this subscription
                  setName(existingMatch.name);
                  setFrequency(existingMatch.frequency);
                  setEmailEnabled(existingMatch.channels.includes("email"));
                  setSlackEnabled(existingMatch.channels.includes("slack"));
                  setExistingMatch(null);
                }}
              >
                <Pencil className="w-3 h-3 mr-2" />
                Edit Subscription
              </Button>
            </div>
          </div>
        )}
        
        {/* Only show form if no existing match (or in edit mode) */}
        {(isEditMode || !existingMatch) && (
          <>
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

              {/* Filter Preview Section */}
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-2 border">
                <div className="flex items-center gap-2 font-medium text-muted-foreground mb-1">
                  <Filter className="w-3 h-3" />
                  {isEditMode ? "Filters (from current feed):" : "Filters to be saved:"}
                </div>
                
                {!hasFilters ? (
                  <div className="text-muted-foreground italic pl-5">
                    All articles (no active filters)
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pl-1">
                    {preferences.alertThreshold > 0 && (
                      <Badge variant="outline" className="bg-background">
                        Score {'>'}= {preferences.alertThreshold}
                      </Badge>
                    )}
                    {preferences.priorityFilter.map(p => (
                      <Badge key={p} variant="outline" className="bg-background border-red-200 text-red-600">
                        {p}
                      </Badge>
                    ))}
                    {activeTechFilters.map(t => (
                      <Badge key={t} variant="outline" className="bg-background border-purple-200 text-purple-600">
                        {t}
                      </Badge>
                    ))}
                    {preferences.targetedEntities.map(e => (
                      <Badge key={e} variant="outline" className="bg-background">
                        @{e}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {isEditMode && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Tip: Adjust filters on the dashboard, then save here.
                  </p>
                )}
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
              <Button onClick={handleSave} disabled={!name || loading}>
                {loading ? "Saving..." : isEditMode ? "Update Subscription" : "Save Subscription"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
