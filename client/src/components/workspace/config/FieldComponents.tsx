/**
 * Reusable Field Components for Node Configuration
 * 
 * These components provide consistent UI for all configuration fields
 * across triggers, actions, and logic nodes.
 */

import React, { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Info,
  HelpCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Plus,
  Trash2,
  Variable,
  Sparkles,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar as CalendarIcon,
  Palette,
  Search,
  Link,
  Hash,
  List,
  X,
  GripVertical,
  Filter,
  Settings2,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface BaseFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  className?: string;
}

interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'url' | 'tel';
  prefix?: string;
  suffix?: string;
  maxLength?: number;
}

interface PasswordFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface NumberFieldProps extends BaseFieldProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

interface TextareaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  monospace?: boolean;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>;
  placeholder?: string;
  groups?: Array<{ label: string; options: Array<{ value: string; label: string }> }>;
}

interface SwitchFieldProps extends BaseFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

interface SliderFieldProps extends BaseFieldProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

interface KeyValueFieldProps extends BaseFieldProps {
  value: Array<{ key: string; value: string }>;
  onChange: (value: Array<{ key: string; value: string }>) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

interface TagsFieldProps extends BaseFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

interface CodeFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'json' | 'javascript' | 'python' | 'html' | 'sql';
  placeholder?: string;
  rows?: number;
}

interface CredentialFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  credentialType: string;
  onConnect?: () => void;
  connected?: boolean;
  connectionName?: string;
}

interface ExpressionFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  availableVariables?: Array<{ name: string; description?: string; example?: string }>;
}

// ============================================
// NEW N8N-STYLE FIELD TYPES
// ============================================

interface MultiOptionsFieldProps extends BaseFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: Array<{ value: string; label: string; description?: string }>;
  placeholder?: string;
  maxItems?: number;
}

interface DateTimeFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  includeTime?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

interface ColorFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  presetColors?: string[];
  showOpacity?: boolean;
}

interface CollectionFieldProps extends BaseFieldProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  options: Array<{
    name: string;
    displayName: string;
    type: 'string' | 'number' | 'boolean' | 'options';
    default?: any;
    description?: string;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
  }>;
  placeholder?: string;
}

interface FixedCollectionFieldProps extends BaseFieldProps {
  value: Array<Record<string, any>>;
  onChange: (value: Array<Record<string, any>>) => void;
  itemLabel?: string;
  fields: Array<{
    name: string;
    displayName: string;
    type: 'string' | 'number' | 'boolean' | 'options' | 'expression';
    default?: any;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    width?: 'full' | 'half';
  }>;
  sortable?: boolean;
  maxItems?: number;
}

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

interface FilterGroup {
  conditions: FilterCondition[];
  combinator: 'and' | 'or';
}

interface FilterFieldProps extends BaseFieldProps {
  value: FilterGroup;
  onChange: (value: FilterGroup) => void;
  fields: Array<{ value: string; label: string; type?: 'string' | 'number' | 'boolean' | 'date' }>;
  operators?: Array<{ value: string; label: string; types?: string[] }>;
}

interface ResourceLocatorFieldProps extends BaseFieldProps {
  value: { mode: 'list' | 'id' | 'url'; value: string };
  onChange: (value: { mode: 'list' | 'id' | 'url'; value: string }) => void;
  modes: Array<'list' | 'id' | 'url'>;
  listOptions?: Array<{ value: string; label: string; description?: string }>;
  onSearch?: (query: string) => Promise<Array<{ value: string; label: string }>>;
  placeholder?: string;
  resourceType?: string;
}

interface ResourceMapperFieldProps extends BaseFieldProps {
  value: Array<{ source: string; target: string; type?: string }>;
  onChange: (value: Array<{ source: string; target: string; type?: string }>) => void;
  sourceFields: Array<{ value: string; label: string; type?: string }>;
  targetFields: Array<{ value: string; label: string; type?: string; required?: boolean }>;
  autoMap?: boolean;
}

interface HTMLEditorFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showPreview?: boolean;
}

// ============================================
// DISPLAY OPTIONS SYSTEM
// ============================================

export interface DisplayOptions {
  show?: Record<string, any[]>;
  hide?: Record<string, any[]>;
}

export interface FieldConfig {
  name: string;
  type: string;
  displayOptions?: DisplayOptions;
  [key: string]: any;
}

/**
 * Evaluates whether a field should be displayed based on displayOptions
 * Mimics n8n's conditional field visibility system
 */
export const shouldDisplayField = (
  displayOptions: DisplayOptions | undefined,
  formValues: Record<string, any>
): boolean => {
  if (!displayOptions) return true;

  // Check 'show' conditions - ALL must match for field to show
  if (displayOptions.show) {
    for (const [fieldName, allowedValues] of Object.entries(displayOptions.show)) {
      const currentValue = formValues[fieldName];
      const matches = allowedValues.some(allowed => {
        if (allowed === true || allowed === false) {
          return currentValue === allowed;
        }
        return currentValue === allowed || String(currentValue) === String(allowed);
      });
      if (!matches) return false;
    }
  }

  // Check 'hide' conditions - ANY match hides the field
  if (displayOptions.hide) {
    for (const [fieldName, hiddenValues] of Object.entries(displayOptions.hide)) {
      const currentValue = formValues[fieldName];
      const shouldHide = hiddenValues.some(hidden => {
        if (hidden === true || hidden === false) {
          return currentValue === hidden;
        }
        return currentValue === hidden || String(currentValue) === String(hidden);
      });
      if (shouldHide) return false;
    }
  }

  return true;
};

// ============================================
// FIELD LABEL COMPONENT
// ============================================

export const FieldLabel: React.FC<{
  label: string;
  required?: boolean;
  description?: string;
  helpText?: string;
}> = ({ label, required, description, helpText }) => (
  <div className="flex items-center gap-1.5 mb-1.5">
    <Label className="text-xs font-medium">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
    {helpText && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">
            {helpText}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

// ============================================
// TEXT FIELD
// ============================================

export const TextField: React.FC<TextFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  placeholder,
  type = 'text',
  prefix,
  suffix,
  maxLength,
  className,
}) => (
  <div className={cn("space-y-1.5", className)}>
    <FieldLabel label={label} required={required} helpText={helpText} />
    <div className="relative flex">
      {prefix && (
        <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 rounded-l-md">
          {prefix}
        </span>
      )}
      <Input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          "h-9",
          prefix && "rounded-l-none",
          suffix && "rounded-r-none",
          error && "border-red-500"
        )}
      />
      {suffix && (
        <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-l-0 rounded-r-md">
          {suffix}
        </span>
      )}
    </div>
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ============================================
// PASSWORD FIELD
// ============================================

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  placeholder,
  className,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className={cn("space-y-1.5", className)}>
      <FieldLabel label={label} required={required} helpText={helpText} />
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("h-9 pr-10 font-mono text-sm", error && "border-red-500")}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-9 w-9 px-2"
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================
// NUMBER FIELD
// ============================================

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  className,
}) => (
  <div className={cn("space-y-1.5", className)}>
    <FieldLabel label={label} required={required} helpText={helpText} />
    <Input
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const val = e.target.value;
        if (val === '') {
          onChange(0);
        } else {
          const parsed = parseFloat(val);
          if (!isNaN(parsed)) {
            onChange(parsed);
          }
        }
      }}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={cn("h-9", error && "border-red-500")}
    />
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ============================================
// TEXTAREA FIELD
// ============================================

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  placeholder,
  rows = 3,
  monospace,
  className,
}) => (
  <div className={cn("space-y-1.5", className)}>
    <FieldLabel label={label} required={required} helpText={helpText} />
    <Textarea
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        "resize-none text-sm",
        monospace && "font-mono text-xs",
        error && "border-red-500"
      )}
    />
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ============================================
// SELECT FIELD
// ============================================

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  options,
  placeholder = "Select...",
  groups,
  className,
}) => (
  <div className={cn("space-y-1.5", className)}>
    <FieldLabel label={label} required={required} helpText={helpText} />
    <Select value={value ?? ''} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9", error && "border-red-500")}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {groups ? (
          groups.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))
        ) : (
          options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              <div>
                <span>{opt.label}</span>
                {opt.description && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {opt.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ============================================
// SWITCH FIELD
// ============================================

export const SwitchField: React.FC<SwitchFieldProps> = ({
  label,
  description,
  helpText,
  value,
  onChange,
  className,
}) => (
  <div className={cn("flex items-center justify-between py-2", className)}>
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs font-medium">{label}</Label>
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                {helpText}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
    <Switch checked={value} onCheckedChange={onChange} />
  </div>
);

// ============================================
// SLIDER FIELD
// ============================================

export const SliderField: React.FC<SliderFieldProps> = ({
  label,
  description,
  required,
  helpText,
  value,
  onChange,
  min,
  max,
  step = 1,
  showValue = true,
  formatValue,
  className,
}) => {
  // Ensure value is a valid number within bounds
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : min;
  const clampedValue = Math.max(min, Math.min(max, safeValue));
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <FieldLabel label={label} required={required} helpText={helpText} />
        {showValue && (
          <span className="text-sm font-medium">
            {formatValue ? formatValue(clampedValue) : clampedValue}
          </span>
        )}
      </div>
      <Slider
        value={[clampedValue]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
};

// ============================================
// KEY-VALUE FIELD
// ============================================

export const KeyValueField: React.FC<KeyValueFieldProps> = ({
  label,
  description,
  required,
  helpText,
  value,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
  className,
}) => {
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];
  
  const addPair = () => {
    onChange([...safeValue, { key: '', value: '' }]);
  };

  const updatePair = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = [...safeValue];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange(updated);
  };

  const removePair = (index: number) => {
    onChange(safeValue.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel label={label} required={required} helpText={helpText} />
      {safeValue.map((pair, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={pair.key}
            onChange={(e) => updatePair(index, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            className="h-9 flex-1"
          />
          <Input
            value={pair.value}
            onChange={(e) => updatePair(index, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className="h-9 flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => removePair(index)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addPair} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add {label}
      </Button>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
};

// ============================================
// TAGS FIELD
// ============================================

export const TagsField: React.FC<TagsFieldProps> = ({
  label,
  description,
  required,
  helpText,
  value,
  onChange,
  placeholder = "Add tag...",
  suggestions,
  className,
}) => {
  const [input, setInput] = useState('');
  
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  const addTag = () => {
    const tag = input.trim();
    if (tag && !safeValue.includes(tag)) {
      onChange([...safeValue, tag]);
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(safeValue.filter(t => t !== tag));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel label={label} required={required} helpText={helpText} />
      <div className="flex flex-wrap gap-1.5 mb-2">
        {safeValue.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          className="h-9 flex-1"
        />
        <Button variant="outline" size="sm" onClick={addTag}>
          Add
        </Button>
      </div>
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.filter(s => !safeValue.includes(s)).slice(0, 5).map((s) => (
            <Button
              key={s}
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => onChange([...safeValue, s])}
            >
              + {s}
            </Button>
          ))}
        </div>
      )}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
};

// ============================================
// CODE/JSON FIELD
// ============================================

export const CodeField: React.FC<CodeFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  language = 'json',
  placeholder,
  rows = 6,
  className,
}) => {
  const [isValid, setIsValid] = useState(true);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (language === 'json') {
      try {
        if (newValue.trim()) {
          JSON.parse(newValue);
        }
        setIsValid(true);
      } catch {
        setIsValid(false);
      }
    }
  };

  const formatJson = () => {
    if (language === 'json') {
      try {
        const parsed = JSON.parse(value);
        onChange(JSON.stringify(parsed, null, 2));
        setIsValid(true);
      } catch {
        setIsValid(false);
      }
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <FieldLabel label={label} required={required} helpText={helpText} />
        {language === 'json' && (
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={formatJson}>
            Format
          </Button>
        )}
      </div>
      <div className="relative">
        <Textarea
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            "font-mono text-xs resize-none",
            !isValid && "border-red-500",
            error && "border-red-500"
          )}
        />
        {!isValid && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="destructive" className="text-xs">
              Invalid JSON
            </Badge>
          </div>
        )}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================
// CREDENTIAL FIELD
// ============================================

export const CredentialField: React.FC<CredentialFieldProps> = ({
  label,
  description,
  required,
  helpText,
  value,
  onChange,
  credentialType,
  onConnect,
  connected,
  connectionName,
  className,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState('');

  const handleConnect = () => {
    if (onConnect) {
      onConnect();
    } else {
      // Default behavior: show API key input
      setShowApiKeyInput(true);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyValue.trim()) {
      onChange(apiKeyValue.trim());
      setShowApiKeyInput(false);
      setApiKeyValue('');
    }
  };

  const isConnected = connected || !!value;

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel label={label} required={required} helpText={helpText} />
      {isConnected && !showApiKeyInput ? (
        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">{connectionName || 'Connected'}</p>
              <p className="text-xs text-muted-foreground">{credentialType}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowApiKeyInput(true)}>
            Change
          </Button>
        </div>
      ) : showApiKeyInput ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="password"
              value={apiKeyValue}
              onChange={(e) => setApiKeyValue(e.target.value)}
              placeholder={`Enter ${credentialType} key...`}
              className="h-9 flex-1 font-mono text-sm"
            />
            <Button size="sm" onClick={handleSaveApiKey} disabled={!apiKeyValue.trim()}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowApiKeyInput(false)}>
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key will be stored securely
          </p>
        </div>
      ) : (
        <Button variant="outline" className="w-full justify-start h-10" onClick={handleConnect}>
          <Plus className="h-4 w-4 mr-2" />
          Connect {credentialType}
        </Button>
      )}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
};

// ============================================
// EXPRESSION FIELD (with variable picker)
// ============================================

export const ExpressionField: React.FC<ExpressionFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  placeholder,
  availableVariables = [],
  className,
}) => {
  const [showVars, setShowVars] = useState(false);

  const insertVariable = (varName: string) => {
    onChange(value + `{{${varName}}}`);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <FieldLabel label={label} required={required} helpText={helpText} />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1"
          onClick={() => setShowVars(!showVars)}
        >
          <Variable className="h-3.5 w-3.5" />
          Variables
        </Button>
      </div>
      <div className="relative">
        <Textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Use {{variable}} syntax for dynamic values"}
          rows={3}
          className={cn("font-mono text-xs resize-none", error && "border-red-500")}
        />
      </div>
      {showVars && availableVariables.length > 0 && (
        <div className="border rounded-lg p-2 bg-muted/50 max-h-40 overflow-y-auto">
          <p className="text-xs font-medium mb-2">Available Variables:</p>
          <div className="space-y-1">
            {availableVariables.map((v) => (
              <button
                key={v.name}
                className="w-full text-left p-1.5 rounded hover:bg-accent text-xs"
                onClick={() => insertVariable(v.name)}
              >
                <span className="font-mono text-primary">{`{{${v.name}}}`}</span>
                {v.description && (
                  <span className="text-muted-foreground ml-2">{v.description}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================
// INFO BOX COMPONENT
// ============================================

export const InfoBox: React.FC<{
  type?: 'info' | 'warning' | 'success' | 'error';
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ type = 'info', title, children, className }) => {
  const config = {
    info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500' },
    warning: { icon: AlertCircle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500' },
    success: { icon: CheckCircle, bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500' },
    error: { icon: AlertCircle, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500' },
  };
  const { icon: Icon, bg, border, text } = config[type];

  return (
    <div className={cn("p-3 rounded-lg border", bg, border, className)}>
      <div className="flex gap-2">
        <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", text)} />
        <div>
          <p className={cn("text-sm font-medium", text)}>{title}</p>
          <div className="text-xs text-muted-foreground mt-0.5">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SECTION HEADER COMPONENT
// ============================================

export const SectionHeader: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, description, action, className }) => (
  <div className={cn("flex items-center justify-between mb-4", className)}>
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

// ============================================
// COPYABLE FIELD
// ============================================

export const CopyableField: React.FC<{
  label: string;
  value: string;
  description?: string;
  className?: string;
}> = ({ label, value, description, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value ?? ''}
          readOnly
          className="h-9 font-mono text-xs bg-muted flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 w-9 h-9 p-0"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
};

// ============================================
// MULTI-OPTIONS FIELD (n8n multiOptions)
// ============================================

export const MultiOptionsField: React.FC<MultiOptionsFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  options,
  placeholder = "Select options...",
  maxItems,
  className,
}) => {
  const safeValue = Array.isArray(value) ? value : [];
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    if (safeValue.includes(optionValue)) {
      onChange(safeValue.filter(v => v !== optionValue));
    } else {
      if (maxItems && safeValue.length >= maxItems) return;
      onChange([...safeValue, optionValue]);
    }
  };

  const selectedLabels = options
    .filter(opt => safeValue.includes(opt.value))
    .map(opt => opt.label);

  return (
    <div className={cn("space-y-1.5", className)}>
      <FieldLabel label={label} required={required} helpText={helpText} />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between h-auto min-h-9 px-3 py-2",
              error && "border-red-500"
            )}
          >
            <div className="flex flex-wrap gap-1 flex-1 text-left">
              {selectedLabels.length > 0 ? (
                selectedLabels.map((label, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent",
                  safeValue.includes(option.value) && "bg-accent"
                )}
                onClick={() => toggleOption(option.value)}
              >
                <Checkbox
                  checked={safeValue.includes(option.value)}
                  className="pointer-events-none"
                />
                <div className="flex-1">
                  <div className="text-sm">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {safeValue.length > 0 && (
            <div className="border-t mt-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => onChange([])}
              >
                Clear all
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {maxItems && (
        <p className="text-xs text-muted-foreground">
          {safeValue.length}/{maxItems} selected
        </p>
      )}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================
// DATE-TIME FIELD (n8n dateTime)
// ============================================

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  includeTime = false,
  placeholder = "Select date...",
  minDate,
  maxDate,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [time, setTime] = useState(() => {
    if (value && includeTime) {
      const date = new Date(value);
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
    return '00:00';
  });

  const selectedDate = value ? new Date(value) : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      if (includeTime) {
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes);
      }
      onChange(date.toISOString());
    } else {
      onChange('');
    }
    if (!includeTime) setIsOpen(false);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (selectedDate) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes);
      onChange(newDate.toISOString());
    }
  };

  const formatDisplayDate = () => {
    if (!value) return placeholder;
    const date = new Date(value);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    if (includeTime) {
      return `${dateStr} at ${time}`;
    }
    return dateStr;
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <FieldLabel label={label} required={required} helpText={helpText} />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start h-9 px-3 font-normal",
              !value && "text-muted-foreground",
              error && "border-red-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayDate()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
          />
          {includeTime && (
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Time:</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="h-8 w-auto"
                />
              </div>
            </div>
          )}
          {value && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================
// COLOR FIELD (n8n color)
// ============================================

export const ColorField: React.FC<ColorFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#78716c', '#71717a', '#000000',
  ],
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value || '#000000');

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
    }
  };

  const handleColorSelect = (color: string) => {
    setHexInput(color);
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <FieldLabel label={label} required={required} helpText={helpText} />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start h-9 px-3",
              error && "border-red-500"
            )}
          >
            <div
              className="w-5 h-5 rounded border mr-2 shrink-0"
              style={{ backgroundColor: value || '#000000' }}
            />
            <span className="font-mono text-sm">{value || '#000000'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Preset Colors Grid */}
            <div className="grid grid-cols-10 gap-1">
              {presetColors.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-5 h-5 rounded border transition-transform hover:scale-110",
                    value === color && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
            
            {/* Custom Color Input */}
            <div className="flex gap-2 items-center">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <Input
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#000000"
                className="h-8 font-mono text-sm flex-1"
                maxLength={7}
              />
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================
// COLLECTION FIELD (n8n collection - optional expandable fields)
// ============================================

export const CollectionField: React.FC<CollectionFieldProps> = ({
  label,
  description,
  helpText,
  value,
  onChange,
  options,
  placeholder = "Add Option",
  className,
}) => {
  const safeValue = value && typeof value === 'object' ? value : {};
  const [isOpen, setIsOpen] = useState(false);

  // Fields that have been added
  const activeFields = options.filter(opt => safeValue[opt.name] !== undefined);
  // Fields available to add
  const availableFields = options.filter(opt => safeValue[opt.name] === undefined);

  const addField = (fieldName: string) => {
    const field = options.find(o => o.name === fieldName);
    if (field) {
      onChange({ ...safeValue, [fieldName]: field.default ?? '' });
    }
  };

  const removeField = (fieldName: string) => {
    const newValue = { ...safeValue };
    delete newValue[fieldName];
    onChange(newValue);
  };

  const updateField = (fieldName: string, fieldValue: any) => {
    onChange({ ...safeValue, [fieldName]: fieldValue });
  };

  const renderFieldInput = (field: typeof options[0]) => {
    const fieldValue = safeValue[field.name];

    switch (field.type) {
      case 'boolean':
        return (
          <Switch
            checked={!!fieldValue}
            onCheckedChange={(checked) => updateField(field.name, checked)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={fieldValue ?? ''}
            onChange={(e) => updateField(field.name, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            className="h-8 flex-1"
          />
        );
      case 'options':
        return (
          <Select value={fieldValue ?? ''} onValueChange={(v) => updateField(field.name, v)}>
            <SelectTrigger className="h-8 flex-1">
              <SelectValue placeholder={field.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={fieldValue ?? ''}
            onChange={(e) => updateField(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="h-8 flex-1"
          />
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel label={label} helpText={helpText} />
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-9"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="text-sm">
                {activeFields.length > 0
                  ? `${activeFields.length} option${activeFields.length > 1 ? 's' : ''} configured`
                  : placeholder}
              </span>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-2 space-y-2">
          {/* Active Fields */}
          {activeFields.map((field) => (
            <div key={field.name} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">{field.displayName}</Label>
                <div className="flex items-center gap-2">
                  {renderFieldInput(field)}
                </div>
                {field.description && (
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => removeField(field.name)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {/* Add Field Dropdown */}
          {availableFields.length > 0 && (
            <Select onValueChange={addField}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder={`+ Add option (${availableFields.length} available)`} />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((field) => (
                  <SelectItem key={field.name} value={field.name}>
                    <div>
                      <span>{field.displayName}</span>
                      {field.description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {field.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CollapsibleContent>
      </Collapsible>
      
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
};

// ============================================
// FIXED COLLECTION FIELD (n8n fixedCollection - array of grouped fields)
// ============================================

export const FixedCollectionField: React.FC<FixedCollectionFieldProps> = ({
  label,
  description,
  required,
  helpText,
  value,
  onChange,
  itemLabel = "Item",
  fields,
  sortable = false,
  maxItems,
  className,
}) => {
  const safeValue = Array.isArray(value) ? value : [];

  const addItem = () => {
    if (maxItems && safeValue.length >= maxItems) return;
    const newItem: Record<string, any> = {};
    fields.forEach(field => {
      newItem[field.name] = field.default ?? '';
    });
    onChange([...safeValue, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(safeValue.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, fieldName: string, fieldValue: any) => {
    const updated = [...safeValue];
    updated[index] = { ...updated[index], [fieldName]: fieldValue };
    onChange(updated);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === safeValue.length - 1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...safeValue];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const renderField = (field: typeof fields[0], item: Record<string, any>, index: number) => {
    const fieldValue = item[field.name];

    switch (field.type) {
      case 'boolean':
        return (
          <Switch
            checked={!!fieldValue}
            onCheckedChange={(checked) => updateItem(index, field.name, checked)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={fieldValue ?? ''}
            onChange={(e) => updateItem(index, field.name, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            className="h-8"
          />
        );
      case 'options':
        return (
          <Select
            value={fieldValue ?? ''}
            onValueChange={(v) => updateItem(index, field.name, v)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={field.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'expression':
        return (
          <div className="relative">
            <Input
              value={fieldValue ?? ''}
              onChange={(e) => updateItem(index, field.name, e.target.value)}
              placeholder={field.placeholder || "{{expression}}"}
              className="h-8 font-mono text-xs pr-8"
            />
            <Variable className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
          </div>
        );
      default:
        return (
          <Input
            value={fieldValue ?? ''}
            onChange={(e) => updateItem(index, field.name, e.target.value)}
            placeholder={field.placeholder}
            className="h-8"
          />
        );
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel label={label} required={required} helpText={helpText} />
      
      {/* Items List */}
      <div className="space-y-2">
        {safeValue.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg p-3 bg-card space-y-2"
          >
            {/* Item Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sortable && (
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronDown className="h-3 w-3 rotate-180" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === safeValue.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <span className="text-xs font-medium text-muted-foreground">
                  {itemLabel} {index + 1}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Item Fields */}
            <div className="grid gap-2" style={{
              gridTemplateColumns: fields.some(f => f.width === 'half') ? 'repeat(2, 1fr)' : '1fr'
            }}>
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={cn(
                    "space-y-1",
                    field.width === 'full' && "col-span-2"
                  )}
                >
                  <Label className="text-xs">{field.displayName}</Label>
                  {renderField(field, item, index)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Add Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-full"
        disabled={maxItems !== undefined && safeValue.length >= maxItems}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add {itemLabel}
      </Button>
      
      {maxItems && (
        <p className="text-xs text-muted-foreground">
          {safeValue.length}/{maxItems} items
        </p>
      )}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
};

// ============================================
// FILTER FIELD (n8n filter - condition builder)
// ============================================

const DEFAULT_OPERATORS = [
  { value: 'equals', label: 'Equals', types: ['string', 'number', 'boolean'] },
  { value: 'not_equals', label: 'Does not equal', types: ['string', 'number', 'boolean'] },
  { value: 'contains', label: 'Contains', types: ['string'] },
  { value: 'not_contains', label: 'Does not contain', types: ['string'] },
  { value: 'starts_with', label: 'Starts with', types: ['string'] },
  { value: 'ends_with', label: 'Ends with', types: ['string'] },
  { value: 'greater_than', label: 'Greater than', types: ['number', 'date'] },
  { value: 'less_than', label: 'Less than', types: ['number', 'date'] },
  { value: 'greater_or_equal', label: 'Greater or equal', types: ['number', 'date'] },
  { value: 'less_or_equal', label: 'Less or equal', types: ['number', 'date'] },
  { value: 'is_empty', label: 'Is empty', types: ['string'] },
  { value: 'is_not_empty', label: 'Is not empty', types: ['string'] },
  { value: 'is_true', label: 'Is true', types: ['boolean'] },
  { value: 'is_false', label: 'Is false', types: ['boolean'] },
];

export const FilterField: React.FC<FilterFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  fields,
  operators = DEFAULT_OPERATORS,
  className,
}) => {
  const safeValue: FilterGroup = value && value.conditions
    ? value
    : { conditions: [], combinator: 'and' };

  const addCondition = () => {
    const newCondition: FilterCondition = {
      field: fields[0]?.value || '',
      operator: 'equals',
      value: '',
    };
    onChange({
      ...safeValue,
      conditions: [...safeValue.conditions, newCondition],
    });
  };

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    const newConditions = [...safeValue.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    onChange({ ...safeValue, conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    onChange({
      ...safeValue,
      conditions: safeValue.conditions.filter((_, i) => i !== index),
    });
  };

  const toggleCombinator = () => {
    onChange({
      ...safeValue,
      combinator: safeValue.combinator === 'and' ? 'or' : 'and',
    });
  };

  const getFieldType = (fieldValue: string): string => {
    const field = fields.find(f => f.value === fieldValue);
    return field?.type || 'string';
  };

  const getAvailableOperators = (fieldValue: string) => {
    const fieldType = getFieldType(fieldValue);
    return operators.filter(op => !op.types || op.types.includes(fieldType));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel label={label} required={required} helpText={helpText} />
      
      <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
        {safeValue.conditions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            No conditions added. Click below to add a filter condition.
          </p>
        ) : (
          <>
            {/* Combinator Toggle */}
            {safeValue.conditions.length > 1 && (
              <div className="flex items-center justify-center mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={toggleCombinator}
                >
                  Match{' '}
                  <Badge
                    variant={safeValue.combinator === 'and' ? 'default' : 'secondary'}
                    className="mx-1"
                  >
                    {safeValue.combinator.toUpperCase()}
                  </Badge>{' '}
                  of the conditions
                </Button>
              </div>
            )}
            
            {/* Conditions */}
            {safeValue.conditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2">
                {/* Field Selector */}
                <Select
                  value={condition.field}
                  onValueChange={(v) => updateCondition(index, { field: v })}
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Operator Selector */}
                <Select
                  value={condition.operator}
                  onValueChange={(v) => updateCondition(index, { operator: v })}
                >
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableOperators(condition.field).map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Value Input */}
                {!['is_empty', 'is_not_empty', 'is_true', 'is_false'].includes(condition.operator) && (
                  <Input
                    value={condition.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                    placeholder="Value"
                    className="h-8 flex-1"
                  />
                )}
                
                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeCondition(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </>
        )}
        
        {/* Add Condition Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={addCondition}
          className="w-full mt-2"
        >
          <Filter className="h-4 w-4 mr-2" />
          Add Condition
        </Button>
      </div>
      
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================
// RESOURCE LOCATOR FIELD (n8n resourceLocator)
// ============================================

export const ResourceLocatorField: React.FC<ResourceLocatorFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  modes,
  listOptions = [],
  onSearch,
  placeholder,
  resourceType = "resource",
  className,
}) => {
  const safeValue = value && value.mode ? value : { mode: modes[0] || 'id', value: '' };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ value: string; label: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (onSearch && query.length >= 2) {
      setIsSearching(true);
      try {
        const results = await onSearch(query);
        setSearchResults(results);
      } catch (e) {
        setSearchResults([]);
      }
      setIsSearching(false);
    }
  };

  const modeIcons: Record<string, React.ReactNode> = {
    list: <List className="h-4 w-4" />,
    id: <Hash className="h-4 w-4" />,
    url: <Link className="h-4 w-4" />,
  };

  const modeLabels: Record<string, string> = {
    list: 'From List',
    id: 'By ID',
    url: 'By URL',
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <FieldLabel label={label} required={required} helpText={helpText} />
      
      <div className="flex gap-1">
        {/* Mode Selector */}
        {modes.length > 1 && (
          <div className="flex border rounded-md overflow-hidden">
            {modes.map((mode) => (
              <TooltipProvider key={mode}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={safeValue.mode === mode ? "secondary" : "ghost"}
                      size="icon"
                      className="h-9 w-9 rounded-none"
                      onClick={() => onChange({ ...safeValue, mode, value: '' })}
                    >
                      {modeIcons[mode]}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{modeLabels[mode]}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
        
        {/* Value Input based on mode */}
        <div className="flex-1">
          {safeValue.mode === 'list' ? (
            <Select
              value={safeValue.value}
              onValueChange={(v) => onChange({ ...safeValue, value: v })}
            >
              <SelectTrigger className={cn("h-9", error && "border-red-500")}>
                <SelectValue placeholder={placeholder || `Select ${resourceType}...`} />
              </SelectTrigger>
              <SelectContent>
                {onSearch && (
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search..."
                        className="h-8 pl-8"
                      />
                    </div>
                  </div>
                )}
                {isSearching ? (
                  <div className="p-4 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : (
                  (searchQuery ? searchResults : listOptions).map((opt) => {
                    const optWithDesc = opt as { value: string; label: string; description?: string };
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div>
                          <span>{opt.label}</span>
                          {optWithDesc.description && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {optWithDesc.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          ) : safeValue.mode === 'url' ? (
            <Input
              type="url"
              value={safeValue.value}
              onChange={(e) => onChange({ ...safeValue, value: e.target.value })}
              placeholder={placeholder || `Enter ${resourceType} URL...`}
              className={cn("h-9", error && "border-red-500")}
            />
          ) : (
            <Input
              value={safeValue.value}
              onChange={(e) => onChange({ ...safeValue, value: e.target.value })}
              placeholder={placeholder || `Enter ${resourceType} ID...`}
              className={cn("h-9 font-mono", error && "border-red-500")}
            />
          )}
        </div>
      </div>
      
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================
// RESOURCE MAPPER FIELD (n8n resourceMapper - field mapping)
// ============================================

export const ResourceMapperField: React.FC<ResourceMapperFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  sourceFields,
  targetFields,
  autoMap = true,
  className,
}) => {
  const safeValue = Array.isArray(value) ? value : [];

  // Auto-map matching field names
  const handleAutoMap = () => {
    const mapped: Array<{ source: string; target: string; type?: string }> = [];
    targetFields.forEach(target => {
      const matchingSource = sourceFields.find(
        s => s.value.toLowerCase() === target.value.toLowerCase() ||
             s.label.toLowerCase() === target.label.toLowerCase()
      );
      if (matchingSource) {
        mapped.push({
          source: matchingSource.value,
          target: target.value,
          type: target.type,
        });
      }
    });
    onChange(mapped);
  };

  const addMapping = () => {
    onChange([...safeValue, { source: '', target: '', type: 'string' }]);
  };

  const updateMapping = (index: number, updates: Partial<typeof safeValue[0]>) => {
    const updated = [...safeValue];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeMapping = (index: number) => {
    onChange(safeValue.filter((_, i) => i !== index));
  };

  // Get unmapped required fields
  const unmappedRequired = targetFields.filter(
    t => t.required && !safeValue.some(m => m.target === t.value)
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <FieldLabel label={label} required={required} helpText={helpText} />
        {autoMap && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleAutoMap}>
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Auto-map
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 p-2 bg-muted/50 text-xs font-medium border-b">
          <span>Source Field</span>
          <span></span>
          <span>Target Field</span>
          <span></span>
        </div>
        
        {/* Mappings */}
        <div className="divide-y">
          {safeValue.map((mapping, index) => (
            <div key={index} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 p-2 items-center">
              {/* Source */}
              <Select
                value={mapping.source}
                onValueChange={(v) => updateMapping(index, { source: v })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select source..." />
                </SelectTrigger>
                <SelectContent>
                  {sourceFields.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                      {f.type && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {f.type}
                        </Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Arrow */}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              
              {/* Target */}
              <Select
                value={mapping.target}
                onValueChange={(v) => {
                  const targetField = targetFields.find(t => t.value === v);
                  updateMapping(index, { target: v, type: targetField?.type });
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select target..." />
                </SelectTrigger>
                <SelectContent>
                  {targetFields.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                      {f.required && <span className="text-red-500 ml-1">*</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Remove */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeMapping(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {/* Add Mapping */}
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full" onClick={addMapping}>
            <Plus className="h-4 w-4 mr-2" />
            Add Mapping
          </Button>
        </div>
      </div>
      
      {/* Unmapped Required Warning */}
      {unmappedRequired.length > 0 && (
        <div className="flex items-start gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-medium text-amber-500">Missing required mappings:</span>
            <span className="text-muted-foreground ml-1">
              {unmappedRequired.map(f => f.label).join(', ')}
            </span>
          </div>
        </div>
      )}
      
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================
// HTML EDITOR FIELD
// ============================================

export const HTMLEditorField: React.FC<HTMLEditorFieldProps> = ({
  label,
  description,
  required,
  helpText,
  error,
  value,
  onChange,
  placeholder,
  showPreview = true,
  className,
}) => {
  const [showPreviewPane, setShowPreviewPane] = useState(false);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <FieldLabel label={label} required={required} helpText={helpText} />
        {showPreview && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setShowPreviewPane(!showPreviewPane)}
          >
            {showPreviewPane ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
            {showPreviewPane ? 'Hide' : 'Preview'}
          </Button>
        )}
      </div>
      
      <div className={cn("grid gap-2", showPreviewPane && "grid-cols-2")}>
        <Textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "<html>Enter HTML content...</html>"}
          rows={8}
          className={cn(
            "font-mono text-xs resize-none",
            error && "border-red-500"
          )}
        />
        
        {showPreviewPane && (
          <div className="border rounded-md p-3 bg-white overflow-auto max-h-[200px]">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400">Preview will appear here...</p>' }}
            />
          </div>
        )}
      </div>
      
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// ============================================
// CONDITIONAL FIELD WRAPPER (displayOptions implementation)
// ============================================

export const ConditionalField: React.FC<{
  displayOptions?: DisplayOptions;
  formValues: Record<string, any>;
  children: React.ReactNode;
}> = ({ displayOptions, formValues, children }) => {
  const shouldDisplay = shouldDisplayField(displayOptions, formValues);
  
  if (!shouldDisplay) return null;
  return <>{children}</>;
};

// ============================================
// FIELD RENDERER (Universal field renderer based on config)
// ============================================

export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'multiOptions' | 'dateTime' | 
        'color' | 'collection' | 'fixedCollection' | 'filter' | 'resourceLocator' |
        'resourceMapper' | 'html' | 'code' | 'expression' | 'password' | 'textarea' |
        'keyValue' | 'tags' | 'slider' | 'credential';
  displayName: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  default?: any;
  displayOptions?: DisplayOptions;
  // Type-specific options
  options?: Array<{ value: string; label: string; description?: string }>;
  typeOptions?: {
    rows?: number;
    minValue?: number;
    maxValue?: number;
    step?: number;
    password?: boolean;
    multipleValues?: boolean;
    includeTime?: boolean;
    presetColors?: string[];
    fields?: any[];
    [key: string]: any;
  };
}

export const renderField = (
  field: FieldDefinition,
  value: any,
  onChange: (value: any) => void,
  formValues: Record<string, any> = {}
): React.ReactNode => {
  // Check display conditions
  if (!shouldDisplayField(field.displayOptions, formValues)) {
    return null;
  }

  const baseProps = {
    label: field.displayName,
    description: field.description,
    required: field.required,
    placeholder: field.placeholder,
  };

  switch (field.type) {
    case 'string':
      if (field.typeOptions?.password) {
        return <PasswordField {...baseProps} value={value ?? ''} onChange={onChange} />;
      }
      if (field.typeOptions?.rows && field.typeOptions.rows > 1) {
        return <TextareaField {...baseProps} value={value ?? ''} onChange={onChange} rows={field.typeOptions.rows} />;
      }
      return <TextField {...baseProps} value={value ?? ''} onChange={onChange} />;
    
    case 'password':
      return <PasswordField {...baseProps} value={value ?? ''} onChange={onChange} />;
    
    case 'textarea':
      return <TextareaField {...baseProps} value={value ?? ''} onChange={onChange} rows={field.typeOptions?.rows || 3} />;
    
    case 'number':
      return (
        <NumberField
          {...baseProps}
          value={value ?? 0}
          onChange={onChange}
          min={field.typeOptions?.minValue}
          max={field.typeOptions?.maxValue}
          step={field.typeOptions?.step}
        />
      );
    
    case 'boolean':
      return <SwitchField {...baseProps} value={!!value} onChange={onChange} />;
    
    case 'options':
      return (
        <SelectField
          {...baseProps}
          value={value ?? ''}
          onChange={onChange}
          options={field.options || []}
        />
      );
    
    case 'multiOptions':
      return (
        <MultiOptionsField
          {...baseProps}
          value={value ?? []}
          onChange={onChange}
          options={field.options || []}
        />
      );
    
    case 'dateTime':
      return (
        <DateTimeField
          {...baseProps}
          value={value ?? ''}
          onChange={onChange}
          includeTime={field.typeOptions?.includeTime}
        />
      );
    
    case 'color':
      return (
        <ColorField
          {...baseProps}
          value={value ?? '#000000'}
          onChange={onChange}
          presetColors={field.typeOptions?.presetColors}
        />
      );
    
    case 'collection':
      return (
        <CollectionField
          {...baseProps}
          value={value ?? {}}
          onChange={onChange}
          options={field.typeOptions?.fields || []}
        />
      );
    
    case 'fixedCollection':
      return (
        <FixedCollectionField
          {...baseProps}
          value={value ?? []}
          onChange={onChange}
          fields={field.typeOptions?.fields || []}
          sortable={field.typeOptions?.sortable}
          maxItems={field.typeOptions?.maxItems}
        />
      );
    
    case 'filter':
      return (
        <FilterField
          {...baseProps}
          value={value ?? { conditions: [], combinator: 'and' }}
          onChange={onChange}
          fields={field.options || []}
        />
      );
    
    case 'resourceLocator':
      return (
        <ResourceLocatorField
          {...baseProps}
          value={value ?? { mode: 'id', value: '' }}
          onChange={onChange}
          modes={field.typeOptions?.modes || ['id']}
          listOptions={field.options}
          resourceType={field.typeOptions?.resourceType}
        />
      );
    
    case 'resourceMapper':
      return (
        <ResourceMapperField
          {...baseProps}
          value={value ?? []}
          onChange={onChange}
          sourceFields={field.typeOptions?.sourceFields || []}
          targetFields={field.typeOptions?.targetFields || []}
          autoMap={field.typeOptions?.autoMap}
        />
      );
    
    case 'html':
      return (
        <HTMLEditorField
          {...baseProps}
          value={value ?? ''}
          onChange={onChange}
          showPreview={field.typeOptions?.showPreview}
        />
      );
    
    case 'code':
      return (
        <CodeField
          {...baseProps}
          value={value ?? ''}
          onChange={onChange}
          language={field.typeOptions?.language || 'json'}
          rows={field.typeOptions?.rows || 6}
        />
      );
    
    case 'expression':
      return (
        <ExpressionField
          {...baseProps}
          value={value ?? ''}
          onChange={onChange}
          availableVariables={field.typeOptions?.variables}
        />
      );
    
    case 'keyValue':
      return (
        <KeyValueField
          {...baseProps}
          value={value ?? []}
          onChange={onChange}
          keyPlaceholder={field.typeOptions?.keyPlaceholder}
          valuePlaceholder={field.typeOptions?.valuePlaceholder}
        />
      );
    
    case 'tags':
      return (
        <TagsField
          {...baseProps}
          value={value ?? []}
          onChange={onChange}
          suggestions={field.typeOptions?.suggestions}
        />
      );
    
    case 'slider':
      return (
        <SliderField
          {...baseProps}
          value={value ?? field.typeOptions?.minValue ?? 0}
          onChange={onChange}
          min={field.typeOptions?.minValue ?? 0}
          max={field.typeOptions?.maxValue ?? 100}
          step={field.typeOptions?.step}
        />
      );
    
    case 'credential':
      return (
        <CredentialField
          {...baseProps}
          value={value ?? ''}
          onChange={onChange}
          credentialType={field.typeOptions?.credentialType || 'API Key'}
        />
      );
    
    default:
      return <TextField {...baseProps} value={value ?? ''} onChange={onChange} />;
  }
};

export default {
  // Basic Fields
  TextField,
  PasswordField,
  NumberField,
  TextareaField,
  SelectField,
  SwitchField,
  SliderField,
  KeyValueField,
  TagsField,
  CodeField,
  CredentialField,
  ExpressionField,
  CopyableField,
  
  // New n8n-style Fields
  MultiOptionsField,
  DateTimeField,
  ColorField,
  CollectionField,
  FixedCollectionField,
  FilterField,
  ResourceLocatorField,
  ResourceMapperField,
  HTMLEditorField,
  
  // Layout Components
  InfoBox,
  SectionHeader,
  FieldLabel,
  
  // Conditional Logic
  ConditionalField,
  shouldDisplayField,
  renderField,
};
