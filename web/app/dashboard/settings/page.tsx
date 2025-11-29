"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Globe, Tag, Cpu, Shield, Users, X, Link2, Briefcase,
  Target, Zap, ChevronRight, Settings2, User,
  Lock, Hash, Building, Package, ArrowRight, Plug
} from 'lucide-react';
import { SlackConnection } from "@/components/dashboard/slack-connection";
import { ShepherdNav } from "@/components/layout/shepherd-nav";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserPreferences } from "@/lib/user-preferences";
import { analyzeCompanyProfile, CompanyProfileResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

type SettingsTab = 'personalization' | 'integrations' | 'account' | 'security';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { 
    companyFilters, 
    setCompanyFilters, 
    clearCompanyFilters, 
    applyCompanyFilters,
    useCompanyFilters,
    toggleUseCompanyFilters 
  } = useUserPreferences();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('personalization');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const handleApplyFilters = () => {
    applyCompanyFilters();
    setFiltersApplied(true);
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };
  
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
    setFiltersApplied(false);

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

  const tabs = [
    { id: 'personalization' as const, label: 'Feed Personalization', icon: Sparkles },
    { id: 'integrations' as const, label: 'Integrations', icon: Plug },
    { id: 'account' as const, label: 'Account', icon: User },
    ...(isEmailProvider ? [{ id: 'security' as const, label: 'Security', icon: Lock }] : []),
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/20 selection:text-emerald-500">
      <ShepherdNav />
      
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your feed preferences and account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 sticky top-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personalization Tab */}
            {activeTab === 'personalization' && (
              <>
                {/* Current Saved Filters */}
                {companyFilters && (
                  <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-emerald-500/10">
                            <Building2 className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{companyFilters.companyName}</CardTitle>
                            <CardDescription className="text-xs">Your saved company profile</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={useCompanyFilters ? "default" : "secondary"}
                            className={cn(
                              "cursor-pointer transition-all",
                              useCompanyFilters && "bg-emerald-500 hover:bg-emerald-600"
                            )}
                            onClick={toggleUseCompanyFilters}
                          >
                            {useCompanyFilters ? (
                              <><Check className="w-3 h-3 mr-1" /> Active</>
                            ) : (
                              "Inactive"
                            )}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              clearCompanyFilters();
                              setFiltersApplied(false);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-lg bg-background/50">
                          <div className="text-2xl font-bold text-primary">{companyFilters.categories.length}</div>
                          <div className="text-xs text-muted-foreground">Categories</div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50">
                          <div className="text-2xl font-bold text-primary">{companyFilters.technologies.length}</div>
                          <div className="text-xs text-muted-foreground">Technologies</div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50">
                          <div className="text-2xl font-bold text-primary">{companyFilters.regions.length}</div>
                          <div className="text-xs text-muted-foreground">Regions</div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50">
                          <div className="text-2xl font-bold text-primary">{companyFilters.keywords.length}</div>
                          <div className="text-xs text-muted-foreground">Keywords</div>
                        </div>
                      </div>
                      {filtersApplied ? (
                        <div className="w-full mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <Check className="w-4 h-4" />
                          <span className="font-medium">Filters applied! Redirecting to feed...</span>
                        </div>
                      ) : (
                        <Button 
                          onClick={handleApplyFilters}
                          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Apply Filters to Feed
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Company Input Form */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <CardTitle>AI Feed Personalization</CardTitle>
                        <CardDescription>
                          Tell us about your company and we&apos;ll generate personalized filters
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-url" className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-muted-foreground" />
                          Company Website
                        </Label>
                        <Input
                          id="company-url"
                          type="url"
                          value={companyUrl}
                          onChange={(e) => setCompanyUrl(e.target.value)}
                          placeholder="https://your-company.com"
                          disabled={analyzing}
                          className="h-11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company-desc" className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          Company Description
                          <span className="text-xs text-muted-foreground font-normal">(recommended)</span>
                        </Label>
                        <Textarea
                          id="company-desc"
                          value={companyDescription}
                          onChange={(e) => setCompanyDescription(e.target.value)}
                          placeholder="Tell us about your tech stack, mission, target customers, security concerns, and what news matters most to you..."
                          rows={5}
                          disabled={analyzing}
                          className="resize-none"
                        />
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                          <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Pro tip:</strong> Include your tech stack (Python, AWS, etc.), 
                            industry (fintech, healthcare), target customers, and specific security concerns for better results.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {analysisError && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-red-500">Analysis Failed</p>
                          <p className="text-sm text-red-400">{analysisError}</p>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleAnalyzeCompany}
                      disabled={analyzing || !companyUrl.trim()}
                      size="lg"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing your company...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate Personalized Filters
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                {analysisResult && (
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-emerald-500/20">
                          <Check className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <CardTitle className="text-emerald-600 dark:text-emerald-400">
                            Filters Generated Successfully!
                          </CardTitle>
                          <CardDescription>
                            Based on {analysisResult.scraped_content_length.toLocaleString()} characters analyzed
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {/* Company Profile Header */}
                      <div className="p-6 border-b bg-muted/30">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shrink-0">
                            <Building2 className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold">{analysisResult.profile.name}</h3>
                            {analysisResult.profile.tagline && (
                              <p className="text-muted-foreground mt-1">{analysisResult.profile.tagline}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <Badge variant="outline" className="capitalize">
                                {analysisResult.profile.industry.replace(/_/g, ' ')}
                              </Badge>
                              {analysisResult.profile.size && (
                                <Badge variant="outline" className="capitalize">
                                  {analysisResult.profile.size} company
                                </Badge>
                              )}
                              {analysisResult.profile.headquarters && (
                                <Badge variant="outline">
                                  📍 {analysisResult.profile.headquarters}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Products & Customers */}
                        <div className="grid md:grid-cols-2 gap-4 mt-6">
                          {analysisResult.profile.products_services.length > 0 && (
                            <div className="p-4 rounded-lg bg-background/50">
                              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                Products & Services
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {analysisResult.profile.products_services.map((p, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {analysisResult.profile.target_customers.length > 0 && (
                            <div className="p-4 rounded-lg bg-background/50">
                              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                Target Customers
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {analysisResult.profile.target_customers.map((c, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Suggested Filters Grid */}
                      <div className="p-6 grid gap-6">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          Suggested Filters
                        </h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Categories */}
                          <FilterSection
                            icon={Tag}
                            title="Categories"
                            count={analysisResult.suggested_filters.categories.length}
                            color="blue"
                          >
                            {analysisResult.suggested_filters.categories.map(c => (
                              <Badge key={c} className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-0">
                                {c.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </FilterSection>

                          {/* Technologies */}
                          <FilterSection
                            icon={Cpu}
                            title="Technologies"
                            count={analysisResult.suggested_filters.technologies.length}
                            color="purple"
                          >
                            {analysisResult.suggested_filters.technologies.map(t => (
                              <Badge key={t} className="bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border-0 font-mono">
                                {t}
                              </Badge>
                            ))}
                          </FilterSection>

                          {/* Regions */}
                          <FilterSection
                            icon={Globe}
                            title="Regions"
                            count={analysisResult.suggested_filters.regions.length}
                            color="green"
                          >
                            {analysisResult.suggested_filters.regions.map(r => (
                              <Badge key={r} className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-0">
                                {r.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </FilterSection>

                          {/* Threat Concerns */}
                          <FilterSection
                            icon={Shield}
                            title="Threat Concerns"
                            count={analysisResult.suggested_filters.threat_concerns.length}
                            color="red"
                          >
                            {analysisResult.suggested_filters.threat_concerns.map(t => (
                              <Badge key={t} className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-0">
                                {t.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </FilterSection>

                          {/* Target Audiences */}
                          <FilterSection
                            icon={Users}
                            title="Target Audiences"
                            count={analysisResult.suggested_filters.target_audiences.length}
                            color="orange"
                          >
                            {analysisResult.suggested_filters.target_audiences.map(a => (
                              <Badge key={a} className="bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 border-0">
                                {a.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </FilterSection>

                          {/* Keywords */}
                          <FilterSection
                            icon={Hash}
                            title="Keywords"
                            count={analysisResult.suggested_filters.keywords.length}
                            color="cyan"
                          >
                            {analysisResult.suggested_filters.keywords.map(k => (
                              <Badge key={k} className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border-0">
                                {k}
                              </Badge>
                            ))}
                          </FilterSection>
                        </div>

                        {/* Watch Lists */}
                        {(analysisResult.suggested_filters.watch_companies.length > 0 || 
                          analysisResult.suggested_filters.watch_products.length > 0) && (
                          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                            {analysisResult.suggested_filters.watch_companies.length > 0 && (
                              <FilterSection
                                icon={Building}
                                title="Companies to Watch"
                                count={analysisResult.suggested_filters.watch_companies.length}
                                color="indigo"
                              >
                                {analysisResult.suggested_filters.watch_companies.map(c => (
                                  <Badge key={c} variant="outline" className="border-indigo-500/30">
                                    {c}
                                  </Badge>
                                ))}
                              </FilterSection>
                            )}
                            {analysisResult.suggested_filters.watch_products.length > 0 && (
                              <FilterSection
                                icon={Package}
                                title="Products to Watch"
                                count={analysisResult.suggested_filters.watch_products.length}
                                color="pink"
                              >
                                {analysisResult.suggested_filters.watch_products.map(p => (
                                  <Badge key={p} variant="outline" className="border-pink-500/30">
                                    {p}
                                  </Badge>
                                ))}
                              </FilterSection>
                            )}
                          </div>
                        )}

                        {/* AI Reasoning */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/20 shrink-0">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                              <h5 className="font-medium text-amber-600 dark:text-amber-400 mb-1">
                                AI Reasoning
                              </h5>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {analysisResult.suggested_filters.reasoning}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="mb-2">
                  <h2 className="text-lg font-semibold">Integrations</h2>
                  <p className="text-sm text-muted-foreground">
                    Connect external services to receive notifications
                  </p>
                </div>
                
                <SlackConnection />
                
                {/* Placeholder for future integrations */}
                <Card className="border-dashed">
                  <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
                    <div className="text-center">
                      <Plug className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">More integrations coming soon</p>
                      <p className="text-xs mt-1">Discord, Microsoft Teams, Webhooks</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 p-6 rounded-xl bg-muted/30">
                    <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'User'} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {user.email?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">{user.user_metadata?.full_name || 'User'}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <Badge variant="outline" className="mt-2 capitalize">
                        {user.app_metadata.provider} account
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label className="text-muted-foreground text-xs uppercase tracking-wider">User ID</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-muted p-3 rounded-lg text-xs font-mono truncate">
                          {user.id}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(user.id)}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && isEmailProvider && (
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password securely</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
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
                      <div className={cn(
                        "p-4 rounded-lg flex items-start gap-3",
                        message.type === 'success' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20' 
                          : 'bg-red-500/10 border border-red-500/20'
                      )}>
                        {message.type === 'success' ? (
                          <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                        <span className={message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}>
                          {message.text}
                        </span>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="bg-primary hover:bg-primary/90"
                    >
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
    </div>
  );
}

// Filter Section Component
function FilterSection({ 
  icon: Icon, 
  title, 
  count, 
  color, 
  children 
}: { 
  icon: React.ElementType;
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-xl bg-muted/30 space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          {title}
        </h5>
        <Badge variant="secondary" className="text-xs">
          {count}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {children}
      </div>
    </div>
  );
}
