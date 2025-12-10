import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { UpgradeModal } from "@/components/upgrade-modal";
import type { Agent } from "@shared/schema";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  Code,
  Copy,
  Check,
  Zap,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageStats, setUsageStats] = useState<{ remaining: number; limit: number; plan: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get agent from URL params
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const preselectedAgent = searchParams.get("agent") || "";
  const [currentAgentId, setCurrentAgentId] = useState(preselectedAgent);

  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Fetch usage stats
  const { data: usage, refetch: refetchUsage } = useQuery<{ messageCount: number; messageLimit: number; plan: string; subscriptionStatus: string }>({
    queryKey: ["/api/usage"],
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Update usage stats when data changes
  useEffect(() => {
    if (usage) {
      setUsageStats({
        remaining: Math.max(0, usage.messageLimit - usage.messageCount),
        limit: usage.messageLimit,
        plan: usage.plan,
      });
    }
  }, [usage]);

  const currentAgent = agents?.find((a) => a.id === currentAgentId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        agentId: currentAgentId,
        message,
      });
      
      // Check if limit reached
      if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.limitReached) {
          throw { limitReached: true, ...errorData };
        }
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update usage stats from response
      if (data.usage) {
        setUsageStats({
          remaining: data.usage.remaining,
          limit: data.usage.limit,
          plan: usageStats?.plan || 'free',
        });
      }
      
      // Refetch usage to keep in sync
      refetchUsage();
    },
    onError: (error: any) => {
      // Check if it's a limit reached error
      if (error?.limitReached) {
        setShowUpgradeModal(true);
        const limitMessage: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: "🎉 You've used all your free trial messages! Upgrade to a paid plan to continue chatting and unlock more features.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, limitMessage]);
        return;
      }
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSend = () => {
    if (!inputValue.trim() || !currentAgentId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    chatMutation.mutate(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleAgentChange = (agentId: string) => {
    setCurrentAgentId(agentId);
    setMessages([]);
    window.history.replaceState(null, "", `/dashboard/chatbot?agent=${agentId}`);
  };

  const getEmbedCode = () => {
    if (!currentAgentId) return "";
    return `<script src="${window.location.origin}/widget.js" data-agent-id="${currentAgentId}"></script>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    toast({ title: "Copied!", description: "Widget code copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout title="Chatbot">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-12rem)]">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Select value={currentAgentId} onValueChange={handleAgentChange}>
                      <SelectTrigger className="w-[200px]" data-testid="select-chatbot-agent">
                        <SelectValue placeholder="Select an agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents?.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4" />
                              {agent.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentAgent && (
                      <Badge variant="outline">{currentAgent.purpose}</Badge>
                    )}
                  </div>
                  {messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChat}
                      data-testid="button-clear-chat"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
                {!currentAgentId ? (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Select an Agent</h3>
                      <p className="text-muted-foreground">
                        Choose an agent to start testing the chatbot.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1 p-4">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                              <Bot className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">
                              Chat with {currentAgent?.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              Ask a question to test your AI agent.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex gap-3 ${
                                message.role === "user" ? "justify-end" : "justify-start"
                              }`}
                            >
                              {message.role === "assistant" && (
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    <Bot className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                  message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                                data-testid={`message-${message.role}-${message.id}`}
                              >
                                <p className="text-sm whitespace-pre-wrap">
                                  {message.content}
                                </p>
                              </div>
                              {message.role === "user" && (
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarFallback className="bg-muted text-xs">
                                    <User className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          ))}
                          {chatMutation.isPending && (
                            <div className="flex gap-3 justify-start">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="bg-muted rounded-2xl px-4 py-3">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </ScrollArea>

                    <div className="p-4 border-t border-border">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={chatMutation.isPending}
                          data-testid="input-chat-message"
                        />
                        <Button
                          onClick={handleSend}
                          disabled={!inputValue.trim() || chatMutation.isPending}
                          data-testid="button-send-message"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Embed Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Code className="h-4 w-4 text-primary" />
                  Embed Widget
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentAgentId ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Add this code to your website. Works with <strong>any platform</strong>!
                    </p>
                    <div className="relative">
                      <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto whitespace-pre-wrap break-all">
                        <code>{getEmbedCode()}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={copyEmbedCode}
                        data-testid="button-copy-embed"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Platform-specific instructions */}
                    <div className="pt-3 border-t border-border space-y-3">
                      <p className="text-xs font-semibold text-foreground">Platform Instructions:</p>
                      
                      {/* WordPress */}
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                          📘 WordPress
                        </p>
                        <ol className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1 list-decimal list-inside">
                          <li>Go to <strong>Appearance → Theme Editor</strong> (or use a plugin like "Insert Headers and Footers")</li>
                          <li>Open <strong>footer.php</strong> or use the Footer Scripts section</li>
                          <li>Paste the code just before <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">&lt;/body&gt;</code></li>
                          <li>Save changes</li>
                        </ol>
                        <p className="text-xs text-blue-500 dark:text-blue-400 mt-2 italic">
                          💡 Tip: Use "WPCode" plugin for easier script insertion
                        </p>
                      </div>
                      
                      {/* HTML/Static Sites */}
                      <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-300 flex items-center gap-1">
                          📄 HTML / Static Sites
                        </p>
                        <ol className="text-xs text-green-600 dark:text-green-400 mt-1 space-y-1 list-decimal list-inside">
                          <li>Open your HTML file in a code editor</li>
                          <li>Find the closing <code className="bg-green-100 dark:bg-green-900 px-1 rounded">&lt;/body&gt;</code> tag</li>
                          <li>Paste the code just before it</li>
                          <li>Save and upload to your server</li>
                        </ol>
                      </div>
                      
                      {/* React/Next.js */}
                      <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                          ⚛️ React / Next.js / Vue
                        </p>
                        <ol className="text-xs text-purple-600 dark:text-purple-400 mt-1 space-y-1 list-decimal list-inside">
                          <li>Add to your <strong>index.html</strong> (React) or <strong>_document.js</strong> (Next.js)</li>
                          <li>Or use a Script component with <code className="bg-purple-100 dark:bg-purple-900 px-1 rounded">strategy="afterInteractive"</code></li>
                          <li>For Vue: add to <strong>index.html</strong> in public folder</li>
                        </ol>
                        <pre className="text-xs bg-purple-100 dark:bg-purple-900 p-2 rounded mt-2 overflow-x-auto">
{`// Next.js example
import Script from 'next/script'

<Script 
  src="${window.location.origin}/widget.js"
  data-agent-id="${currentAgentId}"
  strategy="afterInteractive"
/>`}
                        </pre>
                      </div>
                      
                      {/* Shopify/Wix/Squarespace */}
                      <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="text-xs font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-1">
                          🛒 Shopify / Wix / Squarespace
                        </p>
                        <ul className="text-xs text-orange-600 dark:text-orange-400 mt-1 space-y-1">
                          <li><strong>Shopify:</strong> Settings → Checkout → Additional scripts</li>
                          <li><strong>Wix:</strong> Settings → Advanced → Custom Code → Body end</li>
                          <li><strong>Squarespace:</strong> Settings → Advanced → Code Injection → Footer</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Customization options:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li><code className="bg-muted px-1 rounded">data-position</code> - "bottom-right" (default), "bottom-left"</li>
                        <li><code className="bg-muted px-1 rounded">data-primary-color</code> - Hex color (e.g., "#6366f1")</li>
                        <li><code className="bg-muted px-1 rounded">data-greeting</code> - Custom greeting message</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select an agent to get the embed code.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Agent Info */}
            {currentAgent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bot className="h-4 w-4 text-primary" />
                    Agent Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p className="text-sm text-muted-foreground">{currentAgent.name}</p>
                  </div>
                  {currentAgent.description && (
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {currentAgent.description}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {currentAgent.toneOfVoice && (
                      <Badge variant="outline" className="capitalize">
                        {currentAgent.toneOfVoice}
                      </Badge>
                    )}
                    {currentAgent.purpose && (
                      <Badge variant="outline" className="capitalize">
                        {currentAgent.purpose.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Testing Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">-</span>
                    Ask questions about your scanned content
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">-</span>
                    Test different conversation flows
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">-</span>
                    Check how the agent handles unknown topics
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">-</span>
                    Verify the tone matches your settings
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            {usageStats && (
              <Card className={usageStats.remaining <= 5 ? "border-amber-500/50" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Message Usage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {usageStats.limit - usageStats.remaining} of {usageStats.limit} used
                    </span>
                    <span className={usageStats.remaining <= 5 ? "text-amber-500 font-medium" : "text-muted-foreground"}>
                      {usageStats.remaining} left
                    </span>
                  </div>
                  <Progress 
                    value={((usageStats.limit - usageStats.remaining) / usageStats.limit) * 100} 
                    className={usageStats.remaining <= 5 ? "[&>div]:bg-amber-500" : ""}
                  />
                  <Badge variant={usageStats.plan === 'free' ? 'secondary' : 'default'} className="capitalize">
                    {usageStats.plan} Plan
                  </Badge>
                  {usageStats.remaining <= 10 && usageStats.plan === 'free' && (
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Upgrade Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal 
        open={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        currentUsage={usageStats || undefined}
      />
    </DashboardLayout>
  );
}
