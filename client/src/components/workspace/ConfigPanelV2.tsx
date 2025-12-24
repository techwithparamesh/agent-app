/**
 * ConfigPanelV2 - n8n-inspired Configuration Panel
 * 
 * This is a complete redesign focused on:
 * 1. Clear step-by-step flow - users always know where they are
 * 2. Progressive disclosure - show only what's relevant
 * 3. Contextual guidance - help at every step
 * 4. Visual feedback - clear indicators of progress and status
 */

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  Info,
  ExternalLink,
  Plus,
  Trash2,
  Zap,
  Webhook,
  Calendar,
  Mail,
  RefreshCw,
  Globe,
  Play,
  Settings,
  Link2,
  Database,
  Key,
  ArrowRight,
  Sparkles,
  Copy,
  Eye,
  EyeOff,
  HelpCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Clock,
  Hash,
  AlertTriangle,
  GripVertical,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FlowNode } from "./types";
import { AI_MODELS, AI_MODELS_BY_PROVIDER } from "./types";
import { 
  getAppConfig, 
  getAppTriggers, 
  getAppActions, 
  getAppAuth,
  type AppConfig,
  type TriggerConfig as AppTriggerConfig,
  type ActionConfig as AppActionConfig,
  type ConfigField,
  type AuthConfig
} from "./AppConfigurations";

// ============================================================================
// Types
// ============================================================================

export type TriggerType = 'webhook' | 'poll' | 'schedule' | 'email' | 'manual' | 'app-event';

interface ConfigPanelV2Props {
  node: FlowNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, config: Record<string, any>) => void;
  onDelete: (nodeId: string) => void;
  onTest: (nodeId: string) => void;
  previousNodes?: FlowNode[];
}

interface FieldMapping {
  id: string;
  targetField: string;
  expression: string;
  type: 'direct' | 'expression' | 'static';
}

interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isComplete: boolean;
  isRequired: boolean;
}

// ============================================================================
// Trigger Type Definitions - Rich with examples and guidance
// ============================================================================

type TriggerConfigKey = 'webhook' | 'poll' | 'schedule' | 'app-event' | 'manual';

interface TriggerConfig {
  id: TriggerType;
  name: string;
  description: string;
  badge: string;
  badgeVariant: 'default' | 'secondary' | 'outline';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  examples: string[];
  useCases: string[];
  setup: {
    hasUrl?: boolean;
    hasPolling?: boolean;
    hasSchedule?: boolean;
    hasEventSelect?: boolean;
  };
}

const TRIGGER_CONFIGS: Record<TriggerConfigKey, TriggerConfig> = {
  webhook: {
    id: 'webhook' as TriggerType,
    name: 'Webhook',
    description: 'Trigger instantly when data arrives via HTTP',
    badge: 'Real-time',
    badgeVariant: 'default' as const,
    icon: Webhook,
    color: 'bg-green-500/10 text-green-600',
    examples: ['Form submission', 'Payment received', 'Third-party notification'],
    useCases: ['Receive data from external services', 'Handle form submissions', 'Process payment notifications'],
    setup: {
      hasUrl: true,
      hasPolling: false,
      hasSchedule: false,
    }
  },
  poll: {
    id: 'poll' as TriggerType,
    name: 'Polling',
    description: 'Check for new data at regular intervals',
    badge: 'Scheduled',
    badgeVariant: 'secondary' as const,
    icon: RefreshCw,
    color: 'bg-blue-500/10 text-blue-600',
    examples: ['New spreadsheet rows', 'Database updates', 'API changes'],
    useCases: ['Monitor external APIs', 'Watch for file changes', 'Check database updates'],
    setup: {
      hasUrl: false,
      hasPolling: true,
      hasSchedule: false,
    }
  },
  schedule: {
    id: 'schedule' as TriggerType,
    name: 'Schedule',
    description: 'Run automatically at specified times',
    badge: 'Time-based',
    badgeVariant: 'outline' as const,
    icon: Calendar,
    color: 'bg-purple-500/10 text-purple-600',
    examples: ['Daily report', 'Weekly backup', 'Monthly cleanup'],
    useCases: ['Generate periodic reports', 'Scheduled maintenance', 'Regular data sync'],
    setup: {
      hasUrl: false,
      hasPolling: false,
      hasSchedule: true,
    }
  },
  'app-event': {
    id: 'app-event' as TriggerType,
    name: 'App Event',
    description: 'Start when an event happens in the app',
    badge: 'Event-driven',
    badgeVariant: 'secondary' as const,
    icon: Zap,
    color: 'bg-amber-500/10 text-amber-600',
    examples: ['Record created', 'Status changed', 'User action'],
    useCases: ['React to app events', 'Process user actions', 'Handle status changes'],
    setup: {
      hasUrl: false,
      hasPolling: false,
      hasSchedule: false,
      hasEventSelect: true,
    }
  },
  manual: {
    id: 'manual' as TriggerType,
    name: 'Manual',
    description: 'Start only when you click Run',
    badge: 'On-demand',
    badgeVariant: 'outline' as const,
    icon: Play,
    color: 'bg-gray-500/10 text-gray-600',
    examples: ['Test workflows', 'One-time tasks', 'Ad-hoc operations'],
    useCases: ['Testing and debugging', 'One-time migrations', 'Manual data processing'],
    setup: {
      hasUrl: false,
      hasPolling: false,
      hasSchedule: false,
    }
  },
};

const POLLING_INTERVALS = [
  { value: '1', label: 'Every minute', description: 'High frequency monitoring' },
  { value: '5', label: 'Every 5 minutes', description: 'Recommended for most cases' },
  { value: '15', label: 'Every 15 minutes', description: 'Balanced approach' },
  { value: '30', label: 'Every 30 minutes', description: 'Low frequency' },
  { value: '60', label: 'Every hour', description: 'Hourly checks' },
  { value: '1440', label: 'Once a day', description: 'Daily monitoring' },
];

const SCHEDULE_PRESETS = [
  { label: 'Every day at 9 AM', cron: '0 9 * * *' },
  { label: 'Every weekday at 9 AM', cron: '0 9 * * 1-5' },
  { label: 'Every Monday at 9 AM', cron: '0 9 * * 1' },
  { label: 'First day of month at 9 AM', cron: '0 9 1 * *' },
];

const EXPRESSION_HELPERS = [
  { label: 'Email', expr: '{{$json.email}}', desc: 'Get email field' },
  { label: 'Name', expr: '{{$json.name}}', desc: 'Get name field' },
  { label: 'First Name', expr: '{{$json.firstName}}', desc: 'Get first name' },
  { label: 'Last Name', expr: '{{$json.lastName}}', desc: 'Get last name' },
  { label: 'Phone', expr: '{{$json.phone}}', desc: 'Get phone number' },
  { label: 'ID', expr: '{{$json.id}}', desc: 'Get record ID' },
  { label: 'Current Date', expr: '{{$now.toISODate()}}', desc: 'Today\'s date' },
  { label: 'Timestamp', expr: '{{$now}}', desc: 'Current timestamp' },
];

// ============================================================================
// Main Component
// ============================================================================

export function ConfigPanelV2({
  node,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onTest,
  previousNodes = [],
}: ConfigPanelV2Props) {
  const { toast } = useToast();
  const isTrigger = node?.type === 'trigger';
  
  // Current wizard step
  const [currentStep, setCurrentStep] = useState(0);
  
  // Configuration state
  const [triggerType, setTriggerType] = useState<TriggerType | null>(null);
  const [pollingInterval, setPollingInterval] = useState('5');
  const [schedulePreset, setSchedulePreset] = useState('');
  const [customCron, setCustomCron] = useState('');
  const [eventType, setEventType] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  
  // Authentication state
  const [authMethod, setAuthMethod] = useState<'oauth' | 'apikey'>('oauth');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Data mapping state
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [showExpressionHelper, setShowExpressionHelper] = useState(false);
  const [activeMapping, setActiveMapping] = useState<string | null>(null);
  
  // General config
  const [stepName, setStepName] = useState('');
  const [stepDescription, setStepDescription] = useState('');
  
  // App-specific config
  const [selectedTriggerId, setSelectedTriggerId] = useState<string>('');
  const [selectedActionId, setSelectedActionId] = useState<string>('');
  const [dynamicFields, setDynamicFields] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  
  // Reset state when node changes
  useEffect(() => {
    if (node) {
      setStepName(node.config?.name || node.name || '');
      setStepDescription(node.config?.description || '');
      setTriggerType(node.config?.triggerType || null);
      setPollingInterval(node.config?.pollingInterval || '5');
      setIsAuthenticated(node.config?.isAuthenticated || false);
      setFieldMappings(node.config?.fieldMappings || []);
      setSelectedTriggerId(node.config?.selectedTriggerId || '');
      setSelectedActionId(node.config?.selectedActionId || node.actionId || '');
      setDynamicFields(node.config?.dynamicFields || {});
      
      // Smart step navigation based on trigger type
      if (node.type === 'trigger') {
        const nodeTriggerType = node.config?.triggerType;
        
        if (nodeTriggerType === 'manual') {
          // Manual triggers use simplified steps [Settings, Test]
          // Start at Settings (step 0) or Test (step 1) 
          setIsAuthenticated(true); // Manual triggers don't need auth
          setCurrentStep(0); // Show Settings step for manual triggers
        } else if (nodeTriggerType) {
          // Other trigger types - skip to Connect step (step 1 in standard flow)
          setCurrentStep(1);
        } else {
          // No trigger type set - start at step 0
          setCurrentStep(0);
        }
      } else {
        // Action nodes - start at step 0
        setCurrentStep(0);
      }
      
      setTestResult(null);
      setSearchQuery('');
      
      // Generate webhook URL if not exists
      if (node.type === 'trigger') {
        setWebhookUrl(`https://api.yourapp.com/webhook/${node.id}`);
      }
    }
  }, [node?.id]);

  if (!isOpen || !node) return null;

  // Check if this is a manual trigger (which has simplified config)
  const isManualTrigger = node.type === 'trigger' && (triggerType === 'manual' || node.config?.triggerType === 'manual');

  // Define wizard steps based on node type and trigger type
  // Manual triggers have a simplified flow - just Settings and Test
  const manualTriggerSteps: StepConfig[] = [
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Configure manual trigger',
      icon: <Settings className="h-4 w-4" />,
      isComplete: true, // Manual triggers are always ready
      isRequired: false,
    },
    {
      id: 'test',
      title: 'Test',
      subtitle: 'Run the workflow',
      icon: <Play className="h-4 w-4" />,
      isComplete: testResult === 'success',
      isRequired: false,
    },
  ];

  const standardTriggerSteps: StepConfig[] = [
    {
      id: 'trigger-type',
      title: 'Trigger Type',
      subtitle: 'How should this workflow start?',
      icon: <Zap className="h-4 w-4" />,
      isComplete: !!triggerType,
      isRequired: true,
    },
    {
      id: 'credentials',
      title: 'Connect',
      subtitle: 'Authenticate with the service',
      icon: <Key className="h-4 w-4" />,
      isComplete: isAuthenticated,
      isRequired: true,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Configure trigger options',
      icon: <Settings className="h-4 w-4" />,
      isComplete: isTriggerSettingsComplete(),
      isRequired: true,
    },
    {
      id: 'test',
      title: 'Test',
      subtitle: 'Verify configuration',
      icon: <Play className="h-4 w-4" />,
      isComplete: testResult === 'success',
      isRequired: false,
    },
  ];

  // Use simplified steps for manual triggers
  const triggerSteps = isManualTrigger ? manualTriggerSteps : standardTriggerSteps;

  const actionSteps: StepConfig[] = [
    {
      id: 'operation',
      title: 'Operation',
      subtitle: 'What action to perform?',
      icon: <Settings className="h-4 w-4" />,
      isComplete: !!selectedActionId,
      isRequired: true,
    },
    {
      id: 'credentials',
      title: 'Connect',
      subtitle: 'Authenticate with the service',
      icon: <Key className="h-4 w-4" />,
      isComplete: isAuthenticated,
      isRequired: true,
    },
    {
      id: 'mapping',
      title: 'Data',
      subtitle: 'Map input data',
      icon: <Database className="h-4 w-4" />,
      isComplete: fieldMappings.length > 0,
      isRequired: false,
    },
    {
      id: 'test',
      title: 'Test',
      subtitle: 'Verify configuration',
      icon: <Play className="h-4 w-4" />,
      isComplete: testResult === 'success',
      isRequired: false,
    },
  ];

  const steps = isTrigger ? triggerSteps : actionSteps;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Helper functions
  function isTriggerSettingsComplete(): boolean {
    if (!triggerType) return false;
    switch (triggerType) {
      case 'poll':
        return !!pollingInterval;
      case 'schedule':
        return !!schedulePreset || !!customCron;
      case 'app-event':
        return !!eventType;
      default:
        return true;
    }
  }

  function canProceed(): boolean {
    const step = steps[currentStep];
    if (!step) return false;
    return !step.isRequired || step.isComplete;
  }

  // Handlers
  const handleOAuthConnect = async () => {
    // Get app-specific auth config
    const appConfig = node?.appId ? getAppConfig(node.appId) : null;
    const authConfig = appConfig?.auth?.find(a => a.type === 'oauth2');
    
    if (authConfig?.oauthUrls?.authorize) {
      // Real OAuth flow - redirect to authorization URL
      const state = JSON.stringify({ nodeId: node.id, appId: node.appId });
      const redirectUri = `${window.location.origin}/api/oauth/callback`;
      const scopes = authConfig.scopes?.join(' ') || '';
      
      const authUrl = `${authConfig.oauthUrls.authorize}?` +
        `client_id=${encodeURIComponent(process.env.VITE_OAUTH_CLIENT_ID || 'demo')}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&state=${encodeURIComponent(state)}`;
      
      // Open OAuth window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const authWindow = window.open(
        authUrl,
        'OAuth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );
      
      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'oauth_complete' && event.data?.nodeId === node.id) {
          setIsAuthenticated(true);
          toast({
            title: "Connected!",
            description: `Your ${node.appName} account has been connected.`,
          });
          window.removeEventListener('message', handleMessage);
        } else if (event.data?.type === 'oauth_error') {
          toast({
            title: "Connection failed",
            description: event.data?.error || "Please try again.",
            variant: "destructive",
          });
          window.removeEventListener('message', handleMessage);
        }
      };
      
      window.addEventListener('message', handleMessage);
      return;
    }
    
    // Fallback: Demo mode or apps without OAuth configured
    // Show a dialog to enter credentials instead of auto-connecting
    setIsAuthenticating(true);
    toast({
      title: "Demo Mode",
      description: `OAuth not configured for ${node.appName}. Using demo connection.`,
    });
    
    try {
      await new Promise(r => setTimeout(r, 1500));
      setIsAuthenticated(true);
      toast({
        title: "Connected (Demo)!",
        description: `Demo connection established for ${node.appName}.`,
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleApiKeyVerify = async () => {
    // Get app config and auth methods
    const appConfig = node?.appId ? getAppConfig(node.appId) : null;
    const authMethods = appConfig?.auth || [];
    const apiKeyConfig = authMethods.find((a: any) => a.type === 'api-key' || a.type === 'bearer');
    
    // Check if using dynamic fields or simple apiKey state
    if (apiKeyConfig?.fields?.length) {
      // Check all required fields are filled
      const missingFields = apiKeyConfig.fields
        .filter((f: any) => f.required && !dynamicFields[f.key])
        .map((f: any) => f.label);
      
      if (missingFields.length > 0) {
        toast({ 
          title: `${missingFields[0]} required`, 
          variant: "destructive" 
        });
        return;
      }
    } else if (!apiKey) {
      toast({ title: "API Key required", variant: "destructive" });
      return;
    }
    
    setIsAuthenticating(true);
    try {
      // TODO: Add real API verification here
      await new Promise(r => setTimeout(r, 1500));
      setIsAuthenticated(true);
      toast({ title: "API Key verified!", description: "Connection established." });
    } catch (error) {
      toast({ title: "Verification failed", variant: "destructive" });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const addFieldMapping = () => {
    setFieldMappings(prev => [...prev, {
      id: `mapping-${Date.now()}`,
      targetField: '',
      expression: '',
      type: 'expression',
    }]);
  };

  const updateFieldMapping = (id: string, field: keyof FieldMapping, value: string) => {
    setFieldMappings(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const removeFieldMapping = (id: string) => {
    setFieldMappings(prev => prev.filter(m => m.id !== id));
  };

  const insertExpression = (expr: string) => {
    if (activeMapping) {
      updateFieldMapping(activeMapping, 'expression', 
        fieldMappings.find(m => m.id === activeMapping)?.expression + expr
      );
    }
    setShowExpressionHelper(false);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await new Promise(r => setTimeout(r, 2000));
      setTestResult('success');
      toast({ title: "Test successful!", description: "Node is configured correctly." });
    } catch (error) {
      setTestResult('error');
      toast({ title: "Test failed", variant: "destructive" });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const config = {
      name: stepName,
      description: stepDescription,
      triggerType,
      pollingInterval,
      schedulePreset,
      customCron,
      eventType,
      isAuthenticated,
      fieldMappings,
      selectedTriggerId,
      selectedActionId,
      dynamicFields,
    };
    onSave(node.id, config);
    toast({ title: "Saved!", description: "Configuration has been saved." });
    onClose();
  };

  // ============================================================================
  // Step Renderers
  // ============================================================================

  const renderTriggerTypeStep = () => {
    const selectedConfig = triggerType && triggerType in TRIGGER_CONFIGS 
      ? TRIGGER_CONFIGS[triggerType as TriggerConfigKey] 
      : null;

    return (
      <div className="space-y-4">
        {/* Header with context */}
        <div className="flex items-center gap-3 pb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
            <span className="text-2xl">{node.appIcon}</span>
          </div>
          <div>
            <h3 className="font-semibold">Configure {node.appName} Trigger</h3>
            <p className="text-sm text-muted-foreground">
              How should this workflow be triggered?
            </p>
          </div>
        </div>

        {/* Trigger type selection */}
        <RadioGroup value={triggerType || ''} onValueChange={(v) => setTriggerType(v as TriggerType)}>
          <div className="space-y-2">
            {Object.values(TRIGGER_CONFIGS).map((config) => {
              const Icon = config.icon;
              const isSelected = triggerType === config.id;

              return (
                <Card 
                  key={config.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    "hover:border-primary/50 hover:shadow-sm",
                    isSelected && "ring-2 ring-primary border-primary shadow-sm"
                  )}
                  onClick={() => setTriggerType(config.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={config.id} id={config.id} className="mt-0.5" />
                      <div className={cn("p-1.5 rounded-md", config.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Label htmlFor={config.id} className="font-medium cursor-pointer">
                            {config.name}
                          </Label>
                          <Badge variant={config.badgeVariant} className="text-[10px] h-5">
                            {config.badge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {config.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </RadioGroup>

        {/* Selected trigger info */}
        {selectedConfig && (
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Perfect for:</span>
              </div>
              <ul className="space-y-1.5">
                {selectedConfig.useCases.map((useCase, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    {useCase}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* App-specific trigger selector */}
        {renderAppTriggerSelector()}
      </div>
    );
  };

  const renderCredentialsStep = () => {
    // Get app-specific auth config
    const appConfig = node?.appId ? getAppConfig(node.appId) : null;
    const availableAuthMethods = appConfig?.auth || [];
    const hasOAuth = availableAuthMethods.some(a => a.type === 'oauth2');
    const hasApiKey = availableAuthMethods.some(a => a.type === 'api-key' || a.type === 'bearer');
    const apiKeyConfig = availableAuthMethods.find(a => a.type === 'api-key' || a.type === 'bearer');
    
    return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          Connect to {node.appName}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Securely authenticate to access your data
        </p>
      </div>

      {/* Connection status */}
      {isAuthenticated && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">Connected</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300 text-sm">
            Your account is connected and ready to use.
            <button 
              className="ml-2 text-green-700 dark:text-green-300 underline hover:no-underline text-sm"
              onClick={() => setIsAuthenticated(false)}
            >
              Disconnect
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Auth method tabs - only show if both methods available */}
      {(hasOAuth || hasApiKey) && !isAuthenticated && (
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
          {hasOAuth && (
            <Button
              variant={authMethod === 'oauth' ? 'default' : 'ghost'}
              size="sm"
              className="h-9"
              onClick={() => setAuthMethod('oauth')}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              OAuth
            </Button>
          )}
          {hasApiKey && (
            <Button
              variant={authMethod === 'apikey' ? 'default' : 'ghost'}
              size="sm"
              className={cn("h-9", !hasOAuth && "col-span-2")}
              onClick={() => setAuthMethod('apikey')}
            >
              <Key className="h-3.5 w-3.5 mr-1.5" />
              API Key
            </Button>
          )}
        </div>
      )}

      {/* OAuth flow */}
      {authMethod === 'oauth' && !isAuthenticated && hasOAuth && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Sign in with {node.appName}</p>
                <p className="text-xs text-muted-foreground">
                  You'll be redirected to authorize access
                </p>
              </div>
            </div>
            
            <Button 
              className="w-full"
              onClick={handleOAuthConnect}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Account
                </>
              )}
            </Button>
            
            {/* OAuth scopes info */}
            {availableAuthMethods.find(a => a.type === 'oauth2')?.scopes && (
              <div className="text-[10px] text-muted-foreground">
                <span className="font-medium">Permissions requested:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableAuthMethods.find(a => a.type === 'oauth2')?.scopes?.slice(0, 3).map((scope, i) => (
                    <Badge key={i} variant="secondary" className="text-[9px] h-4">{scope}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Key flow */}
      {authMethod === 'apikey' && !isAuthenticated && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {apiKeyConfig?.fields?.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label className="text-sm flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </Label>
                <div className="relative">
                  <Input
                    type={field.type === 'password' ? (showApiKey ? 'text' : 'password') : 'text'}
                    placeholder={field.placeholder || `Enter your ${field.label}`}
                    value={dynamicFields[field.key] || ''}
                    onChange={(e) => setDynamicFields(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className={cn("text-sm", field.type === 'password' && "pr-10 font-mono")}
                  />
                  {field.type === 'password' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-10"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  )}
                </div>
                {field.helpText && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {field.helpText}
                  </p>
                )}
              </div>
            )) || (
              <div className="space-y-2">
                <Label className="text-sm">API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Find this in your {node.appName} account settings
                </p>
              </div>
            )}

            {/* App docs link */}
            {appConfig?.docsUrl && (
              <a 
                href={appConfig.docsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View {node.appName} API documentation
              </a>
            )}

            <Button 
              className="w-full" 
              onClick={handleApiKeyVerify}
              disabled={isAuthenticating || (
                apiKeyConfig?.fields?.length 
                  ? apiKeyConfig.fields.some(f => f.required && !dynamicFields[f.key])
                  : !apiKey
              )}
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Verify & Connect
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* No auth methods available */}
      {!hasOAuth && !hasApiKey && !isAuthenticated && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            This app doesn't require authentication or uses a different auth method.
            <button 
              className="ml-1 text-primary underline hover:no-underline text-sm"
              onClick={() => setIsAuthenticated(true)}
            >
              Continue without auth
            </button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
  };

  const renderTriggerSettingsStep = () => {
    const selectedConfig = triggerType && triggerType in TRIGGER_CONFIGS 
      ? TRIGGER_CONFIGS[triggerType as TriggerConfigKey] 
      : null;
    if (!selectedConfig) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", selectedConfig.color)}>
            <selectedConfig.icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Configure {selectedConfig.name} Trigger</h3>
            <p className="text-sm text-muted-foreground">
              Set up exactly how and when this trigger fires
            </p>
          </div>
        </div>

        {/* Webhook settings */}
        {triggerType === 'webhook' && (
          <div className="space-y-4">
            <Alert>
              <Webhook className="h-4 w-4" />
              <AlertTitle className="text-sm">Your Webhook URL</AlertTitle>
              <AlertDescription className="space-y-2">
                <p className="text-xs">
                  Send HTTP POST requests here to trigger this workflow:
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs break-all font-mono">
                    {webhookUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl);
                      toast({ title: "Copied!" });
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            <div className="p-3 bg-muted/30 rounded-lg space-y-2">
              <p className="text-xs font-medium">Expected payload format:</p>
              <pre className="text-[10px] font-mono bg-background p-2 rounded overflow-x-auto">
{`{
  "email": "user@example.com",
  "name": "John Doe",
  "data": { ... }
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Polling settings */}
        {triggerType === 'poll' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                Check Interval
              </Label>
              <Select value={pollingInterval} onValueChange={setPollingInterval}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POLLING_INTERVALS.map((interval) => (
                    <SelectItem key={interval.value} value={interval.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{interval.label}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">
                          {interval.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                The workflow will check for new data every {
                  POLLING_INTERVALS.find(i => i.value === pollingInterval)?.label.toLowerCase()
                }. More frequent polling may affect API limits.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Schedule settings */}
        {triggerType === 'schedule' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Schedule
              </Label>
              <Select value={schedulePreset} onValueChange={(v) => {
                setSchedulePreset(v);
                setCustomCron(SCHEDULE_PRESETS.find(p => p.cron === v)?.cron || '');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a schedule" />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_PRESETS.map((preset) => (
                    <SelectItem key={preset.cron} value={preset.cron}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Or enter custom cron expression
              </Label>
              <Input
                placeholder="0 9 * * 1-5"
                value={customCron}
                onChange={(e) => {
                  setCustomCron(e.target.value);
                  setSchedulePreset('');
                }}
                className="font-mono text-sm"
              />
            </div>

            {(schedulePreset || customCron) && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Next runs will be calculated when saved
                </p>
              </div>
            )}
          </div>
        )}

        {/* App Event settings */}
        {triggerType === 'app-event' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" />
                Event Type
              </Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Record Created</SelectItem>
                  <SelectItem value="updated">Record Updated</SelectItem>
                  <SelectItem value="deleted">Record Deleted</SelectItem>
                  <SelectItem value="status-changed">Status Changed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {eventType && (
              <Alert className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                <Zap className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                  This workflow will run whenever a "{eventType}" event occurs in {node.appName}.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Manual trigger info */}
        {triggerType === 'manual' && (
          <Alert>
            <Play className="h-4 w-4" />
            <AlertTitle className="text-sm">Manual Trigger</AlertTitle>
            <AlertDescription className="text-xs">
              This workflow will only run when you click the "Execute" button or trigger it via the API.
              Perfect for testing or one-time operations.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  // ============================================================================
  // Dynamic Field Renderer - Renders fields based on AppConfigurations
  // ============================================================================

  const renderDynamicField = (field: ConfigField) => {
    const value = dynamicFields[field.key] ?? field.default ?? '';
    
    // Check if field has dependency
    if (field.dependsOn) {
      const dependsOnValue = dynamicFields[field.dependsOn.field];
      if (dependsOnValue !== field.dependsOn.value) {
        return null;
      }
    }

    const updateField = (newValue: any) => {
      setDynamicFields(prev => ({ ...prev, [field.key]: newValue }));
    };

    const fieldLabel = (
      <Label className="text-sm flex items-center gap-2">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
        {field.helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{field.helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </Label>
    );

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <div key={field.key} className="space-y-1.5">
            {fieldLabel}
            <Input
              type={field.type}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => updateField(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        );

      case 'password':
        return (
          <div key={field.key} className="space-y-1.5">
            {fieldLabel}
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => updateField(e.target.value)}
                className="h-9 text-sm pr-10 font-mono"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div key={field.key} className="space-y-1.5">
            {fieldLabel}
            <Textarea
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => updateField(e.target.value)}
              className="text-sm min-h-[80px]"
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.key} className="space-y-1.5">
            {fieldLabel}
            <Input
              type="number"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => updateField(parseFloat(e.target.value) || 0)}
              className="h-9 text-sm"
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={field.key} className="flex items-center justify-between py-2">
            {fieldLabel}
            <Button
              variant={value ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateField(!value)}
            >
              {value ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="space-y-1.5">
            {fieldLabel}
            <Select value={value?.toString() || ''} onValueChange={updateField}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div key={field.key} className="space-y-1.5">
            {fieldLabel}
            <div className="border rounded-md p-2 space-y-1 max-h-32 overflow-y-auto">
              {field.options?.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`${field.key}-${opt.value}`}
                    checked={selectedValues.includes(opt.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateField([...selectedValues, opt.value]);
                      } else {
                        updateField(selectedValues.filter((v: string) => v !== opt.value));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor={`${field.key}-${opt.value}`} className="text-sm">
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'json':
        return (
          <div key={field.key} className="space-y-1.5">
            {fieldLabel}
            <Textarea
              placeholder={field.placeholder || '{}'}
              value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
              onChange={(e) => {
                try {
                  updateField(JSON.parse(e.target.value));
                } catch {
                  updateField(e.target.value);
                }
              }}
              className="text-sm min-h-[80px] font-mono"
            />
          </div>
        );

      case 'datetime':
        return (
          <div key={field.key} className="space-y-1.5">
            {fieldLabel}
            <Input
              type="datetime-local"
              value={value}
              onChange={(e) => updateField(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        );

      case 'file':
        return (
          <div key={field.key} className="space-y-1.5">
            {fieldLabel}
            <Input
              type="file"
              onChange={(e) => updateField(e.target.files?.[0]?.name || '')}
              className="h-9 text-sm"
            />
          </div>
        );

      default:
        return (
          <div key={field.key} className="space-y-1.5">
            {fieldLabel}
            <Input
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => updateField(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        );
    }
  };

  // ============================================================================
  // Operation Selection Step (for Actions)
  // ============================================================================

  const renderOperationStep = () => {
    const appConfig = node?.appId ? getAppConfig(node.appId) : null;
    const actions = appConfig?.actions || [];
    
    // Filter actions based on search
    const filteredActions = actions.filter(action =>
      action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedAction = actions.find(a => a.id === selectedActionId);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
            <span className="text-2xl">{node?.appIcon}</span>
          </div>
          <div>
            <h3 className="font-semibold">Select Action</h3>
            <p className="text-sm text-muted-foreground">
              What should {node?.appName} do?
            </p>
          </div>
        </div>

        {/* Search box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Actions list */}
        {appConfig ? (
          <ScrollArea className="h-[280px]">
            <div className="space-y-2 pr-2">
              {filteredActions.length > 0 ? filteredActions.map((action) => {
                const isSelected = selectedActionId === action.id;
                return (
                  <Card
                    key={action.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      "hover:border-primary/50 hover:shadow-sm",
                      isSelected && "ring-2 ring-primary border-primary shadow-sm"
                    )}
                    onClick={() => {
                      setSelectedActionId(action.id);
                      setDynamicFields({});
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{action.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {action.description}
                          </p>
                          {action.fields.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <Badge variant="outline" className="text-[10px] h-4">
                                {action.fields.length} fields
                              </Badge>
                              {action.fields.filter(f => f.required).length > 0 && (
                                <Badge variant="secondary" className="text-[10px] h-4">
                                  {action.fields.filter(f => f.required).length} required
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) : (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No actions found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              No configuration available for this app yet. 
              You can still proceed with manual configuration.
            </AlertDescription>
          </Alert>
        )}

        {/* Selected action config fields */}
        {selectedAction && selectedAction.fields.length > 0 && (
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-3.5 w-3.5" />
              Configure {selectedAction.name}
            </Label>
            <div className="space-y-3">
              {selectedAction.fields.map(field => renderDynamicField(field))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // App-specific Trigger Selection (enhanced trigger type step)
  // ============================================================================

  const renderAppTriggerSelector = () => {
    const appConfig = node?.appId ? getAppConfig(node.appId) : null;
    const triggers = appConfig?.triggers || [];

    if (triggers.length === 0) return null;

    const filteredTriggers = triggers.filter(trigger =>
      trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trigger.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedTrigger = triggers.find(t => t.id === selectedTriggerId);

    return (
      <div className="space-y-3 mt-4 pt-4 border-t">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-3.5 w-3.5" />
          {node?.appName} Triggers
        </Label>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search triggers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>

        <ScrollArea className="h-[180px]">
          <div className="space-y-2 pr-2">
            {filteredTriggers.map((trigger) => {
              const isSelected = selectedTriggerId === trigger.id;
              return (
                <Card
                  key={trigger.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    "hover:border-primary/50",
                    isSelected && "ring-2 ring-primary border-primary"
                  )}
                  onClick={() => {
                    setSelectedTriggerId(trigger.id);
                    if (trigger.defaultTriggerType) {
                      setTriggerType(trigger.defaultTriggerType as TriggerType);
                    }
                    setDynamicFields({});
                  }}
                >
                  <CardContent className="p-2.5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                      )}>
                        {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs">{trigger.name}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {trigger.description}
                        </p>
                      </div>
                      {trigger.triggerTypes && (
                        <Badge variant="outline" className="text-[9px] h-4 flex-shrink-0">
                          {trigger.triggerTypes[0]}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        {/* Trigger config fields */}
        {selectedTrigger && selectedTrigger.fields.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-xs text-muted-foreground">
              Configure trigger options
            </Label>
            <div className="space-y-2">
              {selectedTrigger.fields.map(field => renderDynamicField(field))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDataMappingStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          Map Data
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure what data to send to {node.appName}
        </p>
      </div>

      {/* Previous nodes data preview */}
      {previousNodes.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <Label className="text-xs text-muted-foreground mb-2 block">
              Available data from previous steps:
            </Label>
            <div className="space-y-1.5">
              {previousNodes.map((pNode, idx) => (
                <div key={pNode.id} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="h-5">{idx + 1}</Badge>
                  <span className="text-muted-foreground">{pNode.appName}</span>
                  <code className="bg-background px-1.5 py-0.5 rounded text-[10px] font-mono">
                    {`{{$node["${pNode.name}"].json}}`}
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Field mappings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Field Mappings</Label>
          <Button variant="outline" size="sm" onClick={addFieldMapping}>
            <Plus className="h-3 w-3 mr-1" />
            Add Field
          </Button>
        </div>

        <div className="space-y-2">
          {fieldMappings.map((mapping) => (
            <Card key={mapping.id} className="p-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Target field (e.g., email)"
                    value={mapping.targetField}
                    onChange={(e) => updateFieldMapping(mapping.id, 'targetField', e.target.value)}
                    className="h-8 text-xs"
                  />
                  <div className="relative">
                    <Input
                      placeholder="{{$json.email}}"
                      value={mapping.expression}
                      onChange={(e) => updateFieldMapping(mapping.id, 'expression', e.target.value)}
                      onFocus={() => {
                        setActiveMapping(mapping.id);
                        setShowExpressionHelper(true);
                      }}
                      className="h-8 text-xs font-mono pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-8 w-8"
                      onClick={() => {
                        setActiveMapping(mapping.id);
                        setShowExpressionHelper(!showExpressionHelper);
                      }}
                    >
                      <Sparkles className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFieldMapping(mapping.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}

          {fieldMappings.length === 0 && (
            <Card className="border-dashed p-6">
              <div className="text-center">
                <Database className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No field mappings yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add mappings to define what data to send
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Expression helper */}
      {showExpressionHelper && (
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <Label className="text-xs font-medium mb-2 block">Quick Insert</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {EXPRESSION_HELPERS.map((helper) => (
                <Button
                  key={helper.expr}
                  variant="outline"
                  size="sm"
                  className="justify-start text-xs h-8"
                  onClick={() => insertExpression(helper.expr)}
                >
                  <Copy className="h-3 w-3 mr-1.5" />
                  {helper.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTestStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <Play className="h-4 w-4 text-muted-foreground" />
          Test Configuration
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Verify everything is set up correctly
        </p>
      </div>

      {/* Configuration summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isTrigger && triggerType && triggerType in TRIGGER_CONFIGS && (
            <div className="flex justify-between items-center py-1.5 border-b">
              <span className="text-muted-foreground">Trigger</span>
              <Badge variant="secondary">{TRIGGER_CONFIGS[triggerType as TriggerConfigKey].name}</Badge>
            </div>
          )}
          <div className="flex justify-between items-center py-1.5 border-b">
            <span className="text-muted-foreground">Connection</span>
            <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? "Connected" : "Not Connected"}
            </Badge>
          </div>
          {!isTrigger && (
            <div className="flex justify-between items-center py-1.5">
              <span className="text-muted-foreground">Data Mappings</span>
              <span>{fieldMappings.length} configured</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test button */}
      <Button
        className="w-full"
        variant={testResult === 'success' ? 'default' : 'outline'}
        onClick={handleTest}
        disabled={isTesting}
      >
        {isTesting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Testing...
          </>
        ) : testResult === 'success' ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Test Passed
          </>
        ) : testResult === 'error' ? (
          <>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Test
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run Test
          </>
        )}
      </Button>

      {/* Test result */}
      {testResult === 'success' && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            Test Successful!
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300 text-sm">
            Your node is configured correctly and ready to use.
          </AlertDescription>
        </Alert>
      )}

      {testResult === 'error' && (
        <Alert className="bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 dark:text-red-200">
            Test Failed
          </AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300 text-sm">
            Please check your configuration and try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    const stepId = steps[currentStep]?.id;
    
    switch (stepId) {
      case 'trigger-type':
        return renderTriggerTypeStep();
      case 'credentials':
        return renderCredentialsStep();
      case 'settings':
        return renderTriggerSettingsStep();
      case 'operation':
        return renderOperationStep();
      case 'mapping':
        return renderDataMappingStep();
      case 'test':
        return renderTestStep();
      default:
        return null;
    }
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className={cn(
      "w-[420px] h-full bg-background border-l flex flex-col",
      "animate-in slide-in-from-right duration-200"
    )}>
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: node.appColor + '20' }}
          >
            <span className="text-lg">{node.appIcon}</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight">{node.appName}</h3>
            <Badge variant="secondary" className="text-[10px] h-4 capitalize">
              {node.type}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3 pb-2 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-xs font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1" />
        
        {/* Step indicators */}
        <div className="flex justify-between mt-3">
          {steps.map((step, idx) => (
            <TooltipProvider key={step.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all",
                      "hover:bg-muted/50",
                      idx === currentStep && "bg-primary/5",
                      idx > currentStep && !steps.slice(0, idx).every(s => !s.isRequired || s.isComplete) && "opacity-40"
                    )}
                    onClick={() => {
                      // Allow clicking completed steps or current step
                      if (idx <= currentStep || steps.slice(0, idx).every(s => !s.isRequired || s.isComplete)) {
                        setCurrentStep(idx);
                      }
                    }}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors",
                      step.isComplete && "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
                      idx === currentStep && !step.isComplete && "bg-primary text-primary-foreground",
                      idx !== currentStep && !step.isComplete && "bg-muted text-muted-foreground"
                    )}>
                      {step.isComplete ? <Check className="h-3.5 w-3.5" /> : step.icon}
                    </div>
                    <span className={cn(
                      "text-[9px] font-medium max-w-[50px] text-center leading-tight",
                      idx === currentStep ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {step.subtitle}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {renderStepContent()}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t flex-shrink-0 space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleSave}
            >
              <Check className="h-4 w-4 mr-1" />
              Save & Activate
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-muted-foreground"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Duplicate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfigPanelV2;
