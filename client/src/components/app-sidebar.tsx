import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Bot,
  LayoutDashboard,
  PlusCircle,
  Scan,
  Database,
  MessageSquare,
  LayoutTemplate,
  Settings,
  BarChart3,
  LogOut,
  Link as LinkIcon,
} from "lucide-react";

const menuItems = [
  {
    group: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    group: "AI Agents",
    items: [
      { icon: Bot, label: "My Agents", href: "/dashboard/agents" },
      { icon: PlusCircle, label: "Create Agent", href: "/dashboard/agents/new" },
      { icon: Scan, label: "Scan Website", href: "/dashboard/scan" },
    ],
  },
  {
    group: "Content",
    items: [
      { icon: Database, label: "Knowledge Base", href: "/dashboard/knowledge" },
      { icon: MessageSquare, label: "Chatbot", href: "/dashboard/chatbot" },
      { icon: LayoutTemplate, label: "Templates", href: "/dashboard/templates" },
    ],
  },
  {
    group: "Settings",
    items: [
      { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
      { icon: LinkIcon, label: "Integrations", href: "/dashboard/integrations" },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
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
        {menuItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className="text-xs uppercase tracking-wide text-muted-foreground px-4">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  // Exact match only - no prefix matching to avoid multiple highlights
                  const isActive = location === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="gap-3"
                      >
                        <Link href={item.href} data-testid={`link-sidebar-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
