import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Database,
  Webhook,
  Mail,
  Globe,
  Plus,
  Play,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Zap,
  Loader2,
  Eye,
} from "lucide-react";

interface Integration {
  id: string;
  userId: string;
  agentId: string | null;
  type: string;
  name: string;
  description: string | null;
  config: any;
  triggers: Array<{ event: string; conditions?: any }>;
  isActive: boolean;
  lastTriggeredAt: string | null;
  lastError: string | null;
  errorCount: number;
  createdAt: string;
}

interface IntegrationLog {
  id: string;
  integrationId: string;
  triggerEvent: string;
  inputData: any;
  outputData: any;
  status: string;
  errorMessage: string | null;
  executionTimeMs: number;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
}

const integrationTypes = [
  { id: 'google_sheets', name: 'Google Sheets', icon: FileSpreadsheet, description: 'Log data to Google Sheets' },
  { id: 'webhook', name: 'Custom Webhook', icon: Webhook, description: 'Send data to any URL' },
  { id: 'zapier', name: 'Zapier', icon: Zap, description: 'Connect to 5000+ apps via Zapier' },
  { id: 'make', name: 'Make (Integromat)', icon: Globe, description: 'Automate with Make workflows' },
  { id: 'email', name: 'Email Notifications', icon: Mail, description: 'Send email alerts' },
  { id: 'custom_api', name: 'Custom API', icon: Database, description: 'POST to any API endpoint' },
];

const triggerEvents = [
  { id: 'appointment_booked', name: 'Appointment Booked', category: 'Appointments' },
  { id: 'appointment_cancelled', name: 'Appointment Cancelled', category: 'Appointments' },
  { id: 'appointment_reminder', name: 'Appointment Reminder', category: 'Appointments' },
  { id: 'lead_captured', name: 'Lead Captured', category: 'Leads' },
  { id: 'message_received', name: 'Message Received', category: 'Conversations' },
  { id: 'order_placed', name: 'Order Placed', category: 'Orders' },
  { id: 'payment_received', name: 'Payment Received', category: 'Billing' },
  { id: 'invoice_sent', name: 'Invoice Sent', category: 'Billing' },
  { id: 'complaint_raised', name: 'Complaint Raised', category: 'Support' },
  { id: 'feedback_received', name: 'Feedback Received', category: 'Support' },
];

export default function IntegrationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [newIntegrationType, setNewIntegrationType] = useState<string | null>(null);

  // Fetch integrations
  const { data: integrationsData, isLoading } = useQuery({
    queryKey: ['/api/integrations'],
    queryFn: async () => {
      const res = await fetch('/api/integrations', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch integrations');
      return res.json() as Promise<{ integrations: Integration[] }>;
    },
  });

  // Fetch agents for selector
  const { data: agentsData } = useQuery({
    queryKey: ['/api/agents'],
    queryFn: async () => {
      const res = await fetch('/api/agents', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch agents');
      return res.json() as Promise<Agent[]>;
    },
  });

  // Fetch integration logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/integrations', selectedIntegration?.id, 'logs'],
    queryFn: async () => {
      if (!selectedIntegration) return { logs: [] };
      const res = await fetch(`/api/integrations/${selectedIntegration.id}/logs`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch logs');
      return res.json() as Promise<{ logs: IntegrationLog[] }>;
    },
    enabled: !!selectedIntegration && isLogsOpen,
  });

  // Toggle active status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/integrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error('Failed to update integration');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
  });

  // Delete integration
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/integrations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete integration');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      toast({ title: 'Integration deleted' });
    },
  });

  // Test integration
  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/integrations/${id}/test`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to test integration');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: 'Test successful!', description: data.message });
      } else {
        toast({ title: 'Test failed', description: data.message, variant: 'destructive' });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
  });

  // Create integration
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create integration');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setIsCreateOpen(false);
      setNewIntegrationType(null);
      toast({ title: 'Integration created!' });
    },
  });

  const integrations = integrationsData?.integrations || [];
  const agents = agentsData || [];

  const getStatusIcon = (integration: Integration) => {
    if (!integration.isActive) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    if (integration.errorCount > 0) {
      return <Badge variant="destructive">Errors</Badge>;
    }
    if (integration.lastTriggeredAt) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="outline">Ready</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const found = integrationTypes.find(t => t.id === type);
    const Icon = found?.icon || Globe;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-muted-foreground">
              Connect your AI agents to external tools like Google Sheets, Zapier, and more
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Integration</DialogTitle>
                <DialogDescription>
                  Connect your agents to external services
                </DialogDescription>
              </DialogHeader>

              {!newIntegrationType ? (
                <div className="grid grid-cols-2 gap-4">
                  {integrationTypes.map((type) => (
                    <Card
                      key={type.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setNewIntegrationType(type.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <type.icon className="h-8 w-8 text-primary" />
                        <div>
                          <div className="font-semibold">{type.name}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <IntegrationForm
                  type={newIntegrationType}
                  agents={agents}
                  onSubmit={(data) => createMutation.mutate(data)}
                  onCancel={() => setNewIntegrationType(null)}
                  isLoading={createMutation.isPending}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{integrations.length}</div>
              <div className="text-sm text-muted-foreground">Total Integrations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {integrations.filter(i => i.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {integrations.filter(i => i.errorCount > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">With Errors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {integrations.filter(i => i.lastTriggeredAt).length}
              </div>
              <div className="text-sm text-muted-foreground">Triggered Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Integrations List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : integrations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No integrations yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first integration to automatically sync data to Google Sheets, trigger webhooks, and more.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(integration.type)}
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {integration.name}
                          {getStatusIcon(integration)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {integration.description || integrationTypes.find(t => t.id === integration.type)?.description}
                        </div>
                        <div className="flex gap-2 mt-1">
                          {integration.triggers?.map((trigger, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {triggerEvents.find(e => e.id === trigger.event)?.name || trigger.event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={integration.isActive}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ id: integration.id, isActive: checked })
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setIsLogsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Logs
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testMutation.mutate(integration.id)}
                        disabled={testMutation.isPending}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Test
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this integration?')) {
                            deleteMutation.mutate(integration.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {integration.lastError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="ml-2">
                        Last error: {integration.lastError}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Logs Dialog */}
        <Dialog open={isLogsOpen} onOpenChange={setIsLogsOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Integration Logs - {selectedIntegration?.name}</DialogTitle>
              <DialogDescription>Recent execution history</DialogDescription>
            </DialogHeader>

            {logsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : logsData?.logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs yet. Logs will appear when the integration is triggered.
              </div>
            ) : (
              <div className="space-y-2">
                {logsData?.logs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {log.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">
                            {triggerEvents.find(e => e.id === log.triggerEvent)?.name || log.triggerEvent}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.executionTimeMs}ms
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {log.errorMessage && (
                        <div className="mt-2 text-sm text-red-600">{log.errorMessage}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// Integration form component
function IntegrationForm({
  type,
  agents,
  onSubmit,
  onCancel,
  isLoading,
}: {
  type: string;
  agents: Agent[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agentId, setAgentId] = useState<string>('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  
  // Type-specific config
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  const handleSubmit = () => {
    const config: any = {};
    
    if (type === 'google_sheets') {
      config.spreadsheetId = spreadsheetId;
      config.sheetName = sheetName;
    } else if (['webhook', 'zapier', 'make', 'custom_api'].includes(type)) {
      config.webhookUrl = webhookUrl;
      config.webhookMethod = 'POST';
    } else if (type === 'email') {
      config.toEmails = emailTo.split(',').map(e => e.trim());
      config.smtpHost = smtpHost;
      config.smtpPort = parseInt(smtpPort);
      config.smtpUser = smtpUser;
      config.smtpPass = smtpPass;
    }

    onSubmit({
      type,
      name,
      description,
      agentId: agentId || null,
      config,
      triggers: selectedTriggers.map(event => ({ event })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Integration Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Google Sheets Integration"
          />
        </div>

        <div>
          <Label>Description (optional)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this integration does..."
          />
        </div>

        <div>
          <Label>Agent (optional - leave empty for all agents)</Label>
          <Select value={agentId} onValueChange={setAgentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Agents</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Type-specific configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {type === 'google_sheets' && (
            <>
              <div>
                <Label>Google Spreadsheet ID</Label>
                <Input
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Copy from your Google Sheets URL: docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit
                </p>
              </div>
              <div>
                <Label>Sheet Name</Label>
                <Input
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Sheet1"
                />
              </div>
              <Alert>
                <AlertDescription>
                  Make sure to share your Google Sheet with the service account email, or make it public.
                </AlertDescription>
              </Alert>
            </>
          )}

          {['webhook', 'zapier', 'make', 'custom_api'].includes(type) && (
            <div>
              <Label>Webhook URL</Label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder={
                  type === 'zapier' ? 'https://hooks.zapier.com/...' :
                  type === 'make' ? 'https://hook.eu1.make.com/...' :
                  'https://your-api.com/webhook'
                }
              />
              {type === 'zapier' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Create a Zap with "Webhooks by Zapier" trigger and paste the URL here
                </p>
              )}
              {type === 'make' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Create a scenario with "Webhooks" module and paste the URL here
                </p>
              )}
            </div>
          )}

          {type === 'email' && (
            <>
              <div>
                <Label>Email Recipients (comma-separated)</Label>
                <Input
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="admin@example.com, manager@example.com"
                />
              </div>
              <div>
                <Label>SMTP Host</Label>
                <Input
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Port</Label>
                  <Input
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                  />
                </div>
                <div>
                  <Label>SMTP User</Label>
                  <Input
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="user@gmail.com"
                  />
                </div>
              </div>
              <div>
                <Label>SMTP Password</Label>
                <Input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="App password"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Trigger Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trigger Events</CardTitle>
          <CardDescription>Select when this integration should be triggered</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {triggerEvents.map((event) => (
              <label key={event.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedTriggers.includes(event.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTriggers([...selectedTriggers, event.id]);
                    } else {
                      setSelectedTriggers(selectedTriggers.filter(e => e !== event.id));
                    }
                  }}
                />
                <span className="text-sm">{event.name}</span>
                <Badge variant="outline" className="text-xs">{event.category}</Badge>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || !name || selectedTriggers.length === 0}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Integration
        </Button>
      </div>
    </div>
  );
}
