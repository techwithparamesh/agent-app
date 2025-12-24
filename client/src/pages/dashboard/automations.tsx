/**
 * Automations Dashboard Page
 * 
 * A clean, n8n-inspired automations management page.
 * Lists all automations with the ability to create, edit, run, and manage them.
 */

import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Play,
  Pause,
  MoreHorizontal,
  Trash2,
  Copy,
  Edit,
  Workflow,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Filter,
  ArrowUpDown,
  FolderOpen,
  BarChart3,
  History,
  Settings,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SimpleAutomationBuilder } from "@/components/workspace/SimpleAutomationBuilder";

// =============================================================================
// TYPES
// =============================================================================

interface AutomationStep {
  id: string;
  nodeId: string;
  name: string;
  config: Record<string, any>;
  status: 'idle' | 'configured' | 'error' | 'running' | 'success';
  outputs?: any;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: AutomationStep | null;
  steps: AutomationStep[];
  isActive: boolean;
  lastRun?: Date;
  createdAt: Date;
  executionCount: number;
  successRate: number;
  folder?: string;
  tags?: string[];
}

// =============================================================================
// SAMPLE DATA
// =============================================================================

const sampleAutomations: Automation[] = [
  {
    id: 'auto_1',
    name: 'WhatsApp Lead Capture',
    description: 'Capture leads from WhatsApp messages and add to CRM',
    trigger: {
      id: 'trig_1',
      nodeId: 'whatsapp-trigger',
      name: 'WhatsApp Message Received',
      config: { events: ['message'] },
      status: 'configured',
    },
    steps: [
      {
        id: 'step_1',
        nodeId: 'hubspot',
        name: 'Create HubSpot Contact',
        config: { operation: 'create', resource: 'contact' },
        status: 'configured',
      },
      {
        id: 'step_2',
        nodeId: 'slack',
        name: 'Notify Sales Team',
        config: { channel: '#sales', operation: 'postMessage' },
        status: 'configured',
      },
    ],
    isActive: true,
    lastRun: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    executionCount: 156,
    successRate: 98.5,
    tags: ['whatsapp', 'crm', 'leads'],
  },
  {
    id: 'auto_2',
    name: 'Daily Sales Report',
    description: 'Generate and send daily sales summary to Slack',
    trigger: {
      id: 'trig_2',
      nodeId: 'schedule-trigger',
      name: 'Every day at 9 AM',
      config: { rule: 'everyDay', hour: 9, minute: 0 },
      status: 'configured',
    },
    steps: [
      {
        id: 'step_3',
        nodeId: 'google-sheets',
        name: 'Get Sales Data',
        config: { operation: 'read', spreadsheetId: 'sales_2024' },
        status: 'configured',
      },
      {
        id: 'step_4',
        nodeId: 'slack',
        name: 'Post to Slack',
        config: { channel: '#reports', operation: 'postMessage' },
        status: 'configured',
      },
    ],
    isActive: true,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 3),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    executionCount: 30,
    successRate: 100,
    tags: ['scheduled', 'reports'],
  },
  {
    id: 'auto_3',
    name: 'Customer Support AI Response',
    description: 'Use AI to draft responses for support tickets',
    trigger: {
      id: 'trig_3',
      nodeId: 'webhook-trigger',
      name: 'Ticket Webhook',
      config: { path: '/support-ticket', httpMethod: 'POST' },
      status: 'configured',
    },
    steps: [
      {
        id: 'step_5',
        nodeId: 'ai-agent',
        name: 'Generate AI Response',
        config: { model: 'gpt-4o-mini', prompt: 'Draft customer response' },
        status: 'configured',
      },
      {
        id: 'step_6',
        nodeId: 'gmail',
        name: 'Send Email Draft',
        config: { operation: 'send' },
        status: 'configured',
      },
    ],
    isActive: false,
    lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    executionCount: 42,
    successRate: 95.2,
    tags: ['ai', 'support'],
  },
];

// =============================================================================
// AUTOMATION CARD
// =============================================================================

interface AutomationCardProps {
  automation: Automation;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRun: () => void;
}

function AutomationCard({
  automation,
  onEdit,
  onToggle,
  onDelete,
  onDuplicate,
  onRun,
}: AutomationCardProps) {
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    await onRun();
    setTimeout(() => setIsRunning(false), 2000);
  };

  const formatLastRun = (date?: Date) => {
    if (!date) return 'Never';
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  return (
    <Card className="group hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              automation.isActive ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
            )}>
              <Workflow className={cn(
                "h-5 w-5",
                automation.isActive ? "text-green-600" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                {automation.name}
              </CardTitle>
              <CardDescription className="text-sm mt-0.5">
                {automation.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={automation.isActive ? "default" : "secondary"}>
              {automation.isActive ? "Active" : "Inactive"}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggle}>
                  {automation.isActive ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Steps preview */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto py-1">
          {automation.trigger && (
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium shrink-0">
              <Zap className="h-3 w-3" />
              {automation.trigger.name.split(' ').slice(0, 3).join(' ')}
            </div>
          )}
          {automation.steps.length > 0 && (
            <>
              <span className="text-muted-foreground">→</span>
              {automation.steps.slice(0, 2).map((step, i) => (
                <div key={step.id} className="flex items-center gap-1">
                  <div className="px-2 py-1 rounded bg-muted text-xs font-medium shrink-0">
                    {step.name.split(' ').slice(0, 2).join(' ')}
                  </div>
                  {i < Math.min(automation.steps.length - 1, 1) && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </div>
              ))}
              {automation.steps.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{automation.steps.length - 2} more
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatLastRun(automation.lastRun)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span>{automation.executionCount} runs</span>
            </div>
            <div className="flex items-center gap-1.5">
              {automation.successRate >= 95 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
              )}
              <span className={cn(
                automation.successRate >= 95 ? "text-green-600" : "text-amber-600"
              )}>
                {automation.successRate}%
              </span>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRun}
            disabled={isRunning || !automation.trigger}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            {isRunning ? 'Running...' : 'Run Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AutomationsPage() {
  const [, setLocation] = useLocation();
  const [automations, setAutomations] = useState<Automation[]>(sampleAutomations);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastRun' | 'executions'>('lastRun');
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [initialApp, setInitialApp] = useState<any>(null);

  // Check for initial app from integrations page
  useEffect(() => {
    const appData = sessionStorage.getItem('automation_initial_app');
    if (appData) {
      try {
        const app = JSON.parse(appData);
        sessionStorage.removeItem('automation_initial_app');
        setInitialApp(app);
        // Auto-open the builder with this app
        setIsBuilderOpen(true);
      } catch (e) {
        console.error('Failed to parse initial app data:', e);
      }
    }
  }, []);

  // Filtered and sorted automations
  const filteredAutomations = useMemo(() => {
    let filtered = automations;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) =>
        filterStatus === 'active' ? a.isActive : !a.isActive
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'lastRun') {
        return (b.lastRun?.getTime() || 0) - (a.lastRun?.getTime() || 0);
      }
      return b.executionCount - a.executionCount;
    });

    return filtered;
  }, [automations, searchQuery, filterStatus, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: automations.length,
    active: automations.filter((a) => a.isActive).length,
    totalExecutions: automations.reduce((sum, a) => sum + a.executionCount, 0),
  }), [automations]);

  // Handlers
  const handleCreateNew = () => {
    setSelectedAutomation(null);
    setIsBuilderOpen(true);
  };

  const handleEdit = (automation: Automation) => {
    setSelectedAutomation(automation);
    setIsBuilderOpen(true);
  };

  const handleToggle = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleDelete = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    setDeleteDialog(null);
  };

  const handleDuplicate = (automation: Automation) => {
    const newAutomation: Automation = {
      ...automation,
      id: `auto_${Date.now()}`,
      name: `${automation.name} (Copy)`,
      isActive: false,
      createdAt: new Date(),
      lastRun: undefined,
      executionCount: 0,
    };
    setAutomations((prev) => [newAutomation, ...prev]);
  };

  const handleSave = (automation: any) => {
    const isNew = !automations.find((a) => a.id === automation.id);
    
    const savedAutomation: Automation = {
      ...automation,
      createdAt: isNew ? new Date() : (selectedAutomation?.createdAt || new Date()),
      executionCount: isNew ? 0 : (selectedAutomation?.executionCount || 0),
      successRate: isNew ? 100 : (selectedAutomation?.successRate || 100),
    };

    if (isNew) {
      setAutomations((prev) => [savedAutomation, ...prev]);
    } else {
      setAutomations((prev) =>
        prev.map((a) => (a.id === automation.id ? savedAutomation : a))
      );
    }
    
    setIsBuilderOpen(false);
    setSelectedAutomation(null);
  };

  const handleRun = async (id: string) => {
    // Simulate run
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, lastRun: new Date(), executionCount: a.executionCount + 1 }
          : a
      )
    );
  };

  // Builder view
  if (isBuilderOpen) {
    return (
      <div className="h-full">
        <SimpleAutomationBuilder
          automation={selectedAutomation || undefined}
          initialApp={initialApp}
          onSave={handleSave}
          onRun={(automation) => console.log('Running:', automation)}
          className="h-full"
        />
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsBuilderOpen(false);
              setSelectedAutomation(null);
              setInitialApp(null);
            }}
          >
            ← Back to Automations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">Automations</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your workflow automations
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Automation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 p-6 pb-0">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Workflow className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Automations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalExecutions}</p>
                <p className="text-sm text-muted-foreground">Total Executions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-6 border-b">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search automations..."
            className="pl-9"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastRun">Sort by Last Run</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="executions">Sort by Executions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Automations List */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {filteredAutomations.length === 0 ? (
            <div className="text-center py-12">
              <Workflow className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No automations found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? `No automations match "${searchQuery}"`
                  : "Create your first automation to get started"}
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Automation
              </Button>
            </div>
          ) : (
            filteredAutomations.map((automation) => (
              <AutomationCard
                key={automation.id}
                automation={automation}
                onEdit={() => handleEdit(automation)}
                onToggle={() => handleToggle(automation.id)}
                onDelete={() => setDeleteDialog(automation.id)}
                onDuplicate={() => handleDuplicate(automation)}
                onRun={() => handleRun(automation.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Automation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this automation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
