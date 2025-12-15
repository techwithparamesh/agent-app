import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { insertAgentSchema } from "@shared/schema";
import { 
  Bot, 
  ArrowLeft, 
  Sparkles, 
  LayoutTemplate, 
  X,
  ShoppingCart,
  HeadphonesIcon,
  GraduationCap,
  Building2,
  Stethoscope,
  UtensilsCrossed,
  Car,
  Home,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Link } from "wouter";

const formSchema = insertAgentSchema.extend({
  name: z.string().min(1, "Agent name is required").max(255),
  websiteUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().max(1000).optional(),
  systemPrompt: z.string().max(5000).optional(),
  toneOfVoice: z.string().optional(),
  purpose: z.string().optional(),
  welcomeMessage: z.string().max(500).optional(),
  suggestedQuestions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TemplateData {
  name: string;
  systemPrompt: string;
  suggestedQuestions: string[];
  category?: string;
  description?: string;
  toneOfVoice?: string;
  purpose?: string;
  welcomeMessage?: string;
}

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "empathetic", label: "Empathetic" },
];

const purposeOptions = [
  { value: "sales", label: "Sales - Convert visitors into customers" },
  { value: "support", label: "Support - Help customers with issues" },
  { value: "informational", label: "Informational - Provide information" },
  { value: "lead_generation", label: "Lead Generation - Collect leads" },
  { value: "booking", label: "Booking - Schedule appointments" },
  { value: "education", label: "Education - Teaching and tutoring" },
  { value: "hr", label: "HR - Recruiting and employee support" },
];

// Template icon mapping
const templateIcons: Record<string, React.ElementType> = {
  "E-Commerce Assistant": ShoppingCart,
  "Customer Support Agent": HeadphonesIcon,
  "Educational Tutor": GraduationCap,
  "Real Estate Agent": Home,
  "Healthcare Assistant": Stethoscope,
  "Restaurant Concierge": UtensilsCrossed,
  "Auto Dealership Agent": Car,
  "B2B Sales Assistant": Building2,
  "HR & Recruiting Bot": Briefcase,
};

export default function CreateAgent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [fromTemplate, setFromTemplate] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      websiteUrl: "",
      description: "",
      systemPrompt: "",
      toneOfVoice: "",
      purpose: "",
      welcomeMessage: "",
      suggestedQuestions: "",
    },
  });

  // Load template from sessionStorage on mount
  useEffect(() => {
    const templateJson = sessionStorage.getItem("agentTemplate");
    if (templateJson) {
      try {
        const templateData: TemplateData = JSON.parse(templateJson);
        setTemplate(templateData);
        setFromTemplate(true);
        
        // Pre-fill form with template data
        form.reset({
          name: templateData.name || "",
          websiteUrl: "",
          description: templateData.description || getDefaultDescription(templateData.name),
          systemPrompt: templateData.systemPrompt || "",
          toneOfVoice: templateData.toneOfVoice || getDefaultTone(templateData.name),
          purpose: templateData.purpose || getDefaultPurpose(templateData.name),
          welcomeMessage: templateData.welcomeMessage || getDefaultWelcomeMessage(templateData.name),
          suggestedQuestions: templateData.suggestedQuestions?.join("\n") || "",
        });
        
        // Clear the template from sessionStorage after loading
        sessionStorage.removeItem("agentTemplate");
      } catch (e) {
        console.error("Failed to parse template data:", e);
      }
    }
  }, [form]);

  const clearTemplate = () => {
    setTemplate(null);
    setFromTemplate(false);
    form.reset({
      name: "",
      websiteUrl: "",
      description: "",
      systemPrompt: "",
      toneOfVoice: "",
      purpose: "",
      welcomeMessage: "",
      suggestedQuestions: "",
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Clean up data - convert empty strings to null
      const cleanedData = {
        name: data.name,
        websiteUrl: data.websiteUrl || null,
        description: data.description || null,
        systemPrompt: data.systemPrompt || null,
        toneOfVoice: data.toneOfVoice || null,
        purpose: data.purpose || null,
        welcomeMessage: data.welcomeMessage || null,
        suggestedQuestions: data.suggestedQuestions || null,
      };
      const response = await apiRequest("POST", "/api/agents", cleanedData);
      return response.json();
    },
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent created!",
        description: `${agent.name} has been created successfully.`,
      });
      setLocation(`/dashboard/agents/${agent.id}`);
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
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  const TemplateIcon = template ? templateIcons[template.name] || Bot : Bot;

  return (
    <DashboardLayout title="Create New Agent">
      <div className="max-w-3xl mx-auto">
        {/* Back Button - Context-aware */}
        <Link href={fromTemplate ? "/dashboard/templates" : "/dashboard/agents"}>
          <Button variant="ghost" className="mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {fromTemplate ? "Back to Templates" : "Back to Agents"}
          </Button>
        </Link>

        {/* Template Badge */}
        {template && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TemplateIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        <LayoutTemplate className="h-3 w-3 mr-1" />
                        Template Applied
                      </Badge>
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pre-configured with optimized settings for this use case
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={clearTemplate}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                {template ? (
                  <TemplateIcon className="h-6 w-6 text-primary" />
                ) : (
                  <Bot className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="font-display text-2xl">
                  {template ? `Create ${template.name}` : "Create AI Agent"}
                </CardTitle>
                <CardDescription>
                  {template 
                    ? "Customize your agent's settings and deploy" 
                    : "Configure your agent's personality and purpose"
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agent Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Sales Assistant, Support Bot"
                              {...field}
                              data-testid="input-agent-name"
                            />
                          </FormControl>
                          <FormDescription>
                            Give your agent a memorable name
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com"
                              {...field}
                              data-testid="input-agent-website"
                            />
                          </FormControl>
                          <FormDescription>
                            The website this agent represents
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this agent does..."
                            rows={3}
                            {...field}
                            data-testid="textarea-agent-description"
                          />
                        </FormControl>
                        <FormDescription>
                          Help your agent understand its role and responsibilities
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Behavior Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Agent Behavior
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="toneOfVoice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tone of Voice</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-agent-tone">
                                <SelectValue placeholder="Select a tone" />
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
                          <FormDescription>
                            How should your agent communicate?
                          </FormDescription>
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-agent-purpose">
                                <SelectValue placeholder="Select a purpose" />
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
                          <FormDescription>
                            What is the primary goal of this agent?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="systemPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Define how your AI agent should behave, respond, and what knowledge it should have..."
                            rows={5}
                            className="font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Advanced: Define the AI's personality, knowledge, and behavior guidelines
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Chat Experience Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Chat Experience
                  </h3>

                  <FormField
                    control={form.control}
                    name="welcomeMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Welcome Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Hi! 👋 How can I help you today?"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The first message users see when they open the chat
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
                            placeholder="What services do you offer?&#10;How do I contact support?&#10;What are your business hours?"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Quick questions shown to users (one per line)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                  <Link href={fromTemplate ? "/dashboard/templates" : "/dashboard/agents"}>
                    <Button type="button" variant="outline" className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full sm:w-auto"
                    data-testid="button-create-agent-submit"
                  >
                    {createMutation.isPending ? (
                      "Creating..."
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create Agent
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Helper functions for default values based on template name
function getDefaultDescription(templateName: string): string {
  const descriptions: Record<string, string> = {
    "E-Commerce Assistant": "AI-powered assistant to help customers find products, track orders, process returns, and provide personalized shopping recommendations.",
    "Customer Support Agent": "Professional support agent that handles inquiries, troubleshoots issues, and resolves customer complaints efficiently.",
    "Educational Tutor": "Interactive learning assistant that explains concepts, answers questions, and guides students through their educational journey.",
    "Real Estate Agent": "Property specialist that helps clients find homes, schedule viewings, and navigate the buying or renting process.",
    "Healthcare Assistant": "Medical assistant that schedules appointments, answers health FAQs, and directs patients to appropriate resources.",
    "Restaurant Concierge": "Hospitality assistant that takes reservations, shares menu information, and handles special dining requests.",
    "Auto Dealership Agent": "Vehicle specialist that helps customers explore cars, schedule test drives, and understand financing options.",
    "B2B Sales Assistant": "Business sales specialist that qualifies leads, answers product questions, and schedules demos.",
    "HR & Recruiting Bot": "HR assistant that handles job inquiries, screens candidates, and answers employee questions.",
  };
  return descriptions[templateName] || "";
}

function getDefaultTone(templateName: string): string {
  const tones: Record<string, string> = {
    "E-Commerce Assistant": "friendly",
    "Customer Support Agent": "empathetic",
    "Educational Tutor": "enthusiastic",
    "Real Estate Agent": "professional",
    "Healthcare Assistant": "empathetic",
    "Restaurant Concierge": "friendly",
    "Auto Dealership Agent": "professional",
    "B2B Sales Assistant": "professional",
    "HR & Recruiting Bot": "professional",
  };
  return tones[templateName] || "";
}

function getDefaultPurpose(templateName: string): string {
  const purposes: Record<string, string> = {
    "E-Commerce Assistant": "sales",
    "Customer Support Agent": "support",
    "Educational Tutor": "education",
    "Real Estate Agent": "lead_generation",
    "Healthcare Assistant": "booking",
    "Restaurant Concierge": "booking",
    "Auto Dealership Agent": "sales",
    "B2B Sales Assistant": "lead_generation",
    "HR & Recruiting Bot": "hr",
  };
  return purposes[templateName] || "";
}

function getDefaultWelcomeMessage(templateName: string): string {
  const messages: Record<string, string> = {
    "E-Commerce Assistant": "Hi! 👋 Welcome to our store. I'm here to help you find the perfect product. What are you looking for today?",
    "Customer Support Agent": "Hello! 👋 I'm here to help. How can I assist you today?",
    "Educational Tutor": "Hi there! 📚 I'm your learning assistant. What would you like to learn about today?",
    "Real Estate Agent": "Hello! 🏠 Looking for your dream home? I can help you find the perfect property. What are you looking for?",
    "Healthcare Assistant": "Hello! 👋 Welcome. How can I help you with your healthcare needs today?",
    "Restaurant Concierge": "Welcome! 🍽️ I'd be happy to help you with reservations or menu information. How can I assist?",
    "Auto Dealership Agent": "Hello! 🚗 Welcome to our dealership. Looking for a new vehicle? I can help you find the perfect match.",
    "B2B Sales Assistant": "Hi! 👋 Thanks for your interest in our solutions. How can I help you today?",
    "HR & Recruiting Bot": "Hello! 👋 Welcome to our careers page. Are you looking for job opportunities or do you have questions about our company?",
  };
  return messages[templateName] || "Hi! 👋 How can I help you today?";
}
