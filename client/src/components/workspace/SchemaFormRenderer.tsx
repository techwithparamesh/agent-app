/**
 * SchemaFormRenderer - Dynamic Form Generation from JSON Schema
 * 
 * Renders UI forms dynamically based on NodeSchema definitions.
 * No hardcoded forms - everything is schema-driven.
 */

import React, { useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, AlertCircle, Sparkles, Code, Braces } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NodeSchema,
  JSONSchemaProperty,
  getVisibleFields,
} from './NodeSchemas';

// ============================================================================
// TYPES
// ============================================================================

interface SchemaFormRendererProps {
  schema: NodeSchema;
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
  errors?: string[];
  disabled?: boolean;
  expressionContext?: ExpressionContext;
}

interface ExpressionContext {
  variables: ExpressionVariable[];
  onInsert?: (expression: string) => void;
}

interface ExpressionVariable {
  path: string;
  label: string;
  type: string;
  description?: string;
  example?: any;
}

interface FieldRendererProps {
  fieldKey: string;
  property: JSONSchemaProperty;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  expressionContext?: ExpressionContext;
}

// ============================================================================
// FIELD RENDERERS
// ============================================================================

const TextFieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  property,
  value,
  onChange,
  error,
  disabled,
}) => (
  <Input
    id={fieldKey}
    type={property.format === 'password' ? 'password' : 'text'}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={property['x-ui-placeholder']}
    disabled={disabled}
    className={cn(error && 'border-destructive')}
  />
);

const TextareaFieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  property,
  value,
  onChange,
  error,
  disabled,
}) => (
  <Textarea
    id={fieldKey}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={property['x-ui-placeholder']}
    disabled={disabled}
    rows={4}
    className={cn('font-mono text-sm', error && 'border-destructive')}
  />
);

const NumberFieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  property,
  value,
  onChange,
  error,
  disabled,
}) => (
  <Input
    id={fieldKey}
    type="number"
    value={value ?? property.default ?? ''}
    onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
    min={property.minimum}
    max={property.maximum}
    disabled={disabled}
    className={cn(error && 'border-destructive')}
  />
);

const SliderFieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  property,
  value,
  onChange,
  disabled,
}) => {
  const val = value ?? property.default ?? property.minimum ?? 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {property.minimum ?? 0}
        </span>
        <span className="text-sm font-medium">{val}</span>
        <span className="text-sm text-muted-foreground">
          {property.maximum ?? 100}
        </span>
      </div>
      <Slider
        id={fieldKey}
        value={[val]}
        onValueChange={([v]) => onChange(v)}
        min={property.minimum ?? 0}
        max={property.maximum ?? 100}
        step={property.type === 'integer' ? 1 : 0.1}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
};

const SelectFieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  property,
  value,
  onChange,
  error,
  disabled,
}) => {
  const options = property.enum || [];
  const labels = property.enumLabels || options;

  return (
    <Select
      value={value ?? property.default ?? ''}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn(error && 'border-destructive')}>
        <SelectValue placeholder="Select an option..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt, idx) => (
          <SelectItem key={opt} value={opt}>
            {labels[idx] || opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const ToggleFieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  property,
  value,
  onChange,
  disabled,
}) => (
  <div className="flex items-center space-x-2">
    <Switch
      id={fieldKey}
      checked={value ?? property.default ?? false}
      onCheckedChange={onChange}
      disabled={disabled}
    />
    <span className="text-sm text-muted-foreground">
      {value ? 'Enabled' : 'Disabled'}
    </span>
  </div>
);

const CodeFieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  property,
  value,
  onChange,
  error,
  disabled,
}) => (
  <div className="relative">
    <Textarea
      id={fieldKey}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={property['x-ui-placeholder']}
      disabled={disabled}
      rows={6}
      className={cn(
        'font-mono text-sm bg-muted/50',
        error && 'border-destructive'
      )}
    />
    <div className="absolute top-2 right-2">
      <Badge variant="secondary" className="text-xs">
        <Code className="w-3 h-3 mr-1" />
        {property.format?.toUpperCase() || 'CODE'}
      </Badge>
    </div>
  </div>
);

// Expression field with variable picker
const ExpressionFieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  property,
  value,
  onChange,
  error,
  disabled,
  expressionContext,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const insertExpression = useCallback((expr: string) => {
    const currentValue = value || '';
    onChange(currentValue + expr);
    setShowPicker(false);
  }, [value, onChange]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={fieldKey}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={property['x-ui-placeholder'] || '{{ trigger.body.field }}'}
          disabled={disabled}
          className={cn(
            'font-mono pr-10',
            error && 'border-destructive'
          )}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-7 w-7 p-0"
          onClick={() => setShowPicker(!showPicker)}
        >
          <Braces className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
      
      {showPicker && expressionContext && (
        <div className="border rounded-lg p-3 bg-muted/30 space-y-2 max-h-48 overflow-auto">
          <div className="text-xs font-medium text-muted-foreground">
            Insert Expression
          </div>
          {expressionContext.variables.map((variable) => (
            <button
              key={variable.path}
              className="w-full text-left p-2 rounded hover:bg-muted/50 text-sm"
              onClick={() => insertExpression(`{{ ${variable.path} }}`)}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">
                  {'{{ '}
                  {variable.path}
                  {' }}'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {variable.type}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {variable.label}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ModelSelectorFieldRenderer: React.FC<FieldRendererProps> = ({
  fieldKey,
  value,
  onChange,
  error,
  disabled,
}) => {
  // Grouped models by provider
  const modelGroups = {
    openai: [
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast & affordable' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High performance' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Legacy' },
    ],
    anthropic: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Best balance' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most capable' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast' },
    ],
    google: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Advanced' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast' },
    ],
    mistral: [
      { id: 'mistral-large', name: 'Mistral Large', description: 'Most capable' },
      { id: 'mistral-medium', name: 'Mistral Medium', description: 'Balanced' },
    ],
  };

  return (
    <Select value={value || ''} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn(error && 'border-destructive')}>
        <SelectValue placeholder="Select a model..." />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(modelGroups).map(([provider, models]) => (
          <React.Fragment key={provider}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
              {provider}
            </div>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center gap-2">
                  <span>{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({model.description})
                  </span>
                </div>
              </SelectItem>
            ))}
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SchemaFormRenderer: React.FC<SchemaFormRendererProps> = ({
  schema,
  config,
  onChange,
  errors = [],
  disabled = false,
  expressionContext,
}) => {
  // Get visible fields based on current config
  const visibleFields = useMemo(
    () => getVisibleFields(schema, config),
    [schema, config]
  );

  // Group fields
  const groupedFields = useMemo(() => {
    const groups: Record<string, string[]> = { default: [] };
    
    for (const fieldKey of visibleFields) {
      const prop = schema.properties[fieldKey];
      const group = prop['x-ui-group'] || 'default';
      
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(fieldKey);
    }
    
    return groups;
  }, [schema, visibleFields]);

  // Handle field change
  const handleFieldChange = useCallback(
    (fieldKey: string, value: any) => {
      onChange({
        ...config,
        [fieldKey]: value,
      });
    },
    [config, onChange]
  );

  // Render a single field
  const renderField = useCallback(
    (fieldKey: string) => {
      const property = schema.properties[fieldKey];
      if (!property) return null;

      const fieldError = errors.find((e) =>
        e.toLowerCase().includes(property.title?.toLowerCase() || fieldKey)
      );

      const commonProps: FieldRendererProps = {
        fieldKey,
        property,
        value: config[fieldKey],
        onChange: (value) => handleFieldChange(fieldKey, value),
        error: fieldError,
        disabled,
        expressionContext,
      };

      // Determine which renderer to use
      const widget = property['x-ui-widget'];
      let FieldComponent: React.FC<FieldRendererProps>;

      switch (widget) {
        case 'textarea':
          FieldComponent = TextareaFieldRenderer;
          break;
        case 'select':
          FieldComponent = SelectFieldRenderer;
          break;
        case 'toggle':
          FieldComponent = ToggleFieldRenderer;
          break;
        case 'slider':
          FieldComponent = SliderFieldRenderer;
          break;
        case 'number':
          FieldComponent = NumberFieldRenderer;
          break;
        case 'code':
          FieldComponent = CodeFieldRenderer;
          break;
        case 'expression':
          FieldComponent = ExpressionFieldRenderer;
          break;
        case 'model-selector':
          FieldComponent = ModelSelectorFieldRenderer;
          break;
        case 'text':
        default:
          // Choose based on type if no widget specified
          if (property.type === 'boolean') {
            FieldComponent = ToggleFieldRenderer;
          } else if (property.type === 'number' || property.type === 'integer') {
            FieldComponent = NumberFieldRenderer;
          } else if (property.enum) {
            FieldComponent = SelectFieldRenderer;
          } else if (property.format === 'textarea') {
            FieldComponent = TextareaFieldRenderer;
          } else if (property.format === 'expression') {
            FieldComponent = ExpressionFieldRenderer;
          } else if (property.format === 'json') {
            FieldComponent = CodeFieldRenderer;
          } else {
            FieldComponent = TextFieldRenderer;
          }
      }

      const isRequired = schema.required?.includes(fieldKey);

      return (
        <div key={fieldKey} className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={fieldKey} className="text-sm font-medium">
              {property.title || fieldKey}
              {isRequired && <span className="text-destructive ml-1">*</span>}
            </Label>
            
            {property['x-ui-help'] && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">{property['x-ui-help']}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {property.description && !property['x-ui-help'] && (
            <p className="text-xs text-muted-foreground">
              {property.description}
            </p>
          )}

          <FieldComponent {...commonProps} />

          {fieldError && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldError}
            </p>
          )}
        </div>
      );
    },
    [schema, config, errors, disabled, expressionContext, handleFieldChange]
  );

  // Group titles for display
  const groupTitles: Record<string, string> = {
    basic: 'Basic Configuration',
    model: 'Model Settings',
    response: 'Response Format',
    tools: 'Tool Calling',
    memory: 'Memory & Context',
    default: '',
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedFields).map(([group, fields]) => {
        if (fields.length === 0) return null;

        return (
          <div key={group} className="space-y-4">
            {groupTitles[group] && group !== 'default' && (
              <div className="flex items-center gap-2 pb-2 border-b">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">{groupTitles[group]}</h3>
              </div>
            )}
            {fields.map(renderField)}
          </div>
        );
      })}
    </div>
  );
};

export default SchemaFormRenderer;
