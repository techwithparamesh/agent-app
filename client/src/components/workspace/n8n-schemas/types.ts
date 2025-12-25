/**
 * n8n-Style Schema Types
 * 
 * These types mirror how n8n structures their app nodes:
 * App → Resource → Operation → Fields
 * 
 * Example: Slack → Message → Send → [channel, text, attachments, ...]
 */

// ============================================
// FIELD TYPES
// ============================================

export type FieldType = 
  // n8n core types
  | 'string'
  | 'text'
  | 'number'
  | 'boolean'
  | 'options'
  | 'multiOptions'
  | 'json'
  | 'dateTime'
  | 'color'
  | 'fixedCollection'
  | 'collection'
  | 'resourceLocator'
  | 'resourceMapper'
  // Extended types for compatibility with dynamic-fields
  | 'textarea'
  | 'slider'
  | 'select'
  | 'multi-select'
  | 'secret'
  | 'code'
  | 'expression'
  | 'file'
  | 'date'
  | 'datetime'
  | 'time'
  | 'url'
  | 'email'
  | 'phone'
  | 'array'
  | 'object'
  | 'key-value'
  | 'credential'
  | 'resource'
  | 'dynamic';

export interface FieldOption {
  name: string;
  value?: string | number | boolean;
  label?: string; // Alias for name in some contexts
  description?: string;
  action?: string; // For dynamic loading
  displayName?: string;
  values?: any[]; // For nested fixed collection items
  disabled?: boolean;
  group?: string;
  icon?: string;
  [key: string]: any; // allow additional properties
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number; // For slider/number inputs
  minItems?: number; // For array fields
  maxItems?: number; // For array fields
  pattern?: string;
  patternMessage?: string;
  custom?: string | ((value: any, allValues: Record<string, any>) => string | null);
  customMessage?: string;
}

// Condition types for showWhen/hideWhen
export interface FieldDependency {
  field: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'exists' | 'notExists' | 'in' | 'notIn' | 'empty' | 'notEmpty' | 'greaterThan' | 'lessThan';
  value?: any;
  values?: any[];
}

export interface DisplayCondition {
  field: string;
  equals?: any;
  notEquals?: any;
  contains?: string;
  in?: any[];
  notIn?: any[];
}

export interface N8nField {
  id: string;
  displayName: string;
  name: string; // API field name
  type: FieldType;
  default?: any;
  defaultValue?: any; // Alias for default (dynamic-fields compatibility)
  description?: string;
  placeholder?: string;
  hint?: string;
  
  // For options/multiOptions type
  options?: FieldOption[];
  allowCustom?: boolean; // Allow custom value not in options
  
  // For dynamic options (loaded from API)
  typeOptions?: {
    loadOptionsMethod?: string;
    loadOptionsDependsOn?: string[];
    minValue?: number;
    maxValue?: number;
    numberPrecision?: number;
    rows?: number; // for text type
    alwaysOpenEditWindow?: boolean; // for json type
    password?: boolean; // for password fields
    multipleValues?: boolean; // for array fields
    multipleValueButtonText?: string;
    [key: string]: any; // allow additional properties
  };
  
  // Validation
  required?: boolean;
  validation?: FieldValidation;
  
  // Conditional display (n8n style)
  displayOptions?: {
    show?: Record<string, any[]>;
    hide?: Record<string, any[]>;
  };
  
  // Conditional display (dynamic-fields style)
  showWhen?: FieldDependency[];
  hideWhen?: FieldDependency[];
  
  // Routing/expression support
  routing?: {
    send?: {
      type: string;
      property: string;
      value?: string;
    };
  };
  
  // For fixedCollection type
  fixedCollectionFields?: N8nField[];
  
  // For array/object types
  fields?: N8nField[]; // For nested object fields
  itemSchema?: N8nField; // For array item schema
  
  // For expression support
  noDataExpression?: boolean;
  
  // Extra metadata
  extractValue?: boolean;
  
  // AI Features (merged from dynamic-fields)
  aiSuggestions?: boolean;
  aiAutoFill?: boolean;
  aiHelp?: string;
  examples?: Array<{ label: string; value: any }>;
  
  // Additional dynamic-fields compatibility
  sensitive?: boolean;
  deprecated?: boolean;
  deprecationMessage?: string;
  beta?: boolean;
  docsUrl?: string;
  group?: string;
  order?: number;
  width?: 'full' | 'half' | 'third' | 'quarter';
  rows?: number;
  language?: string;
}

// ============================================
// OPERATION TYPES
// ============================================

export interface N8nOperation {
  id: string;
  name: string;
  value: string;
  description: string;
  action: string; // Display action like "Send a message"
  
  // Parent app reference (used in some contexts)
  appId?: string;
  
  // Category for grouping
  category?: string;
  
  // Fields specific to this operation
  fields: N8nField[];
  
  // Field groups for organization
  fieldGroups?: Array<{
    id: string;
    name: string;
    description?: string;
    collapsed?: boolean;
    order?: number;
  }>;
  
  // Optional fields (shown in "Options" section)
  optionalFields?: N8nField[];
  
  // Credential requirements
  requiresCredential?: boolean;
  credentialType?: string;
  
  // API endpoint info
  routing?: {
    request?: {
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      url: string;
      headers?: Record<string, string>;
      body?: Record<string, any>;
    };
  };
  
  // Execution info
  rateLimit?: {
    requests: number;
    period: 'second' | 'minute' | 'hour' | 'day';
  };
  timeout?: number;
  retryable?: boolean;
  
  // Output schema for documentation
  outputSchema?: Record<string, any>;
  outputExamples?: Array<{ name: string; data: any }>;
}

// ============================================
// RESOURCE TYPES
// ============================================

export interface N8nResource {
  id: string;
  name: string;
  value: string;
  description?: string;
  
  // Operations available for this resource
  operations: N8nOperation[];
}

// ============================================
// APP SCHEMA
// ============================================

export interface N8nCredentialField {
  id?: string;
  displayName?: string;
  name: string;
  type: string; // 'string' | 'password' | 'hidden' | 'number' | 'boolean' | 'json' | 'options'
  default?: any;
  required?: boolean;
  description?: string;
  placeholder?: string;
  options?: FieldOption[];
  typeOptions?: {
    password?: boolean;
    rows?: number;
    [key: string]: any;
  };
}

export interface N8nCredential {
  id?: string;
  name: string;
  displayName?: string;
  type: string; // 'oAuth2', 'apiKey', 'httpBasicAuth', etc.
  required?: boolean;
  fields?: N8nCredentialField[];
  properties?: N8nCredentialField[];
  testRequest?: {
    method: string;
    url: string;
  };
}

export interface N8nAppSchema {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  
  // App metadata
  version: string;
  subtitle?: string;
  
  // Categorization
  group: string[]; // e.g., ['transform', 'communication']
  
  // Documentation
  documentationUrl?: string;
  
  // Credentials
  credentials: N8nCredential[];
  
  // Resources (the main structure)
  resources: N8nResource[];
  
  // Default values
  defaults?: {
    name?: string;
  };
  
  // Webhook support
  webhooks?: {
    default?: {
      path: string;
      httpMethod: string;
    };
  };
}

// ============================================
// REGISTRY
// ============================================

export interface N8nSchemaRegistry {
  apps: Map<string, N8nAppSchema>;
  getApp: (appId: string) => N8nAppSchema | undefined;
  getResource: (appId: string, resourceId: string) => N8nResource | undefined;
  getOperation: (appId: string, resourceId: string, operationId: string) => N8nOperation | undefined;
  searchApps: (query: string) => N8nAppSchema[];
}

// ============================================
// FORM STATE
// ============================================

export interface N8nFormState {
  appId: string;
  resourceId: string;
  operationId: string;
  credentials: Record<string, any>;
  fields: Record<string, any>;
  options: Record<string, any>;
}

// ============================================
// HELPER TYPES
// ============================================

export type ResourceOperationPair = {
  resource: string;
  operation: string;
};

export interface OperationGroup {
  resource: N8nResource;
  operations: N8nOperation[];
}
