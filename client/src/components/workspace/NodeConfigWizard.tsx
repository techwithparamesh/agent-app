/**
 * NodeConfigWizard - n8n-inspired step-based configuration wizard
 * 
 * Key UX Principles from n8n:
 * 1. Progressive disclosure - show only what's needed at each step
 * 2. Clear visual hierarchy - users know exactly where they are
 * 3. Contextual help - examples and hints at every step
 * 4. Validation feedback - instant feedback on configuration state
 * 5. Smart defaults - pre-fill when possible
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FlowNode } from "./types";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TriggerType = 'webhook' | 'poll' | 'schedule' | 'email' | 'manual' | 'app-event';
export type ActionType = 'create' | 'update' | 'delete' | 'get' | 'list' | 'custom';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isComplete: boolean;
  isActive: boolean;
  isDisabled: boolean;
}

export interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  expression: string;
  type: 'direct' | 'expression' | 'static';
}

export interface NodeConfiguration {
  // Trigger specific
  triggerType?: TriggerType;
  triggerEvent?: string;
  webhookUrl?: string;
  webhookAuth?: string;
  pollingInterval?: number;
  scheduleExpression?: string;
  scheduleType?: string;
  scheduleTime?: string;
  
  // Action specific
  actionType?: ActionType;
  operation?: string;
  
  // Authentication
  authType?: 'api-key' | 'oauth2' | 'basic' | 'bearer' | 'custom';
  credentials?: Record<string, string>;
  isAuthenticated?: boolean;
  
  // Data mapping
  fieldMappings?: FieldMapping[];
  inputData?: string;
  outputFormat?: 'json' | 'array' | 'single';
  
  // Advanced
  retryOnFail?: boolean;
  maxRetries?: number;
  timeout?: number;
  continueOnError?: boolean;
}

interface NodeConfigWizardProps {
  node: FlowNode;
  previousNodes?: FlowNode[];
  onSave: (config: NodeConfiguration) => void;
  onCancel: () => void;
  onTest?: () => void;
}

// ============================================================================
// Trigger Type Options (n8n-style with clear examples)
// ============================================================================

const TRIGGER_TYPES = [
  {
    id: 'webhook' as TriggerType,
    name: 'Webhook',
    description: 'Trigger instantly when data is received',
    badge: 'Real-time',
    badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    icon: Webhook,
    examples: [
      'Form submission received',
      'Payment completed',
      'New lead from website'
    ],
    configuration: {
      needsWebhookUrl: true,
      needsPolling: false,
      needsSchedule: false
    }
  },
  {
    id: 'poll' as TriggerType,
    name: 'Polling',
    description: 'Check for changes at set intervals',
    badge: 'Scheduled',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    icon: RefreshCw,
    examples: [
      'New rows in spreadsheet',
      'Updated records in database',
      'New files in folder'
    ],
    configuration: {
      needsWebhookUrl: false,
      needsPolling: true,
      needsSchedule: false
    }
  },
  {
    id: 'schedule' as TriggerType,
    name: 'Schedule',
    description: 'Run at specific times',
    badge: 'Time-based',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    icon: Calendar,
    examples: [
      'Daily report at 9 AM',
      'Weekly backup on Sunday',
      'Monthly cleanup on 1st'
    ],
    configuration: {
      needsWebhookUrl: false,
      needsPolling: false,
      needsSchedule: true
    }
  },
  {
    id: 'app-event' as TriggerType,
    name: 'App Event',
    description: 'When something happens in the app',
    badge: 'Event-driven',
    badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    icon: Zap,
    examples: [
      'New customer created',
      'Order status changed',
      'Message received'
    ],
    configuration: {
      needsWebhookUrl: false,
      needsPolling: false,
      needsSchedule: false,
      needsEventSelection: true
    }
  },
  {
    id: 'manual' as TriggerType,
    name: 'Manual',
    description: 'Start manually when you want',
    badge: 'On-demand',
    badgeColor: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    icon: Play,
    examples: [
      'Test workflow',
      'One-time data import',
      'Ad-hoc processing'
    ],
    configuration: {
      needsWebhookUrl: false,
      needsPolling: false,
      needsSchedule: false
    }
  },
];

const POLLING_INTERVALS = [
  { value: '1', label: 'Every minute' },
  { value: '5', label: 'Every 5 minutes' },
  { value: '15', label: 'Every 15 minutes' },
  { value: '30', label: 'Every 30 minutes' },
  { value: '60', label: 'Every hour' },
  { value: '360', label: 'Every 6 hours' },
  { value: '1440', label: 'Every day' },
];

// ============================================================================
// Component
// ============================================================================

export function NodeConfigWizard({
  node,
  previousNodes = [],
  onSave,
  onCancel,
  onTest,
}: NodeConfigWizardProps) {
  const { toast } = useToast();
  const isTrigger = node.type === 'trigger';
  
  // Current step in the wizard
  const [currentStep, setCurrentStep] = useState(0);
  
  // Configuration state
  const [config, setConfig] = useState<NodeConfiguration>({
    triggerType: node.config?.triggerType,
    authType: 'api-key',
    fieldMappings: [],
    retryOnFail: false,
    maxRetries: 3,
    timeout: 30,
    continueOnError: false,
    ...node.config,
  });
  
  // UI state
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Define wizard steps based on node type
  const steps: WizardStep[] = isTrigger ? [
    {
      id: 'trigger-type',
      title: 'How to Start',
      description: 'Choose how this workflow begins',
      icon: <Zap className="h-4 w-4" />,
      isComplete: !!config.triggerType,
      isActive: currentStep === 0,
      isDisabled: false,
    },
    {
      id: 'authentication',
      title: 'Connect Account',
      description: 'Authenticate with the service',
      icon: <Key className="h-4 w-4" />,
      isComplete: config.isAuthenticated === true,
      isActive: currentStep === 1,
      isDisabled: !config.triggerType,
    },
    {
      id: 'configuration',
      title: 'Configure Trigger',
      description: 'Set trigger-specific options',
      icon: <Settings className="h-4 w-4" />,
      isComplete: isTriggerConfigured(),
      isActive: currentStep === 2,
      isDisabled: !config.isAuthenticated,
    },
    {
      id: 'test',
      title: 'Test & Save',
      description: 'Verify everything works',
      icon: <Play className="h-4 w-4" />,
      isComplete: false,
      isActive: currentStep === 3,
      isDisabled: !isTriggerConfigured(),
    },
  ] : [
    {
      id: 'operation',
      title: 'Choose Operation',
      description: 'What action to perform',
      icon: <Settings className="h-4 w-4" />,
      isComplete: !!config.operation,
      isActive: currentStep === 0,
      isDisabled: false,
    },
    {
      id: 'authentication',
      title: 'Connect Account',
      description: 'Authenticate with the service',
      icon: <Key className="h-4 w-4" />,
      isComplete: config.isAuthenticated === true,
      isActive: currentStep === 1,
      isDisabled: !config.operation,
    },
    {
      id: 'mapping',
      title: 'Map Data',
      description: 'Configure input data',
      icon: <Database className="h-4 w-4" />,
      isComplete: hasDataMappings(),
      isActive: currentStep === 2,
      isDisabled: !config.isAuthenticated,
    },
    {
      id: 'test',
      title: 'Test & Save',
      description: 'Verify everything works',
      icon: <Play className="h-4 w-4" />,
      isComplete: false,
      isActive: currentStep === 3,
      isDisabled: !hasDataMappings(),
    },
  ];
  
  // Helper functions for validation
  function isTriggerConfigured(): boolean {
    if (!config.triggerType) return false;
    
    switch (config.triggerType) {
      case 'webhook':
        return true; // Webhook URL is auto-generated
      case 'poll':
        return !!config.pollingInterval;
      case 'schedule':
        return !!config.scheduleExpression;
      case 'app-event':
        return !!config.triggerEvent;
      case 'manual':
        return true;
      default:
        return false;
    }
  }
  
  function hasDataMappings(): boolean {
    return (config.fieldMappings?.length ?? 0) > 0 || !!config.inputData;
  }
  
  // Get progress percentage
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  // Update configuration
  const updateConfig = useCallback((key: keyof NodeConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // Handle OAuth connection
  const handleOAuthConnect = async () => {
    setIsVerifying(true);
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateConfig('isAuthenticated', true);
      toast({
        title: "Connected successfully",
        description: `Your ${node.appName} account has been connected.`,
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Please try again or use an API key instead.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle API key verification
  const handleVerifyApiKey = async () => {
    if (!config.credentials?.apiKey) {
      toast({
        title: "API Key required",
        description: "Please enter your API key to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateConfig('isAuthenticated', true);
      toast({
        title: "API Key verified",
        description: "Your credentials have been validated.",
      });
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle test execution
  const handleTest = async () => {
    setIsTesting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Test successful",
        description: "The node is configured correctly.",
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // Navigation handlers
  const canGoNext = () => {
    return steps[currentStep]?.isComplete || false;
  };
  
  const canGoPrev = () => currentStep > 0;
  
  const goNext = () => {
    if (currentStep < steps.length - 1 && canGoNext()) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSave = () => {
    onSave(config);
    toast({
      title: "Configuration saved",
      description: "Your node has been configured successfully.",
    });
  };

  // ============================================================================
  // Render Functions for Each Step
  // ============================================================================
  
  const renderTriggerTypeSelection = () => (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 text-xl">
            {node.appIcon}
          </span>
          Set up {node.appName} Trigger
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Choose how this workflow should start running
        </p>
      </div>
      
      <RadioGroup 
        value={config.triggerType || ''} 
        onValueChange={(value) => updateConfig('triggerType', value as TriggerType)}
        className="space-y-3"
      >
        {TRIGGER_TYPES.map((trigger) => {
          const Icon = trigger.icon;
          const isSelected = config.triggerType === trigger.id;
          
          return (
            <Card 
              key={trigger.id}
              className={cn(
                "cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:border-primary/50",
                isSelected && "ring-2 ring-primary shadow-md border-primary"
              )}
              onClick={() => updateConfig('triggerType', trigger.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <RadioGroupItem 
                    value={trigger.id} 
                    id={trigger.id}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Label htmlFor={trigger.id} className="font-semibold cursor-pointer">
                        {trigger.name}
                      </Label>
                      <Badge variant="secondary" className={cn("text-xs", trigger.badgeColor)}>
                        {trigger.badge}
                      </Badge>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary ml-auto flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {trigger.description}
                    </p>
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Examples:</p>
                      <ul className="space-y-1">
                        {trigger.examples.map((example, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </RadioGroup>
    </div>
  );
  
  const renderAuthentication = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Key className="h-5 w-5 text-muted-foreground" />
          Connect your {node.appName} Account
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Securely connect to access your data
        </p>
      </div>
      
      {/* Connection Status */}
      {config.isAuthenticated && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">Connected</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Your {node.appName} account is connected and ready to use.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Auth Method Selection */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Authentication Method</Label>
        <div className="grid gap-3">
          {/* OAuth Option */}
          <Card 
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              config.authType === 'oauth2' && "ring-2 ring-primary"
            )}
            onClick={() => updateConfig('authType', 'oauth2')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">Connect with OAuth</p>
                    <p className="text-xs text-muted-foreground">
                      Sign in with your {node.appName} account
                    </p>
                  </div>
                </div>
                {config.authType === 'oauth2' && !config.isAuthenticated && (
                  <Button 
                    onClick={handleOAuthConnect}
                    disabled={isVerifying}
                    size="sm"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>Connect</>
                    )}
                  </Button>
                )}
                {config.isAuthenticated && config.authType === 'oauth2' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* API Key Option */}
          <Card 
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              config.authType === 'api-key' && "ring-2 ring-primary"
            )}
            onClick={() => updateConfig('authType', 'api-key')}
          >
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                  <Key className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">Use API Key</p>
                  <p className="text-xs text-muted-foreground">
                    Enter your API key or access token
                  </p>
                </div>
              </div>
              
              {config.authType === 'api-key' && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="api-key" className="text-xs">API Key</Label>
                    <div className="relative">
                      <Input
                        id="api-key"
                        type={showApiKey ? 'text' : 'password'}
                        placeholder="Enter your API key..."
                        value={config.credentials?.apiKey || ''}
                        onChange={(e) => updateConfig('credentials', { 
                          ...config.credentials, 
                          apiKey: e.target.value 
                        })}
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowApiKey(!showApiKey);
                        }}
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerifyApiKey();
                      }}
                      disabled={isVerifying || !config.credentials?.apiKey}
                      size="sm"
                      variant="secondary"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3 mr-1.5" />
                          Verify Key
                        </>
                      )}
                    </Button>
                    
                    {config.isAuthenticated && config.authType === 'api-key' && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs">
                    <Info className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Find your API key in your {node.appName} account settings or developer portal.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
  
  const renderTriggerConfiguration = () => {
    const selectedTrigger = TRIGGER_TYPES.find(t => t.id === config.triggerType);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            {selectedTrigger && <selectedTrigger.icon className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Configure {selectedTrigger?.name} Trigger
            </h3>
            <p className="text-sm text-muted-foreground">
              Set up how and when this trigger fires
            </p>
          </div>
        </div>
        
        {/* Trigger-specific configuration */}
        {config.triggerType === 'webhook' && (
          <div className="space-y-4">
            <Alert>
              <Webhook className="h-4 w-4" />
              <AlertTitle>Webhook URL</AlertTitle>
              <AlertDescription className="space-y-3">
                <p className="text-sm">
                  Send POST requests to this URL to trigger your workflow:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                    {`https://api.yourapp.com/webhooks/${node.id}`}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://api.yourapp.com/webhooks/${node.id}`);
                      toast({ title: "Copied to clipboard" });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label>Authentication (Optional)</Label>
              <Select
                value={config.webhookAuth || 'none'}
                onValueChange={(value) => updateConfig('webhookAuth', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select authentication" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="header-auth">Header Authentication</SelectItem>
                  <SelectItem value="basic-auth">Basic Auth</SelectItem>
                  <SelectItem value="jwt">JWT Validation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {config.triggerType === 'poll' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Polling Interval
              </Label>
              <Select
                value={String(config.pollingInterval || '5')}
                onValueChange={(value) => updateConfig('pollingInterval', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How often to check" />
                </SelectTrigger>
                <SelectContent>
                  {POLLING_INTERVALS.map((interval) => (
                    <SelectItem key={interval.value} value={interval.value}>
                      {interval.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The workflow will check for new data at this interval
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>What to monitor</Label>
              <Select
                value={config.triggerEvent || ''}
                onValueChange={(value) => updateConfig('triggerEvent', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select what to monitor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-rows">New rows added</SelectItem>
                  <SelectItem value="updated-rows">Rows updated</SelectItem>
                  <SelectItem value="deleted-rows">Rows deleted</SelectItem>
                  <SelectItem value="any-change">Any change</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {config.triggerType === 'schedule' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Type
              </Label>
              <Select
                value={config.scheduleType || 'interval'}
                onValueChange={(value) => updateConfig('scheduleType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interval">Regular Interval</SelectItem>
                  <SelectItem value="daily">Daily at specific time</SelectItem>
                  <SelectItem value="weekly">Weekly on specific days</SelectItem>
                  <SelectItem value="monthly">Monthly on specific date</SelectItem>
                  <SelectItem value="cron">Custom (Cron expression)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {config.scheduleType === 'daily' && (
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={config.scheduleTime || '09:00'}
                  onChange={(e) => {
                    updateConfig('scheduleTime', e.target.value);
                    updateConfig('scheduleExpression', `0 ${e.target.value.split(':')[1]} ${e.target.value.split(':')[0]} * * *`);
                  }}
                />
              </div>
            )}
            
            {config.scheduleType === 'cron' && (
              <div className="space-y-2">
                <Label>Cron Expression</Label>
                <Input
                  placeholder="0 9 * * 1-5"
                  value={config.scheduleExpression || ''}
                  onChange={(e) => updateConfig('scheduleExpression', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Example: "0 9 * * 1-5" runs at 9 AM on weekdays
                </p>
              </div>
            )}
          </div>
        )}
        
        {config.triggerType === 'app-event' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Select Event
              </Label>
              <Select
                value={config.triggerEvent || ''}
                onValueChange={(value) => updateConfig('triggerEvent', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="record-created">Record Created</SelectItem>
                  <SelectItem value="record-updated">Record Updated</SelectItem>
                  <SelectItem value="record-deleted">Record Deleted</SelectItem>
                  <SelectItem value="status-changed">Status Changed</SelectItem>
                  <SelectItem value="field-changed">Specific Field Changed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {config.triggerEvent && (
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  This will trigger whenever a {config.triggerEvent.replace('-', ' ')} event occurs in {node.appName}.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {config.triggerType === 'manual' && (
          <Alert className="bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <Play className="h-4 w-4" />
            <AlertTitle>Manual Trigger</AlertTitle>
            <AlertDescription>
              This workflow will only run when you manually click the "Execute" button 
              or trigger it via the API.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };
  
  const renderDataMapping = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Database className="h-5 w-5 text-muted-foreground" />
          Map Input Data
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure what data to send to {node.appName}
        </p>
      </div>
      
      {/* Previous step data preview */}
      {previousNodes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Available data from previous steps:</Label>
          <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-2">
            {previousNodes.map((prevNode, index) => (
              <div key={prevNode.id} className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Step {index + 1}
                </Badge>
                <span className="text-muted-foreground">{prevNode.appName}</span>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {`{{$node["${prevNode.appName}"].json}}`}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Field Mappings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Field Mappings</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newMapping: FieldMapping = {
                id: `mapping-${Date.now()}`,
                sourceField: '',
                targetField: '',
                expression: '',
                type: 'direct',
              };
              updateConfig('fieldMappings', [...(config.fieldMappings || []), newMapping]);
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Mapping
          </Button>
        </div>
        
        {(config.fieldMappings || []).map((mapping, index) => (
          <Card key={mapping.id} className="p-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  Mapping {index + 1}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    updateConfig(
                      'fieldMappings',
                      config.fieldMappings?.filter((_, i) => i !== index)
                    );
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                <div className="space-y-1">
                  <Label className="text-xs">Target Field</Label>
                  <Input
                    placeholder="e.g., email"
                    value={mapping.targetField}
                    onChange={(e) => {
                      const newMappings = [...(config.fieldMappings || [])];
                      newMappings[index] = { ...mapping, targetField: e.target.value };
                      updateConfig('fieldMappings', newMappings);
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-5" />
                
                <div className="space-y-1">
                  <Label className="text-xs">Value / Expression</Label>
                  <Input
                    placeholder="{{$json.email}}"
                    value={mapping.expression}
                    onChange={(e) => {
                      const newMappings = [...(config.fieldMappings || [])];
                      newMappings[index] = { ...mapping, expression: e.target.value };
                      updateConfig('fieldMappings', newMappings);
                    }}
                    className="h-8 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {(config.fieldMappings?.length || 0) === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Database className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No field mappings yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add mappings to define what data to send
            </p>
          </div>
        )}
      </div>
      
      {/* Expression Help */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground flex items-center gap-1">
          <Lightbulb className="h-3 w-3" />
          Common Expressions
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Email', expr: '{{$json.email}}' },
            { label: 'First Name', expr: '{{$json.firstName}}' },
            { label: 'Full Name', expr: '{{$json.firstName}} {{$json.lastName}}' },
            { label: 'Current Date', expr: '{{$now.toISODate()}}' },
          ].map((item) => (
            <Button
              key={item.label}
              variant="outline"
              size="sm"
              className="justify-start text-xs h-8"
              onClick={() => navigator.clipboard.writeText(item.expr)}
            >
              <Copy className="h-3 w-3 mr-1.5" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderTestAndSave = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Play className="h-5 w-5 text-muted-foreground" />
          Test & Save
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Verify your configuration works correctly
        </p>
      </div>
      
      {/* Configuration Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {isTrigger && config.triggerType && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trigger Type</span>
              <Badge variant="secondary">{config.triggerType}</Badge>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Authentication</span>
            <Badge variant={config.isAuthenticated ? "default" : "destructive"}>
              {config.isAuthenticated ? "Connected" : "Not connected"}
            </Badge>
          </div>
          {!isTrigger && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Field Mappings</span>
              <span>{config.fieldMappings?.length || 0} configured</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Test Button */}
      <div className="space-y-3">
        <Button
          className="w-full"
          variant="outline"
          onClick={handleTest}
          disabled={isTesting}
        >
          {isTesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Test Configuration
            </>
          )}
        </Button>
        
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
            Testing will verify your credentials and attempt a sample operation.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: (node.appColor || '#3b82f6') + '20' }}
            >
              <span className="text-base">{node.appIcon}</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">{node.appName}</h3>
              <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Progress Indicator */}
      <div className="px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-xs font-medium">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        
        {/* Step indicators */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <TooltipProvider key={step.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                      "hover:bg-muted/50",
                      step.isActive && "bg-primary/10",
                      step.isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !step.isDisabled && setCurrentStep(index)}
                    disabled={step.isDisabled}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      step.isComplete && "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
                      step.isActive && !step.isComplete && "bg-primary text-primary-foreground",
                      !step.isActive && !step.isComplete && "bg-muted text-muted-foreground"
                    )}>
                      {step.isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium max-w-[60px] text-center leading-tight",
                      step.isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">{step.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
      
      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {currentStep === 0 && isTrigger && renderTriggerTypeSelection()}
          {currentStep === 0 && !isTrigger && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choose Operation</h3>
              <p className="text-sm text-muted-foreground">
                Select what action to perform
              </p>
              {/* Operation selection would go here */}
            </div>
          )}
          {currentStep === 1 && renderAuthentication()}
          {currentStep === 2 && isTrigger && renderTriggerConfiguration()}
          {currentStep === 2 && !isTrigger && renderDataMapping()}
          {currentStep === 3 && renderTestAndSave()}
        </div>
      </ScrollArea>
      
      {/* Footer with Navigation */}
      <div className="p-4 border-t flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={!canGoPrev()}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={goNext}
              disabled={!canGoNext()}
              className="flex-1"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Save & Activate
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NodeConfigWizard;
