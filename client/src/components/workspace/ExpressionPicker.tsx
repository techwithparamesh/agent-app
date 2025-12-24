/**
 * ExpressionPicker - Field Mapping System with Expression Builder
 * 
 * Like n8n/Zapier - allows users to map data between nodes using expressions:
 * - {{ trigger.body.email }}
 * - {{ nodes.agent.response }}
 * - {{ $json.items[0].name }}
 * - {{ $now }}
 * - {{ $env.API_KEY }}
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Braces,
  Zap,
  Search,
  Code,
  Clock,
  Hash,
  Type,
  ToggleLeft,
  List,
  FileJson,
  Copy,
  ChevronRight,
  Sparkles,
  Calendar,
  Key,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowNode } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface ExpressionVariable {
  path: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  description?: string;
  example?: any;
  children?: ExpressionVariable[];
}

export interface NodeOutput {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  icon: string;
  schema: ExpressionVariable[];
}

interface ExpressionPickerProps {
  /** Current value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Available nodes in the flow (before this node) */
  availableNodes: NodeOutput[];
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether to allow multiline */
  multiline?: boolean;
  /** Class name for styling */
  className?: string;
}

interface ExpressionTokenProps {
  path: string;
  onRemove: () => void;
}

// ============================================================================
// BUILT-IN VARIABLES
// ============================================================================

const BUILT_IN_VARIABLES: ExpressionVariable[] = [
  {
    path: '$now',
    name: 'Current Timestamp',
    type: 'string',
    description: 'ISO timestamp of execution',
    example: '2025-01-15T10:30:00Z',
  },
  {
    path: '$today',
    name: 'Today\'s Date',
    type: 'string',
    description: 'Current date in YYYY-MM-DD',
    example: '2025-01-15',
  },
  {
    path: '$executionId',
    name: 'Execution ID',
    type: 'string',
    description: 'Unique ID for this workflow run',
    example: 'exec_abc123',
  },
  {
    path: '$workflowId',
    name: 'Workflow ID',
    type: 'string',
    description: 'ID of the current workflow',
    example: 'wf_xyz789',
  },
  {
    path: '$env',
    name: 'Environment Variables',
    type: 'object',
    description: 'Access environment variables',
    children: [
      { path: '$env.NODE_ENV', name: 'NODE_ENV', type: 'string', example: 'production' },
    ],
  },
];

const BUILT_IN_FUNCTIONS: { name: string; signature: string; description: string }[] = [
  { name: '$if', signature: '$if(condition, trueValue, falseValue)', description: 'Conditional expression' },
  { name: '$lowercase', signature: '$lowercase(text)', description: 'Convert to lowercase' },
  { name: '$uppercase', signature: '$uppercase(text)', description: 'Convert to uppercase' },
  { name: '$trim', signature: '$trim(text)', description: 'Remove whitespace' },
  { name: '$split', signature: '$split(text, separator)', description: 'Split string to array' },
  { name: '$join', signature: '$join(array, separator)', description: 'Join array to string' },
  { name: '$length', signature: '$length(array_or_string)', description: 'Get length' },
  { name: '$first', signature: '$first(array)', description: 'Get first item' },
  { name: '$last', signature: '$last(array)', description: 'Get last item' },
  { name: '$sum', signature: '$sum(array)', description: 'Sum numeric array' },
  { name: '$avg', signature: '$avg(array)', description: 'Average of numeric array' },
  { name: '$round', signature: '$round(number, decimals)', description: 'Round number' },
  { name: '$parseJSON', signature: '$parseJSON(jsonString)', description: 'Parse JSON string' },
  { name: '$stringify', signature: '$stringify(object)', description: 'Convert to JSON string' },
  { name: '$formatDate', signature: '$formatDate(date, format)', description: 'Format date' },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const TypeIcon: React.FC<{ type: ExpressionVariable['type'] }> = ({ type }) => {
  switch (type) {
    case 'string':
      return <Type className="w-3 h-3 text-green-500" />;
    case 'number':
      return <Hash className="w-3 h-3 text-blue-500" />;
    case 'boolean':
      return <ToggleLeft className="w-3 h-3 text-purple-500" />;
    case 'array':
      return <List className="w-3 h-3 text-orange-500" />;
    case 'object':
      return <FileJson className="w-3 h-3 text-yellow-500" />;
    default:
      return <Code className="w-3 h-3 text-muted-foreground" />;
  }
};

const VariableItem: React.FC<{
  variable: ExpressionVariable;
  onInsert: (path: string) => void;
  level?: number;
}> = ({ variable, onInsert, level = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = variable.children && variable.children.length > 0;

  return (
    <div className={cn('text-sm', level > 0 && 'ml-4')}>
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-md cursor-pointer',
          'hover:bg-muted/50 transition-colors'
        )}
        onClick={() => (hasChildren ? setExpanded(!expanded) : onInsert(variable.path))}
      >
        {hasChildren && (
          <ChevronRight
            className={cn('w-3 h-3 transition-transform', expanded && 'rotate-90')}
          />
        )}
        <TypeIcon type={variable.type} />
        <span className="font-mono text-xs flex-1">{variable.name}</span>
        <Badge variant="outline" className="text-[10px]">
          {variable.type}
        </Badge>
        {!hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onInsert(variable.path);
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      {variable.description && (
        <p className="text-xs text-muted-foreground ml-7 mb-1">
          {variable.description}
        </p>
      )}
      
      {variable.example !== undefined && (
        <code className="text-xs text-muted-foreground ml-7 bg-muted/50 px-1 rounded">
          Example: {JSON.stringify(variable.example)}
        </code>
      )}
      
      {expanded && hasChildren && (
        <div className="mt-1">
          {variable.children!.map((child) => (
            <VariableItem
              key={child.path}
              variable={child}
              onInsert={onInsert}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ExpressionPicker: React.FC<ExpressionPickerProps> = ({
  value,
  onChange,
  availableNodes,
  placeholder = 'Enter value or {{ expression }}',
  disabled = false,
  multiline = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('nodes');

  // Check if current value contains expressions
  const hasExpression = useMemo(() => /\{\{.*?\}\}/.test(value), [value]);

  // Insert expression at cursor or append
  const insertExpression = useCallback(
    (path: string) => {
      const expression = `{{ ${path} }}`;
      onChange(value ? `${value} ${expression}` : expression);
    },
    [value, onChange]
  );

  // Filter nodes/variables based on search
  const filteredNodes = useMemo(() => {
    if (!search) return availableNodes;
    const lower = search.toLowerCase();
    return availableNodes.filter(
      (node) =>
        node.nodeName.toLowerCase().includes(lower) ||
        node.schema.some(
          (s) =>
            s.name.toLowerCase().includes(lower) ||
            s.path.toLowerCase().includes(lower)
        )
    );
  }, [availableNodes, search]);

  const filteredBuiltIns = useMemo(() => {
    if (!search) return BUILT_IN_VARIABLES;
    const lower = search.toLowerCase();
    return BUILT_IN_VARIABLES.filter(
      (v) =>
        v.name.toLowerCase().includes(lower) ||
        v.path.toLowerCase().includes(lower)
    );
  }, [search]);

  const filteredFunctions = useMemo(() => {
    if (!search) return BUILT_IN_FUNCTIONS;
    const lower = search.toLowerCase();
    return BUILT_IN_FUNCTIONS.filter(
      (f) =>
        f.name.toLowerCase().includes(lower) ||
        f.description.toLowerCase().includes(lower)
    );
  }, [search]);

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn('relative', className)}>
        <InputComponent
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-md border bg-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            hasExpression && 'font-mono bg-primary/5 border-primary/30',
            multiline && 'min-h-[80px] resize-y',
            className
          )}
        />
        
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn(
              'absolute right-1 h-7 w-7 p-0',
              multiline ? 'top-1' : 'top-1/2 -translate-y-1/2'
            )}
          >
            <Braces
              className={cn(
                'w-4 h-4',
                hasExpression ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </Button>
        </PopoverTrigger>
      </div>

      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="font-medium">Insert Expression</h4>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search variables & functions..."
              className="pl-8"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="nodes" className="flex-1">
              <Zap className="w-3 h-3 mr-1" />
              Nodes
            </TabsTrigger>
            <TabsTrigger value="builtins" className="flex-1">
              <Key className="w-3 h-3 mr-1" />
              Built-in
            </TabsTrigger>
            <TabsTrigger value="functions" className="flex-1">
              <Code className="w-3 h-3 mr-1" />
              Functions
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[300px]">
            <TabsContent value="nodes" className="m-0 p-2">
              {filteredNodes.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No upstream nodes with output data
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-1">
                  {filteredNodes.map((node) => (
                    <AccordionItem key={node.nodeId} value={node.nodeId} className="border rounded-lg">
                      <AccordionTrigger className="px-3 py-2 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span>{node.icon}</span>
                          <span className="font-medium">{node.nodeName}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {node.nodeType}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-2">
                        {node.schema.map((variable) => (
                          <VariableItem
                            key={variable.path}
                            variable={variable}
                            onInsert={(path) => {
                              insertExpression(`nodes.${node.nodeId}.${path}`);
                              setOpen(false);
                            }}
                          />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>

            <TabsContent value="builtins" className="m-0 p-2">
              <div className="space-y-1">
                {filteredBuiltIns.map((variable) => (
                  <VariableItem
                    key={variable.path}
                    variable={variable}
                    onInsert={(path) => {
                      insertExpression(path);
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="functions" className="m-0 p-2">
              <div className="space-y-2">
                {filteredFunctions.map((fn) => (
                  <div
                    key={fn.name}
                    className="p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      insertExpression(fn.signature);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Code className="w-3 h-3 text-primary" />
                      <span className="font-mono text-xs">{fn.signature}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fn.description}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-2 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Use <code className="bg-muted px-1 rounded">{'{{ }}'}</code> for dynamic values.
            Click any variable to insert.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ============================================================================
// EXPRESSION EVALUATOR (for preview/testing)
// ============================================================================

export function parseExpression(expression: string): string[] {
  const regex = /\{\{\s*([^}]+)\s*\}\}/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(expression)) !== null) {
    matches.push(match[1].trim());
  }
  return matches;
}

export function evaluateExpression(
  expression: string,
  context: Record<string, any>
): string {
  return expression.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, path) => {
    const trimmedPath = path.trim();
    
    // Handle built-ins
    if (trimmedPath === '$now') return new Date().toISOString();
    if (trimmedPath === '$today') return new Date().toISOString().split('T')[0];
    if (trimmedPath === '$executionId') return context.$executionId || 'exec_preview';
    if (trimmedPath === '$workflowId') return context.$workflowId || 'wf_preview';
    
    // Handle nested path like nodes.trigger.body.email
    const parts = trimmedPath.split('.');
    let value: any = context;
    
    for (const part of parts) {
      if (value === undefined || value === null) return '';
      
      // Handle array access like items[0]
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        value = value[arrayMatch[1]]?.[parseInt(arrayMatch[2])];
      } else {
        value = value[part];
      }
    }
    
    if (value === undefined || value === null) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  });
}

// ============================================================================
// HELPER: Build Node Output Schema from FlowNode
// ============================================================================

export function buildNodeOutputSchema(node: FlowNode): ExpressionVariable[] {
  // Default schemas based on node type
  const schemas: Record<string, ExpressionVariable[]> = {
    trigger: [
      { path: 'body', name: 'Request Body', type: 'object', description: 'Webhook payload' },
      { path: 'headers', name: 'Headers', type: 'object' },
      { path: 'query', name: 'Query Params', type: 'object' },
    ],
    'ai-agent': [
      { path: 'response', name: 'AI Response', type: 'string', description: 'Generated text' },
      { path: 'usage.totalTokens', name: 'Total Tokens', type: 'number' },
      { path: 'toolCalls', name: 'Tool Calls', type: 'array' },
    ],
    'ai-memory': [
      { path: 'messages', name: 'Messages', type: 'array' },
      { path: 'count', name: 'Count', type: 'number' },
    ],
    action: [
      { path: 'data', name: 'Response Data', type: 'object' },
      { path: 'success', name: 'Success', type: 'boolean' },
    ],
    condition: [
      { path: 'matched', name: 'Condition Matched', type: 'boolean' },
      { path: 'branch', name: 'Branch Taken', type: 'string' },
    ],
  };

  return schemas[node.type] || [
    { path: 'output', name: 'Output', type: 'any' },
  ];
}

export default ExpressionPicker;
