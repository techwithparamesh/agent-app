import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Agent } from "@shared/schema";
import {
  MessageSquare,
  Bot,
  User,
  Trash2,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Globe,
  Smartphone,
  Calendar,
  Users,
} from "lucide-react";

interface Conversation {
  id: string;
  agentId: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessage?: string;
}

interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function ConversationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAgentId, setSelectedAgentId] = useState<string>("all");
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null);

  // Fetch agents
  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Fetch all conversations
  const { data: conversations, isLoading: conversationsLoading, refetch: refetchConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations", selectedAgentId],
    queryFn: async () => {
      const url = selectedAgentId === "all" 
        ? "/api/conversations" 
        : `/api/conversations?agentId=${selectedAgentId}`;
      const res = await apiRequest("GET", url);
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    },
  });

  // Fetch messages for expanded conversation
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", expandedConversation, "messages"],
    queryFn: async () => {
      if (!expandedConversation) return [];
      const res = await apiRequest("GET", `/api/conversations/${expandedConversation}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!expandedConversation,
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const res = await apiRequest("DELETE", `/api/conversations/${conversationId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete conversation");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Conversation Deleted",
        description: "The conversation has been permanently deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setExpandedConversation(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete all conversations for an agent
  const deleteAllConversationsMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const res = await apiRequest("DELETE", `/api/conversations/agent/${agentId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete conversations");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "All Conversations Deleted",
        description: "All conversations for this agent have been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleConversation = (conversationId: string) => {
    setExpandedConversation(
      expandedConversation === conversationId ? null : conversationId
    );
  };

  const filteredConversations = conversations || [];
  const totalConversations = filteredConversations.length;
  const uniqueSessions = new Set(filteredConversations.map(c => c.sessionId)).size;

  return (
    <DashboardLayout title="Conversations">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalConversations}</p>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{uniqueSessions}</p>
                  <p className="text-sm text-muted-foreground">Unique Visitors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{agents?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filter Conversations
              </CardTitle>
              <div className="flex items-center gap-3">
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {agents?.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          {(agent as any).agentType === 'whatsapp' ? (
                            <Smartphone className="h-4 w-4 text-green-500" />
                          ) : (
                            <Globe className="h-4 w-4 text-blue-500" />
                          )}
                          {agent.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedAgentId !== "all" && filteredConversations.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete All Conversations?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all {filteredConversations.length} conversations 
                          for "{getAgentName(selectedAgentId)}". This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAllConversationsMutation.mutate(selectedAgentId)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Conversation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentsLoading || conversationsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedAgentId === "all" 
                    ? "Conversations will appear here when visitors interact with your agents."
                    : `No conversations found for "${getAgentName(selectedAgentId)}".`}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="border rounded-lg overflow-hidden transition-all duration-200"
                    >
                      {/* Conversation Header */}
                      <div
                        className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleConversation(conversation.id)}
                      >
                        <div className="flex items-center justify-between">
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
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(conversation.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs">
                              Session: {conversation.sessionId.slice(0, 8)}...
                            </Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this conversation and all its messages. 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteConversationMutation.mutate(conversation.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            {expandedConversation === conversation.id ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Messages */}
                      {expandedConversation === conversation.id && (
                        <div className="p-4 border-t bg-background">
                          {messagesLoading ? (
                            <div className="space-y-3">
                              {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-3/4" />
                              ))}
                            </div>
                          ) : messages && messages.length > 0 ? (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                              {messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex gap-3 ${
                                    message.role === "user" ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  {message.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                      <Bot className="h-4 w-4 text-primary" />
                                    </div>
                                  )}
                                  <div
                                    className={`max-w-[70%] p-3 rounded-lg ${
                                      message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <p className={`text-xs mt-1 ${
                                      message.role === "user" 
                                        ? "text-primary-foreground/70" 
                                        : "text-muted-foreground"
                                    }`}>
                                      {formatDate(message.createdAt)}
                                    </p>
                                  </div>
                                  {message.role === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                                      <User className="h-4 w-4 text-chart-2" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-muted-foreground py-4">
                              No messages in this conversation.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
