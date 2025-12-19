import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Agent } from "@shared/schema";
import {
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Bot,
  Activity,
  Globe,
  Smartphone,
  Calendar,
} from "lucide-react";

interface DashboardStats {
  totalConversations: number;
  uniqueVisitors: number;
  totalMessages: number;
  responseRate: number;
}

interface Conversation {
  id: string;
  agentId: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

export default function AnalyticsPage() {
  // Fetch real dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch agents
  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Fetch recent conversations
  const { data: recentConversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const getAgentName = (agentId: string) => {
    const agent = agents?.find(a => a.id === agentId);
    return agent?.name || "Unknown Agent";
  };

  const getAgentType = (agentId: string) => {
    const agent = agents?.find(a => a.id === agentId);
    return (agent as any)?.agentType || "website";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statCards = [
    {
      icon: MessageSquare,
      label: "Total Conversations",
      value: stats?.totalConversations ?? 0,
      change: stats?.totalConversations ? `${stats.totalConversations} active` : "No data yet",
      changeType: stats?.totalConversations ? "positive" : "neutral" as const,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Users,
      label: "Unique Visitors",
      value: stats?.uniqueVisitors ?? 0,
      change: stats?.uniqueVisitors ? `${stats.uniqueVisitors} unique` : "No data yet",
      changeType: stats?.uniqueVisitors ? "positive" : "neutral" as const,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      icon: TrendingUp,
      label: "Response Rate",
      value: stats?.responseRate ? `${stats.responseRate}%` : "--",
      change: stats?.responseRate ? "Calculated" : "No data yet",
      changeType: stats?.responseRate ? "positive" : "neutral" as const,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      icon: Clock,
      label: "Avg Response Time",
      value: stats?.totalMessages ? "<1s" : "--",
      change: stats?.totalMessages ? "AI-powered" : "No data yet",
      changeType: stats?.totalMessages ? "positive" : "neutral" as const,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <DashboardLayout title="Analytics">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                {statsLoading ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <Skeleton className="w-20 h-5" />
                    </div>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <Badge
                        variant={stat.changeType === "positive" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {stat.change}
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold font-display">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts & Agent Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Conversations Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Analytics charts coming soon
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Track conversation trends and agent performance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Agent Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : agents && agents.length > 0 ? (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {agents.map((agent) => {
                      const agentConversations = recentConversations?.filter(c => c.agentId === agent.id) || [];
                      return (
                        <div key={agent.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {(agent as any).agentType === 'whatsapp' ? (
                                <Smartphone className="h-5 w-5 text-green-500" />
                              ) : (
                                <Globe className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(agent as any).agentType === 'whatsapp' ? 'WhatsApp' : 'Website'} Agent
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{agentConversations.length}</p>
                            <p className="text-xs text-muted-foreground">conversations</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No agents created yet</p>
                    <p className="text-sm text-muted-foreground">
                      Create an agent to see performance metrics
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {conversationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentConversations && recentConversations.length > 0 ? (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {recentConversations.slice(0, 10).map((conversation) => (
                    <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {getAgentType(conversation.agentId) === 'whatsapp' ? (
                            <Smartphone className="h-5 w-5 text-green-500" />
                          ) : (
                            <Globe className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{getAgentName(conversation.agentId)}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(conversation.createdAt)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {conversation.sessionId.slice(0, 8)}...
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No recent activity</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Start using your AI agents to see conversation history and analytics here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
