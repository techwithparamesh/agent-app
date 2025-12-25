/**
 * Resource/Operation Selector Component
 * 
 * n8n-style selector for Resource → Operation → Fields
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Info, Zap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  N8nAppSchema,
  N8nResource,
  N8nOperation,
  N8nField,
  n8nSchemaRegistry,
} from './n8n-schemas';

interface ResourceOperationSelectorProps {
  appId: string;
  selectedResource?: string;
  selectedOperation?: string;
  onResourceChange: (resourceId: string) => void;
  onOperationChange: (operationId: string) => void;
  className?: string;
}

export function ResourceOperationSelector({
  appId,
  selectedResource,
  selectedOperation,
  onResourceChange,
  onOperationChange,
  className,
}: ResourceOperationSelectorProps) {
  const app = n8nSchemaRegistry.getApp(appId);
  
  if (!app) {
    return (
      <div className="p-4 text-muted-foreground text-center">
        App schema not found for: {appId}
      </div>
    );
  }

  const currentResource = app.resources.find(
    r => r.id === selectedResource || r.value === selectedResource
  );

  const currentOperation = currentResource?.operations.find(
    o => o.id === selectedOperation || o.value === selectedOperation
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Resource Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Resource
        </Label>
        <Select
          value={selectedResource}
          onValueChange={(value) => {
            onResourceChange(value);
            // Auto-select first operation when resource changes
            const resource = app.resources.find(r => r.id === value || r.value === value);
            if (resource && resource.operations.length > 0) {
              onOperationChange(resource.operations[0].value);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a resource..." />
          </SelectTrigger>
          <SelectContent>
            {app.resources.map((resource) => (
              <SelectItem key={resource.id} value={resource.value}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{resource.name}</span>
                  {resource.description && (
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {resource.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Operation Selector */}
      {currentResource && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-3 h-3 text-yellow-500" />
            Operation
          </Label>
          <Select
            value={selectedOperation}
            onValueChange={onOperationChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an operation..." />
            </SelectTrigger>
            <SelectContent>
              {currentResource.operations.map((operation) => (
                <SelectItem key={operation.id} value={operation.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{operation.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {operation.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Operation Action Preview */}
      {currentOperation && (
        <div className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="text-xs">
              {currentResource?.name}
            </Badge>
            <ChevronDown className="w-3 h-3 text-muted-foreground rotate-[-90deg]" />
            <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/10">
              {currentOperation.name}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {currentOperation.action}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// N8N FIELD RENDERER
// ============================================

interface N8nFieldRendererProps {
  field: N8nField;
  value: any;
  onChange: (value: any) => void;
  allValues: Record<string, any>;
}

export function N8nFieldRenderer({
  field,
  value,
  onChange,
  allValues,
}: N8nFieldRendererProps) {
  // Check display conditions
  if (field.displayOptions) {
    const { show, hide } = field.displayOptions;
    
    if (show) {
      const shouldShow = Object.entries(show).every(([key, values]) => {
        return values.includes(allValues[key]);
      });
      if (!shouldShow) return null;
    }
    
    if (hide) {
      const shouldHide = Object.entries(hide).some(([key, values]) => {
        return values.includes(allValues[key]);
      });
      if (shouldHide) return null;
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-1">
          {field.displayName}
          {field.required && <span className="text-destructive">*</span>}
        </Label>
        {field.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">{field.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {renderFieldInput(field, value, onChange)}

      {field.hint && (
        <p className="text-xs text-muted-foreground">{field.hint}</p>
      )}
    </div>
  );
}

function renderFieldInput(
  field: N8nField,
  value: any,
  onChange: (value: any) => void
) {
  switch (field.type) {
    case 'string':
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full"
        />
      );

    case 'text':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.typeOptions?.rows || 3}
          className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md bg-background resize-y"
        />
      );

    case 'number':
      return (
        <Input
          type="number"
          value={value ?? field.default ?? ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={field.placeholder}
          min={field.typeOptions?.minValue}
          max={field.typeOptions?.maxValue}
          step={field.typeOptions?.numberPrecision ? Math.pow(10, -field.typeOptions.numberPrecision) : 1}
          className="w-full"
        />
      );

    case 'boolean':
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value ?? field.default ?? false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm text-muted-foreground">
            {value ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      );

    case 'options':
      return (
        <Select
          value={value ?? field.default ?? ''}
          onValueChange={onChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={field.placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={String(option.value)} value={String(option.value)}>
                <div className="flex flex-col">
                  <span>{option.name}</span>
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

    case 'multiOptions':
      const selectedValues = value || [];
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {selectedValues.map((val: string) => {
              const option = field.options?.find(o => o.value === val);
              return (
                <Badge
                  key={val}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => onChange(selectedValues.filter((v: string) => v !== val))}
                >
                  {option?.name || val} ×
                </Badge>
              );
            })}
          </div>
          <Select
            onValueChange={(newVal) => {
              if (!selectedValues.includes(newVal)) {
                onChange([...selectedValues, newVal]);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Add option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.filter(o => !selectedValues.includes(o.value)).map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'json':
      return (
        <textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              onChange(e.target.value);
            }
          }}
          placeholder={field.placeholder || '{}'}
          rows={field.typeOptions?.rows || 6}
          className="w-full min-h-[120px] px-3 py-2 text-sm font-mono border rounded-md bg-background resize-y"
        />
      );

    case 'dateTime':
      return (
        <Input
          type="datetime-local"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full"
        />
      );

    case 'color':
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      );

    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full"
        />
      );
  }
}

// ============================================
// OPERATION FIELDS PANEL
// ============================================

interface OperationFieldsPanelProps {
  appId: string;
  resourceId: string;
  operationId: string;
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
}

export function OperationFieldsPanel({
  appId,
  resourceId,
  operationId,
  values,
  onChange,
}: OperationFieldsPanelProps) {
  const operation = n8nSchemaRegistry.getOperation(appId, resourceId, operationId);
  const [showOptional, setShowOptional] = useState(false);

  if (!operation) {
    return (
      <div className="p-4 text-muted-foreground text-center">
        Operation not found
      </div>
    );
  }

  const requiredFields = operation.fields;
  const optionalFields = operation.optionalFields || [];

  return (
    <div className="space-y-6">
      {/* Required Fields */}
      {requiredFields.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            Required Fields
          </h4>
          {requiredFields.map((field) => (
            <N8nFieldRenderer
              key={field.id}
              field={field}
              value={values[field.name]}
              onChange={(val) => onChange(field.name, val)}
              allValues={values}
            />
          ))}
        </div>
      )}

      {/* Optional Fields */}
      {optionalFields.length > 0 && (
        <Collapsible open={showOptional} onOpenChange={setShowOptional}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                showOptional && 'rotate-180'
              )}
            />
            Options ({optionalFields.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {optionalFields.map((field) => (
              <N8nFieldRenderer
                key={field.id}
                field={field}
                value={values[field.name]}
                onChange={(val) => onChange(field.name, val)}
                allValues={values}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

// ============================================
// FULL N8N CONFIG PANEL
// ============================================

interface N8nConfigPanelProps {
  appId: string;
  initialValues?: {
    resource?: string;
    operation?: string;
    fields?: Record<string, any>;
  };
  onChange?: (config: {
    resource: string;
    operation: string;
    fields: Record<string, any>;
  }) => void;
  className?: string;
}

export function N8nConfigPanel({
  appId,
  initialValues,
  onChange,
  className,
}: N8nConfigPanelProps) {
  const app = n8nSchemaRegistry.getApp(appId);
  
  const [resource, setResource] = useState(
    initialValues?.resource || app?.resources[0]?.value || ''
  );
  const [operation, setOperation] = useState(
    initialValues?.operation || app?.resources[0]?.operations[0]?.value || ''
  );
  const [fields, setFields] = useState<Record<string, any>>(
    initialValues?.fields || {}
  );

  useEffect(() => {
    onChange?.({ resource, operation, fields });
  }, [resource, operation, fields, onChange]);

  if (!app) {
    return (
      <div className="p-4 text-muted-foreground text-center">
        App not found: {appId}
      </div>
    );
  }

  const handleFieldChange = (fieldName: string, value: any) => {
    setFields(prev => ({ ...prev, [fieldName]: value }));
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* App Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: app.color }}
        >
          {app.name[0]}
        </div>
        <div>
          <h3 className="font-semibold">{app.name}</h3>
          <p className="text-xs text-muted-foreground">{app.description}</p>
        </div>
      </div>

      {/* Resource/Operation Selector */}
      <ResourceOperationSelector
        appId={appId}
        selectedResource={resource}
        selectedOperation={operation}
        onResourceChange={(r) => {
          setResource(r);
          setFields({});
        }}
        onOperationChange={(o) => {
          setOperation(o);
          setFields({});
        }}
      />

      {/* Operation Fields */}
      {resource && operation && (
        <div className="pt-4 border-t">
          <OperationFieldsPanel
            appId={appId}
            resourceId={resource}
            operationId={operation}
            values={fields}
            onChange={handleFieldChange}
          />
        </div>
      )}
    </div>
  );
}

export default N8nConfigPanel;
