import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { Agent } from "@shared/schema";
import { Bot, ArrowLeft, Save, Sparkles, CheckCircle2, MessageCircle } from "lucide-react";

const formSchema = insertAgentSchema.extend({
  name: z.string().min(1, "Agent name is required").max(255),
  websiteUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().max(1000).optional(),
  systemPrompt: z.string().max(5000).optional(),
  toneOfVoice: z.string().optional(),
  purpose: z.string().optional(),
  welcomeMessage: z.string().max(500).optional(),
  suggestedQuestions: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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

export default function EditAgent() {
  const [, params] = useRoute("/dashboard/agents/:id/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const agentId = params?.id;

  const { data: agent, isLoading } = useQuery<Agent>({
    queryKey: ["/api/agents", agentId],
    enabled: !!agentId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      websiteUrl: "",
      description: "",
      systemPrompt: "",
      toneOfVoice: "friendly",
      purpose: "support",
      welcomeMessage: "",
      suggestedQuestions: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        websiteUrl: agent.websiteUrl || "",
        description: agent.description || "",
        systemPrompt: agent.systemPrompt || "",
        toneOfVoice: agent.toneOfVoice || "friendly",
        purpose: agent.purpose || "support",
        welcomeMessage: agent.welcomeMessage || "",
        suggestedQuestions: agent.suggestedQuestions || "",
        isActive: agent.isActive ?? true,
      });
    }
  }, [agent, form]);

  const updateMutation = useMutation({
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
        isActive: data.isActive,
      };
      const response = await apiRequest("PATCH", `/api/agents/${agentId}`, cleanedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents", agentId] });
      toast({
        title: "Agent updated!",
        description: "Your changes have been saved.",
      });
      setLocation(`/dashboard/agents/${agentId}`);
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
        description: "Failed to update agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Edit Agent">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-32 mb-6" />
          <Card>
            <CardContent className="p-8 space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout title="Agent Not Found">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Agent Not Found</h2>
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
    <DashboardLayout title={`Edit ${agent.name}`}>
      <div className="max-w-3xl mx-auto">
        <Link href={`/dashboard/agents/${agentId}`}>
          <Button variant="ghost" className="mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Agent
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-2xl">Edit Agent</CardTitle>
                <CardDescription>
                  Update your agent's configuration and behavior
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Status Toggle */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Disable to pause this agent
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-agent-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

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
                            <Input {...field} data-testid="input-edit-agent-name" />
                          </FormControl>
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
                            <Input {...field} data-testid="input-edit-agent-website" />
                          </FormControl>
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
                          <Textarea rows={3} {...field} data-testid="textarea-edit-agent-description" />
                        </FormControl>
                        <FormDescription>
                          Describe what this agent does
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
                              <SelectTrigger data-testid="select-edit-agent-tone">
                                <SelectValue />
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-edit-agent-purpose">
                                <SelectValue />
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
                    <MessageCircle className="h-4 w-4" />
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
                  <Link href={`/dashboard/agents/${agentId}`}>
                    <Button type="button" variant="outline" className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="w-full sm:w-auto"
                    data-testid="button-save-agent"
                  >
                    {updateMutation.isPending ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
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
