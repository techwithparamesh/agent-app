import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import {
  LayoutTemplate,
  Search,
  ShoppingCart,
  HeadphonesIcon,
  GraduationCap,
  Building2,
  Stethoscope,
  UtensilsCrossed,
  Car,
  Home,
  Briefcase,
  Sparkles,
  ArrowRight,
  Bot,
  Check,
  Eye,
  Zap,
  Star,
  Clock,
  MessageSquare,
  Target,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  tags: string[];
  systemPrompt: string;
  suggestedQuestions: string[];
  color: string;
  bgColor: string;
  features: string[];
  useCases: string[];
  estimatedSetup: string;
  popularity: "High" | "Medium" | "New";
}

const templates: Template[] = [
  {
    id: "ecommerce",
    name: "E-Commerce Assistant",
    description: "Help customers find products, track orders, and handle returns with AI-powered shopping support",
    icon: ShoppingCart,
    category: "Retail",
    tags: ["Sales", "Support", "Products", "Orders"],
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    features: [
      "Product search & recommendations",
      "Order tracking assistance",
      "Return & refund processing",
      "Inventory queries",
      "Cart abandonment recovery",
    ],
    useCases: [
      "Online stores",
      "Marketplaces",
      "Retail websites",
    ],
    estimatedSetup: "5 mins",
    popularity: "High",
    systemPrompt: `You are a helpful e-commerce assistant. Help customers with:
- Finding products based on their needs and preferences
- Checking order status and shipping information
- Processing returns and exchanges
- Answering questions about products, pricing, and availability
- Providing personalized product recommendations based on browsing history
- Handling cart and checkout questions
Be friendly, efficient, and always aim to provide excellent customer service. If you don't know specific product details, ask clarifying questions.`,
    suggestedQuestions: [
      "Where is my order?",
      "What's your return policy?",
      "Do you have this in a different size?",
      "Can you recommend similar products?",
    ],
  },
  {
    id: "customer-support",
    name: "Customer Support Agent",
    description: "Handle inquiries, troubleshoot issues, and resolve complaints with empathy and efficiency",
    icon: HeadphonesIcon,
    category: "Support",
    tags: ["Help Desk", "Tickets", "FAQ", "Troubleshooting"],
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    features: [
      "Issue troubleshooting",
      "FAQ handling",
      "Complaint resolution",
      "Ticket escalation",
      "Follow-up management",
    ],
    useCases: [
      "SaaS companies",
      "Tech products",
      "Service businesses",
    ],
    estimatedSetup: "5 mins",
    popularity: "High",
    systemPrompt: `You are a professional customer support agent. Your role is to:
- Answer customer questions clearly and helpfully
- Troubleshoot common issues step by step
- Escalate complex issues when necessary
- Maintain a positive and empathetic tone
- Follow up to ensure customer satisfaction
- Document issues accurately for future reference
Always be patient, understanding, and solution-oriented. If you can't solve an issue, acknowledge it and explain the escalation process.`,
    suggestedQuestions: [
      "I need help with my account",
      "How do I reset my password?",
      "I'm having a technical issue",
      "Can I speak to a manager?",
    ],
  },
  {
    id: "education",
    name: "Educational Tutor",
    description: "Answer questions, explain concepts, and guide learning with personalized tutoring",
    icon: GraduationCap,
    category: "Education",
    tags: ["Learning", "Tutoring", "Courses", "Training"],
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    features: [
      "Concept explanations",
      "Course guidance",
      "Study tips & strategies",
      "Progress tracking",
      "Resource recommendations",
    ],
    useCases: [
      "Online courses",
      "Educational platforms",
      "Training portals",
    ],
    estimatedSetup: "5 mins",
    popularity: "Medium",
    systemPrompt: `You are an educational tutor assistant. Help students by:
- Explaining complex concepts in simple, understandable terms
- Answering questions about course material thoroughly
- Providing study tips and learning strategies
- Guiding students through problem-solving step by step
- Encouraging and motivating learners
- Adapting your explanations to the student's level of understanding
Be patient, encouraging, and break down difficult topics into manageable pieces. Use examples and analogies when helpful.`,
    suggestedQuestions: [
      "Can you explain this concept?",
      "What courses do you offer?",
      "How do I enroll in a class?",
      "Can you help me with this problem?",
    ],
  },
  {
    id: "real-estate",
    name: "Real Estate Agent",
    description: "Help clients find properties, schedule viewings, and answer questions about listings",
    icon: Home,
    category: "Real Estate",
    tags: ["Properties", "Listings", "Viewings", "Mortgages"],
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    features: [
      "Property search",
      "Viewing scheduling",
      "Neighborhood info",
      "Mortgage guidance",
      "Virtual tours",
    ],
    useCases: [
      "Real estate agencies",
      "Property portals",
      "Rental platforms",
    ],
    estimatedSetup: "5 mins",
    popularity: "Medium",
    systemPrompt: `You are a helpful real estate assistant. Assist clients with:
- Finding properties that match their criteria (location, budget, size, features)
- Providing information about listings, prices, and neighborhoods
- Scheduling property viewings and virtual tours
- Answering questions about the buying/renting process
- Explaining mortgage options and requirements
- Comparing different properties
Be knowledgeable, helpful, and guide clients through their property journey with patience.`,
    suggestedQuestions: [
      "Show me 3-bedroom homes under $500k",
      "What's the neighborhood like?",
      "Can I schedule a viewing?",
      "What documents do I need?",
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare Assistant",
    description: "Schedule appointments, answer FAQs, and provide health information to patients",
    icon: Stethoscope,
    category: "Healthcare",
    tags: ["Appointments", "Health Info", "Medical", "Insurance"],
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    features: [
      "Appointment scheduling",
      "Insurance verification",
      "Health FAQs",
      "Provider search",
      "Prescription inquiries",
    ],
    useCases: [
      "Medical clinics",
      "Hospitals",
      "Health platforms",
    ],
    estimatedSetup: "5 mins",
    popularity: "Medium",
    systemPrompt: `You are a healthcare assistant. Help patients with:
- Scheduling and managing appointments
- Providing general health information
- Answering questions about services and procedures
- Directing patients to appropriate resources
- Explaining insurance and billing questions
- Finding the right healthcare provider

Important: Always recommend consulting a healthcare professional for medical advice. Never diagnose conditions or prescribe treatments.`,
    suggestedQuestions: [
      "I need to book an appointment",
      "What are your office hours?",
      "Do you accept my insurance?",
      "How do I refill a prescription?",
    ],
  },
  {
    id: "restaurant",
    name: "Restaurant Concierge",
    description: "Take reservations, share menus, and answer dining questions for your restaurant",
    icon: UtensilsCrossed,
    category: "Hospitality",
    tags: ["Reservations", "Menu", "Dining", "Events"],
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    features: [
      "Table reservations",
      "Menu information",
      "Dietary accommodations",
      "Event planning",
      "Wait time updates",
    ],
    useCases: [
      "Restaurants",
      "Cafes",
      "Event venues",
    ],
    estimatedSetup: "5 mins",
    popularity: "Medium",
    systemPrompt: `You are a restaurant concierge assistant. Help guests with:
- Making and managing reservations (date, time, party size)
- Sharing menu information and daily specials
- Answering questions about dietary options and allergies
- Providing information about the restaurant ambiance and dress code
- Handling special requests for events or celebrations
- Giving directions and parking information
Be warm, welcoming, and create an excellent first impression of the restaurant.`,
    suggestedQuestions: [
      "I'd like to make a reservation",
      "What's on the menu?",
      "Do you have vegetarian options?",
      "Do you accommodate large parties?",
    ],
  },
  {
    id: "automotive",
    name: "Auto Dealership Agent",
    description: "Help customers explore vehicles, schedule test drives, and get quotes",
    icon: Car,
    category: "Automotive",
    tags: ["Vehicles", "Test Drives", "Financing", "Trade-ins"],
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    features: [
      "Vehicle search",
      "Test drive scheduling",
      "Financing options",
      "Trade-in estimates",
      "Feature comparisons",
    ],
    useCases: [
      "Car dealerships",
      "Auto marketplaces",
      "Fleet sales",
    ],
    estimatedSetup: "5 mins",
    popularity: "Medium",
    systemPrompt: `You are an automotive sales assistant. Help customers with:
- Finding vehicles that match their needs and budget
- Providing detailed vehicle specifications and features
- Scheduling test drives at convenient times
- Explaining financing and leasing options
- Answering questions about warranties and services
- Comparing different models and configurations
Be knowledgeable, helpful, and never pushy. Focus on understanding customer needs first.`,
    suggestedQuestions: [
      "What SUVs do you have in stock?",
      "Can I schedule a test drive?",
      "What financing options are available?",
      "Do you accept trade-ins?",
    ],
  },
  {
    id: "b2b-sales",
    name: "B2B Sales Assistant",
    description: "Qualify leads, answer product questions, and schedule demos for enterprise sales",
    icon: Building2,
    category: "Business",
    tags: ["Sales", "Demos", "Enterprise", "Lead Qualification"],
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    features: [
      "Lead qualification",
      "Demo scheduling",
      "Pricing information",
      "Feature explanations",
      "Competitor comparison",
    ],
    useCases: [
      "SaaS companies",
      "B2B services",
      "Enterprise sales",
    ],
    estimatedSetup: "5 mins",
    popularity: "High",
    systemPrompt: `You are a B2B sales assistant. Help potential clients by:
- Understanding their business needs and challenges
- Explaining product features and benefits clearly
- Providing pricing and package information
- Scheduling demos and consultations with sales team
- Answering technical and implementation questions
- Gathering relevant information for sales follow-up
Be professional, consultative, and focused on providing value. Qualify leads by understanding company size, budget, timeline, and decision-making process.`,
    suggestedQuestions: [
      "How does your product work?",
      "Can I see a demo?",
      "What's your pricing?",
      "How does implementation work?",
    ],
  },
  {
    id: "hr-assistant",
    name: "HR & Recruiting Bot",
    description: "Answer employee questions, screen candidates, and share job information",
    icon: Briefcase,
    category: "Human Resources",
    tags: ["Jobs", "Benefits", "Onboarding", "Recruiting"],
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    features: [
      "Job listings",
      "Application screening",
      "Benefits information",
      "Onboarding help",
      "Policy FAQs",
    ],
    useCases: [
      "HR departments",
      "Recruiting agencies",
      "Career pages",
    ],
    estimatedSetup: "5 mins",
    popularity: "New",
    systemPrompt: `You are an HR and recruiting assistant. Help with:
- Answering questions about job openings and requirements
- Explaining company benefits and policies
- Guiding candidates through the application process
- Providing information about company culture and values
- Assisting employees with HR-related questions
- Scheduling interviews and follow-ups
Be professional, informative, and represent the company positively. Respect confidentiality of HR matters.`,
    suggestedQuestions: [
      "What positions are you hiring for?",
      "What are the benefits?",
      "How do I apply?",
      "What's the interview process?",
    ],
  },
];

const categories = [
  { value: "all", label: "All Categories" },
  { value: "Retail", label: "Retail & E-Commerce" },
  { value: "Support", label: "Customer Support" },
  { value: "Education", label: "Education & Training" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Automotive", label: "Automotive" },
  { value: "Business", label: "Business & B2B" },
  { value: "Human Resources", label: "Human Resources" },
];

export default function TemplatesPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Read category from URL query parameter and react to URL changes
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      // Reset to "all" when no category param (user clicked on Templates main link)
      setSelectedCategory("all");
    }
  }, [searchString, location]);

  // Update URL when category changes via dropdown
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value === "all") {
      setLocation("/dashboard/templates");
    } else {
      setLocation(`/dashboard/templates?category=${encodeURIComponent(value)}`);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: Template) => {
    // Store template in sessionStorage for the create agent page to pick up
    sessionStorage.setItem("agentTemplate", JSON.stringify({
      name: template.name,
      systemPrompt: template.systemPrompt,
      suggestedQuestions: template.suggestedQuestions,
      category: template.category,
    }));
    
    toast({
      title: "Template selected!",
      description: `Creating new agent with "${template.name}" template.`,
    });
    
    setLocation("/dashboard/agents/new");
  };

  const getPopularityBadge = (popularity: string) => {
    switch (popularity) {
      case "High":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><Star className="h-3 w-3 mr-1" /> Popular</Badge>;
      case "New":
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><Zap className="h-3 w-3 mr-1" /> New</Badge>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <LayoutTemplate className="h-8 w-8 text-primary" />
              {selectedCategory === "all" ? "Agent Templates" : `${selectedCategory} Templates`}
            </h1>
            <p className="text-muted-foreground mt-1">
              {selectedCategory === "all" 
                ? "Start quickly with pre-built AI agent templates optimized for your industry"
                : `Browse ${filteredTemplates.length} template${filteredTemplates.length !== 1 ? 's' : ''} in the ${selectedCategory} category`
              }
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bot className="h-4 w-4" />
            <span>{filteredTemplates.length} of {templates.length} templates</span>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, category, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Stats Row - Shows counts based on current filter */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutTemplate className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredTemplates.length}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedCategory === "all" ? "Total Templates" : `${selectedCategory} Templates`}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredTemplates.filter(t => t.popularity === "High").length}</p>
                <p className="text-xs text-muted-foreground">Popular</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredTemplates.filter(t => t.popularity === "New").length}</p>
                <p className="text-xs text-muted-foreground">New Templates</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">5 min</p>
                <p className="text-xs text-muted-foreground">Avg. Setup</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${template.bgColor}`}>
                      <Icon className={`h-6 w-6 ${template.color}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      {getPopularityBadge(template.popularity)}
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Clock className="h-3 w-3" />
                    <span>{template.estimatedSetup} setup</span>
                    <span className="text-muted-foreground/50">•</span>
                    <MessageSquare className="h-3 w-3" />
                    <span>{template.suggestedQuestions.length} starter prompts</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplate(template);
                      }}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 group-hover:bg-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template);
                      }}
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      Use
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <LayoutTemplate className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No templates found</p>
              <p className="text-sm">Try adjusting your search or category filter</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Template Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            {previewTemplate && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${previewTemplate.bgColor}`}>
                      <previewTemplate.icon className={`h-6 w-6 ${previewTemplate.color}`} />
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{previewTemplate.name}</DialogTitle>
                      <DialogDescription>{previewTemplate.description}</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 mt-4">
                  {/* Features */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {previewTemplate.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Best For
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {previewTemplate.useCases.map((useCase, i) => (
                        <Badge key={i} variant="outline">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Suggested Questions */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Starter Questions
                    </h4>
                    <div className="space-y-2">
                      {previewTemplate.suggestedQuestions.map((q, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground">"{q}"</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Prompt Preview */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      AI Behavior Preview
                    </h4>
                    <div className="p-3 rounded-lg bg-muted/50 text-sm font-mono max-h-32 overflow-y-auto">
                      {previewTemplate.systemPrompt.slice(0, 300)}...
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPreviewTemplate(null)}
                    >
                      Close
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        handleUseTemplate(previewTemplate);
                        setPreviewTemplate(null);
                      }}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Use This Template
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
