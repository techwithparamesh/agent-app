import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ShoppingCart, 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Bot,
  Package,
  Store,
  Link as LinkIcon,
  Key,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Truck,
  DollarSign,
  Search,
  ShoppingBag,
  Settings,
  Shield,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import type { Agent } from "@shared/schema";

type EcommerceConnectionSummary = {
  id: string;
  agentId: string;
  platform: string;
  storeName: string | null;
  storeUrl: string;
  supportsProducts: boolean | null;
  supportsInventory: boolean | null;
  supportsOrders: boolean | null;
  rateLimitPerMinute?: number | null;
  isActive: boolean | null;
  config?: any;
  hasCredentials?: boolean;
};

// Platform options
const platforms = [
  { 
    id: "shopify", 
    name: "Shopify", 
    icon: Store,
    description: "Connect your Shopify store",
    color: "text-green-600",
    bgColor: "bg-green-100",
    fields: [
      { id: "storeUrl", label: "Store URL", placeholder: "https://your-store.myshopify.com", required: true },
      { id: "accessToken", label: "Admin API Access Token", placeholder: "shpat_xxxxxxxxxxxxx", required: true, secret: true },
    ],
  },
  { 
    id: "woocommerce", 
    name: "WooCommerce", 
    icon: ShoppingBag,
    description: "Connect your WooCommerce store",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    fields: [
      { id: "siteUrl", label: "Site URL", placeholder: "https://your-store.com", required: true },
      { id: "consumerKey", label: "Consumer Key", placeholder: "ck_xxxxxxxxxxxxx", required: true, secret: true },
      { id: "consumerSecret", label: "Consumer Secret", placeholder: "cs_xxxxxxxxxxxxx", required: true, secret: true },
    ],
  },
];

// E-commerce capabilities
const ecommerceCapabilities = [
  { id: "product_lookup", label: "Product Search", icon: Search, description: "Let customers search and browse products" },
  { id: "price_check", label: "Price Inquiry", icon: DollarSign, description: "Answer pricing questions in real-time" },
  { id: "stock_check", label: "Stock Availability", icon: Package, description: "Check if items are in stock" },
  { id: "order_tracking", label: "Order Tracking", icon: Truck, description: "Track order status and shipping" },
];

// Form schema
const formSchema = z.object({
  // Step 1: Select Agent
  agentId: z.string().min(1, "Please select an agent"),
  
  // Step 2: Platform & Credentials
  platform: z.string().min(1, "Please select a platform"),
  storeName: z.string().min(1, "Store name is required"),
  storeUrl: z.string().url("Please enter a valid URL"),
  credentials: z.record(z.string(), z.string()).optional(),
  
  // Step 3: Features
  isActive: z.boolean().default(true),
  rateLimitPerMinute: z.coerce.number().int().min(1, "Must be at least 1").max(600, "Max is 600").default(60),
  supportsProducts: z.boolean().default(true),
  supportsInventory: z.boolean().default(true),
  supportsOrders: z.boolean().default(true),
  capabilities: z.array(z.string()).min(1, "Select at least one capability"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EcommerceAgentPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof platforms[0] | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Fetch user's agents
  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Fetch existing e-commerce connections to hide already-connected agents
  const { data: ecommerceConnections } = useQuery<EcommerceConnectionSummary[]>({
    queryKey: ["/api/ecommerce/connections"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agentId: "",
      platform: "",
      storeName: "",
      storeUrl: "",
      credentials: {},
      isActive: true,
      rateLimitPerMinute: 60,
      supportsProducts: true,
      supportsInventory: true,
      supportsOrders: true,
      capabilities: ["product_lookup", "price_check", "stock_check"],
    },
  });

  const selectedAgentId = form.watch("agentId");
  const existingConnection = (ecommerceConnections || []).find((c) => c.agentId === selectedAgentId) || null;
  const isEditingExisting = !!existingConnection;

  // Watch platform changes
  const watchedPlatform = form.watch("platform");
  
  useEffect(() => {
    const platform = platforms.find(p => p.id === watchedPlatform);
    setSelectedPlatform(platform || null);
    setConnectionStatus('idle');
    setConnectionError(null);
  }, [watchedPlatform]);

  useEffect(() => {
    if (!selectedAgentId) return;

    if (existingConnection) {
      const caps = Array.isArray((existingConnection.config as any)?.capabilities)
        ? ((existingConnection.config as any).capabilities as unknown[]).filter((c) => typeof c === 'string') as string[]
        : ["product_lookup", "price_check", "stock_check"];

      form.reset({
        agentId: selectedAgentId,
        platform: existingConnection.platform,
        storeName: existingConnection.storeName || `${existingConnection.platform} Store`,
        storeUrl: existingConnection.storeUrl,
        credentials: {},
        isActive: existingConnection.isActive ?? true,
        rateLimitPerMinute: existingConnection.rateLimitPerMinute ?? 60,
        supportsProducts: existingConnection.supportsProducts ?? true,
        supportsInventory: existingConnection.supportsInventory ?? true,
        supportsOrders: existingConnection.supportsOrders ?? true,
        capabilities: caps.length > 0 ? caps : ["product_lookup"],
      });
      return;
    }

    // New connection defaults
    form.reset({
      agentId: selectedAgentId,
      platform: "",
      storeName: "",
      storeUrl: "",
      credentials: {},
      isActive: true,
      rateLimitPerMinute: 60,
      supportsProducts: true,
      supportsInventory: true,
      supportsOrders: true,
      capabilities: ["product_lookup", "price_check", "stock_check"],
    });
  }, [selectedAgentId, existingConnection?.id]);

  // Create e-commerce connection mutation
  const createConnectionMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("POST", "/api/ecommerce/connections", {
        agentId: values.agentId,
        platform: values.platform,
        storeName: values.storeName,
        storeUrl: values.storeUrl,
        credentials: values.credentials,
        isActive: values.isActive,
        rateLimitPerMinute: values.rateLimitPerMinute,
        supportsProducts: values.supportsProducts,
        supportsInventory: values.supportsInventory,
        supportsOrders: values.supportsOrders,
        capabilities: values.capabilities,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create connection");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ecommerce/connections"] });
      toast({
        title: "E-Commerce Connected!",
        description: "Your store is now connected to your agent",
      });
      setLocation(`/dashboard/agents/${data.agentId}`);
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
          title: "Failed to connect store",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const updateConnectionMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!existingConnection) throw new Error("No existing connection");

      const credentials = values.credentials || {};
      const hasAnyCred = Object.values(credentials).some((v) => typeof v === 'string' && v.trim().length > 0);

      const response = await apiRequest("PUT", `/api/ecommerce/connections/${existingConnection.id}`, {
        storeName: values.storeName,
        storeUrl: values.storeUrl,
        supportsProducts: values.supportsProducts,
        supportsInventory: values.supportsInventory,
        supportsOrders: values.supportsOrders,
        isActive: values.isActive,
        rateLimitPerMinute: values.rateLimitPerMinute,
        config: { capabilities: values.capabilities },
        ...(hasAnyCred ? { credentials } : {}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update connection");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ecommerce/connections"] });
      toast({
        title: "E-Commerce Updated",
        description: "Your store connection has been updated",
      });
      setLocation(`/dashboard/agents/${data.agentId}`);
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
          title: "Failed to update connection",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const deleteConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!existingConnection) throw new Error("No existing connection");
      const response = await apiRequest("DELETE", `/api/ecommerce/connections/${existingConnection.id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as any).message || "Failed to delete connection");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ecommerce/connections"] });
      toast({
        title: "Connection deleted",
        description: "The e-commerce connection was removed",
      });
      form.reset({
        agentId: selectedAgentId || "",
        platform: "",
        storeName: "",
        storeUrl: "",
        credentials: {},
        isActive: true,
        rateLimitPerMinute: 60,
        supportsProducts: true,
        supportsInventory: true,
        supportsOrders: true,
        capabilities: ["product_lookup", "price_check", "stock_check"],
      });
      setCurrentStep(1);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete connection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test connection
  const testConnection = async () => {
    const values = form.getValues();
    if ((!values.platform || !values.storeUrl) && !existingConnection) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields first",
        variant: "destructive",
      });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');
    setConnectionError(null);

    try {
      const response = existingConnection
        ? await apiRequest("POST", `/api/ecommerce/connections/${existingConnection.id}/test`)
        : await apiRequest("POST", "/api/ecommerce/test-connection", {
            platform: values.platform,
            storeUrl: values.storeUrl,
            credentials: values.credentials,
          });
      
      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('success');
        toast({
          title: "Connection successful!",
          description: `Connected to ${result.storeName || 'your store'}`,
        });
      } else {
        setConnectionStatus('error');
        setConnectionError(result.error || 'Connection failed');
        toast({
          title: "Connection failed",
          description: result.error || "Could not connect to store",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      if (existingConnection) {
        await updateConnectionMutation.mutateAsync(values);
      } else {
        await createConnectionMutation.mutateAsync(values);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const steps = [
    { number: 1, title: "Select Agent", description: "Choose which agent to connect" },
    { number: 2, title: "Connect Store", description: "Enter store credentials" },
    { number: 3, title: "Configure", description: "Set up features" },
  ];

  const connectedAgentIds = new Set(
    (ecommerceConnections || [])
      .map((c) => c?.agentId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
  );

  const eligibleAgents = (agents || []).filter((a) => a.agentType === 'website' || a.agentType === 'whatsapp');

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/agents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-orange-500" />
              Connect E-Commerce Store
            </h1>
            <p className="text-muted-foreground">
              Enable your agent to access live product data, pricing, and order information
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
                  className={`h-0.5 w-24 mx-4 ${
                    currentStep > step.number ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Step 1: Select Agent */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select an Agent</CardTitle>
                  <CardDescription>
                    Choose which agent should have access to your e-commerce data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {agentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : eligibleAgents.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>No agents available</AlertTitle>
                      <AlertDescription>
                        You need to create a Website or WhatsApp agent first before connecting an e-commerce store.
                        <div className="mt-4 flex gap-2">
                          <Link href="/dashboard/agents/website">
                            <Button variant="outline" size="sm">Create Website Agent</Button>
                          </Link>
                          <Link href="/dashboard/agents/whatsapp">
                            <Button variant="outline" size="sm">Create WhatsApp Agent</Button>
                          </Link>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <FormField
                      control={form.control}
                      name="agentId"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {eligibleAgents.map((agent) => {
                              const isSelected = field.value === agent.id;
                              const isConnected = connectedAgentIds.has(agent.id);
                              return (
                                <div
                                  key={agent.id}
                                  onClick={() => field.onChange(agent.id)}
                                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${agent.agentType === 'whatsapp' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                      <Bot className={`h-5 w-5 ${agent.agentType === 'whatsapp' ? 'text-green-600' : 'text-blue-600'}`} />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-medium">{agent.name}</h3>
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        {agent.description || `${agent.agentType} agent`}
                                      </p>
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        <Badge variant="outline">
                                          {agent.agentType === 'whatsapp' ? 'WhatsApp' : 'Website'}
                                        </Badge>
                                        {isConnected && (
                                          <Badge variant="secondary">Connected</Badge>
                                        )}
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <CheckCircle2 className="h-5 w-5 text-primary" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {eligibleAgents.length > 0 && (
                    <div className="flex justify-end mt-6">
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        disabled={!form.watch("agentId")}
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Connect Store */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>{isEditingExisting ? "Manage Store Connection" : "Connect Your Store"}</CardTitle>
                  <CardDescription>
                    {isEditingExisting
                      ? "Update store details, credentials, and features"
                      : "Select your e-commerce platform and enter your API credentials"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Selection */}
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-Commerce Platform</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(isEditingExisting ? platforms.filter((p) => p.id === field.value) : platforms).map((platform) => {
                            const Icon = platform.icon;
                            const isSelected = field.value === platform.id;
                            return (
                              <div
                                key={platform.id}
                                onClick={() => {
                                  if (!isEditingExisting) field.onChange(platform.id);
                                }}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <div className={`p-2 rounded-lg ${platform.bgColor} w-fit mb-2`}>
                                  <Icon className={`h-5 w-5 ${platform.color}`} />
                                </div>
                                <h3 className="font-medium">{platform.name}</h3>
                                <p className="text-xs text-muted-foreground">{platform.description}</p>
                              </div>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Store Details */}
                  {selectedPlatform && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="storeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Store Name</FormLabel>
                              <FormControl>
                                <Input placeholder="My Online Store" {...field} />
                              </FormControl>
                              <FormDescription>A friendly name for this connection</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="storeUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {selectedPlatform.fields[0].label}
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    className="pl-9"
                                    placeholder={selectedPlatform.fields[0].placeholder}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Credentials */}
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          API Credentials
                        </h4>

                        {isEditingExisting && (
                          <p className="text-sm text-muted-foreground">
                            Leave credential fields blank to keep your existing stored credentials.
                          </p>
                        )}
                        
                        {selectedPlatform.fields.slice(1).map((field) => (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={`credentials.${field.id}` as any}
                            render={({ field: formField }) => (
                              <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type={field.secret && !showSecrets[field.id] ? "password" : "text"}
                                      placeholder={field.placeholder}
                                      {...formField}
                                    />
                                    {field.secret && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1 h-8 w-8"
                                        onClick={() => setShowSecrets(prev => ({ ...prev, [field.id]: !prev[field.id] }))}
                                      >
                                        {showSecrets[field.id] ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>

                      {/* Test Connection */}
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Test Connection</h4>
                            <p className="text-sm text-muted-foreground">
                              {isEditingExisting
                                ? "Verify the connection using stored credentials"
                                : "Verify your credentials before saving"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {connectionStatus === 'success' && (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                            {connectionStatus === 'error' && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={testConnection}
                              disabled={testingConnection}
                            >
                              {testingConnection ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Testing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Test Connection
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        {connectionError && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{connectionError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      disabled={!form.watch("platform") || !form.watch("storeUrl")}
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Configure Features */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Configure Features</CardTitle>
                  <CardDescription>
                    Choose what your agent can do with your store data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Connection Status */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Connection
                    </h4>
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Enable or disable live store access
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rateLimitPerMinute"
                      render={({ field }) => (
                        <FormItem className="rounded-lg border p-4">
                          <FormLabel className="text-base">Rate limit (per minute)</FormLabel>
                          <FormDescription>
                            Maximum live store API calls per minute for this connection
                          </FormDescription>
                          <FormControl>
                            <Input type="number" min={1} max={600} step={1} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Data Access */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Data Access
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="supportsProducts"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Products</FormLabel>
                              <FormDescription>
                                Access product catalog
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="supportsInventory"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Inventory</FormLabel>
                              <FormDescription>
                                Check stock levels
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="supportsOrders"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Orders</FormLabel>
                              <FormDescription>
                                Track order status
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Agent Capabilities
                    </h4>
                    
                    <FormField
                      control={form.control}
                      name="capabilities"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ecommerceCapabilities.map((capability) => {
                              const Icon = capability.icon;
                              return (
                                <FormField
                                  key={capability.id}
                                  control={form.control}
                                  name="capabilities"
                                  render={({ field }) => (
                                    <FormItem
                                      className={`flex items-center space-x-3 space-y-0 p-3 rounded-lg border transition-colors ${
                                        field.value?.includes(capability.id)
                                          ? "border-primary bg-primary/5"
                                          : "border-border"
                                      }`}
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(capability.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, capability.id])
                                              : field.onChange(
                                                  field.value?.filter((value) => value !== capability.id)
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <div className="flex-1">
                                        <FormLabel className="text-sm font-medium cursor-pointer flex items-center gap-2">
                                          <Icon className="h-4 w-4 text-muted-foreground" />
                                          {capability.label}
                                        </FormLabel>
                                        <FormDescription className="text-xs">
                                          {capability.description}
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Security Notice */}
                  <Alert className="mt-4">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Security</AlertTitle>
                    <AlertDescription>
                      Your credentials are encrypted and stored securely. We only access read-only endpoints 
                      for products and orders. We never access checkout, payment, or customer password data.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <div className="flex items-center gap-2">
                      {isEditingExisting && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => deleteConnectionMutation.mutate()}
                          disabled={deleteConnectionMutation.isPending}
                        >
                          {deleteConnectionMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>Delete</>
                          )}
                        </Button>
                      )}
                      <Button
                        type="submit"
                        disabled={createConnectionMutation.isPending || updateConnectionMutation.isPending}
                      >
                        {(createConnectionMutation.isPending || updateConnectionMutation.isPending) ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {isEditingExisting ? "Save Changes" : "Connect Store"}
                        </>
                      )}
                      </Button>
                    </div>
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
