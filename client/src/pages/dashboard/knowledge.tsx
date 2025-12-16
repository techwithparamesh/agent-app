import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Agent, KnowledgeBase } from "@shared/schema";
import {
  Database,
  Search,
  Trash2,
  ExternalLink,
  FileText,
  Scan,
  Bot,
} from "lucide-react";

export default function KnowledgeBasePage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteEntry, setDeleteEntry] = useState<KnowledgeBase | null>(null);

  // Get agent from URL params
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const selectedAgentId = searchParams.get("agent") || "";

  const [currentAgentId, setCurrentAgentId] = useState(selectedAgentId);

  const { data: agents, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
    refetchOnMount: "always",
    staleTime: 0,
  });

  const { data: knowledgeEntries, isLoading: entriesLoading, refetch: refetchEntries } = useQuery<KnowledgeBase[]>({
    queryKey: ["/api/agents", currentAgentId, "knowledge"],
    enabled: !!currentAgentId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      await apiRequest("DELETE", `/api/knowledge/${entryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents", currentAgentId, "knowledge"] });
      toast({
        title: "Entry deleted",
        description: "The knowledge base entry has been removed.",
      });
      setDeleteEntry(null);
    },
    onError: (error) => {
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
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredEntries = knowledgeEntries?.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.title?.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.section?.toLowerCase().includes(query)
    );
  });

  const handleAgentChange = (agentId: string) => {
    setCurrentAgentId(agentId);
    window.history.replaceState(null, "", `/dashboard/knowledge?agent=${agentId}`);
  };

  return (
    <DashboardLayout title="Knowledge Base">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Select value={currentAgentId} onValueChange={handleAgentChange}>
              <SelectTrigger className="w-[200px]" data-testid="select-knowledge-agent">
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
            
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-knowledge"
              />
            </div>
          </div>
          
          {currentAgentId && (
            <Link href={`/dashboard/scan?agent=${currentAgentId}`}>
              <Button data-testid="button-scan-more">
                <Scan className="mr-2 h-4 w-4" />
                Scan More Content
              </Button>
            </Link>
          )}
        </div>

        {/* Content */}
        {!currentAgentId ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Select an Agent</h3>
              <p className="text-muted-foreground">
                Choose an agent to view its knowledge base entries.
              </p>
            </CardContent>
          </Card>
        ) : entriesLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEntries && filteredEntries.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>{filteredEntries.length} entries found</span>
            </div>
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="group" data-testid={`card-knowledge-${entry.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <h3 className="font-semibold truncate">
                          {entry.title || "Untitled"}
                        </h3>
                        {entry.section && (
                          <Badge variant="outline" className="flex-shrink-0">
                            {entry.section}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                        {entry.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {entry.sourceUrl && (
                          <a
                            href={entry.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Source
                          </a>
                        )}
                        <span>{entry.contentType || "text"}</span>
                        {entry.createdAt && (
                          <span>
                            Added {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => setDeleteEntry(entry)}
                      data-testid={`button-delete-knowledge-${entry.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {searchQuery ? "No matching entries" : "No knowledge base entries"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try adjusting your search query."
                  : "Scan a website to add content to this agent's knowledge base."}
              </p>
              {!searchQuery && (
                <Link href={`/dashboard/scan?agent=${currentAgentId}`}>
                  <Button>
                    <Scan className="mr-2 h-4 w-4" />
                    Scan a Website
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        <AlertDialog open={!!deleteEntry} onOpenChange={() => setDeleteEntry(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteEntry?.title || "this entry"}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteEntry && deleteMutation.mutate(deleteEntry.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
