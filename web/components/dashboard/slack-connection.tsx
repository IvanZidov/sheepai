"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Check, 
  X, 
  Hash,
  Lock,
  MessageSquare,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getSlackStatus, 
  getSlackInstallUrl, 
  getSlackChannels, 
  setSlackChannel, 
  disconnectSlack,
  SlackStatus,
  SlackChannel,
} from "@/lib/slack";
import { toast } from "sonner";

interface SlackConnectionProps {
  onStatusChange?: (connected: boolean) => void;
}

export function SlackConnection({ onStatusChange }: SlackConnectionProps) {
  const [status, setStatus] = useState<SlackStatus | null>(null);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [savingChannel, setSavingChannel] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const slackStatus = await getSlackStatus();
      setStatus(slackStatus);
      onStatusChange?.(slackStatus.connected);
      
      // If connected, fetch channels
      if (slackStatus.connected) {
        await fetchChannels();
      }
    } catch (err) {
      console.error("Failed to fetch Slack status:", err);
      setError("Failed to load Slack status");
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      setChannelsLoading(true);
      const channelList = await getSlackChannels();
      setChannels(channelList);
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      // Don't show error toast, just log it
    } finally {
      setChannelsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Check for callback params
    const params = new URLSearchParams(window.location.search);
    const slackParam = params.get("slack");
    
    if (slackParam === "connected") {
      toast.success("Slack connected successfully!");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (slackParam === "error") {
      const message = params.get("message") || "Connection failed";
      toast.error(`Slack connection failed: ${message}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleConnect = async () => {
    try {
      const url = await getSlackInstallUrl();
      window.location.href = url;
    } catch (err) {
      toast.error("Failed to start Slack connection");
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await disconnectSlack();
      setStatus({ connected: false });
      setChannels([]);
      onStatusChange?.(false);
      toast.success("Slack disconnected");
    } catch (err) {
      toast.error("Failed to disconnect Slack");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleChannelSelect = async (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;

    try {
      setSavingChannel(true);
      await setSlackChannel(channelId, channel.name);
      setStatus(prev => prev ? { ...prev, channel_id: channelId, channel_name: channel.name } : null);
      toast.success(`Channel set to #${channel.name}`);
    } catch (err) {
      toast.error("Failed to save channel");
    } finally {
      setSavingChannel(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/30">
        <CardContent className="flex items-center gap-4 py-6">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-500">{error}</span>
          <Button variant="outline" size="sm" onClick={fetchStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all",
      status?.connected && "border-[#4A154B]/30 bg-gradient-to-br from-[#4A154B]/5 to-transparent"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Slack Logo */}
            <div className={cn(
              "p-2 rounded-lg",
              status?.connected ? "bg-[#4A154B]/10" : "bg-muted"
            )}>
              <svg 
                viewBox="0 0 24 24" 
                className="w-5 h-5"
                fill="currentColor"
              >
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
            </div>
            <div>
              <CardTitle className="text-base">Slack Integration</CardTitle>
              <CardDescription className="text-xs">
                {status?.connected 
                  ? `Connected to ${status.team_name || 'workspace'}`
                  : "Receive alerts in your Slack workspace"
                }
              </CardDescription>
            </div>
          </div>
          
          {status?.connected && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600">
              <Check className="w-3 h-3 mr-1" /> Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!status?.connected ? (
          // Not connected - show connect button
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                What you&apos;ll get
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-emerald-500" />
                  Real-time alerts for subscribed filters
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-emerald-500" />
                  Weekly digests with top articles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-emerald-500" />
                  Rich formatted messages with key details
                </li>
              </ul>
            </div>
            
            <Button 
              onClick={handleConnect}
              className="w-full bg-[#4A154B] hover:bg-[#611f64] text-white"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-4 h-4 mr-2"
                fill="currentColor"
              >
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
              Add to Slack
              <ExternalLink className="w-3 h-3 ml-2 opacity-50" />
            </Button>
          </div>
        ) : (
          // Connected - show channel selector
          <div className="space-y-4">
            {/* Channel Selector */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                Notification Channel
              </Label>
              
              <Select
                value={status.channel_id || ""}
                onValueChange={handleChannelSelect}
                disabled={channelsLoading || savingChannel}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    channelsLoading 
                      ? "Loading channels..." 
                      : "Select a channel"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <span className="flex items-center gap-2">
                        {channel.is_private ? (
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <Hash className="w-3 h-3 text-muted-foreground" />
                        )}
                        {channel.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {status.channel_name && (
                <p className="text-xs text-muted-foreground">
                  Currently posting to <span className="font-medium">#{status.channel_name}</span>
                </p>
              )}
            </div>
            
            {/* Refresh & Disconnect */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchChannels}
                disabled={channelsLoading}
              >
                {channelsLoading ? (
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-2" />
                )}
                Refresh Channels
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                {disconnecting ? (
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                ) : (
                  <X className="w-3 h-3 mr-2" />
                )}
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

