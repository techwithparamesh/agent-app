/**
 * Integration Types
 * Shared type definitions for the integrations module
 */

// Integration configuration types
export interface IntegrationConfig {
  apiKey?: string;
  webhookUrl?: string;
  accessToken?: string;
  secretKey?: string;
  endpoint?: string;
  credentials?: Record<string, string>;
  [key: string]: string | Record<string, string> | undefined;
}

export interface IntegrationTrigger {
  event: string;
  conditions?: TriggerCondition[];
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_equals';
  value: string | number | boolean;
}

export interface Integration {
  id: string;
  userId: string;
  agentId: string | null;
  type: string;
  name: string;
  description: string | null;
  config: IntegrationConfig;
  triggers: IntegrationTrigger[];
  isActive: boolean;
  lastTriggeredAt: string | null;
  lastError: string | null;
  errorCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  triggerEvent: string;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  status: 'success' | 'error' | 'pending';
  errorMessage: string | null;
  executionTimeMs: number;
  createdAt: string;
}

// Catalog types
export interface CatalogIntegration {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  popular?: boolean;
  isCustom?: boolean;
  fields: string[];
  categoryLabel?: string;
  categoryColor?: string;
}

export interface IntegrationCategory {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  integrations: CatalogIntegration[];
}

// Automation types
export interface AutomationStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  appId?: string;
  actionId?: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
  connections: string[];
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  steps: AutomationStep[];
  isActive: boolean;
  lastRunAt?: string;
  runCount: number;
  errorCount: number;
  createdAt: string;
  updatedAt?: string;
}

// Form field types
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'textarea' | 'number' | 'boolean';
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string | number | boolean;
}

// Action types for integrations
export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  templates?: Array<{ id: string; name: string; variables: string[] }>;
}

// Create integration payload
export interface CreateIntegrationPayload {
  type: string;
  name: string;
  description?: string;
  agentId?: string;
  config: IntegrationConfig;
  triggers: IntegrationTrigger[];
}

// Update integration payload
export interface UpdateIntegrationPayload {
  name?: string;
  description?: string;
  config?: IntegrationConfig;
  triggers?: IntegrationTrigger[];
  isActive?: boolean;
}

// Test result
export interface IntegrationTestResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
}
