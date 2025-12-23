/**
 * Dynamic Field System - Core Types
 * 
 * Defines the schema format for AI-driven dynamic field generation.
 * This system supports 76+ apps with hundreds of actions without hardcoding.
 */

// ============================================
// FIELD TYPES
// ============================================

export type FieldType = 
  | 'text'           // Simple text input
  | 'textarea'       // Multi-line text
  | 'number'         // Numeric input
  | 'slider'         // Slider input (range)
  | 'select'         // Dropdown selection
  | 'multi-select'   // Multiple selection
  | 'boolean'        // Toggle/switch
  | 'secret'         // Password/API key (masked)
  | 'json'           // JSON editor
  | 'code'           // Code editor with syntax highlighting
  | 'expression'     // Dynamic expression with variable picker
  | 'file'           // File upload
  | 'date'           // Date picker
  | 'datetime'       // Date and time picker
  | 'time'           // Time picker
  | 'color'          // Color picker
  | 'url'            // URL input with validation
  | 'email'          // Email input with validation
  | 'phone'          // Phone number input
  | 'array'          // Array of values
  | 'object'         // Nested object fields
  | 'key-value'      // Key-value pairs
  | 'credential'     // Credential selector
  | 'resource'       // Resource selector (e.g., select a sheet, channel)
  | 'dynamic';       // AI-determined at runtime

// ============================================
// FIELD SCHEMA
// ============================================

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  group?: string;
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
  custom?: string | ((value: any, allValues: Record<string, any>) => string | null); // Custom validation
  customMessage?: string;
}

export interface FieldDependency {
  field: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'exists' | 'notExists' | 'in' | 'notIn';
  value?: any;
  values?: any[];
}

export interface DynamicOptionsConfig {
  type: 'api' | 'function' | 'dependent';
  endpoint?: string; // API endpoint to fetch options
  dependsOn?: string[]; // Fields this depends on
  cacheKey?: string; // Cache key for options
  cacheDuration?: number; // Cache duration in seconds
  transform?: string; // Expression to transform response
}

export interface FieldSchema {
  // Identity
  id: string;
  name: string;
  description?: string; // Made optional for simpler schema definitions
  
  // Type & Display
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  
  // Options (for select types)
  options?: FieldOption[];
  dynamicOptions?: DynamicOptionsConfig;
  allowCustom?: boolean; // Allow custom value not in options
  
  // Validation
  validation?: FieldValidation;
  
  // Conditional Display
  showWhen?: FieldDependency[];
  hideWhen?: FieldDependency[];
  
  // Nested Fields (for object/array types)
  fields?: FieldSchema[];
  itemSchema?: FieldSchema; // For array items
  
  // AI Features
  aiSuggestions?: boolean;
  aiAutoFill?: boolean;
  aiHelp?: string; // AI-generated help text
  
  // UI Hints
  group?: string;
  order?: number;
  width?: 'full' | 'half' | 'third' | 'quarter';
  rows?: number; // For textarea
  language?: string; // For code editor
  
  // Advanced
  sensitive?: boolean; // Don't log/expose value
  deprecated?: boolean;
  deprecationMessage?: string;
  beta?: boolean;
  
  // Documentation
  docsUrl?: string;
  examples?: Array<{ label: string; value: any }>;
}

// ============================================
// FIELD GROUP
// ============================================

export interface FieldGroup {
  id: string;
  name: string;
  description?: string;
  collapsed?: boolean;
  order?: number;
}

// ============================================
// ACTION SCHEMA
// ============================================

export interface ActionSchema {
  // Identity
  id: string;
  appId: string;
  name: string;
  description: string;
  
  // Categorization
  category: string;
  tags?: string[];
  
  // Fields
  fields: FieldSchema[];
  fieldGroups?: FieldGroup[];
  
  // Credentials
  requiresCredential?: boolean;
  credentialType?: string;
  credentialFields?: FieldSchema[];
  
  // Execution
  rateLimit?: {
    requests: number;
    period: 'second' | 'minute' | 'hour' | 'day';
  };
  timeout?: number;
  retryable?: boolean;
  
  // Output
  outputSchema?: Record<string, any>;
  outputExamples?: Array<{ name: string; data: any }>;
  
  // AI
  aiPrompt?: string; // Prompt for AI to understand this action
  
  // Version
  version?: string;
  deprecated?: boolean;
}

// ============================================
// APP SCHEMA
// ============================================

export interface AppCredentialSchema {
  id: string;
  name: string;
  type: 'apiKey' | 'oauth2' | 'basic' | 'bearer' | 'custom';
  fields: FieldSchema[];
  testEndpoint?: string;
  helpUrl?: string;
}

export interface AppSchema {
  // Identity
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  
  // Categorization
  category: string;
  tags?: string[];
  
  // Triggers (optional - some apps don't have triggers)
  triggers?: ActionSchema[];
  
  // Actions (optional - some apps don't have actions)
  actions?: ActionSchema[];
  
  // Credentials (optional - some apps don't require auth)
  credentials?: AppCredentialSchema[];
  
  // API Reference
  apiBaseUrl?: string;
  apiDocsUrl?: string;
  openApiSpec?: string;
  
  // Features
  supportsBatching?: boolean;
  supportsWebhooks?: boolean;
  supportsPolling?: boolean;
  
  // AI
  aiDescription?: string; // AI-generated understanding of this app
  
  // Version & Status
  version: string;
  status: 'stable' | 'beta' | 'deprecated';
}

// ============================================
// FIELD STATE
// ============================================

export interface FieldState {
  value: any;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FormState {
  fields: Record<string, FieldState>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: string[];
}

// ============================================
// AI GENERATION TYPES
// ============================================

export interface AIFieldSuggestion {
  fieldId: string;
  value: any; // The suggested value
  suggestedValue?: any; // Alias for value (deprecated)
  label?: string; // Display label for the suggestion
  confidence: number;
  reasoning: string;
}

export interface AIValidationResult {
  isValid: boolean;
  errors: Array<{
    fieldId: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestion?: string;
  }>;
  warnings?: string[];
  suggestions?: AIFieldSuggestion[];
}

export interface AIGenerationRequest {
  appId: string;
  actionId: string;
  context?: {
    previousNodes?: Array<{ type: string; output: any }>;
    userIntent?: string;
    existingValues?: Record<string, any>;
  };
}

export interface AIGenerationResponse {
  fields: Record<string, any>;
  explanation: string;
  confidence: number;
  warnings?: string[];
}

// ============================================
// REGISTRY TYPES
// ============================================

export interface SchemaRegistry {
  apps: Map<string, AppSchema>;
  
  // Core Methods
  getApp(appId: string): AppSchema | undefined;
  getAction(actionId: string): ActionSchema | undefined;
  
  // Search
  searchApps(query: string): AppSchema[];
  getAppsByCategory(category: string): AppSchema[];
}

// ============================================
// EXECUTION TYPES
// ============================================

export interface ExecutionContext {
  nodeId: string;
  workflowId: string;
  credentials: Record<string, any>;
  previousOutputs: Record<string, any>;
  variables: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
    retryable?: boolean;
  };
  duration: number;
  apiResponse?: {
    status: number;
    headers: Record<string, string>;
    body: any;
  };
}

// ============================================
// UI TYPES
// ============================================

export interface FieldRendererProps {
  schema: FieldSchema;
  value: any;
  onChange: (value: any) => void;
  state: FieldState;
  disabled?: boolean;
  context?: ExecutionContext;
}

export interface DynamicFormProps {
  schema: ActionSchema;
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onValidate?: (result: AIValidationResult) => void;
  disabled?: boolean;
  showAIFeatures?: boolean;
}
