import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Link as LinkIcon,
  Webhook,
  MessageCircle,
  Mail,
  Zap,
  Settings,
} from "lucide-react";
import { SiSlack, SiDiscord, SiZapier } from "react-icons/si";

const integrations = [
  {
    name: "Slack",
    description: "Connect your AI agents to Slack channels",
    icon: SiSlack,
    status: "coming_soon" as const,
  },
  {
    name: "Discord",
    description: "Deploy chatbots to your Discord server",
    icon: SiDiscord,
    status: "coming_soon" as const,
  },
  {
    name: "Zapier",
    description: "Automate workflows with 5000+ apps",
    icon: SiZapier,
    status: "coming_soon" as const,
  },
  {
    name: "Webhooks",
    description: "Send real-time events to your endpoints",
    icon: Webhook,
    status: "available" as const,
  },
  {
    name: "Email",
    description: "Receive conversation transcripts via email",
    icon: Mail,
    status: "coming_soon" as const,
  },
  {
    name: "WhatsApp",
    description: "Connect agents to WhatsApp Business",
    icon: MessageCircle,
    status: "coming_soon" as const,
  },
];

export default function IntegrationsPage() {
  return (
    <DashboardLayout title="Integrations">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Connect your AI agents with external services and platforms.
            </p>
          </div>
        </div>

        {/* API Key Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>API Access</CardTitle>
                <CardDescription>
                  Use our REST API to integrate with your applications
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">API Key</p>
                <p className="text-sm text-muted-foreground">
                  Generate an API key to access the AgentForge API
                </p>
              </div>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Generate Key
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.name}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <integration.icon className="h-6 w-6" />
                  </div>
                  <Badge
                    variant={integration.status === "available" ? "default" : "secondary"}
                  >
                    {integration.status === "available" ? "Available" : "Coming Soon"}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-2">{integration.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {integration.description}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={integration.status !== "available"}
                >
                  {integration.status === "available" ? "Configure" : "Notify Me"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <LinkIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Need a Custom Integration?</CardTitle>
                <CardDescription>
                  We can build custom integrations for enterprise customers
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
