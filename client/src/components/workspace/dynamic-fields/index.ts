/**
 * Dynamic Fields - Index
 * 
 * This module now uses n8n-schemas as the single source of truth.
 * It provides compatibility wrappers and AI features on top of n8n schemas.
 */

// Re-export n8n schema registry as the primary source
import { 
  n8nSchemaRegistry, 
  getAllN8nApps,
  getN8nAppsByGroup,
} from '../n8n-schemas';

import type { 
  N8nAppSchema, 
  N8nResource, 
  N8nOperation,
  N8nField,
  N8nSchemaRegistry,
} from '../n8n-schemas/types';

// Re-export types for backward compatibility
export type { 
  N8nAppSchema as AppSchema,
  N8nOperation as ActionSchema,
  N8nField as FieldSchema,
  N8nSchemaRegistry as SchemaRegistry,
} from '../n8n-schemas/types';

// Re-export local types
export type { 
  FormState, 
  FieldState, 
  AIFieldSuggestion,
  AIValidationResult,
  AIGenerationRequest,
  AIGenerationResponse,
  ExecutionContext,
  ExecutionResult,
} from './types';

// ============================================
// SCHEMA REGISTRY (wraps n8n-schemas)
// ============================================

export const schemaRegistry = {
  apps: n8nSchemaRegistry.apps,
  
  getApp(appId: string): N8nAppSchema | undefined {
    return n8nSchemaRegistry.getApp(appId);
  },
  
  getAction(actionId: string): N8nOperation | undefined {
    // Search through all apps for an operation with this ID
    for (const app of getAllN8nApps()) {
      for (const resource of app.resources) {
        const operation = resource.operations.find(op => op.id === actionId);
        if (operation) return operation;
      }
    }
    return undefined;
  },
  
  searchApps(query: string): N8nAppSchema[] {
    return n8nSchemaRegistry.searchApps(query);
  },
  
  getAppsByCategory(category: string): N8nAppSchema[] {
    return getN8nAppsByGroup(category);
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all available apps
 */
export function getAllApps(): N8nAppSchema[] {
  return getAllN8nApps();
}

/**
 * Get all unique categories/groups
 */
export function getCategories(): string[] {
  const categories = new Set<string>();
  getAllN8nApps().forEach(app => {
    app.group.forEach(g => categories.add(g));
  });
  return Array.from(categories).sort();
}

/**
 * Get app by ID
 */
export function getAppById(appId: string): N8nAppSchema | undefined {
  return n8nSchemaRegistry.getApp(appId);
}

/**
 * Get action/operation by ID
 */
export function getActionById(actionId: string): N8nOperation | undefined {
  return schemaRegistry.getAction(actionId);
}

/**
 * Get operation for a specific app and resource
 */
export function getAppAction(appId: string, actionId: string): N8nOperation | undefined {
  const app = n8nSchemaRegistry.getApp(appId);
  if (!app) return undefined;
  
  for (const resource of app.resources) {
    const operation = resource.operations.find(op => op.id === actionId || op.value === actionId);
    if (operation) return operation;
  }
  return undefined;
}

/**
 * Get all operations for an app (flattened)
 */
export function getAppActions(appId: string): N8nOperation[] {
  const app = n8nSchemaRegistry.getApp(appId);
  if (!app) return [];
  
  const operations: N8nOperation[] = [];
  app.resources.forEach(resource => {
    operations.push(...resource.operations);
  });
  return operations;
}

/**
 * Get all resources for an app
 */
export function getAppResources(appId: string): N8nResource[] {
  const app = n8nSchemaRegistry.getApp(appId);
  if (!app) return [];
  return app.resources;
}

/**
 * Get operations for a specific resource
 */
export function getResourceOperations(appId: string, resourceId: string): N8nOperation[] {
  const resource = n8nSchemaRegistry.getResource(appId, resourceId);
  if (!resource) return [];
  return resource.operations;
}

/**
 * Get triggers for an app (operations that act as triggers)
 * In n8n-schema, triggers are typically resources/operations with webhook support
 */
export function getAppTriggers(appId: string): N8nOperation[] {
  const app = n8nSchemaRegistry.getApp(appId);
  if (!app) return [];
  
  const triggers: N8nOperation[] = [];
  app.resources.forEach(resource => {
    // Look for operations that seem like triggers
    resource.operations.forEach(op => {
      const isTrigger = 
        op.name.toLowerCase().includes('trigger') ||
        op.name.toLowerCase().includes('receive') ||
        op.name.toLowerCase().includes('webhook') ||
        op.name.toLowerCase().includes('listen') ||
        op.value.toLowerCase().includes('trigger');
      if (isTrigger) {
        triggers.push(op);
      }
    });
  });
  return triggers;
}

/**
 * Get operations grouped by resource
 */
export function getAppActionsGrouped(appId: string): Record<string, N8nOperation[]> {
  const app = n8nSchemaRegistry.getApp(appId);
  if (!app) return {};
  
  const grouped: Record<string, N8nOperation[]> = {};
  app.resources.forEach(resource => {
    grouped[resource.name] = resource.operations;
  });
  return grouped;
}

/**
 * Map legacy app IDs to n8n schema IDs
 */
const appIdAliases: Record<string, string> = {
  'openai': 'openai',
  'chatgpt': 'openai',
  'gpt': 'openai',
  'claude': 'anthropic',
  'google-ai': 'google-ai',
  'gemini': 'google-ai',
  'whatsapp-business': 'whatsapp',
  'gmail-api': 'gmail',
  'google-sheets': 'google-sheets',
  'google-calendar': 'google-calendar',
  'google-drive': 'google-drive',
  'http': 'rest-api',
  'rest-api': 'rest-api',
  'api-call': 'rest-api',
  'webhook-trigger': 'webhooks',
  'webhooks': 'webhooks',
  'postgres': 'postgresql',
  'mysql': 'mysql',
  'sql': 'postgresql',
  'microsoft-teams': 'microsoft-teams',
  'teams': 'microsoft-teams',
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
export function getAppByIdOrAlias(appIdOrAlias: string): N8nAppSchema | undefined {
  const resolvedId = resolveAppId(appIdOrAlias);
  return n8nSchemaRegistry.getApp(resolvedId);
}

// Category icons for UI display
export const categoryIcons: Record<string, string> = {
  'AI': '🤖',
  'ai': '🤖',
  'Communication': '💬',
  'communication': '💬',
  'messaging': '💬',
  'Email': '📧',
  'email': '📧',
  'Productivity': '📊',
  'productivity': '📊',
  'Storage': '📁',
  'storage': '📁',
  'database': '🗄️',
  'Developer': '⚙️',
  'developer': '⚙️',
  'transform': '🔄',
  'CRM': '👥',
  'crm': '👥',
  'E-commerce': '🛒',
  'ecommerce': '🛒',
  'Marketing': '📣',
  'marketing': '📣',
  'Support': '🎧',
  'support': '🎧',
  'social': '📱',
};

/**
 * Get icon for a category
 */
export function getCategoryIcon(category: string): string {
  return categoryIcons[category] || categoryIcons[category.toLowerCase()] || '📦';
}

// Export n8n registry for direct access
export { n8nSchemaRegistry, getAllN8nApps, getN8nAppsByGroup };
