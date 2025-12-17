import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Agent, KnowledgeBase } from "@shared/schema";
import {
  Bot,
  ArrowLeft,
  Pencil,
  MessageSquare,
  Database,
  Globe,
  Scan,
  Calendar,
  Mic,
  Target,
  Sparkles,
  HelpCircle,
  MessageCircle,
  Smartphone,
  Settings,
  Key,
  Phone,
  Link as LinkIcon,
  Copy,
  Check,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Palette,
  Code,
  Eye,
} from "lucide-react";

interface WhatsAppConfig {
  id: string;
  agentId: string;
  whatsappBusinessId: string | null;
  whatsappPhoneNumberId: string | null;
  whatsappPhoneNumber: string | null;
  verifyToken: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AgentDetails() {
  const [, params] = useRoute("/dashboard/agents/:id");
  const agentId = params?.id;
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  // Widget customization state
  const [widgetConfig, setWidgetConfig] = useState({
    displayName: '',
    primaryColor: '#6366f1',
    position: 'bottom-right' as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
    avatarUrl: '',
    showBranding: true,
    autoOpen: false,
  });

  // WhatsApp config form state
  const [whatsappForm, setWhatsappForm] = useState({
    whatsappBusinessId: "",
    whatsappPhoneNumberId: "",
    whatsappPhoneNumber: "",
    accessToken: "",
    verifyToken: "",
  });

  const { data: agent, isLoading: agentLoading } = useQuery<Agent>({
    queryKey: ["/api/agents", agentId],
    enabled: !!agentId,
  });

  const { data: knowledgeBase, isLoading: kbLoading } = useQuery<KnowledgeBase[]>({
    queryKey: ["/api/agents", agentId, "knowledge"],
    enabled: !!agentId,
  });

  const isWhatsAppAgent = (agent as any)?.agentType === "whatsapp";

  // Fetch WhatsApp config for WhatsApp agents
  const { data: whatsappConfig, isLoading: whatsappConfigLoading, refetch: refetchWhatsappConfig } = useQuery<WhatsAppConfig | null>({
    queryKey: ["/api/whatsapp/agents", agentId, "whatsapp-config"],
    queryFn: async () => {
      const res = await fetch(`/api/whatsapp/agents/${agentId}/whatsapp-config`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch WhatsApp config");
      return res.json();
    },
    enabled: !!agentId && isWhatsAppAgent,
  });

  // Initialize form with existing config
  useEffect(() => {
    if (whatsappConfig) {
      setWhatsappForm({
        whatsappBusinessId: whatsappConfig.whatsappBusinessId || "",
        whatsappPhoneNumberId: whatsappConfig.whatsappPhoneNumberId || "",
        whatsappPhoneNumber: whatsappConfig.whatsappPhoneNumber || "",
        accessToken: "", // Never pre-fill access token for security
        verifyToken: whatsappConfig.verifyToken || "",
      });
    }
  }, [whatsappConfig]);

  // Initialize widget config from agent data
  useEffect(() => {
    if (agent) {
      const agentWidgetConfig = (agent as any).widgetConfig || {};
      setWidgetConfig({
        displayName: agentWidgetConfig.displayName || agent.name || '',
        primaryColor: agentWidgetConfig.primaryColor || '#6366f1',
        position: agentWidgetConfig.position || 'bottom-right',
        avatarUrl: agentWidgetConfig.avatarUrl || '',
        showBranding: agentWidgetConfig.showBranding !== false,
        autoOpen: agentWidgetConfig.autoOpen === true,
      });
    }
  }, [agent]);

  // Generate embed code
  const generateEmbedCode = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    let code = `<script src="${baseUrl}/widget.js"`;
    code += `\n  data-agent-id="${agentId}"`;
    
    if (widgetConfig.displayName && widgetConfig.displayName !== 'AI Assistant') {
      code += `\n  data-agent-name="${widgetConfig.displayName}"`;
    }
    if (widgetConfig.primaryColor && widgetConfig.primaryColor !== '#6366f1') {
      code += `\n  data-primary-color="${widgetConfig.primaryColor}"`;
    }
    if (widgetConfig.position && widgetConfig.position !== 'bottom-right') {
      code += `\n  data-position="${widgetConfig.position}"`;
    }
    if (widgetConfig.avatarUrl) {
      code += `\n  data-avatar-url="${widgetConfig.avatarUrl}"`;
    }
    if (!widgetConfig.showBranding) {
      code += `\n  data-show-branding="false"`;
    }
    if (widgetConfig.autoOpen) {
      code += `\n  data-auto-open="true"`;
    }
    if (agent?.welcomeMessage) {
      code += `\n  data-greeting="${agent.welcomeMessage.replace(/"/g, '&quot;')}"`;
    }
    
    code += `>\n</script>`;
    return code;
  };

  // Save WhatsApp config mutation
  const saveWhatsappConfigMutation = useMutation({
    mutationFn: async (data: typeof whatsappForm) => {
      const res = await apiRequest("POST", `/api/whatsapp/agents/${agentId}/whatsapp-config`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save WhatsApp config");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "WhatsApp Configuration Saved",
        description: "Your WhatsApp API credentials have been saved successfully.",
      });
      refetchWhatsappConfig();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveWhatsappConfig = () => {
    if (!whatsappForm.whatsappPhoneNumber) {
      toast({
        title: "Missing Required Field",
        description: "WhatsApp Phone Number is required.",
        variant: "destructive",
      });
      return;
    }
    saveWhatsappConfigMutation.mutate(whatsappForm);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/whatsapp/webhook` 
    : "/api/whatsapp/webhook";

  if (agentLoading) {
    return (
      <DashboardLayout title="Agent Details">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-32 mb-6" />
          <Card>
            <CardContent className="p-8">
              <Skeleton className="h-16 w-16 rounded-lg mb-6" />
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout title="Agent Not Found">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Agent Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The agent you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/agents">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={agent.name}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard/agents">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/chatbot?agent=${agent.id}`}>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Test Chatbot
              </Button>
            </Link>
            <Link href={`/dashboard/agents/${agent.id}/edit`}>
              <Button data-testid="button-edit-agent">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Agent
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Agent Overview */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isWhatsAppAgent ? "bg-green-500/10" : "bg-primary/10"
                }`}>
                  {isWhatsAppAgent ? (
                    <Smartphone className="h-8 w-8 text-green-500" />
                  ) : (
                    <Bot className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display text-2xl font-bold">{agent.name}</h1>
                    <Badge variant={agent.isActive ? "default" : "secondary"}>
                      {agent.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {isWhatsAppAgent && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                        <Smartphone className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {agent.description || "No description provided"}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {!isWhatsAppAgent && agent.websiteUrl && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <a
                          href={agent.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          {agent.websiteUrl}
                        </a>
                      </div>
                    )}
                    {agent.createdAt && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Created {new Date(agent.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Agent Tabs */}
          {isWhatsAppAgent ? (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="whatsapp-settings">
                  <Settings className="h-4 w-4 mr-2" />
                  WhatsApp Settings
                </TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Business Category & Capabilities */}
                {(agent as any).businessCategory && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-4 w-4 text-primary" />
                        Business Category & Capabilities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <Badge variant="secondary" className="capitalize">
                          {(agent as any).businessCategory?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      {(agent as any).capabilities && (
                        <div className="flex flex-wrap gap-2">
                          {((agent as any).capabilities as string[]).map((cap, i) => (
                            <Badge key={i} variant="outline" className="capitalize">
                              {cap.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Tone & Purpose */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Mic className="h-4 w-4 text-primary" />
                        Tone of Voice
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="capitalize">
                        {agent.toneOfVoice || "Not set"}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-4 w-4 text-primary" />
                        Purpose
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="capitalize">
                        {agent.purpose?.replace("_", " ") || "Not set"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* System Prompt */}
                {agent.systemPrompt && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="h-4 w-4 text-primary" />
                        System Prompt
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 rounded-lg bg-muted/50 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {agent.systemPrompt}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Welcome Message & Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        Welcome Message
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {agent.welcomeMessage || "Hi! 👋 How can I help you today?"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        Suggested Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {agent.suggestedQuestions ? (
                        <div className="space-y-1.5">
                          {agent.suggestedQuestions.split("\n").filter(q => q.trim()).map((q, i) => (
                            <Badge key={i} variant="secondary" className="mr-1 mb-1">
                              {q.trim()}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No suggested questions set</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="whatsapp-settings" className="space-y-6">
                {/* Connection Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Connection Status
                    </CardTitle>
                    <CardDescription>
                      Current status of your WhatsApp Business API connection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {whatsappConfigLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading configuration...</span>
                      </div>
                    ) : whatsappConfig ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          {whatsappConfig.isVerified ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="font-medium">Connected & Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-yellow-600">
                              <AlertCircle className="h-5 w-5" />
                              <span className="font-medium">Pending Verification</span>
                            </div>
                          )}
                        </div>
                        {whatsappConfig.whatsappPhoneNumber && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{whatsappConfig.whatsappPhoneNumber}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-5 w-5" />
                        <span>Not configured yet. Please add your WhatsApp API credentials below.</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Webhook URL */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-primary" />
                      Webhook URL
                    </CardTitle>
                    <CardDescription>
                      Copy this URL and paste it in your Meta/WhatsApp Business Manager webhook settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 rounded-lg bg-muted font-mono text-sm break-all">
                        {webhookUrl}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(webhookUrl, "webhook")}
                      >
                        {copied === "webhook" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* API Credentials Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      WhatsApp API Credentials
                    </CardTitle>
                    <CardDescription>
                      Enter your WhatsApp Business API credentials from Meta Business Manager
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="whatsappBusinessId">Business Account ID</Label>
                        <Input
                          id="whatsappBusinessId"
                          placeholder="e.g., 123456789012345"
                          value={whatsappForm.whatsappBusinessId}
                          onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsappBusinessId: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Found in Meta Business Settings → Business Info
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsappPhoneNumberId">Phone Number ID *</Label>
                        <Input
                          id="whatsappPhoneNumberId"
                          placeholder="e.g., 987654321098765"
                          value={whatsappForm.whatsappPhoneNumberId}
                          onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsappPhoneNumberId: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Found in WhatsApp Manager → Phone Numbers
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsappPhoneNumber">WhatsApp Phone Number *</Label>
                      <Input
                        id="whatsappPhoneNumber"
                        placeholder="e.g., +1234567890"
                        value={whatsappForm.whatsappPhoneNumber}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, whatsappPhoneNumber: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Your WhatsApp Business phone number with country code
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accessToken">Access Token *</Label>
                      <Input
                        id="accessToken"
                        type="password"
                        placeholder="Enter your permanent access token"
                        value={whatsappForm.accessToken}
                        onChange={(e) => setWhatsappForm({ ...whatsappForm, accessToken: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Generate a permanent token in Meta Business Settings → System Users
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verifyToken">Webhook Verify Token</Label>
                      <div className="flex gap-2">
                        <Input
                          id="verifyToken"
                          placeholder="Auto-generated if left empty"
                          value={whatsappForm.verifyToken}
                          onChange={(e) => setWhatsappForm({ ...whatsappForm, verifyToken: e.target.value })}
                        />
                        {whatsappConfig?.verifyToken && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(whatsappConfig.verifyToken!, "verifyToken")}
                          >
                            {copied === "verifyToken" ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used to verify webhook configuration. Leave empty to auto-generate.
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <a
                        href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        WhatsApp API Setup Guide
                      </a>
                      <Button
                        onClick={handleSaveWhatsappConfig}
                        disabled={saveWhatsappConfigMutation.isPending}
                      >
                        {saveWhatsappConfigMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Save Configuration
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Setup Instructions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Setup Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                      <li>
                        Go to{" "}
                        <a
                          href="https://business.facebook.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Meta Business Suite
                        </a>{" "}
                        and create a WhatsApp Business Account if you haven't already.
                      </li>
                      <li>
                        In the WhatsApp Manager, go to <strong>API Setup</strong> and note your Phone Number ID.
                      </li>
                      <li>
                        Create a System User and generate a permanent access token with WhatsApp permissions.
                      </li>
                      <li>
                        Enter the credentials above and click <strong>Save Configuration</strong>.
                      </li>
                      <li>
                        In Meta's webhook settings, paste the <strong>Webhook URL</strong> shown above and the <strong>Verify Token</strong>.
                      </li>
                      <li>
                        Subscribe to the <code>messages</code> webhook field to receive incoming messages.
                      </li>
                      <li>
                        Test by sending a message to your WhatsApp Business number!
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="knowledge" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        Knowledge Base
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Add FAQs, business information, and other content your agent can use to answer questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {kbLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : knowledgeBase && knowledgeBase.length > 0 ? (
                      <div className="space-y-3">
                        {knowledgeBase.slice(0, 5).map((entry) => (
                          <div
                            key={entry.id}
                            className="p-4 rounded-lg border border-border bg-muted/30"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                                  {entry.title || "Untitled"}
                                </h4>
                                {entry.section && (
                                  <p className="text-sm text-muted-foreground">
                                    {entry.section}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {entry.content.substring(0, 150)}...
                                </p>
                              </div>
                              <Badge variant="secondary" className="flex-shrink-0">
                                {entry.contentType || "text"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {knowledgeBase.length > 5 && (
                          <Link href={`/dashboard/knowledge?agent=${agent.id}`}>
                            <Button variant="ghost" className="w-full">
                              View all {knowledgeBase.length} entries
                            </Button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                          <Database className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-4">
                          No knowledge base entries yet
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add FAQs, business info, and other content to help your agent answer questions accurately.
                        </p>
                        <Link href={`/dashboard/knowledge?agent=${agent.id}`}>
                          <Button>
                            <Database className="mr-2 h-4 w-4" />
                            Add Knowledge
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            /* Layout for Website Agents with Tabs */
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="widget">
                  <Code className="h-4 w-4 mr-2" />
                  Widget Setup
                </TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Agent Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Mic className="h-4 w-4 text-primary" />
                        Tone of Voice
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="capitalize">
                        {agent.toneOfVoice || "Not set"}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-4 w-4 text-primary" />
                        Purpose
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="capitalize">
                        {agent.purpose?.replace("_", " ") || "Not set"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* System Prompt */}
                {agent.systemPrompt && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Sparkles className="h-4 w-4 text-primary" />
                        System Prompt
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 rounded-lg bg-muted/50 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {agent.systemPrompt}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Welcome Message & Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        Welcome Message
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {agent.welcomeMessage || "Hi! 👋 How can I help you today?"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        Suggested Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {agent.suggestedQuestions ? (
                        <div className="space-y-1.5">
                          {agent.suggestedQuestions.split("\n").filter(q => q.trim()).map((q, i) => (
                            <Badge key={i} variant="secondary" className="mr-1 mb-1">
                              {q.trim()}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No suggested questions set</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="widget" className="space-y-6">
                {/* Widget Customization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Widget Appearance
                    </CardTitle>
                    <CardDescription>
                      Customize how the chat widget looks on your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Agent Display Name</Label>
                        <Input
                          id="displayName"
                          placeholder="AI Assistant"
                          value={widgetConfig.displayName}
                          onChange={(e) => setWidgetConfig({ ...widgetConfig, displayName: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Name shown in the chat header
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={widgetConfig.primaryColor}
                            onChange={(e) => setWidgetConfig({ ...widgetConfig, primaryColor: e.target.value })}
                            className="w-14 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={widgetConfig.primaryColor}
                            onChange={(e) => setWidgetConfig({ ...widgetConfig, primaryColor: e.target.value })}
                            placeholder="#6366f1"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="position">Widget Position</Label>
                        <select
                          id="position"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={widgetConfig.position}
                          onChange={(e) => setWidgetConfig({ ...widgetConfig, position: e.target.value as any })}
                        >
                          <option value="bottom-right">Bottom Right</option>
                          <option value="bottom-left">Bottom Left</option>
                          <option value="top-right">Top Right</option>
                          <option value="top-left">Top Left</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
                        <Input
                          id="avatarUrl"
                          placeholder="https://example.com/avatar.png"
                          value={widgetConfig.avatarUrl}
                          onChange={(e) => setWidgetConfig({ ...widgetConfig, avatarUrl: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={widgetConfig.showBranding}
                          onChange={(e) => setWidgetConfig({ ...widgetConfig, showBranding: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm">Show "Powered by AgentForge"</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={widgetConfig.autoOpen}
                          onChange={(e) => setWidgetConfig({ ...widgetConfig, autoOpen: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm">Auto-open chat on page load</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Widget Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-slate-100 dark:bg-slate-900 min-h-[200px] relative overflow-hidden">
                      {/* Mini widget preview */}
                      <div 
                        className={`absolute ${widgetConfig.position.includes('bottom') ? 'bottom-4' : 'top-4'} ${widgetConfig.position.includes('right') ? 'right-4' : 'left-4'}`}
                      >
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                          style={{ backgroundColor: widgetConfig.primaryColor }}
                        >
                          <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      
                      {/* Preview chat window */}
                      <div 
                        className={`absolute ${widgetConfig.position.includes('bottom') ? 'bottom-20' : 'top-20'} ${widgetConfig.position.includes('right') ? 'right-4' : 'left-4'} w-64 rounded-lg shadow-xl overflow-hidden bg-white dark:bg-slate-800`}
                      >
                        <div 
                          className="p-3 text-white flex items-center gap-2"
                          style={{ backgroundColor: widgetConfig.primaryColor }}
                        >
                          {widgetConfig.avatarUrl ? (
                            <img src={widgetConfig.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                              <Globe className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{widgetConfig.displayName || 'AI Assistant'}</p>
                            <p className="text-xs opacity-80">Always here to help</p>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-slate-700/50 text-xs">
                          <div className="bg-white dark:bg-slate-600 p-2 rounded-lg shadow-sm">
                            {agent.welcomeMessage || "Hi! How can I help you today?"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Embed Code */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      Embed Code
                    </CardTitle>
                    <CardDescription>
                      Copy and paste this code into your website's HTML, just before the closing &lt;/body&gt; tag
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="p-4 rounded-lg bg-slate-900 text-green-400 text-sm overflow-x-auto font-mono">
                        {generateEmbedCode()}
                      </pre>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          navigator.clipboard.writeText(generateEmbedCode());
                          setCopied("embedCode");
                          setTimeout(() => setCopied(null), 2000);
                          toast({
                            title: "Copied!",
                            description: "Embed code copied to clipboard",
                          });
                        }}
                      >
                        {copied === "embedCode" ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Code
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Installation Tips</h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Works with any website: HTML, WordPress, Shopify, React, etc.</li>
                        <li>• Place the script just before &lt;/body&gt; for best performance</li>
                        <li>• The widget loads asynchronously and won't slow down your site</li>
                        <li>• Test the widget using the "Test Chatbot" button above</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="knowledge" className="space-y-6">
                {/* Knowledge Base */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        Knowledge Base
                      </CardTitle>
                      <Link href={`/dashboard/scan?agent=${agent.id}`}>
                        <Button variant="outline" size="sm">
                          <Scan className="mr-2 h-4 w-4" />
                          Scan Website
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {kbLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : knowledgeBase && knowledgeBase.length > 0 ? (
                      <div className="space-y-3">
                        {knowledgeBase.slice(0, 5).map((entry) => (
                          <div
                            key={entry.id}
                            className="p-4 rounded-lg border border-border bg-muted/30"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">
                                  {entry.title || "Untitled"}
                                </h4>
                                {entry.section && (
                                  <p className="text-sm text-muted-foreground">
                                    {entry.section}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {entry.content.substring(0, 150)}...
                                </p>
                              </div>
                              <Badge variant="secondary" className="flex-shrink-0">
                                {entry.contentType || "text"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {knowledgeBase.length > 5 && (
                          <Link href={`/dashboard/knowledge?agent=${agent.id}`}>
                            <Button variant="ghost" className="w-full">
                              View all {knowledgeBase.length} entries
                            </Button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                          <Database className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-4">
                          No knowledge base entries yet
                        </p>
                        <Link href={`/dashboard/scan?agent=${agent.id}`}>
                          <Button>
                            <Scan className="mr-2 h-4 w-4" />
                            Scan Website to Add Content
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
