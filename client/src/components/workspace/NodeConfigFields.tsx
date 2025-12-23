/**
 * Node Configuration Fields - v3
 * 
 * Schema-driven dynamic configuration UI for all node types.
 * Uses the dynamic-fields system as primary, with fallback to legacy configs.
 */

import React, { useState, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import dynamic field system (PRIMARY)
import { DynamicFieldRenderer } from "./dynamic-fields/DynamicFieldRenderer";
import { 
  getAppById, 
  getAppAction, 
  schemaRegistry,
} from "./dynamic-fields";
import type { ActionSchema, AppSchema } from "./dynamic-fields/types";
import { useFieldValidation } from "./dynamic-fields/ValidationSystem";
import { useAIFields } from "./dynamic-fields/AIFieldService";

// Import legacy configurations as fallback
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
  
  // DEBUG: Log what we're looking for
  console.log('[resolveConfigComponent] Looking for:', { nodeType, triggerId, actionId, appId });
  console.log('[resolveConfigComponent] Available config keys:', Object.keys(allConfigs).slice(0, 20));

  // 1. Try direct ID match
  if (triggerId && allConfigs[triggerId]) {
    console.log('[resolveConfigComponent] Found by triggerId:', triggerId);
    return allConfigs[triggerId];
  }
  
  if (actionId && allConfigs[actionId]) {
    console.log('[resolveConfigComponent] Found by actionId:', actionId);
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
  
  console.log('[resolveConfigComponent] Trying IDs:', idsToTry);
  
  for (const id of idsToTry) {
    if (allConfigs[id]) {
      console.log('[resolveConfigComponent] Found by ID:', id);
      return allConfigs[id];
    }
    // Also try lowercase
    const lowerId = id.toLowerCase();
    if (allConfigs[lowerId]) {
      console.log('[resolveConfigComponent] Found by lowercase ID:', lowerId);
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
// MAIN EXPORT - N8N-STYLE CONFIGS FIRST
// ============================================

export const NodeConfigFields: React.FC<ConfigFieldsProps> = ({
  triggerId,
  actionId,
  nodeType,
  appId,
  config,
  updateConfig,
}) => {
  // State for AI features
  const [aiErrors, setAiErrors] = useState<Record<string, string>>({});
  
  // Try to get dynamic schema (for fallback)
  const appSchema = useMemo(() => getAppById(appId), [appId]);
  const actionSchema = useMemo(() => {
    const actionOrTrigger = actionId || triggerId;
    if (!actionOrTrigger) return null;
    return getAppAction(appId, actionOrTrigger);
  }, [appId, actionId, triggerId]);
  
  // Validation hook for dynamic fields
  const { errors, validateField, clearErrors } = useFieldValidation(
    actionSchema || { id: '', appId: '', name: '', description: '', category: '', fields: [] },
    config,
    { validateOnChange: true }
  );
  
  // AI field features hook
  const { fillField, getSuggestions, isLoading: isAILoading } = useAIFields();
  
  // Handle AI fill for a field
  const handleAIFill = useCallback(async (fieldId: string) => {
    if (!actionSchema) return;
    
    const field = actionSchema.fields?.find(f => f.id === fieldId);
    if (!field) return;
    
    try {
      const result = await fillField({
        appId,
        actionId: actionId || triggerId || '',
        fieldId,
        currentValues: config,
        fieldSchema: field,
        actionSchema,
      });
      
      if (result.confidence > 0.3) {
        updateConfig(fieldId, result.value);
      }
    } catch (error) {
      console.error('AI fill failed:', error);
      setAiErrors(prev => ({ ...prev, [fieldId]: 'AI fill failed' }));
    }
  }, [appId, actionId, triggerId, config, actionSchema, fillField, updateConfig]);
  
  // Handle AI suggestions
  const handleAISuggest = useCallback(async (fieldId: string) => {
    if (!actionSchema) return;
    const field = actionSchema.fields?.find(f => f.id === fieldId);
    if (!field) return;
    
    try {
      const result = await getSuggestions({
        appId,
        actionId: actionId || triggerId || '',
        fieldId,
        currentValues: config,
        fieldSchema: field,
        actionSchema,
      });
      console.log('Suggestions:', result);
    } catch (error) {
      console.error('AI suggestions failed:', error);
    }
  }, [appId, actionId, triggerId, config, actionSchema, getSuggestions]);
  
  // PRIORITY 1: Try n8n-style rich config component FIRST
  const ConfigComponent = resolveConfigComponent(
    nodeType,
    triggerId,
    actionId,
    appId
  );
  
  if (ConfigComponent) {
    return <ConfigComponent config={config} updateConfig={updateConfig} />;
  }
  
  // PRIORITY 2: Use dynamic schema if available (fallback)
  if (actionSchema && actionSchema.fields && actionSchema.fields.length > 0) {
    return (
      <div className="space-y-4">
        {/* Schema-driven header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <span>Dynamic configuration powered by schema</span>
        </div>
        
        {/* Render dynamic fields */}
        <DynamicFieldRenderer
          schema={actionSchema}
          values={config}
          onChange={updateConfig}
          onAIFill={handleAIFill}
          onAISuggest={handleAISuggest}
          errors={{ ...errors, ...aiErrors }}
          disabled={false}
        />
      </div>
    );
  }
  
  // PRIORITY 3: Fallback to default configuration
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
