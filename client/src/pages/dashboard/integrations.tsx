import { useState, useMemo, Component, ErrorInfo, ReactNode } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Search,
  MessageCircle,
  Send,
  Cloud,
  Calendar,
  Users,
  ShoppingCart,
  CreditCard,
  Bell,
  Bot,
  Phone,
  Video,
  FileText,
  Image,
  HardDrive,
  Link,
  Settings,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Clock,
  Activity,
  Filter,
  MoreVertical,
  Copy,
  Edit,
  Power,
} from "lucide-react";

// ============= INTEGRATION CATALOG (n8n-style) =============
const integrationCatalog = {
  // Communication
  communication: {
    label: "Communication",
    icon: MessageCircle,
    color: "bg-blue-500",
    integrations: [
      { 
        id: 'whatsapp', 
        name: 'WhatsApp Business', 
        icon: '💬',
        description: 'Send messages, templates, and media via WhatsApp',
        category: 'communication',
        popular: true,
        fields: ['apiKey', 'phoneNumberId', 'businessAccountId'],
      },
      { 
        id: 'telegram', 
        name: 'Telegram', 
        icon: '✈️',
        description: 'Send messages and files to Telegram chats/channels',
        category: 'communication',
        popular: true,
        fields: ['botToken', 'chatId'],
      },
      { 
        id: 'slack', 
        name: 'Slack', 
        icon: '💼',
        description: 'Post messages to Slack channels',
        category: 'communication',
        fields: ['webhookUrl', 'channel'],
      },
      { 
        id: 'discord', 
        name: 'Discord', 
        icon: '🎮',
        description: 'Send messages to Discord servers',
        category: 'communication',
        fields: ['webhookUrl'],
      },
      { 
        id: 'sms_twilio', 
        name: 'Twilio SMS', 
        icon: '📱',
        description: 'Send SMS messages via Twilio',
        category: 'communication',
        fields: ['accountSid', 'authToken', 'fromNumber'],
      },
      { 
        id: 'microsoft_teams', 
        name: 'Microsoft Teams', 
        icon: '👥',
        description: 'Post messages to Teams channels',
        category: 'communication',
        fields: ['webhookUrl'],
      },
    ]
  },
  
  // Email
  email: {
    label: "Email",
    icon: Mail,
    color: "bg-red-500",
    integrations: [
      { 
        id: 'gmail', 
        name: 'Gmail', 
        icon: '📧',
        description: 'Send emails via Gmail API',
        category: 'email',
        popular: true,
        fields: ['clientId', 'clientSecret', 'refreshToken'],
      },
      { 
        id: 'outlook', 
        name: 'Microsoft Outlook', 
        icon: '📨',
        description: 'Send emails via Outlook/Office 365',
        category: 'email',
        fields: ['clientId', 'clientSecret', 'tenantId'],
      },
      { 
        id: 'smtp', 
        name: 'SMTP Email', 
        icon: '✉️',
        description: 'Send emails via any SMTP server',
        category: 'email',
        fields: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass'],
      },
      { 
        id: 'sendgrid', 
        name: 'SendGrid', 
        icon: '📤',
        description: 'Send transactional emails via SendGrid',
        category: 'email',
        fields: ['apiKey'],
      },
      { 
        id: 'mailchimp', 
        name: 'Mailchimp', 
        icon: '🐵',
        description: 'Add contacts to Mailchimp lists',
        category: 'email',
        fields: ['apiKey', 'audienceId'],
      },
    ]
  },
  
  // Google Services
  google: {
    label: "Google",
    icon: Globe,
    color: "bg-green-500",
    integrations: [
      { 
        id: 'google_sheets', 
        name: 'Google Sheets', 
        icon: '📊',
        description: 'Read/write data to Google Sheets',
        category: 'google',
        popular: true,
        fields: ['spreadsheetId', 'sheetName', 'credentials'],
      },
      { 
        id: 'google_drive', 
        name: 'Google Drive', 
        icon: '📁',
        description: 'Upload and manage files in Google Drive',
        category: 'google',
        popular: true,
        fields: ['folderId', 'credentials'],
      },
      { 
        id: 'google_calendar', 
        name: 'Google Calendar', 
        icon: '📅',
        description: 'Create and manage calendar events',
        category: 'google',
        fields: ['calendarId', 'credentials'],
      },
      { 
        id: 'google_docs', 
        name: 'Google Docs', 
        icon: '📝',
        description: 'Create and edit Google Docs',
        category: 'google',
        fields: ['credentials'],
      },
      { 
        id: 'google_forms', 
        name: 'Google Forms', 
        icon: '📋',
        description: 'Receive form submissions',
        category: 'google',
        fields: ['formId', 'credentials'],
      },
    ]
  },
  
  // CRM & Sales
  crm: {
    label: "CRM & Sales",
    icon: Users,
    color: "bg-purple-500",
    integrations: [
      { 
        id: 'hubspot', 
        name: 'HubSpot', 
        icon: '🧲',
        description: 'Manage contacts, deals, and tickets',
        category: 'crm',
        popular: true,
        fields: ['apiKey'],
      },
      { 
        id: 'salesforce', 
        name: 'Salesforce', 
        icon: '☁️',
        description: 'Sync with Salesforce CRM',
        category: 'crm',
        fields: ['instanceUrl', 'accessToken'],
      },
      { 
        id: 'pipedrive', 
        name: 'Pipedrive', 
        icon: '🔧',
        description: 'Manage deals and contacts',
        category: 'crm',
        fields: ['apiToken'],
      },
      { 
        id: 'zoho_crm', 
        name: 'Zoho CRM', 
        icon: '📈',
        description: 'Sync leads and contacts',
        category: 'crm',
        fields: ['clientId', 'clientSecret', 'refreshToken'],
      },
      { 
        id: 'freshsales', 
        name: 'Freshsales', 
        icon: '🌱',
        description: 'Manage Freshsales contacts',
        category: 'crm',
        fields: ['apiKey', 'domain'],
      },
    ]
  },
  
  // Automation Platforms
  automation: {
    label: "Automation",
    icon: Zap,
    color: "bg-orange-500",
    integrations: [
      { 
        id: 'zapier', 
        name: 'Zapier', 
        icon: '⚡',
        description: 'Connect to 5000+ apps via Zapier webhooks',
        category: 'automation',
        popular: true,
        fields: ['webhookUrl'],
      },
      { 
        id: 'make', 
        name: 'Make (Integromat)', 
        icon: '🔄',
        description: 'Trigger Make scenarios via webhook',
        category: 'automation',
        popular: true,
        fields: ['webhookUrl'],
      },
      { 
        id: 'n8n', 
        name: 'n8n', 
        icon: '🔗',
        description: 'Trigger n8n workflows',
        category: 'automation',
        fields: ['webhookUrl'],
      },
      { 
        id: 'ifttt', 
        name: 'IFTTT', 
        icon: '🔀',
        description: 'Trigger IFTTT applets',
        category: 'automation',
        fields: ['webhookKey', 'eventName'],
      },
      { 
        id: 'power_automate', 
        name: 'Power Automate', 
        icon: '⚙️',
        description: 'Trigger Microsoft Power Automate flows',
        category: 'automation',
        fields: ['webhookUrl'],
      },
    ]
  },
  
  // Database & Storage
  storage: {
    label: "Database & Storage",
    icon: Database,
    color: "bg-cyan-500",
    integrations: [
      { 
        id: 'airtable', 
        name: 'Airtable', 
        icon: '📑',
        description: 'Read/write to Airtable bases',
        category: 'storage',
        popular: true,
        fields: ['apiKey', 'baseId', 'tableId'],
      },
      { 
        id: 'notion', 
        name: 'Notion', 
        icon: '📓',
        description: 'Create pages and database entries',
        category: 'storage',
        popular: true,
        fields: ['apiKey', 'databaseId'],
      },
      { 
        id: 'firebase', 
        name: 'Firebase', 
        icon: '🔥',
        description: 'Store data in Firestore',
        category: 'storage',
        fields: ['projectId', 'credentials'],
      },
      { 
        id: 'supabase', 
        name: 'Supabase', 
        icon: '⚡',
        description: 'Store data in Supabase',
        category: 'storage',
        fields: ['url', 'apiKey'],
      },
      { 
        id: 'mongodb', 
        name: 'MongoDB', 
        icon: '🍃',
        description: 'Store data in MongoDB',
        category: 'storage',
        fields: ['connectionString', 'database', 'collection'],
      },
      { 
        id: 'dropbox', 
        name: 'Dropbox', 
        icon: '📦',
        description: 'Upload files to Dropbox',
        category: 'storage',
        fields: ['accessToken'],
      },
      { 
        id: 'aws_s3', 
        name: 'AWS S3', 
        icon: '☁️',
        description: 'Store files in S3 buckets',
        category: 'storage',
        fields: ['accessKeyId', 'secretAccessKey', 'bucket', 'region'],
      },
    ]
  },
  
  // E-commerce & Payments
  ecommerce: {
    label: "E-commerce",
    icon: ShoppingCart,
    color: "bg-pink-500",
    integrations: [
      { 
        id: 'stripe', 
        name: 'Stripe', 
        icon: '💳',
        description: 'Process payments and manage customers',
        category: 'ecommerce',
        popular: true,
        fields: ['secretKey'],
      },
      { 
        id: 'razorpay', 
        name: 'Razorpay', 
        icon: '💰',
        description: 'Process payments via Razorpay',
        category: 'ecommerce',
        popular: true,
        fields: ['keyId', 'keySecret'],
      },
      { 
        id: 'shopify', 
        name: 'Shopify', 
        icon: '🛒',
        description: 'Manage Shopify orders and products',
        category: 'ecommerce',
        fields: ['shopDomain', 'accessToken'],
      },
      { 
        id: 'woocommerce', 
        name: 'WooCommerce', 
        icon: '🛍️',
        description: 'Manage WooCommerce orders',
        category: 'ecommerce',
        fields: ['siteUrl', 'consumerKey', 'consumerSecret'],
      },
      { 
        id: 'paypal', 
        name: 'PayPal', 
        icon: '🅿️',
        description: 'Process PayPal payments',
        category: 'ecommerce',
        fields: ['clientId', 'clientSecret'],
      },
    ]
  },
  
  // Project Management
  productivity: {
    label: "Productivity",
    icon: Calendar,
    color: "bg-indigo-500",
    integrations: [
      { 
        id: 'trello', 
        name: 'Trello', 
        icon: '📋',
        description: 'Create cards and manage boards',
        category: 'productivity',
        fields: ['apiKey', 'token', 'boardId'],
      },
      { 
        id: 'asana', 
        name: 'Asana', 
        icon: '✅',
        description: 'Create tasks in Asana',
        category: 'productivity',
        fields: ['accessToken', 'workspaceId'],
      },
      { 
        id: 'jira', 
        name: 'Jira', 
        icon: '🎫',
        description: 'Create Jira issues',
        category: 'productivity',
        fields: ['domain', 'email', 'apiToken', 'projectKey'],
      },
      { 
        id: 'monday', 
        name: 'Monday.com', 
        icon: '📊',
        description: 'Create items in Monday boards',
        category: 'productivity',
        fields: ['apiKey', 'boardId'],
      },
      { 
        id: 'clickup', 
        name: 'ClickUp', 
        icon: '🎯',
        description: 'Create tasks in ClickUp',
        category: 'productivity',
        fields: ['apiKey', 'listId'],
      },
      { 
        id: 'calendly', 
        name: 'Calendly', 
        icon: '📆',
        description: 'Schedule meetings via Calendly',
        category: 'productivity',
        fields: ['apiKey'],
      },
    ]
  },
  
  // Webhooks & APIs
  developer: {
    label: "Developer Tools",
    icon: Webhook,
    color: "bg-gray-600",
    integrations: [
      { 
        id: 'webhook', 
        name: 'Webhook', 
        icon: '🔗',
        description: 'Send data to any HTTP endpoint',
        category: 'developer',
        popular: true,
        fields: ['webhookUrl', 'method', 'headers'],
      },
      { 
        id: 'custom_api', 
        name: 'REST API', 
        icon: '🌐',
        description: 'Call any REST API endpoint',
        category: 'developer',
        fields: ['apiUrl', 'method', 'headers', 'apiKey'],
      },
      { 
        id: 'graphql', 
        name: 'GraphQL', 
        icon: '◼️',
        description: 'Execute GraphQL queries',
        category: 'developer',
        fields: ['endpoint', 'headers'],
      },
      { 
        id: 'github', 
        name: 'GitHub', 
        icon: '🐙',
        description: 'Create issues and manage repos',
        category: 'developer',
        fields: ['accessToken', 'owner', 'repo'],
      },
    ]
  },
};

// Flatten all integrations for search
const allIntegrations = Object.values(integrationCatalog).flatMap(cat => 
  cat.integrations.map(int => ({ ...int, categoryLabel: cat.label, categoryColor: cat.color }))
);

// Trigger events
const triggerEvents = [
  { id: 'appointment_booked', name: 'Appointment Booked', category: 'Appointments', icon: '📅' },
  { id: 'appointment_cancelled', name: 'Appointment Cancelled', category: 'Appointments', icon: '❌' },
  { id: 'appointment_reminder', name: 'Appointment Reminder', category: 'Appointments', icon: '⏰' },
  { id: 'lead_captured', name: 'New Lead Captured', category: 'Leads', icon: '🎯' },
  { id: 'message_received', name: 'Message Received', category: 'Conversations', icon: '💬' },
  { id: 'conversation_ended', name: 'Conversation Ended', category: 'Conversations', icon: '✅' },
  { id: 'order_placed', name: 'Order Placed', category: 'Orders', icon: '🛒' },
  { id: 'order_completed', name: 'Order Completed', category: 'Orders', icon: '📦' },
  { id: 'payment_received', name: 'Payment Received', category: 'Billing', icon: '💰' },
  { id: 'invoice_sent', name: 'Invoice Sent', category: 'Billing', icon: '📄' },
  { id: 'complaint_raised', name: 'Complaint Raised', category: 'Support', icon: '⚠️' },
  { id: 'feedback_received', name: 'Feedback Received', category: 'Support', icon: '⭐' },
  { id: 'human_handoff', name: 'Human Handoff Requested', category: 'Support', icon: '👤' },
  { id: 'custom', name: 'Custom Event', category: 'Custom', icon: '🔧' },
];

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

// Error Boundary for catching render errors
class IntegrationErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('IntegrationsPage Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <DashboardLayout>
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">
                <p>Failed to load the integrations page. This might be due to missing database tables.</p>
                <p className="mt-2 text-xs font-mono bg-destructive/10 p-2 rounded">
                  {this.state.error?.message}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </DashboardLayout>
      );
    }
    return this.props.children;
  }
}

function IntegrationsPageContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter integrations based on search and category
  const filteredIntegrations = useMemo(() => {
    return allIntegrations.filter(int => {
      const matchesSearch = !searchQuery || 
        int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        int.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || int.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // Popular integrations
  const popularIntegrations = useMemo(() => {
    return allIntegrations.filter(int => int.popular);
  }, []);

  // Fetch user's configured integrations
  const { data: integrationsData, isLoading, error } = useQuery({
    queryKey: ['/api/integrations'],
    queryFn: async () => {
      const res = await fetch('/api/integrations', { credentials: 'include' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to fetch integrations');
      }
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
      setSelectedType(null);
      toast({ title: 'Integration created successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to create integration', description: error.message, variant: 'destructive' });
    },
  });

  const userIntegrations = integrationsData?.integrations || [];
  const agents = agentsData || [];

  const getIntegrationInfo = (type: string) => {
    return allIntegrations.find(i => i.id === type);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              Integrations
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect 50+ apps and automate your workflows like n8n
            </p>
          </div>
          <Button size="lg" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-5 w-5 mr-2" />
            New Integration
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load integrations. Please make sure the integrations tables are created in your database.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Integrations</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{userIntegrations.length}</p>
                </div>
                <Link className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Active</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {userIntegrations.filter(i => i.isActive).length}
                  </p>
                </div>
                <Power className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">With Errors</p>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {userIntegrations.filter(i => i.errorCount > 0).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Available Apps</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{allIntegrations.length}</p>
                </div>
                <Globe className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="my-integrations" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-integrations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              My Integrations
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse Apps
            </TabsTrigger>
          </TabsList>

          {/* My Integrations Tab */}
          <TabsContent value="my-integrations" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : userIntegrations.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No integrations configured yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Connect your AI agents to external apps like Google Sheets, Telegram, Zapier, and 50+ more to automate your workflows.
                  </p>
                  <Button size="lg" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Integration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {userIntegrations.map((integration) => {
                  const info = getIntegrationInfo(integration.type);
                  return (
                    <Card key={integration.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${info?.categoryColor || 'bg-gray-100'}`}>
                              {info?.icon || '🔗'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{integration.name}</span>
                                {!integration.isActive ? (
                                  <Badge variant="secondary">Disabled</Badge>
                                ) : integration.errorCount > 0 ? (
                                  <Badge variant="destructive">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {integration.errorCount} errors
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {info?.name || integration.type}
                              </p>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {integration.triggers?.slice(0, 3).map((trigger, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {triggerEvents.find(e => e.id === trigger.event)?.icon}{' '}
                                    {triggerEvents.find(e => e.id === trigger.event)?.name || trigger.event}
                                  </Badge>
                                ))}
                                {(integration.triggers?.length || 0) > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{(integration.triggers?.length || 0) - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {integration.lastTriggeredAt && (
                              <span className="text-xs text-muted-foreground hidden md:block">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(integration.lastTriggeredAt).toLocaleDateString()}
                              </span>
                            )}
                            <Switch
                              checked={integration.isActive}
                              onCheckedChange={(checked) =>
                                toggleMutation.mutate({ id: integration.id, isActive: checked })
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedIntegration(integration);
                                setIsLogsOpen(true);
                              }}
                            >
                              <Activity className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => testMutation.mutate(integration.id)}
                              disabled={testMutation.isPending}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm('Delete this integration?')) {
                                  deleteMutation.mutate(integration.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {integration.lastError && (
                          <Alert variant="destructive" className="mt-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">{integration.lastError}</AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Browse Apps Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search 50+ integrations..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(integrationCatalog).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Popular Integrations */}
            {activeCategory === 'all' && !searchQuery && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Popular Integrations
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {popularIntegrations.map((int) => (
                    <Card
                      key={int.id}
                      className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                      onClick={() => {
                        setSelectedType(int);
                        setIsCreateOpen(true);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl ${int.categoryColor}`}>
                          {int.icon}
                        </div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{int.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Categories */}
            {activeCategory === 'all' && !searchQuery ? (
              Object.entries(integrationCatalog).map(([key, category]) => {
                const CategoryIcon = category.icon;
                return (
                <div key={key}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5" />
                    {category.label}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.integrations.map((int) => (
                      <Card
                        key={int.id}
                        className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                        onClick={() => {
                          setSelectedType({ ...int, categoryColor: category.color });
                          setIsCreateOpen(true);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${category.color} text-white`}>
                              {int.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium group-hover:text-primary transition-colors">{int.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{int.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
              })
            ) : (
              /* Filtered Results */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredIntegrations.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No integrations found for "{searchQuery}"</p>
                  </div>
                ) : (
                  filteredIntegrations.map((int) => (
                    <Card
                      key={int.id}
                      className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                      onClick={() => {
                        setSelectedType(int);
                        setIsCreateOpen(true);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${int.categoryColor} text-white`}>
                            {int.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium group-hover:text-primary transition-colors">{int.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{int.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{int.categoryLabel}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Integration Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setSelectedType(null);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedType && (
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${selectedType.categoryColor} text-white`}>
                    {selectedType.icon}
                  </div>
                )}
                {selectedType ? `Configure ${selectedType.name}` : 'Choose Integration'}
              </DialogTitle>
              <DialogDescription>
                {selectedType 
                  ? selectedType.description
                  : 'Select an app to connect with your AI agents'}
              </DialogDescription>
            </DialogHeader>

            {selectedType ? (
              <IntegrationConfigForm
                integrationType={selectedType}
                agents={agents}
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setSelectedType(null)}
                isLoading={createMutation.isPending}
              />
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search integrations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-2 gap-2">
                    {(searchQuery 
                      ? allIntegrations.filter(i => 
                          i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.description.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                      : popularIntegrations
                    ).map((int) => (
                      <Card
                        key={int.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => setSelectedType(int)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <span className="text-2xl">{int.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{int.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{int.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Logs Dialog */}
        <Dialog open={isLogsOpen} onOpenChange={setIsLogsOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Execution Logs - {selectedIntegration?.name}
              </DialogTitle>
              <DialogDescription>Recent execution history and status</DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[400px]">
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (logsData?.logs?.length || 0) === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No executions yet</p>
                  <p className="text-sm">Logs will appear when the integration is triggered</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logsData?.logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {log.status === 'success' ? (
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="h-4 w-4 text-red-600" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {triggerEvents.find(e => e.id === log.triggerEvent)?.icon}{' '}
                                {triggerEvents.find(e => e.id === log.triggerEvent)?.name || log.triggerEvent}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{log.executionTimeMs}ms</Badge>
                        </div>
                        {log.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                            {log.errorMessage}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// Dynamic Integration Configuration Form
function IntegrationConfigForm({
  integrationType,
  agents,
  onSubmit,
  onCancel,
  isLoading,
}: {
  integrationType: any;
  agents: Agent[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState(integrationType.name);
  const [description, setDescription] = useState('');
  const [agentId, setAgentId] = useState<string>('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});

  // Field configurations for different integration types
  const fieldConfigs: Record<string, Array<{ key: string; label: string; type: string; placeholder: string; required?: boolean; helpText?: string }>> = {
    // Communication
    whatsapp: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your WhatsApp API key', required: true },
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', placeholder: '1234567890', required: true },
      { key: 'businessAccountId', label: 'Business Account ID', type: 'text', placeholder: 'Your WABA ID' },
    ],
    telegram: [
      { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: '123456:ABC-DEF...', required: true, helpText: 'Get from @BotFather' },
      { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '-1001234567890', helpText: 'Channel or group chat ID' },
    ],
    slack: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/services/...', required: true },
      { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general' },
    ],
    discord: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://discord.com/api/webhooks/...', required: true },
    ],
    sms_twilio: [
      { key: 'accountSid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxx', required: true },
      { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Your auth token', required: true },
      { key: 'fromNumber', label: 'From Number', type: 'text', placeholder: '+1234567890', required: true },
    ],
    microsoft_teams: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://outlook.office.com/webhook/...', required: true },
    ],
    
    // Email
    gmail: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'OAuth Client ID', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'OAuth Client Secret', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', placeholder: 'OAuth Refresh Token', required: true },
      { key: 'fromEmail', label: 'From Email', type: 'email', placeholder: 'sender@gmail.com' },
    ],
    outlook: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Azure App Client ID', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Azure App Secret', required: true },
      { key: 'tenantId', label: 'Tenant ID', type: 'text', placeholder: 'Azure Tenant ID', required: true },
    ],
    smtp: [
      { key: 'smtpHost', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com', required: true },
      { key: 'smtpPort', label: 'SMTP Port', type: 'number', placeholder: '587', required: true },
      { key: 'smtpUser', label: 'Username', type: 'text', placeholder: 'user@example.com', required: true },
      { key: 'smtpPass', label: 'Password', type: 'password', placeholder: 'App password', required: true },
      { key: 'toEmails', label: 'Default Recipients', type: 'text', placeholder: 'email1@example.com, email2@example.com' },
    ],
    sendgrid: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'SG.xxxxxxx', required: true },
      { key: 'fromEmail', label: 'From Email', type: 'email', placeholder: 'noreply@yourdomain.com' },
    ],
    mailchimp: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Mailchimp API key', required: true },
      { key: 'audienceId', label: 'Audience ID', type: 'text', placeholder: 'List/Audience ID' },
    ],
    
    // Google
    google_sheets: [
      { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', required: true, helpText: 'From URL: docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit' },
      { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}', helpText: 'Paste your service account credentials JSON' },
    ],
    google_drive: [
      { key: 'folderId', label: 'Folder ID', type: 'text', placeholder: '1abc...', helpText: 'Leave empty for root folder' },
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}' },
    ],
    google_calendar: [
      { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary or calendar@group.calendar.google.com', required: true },
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}' },
    ],
    google_docs: [
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}' },
    ],
    google_forms: [
      { key: 'formId', label: 'Form ID', type: 'text', placeholder: 'From form URL', required: true },
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}' },
    ],
    
    // CRM
    hubspot: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your HubSpot API key', required: true },
    ],
    salesforce: [
      { key: 'instanceUrl', label: 'Instance URL', type: 'text', placeholder: 'https://yourorg.salesforce.com', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'OAuth access token', required: true },
    ],
    pipedrive: [
      { key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Your Pipedrive API token', required: true },
    ],
    zoho_crm: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'OAuth Client ID', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'OAuth Client Secret', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', placeholder: 'OAuth Refresh Token', required: true },
    ],
    freshsales: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Freshsales API key', required: true },
      { key: 'domain', label: 'Domain', type: 'text', placeholder: 'yourcompany.freshsales.io', required: true },
    ],
    
    // Automation
    zapier: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/hooks/catch/...', required: true, helpText: 'Create a Zap with "Webhooks by Zapier" trigger' },
    ],
    make: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hook.eu1.make.com/...', required: true, helpText: 'Create a scenario with Webhooks module' },
    ],
    n8n: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://your-n8n.com/webhook/...', required: true },
    ],
    ifttt: [
      { key: 'webhookKey', label: 'Webhook Key', type: 'password', placeholder: 'Your IFTTT webhook key', required: true },
      { key: 'eventName', label: 'Event Name', type: 'text', placeholder: 'agent_trigger', required: true },
    ],
    power_automate: [
      { key: 'webhookUrl', label: 'HTTP POST URL', type: 'text', placeholder: 'https://prod-xx.westus.logic.azure.com/...', required: true },
    ],
    
    // Storage
    airtable: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Airtable API key', required: true },
      { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
      { key: 'tableId', label: 'Table Name/ID', type: 'text', placeholder: 'Table name or ID', required: true },
    ],
    notion: [
      { key: 'apiKey', label: 'Integration Token', type: 'password', placeholder: 'secret_xxxxxxx', required: true },
      { key: 'databaseId', label: 'Database ID', type: 'text', placeholder: 'Database page ID' },
    ],
    firebase: [
      { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'your-project-id', required: true },
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}', required: true },
    ],
    supabase: [
      { key: 'url', label: 'Project URL', type: 'text', placeholder: 'https://xxxxx.supabase.co', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Supabase anon/service key', required: true },
    ],
    mongodb: [
      { key: 'connectionString', label: 'Connection String', type: 'password', placeholder: 'mongodb+srv://...', required: true },
      { key: 'database', label: 'Database', type: 'text', placeholder: 'my_database', required: true },
      { key: 'collection', label: 'Collection', type: 'text', placeholder: 'my_collection', required: true },
    ],
    dropbox: [
      { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Your Dropbox access token', required: true },
    ],
    aws_s3: [
      { key: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'AKIAIOSFODNN7EXAMPLE', required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', required: true },
      { key: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
      { key: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1', required: true },
    ],
    
    // E-commerce
    stripe: [
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_xxx or sk_test_xxx', required: true },
    ],
    razorpay: [
      { key: 'keyId', label: 'Key ID', type: 'text', placeholder: 'rzp_live_xxx', required: true },
      { key: 'keySecret', label: 'Key Secret', type: 'password', placeholder: 'Your Razorpay secret', required: true },
    ],
    shopify: [
      { key: 'shopDomain', label: 'Shop Domain', type: 'text', placeholder: 'your-store.myshopify.com', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'shpat_xxx', required: true },
    ],
    woocommerce: [
      { key: 'siteUrl', label: 'Site URL', type: 'text', placeholder: 'https://yourstore.com', required: true },
      { key: 'consumerKey', label: 'Consumer Key', type: 'text', placeholder: 'ck_xxx', required: true },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', placeholder: 'cs_xxx', required: true },
    ],
    paypal: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Your PayPal client ID', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Your PayPal secret', required: true },
    ],
    
    // Productivity
    trello: [
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Your Trello API key', required: true },
      { key: 'token', label: 'Token', type: 'password', placeholder: 'Your Trello token', required: true },
      { key: 'boardId', label: 'Board ID', type: 'text', placeholder: 'Board ID to create cards' },
    ],
    asana: [
      { key: 'accessToken', label: 'Personal Access Token', type: 'password', placeholder: 'Your Asana PAT', required: true },
      { key: 'workspaceId', label: 'Workspace ID', type: 'text', placeholder: 'Workspace GID' },
    ],
    jira: [
      { key: 'domain', label: 'Jira Domain', type: 'text', placeholder: 'yourcompany.atlassian.net', required: true },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
      { key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Your Jira API token', required: true },
      { key: 'projectKey', label: 'Project Key', type: 'text', placeholder: 'PROJECT' },
    ],
    monday: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Monday.com API key', required: true },
      { key: 'boardId', label: 'Board ID', type: 'text', placeholder: 'Board ID' },
    ],
    clickup: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your ClickUp API key', required: true },
      { key: 'listId', label: 'List ID', type: 'text', placeholder: 'List ID for tasks' },
    ],
    calendly: [
      { key: 'apiKey', label: 'Personal Access Token', type: 'password', placeholder: 'Your Calendly token', required: true },
    ],
    
    // Developer
    webhook: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://your-api.com/webhook', required: true },
      { key: 'method', label: 'HTTP Method', type: 'select', placeholder: 'POST', options: ['POST', 'PUT', 'PATCH'] },
      { key: 'headers', label: 'Custom Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer xxx"}' },
    ],
    custom_api: [
      { key: 'apiUrl', label: 'API URL', type: 'text', placeholder: 'https://api.example.com/endpoint', required: true },
      { key: 'method', label: 'HTTP Method', type: 'select', placeholder: 'POST', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      { key: 'apiKey', label: 'API Key/Token', type: 'password', placeholder: 'Bearer token or API key' },
      { key: 'headers', label: 'Custom Headers (JSON)', type: 'textarea', placeholder: '{"Content-Type": "application/json"}' },
    ],
    graphql: [
      { key: 'endpoint', label: 'GraphQL Endpoint', type: 'text', placeholder: 'https://api.example.com/graphql', required: true },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer xxx"}' },
    ],
    github: [
      { key: 'accessToken', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_xxx', required: true },
      { key: 'owner', label: 'Owner/Org', type: 'text', placeholder: 'username or org name' },
      { key: 'repo', label: 'Repository', type: 'text', placeholder: 'repo-name' },
    ],
  };

  const fields = fieldConfigs[integrationType.id] || [];

  const handleSubmit = () => {
    onSubmit({
      type: integrationType.id,
      name,
      description,
      agentId: agentId || null,
      config,
      triggers: selectedTriggers.map(event => ({ event })),
    });
  };

  const isValid = name && selectedTriggers.length > 0;

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label>Integration Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`My ${integrationType.name} Integration`}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this integration do?"
            rows={2}
          />
        </div>

        <div>
          <Label>Link to Agent</Label>
          <Select value={agentId || "all"} onValueChange={(v) => setAgentId(v === "all" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All agents (global)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents (Global)</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty to apply to all your agents
          </p>
        </div>
      </div>

      <Separator />

      {/* Configuration Fields */}
      <div>
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {integrationType.name} Configuration
        </h4>
        <Card>
          <CardContent className="p-4 space-y-4">
            {fields.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This integration uses webhook-based configuration. No additional setup required.
              </p>
            ) : (
              fields.map((field: any) => (
                <div key={field.key}>
                  <Label>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      value={config[field.key] || ''}
                      onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={3}
                      className="font-mono text-sm"
                    />
                  ) : field.type === 'select' ? (
                    <Select 
                      value={config[field.key] || field.options?.[0]} 
                      onValueChange={(v) => setConfig({ ...config, [field.key]: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt: string) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type}
                      value={config[field.key] || ''}
                      onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  )}
                  {field.helpText && (
                    <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Trigger Events */}
      <div>
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Trigger Events *
        </h4>
        <p className="text-sm text-muted-foreground mb-3">
          Select when this integration should be triggered
        </p>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {triggerEvents.map((event) => (
                <label
                  key={event.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTriggers.includes(event.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  }`}
                >
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
                  <span className="text-lg">{event.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.category}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || !isValid}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Integration
        </Button>
      </DialogFooter>
    </div>
  );
}

// Export wrapped component with error boundary
export default function IntegrationsPage() {
  return (
    <IntegrationErrorBoundary>
      <IntegrationsPageContent />
    </IntegrationErrorBoundary>
  );
}
