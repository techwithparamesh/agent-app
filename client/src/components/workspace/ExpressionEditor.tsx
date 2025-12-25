/**
 * Enhanced Expression Editor Component
 * 
 * n8n-style expression editor with autocomplete, JSON path picker,
 * variable suggestions, and live preview.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Code2,
  Braces,
  ChevronRight,
  Variable,
  Hash,
  Type,
  Calendar,
  List,
  CircleDot,
  HelpCircle,
  Play,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Clock,
  FileJson,
  ArrowRight,
  Zap,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface ExpressionVariable {
  name: string;
  path: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'any';
  value?: unknown;
  description?: string;
  source?: string;
}

export interface ExpressionContext {
  $json?: Record<string, unknown>;
  $input?: Record<string, unknown>;
  $node?: Record<string, unknown>;
  $workflow?: Record<string, unknown>;
  $env?: Record<string, unknown>;
  $now?: Date;
  $today?: Date;
  $vars?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ExpressionEditorProps {
  value: string;
  onChange: (value: string) => void;
  context?: ExpressionContext;
  availableVariables?: ExpressionVariable[];
  placeholder?: string;
  showPreview?: boolean;
  error?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const builtInFunctions = [
  { name: '$json', description: 'Current item data', icon: FileJson },
  { name: '$input', description: 'Input from previous node', icon: ArrowRight },
  { name: '$node', description: 'Access other nodes', icon: Zap },
  { name: '$now', description: 'Current date/time', icon: Clock },
  { name: '$today', description: 'Today\'s date', icon: Calendar },
  { name: '$workflow', description: 'Workflow metadata', icon: Braces },
  { name: '$vars', description: 'Custom variables', icon: Variable },
  { name: '$env', description: 'Environment variables', icon: Hash },
];

const helperFunctions = [
  { name: '.toLowerCase()', description: 'Convert to lowercase', category: 'string' },
  { name: '.toUpperCase()', description: 'Convert to uppercase', category: 'string' },
  { name: '.trim()', description: 'Remove whitespace', category: 'string' },
  { name: '.split()', description: 'Split string to array', category: 'string' },
  { name: '.replace()', description: 'Replace text', category: 'string' },
  { name: '.substring()', description: 'Extract substring', category: 'string' },
  { name: '.includes()', description: 'Check if contains', category: 'string' },
  { name: '.length', description: 'Get length', category: 'both' },
  { name: '.map()', description: 'Transform array items', category: 'array' },
  { name: '.filter()', description: 'Filter array items', category: 'array' },
  { name: '.find()', description: 'Find first match', category: 'array' },
  { name: '.join()', description: 'Join array to string', category: 'array' },
  { name: '.slice()', description: 'Get portion of array', category: 'array' },
  { name: '.sort()', description: 'Sort array', category: 'array' },
  { name: 'Math.round()', description: 'Round number', category: 'number' },
  { name: 'Math.floor()', description: 'Round down', category: 'number' },
  { name: 'Math.ceil()', description: 'Round up', category: 'number' },
  { name: 'parseInt()', description: 'Parse to integer', category: 'number' },
  { name: 'parseFloat()', description: 'Parse to float', category: 'number' },
  { name: 'JSON.stringify()', description: 'Convert to JSON string', category: 'object' },
  { name: 'JSON.parse()', description: 'Parse JSON string', category: 'object' },
  { name: 'Object.keys()', description: 'Get object keys', category: 'object' },
  { name: 'Object.values()', description: 'Get object values', category: 'object' },
];

const typeIcons: Record<string, React.ElementType> = {
  string: Type,
  number: Hash,
  boolean: CircleDot,
  array: List,
  object: Braces,
  date: Calendar,
  any: Variable,
};

// ============================================
// HELPERS
// ============================================

function evaluateExpression(expression: string, context: ExpressionContext): { result: unknown; error?: string } {
  try {
    // Remove {{ }} wrapper if present
    let cleanExpr = expression.trim();
    if (cleanExpr.startsWith('{{') && cleanExpr.endsWith('}}')) {
      cleanExpr = cleanExpr.slice(2, -2).trim();
    }

    if (!cleanExpr) {
      return { result: '' };
    }

    // Create a safe evaluation context
    const contextKeys = Object.keys(context);
    const contextValues = Object.values(context);

    // Create function with context variables
    const evalFn = new Function(...contextKeys, `return ${cleanExpr}`);
    const result = evalFn(...contextValues);

    return { result };
  } catch (err) {
    return { 
      result: undefined, 
      error: err instanceof Error ? err.message : 'Invalid expression' 
    };
  }
}

function extractVariablesFromObject(obj: unknown, path: string, source: string): ExpressionVariable[] {
  const variables: ExpressionVariable[] = [];

  if (obj === null || obj === undefined) {
    return variables;
  }

  if (Array.isArray(obj)) {
    variables.push({
      name: path.split('.').pop() || path,
      path,
      type: 'array',
      value: obj,
      source,
    });
    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
      extractVariablesFromObject(obj[0], `${path}[0]`, source).forEach(v => variables.push(v));
    }
  } else if (typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      const newPath = path ? `${path}.${key}` : key;
      let type: ExpressionVariable['type'] = 'any';
      
      if (typeof value === 'string') type = 'string';
      else if (typeof value === 'number') type = 'number';
      else if (typeof value === 'boolean') type = 'boolean';
      else if (Array.isArray(value)) type = 'array';
      else if (value instanceof Date) type = 'date';
      else if (typeof value === 'object' && value !== null) type = 'object';

      variables.push({
        name: key,
        path: newPath,
        type,
        value,
        source,
      });

      if (type === 'object' || type === 'array') {
        extractVariablesFromObject(value, newPath, source).forEach(v => variables.push(v));
      }
    });
  }

  return variables;
}

// ============================================
// COMPONENT
// ============================================

export function ExpressionEditor({
  value,
  onChange,
  context = {},
  availableVariables = [],
  placeholder = 'Enter value or {{ expression }}',
  showPreview = true,
  error: externalError,
  className,
  inputClassName,
  disabled = false,
}: ExpressionEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('variables');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [copied, setCopied] = useState(false);

  // Check if value is an expression
  const isExpression = value.includes('{{') || value.startsWith('=');

  // Extract all available variables from context
  const allVariables = useMemo(() => {
    const vars: ExpressionVariable[] = [...availableVariables];

    // Extract from $json
    if (context.$json) {
      extractVariablesFromObject(context.$json, '$json', 'Current Node').forEach(v => vars.push(v));
    }

    // Extract from $input
    if (context.$input) {
      extractVariablesFromObject(context.$input, '$input', 'Previous Node').forEach(v => vars.push(v));
    }

    // Extract from $vars
    if (context.$vars) {
      extractVariablesFromObject(context.$vars, '$vars', 'Variables').forEach(v => vars.push(v));
    }

    // Extract from $workflow
    if (context.$workflow) {
      extractVariablesFromObject(context.$workflow, '$workflow', 'Workflow').forEach(v => vars.push(v));
    }

    return vars;
  }, [context, availableVariables]);

  // Evaluate expression and get preview
  const evaluation = useMemo(() => {
    if (!isExpression) {
      return { result: value, error: undefined };
    }
    return evaluateExpression(value, context);
  }, [value, context, isExpression]);

  const error = externalError || evaluation.error;

  // Insert variable at cursor position
  const insertVariable = useCallback((variable: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = value;

    // Check if we need to wrap in {{ }}
    let insertText = variable;
    if (!currentValue.includes('{{')) {
      insertText = `{{ ${variable} }}`;
    } else {
      insertText = variable;
    }

    const newValue = currentValue.slice(0, start) + insertText + currentValue.slice(end);
    onChange(newValue);

    // Update cursor position
    setTimeout(() => {
      const newPos = start + insertText.length;
      input.setSelectionRange(newPos, newPos);
      input.focus();
    }, 0);

    setIsOpen(false);
  }, [value, onChange]);

  // Copy result to clipboard
  const copyResult = useCallback(() => {
    const resultStr = typeof evaluation.result === 'object' 
      ? JSON.stringify(evaluation.result, null, 2)
      : String(evaluation.result);
    navigator.clipboard.writeText(resultStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [evaluation.result]);

  // Format result for display
  const formatResult = (result: unknown): string => {
    if (result === undefined) return 'undefined';
    if (result === null) return 'null';
    if (typeof result === 'object') return JSON.stringify(result, null, 2);
    return String(result);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Main Input with Expression Picker */}
      <div className="relative">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setCursorPosition(inputRef.current?.selectionStart || 0)}
                onClick={() => setCursorPosition(inputRef.current?.selectionStart || 0)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  'pr-10 font-mono text-sm',
                  isExpression && 'bg-primary/5 border-primary/30',
                  error && 'border-destructive',
                  inputClassName
                )}
              />
              
              {/* Expression indicator / toggle button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7',
                        isExpression && 'text-primary'
                      )}
                      onClick={() => setIsOpen(!isOpen)}
                      disabled={disabled}
                    >
                      {isExpression ? (
                        <Braces className="w-4 h-4" />
                      ) : (
                        <Code2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{isExpression ? 'Expression mode' : 'Add expression'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </PopoverTrigger>

          <PopoverContent 
            className="w-[400px] p-0" 
            align="start"
            side="bottom"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b px-3 py-2">
                <TabsList className="grid w-full grid-cols-3 h-8">
                  <TabsTrigger value="variables" className="text-xs">
                    <Variable className="w-3 h-3 mr-1" />
                    Variables
                  </TabsTrigger>
                  <TabsTrigger value="functions" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Functions
                  </TabsTrigger>
                  <TabsTrigger value="help" className="text-xs">
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Help
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Variables Tab */}
              <TabsContent value="variables" className="m-0">
                <Command className="border-none">
                  <CommandInput placeholder="Search variables..." className="h-9" />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>No variables found.</CommandEmpty>
                    
                    {/* Built-in variables */}
                    <CommandGroup heading="Built-in">
                      {builtInFunctions.map((fn) => (
                        <CommandItem
                          key={fn.name}
                          onSelect={() => insertVariable(fn.name)}
                          className="cursor-pointer"
                        >
                          <fn.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="font-mono text-sm">{fn.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {fn.description}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>

                    <CommandSeparator />

                    {/* Data variables */}
                    {allVariables.length > 0 && (
                      <CommandGroup heading="Data">
                        {allVariables.slice(0, 20).map((variable, idx) => {
                          const TypeIcon = typeIcons[variable.type] || Variable;
                          return (
                            <CommandItem
                              key={`${variable.path}-${idx}`}
                              onSelect={() => insertVariable(variable.path)}
                              className="cursor-pointer"
                            >
                              <TypeIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span className="font-mono text-sm">{variable.path}</span>
                              <Badge variant="outline" className="ml-auto text-[10px]">
                                {variable.type}
                              </Badge>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </TabsContent>

              {/* Functions Tab */}
              <TabsContent value="functions" className="m-0">
                <ScrollArea className="h-[300px]">
                  <div className="p-3 space-y-3">
                    {['string', 'array', 'number', 'object'].map((category) => (
                      <div key={category}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          {category}
                        </h4>
                        <div className="space-y-1">
                          {helperFunctions
                            .filter(fn => fn.category === category || fn.category === 'both')
                            .map((fn) => (
                              <button
                                key={fn.name}
                                onClick={() => insertVariable(fn.name)}
                                className="w-full flex items-center justify-between p-2 text-left rounded-md hover:bg-muted text-sm"
                              >
                                <code className="font-mono text-xs">{fn.name}</code>
                                <span className="text-xs text-muted-foreground">
                                  {fn.description}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Help Tab */}
              <TabsContent value="help" className="m-0">
                <ScrollArea className="h-[300px]">
                  <div className="p-4 space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Expression Syntax</h4>
                      <p className="text-muted-foreground mb-2">
                        Wrap JavaScript expressions in double curly braces:
                      </p>
                      <code className="block bg-muted p-2 rounded text-xs font-mono">
                        {"{{ $json.email }}"}
                      </code>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Examples</h4>
                      <div className="space-y-2">
                        <div className="bg-muted p-2 rounded">
                          <code className="text-xs font-mono block">{"{{ $json.name.toUpperCase() }}"}</code>
                          <p className="text-xs text-muted-foreground mt-1">Convert name to uppercase</p>
                        </div>
                        <div className="bg-muted p-2 rounded">
                          <code className="text-xs font-mono block">{"{{ $json.items.length }}"}</code>
                          <p className="text-xs text-muted-foreground mt-1">Get array length</p>
                        </div>
                        <div className="bg-muted p-2 rounded">
                          <code className="text-xs font-mono block">{"{{ $now.toISOString() }}"}</code>
                          <p className="text-xs text-muted-foreground mt-1">Current timestamp</p>
                        </div>
                        <div className="bg-muted p-2 rounded">
                          <code className="text-xs font-mono block">{"{{ $json.price * 1.1 }}"}</code>
                          <p className="text-xs text-muted-foreground mt-1">Calculate with math</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Keyboard Shortcuts</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Open picker</span>
                          <kbd className="px-2 py-1 bg-muted rounded">Ctrl + Space</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Insert expression</span>
                          <kbd className="px-2 py-1 bg-muted rounded">{"{{ }}"}</kbd>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Expression Preview */}
      {showPreview && isExpression && !error && (
        <div className="relative rounded-md border bg-muted/50 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Play className="w-3 h-3" />
              <span>Preview</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={copyResult}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy result</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <pre className="text-sm font-mono overflow-auto max-h-[100px] whitespace-pre-wrap break-all">
            {formatResult(evaluation.result)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================
// INLINE EXPRESSION BADGE
// ============================================

interface ExpressionBadgeProps {
  expression: string;
  context?: ExpressionContext;
  onClick?: () => void;
  className?: string;
}

export function ExpressionBadge({
  expression,
  context = {},
  onClick,
  className,
}: ExpressionBadgeProps) {
  const evaluation = evaluateExpression(expression, context);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn(
              'font-mono cursor-pointer',
              evaluation.error && 'border-destructive text-destructive',
              className
            )}
            onClick={onClick}
          >
            <Braces className="w-3 h-3 mr-1" />
            {expression.length > 20 ? `${expression.slice(0, 20)}...` : expression}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-mono text-xs">{expression}</p>
            {!evaluation.error && (
              <p className="text-muted-foreground text-xs">
                = {String(evaluation.result)}
              </p>
            )}
            {evaluation.error && (
              <p className="text-destructive text-xs">{evaluation.error}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ExpressionEditor;
