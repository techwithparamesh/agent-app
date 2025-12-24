/**
 * Column Mapper Component
 * Dynamic field mapping based on actual Google Sheets columns
 * Matches n8n's field mapping interface with expression support
 */

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Code, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface ColumnMapping {
  column: string;
  expression: string;
}

interface ColumnMapperProps {
  credentialId?: string;
  spreadsheetId?: string;
  sheetName?: string;
  value?: ColumnMapping[];
  onChange: (mappings: ColumnMapping[]) => void;
  disabled?: boolean;
  operation?: 'append' | 'update' | 'read';
}

const commonExpressions = [
  { label: 'Email field', value: '{{$json.email}}', description: 'Previous step email' },
  { label: 'First name', value: '{{$json.firstName}}', description: 'Previous step first name' },
  { label: 'Last name', value: '{{$json.lastName}}', description: 'Previous step last name' },
  { label: 'Full name', value: '{{$json.firstName}} {{$json.lastName}}', description: 'Combined name' },
  { label: 'Phone number', value: '{{$json.phone}}', description: 'Previous step phone' },
  { label: 'Company', value: '{{$json.company}}', description: 'Previous step company' },
  { label: 'Current date', value: '{{$now}}', description: 'Current timestamp' },
  { label: 'Current date (formatted)', value: '{{$now.toFormat("yyyy-MM-dd")}}', description: 'Formatted date' },
  { label: 'Random ID', value: '{{$randomId}}', description: 'Generate random ID' },
];

export function ColumnMapper({
  credentialId,
  spreadsheetId,
  sheetName,
  value = [],
  onChange,
  disabled = false,
  operation = 'append',
}: ColumnMapperProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>(value);

  useEffect(() => {
    if (credentialId && spreadsheetId && sheetName) {
      loadHeaders();
    } else {
      setHeaders([]);
      setError(null);
    }
  }, [credentialId, spreadsheetId, sheetName]);

  useEffect(() => {
    // Initialize mappings when headers load
    if (headers.length > 0 && mappings.length === 0) {
      const defaultMappings = headers.map(header => ({
        column: header,
        expression: `{{$json.${header.toLowerCase().replace(/\s+/g, '_')}}}`,
      }));
      setMappings(defaultMappings);
      onChange(defaultMappings);
    }
  }, [headers]);

  async function loadHeaders() {
    if (!credentialId || !spreadsheetId || !sheetName) {
      setError('Please select spreadsheet and sheet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/integrations/google-sheets/${spreadsheetId}/sheets/${encodeURIComponent(sheetName)}/headers?credentialId=${credentialId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load column headers');
      }

      const data = await response.json();
      setHeaders(data.headers || []);
    } catch (err: any) {
      console.error('[ColumnMapper] Error loading headers:', err);
      setError(err.message || 'Failed to load column headers');
      setHeaders([]);
    } finally {
      setLoading(false);
    }
  }

  function handleMappingChange(index: number, field: 'column' | 'expression', newValue: string) {
    const updated = mappings.map((mapping, i) =>
      i === index ? { ...mapping, [field]: newValue } : mapping
    );
    setMappings(updated);
    onChange(updated);
  }

  function handleInsertExpression(index: number, expression: string) {
    const currentExpression = mappings[index]?.expression || '';
    const newExpression = currentExpression ? `${currentExpression} ${expression}` : expression;
    handleMappingChange(index, 'expression', newExpression);
  }

  function handleAddMapping() {
    const updated = [...mappings, { column: '', expression: '' }];
    setMappings(updated);
    onChange(updated);
  }

  function handleRemoveMapping(index: number) {
    const updated = mappings.filter((_, i) => i !== index);
    setMappings(updated);
    onChange(updated);
  }

  function handleRefresh() {
    loadHeaders();
  }

  const isDisabled = disabled || loading || !sheetName;

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Column Mapping</Label>
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading columns from sheet...</span>
        </div>
      </div>
    );
  }

  if (!sheetName) {
    return (
      <div className="space-y-2">
        <Label>Column Mapping</Label>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Select a spreadsheet and sheet to configure column mapping
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label>Column Mapping</Label>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Loading Columns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>
          Column Mapping
          <span className="text-destructive ml-1">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {headers.length} columns
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isDisabled}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
        <div className="flex items-start gap-2">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <p>
            Map each column to a value or expression. Use <code className="text-xs bg-background px-1 rounded">{'{{$json.field}}'}</code> to reference previous step data.
          </p>
        </div>
      </div>

      <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
        {mappings.length > 0 ? (
          mappings.map((mapping, index) => (
            <div key={index} className="flex items-start gap-2 group">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1/3">
                    <Label className="text-xs text-muted-foreground mb-1">Column</Label>
                    {operation === 'append' || operation === 'update' ? (
                      <div className="font-medium text-sm bg-background border rounded px-3 py-2">
                        {mapping.column || headers[index] || `Column ${index + 1}`}
                      </div>
                    ) : (
                      <Input
                        value={mapping.column}
                        onChange={(e) => handleMappingChange(index, 'column', e.target.value)}
                        placeholder="Column name"
                        disabled={isDisabled}
                        className="h-9"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1">Value / Expression</Label>
                    <div className="flex gap-1">
                      <Input
                        value={mapping.expression}
                        onChange={(e) => handleMappingChange(index, 'expression', e.target.value)}
                        placeholder="{{$json.fieldName}}"
                        disabled={isDisabled}
                        className="font-mono text-xs h-9"
                      />
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isDisabled}
                            className="h-9 px-2"
                          >
                            <Code className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Common Expressions</h4>
                            <div className="space-y-1">
                              {commonExpressions.map((expr, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleInsertExpression(index, expr.value)}
                                  className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors"
                                >
                                  <div className="font-medium">{expr.label}</div>
                                  <div className="text-muted-foreground font-mono">{expr.value}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
              
              {mappings.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMapping(index)}
                  disabled={isDisabled}
                  className="opacity-0 group-hover:opacity-100 transition-opacity mt-6 h-9 px-2"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No column mappings configured
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddMapping}
        disabled={isDisabled}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Column Mapping
      </Button>
    </div>
  );
}
