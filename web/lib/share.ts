/**
 * Share API Helpers
 * Handles sharing articles via Email and Slack.
 */

import { supabase } from "./supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ShareEmailRequest {
  article_id: string;
  recipient_emails: string[];
  personal_message?: string;
}

export interface ShareSlackRequest {
  article_id: string;
  personal_message?: string;
}

export interface ShareResponse {
  success: boolean;
  message: string;
}

export interface SlackShareStatus {
  can_share: boolean;
  channel_name: string | null;
}

/**
 * Get the Supabase auth token for API calls
 */
async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Share an article via email
 */
export async function shareViaEmail(
  request: ShareEmailRequest
): Promise<ShareResponse> {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}/share/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to share: ${response.status}`);
  }

  return response.json();
}

/**
 * Share an article via Slack
 */
export async function shareViaSlack(
  request: ShareSlackRequest
): Promise<ShareResponse> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_URL}/share/slack`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to share: ${response.status}`);
  }

  return response.json();
}

/**
 * Check if user can share via Slack
 */
export async function getSlackShareStatus(): Promise<SlackShareStatus> {
  const token = await getAuthToken();

  if (!token) {
    return { can_share: false, channel_name: null };
  }

  try {
    const response = await fetch(`${API_URL}/share/slack/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { can_share: false, channel_name: null };
    }

    return response.json();
  } catch {
    return { can_share: false, channel_name: null };
  }
}

/**
 * Copy article link to clipboard
 */
export async function copyArticleLink(articleId: string): Promise<boolean> {
  const url = `${window.location.origin}/article/${articleId}`;
  
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = url;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

