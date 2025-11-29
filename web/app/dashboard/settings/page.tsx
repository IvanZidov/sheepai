"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, User } from 'lucide-react';
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { SubscriptionList } from '@/components/dashboard/subscription-list';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
         <ShepherdNav />
         <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold">Please log in to view settings</h1>
         </div>
      </div>
    );
  }

  const isEmailProvider = user.app_metadata.provider === 'email';

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/20 selection:text-emerald-500">
      <ShepherdNav />
      
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold font-heading mb-8">Account Settings</h1>

        <div className="space-y-6">
          {/* Profile Info */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'User'} />
                  <AvatarFallback className="text-xl">
                    {user.email?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-lg">{user.user_metadata?.full_name || 'User'}</p>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize bg-muted inline-block px-2 py-0.5 rounded-full">
                    {user.app_metadata.provider} account
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4">
                 <div className="grid gap-2">
                   <Label>User ID</Label>
                   <code className="bg-muted p-2 rounded text-xs font-mono">{user.id}</code>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>Manage your alert subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionList />
            </CardContent>
          </Card>

          {/* Password Update - Only for Email Provider */}
          {isEmailProvider && (
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password securely</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>

                  {message && (
                    <div className={`p-3 text-sm rounded-md ${
                      message.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

