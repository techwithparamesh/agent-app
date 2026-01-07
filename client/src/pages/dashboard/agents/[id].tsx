import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { EmailVerificationRequiredInline, isEmailVerificationRequiredError } from "@/components/email-verification-required";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { buildWidgetEmbedCode } from "@/lib/widgetEmbed";
import type { Agent, KnowledgeBase } from "@shared/schema";
import { isValidE164Phone, normalizeE164Phone } from "@shared/phone";
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
  MoreVertical,
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

type PropertySyncSourceType = "wordpress" | "custom_api" | "unknown";
type PropertySyncConfig = {
  sourceType: PropertySyncSourceType;
  websiteUrl: string | null;
  apiEndpoint: string | null;
  lastSyncedAt: string | null;
  autoSyncEnabled: boolean;
  hasApiKey: boolean;
};
type PropertySyncConfigResponse = { config: PropertySyncConfig | null };
type PropertySyncSyncResponse = {
  imported: number;
  skipped: number;
  fetched: number;
  removed: number;
  reactivated: number;
  message: string;
};
type PropertyDraftStatus = "active" | "removed_from_website";
type PropertyDraft = {
  id: number;
  title: string;
  city: string;
  area: string | null;
  price: string;
  aiEnabled: boolean;
  status: PropertyDraftStatus;
};
type PropertyDraftsResponse = { drafts: PropertyDraft[] };

export default function AgentDetails() {
  const [, params] = useRoute("/dashboard/agents/:id");
  const agentId = params?.id;
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  // Real Estate Property Sync state
  const [propertySyncSource, setPropertySyncSource] = useState<PropertySyncSourceType>("wordpress");
  const [propertySyncWebsiteUrl, setPropertySyncWebsiteUrl] = useState<string>("");
  const [propertySyncApiEndpoint, setPropertySyncApiEndpoint] = useState<string>("");
  const [propertySyncApiKey, setPropertySyncApiKey] = useState<string>("");

  // Widget customization state
  const [widgetConfig, setWidgetConfig] = useState({
    displayName: '',
    primaryColor: '#6366f1',
    position: 'bottom-right' as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
    avatarUrl: '',
    showBranding: true,
    autoOpen: false,
    widgetKey: '',
  });

  // WhatsApp config form state
  const [whatsappForm, setWhatsappForm] = useState({
    whatsappBusinessId: "",
    whatsappPhoneNumberId: "",
    whatsappPhoneNumber: "",
    accessToken: "",
    verifyToken: "",
  });

  type DayHours = { enabled: boolean; start: string; end: string };
  type WeeklyHours = Record<number, DayHours>;
  type DoctorForm = {
    name: string;
    slotDurationMins: number;
    workingHours: WeeklyHours;
  };
  type AppointmentSettingsForm = {
    maxDaysAhead: number;
    bufferMins: number;
    defaultSlotDurationMins: number;
    holidays: string[];
    doctors: DoctorForm[];
  };

  const defaultWeeklyHours: WeeklyHours = {
    0: { enabled: false, start: "09:00", end: "17:00" },
    1: { enabled: true, start: "09:00", end: "17:00" },
    2: { enabled: true, start: "09:00", end: "17:00" },
    3: { enabled: true, start: "09:00", end: "17:00" },
    4: { enabled: true, start: "09:00", end: "17:00" },
    5: { enabled: true, start: "09:00", end: "17:00" },
    6: { enabled: true, start: "09:00", end: "17:00" },
  };

  const [appointmentSettings, setAppointmentSettings] = useState<AppointmentSettingsForm>({
    maxDaysAhead: 2,
    bufferMins: 5,
    defaultSlotDurationMins: 30,
    holidays: [],
    doctors: [],
  });
  const [newHoliday, setNewHoliday] = useState<string>("");
  const { data: agent, isLoading: agentLoading, error: agentError } = useQuery<Agent>({
    queryKey: ["/api/agents", agentId],
    enabled: !!agentId,
    retry: false,
  });

  const { data: knowledgeBase, isLoading: kbLoading } = useQuery<KnowledgeBase[]>({
    queryKey: ["/api/agents", agentId, "knowledge"],
    enabled: !!agentId,
  });

  const isWhatsAppAgent = (agent as any)?.agentType === "whatsapp";
  const agentCapabilities = (((agent as any)?.capabilities ?? []) as string[]).filter(
    (c) => typeof c === "string" && c.length > 0
  );
  const shouldShowPropertySync = agentCapabilities.includes("real_estate");
  const agentBusinessCategory = (agent as any)?.businessCategory as string | undefined;
  const shouldShowAppointmentBooking =
    isWhatsAppAgent &&
    agentCapabilities.includes("appointments") &&
    (agentBusinessCategory === "healthcare" || agentCapabilities.includes("doctors"));
  const shouldPromptForCategorySetup =
    isWhatsAppAgent && (!agentBusinessCategory || agentCapabilities.length === 0);

  useEffect(() => {
    if (!agent || !isWhatsAppAgent) return;
    const raw = ((agent as any).businessInfo?.appointmentSettings ?? {}) as any;
    const doctorsRaw = Array.isArray(raw.doctors) ? raw.doctors : [];

    const normalizeWeeklyHours = (input: any): WeeklyHours => {
      const out: WeeklyHours = { ...defaultWeeklyHours };
      if (!input || typeof input !== "object") return out;
      for (let i = 0; i <= 6; i++) {
        const day = input[i] ?? input[String(i)];
        if (!day || typeof day !== "object") continue;
        out[i] = {
          enabled: typeof day.enabled === "boolean" ? day.enabled : out[i].enabled,
          start: typeof day.start === "string" ? day.start : out[i].start,
          end: typeof day.end === "string" ? day.end : out[i].end,
        };
      }
      return out;
    };

    setAppointmentSettings({
      maxDaysAhead: typeof raw.maxDaysAhead === "number" ? raw.maxDaysAhead : 2,
      bufferMins: typeof raw.bufferMins === "number" ? raw.bufferMins : 5,
      defaultSlotDurationMins: typeof raw.defaultSlotDurationMins === "number" ? raw.defaultSlotDurationMins : 30,
      holidays: Array.isArray(raw.holidays) ? raw.holidays.filter((d: any) => typeof d === "string") : [],
      doctors: doctorsRaw
        .map((d: any) => {
          const name = typeof d?.name === "string" ? d.name : "";
          if (!name) return null;
          return {
            name,
            slotDurationMins:
              typeof d.slotDurationMins === "number"
                ? d.slotDurationMins
                : typeof raw.defaultSlotDurationMins === "number"
                  ? raw.defaultSlotDurationMins
                  : 30,
            workingHours: normalizeWeeklyHours(d.workingHours),
          } satisfies DoctorForm;
        })
        .filter(Boolean) as DoctorForm[],
    });
  }, [agent, isWhatsAppAgent]);

  const { data: propertySyncConfigData, isLoading: propertySyncConfigLoading } = useQuery<PropertySyncConfigResponse>({
    queryKey: [agentId ? `/api/domains/real-estate/property-sync/config?agentId=${agentId}` : ""],
    enabled: Boolean(agentId) && shouldShowPropertySync,
  });

  const { data: propertyDraftsData, isLoading: propertyDraftsLoading } = useQuery<PropertyDraftsResponse>({
    queryKey: [agentId ? `/api/domains/real-estate/properties/drafts?agentId=${agentId}` : ""],
    enabled: Boolean(agentId) && shouldShowPropertySync,
  });

  useEffect(() => {
    const config = propertySyncConfigData?.config;
    if (config) {
      setPropertySyncSource(config.sourceType);
      setPropertySyncWebsiteUrl(config.websiteUrl || (agent as any)?.websiteUrl || "");
      setPropertySyncApiEndpoint(config.apiEndpoint || "");
      return;
    }
    if ((agent as any)?.websiteUrl && !propertySyncWebsiteUrl) {
      setPropertySyncWebsiteUrl((agent as any).websiteUrl);
    }
  }, [propertySyncConfigData?.config, agent, propertySyncWebsiteUrl]);

  const syncPropertiesMutation = useMutation({
    mutationFn: async () => {
      if (!agentId) throw new Error("Missing agent id");
      const payload: any = {
        agentId,
        sourceType: propertySyncSource,
      };
      if (propertySyncSource === "wordpress") {
        payload.websiteUrl = propertySyncWebsiteUrl;
      }
      if (propertySyncSource === "custom_api") {
        payload.apiEndpoint = propertySyncApiEndpoint;
        if (propertySyncApiKey.trim().length > 0) payload.apiKey = propertySyncApiKey.trim();
      }
      if (propertySyncSource === "unknown") {
        payload.websiteUrl = propertySyncWebsiteUrl;
      }

      const res = await apiRequest("POST", "/api/domains/real-estate/property-sync/sync", payload);
      return (await res.json()) as PropertySyncSyncResponse;
    },
    onSuccess: async (data) => {
      toast({
        title: "Sync complete",
        description: data.message || `${data.imported} properties imported for review.`,
      });
      setPropertySyncApiKey("");
      if (agentId) {
        await queryClient.invalidateQueries({
          queryKey: [`/api/domains/real-estate/properties/drafts?agentId=${agentId}`],
        });
        await queryClient.invalidateQueries({
          queryKey: [`/api/domains/real-estate/property-sync/config?agentId=${agentId}`],
        });
      }
    },
    onError: (err: any) => {
      toast({
        title: "Sync failed",
        description: err?.message || "Could not sync properties.",
        variant: "destructive",
      });
    },
  });

  const enableAiMutation = useMutation({
    mutationFn: async (draftId: number) => {
      if (!agentId) throw new Error("Missing agent id");
      const res = await apiRequest("POST", `/api/domains/real-estate/properties/${draftId}/enable-ai`, { agentId });
      return res.json();
    },
    onSuccess: async () => {
      toast({ title: "AI enabled", description: "This property is now visible to the AI agent." });
      if (agentId) {
        await queryClient.invalidateQueries({
          queryKey: [`/api/domains/real-estate/properties/drafts?agentId=${agentId}`],
        });
      }
    },
    onError: (err: any) => {
      toast({ title: "Could not enable AI", description: err?.message || "Please try again.", variant: "destructive" });
    },
  });

  const disableAiMutation = useMutation({
    mutationFn: async (draftId: number) => {
      if (!agentId) throw new Error("Missing agent id");
      const res = await apiRequest("POST", `/api/domains/real-estate/properties/${draftId}/disable-ai`, { agentId });
      return res.json();
    },
    onSuccess: async () => {
      toast({ title: "AI disabled", description: "This property is no longer visible to the AI agent." });
      if (agentId) {
        await queryClient.invalidateQueries({
          queryKey: [`/api/domains/real-estate/properties/drafts?agentId=${agentId}`],
        });
      }
    },
    onError: (err: any) => {
      toast({ title: "Could not disable AI", description: err?.message || "Please try again.", variant: "destructive" });
    },
  });

  const toggleAutoSyncMutation = useMutation({
    mutationFn: async (autoSyncEnabled: boolean) => {
      if (!agentId) throw new Error("Missing agent id");
      const res = await apiRequest("PATCH", `/api/domains/real-estate/property-sync/auto-sync`, { agentId, autoSyncEnabled });
      return res.json();
    },
    onSuccess: async (_data, autoSyncEnabled) => {
      toast({
        title: autoSyncEnabled ? "Auto-sync enabled" : "Auto-sync disabled",
        description: autoSyncEnabled
          ? "Properties will sync automatically every 24 hours."
          : "Automatic syncing has been turned off.",
      });
      if (agentId) {
        await queryClient.invalidateQueries({
          queryKey: [`/api/domains/real-estate/property-sync/config?agentId=${agentId}`],
        });
      }
    },
    onError: (err: any) => {
      toast({ title: "Could not update setting", description: err?.message || "Please try again.", variant: "destructive" });
    },
  });

  const renderPropertySyncTab = () => {
    const config = propertySyncConfigData?.config;
    const drafts = propertyDraftsData?.drafts ?? [];
    const lastSyncedText = config?.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleString() : null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Sync</CardTitle>
            <CardDescription>
              Connect your website to keep your property listings up to date. You continue managing properties on your website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Imported properties are automatically enabled for the AI agent. You can disable individual properties below.
            </div>

            <div className="space-y-3">
              <Label>How is your website built?</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPropertySyncSource("wordpress")}
                  className={`text-left rounded-lg border p-4 transition-colors ${
                    propertySyncSource === "wordpress" ? "border-primary" : "border-border"
                  }`}
                >
                  <div className="font-medium">[Recommended] My website is built on WordPress</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPropertySyncSource("custom_api")}
                  className={`text-left rounded-lg border p-4 transition-colors ${
                    propertySyncSource === "custom_api" ? "border-primary" : "border-border"
                  }`}
                >
                  <div className="font-medium">My website was built by a developer</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPropertySyncSource("unknown")}
                  className={`text-left rounded-lg border p-4 transition-colors ${
                    propertySyncSource === "unknown" ? "border-primary" : "border-border"
                  }`}
                >
                  <div className="font-medium">I’m not sure / I don’t know</div>
                </button>
              </div>
            </div>

            {propertySyncSource === "wordpress" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="propertySyncWebsiteUrl">Website URL</Label>
                  <Input
                    id="propertySyncWebsiteUrl"
                    placeholder="https://example.com"
                    value={propertySyncWebsiteUrl}
                    onChange={(e) => setPropertySyncWebsiteUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">We’ll auto-detect property data</p>
                </div>
              </div>
            )}

            {propertySyncSource === "custom_api" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="propertySyncApiEndpoint">API Endpoint</Label>
                  <Input
                    id="propertySyncApiEndpoint"
                    placeholder="https://example.com/api/properties"
                    value={propertySyncApiEndpoint}
                    onChange={(e) => setPropertySyncApiEndpoint(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertySyncApiKey">API Key (optional)</Label>
                  <Input
                    id="propertySyncApiKey"
                    placeholder={config?.hasApiKey ? "Saved" : ""}
                    value={propertySyncApiKey}
                    onChange={(e) => setPropertySyncApiKey(e.target.value)}
                  />
                </div>
              </div>
            )}

            {propertySyncSource === "unknown" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  If you’re not sure, you can still use website scanning for general information and then approve imported properties before they go live.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can disable individual properties from AI visibility at any time below.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground">
                  {propertySyncConfigLoading ? "Loading…" : lastSyncedText ? `Last synced: ${lastSyncedText}` : "Not synced yet"}
                </div>
                <Button
                  onClick={() => syncPropertiesMutation.mutate()}
                  disabled={syncPropertiesMutation.isPending}
                >
                  {syncPropertiesMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing…
                    </>
                  ) : (
                    "Sync properties now"
                  )}
                </Button>
              </div>

              {config && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Automatic sync</div>
                    <div className="text-xs text-muted-foreground">
                      Sync properties from your website every 24 hours
                    </div>
                  </div>
                  <Switch
                    checked={config.autoSyncEnabled}
                    onCheckedChange={(checked) => toggleAutoSyncMutation.mutate(checked)}
                    disabled={toggleAutoSyncMutation.isPending}
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                This controls what the AI agent can answer. It does not affect your website.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imported Properties</CardTitle>
            <CardDescription>
              Manage AI visibility for imported properties. Toggle whether each property is available to the AI agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {propertyDraftsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading properties…
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-sm text-muted-foreground">No imported properties yet.</div>
            ) : (
              <div className="space-y-3">
                {drafts.map((d) => {
                  const location = d.area ? `${d.city}, ${d.area}` : d.city;
                  const isRemoved = d.status === "removed_from_website";
                  return (
                    <div key={d.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="font-medium truncate">{d.title}</div>
                          {isRemoved ? (
                            <Badge variant="destructive">Removed from website</Badge>
                          ) : d.aiEnabled ? (
                            <Badge variant="default">🟢 Enabled for AI</Badge>
                          ) : (
                            <Badge variant="secondary">⚪ Disabled for AI</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{location}</div>
                        <div className="text-sm text-muted-foreground">Price: {d.price}</div>
                      </div>

                      <div className="flex gap-2">
                        {isRemoved ? (
                          <Button
                            size="sm"
                            onClick={() => enableAiMutation.mutate(d.id)}
                            disabled={enableAiMutation.isPending || disableAiMutation.isPending}
                          >
                            Enable for AI
                          </Button>
                        ) : d.aiEnabled ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => disableAiMutation.mutate(d.id)}
                            disabled={enableAiMutation.isPending || disableAiMutation.isPending}
                          >
                            Disable for AI
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => enableAiMutation.mutate(d.id)}
                            disabled={enableAiMutation.isPending || disableAiMutation.isPending}
                          >
                            Enable for AI
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const updateAppointmentSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!agentId) throw new Error("Missing agent id");
      const existingBusinessInfo = ((agent as any)?.businessInfo ?? {}) as any;
      const payload = {
        businessInfo: {
          ...existingBusinessInfo,
          appointmentSettings,
        },
      };
      const res = await apiRequest("PATCH", `/api/agents/${agentId}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", agentId] });
      toast({
        title: "Appointment settings saved",
        description: "Your booking rules and doctor schedules have been updated.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to save",
        description: err?.message || "Could not save appointment settings.",
        variant: "destructive",
      });
    },
  });

  // Fetch WhatsApp config for WhatsApp agents
  const {
    data: whatsappConfig,
    isLoading: whatsappConfigLoading,
    refetch: refetchWhatsappConfig,
    error: whatsappConfigError,
  } = useQuery<WhatsAppConfig | null>({
    queryKey: ["/api/whatsapp/agents", agentId, "whatsapp-config"],
    queryFn: async () => {
      const res = await fetch(`/api/whatsapp/agents/${agentId}/whatsapp-config`);
      if (res.status === 404) return null;
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err: any = new Error((body as any)?.message || "Failed to fetch WhatsApp config");
        if (typeof (body as any)?.code === "string") err.code = (body as any).code;
        throw err;
      }
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
        widgetKey: agentWidgetConfig.widgetKey || '',
      });
    }
  }, [agent]);

  // Generate embed code
  const generateEmbedCode = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return buildWidgetEmbedCode({
      baseUrl,
      agentId: agentId || "",
      agentName: widgetConfig.displayName,
      forceAgentName: false,
      greeting: agent?.welcomeMessage,
      widgetConfig,
    });
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

    const normalizedPhone = normalizeE164Phone(whatsappForm.whatsappPhoneNumber);
    if (!isValidE164Phone(normalizedPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Use E.164 format (example: +14155552671).",
        variant: "destructive",
      });
      return;
    }

    if (!whatsappForm.whatsappPhoneNumberId) {
      toast({
        title: "Missing Required Field",
        description: "Phone Number ID is required.",
        variant: "destructive",
      });
      return;
    }

    // Access token is required for first-time setup. For existing configs,
    // allow leaving it blank so the server can keep the saved token.
    if (!whatsappConfig && !whatsappForm.accessToken) {
      toast({
        title: "Missing Required Field",
        description: "Access Token is required for initial setup.",
        variant: "destructive",
      });
      return;
    }
    saveWhatsappConfigMutation.mutate({
      ...whatsappForm,
      whatsappPhoneNumber: normalizedPhone,
    });
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

  // Handle 403 Forbidden (user doesn't own this agent)
  if (agentError && (agentError as any)?.status === 403) {
    return (
      <DashboardLayout title="Access Denied">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to view this agent. It may belong to a different account.
          </p>
          <Link href="/dashboard/agents">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Your Agents
            </Button>
          </Link>
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
      <div className="ds-page max-w-4xl space-y-8">
        <div className="ds-page-header">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/agents">
              <Button variant="ghost" size="icon" aria-label="Back to Agents">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              {isWhatsAppAgent ? (
                <Smartphone className="h-5 w-5 text-primary" />
              ) : (
                <Bot className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="space-y-1">
              <h1 className="ds-page-title">{agent.name}</h1>
              <p className="ds-page-subtitle">Overview and settings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/dashboard/agents/${agent.id}/edit`}>
              <Button size="lg" data-testid="button-edit-agent">
                <Pencil className="mr-2 h-5 w-5" />
                Edit Agent
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" aria-label="More actions">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/chatbot?agent=${agent.id}`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Test Chatbot
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Agent Overview */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10">
                  {isWhatsAppAgent ? (
                    <Smartphone className="h-8 w-8 text-primary" />
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
                      <Badge variant="outline">
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
              <TabsList className={`grid w-full ${shouldShowPropertySync ? "grid-cols-4" : "grid-cols-3"}`}>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="whatsapp-settings">
                  <Settings className="h-4 w-4 mr-2" />
                  WhatsApp Settings
                </TabsTrigger>
                {shouldShowPropertySync && (
                  <TabsTrigger value="property-sync">
                    <Globe className="h-4 w-4 mr-2" />
                    Property Sync
                  </TabsTrigger>
                )}
                <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Business Category & Features */}
                {(agent as any).businessCategory && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-4 w-4 text-primary" />
                        Business Category & Features
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
                {isEmailVerificationRequiredError(whatsappConfigError) && (
                  <EmailVerificationRequiredInline featureName="WhatsApp" />
                )}

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
                        onBlur={() => {
                          const normalized = normalizeE164Phone(whatsappForm.whatsappPhoneNumber);
                          if (normalized && normalized !== whatsappForm.whatsappPhoneNumber) {
                            setWhatsappForm({ ...whatsappForm, whatsappPhoneNumber: normalized });
                          }
                        }}
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

                {shouldPromptForCategorySetup && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        WhatsApp Business Settings
                      </CardTitle>
                      <CardDescription>
                        Category-specific fields and features appear after you select a business category and enable capabilities.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="text-sm text-muted-foreground">
                        Open the agent editor to set your category, business info, and enabled features.
                      </div>
                      <Button asChild variant="outline">
                        <Link href={`/dashboard/agents/${agentId}/edit`}>Edit Agent</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Appointment Booking */}
                {shouldShowAppointmentBooking && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Appointment Booking
                      </CardTitle>
                      <CardDescription>
                        Configure doctor availability so your WhatsApp agent can check slots and book appointments (no website needed).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxDaysAhead">Max days in advance</Label>
                        <Input
                          id="maxDaysAhead"
                          type="number"
                          min={1}
                          max={14}
                          value={appointmentSettings.maxDaysAhead}
                          onChange={(e) =>
                            setAppointmentSettings((prev) => ({
                              ...prev,
                              maxDaysAhead: Math.max(1, Math.min(14, parseInt(e.target.value || "2", 10))),
                            }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">Default: 2 days</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="defaultSlotDuration">Slot duration (minutes)</Label>
                        <select
                          id="defaultSlotDuration"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={appointmentSettings.defaultSlotDurationMins}
                          onChange={(e) =>
                            setAppointmentSettings((prev) => ({
                              ...prev,
                              defaultSlotDurationMins: parseInt(e.target.value, 10),
                            }))
                          }
                        >
                          {[10, 15, 20, 30, 45, 60].map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-muted-foreground">Doctors can override this.</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Buffer time</Label>
                        <Input value={`${appointmentSettings.bufferMins} mins`} disabled />
                        <p className="text-xs text-muted-foreground">Fixed to 5 mins for now</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Holidays (no bookings)</p>
                          <p className="text-xs text-muted-foreground">Add dates in YYYY-MM-DD</p>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-2">
                        <Input
                          type="date"
                          value={newHoliday}
                          onChange={(e) => setNewHoliday(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const value = newHoliday;
                            if (!value) return;
                            setAppointmentSettings((prev) => ({
                              ...prev,
                              holidays: prev.holidays.includes(value) ? prev.holidays : [...prev.holidays, value].sort(),
                            }));
                            setNewHoliday("");
                          }}
                        >
                          Add Holiday
                        </Button>
                      </div>

                      {appointmentSettings.holidays.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {appointmentSettings.holidays.map((d) => (
                            <Badge
                              key={d}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() =>
                                setAppointmentSettings((prev) => ({
                                  ...prev,
                                  holidays: prev.holidays.filter((x) => x !== d),
                                }))
                              }
                              title="Click to remove"
                            >
                              {d}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Doctors</p>
                          <p className="text-xs text-muted-foreground">Each doctor can have separate working hours.</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setAppointmentSettings((prev) => ({
                              ...prev,
                              doctors: [
                                ...prev.doctors,
                                {
                                  name: "",
                                  slotDurationMins: prev.defaultSlotDurationMins,
                                  workingHours: { ...defaultWeeklyHours },
                                },
                              ],
                            }));
                          }}
                        >
                          Add Doctor
                        </Button>
                      </div>

                      {appointmentSettings.doctors.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No doctors added yet.</p>
                      ) : (
                        <div className="space-y-6">
                          {appointmentSettings.doctors.map((doc, docIdx) => {
                            const days = [
                              { idx: 1, label: "Mon" },
                              { idx: 2, label: "Tue" },
                              { idx: 3, label: "Wed" },
                              { idx: 4, label: "Thu" },
                              { idx: 5, label: "Fri" },
                              { idx: 6, label: "Sat" },
                              { idx: 0, label: "Sun" },
                            ];

                            return (
                              <div key={docIdx} className="p-4 rounded-lg border border-border space-y-4">
                                <div className="flex flex-col md:flex-row gap-3 md:items-end">
                                  <div className="flex-1 space-y-2">
                                    <Label>Doctor name</Label>
                                    <Input
                                      placeholder="e.g., Dr. Sharma"
                                      value={doc.name}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setAppointmentSettings((prev) => ({
                                          ...prev,
                                          doctors: prev.doctors.map((d, i) =>
                                            i === docIdx ? { ...d, name: value } : d
                                          ),
                                        }));
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Slot duration</Label>
                                    <select
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                      value={doc.slotDurationMins}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value, 10);
                                        setAppointmentSettings((prev) => ({
                                          ...prev,
                                          doctors: prev.doctors.map((d, i) =>
                                            i === docIdx ? { ...d, slotDurationMins: value } : d
                                          ),
                                        }));
                                      }}
                                    >
                                      {[10, 15, 20, 30, 45, 60].map((v) => (
                                        <option key={v} value={v}>
                                          {v} mins
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                      setAppointmentSettings((prev) => ({
                                        ...prev,
                                        doctors: prev.doctors.filter((_, i) => i !== docIdx),
                                      }))
                                    }
                                  >
                                    Remove
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Working hours</p>
                                  <div className="space-y-3">
                                    {days.map((day) => {
                                      const v = doc.workingHours[day.idx];
                                      return (
                                        <div key={day.idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:items-center">
                                          <div className="text-sm text-muted-foreground">{day.label}</div>
                                          <div className="flex items-center gap-2">
                                            <Switch
                                              checked={v.enabled}
                                              onCheckedChange={(checked) => {
                                                setAppointmentSettings((prev) => ({
                                                  ...prev,
                                                  doctors: prev.doctors.map((d, i) => {
                                                    if (i !== docIdx) return d;
                                                    return {
                                                      ...d,
                                                      workingHours: {
                                                        ...d.workingHours,
                                                        [day.idx]: { ...d.workingHours[day.idx], enabled: checked },
                                                      },
                                                    };
                                                  }),
                                                }));
                                              }}
                                            />
                                            <span className="text-xs text-muted-foreground">Open</span>
                                          </div>
                                          <Input
                                            type="time"
                                            value={v.start}
                                            disabled={!v.enabled}
                                            onChange={(e) => {
                                              const start = e.target.value;
                                              setAppointmentSettings((prev) => ({
                                                ...prev,
                                                doctors: prev.doctors.map((d, i) => {
                                                  if (i !== docIdx) return d;
                                                  return {
                                                    ...d,
                                                    workingHours: {
                                                      ...d.workingHours,
                                                      [day.idx]: { ...d.workingHours[day.idx], start },
                                                    },
                                                  };
                                                }),
                                              }));
                                            }}
                                          />
                                          <Input
                                            type="time"
                                            value={v.end}
                                            disabled={!v.enabled}
                                            onChange={(e) => {
                                              const end = e.target.value;
                                              setAppointmentSettings((prev) => ({
                                                ...prev,
                                                doctors: prev.doctors.map((d, i) => {
                                                  if (i !== docIdx) return d;
                                                  return {
                                                    ...d,
                                                    workingHours: {
                                                      ...d.workingHours,
                                                      [day.idx]: { ...d.workingHours[day.idx], end },
                                                    },
                                                  };
                                                }),
                                              }));
                                            }}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                      <div className="pt-2 flex justify-end">
                        <Button
                          type="button"
                          onClick={() => updateAppointmentSettingsMutation.mutate()}
                          disabled={updateAppointmentSettingsMutation.isPending}
                        >
                          {updateAppointmentSettingsMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Save Appointment Settings
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

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

              {shouldShowPropertySync && (
                <TabsContent value="property-sync" className="space-y-6">
                  {renderPropertySyncTab()}
                </TabsContent>
              )}

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
              <TabsList className={`grid w-full ${shouldShowPropertySync ? "grid-cols-4" : "grid-cols-3"}`}>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="widget">
                  <Code className="h-4 w-4 mr-2" />
                  Widget Setup
                </TabsTrigger>
                {shouldShowPropertySync && (
                  <TabsTrigger value="property-sync">
                    <Globe className="h-4 w-4 mr-2" />
                    Property Sync
                  </TabsTrigger>
                )}
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
                      <pre className="p-4 rounded-lg bg-muted text-foreground text-sm overflow-x-auto font-mono border border-border">
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
                            <Check className="h-4 w-4 mr-1 text-primary" />
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
                    
                    <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
                      <h4 className="font-medium text-foreground mb-2">💡 Installation Tips</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Works with any website: HTML, WordPress, Shopify, React, etc.</li>
                        <li>• Place the script just before &lt;/body&gt; for best performance</li>
                        <li>• The widget loads asynchronously and won't slow down your site</li>
                        <li>• Test the widget using the "Test Chatbot" button above</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {shouldShowPropertySync && (
                <TabsContent value="property-sync" className="space-y-6">
                  {renderPropertySyncTab()}
                </TabsContent>
              )}

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
