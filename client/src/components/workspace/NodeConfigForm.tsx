/**
 * Node Configuration Form
 * 
 * A simple, user-friendly form for configuring workflow nodes.
 * Inspired by n8n's clean node configuration panel.
 * 
 * Features:
 * - Auto-renders form fields based on NodeDefinition
 * - Expression support ({{ $json.field }})
 * - Conditional field display (displayOptions)
 * - Validation
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Zap,
  HelpCircle,
  Code,
  Play,
  ExternalLink,
  ChevronRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type NodeDefinition, type NodeProperty, getNodeDefinition } from './nodes/registry';

// =============================================================================
// TYPES
// =============================================================================

interface NodeConfigFormProps {
  nodeId: string;
  nodeDefinitionId: string;
  initialValues: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onTest?: () => void;
  onClose?: () => void;
  availableExpressions?: ExpressionVariable[];
  className?: string;
}

interface ExpressionVariable {
  label: string;
  value: string;
  type: string;
  source: string;  // e.g., "Trigger", "Node 1"
}

// =============================================================================
// FIELD RENDERER
// =============================================================================

interface FieldRendererProps {
  property: NodeProperty;
  value: any;
  onChange: (value: any) => void;
  allValues: Record<string, any>;
  expressions?: ExpressionVariable[];
}

function shouldShowField(property: NodeProperty, allValues: Record<string, any>): boolean {
  if (!property.displayOptions) return true;
  
  const { show, hide } = property.displayOptions;
  
  if (show) {
    for (const [key, allowedValues] of Object.entries(show)) {
      const currentValue = allValues[key];
      if (!allowedValues.includes(currentValue)) {
        return false;
      }
    }
  }
  
  if (hide) {
    for (const [key, hiddenValues] of Object.entries(hide)) {
      const currentValue = allValues[key];
      if (hiddenValues.includes(currentValue)) {
        return false;
      }
    }
  }
  
  return true;
}

function FieldRenderer({ property, value, onChange, allValues, expressions }: FieldRendererProps) {
  const [showExpressionPicker, setShowExpressionPicker] = useState(false);
  const isExpression = typeof value === 'string' && value.includes('{{');

  const handleExpressionInsert = (expr: string) => {
    const newValue = (value || '') + `{{ ${expr} }}`;
    onChange(newValue);
    setShowExpressionPicker(false);
  };

  // Don't render if displayOptions hide this field
  if (!shouldShowField(property, allValues)) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-sm font-medium">
          {property.displayName}
          {property.required && <span className="text-destructive">*</span>}
          {property.description && (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{property.description}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </Label>
        {property.supportsExpression && (
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-6 text-xs", isExpression && "text-purple-500")}
            onClick={() => setShowExpressionPicker(!showExpressionPicker)}
          >
            <Code className="h-3 w-3 mr-1" />
            Expression
          </Button>
        )}
      </div>

      {/* Expression picker dropdown */}
      {showExpressionPicker && expressions && expressions.length > 0 && (
        <div className="p-2 bg-muted rounded-md border space-y-1 animate-in slide-in-from-top-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Insert variable from:</p>
          {expressions.map((expr, idx) => (
            <button
              key={idx}
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-background flex items-center justify-between group"
              onClick={() => handleExpressionInsert(expr.value)}
            >
              <span>
                <Badge variant="outline" className="mr-2 text-[10px]">{expr.source}</Badge>
                {expr.label}
              </span>
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                {expr.value}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Render based on field type */}
      {property.type === 'string' && (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={property.placeholder}
          className={cn(isExpression && "font-mono text-purple-600 dark:text-purple-400")}
        />
      )}

      {property.type === 'number' && (
        <Input
          type="number"
          value={value ?? property.default ?? ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={property.placeholder}
        />
      )}

      {property.type === 'boolean' && (
        <div className="flex items-center gap-2">
          <Switch
            checked={value ?? property.default ?? false}
            onCheckedChange={onChange}
          />
          <span className="text-sm text-muted-foreground">
            {value ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      )}

      {property.type === 'options' && property.options && (
        <Select value={value ?? property.default} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {property.options.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                <div className="flex flex-col">
                  <span>{option.name}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {property.type === 'multiOptions' && property.options && (
        <div className="flex flex-wrap gap-2">
          {property.options.map((option) => {
            const selected = (value || []).includes(option.value);
            return (
              <Badge
                key={String(option.value)}
                variant={selected ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  if (selected) {
                    onChange((value || []).filter((v: string) => v !== option.value));
                  } else {
                    onChange([...(value || []), option.value]);
                  }
                }}
              >
                {selected && <Check className="h-3 w-3 mr-1" />}
                {option.name}
              </Badge>
            );
          })}
        </div>
      )}

      {property.type === 'json' && (
        <Textarea
          value={typeof value === 'object' ? JSON.stringify(value, null, 2) : (value || property.default || '')}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              onChange(e.target.value);
            }
          }}
          placeholder={property.placeholder || '{}'}
          className="font-mono text-sm min-h-[120px]"
        />
      )}

      {(property.type === 'collection' || property.type === 'fixedCollection') && (
        <div className="border rounded-md p-3 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Collection editor coming soon...
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function NodeConfigForm({
  nodeId,
  nodeDefinitionId,
  initialValues,
  onChange,
  onTest,
  onClose,
  availableExpressions = [],
  className,
}: NodeConfigFormProps) {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [activeTab, setActiveTab] = useState('settings');
  const [hasChanges, setHasChanges] = useState(false);

  const nodeDefinition = useMemo(() => getNodeDefinition(nodeDefinitionId), [nodeDefinitionId]);

  const handleFieldChange = useCallback((name: string, value: any) => {
    setValues((prev) => {
      const newValues = { ...prev, [name]: value };
      setHasChanges(true);
      return newValues;
    });
  }, []);

  const handleSave = () => {
    onChange(values);
    setHasChanges(false);
  };

  if (!nodeDefinition) {
    return (
      <div className={cn("p-4", className)}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>Unknown node type: {nodeDefinitionId}</span>
        </div>
      </div>
    );
  }

  // Check if node is configured (all required fields filled)
  const isConfigured = nodeDefinition.properties
    .filter(p => p.required)
    .every(p => {
      const value = values[p.name];
      return value !== undefined && value !== null && value !== '';
    });

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full", className)}>
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: `${nodeDefinition.color}20` }}
            >
              {nodeDefinition.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{nodeDefinition.displayName}</h3>
              <p className="text-sm text-muted-foreground">{nodeDefinition.description}</p>
            </div>
            <Badge variant={isConfigured ? 'default' : 'secondary'}>
              {isConfigured ? 'Configured' : 'Needs Setup'}
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 h-auto p-0">
            <TabsTrigger 
              value="settings" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            {nodeDefinition.category === 'trigger' && (
              <TabsTrigger 
                value="output" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Output
              </TabsTrigger>
            )}
            {nodeDefinition.documentationUrl && (
              <a
                href={nodeDefinition.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                Docs
              </a>
            )}
          </TabsList>

          <TabsContent value="settings" className="flex-1 m-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="p-4 space-y-4">
                {/* Credentials section if needed */}
                {nodeDefinition.credentialType !== 'none' && (
                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-sm">Credentials Required</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect your {nodeDefinition.credentialDisplayName || nodeDefinition.displayName} account
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Connect Account
                    </Button>
                  </div>
                )}

                {/* Node properties */}
                {nodeDefinition.properties.map((property) => (
                  <FieldRenderer
                    key={property.name}
                    property={property}
                    value={values[property.name]}
                    onChange={(value) => handleFieldChange(property.name, value)}
                    allValues={values}
                    expressions={availableExpressions}
                  />
                ))}

                {nodeDefinition.properties.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>This node requires no configuration.</p>
                    <p className="text-sm">It's ready to use!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="output" className="flex-1 m-0 p-4">
            <div className="text-sm">
              <h4 className="font-medium mb-2">Output Data</h4>
              <p className="text-muted-foreground mb-4">
                This node will output data that can be used by subsequent nodes.
              </p>
              <div className="bg-muted rounded-md p-3 font-mono text-xs">
                <pre>{JSON.stringify({ 
                  example: "Run the workflow to see actual output" 
                }, null, 2)}</pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t bg-background flex items-center justify-between">
          <div className="flex gap-2">
            {onTest && (
              <Button variant="outline" onClick={onTest}>
                <Play className="h-4 w-4 mr-2" />
                Test Step
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleSave}
              disabled={!hasChanges}
            >
              {hasChanges ? 'Save Changes' : 'Saved'}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default NodeConfigForm;
