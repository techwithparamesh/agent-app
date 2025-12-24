/**
 * Google Sheets Node Configuration - Placeholder
 * TODO: Implement full n8n-style configuration with resource loading
 */

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface GoogleSheetsConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

const GoogleSheetsConfig: React.FC<GoogleSheetsConfigProps> = ({ config, updateConfig }) => {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Google Sheets configuration is under development. Advanced features coming soon.
        </AlertDescription>
      </Alert>
      
      <div className="p-4 bg-muted/50 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          Configure Google Sheets integration settings here
        </p>
      </div>
    </div>
  );
};

export default GoogleSheetsConfig;
