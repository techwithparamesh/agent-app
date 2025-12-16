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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Smartphone, 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Bot,
  Calendar,
  Receipt,
  Package,
  HeadphonesIcon,
  Stethoscope,
  UtensilsCrossed,
  Car,
  Home,
  GraduationCap,
  Briefcase,
  Building2,
  Clock,
  Bell,
  CreditCard,
  MessageSquare,
  Users,
  FileText,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Star,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import { Link } from "wouter";

// Business categories with their specific capabilities
const businessCategories = [
  {
    id: "healthcare",
    name: "Healthcare & Clinics",
    icon: Stethoscope,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    description: "Hospitals, clinics, dental offices, labs",
    capabilities: [
      { id: "appointments", label: "Appointment Booking", icon: Calendar, default: true },
      { id: "reminders", label: "Appointment Reminders", icon: Bell, default: true },
      { id: "prescriptions", label: "Prescription Refills", icon: FileText, default: false },
      { id: "reports", label: "Report Collection", icon: FileText, default: false },
      { id: "billing", label: "Billing Inquiries", icon: Receipt, default: true },
      { id: "insurance", label: "Insurance Queries", icon: CreditCard, default: false },
      { id: "directions", label: "Location & Directions", icon: MapPin, default: true },
      { id: "doctors", label: "Doctor Information", icon: Users, default: true },
    ],
  },
  {
    id: "salon",
    name: "Salons & Spas",
    icon: Sparkles,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    description: "Beauty salons, spas, barbershops",
    capabilities: [
      { id: "appointments", label: "Appointment Booking", icon: Calendar, default: true },
      { id: "reminders", label: "Appointment Reminders", icon: Bell, default: true },
      { id: "services", label: "Service Menu & Pricing", icon: FileText, default: true },
      { id: "stylists", label: "Stylist Selection", icon: Users, default: true },
      { id: "offers", label: "Offers & Packages", icon: Star, default: true },
      { id: "feedback", label: "Feedback Collection", icon: MessageSquare, default: false },
      { id: "billing", label: "Payment & Billing", icon: Receipt, default: true },
    ],
  },
  {
    id: "restaurant",
    name: "Restaurants & Cafes",
    icon: UtensilsCrossed,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "Restaurants, cafes, cloud kitchens",
    capabilities: [
      { id: "reservations", label: "Table Reservations", icon: Calendar, default: true },
      { id: "menu", label: "Menu & Pricing", icon: FileText, default: true },
      { id: "orders", label: "Food Orders", icon: ShoppingCart, default: true },
      { id: "delivery", label: "Delivery Tracking", icon: Package, default: true },
      { id: "offers", label: "Offers & Combos", icon: Star, default: true },
      { id: "feedback", label: "Feedback & Reviews", icon: MessageSquare, default: false },
      { id: "billing", label: "Bill Payment", icon: Receipt, default: true },
    ],
  },
  {
    id: "automotive",
    name: "Automotive Services",
    icon: Car,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Car service, workshops, dealerships",
    capabilities: [
      { id: "appointments", label: "Service Booking", icon: Calendar, default: true },
      { id: "reminders", label: "Service Reminders", icon: Bell, default: true },
      { id: "status", label: "Service Status", icon: Clock, default: true },
      { id: "estimates", label: "Cost Estimates", icon: Receipt, default: true },
      { id: "pickup", label: "Pickup/Drop Scheduling", icon: MapPin, default: false },
      { id: "history", label: "Service History", icon: FileText, default: false },
      { id: "billing", label: "Payment & Invoices", icon: CreditCard, default: true },
    ],
  },
  {
    id: "education",
    name: "Education & Coaching",
    icon: GraduationCap,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Schools, coaching centers, tutors",
    capabilities: [
      { id: "enrollment", label: "Course Enrollment", icon: FileText, default: true },
      { id: "schedule", label: "Class Schedule", icon: Calendar, default: true },
      { id: "fees", label: "Fee Payment", icon: Receipt, default: true },
      { id: "reminders", label: "Class Reminders", icon: Bell, default: true },
      { id: "attendance", label: "Attendance Tracking", icon: Users, default: false },
      { id: "progress", label: "Progress Reports", icon: TrendingUp, default: false },
      { id: "support", label: "Doubt Clearing", icon: HeadphonesIcon, default: true },
    ],
  },
  {
    id: "realestate",
    name: "Real Estate",
    icon: Home,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    description: "Agents, property managers, builders",
    capabilities: [
      { id: "listings", label: "Property Listings", icon: FileText, default: true },
      { id: "viewings", label: "Schedule Viewings", icon: Calendar, default: true },
      { id: "inquiries", label: "Property Inquiries", icon: MessageSquare, default: true },
      { id: "pricing", label: "Pricing & EMI Info", icon: Receipt, default: true },
      { id: "documents", label: "Document Collection", icon: FileText, default: false },
      { id: "updates", label: "Construction Updates", icon: Building2, default: false },
    ],
  },
  {
    id: "professional",
    name: "Professional Services",
    icon: Briefcase,
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    description: "Lawyers, accountants, consultants",
    capabilities: [
      { id: "appointments", label: "Consultation Booking", icon: Calendar, default: true },
      { id: "reminders", label: "Meeting Reminders", icon: Bell, default: true },
      { id: "documents", label: "Document Requests", icon: FileText, default: true },
      { id: "billing", label: "Invoice & Billing", icon: Receipt, default: true },
      { id: "status", label: "Case/Project Status", icon: Clock, default: false },
      { id: "support", label: "General Queries", icon: HeadphonesIcon, default: true },
    ],
  },
  {
    id: "retail",
    name: "Retail & E-Commerce",
    icon: ShoppingCart,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    description: "Shops, stores, online sellers",
    capabilities: [
      { id: "catalog", label: "Product Catalog", icon: FileText, default: true },
      { id: "orders", label: "Order Placement", icon: ShoppingCart, default: true },
      { id: "tracking", label: "Order Tracking", icon: Package, default: true },
      { id: "returns", label: "Returns & Exchanges", icon: Package, default: true },
      { id: "billing", label: "Payment & Invoices", icon: Receipt, default: true },
      { id: "support", label: "Product Support", icon: HeadphonesIcon, default: true },
      { id: "offers", label: "Offers & Discounts", icon: Star, default: true },
    ],
  },
  {
    id: "general",
    name: "General Business",
    icon: Building2,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    description: "Any other business type",
    capabilities: [
      { id: "appointments", label: "Appointment Booking", icon: Calendar, default: true },
      { id: "reminders", label: "Reminders", icon: Bell, default: true },
      { id: "inquiries", label: "General Inquiries", icon: MessageSquare, default: true },
      { id: "billing", label: "Billing & Payments", icon: Receipt, default: true },
      { id: "support", label: "Customer Support", icon: HeadphonesIcon, default: true },
      { id: "feedback", label: "Feedback Collection", icon: Star, default: false },
    ],
  },
];

// Form schema
const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessCategory: z.string().min(1, "Please select a category"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  workingHours: z.string().optional(),
  description: z.string().max(500).optional(),
  capabilities: z.array(z.string()).min(1, "Select at least one capability"),
  customPrompt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WhatsAppAgentPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<typeof businessCategories[0] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessCategory: "",
      phone: "",
      email: "",
      address: "",
      workingHours: "",
      description: "",
      capabilities: [],
      customPrompt: "",
    },
  });

  // Watch for category changes
  const watchedCategory = form.watch("businessCategory");

  // Update selected category and default capabilities when category changes
  const handleCategorySelect = (categoryId: string) => {
    const category = businessCategories.find((c) => c.id === categoryId);
    setSelectedCategory(category || null);
    form.setValue("businessCategory", categoryId);
    
    if (category) {
      const defaultCapabilities = category.capabilities
        .filter((c) => c.default)
        .map((c) => c.id);
      form.setValue("capabilities", defaultCapabilities);
    }
  };

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const systemPrompt = generateSystemPrompt(data);
      const agentData = {
        name: `${data.businessName} WhatsApp Assistant`,
        description: data.description || `AI assistant for ${data.businessName}`,
        systemPrompt,
        welcomeMessage: generateWelcomeMessage(data),
        suggestedQuestions: generateSuggestedQuestions(data).join("\n"),
        agentType: "whatsapp",
        businessCategory: data.businessCategory,
        capabilities: data.capabilities,
        businessInfo: {
          name: data.businessName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          workingHours: data.workingHours,
        },
      };
      const response = await apiRequest("POST", "/api/agents", agentData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "WhatsApp Agent Created!",
        description: "Your business agent is ready to help customers",
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

  // Generate system prompt based on selected capabilities
  const generateSystemPrompt = (data: FormValues) => {
    const category = businessCategories.find((c) => c.id === data.businessCategory);
    const capabilityLabels = data.capabilities
      .map((capId) => category?.capabilities.find((c) => c.id === capId)?.label)
      .filter(Boolean);

    return `You are a helpful WhatsApp assistant for ${data.businessName}${category ? `, a ${category.name.toLowerCase()} business` : ""}.

## Business Information
- Business Name: ${data.businessName}
${data.phone ? `- Phone: ${data.phone}` : ""}
${data.email ? `- Email: ${data.email}` : ""}
${data.address ? `- Address: ${data.address}` : ""}
${data.workingHours ? `- Working Hours: ${data.workingHours}` : ""}

## Your Capabilities
You can help customers with:
${capabilityLabels.map((label) => `- ${label}`).join("\n")}

## Guidelines
1. Be friendly, professional, and conversational - remember this is WhatsApp, not email
2. Use short, clear messages - don't send walls of text
3. When collecting information, ask one thing at a time
4. Always confirm details before finalizing any booking/order
5. If you can't help with something, politely explain and suggest alternatives
6. Respond in the same language the customer uses
7. Use emojis sparingly to keep it friendly 😊

## Important Rules
- Never make up business information you don't have
- For appointments/bookings: collect name, phone, date/time preference, service needed
- For billing queries: always verify customer identity first
- For orders: confirm items, quantity, delivery address
- Always end with a helpful follow-up or call-to-action

${data.customPrompt ? `\n## Additional Instructions\n${data.customPrompt}` : ""}`;
  };

  // Generate welcome message
  const generateWelcomeMessage = (data: FormValues) => {
    return `👋 Hi! Welcome to ${data.businessName}!\n\nI'm your AI assistant and I'm here to help you with:\n${data.capabilities.slice(0, 4).map((cap) => {
      const category = businessCategories.find((c) => c.id === data.businessCategory);
      const capability = category?.capabilities.find((c) => c.id === cap);
      return `• ${capability?.label || cap}`;
    }).join("\n")}\n\nHow can I help you today?`;
  };

  // Generate suggested questions
  const generateSuggestedQuestions = (data: FormValues) => {
    const questions: string[] = [];
    const caps = data.capabilities;

    if (caps.includes("appointments") || caps.includes("reservations") || caps.includes("viewings")) {
      questions.push("I want to book an appointment");
    }
    if (caps.includes("billing") || caps.includes("fees")) {
      questions.push("Check my pending payment");
    }
    if (caps.includes("orders") || caps.includes("tracking")) {
      questions.push("Track my order status");
    }
    if (caps.includes("menu") || caps.includes("services") || caps.includes("catalog")) {
      questions.push("Show me your services/menu");
    }
    if (caps.includes("support") || caps.includes("inquiries")) {
      questions.push("I have a question");
    }

    return questions.slice(0, 4);
  };

  const handleSubmit = async (values: FormValues) => {
    await createAgentMutation.mutateAsync(values);
  };

  const steps = [
    { number: 1, title: "Business Type", description: "Select your category" },
    { number: 2, title: "Business Details", description: "Add your info" },
    { number: 3, title: "Capabilities", description: "Choose features" },
  ];

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
              <Smartphone className="h-6 w-6 text-green-500" />
              Create WhatsApp Business Agent
            </h1>
            <p className="text-muted-foreground">
              No website needed! Set up an AI agent for your business in minutes
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
            {/* Step 1: Select Business Category */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>What type of business do you have?</CardTitle>
                  <CardDescription>
                    Select the category that best describes your business. This helps us customize your agent's capabilities.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {businessCategories.map((category) => {
                      const Icon = category.icon;
                      const isSelected = watchedCategory === category.id;
                      return (
                        <div
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${category.bgColor}`}>
                              <Icon className={`h-5 w-5 ${category.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {category.description}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      disabled={!watchedCategory}
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {selectedCategory && (
                      <>
                        <selectedCategory.icon className={`h-5 w-5 ${selectedCategory.color}`} />
                        {selectedCategory.name} Details
                      </>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Tell us about your business. This information helps your agent assist customers better.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Business Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="+91 98765 43210" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="contact@business.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="123 Main Street, City, State" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Working Hours</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Mon-Sat: 9 AM - 6 PM" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brief Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us a bit about your business, services, or specialties..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This helps your agent understand your business better
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
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
                      disabled={!form.getValues("businessName")}
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Select Capabilities */}
            {currentStep === 3 && selectedCategory && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose Agent Capabilities</CardTitle>
                  <CardDescription>
                    Select what your WhatsApp agent can do. You can always change these later.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="capabilities"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedCategory.capabilities.map((capability) => {
                            const Icon = capability.icon;
                            return (
                              <FormField
                                key={capability.id}
                                control={form.control}
                                name="capabilities"
                                render={({ field }) => (
                                  <FormItem
                                    key={capability.id}
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
                                                field.value?.filter(
                                                  (value) => value !== capability.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="flex items-center gap-2 flex-1">
                                      <Icon className="h-4 w-4 text-muted-foreground" />
                                      <FormLabel className="font-normal cursor-pointer">
                                        {capability.label}
                                      </FormLabel>
                                    </div>
                                    {capability.default && (
                                      <Badge variant="secondary" className="text-xs">
                                        Recommended
                                      </Badge>
                                    )}
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

                  {/* Preview of what the agent will do */}
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-medium flex items-center gap-2 text-green-700 dark:text-green-300">
                      <MessageSquare className="h-4 w-4" />
                      Sample WhatsApp Conversation
                    </h4>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-2 max-w-[80%]">
                        <p className="text-green-600 dark:text-green-400 font-medium text-xs">
                          {form.getValues("businessName") || "Your Business"} Bot
                        </p>
                        <p>
                          👋 Hi! Welcome to {form.getValues("businessName") || "our business"}!
                          How can I help you today?
                        </p>
                      </div>
                      <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2 max-w-[80%] ml-auto">
                        <p>I want to book an appointment</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-2 max-w-[80%]">
                        <p>
                          Sure! I'd be happy to help you book an appointment. 📅
                          <br />
                          May I have your name please?
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Optional: Custom Instructions */}
                  <Accordion type="single" collapsible>
                    <AccordionItem value="custom">
                      <AccordionTrigger>
                        <span className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4" />
                          Add Custom Instructions (Optional)
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <FormField
                          control={form.control}
                          name="customPrompt"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add any specific instructions, rules, or information your agent should know..."
                                  rows={4}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                E.g., "We don't offer services on Sundays" or "Always ask for
                                customer ID for billing queries"
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

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
                          Create WhatsApp Agent
                        </>
                      )}
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
