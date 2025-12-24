/**
 * Test Execution Panel
 * Executes test run with current configuration and displays results
 * Matches n8n's test step functionality
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Play,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Code,
  Copy,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestConfig {
  credentialId?: string;
  spreadsheetId?: string;
  sheetName?: string;
  operation?: string;
  values?: any[];
  rowNumber?: number;
  range?: string;
  columnMappings?: Array<{ column: string; expression: string }>;
}

interface TestExecutionPanelProps {
  config: TestConfig;
  disabled?: boolean;
}

export function TestExecutionPanel({
  config,
  disabled = false,
}: TestExecutionPanelProps) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [outputOpen, setOutputOpen] = useState(true);
  const { toast } = useToast();

  async function handleTest() {
    if (!config.credentialId || !config.spreadsheetId || !config.sheetName) {
      toast({
        title: 'Configuration Incomplete',
        description: 'Please complete the setup before testing',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    setError(null);
    setResult(null);

    try {
      // Prepare test values based on column mappings
      const testValues = config.columnMappings?.map(mapping => {
        // Evaluate simple expressions (in production, use proper expression parser)
        if (mapping.expression.includes('{{$now}}')) {
          return new Date().toISOString();
        } else if (mapping.expression.includes('{{$randomId}}')) {
          return `test-${Math.random().toString(36).substr(2, 9)}`;
        } else if (mapping.expression.match(/{{.*?}}/)) {
          // Return mock value for expressions
          return `[Test: ${mapping.column}]`;
        } else {
          return mapping.expression;
        }
      }) || [];

      const response = await fetch('/api/integrations/google-sheets/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentialId: config.credentialId,
          spreadsheetId: config.spreadsheetId,
          sheetName: config.sheetName,
          operation: config.operation || 'append',
          values: testValues,
          rowNumber: config.rowNumber,
          range: config.range,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
        setOutputOpen(true);
        toast({
          title: 'Test Successful',
          description: 'Your configuration is working correctly',
        });
      } else {
        throw new Error(data.message || 'Test failed');
      }
    } catch (err: any) {
      console.error('[TestExecutionPanel] Error:', err);
      setError(err.message || 'Test execution failed');
      setOutputOpen(true);
      toast({
        title: 'Test Failed',
        description: err.message || 'Test execution failed',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Output copied to clipboard',
    });
  }

  const canTest =
    !disabled &&
    config.credentialId &&
    config.spreadsheetId &&
    config.sheetName &&
    config.operation;

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Test Execution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Run a test to verify your configuration
          </p>
        </div>
        <Button
          onClick={handleTest}
          disabled={!canTest || testing}
          size="sm"
          className="gap-2"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Test Step
            </>
          )}
        </Button>
      </div>

      {!canTest && !testing && !result && !error && (
        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Ready to test?</p>
              <p>Complete the following to enable testing:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                {!config.credentialId && <li>Connect Google account</li>}
                {!config.spreadsheetId && <li>Select a spreadsheet</li>}
                {!config.sheetName && <li>Select a sheet</li>}
                {!config.operation && <li>Choose an operation</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {(result || error) && (
        <Collapsible open={outputOpen} onOpenChange={setOutputOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between font-normal p-2"
            >
              <div className="flex items-center gap-2">
                {result ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Test Successful</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm">Test Failed</span>
                  </>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  outputOpen ? 'transform rotate-180' : ''
                }`}
              />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            {result && (
              <div className="mt-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-green-900 dark:text-green-100">
                        Execution Successful
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                        {result.operation === 'append' && `Appended 1 row to ${result.sheetName}`}
                        {result.operation === 'update' && `Updated ${result.updatedRows} row(s)`}
                        {result.operation === 'read' && `Read ${result.totalRows} row(s)`}
                        {result.operation === 'clear' && `Cleared range ${result.clearedRange}`}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                    className="h-7 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                <div className="bg-background/50 rounded border border-green-200 dark:border-green-800 p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Code className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Output</span>
                  </div>
                  <pre className="text-xs text-green-900 dark:text-green-100 overflow-auto max-h-60 font-mono">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>

                {result.updatedRange && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-700 dark:text-green-300">
                    <ExternalLink className="h-3 w-3" />
                    <span>Range: {result.updatedRange}</span>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                      Test Failed
                    </div>
                    <div className="text-xs text-red-800 dark:text-red-200 bg-background/50 rounded border border-red-200 dark:border-red-800 p-2 font-mono">
                      {error}
                    </div>
                    
                    <div className="mt-2 text-xs text-red-700 dark:text-red-300">
                      <p className="font-medium mb-1">Troubleshooting tips:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Verify your Google account connection</li>
                        <li>Check spreadsheet and sheet names are correct</li>
                        <li>Ensure you have edit permissions</li>
                        <li>Try reconnecting your account</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
