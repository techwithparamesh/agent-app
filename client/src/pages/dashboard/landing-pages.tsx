import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { UpgradeModal } from "@/components/upgrade-modal";
import type { GeneratedPage } from "@shared/schema";
import {
  FileText,
  Sparkles,
  Loader2,
  Download,
  Eye,
  Trash2,
  Clock,
  Copy,
  Check,
  Globe,
  PenLine,
  Zap,
  Edit,
  Save,
  X,
  ExternalLink,
} from "lucide-react";

export default function LandingPagesPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [generationMode, setGenerationMode] = useState<"prompt" | "website">("prompt");
  const [selectedPage, setSelectedPage] = useState<GeneratedPage | null>(null);
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    heroText: "",
    subheadline: "",
  });

  const { data: pages, isLoading } = useQuery<GeneratedPage[]>({
    queryKey: ["/api/landing-pages"],
    refetchOnMount: "always",
    staleTime: 0,
  });

  const { data: usageStats } = useQuery<{ allowed: boolean; remaining: number; limit: number; plan: string }>({
    queryKey: ["/api/landing-pages/usage"],
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Update edit form when selected page changes
  useEffect(() => {
    if (selectedPage) {
      setEditForm({
        title: selectedPage.title || "",
        heroText: selectedPage.heroText || "",
        subheadline: selectedPage.subheadline || "",
      });
    }
  }, [selectedPage]);

  const generateMutation = useMutation({
    mutationFn: async (data: { prompt?: string; websiteUrl?: string }) => {
      const response = await apiRequest("POST", "/api/landing-pages/generate", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw { ...errorData, status: response.status };
      }
      return response.json();
    },
    onSuccess: (page) => {
      queryClient.invalidateQueries({ queryKey: ["/api/landing-pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/landing-pages/usage"] });
      setSelectedPage(page);
      setPrompt("");
      setWebsiteUrl("");
      toast({
        title: "Page generated!",
        description: "Your landing page has been created successfully.",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      
      // Check if limit reached
      if (error.status === 403 && error.limitReached) {
        setShowUpgradeModal(true);
        return;
      }
      
      toast({
        title: "Generation failed",
        description: error.message || "Could not generate the landing page. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; heroText: string; subheadline: string }) => {
      const response = await apiRequest("PUT", `/api/landing-pages/${data.id}`, data);
      return response.json();
    },
    onSuccess: (updatedPage) => {
      queryClient.invalidateQueries({ queryKey: ["/api/landing-pages"] });
      setSelectedPage(updatedPage);
      setIsEditing(false);
      toast({
        title: "Page updated!",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Update failed",
        description: "Could not save the changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (pageId: string) => {
      await apiRequest("DELETE", `/api/landing-pages/${pageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/landing-pages"] });
      setSelectedPage(null);
      toast({
        title: "Page deleted",
        description: "The landing page has been removed.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete the page. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    // Check if limit reached before attempting
    if (usageStats && !usageStats.allowed) {
      setShowUpgradeModal(true);
      return;
    }
    
    if (generationMode === "prompt") {
      if (!prompt.trim()) return;
      generateMutation.mutate({ prompt });
    } else {
      if (!websiteUrl.trim()) return;
      generateMutation.mutate({ websiteUrl });
    }
  };

  const handleSaveEdit = () => {
    if (!selectedPage) return;
    updateMutation.mutate({
      id: selectedPage.id,
      ...editForm,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedPage) {
      setEditForm({
        title: selectedPage.title || "",
        heroText: selectedPage.heroText || "",
        subheadline: selectedPage.subheadline || "",
      });
    }
  };

  const previewInNewTab = () => {
    if (selectedPage?.htmlContent) {
      const blob = new Blob([selectedPage.htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  const copyHtml = () => {
    if (selectedPage?.htmlContent) {
      navigator.clipboard.writeText(selectedPage.htmlContent);
      setCopied(true);
      toast({ title: "Copied!", description: "HTML copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadHtml = () => {
    if (selectedPage?.htmlContent) {
      const blob = new Blob([selectedPage.htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedPage.title || "landing-page"}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <DashboardLayout title="Landing Page Generator">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="font-display text-2xl">Generate Landing Page</CardTitle>
                    <CardDescription>
                      Create a stunning landing page from a prompt or by scanning a website
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={generationMode} onValueChange={(v) => setGenerationMode(v as "prompt" | "website")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="prompt" className="flex items-center gap-2">
                      <PenLine className="h-4 w-4" />
                      From Prompt
                    </TabsTrigger>
                    <TabsTrigger value="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      From Website
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="prompt" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt">Describe your product or service</Label>
                      <Textarea
                        id="prompt"
                        placeholder="e.g., Generate a landing page for a SaaS CRM tool that helps small businesses manage customer relationships with features like contact management, email tracking, and sales pipelines."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        data-testid="textarea-landing-prompt"
                      />
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || generateMutation.isPending}
                      className="w-full"
                      data-testid="button-generate-landing"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Landing Page
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="website" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl">Website URL</Label>
                      <Input
                        id="websiteUrl"
                        type="url"
                        placeholder="https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        data-testid="input-website-url"
                      />
                      <p className="text-sm text-muted-foreground">
                        We'll scan all pages of your website to understand your brand, services, and content, then generate a professional landing page.
                      </p>
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={!websiteUrl.trim() || generateMutation.isPending}
                      className="w-full"
                      data-testid="button-generate-from-website"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scanning & Generating...
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Scan Website & Generate
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Preview */}
            {selectedPage && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      {isEditing ? "Editing: " : ""}{selectedPage.title || "Generated Page"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button variant="default" size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={previewInNewTab} title="Preview in new tab">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={copyHtml} title="Copy HTML">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={downloadHtml} title="Download HTML">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(selectedPage.id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="content">{isEditing ? "Edit" : "Content"}</TabsTrigger>
                      <TabsTrigger value="html" disabled={isEditing}>HTML</TabsTrigger>
                    </TabsList>
                    <TabsContent value="content">
                      <ScrollArea className="h-[400px] rounded-lg border border-border p-4">
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-title">Title</Label>
                              <Input
                                id="edit-title"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                placeholder="Page title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-hero">Hero Text</Label>
                              <Textarea
                                id="edit-hero"
                                value={editForm.heroText}
                                onChange={(e) => setEditForm({ ...editForm, heroText: e.target.value })}
                                placeholder="Main headline"
                                rows={3}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-subheadline">Subheadline</Label>
                              <Textarea
                                id="edit-subheadline"
                                value={editForm.subheadline}
                                onChange={(e) => setEditForm({ ...editForm, subheadline: e.target.value })}
                                placeholder="Supporting text"
                                rows={3}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              💡 Tip: For more advanced editing, download the HTML file and edit it in your favorite editor.
                            </p>
                          </div>
                        ) : (
                        <div className="space-y-6">
                          {selectedPage.heroText && (
                            <div>
                              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Hero</h3>
                              <h2 className="text-2xl font-bold">{selectedPage.heroText}</h2>
                              {selectedPage.subheadline && (
                                <p className="text-muted-foreground mt-2">{selectedPage.subheadline}</p>
                              )}
                            </div>
                          )}

                          {selectedPage.features && Array.isArray(selectedPage.features) && (
                            <div>
                              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Features</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(selectedPage.features as any[]).map((feature, i) => (
                                  <div key={i} className="p-4 rounded-lg bg-muted">
                                    <h4 className="font-semibold">{feature.title}</h4>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedPage.ctaButtons && Array.isArray(selectedPage.ctaButtons) && (
                            <div>
                              <h3 className="font-semibold text-sm text-muted-foreground mb-2">CTA Buttons</h3>
                              <div className="flex gap-2 flex-wrap">
                                {(selectedPage.ctaButtons as any[]).map((cta, i) => (
                                  <Badge key={i} variant="outline">{cta.text}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedPage.seoKeywords && Array.isArray(selectedPage.seoKeywords) && (
                            <div>
                              <h3 className="font-semibold text-sm text-muted-foreground mb-2">SEO Keywords</h3>
                              <div className="flex gap-2 flex-wrap">
                                {(selectedPage.seoKeywords as string[]).map((keyword, i) => (
                                  <Badge key={i} variant="secondary">{keyword}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedPage.colorScheme && (
                            <div>
                              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Color Scheme</h3>
                              <div className="flex gap-2">
                                {Object.entries(selectedPage.colorScheme as Record<string, string>).map(([key, value]) => (
                                  <div key={key} className="flex items-center gap-2">
                                    <div
                                      className="w-6 h-6 rounded-md border border-border"
                                      style={{ backgroundColor: value }}
                                    />
                                    <span className="text-xs text-muted-foreground capitalize">{key}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="html">
                      <ScrollArea className="h-[400px]">
                        <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                          <code>{selectedPage.htmlContent || "No HTML content available"}</code>
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* History */}
          <div>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-primary" />
                  Generated Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : pages && pages.length > 0 ? (
                  <div className="space-y-2">
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        className={`p-3 rounded-lg border border-border cursor-pointer hover-elevate ${
                          selectedPage?.id === page.id ? "bg-accent" : ""
                        }`}
                        onClick={() => setSelectedPage(page)}
                        data-testid={`card-landing-${page.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-sm truncate">
                              {page.title || "Untitled"}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {page.prompt.substring(0, 50)}...
                            </p>
                            {page.createdAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(page.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No pages generated yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Stats Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Landing Page Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {usageStats ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pages created</span>
                      <span className="font-medium">
                        {usageStats.limit - usageStats.remaining} / {usageStats.limit}
                      </span>
                    </div>
                    <Progress 
                      value={((usageStats.limit - usageStats.remaining) / usageStats.limit) * 100} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between">
                      <Badge variant={usageStats.plan === "free" ? "secondary" : "default"}>
                        {usageStats.plan === "free" ? "Free Trial" : usageStats.plan}
                      </Badge>
                      <span className={`text-sm ${usageStats.remaining <= 0 ? "text-red-500" : "text-muted-foreground"}`}>
                        {usageStats.remaining} remaining
                      </span>
                    </div>
                    {usageStats.remaining <= 0 && (
                      <Button 
                        onClick={() => setShowUpgradeModal(true)} 
                        className="w-full"
                        variant="default"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Upgrade for More Pages
                      </Button>
                    )}
                  </>
                ) : (
                  <Skeleton className="h-20 w-full" />
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Tips</CardTitle>
              </CardHeader>
              <CardContent>
                {generationMode === "prompt" ? (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">-</span>
                      Describe your product clearly
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">-</span>
                      Include target audience info
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">-</span>
                      Mention key features and benefits
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">-</span>
                      Specify the desired tone
                    </li>
                  </ul>
                ) : (
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">-</span>
                      Enter the main website URL
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">-</span>
                      We'll scan all linked pages
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">-</span>
                      Sitemap.xml is used if available
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">-</span>
                      Best for existing businesses
                    </li>
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentUsage={usageStats ? {
          remaining: usageStats.remaining,
          limit: usageStats.limit,
          plan: usageStats.plan,
        } : undefined}
      />
    </DashboardLayout>
  );
}
