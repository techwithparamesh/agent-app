/**
 * Dynamic Field Renderer
 * 
 * Renders form fields dynamically based on schema definitions.
 * Supports all field types with proper validation, conditional display, and AI features.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Info, 
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  Code,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { 
  FieldSchema, 
  ActionSchema, 
  FieldGroup, 
  FormState,
  FieldValidation 
} from './types';

// ============================================
// TYPES
// ============================================

interface DynamicFieldRendererProps {
  schema: ActionSchema;
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  onAIFill?: (fieldId: string) => void;
  onAISuggest?: (fieldId: string) => void;
  errors?: Record<string, string | string[]>;
  disabled?: boolean;
  className?: string;
}

interface FieldRendererProps {
  field: FieldSchema;
  value: any;
  onChange: (value: any) => void;
  onAIFill?: () => void;
  onAISuggest?: () => void;
  error?: string | string[];
  disabled?: boolean;
  allValues?: Record<string, any>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert error to displayable string
 */
function formatError(error: string | string[] | undefined): string | undefined {
  if (!error) return undefined;
  if (Array.isArray(error)) {
    return error.length > 0 ? error.join(', ') : undefined;
  }
  return error;
}

// ============================================
// FIELD VISIBILITY HELPERS
// ============================================

function evaluateCondition(
  condition: { field: string; condition: string; value?: any; values?: any[] },
  allValues: Record<string, any>
): boolean {
  const fieldValue = allValues[condition.field];
  
  switch (condition.condition) {
    case 'equals':
      return fieldValue === condition.value;
    case 'notEquals':
      return fieldValue !== condition.value;
    case 'in':
      return condition.values?.includes(fieldValue) ?? false;
    case 'notIn':
      return !(condition.values?.includes(fieldValue) ?? false);
    case 'empty':
      return !fieldValue || fieldValue === '' || (Array.isArray(fieldValue) && fieldValue.length === 0);
    case 'notEmpty':
      return fieldValue && fieldValue !== '' && (!Array.isArray(fieldValue) || fieldValue.length > 0);
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
    case 'greaterThan':
      return typeof fieldValue === 'number' && fieldValue > condition.value;
    case 'lessThan':
      return typeof fieldValue === 'number' && fieldValue < condition.value;
    default:
      return true;
  }
}

function isFieldVisible(field: FieldSchema, allValues: Record<string, any>): boolean {
  // Check showWhen conditions (all must be true)
  if (field.showWhen && field.showWhen.length > 0) {
    const showResult = field.showWhen.every(cond => evaluateCondition(cond, allValues));
    if (!showResult) return false;
  }
  
  // Check hideWhen conditions (any true means hide)
  if (field.hideWhen && field.hideWhen.length > 0) {
    const hideResult = field.hideWhen.some(cond => evaluateCondition(cond, allValues));
    if (hideResult) return false;
  }
  
  return true;
}

// ============================================
// INDIVIDUAL FIELD RENDERERS
// ============================================

const TextFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  onAIFill,
  error,
  disabled,
}) => {
  return (
    <div className="space-y-1.5">
      <Input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        className={cn(
          "h-9 text-sm",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
      />
      {field.aiAutoFill && onAIFill && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAIFill}
          className="h-6 text-xs text-muted-foreground hover:text-primary"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          AI Fill
        </Button>
      )}
    </div>
  );
};

const SecretFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  const [visible, setVisible] = useState(false);
  
  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || '••••••••'}
        disabled={disabled}
        className={cn(
          "h-9 text-sm pr-10",
          error && "border-red-500"
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-9 w-9 px-0"
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </Button>
    </div>
  );
};

const NumberFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  const validation = field.validation || {};
  
  return (
    <Input
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const num = e.target.value === '' ? undefined : Number(e.target.value);
        onChange(num);
      }}
      min={validation.min}
      max={validation.max}
      step={validation.step || 1}
      placeholder={field.placeholder}
      disabled={disabled}
      className={cn(
        "h-9 text-sm",
        error && "border-red-500"
      )}
    />
  );
};

const SliderFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled,
}) => {
  const validation = field.validation || {};
  const min = validation.min ?? 0;
  const max = validation.max ?? 100;
  const step = validation.step ?? 1;
  
  return (
    <div className="flex items-center gap-3">
      <Slider
        value={[value ?? field.defaultValue ?? min]}
        onValueChange={([val]) => onChange(val)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="flex-1"
      />
      <span className="text-sm text-muted-foreground w-12 text-right">
        {value ?? field.defaultValue ?? min}
      </span>
    </div>
  );
};

const SelectFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  const options = field.options || [];
  
  return (
    <Select
      value={value || ''}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("h-9 text-sm", error && "border-red-500")}>
        <SelectValue placeholder={field.placeholder || 'Select...'} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <span>{option.label}</span>
              {option.description && (
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const MultiSelectFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled,
}) => {
  const options = field.options || [];
  const selected: string[] = value || [];
  
  const toggleOption = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter(v => v !== optionValue));
    } else {
      onChange([...selected, optionValue]);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <Badge
              key={option.value}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer transition-colors",
                !disabled && "hover:bg-primary/80"
              )}
              onClick={() => !disabled && toggleOption(option.value)}
            >
              {option.label}
            </Badge>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} selected
        </p>
      )}
    </div>
  );
};

const BooleanFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled,
}) => {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">
        {field.description}
      </span>
      <Switch
        checked={value ?? field.defaultValue ?? false}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

const TextareaFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  onAISuggest,
  error,
  disabled,
}) => {
  return (
    <div className="space-y-1.5">
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        rows={field.rows || 4}
        className={cn(
          "text-sm resize-none",
          error && "border-red-500"
        )}
      />
      {field.aiSuggestions && onAISuggest && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAISuggest}
          className="h-6 text-xs text-muted-foreground hover:text-primary"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          AI Suggest
        </Button>
      )}
    </div>
  );
};

const JsonFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  onAIFill,
  error,
  disabled,
}) => {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  
  const handleChange = (text: string) => {
    try {
      if (text.trim()) {
        const parsed = JSON.parse(text);
        onChange(parsed);
        setJsonError(null);
      } else {
        onChange(undefined);
        setJsonError(null);
      }
    } catch {
      // Keep the raw string if it's invalid JSON (user might be typing)
      onChange(text);
      setJsonError('Invalid JSON');
    }
  };
  
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Code className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Textarea
          value={stringValue || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder || '{\n  "key": "value"\n}'}
          disabled={disabled}
          rows={field.rows || 6}
          className={cn(
            "text-sm font-mono pl-10 resize-none",
            (error || jsonError) && "border-red-500"
          )}
        />
      </div>
      {(jsonError || error) && (
        <p className="text-xs text-red-500">{jsonError || error}</p>
      )}
      {field.aiAutoFill && onAIFill && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAIFill}
          className="h-6 text-xs text-muted-foreground hover:text-primary"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          AI Generate JSON
        </Button>
      )}
    </div>
  );
};

const CodeFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  onAISuggest,
  error,
  disabled,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="relative rounded-md border bg-zinc-950">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800">
          <span className="text-xs text-zinc-400">{field.language || 'code'}</span>
          {field.aiSuggestions && onAISuggest && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAISuggest}
              className="h-6 text-xs text-zinc-400 hover:text-white"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI Write
            </Button>
          )}
        </div>
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          rows={field.rows || 8}
          className={cn(
            "font-mono text-sm bg-transparent border-0 resize-none focus-visible:ring-0 text-zinc-100",
            error && "border-red-500"
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500">{formatError(error)}</p>}
    </div>
  );
};

const ExpressionFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  onAIFill,
  error,
  disabled,
}) => {
  // Expression fields can contain variables like {{ $node.output.data }}
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'Enter value or {{ expression }}'}
          disabled={disabled}
          className={cn(
            "h-9 text-sm font-mono",
            error && "border-red-500"
          )}
        />
      </div>
      {field.aiAutoFill && onAIFill && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAIFill}
          className="h-6 text-xs text-muted-foreground hover:text-primary"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          AI Fill
        </Button>
      )}
    </div>
  );
};

const KeyValueFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  onAIFill,
  disabled,
}) => {
  const pairs: Array<{ key: string; value: string }> = value || [{ key: '', value: '' }];
  
  const updatePair = (index: number, key: string, val: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { key, value: val };
    onChange(newPairs);
  };
  
  const addPair = () => {
    onChange([...pairs, { key: '', value: '' }]);
  };
  
  const removePair = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-2">
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="text"
            value={pair.key}
            onChange={(e) => updatePair(index, e.target.value, pair.value)}
            placeholder="Key"
            disabled={disabled}
            className="h-8 text-sm flex-1"
          />
          <Input
            type="text"
            value={pair.value}
            onChange={(e) => updatePair(index, pair.key, e.target.value)}
            placeholder="Value"
            disabled={disabled}
            className="h-8 text-sm flex-1"
          />
          {pairs.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removePair(index)}
              disabled={disabled}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPair}
          disabled={disabled}
          className="h-7 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
        {field.aiAutoFill && onAIFill && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAIFill}
            disabled={disabled}
            className="h-7 text-xs text-muted-foreground"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            AI Fill
          </Button>
        )}
      </div>
    </div>
  );
};

const ArrayFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled,
  allValues,
}) => {
  const items: any[] = value || [];
  const itemSchema = field.itemSchema;
  
  if (!itemSchema) {
    return <p className="text-sm text-muted-foreground">Array field missing itemSchema</p>;
  }
  
  const addItem = () => {
    const newItem = itemSchema.type === 'object' ? {} : '';
    onChange([...items, newItem]);
  };
  
  const updateItem = (index: number, newValue: any) => {
    const newItems = [...items];
    newItems[index] = newValue;
    onChange(newItems);
  };
  
  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2 p-2 rounded-md border bg-muted/30">
          <div className="flex-1">
            {itemSchema.type === 'object' && itemSchema.fields ? (
              <div className="space-y-2">
                {itemSchema.fields.map((subField) => (
                  <div key={subField.id}>
                    <Label className="text-xs">{subField.name}</Label>
                    <FieldRenderer
                      field={subField}
                      value={item[subField.id]}
                      onChange={(val) => updateItem(index, { ...item, [subField.id]: val })}
                      disabled={disabled}
                      allValues={allValues}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <FieldRenderer
                field={itemSchema}
                value={item}
                onChange={(val) => updateItem(index, val)}
                disabled={disabled}
                allValues={allValues}
              />
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeItem(index)}
            disabled={disabled}
            className="h-8 w-8 p-0 mt-1"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        disabled={disabled}
        className="h-7 text-xs"
      >
        <Plus className="w-3 h-3 mr-1" />
        Add {itemSchema.name || 'Item'}
      </Button>
    </div>
  );
};

const DateTimeFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  return (
    <Input
      type="datetime-local"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "h-9 text-sm",
        error && "border-red-500"
      )}
    />
  );
};

const DateFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  return (
    <Input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "h-9 text-sm",
        error && "border-red-500"
      )}
    />
  );
};

const UrlFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  return (
    <div className="relative">
      <Input
        type="url"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || 'https://example.com'}
        disabled={disabled}
        className={cn(
          "h-9 text-sm pr-10",
          error && "border-red-500"
        )}
      />
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
};

const EmailFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
}) => {
  return (
    <Input
      type="email"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder || 'email@example.com'}
      disabled={disabled}
      className={cn(
        "h-9 text-sm",
        error && "border-red-500"
      )}
    />
  );
};

// ============================================
// MAIN FIELD RENDERER
// ============================================

const FieldRenderer: React.FC<FieldRendererProps> = (props) => {
  const { field } = props;
  
  switch (field.type) {
    case 'text':
      return <TextFieldRenderer {...props} />;
    case 'secret':
      return <SecretFieldRenderer {...props} />;
    case 'number':
      return <NumberFieldRenderer {...props} />;
    case 'slider':
      return <SliderFieldRenderer {...props} />;
    case 'select':
      return <SelectFieldRenderer {...props} />;
    case 'multi-select':
      return <MultiSelectFieldRenderer {...props} />;
    case 'boolean':
      return <BooleanFieldRenderer {...props} />;
    case 'textarea':
      return <TextareaFieldRenderer {...props} />;
    case 'json':
      return <JsonFieldRenderer {...props} />;
    case 'code':
      return <CodeFieldRenderer {...props} />;
    case 'expression':
      return <ExpressionFieldRenderer {...props} />;
    case 'key-value':
      return <KeyValueFieldRenderer {...props} />;
    case 'array':
      return <ArrayFieldRenderer {...props} />;
    case 'datetime':
      return <DateTimeFieldRenderer {...props} />;
    case 'date':
      return <DateFieldRenderer {...props} />;
    case 'url':
      return <UrlFieldRenderer {...props} />;
    case 'email':
      return <EmailFieldRenderer {...props} />;
    case 'resource':
      // Resource fields are like selects but with dynamic options
      return <SelectFieldRenderer {...props} />;
    case 'credential':
      // Credential selection
      return <SelectFieldRenderer {...props} />;
    default:
      return <TextFieldRenderer {...props} />;
  }
};

// ============================================
// FIELD WRAPPER WITH LABEL
// ============================================

interface FieldWrapperProps {
  field: FieldSchema;
  children: React.ReactNode;
  error?: string | string[];
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({ field, children, error }) => {
  const isRequired = field.validation?.required;
  
  // Boolean fields render their own label inline
  if (field.type === 'boolean') {
    return <>{children}</>;
  }
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-sm font-medium">
          {field.name}
          {isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        {(field.description || field.aiHelp) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-xs">{field.description}</p>
              {field.aiHelp && (
                <p className="text-xs text-blue-400 mt-1">💡 {field.aiHelp}</p>
              )}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {formatError(error)}
        </p>
      )}
    </div>
  );
};

// ============================================
// FIELD GROUP COMPONENT
// ============================================

interface FieldGroupProps {
  group: FieldGroup;
  fields: FieldSchema[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  onAIFill?: (fieldId: string) => void;
  onAISuggest?: (fieldId: string) => void;
  errors?: Record<string, string | string[]>;
  disabled?: boolean;
}

const FieldGroupComponent: React.FC<FieldGroupProps> = ({
  group,
  fields,
  values,
  onChange,
  onAIFill,
  onAISuggest,
  errors,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(!group.collapsed);
  
  const visibleFields = fields.filter(field => isFieldVisible(field, values));
  
  if (visibleFields.length === 0) return null;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between h-8 px-2 hover:bg-muted/50"
        >
          <span className="text-sm font-medium">{group.name}</span>
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-2">
        {visibleFields.map((field) => (
          <FieldWrapper key={field.id} field={field} error={errors?.[field.id]}>
            <FieldRenderer
              field={field}
              value={values[field.id]}
              onChange={(value) => onChange(field.id, value)}
              onAIFill={onAIFill ? () => onAIFill(field.id) : undefined}
              onAISuggest={onAISuggest ? () => onAISuggest(field.id) : undefined}
              error={errors?.[field.id]}
              disabled={disabled}
              allValues={values}
            />
          </FieldWrapper>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  schema,
  values,
  onChange,
  onAIFill,
  onAISuggest,
  errors,
  disabled,
  className,
}) => {
  // Get field groups or create a default one
  const fieldGroups = schema.fieldGroups || [];
  const fields = schema.fields || [];
  
  // Group fields by their group ID
  const groupedFields = useMemo(() => {
    const groups: Record<string, FieldSchema[]> = {};
    const ungrouped: FieldSchema[] = [];
    
    fields.forEach(field => {
      if (field.group) {
        if (!groups[field.group]) {
          groups[field.group] = [];
        }
        groups[field.group].push(field);
      } else {
        ungrouped.push(field);
      }
    });
    
    return { groups, ungrouped };
  }, [fields]);
  
  // Filter visible ungrouped fields
  const visibleUngroupedFields = groupedFields.ungrouped.filter(
    field => isFieldVisible(field, values)
  );
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Credential warning if required */}
      {schema.requiresCredential && !values._credential && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-500">
            This action requires credentials to be configured
          </span>
        </div>
      )}
      
      {/* Ungrouped fields first */}
      {visibleUngroupedFields.map((field) => (
        <FieldWrapper key={field.id} field={field} error={errors?.[field.id]}>
          <FieldRenderer
            field={field}
            value={values[field.id]}
            onChange={(value) => onChange(field.id, value)}
            onAIFill={onAIFill ? () => onAIFill(field.id) : undefined}
            onAISuggest={onAISuggest ? () => onAISuggest(field.id) : undefined}
            error={errors?.[field.id]}
            disabled={disabled}
            allValues={values}
          />
        </FieldWrapper>
      ))}
      
      {/* Grouped fields */}
      {fieldGroups.map((group) => (
        <FieldGroupComponent
          key={group.id}
          group={group}
          fields={groupedFields.groups[group.id] || []}
          values={values}
          onChange={onChange}
          onAIFill={onAIFill}
          onAISuggest={onAISuggest}
          errors={errors}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default DynamicFieldRenderer;
