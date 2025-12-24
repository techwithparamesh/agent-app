/**
 * Sheet Picker Component
 * Loads actual sheets within a selected spreadsheet
 * Cascading resource selection pattern (Spreadsheet → Sheet)
 */

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Sheet {
  id: number;
  title: string;
  index: number;
}

interface SheetPickerProps {
  credentialId?: string;
  spreadsheetId?: string;
  value?: string;
  onChange: (sheetName: string) => void;
  disabled?: boolean;
}

export function SheetPicker({
  credentialId,
  spreadsheetId,
  value,
  onChange,
  disabled = false,
}: SheetPickerProps) {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (credentialId && spreadsheetId) {
      loadSheets();
    } else {
      // Reset when dependencies not available
      setSheets([]);
      setError(null);
    }
  }, [credentialId, spreadsheetId]);

  async function loadSheets() {
    if (!credentialId || !spreadsheetId) {
      setError('Please select a spreadsheet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/integrations/google-sheets/${spreadsheetId}/sheets?credentialId=${credentialId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load sheets');
      }

      const data = await response.json();
      setSheets(data.sheets || []);
    } catch (err: any) {
      console.error('[SheetPicker] Error loading sheets:', err);
      setError(err.message || 'Failed to load sheets');
      setSheets([]);
    } finally {
      setLoading(false);
    }
  }

  function handleRefresh() {
    loadSheets();
  }

  const isDisabled = disabled || loading || !spreadsheetId || !credentialId;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="sheet-select">
          Sheet
          <span className="text-destructive ml-1">*</span>
        </Label>
        {sheets.length > 0 && (
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
        )}
      </div>

      <Select
        value={value}
        onValueChange={onChange}
        disabled={isDisabled}
      >
        <SelectTrigger id="sheet-select">
          <SelectValue>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading sheets...</span>
              </div>
            ) : !spreadsheetId ? (
              <span className="text-muted-foreground">Select a spreadsheet first</span>
            ) : sheets.length === 0 && !error ? (
              <span className="text-muted-foreground">No sheets found</span>
            ) : value ? (
              value
            ) : (
              <span className="text-muted-foreground">Select a sheet</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sheets.length > 0 ? (
            sheets.map((sheet) => (
              <SelectItem key={sheet.id} value={sheet.title}>
                {sheet.title}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="__no_items__" disabled>
              No sheets available
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {value && (
        <p className="text-xs text-muted-foreground">
          Sheet: <span className="font-medium">{value}</span>
        </p>
      )}
    </div>
  );
}
