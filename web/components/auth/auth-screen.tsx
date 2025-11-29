"use client";

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const authSchema = z.object({
  email: z.string().trim().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [lastUsedMethod, setLastUsedMethod] = useState<'email' | 'google' | null>(null);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  
  const router = useRouter();

  // Check for previous auth method preference
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('lastAuthMethod') : null;
    if (saved === 'email' || saved === 'google') {
      setLastUsedMethod(saved);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastAuthMethod', 'google');
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        throw error;
      }
      // Redirect happens automatically
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        throw error;
      }
      
      setSuccessMessage('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const emailToUse = pendingConfirmationEmail || email;
    if (!emailToUse) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        throw error;
      }
      
      setSuccessMessage('Confirmation email sent!');
    } catch (error: any) {
      setError(error.message || 'Failed to send confirmation email');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      // Validate input
      const result = authSchema.safeParse({ email, password });
      if (!result.success) {
        setError(result.error.issues.map(err => err.message).join(', '));
        setLoading(false);
        return;
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: result.data.email,
          password: result.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) {
          if (error.message.includes('already registered')) {
            setError('This email is already registered. Please sign in instead.');
          } else {
             throw error;
          }
        } else {
          setSuccessMessage('Account created! Please check your email to confirm.');
          setPendingConfirmationEmail(result.data.email);
          setShowResendConfirmation(true);
          setIsSignUp(false);
          setPassword('');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
            email: result.data.email,
            password: result.data.password,
        });

        if (error) {
           if (error.message.includes('Invalid login credentials')) {
             setError('Invalid email or password.');
           } else {
             throw error;
           }
        } else {
          if (typeof window !== 'undefined') {
            localStorage.setItem('lastAuthMethod', 'email');
          }
          router.push('/'); // Redirect to home after login
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center p-4 overflow-hidden">
      {/* Simple decorative background elements instead of images for now */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[100px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md shadow-lg relative z-10 border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
             <div className="relative w-12 h-12">
                <Image 
                   src="/logo.png" 
                   alt="CyberShepherd Logo" 
                   fill
                   className="object-contain"
                 />
             </div>
          </div>
          <CardTitle className="text-2xl font-heading font-bold">CyberShepherd</CardTitle>
          <CardDescription className="text-base">
            Silence the noise. Secure your feed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Email</Label>
                {lastUsedMethod === 'email' && (
                  <Badge variant="secondary" className="text-[10px] h-5">Last used</Badge>
                )}
              </div>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/50 border-emerald-500/20 focus-visible:ring-emerald-500"
              />
            </div>
            
            {!showForgotPassword ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted/50 border-emerald-500/20 focus-visible:ring-emerald-500"
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 text-sm text-emerald-500 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                    {successMessage}
                  </div>
                )}

                <Button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Button>
              </>
            ) : (
              <>
                 {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="p-3 text-sm text-emerald-500 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                    {successMessage}
                  </div>
                )}
                <Button 
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading} 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Email
                </Button>
              </>
            )}
          </form>

          <div className="flex items-center justify-between text-sm flex-wrap gap-2 mt-4">
            {!isSignUp && !showForgotPassword && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                disabled={loading}
                className="text-emerald-500 hover:underline font-medium"
              >
                Forgot password?
              </button>
            )}
            {showForgotPassword && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                disabled={loading}
                className="text-emerald-500 hover:underline font-medium"
              >
                Back to Sign In
              </button>
            )}
            {!showForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setSuccessMessage(null);
                  setPassword('');
                  setShowResendConfirmation(false);
                }}
                disabled={loading}
                className="text-emerald-500 hover:underline ml-auto font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            )}
          </div>

          {showResendConfirmation && (
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={loading}
                className="text-xs text-muted-foreground hover:text-emerald-500 hover:underline"
              >
                Didn&apos;t get the email? Resend confirmation
              </button>
            </div>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="space-y-2">
            {lastUsedMethod === 'google' && (
               <div className="flex justify-end">
                 <Badge variant="secondary" className="text-[10px] h-5">Last used</Badge>
               </div>
            )}
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              size="lg"
              className="w-full border-border hover:bg-muted"
              disabled={loading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By clicking continue, you agree to our <span className="underline cursor-pointer hover:text-foreground">Terms of Service</span> and <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
