import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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

// Legal Pages - lazy loaded
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Cookies = lazy(() => import("@/pages/cookies"));

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
const IntegrationWorkspace = lazy(() => import("@/pages/dashboard/integration-workspace"));
const EnhancedWorkspace = lazy(() => import("@/pages/dashboard/enhanced-workspace"));
const Automations = lazy(() => import("@/pages/dashboard/automations"));
const Docs = lazy(() => import("@/pages/docs"));

// WhatsApp Business & Billing Pages - lazy loaded
const WhatsAppAccounts = lazy(() => import("@/pages/dashboard/whatsapp-accounts"));
const PhoneNumbers = lazy(() => import("@/pages/dashboard/phone-numbers"));
const Billing = lazy(() => import("@/pages/dashboard/billing"));

// Protected Route wrapper component
const Protected = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

function Router() {
  return (
    <Switch>
      {/* Public Marketing Pages */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/contact" component={Contact} />
      
      {/* Legal Pages */}
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/cookies" component={Cookies} />
      
      {/* Auth Pages */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* Dashboard Routes - Protected */}
      <Route path="/dashboard">{() => <Protected><Dashboard /></Protected>}</Route>
      <Route path="/dashboard/agents">{() => <Protected><AgentsList /></Protected>}</Route>
      <Route path="/dashboard/agents/new">{() => <Protected><CreateAgent /></Protected>}</Route>
      <Route path="/dashboard/agents/website">{() => <Protected><WebsiteAgent /></Protected>}</Route>
      <Route path="/dashboard/agents/whatsapp">{() => <Protected><WhatsAppAgent /></Protected>}</Route>
      <Route path="/dashboard/agents/:id/edit">{() => <Protected><EditAgent /></Protected>}</Route>
      <Route path="/dashboard/agents/:id">{() => <Protected><AgentDetails /></Protected>}</Route>
      <Route path="/dashboard/scan">{() => <Protected><WebsiteScanner /></Protected>}</Route>
      <Route path="/dashboard/knowledge">{() => <Protected><KnowledgeBase /></Protected>}</Route>
      <Route path="/dashboard/chatbot">{() => <Protected><Chatbot /></Protected>}</Route>
      <Route path="/dashboard/conversations">{() => <Protected><Conversations /></Protected>}</Route>
      <Route path="/dashboard/templates/new">{() => <Protected><CreateTemplate /></Protected>}</Route>
      <Route path="/dashboard/templates">{() => <Protected><Templates /></Protected>}</Route>
      <Route path="/dashboard/analytics">{() => <Protected><Analytics /></Protected>}</Route>
      <Route path="/dashboard/integrations">{() => <Protected><Integrations /></Protected>}</Route>
      <Route path="/dashboard/automations">{() => <Protected><Automations /></Protected>}</Route>
      <Route path="/dashboard/integrations/workspace">{() => <Protected><EnhancedWorkspace /></Protected>}</Route>
      <Route path="/dashboard/integrations/workspace/:id">{() => <Protected><EnhancedWorkspace /></Protected>}</Route>
      <Route path="/dashboard/integrations/workspace-old">{() => <Protected><IntegrationWorkspace /></Protected>}</Route>
      <Route path="/docs" component={Docs} />
      
      {/* WhatsApp Business & Billing Routes - Protected */}
      <Route path="/dashboard/whatsapp/accounts">{() => <Protected><WhatsAppAccounts /></Protected>}</Route>
      <Route path="/dashboard/whatsapp/accounts/:wabaId/numbers">{() => <Protected><PhoneNumbers /></Protected>}</Route>
      <Route path="/dashboard/billing">{() => <Protected><Billing /></Protected>}</Route>

      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
