import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
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
}

const templates: Template[] = [
  {
    id: "ecommerce",
    name: "E-Commerce Assistant",
    description: "Help customers find products, track orders, and handle returns",
    icon: ShoppingCart,
    category: "Retail",
    tags: ["Sales", "Support", "Products"],
    color: "text-orange-500",
    systemPrompt: `You are a helpful e-commerce assistant. Help customers with:
- Finding products based on their needs
- Checking order status and shipping information
- Processing returns and exchanges
- Answering questions about products, pricing, and availability
- Providing personalized product recommendations
Be friendly, efficient, and always aim to provide excellent customer service.`,
    suggestedQuestions: [
      "Where is my order?",
      "What's your return policy?",
      "Do you have this in a different size?",
    ],
  },
  {
    id: "customer-support",
    name: "Customer Support Agent",
    description: "Handle inquiries, troubleshoot issues, and resolve complaints",
    icon: HeadphonesIcon,
    category: "Support",
    tags: ["Help Desk", "Tickets", "FAQ"],
    color: "text-blue-500",
    systemPrompt: `You are a professional customer support agent. Your role is to:
- Answer customer questions clearly and helpfully
- Troubleshoot common issues step by step
- Escalate complex issues when necessary
- Maintain a positive and empathetic tone
- Follow up to ensure customer satisfaction
Always be patient, understanding, and solution-oriented.`,
    suggestedQuestions: [
      "I need help with my account",
      "How do I reset my password?",
      "I'm having a technical issue",
    ],
  },
  {
    id: "education",
    name: "Educational Tutor",
    description: "Answer questions, explain concepts, and guide learning",
    icon: GraduationCap,
    category: "Education",
    tags: ["Learning", "Tutoring", "Courses"],
    color: "text-green-500",
    systemPrompt: `You are an educational tutor assistant. Help students by:
- Explaining complex concepts in simple terms
- Answering questions about course material
- Providing study tips and learning strategies
- Guiding students through problem-solving
- Encouraging and motivating learners
Adapt your explanations to the student's level of understanding.`,
    suggestedQuestions: [
      "Can you explain this concept?",
      "What courses do you offer?",
      "How do I enroll in a class?",
    ],
  },
  {
    id: "real-estate",
    name: "Real Estate Agent",
    description: "Help clients find properties, schedule viewings, and answer questions",
    icon: Home,
    category: "Real Estate",
    tags: ["Properties", "Listings", "Viewings"],
    color: "text-emerald-500",
    systemPrompt: `You are a helpful real estate assistant. Assist clients with:
- Finding properties that match their criteria
- Providing information about listings, prices, and neighborhoods
- Scheduling property viewings
- Answering questions about the buying/renting process
- Explaining mortgage options and requirements
Be knowledgeable, helpful, and guide clients through their property journey.`,
    suggestedQuestions: [
      "Show me 3-bedroom homes under $500k",
      "What's the neighborhood like?",
      "Can I schedule a viewing?",
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare Assistant",
    description: "Schedule appointments, answer FAQs, and provide health information",
    icon: Stethoscope,
    category: "Healthcare",
    tags: ["Appointments", "Health Info", "Medical"],
    color: "text-red-500",
    systemPrompt: `You are a healthcare assistant. Help patients with:
- Scheduling and managing appointments
- Providing general health information
- Answering questions about services and procedures
- Directing patients to appropriate resources
- Explaining insurance and billing questions
Important: Always recommend consulting a healthcare professional for medical advice.`,
    suggestedQuestions: [
      "I need to book an appointment",
      "What are your office hours?",
      "Do you accept my insurance?",
    ],
  },
  {
    id: "restaurant",
    name: "Restaurant Concierge",
    description: "Take reservations, share menus, and answer dining questions",
    icon: UtensilsCrossed,
    category: "Hospitality",
    tags: ["Reservations", "Menu", "Dining"],
    color: "text-amber-500",
    systemPrompt: `You are a restaurant concierge assistant. Help guests with:
- Making and managing reservations
- Sharing menu information and daily specials
- Answering questions about dietary options and allergies
- Providing information about the restaurant and ambiance
- Handling special requests for events or celebrations
Be warm, welcoming, and create an excellent first impression.`,
    suggestedQuestions: [
      "I'd like to make a reservation",
      "What's on the menu?",
      "Do you have vegetarian options?",
    ],
  },
  {
    id: "automotive",
    name: "Auto Dealership Agent",
    description: "Help customers explore vehicles, schedule test drives, and get quotes",
    icon: Car,
    category: "Automotive",
    tags: ["Vehicles", "Test Drives", "Financing"],
    color: "text-slate-500",
    systemPrompt: `You are an automotive sales assistant. Help customers with:
- Finding vehicles that match their needs and budget
- Providing detailed vehicle specifications and features
- Scheduling test drives
- Explaining financing and leasing options
- Answering questions about warranties and services
Be knowledgeable, helpful, and never pushy.`,
    suggestedQuestions: [
      "What SUVs do you have in stock?",
      "Can I schedule a test drive?",
      "What financing options are available?",
    ],
  },
  {
    id: "b2b-sales",
    name: "B2B Sales Assistant",
    description: "Qualify leads, answer product questions, and schedule demos",
    icon: Building2,
    category: "Business",
    tags: ["Sales", "Demos", "Enterprise"],
    color: "text-violet-500",
    systemPrompt: `You are a B2B sales assistant. Help potential clients by:
- Understanding their business needs and challenges
- Explaining product features and benefits
- Providing pricing and package information
- Scheduling demos and consultations
- Answering technical and implementation questions
Be professional, consultative, and focused on providing value.`,
    suggestedQuestions: [
      "How does your product work?",
      "Can I see a demo?",
      "What's your pricing?",
    ],
  },
  {
    id: "hr-assistant",
    name: "HR & Recruiting Bot",
    description: "Answer employee questions, screen candidates, and share job info",
    icon: Briefcase,
    category: "Human Resources",
    tags: ["Jobs", "Benefits", "Onboarding"],
    color: "text-pink-500",
    systemPrompt: `You are an HR and recruiting assistant. Help with:
- Answering questions about job openings and requirements
- Explaining company benefits and policies
- Guiding candidates through the application process
- Providing information about company culture
- Assisting employees with HR-related questions
Be professional, informative, and represent the company positively.`,
    suggestedQuestions: [
      "What positions are you hiring for?",
      "What are the benefits?",
      "How do I apply?",
    ],
  },
];

const categories = ["All", ...new Set(templates.map((t) => t.category))];

export default function TemplatesPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: Template) => {
    // Store template in sessionStorage for the create agent page to pick up
    sessionStorage.setItem("agentTemplate", JSON.stringify({
      name: template.name,
      systemPrompt: template.systemPrompt,
      suggestedQuestions: template.suggestedQuestions,
    }));
    
    toast({
      title: "Template selected!",
      description: `Creating new agent with "${template.name}" template.`,
    });
    
    setLocation("/dashboard/agents/new");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <LayoutTemplate className="h-8 w-8 text-primary" />
              Agent Templates
            </h1>
            <p className="text-muted-foreground mt-1">
              Start quickly with pre-built AI agent templates for common use cases
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className={`group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${
                  selectedTemplate?.id === template.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg bg-muted ${template.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template);
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Use Template
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
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
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          </Card>
        )}

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <Card className="fixed bottom-4 right-4 w-96 shadow-2xl border-primary/20 z-50 animate-in slide-in-from-bottom-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <selectedTemplate.icon className={`h-5 w-5 ${selectedTemplate.color}`} />
                  <CardTitle className="text-base">{selectedTemplate.name}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">SUGGESTED QUESTIONS</p>
                <div className="space-y-1.5">
                  {selectedTemplate.suggestedQuestions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-3 w-3 text-green-500" />
                      {q}
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => handleUseTemplate(selectedTemplate)}
              >
                <Bot className="mr-2 h-4 w-4" />
                Create Agent with Template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
