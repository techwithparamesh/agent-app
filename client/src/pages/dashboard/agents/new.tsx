import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { EmailVerificationRequiredInline } from "@/components/email-verification-required";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Globe,
  Upload,
  LayoutTemplate,
  FileText,
  Home,
  Shield,
  ShoppingCart,
  GraduationCap,
} from "lucide-react";

type DomainId = "real_estate" | "insurance" | "ecommerce";
type PurposeId = "static_website" | DomainId;
type ChannelId = "website" | "whatsapp";
type KnowledgeSource = "scan" | "upload" | "template" | "none";

type TemplateData = {
  name: string;
  systemPrompt?: string;
  suggestedQuestions?: string[];
  category?: string;
  description?: string;
  toneOfVoice?: string;
  purpose?: string;
  welcomeMessage?: string;
};

const PURPOSE_OPTIONS: Array<{
  id: PurposeId;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    id: "static_website",
    label: "Static Website",
    description: "Answer questions using scanned website content only",
    icon: FileText,
  },
  {
    id: "real_estate",
    label: "Real Estate",
    description: "Property enquiries, listings, visits, and handoffs",
    icon: Home,
  },
  {
    id: "insurance",
    label: "Insurance",
    description: "Policies, documents, eligibility checks, and requests",
    icon: Shield,
  },
  {
    id: "ecommerce",
    label: "E-Commerce",
    description: "Orders, inventory, products, and transactional support",
    icon: ShoppingCart,
  },
];

const COMING_SOON = {
  label: "Education / Coaching",
  description: "Coming Soon",
  icon: GraduationCap,
} as const;

function mapTemplateCategoryToDomain(category?: string): DomainId | null {
  const normalized = (category || "").toLowerCase();
  if (normalized.includes("real") && normalized.includes("estate")) return "real_estate";
  if (normalized.includes("insurance")) return "insurance";
  if (normalized.includes("e-commerce") || normalized.includes("ecommerce") || normalized.includes("shop")) return "ecommerce";
  return null;
}

export default function CreateAgent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [agentName, setAgentName] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState<PurposeId | null>(null);
  const [channels, setChannels] = useState<ChannelId[]>([]);
  const [knowledgeSource, setKnowledgeSource] = useState<KnowledgeSource>("none");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [template, setTemplate] = useState<TemplateData | null>(null);

  const isStaticWebsite = selectedPurpose === "static_website";
  const isEmailVerified = Boolean((user as any)?.emailVerified);

  useEffect(() => {
    const templateJson = sessionStorage.getItem("agentTemplate");
    if (!templateJson) return;

    try {
      const templateData: TemplateData = JSON.parse(templateJson);
      setTemplate(templateData);
      setKnowledgeSource("template");
      if (typeof templateData.name === "string" && templateData.name.trim()) {
        setAgentName(templateData.name.trim());
      }
      const inferredDomain = mapTemplateCategoryToDomain(templateData.category);
      if (inferredDomain) setSelectedPurpose(inferredDomain);
    } catch (e) {
      console.error("Failed to parse template data:", e);
    } finally {
      sessionStorage.removeItem("agentTemplate");
    }
  }, []);

  useEffect(() => {
    if (selectedPurpose === "static_website") {
      setKnowledgeSource("scan");
    }
  }, [selectedPurpose]);

  const selectedPurposeLabel = useMemo(() => {
    const match = PURPOSE_OPTIONS.find((d) => d.id === selectedPurpose);
    return match?.label || "";
  }, [selectedPurpose]);

  const selectedChannelsLabel = useMemo(() => {
    const labels: string[] = [];
    if (channels.includes("website")) labels.push("Website Chat");
    if (channels.includes("whatsapp")) labels.push("WhatsApp");
    return labels;
  }, [channels]);

  const canContinueStep1 = agentName.trim().length > 0 && !!selectedPurpose;
  const canContinueStep2 = !isStaticWebsite || websiteUrl.trim().length > 0;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPurpose) throw new Error("Please select an agent purpose");
      const trimmedName = agentName.trim();
      if (!trimmedName) throw new Error("Agent name is required");

      if (selectedPurpose === "static_website") {
        const urlTrimmed = websiteUrl.trim();
        if (!urlTrimmed) throw new Error("Website URL is required for Static Website");
      }

      const agentType = channels.includes("whatsapp") && !channels.includes("website") ? "whatsapp" : "website";

      const payload: any = {
        name: trimmedName,
        agentType,
        capabilities: selectedPurpose === "static_website" ? [] : [selectedPurpose],
      };

      const urlTrimmed = websiteUrl.trim();
      if (selectedPurpose === "static_website" || knowledgeSource === "scan") {
        if (urlTrimmed) payload.websiteUrl = urlTrimmed;
      }

      if (knowledgeSource === "template" && template) {
        if (template.description) payload.description = template.description;
        if (template.systemPrompt) payload.systemPrompt = template.systemPrompt;
        if (template.toneOfVoice) payload.toneOfVoice = template.toneOfVoice;
        if (template.purpose) payload.purpose = template.purpose;
        if (template.welcomeMessage) payload.welcomeMessage = template.welcomeMessage;
        if (Array.isArray(template.suggestedQuestions) && template.suggestedQuestions.length > 0) {
          payload.suggestedQuestions = template.suggestedQuestions.join("\n");
        }
      }

      const res = await apiRequest("POST", "/api/agents", payload);
      return res.json();
    },
    onSuccess: (agent: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });

      const encodedUrl = websiteUrl.trim().length > 0 ? `&url=${encodeURIComponent(websiteUrl.trim())}` : "";
      const nextUrl =
        selectedPurpose === "static_website"
          ? `/dashboard/scan?agent=${agent.id}${encodedUrl}&autostart=1`
          : knowledgeSource === "scan"
            ? `/dashboard/scan?agent=${agent.id}${encodedUrl}`
            : knowledgeSource === "upload"
              ? `/dashboard/knowledge?agent=${agent.id}`
              : `/dashboard/agents/${agent.id}`;

      setLocation(nextUrl);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
        setTimeout(() => (window.location.href = "/login"), 300);
        return;
      }

      toast({
        title: "Failed to create agent",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleChannel = (channel: ChannelId) => {
    setChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]));
  };

  return (
    <DashboardLayout title="Create Agent">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/dashboard/agents">
          <Button variant="ghost" className="group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to My Agents
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create Agent</CardTitle>
            <CardDescription>Step {currentStep} of 4</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agent Name</label>
                  <Input
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g., Acme Real Estate Assistant"
                    data-testid="input-agent-name"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Agent Purpose</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PURPOSE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = selectedPurpose === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedPurpose(opt.id)}
                          className="text-left"
                        >
                          <Card className={isSelected ? "border-primary" : ""}>
                            <CardContent className="p-4 flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{opt.label}</div>
                                <div className="text-sm text-muted-foreground">{opt.description}</div>
                              </div>
                              {isSelected && <Badge variant="secondary">Selected</Badge>}
                            </CardContent>
                          </Card>
                        </button>
                      );
                    })}

                    <Card className="opacity-60">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <COMING_SOON.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{COMING_SOON.label}</div>
                          <div className="text-sm text-muted-foreground">{COMING_SOON.description}</div>
                        </div>
                        <Badge variant="secondary">Coming Soon</Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedPurpose === "insurance" && !isEmailVerified && (
                    <div className="mt-4">
                      <EmailVerificationRequiredInline featureName="Insurance" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">Knowledge Source</div>
                <div className="grid grid-cols-1 gap-3">
                  <button type="button" onClick={() => setKnowledgeSource("scan")} className="text-left">
                    <Card className={knowledgeSource === "scan" ? "border-primary" : ""}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Scan my website</div>
                          <div className="text-sm text-muted-foreground">Automatically pull content from a public site</div>
                        </div>
                        {knowledgeSource === "scan" && <Badge variant="secondary">Selected</Badge>}
                      </CardContent>
                    </Card>
                  </button>

                  <div className="pl-1">
                    <label className="text-sm font-medium">
                      Website URL {isStaticWebsite ? "(required)" : "(optional)"}
                    </label>
                    <Input
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="mt-2"
                      data-testid="input-agent-website"
                    />
                  </div>

                  {!isStaticWebsite && (
                    <>
                      <button type="button" onClick={() => setKnowledgeSource("upload")} className="text-left">
                        <Card className={knowledgeSource === "upload" ? "border-primary" : ""}>
                          <CardContent className="p-4 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Upload documents</div>
                              <div className="text-sm text-muted-foreground">Add PDFs, DOCX, or text after creation</div>
                            </div>
                            {knowledgeSource === "upload" && <Badge variant="secondary">Selected</Badge>}
                          </CardContent>
                        </Card>
                      </button>

                      {template ? (
                        <button
                          type="button"
                          onClick={() => setKnowledgeSource("template")}
                          className="text-left"
                        >
                          <Card className={knowledgeSource === "template" ? "border-primary" : ""}>
                            <CardContent className="p-4 flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <LayoutTemplate className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">Use template</div>
                                <div className="text-sm text-muted-foreground">Template loaded: {template.name}</div>
                              </div>
                              {knowledgeSource === "template" ? (
                                <Badge variant="secondary">Selected</Badge>
                              ) : (
                                <Badge variant="outline">Available</Badge>
                              )}
                            </CardContent>
                          </Card>
                        </button>
                      ) : (
                        <Card>
                          <CardContent className="p-4 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <LayoutTemplate className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Use template</div>
                              <div className="text-sm text-muted-foreground">Pick a template and come back here</div>
                            </div>
                            <Link href="/dashboard/templates">
                              <Button type="button" variant="outline" size="sm">
                                Browse templates
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      )}

                      <Button type="button" variant="ghost" onClick={() => setKnowledgeSource("none")} className="justify-start">
                        Clear selection
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">Channels (optional)</div>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Website Chat</div>
                          <div className="text-sm text-muted-foreground">Embed a widget on your site</div>
                        </div>
                      </div>
                      <Checkbox checked={channels.includes("website")} onCheckedChange={() => toggleChannel("website")} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">WhatsApp</div>
                          <div className="text-sm text-muted-foreground">Connect a phone number later</div>
                        </div>
                      </div>
                      <Checkbox checked={channels.includes("whatsapp")} onCheckedChange={() => toggleChannel("whatsapp")} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">Review</div>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Agent name</span>
                      <span className="text-sm font-medium">{agentName.trim() || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Purpose</span>
                      <span className="text-sm font-medium">{selectedPurposeLabel || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Channels</span>
                      <span className="text-sm font-medium">
                        {selectedChannelsLabel.length ? selectedChannelsLabel.join(", ") : "—"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !canContinueStep1}
                  className="w-full"
                  data-testid="button-create-agent-submit"
                >
                  {createMutation.isPending ? (
                    "Creating..."
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Create Agent
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((s) => (s === 1 ? 1 : ((s - 1) as any)))}
                disabled={currentStep === 1 || createMutation.isPending}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1 && !canContinueStep1) {
                      toast({
                        title: "Complete step 1",
                        description: "Enter an agent name and select a purpose.",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (currentStep === 2 && !canContinueStep2) {
                      toast({
                        title: "Website URL required",
                        description: "Enter a website URL to scan for Static Website.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setCurrentStep((s) => ((s + 1) as any));
                  }}
                  disabled={createMutation.isPending}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
