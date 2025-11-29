/**
 * Slack Integration API Helpers
 * Handles Slack OAuth status, channel management, and connection.
 */

import { supabase } from "./supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SlackStatus {
  connected: boolean;
  team_name?: string;
  channel_name?: string;
  channel_id?: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
}

/**
 * Get the Supabase auth token for API calls
 */
async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Get the current user's Slack connection status
 */
export async function getSlackStatus(): Promise<SlackStatus> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/slack/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Slack status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get the URL to start Slack OAuth flow
 */
export async function getSlackInstallUrl(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  return `${API_URL}/slack/install?user_id=${user.id}`;
}

/**
 * Get available Slack channels for the user
 */
export async function getSlackChannels(): Promise<SlackChannel[]> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/slack/channels`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to get channels: ${response.status}`);
  }

  const data = await response.json();
  return data.channels;
}

/**
 * Set the selected channel for notifications
 */
export async function setSlackChannel(
  channelId: string,
  channelName: string
): Promise<void> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/slack/channel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      channel_id: channelId,
      channel_name: channelName,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to set channel: ${response.status}`);
  }
}

/**
 * Disconnect Slack integration
 */
export async function disconnectSlack(): Promise<void> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_URL}/slack/disconnect`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to disconnect: ${response.status}`);
  }
}

