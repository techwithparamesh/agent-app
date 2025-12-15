import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agent } from "@shared/schema";
import {
  Bot,
  PlusCircle,
  Scan,
  FileText,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Activity,
  Users,
  TrendingUp,
} from "lucide-react";

const quickActions = [
  {
    icon: PlusCircle,
    title: "Create New Agent",
    description: "Build a custom AI agent for your website",
    href: "/dashboard/agents/new",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    icon: Scan,
    title: "Scan Website",
    description: "Extract content from any website",
    href: "/dashboard/scan",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    icon: FileText,
    title: "Generate Landing Page",
    description: "Create AI-powered landing pages",
    href: "/dashboard/landing-pages",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    icon: MessageSquare,
    title: "Test Chatbot",
    description: "Preview your AI chatbot in action",
    href: "/dashboard/chatbot",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
];

// Hero stats for marketing section (low numbers for new project)
const heroStats = [
  { label: "Active agents", value: "10+" },
  { label: "Conversions", value: "100+" },
  { label: "Uptime", value: "99.9%" },
  { label: "User rating", value: "4.9" },
];

const testimonials = [
  {
    quote: "AgentForge reduced our support tickets by 60%. The AI agents handle complex queries with ease.",
    name: "Roja",
    role: "Software Engineer",
    initials: "R"
  },
  {
    quote: "The landing page generator saved us weeks of work. Our conversion rate increased by 35%.",
    name: "Lakshmi",
    role: "Graphic Designer",
    initials: "L"
  },
  {
    quote: "Finally, a tool that actually understands our product. Setup took less than 10 minutes.",
    name: "Jashwanth",
    role: "Wordpress Developer",
    initials: "J"
  }
];

const supportOptions = [
  {
    type: "Email Support",
    description: "Our team typically responds within 24 hours",
    contact: "digitalagency4us@gmail.com",
    link: "mailto:digitalagency4us@gmail.com"
  },
  {
    type: "Live Chat",
    description: "Available Monday to Saturday, 8am-8pm",
    contact: "Start a conversation",
    link: "#"
  },
  {
    type: "Phone",
    description: "Enterprise customers only",
    contact: "9059576080",
    link: "tel:9059576080"
  }
];

const teamMembers = [
  {
    initials: "PR",
    name: "Parameswar Reddy",
    role: "CEO & Founder",
    description: "Visionary leader driving innovation and growth."
  },
  {
    initials: "NR",
    name: "NagaBhushan Reddy",
    role: "Co-Founder",
    description: "Strategic partner and technology expert."
  },
  {
    initials: "RB",
    name: "Rajasekhar Babu",
    role: "Marketing Analyst",
    description: "Data-driven marketer focused on growth and analytics."
  },
  {
    initials: "PR",
    name: "Parameswar Reddy",
    role: "Product Owner",
    description: "Product owner ensuring user-centric development."
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Fetch real dashboard stats
  const { data: dashboardStats } = useQuery<{
    totalConversations: number;
    uniqueVisitors: number;
    totalMessages: number;
    responseRate: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
    refetchOnMount: "always",
    staleTime: 0,
  });

  const stats = [
    {
      icon: Bot,
      label: "Active Agents",
      value: agents?.length || 0,
      change: agents?.length ? `${agents.length} active` : "Create your first agent",
      href: "/dashboard/agents",
    },
    {
      icon: MessageSquare,
      label: "Conversations",
      value: dashboardStats?.totalConversations || 0,
      change: dashboardStats?.totalConversations ? "Start chatting" : "Start chatting",
      href: "/dashboard/chatbot",
    },
    {
      icon: Users,
      label: "Visitors Engaged",
      value: dashboardStats?.uniqueVisitors || 0,
      change: dashboardStats?.uniqueVisitors ? `${dashboardStats.uniqueVisitors} unique` : "Embed widget to track",
      href: "/dashboard/analytics",
    },
    {
      icon: TrendingUp,
      label: "Response Rate",
      value: dashboardStats?.responseRate ? `${dashboardStats.responseRate}%` : "--",
      change: dashboardStats?.responseRate ? "Based on responses" : "No data yet",
      href: "/dashboard/analytics",
    },
  ];

  const firstName = user?.firstName || user?.email?.split("@")[0] || "there";

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight mb-1" data-testid="text-dashboard-welcome">
              Welcome back, <span className="bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">{firstName}</span>!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your AI agents today.
            </p>
          </div>
          <Link href="/dashboard/agents/new">
            <Button className="btn-shine group" data-testid="button-create-agent">
              <PlusCircle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* ...existing code... */}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Link key={index} href={stat.href}>
              <Card className="cursor-pointer card-hover border-transparent hover:border-primary/30 bg-card/80 backdrop-blur-sm group animate-fade-in-up opacity-0" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    {agentsLoading && index === 0 ? (
                      <div className="h-8 w-16 mb-1 animate-shimmer rounded" />
                    ) : (
                      <p className="text-3xl font-bold font-display group-hover:text-primary transition-colors">{stat.value}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s' }}>
          <h2 className="font-display text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="h-full card-hover cursor-pointer group border-transparent hover:border-primary/20 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
                      {action.title}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Agents */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent Agents</h2>
            <Link href="/dashboard/agents">
              <Button variant="ghost" size="sm" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {agentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-xl mb-4 animate-shimmer" />
                    <div className="h-5 w-32 mb-2 animate-shimmer rounded" />
                    <div className="h-4 w-48 animate-shimmer rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : agents && agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.slice(0, 3).map((agent, index) => (
                <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}>
                  <Card className="h-full card-hover cursor-pointer group border-transparent hover:border-primary/20 bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-chart-3/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <Badge 
                          variant={agent.isActive ? "default" : "secondary"}
                          className={agent.isActive ? "bg-chart-2/20 text-chart-2 border-chart-2/30" : ""}
                        >
                          {agent.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {agent.description || "No description"}
                      </p>
                      {agent.purpose && (
                        <Badge variant="outline" className="mt-3">
                          {agent.purpose}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-muted-foreground/20 bg-transparent">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-chart-3/10 flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No agents yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first AI agent to get started.
                </p>
                <Link href="/dashboard/agents/new">
                  <Button className="btn-shine group">
                    <PlusCircle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                    Create Your First Agent
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
