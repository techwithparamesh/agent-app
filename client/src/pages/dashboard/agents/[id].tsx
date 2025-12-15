import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agent, KnowledgeBase } from "@shared/schema";
import {
  Bot,
  ArrowLeft,
  Pencil,
  MessageSquare,
  Database,
  Globe,
  Scan,
  Calendar,
  Mic,
  Target,
  Sparkles,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

export default function AgentDetails() {
  const [, params] = useRoute("/dashboard/agents/:id");
  const agentId = params?.id;

  const { data: agent, isLoading: agentLoading } = useQuery<Agent>({
    queryKey: ["/api/agents", agentId],
    enabled: !!agentId,
  });

  const { data: knowledgeBase, isLoading: kbLoading } = useQuery<KnowledgeBase[]>({
    queryKey: ["/api/agents", agentId, "knowledge"],
    enabled: !!agentId,
  });

  if (agentLoading) {
    return (
      <DashboardLayout title="Agent Details">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-32 mb-6" />
          <Card>
            <CardContent className="p-8">
              <Skeleton className="h-16 w-16 rounded-lg mb-6" />
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!agent) {
    return (
      <DashboardLayout title="Agent Not Found">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Agent Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The agent you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/agents">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={agent.name}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard/agents">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/chatbot?agent=${agent.id}`}>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Test Chatbot
              </Button>
            </Link>
            <Link href={`/dashboard/agents/${agent.id}/edit`}>
              <Button data-testid="button-edit-agent">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Agent
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Agent Overview */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display text-2xl font-bold">{agent.name}</h1>
                    <Badge variant={agent.isActive ? "default" : "secondary"}>
                      {agent.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {agent.description || "No description provided"}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {agent.websiteUrl && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <a
                          href={agent.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          {agent.websiteUrl}
                        </a>
                      </div>
                    )}
                    {agent.createdAt && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Created {new Date(agent.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mic className="h-4 w-4 text-primary" />
                  Tone of Voice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="capitalize">
                  {agent.toneOfVoice || "Not set"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-primary" />
                  Purpose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="capitalize">
                  {agent.purpose?.replace("_", " ") || "Not set"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* System Prompt */}
          {agent.systemPrompt && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  System Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-muted/50 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {agent.systemPrompt}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Welcome Message & Suggested Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Welcome Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {agent.welcomeMessage || "Hi! 👋 How can I help you today?"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  Suggested Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agent.suggestedQuestions ? (
                  <div className="space-y-1.5">
                    {agent.suggestedQuestions.split("\n").filter(q => q.trim()).map((q, i) => (
                      <Badge key={i} variant="secondary" className="mr-1 mb-1">
                        {q.trim()}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No suggested questions set</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Knowledge Base */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Knowledge Base
                </CardTitle>
                <Link href={`/dashboard/scan?agent=${agent.id}`}>
                  <Button variant="outline" size="sm">
                    <Scan className="mr-2 h-4 w-4" />
                    Scan Website
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {kbLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : knowledgeBase && knowledgeBase.length > 0 ? (
                <div className="space-y-3">
                  {knowledgeBase.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {entry.title || "Untitled"}
                          </h4>
                          {entry.section && (
                            <p className="text-sm text-muted-foreground">
                              {entry.section}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {entry.content.substring(0, 150)}...
                          </p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {entry.contentType || "text"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {knowledgeBase.length > 5 && (
                    <Link href={`/dashboard/knowledge?agent=${agent.id}`}>
                      <Button variant="ghost" className="w-full">
                        View all {knowledgeBase.length} entries
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Database className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No knowledge base entries yet
                  </p>
                  <Link href={`/dashboard/scan?agent=${agent.id}`}>
                    <Button>
                      <Scan className="mr-2 h-4 w-4" />
                      Scan Website to Add Content
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
