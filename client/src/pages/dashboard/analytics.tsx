import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  Bot,
} from "lucide-react";

export default function AnalyticsPage() {
  const stats = [
    {
      icon: MessageSquare,
      label: "Total Conversations",
      value: "0",
      change: "No data yet",
      changeType: "neutral" as const,
    },
    {
      icon: Users,
      label: "Unique Visitors",
      value: "0",
      change: "No data yet",
      changeType: "neutral" as const,
    },
    {
      icon: TrendingUp,
      label: "Response Rate",
      value: "--",
      change: "No data yet",
      changeType: "neutral" as const,
    },
    {
      icon: Clock,
      label: "Avg Response Time",
      value: "--",
      change: "No data yet",
      changeType: "neutral" as const,
    },
  ];

  return (
    <DashboardLayout title="Analytics">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge
                    variant={stat.changeType === "positive" ? "default" : stat.changeType === "neutral" ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-3xl font-bold font-display">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Placeholder */}
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
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Performance metrics coming soon
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Compare agent effectiveness and user satisfaction
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No recent activity</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Start using your AI agents to see conversation history and analytics here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
