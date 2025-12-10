import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

// Marketing Pages
import Home from "@/pages/home";
import About from "@/pages/about";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";

// Auth Pages
import Login from "@/pages/login";
import Signup from "@/pages/signup";

// Dashboard Pages
import Dashboard from "@/pages/dashboard/index";
import AgentsList from "@/pages/dashboard/agents/index";
import CreateAgent from "@/pages/dashboard/agents/new";
import AgentDetails from "@/pages/dashboard/agents/[id]";
import EditAgent from "@/pages/dashboard/agents/edit";
import WebsiteScanner from "@/pages/dashboard/scan";
import KnowledgeBase from "@/pages/dashboard/knowledge";
import Chatbot from "@/pages/dashboard/chatbot";
import LandingPages from "@/pages/dashboard/landing-pages";
import Analytics from "@/pages/dashboard/analytics";
import Integrations from "@/pages/dashboard/integrations";

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
      <Route path="/dashboard/agents/:id/edit" component={EditAgent} />
      <Route path="/dashboard/agents/:id" component={AgentDetails} />
      <Route path="/dashboard/scan" component={WebsiteScanner} />
      <Route path="/dashboard/knowledge" component={KnowledgeBase} />
      <Route path="/dashboard/chatbot" component={Chatbot} />
      <Route path="/dashboard/landing-pages" component={LandingPages} />
      <Route path="/dashboard/analytics" component={Analytics} />
      <Route path="/dashboard/integrations" component={Integrations} />

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
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
