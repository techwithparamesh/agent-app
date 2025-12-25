/**
 * N8n-Style Node Configuration Modal
 * 
 * Full-screen modal for configuring workflow nodes with:
 * - Parameters tab with dynamic fields
 * - Settings tab with execution options
 * - Output panel with test/mock data
 */

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  X,
  ExternalLink,
  Play,
  Zap,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit2,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings,
  FileJson,
  Code,
  Copy,
  Info,
} from 'lucide-react';
import type { FlowNode } from './types';

// ============================================
// TYPES
// ============================================

export interface NodeParameter {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiSelect' | 'json' | 'expression' | 'credential';
  description?: string;
  placeholder?: string;
  required?: boolean;
  default?: any;
  options?: { value: string; label: string; description?: string }[];
  dependsOn?: { field: string; value: any };
  group?: string;
}

export interface NodeOptionalField {
  key: string;
  label: string;
  type: NodeParameter['type'];
  description?: string;
  default?: any;
  options?: { value: string; label: string }[];
}

export interface NodeSettingsConfig {
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  maxRetries?: number;
  waitBetweenRetries?: number;
  onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
  notes?: string;
  displayNoteInFlow?: boolean;
}

export interface MockDataItem {
  json: Record<string, any>;
}

export interface TriggerNodeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  docsUrl?: string;
  version?: string;
  parameters: NodeParameter[];
  optionalFields: NodeOptionalField[];
  defaultMockData?: MockDataItem[];
  testable?: boolean;
  testButtonLabel?: string;
}

export interface N8nNodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  node?: FlowNode;
  nodeConfig?: TriggerNodeConfig | null;
  onSave: (nodeId: string, config: Record<string, any>, settings: NodeSettingsConfig) => void;
  onTest?: (nodeId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  onDelete?: (nodeId: string) => void;
}

// ============================================
// TRIGGER CONFIGURATIONS
// ============================================

export const triggerConfigs: Record<string, TriggerNodeConfig> = {
  chat_trigger: {
    id: 'chat_trigger',
    name: 'When chat message received',
    description: 'Trigger when a chat message is received',
    icon: '💬',
    color: '#FF6D5A',
    docsUrl: 'https://docs.example.com/chat-trigger',
    version: '1.4',
    testable: true,
    testButtonLabel: 'Test chat',
    parameters: [
      {
        key: 'makeChatPubliclyAvailable',
        label: 'Make Chat Publicly Available',
        type: 'boolean',
        description: 'Set whether the chat should be publicly available or only through manual interface',
        default: false,
      },
      {
        key: 'chatMode',
        label: 'Mode',
        type: 'select',
        description: 'Choose how users access the chat',
        options: [
          { value: 'hosted', label: 'Hosted Chat', description: 'Use hosted chat interface' },
          { value: 'embedded', label: 'Embedded Chat', description: 'Use your own chat interface' },
        ],
        default: 'hosted',
        dependsOn: { field: 'makeChatPubliclyAvailable', value: true },
      },
      {
        key: 'authentication',
        label: 'Authentication',
        type: 'select',
        description: 'Choose whether and how to restrict access',
        options: [
          { value: 'none', label: 'None' },
          { value: 'basic', label: 'Basic Auth' },
          { value: 'user', label: 'User Auth' },
        ],
        default: 'none',
        dependsOn: { field: 'makeChatPubliclyAvailable', value: true },
      },
      {
        key: 'makeAvailableInChat',
        label: 'Make Available in n8n Chat',
        type: 'boolean',
        description: 'Choose whether to make the agent available to Chat Hub',
        default: false,
      },
      {
        key: 'agentName',
        label: 'Agent Name',
        type: 'string',
        description: 'The name of the agent on Chat Hub',
        placeholder: 'My AI Assistant',
        dependsOn: { field: 'makeAvailableInChat', value: true },
      },
    ],
    optionalFields: [
      { key: 'allowFileUploads', label: 'Allow File Uploads', type: 'boolean', default: false },
      { key: 'allowedFileMimeTypes', label: 'Allowed File Mime Types', type: 'string', default: '*/*' },
      { 
        key: 'responseMode', 
        label: 'Response Mode', 
        type: 'select',
        options: [
          { value: 'lastNode', label: 'When Last Node Finishes' },
          { value: 'responseNodes', label: 'Using Response Nodes' },
          { value: 'streaming', label: 'Streaming Response' },
        ],
        default: 'lastNode',
      },
    ],
    defaultMockData: [
      { json: { message: "Hello, I need help with my order", sessionId: "session_123", timestamp: new Date().toISOString() } },
    ],
  },
  
  webhook: {
    id: 'webhook',
    name: 'Webhook',
    description: 'Trigger workflow when webhook URL is called',
    icon: '🔗',
    color: '#6B7280',
    docsUrl: 'https://docs.example.com/webhook',
    version: '2.0',
    testable: true,
    testButtonLabel: 'Test webhook',
    parameters: [
      {
        key: 'httpMethod',
        label: 'HTTP Method',
        type: 'select',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
          { value: 'PATCH', label: 'PATCH' },
        ],
        default: 'POST',
        required: true,
      },
      {
        key: 'path',
        label: 'Path',
        type: 'string',
        placeholder: 'webhook-path',
        description: 'The path to listen on',
        required: true,
      },
      {
        key: 'authentication',
        label: 'Authentication',
        type: 'select',
        options: [
          { value: 'none', label: 'None' },
          { value: 'basicAuth', label: 'Basic Auth' },
          { value: 'headerAuth', label: 'Header Auth' },
        ],
        default: 'none',
      },
    ],
    optionalFields: [
      { key: 'responseMode', label: 'Response Mode', type: 'select', options: [
        { value: 'onReceived', label: 'On Received' },
        { value: 'lastNode', label: 'When Last Node Finishes' },
        { value: 'responseNode', label: 'Using Respond to Webhook Node' },
      ]},
      { key: 'responseData', label: 'Response Data', type: 'select', options: [
        { value: 'allEntries', label: 'All Entries' },
        { value: 'firstEntryJson', label: 'First Entry JSON' },
        { value: 'firstEntryBinary', label: 'First Entry Binary' },
        { value: 'noResponseBody', label: 'No Response Body' },
      ]},
      { key: 'rawBody', label: 'Raw Body', type: 'boolean', default: false },
      { key: 'binaryData', label: 'Binary Data', type: 'boolean', default: false },
    ],
    defaultMockData: [
      { json: { body: { name: "John Doe", email: "john@example.com" }, headers: { "content-type": "application/json" }, query: {} } },
    ],
  },

  schedule: {
    id: 'schedule',
    name: 'Schedule Trigger',
    description: 'Trigger workflow on a schedule',
    icon: '⏰',
    color: '#F59E0B',
    docsUrl: 'https://docs.example.com/schedule',
    version: '1.2',
    testable: true,
    testButtonLabel: 'Test trigger',
    parameters: [
      {
        key: 'mode',
        label: 'Trigger Mode',
        type: 'select',
        options: [
          { value: 'everyMinute', label: 'Every Minute' },
          { value: 'everyHour', label: 'Every Hour' },
          { value: 'everyDay', label: 'Every Day' },
          { value: 'everyWeek', label: 'Every Week' },
          { value: 'everyMonth', label: 'Every Month' },
          { value: 'cron', label: 'Custom (Cron)' },
        ],
        default: 'everyDay',
        required: true,
      },
      {
        key: 'hour',
        label: 'Hour',
        type: 'number',
        description: 'Hour of the day (0-23)',
        default: 9,
        dependsOn: { field: 'mode', value: 'everyDay' },
      },
      {
        key: 'minute',
        label: 'Minute',
        type: 'number',
        description: 'Minute of the hour (0-59)',
        default: 0,
      },
      {
        key: 'cronExpression',
        label: 'Cron Expression',
        type: 'string',
        placeholder: '0 9 * * *',
        description: 'Custom cron expression',
        dependsOn: { field: 'mode', value: 'cron' },
      },
    ],
    optionalFields: [
      { key: 'timezone', label: 'Timezone', type: 'string', default: 'UTC' },
    ],
    defaultMockData: [
      { json: { timestamp: new Date().toISOString(), triggerTime: "09:00" } },
    ],
  },

  whatsapp_message: {
    id: 'whatsapp_message',
    name: 'WhatsApp Message Received',
    description: 'Trigger when a WhatsApp message is received',
    icon: '💬',
    color: '#25D366',
    docsUrl: 'https://docs.example.com/whatsapp-trigger',
    version: '1.0',
    testable: true,
    testButtonLabel: 'Test webhook',
    parameters: [
      {
        key: 'credential',
        label: 'WhatsApp Account',
        type: 'credential',
        description: 'Select your WhatsApp Business API credentials',
        required: true,
      },
      {
        key: 'messageTypes',
        label: 'Message Types',
        type: 'multiSelect',
        options: [
          { value: 'text', label: 'Text Messages' },
          { value: 'image', label: 'Images' },
          { value: 'audio', label: 'Audio Messages' },
          { value: 'video', label: 'Videos' },
          { value: 'document', label: 'Documents' },
          { value: 'location', label: 'Location' },
          { value: 'contacts', label: 'Contacts' },
        ],
        default: ['text'],
      },
    ],
    optionalFields: [
      { key: 'filterByNumber', label: 'Filter by Phone Number', type: 'string' },
      { key: 'downloadMedia', label: 'Auto-download Media', type: 'boolean', default: true },
    ],
    defaultMockData: [
      { json: { 
        messageId: "wamid.123456789",
        from: "+1234567890",
        type: "text",
        text: { body: "Hello, I need help!" },
        timestamp: new Date().toISOString(),
        name: "John Doe",
      }},
    ],
  },

  manual: {
    id: 'manual',
    name: 'Manual Trigger',
    description: 'Trigger the workflow manually',
    icon: '👆',
    color: '#8B5CF6',
    version: '1.0',
    testable: true,
    testButtonLabel: 'Execute workflow',
    parameters: [],
    optionalFields: [],
    defaultMockData: [
      { json: { executedAt: new Date().toISOString(), executedBy: "manual" } },
    ],
  },

  // Additional app event triggers
  telegram_message: {
    id: 'telegram_message',
    name: 'Telegram Message',
    description: 'Trigger when a Telegram message is received',
    icon: '✈️',
    color: '#0088CC',
    version: '1.0',
    testable: true,
    parameters: [
      {
        key: 'credential',
        label: 'Telegram Bot',
        type: 'credential',
        description: 'Select your Telegram bot credentials',
        required: true,
      },
      {
        key: 'updates',
        label: 'Trigger On',
        type: 'select',
        options: [
          { value: 'message', label: 'Message' },
          { value: 'callback_query', label: 'Callback Query' },
          { value: '*', label: 'All Updates' },
        ],
        default: 'message',
      },
    ],
    optionalFields: [],
    defaultMockData: [
      { json: { message_id: 123, from: { id: 123456, first_name: "John" }, text: "Hello" } },
    ],
  },

  slack_message: {
    id: 'slack_message',
    name: 'Slack Event',
    description: 'Trigger when a Slack event occurs',
    icon: '💼',
    color: '#4A154B',
    version: '1.0',
    testable: true,
    parameters: [
      {
        key: 'credential',
        label: 'Slack Account',
        type: 'credential',
        required: true,
      },
      {
        key: 'event',
        label: 'Event Type',
        type: 'select',
        options: [
          { value: 'message', label: 'New Message' },
          { value: 'reaction_added', label: 'Reaction Added' },
          { value: 'channel_created', label: 'Channel Created' },
          { value: 'user_joined', label: 'User Joined Channel' },
        ],
        default: 'message',
      },
    ],
    optionalFields: [
      { key: 'channel', label: 'Filter by Channel', type: 'string' },
    ],
    defaultMockData: [
      { json: { event: { type: "message", text: "Hello team!", user: "U12345", channel: "C12345" } } },
    ],
  },

  gmail_received: {
    id: 'gmail_received',
    name: 'Gmail Trigger',
    description: 'Trigger when a new email is received',
    icon: '📧',
    color: '#EA4335',
    version: '1.0',
    testable: true,
    parameters: [
      {
        key: 'credential',
        label: 'Gmail Account',
        type: 'credential',
        required: true,
      },
      {
        key: 'pollInterval',
        label: 'Check Every',
        type: 'select',
        options: [
          { value: '1', label: '1 minute' },
          { value: '5', label: '5 minutes' },
          { value: '15', label: '15 minutes' },
          { value: '60', label: '1 hour' },
        ],
        default: '5',
      },
    ],
    optionalFields: [
      { key: 'labelFilter', label: 'Filter by Label', type: 'string' },
      { key: 'fromFilter', label: 'Filter by Sender', type: 'string' },
    ],
    defaultMockData: [
      { json: { id: "msg123", from: "sender@example.com", subject: "Hello!", snippet: "This is a test email..." } },
    ],
  },

  stripe_payment: {
    id: 'stripe_payment',
    name: 'Stripe Webhook',
    description: 'Trigger when a Stripe event occurs',
    icon: '💳',
    color: '#635BFF',
    version: '1.0',
    testable: true,
    parameters: [
      {
        key: 'credential',
        label: 'Stripe Account',
        type: 'credential',
        required: true,
      },
      {
        key: 'events',
        label: 'Events',
        type: 'multiSelect',
        options: [
          { value: 'payment_intent.succeeded', label: 'Payment Succeeded' },
          { value: 'payment_intent.failed', label: 'Payment Failed' },
          { value: 'customer.subscription.created', label: 'Subscription Created' },
          { value: 'invoice.paid', label: 'Invoice Paid' },
          { value: 'checkout.session.completed', label: 'Checkout Completed' },
        ],
        default: ['payment_intent.succeeded'],
      },
    ],
    optionalFields: [],
    defaultMockData: [
      { json: { type: "payment_intent.succeeded", data: { object: { amount: 2000, currency: "usd" } } } },
    ],
  },

  notion_page: {
    id: 'notion_page',
    name: 'Notion Trigger',
    description: 'Trigger when a Notion page changes',
    icon: '📓',
    color: '#000000',
    version: '1.0',
    testable: true,
    parameters: [
      {
        key: 'credential',
        label: 'Notion Account',
        type: 'credential',
        required: true,
      },
      {
        key: 'databaseId',
        label: 'Database',
        type: 'string',
        description: 'Select the database to watch',
        required: true,
      },
      {
        key: 'event',
        label: 'Trigger On',
        type: 'select',
        options: [
          { value: 'pageAdded', label: 'Page Added' },
          { value: 'pageUpdated', label: 'Page Updated' },
        ],
        default: 'pageAdded',
      },
    ],
    optionalFields: [],
    defaultMockData: [
      { json: { id: "page123", title: "New Page", properties: {}, created_time: new Date().toISOString() } },
    ],
  },

  form: {
    id: 'form',
    name: 'Form Submission',
    description: 'Generate a form and trigger when submitted',
    icon: '📋',
    color: '#EC4899',
    version: '1.0',
    testable: true,
    testButtonLabel: 'Open form',
    parameters: [
      {
        key: 'formTitle',
        label: 'Form Title',
        type: 'string',
        default: 'Contact Form',
      },
      {
        key: 'respondMode',
        label: 'Respond Mode',
        type: 'select',
        options: [
          { value: 'formSubmitted', label: 'When Form Submitted' },
          { value: 'responseNodes', label: 'Using Response Nodes' },
        ],
        default: 'formSubmitted',
      },
    ],
    optionalFields: [
      { key: 'formDescription', label: 'Form Description', type: 'string' },
    ],
    defaultMockData: [
      { json: { formSubmission: { name: "John Doe", email: "john@example.com", message: "Hello!" } } },
    ],
  },

  execute_workflow: {
    id: 'execute_workflow',
    name: 'Execute Workflow Trigger',
    description: 'Trigger when called by another workflow',
    icon: '🔄',
    color: '#3B82F6',
    version: '1.0',
    parameters: [
      {
        key: 'workflowInputs',
        label: 'Define Workflow Inputs',
        type: 'json',
        description: 'Define the expected input schema',
        default: '{ "input": "string" }',
      },
    ],
    optionalFields: [],
    defaultMockData: [
      { json: { input: "Data passed from parent workflow" } },
    ],
  },
};

// ============================================
// MOCK DATA EDITOR
// ============================================

interface MockDataEditorProps {
  data: MockDataItem[];
  onChange: (data: MockDataItem[]) => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

function MockDataEditor({ data, onChange, isEditing, onEditToggle }: MockDataEditorProps) {
  const [jsonText, setJsonText] = useState(() => 
    JSON.stringify(data.map(d => d.json), null, 2)
  );
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      onChange(items.map(json => ({ json })));
      setError(null);
      onEditToggle();
    } catch (e) {
      setError('Invalid JSON format');
    }
  }, [jsonText, onChange, onEditToggle]);

  if (!isEditing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
        <Zap className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No trigger output</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Test this trigger
          </Button>
          <span className="text-sm">or</span>
          <Button variant="ghost" size="sm" className="text-primary" onClick={onEditToggle}>
            set mock data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <span className="font-medium text-sm">EDIT OUTPUT</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onEditToggle}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground">
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </div>
      <div className="flex-1 p-3">
        <Textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="font-mono text-sm h-full min-h-[300px] resize-none"
          placeholder="Enter JSON data..."
        />
        {error && (
          <p className="text-xs text-destructive mt-2">{error}</p>
        )}
      </div>
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          You can copy data from previous executions and paste it above.
        </p>
      </div>
    </div>
  );
}

// ============================================
// ADD FIELD DROPDOWN
// ============================================

interface AddFieldDropdownProps {
  fields: NodeOptionalField[];
  addedFields: string[];
  onAddField: (fieldKey: string) => void;
}

function AddFieldDropdown({ fields, addedFields, onAddField }: AddFieldDropdownProps) {
  const availableFields = fields.filter(f => !addedFields.includes(f.key));
  
  if (availableFields.length === 0) return null;

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between" size="sm">
          Add Field
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 border rounded-md bg-background">
        {availableFields.map((field) => (
          <button
            key={field.key}
            onClick={() => onAddField(field.key)}
            className="w-full text-left px-3 py-2 hover:bg-muted text-sm transition-colors"
          >
            {field.label}
          </button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================
// PARAMETER FIELD RENDERER
// ============================================

interface ParameterFieldProps {
  param: NodeParameter | NodeOptionalField;
  value: any;
  onChange: (value: any) => void;
  onRemove?: () => void;
  isOptional?: boolean;
}

function ParameterField({ param, value, onChange, onRemove, isOptional }: ParameterFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {param.label}
          {('required' in param && param.required) && <span className="text-destructive ml-1">*</span>}
        </Label>
        {isOptional && onRemove && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {param.type === 'boolean' && (
        <div className="flex items-center gap-2">
          <Switch
            checked={value ?? param.default ?? false}
            onCheckedChange={onChange}
          />
          {('description' in param && param.description) && (
            <span className="text-xs text-muted-foreground">{param.description}</span>
          )}
        </div>
      )}
      
      {param.type === 'string' && (
        <Input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={'placeholder' in param ? param.placeholder : ''}
        />
      )}
      
      {param.type === 'number' && (
        <Input
          type="number"
          value={value ?? param.default ?? 0}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        />
      )}
      
      {param.type === 'select' && param.options && (
        <Select value={value ?? param.default} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {param.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {param.type === 'credential' && (
        <Select value={value ?? ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select credential..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">+ Create new credential</SelectItem>
            <Separator className="my-1" />
            <SelectItem value="saved_cred_1">My WhatsApp Account</SelectItem>
          </SelectContent>
        </Select>
      )}

      {param.type === 'json' && (
        <Textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              onChange(e.target.value);
            }
          }}
          className="font-mono text-sm min-h-[100px]"
        />
      )}
      
      {('description' in param && param.description && param.type !== 'boolean') && (
        <p className="text-xs text-muted-foreground">{param.description}</p>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function N8nNodeConfigModal({
  isOpen,
  onClose,
  node,
  nodeConfig: providedNodeConfig,
  onSave,
  onTest,
  onDelete,
}: N8nNodeConfigModalProps) {
  // Auto-detect nodeConfig from node's triggerId or appId
  const nodeConfig = useMemo(() => {
    if (providedNodeConfig) return providedNodeConfig;
    if (!node) return null;
    
    // Try to find config by triggerId first, then by appId
    const configId = node.triggerId || node.appId || '';
    return triggerConfigs[configId] || triggerConfigs[configId.toLowerCase()] || null;
  }, [node, providedNodeConfig]);

  const [activeTab, setActiveTab] = useState<'parameters' | 'settings'>('parameters');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [settings, setSettings] = useState<NodeSettingsConfig>({
    alwaysOutputData: false,
    executeOnce: false,
    retryOnFail: false,
    onError: 'stopWorkflow',
    notes: '',
    displayNoteInFlow: false,
  });
  const [addedOptionalFields, setAddedOptionalFields] = useState<string[]>([]);
  const [mockData, setMockData] = useState<MockDataItem[]>(nodeConfig?.defaultMockData || []);
  const [isEditingMockData, setIsEditingMockData] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);

  // Reset state when node changes
  React.useEffect(() => {
    if (node) {
      setConfig(node.config || {});
      setMockData(nodeConfig?.defaultMockData || []);
      setAddedOptionalFields([]);
      setTestResult(null);
    }
  }, [node?.id, nodeConfig]);

  const handleAddOptionalField = useCallback((fieldKey: string) => {
    setAddedOptionalFields(prev => [...prev, fieldKey]);
  }, []);

  const handleRemoveOptionalField = useCallback((fieldKey: string) => {
    setAddedOptionalFields(prev => prev.filter(k => k !== fieldKey));
    setConfig(prev => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    if (node) {
      onSave(node.id, config, settings);
      onClose();
    }
  }, [node, config, settings, onSave, onClose]);

  const handleTest = useCallback(async () => {
    if (!node || !onTest) return;
    setIsTesting(true);
    try {
      const result = await onTest(node.id);
      setTestResult(result);
      if (result.data) {
        setMockData(Array.isArray(result.data) ? result.data : [{ json: result.data }]);
      }
    } catch (e) {
      setTestResult({ success: false, error: 'Test failed' });
    } finally {
      setIsTesting(false);
    }
  }, [node, onTest]);

  // Check if parameter should be visible based on dependencies
  const isParameterVisible = useCallback((param: NodeParameter) => {
    if (!param.dependsOn) return true;
    return config[param.dependsOn.field] === param.dependsOn.value;
  }, [config]);

  if (!isOpen || !node) return null;

  // Fallback config when no specific nodeConfig is found
  const effectiveConfig: TriggerNodeConfig = nodeConfig || {
    id: node.triggerId || node.appId || 'unknown',
    name: node.appName || node.name || 'Configure Node',
    description: node.description || '',
    icon: node.appIcon || '⚙️',
    color: node.appColor || '#6b7280',
    parameters: [],
    optionalFields: [],
    defaultMockData: [{ json: { message: 'Sample data' } }],
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 z-50 bg-background border rounded-lg shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{effectiveConfig.icon}</span>
            <div>
              <h2 className="font-semibold">{effectiveConfig.name}</h2>
              {effectiveConfig.version && (
                <span className="text-xs text-muted-foreground">
                  Version {effectiveConfig.version}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {effectiveConfig.docsUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={effectiveConfig.docsUrl} target="_blank" rel="noopener noreferrer">
                  Docs <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Parameters/Settings */}
          <div className="w-1/2 border-r flex flex-col">
            {/* Tabs */}
            <div className="flex border-b px-4">
              <button
                onClick={() => setActiveTab('parameters')}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === 'parameters'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Parameters
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === 'settings'
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Settings
              </button>
              {effectiveConfig.testable && (
                <div className="ml-auto flex items-center">
                  <Button
                    size="sm"
                    onClick={handleTest}
                    disabled={isTesting}
                    className="bg-[#FF6D5A] hover:bg-[#FF5A45] text-white"
                  >
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {effectiveConfig.testButtonLabel || 'Test'}
                  </Button>
                </div>
              )}
            </div>

            {/* Tab Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {activeTab === 'parameters' && (
                  <>
                    {/* Required Parameters */}
                    {effectiveConfig.parameters
                      .filter(isParameterVisible)
                      .map((param) => (
                        <ParameterField
                          key={param.key}
                          param={param}
                          value={config[param.key]}
                          onChange={(value) => setConfig(prev => ({ ...prev, [param.key]: value }))}
                        />
                      ))}

                    {/* Options Section (Optional Fields) */}
                    {effectiveConfig.optionalFields.length > 0 && (
                      <div className="pt-4">
                        <Separator className="mb-4" />
                        <h3 className="text-sm font-medium mb-3">Options</h3>
                        
                        {/* Added optional fields */}
                        {addedOptionalFields.map((fieldKey) => {
                          const field = effectiveConfig.optionalFields.find(f => f.key === fieldKey);
                          if (!field) return null;
                          return (
                            <div key={fieldKey} className="mb-4">
                              <ParameterField
                                param={field}
                                value={config[fieldKey]}
                                onChange={(value) => setConfig(prev => ({ ...prev, [fieldKey]: value }))}
                                onRemove={() => handleRemoveOptionalField(fieldKey)}
                                isOptional
                              />
                            </div>
                          );
                        })}
                        
                        {/* No properties message */}
                        {addedOptionalFields.length === 0 && (
                          <p className="text-sm text-muted-foreground mb-3">No properties</p>
                        )}
                        
                        {/* Add Field dropdown */}
                        <AddFieldDropdown
                          fields={effectiveConfig.optionalFields}
                          addedFields={addedOptionalFields}
                          onAddField={handleAddOptionalField}
                        />
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <ParameterField
                      param={{ key: 'alwaysOutputData', label: 'Always Output Data', type: 'boolean' }}
                      value={settings.alwaysOutputData}
                      onChange={(v) => setSettings(prev => ({ ...prev, alwaysOutputData: v }))}
                    />
                    <ParameterField
                      param={{ key: 'executeOnce', label: 'Execute Once', type: 'boolean' }}
                      value={settings.executeOnce}
                      onChange={(v) => setSettings(prev => ({ ...prev, executeOnce: v }))}
                    />
                    <ParameterField
                      param={{ key: 'retryOnFail', label: 'Retry On Fail', type: 'boolean' }}
                      value={settings.retryOnFail}
                      onChange={(v) => setSettings(prev => ({ ...prev, retryOnFail: v }))}
                    />
                    <ParameterField
                      param={{ 
                        key: 'onError', 
                        label: 'On Error', 
                        type: 'select',
                        options: [
                          { value: 'stopWorkflow', label: 'Stop Workflow' },
                          { value: 'continueRegularOutput', label: 'Continue (Regular Output)' },
                          { value: 'continueErrorOutput', label: 'Continue (Error Output)' },
                        ]
                      }}
                      value={settings.onError}
                      onChange={(v) => setSettings(prev => ({ ...prev, onError: v }))}
                    />
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={settings.notes}
                        onChange={(e) => setSettings(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add notes about this node..."
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <ParameterField
                      param={{ key: 'displayNoteInFlow', label: 'Display Note in Flow?', type: 'boolean' }}
                      value={settings.displayNoteInFlow}
                      onChange={(v) => setSettings(prev => ({ ...prev, displayNoteInFlow: v }))}
                    />

                    <Separator />
                    
                    <div className="text-xs text-muted-foreground">
                      {effectiveConfig.name} node version {effectiveConfig.version || '1.0'} (Latest)
                    </div>
                    
                    <Button variant="ghost" size="sm" className="text-muted-foreground p-0">
                      💡 I wish this node would...
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Output */}
          <div className="w-1/2 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-sm font-medium text-muted-foreground">OUTPUT</span>
              {!isEditingMockData && mockData.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsEditingMockData(true)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 overflow-hidden">
              {testResult?.success && testResult.data ? (
                <ScrollArea className="h-full">
                  <pre className="p-4 text-sm font-mono">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <MockDataEditor
                  data={mockData}
                  onChange={setMockData}
                  isEditing={isEditingMockData}
                  onEditToggle={() => setIsEditingMockData(!isEditingMockData)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(node.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default N8nNodeConfigModal;
