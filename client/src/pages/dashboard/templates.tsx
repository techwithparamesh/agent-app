import { useState, useEffect, useMemo } from "react";
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
import { isTemplateCategory, templateCategories } from "@/data/templateCategories";
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
  TrendingUp,
  Bell,
  Receipt,
  Package,
  Users,
  Calendar,
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
  toneOfVoice?: string;
  purpose?: string;
  welcomeMessage?: string;
}

const templates: Template[] = [
  {
    id: "ecommerce",
    name: "E-Commerce Assistant",
    description: "Help customers find products, track orders, and handle returns with AI-powered shopping support",
    icon: ShoppingCart,
    category: "Retail",
    tags: ["Sales", "Support", "Products", "Orders"],
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    color: "text-primary",
    bgColor: "bg-primary/10",
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
    color: "text-primary",
    bgColor: "bg-primary/10",
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
  // NEW TEMPLATES FOR WHATSAPP USE CASES
  {
    id: "appointment-booking",
    name: "Appointment Booking Agent",
    description: "Perfect for clinics, salons, consultants - schedule, reschedule, and manage appointments via chat",
    icon: Clock,
    category: "Appointments",
    tags: ["WhatsApp", "Booking", "Schedule", "Calendar", "Reminders"],
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: [
      "Book new appointments",
      "Reschedule existing bookings",
      "Cancel appointments",
      "Check availability",
      "Send appointment reminders",
      "Collect customer details",
    ],
    useCases: [
      "Medical clinics",
      "Beauty salons",
      "Consultants",
      "Service businesses",
    ],
    estimatedSetup: "3 mins",
    popularity: "High",
    systemPrompt: `You are a friendly appointment booking assistant.

## Your Role
Help customers book, reschedule, or cancel appointments in a conversational way.

## When booking appointments, collect:
1. Customer's full name
2. Phone number
3. Service they need
4. Preferred date and time
5. Any special requests

## Guidelines
- Be conversational, collect info one question at a time
- If requested slot is unavailable, suggest alternatives
- Always confirm booking details before finalizing
- Send a summary at the end
- Respond in the same language the customer uses

## Example Flow
User: "I want to book an appointment"
You: "Sure! I'd be happy to help. May I have your name please?"
[Collect name]
You: "Thanks [Name]! What service would you like to book?"
[Collect service]
You: "When would you prefer - any specific date and time?"
[Continue naturally...]`,
    suggestedQuestions: [
      "I want to book an appointment",
      "What time slots are available?",
      "Can I reschedule my booking?",
      "Cancel my appointment",
    ],
  },
  {
    id: "billing-invoicing",
    name: "Billing & Invoice Agent",
    description: "Handle payment queries, send invoices, payment reminders, and billing support via WhatsApp",
    icon: Building2,
    category: "Billing",
    tags: ["WhatsApp", "Invoice", "Payment", "Billing", "Reminders"],
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: [
      "Send invoices on request",
      "Payment reminders",
      "Share payment links",
      "Confirm payments received",
      "Outstanding balance queries",
      "Payment history",
    ],
    useCases: [
      "Service businesses",
      "Freelancers",
      "Small businesses",
      "Subscription services",
    ],
    estimatedSetup: "3 mins",
    popularity: "New",
    systemPrompt: `You are a helpful billing assistant.

## Your Role
Help customers with payment and invoice related queries.

## What I can help with
1. Send invoice copies via email/WhatsApp
2. Check outstanding balance
3. Share payment links (UPI, Card, NetBanking)
4. Confirm payment receipt
5. Payment reminders

## When handling billing queries:
- Always verify customer identity with registered phone/email
- Provide clear payment information
- Offer multiple payment options
- Be patient with payment concerns

## Guidelines
- Be professional and helpful
- Confirm details before sharing sensitive info
- Provide payment link formats: UPI, Card, NetBanking
- Mention payment due dates clearly`,
    suggestedQuestions: [
      "Send me my invoice",
      "What's my pending balance?",
      "I've made a payment",
      "Send me the payment link",
    ],
  },
  {
    id: "lead-generation",
    name: "Lead Generation Agent",
    description: "Capture leads, qualify prospects, schedule demos, and nurture potential customers",
    icon: TrendingUp,
    category: "Sales",
    tags: ["WhatsApp", "Leads", "Sales", "Demo", "Qualification"],
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: [
      "Capture lead information",
      "Qualify prospects",
      "Schedule demos/calls",
      "Answer product questions",
      "Share pricing info",
      "Follow-up automation",
    ],
    useCases: [
      "SaaS companies",
      "B2B services",
      "Agencies",
      "Consultants",
    ],
    estimatedSetup: "3 mins",
    popularity: "High",
    systemPrompt: `You are a helpful sales assistant.

## Your Role
Engage with potential customers, understand their needs, and capture lead information.

## When interacting with prospects:
1. Greet warmly and understand their needs
2. Answer questions about products/services
3. Highlight benefits (not just features)
4. Capture: Name, Company, Email, Phone, Requirements
5. Offer to schedule a demo or callback

## Guidelines
- Be enthusiastic but not pushy
- Ask qualifying questions naturally
- Focus on how you can solve their problems
- Always offer next steps (demo, call, quote)
- Respond in customer's language`,
    suggestedQuestions: [
      "Tell me about your services",
      "How much does it cost?",
      "Can I see a demo?",
      "I'm interested, please call me",
    ],
  },
  {
    id: "order-support",
    name: "Order & Delivery Support",
    description: "Track orders, handle returns, delivery updates, and e-commerce customer support",
    icon: ShoppingCart,
    category: "Orders",
    tags: ["WhatsApp", "Orders", "Delivery", "Returns", "Tracking"],
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: [
      "Order status tracking",
      "Delivery updates",
      "Return/exchange requests",
      "Order cancellation",
      "Refund status",
      "Reordering",
    ],
    useCases: [
      "E-commerce stores",
      "D2C brands",
      "Online retailers",
      "Marketplaces",
    ],
    estimatedSetup: "3 mins",
    popularity: "High",
    systemPrompt: `You are a helpful order support assistant.

## Your Role
Help customers with order tracking, returns, and delivery queries.

## What I can help with
1. Track order status
2. Provide delivery updates
3. Process return/exchange requests
4. Handle order cancellations
5. Check refund status
6. Help with reorders

## When handling order queries:
- Ask for Order ID or registered phone number
- Provide clear status updates
- Explain return/refund policies
- Be empathetic with delivery issues
- Offer alternatives when items unavailable

## Guidelines
- Verify order details before sharing info
- Be proactive with delivery delays
- Clear explanation of timelines`,
    suggestedQuestions: [
      "Where is my order?",
      "I want to return an item",
      "Cancel my order",
      "Track my delivery",
    ],
  },
  {
    id: "restaurant-booking",
    name: "Restaurant Reservation Agent",
    description: "Table bookings, menu inquiries, food orders, and restaurant customer service",
    icon: UtensilsCrossed,
    category: "Hospitality",
    tags: ["Reservation", "Menu", "Orders", "Dining"],
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: [
      "Table reservations",
      "Menu information",
      "Food ordering",
      "Dietary accommodations",
      "Special occasion bookings",
      "Delivery orders",
    ],
    useCases: [
      "Restaurants",
      "Cafes",
      "Cloud kitchens",
      "Catering services",
    ],
    estimatedSetup: "3 mins",
    popularity: "Medium",
    systemPrompt: `You are a friendly restaurant assistant.

## Your Role
Help guests with table reservations, menu inquiries, and food orders.

## What I can help with
1. Book tables - collect name, phone, guests, date, time
2. Share menu and specials
3. Take food orders for delivery/takeaway
4. Handle dietary requirements
5. Special occasion arrangements

## Guidelines
- Be warm and welcoming
- Ask about dietary restrictions
- Note special occasions (birthday, anniversary)
- Confirm all booking details
- Provide accurate delivery times`,
    suggestedQuestions: [
      "Book a table for tonight",
      "What's on the menu?",
      "Order food for delivery",
      "Do you have vegetarian options?",
    ],
  },
  {
    id: "clinic-assistant",
    name: "Clinic/Hospital Assistant",
    description: "Patient appointments, doctor availability, lab reports, and healthcare queries",
    icon: Stethoscope,
    category: "Healthcare",
    tags: ["Appointments", "Doctors", "Reports", "Medical"],
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: [
      "Doctor appointments",
      "Specialist consultations",
      "Lab report delivery",
      "Prescription refills",
      "Doctor availability",
      "Emergency guidance",
    ],
    useCases: [
      "Clinics",
      "Hospitals",
      "Diagnostic centers",
      "Telemedicine",
    ],
    estimatedSetup: "3 mins",
    popularity: "High",
    systemPrompt: `You are a helpful healthcare assistant.

## Your Role
Help patients with appointments, reports, and general queries.

## What I can help with
1. Book doctor appointments - collect patient name, age, symptoms, preferred date/time
2. Check doctor availability
3. Send lab reports
4. Handle prescription refill requests
5. Provide general health information

## IMPORTANT GUIDELINES
⚠️ NEVER provide medical diagnosis or treatment advice
⚠️ Always recommend consulting a doctor for medical queries
⚠️ For emergencies, direct to nearest hospital or 108

## Guidelines
- Be empathetic and patient
- Collect symptoms for doctor's reference only
- Maintain patient confidentiality
- Remind about documents to bring`,
    suggestedQuestions: [
      "Book a doctor appointment",
      "Which doctors are available today?",
      "Send my lab reports",
      "Refill my prescription",
    ],
  },
  {
    id: "service-center",
    name: "Service Center Agent",
    description: "Vehicle service booking, repair status, pickup scheduling for automotive businesses",
    icon: Car,
    category: "Automotive",
    tags: ["Service", "Repair", "Pickup", "Automotive"],
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: [
      "Service booking",
      "Repair status updates",
      "Pickup/drop scheduling",
      "Cost estimates",
      "Service history",
      "Parts availability",
    ],
    useCases: [
      "Car service centers",
      "Bike workshops",
      "Multi-brand service",
      "Roadside assistance",
    ],
    estimatedSetup: "3 mins",
    popularity: "Medium",
    systemPrompt: `You are a helpful automotive service assistant.

## Your Role
Help customers with vehicle service bookings and repair queries.

## What I can help with
1. Book service appointments - collect vehicle details, service type, date
2. Provide repair status updates
3. Schedule pickup/drop
4. Give cost estimates
5. Parts availability

## When booking service:
- Vehicle model and registration number
- Type of service needed
- Preferred date and time
- Pickup required? (Yes/No)
- Any specific issues to note

## Guidelines
- Provide clear cost estimates
- Explain service options
- Offer pickup convenience
- Update on repair progress`,
    suggestedQuestions: [
      "Book a car service",
      "What's my repair status?",
      "Schedule pickup",
      "Get service cost estimate",
    ],
  },
];

const categories = [{ value: "all", label: "All Categories" }, ...templateCategories];

type SavedCustomTemplate = {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  systemPrompt?: string;
  suggestedQuestions?: unknown;
  tags?: unknown;
  toneOfVoice?: string;
  purpose?: string;
  welcomeMessage?: string;
};

const WHATSAPP_CATEGORY = "WhatsApp";

function normalizeCategoryParam(categoryParam: string | null): string {
  if (!categoryParam) return "all";
  if (categoryParam.toLowerCase() === "all") return "all";

  const match = templateCategories.find(
    (c) => c.value.toLowerCase() === categoryParam.toLowerCase()
  );
  return match?.value ?? "all";
}

function getDefaultToneForTemplate(template: Template): string | undefined {
  const category = template.category;
  if (category === "Support" || category === "Healthcare") return "empathetic";
  if (category === "Education") return "enthusiastic";
  if (category === "Sales" || category === "Retail") return "friendly";
  if (category === "Hospitality") return "friendly";
  if (category === "Business" || category === "Real Estate" || category === "Human Resources") return "professional";
  if (category === "Billing" || category === "Orders" || category === "Automotive") return "professional";
  return "friendly";
}

function getDefaultPurposeForTemplate(template: Template): string | undefined {
  const category = template.category;
  const lowerName = template.name.toLowerCase();
  const lowerTags = template.tags.map((t) => t.toLowerCase());

  if (category === "Education") return "education";
  if (category === "Human Resources") return "hr";
  if (category === "Appointments" || lowerName.includes("appointment") || lowerName.includes("reservation")) return "booking";
  if (category === "Healthcare") return "booking";
  if (category === "Hospitality") return "booking";

  if (category === "Sales" || lowerTags.includes("sales") || lowerTags.includes("leads") || lowerTags.includes("lead qualification") || lowerTags.includes("demos") || lowerTags.includes("demo")) {
    return "lead_generation";
  }

  if (category === "Retail") return "sales";
  if (category === "Real Estate") return "lead_generation";
  if (category === "Business") return "lead_generation";
  if (category === "Support" || category === "Orders" || category === "Billing") return "support";

  // Automotive varies (sales vs service); default to sales.
  if (category === "Automotive") return "sales";

  return "informational";
}

function getDefaultWelcomeMessageForTemplate(template: Template): string | undefined {
  const category = template.category;
  if (category === "Appointments") return "Hi! I can help you book, reschedule, or cancel an appointment. What would you like to do?";
  if (category === "Billing") return "Hello! I can help with invoices, payments, and billing questions. How can I assist?";
  if (category === "Orders") return "Hi! I can help you track an order, handle returns, or answer delivery questions. What do you need?";
  if (category === "Support") return "Hello! I’m here to help. Tell me what you’re trying to do and what’s going wrong.";
  if (category === "Healthcare") return "Hello! I can help you with appointments and general service questions. How can I assist today?";
  if (category === "Hospitality") return "Welcome! I can help with reservations, menu questions, and general inquiries. How can I help?";
  if (category === "Automotive") return "Hi! I can help you find the right vehicle or book a service. What are you looking for today?";
  if (category === "Education") return "Hi! What would you like to learn about today?";
  if (category === "Real Estate") return "Hello! Tell me what kind of property you’re looking for, and I’ll help you narrow it down.";
  if (category === "Human Resources") return "Hello! I can help with job openings, applications, and HR questions. How can I assist?";
  if (category === "Sales" || category === "Business") return "Hi! I can answer questions and help you get the next step set up. What are you interested in?";
  if (category === "Retail") return "Hi! What are you shopping for today?";
  return "Hi! How can I help you today?";
}

function safeReadCustomTemplates(): Template[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("customTemplates");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item: SavedCustomTemplate): Template | null => {
        const id = typeof item.id === "string" ? item.id : `custom_${Date.now()}`;
        const name = typeof item.name === "string" ? item.name : "";
        const description = typeof item.description === "string" ? item.description : "";
        const categoryRaw = typeof item.category === "string" ? item.category : "Other";
        const category = isTemplateCategory(categoryRaw) ? categoryRaw : "Other";
        const systemPrompt = typeof item.systemPrompt === "string" ? item.systemPrompt : "";
        const suggestedQuestions = Array.isArray(item.suggestedQuestions)
          ? item.suggestedQuestions.filter((q): q is string => typeof q === "string")
          : [];
        const tags = Array.isArray(item.tags) ? item.tags.filter((t): t is string => typeof t === "string") : [];

        if (!name || !systemPrompt) return null;

        return {
          id,
          name,
          description,
          icon: LayoutTemplate,
          category,
          tags,
          systemPrompt,
          suggestedQuestions,
          color: "text-primary",
          bgColor: "bg-primary/10",
          features: [],
          useCases: [],
          estimatedSetup: "Custom",
          popularity: "New",
          toneOfVoice: typeof item.toneOfVoice === "string" ? item.toneOfVoice : undefined,
          purpose: typeof item.purpose === "string" ? item.purpose : undefined,
          welcomeMessage: typeof item.welcomeMessage === "string" ? item.welcomeMessage : undefined,
        };
      })
      .filter((t): t is Template => t !== null);
  } catch {
    return [];
  }
}

export default function TemplatesPage() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);

  useEffect(() => {
    setCustomTemplates(safeReadCustomTemplates());
  }, []);

  const allTemplates = useMemo(() => {
    if (customTemplates.length === 0) return templates;
    return [...templates, ...customTemplates];
  }, [customTemplates]);

  // Read category from URL query parameter and react to URL changes
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    setSelectedCategory(normalizeCategoryParam(params.get("category")));
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

  const filteredTemplates = allTemplates.filter((template) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query) ||
      template.tags.some((tag) => tag.toLowerCase().includes(query));
    const templateCategory = template.category.toLowerCase();
    const templateTags = template.tags.map((t) => t.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === WHATSAPP_CATEGORY
        ? templateCategory === WHATSAPP_CATEGORY.toLowerCase() || templateTags.includes(WHATSAPP_CATEGORY.toLowerCase())
        : templateCategory === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: Template) => {
    const toneOfVoice = template.toneOfVoice ?? getDefaultToneForTemplate(template);
    const purpose = template.purpose ?? getDefaultPurposeForTemplate(template);
    const welcomeMessage = template.welcomeMessage ?? getDefaultWelcomeMessageForTemplate(template);

    // Store template in sessionStorage for the create agent page to pick up
    sessionStorage.setItem("agentTemplate", JSON.stringify({
      name: template.name,
      description: template.description,
      systemPrompt: template.systemPrompt,
      suggestedQuestions: template.suggestedQuestions,
      category: template.category,
      toneOfVoice,
      purpose,
      welcomeMessage,
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
        return (
          <Badge variant="secondary">
            <Star className="h-3 w-3 mr-1" /> Popular
          </Badge>
        );
      case "New":
        return (
          <Badge variant="outline">
            <Zap className="h-3 w-3 mr-1" /> New
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Templates">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <LayoutTemplate className="h-8 w-8 text-primary" />
              {selectedCategory === "all" ? "Agent Templates" : `${selectedCategory} Templates`}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCategory === "all" 
                ? "Start quickly with pre-built AI agent templates optimized for your industry"
                : `Browse ${filteredTemplates.length} template${filteredTemplates.length !== 1 ? 's' : ''} in the ${selectedCategory} category`
              }
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bot className="h-4 w-4" />
            <span>{filteredTemplates.length} of {allTemplates.length} templates</span>
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
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredTemplates.filter(t => t.popularity === "High").length}</p>
                <p className="text-xs text-muted-foreground">Popular</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredTemplates.filter(t => t.popularity === "New").length}</p>
                <p className="text-xs text-muted-foreground">New Templates</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
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
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
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
