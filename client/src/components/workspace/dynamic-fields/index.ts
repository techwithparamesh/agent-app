/**
 * App Schema Registry - Index
 * 
 * Central registry for all app schemas
 */

import type { AppSchema, ActionSchema, SchemaRegistry } from './types';

// Import all schema collections
import { aiAppSchemas } from './schemas/ai-apps';
import { communicationAppSchemas } from './schemas/communication-apps';
import { productivityAppSchemas } from './schemas/productivity-apps';
import { developerAppSchemas } from './schemas/developer-apps';
import { businessAppSchemas } from './schemas/business-apps';

// Combine all schemas into a single array
const allSchemas: AppSchema[] = [
  ...aiAppSchemas,
  ...communicationAppSchemas,
  ...productivityAppSchemas,
  ...developerAppSchemas,
  ...businessAppSchemas,
];

// Build the apps map
const appsMap = new Map<string, AppSchema>();
allSchemas.forEach(schema => {
  appsMap.set(schema.id, schema);
});

// Build actions map for quick lookup
const actionsMap = new Map<string, ActionSchema>();
allSchemas.forEach(app => {
  app.actions?.forEach(action => {
    actionsMap.set(action.id, action);
  });
  app.triggers?.forEach(trigger => {
    actionsMap.set(trigger.id, trigger);
  });
});

// Schema Registry Implementation
export const schemaRegistry: SchemaRegistry = {
  apps: appsMap,
  
  getApp(appId: string): AppSchema | undefined {
    return appsMap.get(appId);
  },
  
  getAction(actionId: string): ActionSchema | undefined {
    return actionsMap.get(actionId);
  },
  
  searchApps(query: string): AppSchema[] {
    const lowerQuery = query.toLowerCase();
    return allSchemas.filter(app => 
      app.name.toLowerCase().includes(lowerQuery) ||
      app.description.toLowerCase().includes(lowerQuery) ||
      app.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      app.category.toLowerCase().includes(lowerQuery)
    );
  },
  
  getAppsByCategory(category: string): AppSchema[] {
    return allSchemas.filter(app => app.category === category);
  },
};

// Helper functions for common operations

/**
 * Get all available apps
 */
export function getAllApps(): AppSchema[] {
  return allSchemas;
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  const categories = new Set<string>();
  allSchemas.forEach(app => categories.add(app.category));
  return Array.from(categories).sort();
}

/**
 * Get app by ID
 */
export function getAppById(appId: string): AppSchema | undefined {
  return appsMap.get(appId);
}

/**
 * Get action by ID
 */
export function getActionById(actionId: string): ActionSchema | undefined {
  return actionsMap.get(actionId);
}

/**
 * Get action for a specific app
 */
export function getAppAction(appId: string, actionId: string): ActionSchema | undefined {
  const app = appsMap.get(appId);
  if (!app) return undefined;
  
  return app.actions?.find(a => a.id === actionId) || 
         app.triggers?.find(t => t.id === actionId);
}

/**
 * Get all actions for an app
 */
export function getAppActions(appId: string): ActionSchema[] {
  const app = appsMap.get(appId);
  if (!app) return [];
  return [...(app.triggers || []), ...(app.actions || [])];
}

/**
 * Get all triggers for an app
 */
export function getAppTriggers(appId: string): ActionSchema[] {
  const app = appsMap.get(appId);
  if (!app) return [];
  return app.triggers || [];
}

/**
 * Get actions grouped by category for an app
 */
export function getAppActionsGrouped(appId: string): Record<string, ActionSchema[]> {
  const actions = getAppActions(appId);
  const grouped: Record<string, ActionSchema[]> = {};
  
  actions.forEach(action => {
    const category = action.category || 'General';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(action);
  });
  
  return grouped;
}

/**
 * Map legacy app IDs to new schema IDs
 */
const appIdAliases: Record<string, string> = {
  'openai': 'openai',
  'chatgpt': 'openai',
  'gpt': 'openai',
  'claude': 'anthropic',
  'google-ai': 'google_ai',
  'gemini': 'google_ai',
  'whatsapp-business': 'whatsapp',
  'gmail-api': 'gmail',
  'google-sheets': 'google_sheets',
  'google-calendar': 'google_calendar',
  'google-drive': 'google_drive',
  'http': 'http_request',
  'rest-api': 'http_request',
  'api-call': 'http_request',
  'webhook-trigger': 'webhook',
  'cron': 'scheduler',
  'schedule': 'scheduler',
  'if-condition': 'flow_control',
  'switch-case': 'flow_control',
  'condition': 'flow_control',
  'postgres': 'database',
  'mysql': 'database',
  'sql': 'database',
};

/**
 * Resolve an app ID (handles aliases)
 */
export function resolveAppId(appIdOrAlias: string): string {
  return appIdAliases[appIdOrAlias.toLowerCase()] || appIdOrAlias;
}

/**
 * Get app by ID or alias
 */
export function getAppByIdOrAlias(appIdOrAlias: string): AppSchema | undefined {
  const resolvedId = resolveAppId(appIdOrAlias);
  return appsMap.get(resolvedId);
}

// Category icons for UI display
export const categoryIcons: Record<string, string> = {
  'AI': '🤖',
  'Communication': '💬',
  'Email': '📧',
  'Productivity': '📊',
  'Storage': '📁',
  'Developer': '⚙️',
  'CRM': '👥',
  'E-commerce': '🛒',
  'Marketing': '📣',
  'Support': '🎧',
};

/**
 * Get icon for a category
 */
export function getCategoryIcon(category: string): string {
  return categoryIcons[category] || '📦';
}

// Export schemas for direct access if needed
export {
  aiAppSchemas,
  communicationAppSchemas,
  productivityAppSchemas,
  developerAppSchemas,
  businessAppSchemas,
};

// Export types
export type { AppSchema, ActionSchema } from './types';
