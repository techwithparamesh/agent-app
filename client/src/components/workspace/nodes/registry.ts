/**
 * Node Registry - n8n Style
 * 
 * This file defines all node types available in the workflow builder.
 * Based on n8n's architecture with:
 * - Core Nodes (triggers, logic, transformations)
 * - App Nodes (integrations with external services)
 * - Cluster Nodes (AI/LLM related nodes)
 * 
 * @see https://docs.n8n.io/integrations/builtin/node-types/
 */

// =============================================================================
// NODE TYPE DEFINITIONS
// =============================================================================

export type NodeCategory = 
  | 'core'           // Core functionality nodes
  | 'trigger'        // Nodes that start workflows
  | 'action'         // Nodes that perform actions
  | 'flow'           // Flow control nodes
  | 'transform'      // Data transformation nodes
  | 'ai'             // AI/LLM related nodes
  | 'app';           // App integration nodes

export type CredentialType = 
  | 'none'
  | 'api_key'
  | 'oauth2'
  | 'basic_auth'
  | 'webhook'
  | 'custom';

export interface NodeProperty {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'options' | 'multiOptions' | 'json' | 'collection' | 'fixedCollection';
  default?: any;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: { name: string; value: string | number; description?: string }[];
  displayOptions?: {
    show?: Record<string, any[]>;
    hide?: Record<string, any[]>;
  };
  // For expression support (like n8n's {{ }})
  supportsExpression?: boolean;
}

export interface NodeOutput {
  name: string;
  type: 'main' | 'error';
  displayName?: string;
}

export interface NodeDefinition {
  // Identification
  id: string;
  name: string;
  displayName: string;
  description: string;
  subtitle?: string;  // Dynamic subtitle based on config
  
  // Categorization
  category: NodeCategory;
  group: string[];    // e.g., ['transform', 'utility']
  
  // Display
  icon: string;
  color: string;
  
  // Credentials
  credentialType: CredentialType;
  credentialDisplayName?: string;
  
  // Configuration
  properties: NodeProperty[];
  
  // Inputs/Outputs
  inputs: string[];   // e.g., ['main'] or ['main', 'error']
  outputs: NodeOutput[];
  
  // Defaults
  defaults: {
    name: string;
    color?: string;
  };
  
  // Documentation
  documentationUrl?: string;
  
  // Version
  version: number;
}

// =============================================================================
// CORE NODES - Triggers
// =============================================================================

export const ManualTrigger: NodeDefinition = {
  id: 'manual-trigger',
  name: 'ManualTrigger',
  displayName: 'Manual Trigger',
  description: 'Runs the workflow when you click "Execute Workflow"',
  category: 'trigger',
  group: ['trigger'],
  icon: '👆',
  color: '#909399',
  credentialType: 'none',
  properties: [],
  inputs: [],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'When clicking "Execute"' },
  version: 1,
};

export const WebhookTrigger: NodeDefinition = {
  id: 'webhook-trigger',
  name: 'WebhookTrigger',
  displayName: 'Webhook',
  description: 'Starts the workflow when a webhook URL is called',
  category: 'trigger',
  group: ['trigger'],
  icon: '🔗',
  color: '#885DA2',
  credentialType: 'none',
  properties: [
    {
      name: 'httpMethod',
      displayName: 'HTTP Method',
      type: 'options',
      required: true,
      default: 'POST',
      options: [
        { name: 'GET', value: 'GET' },
        { name: 'POST', value: 'POST' },
        { name: 'PUT', value: 'PUT' },
        { name: 'DELETE', value: 'DELETE' },
      ],
      description: 'The HTTP method to listen on',
    },
    {
      name: 'path',
      displayName: 'Path',
      type: 'string',
      required: true,
      default: '/webhook',
      placeholder: '/my-webhook',
      description: 'The path to listen on',
    },
    {
      name: 'responseMode',
      displayName: 'Respond',
      type: 'options',
      default: 'onReceived',
      options: [
        { name: 'When Received', value: 'onReceived', description: 'Respond immediately when webhook is called' },
        { name: 'When Last Node Finishes', value: 'lastNode', description: 'Respond after the workflow completes' },
      ],
    },
  ],
  inputs: [],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Webhook' },
  version: 1,
};

export const ScheduleTrigger: NodeDefinition = {
  id: 'schedule-trigger',
  name: 'ScheduleTrigger',
  displayName: 'Schedule Trigger',
  description: 'Runs the workflow on a schedule',
  category: 'trigger',
  group: ['trigger'],
  icon: '⏰',
  color: '#31C48D',
  credentialType: 'none',
  properties: [
    {
      name: 'rule',
      displayName: 'Trigger At',
      type: 'options',
      required: true,
      default: 'everyDay',
      options: [
        { name: 'Every Minute', value: 'everyMinute' },
        { name: 'Every Hour', value: 'everyHour' },
        { name: 'Every Day', value: 'everyDay' },
        { name: 'Every Week', value: 'everyWeek' },
        { name: 'Every Month', value: 'everyMonth' },
        { name: 'Custom (Cron)', value: 'cron' },
      ],
    },
    {
      name: 'hour',
      displayName: 'Hour',
      type: 'number',
      default: 9,
      description: 'Hour of the day (0-23)',
      displayOptions: {
        show: { rule: ['everyDay', 'everyWeek', 'everyMonth'] },
      },
    },
    {
      name: 'minute',
      displayName: 'Minute',
      type: 'number',
      default: 0,
      description: 'Minute of the hour (0-59)',
      displayOptions: {
        show: { rule: ['everyDay', 'everyWeek', 'everyMonth', 'everyHour'] },
      },
    },
    {
      name: 'weekday',
      displayName: 'Weekday',
      type: 'options',
      default: 1,
      options: [
        { name: 'Monday', value: 1 },
        { name: 'Tuesday', value: 2 },
        { name: 'Wednesday', value: 3 },
        { name: 'Thursday', value: 4 },
        { name: 'Friday', value: 5 },
        { name: 'Saturday', value: 6 },
        { name: 'Sunday', value: 0 },
      ],
      displayOptions: {
        show: { rule: ['everyWeek'] },
      },
    },
    {
      name: 'cronExpression',
      displayName: 'Cron Expression',
      type: 'string',
      default: '0 9 * * *',
      placeholder: '0 9 * * *',
      description: 'Cron expression for custom schedules',
      displayOptions: {
        show: { rule: ['cron'] },
      },
    },
  ],
  inputs: [],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Schedule Trigger' },
  version: 1,
};

// =============================================================================
// CORE NODES - Flow Control
// =============================================================================

export const IfNode: NodeDefinition = {
  id: 'if',
  name: 'If',
  displayName: 'IF',
  description: 'Route items based on a condition',
  subtitle: '={{$parameter["conditions"]}}',
  category: 'flow',
  group: ['flow'],
  icon: '🔀',
  color: '#FF6D5A',
  credentialType: 'none',
  properties: [
    {
      name: 'conditions',
      displayName: 'Conditions',
      type: 'collection',
      required: true,
      default: {},
      description: 'The conditions to check',
    },
    {
      name: 'combinator',
      displayName: 'Combine',
      type: 'options',
      default: 'and',
      options: [
        { name: 'AND', value: 'and', description: 'All conditions must be true' },
        { name: 'OR', value: 'or', description: 'Any condition must be true' },
      ],
    },
  ],
  inputs: ['main'],
  outputs: [
    { name: 'true', type: 'main', displayName: 'True' },
    { name: 'false', type: 'main', displayName: 'False' },
  ],
  defaults: { name: 'IF' },
  version: 1,
};

export const SwitchNode: NodeDefinition = {
  id: 'switch',
  name: 'Switch',
  displayName: 'Switch',
  description: 'Route items to different outputs based on field value',
  category: 'flow',
  group: ['flow'],
  icon: '🔃',
  color: '#FF6D5A',
  credentialType: 'none',
  properties: [
    {
      name: 'dataPropertyName',
      displayName: 'Value to Switch On',
      type: 'string',
      required: true,
      default: '',
      placeholder: '{{ $json.status }}',
      supportsExpression: true,
    },
    {
      name: 'rules',
      displayName: 'Routing Rules',
      type: 'fixedCollection',
      default: {},
    },
  ],
  inputs: ['main'],
  outputs: [
    { name: 'output0', type: 'main', displayName: 'Output 0' },
    { name: 'output1', type: 'main', displayName: 'Output 1' },
    { name: 'output2', type: 'main', displayName: 'Output 2' },
    { name: 'fallback', type: 'main', displayName: 'Fallback' },
  ],
  defaults: { name: 'Switch' },
  version: 1,
};

export const MergeNode: NodeDefinition = {
  id: 'merge',
  name: 'Merge',
  displayName: 'Merge',
  description: 'Merge data from multiple sources',
  category: 'flow',
  group: ['flow'],
  icon: '🔗',
  color: '#00A36C',
  credentialType: 'none',
  properties: [
    {
      name: 'mode',
      displayName: 'Mode',
      type: 'options',
      required: true,
      default: 'append',
      options: [
        { name: 'Append', value: 'append', description: 'Combine all items from all inputs' },
        { name: 'Keep Key Matches', value: 'keepKeyMatches', description: 'Keep items that match on a key' },
        { name: 'Choose Branch', value: 'chooseBranch', description: 'Output from selected input only' },
      ],
    },
  ],
  inputs: ['main', 'main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Merge' },
  version: 1,
};

export const WaitNode: NodeDefinition = {
  id: 'wait',
  name: 'Wait',
  displayName: 'Wait',
  description: 'Wait for a specified amount of time',
  category: 'flow',
  group: ['flow'],
  icon: '⏳',
  color: '#909399',
  credentialType: 'none',
  properties: [
    {
      name: 'amount',
      displayName: 'Wait Time',
      type: 'number',
      required: true,
      default: 5,
      description: 'How long to wait',
    },
    {
      name: 'unit',
      displayName: 'Unit',
      type: 'options',
      required: true,
      default: 'seconds',
      options: [
        { name: 'Seconds', value: 'seconds' },
        { name: 'Minutes', value: 'minutes' },
        { name: 'Hours', value: 'hours' },
      ],
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Wait' },
  version: 1,
};

export const LoopNode: NodeDefinition = {
  id: 'loop',
  name: 'Loop',
  displayName: 'Loop Over Items',
  description: 'Process items in batches',
  category: 'flow',
  group: ['flow'],
  icon: '🔄',
  color: '#00A36C',
  credentialType: 'none',
  properties: [
    {
      name: 'batchSize',
      displayName: 'Batch Size',
      type: 'number',
      required: true,
      default: 1,
      description: 'Number of items to process per iteration',
    },
  ],
  inputs: ['main'],
  outputs: [
    { name: 'loop', type: 'main', displayName: 'Loop' },
    { name: 'done', type: 'main', displayName: 'Done' },
  ],
  defaults: { name: 'Loop Over Items' },
  version: 1,
};

// =============================================================================
// CORE NODES - Transform
// =============================================================================

export const SetNode: NodeDefinition = {
  id: 'set',
  name: 'Set',
  displayName: 'Edit Fields',
  description: 'Add, edit, or remove fields from your data',
  category: 'transform',
  group: ['transform'],
  icon: '✏️',
  color: '#FF6D5A',
  credentialType: 'none',
  properties: [
    {
      name: 'mode',
      displayName: 'Mode',
      type: 'options',
      required: true,
      default: 'manual',
      options: [
        { name: 'Manual', value: 'manual', description: 'Set fields one by one' },
        { name: 'Raw JSON', value: 'json', description: 'Enter JSON directly' },
      ],
    },
    {
      name: 'fields',
      displayName: 'Fields',
      type: 'fixedCollection',
      default: {},
      displayOptions: {
        show: { mode: ['manual'] },
      },
    },
    {
      name: 'jsonOutput',
      displayName: 'JSON',
      type: 'json',
      default: '{}',
      displayOptions: {
        show: { mode: ['json'] },
      },
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Edit Fields' },
  version: 1,
};

export const FilterNode: NodeDefinition = {
  id: 'filter',
  name: 'Filter',
  displayName: 'Filter',
  description: 'Remove items that don\'t match the conditions',
  category: 'transform',
  group: ['transform'],
  icon: '🔍',
  color: '#FF6D5A',
  credentialType: 'none',
  properties: [
    {
      name: 'conditions',
      displayName: 'Keep When',
      type: 'collection',
      required: true,
      default: {},
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Filter' },
  version: 1,
};

export const CodeNode: NodeDefinition = {
  id: 'code',
  name: 'Code',
  displayName: 'Code',
  description: 'Write custom JavaScript or Python code',
  category: 'transform',
  group: ['transform', 'developer'],
  icon: '💻',
  color: '#FF6D5A',
  credentialType: 'none',
  properties: [
    {
      name: 'language',
      displayName: 'Language',
      type: 'options',
      required: true,
      default: 'javascript',
      options: [
        { name: 'JavaScript', value: 'javascript' },
        { name: 'Python', value: 'python' },
      ],
    },
    {
      name: 'code',
      displayName: 'Code',
      type: 'string',
      required: true,
      default: `// Process input items
for (const item of $input.all()) {
  // Add your code here
  item.json.processed = true;
}

return $input.all();`,
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Code' },
  version: 1,
};

export const HttpRequestNode: NodeDefinition = {
  id: 'http-request',
  name: 'HttpRequest',
  displayName: 'HTTP Request',
  description: 'Make HTTP requests to any API',
  category: 'core',
  group: ['core', 'developer'],
  icon: '🌐',
  color: '#0077CC',
  credentialType: 'none',
  properties: [
    {
      name: 'method',
      displayName: 'Method',
      type: 'options',
      required: true,
      default: 'GET',
      options: [
        { name: 'GET', value: 'GET' },
        { name: 'POST', value: 'POST' },
        { name: 'PUT', value: 'PUT' },
        { name: 'PATCH', value: 'PATCH' },
        { name: 'DELETE', value: 'DELETE' },
      ],
    },
    {
      name: 'url',
      displayName: 'URL',
      type: 'string',
      required: true,
      default: '',
      placeholder: 'https://api.example.com/endpoint',
      supportsExpression: true,
    },
    {
      name: 'authentication',
      displayName: 'Authentication',
      type: 'options',
      default: 'none',
      options: [
        { name: 'None', value: 'none' },
        { name: 'Basic Auth', value: 'basicAuth' },
        { name: 'Bearer Token', value: 'bearer' },
        { name: 'API Key', value: 'apiKey' },
      ],
    },
    {
      name: 'sendBody',
      displayName: 'Send Body',
      type: 'boolean',
      default: false,
      displayOptions: {
        show: { method: ['POST', 'PUT', 'PATCH'] },
      },
    },
    {
      name: 'body',
      displayName: 'Body',
      type: 'json',
      default: '{}',
      displayOptions: {
        show: { sendBody: [true] },
      },
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'HTTP Request' },
  version: 1,
};

// =============================================================================
// AI NODES
// =============================================================================

export const AIAgentNode: NodeDefinition = {
  id: 'ai-agent',
  name: 'AIAgent',
  displayName: 'AI Agent',
  description: 'Use an AI agent to process data with tools',
  category: 'ai',
  group: ['ai'],
  icon: '🤖',
  color: '#7C3AED',
  credentialType: 'api_key',
  credentialDisplayName: 'OpenAI, Anthropic, etc.',
  properties: [
    {
      name: 'model',
      displayName: 'Model',
      type: 'options',
      required: true,
      default: 'gpt-4o',
      options: [
        { name: 'GPT-4o', value: 'gpt-4o' },
        { name: 'GPT-4o Mini', value: 'gpt-4o-mini' },
        { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' },
        { name: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku' },
        { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
      ],
    },
    {
      name: 'systemPrompt',
      displayName: 'System Prompt',
      type: 'string',
      required: true,
      default: 'You are a helpful assistant.',
      description: 'Instructions for how the AI should behave',
    },
    {
      name: 'prompt',
      displayName: 'User Message',
      type: 'string',
      required: true,
      default: '',
      placeholder: '{{ $json.message }}',
      supportsExpression: true,
      description: 'The message to send to the AI',
    },
    {
      name: 'maxTokens',
      displayName: 'Max Tokens',
      type: 'number',
      default: 1000,
    },
    {
      name: 'temperature',
      displayName: 'Temperature',
      type: 'number',
      default: 0.7,
      description: 'Higher = more creative, Lower = more focused',
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'AI Agent' },
  version: 1,
};

export const AITextGeneratorNode: NodeDefinition = {
  id: 'ai-text-generator',
  name: 'AITextGenerator',
  displayName: 'AI Text Generator',
  description: 'Generate text with AI',
  category: 'ai',
  group: ['ai'],
  icon: '✨',
  color: '#10B981',
  credentialType: 'api_key',
  properties: [
    {
      name: 'model',
      displayName: 'Model',
      type: 'options',
      required: true,
      default: 'gpt-4o-mini',
      options: [
        { name: 'GPT-4o', value: 'gpt-4o' },
        { name: 'GPT-4o Mini', value: 'gpt-4o-mini' },
        { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' },
      ],
    },
    {
      name: 'prompt',
      displayName: 'Prompt',
      type: 'string',
      required: true,
      default: '',
      placeholder: 'Write a summary of: {{ $json.text }}',
      supportsExpression: true,
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Generate Text' },
  version: 1,
};

// =============================================================================
// APP NODES - Communication
// =============================================================================

export const WhatsAppNode: NodeDefinition = {
  id: 'whatsapp',
  name: 'WhatsApp',
  displayName: 'WhatsApp Business',
  description: 'Send and receive WhatsApp messages',
  category: 'app',
  group: ['communication'],
  icon: '💬',
  color: '#25D366',
  credentialType: 'custom',
  credentialDisplayName: 'WhatsApp Business API',
  properties: [
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      required: true,
      default: 'sendMessage',
      options: [
        { name: 'Send Message', value: 'sendMessage' },
        { name: 'Send Template', value: 'sendTemplate' },
        { name: 'Send Media', value: 'sendMedia' },
        { name: 'Send Location', value: 'sendLocation' },
      ],
    },
    {
      name: 'to',
      displayName: 'To',
      type: 'string',
      required: true,
      default: '',
      placeholder: '+1234567890',
      supportsExpression: true,
      description: 'Recipient phone number with country code',
    },
    {
      name: 'message',
      displayName: 'Message',
      type: 'string',
      required: true,
      default: '',
      placeholder: 'Hello {{ $json.name }}!',
      supportsExpression: true,
      displayOptions: {
        show: { operation: ['sendMessage'] },
      },
    },
    {
      name: 'templateName',
      displayName: 'Template Name',
      type: 'string',
      required: true,
      default: '',
      displayOptions: {
        show: { operation: ['sendTemplate'] },
      },
    },
    {
      name: 'mediaUrl',
      displayName: 'Media URL',
      type: 'string',
      required: true,
      default: '',
      displayOptions: {
        show: { operation: ['sendMedia'] },
      },
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'WhatsApp' },
  documentationUrl: 'https://developers.facebook.com/docs/whatsapp',
  version: 1,
};

export const WhatsAppTriggerNode: NodeDefinition = {
  id: 'whatsapp-trigger',
  name: 'WhatsAppTrigger',
  displayName: 'WhatsApp Trigger',
  description: 'Start workflow when a WhatsApp message is received',
  category: 'trigger',
  group: ['trigger', 'communication'],
  icon: '💬',
  color: '#25D366',
  credentialType: 'custom',
  properties: [
    {
      name: 'events',
      displayName: 'Events',
      type: 'multiOptions',
      required: true,
      default: ['message'],
      options: [
        { name: 'Message Received', value: 'message' },
        { name: 'Message Status Update', value: 'status' },
      ],
    },
  ],
  inputs: [],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'WhatsApp Trigger' },
  version: 1,
};

export const SlackNode: NodeDefinition = {
  id: 'slack',
  name: 'Slack',
  displayName: 'Slack',
  description: 'Send messages and interact with Slack',
  category: 'app',
  group: ['communication'],
  icon: '💼',
  color: '#4A154B',
  credentialType: 'oauth2',
  credentialDisplayName: 'Slack OAuth2',
  properties: [
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      required: true,
      default: 'postMessage',
      options: [
        { name: 'Send Message', value: 'postMessage' },
        { name: 'Update Message', value: 'updateMessage' },
        { name: 'Delete Message', value: 'deleteMessage' },
        { name: 'Upload File', value: 'uploadFile' },
      ],
    },
    {
      name: 'channel',
      displayName: 'Channel',
      type: 'string',
      required: true,
      default: '',
      placeholder: '#general or C0123456789',
      supportsExpression: true,
    },
    {
      name: 'text',
      displayName: 'Message Text',
      type: 'string',
      required: true,
      default: '',
      supportsExpression: true,
      displayOptions: {
        show: { operation: ['postMessage', 'updateMessage'] },
      },
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Slack' },
  version: 1,
};

export const TelegramNode: NodeDefinition = {
  id: 'telegram',
  name: 'Telegram',
  displayName: 'Telegram',
  description: 'Send messages via Telegram bot',
  category: 'app',
  group: ['communication'],
  icon: '✈️',
  color: '#0088CC',
  credentialType: 'api_key',
  credentialDisplayName: 'Telegram Bot Token',
  properties: [
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      required: true,
      default: 'sendMessage',
      options: [
        { name: 'Send Message', value: 'sendMessage' },
        { name: 'Send Photo', value: 'sendPhoto' },
        { name: 'Send Document', value: 'sendDocument' },
      ],
    },
    {
      name: 'chatId',
      displayName: 'Chat ID',
      type: 'string',
      required: true,
      default: '',
      supportsExpression: true,
    },
    {
      name: 'text',
      displayName: 'Message',
      type: 'string',
      required: true,
      default: '',
      supportsExpression: true,
      displayOptions: {
        show: { operation: ['sendMessage'] },
      },
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Telegram' },
  version: 1,
};

export const GmailNode: NodeDefinition = {
  id: 'gmail',
  name: 'Gmail',
  displayName: 'Gmail',
  description: 'Send and manage emails with Gmail',
  category: 'app',
  group: ['email'],
  icon: '📧',
  color: '#EA4335',
  credentialType: 'oauth2',
  credentialDisplayName: 'Google OAuth2',
  properties: [
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      required: true,
      default: 'send',
      options: [
        { name: 'Send Email', value: 'send' },
        { name: 'Get Email', value: 'get' },
        { name: 'Get All', value: 'getAll' },
        { name: 'Reply', value: 'reply' },
        { name: 'Add Label', value: 'addLabel' },
      ],
    },
    {
      name: 'to',
      displayName: 'To',
      type: 'string',
      required: true,
      default: '',
      supportsExpression: true,
      displayOptions: {
        show: { operation: ['send', 'reply'] },
      },
    },
    {
      name: 'subject',
      displayName: 'Subject',
      type: 'string',
      required: true,
      default: '',
      supportsExpression: true,
      displayOptions: {
        show: { operation: ['send'] },
      },
    },
    {
      name: 'message',
      displayName: 'Message',
      type: 'string',
      required: true,
      default: '',
      supportsExpression: true,
      displayOptions: {
        show: { operation: ['send', 'reply'] },
      },
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Gmail' },
  version: 1,
};

// =============================================================================
// APP NODES - Productivity
// =============================================================================

export const GoogleSheetsNode: NodeDefinition = {
  id: 'google-sheets',
  name: 'GoogleSheets',
  displayName: 'Google Sheets',
  description: 'Read and write data to Google Sheets',
  category: 'app',
  group: ['productivity', 'google'],
  icon: '📊',
  color: '#0F9D58',
  credentialType: 'oauth2',
  properties: [
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      required: true,
      default: 'appendRow',
      options: [
        { name: 'Append Row', value: 'appendRow' },
        { name: 'Read Rows', value: 'read' },
        { name: 'Update Row', value: 'update' },
        { name: 'Delete Row', value: 'delete' },
        { name: 'Clear', value: 'clear' },
      ],
    },
    {
      name: 'spreadsheetId',
      displayName: 'Spreadsheet',
      type: 'string',
      required: true,
      default: '',
      description: 'The ID or URL of the spreadsheet',
    },
    {
      name: 'sheetName',
      displayName: 'Sheet Name',
      type: 'string',
      required: true,
      default: 'Sheet1',
    },
    {
      name: 'columns',
      displayName: 'Columns',
      type: 'fixedCollection',
      default: {},
      displayOptions: {
        show: { operation: ['appendRow', 'update'] },
      },
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Google Sheets' },
  version: 1,
};

export const NotionNode: NodeDefinition = {
  id: 'notion',
  name: 'Notion',
  displayName: 'Notion',
  description: 'Create and manage Notion pages and databases',
  category: 'app',
  group: ['productivity'],
  icon: '📝',
  color: '#000000',
  credentialType: 'api_key',
  properties: [
    {
      name: 'resource',
      displayName: 'Resource',
      type: 'options',
      required: true,
      default: 'page',
      options: [
        { name: 'Page', value: 'page' },
        { name: 'Database', value: 'database' },
        { name: 'Block', value: 'block' },
      ],
    },
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      required: true,
      default: 'create',
      options: [
        { name: 'Create', value: 'create' },
        { name: 'Get', value: 'get' },
        { name: 'Update', value: 'update' },
        { name: 'Delete', value: 'delete' },
      ],
    },
    {
      name: 'databaseId',
      displayName: 'Database',
      type: 'string',
      required: true,
      default: '',
      displayOptions: {
        show: { resource: ['database', 'page'] },
      },
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Notion' },
  version: 1,
};

export const AirtableNode: NodeDefinition = {
  id: 'airtable',
  name: 'Airtable',
  displayName: 'Airtable',
  description: 'Read and write Airtable records',
  category: 'app',
  group: ['database', 'productivity'],
  icon: '🗃️',
  color: '#18BFFF',
  credentialType: 'api_key',
  properties: [
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      required: true,
      default: 'create',
      options: [
        { name: 'Create Record', value: 'create' },
        { name: 'Get Record', value: 'get' },
        { name: 'Get All', value: 'getAll' },
        { name: 'Update Record', value: 'update' },
        { name: 'Delete Record', value: 'delete' },
      ],
    },
    {
      name: 'baseId',
      displayName: 'Base',
      type: 'string',
      required: true,
      default: '',
    },
    {
      name: 'tableId',
      displayName: 'Table',
      type: 'string',
      required: true,
      default: '',
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'Airtable' },
  version: 1,
};

// =============================================================================
// APP NODES - CRM
// =============================================================================

export const HubSpotNode: NodeDefinition = {
  id: 'hubspot',
  name: 'HubSpot',
  displayName: 'HubSpot',
  description: 'Manage HubSpot contacts, deals, and more',
  category: 'app',
  group: ['crm'],
  icon: '🧡',
  color: '#FF7A59',
  credentialType: 'oauth2',
  properties: [
    {
      name: 'resource',
      displayName: 'Resource',
      type: 'options',
      required: true,
      default: 'contact',
      options: [
        { name: 'Contact', value: 'contact' },
        { name: 'Deal', value: 'deal' },
        { name: 'Company', value: 'company' },
        { name: 'Ticket', value: 'ticket' },
      ],
    },
    {
      name: 'operation',
      displayName: 'Operation',
      type: 'options',
      required: true,
      default: 'create',
      options: [
        { name: 'Create', value: 'create' },
        { name: 'Get', value: 'get' },
        { name: 'Get All', value: 'getAll' },
        { name: 'Update', value: 'update' },
        { name: 'Delete', value: 'delete' },
      ],
    },
  ],
  inputs: ['main'],
  outputs: [{ name: 'main', type: 'main' }],
  defaults: { name: 'HubSpot' },
  version: 1,
};

// =============================================================================
// REGISTRY
// =============================================================================

export const NODE_REGISTRY: Record<string, NodeDefinition> = {
  // Triggers
  'manual-trigger': ManualTrigger,
  'webhook-trigger': WebhookTrigger,
  'schedule-trigger': ScheduleTrigger,
  'whatsapp-trigger': WhatsAppTriggerNode,
  
  // Flow Control
  'if': IfNode,
  'switch': SwitchNode,
  'merge': MergeNode,
  'wait': WaitNode,
  'loop': LoopNode,
  
  // Transform
  'set': SetNode,
  'filter': FilterNode,
  'code': CodeNode,
  
  // Core
  'http-request': HttpRequestNode,
  
  // AI
  'ai-agent': AIAgentNode,
  'ai-text-generator': AITextGeneratorNode,
  
  // Apps - Communication
  'whatsapp': WhatsAppNode,
  'slack': SlackNode,
  'telegram': TelegramNode,
  'gmail': GmailNode,
  
  // Apps - Productivity
  'google-sheets': GoogleSheetsNode,
  'notion': NotionNode,
  'airtable': AirtableNode,
  
  // Apps - CRM
  'hubspot': HubSpotNode,

  // OpenAI (special entry for when coming from integrations)
  'openai': AIAgentNode,
};

// Helper to get node by ID
export function getNodeDefinition(id: string): NodeDefinition | undefined {
  return NODE_REGISTRY[id];
}

// Get nodes by category
export function getNodesByCategory(category: NodeCategory): NodeDefinition[] {
  return Object.values(NODE_REGISTRY).filter(node => node.category === category);
}

// Get nodes by group
export function getNodesByGroup(group: string): NodeDefinition[] {
  return Object.values(NODE_REGISTRY).filter(node => node.group.includes(group));
}

// Get all trigger nodes
export function getTriggerNodes(): NodeDefinition[] {
  return getNodesByCategory('trigger');
}

// Get all action nodes
export function getActionNodes(): NodeDefinition[] {
  return Object.values(NODE_REGISTRY).filter(node => 
    node.category !== 'trigger' && node.inputs.length > 0
  );
}

// Search nodes
export function searchNodes(query: string): NodeDefinition[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(NODE_REGISTRY).filter(node =>
    node.displayName.toLowerCase().includes(lowerQuery) ||
    node.description.toLowerCase().includes(lowerQuery) ||
    node.group.some(g => g.toLowerCase().includes(lowerQuery))
  );
}
