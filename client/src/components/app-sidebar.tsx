import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Bot,
  LayoutDashboard,
  PlusCircle,
  Scan,
  Database,
  MessageSquare,
  LayoutTemplate,
  BarChart3,
  LogOut,
  Link as LinkIcon,
  ChevronDown,
  Users,
  TrendingUp,
  Activity,
  ShoppingCart,
  HeadphonesIcon,
  GraduationCap,
  Building2,
  Briefcase,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  Car,
  Home,
  Calendar,
  Receipt,
  Package,
  Globe,
  Smartphone,
  Zap,
  CreditCard,
  Phone,
  FileText,
  Workflow,
} from "lucide-react";
import type { Agent } from "@shared/schema";

// Dashboard submenu items
const dashboardSubItems = [
  { icon: Activity, label: "Active Agents", href: "/dashboard/agents", metric: "agents" },
  { icon: MessageSquare, label: "Conversations", href: "/dashboard/conversations", metric: "conversations" },
  { icon: Users, label: "Visitors Engaged", href: "/dashboard/analytics", metric: "visitors" },
  { icon: TrendingUp, label: "Response Rate", href: "/dashboard/analytics", metric: "rate" },
];

// Template category submenu items - organized by priority
const templateSubItems = [
  { icon: Calendar, label: "Appointments", category: "Appointments" },
  { icon: TrendingUp, label: "Sales & Leads", category: "Sales" },
  { icon: Receipt, label: "Billing", category: "Billing" },
  { icon: Package, label: "Orders", category: "Orders" },
  { icon: HeadphonesIcon, label: "Support", category: "Support" },
  { icon: Stethoscope, label: "Healthcare", category: "Healthcare" },
  { icon: UtensilsCrossed, label: "Hospitality", category: "Hospitality" },
  { icon: Car, label: "Automotive", category: "Automotive" },
  { icon: GraduationCap, label: "Education", category: "Education" },
  { icon: Home, label: "Real Estate", category: "Real Estate" },
  { icon: Briefcase, label: "HR", category: "Human Resources" },
  { icon: MessageSquare, label: "WhatsApp", category: "WhatsApp" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const previousScanningAgentRef = useRef<string | null>(null);
  
  // Persist dropdown states in localStorage so they don't reset on navigation
  const [dashboardOpen, setDashboardOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-dashboard-open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [templatesOpen, setTemplatesOpen] = useState(() => {
    const saved = localStorage.getItem('sidebar-templates-open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save dropdown states to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-dashboard-open', JSON.stringify(dashboardOpen));
  }, [dashboardOpen]);

  useEffect(() => {
    localStorage.setItem('sidebar-templates-open', JSON.stringify(templatesOpen));
  }, [templatesOpen]);

  // Fetch agents for count and scan status
  const { data: agents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    staleTime: 30000,
    // Poll more frequently if any agent is scanning
    refetchInterval: (query) => {
      const data = query.state.data as Agent[] | undefined;
      const hasScanning = data?.some((a: any) => a.scanStatus === 'scanning');
      return hasScanning ? 3000 : false;
    },
  });

  // Check if any agent has an active scan
  const scanningAgent = useMemo(() => {
    return agents?.find((a: any) => a.scanStatus === 'scanning') as (Agent & { scanStatus: string; scanProgress: number; scanMessage: string }) | undefined;
  }, [agents]);

  // Notify user when scan completes while on another page
  useEffect(() => {
    const currentScanningId = scanningAgent?.id || null;
    const previousId = previousScanningAgentRef.current;
    
    // If we had a scanning agent before, but now we don't (or it changed)
    if (previousId && !currentScanningId && !location.includes('/dashboard/scan')) {
      // Find the agent that was scanning to check its status
      const previousAgent = agents?.find(a => a.id === previousId) as any;
      if (previousAgent?.scanStatus === 'complete') {
        toast({
          title: "Scan Complete! ✓",
          description: `${previousAgent.name}'s website scan has finished.`,
        });
      } else if (previousAgent?.scanStatus === 'error') {
        toast({
          title: "Scan Failed",
          description: previousAgent.scanMessage || "The scan encountered an error.",
          variant: "destructive",
        });
      }
    }
    
    previousScanningAgentRef.current = currentScanningId;
  }, [scanningAgent?.id, agents, location, toast]);

  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery<{
    totalConversations: number;
    uniqueVisitors: number;
    totalMessages: number;
    responseRate: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 30000,
  });

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getMetricValue = (metric: string) => {
    switch (metric) {
      case "agents":
        return agents?.filter((a) => a.isActive).length ?? 0;
      case "conversations":
        return dashboardStats?.totalConversations || 0;
      case "visitors":
        return dashboardStats?.uniqueVisitors || 0;
      case "rate":
        return dashboardStats?.responseRate ? `${dashboardStats.responseRate}%` : "--";
      default:
        return 0;
    }
  };

  const isDashboardActive = location === "/dashboard";
  const isTemplatesActive = location === "/dashboard/templates" || location.startsWith("/dashboard/templates");

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <Bot className="h-6 w-6 text-primary" />
          <span className="tracking-tight">AgentForge</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Overview Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground px-4">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard with Dropdown */}
              <Collapsible open={dashboardOpen} onOpenChange={setDashboardOpen}>
                <SidebarMenuItem>
                  <div className="flex items-center w-full">
                    {/* Main Dashboard Link */}
                    <SidebarMenuButton
                      asChild
                      isActive={isDashboardActive}
                      className="flex-1 gap-3"
                    >
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                    {/* Dropdown Toggle */}
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-sidebar-accent"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dashboardOpen ? "rotate-180" : ""}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {dashboardSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.href + item.metric}>
                          <SidebarMenuSubButton asChild>
                            <Link href={item.href} className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Agents Section - Restructured for clarity */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground px-4">
            AI Agents
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/agents"}
                  className="gap-3"
                >
                  <Link href="/dashboard/agents">
                    <Bot className="h-5 w-5" />
                    <span>My Agents</span>
                    {agents && agents.length > 0 && (
                      <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {agents.length}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Create Agent Section - Two Clear Paths */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground px-4">
            Create Agent
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Website Agent Path */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/agents/website"}
                  className="gap-3"
                >
                  <Link href="/dashboard/agents/website">
                    <Globe className="h-5 w-5" />
                    <span>Website Agent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* WhatsApp Business Agent Path */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/agents/whatsapp"}
                  className="gap-3"
                >
                  <Link href="/dashboard/agents/whatsapp">
                    <Smartphone className="h-5 w-5" />
                    <span>WhatsApp Agent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Quick Create */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/agents/new"}
                  className="gap-3"
                >
                  <Link href="/dashboard/agents/new">
                    <Zap className="h-5 w-5" />
                    <span>Quick Create</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground px-4">
            Content
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Website Scanner with Status Indicator */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/scan"}
                  className="gap-3"
                >
                  <Link href={scanningAgent ? `/dashboard/scan?agent=${scanningAgent.id}` : "/dashboard/scan"}>
                    <div className="relative">
                      <Scan className="h-5 w-5" />
                      {scanningAgent && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <span>Website Scanner</span>
                    {scanningAgent && (
                      <span className="ml-auto text-xs font-medium text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
                        {scanningAgent.scanProgress || 0}%
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/knowledge"}
                  className="gap-3"
                >
                  <Link href="/dashboard/knowledge">
                    <Database className="h-5 w-5" />
                    <span>Knowledge Base</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/chatbot"}
                  className="gap-3"
                >
                  <Link href="/dashboard/chatbot">
                    <MessageSquare className="h-5 w-5" />
                    <span>Test Agents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Templates with Dropdown */}
              <Collapsible open={templatesOpen} onOpenChange={setTemplatesOpen}>
                <SidebarMenuItem>
                  <div className="flex items-center w-full">
                    {/* Main Templates Link */}
                    <SidebarMenuButton
                      asChild
                      isActive={isTemplatesActive}
                      className="flex-1 gap-3"
                    >
                      <Link href="/dashboard/templates">
                        <LayoutTemplate className="h-5 w-5" />
                        <span>Templates</span>
                      </Link>
                    </SidebarMenuButton>
                    {/* Dropdown Toggle */}
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-sidebar-accent"
                      >
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${templatesOpen ? "rotate-180" : ""}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {/* Create Template Option */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link 
                            href="/dashboard/templates/new"
                            className="flex items-center gap-2 text-primary font-medium"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span>Create Template</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {templateSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.category}>
                          <SidebarMenuSubButton asChild>
                            <Link 
                              href={`/dashboard/templates?category=${encodeURIComponent(item.category)}`}
                              className="flex items-center gap-2"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* WhatsApp Business Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground px-4">
            WhatsApp Business
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.startsWith("/dashboard/whatsapp/accounts")}
                  className="gap-3"
                >
                  <Link href="/dashboard/whatsapp/accounts">
                    <Phone className="h-5 w-5" />
                    <span>WhatsApp Accounts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground px-4">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/analytics"}
                  className="gap-3"
                >
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/integrations"}
                  className="gap-3"
                >
                  <Link href="/dashboard/integrations">
                    <LinkIcon className="h-5 w-5" />
                    <span>Integrations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/docs"}
                  className="gap-3"
                >
                  <Link href="/docs">
                    <FileText className="h-5 w-5" />
                    <span>Documentation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/billing"}
                  className="gap-3"
                >
                  <Link href="/dashboard/billing">
                    <CreditCard className="h-5 w-5" />
                    <span>Billing & Plans</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3" 
          data-testid="button-logout"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
