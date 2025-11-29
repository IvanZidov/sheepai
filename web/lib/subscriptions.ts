import { supabase } from "./supabase/client";
import { UserPreferences } from "./user-preferences";

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  filters: Partial<UserPreferences>; // Storing relevant preferences as filters
  channels: string[]; // ['email', 'slack']
  frequency: 'immediate' | 'daily' | 'weekly';
  is_active: boolean;
  created_at: string;
  last_notified_at?: string;
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }
  return data as Subscription[];
}

export async function createSubscription(sub: Omit<Subscription, "id" | "user_id" | "created_at" | "last_notified_at">): Promise<Subscription | null> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
        ...sub,
        user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating subscription:", error);
    return null;
  }
  return data as Subscription;
}

export async function updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating subscription:", error);
    return null;
  }
  return data as Subscription;
}

export async function deleteSubscription(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting subscription:", error);
    return false;
  }
  return true;
}

