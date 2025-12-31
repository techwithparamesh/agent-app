import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Agent } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Scan, Globe, Loader2, Check, AlertCircle, Database, RefreshCw, Plus, ExternalLink } from "lucide-react";

// Helper to normalize URL - add https:// if missing
const normalizeUrl = (url: string): string => {
  let normalized = url.trim();
  if (!normalized) return normalized;
  
  // Remove any leading/trailing whitespace
  normalized = normalized.trim();
  
  // If it doesn't start with http:// or https://, add https://
  if (!normalized.match(/^https?:\/\//i)) {
    // Remove www. prefix if present to avoid https://www.www.
    normalized = normalized.replace(/^www\./i, '');
    normalized = 'https://' + normalized;
  }
  
  return normalized;
};

const scanFormSchema = z.object({
  agentId: z.string().min(1, "Please select an agent"),
  url: z.string().min(1, "Please enter a website URL").transform(normalizeUrl).pipe(
    z.string().url("Please enter a valid URL (e.g., example.com or https://example.com)")
  ),
  additionalUrls: z.string().optional(),
  rescan: z.boolean().default(false),
});

type ScanFormValues = z.infer<typeof scanFormSchema>;

export default function WebsiteScanner() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "processing" | "complete" | "error">("idle");
  const [scanResults, setScanResults] = useState<any>(null);
  const [scanMessage, setScanMessage] = useState<string>("");
  const [pagesFound, setPagesFound] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const hasRestoredStateRef = useRef(false);

  // Cleanup EventSource on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Get agent from URL params if present
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const preselectedAgent = searchParams.get("agent");

  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    refetchOnMount: "always", // Always refetch when navigating to this page
    staleTime: 0, // Consider data stale immediately
    // Poll every 2 seconds while any scan is active to get live progress
    refetchInterval: (query) => {
      const data = query.state.data as Agent[] | undefined;
      const hasScanning = scanStatus === "scanning" || data?.some((a: any) => a.scanStatus === 'scanning');
      return hasScanning ? 2000 : false;
    },
  });

  // Find any agent that has an active scan
  const scanningAgent = useMemo(() => {
    return agents?.find((a: any) => a.scanStatus === 'scanning') as (Agent & { 
      scanStatus: string; 
      scanProgress: number; 
      scanMessage: string;
      websiteUrl?: string;
    }) | undefined;
  }, [agents]);

  // Restore state from any active scan when page loads
  useEffect(() => {
    if (hasRestoredStateRef.current) return;
    if (!agents) return;

    // Check for any scanning agent first
    if (scanningAgent && scanStatus === 'idle') {
      hasRestoredStateRef.current = true;
      setActiveAgentId(scanningAgent.id);
      setScanStatus("scanning");
      setScanProgress(scanningAgent.scanProgress || 0);
      setScanMessage(scanningAgent.scanMessage || "Scan in progress...");
      return;
    }

    // Check preselected agent for completed/error state
    if (preselectedAgent && scanStatus === 'idle') {
      const agent = agents.find(a => a.id === preselectedAgent) as any;
      if (agent) {
        if (agent.scanStatus === 'complete') {
          hasRestoredStateRef.current = true;
          setActiveAgentId(agent.id);
          setScanStatus("complete");
          setScanProgress(100);
          setScanMessage(agent.scanMessage || "Scan complete!");
        } else if (agent.scanStatus === 'error') {
          hasRestoredStateRef.current = true;
          setActiveAgentId(agent.id);
          setScanStatus("error");
          setScanProgress(0);
          setScanMessage(agent.scanMessage || "Scan failed");
        }
      }
    }
  }, [agents, scanningAgent, preselectedAgent, scanStatus]);

  // Keep progress in sync with server while scanning
  useEffect(() => {
    if (scanStatus === 'scanning' && scanningAgent) {
      setScanProgress(scanningAgent.scanProgress || 0);
      setScanMessage(scanningAgent.scanMessage || "Scanning...");
      setActiveAgentId(scanningAgent.id);
    }
    // Detect scan completion from server
    if (scanStatus === 'scanning' && activeAgentId && !scanningAgent) {
      const agent = agents?.find(a => a.id === activeAgentId) as any;
      if (agent?.scanStatus === 'complete') {
        setScanStatus("complete");
        setScanProgress(100);
        setScanMessage(agent.scanMessage || "Scan complete!");
        toast({
          title: "Scan complete!",
          description: agent.scanMessage || "Successfully extracted content.",
        });
      } else if (agent?.scanStatus === 'error') {
        setScanStatus("error");
        setScanProgress(0);
        setScanMessage(agent.scanMessage || "Scan failed");
        toast({
          title: "Scan failed",
          description: agent.scanMessage || "Could not scan the website.",
          variant: "destructive",
        });
      }
    }
  }, [scanningAgent, agents, scanStatus, activeAgentId, toast]);

  const form = useForm<ScanFormValues>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: {
      agentId: preselectedAgent || "",
      url: "",
      additionalUrls: "",
      rescan: false,
    },
  });

  const startScan = (data: ScanFormValues) => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    setActiveAgentId(data.agentId);
    setScanStatus("scanning");
    setScanProgress(0);
    setScanResults(null);
    setScanMessage("Starting scan...");
    setPagesFound(0);
    setCurrentUrl("");
    
    // Parse additional URLs
    const additionalUrls = data.additionalUrls
      ? data.additionalUrls.split('\n').map(u => u.trim()).filter(u => u.length > 0)
      : [];
    
    // Build SSE URL with query params
    const params = new URLSearchParams({
      agentId: data.agentId,
      url: data.url,
      rescan: data.rescan.toString(),
      additionalUrls: JSON.stringify(additionalUrls),
    });
    
    const eventSource = new EventSource(`/api/scan/stream?${params.toString()}`);
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        
        switch (eventData.type) {
          case 'status':
            setScanMessage(eventData.message);
            if (eventData.progress) setScanProgress(eventData.progress);
            if (eventData.totalPages) setPagesFound(eventData.totalPages);
            break;
            
          case 'scanning':
            setScanMessage(eventData.message);
            setCurrentUrl(eventData.currentUrl || "");
            if (eventData.progress) setScanProgress(eventData.progress);
            if (eventData.totalPages) setPagesFound(eventData.totalPages);
            break;
            
          case 'found':
            setScanMessage(eventData.message);
            if (eventData.progress) setScanProgress(eventData.progress);
            if (eventData.pagesFound) setPagesFound(eventData.pagesFound);
            break;
            
          case 'progress':
            if (eventData.progress) setScanProgress(eventData.progress);
            if (eventData.scannedCount) setPagesFound(eventData.scannedCount);
            setScanMessage(eventData.message);
            break;
            
          case 'complete':
            setScanProgress(100);
            setScanStatus("complete");
            setScanResults({
              entriesCreated: eventData.entriesCreated,
              pagesScanned: eventData.pagesScanned,
              pagesFound: eventData.pagesFound,
              deletedEntries: eventData.deletedEntries,
            });
            setScanMessage(eventData.message);
            queryClient.invalidateQueries({ queryKey: ["/api/agents", form.getValues("agentId"), "knowledge"] });
            toast({
              title: "Scan complete!",
              description: `Successfully extracted ${eventData.entriesCreated || 0} content entries.`,
            });
            eventSource.close();
            break;
            
          case 'error':
            setScanStatus("error");
            setScanMessage(eventData.message);
            toast({
              title: "Scan failed",
              description: eventData.message || "Could not scan the website.",
              variant: "destructive",
            });
            eventSource.close();
            break;
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setScanStatus("error");
      setScanMessage("Connection lost. Please try again.");
      toast({
        title: "Connection error",
        description: "Lost connection to server. Please try again.",
        variant: "destructive",
      });
      eventSource.close();
    };
  };

  const onSubmit = (data: ScanFormValues) => {
    startScan(data);
  };

  const resetScan = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    hasRestoredStateRef.current = false;
    setActiveAgentId(null);
    setScanStatus("idle");
    setScanProgress(0);
    setScanResults(null);
    setScanMessage("");
    setPagesFound(0);
    setCurrentUrl("");
    form.reset();
    // Clear URL params
    setLocation("/dashboard/scan");
  };

  // Get the name of the actively scanning agent
  const getActiveAgentName = () => {
    if (activeAgentId) {
      return agents?.find(a => a.id === activeAgentId)?.name || "Agent";
    }
    if (scanningAgent) {
      return scanningAgent.name;
    }
    return "Agent";
  };

  return (
    <DashboardLayout title="Website Scanner">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Website Scanner</h1>
          <p className="text-sm text-muted-foreground">
            Extract content from a website and add it to an agent knowledge base.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Scan className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-2xl">Scan Website</CardTitle>
                <CardDescription>
                  Extract content from any website to build your agent's knowledge base
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {scanStatus === "idle" && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="agentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Agent *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-scan-agent">
                              <SelectValue placeholder="Choose an agent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {agents?.map((agent) => (
                              <SelectItem key={agent.id} value={agent.id}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The scanned content will be added to this agent's knowledge base
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="example.com or https://example.com"
                              className="pl-10"
                              {...field}
                              data-testid="input-scan-url"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter the website domain (e.g., amazon.in) or full URL - https:// will be added automatically
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalUrls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Plus className="inline-block mr-2 h-4 w-4" />
                          Additional Pages (Optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="/services
/about
/contact
/portfolio"
                            className="min-h-[100px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          For Single Page Apps (SPA) where links are loaded via JavaScript, add page paths manually (one per line). Use relative paths like /services or full URLs.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rescan"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            <RefreshCw className="inline-block mr-2 h-4 w-4" />
                            Full Rescan (Replace existing content)
                          </FormLabel>
                          <FormDescription>
                            Enable this to delete all existing knowledge entries and rescan the entire website with fresh content
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">How it works:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Crawls ALL pages on your website (up to 100 pages)</li>
                      <li>Discovers linked pages including sub-pages</li>
                      <li>Extracts text content, headings, and descriptions</li>
                      <li>Stores content in chunks for better AI responses</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={agentsLoading}
                    data-testid="button-start-scan"
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    Start Scanning
                  </Button>
                </form>
              </Form>
            )}

            {(scanStatus === "scanning" || scanStatus === "processing") && (
              <div className="py-8">
                {/* Active Scan Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Scanning in Progress</h3>
                      <p className="text-sm text-muted-foreground">
                        Agent: <span className="font-medium text-foreground">{getActiveAgentName()}</span>
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-blue-500 bg-blue-500/10">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Active
                  </Badge>
                </div>

                {/* Progress Section */}
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    {scanMessage || "Crawling website and extracting content from pages..."}
                  </p>
                  {currentUrl && (
                    <p className="text-xs text-muted-foreground mb-3 font-mono truncate bg-muted/50 px-3 py-2 rounded">
                      {currentUrl}
                    </p>
                  )}
                  <Progress value={scanProgress} className="mb-2 h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-primary">{scanProgress}% complete</span>
                    {pagesFound > 0 && <span className="text-muted-foreground">{pagesFound} pages found</span>}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center mb-6">
                  You can navigate away - the scan will continue in the background. Check the sidebar for progress.
                </p>

                {/* Scan Another Website Option */}
                <div className="border-t pt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Want to scan a different website? You can only run one scan at a time.
                  </p>
                  <Button variant="outline" disabled className="w-full">
                    <Scan className="mr-2 h-4 w-4" />
                    Scan Another Website (Wait for current scan)
                  </Button>
                </div>
              </div>
            )}

            {scanStatus === "complete" && (
              <div className="py-8">
                {/* Success Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                      <Check className="h-6 w-6 text-chart-2" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Scan Complete!</h3>
                      <p className="text-sm text-muted-foreground">
                        Agent: <span className="font-medium text-foreground">{getActiveAgentName()}</span>
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-green-500 bg-green-500/10">
                    <Check className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                </div>

                <p className="text-muted-foreground mb-6 text-center">
                  {scanMessage || "Successfully crawled and extracted content from the website"}
                </p>

                {scanResults?.deletedEntries > 0 && (
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      <RefreshCw className="inline-block mr-2 h-4 w-4" />
                      Rescan completed: {scanResults.deletedEntries} old entries were replaced
                    </p>
                  </div>
                )}

                {scanResults && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold font-display text-primary">
                          {scanResults.pagesScanned || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Pages Scanned</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold font-display text-chart-2">
                          {scanResults.entriesCreated || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Content Entries</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold font-display text-chart-3">
                          {scanResults.pagesFound || 0}
                        </p>
                        <p className="text-sm text-muted-foreground">Links Discovered</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={resetScan} className="flex-1">
                    <Scan className="mr-2 h-4 w-4" />
                    Scan Another Website
                  </Button>
                  <Button
                    onClick={() => setLocation(`/dashboard/knowledge?agent=${activeAgentId || form.getValues("agentId")}`)}
                    className="flex-1"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    View Knowledge Base
                  </Button>
                </div>
              </div>
            )}

            {scanStatus === "error" && (
              <div className="py-8">
                {/* Error Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Scan Failed</h3>
                      <p className="text-sm text-muted-foreground">
                        Agent: <span className="font-medium text-foreground">{getActiveAgentName()}</span>
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-destructive bg-destructive/10">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                </div>

                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-destructive">
                    {scanMessage || "Could not scan the website. Please check the URL and try again."}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={resetScan} className="flex-1">
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/dashboard/agents")}
                    className="flex-1"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Go to Agents
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">1</Badge>
                <span>Enter the URL of the webpage you want to scan</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">2</Badge>
                <span>Our AI extracts and structures the content automatically</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">3</Badge>
                <span>The content is added to your agent's knowledge base</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">4</Badge>
                <span>Your chatbot can now answer questions about this content</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
