import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Globe, 
  ArrowLeft,
  ArrowRight,
  Scan,
  CheckCircle2,
  Loader2,
  Bot,
  Database,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";

// Tone and purpose options
const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "empathetic", label: "Empathetic" },
];

const purposeOptions = [
  { value: "sales", label: "Sales - Convert visitors" },
  { value: "support", label: "Support - Help customers" },
  { value: "informational", label: "Informational - Provide info" },
  { value: "lead_generation", label: "Lead Gen - Collect leads" },
  { value: "booking", label: "Booking - Schedule appointments" },
];

// Form schema - collect URL and name together
const formSchema = z.object({
  websiteUrl: z.string().url("Please enter a valid website URL"),
  name: z.string().min(1, "Agent name is required").max(255),
  description: z.string().max(1000).optional(),
  toneOfVoice: z.string().optional(),
  purpose: z.string().optional(),
  welcomeMessage: z.string().max(500).optional(),
  suggestedQuestions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WebsiteAgentPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [createdAgentId, setCreatedAgentId] = useState<number | null>(null);
  const [scanComplete, setScanComplete] = useState(false);
  const [pagesScanned, setPagesScanned] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      websiteUrl: "",
      name: "",
      description: "",
      toneOfVoice: "friendly",
      purpose: "support",
      welcomeMessage: "Hi! I'm here to help you with any questions about our website. How can I assist you today?",
      suggestedQuestions: "",
    },
  });

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: async (data: Partial<FormValues>) => {
      const response = await apiRequest("POST", "/api/agents", {
        name: data.name,
        websiteUrl: data.websiteUrl,
        description: data.description || `AI assistant for ${data.name}`,
        toneOfVoice: data.toneOfVoice,
        purpose: data.purpose,
        welcomeMessage: data.welcomeMessage,
        suggestedQuestions: data.suggestedQuestions,
        agentType: "website",
      });
      return response.json();
    },
  });

  // State for scan status message
  const [scanStatusMessage, setScanStatusMessage] = useState("");

  // Scan website using SSE for real-time progress
  const scanWithProgress = async (agentId: number, url: string): Promise<{ pagesScanned: number }> => {
    return new Promise((resolve, reject) => {
      const encodedUrl = encodeURIComponent(url);
      const eventSource = new EventSource(
        `/api/scan/stream?agentId=${agentId}&url=${encodedUrl}`,
        { withCredentials: true }
      );

      let pagesScanned = 0;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'status') {
            setScanProgress(data.progress || 0);
            setScanStatusMessage(data.message || 'Scanning...');
          } else if (data.type === 'page') {
            pagesScanned++;
            setScanStatusMessage(`Scanned: ${data.title || data.url}`);
          } else if (data.type === 'complete') {
            setScanProgress(100);
            setScanStatusMessage('Scan complete!');
            setPagesScanned(data.pagesScanned || pagesScanned);
            eventSource.close();
            resolve({ pagesScanned: data.pagesScanned || pagesScanned });
          } else if (data.type === 'error') {
            eventSource.close();
            reject(new Error(data.message || 'Scan failed'));
          }
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        // Don't reject on error - the scan might still have succeeded
        resolve({ pagesScanned });
      };

      // Timeout after 5 minutes
      setTimeout(() => {
        eventSource.close();
        resolve({ pagesScanned });
      }, 300000);
    });
  };

  // Handle step 1: Create agent and start scanning
  const handleStep1Submit = async (values: FormValues) => {
    setIsProcessing(true);
    setScanProgress(0);
    setScanStatusMessage("Creating agent...");

    try {
      // Step 1: Create the agent first
      setScanProgress(5);
      const agent = await createAgentMutation.mutateAsync(values);
      setCreatedAgentId(agent.id);
      setScanProgress(10);
      setScanStatusMessage("Agent created. Starting scan...");

      // Step 2: Start scanning the website with real-time progress
      try {
        const scanResult = await scanWithProgress(agent.id, values.websiteUrl);
        
        setScanProgress(100);
        setPagesScanned(scanResult.pagesScanned || 1);
        setScanComplete(true);
        setCurrentStep(2);

        toast({
          title: "Website scanned successfully!",
          description: `Extracted content from ${scanResult.pagesScanned || 1} pages`,
        });
      } catch (scanError: any) {
        // Even if scan fails, agent is created - let user continue
        setScanProgress(100);
        setCurrentStep(2);
        toast({
          title: "Scan completed with warnings",
          description: "Agent created. You can add knowledge manually or try scanning again later.",
          variant: "default",
        });
      }
    } catch (error: any) {
      setIsProcessing(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
        setLocation("/login");
      } else {
        toast({
          title: "Failed to create agent",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  // Handle final step: Update agent with customizations and go to agent page
  const handleFinalize = async () => {
    if (!createdAgentId) return;

    try {
      // Update agent with any customizations
      await apiRequest("PATCH", `/api/agents/${createdAgentId}`, {
        toneOfVoice: form.getValues("toneOfVoice"),
        purpose: form.getValues("purpose"),
        welcomeMessage: form.getValues("welcomeMessage"),
        suggestedQuestions: form.getValues("suggestedQuestions"),
      });

      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      
      toast({
        title: "Agent ready!",
        description: "Your website agent is set up and ready to use",
      });
      
      setLocation(`/dashboard/agents/${createdAgentId}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Auto-generate agent name from URL
  const handleUrlChange = (url: string) => {
    form.setValue("websiteUrl", url);
    
    // Try to extract domain name for agent name suggestion
    if (url && !form.getValues("name")) {
      try {
        const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
        const siteName = domain.replace(/^www\./, "").split(".")[0];
        const capitalizedName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
        form.setValue("name", `${capitalizedName} Assistant`);
      } catch {
        // Invalid URL, ignore
      }
    }
  };

  const steps = [
    { number: 1, title: "Setup & Scan", description: "Enter details and scan" },
    { number: 2, title: "Customize", description: "Fine-tune your agent" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-500" />
              Create Website Agent
            </h1>
            <p className="text-muted-foreground text-sm">
              Scan your website and create an AI agent trained on your content
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    currentStep > step.number
                      ? "bg-green-500 text-white"
                      : currentStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <p className="text-xs mt-1 text-muted-foreground">{step.title}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-16 mx-3 ${currentStep > step.number ? "bg-green-500" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleStep1Submit)}>
            {/* Step 1: Setup & Scan */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="h-5 w-5" />
                    Website Details
                  </CardTitle>
                  <CardDescription>
                    Enter your website URL and we'll scan it to train your AI agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="https://yourwebsite.com"
                              className="pl-10"
                              {...field}
                              onChange={(e) => handleUrlChange(e.target.value)}
                              disabled={isProcessing}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          We'll crawl and extract content from your website
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Bot className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="My Website Assistant"
                              className="pl-10"
                              {...field}
                              disabled={isProcessing}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Helps visitors find information about products and services..."
                            rows={2}
                            {...field}
                            disabled={isProcessing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tone and Purpose */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="toneOfVoice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tone of Voice</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isProcessing}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {toneOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purpose</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isProcessing}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select purpose" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {purposeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {isProcessing && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="truncate max-w-[300px]">
                            {scanStatusMessage || "Processing..."}
                          </span>
                        </div>
                        <span className="text-muted-foreground font-medium">
                          {Math.round(scanProgress)}%
                        </span>
                      </div>
                      <Progress value={scanProgress} className="h-2" />
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                      <Database className="h-4 w-4" />
                      What happens next?
                    </h4>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                      <li>• We'll crawl your website pages</li>
                      <li>• Extract text, FAQs, product info</li>
                      <li>• Train your agent on this content</li>
                    </ul>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Create & Scan
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Customize */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Customize Your Agent
                  </CardTitle>
                  <CardDescription>
                    {scanComplete ? (
                      <span className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Scanned {pagesScanned} pages successfully
                      </span>
                    ) : (
                      "Agent created - customize the experience"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="welcomeMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Welcome Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Hi! How can I help you today?"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          First message visitors see when opening the chat
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="suggestedQuestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suggested Questions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What services do you offer?&#10;How can I contact you?&#10;What are your hours?"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          One question per line - shown as quick buttons
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (createdAgentId) {
                          setLocation(`/dashboard/agents/${createdAgentId}`);
                        }
                      }}
                    >
                      Skip for now
                    </Button>
                    <Button type="button" onClick={handleFinalize}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Finish Setup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
