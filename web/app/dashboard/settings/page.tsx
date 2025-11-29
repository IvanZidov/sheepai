"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, Building2, Sparkles, Check, AlertCircle, 
  Globe, Tag, Cpu, Shield, Users, X 
} from 'lucide-react';
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserPreferences } from "@/lib/user-preferences";
import { analyzeCompanyProfile, CompanyProfileResponse } from "@/lib/api";

import { SubscriptionList } from '@/components/dashboard/subscription-list';

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const { 
    companyFilters, 
    setCompanyFilters, 
    clearCompanyFilters, 
    applyCompanyFilters,
    useCompanyFilters,
    toggleUseCompanyFilters 
  } = useUserPreferences();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Company profile state
  const [companyUrl, setCompanyUrl] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CompanyProfileResponse | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCompany = async () => {
    if (!companyUrl.trim()) {
      setAnalysisError('Please enter a company URL');
      return;
    }

    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeCompanyProfile({
        company_url: companyUrl,
        description: companyDescription,
      });

      setAnalysisResult(result);
      
      // Auto-save to preferences
      setCompanyFilters({
        companyName: result.profile.name,
        categories: result.suggested_filters.categories,
        regions: result.suggested_filters.regions,
        technologies: result.suggested_filters.technologies,
        watchCompanies: result.suggested_filters.watch_companies,
        watchProducts: result.suggested_filters.watch_products,
        keywords: result.suggested_filters.keywords,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze company';
      setAnalysisError(errorMessage);
    } finally {
      setAnalyzing(false);
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
      
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold font-heading mb-8">Settings</h1>

        <div className="space-y-8">
          
          {/* Company Profile Onboarding */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <CardTitle>Smart Feed Personalization</CardTitle>
              </div>
              <CardDescription>
                Tell us about your company and we&apos;ll suggest the best filters for your news feed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Company Filters */}
              {companyFilters && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="font-medium">{companyFilters.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleUseCompanyFilters}
                        className={useCompanyFilters ? "text-primary" : "text-muted-foreground"}
                      >
                        {useCompanyFilters ? <Check className="w-4 h-4 mr-1" /> : null}
                        {useCompanyFilters ? "Active" : "Inactive"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCompanyFilters}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {companyFilters.categories.slice(0, 5).map(c => (
                      <Badge key={c} variant="secondary" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                    {companyFilters.categories.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{companyFilters.categories.length - 5} more
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={applyCompanyFilters}
                    className="w-full"
                  >
                    Apply to Feed Filters
                  </Button>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-url">Company Website</Label>
                  <Input
                    id="company-url"
                    type="url"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="https://your-company.com"
                    disabled={analyzing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-desc">
                    Tell us about your company
                    <span className="text-muted-foreground font-normal ml-1">(optional but recommended)</span>
                  </Label>
                  <Textarea
                    id="company-desc"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Describe your tech stack, mission, target customers, and what news topics matter most to you..."
                    rows={4}
                    disabled={analyzing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: &quot;We&apos;re a fintech startup using Python, AWS, and PostgreSQL. 
                    Our clients are banks. We care about security, compliance, and AI trends.&quot;
                  </p>
                </div>
                
                {analysisError && (
                  <div className="p-3 text-sm rounded-md bg-red-500/10 text-red-500 border border-red-500/20 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{analysisError}</span>
                  </div>
                )}
                
                <Button 
                  onClick={handleAnalyzeCompany}
                  disabled={analyzing || !companyUrl.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing your company...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Personalized Filters
                    </>
                  )}
                </Button>
              </div>
              
              {/* Analysis Result */}
              {analysisResult && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Filters generated successfully!</span>
                  </div>
                  
                  <div className="grid gap-4">
                    {/* Company Profile Summary */}
                    <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{analysisResult.profile.name}</span>
                        {analysisResult.profile.tagline && (
                          <span className="text-muted-foreground">— {analysisResult.profile.tagline}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{analysisResult.profile.industry}</Badge>
                        {analysisResult.profile.size && (
                          <Badge variant="outline">{analysisResult.profile.size}</Badge>
                        )}
                        {analysisResult.profile.headquarters && (
                          <span>📍 {analysisResult.profile.headquarters}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Suggested Filters */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Categories</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.suggested_filters.categories.map(c => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Regions</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.suggested_filters.regions.map(r => (
                          <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Technologies</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.suggested_filters.technologies.map(t => (
                          <Badge key={t} variant="secondary" className="text-xs font-mono">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Threat Concerns</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.suggested_filters.threat_concerns.map(t => (
                          <Badge key={t} variant="destructive" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Target Audience</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.suggested_filters.target_audiences.map(a => (
                          <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* AI Reasoning */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          {analysisResult.suggested_filters.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

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
