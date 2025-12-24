/**
 * NodeSchemas - Production-ready JSON Schema definitions for all node types
 * 
 * This file defines the canonical schema for:
 * - Triggers (webhook, schedule, poll, manual, app-event)
 * - Actions (app actions)
 * - AI Nodes (agent, memory, tool)
 * - Logic Nodes (condition, router, loop)
 * 
 * UI forms are dynamically rendered from these schemas.
 * Runtime execution uses the same schemas for validation.
 */

// ============================================================================
// JSON Schema Type Definitions
// ============================================================================

export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
  title?: string;
  description?: string;
  default?: any;
  enum?: any[];
  enumLabels?: string[]; // Custom: Human-readable labels for enum values
  format?: 'email' | 'uri' | 'date' | 'datetime' | 'password' | 'textarea' | 'json' | 'expression';
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  items?: JSONSchemaProperty; // For arrays
  properties?: Record<string, JSONSchemaProperty>; // For objects
  required?: string[];
  
  // Custom extensions for UI rendering
  'x-ui-widget'?: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'toggle' | 'slider' | 'code' | 'expression' | 'credential' | 'model-selector' | 'field-mapper';
  'x-ui-group'?: string; // Group related fields
  'x-ui-order'?: number; // Display order
  'x-ui-hidden'?: boolean; // Hide from UI but still validate
  'x-ui-placeholder'?: string;
  'x-ui-help'?: string;
  'x-depends-on'?: { field: string; value: any | any[] }; // Conditional visibility
  'x-expression-context'?: string[]; // Available variables for expression fields
}

export interface NodeSchema {
  $id: string;
  $schema: 'https://json-schema.org/draft/2020-12/schema';
  type: 'object';
  title: string;
  description: string;
  category: 'trigger' | 'action' | 'ai' | 'logic' | 'transform' | 'integration';
  icon: string;
  color: string;
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
  
  // Custom extensions
  'x-node-type': string;
  'x-version': string;
  'x-output-schema'?: Record<string, JSONSchemaProperty>; // What this node outputs
  'x-credential-types'?: string[]; // Required credential types
  'x-docs-url'?: string;
  'x-examples'?: Array<{ name: string; config: Record<string, any> }>;
}

// ============================================================================
// TRIGGER SCHEMAS
// ============================================================================

export const webhookTriggerSchema: NodeSchema = {
  $id: 'trigger/webhook',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: 'Webhook Trigger',
  description: 'Receive data via HTTP webhook in real-time',
  category: 'trigger',
  icon: '🔗',
  color: '#3B82F6',
  'x-node-type': 'trigger',
  'x-version': '1.0.0',
  'x-docs-url': '/docs/triggers/webhook',
  
  properties: {
    method: {
      type: 'string',
      title: 'HTTP Method',
      description: 'HTTP methods to accept',
      enum: ['POST', 'GET', 'PUT', 'DELETE', 'PATCH', 'ALL'],
      default: 'POST',
      'x-ui-widget': 'select',
      'x-ui-order': 1,
    },
    path: {
      type: 'string',
      title: 'Webhook Path',
      description: 'Custom path suffix for the webhook URL',
      pattern: '^[a-zA-Z0-9-_/]*$',
      'x-ui-widget': 'text',
      'x-ui-placeholder': 'my-webhook',
      'x-ui-help': 'Leave empty for auto-generated path',
      'x-ui-order': 2,
    },
    authentication: {
      type: 'string',
      title: 'Authentication',
      description: 'How to authenticate incoming requests',
      enum: ['none', 'header', 'query', 'basic', 'hmac'],
      enumLabels: ['None', 'Header Token', 'Query Parameter', 'Basic Auth', 'HMAC Signature'],
      default: 'none',
      'x-ui-widget': 'select',
      'x-ui-order': 3,
    },
    authHeaderName: {
      type: 'string',
      title: 'Header Name',
      default: 'X-Webhook-Token',
      'x-ui-widget': 'text',
      'x-depends-on': { field: 'authentication', value: 'header' },
      'x-ui-order': 4,
    },
    authToken: {
      type: 'string',
      title: 'Secret Token',
      format: 'password',
      'x-ui-widget': 'text',
      'x-ui-help': 'Token to validate incoming requests',
      'x-depends-on': { field: 'authentication', value: ['header', 'query', 'hmac'] },
      'x-ui-order': 5,
    },
    responseMode: {
      type: 'string',
      title: 'Response Mode',
      description: 'When to send response to caller',
      enum: ['immediate', 'last-node', 'custom'],
      enumLabels: ['Immediate (200 OK)', 'After Last Node', 'Custom Response Node'],
      default: 'immediate',
      'x-ui-widget': 'select',
      'x-ui-order': 6,
    },
    responseCode: {
      type: 'integer',
      title: 'Response Code',
      default: 200,
      minimum: 100,
      maximum: 599,
      'x-ui-widget': 'number',
      'x-depends-on': { field: 'responseMode', value: 'immediate' },
      'x-ui-order': 7,
    },
    responseBody: {
      type: 'string',
      title: 'Response Body',
      format: 'json',
      'x-ui-widget': 'code',
      'x-ui-placeholder': '{"success": true}',
      'x-depends-on': { field: 'responseMode', value: 'immediate' },
      'x-ui-order': 8,
    },
  },
  required: [],
  
  'x-output-schema': {
    headers: { type: 'object', description: 'Request headers' },
    query: { type: 'object', description: 'Query parameters' },
    body: { type: 'object', description: 'Request body' },
    params: { type: 'object', description: 'URL parameters' },
    method: { type: 'string', description: 'HTTP method used' },
  },
  
  'x-examples': [
    {
      name: 'Simple POST Webhook',
      config: { method: 'POST', authentication: 'none', responseMode: 'immediate' },
    },
    {
      name: 'Authenticated Webhook',
      config: { method: 'POST', authentication: 'header', authHeaderName: 'X-API-Key', responseMode: 'immediate' },
    },
  ],
};

export const scheduleTriggerSchema: NodeSchema = {
  $id: 'trigger/schedule',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: 'Schedule Trigger',
  description: 'Run workflow on a schedule (cron or interval)',
  category: 'trigger',
  icon: '📅',
  color: '#10B981',
  'x-node-type': 'trigger',
  'x-version': '1.0.0',
  
  properties: {
    mode: {
      type: 'string',
      title: 'Schedule Mode',
      enum: ['interval', 'cron', 'preset'],
      enumLabels: ['Fixed Interval', 'Cron Expression', 'Common Presets'],
      default: 'preset',
      'x-ui-widget': 'select',
      'x-ui-order': 1,
    },
    preset: {
      type: 'string',
      title: 'Schedule Preset',
      enum: [
        'every_minute',
        'every_5_minutes',
        'every_15_minutes',
        'every_30_minutes',
        'every_hour',
        'every_day_9am',
        'every_weekday_9am',
        'every_monday_9am',
        'first_of_month',
      ],
      enumLabels: [
        'Every Minute',
        'Every 5 Minutes',
        'Every 15 Minutes',
        'Every 30 Minutes',
        'Every Hour',
        'Every Day at 9 AM',
        'Weekdays at 9 AM',
        'Every Monday at 9 AM',
        'First of Month at 9 AM',
      ],
      default: 'every_day_9am',
      'x-ui-widget': 'select',
      'x-depends-on': { field: 'mode', value: 'preset' },
      'x-ui-order': 2,
    },
    intervalValue: {
      type: 'integer',
      title: 'Interval Value',
      minimum: 1,
      maximum: 1440,
      default: 5,
      'x-ui-widget': 'number',
      'x-depends-on': { field: 'mode', value: 'interval' },
      'x-ui-order': 3,
    },
    intervalUnit: {
      type: 'string',
      title: 'Interval Unit',
      enum: ['minutes', 'hours', 'days'],
      default: 'minutes',
      'x-ui-widget': 'select',
      'x-depends-on': { field: 'mode', value: 'interval' },
      'x-ui-order': 4,
    },
    cronExpression: {
      type: 'string',
      title: 'Cron Expression',
      pattern: '^[\\d\\*\\-\\/\\,\\s]+$',
      default: '0 9 * * *',
      'x-ui-widget': 'text',
      'x-ui-placeholder': '0 9 * * * (every day at 9 AM)',
      'x-ui-help': 'Format: minute hour day month weekday',
      'x-depends-on': { field: 'mode', value: 'cron' },
      'x-ui-order': 5,
    },
    timezone: {
      type: 'string',
      title: 'Timezone',
      default: 'UTC',
      'x-ui-widget': 'select',
      'x-ui-order': 6,
      enum: ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney'],
    },
  },
  required: ['mode'],
  
  'x-output-schema': {
    timestamp: { type: 'string', format: 'datetime', description: 'Execution timestamp' },
    executionId: { type: 'string', description: 'Unique execution ID' },
    scheduledTime: { type: 'string', format: 'datetime', description: 'Scheduled time' },
  },
};

export const manualTriggerSchema: NodeSchema = {
  $id: 'trigger/manual',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: 'Manual Trigger',
  description: 'Start workflow manually with optional input data',
  category: 'trigger',
  icon: '👆',
  color: '#F59E0B',
  'x-node-type': 'trigger',
  'x-version': '1.0.0',
  
  properties: {
    inputMode: {
      type: 'string',
      title: 'Input Mode',
      enum: ['none', 'json', 'form'],
      enumLabels: ['No Input', 'JSON Data', 'Form Fields'],
      default: 'none',
      'x-ui-widget': 'select',
      'x-ui-order': 1,
    },
    inputSchema: {
      type: 'string',
      title: 'Input Schema (JSON)',
      format: 'json',
      'x-ui-widget': 'code',
      'x-ui-placeholder': '{\n  "name": { "type": "string" },\n  "email": { "type": "string", "format": "email" }\n}',
      'x-ui-help': 'Define the expected input structure',
      'x-depends-on': { field: 'inputMode', value: ['json', 'form'] },
      'x-ui-order': 2,
    },
    description: {
      type: 'string',
      title: 'Run Instructions',
      format: 'textarea',
      'x-ui-widget': 'textarea',
      'x-ui-placeholder': 'Instructions shown when running manually...',
      'x-ui-order': 3,
    },
  },
  required: [],
  
  'x-output-schema': {
    input: { type: 'object', description: 'User-provided input data' },
    triggeredBy: { type: 'string', description: 'User who triggered the workflow' },
    timestamp: { type: 'string', format: 'datetime' },
  },
};

export const pollTriggerSchema: NodeSchema = {
  $id: 'trigger/poll',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: 'Polling Trigger',
  description: 'Check for new data at regular intervals',
  category: 'trigger',
  icon: '🔄',
  color: '#8B5CF6',
  'x-node-type': 'trigger',
  'x-version': '1.0.0',
  
  properties: {
    interval: {
      type: 'integer',
      title: 'Check Interval',
      description: 'How often to check for new data',
      minimum: 1,
      maximum: 60,
      default: 5,
      'x-ui-widget': 'slider',
      'x-ui-help': 'Interval in minutes',
      'x-ui-order': 1,
    },
    deduplication: {
      type: 'string',
      title: 'Deduplication',
      description: 'How to detect new items',
      enum: ['id', 'hash', 'timestamp', 'none'],
      enumLabels: ['By ID Field', 'By Content Hash', 'By Timestamp', 'No Deduplication'],
      default: 'id',
      'x-ui-widget': 'select',
      'x-ui-order': 2,
    },
    idField: {
      type: 'string',
      title: 'ID Field',
      default: 'id',
      'x-ui-widget': 'text',
      'x-ui-placeholder': 'id',
      'x-depends-on': { field: 'deduplication', value: 'id' },
      'x-ui-order': 3,
    },
    timestampField: {
      type: 'string',
      title: 'Timestamp Field',
      default: 'created_at',
      'x-ui-widget': 'text',
      'x-depends-on': { field: 'deduplication', value: 'timestamp' },
      'x-ui-order': 4,
    },
    maxItems: {
      type: 'integer',
      title: 'Max Items per Poll',
      minimum: 1,
      maximum: 100,
      default: 10,
      'x-ui-widget': 'number',
      'x-ui-order': 5,
    },
  },
  required: ['interval'],
};

// ============================================================================
// AI NODE SCHEMAS
// ============================================================================

export const agentNodeSchema: NodeSchema = {
  $id: 'ai/agent',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: 'AI Agent',
  description: 'Intelligent agent with reasoning and tool-calling capabilities',
  category: 'ai',
  icon: '🤖',
  color: '#8B5CF6',
  'x-node-type': 'ai-agent',
  'x-version': '1.0.0',
  'x-docs-url': '/docs/ai/agent',
  
  properties: {
    // Basic Configuration
    name: {
      type: 'string',
      title: 'Agent Name',
      description: 'A descriptive name for this agent',
      maxLength: 100,
      'x-ui-widget': 'text',
      'x-ui-placeholder': 'Customer Support Agent',
      'x-ui-group': 'basic',
      'x-ui-order': 1,
    },
    systemPrompt: {
      type: 'string',
      title: 'System Prompt',
      description: 'Instructions that define the agent\'s behavior and personality',
      format: 'textarea',
      'x-ui-widget': 'textarea',
      'x-ui-placeholder': 'You are a helpful customer support assistant...',
      'x-ui-group': 'basic',
      'x-ui-order': 2,
    },
    
    // Model Configuration
    provider: {
      type: 'string',
      title: 'AI Provider',
      enum: ['openai', 'anthropic', 'google', 'mistral', 'groq', 'together', 'custom'],
      enumLabels: ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Groq', 'Together AI', 'Custom'],
      default: 'openai',
      'x-ui-widget': 'select',
      'x-ui-group': 'model',
      'x-ui-order': 3,
    },
    model: {
      type: 'string',
      title: 'Model',
      'x-ui-widget': 'model-selector',
      'x-ui-group': 'model',
      'x-ui-order': 4,
    },
    temperature: {
      type: 'number',
      title: 'Temperature',
      description: 'Controls randomness (0 = focused, 2 = creative)',
      minimum: 0,
      maximum: 2,
      default: 0.7,
      'x-ui-widget': 'slider',
      'x-ui-group': 'model',
      'x-ui-order': 5,
    },
    maxTokens: {
      type: 'integer',
      title: 'Max Output Tokens',
      minimum: 1,
      maximum: 128000,
      default: 2048,
      'x-ui-widget': 'number',
      'x-ui-group': 'model',
      'x-ui-order': 6,
    },
    
    // Response Configuration
    responseStyle: {
      type: 'string',
      title: 'Response Style',
      enum: ['conversational', 'concise', 'detailed', 'structured'],
      enumLabels: ['Conversational', 'Concise', 'Detailed', 'Structured JSON'],
      default: 'conversational',
      'x-ui-widget': 'select',
      'x-ui-group': 'response',
      'x-ui-order': 7,
    },
    outputFormat: {
      type: 'string',
      title: 'Output Format',
      enum: ['text', 'json', 'markdown'],
      default: 'text',
      'x-ui-widget': 'select',
      'x-ui-group': 'response',
      'x-ui-order': 8,
    },
    jsonSchema: {
      type: 'string',
      title: 'JSON Schema',
      description: 'Schema for structured output',
      format: 'json',
      'x-ui-widget': 'code',
      'x-depends-on': { field: 'outputFormat', value: 'json' },
      'x-ui-group': 'response',
      'x-ui-order': 9,
    },
    
    // Tool Configuration
    enableTools: {
      type: 'boolean',
      title: 'Enable Tool Calling',
      default: false,
      'x-ui-widget': 'toggle',
      'x-ui-group': 'tools',
      'x-ui-order': 10,
    },
    tools: {
      type: 'array',
      title: 'Available Tools',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          nodeId: { type: 'string' },
        },
      },
      'x-ui-widget': 'multiselect',
      'x-depends-on': { field: 'enableTools', value: true },
      'x-ui-group': 'tools',
      'x-ui-order': 11,
    },
    
    // Memory Configuration
    enableMemory: {
      type: 'boolean',
      title: 'Enable Memory',
      default: false,
      'x-ui-widget': 'toggle',
      'x-ui-group': 'memory',
      'x-ui-order': 12,
    },
    memoryType: {
      type: 'string',
      title: 'Memory Type',
      enum: ['buffer', 'summary', 'vector'],
      enumLabels: ['Buffer (Last N messages)', 'Summary', 'Vector Store'],
      default: 'buffer',
      'x-ui-widget': 'select',
      'x-depends-on': { field: 'enableMemory', value: true },
      'x-ui-group': 'memory',
      'x-ui-order': 13,
    },
    memorySize: {
      type: 'integer',
      title: 'Memory Size',
      description: 'Number of messages to remember',
      minimum: 1,
      maximum: 100,
      default: 10,
      'x-ui-widget': 'number',
      'x-depends-on': { field: 'enableMemory', value: true },
      'x-ui-group': 'memory',
      'x-ui-order': 14,
    },
    sessionKey: {
      type: 'string',
      title: 'Session Key',
      description: 'Expression to identify conversation session',
      format: 'expression',
      'x-ui-widget': 'expression',
      'x-ui-placeholder': '{{ trigger.body.userId }}',
      'x-depends-on': { field: 'enableMemory', value: true },
      'x-ui-group': 'memory',
      'x-ui-order': 15,
    },
  },
  
  required: ['systemPrompt', 'provider', 'model'],
  
  'x-credential-types': ['openai', 'anthropic', 'google-ai', 'mistral', 'groq', 'together'],
  
  'x-output-schema': {
    response: { type: 'string', description: 'Agent response text' },
    toolCalls: { type: 'array', description: 'Tools called by agent' },
    usage: { 
      type: 'object', 
      properties: {
        promptTokens: { type: 'integer' },
        completionTokens: { type: 'integer' },
        totalTokens: { type: 'integer' },
      },
    },
    metadata: { type: 'object' },
  },
  
  'x-examples': [
    {
      name: 'Customer Support Agent',
      config: {
        name: 'Support Agent',
        systemPrompt: 'You are a helpful customer support agent. Be friendly and concise.',
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        responseStyle: 'conversational',
      },
    },
    {
      name: 'Data Extraction Agent',
      config: {
        name: 'Extractor',
        systemPrompt: 'Extract structured data from the given text.',
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0,
        outputFormat: 'json',
        jsonSchema: '{"name": "string", "email": "string", "intent": "string"}',
      },
    },
  ],
};

export const memoryNodeSchema: NodeSchema = {
  $id: 'ai/memory',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: 'Memory Node',
  description: 'Store and retrieve conversation context',
  category: 'ai',
  icon: '🧠',
  color: '#EC4899',
  'x-node-type': 'ai-memory',
  'x-version': '1.0.0',
  
  properties: {
    operation: {
      type: 'string',
      title: 'Operation',
      enum: ['read', 'write', 'search', 'clear'],
      enumLabels: ['Read Memory', 'Write to Memory', 'Search Memory', 'Clear Memory'],
      default: 'read',
      'x-ui-widget': 'select',
      'x-ui-order': 1,
    },
    memoryType: {
      type: 'string',
      title: 'Memory Type',
      enum: ['short-term', 'long-term', 'vector'],
      enumLabels: ['Short-term (Session)', 'Long-term (Database)', 'Vector Store'],
      default: 'short-term',
      'x-ui-widget': 'select',
      'x-ui-order': 2,
    },
    sessionKey: {
      type: 'string',
      title: 'Session Key',
      format: 'expression',
      'x-ui-widget': 'expression',
      'x-ui-placeholder': '{{ trigger.body.userId }}',
      'x-ui-help': 'Unique identifier for the memory session',
      'x-ui-order': 3,
    },
    
    // Write operation fields
    content: {
      type: 'string',
      title: 'Content to Store',
      format: 'expression',
      'x-ui-widget': 'expression',
      'x-depends-on': { field: 'operation', value: 'write' },
      'x-ui-order': 4,
    },
    role: {
      type: 'string',
      title: 'Message Role',
      enum: ['user', 'assistant', 'system'],
      default: 'user',
      'x-ui-widget': 'select',
      'x-depends-on': { field: 'operation', value: 'write' },
      'x-ui-order': 5,
    },
    metadata: {
      type: 'string',
      title: 'Metadata (JSON)',
      format: 'json',
      'x-ui-widget': 'code',
      'x-depends-on': { field: 'operation', value: 'write' },
      'x-ui-order': 6,
    },
    
    // Read operation fields
    limit: {
      type: 'integer',
      title: 'Max Messages',
      minimum: 1,
      maximum: 100,
      default: 10,
      'x-ui-widget': 'number',
      'x-depends-on': { field: 'operation', value: 'read' },
      'x-ui-order': 7,
    },
    
    // Search operation fields
    query: {
      type: 'string',
      title: 'Search Query',
      format: 'expression',
      'x-ui-widget': 'expression',
      'x-depends-on': { field: 'operation', value: 'search' },
      'x-ui-order': 8,
    },
    topK: {
      type: 'integer',
      title: 'Top K Results',
      minimum: 1,
      maximum: 50,
      default: 5,
      'x-ui-widget': 'number',
      'x-depends-on': { field: 'operation', value: 'search' },
      'x-ui-order': 9,
    },
    
    // TTL and cleanup
    ttl: {
      type: 'integer',
      title: 'TTL (seconds)',
      description: 'Time-to-live for memory entries (0 = no expiry)',
      minimum: 0,
      default: 0,
      'x-ui-widget': 'number',
      'x-ui-help': '0 means no automatic expiration',
      'x-ui-order': 10,
    },
  },
  
  required: ['operation', 'memoryType', 'sessionKey'],
  
  'x-output-schema': {
    messages: { type: 'array', description: 'Retrieved messages' },
    success: { type: 'boolean' },
    count: { type: 'integer' },
  },
};

export const toolNodeSchema: NodeSchema = {
  $id: 'ai/tool',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: 'Tool Node',
  description: 'Executable tool that can be called by AI agents',
  category: 'ai',
  icon: '🔧',
  color: '#F59E0B',
  'x-node-type': 'ai-tool',
  'x-version': '1.0.0',
  
  properties: {
    toolType: {
      type: 'string',
      title: 'Tool Type',
      enum: ['http', 'function', 'database', 'workflow'],
      enumLabels: ['HTTP API Call', 'Custom Function', 'Database Query', 'Sub-workflow'],
      default: 'http',
      'x-ui-widget': 'select',
      'x-ui-order': 1,
    },
    name: {
      type: 'string',
      title: 'Tool Name',
      description: 'Name that AI will use to call this tool',
      pattern: '^[a-z][a-z0-9_]*$',
      'x-ui-widget': 'text',
      'x-ui-placeholder': 'search_products',
      'x-ui-order': 2,
    },
    description: {
      type: 'string',
      title: 'Tool Description',
      description: 'Describe what this tool does (helps AI decide when to use it)',
      format: 'textarea',
      'x-ui-widget': 'textarea',
      'x-ui-placeholder': 'Search the product catalog by name or category',
      'x-ui-order': 3,
    },
    
    // HTTP tool fields
    httpMethod: {
      type: 'string',
      title: 'HTTP Method',
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      default: 'GET',
      'x-ui-widget': 'select',
      'x-depends-on': { field: 'toolType', value: 'http' },
      'x-ui-order': 4,
    },
    httpUrl: {
      type: 'string',
      title: 'URL',
      format: 'uri',
      'x-ui-widget': 'text',
      'x-ui-placeholder': 'https://api.example.com/search',
      'x-depends-on': { field: 'toolType', value: 'http' },
      'x-ui-order': 5,
    },
    httpHeaders: {
      type: 'string',
      title: 'Headers (JSON)',
      format: 'json',
      'x-ui-widget': 'code',
      'x-depends-on': { field: 'toolType', value: 'http' },
      'x-ui-order': 6,
    },
    
    // Database tool fields
    dbQuery: {
      type: 'string',
      title: 'SQL Query',
      format: 'textarea',
      'x-ui-widget': 'code',
      'x-ui-placeholder': 'SELECT * FROM products WHERE name LIKE ?',
      'x-depends-on': { field: 'toolType', value: 'database' },
      'x-ui-order': 7,
    },
    
    // Input parameters schema (for all tool types)
    parametersSchema: {
      type: 'string',
      title: 'Parameters Schema',
      description: 'JSON Schema defining the tool\'s input parameters',
      format: 'json',
      'x-ui-widget': 'code',
      'x-ui-placeholder': '{\n  "type": "object",\n  "properties": {\n    "query": { "type": "string", "description": "Search term" }\n  },\n  "required": ["query"]\n}',
      'x-ui-order': 8,
    },
  },
  
  required: ['toolType', 'name', 'description'],
  
  'x-output-schema': {
    result: { type: 'object', description: 'Tool execution result' },
    success: { type: 'boolean' },
    error: { type: 'string' },
  },
};

// ============================================================================
// LOGIC NODE SCHEMAS
// ============================================================================

export const conditionNodeSchema: NodeSchema = {
  $id: 'logic/condition',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  title: 'Condition (IF)',
  description: 'Branch workflow based on conditions',
  category: 'logic',
  icon: '🔀',
  color: '#6366F1',
  'x-node-type': 'condition',
  'x-version': '1.0.0',
  
  properties: {
    conditions: {
      type: 'array',
      title: 'Conditions',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string', format: 'expression' },
          operator: {
            type: 'string',
            enum: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'greater_than', 'less_than', 'is_empty', 'is_not_empty', 'regex'],
          },
          value: { type: 'string' },
        },
      },
      'x-ui-widget': 'field-mapper',
      'x-ui-order': 1,
    },
    combinator: {
      type: 'string',
      title: 'Combine Conditions',
      enum: ['and', 'or'],
      enumLabels: ['AND (all must match)', 'OR (any can match)'],
      default: 'and',
      'x-ui-widget': 'select',
      'x-ui-order': 2,
    },
  },
  
  required: ['conditions'],
};

// ============================================================================
// SCHEMA REGISTRY & HELPERS
// ============================================================================

export const NODE_SCHEMAS: Record<string, NodeSchema> = {
  // Triggers
  'trigger/webhook': webhookTriggerSchema,
  'trigger/schedule': scheduleTriggerSchema,
  'trigger/manual': manualTriggerSchema,
  'trigger/poll': pollTriggerSchema,
  
  // AI Nodes
  'ai/agent': agentNodeSchema,
  'ai/memory': memoryNodeSchema,
  'ai/tool': toolNodeSchema,
  
  // Logic
  'logic/condition': conditionNodeSchema,
};

/**
 * Get schema for a node type
 */
export function getNodeSchema(nodeType: string): NodeSchema | undefined {
  return NODE_SCHEMAS[nodeType];
}

/**
 * Get all schemas for a category
 */
export function getSchemasByCategory(category: NodeSchema['category']): NodeSchema[] {
  return Object.values(NODE_SCHEMAS).filter(s => s.category === category);
}

/**
 * Validate node config against schema
 */
export function validateNodeConfig(
  schema: NodeSchema,
  config: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  for (const field of schema.required || []) {
    if (config[field] === undefined || config[field] === null || config[field] === '') {
      const prop = schema.properties[field];
      errors.push(`${prop?.title || field} is required`);
    }
  }
  
  // Check field validations
  for (const [key, prop] of Object.entries(schema.properties)) {
    const value = config[key];
    if (value === undefined || value === null) continue;
    
    // Check dependent visibility
    if (prop['x-depends-on']) {
      const dep = prop['x-depends-on'];
      const depValue = config[dep.field];
      const shouldShow = Array.isArray(dep.value) 
        ? dep.value.includes(depValue) 
        : depValue === dep.value;
      if (!shouldShow) continue; // Skip validation for hidden fields
    }
    
    // Type validation
    if (prop.type === 'string' && typeof value !== 'string') {
      errors.push(`${prop.title || key} must be text`);
    }
    if ((prop.type === 'number' || prop.type === 'integer') && typeof value !== 'number') {
      errors.push(`${prop.title || key} must be a number`);
    }
    
    // Range validation
    if (prop.minimum !== undefined && value < prop.minimum) {
      errors.push(`${prop.title || key} must be at least ${prop.minimum}`);
    }
    if (prop.maximum !== undefined && value > prop.maximum) {
      errors.push(`${prop.title || key} must be at most ${prop.maximum}`);
    }
    
    // Length validation
    if (prop.minLength !== undefined && typeof value === 'string' && value.length < prop.minLength) {
      errors.push(`${prop.title || key} must be at least ${prop.minLength} characters`);
    }
    if (prop.maxLength !== undefined && typeof value === 'string' && value.length > prop.maxLength) {
      errors.push(`${prop.title || key} must be at most ${prop.maxLength} characters`);
    }
    
    // Pattern validation
    if (prop.pattern && typeof value === 'string' && !new RegExp(prop.pattern).test(value)) {
      errors.push(`${prop.title || key} has invalid format`);
    }
    
    // Enum validation
    if (prop.enum && !prop.enum.includes(value)) {
      errors.push(`${prop.title || key} has invalid value`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Get visible fields based on current config (handles x-depends-on)
 */
export function getVisibleFields(
  schema: NodeSchema,
  config: Record<string, any>
): string[] {
  return Object.entries(schema.properties)
    .filter(([key, prop]) => {
      if (prop['x-ui-hidden']) return false;
      
      if (prop['x-depends-on']) {
        const dep = prop['x-depends-on'];
        const depValue = config[dep.field];
        return Array.isArray(dep.value) 
          ? dep.value.includes(depValue) 
          : depValue === dep.value;
      }
      
      return true;
    })
    .sort((a, b) => (a[1]['x-ui-order'] || 999) - (b[1]['x-ui-order'] || 999))
    .map(([key]) => key);
}

/**
 * Get default config from schema
 */
export function getDefaultConfig(schema: NodeSchema): Record<string, any> {
  const config: Record<string, any> = {};
  
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.default !== undefined) {
      config[key] = prop.default;
    }
  }
  
  return config;
}
