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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FlowNode } from "./types";
import { AI_MODELS, AI_MODELS_BY_PROVIDER } from "./types";
import { NodeConfigFields } from "./NodeConfigFields";

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
  const [activeTab, setActiveTab] = useState("setup");
  const [config, setConfig] = useState<Record<string, any>>({});
  const [selectedTrigger, setSelectedTrigger] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedAIModel, setSelectedAIModel] = useState("openai-gpt-4o");

  // Reset state when node changes
  useEffect(() => {
    if (node) {
      setConfig(node.config || {});
      setSelectedTrigger(node.triggerId || "");
      setSelectedAction(node.actionId || "");
      setSelectedAIModel(node.config?.aiModel || "openai-gpt-4o");
      setActiveTab("setup");
    }
  }, [node?.id]);

  if (!isOpen || !node) {
    return null;
  }

  const handleSave = () => {
    onSave(node.id, {
      ...config,
      triggerId: selectedTrigger,
      actionId: selectedAction,
      aiModel: selectedAIModel,
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
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
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
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                API Credentials
              </h4>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="api-keys">
                  <AccordionTrigger className="text-sm">
                    Authentication
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label className="text-xs">API Key</Label>
                      <Input
                        type="password"
                        value={config.apiKey || ''}
                        onChange={(e) => updateConfig('apiKey', e.target.value)}
                        placeholder="Enter your API key"
                        className="h-9 font-mono text-sm"
                      />
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
                    <Button variant="outline" size="sm" className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Connection
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="oauth">
                  <AccordionTrigger className="text-sm">
                    OAuth Connection
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <Button className="w-full">
                      Connect with {node.appName}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      You'll be redirected to authorize access
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <Separator />

            {/* Data Mapping */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Variable className="h-4 w-4 text-blue-500" />
                Data Mapping
              </h4>

              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <FileJson className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm">Map input data from previous steps</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use variables like {`{{step1.data.email}}`}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Custom Input (JSON)</Label>
                <Textarea
                  value={config.customInput || ''}
                  onChange={(e) => updateConfig('customInput', e.target.value)}
                  placeholder='{"key": "{{previous.value}}"}'
                  rows={4}
                  className="font-mono text-xs resize-none"
                />
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
        </ScrollArea>
      </Tabs>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
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
    </div>
  );
}

export default ConfigPanel;
