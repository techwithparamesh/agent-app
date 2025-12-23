/**
 * Node Configuration Fields - v2
 * 
 * Comprehensive configuration UI for all node types.
 * Uses modular config components from ./config/ directory.
 */

import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";

// Import all configurations from the centralized config directory
import {
  AllNodeConfigs,
  AllTriggerConfigs,
  AllActionConfigs,
  AllLogicConfigs,
  getNodeConfig,
  getNodeCategory,
  hasNodeConfig,
} from "./config";

// ============================================
// TYPES
// ============================================

interface ConfigFieldsProps {
  triggerId?: string;
  actionId?: string;
  nodeType: string;
  appId: string;
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// DEFAULT CONFIG (Fallback)
// ============================================

const DefaultConfig: React.FC<{
  nodeType: string;
  nodeId?: string;
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}> = ({ nodeType, nodeId, config, updateConfig }) => (
  <div className="space-y-4">
    <div className="p-4 bg-muted/50 rounded-lg text-center">
      <Settings className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
      <p className="text-sm font-medium">Configure Node</p>
      <p className="text-xs text-muted-foreground">
        {nodeId ? `Configure "${nodeId}" settings` : `Configure this ${nodeType}`}
      </p>
    </div>

    <div className="space-y-2">
      <Label className="text-xs font-medium">Custom Configuration (JSON)</Label>
      <Textarea
        value={typeof config.custom === 'string' ? config.custom : JSON.stringify(config.custom || {}, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            updateConfig('custom', parsed);
          } catch {
            updateConfig('custom', e.target.value);
          }
        }}
        placeholder='{"key": "value"}'
        rows={8}
        className="font-mono text-xs resize-none"
      />
      <p className="text-xs text-muted-foreground">
        Enter configuration as JSON. Changes are saved automatically.
      </p>
    </div>
  </div>
);

// ============================================
// NODE TYPE RESOLVER
// ============================================

/**
 * Resolves the best configuration component for a given node
 */
function resolveConfigComponent(
  nodeType: string,
  triggerId?: string,
  actionId?: string,
  appId?: string
): React.FC<{ config: Record<string, any>; updateConfig: (key: string, value: any) => void }> | null {
  // Priority order for resolution:
  // 1. Direct triggerId/actionId match
  // 2. AppId-based match
  // 3. NodeType match
  // 4. Pattern matching
  
  const allConfigs = AllNodeConfigs;

  // 1. Try direct ID match
  if (triggerId && allConfigs[triggerId]) {
    return allConfigs[triggerId];
  }
  
  if (actionId && allConfigs[actionId]) {
    return allConfigs[actionId];
  }
  
  // 2. Try common variations
  const idsToTry = [
    triggerId,
    actionId,
    appId,
    `${appId}_message`,
    `${appId}_received`,
    `${appId}_event`,
    `send_${appId}`,
    `${appId}_send`,
    `${appId}_action`,
    nodeType,
    nodeType.toLowerCase(),
    nodeType.replace(/-/g, '_'),
    nodeType.replace(/_/g, '-'),
  ].filter(Boolean) as string[];
  
  for (const id of idsToTry) {
    if (allConfigs[id]) {
      return allConfigs[id];
    }
    // Also try lowercase
    const lowerId = id.toLowerCase();
    if (allConfigs[lowerId]) {
      return allConfigs[lowerId];
    }
  }
  
  // 3. Try partial matches for common integrations
  const partialMatches: Record<string, string> = {
    // Messaging
    whatsapp: 'whatsapp_message',
    telegram: 'telegram_message', 
    slack: 'slack_message',
    discord: 'discord_message',
    teams: 'teams_message',
    sms: 'sms_received',
    twilio: 'twilio_sms',
    
    // Email
    gmail: 'gmail_received',
    outlook: 'outlook_received',
    email: 'send_email',
    mail: 'send_email',
    
    // CRM
    hubspot: 'hubspot_contact',
    salesforce: 'hubspot_contact', // Similar config
    pipedrive: 'hubspot_contact',
    
    // E-commerce
    stripe: 'stripe_payment',
    razorpay: 'razorpay_payment',
    shopify: 'shopify_order',
    woocommerce: 'woocommerce_order',
    
    // Storage
    sheets: 'google_sheet_row',
    airtable: 'airtable_record',
    notion: 'notion_page',
    firebase: 'firebase_document',
    
    // Developer
    github: 'github_event',
    gitlab: 'github_event',
    webhook: 'webhook',
    
    // Support
    zendesk: 'zendesk_ticket',
    freshdesk: 'freshdesk_ticket',
    intercom: 'intercom_conversation',
    
    // Calendar
    calendly: 'calendly_event',
    calendar: 'google_calendar',
    
    // Video
    zoom: 'zoom_meeting',
    
    // AI
    openai: 'openai_chat',
    gpt: 'openai_chat',
    claude: 'anthropic_chat',
    anthropic: 'anthropic_chat',
    gemini: 'google_gemini',
    google_ai: 'google_gemini',
    
    // Utility
    http: 'http_request',
    api: 'http_request',
    request: 'http_request',
    code: 'code',
    javascript: 'code',
    python: 'code',
    function: 'code',
    script: 'code',
    database: 'database_query',
    sql: 'database_query',
    postgres: 'database_query',
    mysql: 'database_query',
    mongodb: 'database_query',
    
    // Logic
    condition: 'condition',
    if: 'condition',
    switch: 'switch',
    router: 'switch',
    loop: 'loop',
    foreach: 'loop',
    delay: 'delay',
    wait: 'delay',
    filter: 'filter',
    merge: 'merge',
    split: 'split',
    set: 'set',
    transform: 'set',
    error: 'error_handler',
  };
  
  // Check all ids for partial matches
  for (const id of idsToTry) {
    const lowerId = id.toLowerCase();
    for (const [pattern, configKey] of Object.entries(partialMatches)) {
      if (lowerId.includes(pattern) && allConfigs[configKey]) {
        return allConfigs[configKey];
      }
    }
  }
  
  return null;
}

// ============================================
// MAIN EXPORT
// ============================================

export const NodeConfigFields: React.FC<ConfigFieldsProps> = ({
  triggerId,
  actionId,
  nodeType,
  appId,
  config,
  updateConfig,
}) => {
  // Try to resolve the best configuration component
  const ConfigComponent = resolveConfigComponent(
    nodeType,
    triggerId,
    actionId,
    appId
  );
  
  // If we found a matching config component, render it
  if (ConfigComponent) {
    return <ConfigComponent config={config} updateConfig={updateConfig} />;
  }
  
  // Fallback to default configuration
  return (
    <DefaultConfig 
      nodeType={nodeType} 
      nodeId={triggerId || actionId || appId}
      config={config} 
      updateConfig={updateConfig} 
    />
  );
};

// ============================================
// ADDITIONAL EXPORTS
// ============================================

// Export for external use
export { 
  resolveConfigComponent,
  AllNodeConfigs,
  AllTriggerConfigs,
  AllActionConfigs,
  AllLogicConfigs,
  getNodeConfig,
  getNodeCategory,
  hasNodeConfig,
};

export default NodeConfigFields;
