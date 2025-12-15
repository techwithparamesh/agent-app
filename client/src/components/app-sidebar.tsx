import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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
} from "lucide-react";
import type { Agent } from "@shared/schema";

// Dashboard submenu items
const dashboardSubItems = [
  { icon: Activity, label: "Active Agents", href: "/dashboard/agents", metric: "agents" },
  { icon: MessageSquare, label: "Conversations", href: "/dashboard/chatbot", metric: "conversations" },
  { icon: Users, label: "Visitors Engaged", href: "/dashboard/analytics", metric: "visitors" },
  { icon: TrendingUp, label: "Response Rate", href: "/dashboard/analytics", metric: "rate" },
];

// Template category submenu items
const templateSubItems = [
  { icon: ShoppingCart, label: "Retail", category: "Retail" },
  { icon: HeadphonesIcon, label: "Support", category: "Support" },
  { icon: GraduationCap, label: "Education", category: "Education" },
  { icon: Building2, label: "Business", category: "Business" },
  { icon: Briefcase, label: "HR", category: "Human Resources" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [dashboardOpen, setDashboardOpen] = useState(location.startsWith("/dashboard") && !location.includes("/agents") && !location.includes("/scan") && !location.includes("/knowledge") && !location.includes("/chatbot") && !location.includes("/templates") && !location.includes("/analytics") && !location.includes("/integrations"));
  const [templatesOpen, setTemplatesOpen] = useState(location.includes("/templates"));

  // Fetch agents for count
  const { data: agents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    staleTime: 30000,
  });

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
        return agents?.length || 0;
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
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="gap-3 w-full justify-between">
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${dashboardOpen ? "rotate-180" : ""}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {dashboardSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.href + item.metric}>
                          <SidebarMenuSubButton asChild>
                            <Link href={item.href} className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </div>
                              <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {getMetricValue(item.metric)}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/dashboard" className="text-primary font-medium">
                            View Full Dashboard →
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Agents Section */}
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/agents/new"}
                  className="gap-3"
                >
                  <Link href="/dashboard/agents/new">
                    <PlusCircle className="h-5 w-5" />
                    <span>Create Agent</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location === "/dashboard/scan"}
                  className="gap-3"
                >
                  <Link href="/dashboard/scan">
                    <Scan className="h-5 w-5" />
                    <span>Scan Website</span>
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
                    <span>Chatbot</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Templates with Dropdown */}
              <Collapsible open={templatesOpen} onOpenChange={setTemplatesOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="gap-3 w-full justify-between">
                      <div className="flex items-center gap-3">
                        <LayoutTemplate className="h-5 w-5" />
                        <span>Templates</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${templatesOpen ? "rotate-180" : ""}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {templateSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.category}>
                          <SidebarMenuSubButton asChild>
                            <Link 
                              href={`/dashboard/templates?category=${item.category}`}
                              className="flex items-center gap-2"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/dashboard/templates" className="text-primary font-medium">
                            View All Templates →
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
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
        <a href="/api/logout" className="w-full">
          <Button variant="ghost" className="w-full justify-start gap-3" data-testid="button-logout">
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
