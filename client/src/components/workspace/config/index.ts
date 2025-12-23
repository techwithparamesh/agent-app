/**
 * Node Configuration Index
 * 
 * Central export point for all node configuration components.
 * Maps node types to their respective configuration UIs.
 */

import React from "react";

// Import all configuration modules
import { TriggerConfigs } from "./TriggerConfigs";
import { AdditionalTriggerConfigs } from "./TriggerConfigsMore";
import { ActionConfigs } from "./ActionConfigs";
import { AdditionalActionConfigs } from "./ActionConfigsMore";
import { LogicConfigs } from "./LogicConfigs";

// Re-export field components for use elsewhere
export * from "./FieldComponents";

// ============================================
// TYPES
// ============================================

interface NodeConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

type ConfigComponent = React.FC<NodeConfigProps>;

// ============================================
// COMBINED CONFIG MAPS
// ============================================

/**
 * All trigger configurations merged
 */
export const AllTriggerConfigs: Record<string, ConfigComponent> = {
  ...TriggerConfigs,
  ...AdditionalTriggerConfigs,
};

/**
 * All action configurations merged
 */
export const AllActionConfigs: Record<string, ConfigComponent> = {
  ...ActionConfigs,
  ...AdditionalActionConfigs,
};

/**
 * All logic node configurations
 */
export const AllLogicConfigs: Record<string, ConfigComponent> = {
  ...LogicConfigs,
};

/**
 * Master config map - all node types
 */
export const AllNodeConfigs: Record<string, ConfigComponent> = {
  // Triggers
  ...AllTriggerConfigs,
  
  // Actions
  ...AllActionConfigs,
  
  // Logic
  ...AllLogicConfigs,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the configuration component for a node type
 */
export function getNodeConfig(nodeType: string): ConfigComponent | null {
  // Direct match
  if (AllNodeConfigs[nodeType]) {
    return AllNodeConfigs[nodeType];
  }
  
  // Try lowercase
  const lowercaseType = nodeType.toLowerCase();
  if (AllNodeConfigs[lowercaseType]) {
    return AllNodeConfigs[lowercaseType];
  }
  
  // Try with underscores converted to hyphens and vice versa
  const withUnderscores = nodeType.replace(/-/g, '_').toLowerCase();
  if (AllNodeConfigs[withUnderscores]) {
    return AllNodeConfigs[withUnderscores];
  }
  
  const withHyphens = nodeType.replace(/_/g, '-').toLowerCase();
  if (AllNodeConfigs[withHyphens]) {
    return AllNodeConfigs[withHyphens];
  }
  
  // Try partial matches for common patterns
  const partialMatches = [
    ['whatsapp', 'whatsapp_message'],
    ['telegram', 'telegram_message'],
    ['slack', 'slack_message'],
    ['discord', 'discord_message'],
    ['gmail', 'gmail_received'],
    ['email', 'gmail_received'],
    ['stripe', 'stripe_payment'],
    ['hubspot', 'hubspot_contact'],
    ['sheets', 'google_sheet_row'],
    ['calendar', 'google_calendar'],
    ['openai', 'openai_chat'],
    ['gpt', 'openai_chat'],
    ['claude', 'anthropic_chat'],
    ['anthropic', 'anthropic_chat'],
    ['gemini', 'google_gemini'],
    ['http', 'http_request'],
    ['api', 'http_request'],
    ['code', 'code'],
    ['javascript', 'code'],
    ['function', 'code'],
    ['database', 'database_query'],
    ['sql', 'database_query'],
    ['postgres', 'database_query'],
    ['mysql', 'database_query'],
    ['mongo', 'database_query'],
  ];
  
  for (const [pattern, configKey] of partialMatches) {
    if (lowercaseType.includes(pattern) && AllNodeConfigs[configKey]) {
      return AllNodeConfigs[configKey];
    }
  }
  
  return null;
}

/**
 * Check if a node type has a configuration component
 */
export function hasNodeConfig(nodeType: string): boolean {
  return getNodeConfig(nodeType) !== null;
}

/**
 * Get the category of a node type
 */
export function getNodeCategory(nodeType: string): 'trigger' | 'action' | 'logic' | 'unknown' {
  const type = nodeType.toLowerCase();
  
  if (AllTriggerConfigs[type] || Object.keys(AllTriggerConfigs).some(k => type.includes(k.split('_')[0]))) {
    return 'trigger';
  }
  
  if (AllLogicConfigs[type]) {
    return 'logic';
  }
  
  if (AllActionConfigs[type]) {
    return 'action';
  }
  
  // Check for logic keywords
  const logicKeywords = ['condition', 'if', 'switch', 'loop', 'delay', 'wait', 'filter', 'merge', 'split', 'set', 'transform', 'error'];
  if (logicKeywords.some(kw => type.includes(kw))) {
    return 'logic';
  }
  
  // Check for trigger keywords
  const triggerKeywords = ['trigger', 'webhook', 'schedule', 'received', 'event', 'new_'];
  if (triggerKeywords.some(kw => type.includes(kw))) {
    return 'trigger';
  }
  
  return 'action'; // Default to action
}

/**
 * List all available node types by category
 */
export function listNodeTypes() {
  return {
    triggers: Object.keys(AllTriggerConfigs),
    actions: Object.keys(AllActionConfigs),
    logic: Object.keys(AllLogicConfigs),
  };
}

// ============================================
// DEFAULT EXPORTS
// ============================================

export {
  TriggerConfigs,
  AdditionalTriggerConfigs,
  ActionConfigs,
  AdditionalActionConfigs,
  LogicConfigs,
};

export default AllNodeConfigs;
