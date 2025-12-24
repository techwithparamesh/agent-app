/**
 * Google Sheets Node Configuration
 * N8N-style resource-driven configuration with dynamic field loading
 */

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Info, FileSpreadsheet } from "lucide-react";
import { SpreadsheetPicker } from "./SpreadsheetPicker";
import { SheetPicker } from "./SheetPicker";
import { ColumnMapper } from "./ColumnMapper";
import { TestExecutionPanel } from "./TestExecutionPanel";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GoogleSheetsConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

const GoogleSheetsConfig: React.FC<GoogleSheetsConfigProps> = ({ config, updateConfig }) => {
  // Local state for UI management
  const [spreadsheetId, setSpreadsheetId] = useState(config.spreadsheetId || "");
  const [spreadsheetName, setSpreadsheetName] = useState(config.spreadsheetName || "");
  const [sheetName, setSheetName] = useState(config.sheetName || "");
  const [operation, setOperation] = useState<'append' | 'update' | 'read' | 'clear'>(config.operation || 'append');
  const [columnMappings, setColumnMappings] = useState(config.columnMappings || []);
  
  // Sync local state with config
  useEffect(() => {
    setSpreadsheetId(config.spreadsheetId || "");
    setSpreadsheetName(config.spreadsheetName || "");
    setSheetName(config.sheetName || "");
    setOperation(config.operation || 'append');
    setColumnMappings(config.columnMappings || []);
  }, [config]);
  
  // Credential status (will be replaced with actual OAuth status)
  const isConnected = config.isConnected || false;
  const credentialId = isConnected ? "temp-credential-id" : undefined;
  
  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Alert>
        <FileSpreadsheet className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Connect to Google Sheets to read/write data from your spreadsheets
        </AlertDescription>
      </Alert>
      
      {/* Resource Selection Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium">Resource Selection</h4>
        </div>
        
        {/* Spreadsheet Picker */}
        <SpreadsheetPicker
          credentialId={credentialId}
          value={spreadsheetId}
          onChange={(id, name) => {
            setSpreadsheetId(id);
            setSpreadsheetName(name);
            updateConfig('spreadsheetId', id);
            updateConfig('spreadsheetName', name);
            
            // Reset dependent fields
            setSheetName("");
            updateConfig('sheetName', "");
            setColumnMappings([]);
            updateConfig('columnMappings', []);
          }}
          disabled={!isConnected}
        />
        
        {/* Sheet Picker */}
        <SheetPicker
          credentialId={credentialId}
          spreadsheetId={spreadsheetId}
          value={sheetName}
          onChange={(name) => {
            setSheetName(name);
            updateConfig('sheetName', name);
            
            // Reset column mappings when sheet changes
            setColumnMappings([]);
            updateConfig('columnMappings', []);
          }}
          disabled={!isConnected}
        />
      </div>
      
      {/* Operation Selection */}
      {sheetName && (
        <>
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Operation</h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="operation-select">
                What do you want to do?
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Select
                value={operation}
                onValueChange={(value: any) => {
                  setOperation(value);
                  updateConfig('operation', value);
                  
                  // Reset column mappings when operation changes
                  if (value !== 'append' && value !== 'update') {
                    setColumnMappings([]);
                    updateConfig('columnMappings', []);
                  }
                }}
                disabled={!isConnected || !sheetName}
              >
                <SelectTrigger id="operation-select">
                  <SelectValue placeholder="Select an operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="append">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Append Row</span>
                      <span className="text-xs text-muted-foreground">Add new row to the end of the sheet</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="update">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Update Row</span>
                      <span className="text-xs text-muted-foreground">Update existing row by matching criteria</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="read">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Read Rows</span>
                      <span className="text-xs text-muted-foreground">Fetch rows from the sheet</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="clear">
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Clear Sheet</span>
                      <span className="text-xs text-muted-foreground">Remove all data from the sheet</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
      
      {/* Column Mapping for append/update operations */}
      {sheetName && (operation === 'append' || operation === 'update') && (
        <>
          <Separator />
          
          <ColumnMapper
            credentialId={credentialId}
            spreadsheetId={spreadsheetId}
            sheetName={sheetName}
            value={columnMappings}
            onChange={(mappings) => {
              setColumnMappings(mappings);
              updateConfig('columnMappings', mappings);
            }}
            operation={operation}
            disabled={!isConnected}
          />
        </>
      )}
      
      {/* Test Execution */}
      {sheetName && operation && (
        <>
          <Separator />
          
          <TestExecutionPanel
            config={{
              credentialId,
              spreadsheetId,
              sheetName,
              operation,
              columnMappings,
            }}
            disabled={!isConnected}
          />
        </>
      )}
    </div>
  );
};

export default GoogleSheetsConfig;
