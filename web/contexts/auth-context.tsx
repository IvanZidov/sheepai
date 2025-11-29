"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface SlackStatus {
  connected: boolean;
  channelName: string | null;
  channelId: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  slackStatus: SlackStatus;
  signOut: () => Promise<void>;
  refreshSlackStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  slackStatus: { connected: false, channelName: null, channelId: null },
  signOut: async () => {},
  refreshSlackStatus: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slackStatus, setSlackStatus] = useState<SlackStatus>({
    connected: false,
    channelName: null,
    channelId: null,
  });
  const router = useRouter();

  // Fetch Slack status from database
  const fetchSlackStatus = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("slack_connections")
        .select("channel_id, channel_name")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        setSlackStatus({ connected: false, channelName: null, channelId: null });
        return;
      }

      setSlackStatus({
        connected: true,
        channelName: data.channel_name || null,
        channelId: data.channel_id || null,
      });
    } catch {
      setSlackStatus({ connected: false, channelName: null, channelId: null });
    }
  }, []);

  const refreshSlackStatus = useCallback(async () => {
    if (user?.id) {
      await fetchSlackStatus(user.id);
    }
  }, [user?.id, fetchSlackStatus]);

  useEffect(() => {
    // Check for active session on mount
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch Slack status if user is logged in
        if (session?.user?.id) {
          await fetchSlackStatus(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (event === 'SIGNED_IN' && session?.user?.id) {
          await fetchSlackStatus(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setSlackStatus({ connected: false, channelName: null, channelId: null });
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, fetchSlackStatus]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, slackStatus, signOut, refreshSlackStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
