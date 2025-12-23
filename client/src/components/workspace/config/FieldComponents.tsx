/**
 * Reusable Field Components for Node Configuration
 * 
 * These components provide consistent UI for all configuration fields
 * across triggers, actions, and logic nodes.
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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
  AlertCircle,
  CheckCircle,
  Loader2,
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

export default {
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
  InfoBox,
  SectionHeader,
  CopyableField,
};
