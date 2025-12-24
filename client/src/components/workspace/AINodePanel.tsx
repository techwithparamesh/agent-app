/**
 * AINodePanel - Configuration panel for AI nodes (Agent, Memory, Tool)
 * 
 * First-class AI citizen support with:
 * - Model selection across providers (OpenAI, Anthropic, Google, etc.)
 * - System prompt configuration
 * - Tool calling setup
 * - Memory/context management
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bot,
  Brain,
  Wrench,
  Sparkles,
  Settings,
  Zap,
  MessageSquare,
  Code,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Play,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  agentNodeSchema,
  memoryNodeSchema,
  toolNodeSchema,
  validateNodeConfig,
  getDefaultConfig,
} from './NodeSchemas';
import { SchemaFormRenderer } from './SchemaFormRenderer';
import { ExpressionPicker, type NodeOutput } from './ExpressionPicker';

// ============================================================================
// TYPES
// ============================================================================

interface AINodeConfig {
  // Agent config
  name?: string;
  systemPrompt?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseStyle?: string;
  outputFormat?: string;
  jsonSchema?: string;
  enableTools?: boolean;
  tools?: string[];
  enableMemory?: boolean;
  memoryType?: string;
  memorySize?: number;
  sessionKey?: string;
  
  // Memory config
  operation?: string;
  content?: string;
  role?: string;
  metadata?: string;
  limit?: number;
  query?: string;
  topK?: number;
  ttl?: number;
  
  // Tool config
  toolType?: string;
  description?: string;
  httpMethod?: string;
  httpUrl?: string;
  httpHeaders?: string;
  dbQuery?: string;
  parametersSchema?: string;
  
  // Common
  isAuthenticated?: boolean;
  credentials?: Record<string, string>;
}

interface AINodePanelProps {
  nodeType: 'ai-agent' | 'ai-memory' | 'ai-tool';
  config: AINodeConfig;
  onChange: (config: AINodeConfig) => void;
  onTest?: () => Promise<{ success: boolean; output?: any; error?: string }>;
  availableNodes?: NodeOutput[];
  credentials?: {
    openai?: boolean;
    anthropic?: boolean;
    google?: boolean;
    mistral?: boolean;
  };
  disabled?: boolean;
}

// ============================================================================
// MODEL DATA
// ============================================================================

const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    icon: '🤖',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable, multimodal', contextWindow: '128K' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable', contextWindow: '128K' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High performance', contextWindow: '128K' },
      { id: 'gpt-4', name: 'GPT-4', description: 'Original GPT-4', contextWindow: '8K' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast, legacy', contextWindow: '16K' },
    ],
  },
  anthropic: {
    name: 'Anthropic',
    icon: '🧠',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Best balance', contextWindow: '200K' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most capable', contextWindow: '200K' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast', contextWindow: '200K' },
    ],
  },
  google: {
    name: 'Google',
    icon: '✨',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Advanced', contextWindow: '1M' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast', contextWindow: '1M' },
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Balanced', contextWindow: '32K' },
    ],
  },
  mistral: {
    name: 'Mistral',
    icon: '🌊',
    models: [
      { id: 'mistral-large', name: 'Mistral Large', description: 'Most capable', contextWindow: '128K' },
      { id: 'mistral-medium', name: 'Mistral Medium', description: 'Balanced', contextWindow: '32K' },
      { id: 'mistral-small', name: 'Mistral Small', description: 'Fast', contextWindow: '32K' },
    ],
  },
  groq: {
    name: 'Groq',
    icon: '⚡',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Fast inference', contextWindow: '128K' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'MoE model', contextWindow: '32K' },
    ],
  },
};

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

const PROMPT_TEMPLATES = [
  {
    name: 'Customer Support',
    prompt: `You are a helpful customer support assistant for [Company Name].

Your role is to:
- Answer customer questions accurately and professionally
- Help resolve issues and provide solutions
- Escalate complex issues when needed
- Always maintain a friendly, empathetic tone

When you don't know something, say so honestly and offer to connect with a human agent.`,
  },
  {
    name: 'Data Extractor',
    prompt: `You are a data extraction specialist. Your job is to analyze text and extract structured information.

Instructions:
- Extract all relevant entities (names, dates, numbers, etc.)
- Format output as clean JSON
- Handle missing or ambiguous data gracefully
- Be precise and avoid hallucinating data

Always return valid JSON matching the specified schema.`,
  },
  {
    name: 'Content Writer',
    prompt: `You are a professional content writer. Create engaging, well-structured content based on the given topic and requirements.

Guidelines:
- Match the requested tone and style
- Use clear, concise language
- Include relevant examples when helpful
- Structure content with headers and sections
- Optimize for readability`,
  },
  {
    name: 'Code Assistant',
    prompt: `You are an expert programming assistant. Help users with code-related questions and tasks.

Capabilities:
- Write clean, efficient code
- Debug and fix issues
- Explain code and concepts
- Suggest best practices
- Review and improve existing code

Always include comments and explanations for complex logic.`,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AINodePanel: React.FC<AINodePanelProps> = ({
  nodeType,
  config,
  onChange,
  onTest,
  availableNodes = [],
  credentials = {},
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState('config');
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    output?: any;
    error?: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Get schema based on node type
  const schema = useMemo(() => {
    switch (nodeType) {
      case 'ai-agent':
        return agentNodeSchema;
      case 'ai-memory':
        return memoryNodeSchema;
      case 'ai-tool':
        return toolNodeSchema;
      default:
        return agentNodeSchema;
    }
  }, [nodeType]);

  // Validate current config
  const validation = useMemo(() => {
    return validateNodeConfig(schema, config);
  }, [schema, config]);

  // Check if provider has credentials
  const hasCredentials = useMemo(() => {
    const provider = config.provider || 'openai';
    return credentials[provider as keyof typeof credentials] === true;
  }, [config.provider, credentials]);

  // Handle config updates
  const updateConfig = useCallback(
    (updates: Partial<AINodeConfig>) => {
      onChange({ ...config, ...updates });
    },
    [config, onChange]
  );

  // Handle test execution
  const handleTest = useCallback(async () => {
    if (!onTest) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await onTest();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
      });
    } finally {
      setTesting(false);
    }
  }, [onTest]);

  // Apply prompt template
  const applyTemplate = useCallback(
    (template: typeof PROMPT_TEMPLATES[0]) => {
      updateConfig({ systemPrompt: template.prompt });
    },
    [updateConfig]
  );

  // Render node type icon
  const NodeIcon = useMemo(() => {
    switch (nodeType) {
      case 'ai-agent':
        return Bot;
      case 'ai-memory':
        return Brain;
      case 'ai-tool':
        return Wrench;
      default:
        return Bot;
    }
  }, [nodeType]);

  const nodeTitle = useMemo(() => {
    switch (nodeType) {
      case 'ai-agent':
        return 'AI Agent';
      case 'ai-memory':
        return 'Memory Node';
      case 'ai-tool':
        return 'Tool Node';
      default:
        return 'AI Node';
    }
  }, [nodeType]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <NodeIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{nodeTitle}</h3>
            <p className="text-xs text-muted-foreground">
              {schema.description}
            </p>
          </div>
        </div>
        <Badge
          variant={validation.valid ? 'default' : 'destructive'}
          className="text-xs"
        >
          {validation.valid ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Configured
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 mr-1" />
              {validation.errors.length} issue{validation.errors.length > 1 ? 's' : ''}
            </>
          )}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">
            <Settings className="w-3 h-3 mr-1" />
            Configure
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Sparkles className="w-3 h-3 mr-1" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="test">
            <Play className="w-3 h-3 mr-1" />
            Test
          </TabsTrigger>
        </TabsList>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-4 mt-4">
          {nodeType === 'ai-agent' && (
            <>
              {/* Name */}
              <div className="space-y-2">
                <Label>Agent Name</Label>
                <Input
                  value={config.name || ''}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  placeholder="My AI Agent"
                  disabled={disabled}
                />
              </div>

              {/* Provider & Model Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <Select
                    value={config.provider || 'openai'}
                    onValueChange={(value) => updateConfig({ provider: value, model: undefined })}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{provider.icon}</span>
                            <span>{provider.name}</span>
                            {credentials[key as keyof typeof credentials] && (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select
                    value={config.model || ''}
                    onValueChange={(value) => updateConfig({ model: value })}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS[config.provider as keyof typeof AI_PROVIDERS]?.models.map(
                        (model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{model.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {model.contextWindow}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Credentials Warning */}
              {!hasCredentials && (
                <Card className="border-yellow-500/50 bg-yellow-500/10">
                  <CardContent className="p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">
                      {AI_PROVIDERS[config.provider as keyof typeof AI_PROVIDERS]?.name || 'Provider'}{' '}
                      credentials required.
                    </span>
                    <Button variant="ghost" size="sm" className="ml-auto text-primary underline hover:no-underline">
                      Connect Account
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* System Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>System Prompt</Label>
                  <Select
                    onValueChange={(name) => {
                      const template = PROMPT_TEMPLATES.find((t) => t.name === name);
                      if (template) applyTemplate(template);
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="Use template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_TEMPLATES.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={config.systemPrompt || ''}
                  onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                  placeholder="You are a helpful assistant..."
                  rows={6}
                  disabled={disabled}
                  className="font-mono text-sm"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Temperature</Label>
                  <span className="text-sm text-muted-foreground">
                    {config.temperature ?? 0.7}
                  </span>
                </div>
                <Slider
                  value={[config.temperature ?? 0.7]}
                  onValueChange={([value]) => updateConfig({ temperature: value })}
                  min={0}
                  max={2}
                  step={0.1}
                  disabled={disabled}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Focused</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
            </>
          )}

          {nodeType === 'ai-memory' && (
            <SchemaFormRenderer
              schema={memoryNodeSchema}
              config={config}
              onChange={onChange}
              errors={validation.errors}
              disabled={disabled}
              expressionContext={{
                variables: availableNodes.flatMap((n) =>
                  n.schema.map((s) => ({
                    path: `nodes.${n.nodeId}.${s.path}`,
                    label: `${n.nodeName} → ${s.name}`,
                    type: s.type,
                  }))
                ),
              }}
            />
          )}

          {nodeType === 'ai-tool' && (
            <SchemaFormRenderer
              schema={toolNodeSchema}
              config={config}
              onChange={onChange}
              errors={validation.errors}
              disabled={disabled}
            />
          )}
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4 mt-4">
          {nodeType === 'ai-agent' && (
            <Accordion type="multiple" className="space-y-2">
              {/* Output Format */}
              <AccordionItem value="output" className="border rounded-lg px-3">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    <span>Output Format</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Response Style</Label>
                    <Select
                      value={config.responseStyle || 'conversational'}
                      onValueChange={(value) => updateConfig({ responseStyle: value })}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="concise">Concise</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="structured">Structured JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select
                      value={config.outputFormat || 'text'}
                      onValueChange={(value) => updateConfig({ outputFormat: value })}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Plain Text</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="markdown">Markdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {config.outputFormat === 'json' && (
                    <div className="space-y-2">
                      <Label>JSON Schema</Label>
                      <Textarea
                        value={config.jsonSchema || ''}
                        onChange={(e) => updateConfig({ jsonSchema: e.target.value })}
                        placeholder='{ "type": "object", "properties": { ... } }'
                        rows={4}
                        disabled={disabled}
                        className="font-mono text-sm"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Tool Calling */}
              <AccordionItem value="tools" className="border rounded-lg px-3">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    <span>Tool Calling</span>
                    {config.enableTools && (
                      <Badge variant="secondary" className="text-xs">
                        Enabled
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Tool Calling</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow the agent to call external tools
                      </p>
                    </div>
                    <Switch
                      checked={config.enableTools || false}
                      onCheckedChange={(checked) => updateConfig({ enableTools: checked })}
                      disabled={disabled}
                    />
                  </div>

                  {config.enableTools && (
                    <div className="space-y-2">
                      <Label>Available Tools</Label>
                      <p className="text-xs text-muted-foreground">
                        Connect Tool nodes to this agent in the workflow to make them available.
                      </p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Memory */}
              <AccordionItem value="memory" className="border rounded-lg px-3">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    <span>Memory & Context</span>
                    {config.enableMemory && (
                      <Badge variant="secondary" className="text-xs">
                        Enabled
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Memory</Label>
                      <p className="text-xs text-muted-foreground">
                        Remember previous conversations
                      </p>
                    </div>
                    <Switch
                      checked={config.enableMemory || false}
                      onCheckedChange={(checked) => updateConfig({ enableMemory: checked })}
                      disabled={disabled}
                    />
                  </div>

                  {config.enableMemory && (
                    <>
                      <div className="space-y-2">
                        <Label>Memory Type</Label>
                        <Select
                          value={config.memoryType || 'buffer'}
                          onValueChange={(value) => updateConfig({ memoryType: value })}
                          disabled={disabled}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buffer">Buffer (Last N messages)</SelectItem>
                            <SelectItem value="summary">Summary</SelectItem>
                            <SelectItem value="vector">Vector Store</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Messages to Remember</Label>
                        <Input
                          type="number"
                          value={config.memorySize || 10}
                          onChange={(e) =>
                            updateConfig({ memorySize: parseInt(e.target.value) || 10 })
                          }
                          min={1}
                          max={100}
                          disabled={disabled}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Session Key</Label>
                        <ExpressionPicker
                          value={config.sessionKey || ''}
                          onChange={(value) => updateConfig({ sessionKey: value })}
                          availableNodes={availableNodes}
                          placeholder="{{ trigger.body.userId }}"
                          disabled={disabled}
                        />
                        <p className="text-xs text-muted-foreground">
                          Unique identifier to separate conversation sessions
                        </p>
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Token Limits */}
              <AccordionItem value="limits" className="border rounded-lg px-3">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Token Limits</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Max Output Tokens</Label>
                    <Input
                      type="number"
                      value={config.maxTokens || 2048}
                      onChange={(e) =>
                        updateConfig({ maxTokens: parseInt(e.target.value) || 2048 })
                      }
                      min={1}
                      max={128000}
                      disabled={disabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum tokens in the response
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </TabsContent>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Test Agent</CardTitle>
              <CardDescription>
                Send a test message to verify the configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter a test message..."
                rows={3}
                disabled={disabled || testing}
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleTest}
                  disabled={!validation.valid || !hasCredentials || disabled || testing}
                  className="flex-1"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Test
                    </>
                  )}
                </Button>
              </div>

              {testResult && (
                <Card
                  className={cn(
                    'mt-4',
                    testResult.success
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-red-500/50 bg-red-500/10'
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {testResult.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium text-sm">
                        {testResult.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    {testResult.output && (
                      <pre className="text-xs bg-background/50 p-2 rounded overflow-auto max-h-40">
                        {typeof testResult.output === 'string'
                          ? testResult.output
                          : JSON.stringify(testResult.output, null, 2)}
                      </pre>
                    )}
                    {testResult.error && (
                      <p className="text-xs text-red-500">{testResult.error}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Errors */}
      {validation.errors.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-3 space-y-1">
            {validation.errors.map((error, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-3 h-3 text-destructive" />
                <span>{error}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AINodePanel;
