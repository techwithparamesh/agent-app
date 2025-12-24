import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  X,
  Settings,
  Zap,
  Play,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Trash2,
  Copy,
  Info,
  Sparkles,
  HelpCircle,
  FileJson,
  Variable,
  Loader2,
  Plus,
  ExternalLink,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FlowNode } from "./types";
import { AI_MODELS, AI_MODELS_BY_PROVIDER } from "./types";
import { NodeConfigFields } from "./NodeConfigFields";
import { TriggerSetupWizard, type TriggerType } from "./TriggerSetupWizard";

interface ConfigPanelProps {
  node: FlowNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, config: Record<string, any>) => void;
  onDelete: (nodeId: string) => void;
  onTest: (nodeId: string) => void;
  availableTriggers?: { id: string; name: string; description: string }[];
  availableActions?: { id: string; name: string; description: string }[];
}

export function ConfigPanel({
  node,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onTest,
  availableTriggers = [],
  availableActions = [],
}: ConfigPanelProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("setup");
  const [config, setConfig] = useState<Record<string, any>>({});
  const [selectedTrigger, setSelectedTrigger] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedAIModel, setSelectedAIModel] = useState("openai-gpt-4o");
  
  // Trigger setup wizard state (n8n-style flow)
  const [triggerType, setTriggerType] = useState<TriggerType | null>(null);
  const [showTriggerWizard, setShowTriggerWizard] = useState(false);
  
  // Collapsible sections state
  const [authSectionOpen, setAuthSectionOpen] = useState(true);
  const [oauthSectionOpen, setOauthSectionOpen] = useState(true);
  
  // Connection states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  
  // Field mappings state
  const [fieldMappings, setFieldMappings] = useState<Array<{ fieldName: string; expression: string }>>([
    { fieldName: 'email', expression: '{{$json.email}}' },
    { fieldName: 'name', expression: '{{$json.firstName}} {{$json.lastName}}' },
  ]);  
  // JSON validation state
  const [jsonError, setJsonError] = useState("");
  const [showVariablePicker, setShowVariablePicker] = useState(false);
  // Reset state when node changes
  useEffect(() => {
    if (node) {
      setConfig(node.config || {});
      setSelectedTrigger(node.triggerId || "");
      setSelectedAction(node.actionId || "");
      setSelectedAIModel(node.config?.aiModel || "openai-gpt-4o");
      
      // Load trigger type if exists
      setTriggerType(node.config?.triggerType || null);
      
      // Show trigger wizard for trigger nodes without trigger type configured
      if (node.type === 'trigger' && !node.config?.triggerType) {
        setShowTriggerWizard(true);
        setActiveTab("setup");
      } else {
        setShowTriggerWizard(false);
        setActiveTab("setup");
      }
      
      // Reset connection state when node changes
      setIsConnected(false);
      setConnectionError("");
      // Load saved field mappings if any
      if (node.config?.fieldMappings) {
        setFieldMappings(node.config.fieldMappings);
      }
    }
  }, [node?.id]);

  if (!isOpen || !node) {
    return null;
  }

  // Handle trigger wizard completion
  const handleTriggerTypeSelected = (type: TriggerType) => {
    setTriggerType(type);
    setShowTriggerWizard(false);
    updateConfig('triggerType', type);
    toast({
      title: "Trigger Type Selected",
      description: `Trigger type set to: ${type}`,
    });
  };

  // Handle API key verification
  const handleVerifyConnection = async () => {
    setIsVerifying(true);
    setConnectionError("");
    
    try {
      // Check if API key is provided
      if (!config.apiKey || config.apiKey.trim() === '') {
        throw new Error('Please enter an API key');
      }
      
      // Simulate API verification (in production, call actual verification endpoint)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success (in production, check actual response)
      setIsConnected(true);
      toast({
        title: "Connection Verified",
        description: `Successfully connected to ${node.appName}`,
      });
    } catch (error: any) {
      setConnectionError(error.message || 'Failed to verify connection');
      toast({
        title: "Verification Failed",
        description: error.message || 'Failed to verify connection',
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle OAuth connection
  const handleOAuthConnect = async () => {
    setIsConnecting(true);
    setConnectionError("");
    
    try {
      // Build OAuth URL based on app type
      const appId = node.appId;
      const redirectUri = `${window.location.origin}/api/integrations/oauth/callback`;
      
      // In production, this would call the backend to get the OAuth URL
      // For now, show a toast explaining the process
      toast({
        title: "OAuth Connection",
        description: `Redirecting to ${node.appName} for authorization...`,
      });
      
      // Simulate OAuth flow (in production, actually redirect to OAuth URL)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful OAuth (in production, handle callback)
      setIsConnected(true);
      toast({
        title: "Connected Successfully",
        description: `Your ${node.appName} account has been connected`,
      });
    } catch (error: any) {
      setConnectionError(error.message || 'OAuth connection failed');
      toast({
        title: "Connection Failed",
        description: error.message || 'OAuth connection failed',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Add a new field mapping
  const addFieldMapping = () => {
    setFieldMappings(prev => [...prev, { fieldName: '', expression: '' }]);
  };

  // Update a field mapping
  const updateFieldMapping = (index: number, field: 'fieldName' | 'expression', value: string) => {
    setFieldMappings(prev => prev.map((mapping, i) => 
      i === index ? { ...mapping, [field]: value } : mapping
    ));
  };

  // Remove a field mapping
  const removeFieldMapping = (index: number) => {
    setFieldMappings(prev => prev.filter((_, i) => i !== index));
  };

  // Validate JSON input
  const validateJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setJsonError("");
      return true;
    }
    
    try {
      // Allow expressions in JSON by temporarily replacing them
      const tempJson = jsonString
        .replace(/{{.*?}}/g, '"__EXPRESSION__"')
        .replace(/{{.*?}}/g, '"__EXPRESSION__"');
      JSON.parse(tempJson);
      setJsonError("");
      return true;
    } catch (error) {
      setJsonError("Invalid JSON format");
      return false;
    }
  };

  // Insert a variable expression at cursor
  const insertExpression = (expression: string) => {
    const customInput = config.customInput || "";
    updateConfig('customInput', customInput + expression);
  };

  // Common expressions for quick access
  const commonExpressions = [
    { label: 'Email field', value: '{{$json.email}}' },
    { label: 'First name', value: '{{$json.firstName}}' },
    { label: 'Last name', value: '{{$json.lastName}}' },
    { label: 'Full name', value: '{{$json.firstName}} {{$json.lastName}}' },
    { label: 'Phone number', value: '{{$json.phone}}' },
    { label: 'Previous step data', value: '{{$node["Step 1"].json}}' },
    { label: 'Current timestamp', value: '{{$now}}' },
    { label: 'Random ID', value: '{{$randomId}}' },
  ];

  const handleSave = () => {
    onSave(node.id, {
      ...config,
      triggerId: selectedTrigger,
      actionId: selectedAction,
      aiModel: selectedAIModel,
      fieldMappings,
    });
  };

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={cn(
      "w-96 h-full bg-background border-l flex flex-col",
      "animate-in slide-in-from-right duration-300"
    )}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: node.appColor + '20' }}
          >
            {node.appIcon}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{node.appName}</h3>
            <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
            {triggerType && (
              <Badge variant="secondary" className="text-xs mt-0.5">
                {triggerType}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Show Trigger Setup Wizard for unconfigured trigger nodes */}
      {showTriggerWizard && node.type === 'trigger' ? (
        <TriggerSetupWizard
          appName={node.appName}
          appIcon={node.appIcon}
          onComplete={handleTriggerTypeSelected}
          onSkip={() => setShowTriggerWizard(false)}
        />
      ) : (
        <>
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-3 flex-shrink-0">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="setup" className="text-xs">
                  <Settings className="h-3.5 w-3.5 mr-1.5" />
                  Setup
                </TabsTrigger>
                <TabsTrigger value="connect" className="text-xs">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Connect
                </TabsTrigger>
                <TabsTrigger value="test" className="text-xs">
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  Test
                </TabsTrigger>
              </TabsList>
            </div>

        <div className="flex-1 overflow-y-auto">
          {/* Setup Tab */}
          <TabsContent value="setup" className="m-0 p-4 space-y-6 h-full">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                Basic Information
              </h4>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Step Name</Label>
                  <Input
                    value={config.name ?? ''}
                    onChange={(e) => updateConfig('name', e.target.value)}
                    placeholder={node.name || "e.g., Send welcome email"}
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Description (optional)</Label>
                  <Textarea
                    value={config.description || ''}
                    onChange={(e) => updateConfig('description', e.target.value)}
                    placeholder="What does this step do?"
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Node-specific Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                {node.type === 'trigger' ? (
                  <Zap className="h-4 w-4 text-amber-500" />
                ) : node.type === 'action' ? (
                  <Play className="h-4 w-4 text-blue-500" />
                ) : (
                  <Settings className="h-4 w-4 text-violet-500" />
                )}
                {node.type === 'trigger' ? 'Trigger Settings' : 
                 node.type === 'action' ? 'Action Settings' : 
                 'Configuration'}
              </h4>

              <NodeConfigFields
                triggerId={node.triggerId}
                actionId={node.actionId}
                nodeType={node.type}
                appId={node.appId}
                config={config}
                updateConfig={updateConfig}
              />
            </div>

            {/* Only show AI Model for action nodes that might use AI */}
            {(node.type === 'action' && ['openai', 'anthropic', 'google_ai', 'ai'].includes(node.appId)) && (
              <>
                <Separator />

                {/* AI Model Selection */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    AI Model
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          Select the AI model to power intelligent responses and decision making in this step.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h4>

                  <Select value={selectedAIModel} onValueChange={setSelectedAIModel}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select AI Model" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {Object.entries(AI_MODELS_BY_PROVIDER).map(([provider, models]) => (
                        <SelectGroup key={provider}>
                          <SelectLabel className="text-xs font-semibold text-muted-foreground">
                            {provider}
                          </SelectLabel>
                          {models.map((model) => (
                            <SelectItem key={model.id} value={model.id} className="py-2">
                              <div className="flex items-center justify-between gap-3">
                                <span>{model.name}</span>
                                {model.capabilities && model.capabilities.length > 0 && (
                                  <div className="flex gap-1">
                                    {model.capabilities.slice(0, 2).map((cap) => (
                                      <Badge key={cap} variant="outline" className="text-[10px] px-1.5 py-0">
                                        {cap}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedAIModel && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">
                          {AI_MODELS.find(m => m.id === selectedAIModel)?.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {AI_MODELS.find(m => m.id === selectedAIModel)?.description}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Connect Tab */}
          <TabsContent value="connect" className="m-0 p-4 space-y-6">
            {/* Connection Status Banner */}
            {isConnected && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Connected to {node.appName}</span>
                </div>
              </div>
            )}
            
            {connectionError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">{connectionError}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                API Credentials
              </h4>

              {/* Authentication Section - Collapsible */}
              <Collapsible open={authSectionOpen} onOpenChange={setAuthSectionOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium border-b hover:bg-muted/50 px-2 rounded-t-lg transition-colors">
                  <span>Authentication</span>
                  {authSectionOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3 pb-4 px-2 border-x border-b rounded-b-lg bg-muted/20">
                  <div className="space-y-2">
                    <Label className="text-xs">API Key</Label>
                    <Input
                      type="password"
                      value={config.apiKey || ''}
                      onChange={(e) => updateConfig('apiKey', e.target.value)}
                      placeholder="Enter your API key"
                      className="h-9 font-mono text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Find your API key in your {node.appName} account settings
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">API Secret (if required)</Label>
                    <Input
                      type="password"
                      value={config.apiSecret || ''}
                      onChange={(e) => updateConfig('apiSecret', e.target.value)}
                      placeholder="Enter API secret"
                      className="h-9 font-mono text-sm"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleVerifyConnection}
                    disabled={isVerifying || !config.apiKey}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : isConnected ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Connected
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Connection
                      </>
                    )}
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              {/* OAuth Connection Section - Collapsible */}
              <Collapsible open={oauthSectionOpen} onOpenChange={setOauthSectionOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium border-b hover:bg-muted/50 px-2 rounded-t-lg transition-colors">
                  <span>OAuth Connection</span>
                  {oauthSectionOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3 pb-4 px-2 border-x border-b rounded-b-lg bg-muted/20">
                  <Button 
                    className="w-full"
                    onClick={handleOAuthConnect}
                    disabled={isConnecting || isConnected}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : isConnected ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Connected to {node.appName}
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect with {node.appName}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    You'll be redirected to authorize access
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <Separator />

            {/* Data Mapping - Improved with explanation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Variable className="h-4 w-4 text-blue-500" />
                  Data Mapping
                </h4>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="font-medium mb-1">How Data Mapping Works</p>
                      <p className="text-xs">Map data from previous workflow steps to fields in this action. Use expressions like <code className="bg-muted px-1 rounded">{`{{$json.fieldName}}`}</code> to reference incoming data.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Explanation Card */}
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <FileJson className="h-6 w-6 mb-2 text-blue-500" />
                <p className="text-sm font-medium">Map input data from previous steps</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use expressions to pull data dynamically:
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• <code className="bg-background px-1 rounded">{`{{$json.email}}`}</code> - Get the "email" field from incoming data</li>
                  <li>• <code className="bg-background px-1 rounded">{`{{$json.user.name}}`}</code> - Access nested fields</li>
                  <li>• <code className="bg-background px-1 rounded">{`{{$node["Step 1"].json}}`}</code> - Reference a specific step</li>
                </ul>
              </div>

              {/* Field Mappings */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Field Mappings</Label>
                
                <div className="space-y-2">
                  {fieldMappings.map((mapping, index) => (
                    <div key={index} className="flex gap-2 items-center group">
                      <Input
                        placeholder="Field name (e.g., email)"
                        className="h-8 text-xs flex-1"
                        value={mapping.fieldName}
                        onChange={(e) => updateFieldMapping(index, 'fieldName', e.target.value)}
                      />
                      <span className="text-xs text-muted-foreground">→</span>
                      <Input
                        placeholder="{{$json.fieldName}}"
                        className="h-8 text-xs flex-1 font-mono bg-muted/50"
                        value={mapping.expression}
                        onChange={(e) => updateFieldMapping(index, 'expression', e.target.value)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFieldMapping(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={addFieldMapping}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  <span className="text-xs">Add Field Mapping</span>
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Custom Input (JSON)</Label>
                <p className="text-xs text-muted-foreground">
                  Or provide custom JSON with expressions for complex data structures
                </p>
                <div className="relative">
                  <Textarea
                    value={config.customInput || ''}
                    onChange={(e) => {
                      updateConfig('customInput', e.target.value);
                      validateJson(e.target.value);
                    }}
                    placeholder={`{\n  "recipient": "{{$json.email}}",\n  "fullName": "{{$json.firstName}} {{$json.lastName}}",\n  "data": {{$node["Step 1"].json}}\n}`}
                    rows={6}
                    className={`font-mono text-xs resize-none ${jsonError ? 'border-red-500' : ''}`}
                  />
                  {jsonError && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {jsonError}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setShowVariablePicker(!showVariablePicker)}
                        >
                          <Variable className="h-3 w-3 mr-1" />
                          <span className="text-xs">Insert Expression</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Click to see available variable expressions
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      try {
                        const formatted = JSON.stringify(
                          JSON.parse((config.customInput || '').replace(/{{.*?}}/g, '"__EXPRESSION__"')), 
                          null, 
                          2
                        ).replace(/"__EXPRESSION__"/g, '{{$json.field}}');
                        updateConfig('customInput', formatted);
                        toast({
                          title: "JSON Formatted",
                          description: "Your JSON has been formatted",
                        });
                      } catch (error) {
                        toast({
                          title: "Format Error",
                          description: "Please fix JSON syntax before formatting",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <FileJson className="h-3 w-3 mr-1" />
                    <span className="text-xs">Format JSON</span>
                  </Button>
                </div>
                
                {/* Variable Picker Dropdown */}
                {showVariablePicker && (
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg border">
                    <Label className="text-xs font-semibold">Quick Insert Variables</Label>
                    <div className="grid grid-cols-1 gap-1 mt-2">
                      {commonExpressions.map((expr, index) => (
                        <button
                          key={index}
                          className="text-left p-2 text-xs hover:bg-background rounded border-0 bg-transparent transition-colors"
                          onClick={() => {
                            insertExpression(expr.value);
                            setShowVariablePicker(false);
                          }}
                        >
                          <code className="font-mono text-blue-600">{expr.value}</code>
                          <span className="text-muted-foreground ml-2">- {expr.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => setShowVariablePicker(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}

                {/* Live Data Preview */}
                {fieldMappings.some(mapping => mapping.fieldName && mapping.expression) && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-2">
                      <Eye className="h-3 w-3" />
                      Preview Mapped Data
                    </Label>
                    <div className="p-3 bg-muted/30 rounded-lg border-2 border-dashed">
                      <p className="text-xs text-muted-foreground mb-2">Sample output based on your mappings:</p>
                      <pre className="text-xs font-mono bg-background p-2 rounded border overflow-x-auto">
                        {JSON.stringify(
                          fieldMappings.reduce((acc, mapping) => {
                            if (mapping.fieldName && mapping.expression) {
                              // Simulate resolved expressions for preview
                              let previewValue = mapping.expression
                                .replace(/\{\{\$json\.email\}\}/g, '"user@example.com"')
                                .replace(/\{\{\$json\.firstName\}\}/g, '"John"')
                                .replace(/\{\{\$json\.lastName\}\}/g, '"Doe"')
                                .replace(/\{\{\$json\.phone\}\}/g, '"+1234567890"')
                                .replace(/\{\{.*?\}\}/g, '"[dynamic_value]"');
                              
                              // Handle concatenated values
                              if (previewValue.includes('"John" "Doe"')) {
                                previewValue = '"John Doe"';
                              }
                              
                              try {
                                acc[mapping.fieldName] = JSON.parse(previewValue);
                              } catch {
                                acc[mapping.fieldName] = previewValue.replace(/"/g, '');
                              }
                            }
                            return acc;
                          }, {} as Record<string, any>),
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test" className="m-0 p-4 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Play className="h-4 w-4 text-green-500" />
                Test This Step
              </h4>

              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => onTest(node.id)}
                  disabled={node.status === 'incomplete'}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </Button>

                {node.status === 'incomplete' && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-500">Configuration Required</p>
                        <p className="text-xs text-muted-foreground">
                          Complete the setup before testing
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Sample Data */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Sample Input Data</h4>
                <Textarea
                  value={config.sampleData || '{\n  "test": "data"\n}'}
                  onChange={(e) => updateConfig('sampleData', e.target.value)}
                  placeholder="Enter sample JSON data"
                  rows={6}
                  className="font-mono text-xs resize-none"
                />
              </div>

              {/* Output preview */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Output Preview</h4>
                <div className="p-3 bg-muted/50 rounded-lg min-h-[100px]">
                  <p className="text-xs text-muted-foreground text-center">
                    Run a test to see output here
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2 flex-shrink-0">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" className="flex-1" onClick={handleSave}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-muted-foreground"
            onClick={() => {/* Duplicate logic */}}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-destructive"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

export default ConfigPanel;
