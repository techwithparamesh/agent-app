/**
 * Dynamic Config Panel
 * 
 * An enhanced configuration panel that uses the dynamic field system
 * to render schema-driven forms for any app action.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  X,
  Settings,
  Zap,
  Play,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Trash2,
  Copy,
  Info,
  Sparkles,
  HelpCircle,
  FileJson,
  Variable,
  ExternalLink,
  Loader2,
  ChevronDown,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FlowNode } from "./types";

// Import dynamic field system
import { DynamicFieldRenderer } from "./dynamic-fields/DynamicFieldRenderer";
import { 
  schemaRegistry, 
  getAppById, 
  getAppAction, 
  getAppActions,
  getAppActionsGrouped,
} from "./dynamic-fields";
import type { ActionSchema, AppSchema } from "./dynamic-fields/types";
import { useFieldValidation, validateAction, preExecutionValidation } from "./dynamic-fields/ValidationSystem";
import { useAIFields } from "./dynamic-fields/AIFieldService";

// ============================================
// TYPES
// ============================================

interface DynamicConfigPanelProps {
  node: FlowNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, config: Record<string, any>) => void;
  onDelete: (nodeId: string) => void;
  onTest: (nodeId: string) => void;
  previousNodeOutputs?: Record<string, any>;
}

// ============================================
// COMPONENT
// ============================================

export function DynamicConfigPanel({
  node,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onTest,
  previousNodeOutputs,
}: DynamicConfigPanelProps) {
  const [activeTab, setActiveTab] = useState("setup");
  const [config, setConfig] = useState<Record<string, any>>({});
  const [selectedActionId, setSelectedActionId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [testOutput, setTestOutput] = useState<any>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  
  // Get app and action schemas
  const appSchema = useMemo(() => {
    if (!node?.appId) return null;
    return getAppById(node.appId);
  }, [node?.appId]);
  
  const actionSchema = useMemo(() => {
    if (!node?.appId || !selectedActionId) return null;
    return getAppAction(node.appId, selectedActionId);
  }, [node?.appId, selectedActionId]);
  
  const availableActions = useMemo(() => {
    if (!node?.appId) return [];
    return getAppActions(node.appId);
  }, [node?.appId]);
  
  const groupedActions = useMemo(() => {
    if (!node?.appId) return {};
    return getAppActionsGrouped(node.appId);
  }, [node?.appId]);
  
  // Field validation hook
  const { errors, validateField, validateAll, clearErrors } = useFieldValidation(
    actionSchema || { id: '', appId: '', name: '', description: '', category: '', fields: [] },
    config,
    { validateOnChange: true }
  );
  
  // AI field features hook
  const { fillField, getSuggestions, isLoading: isAILoading } = useAIFields();
  
  // Reset state when node changes
  useEffect(() => {
    if (node) {
      setConfig(node.config || {});
      setSelectedActionId(node.actionId || node.triggerId || "");
      setActiveTab("setup");
      setTestOutput(null);
      setTestStatus('idle');
      clearErrors();
    }
  }, [node?.id, clearErrors]);
  
  if (!isOpen || !node) {
    return null;
  }
  
  // Handle config changes
  const updateConfig = useCallback((key: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };
      return newConfig;
    });
    // Trigger field validation
    validateField(key, value);
  }, [validateField]);
  
  // Handle save
  const handleSave = useCallback(async () => {
    // Validate before saving
    const validationResult = validateAll();
    if (!validationResult.isValid) {
      // Validation errors will be shown by the form
      return;
    }
    
    setIsSaving(true);
    try {
      onSave(node.id, {
        ...config,
        actionId: selectedActionId,
        triggerId: node.type === 'trigger' ? selectedActionId : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }, [node.id, config, selectedActionId, node.type, onSave, validateAll]);
  
  // Handle AI fill for a field
  const handleAIFill = useCallback(async (fieldId: string) => {
    if (!actionSchema) return;
    
    const field = actionSchema.fields?.find(f => f.id === fieldId);
    if (!field) return;
    
    try {
      const result = await fillField({
        appId: node.appId,
        actionId: selectedActionId,
        fieldId,
        currentValues: config,
        fieldSchema: field,
        actionSchema,
        previousNodes: previousNodeOutputs ? Object.entries(previousNodeOutputs).map(([id, output]) => ({
          id,
          appId: 'unknown',
          actionId: 'unknown',
          output,
        })) : undefined,
      });
      
      if (result.confidence > 0.3) {
        updateConfig(fieldId, result.value);
      }
    } catch (error) {
      console.error('AI fill failed:', error);
    }
  }, [node.appId, selectedActionId, config, actionSchema, fillField, updateConfig, previousNodeOutputs]);
  
  // Handle AI suggestions for a field
  const handleAISuggest = useCallback(async (fieldId: string) => {
    if (!actionSchema) return;
    
    const field = actionSchema.fields?.find(f => f.id === fieldId);
    if (!field) return;
    
    try {
      const result = await getSuggestions({
        appId: node.appId,
        actionId: selectedActionId,
        fieldId,
        currentValues: config,
        fieldSchema: field,
        actionSchema,
      });
      
      // TODO: Show suggestions in a dropdown/popover
      console.log('Suggestions:', result);
    } catch (error) {
      console.error('AI suggestions failed:', error);
    }
  }, [node.appId, selectedActionId, config, actionSchema, getSuggestions]);
  
  // Handle test
  const handleTest = useCallback(async () => {
    setTestStatus('running');
    setTestOutput(null);
    
    // Pre-execution validation
    if (actionSchema) {
      const preValidation = preExecutionValidation(actionSchema, config, previousNodeOutputs);
      if (!preValidation.canExecute) {
        setTestStatus('error');
        setTestOutput({
          error: 'Validation failed',
          blockers: preValidation.blockers,
        });
        return;
      }
    }
    
    try {
      onTest(node.id);
      // Simulate test result for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTestStatus('success');
      setTestOutput({
        success: true,
        message: 'Test completed successfully',
        data: { sample: 'output' },
      });
    } catch (error) {
      setTestStatus('error');
      setTestOutput({
        error: (error as Error).message,
      });
    }
  }, [node.id, actionSchema, config, previousNodeOutputs, onTest]);
  
  // Check if configuration is complete
  const isConfigComplete = useMemo(() => {
    if (!actionSchema) return false;
    const validation = validateAction(actionSchema, config);
    return validation.isValid;
  }, [actionSchema, config]);
  
  return (
    <div className={cn(
      "w-[420px] h-full bg-background border-l flex flex-col",
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
            style={{ backgroundColor: (node.appColor || appSchema?.color || '#6366f1') + '20' }}
          >
            {node.appIcon || appSchema?.icon || '⚡'}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{node.appName || appSchema?.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {appSchema?.apiDocsUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => window.open(appSchema.apiDocsUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View API Docs</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-3">
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

        <ScrollArea className="flex-1">
          {/* Setup Tab */}
          <TabsContent value="setup" className="m-0 p-4 space-y-6">
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
                    value={config.name || node.name || ''}
                    onChange={(e) => updateConfig('name', e.target.value)}
                    placeholder="e.g., Send welcome email"
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

            {/* Action Selection */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                {node.type === 'trigger' ? (
                  <Zap className="h-4 w-4 text-amber-500" />
                ) : (
                  <Play className="h-4 w-4 text-blue-500" />
                )}
                {node.type === 'trigger' ? 'Select Trigger' : 'Select Action'}
              </h4>

              <Select value={selectedActionId} onValueChange={setSelectedActionId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={`Choose ${node.type}...`} />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {Object.entries(groupedActions).map(([category, actions]) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground">
                        {category}
                      </SelectLabel>
                      {actions.map((action) => (
                        <SelectItem key={action.id} value={action.id} className="py-2">
                          <div className="flex flex-col">
                            <span>{action.name}</span>
                            {action.description && (
                              <span className="text-xs text-muted-foreground">
                                {action.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>

              {actionSchema && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{actionSchema.name}</span>
                  </div>
                  {actionSchema.description && (
                    <p className="text-xs text-muted-foreground">{actionSchema.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Fields */}
            {actionSchema && (
              <>
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4 text-violet-500" />
                    Configuration
                    {isAILoading && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    )}
                  </h4>

                  <DynamicFieldRenderer
                    schema={actionSchema}
                    values={config}
                    onChange={updateConfig}
                    onAIFill={handleAIFill}
                    onAISuggest={handleAISuggest}
                    errors={errors}
                    disabled={false}
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Connect Tab */}
          <TabsContent value="connect" className="m-0 p-4 space-y-6">
            {/* Credentials Section */}
            {appSchema?.credentials && appSchema.credentials.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  API Credentials
                </h4>

                <Accordion type="single" collapsible className="w-full" defaultValue="credentials">
                  {appSchema.credentials.map((cred) => (
                    <AccordionItem key={cred.id} value={cred.id}>
                      <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                          {cred.name}
                          {config._credential === cred.id && (
                            <Badge variant="secondary" className="text-xs">Connected</Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        {cred.fields?.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label className="text-xs">{field.name}</Label>
                            <Input
                              type={field.type === 'secret' ? 'password' : 'text'}
                              value={config[`_cred_${cred.id}_${field.id}`] || ''}
                              onChange={(e) => updateConfig(`_cred_${cred.id}_${field.id}`, e.target.value)}
                              placeholder={field.placeholder || `Enter ${field.name.toLowerCase()}`}
                              className="h-9 font-mono text-sm"
                            />
                          </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => updateConfig('_credential', cred.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify & Save
                          </Button>
                          {cred.helpUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(cred.helpUrl, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500/50" />
                <p className="text-sm font-medium">No credentials required</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This {node.type} doesn't need authentication
                </p>
              </div>
            )}

            <Separator />

            {/* Data Mapping */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Variable className="h-4 w-4 text-blue-500" />
                Data Mapping
              </h4>

              {previousNodeOutputs && Object.keys(previousNodeOutputs).length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Available data from previous steps:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(previousNodeOutputs).map(([nodeId, output]) => (
                      <div 
                        key={nodeId}
                        className="p-2 bg-muted/50 rounded text-xs font-mono"
                      >
                        <span className="text-muted-foreground">{'{{ $node.'}</span>
                        <span className="text-blue-500">{nodeId}</span>
                        <span className="text-muted-foreground">{'.output }}'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <FileJson className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm">Map input data from previous steps</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use expressions like {`{{ $node.step1.output.data }}`}
                  </p>
                </div>
              )}
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
                  onClick={handleTest}
                  disabled={!isConfigComplete || testStatus === 'running'}
                >
                  {testStatus === 'running' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running Test...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Test
                    </>
                  )}
                </Button>

                {!isConfigComplete && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Required</AlertTitle>
                    <AlertDescription className="text-xs">
                      Complete all required fields before testing
                    </AlertDescription>
                  </Alert>
                )}
                
                {testStatus === 'success' && testOutput && (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>Test Successful</AlertTitle>
                    <AlertDescription className="text-xs">
                      {testOutput.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                {testStatus === 'error' && testOutput && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Test Failed</AlertTitle>
                    <AlertDescription className="text-xs">
                      {testOutput.error}
                    </AlertDescription>
                  </Alert>
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
              {testOutput?.data && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Output</h4>
                  <pre className="p-3 bg-muted/50 rounded-lg min-h-[100px] overflow-auto text-xs font-mono">
                    {JSON.stringify(testOutput.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            size="sm" 
            className="flex-1" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-muted-foreground"
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
    </div>
  );
}

export default DynamicConfigPanel;
