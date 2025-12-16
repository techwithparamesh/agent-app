import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";

// Step-based form schema
const step1Schema = z.object({
  websiteUrl: z.string().url("Please enter a valid website URL"),
});

const step2Schema = z.object({
  name: z.string().min(1, "Agent name is required").max(255),
  description: z.string().max(1000).optional(),
});

const step3Schema = z.object({
  systemPrompt: z.string().max(5000).optional(),
  welcomeMessage: z.string().max(500).optional(),
  suggestedQuestions: z.string().optional(),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;
type Step3Values = z.infer<typeof step3Schema>;

interface ScanResult {
  success: boolean;
  pagesScanned: number;
  contentExtracted: string[];
  businessInfo?: {
    name?: string;
    description?: string;
    services?: string[];
  };
}

export default function WebsiteAgentPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Form for step 1 (URL)
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { websiteUrl: "" },
  });

  // Form for step 2 (Agent details)
  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { name: "", description: "" },
  });

  // Form for step 3 (Customization)
  const step3Form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { systemPrompt: "", welcomeMessage: "", suggestedQuestions: "" },
  });

  // Scan website mutation
  const scanMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/scan", { url });
      return response.json();
    },
    onSuccess: (data) => {
      setScanResult({
        success: true,
        pagesScanned: data.pagesScanned || 1,
        contentExtracted: data.pages || [],
        businessInfo: data.businessInfo,
      });
      
      // Auto-fill agent name if detected
      if (data.businessInfo?.name) {
        step2Form.setValue("name", `${data.businessInfo.name} Assistant`);
      }
      if (data.businessInfo?.description) {
        step2Form.setValue("description", data.businessInfo.description);
      }
      
      setIsScanning(false);
      setCurrentStep(2);
      toast({
        title: "Website scanned successfully!",
        description: `Extracted content from ${data.pagesScanned || 1} pages`,
      });
    },
    onError: (error: Error) => {
      setIsScanning(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Session expired",
          description: "Please log in again",
          variant: "destructive",
        });
        setLocation("/login");
      } else {
        toast({
          title: "Scan failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/agents", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent created successfully!",
        description: "Your website agent is ready to use",
      });
      setLocation(`/dashboard/agents/${data.id}`);
    },
    onError: (error: Error) => {
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
    },
  });

  // Handle step 1 submission (scan website)
  const handleStep1Submit = async (values: Step1Values) => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await scanMutation.mutateAsync(values.websiteUrl);
      setScanProgress(100);
    } finally {
      clearInterval(progressInterval);
    }
  };

  // Handle step 2 submission
  const handleStep2Submit = (values: Step2Values) => {
    setCurrentStep(3);
  };

  // Handle final submission
  const handleFinalSubmit = async (values: Step3Values) => {
    const agentData = {
      name: step2Form.getValues("name"),
      description: step2Form.getValues("description"),
      websiteUrl: step1Form.getValues("websiteUrl"),
      systemPrompt: values.systemPrompt || generateDefaultPrompt(),
      welcomeMessage: values.welcomeMessage || "Hi! I'm here to help you with any questions about our website. How can I assist you today?",
      suggestedQuestions: values.suggestedQuestions,
      agentType: "website",
    };

    await createAgentMutation.mutateAsync(agentData);
  };

  const generateDefaultPrompt = () => {
    const businessName = step2Form.getValues("name").replace(" Assistant", "");
    return `You are a helpful assistant for ${businessName}. 
    
Your role is to answer questions about the business based on the website content that has been scanned and stored in your knowledge base.

## Guidelines:
- Be friendly and professional
- Only answer questions based on the information from the website
- If you don't know something, say so and offer to help in other ways
- Guide users to take appropriate actions (contact, book, purchase, etc.)

## Important:
- Never make up information not present in the knowledge base
- Always be helpful and suggest relevant next steps`;
  };

  const steps = [
    { number: 1, title: "Scan Website", description: "Enter your website URL" },
    { number: 2, title: "Agent Details", description: "Name and describe your agent" },
    { number: 3, title: "Customize", description: "Fine-tune behavior" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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
            <p className="text-muted-foreground">
              Scan your website and create an AI agent trained on your content
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
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
                <div className="text-center mt-2">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-20 mx-4 ${
                    currentStep > step.number ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Scan Website */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Enter Your Website URL
              </CardTitle>
              <CardDescription>
                We'll scan your website and extract content to train your AI agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...step1Form}>
                <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
                  <FormField
                    control={step1Form.control}
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
                              disabled={isScanning}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter the main URL of your website. We'll scan multiple pages automatically.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isScanning && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Scanning website...
                      </div>
                      <Progress value={scanProgress} className="h-2" />
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Database className="h-4 w-4" />
                      What happens during scanning?
                    </h4>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                      <li>• We crawl your website pages</li>
                      <li>• Extract text content, FAQs, product info</li>
                      <li>• Store it in your agent's knowledge base</li>
                      <li>• Your agent can then answer questions about your business</li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isScanning}>
                      {isScanning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          Scan Website
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Agent Details */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Agent Details
              </CardTitle>
              <CardDescription>
                {scanResult && (
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Successfully scanned {scanResult.pagesScanned} pages from your website
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...step2Form}>
                <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
                  <FormField
                    control={step2Form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Website Assistant" {...field} />
                        </FormControl>
                        <FormDescription>
                          This name will be shown to your website visitors
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step2Form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Helps visitors find information about our products and services..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Brief description of what this agent does
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {scanResult?.businessInfo?.services && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-2">Detected Services:</h4>
                      <div className="flex flex-wrap gap-2">
                        {scanResult.businessInfo.services.map((service, index) => (
                          <Badge key={index} variant="secondary">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit">
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Customize */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Customize Your Agent
              </CardTitle>
              <CardDescription>
                Fine-tune how your agent behaves and responds (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...step3Form}>
                <form onSubmit={step3Form.handleSubmit(handleFinalSubmit)} className="space-y-6">
                  <FormField
                    control={step3Form.control}
                    name="welcomeMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Welcome Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Hi! I'm here to help you with any questions about our website. How can I assist you today?"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The first message visitors see when they open the chat
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step3Form.control}
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
                          One question per line. These will be shown as quick buttons.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step3Form.control}
                    name="systemPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Prompt (Advanced)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Custom instructions for your agent..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave blank to use our optimized default prompt
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button type="submit" disabled={createAgentMutation.isPending}>
                      {createAgentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Create Agent
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
