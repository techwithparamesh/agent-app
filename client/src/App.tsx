import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Marketing Pages - lazy loaded
const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const Features = lazy(() => import("@/pages/features"));
const Pricing = lazy(() => import("@/pages/pricing"));
const Contact = lazy(() => import("@/pages/contact"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Auth Pages - lazy loaded
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));

// Dashboard Pages - lazy loaded
const Dashboard = lazy(() => import("@/pages/dashboard/index"));
const AgentsList = lazy(() => import("@/pages/dashboard/agents/index"));
const CreateAgent = lazy(() => import("@/pages/dashboard/agents/new"));
const AgentDetails = lazy(() => import("@/pages/dashboard/agents/[id]"));
const EditAgent = lazy(() => import("@/pages/dashboard/agents/edit"));
const WebsiteAgent = lazy(() => import("@/pages/dashboard/agents/website"));
const WhatsAppAgent = lazy(() => import("@/pages/dashboard/agents/whatsapp"));
const WebsiteScanner = lazy(() => import("@/pages/dashboard/scan"));
const KnowledgeBase = lazy(() => import("@/pages/dashboard/knowledge"));
const Chatbot = lazy(() => import("@/pages/dashboard/chatbot"));
const Conversations = lazy(() => import("@/pages/dashboard/conversations"));
const Templates = lazy(() => import("@/pages/dashboard/templates"));
const CreateTemplate = lazy(() => import("@/pages/dashboard/templates/new"));
const Analytics = lazy(() => import("@/pages/dashboard/analytics"));
const Integrations = lazy(() => import("@/pages/dashboard/integrations"));
const Docs = lazy(() => import("@/pages/docs"));

// WhatsApp Business & Billing Pages - lazy loaded
const WhatsAppAccounts = lazy(() => import("@/pages/dashboard/whatsapp-accounts"));
const PhoneNumbers = lazy(() => import("@/pages/dashboard/phone-numbers"));
const Billing = lazy(() => import("@/pages/dashboard/billing"));

function Router() {
  return (
    <Switch>
      {/* Public Marketing Pages */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/contact" component={Contact} />
      
      {/* Auth Pages */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* Dashboard Routes - auth checked within components */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/agents" component={AgentsList} />
      <Route path="/dashboard/agents/new" component={CreateAgent} />
      <Route path="/dashboard/agents/website" component={WebsiteAgent} />
      <Route path="/dashboard/agents/whatsapp" component={WhatsAppAgent} />
      <Route path="/dashboard/agents/:id/edit" component={EditAgent} />
      <Route path="/dashboard/agents/:id" component={AgentDetails} />
      <Route path="/dashboard/scan" component={WebsiteScanner} />
      <Route path="/dashboard/knowledge" component={KnowledgeBase} />
      <Route path="/dashboard/chatbot" component={Chatbot} />
      <Route path="/dashboard/conversations" component={Conversations} />
      <Route path="/dashboard/templates/new" component={CreateTemplate} />
      <Route path="/dashboard/templates" component={Templates} />
      <Route path="/dashboard/analytics" component={Analytics} />
      <Route path="/dashboard/integrations" component={Integrations} />
      <Route path="/docs" component={Docs} />
      
      {/* WhatsApp Business & Billing Routes */}
      <Route path="/dashboard/whatsapp/accounts" component={WhatsAppAccounts} />
      <Route path="/dashboard/whatsapp/accounts/:wabaId/numbers" component={PhoneNumbers} />
      <Route path="/dashboard/billing" component={Billing} />

      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="agentforge-theme">
        <TooltipProvider>
          <Suspense fallback={<PageLoader />}>
            <Router />
          </Suspense>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
