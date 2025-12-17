import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import type { Agent } from "@shared/schema";
import { 
  Bot, 
  ArrowLeft, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  MessageCircle,
  Smartphone,
  Stethoscope,
  UtensilsCrossed,
  Car,
  Home,
  GraduationCap,
  Briefcase,
  ShoppingCart,
  Calendar,
  Bell,
  FileText,
  Receipt,
  CreditCard,
  MapPin,
  Users,
  Package,
  Clock,
  HeadphonesIcon,
  Star,
  TrendingUp,
  Building2,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

// Business categories with their specific capabilities (same as creation form)
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
    customFields: [
      { id: "specialties", label: "Specialties / Services", placeholder: "e.g., General Medicine, Pediatrics, Dental, Physiotherapy" },
      { id: "doctors", label: "Doctor Names", placeholder: "e.g., Dr. John Smith, Dr. Sarah Johnson" },
      { id: "insurance", label: "Insurance Accepted", placeholder: "e.g., Star Health, ICICI Lombard, Mediassist" },
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
      { id: "feedback", label: "Feedback Collection", icon: MessageCircle, default: false },
      { id: "billing", label: "Payment & Billing", icon: Receipt, default: true },
    ],
    customFields: [
      { id: "services", label: "Services Offered", placeholder: "e.g., Haircut, Facial, Manicure, Pedicure, Massage" },
      { id: "stylists", label: "Stylist Names", placeholder: "e.g., Priya, Rahul, Anita" },
      { id: "pricing", label: "Price Range", placeholder: "e.g., ₹200 - ₹5000" },
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
      { id: "feedback", label: "Feedback & Reviews", icon: MessageCircle, default: false },
      { id: "billing", label: "Bill Payment", icon: Receipt, default: true },
    ],
    customFields: [
      { id: "cuisine", label: "Cuisine Type", placeholder: "e.g., Indian, Chinese, Italian, Multi-cuisine" },
      { id: "specialties", label: "Signature Dishes", placeholder: "e.g., Butter Chicken, Biryani, Pizza" },
      { id: "delivery", label: "Delivery Options", placeholder: "e.g., Swiggy, Zomato, Direct delivery" },
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
    customFields: [
      { id: "services", label: "Services Offered", placeholder: "e.g., General Service, Oil Change, Brake Repair, AC Service" },
      { id: "brands", label: "Vehicle Brands Serviced", placeholder: "e.g., All brands, Maruti, Honda, Hyundai" },
      { id: "pricing", label: "Starting Price", placeholder: "e.g., Service from ₹2999" },
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
    customFields: [
      { id: "courses", label: "Courses / Subjects", placeholder: "e.g., Mathematics, Science, English, Coding" },
      { id: "levels", label: "Class Levels", placeholder: "e.g., Class 6-12, Competitive Exams, Professional" },
      { id: "mode", label: "Teaching Mode", placeholder: "e.g., Online, Offline, Hybrid" },
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
      { id: "inquiries", label: "Property Inquiries", icon: MessageCircle, default: true },
      { id: "pricing", label: "Pricing & EMI Info", icon: Receipt, default: true },
      { id: "documents", label: "Document Collection", icon: FileText, default: false },
      { id: "updates", label: "Construction Updates", icon: Building2, default: false },
    ],
    customFields: [
      { id: "properties", label: "Property Types", placeholder: "e.g., Apartments, Villas, Plots, Commercial" },
      { id: "locations", label: "Areas Covered", placeholder: "e.g., Downtown, Suburbs, City Name" },
      { id: "priceRange", label: "Price Range", placeholder: "e.g., ₹50L - ₹2Cr" },
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
    customFields: [
      { id: "services", label: "Services Offered", placeholder: "e.g., Tax Filing, Legal Consultation, Business Advisory" },
      { id: "expertise", label: "Areas of Expertise", placeholder: "e.g., Corporate Law, GST, Financial Planning" },
      { id: "consultationFee", label: "Consultation Fee", placeholder: "e.g., ₹500 for 30 mins" },
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
    customFields: [
      { id: "products", label: "Product Categories", placeholder: "e.g., Electronics, Clothing, Home Decor" },
      { id: "deliveryAreas", label: "Delivery Areas", placeholder: "e.g., All India, City-specific, International" },
      { id: "paymentModes", label: "Payment Options", placeholder: "e.g., UPI, COD, Credit Card, EMI" },
    ],
  },
  {
    id: "general",
    name: "General Business",
    icon: Building2,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    description: "Other business types",
    capabilities: [
      { id: "appointments", label: "Appointment Booking", icon: Calendar, default: true },
      { id: "reminders", label: "Reminders", icon: Bell, default: true },
      { id: "support", label: "Customer Support", icon: HeadphonesIcon, default: true },
      { id: "billing", label: "Billing Inquiries", icon: Receipt, default: true },
      { id: "directions", label: "Location & Directions", icon: MapPin, default: true },
      { id: "faq", label: "FAQ & Information", icon: FileText, default: true },
    ],
    customFields: [
      { id: "services", label: "Services Offered", placeholder: "Describe your main services" },
      { id: "highlights", label: "Key Highlights", placeholder: "What makes you unique?" },
    ],
  },
];

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
  { value: "customer_support", label: "Customer Support" },
  { value: "informational", label: "Informational - Provide information" },
  { value: "lead_generation", label: "Lead Generation - Collect leads" },
  { value: "booking", label: "Booking - Schedule appointments" },
  { value: "education", label: "Education - Teaching and tutoring" },
  { value: "hr", label: "HR - Recruiting and employee support" },
];

// Form schema for website agents
const websiteFormSchema = z.object({
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

// Form schema for WhatsApp agents
const whatsappFormSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(255),
  description: z.string().max(1000).optional(),
  systemPrompt: z.string().max(5000).optional(),
  toneOfVoice: z.string().optional(),
  purpose: z.string().optional(),
  welcomeMessage: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  // Business Info
  businessName: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().optional(),
  businessAddress: z.string().optional(),
  businessHours: z.string().optional(),
  businessDescription: z.string().optional(),
  // Capabilities (as array of strings)
  capabilities: z.array(z.string()).optional(),
});

type WebsiteFormValues = z.infer<typeof websiteFormSchema>;
type WhatsAppFormValues = z.infer<typeof whatsappFormSchema>;

export default function EditAgent() {
  const [, params] = useRoute("/dashboard/agents/:id/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const agentId = params?.id;
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  const { data: agent, isLoading, error } = useQuery<Agent>({
    queryKey: ["/api/agents", agentId],
    enabled: !!agentId,
  });

  const isWhatsAppAgent = agent?.agentType === 'whatsapp';
  
  // Get category with guaranteed fallback
  const generalCategory = businessCategories.find(c => c.id === 'general') || businessCategories[0];
  const currentCategory = (agent?.businessCategory 
    ? businessCategories.find(c => c.id === agent.businessCategory) 
    : generalCategory) || generalCategory;

  // Website agent form
  const websiteForm = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteFormSchema),
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

  // WhatsApp agent form
  const whatsappForm = useForm<WhatsAppFormValues>({
    resolver: zodResolver(whatsappFormSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
      toneOfVoice: "friendly",
      purpose: "customer_support",
      welcomeMessage: "",
      isActive: true,
      businessName: "",
      businessPhone: "",
      businessEmail: "",
      businessAddress: "",
      businessHours: "",
      businessDescription: "",
      capabilities: [],
    },
  });

  // Populate form when agent data loads
  useEffect(() => {
    if (agent) {
      if (agent.agentType === 'whatsapp') {
        const businessInfo = agent.businessInfo as any || {};
        whatsappForm.reset({
          name: agent.name,
          description: agent.description || "",
          systemPrompt: agent.systemPrompt || "",
          toneOfVoice: agent.toneOfVoice || "friendly",
          purpose: agent.purpose || "customer_support",
          welcomeMessage: agent.welcomeMessage || "",
          isActive: agent.isActive ?? true,
          businessName: businessInfo.name || "",
          businessPhone: businessInfo.phone || "",
          businessEmail: businessInfo.email || "",
          businessAddress: businessInfo.address || "",
          businessHours: businessInfo.workingHours || "",
          businessDescription: businessInfo.description || "",
          capabilities: (agent.capabilities as string[]) || [],
        });
        setSelectedCapabilities((agent.capabilities as string[]) || []);
        
        // Load custom fields from businessInfo
        const customFields: Record<string, string> = {};
        if (businessInfo) {
          Object.keys(businessInfo).forEach(key => {
            if (!['name', 'phone', 'email', 'address', 'workingHours', 'description'].includes(key)) {
              customFields[key] = businessInfo[key] || '';
            }
          });
        }
        setCustomFieldValues(customFields);
      } else {
        websiteForm.reset({
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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent]);

  // Website agent update mutation
  const updateWebsiteMutation = useMutation({
    mutationFn: async (data: WebsiteFormValues) => {
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

  // WhatsApp agent update mutation
  const updateWhatsAppMutation = useMutation({
    mutationFn: async (data: WhatsAppFormValues) => {
      // Build businessInfo object including custom fields
      const businessInfo: Record<string, any> = {
        name: data.businessName || null,
        phone: data.businessPhone || null,
        email: data.businessEmail || null,
        address: data.businessAddress || null,
        workingHours: data.businessHours || null,
        description: data.businessDescription || null,
      };
      
      // Add custom field values
      Object.keys(customFieldValues).forEach(key => {
        if (customFieldValues[key]) {
          businessInfo[key] = customFieldValues[key];
        }
      });

      const cleanedData = {
        name: data.name,
        description: data.description || null,
        systemPrompt: data.systemPrompt || null,
        toneOfVoice: data.toneOfVoice || null,
        purpose: data.purpose || null,
        welcomeMessage: data.welcomeMessage || null,
        isActive: data.isActive,
        capabilities: selectedCapabilities,
        businessInfo: businessInfo,
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

  const onWebsiteSubmit = (data: WebsiteFormValues) => {
    updateWebsiteMutation.mutate(data);
  };

  const onWhatsAppSubmit = (data: WhatsAppFormValues) => {
    updateWhatsAppMutation.mutate(data);
  };

  const toggleCapability = (capId: string) => {
    setSelectedCapabilities(prev => 
      prev.includes(capId) 
        ? prev.filter(c => c !== capId)
        : [...prev, capId]
    );
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

  if (error) {
    return (
      <DashboardLayout title="Error">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Error Loading Agent</h2>
          <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
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

  // Render WhatsApp Agent Edit Form
  if (isWhatsAppAgent) {
    const CategoryIcon = currentCategory.icon;
    
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
                <div className={`w-12 h-12 rounded-lg ${currentCategory.bgColor} flex items-center justify-center`}>
                  <Smartphone className={`h-6 w-6 ${currentCategory.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="font-display text-2xl">Edit WhatsApp Agent</CardTitle>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                      <Smartphone className="h-3 w-3 mr-1" />
                      WhatsApp
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <CategoryIcon className={`h-4 w-4 ${currentCategory.color}`} />
                    {currentCategory.name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...whatsappForm}>
                <form onSubmit={whatsappForm.handleSubmit(onWhatsAppSubmit)} className="space-y-6">
                  {/* Status Toggle */}
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="text-sm font-medium">Active Status</p>
                      <p className="text-sm text-muted-foreground">
                        Disable to pause this agent
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={whatsappForm.watch("isActive") ? "default" : "outline"}
                      size="sm"
                      onClick={() => whatsappForm.setValue("isActive", !whatsappForm.watch("isActive"))}
                      className={whatsappForm.watch("isActive") ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {whatsappForm.watch("isActive") ? "Active" : "Inactive"}
                    </Button>
                  </div>

                  {/* Basic Info Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Basic Information
                    </h3>

                    <FormField
                      control={whatsappForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agent Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={whatsappForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea rows={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Business Information Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Business Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={whatsappForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Business Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={whatsappForm.control}
                        name="businessPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" placeholder="+91 98765 43210" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={whatsappForm.control}
                        name="businessEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" placeholder="contact@business.com" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={whatsappForm.control}
                        name="businessHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Working Hours</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" placeholder="Mon-Sat: 9 AM - 6 PM" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={whatsappForm.control}
                      name="businessAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-10" placeholder="123 Main Street, City, State" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={whatsappForm.control}
                      name="businessDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brief Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              rows={3} 
                              placeholder="Tell us a bit about your business, services, or specialties..."
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            This helps your agent understand your business better
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Category-specific Custom Fields */}
                  {currentCategory.customFields && currentCategory.customFields.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <CategoryIcon className={`h-4 w-4 ${currentCategory.color}`} />
                        {currentCategory.name} Specific Information
                      </h3>

                      {currentCategory.customFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <label className="text-sm font-medium">{field.label}</label>
                          <Input
                            placeholder={field.placeholder}
                            value={customFieldValues[field.id] || ''}
                            onChange={(e) => setCustomFieldValues(prev => ({
                              ...prev,
                              [field.id]: e.target.value
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  {/* Capabilities Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Agent Capabilities
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select the features your WhatsApp agent should support
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentCategory.capabilities.map((cap) => {
                        const CapIcon = cap.icon;
                        const isSelected = selectedCapabilities.includes(cap.id);
                        return (
                          <div
                            key={cap.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-muted-foreground/50'
                            }`}
                            onClick={() => toggleCapability(cap.id)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCapability(cap.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                            />
                            <CapIcon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-sm font-medium">{cap.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Behavior Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Agent Behavior
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tone of Voice</label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={whatsappForm.watch("toneOfVoice") || "professional"}
                          onChange={(e) => whatsappForm.setValue("toneOfVoice", e.target.value)}
                        >
                          {toneOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Purpose</label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={whatsappForm.watch("purpose") || "customer_support"}
                          onChange={(e) => whatsappForm.setValue("purpose", e.target.value)}
                        >
                          {purposeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <FormField
                      control={whatsappForm.control}
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
                            The first message users see when they message on WhatsApp
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={whatsappForm.control}
                      name="systemPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>System Prompt (Advanced)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Define how your AI agent should behave..."
                              rows={4}
                              className="font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Custom instructions for the AI (leave empty to use auto-generated prompt)
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
                      disabled={updateWhatsAppMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      {updateWhatsAppMutation.isPending ? (
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

  // Render Website Agent Edit Form (original)
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
                <div className="flex items-center gap-2">
                  <CardTitle className="font-display text-2xl">Edit Agent</CardTitle>
                  <Badge variant="outline">
                    <Globe className="h-3 w-3 mr-1" />
                    Website
                  </Badge>
                </div>
                <CardDescription>
                  Update your agent's configuration and behavior
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...websiteForm}>
              <form onSubmit={websiteForm.handleSubmit(onWebsiteSubmit)} className="space-y-6">
                {/* Status Toggle */}
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">Active Status</p>
                    <p className="text-sm text-muted-foreground">
                      Disable to pause this agent
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={websiteForm.watch("isActive") ? "default" : "outline"}
                    size="sm"
                    onClick={() => websiteForm.setValue("isActive", !websiteForm.watch("isActive"))}
                    className={websiteForm.watch("isActive") ? "bg-green-600 hover:bg-green-700" : ""}
                    data-testid="switch-agent-active"
                  >
                    {websiteForm.watch("isActive") ? "Active" : "Inactive"}
                  </Button>
                </div>

                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={websiteForm.control}
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
                      control={websiteForm.control}
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
                    control={websiteForm.control}
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tone of Voice</label>
                      <select
                        data-testid="select-edit-agent-tone"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={websiteForm.watch("toneOfVoice") || "friendly"}
                        onChange={(e) => websiteForm.setValue("toneOfVoice", e.target.value)}
                      >
                        {toneOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Purpose</label>
                      <select
                        data-testid="select-edit-agent-purpose"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={websiteForm.watch("purpose") || "support"}
                        onChange={(e) => websiteForm.setValue("purpose", e.target.value)}
                      >
                        {purposeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <FormField
                    control={websiteForm.control}
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
                    control={websiteForm.control}
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
                    control={websiteForm.control}
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
                    disabled={updateWebsiteMutation.isPending}
                    className="w-full sm:w-auto"
                    data-testid="button-save-agent"
                  >
                    {updateWebsiteMutation.isPending ? (
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
