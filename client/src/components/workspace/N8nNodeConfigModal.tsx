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
  showWhen?: { field: string; value: any };
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

// ============================================
// N8N-STYLE RESOURCE/OPERATION TYPES
// ============================================

/** Parameters specific to an operation */
export interface OperationParameter extends NodeParameter {
  showWhen?: { operation: string[] };
}

/** An operation that can be performed on a resource */
export interface NodeOperation {
  value: string;
  label: string;
  description?: string;
  parameters: OperationParameter[];
  optionalFields?: NodeOptionalField[];
}

/** A resource type within an app node (e.g., Message, Draft, Label for Gmail) */
export interface NodeResource {
  value: string;
  label: string;
  description?: string;
  operations: NodeOperation[];
}

/** App node configuration with Resource → Operation → Parameters structure */
export interface AppNodeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  docsUrl?: string;
  version?: string;
  category: 'app' | 'trigger' | 'core';
  
  // Credential configuration
  credentialType?: string;
  credentialRequired?: boolean;
  
  // Resource-based structure (n8n style)
  resources: NodeResource[];
  
  // Default mock data for testing
  defaultMockData?: MockDataItem[];
  testable?: boolean;
  testButtonLabel?: string;
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
  appNodeConfig?: AppNodeConfig | null;  // n8n-style app node with Resource/Operation
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
// APP NODE CONFIGURATIONS (n8n-style Resource/Operation)
// ============================================

export const appNodeConfigs: Record<string, AppNodeConfig> = {
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    description: 'Read, send, and manage emails in Gmail',
    icon: '📧',
    color: '#EA4335',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/',
    version: '2.1',
    category: 'app',
    credentialType: 'googleOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'message',
        label: 'Message',
        description: 'Operations on email messages',
        operations: [
          {
            value: 'send',
            label: 'Send',
            description: 'Send a new email message',
            parameters: [
              { key: 'to', label: 'To', type: 'string', required: true, placeholder: 'recipient@example.com', description: 'Email address of the recipient' },
              { key: 'subject', label: 'Subject', type: 'string', required: true, placeholder: 'Email subject' },
              { key: 'emailType', label: 'Email Type', type: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'html', label: 'HTML' }], default: 'text' },
              { key: 'message', label: 'Message', type: 'string', required: true, placeholder: 'Email body content' },
            ],
            optionalFields: [
              { key: 'cc', label: 'CC', type: 'string' },
              { key: 'bcc', label: 'BCC', type: 'string' },
              { key: 'senderName', label: 'Sender Name', type: 'string' },
              { key: 'replyTo', label: 'Reply To', type: 'string' },
              { key: 'attachments', label: 'Attachments', type: 'string', description: 'Attachment field name from input' },
            ],
          },
          {
            value: 'reply',
            label: 'Reply',
            description: 'Reply to an existing email',
            parameters: [
              { key: 'messageId', label: 'Message ID', type: 'string', required: true, description: 'ID of the message to reply to' },
              { key: 'emailType', label: 'Email Type', type: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'html', label: 'HTML' }], default: 'text' },
              { key: 'message', label: 'Message', type: 'string', required: true, placeholder: 'Reply content' },
            ],
            optionalFields: [
              { key: 'cc', label: 'CC', type: 'string' },
              { key: 'bcc', label: 'BCC', type: 'string' },
              { key: 'replyToSenderOnly', label: 'Reply to Sender Only', type: 'boolean', default: false },
            ],
          },
          {
            value: 'get',
            label: 'Get',
            description: 'Get a single message by ID',
            parameters: [
              { key: 'messageId', label: 'Message ID', type: 'string', required: true, description: 'ID of the message to retrieve' },
              { key: 'simplify', label: 'Simplify', type: 'boolean', default: true, description: 'Return simplified response' },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get multiple messages',
            parameters: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false, description: 'Return all messages' },
              { key: 'limit', label: 'Limit', type: 'number', default: 50, description: 'Maximum number of messages' },
              { key: 'simplify', label: 'Simplify', type: 'boolean', default: true },
            ],
            optionalFields: [
              { key: 'labelIds', label: 'Label Names or IDs', type: 'string' },
              { key: 'search', label: 'Search', type: 'string', description: 'Gmail search query (e.g., from:sender@example.com)' },
              { key: 'readStatus', label: 'Read Status', type: 'select', options: [{ value: 'all', label: 'All' }, { value: 'unread', label: 'Unread Only' }, { value: 'read', label: 'Read Only' }], default: 'all' },
              { key: 'receivedAfter', label: 'Received After', type: 'string' },
              { key: 'receivedBefore', label: 'Received Before', type: 'string' },
            ],
          },
          {
            value: 'delete',
            label: 'Delete',
            description: 'Permanently delete a message',
            parameters: [
              { key: 'messageId', label: 'Message ID', type: 'string', required: true, description: 'ID of the message to delete' },
            ],
            optionalFields: [],
          },
          {
            value: 'markAsRead',
            label: 'Mark as Read',
            description: 'Mark a message as read',
            parameters: [
              { key: 'messageId', label: 'Message ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'markAsUnread',
            label: 'Mark as Unread',
            description: 'Mark a message as unread',
            parameters: [
              { key: 'messageId', label: 'Message ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'addLabel',
            label: 'Add Label',
            description: 'Add labels to a message',
            parameters: [
              { key: 'messageId', label: 'Message ID', type: 'string', required: true },
              { key: 'labelIds', label: 'Label Names or IDs', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'removeLabel',
            label: 'Remove Label',
            description: 'Remove labels from a message',
            parameters: [
              { key: 'messageId', label: 'Message ID', type: 'string', required: true },
              { key: 'labelIds', label: 'Label Names or IDs', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
      {
        value: 'draft',
        label: 'Draft',
        description: 'Operations on email drafts',
        operations: [
          {
            value: 'create',
            label: 'Create',
            description: 'Create a new draft',
            parameters: [
              { key: 'to', label: 'To', type: 'string', placeholder: 'recipient@example.com' },
              { key: 'subject', label: 'Subject', type: 'string', placeholder: 'Draft subject' },
              { key: 'emailType', label: 'Email Type', type: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'html', label: 'HTML' }], default: 'text' },
              { key: 'message', label: 'Message', type: 'string', placeholder: 'Draft content' },
            ],
            optionalFields: [
              { key: 'cc', label: 'CC', type: 'string' },
              { key: 'bcc', label: 'BCC', type: 'string' },
            ],
          },
          {
            value: 'get',
            label: 'Get',
            description: 'Get a draft by ID',
            parameters: [
              { key: 'draftId', label: 'Draft ID', type: 'string', required: true },
              { key: 'simplify', label: 'Simplify', type: 'boolean', default: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get multiple drafts',
            parameters: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
            optionalFields: [],
          },
          {
            value: 'delete',
            label: 'Delete',
            description: 'Delete a draft',
            parameters: [
              { key: 'draftId', label: 'Draft ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
      {
        value: 'label',
        label: 'Label',
        description: 'Operations on Gmail labels',
        operations: [
          {
            value: 'create',
            label: 'Create',
            description: 'Create a new label',
            parameters: [
              { key: 'name', label: 'Name', type: 'string', required: true, placeholder: 'Label name' },
            ],
            optionalFields: [
              { key: 'labelListVisibility', label: 'Label List Visibility', type: 'select', options: [{ value: 'labelShow', label: 'Show' }, { value: 'labelHide', label: 'Hide' }] },
              { key: 'messageListVisibility', label: 'Message List Visibility', type: 'select', options: [{ value: 'show', label: 'Show' }, { value: 'hide', label: 'Hide' }] },
            ],
          },
          {
            value: 'get',
            label: 'Get',
            description: 'Get a label by ID',
            parameters: [
              { key: 'labelId', label: 'Label ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get all labels',
            parameters: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: true },
            ],
            optionalFields: [],
          },
          {
            value: 'delete',
            label: 'Delete',
            description: 'Delete a label',
            parameters: [
              { key: 'labelId', label: 'Label ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
      {
        value: 'thread',
        label: 'Thread',
        description: 'Operations on email threads',
        operations: [
          {
            value: 'get',
            label: 'Get',
            description: 'Get a thread by ID',
            parameters: [
              { key: 'threadId', label: 'Thread ID', type: 'string', required: true },
              { key: 'simplify', label: 'Simplify', type: 'boolean', default: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get multiple threads',
            parameters: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
            optionalFields: [
              { key: 'labelIds', label: 'Label Names or IDs', type: 'string' },
              { key: 'search', label: 'Search', type: 'string' },
            ],
          },
          {
            value: 'delete',
            label: 'Delete',
            description: 'Delete a thread',
            parameters: [
              { key: 'threadId', label: 'Thread ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'reply',
            label: 'Reply',
            description: 'Reply to a thread',
            parameters: [
              { key: 'threadId', label: 'Thread ID', type: 'string', required: true },
              { key: 'emailType', label: 'Email Type', type: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'html', label: 'HTML' }], default: 'text' },
              { key: 'message', label: 'Message', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'addLabel',
            label: 'Add Label',
            description: 'Add labels to a thread',
            parameters: [
              { key: 'threadId', label: 'Thread ID', type: 'string', required: true },
              { key: 'labelIds', label: 'Label Names or IDs', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'removeLabel',
            label: 'Remove Label',
            description: 'Remove labels from a thread',
            parameters: [
              { key: 'threadId', label: 'Thread ID', type: 'string', required: true },
              { key: 'labelIds', label: 'Label Names or IDs', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'trash',
            label: 'Trash',
            description: 'Move thread to trash',
            parameters: [
              { key: 'threadId', label: 'Thread ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'untrash',
            label: 'Untrash',
            description: 'Remove thread from trash',
            parameters: [
              { key: 'threadId', label: 'Thread ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
    ],
    defaultMockData: [
      { json: { id: "msg123", threadId: "thread123", from: "sender@example.com", to: "recipient@example.com", subject: "Test Email", snippet: "This is a test email..." } },
    ],
  },

  slack: {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages and manage channels in Slack',
    icon: '💼',
    color: '#4A154B',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.slack/',
    version: '2.2',
    category: 'app',
    credentialType: 'slackOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'message',
        label: 'Message',
        description: 'Send and manage messages',
        operations: [
          {
            value: 'send',
            label: 'Send',
            description: 'Send a message to a channel',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true, placeholder: '#general or C1234567890', description: 'Channel name or ID' },
              { key: 'text', label: 'Text', type: 'string', required: true, placeholder: 'Message text' },
            ],
            optionalFields: [
              { key: 'username', label: 'Username', type: 'string', description: 'Custom username for the message' },
              { key: 'asUser', label: 'Send as User', type: 'boolean', default: false },
              { key: 'attachments', label: 'Attachments', type: 'json' },
              { key: 'blocks', label: 'Blocks', type: 'json', description: 'Slack Block Kit elements' },
              { key: 'threadTs', label: 'Thread Timestamp', type: 'string', description: 'Reply in thread' },
            ],
          },
          {
            value: 'update',
            label: 'Update',
            description: 'Update an existing message',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true },
              { key: 'ts', label: 'Message Timestamp', type: 'string', required: true },
              { key: 'text', label: 'Text', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'delete',
            label: 'Delete',
            description: 'Delete a message',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true },
              { key: 'ts', label: 'Message Timestamp', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getPermalink',
            label: 'Get Permalink',
            description: 'Get permanent link to a message',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true },
              { key: 'ts', label: 'Message Timestamp', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
      {
        value: 'channel',
        label: 'Channel',
        description: 'Manage Slack channels',
        operations: [
          {
            value: 'create',
            label: 'Create',
            description: 'Create a new channel',
            parameters: [
              { key: 'name', label: 'Channel Name', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'isPrivate', label: 'Private Channel', type: 'boolean', default: false },
            ],
          },
          {
            value: 'get',
            label: 'Get',
            description: 'Get channel info',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get list of channels',
            parameters: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
            optionalFields: [
              { key: 'excludeArchived', label: 'Exclude Archived', type: 'boolean', default: true },
            ],
          },
          {
            value: 'archive',
            label: 'Archive',
            description: 'Archive a channel',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'unarchive',
            label: 'Unarchive',
            description: 'Unarchive a channel',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'invite',
            label: 'Invite',
            description: 'Invite user to channel',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true },
              { key: 'users', label: 'User IDs', type: 'string', required: true, description: 'Comma-separated user IDs' },
            ],
            optionalFields: [],
          },
          {
            value: 'kick',
            label: 'Kick',
            description: 'Remove user from channel',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true },
              { key: 'user', label: 'User ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
      {
        value: 'user',
        label: 'User',
        description: 'Manage Slack users',
        operations: [
          {
            value: 'get',
            label: 'Get',
            description: 'Get user info',
            parameters: [
              { key: 'user', label: 'User ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get list of users',
            parameters: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
            optionalFields: [],
          },
          {
            value: 'getPresence',
            label: 'Get Presence',
            description: 'Get user presence status',
            parameters: [
              { key: 'user', label: 'User ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
      {
        value: 'reaction',
        label: 'Reaction',
        description: 'Add or remove reactions',
        operations: [
          {
            value: 'add',
            label: 'Add',
            description: 'Add a reaction to a message',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true },
              { key: 'ts', label: 'Message Timestamp', type: 'string', required: true },
              { key: 'name', label: 'Emoji Name', type: 'string', required: true, placeholder: 'thumbsup' },
            ],
            optionalFields: [],
          },
          {
            value: 'remove',
            label: 'Remove',
            description: 'Remove a reaction from a message',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true },
              { key: 'ts', label: 'Message Timestamp', type: 'string', required: true },
              { key: 'name', label: 'Emoji Name', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'get',
            label: 'Get',
            description: 'Get reactions for a message',
            parameters: [
              { key: 'channel', label: 'Channel', type: 'string', required: true },
              { key: 'ts', label: 'Message Timestamp', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
      {
        value: 'file',
        label: 'File',
        description: 'Upload and manage files',
        operations: [
          {
            value: 'upload',
            label: 'Upload',
            description: 'Upload a file to Slack',
            parameters: [
              { key: 'channels', label: 'Channels', type: 'string', required: true, description: 'Comma-separated channel IDs' },
              { key: 'binaryPropertyName', label: 'Binary Property', type: 'string', default: 'data' },
            ],
            optionalFields: [
              { key: 'title', label: 'Title', type: 'string' },
              { key: 'initialComment', label: 'Initial Comment', type: 'string' },
            ],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get list of files',
            parameters: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
            optionalFields: [
              { key: 'channel', label: 'Channel', type: 'string' },
              { key: 'user', label: 'User', type: 'string' },
            ],
          },
        ],
      },
    ],
    defaultMockData: [
      { json: { ok: true, channel: "C1234567890", ts: "1234567890.123456", message: { text: "Hello World" } } },
    ],
  },

  telegram: {
    id: 'telegram',
    name: 'Telegram',
    description: 'Send messages and manage bots in Telegram',
    icon: '✈️',
    color: '#0088CC',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/',
    version: '1.2',
    category: 'app',
    credentialType: 'telegramApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'message',
        label: 'Message',
        description: 'Send and manage messages',
        operations: [
          {
            value: 'sendMessage',
            label: 'Send Message',
            description: 'Send a text message',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true, description: 'Unique identifier for the target chat' },
              { key: 'text', label: 'Text', type: 'string', required: true, placeholder: 'Message text' },
            ],
            optionalFields: [
              { key: 'parseMode', label: 'Parse Mode', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'Markdown', label: 'Markdown' }, { value: 'HTML', label: 'HTML' }] },
              { key: 'disableNotification', label: 'Disable Notification', type: 'boolean', default: false },
              { key: 'replyToMessageId', label: 'Reply To Message ID', type: 'string' },
            ],
          },
          {
            value: 'sendPhoto',
            label: 'Send Photo',
            description: 'Send a photo',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
              { key: 'binaryPropertyName', label: 'Binary Property', type: 'string', default: 'data' },
            ],
            optionalFields: [
              { key: 'caption', label: 'Caption', type: 'string' },
            ],
          },
          {
            value: 'sendDocument',
            label: 'Send Document',
            description: 'Send a document/file',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
              { key: 'binaryPropertyName', label: 'Binary Property', type: 'string', default: 'data' },
            ],
            optionalFields: [
              { key: 'caption', label: 'Caption', type: 'string' },
            ],
          },
          {
            value: 'sendSticker',
            label: 'Send Sticker',
            description: 'Send a sticker',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
              { key: 'sticker', label: 'Sticker', type: 'string', required: true, description: 'File ID or URL' },
            ],
            optionalFields: [],
          },
          {
            value: 'editMessageText',
            label: 'Edit Message Text',
            description: 'Edit a text message',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
              { key: 'messageId', label: 'Message ID', type: 'string', required: true },
              { key: 'text', label: 'Text', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'parseMode', label: 'Parse Mode', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'Markdown', label: 'Markdown' }, { value: 'HTML', label: 'HTML' }] },
            ],
          },
          {
            value: 'deleteMessage',
            label: 'Delete Message',
            description: 'Delete a message',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
              { key: 'messageId', label: 'Message ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'pinChatMessage',
            label: 'Pin Message',
            description: 'Pin a message in a chat',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
              { key: 'messageId', label: 'Message ID', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'disableNotification', label: 'Disable Notification', type: 'boolean', default: false },
            ],
          },
          {
            value: 'unpinChatMessage',
            label: 'Unpin Message',
            description: 'Unpin a message in a chat',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
              { key: 'messageId', label: 'Message ID', type: 'string' },
            ],
            optionalFields: [],
          },
        ],
      },
      {
        value: 'chat',
        label: 'Chat',
        description: 'Manage chats and groups',
        operations: [
          {
            value: 'get',
            label: 'Get',
            description: 'Get chat information',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'leave',
            label: 'Leave',
            description: 'Leave a group chat',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMemberCount',
            label: 'Get Member Count',
            description: 'Get number of members in a chat',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'setDescription',
            label: 'Set Description',
            description: 'Set chat description',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
              { key: 'description', label: 'Description', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'setTitle',
            label: 'Set Title',
            description: 'Set chat title',
            parameters: [
              { key: 'chatId', label: 'Chat ID', type: 'string', required: true },
              { key: 'title', label: 'Title', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
      {
        value: 'callback',
        label: 'Callback',
        description: 'Handle callback queries',
        operations: [
          {
            value: 'answerQuery',
            label: 'Answer Query',
            description: 'Answer a callback query',
            parameters: [
              { key: 'queryId', label: 'Query ID', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'text', label: 'Text', type: 'string' },
              { key: 'showAlert', label: 'Show Alert', type: 'boolean', default: false },
            ],
          },
          {
            value: 'answerInlineQuery',
            label: 'Answer Inline Query',
            description: 'Answer an inline query',
            parameters: [
              { key: 'queryId', label: 'Query ID', type: 'string', required: true },
              { key: 'results', label: 'Results', type: 'json', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
      {
        value: 'file',
        label: 'File',
        description: 'Download files',
        operations: [
          {
            value: 'get',
            label: 'Get',
            description: 'Get file information and download',
            parameters: [
              { key: 'fileId', label: 'File ID', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'download', label: 'Download', type: 'boolean', default: true },
            ],
          },
        ],
      },
    ],
    defaultMockData: [
      { json: { ok: true, result: { message_id: 123, chat: { id: 123456789 }, text: "Hello!" } } },
    ],
  },

  notion: {
    id: 'notion',
    name: 'Notion',
    description: 'Access and manage Notion databases and pages',
    icon: '📝',
    color: '#000000',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.notion/',
    version: '2.2',
    category: 'app',
    credentialType: 'notionApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'database',
        label: 'Database',
        description: 'Work with Notion databases',
        operations: [
          {
            value: 'get',
            label: 'Get',
            description: 'Get a database',
            parameters: [
              { key: 'databaseId', label: 'Database', type: 'string', required: true, description: 'The ID of the database' },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get many databases',
            parameters: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
            ],
            optionalFields: [
              { key: 'limit', label: 'Limit', type: 'number', default: 50, showWhen: { field: 'returnAll', value: false } },
            ],
          },
          {
            value: 'search',
            label: 'Search',
            description: 'Search databases by title',
            parameters: [
              { key: 'text', label: 'Search Text', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
          },
        ],
      },
      {
        value: 'databasePage',
        label: 'Database Page',
        description: 'Work with pages in databases',
        operations: [
          {
            value: 'create',
            label: 'Create',
            description: 'Create a page in a database',
            parameters: [
              { key: 'databaseId', label: 'Database', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'title', label: 'Title', type: 'string' },
              { key: 'properties', label: 'Properties', type: 'json' },
            ],
          },
          {
            value: 'get',
            label: 'Get',
            description: 'Get a database page',
            parameters: [
              { key: 'pageId', label: 'Page ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get many database pages',
            parameters: [
              { key: 'databaseId', label: 'Database', type: 'string', required: true },
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
            ],
            optionalFields: [
              { key: 'limit', label: 'Limit', type: 'number', default: 50, showWhen: { field: 'returnAll', value: false } },
              { key: 'filterType', label: 'Filter Type', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'manual', label: 'Manual' }] },
            ],
          },
          {
            value: 'update',
            label: 'Update',
            description: 'Update a database page',
            parameters: [
              { key: 'pageId', label: 'Page ID', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'properties', label: 'Properties', type: 'json' },
            ],
          },
        ],
      },
      {
        value: 'page',
        label: 'Page',
        description: 'Work with Notion pages',
        operations: [
          {
            value: 'create',
            label: 'Create',
            description: 'Create a page',
            parameters: [
              { key: 'parentPageId', label: 'Parent Page ID', type: 'string', required: true },
              { key: 'title', label: 'Title', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'content', label: 'Content', type: 'string' },
            ],
          },
          {
            value: 'search',
            label: 'Search',
            description: 'Search pages by title',
            parameters: [
              { key: 'text', label: 'Search Text', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
          },
        ],
      },
      {
        value: 'block',
        label: 'Block',
        description: 'Work with content blocks',
        operations: [
          {
            value: 'append',
            label: 'Append',
            description: 'Append blocks to a page',
            parameters: [
              { key: 'blockId', label: 'Block/Page ID', type: 'string', required: true },
              { key: 'blockUi', label: 'Blocks', type: 'json', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get many blocks',
            parameters: [
              { key: 'blockId', label: 'Block/Page ID', type: 'string', required: true },
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
            ],
            optionalFields: [
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
          },
        ],
      },
      {
        value: 'user',
        label: 'User',
        description: 'Get user information',
        operations: [
          {
            value: 'get',
            label: 'Get',
            description: 'Get a user',
            parameters: [
              { key: 'userId', label: 'User ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get many users',
            parameters: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
            ],
            optionalFields: [
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
          },
        ],
      },
    ],
    defaultMockData: [
      { json: { object: "page", id: "page-id-123", properties: { title: { title: [{ plain_text: "My Page" }] } } } },
    ],
  },

  googleSheets: {
    id: 'googleSheets',
    name: 'Google Sheets',
    description: 'Read, update, and write data to Google Sheets',
    icon: '📊',
    color: '#0F9D58',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/',
    version: '4.4',
    category: 'app',
    credentialType: 'googleSheetsOAuth2Api',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'sheet',
        label: 'Sheet Within Document',
        description: 'Work with sheets',
        operations: [
          {
            value: 'appendOrUpdate',
            label: 'Append or Update Row',
            description: 'Append or update a row',
            parameters: [
              { key: 'documentId', label: 'Document', type: 'string', required: true, description: 'Spreadsheet ID or URL' },
              { key: 'sheetName', label: 'Sheet', type: 'string', required: true },
              { key: 'columns', label: 'Mapping Column Mode', type: 'select', options: [{ value: 'autoMapInputData', label: 'Map Automatically' }, { value: 'defineBelow', label: 'Define Below' }] },
            ],
            optionalFields: [
              { key: 'matchingColumns', label: 'Matching Columns', type: 'string' },
            ],
          },
          {
            value: 'append',
            label: 'Append Row',
            description: 'Append a new row',
            parameters: [
              { key: 'documentId', label: 'Document', type: 'string', required: true },
              { key: 'sheetName', label: 'Sheet', type: 'string', required: true },
              { key: 'columns', label: 'Mapping Column Mode', type: 'select', options: [{ value: 'autoMapInputData', label: 'Map Automatically' }, { value: 'defineBelow', label: 'Define Below' }] },
            ],
            optionalFields: [],
          },
          {
            value: 'clear',
            label: 'Clear',
            description: 'Clear data from a sheet',
            parameters: [
              { key: 'documentId', label: 'Document', type: 'string', required: true },
              { key: 'sheetName', label: 'Sheet', type: 'string', required: true },
              { key: 'clear', label: 'Clear', type: 'select', options: [{ value: 'wholeSheet', label: 'Whole Sheet' }, { value: 'specificRows', label: 'Specific Rows' }, { value: 'specificColumns', label: 'Specific Columns' }, { value: 'specificRange', label: 'Specific Range' }] },
            ],
            optionalFields: [],
          },
          {
            value: 'create',
            label: 'Create',
            description: 'Create a new sheet',
            parameters: [
              { key: 'documentId', label: 'Document', type: 'string', required: true },
              { key: 'title', label: 'Title', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'hidden', label: 'Hidden', type: 'boolean', default: false },
            ],
          },
          {
            value: 'delete',
            label: 'Delete',
            description: 'Delete a sheet',
            parameters: [
              { key: 'documentId', label: 'Document', type: 'string', required: true },
              { key: 'sheetName', label: 'Sheet', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'read',
            label: 'Read Rows',
            description: 'Read rows from a sheet',
            parameters: [
              { key: 'documentId', label: 'Document', type: 'string', required: true },
              { key: 'sheetName', label: 'Sheet', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'filtersUI', label: 'Filters', type: 'json' },
              { key: 'options', label: 'Options', type: 'json' },
            ],
          },
          {
            value: 'update',
            label: 'Update Row',
            description: 'Update an existing row',
            parameters: [
              { key: 'documentId', label: 'Document', type: 'string', required: true },
              { key: 'sheetName', label: 'Sheet', type: 'string', required: true },
              { key: 'columns', label: 'Mapping Column Mode', type: 'select', options: [{ value: 'autoMapInputData', label: 'Map Automatically' }, { value: 'defineBelow', label: 'Define Below' }] },
            ],
            optionalFields: [
              { key: 'matchingColumns', label: 'Matching Columns', type: 'string' },
            ],
          },
        ],
      },
      {
        value: 'document',
        label: 'Document',
        description: 'Work with spreadsheet documents',
        operations: [
          {
            value: 'create',
            label: 'Create',
            description: 'Create a new spreadsheet',
            parameters: [
              { key: 'title', label: 'Title', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'sheetsUi', label: 'Sheets', type: 'json' },
            ],
          },
          {
            value: 'delete',
            label: 'Delete',
            description: 'Delete a spreadsheet',
            parameters: [
              { key: 'documentId', label: 'Document', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
    ],
    defaultMockData: [
      { json: { row_number: 2, Name: "John", Email: "john@example.com", Status: "Active" } },
    ],
  },

  httpRequest: {
    id: 'httpRequest',
    name: 'HTTP Request',
    description: 'Make HTTP requests to any API or URL',
    icon: '🌐',
    color: '#6366F1',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/',
    version: '4.2',
    category: 'app',
    credentialType: undefined,
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'request',
        label: 'HTTP Request',
        description: 'Make an HTTP request',
        operations: [
          {
            value: 'get',
            label: 'GET',
            description: 'Send a GET request',
            parameters: [
              { key: 'url', label: 'URL', type: 'string', required: true, placeholder: 'https://api.example.com/data' },
            ],
            optionalFields: [
              { key: 'authentication', label: 'Authentication', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'genericCredentialType', label: 'Generic Credential Type' }, { value: 'predefinedCredentialType', label: 'Predefined Credential Type' }] },
              { key: 'sendHeaders', label: 'Send Headers', type: 'boolean', default: false },
              { key: 'headerParameters', label: 'Header Parameters', type: 'json', showWhen: { field: 'sendHeaders', value: true } },
              { key: 'sendQuery', label: 'Send Query Parameters', type: 'boolean', default: false },
              { key: 'queryParameters', label: 'Query Parameters', type: 'json', showWhen: { field: 'sendQuery', value: true } },
            ],
          },
          {
            value: 'post',
            label: 'POST',
            description: 'Send a POST request',
            parameters: [
              { key: 'url', label: 'URL', type: 'string', required: true, placeholder: 'https://api.example.com/data' },
            ],
            optionalFields: [
              { key: 'authentication', label: 'Authentication', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'genericCredentialType', label: 'Generic Credential Type' }, { value: 'predefinedCredentialType', label: 'Predefined Credential Type' }] },
              { key: 'sendHeaders', label: 'Send Headers', type: 'boolean', default: false },
              { key: 'headerParameters', label: 'Header Parameters', type: 'json', showWhen: { field: 'sendHeaders', value: true } },
              { key: 'contentType', label: 'Content Type', type: 'select', options: [{ value: 'json', label: 'JSON' }, { value: 'form-urlencoded', label: 'Form URL-Encoded' }, { value: 'multipart-form-data', label: 'Multipart Form Data' }, { value: 'raw', label: 'Raw' }] },
              { key: 'body', label: 'Body', type: 'json' },
            ],
          },
          {
            value: 'put',
            label: 'PUT',
            description: 'Send a PUT request',
            parameters: [
              { key: 'url', label: 'URL', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'authentication', label: 'Authentication', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'genericCredentialType', label: 'Generic Credential Type' }] },
              { key: 'contentType', label: 'Content Type', type: 'select', options: [{ value: 'json', label: 'JSON' }, { value: 'form-urlencoded', label: 'Form URL-Encoded' }] },
              { key: 'body', label: 'Body', type: 'json' },
            ],
          },
          {
            value: 'patch',
            label: 'PATCH',
            description: 'Send a PATCH request',
            parameters: [
              { key: 'url', label: 'URL', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'authentication', label: 'Authentication', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'genericCredentialType', label: 'Generic Credential Type' }] },
              { key: 'contentType', label: 'Content Type', type: 'select', options: [{ value: 'json', label: 'JSON' }, { value: 'form-urlencoded', label: 'Form URL-Encoded' }] },
              { key: 'body', label: 'Body', type: 'json' },
            ],
          },
          {
            value: 'delete',
            label: 'DELETE',
            description: 'Send a DELETE request',
            parameters: [
              { key: 'url', label: 'URL', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'authentication', label: 'Authentication', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'genericCredentialType', label: 'Generic Credential Type' }] },
              { key: 'sendHeaders', label: 'Send Headers', type: 'boolean', default: false },
            ],
          },
          {
            value: 'head',
            label: 'HEAD',
            description: 'Send a HEAD request',
            parameters: [
              { key: 'url', label: 'URL', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
    ],
    defaultMockData: [
      { json: { status: 200, headers: {}, body: { success: true, data: [] } } },
    ],
  },

  airtable: {
    id: 'airtable',
    name: 'Airtable',
    description: 'Access and manage Airtable bases and records',
    icon: '📋',
    color: '#18BFFF',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.airtable/',
    version: '2.1',
    category: 'app',
    credentialType: 'airtableTokenApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'record',
        label: 'Record',
        description: 'Work with table records',
        operations: [
          {
            value: 'create',
            label: 'Create',
            description: 'Create a record',
            parameters: [
              { key: 'base', label: 'Base', type: 'string', required: true, description: 'Base ID or URL' },
              { key: 'table', label: 'Table', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'columns', label: 'Mapping Column Mode', type: 'select', options: [{ value: 'autoMapInputData', label: 'Map Automatically' }, { value: 'defineBelow', label: 'Define Below' }] },
              { key: 'typecast', label: 'Typecast', type: 'boolean', default: false },
            ],
          },
          {
            value: 'delete',
            label: 'Delete',
            description: 'Delete a record',
            parameters: [
              { key: 'base', label: 'Base', type: 'string', required: true },
              { key: 'table', label: 'Table', type: 'string', required: true },
              { key: 'id', label: 'Record ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'get',
            label: 'Get',
            description: 'Get a record',
            parameters: [
              { key: 'base', label: 'Base', type: 'string', required: true },
              { key: 'table', label: 'Table', type: 'string', required: true },
              { key: 'id', label: 'Record ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get many records',
            parameters: [
              { key: 'base', label: 'Base', type: 'string', required: true },
              { key: 'table', label: 'Table', type: 'string', required: true },
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
            ],
            optionalFields: [
              { key: 'limit', label: 'Limit', type: 'number', default: 100, showWhen: { field: 'returnAll', value: false } },
              { key: 'filterByFormula', label: 'Filter by Formula', type: 'string' },
              { key: 'sort', label: 'Sort', type: 'json' },
            ],
          },
          {
            value: 'search',
            label: 'Search',
            description: 'Search records',
            parameters: [
              { key: 'base', label: 'Base', type: 'string', required: true },
              { key: 'table', label: 'Table', type: 'string', required: true },
              { key: 'filterByFormula', label: 'Filter by Formula', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
              { key: 'limit', label: 'Limit', type: 'number', default: 100 },
            ],
          },
          {
            value: 'update',
            label: 'Update',
            description: 'Update a record',
            parameters: [
              { key: 'base', label: 'Base', type: 'string', required: true },
              { key: 'table', label: 'Table', type: 'string', required: true },
              { key: 'id', label: 'Record ID', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'columns', label: 'Mapping Column Mode', type: 'select', options: [{ value: 'autoMapInputData', label: 'Map Automatically' }, { value: 'defineBelow', label: 'Define Below' }] },
              { key: 'typecast', label: 'Typecast', type: 'boolean', default: false },
            ],
          },
          {
            value: 'upsert',
            label: 'Upsert',
            description: 'Update or create a record',
            parameters: [
              { key: 'base', label: 'Base', type: 'string', required: true },
              { key: 'table', label: 'Table', type: 'string', required: true },
              { key: 'columns', label: 'Mapping Column Mode', type: 'select', options: [{ value: 'autoMapInputData', label: 'Map Automatically' }, { value: 'defineBelow', label: 'Define Below' }] },
            ],
            optionalFields: [
              { key: 'typecast', label: 'Typecast', type: 'boolean', default: false },
            ],
          },
        ],
      },
    ],
    defaultMockData: [
      { json: { id: "rec123456789", createdTime: "2024-01-01T00:00:00.000Z", fields: { Name: "Example", Status: "Active" } } },
    ],
  },

  discord: {
    id: 'discord',
    name: 'Discord',
    description: 'Send messages and manage Discord servers',
    icon: '🎮',
    color: '#5865F2',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.discord/',
    version: '2.1',
    category: 'app',
    credentialType: 'discordBotApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'message',
        label: 'Message',
        description: 'Send and manage messages',
        operations: [
          {
            value: 'send',
            label: 'Send',
            description: 'Send a message to a channel',
            parameters: [
              { key: 'channelId', label: 'Channel', type: 'string', required: true, description: 'Channel ID' },
              { key: 'content', label: 'Content', type: 'string', required: true },
            ],
            optionalFields: [
              { key: 'embeds', label: 'Embeds', type: 'json' },
              { key: 'tts', label: 'Text to Speech', type: 'boolean', default: false },
            ],
          },
          {
            value: 'delete',
            label: 'Delete',
            description: 'Delete a message',
            parameters: [
              { key: 'channelId', label: 'Channel', type: 'string', required: true },
              { key: 'messageId', label: 'Message ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'get',
            label: 'Get',
            description: 'Get a message',
            parameters: [
              { key: 'channelId', label: 'Channel', type: 'string', required: true },
              { key: 'messageId', label: 'Message ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get many messages from a channel',
            parameters: [
              { key: 'channelId', label: 'Channel', type: 'string', required: true },
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
            ],
            optionalFields: [
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
          },
          {
            value: 'react',
            label: 'React',
            description: 'React to a message',
            parameters: [
              { key: 'channelId', label: 'Channel', type: 'string', required: true },
              { key: 'messageId', label: 'Message ID', type: 'string', required: true },
              { key: 'emoji', label: 'Emoji', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
      {
        value: 'channel',
        label: 'Channel',
        description: 'Manage channels',
        operations: [
          {
            value: 'get',
            label: 'Get',
            description: 'Get a channel',
            parameters: [
              { key: 'channelId', label: 'Channel', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get many channels',
            parameters: [
              { key: 'guildId', label: 'Server', type: 'string', required: true },
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
            ],
            optionalFields: [
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
          },
        ],
      },
      {
        value: 'member',
        label: 'Member',
        description: 'Manage server members',
        operations: [
          {
            value: 'get',
            label: 'Get',
            description: 'Get a member',
            parameters: [
              { key: 'guildId', label: 'Server', type: 'string', required: true },
              { key: 'userId', label: 'User ID', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'getMany',
            label: 'Get Many',
            description: 'Get many members',
            parameters: [
              { key: 'guildId', label: 'Server', type: 'string', required: true },
              { key: 'returnAll', label: 'Return All', type: 'boolean', default: false },
            ],
            optionalFields: [
              { key: 'limit', label: 'Limit', type: 'number', default: 50 },
            ],
          },
          {
            value: 'roleAdd',
            label: 'Add Role',
            description: 'Add a role to a member',
            parameters: [
              { key: 'guildId', label: 'Server', type: 'string', required: true },
              { key: 'userId', label: 'User ID', type: 'string', required: true },
              { key: 'roleId', label: 'Role', type: 'string', required: true },
            ],
            optionalFields: [],
          },
          {
            value: 'roleRemove',
            label: 'Remove Role',
            description: 'Remove a role from a member',
            parameters: [
              { key: 'guildId', label: 'Server', type: 'string', required: true },
              { key: 'userId', label: 'User ID', type: 'string', required: true },
              { key: 'roleId', label: 'Role', type: 'string', required: true },
            ],
            optionalFields: [],
          },
        ],
      },
    ],
    defaultMockData: [
      { json: { id: "1234567890", content: "Hello World!", author: { username: "bot" }, channel_id: "987654321" } },
    ],
  },

  microsoftTeams: {
    id: 'microsoftTeams',
    name: 'Microsoft Teams',
    description: 'Send messages and manage Microsoft Teams',
    icon: '👥',
    color: '#6264A7',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsoftteams/',
    version: '2.0',
    category: 'app',
    credentialType: 'microsoftTeamsOAuth2Api',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'chatMessage',
        label: 'Chat Message',
        description: 'Send and manage chat messages',
        operations: [
          { value: 'create', label: 'Create', description: 'Send a message to a chat', parameters: [{ key: 'chatId', label: 'Chat', type: 'string', required: true }, { key: 'messageType', label: 'Message Type', type: 'select', required: true, options: [{ value: 'text', label: 'Text' }, { value: 'html', label: 'HTML' }] }, { key: 'message', label: 'Message', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a message', parameters: [{ key: 'chatId', label: 'Chat', type: 'string', required: true }, { key: 'messageId', label: 'Message ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many messages', parameters: [{ key: 'chatId', label: 'Chat', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
      {
        value: 'channelMessage',
        label: 'Channel Message',
        description: 'Send messages to channels',
        operations: [
          { value: 'create', label: 'Create', description: 'Send a message to a channel', parameters: [{ key: 'teamId', label: 'Team', type: 'string', required: true }, { key: 'channelId', label: 'Channel', type: 'string', required: true }, { key: 'messageType', label: 'Message Type', type: 'select', required: true, options: [{ value: 'text', label: 'Text' }, { value: 'html', label: 'HTML' }] }, { key: 'message', label: 'Message', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many messages from a channel', parameters: [{ key: 'teamId', label: 'Team', type: 'string', required: true }, { key: 'channelId', label: 'Channel', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
      {
        value: 'channel',
        label: 'Channel',
        description: 'Manage channels',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a channel', parameters: [{ key: 'teamId', label: 'Team', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a channel', parameters: [{ key: 'teamId', label: 'Team', type: 'string', required: true }, { key: 'channelId', label: 'Channel', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a channel', parameters: [{ key: 'teamId', label: 'Team', type: 'string', required: true }, { key: 'channelId', label: 'Channel', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many channels', parameters: [{ key: 'teamId', label: 'Team', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a channel', parameters: [{ key: 'teamId', label: 'Team', type: 'string', required: true }, { key: 'channelId', label: 'Channel', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }] },
        ],
      },
      {
        value: 'task',
        label: 'Task',
        description: 'Manage Planner tasks',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a task', parameters: [{ key: 'groupId', label: 'Group', type: 'string', required: true }, { key: 'planId', label: 'Plan', type: 'string', required: true }, { key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'bucketId', label: 'Bucket', type: 'string' }, { key: 'dueDateTime', label: 'Due Date', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many tasks', parameters: [{ key: 'groupId', label: 'Group', type: 'string', required: true }, { key: 'planId', label: 'Plan', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'percentComplete', label: 'Percent Complete', type: 'number' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "msg123", messageType: "message", body: { content: "Hello!" } } }],
  },

  trello: {
    id: 'trello',
    name: 'Trello',
    description: 'Manage Trello boards, lists, and cards',
    icon: '📋',
    color: '#0079BF',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.trello/',
    version: '1.0',
    category: 'app',
    credentialType: 'trelloApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'board',
        label: 'Board',
        description: 'Manage boards',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a board', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'defaultLists', label: 'Default Lists', type: 'boolean', default: true }] },
          { value: 'delete', label: 'Delete', description: 'Delete a board', parameters: [{ key: 'boardId', label: 'Board', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a board', parameters: [{ key: 'boardId', label: 'Board', type: 'string', required: true }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update a board', parameters: [{ key: 'boardId', label: 'Board', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'closed', label: 'Closed', type: 'boolean' }] },
        ],
      },
      {
        value: 'card',
        label: 'Card',
        description: 'Manage cards',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a card', parameters: [{ key: 'listId', label: 'List', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'due', label: 'Due Date', type: 'string' }, { key: 'position', label: 'Position', type: 'select', options: [{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a card', parameters: [{ key: 'cardId', label: 'Card', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a card', parameters: [{ key: 'cardId', label: 'Card', type: 'string', required: true }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update a card', parameters: [{ key: 'cardId', label: 'Card', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'closed', label: 'Archived', type: 'boolean' }] },
        ],
      },
      {
        value: 'list',
        label: 'List',
        description: 'Manage lists',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a list', parameters: [{ key: 'boardId', label: 'Board', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'position', label: 'Position', type: 'select', options: [{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }] }] },
          { value: 'archive', label: 'Archive', description: 'Archive a list', parameters: [{ key: 'listId', label: 'List', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a list', parameters: [{ key: 'listId', label: 'List', type: 'string', required: true }], optionalFields: [] },
          { value: 'getCards', label: 'Get Cards', description: 'Get cards in list', parameters: [{ key: 'listId', label: 'List', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a list', parameters: [{ key: 'listId', label: 'List', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }] },
        ],
      },
      {
        value: 'checklist',
        label: 'Checklist',
        description: 'Manage checklists',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a checklist', parameters: [{ key: 'cardId', label: 'Card', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a checklist', parameters: [{ key: 'cardId', label: 'Card', type: 'string', required: true }, { key: 'checklistId', label: 'Checklist', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get checklists', parameters: [{ key: 'cardId', label: 'Card', type: 'string', required: true }], optionalFields: [] },
          { value: 'createItem', label: 'Create Item', description: 'Add item to checklist', parameters: [{ key: 'cardId', label: 'Card', type: 'string', required: true }, { key: 'checklistId', label: 'Checklist', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "card123", name: "My Card", idList: "list123", closed: false } }],
  },

  asana: {
    id: 'asana',
    name: 'Asana',
    description: 'Manage Asana projects and tasks',
    icon: '✅',
    color: '#F06A6A',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.asana/',
    version: '1.0',
    category: 'app',
    credentialType: 'asanaApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'task',
        label: 'Task',
        description: 'Manage tasks',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a task', parameters: [{ key: 'workspace', label: 'Workspace', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'assignee', label: 'Assignee', type: 'string' }, { key: 'dueOn', label: 'Due Date', type: 'string' }, { key: 'notes', label: 'Notes', type: 'string' }, { key: 'projects', label: 'Projects', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a task', parameters: [{ key: 'taskId', label: 'Task', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a task', parameters: [{ key: 'taskId', label: 'Task', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many tasks', parameters: [{ key: 'project', label: 'Project', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'move', label: 'Move', description: 'Move to another section', parameters: [{ key: 'taskId', label: 'Task', type: 'string', required: true }, { key: 'section', label: 'Section', type: 'string', required: true }], optionalFields: [] },
          { value: 'search', label: 'Search', description: 'Search tasks', parameters: [{ key: 'workspace', label: 'Workspace', type: 'string', required: true }, { key: 'text', label: 'Search Text', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }] },
          { value: 'update', label: 'Update', description: 'Update a task', parameters: [{ key: 'taskId', label: 'Task', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'completed', label: 'Completed', type: 'boolean' }, { key: 'dueOn', label: 'Due Date', type: 'string' }] },
        ],
      },
      {
        value: 'project',
        label: 'Project',
        description: 'Manage projects',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a project', parameters: [{ key: 'workspace', label: 'Workspace', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'team', label: 'Team', type: 'string' }, { key: 'notes', label: 'Notes', type: 'string' }, { key: 'color', label: 'Color', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a project', parameters: [{ key: 'projectId', label: 'Project', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a project', parameters: [{ key: 'projectId', label: 'Project', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many projects', parameters: [{ key: 'workspace', label: 'Workspace', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a project', parameters: [{ key: 'projectId', label: 'Project', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'notes', label: 'Notes', type: 'string' }] },
        ],
      },
      {
        value: 'subtask',
        label: 'Subtask',
        description: 'Manage subtasks',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a subtask', parameters: [{ key: 'parentTaskId', label: 'Parent Task', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'assignee', label: 'Assignee', type: 'string' }] },
          { value: 'getMany', label: 'Get Many', description: 'Get subtasks', parameters: [{ key: 'parentTaskId', label: 'Parent Task', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'user',
        label: 'User',
        description: 'Get user information',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a user', parameters: [{ key: 'userId', label: 'User', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get users in workspace', parameters: [{ key: 'workspace', label: 'Workspace', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { gid: "task123", name: "My Task", completed: false, workspace: { gid: "ws123" } } }],
  },

  jira: {
    id: 'jira',
    name: 'Jira Software',
    description: 'Manage Jira issues and projects',
    icon: '🎫',
    color: '#0052CC',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.jira/',
    version: '1.0',
    category: 'app',
    credentialType: 'jiraSoftwareCloudApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'issue',
        label: 'Issue',
        description: 'Manage issues',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an issue', parameters: [{ key: 'project', label: 'Project', type: 'string', required: true }, { key: 'issueType', label: 'Issue Type', type: 'select', required: true, options: [{ value: 'Bug', label: 'Bug' }, { value: 'Task', label: 'Task' }, { value: 'Story', label: 'Story' }, { value: 'Epic', label: 'Epic' }] }, { key: 'summary', label: 'Summary', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'assignee', label: 'Assignee', type: 'string' }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: 'Highest', label: 'Highest' }, { value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }, { value: 'Lowest', label: 'Lowest' }] }, { key: 'labels', label: 'Labels', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete an issue', parameters: [{ key: 'issueKey', label: 'Issue Key', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get an issue', parameters: [{ key: 'issueKey', label: 'Issue Key', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many issues using JQL', parameters: [{ key: 'jql', label: 'JQL Query', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'transition', label: 'Transition', description: 'Transition an issue', parameters: [{ key: 'issueKey', label: 'Issue Key', type: 'string', required: true }, { key: 'transitionId', label: 'Transition', type: 'string', required: true }], optionalFields: [{ key: 'comment', label: 'Comment', type: 'string' }] },
          { value: 'update', label: 'Update', description: 'Update an issue', parameters: [{ key: 'issueKey', label: 'Issue Key', type: 'string', required: true }], optionalFields: [{ key: 'summary', label: 'Summary', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'status', label: 'Status', type: 'string' }, { key: 'assignee', label: 'Assignee', type: 'string' }] },
        ],
      },
      {
        value: 'issueComment',
        label: 'Issue Comment',
        description: 'Manage issue comments',
        operations: [
          { value: 'add', label: 'Add', description: 'Add a comment', parameters: [{ key: 'issueKey', label: 'Issue Key', type: 'string', required: true }, { key: 'comment', label: 'Comment', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a comment', parameters: [{ key: 'issueKey', label: 'Issue Key', type: 'string', required: true }, { key: 'commentId', label: 'Comment ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get all comments', parameters: [{ key: 'issueKey', label: 'Issue Key', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'remove', label: 'Remove', description: 'Remove a comment', parameters: [{ key: 'issueKey', label: 'Issue Key', type: 'string', required: true }, { key: 'commentId', label: 'Comment ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update a comment', parameters: [{ key: 'issueKey', label: 'Issue Key', type: 'string', required: true }, { key: 'commentId', label: 'Comment ID', type: 'string', required: true }, { key: 'comment', label: 'Comment', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'user',
        label: 'User',
        description: 'Get user information',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a user', parameters: [{ key: 'accountId', label: 'Account ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { key: "PROJ-123", fields: { summary: "My Issue", status: { name: "To Do" } } } }],
  },

  github: {
    id: 'github',
    name: 'GitHub',
    description: 'Manage GitHub repositories and issues',
    icon: '🐙',
    color: '#24292E',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.github/',
    version: '1.0',
    category: 'app',
    credentialType: 'githubApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'issue',
        label: 'Issue',
        description: 'Manage issues',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an issue', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'body', label: 'Body', type: 'string' }, { key: 'labels', label: 'Labels', type: 'string' }, { key: 'assignees', label: 'Assignees', type: 'string' }] },
          { value: 'createComment', label: 'Create Comment', description: 'Create a comment', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'issueNumber', label: 'Issue Number', type: 'number', required: true }, { key: 'body', label: 'Body', type: 'string', required: true }], optionalFields: [] },
          { value: 'edit', label: 'Edit', description: 'Edit an issue', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'issueNumber', label: 'Issue Number', type: 'number', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'body', label: 'Body', type: 'string' }, { key: 'state', label: 'State', type: 'select', options: [{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }] }] },
          { value: 'get', label: 'Get', description: 'Get an issue', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'issueNumber', label: 'Issue Number', type: 'number', required: true }], optionalFields: [] },
          { value: 'lock', label: 'Lock', description: 'Lock an issue', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'issueNumber', label: 'Issue Number', type: 'number', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'repository',
        label: 'Repository',
        description: 'Manage repositories',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a repository', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }], optionalFields: [] },
          { value: 'getIssues', label: 'Get Issues', description: 'Get repository issues', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }, { key: 'state', label: 'State', type: 'select', options: [{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }] }] },
          { value: 'listPopular', label: 'List Popular', description: 'List popular repositories', parameters: [], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
      {
        value: 'file',
        label: 'File',
        description: 'Manage files',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a file', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'filePath', label: 'File Path', type: 'string', required: true }, { key: 'fileContent', label: 'File Content', type: 'string', required: true }, { key: 'commitMessage', label: 'Commit Message', type: 'string', required: true }], optionalFields: [{ key: 'branch', label: 'Branch', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a file', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'filePath', label: 'File Path', type: 'string', required: true }, { key: 'commitMessage', label: 'Commit Message', type: 'string', required: true }], optionalFields: [{ key: 'branch', label: 'Branch', type: 'string' }] },
          { value: 'edit', label: 'Edit', description: 'Edit a file', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'filePath', label: 'File Path', type: 'string', required: true }, { key: 'fileContent', label: 'File Content', type: 'string', required: true }, { key: 'commitMessage', label: 'Commit Message', type: 'string', required: true }], optionalFields: [{ key: 'branch', label: 'Branch', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a file', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'filePath', label: 'File Path', type: 'string', required: true }], optionalFields: [{ key: 'branch', label: 'Branch', type: 'string' }] },
        ],
      },
      {
        value: 'release',
        label: 'Release',
        description: 'Manage releases',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a release', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'tag', label: 'Tag', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'body', label: 'Body', type: 'string' }, { key: 'draft', label: 'Draft', type: 'boolean' }, { key: 'prerelease', label: 'Prerelease', type: 'boolean' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a release', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'releaseId', label: 'Release ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a release', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'releaseId', label: 'Release ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many releases', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a release', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'releaseId', label: 'Release ID', type: 'string', required: true }], optionalFields: [{ key: 'tag', label: 'Tag', type: 'string' }, { key: 'name', label: 'Name', type: 'string' }, { key: 'body', label: 'Body', type: 'string' }] },
        ],
      },
      {
        value: 'review',
        label: 'Review',
        description: 'Manage pull request reviews',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a review', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'pullRequestNumber', label: 'PR Number', type: 'number', required: true }, { key: 'event', label: 'Event', type: 'select', required: true, options: [{ value: 'APPROVE', label: 'Approve' }, { value: 'REQUEST_CHANGES', label: 'Request Changes' }, { value: 'COMMENT', label: 'Comment' }] }], optionalFields: [{ key: 'body', label: 'Body', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a review', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'pullRequestNumber', label: 'PR Number', type: 'number', required: true }, { key: 'reviewId', label: 'Review ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many reviews', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'pullRequestNumber', label: 'PR Number', type: 'number', required: true }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update a review', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'pullRequestNumber', label: 'PR Number', type: 'number', required: true }, { key: 'reviewId', label: 'Review ID', type: 'string', required: true }, { key: 'body', label: 'Body', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'user',
        label: 'User',
        description: 'Get user information',
        operations: [
          { value: 'getRepositories', label: 'Get Repositories', description: 'Get user repositories', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'invite', label: 'Invite', description: 'Invite user to repository', parameters: [{ key: 'owner', label: 'Repository Owner', type: 'string', required: true }, { key: 'repository', label: 'Repository', type: 'string', required: true }, { key: 'username', label: 'Username', type: 'string', required: true }], optionalFields: [{ key: 'permission', label: 'Permission', type: 'select', options: [{ value: 'pull', label: 'Pull' }, { value: 'push', label: 'Push' }, { value: 'admin', label: 'Admin' }] }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 123456, number: 1, title: "Issue Title", state: "open", html_url: "https://github.com/owner/repo/issues/1" } }],
  },

  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Manage HubSpot CRM contacts, deals, and companies',
    icon: '🧡',
    color: '#FF7A59',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.hubspot/',
    version: '2.0',
    category: 'app',
    credentialType: 'hubspotApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'contact',
        label: 'Contact',
        description: 'Manage contacts',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a contact', parameters: [{ key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [{ key: 'firstName', label: 'First Name', type: 'string' }, { key: 'lastName', label: 'Last Name', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }, { key: 'company', label: 'Company', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many contacts', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'getRecentlyCreated', label: 'Get Recently Created', description: 'Get recently created contacts', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'search', label: 'Search', description: 'Search contacts', parameters: [{ key: 'filterGroups', label: 'Filter Groups', type: 'json', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }] },
          { value: 'update', label: 'Update', description: 'Update a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'firstName', label: 'First Name', type: 'string' }, { key: 'lastName', label: 'Last Name', type: 'string' }] },
        ],
      },
      {
        value: 'company',
        label: 'Company',
        description: 'Manage companies',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a company', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'domain', label: 'Domain', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'industry', label: 'Industry', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a company', parameters: [{ key: 'companyId', label: 'Company ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a company', parameters: [{ key: 'companyId', label: 'Company ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many companies', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'search', label: 'Search', description: 'Search companies', parameters: [{ key: 'filterGroups', label: 'Filter Groups', type: 'json', required: true }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update a company', parameters: [{ key: 'companyId', label: 'Company ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'domain', label: 'Domain', type: 'string' }] },
        ],
      },
      {
        value: 'deal',
        label: 'Deal',
        description: 'Manage deals',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a deal', parameters: [{ key: 'dealName', label: 'Deal Name', type: 'string', required: true }, { key: 'pipeline', label: 'Pipeline', type: 'string', required: true }, { key: 'stage', label: 'Stage', type: 'string', required: true }], optionalFields: [{ key: 'amount', label: 'Amount', type: 'number' }, { key: 'closeDate', label: 'Close Date', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a deal', parameters: [{ key: 'dealId', label: 'Deal ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a deal', parameters: [{ key: 'dealId', label: 'Deal ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many deals', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'search', label: 'Search', description: 'Search deals', parameters: [{ key: 'filterGroups', label: 'Filter Groups', type: 'json', required: true }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update a deal', parameters: [{ key: 'dealId', label: 'Deal ID', type: 'string', required: true }], optionalFields: [{ key: 'dealName', label: 'Deal Name', type: 'string' }, { key: 'stage', label: 'Stage', type: 'string' }, { key: 'amount', label: 'Amount', type: 'number' }] },
        ],
      },
      {
        value: 'ticket',
        label: 'Ticket',
        description: 'Manage tickets',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a ticket', parameters: [{ key: 'pipeline', label: 'Pipeline', type: 'string', required: true }, { key: 'stage', label: 'Stage', type: 'string', required: true }, { key: 'subject', label: 'Subject', type: 'string', required: true }], optionalFields: [{ key: 'content', label: 'Content', type: 'string' }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a ticket', parameters: [{ key: 'ticketId', label: 'Ticket ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a ticket', parameters: [{ key: 'ticketId', label: 'Ticket ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many tickets', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a ticket', parameters: [{ key: 'ticketId', label: 'Ticket ID', type: 'string', required: true }], optionalFields: [{ key: 'subject', label: 'Subject', type: 'string' }, { key: 'stage', label: 'Stage', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "12345", properties: { email: "contact@example.com", firstname: "John", lastname: "Doe" } } }],
  },

  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Manage Salesforce accounts, leads, and opportunities',
    icon: '☁️',
    color: '#00A1E0',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.salesforce/',
    version: '1.0',
    category: 'app',
    credentialType: 'salesforceOAuth2Api',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'account',
        label: 'Account',
        description: 'Manage accounts',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an account', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'type', label: 'Type', type: 'string' }, { key: 'website', label: 'Website', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }, { key: 'industry', label: 'Industry', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete an account', parameters: [{ key: 'accountId', label: 'Account ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get an account', parameters: [{ key: 'accountId', label: 'Account ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many accounts', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update an account', parameters: [{ key: 'accountId', label: 'Account ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'website', label: 'Website', type: 'string' }] },
        ],
      },
      {
        value: 'contact',
        label: 'Contact',
        description: 'Manage contacts',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a contact', parameters: [{ key: 'lastName', label: 'Last Name', type: 'string', required: true }], optionalFields: [{ key: 'firstName', label: 'First Name', type: 'string' }, { key: 'email', label: 'Email', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }, { key: 'accountId', label: 'Account ID', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many contacts', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [{ key: 'firstName', label: 'First Name', type: 'string' }, { key: 'lastName', label: 'Last Name', type: 'string' }, { key: 'email', label: 'Email', type: 'string' }] },
        ],
      },
      {
        value: 'lead',
        label: 'Lead',
        description: 'Manage leads',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a lead', parameters: [{ key: 'company', label: 'Company', type: 'string', required: true }, { key: 'lastName', label: 'Last Name', type: 'string', required: true }], optionalFields: [{ key: 'firstName', label: 'First Name', type: 'string' }, { key: 'email', label: 'Email', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }, { key: 'status', label: 'Status', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a lead', parameters: [{ key: 'leadId', label: 'Lead ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a lead', parameters: [{ key: 'leadId', label: 'Lead ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many leads', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a lead', parameters: [{ key: 'leadId', label: 'Lead ID', type: 'string', required: true }], optionalFields: [{ key: 'company', label: 'Company', type: 'string' }, { key: 'status', label: 'Status', type: 'string' }] },
        ],
      },
      {
        value: 'opportunity',
        label: 'Opportunity',
        description: 'Manage opportunities',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an opportunity', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }, { key: 'stageName', label: 'Stage', type: 'string', required: true }, { key: 'closeDate', label: 'Close Date', type: 'string', required: true }], optionalFields: [{ key: 'amount', label: 'Amount', type: 'number' }, { key: 'probability', label: 'Probability', type: 'number' }, { key: 'accountId', label: 'Account ID', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete an opportunity', parameters: [{ key: 'opportunityId', label: 'Opportunity ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get an opportunity', parameters: [{ key: 'opportunityId', label: 'Opportunity ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many opportunities', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update an opportunity', parameters: [{ key: 'opportunityId', label: 'Opportunity ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'stageName', label: 'Stage', type: 'string' }, { key: 'amount', label: 'Amount', type: 'number' }] },
        ],
      },
      {
        value: 'task',
        label: 'Task',
        description: 'Manage tasks',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a task', parameters: [{ key: 'subject', label: 'Subject', type: 'string', required: true }], optionalFields: [{ key: 'status', label: 'Status', type: 'select', options: [{ value: 'Not Started', label: 'Not Started' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Completed', label: 'Completed' }] }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: 'Low', label: 'Low' }, { value: 'Normal', label: 'Normal' }, { value: 'High', label: 'High' }] }, { key: 'dueDate', label: 'Due Date', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many tasks', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [{ key: 'subject', label: 'Subject', type: 'string' }, { key: 'status', label: 'Status', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { Id: "001xxx", Name: "Acme Corp", Type: "Customer" } }],
  },

  zendesk: {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Manage Zendesk tickets and users',
    icon: '🎧',
    color: '#03363D',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.zendesk/',
    version: '1.0',
    category: 'app',
    credentialType: 'zendeskApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'ticket',
        label: 'Ticket',
        description: 'Manage tickets',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a ticket', parameters: [{ key: 'subject', label: 'Subject', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'type', label: 'Type', type: 'select', options: [{ value: 'problem', label: 'Problem' }, { value: 'incident', label: 'Incident' }, { value: 'question', label: 'Question' }, { value: 'task', label: 'Task' }] }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: 'low', label: 'Low' }, { value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }] }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'new', label: 'New' }, { value: 'open', label: 'Open' }, { value: 'pending', label: 'Pending' }, { value: 'solved', label: 'Solved' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a ticket', parameters: [{ key: 'ticketId', label: 'Ticket ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a ticket', parameters: [{ key: 'ticketId', label: 'Ticket ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many tickets', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'new', label: 'New' }, { value: 'open', label: 'Open' }, { value: 'pending', label: 'Pending' }, { value: 'solved', label: 'Solved' }] }] },
          { value: 'update', label: 'Update', description: 'Update a ticket', parameters: [{ key: 'ticketId', label: 'Ticket ID', type: 'string', required: true }], optionalFields: [{ key: 'subject', label: 'Subject', type: 'string' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'new', label: 'New' }, { value: 'open', label: 'Open' }, { value: 'pending', label: 'Pending' }, { value: 'solved', label: 'Solved' }] }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: 'low', label: 'Low' }, { value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }] }] },
        ],
      },
      {
        value: 'user',
        label: 'User',
        description: 'Manage users',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a user', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }, { key: 'role', label: 'Role', type: 'select', options: [{ value: 'end-user', label: 'End User' }, { value: 'agent', label: 'Agent' }, { value: 'admin', label: 'Admin' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a user', parameters: [{ key: 'userId', label: 'User ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a user', parameters: [{ key: 'userId', label: 'User ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many users', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'search', label: 'Search', description: 'Search users', parameters: [{ key: 'query', label: 'Query', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }] },
          { value: 'update', label: 'Update', description: 'Update a user', parameters: [{ key: 'userId', label: 'User ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'email', label: 'Email', type: 'string' }] },
        ],
      },
      {
        value: 'organization',
        label: 'Organization',
        description: 'Manage organizations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an organization', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'details', label: 'Details', type: 'string' }, { key: 'notes', label: 'Notes', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete an organization', parameters: [{ key: 'organizationId', label: 'Organization ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get an organization', parameters: [{ key: 'organizationId', label: 'Organization ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many organizations', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update an organization', parameters: [{ key: 'organizationId', label: 'Organization ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'details', label: 'Details', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 12345, subject: "Support Request", status: "open", priority: "normal" } }],
  },

  stripe: {
    id: 'stripe',
    name: 'Stripe',
    description: 'Manage Stripe payments, customers, and subscriptions',
    icon: '💳',
    color: '#635BFF',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.stripe/',
    version: '1.0',
    category: 'app',
    credentialType: 'stripeApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'customer',
        label: 'Customer',
        description: 'Manage customers',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a customer', parameters: [], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'name', label: 'Name', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a customer', parameters: [{ key: 'customerId', label: 'Customer ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a customer', parameters: [{ key: 'customerId', label: 'Customer ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many customers', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }, { key: 'email', label: 'Email', type: 'string' }] },
          { value: 'update', label: 'Update', description: 'Update a customer', parameters: [{ key: 'customerId', label: 'Customer ID', type: 'string', required: true }], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'name', label: 'Name', type: 'string' }] },
        ],
      },
      {
        value: 'charge',
        label: 'Charge',
        description: 'Manage charges',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a charge', parameters: [{ key: 'amount', label: 'Amount', type: 'number', required: true }, { key: 'currency', label: 'Currency', type: 'string', required: true }], optionalFields: [{ key: 'customerId', label: 'Customer ID', type: 'string' }, { key: 'source', label: 'Source', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a charge', parameters: [{ key: 'chargeId', label: 'Charge ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many charges', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }, { key: 'customerId', label: 'Customer ID', type: 'string' }] },
          { value: 'update', label: 'Update', description: 'Update a charge', parameters: [{ key: 'chargeId', label: 'Charge ID', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'metadata', label: 'Metadata', type: 'json' }] },
        ],
      },
      {
        value: 'coupon',
        label: 'Coupon',
        description: 'Manage coupons',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a coupon', parameters: [{ key: 'duration', label: 'Duration', type: 'select', required: true, options: [{ value: 'forever', label: 'Forever' }, { value: 'once', label: 'Once' }, { value: 'repeating', label: 'Repeating' }] }], optionalFields: [{ key: 'percentOff', label: 'Percent Off', type: 'number' }, { key: 'amountOff', label: 'Amount Off', type: 'number' }, { key: 'currency', label: 'Currency', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a coupon', parameters: [{ key: 'couponId', label: 'Coupon ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a coupon', parameters: [{ key: 'couponId', label: 'Coupon ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many coupons', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
      {
        value: 'paymentIntent',
        label: 'Payment Intent',
        description: 'Manage payment intents',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a payment intent', parameters: [{ key: 'amount', label: 'Amount', type: 'number', required: true }, { key: 'currency', label: 'Currency', type: 'string', required: true }], optionalFields: [{ key: 'customerId', label: 'Customer ID', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'paymentMethodTypes', label: 'Payment Method Types', type: 'json' }] },
          { value: 'get', label: 'Get', description: 'Get a payment intent', parameters: [{ key: 'paymentIntentId', label: 'Payment Intent ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many payment intents', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a payment intent', parameters: [{ key: 'paymentIntentId', label: 'Payment Intent ID', type: 'string', required: true }], optionalFields: [{ key: 'amount', label: 'Amount', type: 'number' }, { key: 'description', label: 'Description', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "cus_xxx", object: "customer", email: "customer@example.com", name: "John Doe" } }],
  },

  shopify: {
    id: 'shopify',
    name: 'Shopify',
    description: 'Manage Shopify products, orders, and customers',
    icon: '🛒',
    color: '#96BF48',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.shopify/',
    version: '1.0',
    category: 'app',
    credentialType: 'shopifyApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'order',
        label: 'Order',
        description: 'Manage orders',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an order', parameters: [{ key: 'lineItems', label: 'Line Items', type: 'json', required: true }], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'shippingAddress', label: 'Shipping Address', type: 'json' }, { key: 'billingAddress', label: 'Billing Address', type: 'json' }] },
          { value: 'delete', label: 'Delete', description: 'Delete an order', parameters: [{ key: 'orderId', label: 'Order ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get an order', parameters: [{ key: 'orderId', label: 'Order ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many orders', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'any', label: 'Any' }, { value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }, { value: 'cancelled', label: 'Cancelled' }] }] },
          { value: 'update', label: 'Update', description: 'Update an order', parameters: [{ key: 'orderId', label: 'Order ID', type: 'string', required: true }], optionalFields: [{ key: 'note', label: 'Note', type: 'string' }, { key: 'tags', label: 'Tags', type: 'string' }] },
        ],
      },
      {
        value: 'product',
        label: 'Product',
        description: 'Manage products',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a product', parameters: [{ key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'bodyHtml', label: 'Body HTML', type: 'string' }, { key: 'vendor', label: 'Vendor', type: 'string' }, { key: 'productType', label: 'Product Type', type: 'string' }, { key: 'tags', label: 'Tags', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a product', parameters: [{ key: 'productId', label: 'Product ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a product', parameters: [{ key: 'productId', label: 'Product ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many products', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }, { key: 'collectionId', label: 'Collection ID', type: 'string' }] },
          { value: 'update', label: 'Update', description: 'Update a product', parameters: [{ key: 'productId', label: 'Product ID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'bodyHtml', label: 'Body HTML', type: 'string' }] },
        ],
      },
      {
        value: 'customer',
        label: 'Customer',
        description: 'Manage customers',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a customer', parameters: [], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'firstName', label: 'First Name', type: 'string' }, { key: 'lastName', label: 'Last Name', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a customer', parameters: [{ key: 'customerId', label: 'Customer ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a customer', parameters: [{ key: 'customerId', label: 'Customer ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many customers', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a customer', parameters: [{ key: 'customerId', label: 'Customer ID', type: 'string', required: true }], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'firstName', label: 'First Name', type: 'string' }, { key: 'lastName', label: 'Last Name', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 123456789, order_number: 1001, total_price: "99.99", financial_status: "paid" } }],
  },

  mailchimp: {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Manage Mailchimp email campaigns and lists',
    icon: '📧',
    color: '#FFE01B',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mailchimp/',
    version: '1.0',
    category: 'app',
    credentialType: 'mailchimpApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'listGroup',
        label: 'List / Audience',
        description: 'Manage lists/audiences',
        operations: [
          { value: 'getMany', label: 'Get Many', description: 'Get many lists', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
      {
        value: 'member',
        label: 'Member',
        description: 'Manage list members',
        operations: [
          { value: 'create', label: 'Create', description: 'Add member to list', parameters: [{ key: 'listId', label: 'List', type: 'string', required: true }, { key: 'email', label: 'Email', type: 'string', required: true }, { key: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'subscribed', label: 'Subscribed' }, { value: 'pending', label: 'Pending' }, { value: 'unsubscribed', label: 'Unsubscribed' }] }], optionalFields: [{ key: 'mergeFields', label: 'Merge Fields', type: 'json' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a member', parameters: [{ key: 'listId', label: 'List', type: 'string', required: true }, { key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a member', parameters: [{ key: 'listId', label: 'List', type: 'string', required: true }, { key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many members', parameters: [{ key: 'listId', label: 'List', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'subscribed', label: 'Subscribed' }, { value: 'pending', label: 'Pending' }, { value: 'unsubscribed', label: 'Unsubscribed' }] }] },
          { value: 'update', label: 'Update', description: 'Update a member', parameters: [{ key: 'listId', label: 'List', type: 'string', required: true }, { key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [{ key: 'status', label: 'Status', type: 'select', options: [{ value: 'subscribed', label: 'Subscribed' }, { value: 'pending', label: 'Pending' }, { value: 'unsubscribed', label: 'Unsubscribed' }] }, { key: 'mergeFields', label: 'Merge Fields', type: 'json' }] },
        ],
      },
      {
        value: 'campaign',
        label: 'Campaign',
        description: 'Manage campaigns',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a campaign', parameters: [{ key: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'regular', label: 'Regular' }, { value: 'plaintext', label: 'Plain Text' }, { value: 'absplit', label: 'A/B Split' }] }, { key: 'listId', label: 'List', type: 'string', required: true }], optionalFields: [{ key: 'subjectLine', label: 'Subject Line', type: 'string' }, { key: 'fromName', label: 'From Name', type: 'string' }, { key: 'replyTo', label: 'Reply To', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a campaign', parameters: [{ key: 'campaignId', label: 'Campaign ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a campaign', parameters: [{ key: 'campaignId', label: 'Campaign ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many campaigns', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'send', label: 'Send', description: 'Send a campaign', parameters: [{ key: 'campaignId', label: 'Campaign ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "abc123", email_address: "user@example.com", status: "subscribed" } }],
  },

  sendgrid: {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Send emails and manage contacts via SendGrid',
    icon: '📨',
    color: '#1A82E2',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.sendgrid/',
    version: '1.0',
    category: 'app',
    credentialType: 'sendGridApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'mail',
        label: 'Mail',
        description: 'Send emails',
        operations: [
          { value: 'send', label: 'Send', description: 'Send an email', parameters: [{ key: 'toEmail', label: 'To Email', type: 'string', required: true }, { key: 'fromEmail', label: 'From Email', type: 'string', required: true }, { key: 'subject', label: 'Subject', type: 'string', required: true }], optionalFields: [{ key: 'text', label: 'Text', type: 'string' }, { key: 'html', label: 'HTML', type: 'string' }, { key: 'fromName', label: 'From Name', type: 'string' }, { key: 'replyTo', label: 'Reply To', type: 'string' }] },
        ],
      },
      {
        value: 'contact',
        label: 'Contact',
        description: 'Manage contacts',
        operations: [
          { value: 'create', label: 'Create/Update', description: 'Create or update a contact', parameters: [{ key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [{ key: 'firstName', label: 'First Name', type: 'string' }, { key: 'lastName', label: 'Last Name', type: 'string' }, { key: 'listIds', label: 'List IDs', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many contacts', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
      {
        value: 'list',
        label: 'List',
        description: 'Manage lists',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a list', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a list', parameters: [{ key: 'listId', label: 'List ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many lists', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a list', parameters: [{ key: 'listId', label: 'List ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { statusCode: 202, headers: {}, body: "" } }],
  },

  twilio: {
    id: 'twilio',
    name: 'Twilio',
    description: 'Send SMS, make calls via Twilio',
    icon: '📱',
    color: '#F22F46',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.twilio/',
    version: '1.0',
    category: 'app',
    credentialType: 'twilioApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'sms',
        label: 'SMS',
        description: 'Send SMS messages',
        operations: [
          { value: 'send', label: 'Send', description: 'Send an SMS', parameters: [{ key: 'from', label: 'From', type: 'string', required: true, description: 'Twilio phone number' }, { key: 'to', label: 'To', type: 'string', required: true }, { key: 'message', label: 'Message', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'mms',
        label: 'MMS',
        description: 'Send MMS messages',
        operations: [
          { value: 'send', label: 'Send', description: 'Send an MMS', parameters: [{ key: 'from', label: 'From', type: 'string', required: true }, { key: 'to', label: 'To', type: 'string', required: true }, { key: 'message', label: 'Message', type: 'string', required: true }, { key: 'mediaUrl', label: 'Media URL', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'call',
        label: 'Call',
        description: 'Make phone calls',
        operations: [
          { value: 'make', label: 'Make', description: 'Make a call', parameters: [{ key: 'from', label: 'From', type: 'string', required: true }, { key: 'to', label: 'To', type: 'string', required: true }, { key: 'url', label: 'TwiML URL', type: 'string', required: true }], optionalFields: [{ key: 'machineDetection', label: 'Machine Detection', type: 'select', options: [{ value: 'Enable', label: 'Enable' }, { value: 'DetectMessageEnd', label: 'Detect Message End' }] }] },
        ],
      },
    ],
    defaultMockData: [{ json: { sid: "SM123", status: "sent", to: "+1234567890", from: "+0987654321" } }],
  },

  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'Use OpenAI GPT models and APIs',
    icon: '🤖',
    color: '#10A37F',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.openai/',
    version: '1.3',
    category: 'app',
    credentialType: 'openAiApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'text',
        label: 'Text',
        description: 'Generate text completions',
        operations: [
          { value: 'complete', label: 'Message a Model', description: 'Send messages to a model', parameters: [{ key: 'model', label: 'Model', type: 'select', required: true, options: [{ value: 'gpt-4', label: 'GPT-4' }, { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }, { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }] }, { key: 'messages', label: 'Messages', type: 'json', required: true }], optionalFields: [{ key: 'maxTokens', label: 'Max Tokens', type: 'number' }, { key: 'temperature', label: 'Temperature', type: 'number' }, { key: 'topP', label: 'Top P', type: 'number' }] },
        ],
      },
      {
        value: 'image',
        label: 'Image',
        description: 'Generate images',
        operations: [
          { value: 'generate', label: 'Generate', description: 'Generate an image', parameters: [{ key: 'prompt', label: 'Prompt', type: 'string', required: true }, { key: 'model', label: 'Model', type: 'select', required: true, options: [{ value: 'dall-e-3', label: 'DALL-E 3' }, { value: 'dall-e-2', label: 'DALL-E 2' }] }], optionalFields: [{ key: 'size', label: 'Size', type: 'select', options: [{ value: '1024x1024', label: '1024x1024' }, { value: '1792x1024', label: '1792x1024' }, { value: '1024x1792', label: '1024x1792' }] }, { key: 'quality', label: 'Quality', type: 'select', options: [{ value: 'standard', label: 'Standard' }, { value: 'hd', label: 'HD' }] }, { key: 'n', label: 'Number of Images', type: 'number', default: 1 }] },
          { value: 'analyze', label: 'Analyze', description: 'Analyze an image', parameters: [{ key: 'model', label: 'Model', type: 'select', required: true, options: [{ value: 'gpt-4-vision-preview', label: 'GPT-4 Vision' }] }, { key: 'inputType', label: 'Input Type', type: 'select', required: true, options: [{ value: 'url', label: 'URL' }, { value: 'base64', label: 'Base64' }] }, { key: 'text', label: 'Text Input', type: 'string', required: true }], optionalFields: [{ key: 'maxTokens', label: 'Max Tokens', type: 'number' }] },
        ],
      },
      {
        value: 'audio',
        label: 'Audio',
        description: 'Work with audio',
        operations: [
          { value: 'transcribe', label: 'Transcribe', description: 'Transcribe audio to text', parameters: [{ key: 'binaryPropertyName', label: 'Binary Property', type: 'string', required: true, default: 'data' }], optionalFields: [{ key: 'language', label: 'Language', type: 'string' }, { key: 'prompt', label: 'Prompt', type: 'string' }] },
          { value: 'generate', label: 'Generate', description: 'Generate audio from text', parameters: [{ key: 'model', label: 'Model', type: 'select', required: true, options: [{ value: 'tts-1', label: 'TTS-1' }, { value: 'tts-1-hd', label: 'TTS-1 HD' }] }, { key: 'input', label: 'Input Text', type: 'string', required: true }, { key: 'voice', label: 'Voice', type: 'select', required: true, options: [{ value: 'alloy', label: 'Alloy' }, { value: 'echo', label: 'Echo' }, { value: 'fable', label: 'Fable' }, { value: 'onyx', label: 'Onyx' }, { value: 'nova', label: 'Nova' }, { value: 'shimmer', label: 'Shimmer' }] }], optionalFields: [{ key: 'speed', label: 'Speed', type: 'number' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "chatcmpl-xxx", choices: [{ message: { role: "assistant", content: "Hello!" } }], usage: { total_tokens: 50 } } }],
  },

  googleDrive: {
    id: 'googleDrive',
    name: 'Google Drive',
    description: 'Manage files and folders in Google Drive',
    icon: '📁',
    color: '#4285F4',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/',
    version: '3.0',
    category: 'app',
    credentialType: 'googleDriveOAuth2Api',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'file',
        label: 'File',
        description: 'Manage files',
        operations: [
          { value: 'copy', label: 'Copy', description: 'Copy a file', parameters: [{ key: 'fileId', label: 'File', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'New Name', type: 'string' }, { key: 'parentFolderId', label: 'Parent Folder', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a file', parameters: [{ key: 'fileId', label: 'File', type: 'string', required: true }], optionalFields: [] },
          { value: 'download', label: 'Download', description: 'Download a file', parameters: [{ key: 'fileId', label: 'File', type: 'string', required: true }], optionalFields: [{ key: 'binaryPropertyName', label: 'Binary Property', type: 'string', default: 'data' }] },
          { value: 'move', label: 'Move', description: 'Move a file', parameters: [{ key: 'fileId', label: 'File', type: 'string', required: true }, { key: 'folderId', label: 'Folder', type: 'string', required: true }], optionalFields: [] },
          { value: 'search', label: 'Search', description: 'Search files', parameters: [{ key: 'queryString', label: 'Query String', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }, { key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'share', label: 'Share', description: 'Share a file', parameters: [{ key: 'fileId', label: 'File', type: 'string', required: true }, { key: 'permissionsUi', label: 'Permissions', type: 'json', required: true }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update a file', parameters: [{ key: 'fileId', label: 'File', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'binaryPropertyName', label: 'Binary Property', type: 'string' }] },
          { value: 'upload', label: 'Upload', description: 'Upload a file', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }, { key: 'binaryPropertyName', label: 'Binary Property', type: 'string', required: true, default: 'data' }], optionalFields: [{ key: 'parentFolderId', label: 'Parent Folder', type: 'string' }] },
        ],
      },
      {
        value: 'folder',
        label: 'Folder',
        description: 'Manage folders',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a folder', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'parentFolderId', label: 'Parent Folder', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a folder', parameters: [{ key: 'folderId', label: 'Folder', type: 'string', required: true }], optionalFields: [] },
          { value: 'search', label: 'Search', description: 'Search folders', parameters: [{ key: 'queryString', label: 'Query String', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }] },
          { value: 'share', label: 'Share', description: 'Share a folder', parameters: [{ key: 'folderId', label: 'Folder', type: 'string', required: true }, { key: 'permissionsUi', label: 'Permissions', type: 'json', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'fileFolder',
        label: 'File/Folder',
        description: 'Get files or folders',
        operations: [
          { value: 'search', label: 'Search', description: 'Search files and folders', parameters: [{ key: 'queryString', label: 'Query String', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }, { key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "1abc123", name: "MyFile.pdf", mimeType: "application/pdf", webViewLink: "https://drive.google.com/..." } }],
  },

  dropbox: {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Manage files and folders in Dropbox',
    icon: '📦',
    color: '#0061FF',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.dropbox/',
    version: '1.0',
    category: 'app',
    credentialType: 'dropboxOAuth2Api',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'file',
        label: 'File',
        description: 'Manage files',
        operations: [
          { value: 'copy', label: 'Copy', description: 'Copy a file', parameters: [{ key: 'path', label: 'File Path', type: 'string', required: true }, { key: 'toPath', label: 'To Path', type: 'string', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a file', parameters: [{ key: 'path', label: 'File Path', type: 'string', required: true }], optionalFields: [] },
          { value: 'download', label: 'Download', description: 'Download a file', parameters: [{ key: 'path', label: 'File Path', type: 'string', required: true }], optionalFields: [{ key: 'binaryPropertyName', label: 'Binary Property', type: 'string', default: 'data' }] },
          { value: 'move', label: 'Move', description: 'Move a file', parameters: [{ key: 'path', label: 'File Path', type: 'string', required: true }, { key: 'toPath', label: 'To Path', type: 'string', required: true }], optionalFields: [] },
          { value: 'upload', label: 'Upload', description: 'Upload a file', parameters: [{ key: 'path', label: 'File Path', type: 'string', required: true }, { key: 'binaryPropertyName', label: 'Binary Property', type: 'string', required: true, default: 'data' }], optionalFields: [{ key: 'mode', label: 'Mode', type: 'select', options: [{ value: 'add', label: 'Add' }, { value: 'overwrite', label: 'Overwrite' }] }] },
        ],
      },
      {
        value: 'folder',
        label: 'Folder',
        description: 'Manage folders',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a folder', parameters: [{ key: 'path', label: 'Folder Path', type: 'string', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a folder', parameters: [{ key: 'path', label: 'Folder Path', type: 'string', required: true }], optionalFields: [] },
          { value: 'list', label: 'List', description: 'List folder contents', parameters: [{ key: 'path', label: 'Folder Path', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }, { key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
      {
        value: 'search',
        label: 'Search',
        description: 'Search files',
        operations: [
          { value: 'search', label: 'Search', description: 'Search files and folders', parameters: [{ key: 'query', label: 'Query', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }, { key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
    ],
    defaultMockData: [{ json: { ".tag": "file", name: "myfile.txt", path_display: "/myfile.txt", id: "id:xxx" } }],
  },

  googleCalendar: {
    id: 'googleCalendar',
    name: 'Google Calendar',
    description: 'Manage Google Calendar events',
    icon: '📅',
    color: '#4285F4',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/',
    version: '1.0',
    category: 'app',
    credentialType: 'googleCalendarOAuth2Api',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'event',
        label: 'Event',
        description: 'Manage calendar events',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an event', parameters: [{ key: 'calendarId', label: 'Calendar', type: 'string', required: true }, { key: 'start', label: 'Start', type: 'string', required: true }, { key: 'end', label: 'End', type: 'string', required: true }], optionalFields: [{ key: 'summary', label: 'Summary', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'location', label: 'Location', type: 'string' }, { key: 'attendees', label: 'Attendees', type: 'string' }, { key: 'allDay', label: 'All Day', type: 'boolean' }] },
          { value: 'delete', label: 'Delete', description: 'Delete an event', parameters: [{ key: 'calendarId', label: 'Calendar', type: 'string', required: true }, { key: 'eventId', label: 'Event ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get an event', parameters: [{ key: 'calendarId', label: 'Calendar', type: 'string', required: true }, { key: 'eventId', label: 'Event ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many events', parameters: [{ key: 'calendarId', label: 'Calendar', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }, { key: 'timeMin', label: 'Start Time', type: 'string' }, { key: 'timeMax', label: 'End Time', type: 'string' }] },
          { value: 'update', label: 'Update', description: 'Update an event', parameters: [{ key: 'calendarId', label: 'Calendar', type: 'string', required: true }, { key: 'eventId', label: 'Event ID', type: 'string', required: true }], optionalFields: [{ key: 'summary', label: 'Summary', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'start', label: 'Start', type: 'string' }, { key: 'end', label: 'End', type: 'string' }] },
        ],
      },
      {
        value: 'calendar',
        label: 'Calendar',
        description: 'Manage calendars',
        operations: [
          { value: 'getMany', label: 'Get Many', description: 'Get all calendars', parameters: [], optionalFields: [] },
          { value: 'availability', label: 'Availability', description: 'Get availability', parameters: [{ key: 'calendarId', label: 'Calendar', type: 'string', required: true }, { key: 'timeMin', label: 'Start Time', type: 'string', required: true }, { key: 'timeMax', label: 'End Time', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "event123", summary: "Meeting", start: { dateTime: "2024-01-01T10:00:00Z" }, end: { dateTime: "2024-01-01T11:00:00Z" } } }],
  },

  zoom: {
    id: 'zoom',
    name: 'Zoom',
    description: 'Manage Zoom meetings and webinars',
    icon: '🎥',
    color: '#2D8CFF',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.zoom/',
    version: '1.0',
    category: 'app',
    credentialType: 'zoomOAuth2Api',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'meeting',
        label: 'Meeting',
        description: 'Manage meetings',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a meeting', parameters: [{ key: 'topic', label: 'Topic', type: 'string', required: true }], optionalFields: [{ key: 'type', label: 'Type', type: 'select', options: [{ value: '1', label: 'Instant' }, { value: '2', label: 'Scheduled' }, { value: '3', label: 'Recurring No Fixed Time' }, { value: '8', label: 'Recurring Fixed Time' }] }, { key: 'startTime', label: 'Start Time', type: 'string' }, { key: 'duration', label: 'Duration (minutes)', type: 'number' }, { key: 'timezone', label: 'Timezone', type: 'string' }, { key: 'password', label: 'Password', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a meeting', parameters: [{ key: 'meetingId', label: 'Meeting ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a meeting', parameters: [{ key: 'meetingId', label: 'Meeting ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many meetings', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a meeting', parameters: [{ key: 'meetingId', label: 'Meeting ID', type: 'string', required: true }], optionalFields: [{ key: 'topic', label: 'Topic', type: 'string' }, { key: 'startTime', label: 'Start Time', type: 'string' }, { key: 'duration', label: 'Duration (minutes)', type: 'number' }] },
        ],
      },
      {
        value: 'meetingRegistrant',
        label: 'Meeting Registrant',
        description: 'Manage meeting registrants',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a registrant', parameters: [{ key: 'meetingId', label: 'Meeting ID', type: 'string', required: true }, { key: 'email', label: 'Email', type: 'string', required: true }, { key: 'firstName', label: 'First Name', type: 'string', required: true }], optionalFields: [{ key: 'lastName', label: 'Last Name', type: 'string' }] },
          { value: 'getMany', label: 'Get Many', description: 'Get many registrants', parameters: [{ key: 'meetingId', label: 'Meeting ID', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a registrant', parameters: [{ key: 'meetingId', label: 'Meeting ID', type: 'string', required: true }, { key: 'action', label: 'Action', type: 'select', required: true, options: [{ value: 'approve', label: 'Approve' }, { value: 'deny', label: 'Deny' }, { value: 'cancel', label: 'Cancel' }] }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 123456789, topic: "Team Meeting", start_time: "2024-01-01T10:00:00Z", join_url: "https://zoom.us/j/123456789" } }],
  },

  linkedIn: {
    id: 'linkedIn',
    name: 'LinkedIn',
    description: 'Post and manage LinkedIn content',
    icon: '💼',
    color: '#0A66C2',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.linkedin/',
    version: '1.0',
    category: 'app',
    credentialType: 'linkedInOAuth2Api',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'post',
        label: 'Post',
        description: 'Create posts',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a post', parameters: [{ key: 'text', label: 'Text', type: 'string', required: true }, { key: 'postAs', label: 'Post As', type: 'select', required: true, options: [{ value: 'person', label: 'Person' }, { value: 'organization', label: 'Organization' }] }], optionalFields: [{ key: 'visibility', label: 'Visibility', type: 'select', options: [{ value: 'PUBLIC', label: 'Public' }, { value: 'CONNECTIONS', label: 'Connections Only' }] }, { key: 'mediaCategory', label: 'Media Category', type: 'select', options: [{ value: 'NONE', label: 'None' }, { value: 'ARTICLE', label: 'Article' }, { value: 'IMAGE', label: 'Image' }] }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "urn:li:share:123456", activity: "urn:li:activity:123456" } }],
  },

  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Post tweets and manage Twitter/X account',
    icon: '🐦',
    color: '#1DA1F2',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.twitter/',
    version: '2.0',
    category: 'app',
    credentialType: 'twitterOAuth2Api',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'tweet',
        label: 'Tweet',
        description: 'Manage tweets',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a tweet', parameters: [{ key: 'text', label: 'Text', type: 'string', required: true }], optionalFields: [{ key: 'replyToTweetId', label: 'Reply To Tweet ID', type: 'string' }, { key: 'quoteTweetId', label: 'Quote Tweet ID', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a tweet', parameters: [{ key: 'tweetId', label: 'Tweet ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'like', label: 'Like', description: 'Like a tweet', parameters: [{ key: 'tweetId', label: 'Tweet ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'retweet', label: 'Retweet', description: 'Retweet a tweet', parameters: [{ key: 'tweetId', label: 'Tweet ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'search', label: 'Search', description: 'Search tweets', parameters: [{ key: 'query', label: 'Query', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }, { key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
      {
        value: 'user',
        label: 'User',
        description: 'Get user information',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a user', parameters: [{ key: 'user', label: 'User', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'directMessage',
        label: 'Direct Message',
        description: 'Send direct messages',
        operations: [
          { value: 'create', label: 'Create', description: 'Send a direct message', parameters: [{ key: 'recipientId', label: 'Recipient ID', type: 'string', required: true }, { key: 'text', label: 'Text', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "1234567890", text: "Hello Twitter!", author_id: "123456" } }],
  },

  facebook: {
    id: 'facebook',
    name: 'Facebook',
    description: 'Post to Facebook pages and groups',
    icon: '👤',
    color: '#1877F2',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.facebook/',
    version: '1.0',
    category: 'app',
    credentialType: 'facebookGraphApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'post',
        label: 'Post',
        description: 'Manage posts',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a post', parameters: [{ key: 'pageId', label: 'Page', type: 'string', required: true }, { key: 'message', label: 'Message', type: 'string', required: true }], optionalFields: [{ key: 'link', label: 'Link', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a post', parameters: [{ key: 'postId', label: 'Post ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'video',
        label: 'Video',
        description: 'Manage videos',
        operations: [
          { value: 'upload', label: 'Upload', description: 'Upload a video', parameters: [{ key: 'pageId', label: 'Page', type: 'string', required: true }, { key: 'binaryPropertyName', label: 'Binary Property', type: 'string', required: true, default: 'data' }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "123456789_987654321", message: "Hello Facebook!" } }],
  },

  youtube: {
    id: 'youtube',
    name: 'YouTube',
    description: 'Manage YouTube channels and videos',
    icon: '▶️',
    color: '#FF0000',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.youtube/',
    version: '1.0',
    category: 'app',
    credentialType: 'youTubeOAuth2Api',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'channel',
        label: 'Channel',
        description: 'Get channel information',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a channel', parameters: [{ key: 'channelId', label: 'Channel ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many channels', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
      {
        value: 'playlist',
        label: 'Playlist',
        description: 'Manage playlists',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a playlist', parameters: [{ key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'privacyStatus', label: 'Privacy Status', type: 'select', options: [{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }, { value: 'unlisted', label: 'Unlisted' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a playlist', parameters: [{ key: 'playlistId', label: 'Playlist ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a playlist', parameters: [{ key: 'playlistId', label: 'Playlist ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get many playlists', parameters: [{ key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'update', label: 'Update', description: 'Update a playlist', parameters: [{ key: 'playlistId', label: 'Playlist ID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }] },
        ],
      },
      {
        value: 'playlistItem',
        label: 'Playlist Item',
        description: 'Manage playlist items',
        operations: [
          { value: 'add', label: 'Add', description: 'Add video to playlist', parameters: [{ key: 'playlistId', label: 'Playlist ID', type: 'string', required: true }, { key: 'videoId', label: 'Video ID', type: 'string', required: true }], optionalFields: [{ key: 'position', label: 'Position', type: 'number' }] },
          { value: 'delete', label: 'Delete', description: 'Remove from playlist', parameters: [{ key: 'playlistItemId', label: 'Playlist Item ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Get playlist items', parameters: [{ key: 'playlistId', label: 'Playlist ID', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
        ],
      },
      {
        value: 'video',
        label: 'Video',
        description: 'Manage videos',
        operations: [
          { value: 'delete', label: 'Delete', description: 'Delete a video', parameters: [{ key: 'videoId', label: 'Video ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a video', parameters: [{ key: 'videoId', label: 'Video ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getMany', label: 'Get Many', description: 'Search videos', parameters: [{ key: 'query', label: 'Query', type: 'string', required: true }, { key: 'returnAll', label: 'Return All', type: 'boolean', default: false }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number', default: 50 }] },
          { value: 'rate', label: 'Rate', description: 'Rate a video', parameters: [{ key: 'videoId', label: 'Video ID', type: 'string', required: true }, { key: 'rating', label: 'Rating', type: 'select', required: true, options: [{ value: 'like', label: 'Like' }, { value: 'dislike', label: 'Dislike' }, { value: 'none', label: 'None' }] }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update a video', parameters: [{ key: 'videoId', label: 'Video ID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'privacyStatus', label: 'Privacy Status', type: 'select', options: [{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }, { value: 'unlisted', label: 'Unlisted' }] }] },
          { value: 'upload', label: 'Upload', description: 'Upload a video', parameters: [{ key: 'title', label: 'Title', type: 'string', required: true }, { key: 'binaryPropertyName', label: 'Binary Property', type: 'string', required: true, default: 'data' }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'privacyStatus', label: 'Privacy Status', type: 'select', options: [{ value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }, { value: 'unlisted', label: 'Unlisted' }] }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "video123", snippet: { title: "My Video", channelTitle: "My Channel" }, statistics: { viewCount: "1000" } } }],
  },

  mongodb: {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'Query and manage MongoDB databases',
    icon: '🍃',
    color: '#00ED64',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mongodb/',
    version: '1.0',
    category: 'app',
    credentialType: 'mongoDb',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'document',
        label: 'Document',
        description: 'Manage documents',
        operations: [
          { value: 'aggregate', label: 'Aggregate', description: 'Run an aggregation pipeline', parameters: [{ key: 'collection', label: 'Collection', type: 'string', required: true }, { key: 'pipeline', label: 'Pipeline', type: 'json', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete documents', parameters: [{ key: 'collection', label: 'Collection', type: 'string', required: true }, { key: 'query', label: 'Query', type: 'json', required: true }], optionalFields: [] },
          { value: 'find', label: 'Find', description: 'Find documents', parameters: [{ key: 'collection', label: 'Collection', type: 'string', required: true }], optionalFields: [{ key: 'query', label: 'Query', type: 'json' }, { key: 'projection', label: 'Projection', type: 'json' }, { key: 'sort', label: 'Sort', type: 'json' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'findOneAndReplace', label: 'Find and Replace', description: 'Find and replace a document', parameters: [{ key: 'collection', label: 'Collection', type: 'string', required: true }, { key: 'query', label: 'Query', type: 'json', required: true }, { key: 'replacement', label: 'Replacement', type: 'json', required: true }], optionalFields: [{ key: 'upsert', label: 'Upsert', type: 'boolean', default: false }] },
          { value: 'findOneAndUpdate', label: 'Find and Update', description: 'Find and update a document', parameters: [{ key: 'collection', label: 'Collection', type: 'string', required: true }, { key: 'query', label: 'Query', type: 'json', required: true }, { key: 'update', label: 'Update', type: 'json', required: true }], optionalFields: [{ key: 'upsert', label: 'Upsert', type: 'boolean', default: false }] },
          { value: 'insert', label: 'Insert', description: 'Insert documents', parameters: [{ key: 'collection', label: 'Collection', type: 'string', required: true }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update documents', parameters: [{ key: 'collection', label: 'Collection', type: 'string', required: true }, { key: 'query', label: 'Query', type: 'json', required: true }, { key: 'update', label: 'Update', type: 'json', required: true }], optionalFields: [{ key: 'upsert', label: 'Upsert', type: 'boolean', default: false }] },
        ],
      },
    ],
    defaultMockData: [{ json: { _id: "60d5f484f1d2c32b8c3e4567", name: "Document", createdAt: "2024-01-01T00:00:00Z" } }],
  },

  mysql: {
    id: 'mysql',
    name: 'MySQL',
    description: 'Query MySQL databases',
    icon: '🐬',
    color: '#4479A1',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mysql/',
    version: '2.3',
    category: 'app',
    credentialType: 'mySql',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'database',
        label: 'Database',
        description: 'Execute database operations',
        operations: [
          { value: 'deleteTable', label: 'Delete', description: 'Delete rows from table', parameters: [{ key: 'table', label: 'Table', type: 'string', required: true }, { key: 'deleteKey', label: 'Delete Key', type: 'string', required: true }], optionalFields: [] },
          { value: 'executeQuery', label: 'Execute Query', description: 'Execute a SQL query', parameters: [{ key: 'query', label: 'Query', type: 'string', required: true }], optionalFields: [] },
          { value: 'insert', label: 'Insert', description: 'Insert rows into table', parameters: [{ key: 'table', label: 'Table', type: 'string', required: true }, { key: 'columns', label: 'Columns', type: 'string', required: true }], optionalFields: [] },
          { value: 'select', label: 'Select', description: 'Select rows from table', parameters: [{ key: 'table', label: 'Table', type: 'string', required: true }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number' }, { key: 'where', label: 'Where', type: 'json' }, { key: 'sort', label: 'Sort', type: 'json' }] },
          { value: 'update', label: 'Update', description: 'Update rows in table', parameters: [{ key: 'table', label: 'Table', type: 'string', required: true }, { key: 'updateKey', label: 'Update Key', type: 'string', required: true }, { key: 'columns', label: 'Columns', type: 'string', required: true }], optionalFields: [] },
          { value: 'upsert', label: 'Upsert', description: 'Insert or update rows', parameters: [{ key: 'table', label: 'Table', type: 'string', required: true }, { key: 'columns', label: 'Columns', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 1, name: "Row", created_at: "2024-01-01 00:00:00" } }],
  },

  postgres: {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Query PostgreSQL databases',
    icon: '🐘',
    color: '#336791',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/',
    version: '2.4',
    category: 'app',
    credentialType: 'postgres',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'database',
        label: 'Database',
        description: 'Execute database operations',
        operations: [
          { value: 'deleteTable', label: 'Delete', description: 'Delete rows from table', parameters: [{ key: 'schema', label: 'Schema', type: 'string', required: true, default: 'public' }, { key: 'table', label: 'Table', type: 'string', required: true }, { key: 'deleteKey', label: 'Delete Key', type: 'string', required: true }], optionalFields: [] },
          { value: 'executeQuery', label: 'Execute Query', description: 'Execute a SQL query', parameters: [{ key: 'query', label: 'Query', type: 'string', required: true }], optionalFields: [] },
          { value: 'insert', label: 'Insert', description: 'Insert rows into table', parameters: [{ key: 'schema', label: 'Schema', type: 'string', required: true, default: 'public' }, { key: 'table', label: 'Table', type: 'string', required: true }, { key: 'columns', label: 'Columns', type: 'string', required: true }], optionalFields: [{ key: 'returnFields', label: 'Return Fields', type: 'string' }] },
          { value: 'select', label: 'Select', description: 'Select rows from table', parameters: [{ key: 'schema', label: 'Schema', type: 'string', required: true, default: 'public' }, { key: 'table', label: 'Table', type: 'string', required: true }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number' }, { key: 'where', label: 'Where', type: 'json' }, { key: 'sort', label: 'Sort', type: 'json' }] },
          { value: 'update', label: 'Update', description: 'Update rows in table', parameters: [{ key: 'schema', label: 'Schema', type: 'string', required: true, default: 'public' }, { key: 'table', label: 'Table', type: 'string', required: true }, { key: 'updateKey', label: 'Update Key', type: 'string', required: true }, { key: 'columns', label: 'Columns', type: 'string', required: true }], optionalFields: [] },
          { value: 'upsert', label: 'Upsert', description: 'Insert or update rows', parameters: [{ key: 'schema', label: 'Schema', type: 'string', required: true, default: 'public' }, { key: 'table', label: 'Table', type: 'string', required: true }, { key: 'columns', label: 'Columns', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 1, name: "Row", created_at: "2024-01-01T00:00:00Z" } }],
  },

  webhook: {
    id: 'webhook',
    name: 'Webhook',
    description: 'Create webhook endpoints to receive data',
    icon: '🔗',
    color: '#885577',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/',
    version: '2.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'webhook',
        label: 'Webhook',
        description: 'Receive webhook data',
        operations: [
          { value: 'default', label: 'Default', description: 'Listen for webhook requests', parameters: [{ key: 'httpMethod', label: 'HTTP Method', type: 'select', required: true, options: [{ value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }, { value: 'PUT', label: 'PUT' }, { value: 'PATCH', label: 'PATCH' }, { value: 'DELETE', label: 'DELETE' }, { value: 'HEAD', label: 'HEAD' }] }, { key: 'path', label: 'Path', type: 'string', required: true }], optionalFields: [{ key: 'authentication', label: 'Authentication', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'basicAuth', label: 'Basic Auth' }, { value: 'headerAuth', label: 'Header Auth' }] }, { key: 'responseMode', label: 'Response Mode', type: 'select', options: [{ value: 'onReceived', label: 'On Received' }, { value: 'lastNode', label: 'Using Last Node' }, { value: 'responseNode', label: 'Using Response Node' }] }, { key: 'responseCode', label: 'Response Code', type: 'number', default: 200 }] },
        ],
      },
    ],
    defaultMockData: [{ json: { body: {}, headers: {}, params: {}, query: {} } }],
  },

  code: {
    id: 'code',
    name: 'Code',
    description: 'Write custom JavaScript or Python code',
    icon: '⌨️',
    color: '#FF6D5A',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/',
    version: '2.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'code',
        label: 'Code',
        description: 'Execute custom code',
        operations: [
          { value: 'runOnceForAllItems', label: 'Run Once for All Items', description: 'Execute code once for all input items', parameters: [{ key: 'language', label: 'Language', type: 'select', required: true, options: [{ value: 'javaScript', label: 'JavaScript' }, { value: 'python', label: 'Python' }] }, { key: 'jsCode', label: 'JavaScript Code', type: 'string', required: true }], optionalFields: [] },
          { value: 'runOnceForEachItem', label: 'Run Once for Each Item', description: 'Execute code for each input item', parameters: [{ key: 'language', label: 'Language', type: 'select', required: true, options: [{ value: 'javaScript', label: 'JavaScript' }, { value: 'python', label: 'Python' }] }, { key: 'jsCode', label: 'JavaScript Code', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { result: "code execution result" } }],
  },

  ifNode: {
    id: 'ifNode',
    name: 'IF',
    description: 'Route items based on conditions',
    icon: '🔀',
    color: '#408000',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/',
    version: '2.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'condition',
        label: 'Condition',
        description: 'Evaluate conditions',
        operations: [
          { value: 'evaluate', label: 'Evaluate', description: 'Evaluate conditions and route', parameters: [{ key: 'conditions', label: 'Conditions', type: 'json', required: true }], optionalFields: [{ key: 'combineConditions', label: 'Combine', type: 'select', options: [{ value: 'AND', label: 'AND' }, { value: 'OR', label: 'OR' }] }] },
        ],
      },
    ],
    defaultMockData: [{ json: { conditionMet: true } }],
  },

  switchNode: {
    id: 'switchNode',
    name: 'Switch',
    description: 'Route items to different outputs based on rules',
    icon: '🔃',
    color: '#506000',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.switch/',
    version: '3.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'switch',
        label: 'Switch',
        description: 'Route based on rules',
        operations: [
          { value: 'route', label: 'Route', description: 'Route items to different outputs', parameters: [{ key: 'mode', label: 'Mode', type: 'select', required: true, options: [{ value: 'rules', label: 'Rules' }, { value: 'expression', label: 'Expression' }] }, { key: 'rules', label: 'Rules', type: 'json', required: true }], optionalFields: [{ key: 'fallbackOutput', label: 'Fallback Output', type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'extra', label: 'Extra Output' }] }] },
        ],
      },
    ],
    defaultMockData: [{ json: { output: 0 } }],
  },

  merge: {
    id: 'merge',
    name: 'Merge',
    description: 'Merge data from multiple inputs',
    icon: '🔗',
    color: '#00B5AD',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.merge/',
    version: '3.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'merge',
        label: 'Merge',
        description: 'Merge inputs',
        operations: [
          { value: 'append', label: 'Append', description: 'Append items from all inputs', parameters: [], optionalFields: [] },
          { value: 'combine', label: 'Combine', description: 'Combine items by position or field', parameters: [{ key: 'combinationMode', label: 'Mode', type: 'select', required: true, options: [{ value: 'mergeByPosition', label: 'Merge by Position' }, { value: 'mergeByFields', label: 'Merge by Fields' }, { value: 'multiplex', label: 'Multiplex' }] }], optionalFields: [{ key: 'mergeByFields', label: 'Fields to Match', type: 'json' }, { key: 'clashHandling', label: 'Clash Handling', type: 'select', options: [{ value: 'preferInput1', label: 'Prefer Input 1' }, { value: 'preferInput2', label: 'Prefer Input 2' }, { value: 'addSuffix', label: 'Add Suffix' }] }] },
          { value: 'chooseBranch', label: 'Choose Branch', description: 'Choose which input to use', parameters: [{ key: 'output', label: 'Output', type: 'select', required: true, options: [{ value: 'input1', label: 'Input 1' }, { value: 'input2', label: 'Input 2' }] }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { merged: true, source: "input1" } }],
  },

  setNode: {
    id: 'setNode',
    name: 'Edit Fields (Set)',
    description: 'Add, edit, or remove fields from items',
    icon: '✏️',
    color: '#0000FF',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/',
    version: '3.4',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'fields',
        label: 'Fields',
        description: 'Edit fields',
        operations: [
          { value: 'manual', label: 'Manual Mapping', description: 'Manually map fields', parameters: [{ key: 'fields', label: 'Fields', type: 'json', required: true }], optionalFields: [{ key: 'include', label: 'Include', type: 'select', options: [{ value: 'none', label: 'No Other Fields' }, { value: 'selected', label: 'Selected Fields' }, { value: 'all', label: 'All Fields' }] }] },
          { value: 'raw', label: 'Raw JSON', description: 'Set fields using JSON', parameters: [{ key: 'jsonOutput', label: 'JSON', type: 'json', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { field1: "value1", field2: "value2" } }],
  },

  wait: {
    id: 'wait',
    name: 'Wait',
    description: 'Wait before continuing execution',
    icon: '⏱️',
    color: '#804050',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/',
    version: '1.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'wait',
        label: 'Wait',
        description: 'Pause execution',
        operations: [
          { value: 'timeInterval', label: 'After Time Interval', description: 'Wait for a specified duration', parameters: [{ key: 'amount', label: 'Amount', type: 'number', required: true }, { key: 'unit', label: 'Unit', type: 'select', required: true, options: [{ value: 'seconds', label: 'Seconds' }, { value: 'minutes', label: 'Minutes' }, { value: 'hours', label: 'Hours' }, { value: 'days', label: 'Days' }] }], optionalFields: [] },
          { value: 'specificTime', label: 'At Specific Time', description: 'Wait until a specific time', parameters: [{ key: 'dateTime', label: 'Date & Time', type: 'string', required: true }], optionalFields: [] },
          { value: 'webhook', label: 'On Webhook Call', description: 'Wait for a webhook call', parameters: [{ key: 'httpMethod', label: 'HTTP Method', type: 'select', required: true, options: [{ value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }] }], optionalFields: [{ key: 'responseCode', label: 'Response Code', type: 'number', default: 200 }] },
        ],
      },
    ],
    defaultMockData: [{ json: { waited: true } }],
  },

  dateTime: {
    id: 'dateTime',
    name: 'Date & Time',
    description: 'Manipulate date and time values',
    icon: '📆',
    color: '#408080',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.datetime/',
    version: '2.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'datetime',
        label: 'Date & Time',
        description: 'Work with dates',
        operations: [
          { value: 'calculate', label: 'Calculate', description: 'Add or subtract time', parameters: [{ key: 'value', label: 'Date', type: 'string', required: true }, { key: 'duration', label: 'Duration', type: 'number', required: true }, { key: 'unit', label: 'Unit', type: 'select', required: true, options: [{ value: 'seconds', label: 'Seconds' }, { value: 'minutes', label: 'Minutes' }, { value: 'hours', label: 'Hours' }, { value: 'days', label: 'Days' }, { value: 'weeks', label: 'Weeks' }, { value: 'months', label: 'Months' }, { value: 'years', label: 'Years' }] }, { key: 'operation', label: 'Operation', type: 'select', required: true, options: [{ value: 'add', label: 'Add' }, { value: 'subtract', label: 'Subtract' }] }], optionalFields: [] },
          { value: 'format', label: 'Format', description: 'Format a date', parameters: [{ key: 'value', label: 'Date', type: 'string', required: true }, { key: 'format', label: 'Format', type: 'string', required: true }], optionalFields: [{ key: 'timezone', label: 'Timezone', type: 'string' }] },
          { value: 'roundDate', label: 'Round', description: 'Round a date', parameters: [{ key: 'value', label: 'Date', type: 'string', required: true }, { key: 'mode', label: 'Mode', type: 'select', required: true, options: [{ value: 'roundDown', label: 'Round Down' }, { value: 'roundUp', label: 'Round Up' }] }, { key: 'to', label: 'To', type: 'select', required: true, options: [{ value: 'hour', label: 'Hour' }, { value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }] }], optionalFields: [] },
          { value: 'extractPart', label: 'Extract Part', description: 'Get part of a date', parameters: [{ key: 'value', label: 'Date', type: 'string', required: true }, { key: 'part', label: 'Part', type: 'select', required: true, options: [{ value: 'year', label: 'Year' }, { value: 'month', label: 'Month' }, { value: 'day', label: 'Day' }, { value: 'hour', label: 'Hour' }, { value: 'minute', label: 'Minute' }, { value: 'second', label: 'Second' }] }], optionalFields: [] },
          { value: 'getCurrentDate', label: 'Get Current Date', description: 'Get the current date', parameters: [], optionalFields: [{ key: 'timezone', label: 'Timezone', type: 'string' }, { key: 'format', label: 'Format', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { date: "2024-01-01T00:00:00.000Z" } }],
  },

  crypto: {
    id: 'crypto',
    name: 'Crypto',
    description: 'Hash, encrypt, and sign data',
    icon: '🔐',
    color: '#7D4E8D',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.crypto/',
    version: '1.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'crypto',
        label: 'Crypto',
        description: 'Cryptographic operations',
        operations: [
          { value: 'hash', label: 'Hash', description: 'Hash data', parameters: [{ key: 'value', label: 'Value', type: 'string', required: true }, { key: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'MD5', label: 'MD5' }, { value: 'SHA256', label: 'SHA256' }, { value: 'SHA384', label: 'SHA384' }, { value: 'SHA512', label: 'SHA512' }] }], optionalFields: [{ key: 'encoding', label: 'Encoding', type: 'select', options: [{ value: 'hex', label: 'Hex' }, { value: 'base64', label: 'Base64' }] }] },
          { value: 'hmac', label: 'HMAC', description: 'Generate HMAC', parameters: [{ key: 'value', label: 'Value', type: 'string', required: true }, { key: 'secret', label: 'Secret', type: 'string', required: true }, { key: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'MD5', label: 'MD5' }, { value: 'SHA256', label: 'SHA256' }, { value: 'SHA512', label: 'SHA512' }] }], optionalFields: [{ key: 'encoding', label: 'Encoding', type: 'select', options: [{ value: 'hex', label: 'Hex' }, { value: 'base64', label: 'Base64' }] }] },
          { value: 'sign', label: 'Sign', description: 'Sign data', parameters: [{ key: 'value', label: 'Value', type: 'string', required: true }, { key: 'privateKey', label: 'Private Key', type: 'string', required: true }, { key: 'algorithm', label: 'Algorithm', type: 'select', required: true, options: [{ value: 'RSA-SHA256', label: 'RSA-SHA256' }, { value: 'RSA-SHA512', label: 'RSA-SHA512' }] }], optionalFields: [] },
          { value: 'generateUuid', label: 'Generate UUID', description: 'Generate a UUID', parameters: [], optionalFields: [{ key: 'version', label: 'Version', type: 'select', options: [{ value: 'v1', label: 'V1' }, { value: 'v4', label: 'V4' }] }] },
        ],
      },
    ],
    defaultMockData: [{ json: { data: "hashed_value" } }],
  },

  html: {
    id: 'html',
    name: 'HTML',
    description: 'Extract and manipulate HTML content',
    icon: '📄',
    color: '#E34F26',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.html/',
    version: '1.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'html',
        label: 'HTML',
        description: 'HTML operations',
        operations: [
          { value: 'extractHtmlContent', label: 'Extract HTML Content', description: 'Extract content from HTML', parameters: [{ key: 'sourceData', label: 'Source Data', type: 'select', required: true, options: [{ value: 'json', label: 'JSON' }, { value: 'binary', label: 'Binary' }] }, { key: 'extractionValues', label: 'Extraction Values', type: 'json', required: true }], optionalFields: [] },
          { value: 'generateHtmlTemplate', label: 'Generate HTML Template', description: 'Generate HTML from template', parameters: [{ key: 'html', label: 'HTML Template', type: 'string', required: true }], optionalFields: [] },
          { value: 'convertToHtmlTable', label: 'Convert to HTML Table', description: 'Convert JSON to HTML table', parameters: [], optionalFields: [{ key: 'tableStyle', label: 'Table Style', type: 'string' }, { key: 'headerStyle', label: 'Header Style', type: 'string' }, { key: 'cellStyle', label: 'Cell Style', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { html: "<div>Extracted content</div>" } }],
  },

  xml: {
    id: 'xml',
    name: 'XML',
    description: 'Parse and generate XML data',
    icon: '📋',
    color: '#FF6600',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.xml/',
    version: '1.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'xml',
        label: 'XML',
        description: 'XML operations',
        operations: [
          { value: 'xmlToJson', label: 'XML to JSON', description: 'Convert XML to JSON', parameters: [{ key: 'dataPropertyName', label: 'Property Name', type: 'string', required: true }], optionalFields: [{ key: 'options', label: 'Options', type: 'json' }] },
          { value: 'jsonToXml', label: 'JSON to XML', description: 'Convert JSON to XML', parameters: [{ key: 'dataPropertyName', label: 'Property Name', type: 'string', required: true }], optionalFields: [{ key: 'headless', label: 'Headless', type: 'boolean' }, { key: 'rootName', label: 'Root Name', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { data: "<root><item>value</item></root>" } }],
  },

  csv: {
    id: 'csv',
    name: 'CSV',
    description: 'Parse and generate CSV data',
    icon: '📊',
    color: '#217346',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.csv/',
    version: '1.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'csv',
        label: 'CSV',
        description: 'CSV operations',
        operations: [
          { value: 'csvToJson', label: 'CSV to JSON', description: 'Convert CSV to JSON', parameters: [{ key: 'binaryPropertyName', label: 'Input Binary Field', type: 'string', required: true }], optionalFields: [{ key: 'delimiter', label: 'Delimiter', type: 'string' }, { key: 'includeEmptyCells', label: 'Include Empty Cells', type: 'boolean' }, { key: 'headerRow', label: 'Header Row', type: 'boolean' }] },
          { value: 'jsonToCsv', label: 'JSON to CSV', description: 'Convert JSON to CSV', parameters: [], optionalFields: [{ key: 'delimiter', label: 'Delimiter', type: 'string' }, { key: 'includeHeader', label: 'Include Header Row', type: 'boolean' }, { key: 'binaryPropertyName', label: 'Output Binary Field', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { col1: "value1", col2: "value2" } }],
  },

  rss: {
    id: 'rss',
    name: 'RSS',
    description: 'Read RSS feeds',
    icon: '📡',
    color: '#FFA500',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.rssfeed/',
    version: '1.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'feed',
        label: 'Feed',
        description: 'RSS feed operations',
        operations: [
          { value: 'read', label: 'Read', description: 'Read an RSS feed', parameters: [{ key: 'url', label: 'URL', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { title: "Feed Item", link: "https://example.com", pubDate: "2024-01-01" } }],
  },

  ftp: {
    id: 'ftp',
    name: 'FTP',
    description: 'Transfer files via FTP/SFTP',
    icon: '📁',
    color: '#0066CC',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.ftp/',
    version: '1.0',
    category: 'app',
    credentialType: 'ftp',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'file',
        label: 'File',
        description: 'File operations',
        operations: [
          { value: 'download', label: 'Download', description: 'Download a file', parameters: [{ key: 'path', label: 'Path', type: 'string', required: true }], optionalFields: [{ key: 'binaryPropertyName', label: 'Property Name', type: 'string' }] },
          { value: 'upload', label: 'Upload', description: 'Upload a file', parameters: [{ key: 'path', label: 'Path', type: 'string', required: true }, { key: 'binaryPropertyName', label: 'Property Name', type: 'string', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a file', parameters: [{ key: 'path', label: 'Path', type: 'string', required: true }], optionalFields: [] },
          { value: 'rename', label: 'Rename', description: 'Rename a file', parameters: [{ key: 'oldPath', label: 'Old Path', type: 'string', required: true }, { key: 'newPath', label: 'New Path', type: 'string', required: true }], optionalFields: [] },
          { value: 'list', label: 'List', description: 'List files in directory', parameters: [{ key: 'path', label: 'Path', type: 'string', required: true }], optionalFields: [{ key: 'recursive', label: 'Recursive', type: 'boolean' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { name: "file.txt", size: 1024, modifiedAt: "2024-01-01" } }],
  },

  ssh: {
    id: 'ssh',
    name: 'SSH',
    description: 'Execute commands on remote servers via SSH',
    icon: '🖥️',
    color: '#333333',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.ssh/',
    version: '1.0',
    category: 'app',
    credentialType: 'ssh',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'command',
        label: 'Command',
        description: 'Execute commands',
        operations: [
          { value: 'execute', label: 'Execute', description: 'Execute a command', parameters: [{ key: 'command', label: 'Command', type: 'string', required: true }], optionalFields: [{ key: 'cwd', label: 'Working Directory', type: 'string' }] },
        ],
      },
      {
        value: 'file',
        label: 'File',
        description: 'File operations over SSH',
        operations: [
          { value: 'download', label: 'Download', description: 'Download a file', parameters: [{ key: 'path', label: 'Path', type: 'string', required: true }], optionalFields: [{ key: 'binaryPropertyName', label: 'Property Name', type: 'string' }] },
          { value: 'upload', label: 'Upload', description: 'Upload a file', parameters: [{ key: 'path', label: 'Path', type: 'string', required: true }, { key: 'binaryPropertyName', label: 'Property Name', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { stdout: "command output", exitCode: 0 } }],
  },

  clickup: {
    id: 'clickup',
    name: 'ClickUp',
    description: 'Manage tasks and projects in ClickUp',
    icon: '✔️',
    color: '#7B68EE',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.clickup/',
    version: '1.0',
    category: 'app',
    credentialType: 'clickupApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'task',
        label: 'Task',
        description: 'Task operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a task', parameters: [{ key: 'listId', label: 'List ID', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: '1', label: 'Urgent' }, { value: '2', label: 'High' }, { value: '3', label: 'Normal' }, { value: '4', label: 'Low' }] }, { key: 'dueDate', label: 'Due Date', type: 'string' }, { key: 'assignees', label: 'Assignees', type: 'string' }, { key: 'tags', label: 'Tags', type: 'string' }, { key: 'status', label: 'Status', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all tasks', parameters: [{ key: 'listId', label: 'List ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'status', label: 'Status', type: 'string' }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: '1', label: 'Urgent' }, { value: '2', label: 'High' }, { value: '3', label: 'Normal' }, { value: '4', label: 'Low' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'list',
        label: 'List',
        description: 'List operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all lists', parameters: [{ key: 'folderId', label: 'Folder ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'folder',
        label: 'Folder',
        description: 'Folder operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all folders', parameters: [{ key: 'spaceId', label: 'Space ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "task123", name: "Task", status: "Open" } }],
  },

  monday: {
    id: 'monday',
    name: 'Monday.com',
    description: 'Manage projects in Monday.com',
    icon: '📅',
    color: '#FF3D57',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.monday/',
    version: '1.0',
    category: 'app',
    credentialType: 'mondayApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'board',
        label: 'Board',
        description: 'Board operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a board', parameters: [{ key: 'boardId', label: 'Board ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all boards', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
      {
        value: 'item',
        label: 'Item',
        description: 'Item operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an item', parameters: [{ key: 'boardId', label: 'Board ID', type: 'string', required: true }, { key: 'groupId', label: 'Group ID', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'columnValues', label: 'Column Values', type: 'json' }] },
          { value: 'getAll', label: 'Get All', description: 'Get all items', parameters: [{ key: 'boardId', label: 'Board ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'getByColumnValue', label: 'Get By Column Value', description: 'Get items by column value', parameters: [{ key: 'boardId', label: 'Board ID', type: 'string', required: true }, { key: 'columnId', label: 'Column ID', type: 'string', required: true }, { key: 'columnValue', label: 'Column Value', type: 'string', required: true }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update an item', parameters: [{ key: 'itemId', label: 'Item ID', type: 'string', required: true }, { key: 'columnValues', label: 'Column Values', type: 'json', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete an item', parameters: [{ key: 'itemId', label: 'Item ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'group',
        label: 'Group',
        description: 'Group operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all groups', parameters: [{ key: 'boardId', label: 'Board ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "123", name: "Item", board: { id: "board1" } } }],
  },

  todoist: {
    id: 'todoist',
    name: 'Todoist',
    description: 'Manage tasks in Todoist',
    icon: '✅',
    color: '#E44332',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.todoist/',
    version: '1.0',
    category: 'app',
    credentialType: 'todoistApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'task',
        label: 'Task',
        description: 'Task operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a task', parameters: [{ key: 'content', label: 'Content', type: 'string', required: true }], optionalFields: [{ key: 'projectId', label: 'Project ID', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: '1', label: 'Normal' }, { value: '2', label: 'High' }, { value: '3', label: 'Very High' }, { value: '4', label: 'Urgent' }] }, { key: 'dueString', label: 'Due String', type: 'string' }, { key: 'labels', label: 'Labels', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all tasks', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'filter', label: 'Filter', type: 'string' }] },
          { value: 'update', label: 'Update', description: 'Update a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [{ key: 'content', label: 'Content', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: '1', label: 'Normal' }, { value: '2', label: 'High' }, { value: '3', label: 'Very High' }, { value: '4', label: 'Urgent' }] }] },
          { value: 'close', label: 'Close', description: 'Close a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'reopen', label: 'Reopen', description: 'Reopen a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a task', parameters: [{ key: 'taskId', label: 'Task ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'project',
        label: 'Project',
        description: 'Project operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a project', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'color', label: 'Color', type: 'string' }, { key: 'isFavorite', label: 'Is Favorite', type: 'boolean' }] },
          { value: 'getAll', label: 'Get All', description: 'Get all projects', parameters: [], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a project', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "task1", content: "Task content", completed: false } }],
  },

  linear: {
    id: 'linear',
    name: 'Linear',
    description: 'Manage issues in Linear',
    icon: '📐',
    color: '#5E6AD2',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.linear/',
    version: '1.0',
    category: 'app',
    credentialType: 'linearApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'issue',
        label: 'Issue',
        description: 'Issue operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an issue', parameters: [{ key: 'teamId', label: 'Team ID', type: 'string', required: true }, { key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: '0', label: 'No Priority' }, { value: '1', label: 'Urgent' }, { value: '2', label: 'High' }, { value: '3', label: 'Medium' }, { value: '4', label: 'Low' }] }, { key: 'stateId', label: 'State ID', type: 'string' }, { key: 'assigneeId', label: 'Assignee ID', type: 'string' }, { key: 'labelIds', label: 'Label IDs', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get an issue', parameters: [{ key: 'issueId', label: 'Issue ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all issues', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'filters', label: 'Filters', type: 'json' }] },
          { value: 'update', label: 'Update', description: 'Update an issue', parameters: [{ key: 'issueId', label: 'Issue ID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'stateId', label: 'State ID', type: 'string' }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: '0', label: 'No Priority' }, { value: '1', label: 'Urgent' }, { value: '2', label: 'High' }, { value: '3', label: 'Medium' }, { value: '4', label: 'Low' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete an issue', parameters: [{ key: 'issueId', label: 'Issue ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'team',
        label: 'Team',
        description: 'Team operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all teams', parameters: [], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "issue1", title: "Issue Title", state: { name: "In Progress" } } }],
  },

  figma: {
    id: 'figma',
    name: 'Figma',
    description: 'Get data from Figma files',
    icon: '🎨',
    color: '#F24E1E',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.figma/',
    version: '1.0',
    category: 'app',
    credentialType: 'figmaApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'file',
        label: 'File',
        description: 'File operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a file', parameters: [{ key: 'fileKey', label: 'File Key', type: 'string', required: true }], optionalFields: [{ key: 'depth', label: 'Depth', type: 'number' }, { key: 'nodeIds', label: 'Node IDs', type: 'string' }] },
        ],
      },
      {
        value: 'comment',
        label: 'Comment',
        description: 'Comment operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all comments', parameters: [{ key: 'fileKey', label: 'File Key', type: 'string', required: true }], optionalFields: [] },
          { value: 'create', label: 'Create', description: 'Create a comment', parameters: [{ key: 'fileKey', label: 'File Key', type: 'string', required: true }, { key: 'message', label: 'Message', type: 'string', required: true }], optionalFields: [{ key: 'x', label: 'X Position', type: 'number' }, { key: 'y', label: 'Y Position', type: 'number' }] },
        ],
      },
      {
        value: 'image',
        label: 'Image',
        description: 'Image operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get images from a file', parameters: [{ key: 'fileKey', label: 'File Key', type: 'string', required: true }, { key: 'nodeIds', label: 'Node IDs', type: 'string', required: true }], optionalFields: [{ key: 'format', label: 'Format', type: 'select', options: [{ value: 'jpg', label: 'JPG' }, { value: 'png', label: 'PNG' }, { value: 'svg', label: 'SVG' }, { value: 'pdf', label: 'PDF' }] }, { key: 'scale', label: 'Scale', type: 'number' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { name: "Design File", lastModified: "2024-01-01" } }],
  },

  webflow: {
    id: 'webflow',
    name: 'Webflow',
    description: 'Manage Webflow CMS collections',
    icon: '🌐',
    color: '#4353FF',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.webflow/',
    version: '1.0',
    category: 'app',
    credentialType: 'webflowApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'item',
        label: 'Item',
        description: 'Collection item operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an item', parameters: [{ key: 'siteId', label: 'Site ID', type: 'string', required: true }, { key: 'collectionId', label: 'Collection ID', type: 'string', required: true }, { key: 'fields', label: 'Fields', type: 'json', required: true }], optionalFields: [{ key: 'live', label: 'Live', type: 'boolean' }] },
          { value: 'get', label: 'Get', description: 'Get an item', parameters: [{ key: 'siteId', label: 'Site ID', type: 'string', required: true }, { key: 'collectionId', label: 'Collection ID', type: 'string', required: true }, { key: 'itemId', label: 'Item ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all items', parameters: [{ key: 'siteId', label: 'Site ID', type: 'string', required: true }, { key: 'collectionId', label: 'Collection ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update an item', parameters: [{ key: 'siteId', label: 'Site ID', type: 'string', required: true }, { key: 'collectionId', label: 'Collection ID', type: 'string', required: true }, { key: 'itemId', label: 'Item ID', type: 'string', required: true }, { key: 'fields', label: 'Fields', type: 'json', required: true }], optionalFields: [{ key: 'live', label: 'Live', type: 'boolean' }] },
          { value: 'delete', label: 'Delete', description: 'Delete an item', parameters: [{ key: 'siteId', label: 'Site ID', type: 'string', required: true }, { key: 'collectionId', label: 'Collection ID', type: 'string', required: true }, { key: 'itemId', label: 'Item ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'site',
        label: 'Site',
        description: 'Site operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all sites', parameters: [], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { _id: "item1", name: "Item Name" } }],
  },

  wordpress: {
    id: 'wordpress',
    name: 'WordPress',
    description: 'Manage WordPress posts and pages',
    icon: '📝',
    color: '#21759B',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.wordpress/',
    version: '1.0',
    category: 'app',
    credentialType: 'wordpressApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'post',
        label: 'Post',
        description: 'Post operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a post', parameters: [{ key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'content', label: 'Content', type: 'string' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'publish', label: 'Publish' }, { value: 'pending', label: 'Pending' }, { value: 'private', label: 'Private' }] }, { key: 'slug', label: 'Slug', type: 'string' }, { key: 'categories', label: 'Categories', type: 'string' }, { key: 'tags', label: 'Tags', type: 'string' }, { key: 'excerpt', label: 'Excerpt', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a post', parameters: [{ key: 'postId', label: 'Post ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all posts', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'publish', label: 'Publish' }, { value: 'pending', label: 'Pending' }] }] },
          { value: 'update', label: 'Update', description: 'Update a post', parameters: [{ key: 'postId', label: 'Post ID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'content', label: 'Content', type: 'string' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'publish', label: 'Publish' }, { value: 'pending', label: 'Pending' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a post', parameters: [{ key: 'postId', label: 'Post ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'page',
        label: 'Page',
        description: 'Page operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a page', parameters: [{ key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'content', label: 'Content', type: 'string' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'publish', label: 'Publish' }] }] },
          { value: 'get', label: 'Get', description: 'Get a page', parameters: [{ key: 'pageId', label: 'Page ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all pages', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a page', parameters: [{ key: 'pageId', label: 'Page ID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'content', label: 'Content', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a page', parameters: [{ key: 'pageId', label: 'Page ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'user',
        label: 'User',
        description: 'User operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all users', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 1, title: { rendered: "Post Title" }, status: "publish" } }],
  },

  pipedrive: {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Manage Pipedrive CRM data',
    icon: '💼',
    color: '#1E5532',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.pipedrive/',
    version: '1.0',
    category: 'app',
    credentialType: 'pipedriveApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'deal',
        label: 'Deal',
        description: 'Deal operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a deal', parameters: [{ key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'value', label: 'Value', type: 'number' }, { key: 'currency', label: 'Currency', type: 'string' }, { key: 'personId', label: 'Person ID', type: 'string' }, { key: 'orgId', label: 'Organization ID', type: 'string' }, { key: 'stageId', label: 'Stage ID', type: 'string' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'open', label: 'Open' }, { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }] }] },
          { value: 'get', label: 'Get', description: 'Get a deal', parameters: [{ key: 'dealId', label: 'Deal ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all deals', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'all_not_deleted', label: 'All Not Deleted' }, { value: 'open', label: 'Open' }, { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }] }] },
          { value: 'update', label: 'Update', description: 'Update a deal', parameters: [{ key: 'dealId', label: 'Deal ID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'value', label: 'Value', type: 'number' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'open', label: 'Open' }, { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a deal', parameters: [{ key: 'dealId', label: 'Deal ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'person',
        label: 'Person',
        description: 'Person operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a person', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }, { key: 'orgId', label: 'Organization ID', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a person', parameters: [{ key: 'personId', label: 'Person ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all persons', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a person', parameters: [{ key: 'personId', label: 'Person ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'email', label: 'Email', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a person', parameters: [{ key: 'personId', label: 'Person ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'organization',
        label: 'Organization',
        description: 'Organization operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an organization', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'address', label: 'Address', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get an organization', parameters: [{ key: 'orgId', label: 'Organization ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all organizations', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update an organization', parameters: [{ key: 'orgId', label: 'Organization ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'address', label: 'Address', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete an organization', parameters: [{ key: 'orgId', label: 'Organization ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 1, title: "Deal Title", value: 1000 } }],
  },

  activecampaign: {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    description: 'Manage ActiveCampaign contacts and automations',
    icon: '📧',
    color: '#356AE6',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.activecampaign/',
    version: '1.0',
    category: 'app',
    credentialType: 'activeCampaignApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'contact',
        label: 'Contact',
        description: 'Contact operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a contact', parameters: [{ key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [{ key: 'firstName', label: 'First Name', type: 'string' }, { key: 'lastName', label: 'Last Name', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all contacts', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'firstName', label: 'First Name', type: 'string' }, { key: 'lastName', label: 'Last Name', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'deal',
        label: 'Deal',
        description: 'Deal operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a deal', parameters: [{ key: 'title', label: 'Title', type: 'string', required: true }, { key: 'contact', label: 'Contact ID', type: 'string', required: true }, { key: 'value', label: 'Value', type: 'number', required: true }], optionalFields: [{ key: 'currency', label: 'Currency', type: 'string' }, { key: 'group', label: 'Pipeline ID', type: 'string' }, { key: 'stage', label: 'Stage ID', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a deal', parameters: [{ key: 'dealId', label: 'Deal ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all deals', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a deal', parameters: [{ key: 'dealId', label: 'Deal ID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'value', label: 'Value', type: 'number' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a deal', parameters: [{ key: 'dealId', label: 'Deal ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'list',
        label: 'List',
        description: 'List operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all lists', parameters: [], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "1", email: "contact@example.com" } }],
  },

  freshdesk: {
    id: 'freshdesk',
    name: 'Freshdesk',
    description: 'Manage Freshdesk support tickets',
    icon: '🎫',
    color: '#25C16F',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.freshdesk/',
    version: '1.0',
    category: 'app',
    credentialType: 'freshdeskApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'ticket',
        label: 'Ticket',
        description: 'Ticket operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a ticket', parameters: [{ key: 'email', label: 'Requester Email', type: 'string', required: true }, { key: 'subject', label: 'Subject', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: '2', label: 'Open' }, { value: '3', label: 'Pending' }, { value: '4', label: 'Resolved' }, { value: '5', label: 'Closed' }] }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: '1', label: 'Low' }, { value: '2', label: 'Medium' }, { value: '3', label: 'High' }, { value: '4', label: 'Urgent' }] }, { key: 'type', label: 'Type', type: 'string' }, { key: 'tags', label: 'Tags', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a ticket', parameters: [{ key: 'ticketId', label: 'Ticket ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all tickets', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a ticket', parameters: [{ key: 'ticketId', label: 'Ticket ID', type: 'string', required: true }], optionalFields: [{ key: 'status', label: 'Status', type: 'select', options: [{ value: '2', label: 'Open' }, { value: '3', label: 'Pending' }, { value: '4', label: 'Resolved' }, { value: '5', label: 'Closed' }] }, { key: 'priority', label: 'Priority', type: 'select', options: [{ value: '1', label: 'Low' }, { value: '2', label: 'Medium' }, { value: '3', label: 'High' }, { value: '4', label: 'Urgent' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a ticket', parameters: [{ key: 'ticketId', label: 'Ticket ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'contact',
        label: 'Contact',
        description: 'Contact operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a contact', parameters: [{ key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all contacts', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'email', label: 'Email', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 1, subject: "Support Request", status: 2 } }],
  },

  awsS3: {
    id: 'awsS3',
    name: 'AWS S3',
    description: 'Store and retrieve files from AWS S3',
    icon: '☁️',
    color: '#FF9900',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.awss3/',
    version: '1.0',
    category: 'app',
    credentialType: 'awsS3',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'bucket',
        label: 'Bucket',
        description: 'Bucket operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a bucket', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'region', label: 'Region', type: 'string' }] },
          { value: 'getAll', label: 'Get All', description: 'Get all buckets', parameters: [], optionalFields: [] },
          { value: 'search', label: 'Search', description: 'Search for a bucket', parameters: [{ key: 'bucketName', label: 'Bucket Name', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'file',
        label: 'File',
        description: 'File operations',
        operations: [
          { value: 'upload', label: 'Upload', description: 'Upload a file', parameters: [{ key: 'bucketName', label: 'Bucket Name', type: 'string', required: true }, { key: 'fileName', label: 'File Name', type: 'string', required: true }], optionalFields: [{ key: 'binaryData', label: 'Binary Data', type: 'boolean' }, { key: 'binaryPropertyName', label: 'Binary Property Name', type: 'string' }] },
          { value: 'download', label: 'Download', description: 'Download a file', parameters: [{ key: 'bucketName', label: 'Bucket Name', type: 'string', required: true }, { key: 'fileKey', label: 'File Key', type: 'string', required: true }], optionalFields: [{ key: 'binaryPropertyName', label: 'Binary Property Name', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a file', parameters: [{ key: 'bucketName', label: 'Bucket Name', type: 'string', required: true }, { key: 'fileKey', label: 'File Key', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all files', parameters: [{ key: 'bucketName', label: 'Bucket Name', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'prefix', label: 'Prefix', type: 'string' }] },
          { value: 'copy', label: 'Copy', description: 'Copy a file', parameters: [{ key: 'sourceBucket', label: 'Source Bucket', type: 'string', required: true }, { key: 'sourceKey', label: 'Source Key', type: 'string', required: true }, { key: 'destinationBucket', label: 'Destination Bucket', type: 'string', required: true }, { key: 'destinationKey', label: 'Destination Key', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'folder',
        label: 'Folder',
        description: 'Folder operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a folder', parameters: [{ key: 'bucketName', label: 'Bucket Name', type: 'string', required: true }, { key: 'folderName', label: 'Folder Name', type: 'string', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a folder', parameters: [{ key: 'bucketName', label: 'Bucket Name', type: 'string', required: true }, { key: 'folderKey', label: 'Folder Key', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all folders', parameters: [{ key: 'bucketName', label: 'Bucket Name', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { Key: "file.txt", Size: 1024, LastModified: "2024-01-01" } }],
  },

  oneDrive: {
    id: 'oneDrive',
    name: 'Microsoft OneDrive',
    description: 'Manage files in OneDrive',
    icon: '📁',
    color: '#0078D4',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsoftonedrive/',
    version: '1.0',
    category: 'app',
    credentialType: 'microsoftOneDriveOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'file',
        label: 'File',
        description: 'File operations',
        operations: [
          { value: 'upload', label: 'Upload', description: 'Upload a file', parameters: [{ key: 'fileName', label: 'File Name', type: 'string', required: true }], optionalFields: [{ key: 'parentId', label: 'Parent ID', type: 'string' }, { key: 'binaryPropertyName', label: 'Binary Property Name', type: 'string' }] },
          { value: 'download', label: 'Download', description: 'Download a file', parameters: [{ key: 'fileId', label: 'File ID', type: 'string', required: true }], optionalFields: [{ key: 'binaryPropertyName', label: 'Binary Property Name', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a file', parameters: [{ key: 'fileId', label: 'File ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get file details', parameters: [{ key: 'fileId', label: 'File ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'search', label: 'Search', description: 'Search files', parameters: [{ key: 'query', label: 'Query', type: 'string', required: true }], optionalFields: [] },
          { value: 'share', label: 'Share', description: 'Share a file', parameters: [{ key: 'fileId', label: 'File ID', type: 'string', required: true }, { key: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'view', label: 'View' }, { value: 'edit', label: 'Edit' }] }], optionalFields: [{ key: 'scope', label: 'Scope', type: 'select', options: [{ value: 'anonymous', label: 'Anonymous' }, { value: 'organization', label: 'Organization' }] }] },
        ],
      },
      {
        value: 'folder',
        label: 'Folder',
        description: 'Folder operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a folder', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'parentId', label: 'Parent ID', type: 'string' }] },
          { value: 'getChildren', label: 'Get Children', description: 'Get folder contents', parameters: [{ key: 'folderId', label: 'Folder ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a folder', parameters: [{ key: 'folderId', label: 'Folder ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "file1", name: "document.pdf", size: 2048 } }],
  },

  box: {
    id: 'box',
    name: 'Box',
    description: 'Manage files in Box',
    icon: '📦',
    color: '#0061D5',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.box/',
    version: '1.0',
    category: 'app',
    credentialType: 'boxOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'file',
        label: 'File',
        description: 'File operations',
        operations: [
          { value: 'upload', label: 'Upload', description: 'Upload a file', parameters: [{ key: 'fileName', label: 'File Name', type: 'string', required: true }, { key: 'parentId', label: 'Parent Folder ID', type: 'string', required: true }], optionalFields: [{ key: 'binaryPropertyName', label: 'Binary Property Name', type: 'string' }] },
          { value: 'download', label: 'Download', description: 'Download a file', parameters: [{ key: 'fileId', label: 'File ID', type: 'string', required: true }], optionalFields: [{ key: 'binaryPropertyName', label: 'Binary Property Name', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get file details', parameters: [{ key: 'fileId', label: 'File ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a file', parameters: [{ key: 'fileId', label: 'File ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'copy', label: 'Copy', description: 'Copy a file', parameters: [{ key: 'fileId', label: 'File ID', type: 'string', required: true }, { key: 'parentId', label: 'Destination Folder ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }] },
          { value: 'search', label: 'Search', description: 'Search files', parameters: [{ key: 'query', label: 'Query', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
      {
        value: 'folder',
        label: 'Folder',
        description: 'Folder operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a folder', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }, { key: 'parentId', label: 'Parent Folder ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get folder details', parameters: [{ key: 'folderId', label: 'Folder ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a folder', parameters: [{ key: 'folderId', label: 'Folder ID', type: 'string', required: true }], optionalFields: [{ key: 'recursive', label: 'Recursive', type: 'boolean' }] },
          { value: 'getItems', label: 'Get Items', description: 'Get folder items', parameters: [{ key: 'folderId', label: 'Folder ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "file1", type: "file", name: "document.pdf" } }],
  },

  supabase: {
    id: 'supabase',
    name: 'Supabase',
    description: 'Interact with Supabase database',
    icon: '⚡',
    color: '#3ECF8E',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.supabase/',
    version: '1.0',
    category: 'app',
    credentialType: 'supabaseApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'row',
        label: 'Row',
        description: 'Row operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a row', parameters: [{ key: 'tableId', label: 'Table', type: 'string', required: true }, { key: 'data', label: 'Data', type: 'json', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a row', parameters: [{ key: 'tableId', label: 'Table', type: 'string', required: true }, { key: 'filters', label: 'Filters', type: 'json', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all rows', parameters: [{ key: 'tableId', label: 'Table', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'filters', label: 'Filters', type: 'json' }] },
          { value: 'update', label: 'Update', description: 'Update a row', parameters: [{ key: 'tableId', label: 'Table', type: 'string', required: true }, { key: 'filters', label: 'Filters', type: 'json', required: true }, { key: 'data', label: 'Data', type: 'json', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a row', parameters: [{ key: 'tableId', label: 'Table', type: 'string', required: true }, { key: 'filters', label: 'Filters', type: 'json', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 1, name: "Row 1", created_at: "2024-01-01" } }],
  },

  firebase: {
    id: 'firebase',
    name: 'Firebase Realtime Database',
    description: 'Interact with Firebase Realtime Database',
    icon: '🔥',
    color: '#FFCA28',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.firebaserealtimedatabase/',
    version: '1.0',
    category: 'app',
    credentialType: 'firebaseRealtimeDatabase',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'data',
        label: 'Data',
        description: 'Database operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Write data to a path', parameters: [{ key: 'path', label: 'Path', type: 'string', required: true }, { key: 'data', label: 'Data', type: 'json', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Read data from a path', parameters: [{ key: 'path', label: 'Path', type: 'string', required: true }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update data at a path', parameters: [{ key: 'path', label: 'Path', type: 'string', required: true }, { key: 'data', label: 'Data', type: 'json', required: true }], optionalFields: [] },
          { value: 'push', label: 'Push', description: 'Push data to a list', parameters: [{ key: 'path', label: 'Path', type: 'string', required: true }, { key: 'data', label: 'Data', type: 'json', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete data at a path', parameters: [{ key: 'path', label: 'Path', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { key: "-NxABC123", value: { name: "Item" } } }],
  },

  mattermost: {
    id: 'mattermost',
    name: 'Mattermost',
    description: 'Send messages and manage Mattermost',
    icon: '💬',
    color: '#0058CC',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mattermost/',
    version: '1.0',
    category: 'app',
    credentialType: 'mattermostApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'message',
        label: 'Message',
        description: 'Message operations',
        operations: [
          { value: 'post', label: 'Post', description: 'Post a message', parameters: [{ key: 'channelId', label: 'Channel ID', type: 'string', required: true }, { key: 'message', label: 'Message', type: 'string', required: true }], optionalFields: [{ key: 'attachments', label: 'Attachments', type: 'json' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a message', parameters: [{ key: 'postId', label: 'Post ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'channel',
        label: 'Channel',
        description: 'Channel operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a channel', parameters: [{ key: 'teamId', label: 'Team ID', type: 'string', required: true }, { key: 'displayName', label: 'Display Name', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'type', label: 'Type', type: 'select', options: [{ value: 'O', label: 'Public' }, { value: 'P', label: 'Private' }] }] },
          { value: 'getAll', label: 'Get All', description: 'Get all channels', parameters: [{ key: 'teamId', label: 'Team ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'addUser', label: 'Add User', description: 'Add user to channel', parameters: [{ key: 'channelId', label: 'Channel ID', type: 'string', required: true }, { key: 'userId', label: 'User ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'user',
        label: 'User',
        description: 'User operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all users', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'getByEmail', label: 'Get By Email', description: 'Get user by email', parameters: [{ key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [] },
          { value: 'getById', label: 'Get By ID', description: 'Get user by ID', parameters: [{ key: 'userId', label: 'User ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "post1", message: "Hello Mattermost!" } }],
  },

  whatsappBusiness: {
    id: 'whatsappBusiness',
    name: 'WhatsApp Business Cloud',
    description: 'Send WhatsApp messages via Cloud API',
    icon: '💚',
    color: '#25D366',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.whatsapp/',
    version: '1.0',
    category: 'app',
    credentialType: 'whatsAppBusinessCloudApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'message',
        label: 'Message',
        description: 'Message operations',
        operations: [
          { value: 'sendText', label: 'Send Text', description: 'Send a text message', parameters: [{ key: 'phoneNumberId', label: 'Phone Number ID', type: 'string', required: true }, { key: 'recipientPhoneNumber', label: 'Recipient Phone', type: 'string', required: true }, { key: 'message', label: 'Message', type: 'string', required: true }], optionalFields: [{ key: 'previewUrl', label: 'Preview URL', type: 'boolean' }] },
          { value: 'sendTemplate', label: 'Send Template', description: 'Send a template message', parameters: [{ key: 'phoneNumberId', label: 'Phone Number ID', type: 'string', required: true }, { key: 'recipientPhoneNumber', label: 'Recipient Phone', type: 'string', required: true }, { key: 'templateName', label: 'Template Name', type: 'string', required: true }, { key: 'language', label: 'Language', type: 'string', required: true }], optionalFields: [{ key: 'components', label: 'Components', type: 'json' }] },
          { value: 'sendMedia', label: 'Send Media', description: 'Send media message', parameters: [{ key: 'phoneNumberId', label: 'Phone Number ID', type: 'string', required: true }, { key: 'recipientPhoneNumber', label: 'Recipient Phone', type: 'string', required: true }, { key: 'mediaType', label: 'Media Type', type: 'select', required: true, options: [{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }, { value: 'audio', label: 'Audio' }, { value: 'document', label: 'Document' }] }], optionalFields: [{ key: 'mediaId', label: 'Media ID', type: 'string' }, { key: 'link', label: 'Link', type: 'string' }, { key: 'caption', label: 'Caption', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { messaging_product: "whatsapp", contacts: [{ wa_id: "1234567890" }] } }],
  },

  viber: {
    id: 'viber',
    name: 'Viber',
    description: 'Send Viber messages',
    icon: '📱',
    color: '#665CAC',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.viber/',
    version: '1.0',
    category: 'app',
    credentialType: 'viberApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'message',
        label: 'Message',
        description: 'Message operations',
        operations: [
          { value: 'send', label: 'Send', description: 'Send a message', parameters: [{ key: 'receiver', label: 'Receiver', type: 'string', required: true }, { key: 'text', label: 'Text', type: 'string', required: true }], optionalFields: [{ key: 'type', label: 'Type', type: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'picture', label: 'Picture' }, { value: 'video', label: 'Video' }, { value: 'file', label: 'File' }] }, { key: 'trackingData', label: 'Tracking Data', type: 'string' }] },
          { value: 'sendBroadcast', label: 'Send Broadcast', description: 'Send broadcast message', parameters: [{ key: 'broadcastList', label: 'Broadcast List', type: 'string', required: true }, { key: 'text', label: 'Text', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { status: 0, status_message: "ok" } }],
  },

  reddit: {
    id: 'reddit',
    name: 'Reddit',
    description: 'Interact with Reddit',
    icon: '🔴',
    color: '#FF4500',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.reddit/',
    version: '1.0',
    category: 'app',
    credentialType: 'redditOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'post',
        label: 'Post',
        description: 'Post operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Submit a post', parameters: [{ key: 'subreddit', label: 'Subreddit', type: 'string', required: true }, { key: 'title', label: 'Title', type: 'string', required: true }, { key: 'kind', label: 'Kind', type: 'select', required: true, options: [{ value: 'self', label: 'Text' }, { value: 'link', label: 'Link' }, { value: 'image', label: 'Image' }] }], optionalFields: [{ key: 'text', label: 'Text', type: 'string' }, { key: 'url', label: 'URL', type: 'string' }, { key: 'nsfw', label: 'NSFW', type: 'boolean' }, { key: 'flair', label: 'Flair', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a post', parameters: [{ key: 'subreddit', label: 'Subreddit', type: 'string', required: true }, { key: 'postId', label: 'Post ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get posts from subreddit', parameters: [{ key: 'subreddit', label: 'Subreddit', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'category', label: 'Category', type: 'select', options: [{ value: 'hot', label: 'Hot' }, { value: 'new', label: 'New' }, { value: 'top', label: 'Top' }, { value: 'rising', label: 'Rising' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a post', parameters: [{ key: 'postId', label: 'Post ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'comment',
        label: 'Comment',
        description: 'Comment operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Post a comment', parameters: [{ key: 'postId', label: 'Post ID', type: 'string', required: true }, { key: 'text', label: 'Text', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get comments', parameters: [{ key: 'postId', label: 'Post ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a comment', parameters: [{ key: 'commentId', label: 'Comment ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'user',
        label: 'User',
        description: 'User operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get user info', parameters: [{ key: 'username', label: 'Username', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "post1", title: "Reddit Post", score: 100 } }],
  },

  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Manage Pinterest pins and boards',
    icon: '📌',
    color: '#E60023',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.pinterest/',
    version: '1.0',
    category: 'app',
    credentialType: 'pinterestOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'pin',
        label: 'Pin',
        description: 'Pin operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a pin', parameters: [{ key: 'boardId', label: 'Board ID', type: 'string', required: true }, { key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'link', label: 'Link', type: 'string' }, { key: 'imageUrl', label: 'Image URL', type: 'string' }, { key: 'altText', label: 'Alt Text', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a pin', parameters: [{ key: 'pinId', label: 'Pin ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a pin', parameters: [{ key: 'pinId', label: 'Pin ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'board',
        label: 'Board',
        description: 'Board operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a board', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'privacy', label: 'Privacy', type: 'select', options: [{ value: 'PUBLIC', label: 'Public' }, { value: 'PROTECTED', label: 'Protected' }, { value: 'SECRET', label: 'Secret' }] }] },
          { value: 'get', label: 'Get', description: 'Get a board', parameters: [{ key: 'boardId', label: 'Board ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all boards', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a board', parameters: [{ key: 'boardId', label: 'Board ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "pin1", title: "My Pin", board_id: "board1" } }],
  },

  calendly: {
    id: 'calendly',
    name: 'Calendly',
    description: 'Manage Calendly events and invitees',
    icon: '📅',
    color: '#006BFF',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.calendly/',
    version: '1.0',
    category: 'app',
    credentialType: 'calendlyApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'event',
        label: 'Event',
        description: 'Event operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get an event', parameters: [{ key: 'eventId', label: 'Event ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all events', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'canceled', label: 'Canceled' }] }] },
        ],
      },
      {
        value: 'invitee',
        label: 'Invitee',
        description: 'Invitee operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get an invitee', parameters: [{ key: 'eventId', label: 'Event ID', type: 'string', required: true }, { key: 'inviteeId', label: 'Invitee ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all invitees', parameters: [{ key: 'eventId', label: 'Event ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { uri: "event1", name: "Meeting", start_time: "2024-01-01T10:00:00Z" } }],
  },

  intercom: {
    id: 'intercom',
    name: 'Intercom',
    description: 'Manage Intercom contacts and conversations',
    icon: '💬',
    color: '#1F8DED',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.intercom/',
    version: '1.0',
    category: 'app',
    credentialType: 'intercomApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'contact',
        label: 'Contact',
        description: 'Contact operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a contact', parameters: [{ key: 'role', label: 'Role', type: 'select', required: true, options: [{ value: 'user', label: 'User' }, { value: 'lead', label: 'Lead' }] }], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'name', label: 'Name', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }, { key: 'externalId', label: 'External ID', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all contacts', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'name', label: 'Name', type: 'string' }, { key: 'phone', label: 'Phone', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a contact', parameters: [{ key: 'contactId', label: 'Contact ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'conversation',
        label: 'Conversation',
        description: 'Conversation operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a conversation', parameters: [{ key: 'userId', label: 'User ID', type: 'string', required: true }, { key: 'body', label: 'Body', type: 'string', required: true }], optionalFields: [] },
          { value: 'get', label: 'Get', description: 'Get a conversation', parameters: [{ key: 'conversationId', label: 'Conversation ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all conversations', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'reply', label: 'Reply', description: 'Reply to a conversation', parameters: [{ key: 'conversationId', label: 'Conversation ID', type: 'string', required: true }, { key: 'body', label: 'Body', type: 'string', required: true }, { key: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }] }], optionalFields: [] },
        ],
      },
      {
        value: 'company',
        label: 'Company',
        description: 'Company operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a company', parameters: [{ key: 'companyId', label: 'Company ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'plan', label: 'Plan', type: 'string' }, { key: 'website', label: 'Website', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a company', parameters: [{ key: 'companyId', label: 'Company ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all companies', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a company', parameters: [{ key: 'companyId', label: 'Company ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { type: "contact", id: "123", email: "user@example.com" } }],
  },

  paypal: {
    id: 'paypal',
    name: 'PayPal',
    description: 'Manage PayPal payments and payouts',
    icon: '💰',
    color: '#003087',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.paypal/',
    version: '1.0',
    category: 'app',
    credentialType: 'payPalApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'payout',
        label: 'Payout',
        description: 'Payout operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a payout', parameters: [{ key: 'senderBatchId', label: 'Sender Batch ID', type: 'string', required: true }, { key: 'items', label: 'Items', type: 'json', required: true }], optionalFields: [{ key: 'emailSubject', label: 'Email Subject', type: 'string' }, { key: 'emailMessage', label: 'Email Message', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a payout', parameters: [{ key: 'payoutBatchId', label: 'Payout Batch ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'payoutItem',
        label: 'Payout Item',
        description: 'Payout item operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a payout item', parameters: [{ key: 'payoutItemId', label: 'Payout Item ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'cancel', label: 'Cancel', description: 'Cancel a payout item', parameters: [{ key: 'payoutItemId', label: 'Payout Item ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { batch_header: { payout_batch_id: "batch1", batch_status: "SUCCESS" } } }],
  },

  woocommerce: {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Manage WooCommerce store data',
    icon: '🛒',
    color: '#96588A',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.woocommerce/',
    version: '1.0',
    category: 'app',
    credentialType: 'wooCommerceApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'order',
        label: 'Order',
        description: 'Order operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an order', parameters: [], optionalFields: [{ key: 'status', label: 'Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'processing', label: 'Processing' }, { value: 'on-hold', label: 'On Hold' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'refunded', label: 'Refunded' }] }, { key: 'customerId', label: 'Customer ID', type: 'number' }, { key: 'lineItems', label: 'Line Items', type: 'json' }] },
          { value: 'get', label: 'Get', description: 'Get an order', parameters: [{ key: 'orderId', label: 'Order ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all orders', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'any', label: 'Any' }, { value: 'pending', label: 'Pending' }, { value: 'processing', label: 'Processing' }, { value: 'completed', label: 'Completed' }] }] },
          { value: 'update', label: 'Update', description: 'Update an order', parameters: [{ key: 'orderId', label: 'Order ID', type: 'string', required: true }], optionalFields: [{ key: 'status', label: 'Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'processing', label: 'Processing' }, { value: 'completed', label: 'Completed' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete an order', parameters: [{ key: 'orderId', label: 'Order ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'product',
        label: 'Product',
        description: 'Product operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a product', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'type', label: 'Type', type: 'select', options: [{ value: 'simple', label: 'Simple' }, { value: 'grouped', label: 'Grouped' }, { value: 'external', label: 'External' }, { value: 'variable', label: 'Variable' }] }, { key: 'regularPrice', label: 'Regular Price', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'sku', label: 'SKU', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a product', parameters: [{ key: 'productId', label: 'Product ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all products', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a product', parameters: [{ key: 'productId', label: 'Product ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'regularPrice', label: 'Regular Price', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a product', parameters: [{ key: 'productId', label: 'Product ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'customer',
        label: 'Customer',
        description: 'Customer operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a customer', parameters: [{ key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [{ key: 'firstName', label: 'First Name', type: 'string' }, { key: 'lastName', label: 'Last Name', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a customer', parameters: [{ key: 'customerId', label: 'Customer ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all customers', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a customer', parameters: [{ key: 'customerId', label: 'Customer ID', type: 'string', required: true }], optionalFields: [{ key: 'email', label: 'Email', type: 'string' }, { key: 'firstName', label: 'First Name', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a customer', parameters: [{ key: 'customerId', label: 'Customer ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 123, status: "processing", total: "99.00" } }],
  },

  gitlab: {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Manage GitLab repositories and issues',
    icon: '🦊',
    color: '#FC6D26',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gitlab/',
    version: '1.0',
    category: 'app',
    credentialType: 'gitlabApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'issue',
        label: 'Issue',
        description: 'Issue operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an issue', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'labels', label: 'Labels', type: 'string' }, { key: 'assigneeIds', label: 'Assignee IDs', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get an issue', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'issueIid', label: 'Issue IID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all issues', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'state', label: 'State', type: 'select', options: [{ value: 'all', label: 'All' }, { value: 'opened', label: 'Opened' }, { value: 'closed', label: 'Closed' }] }] },
          { value: 'update', label: 'Update', description: 'Update an issue', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'issueIid', label: 'Issue IID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }, { key: 'state', label: 'State', type: 'select', options: [{ value: 'close', label: 'Close' }, { value: 'reopen', label: 'Reopen' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete an issue', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'issueIid', label: 'Issue IID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'repository',
        label: 'Repository',
        description: 'Repository operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a repository', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all repositories', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
      {
        value: 'mergeRequest',
        label: 'Merge Request',
        description: 'Merge request operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a merge request', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'sourceBranch', label: 'Source Branch', type: 'string', required: true }, { key: 'targetBranch', label: 'Target Branch', type: 'string', required: true }, { key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a merge request', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'mergeRequestIid', label: 'MR IID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all merge requests', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'state', label: 'State', type: 'select', options: [{ value: 'all', label: 'All' }, { value: 'opened', label: 'Opened' }, { value: 'closed', label: 'Closed' }, { value: 'merged', label: 'Merged' }] }] },
          { value: 'update', label: 'Update', description: 'Update a merge request', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'mergeRequestIid', label: 'MR IID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'description', label: 'Description', type: 'string' }] },
          { value: 'merge', label: 'Merge', description: 'Merge a merge request', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'mergeRequestIid', label: 'MR IID', type: 'string', required: true }], optionalFields: [{ key: 'mergeCommitMessage', label: 'Merge Commit Message', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 1, iid: 1, title: "Issue Title", state: "opened" } }],
  },

  microsoftOutlook: {
    id: 'microsoftOutlook',
    name: 'Microsoft Outlook',
    description: 'Manage Outlook emails and calendar',
    icon: '📧',
    color: '#0078D4',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsoftoutlook/',
    version: '1.0',
    category: 'app',
    credentialType: 'microsoftOutlookOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'message',
        label: 'Message',
        description: 'Email message operations',
        operations: [
          { value: 'send', label: 'Send', description: 'Send an email', parameters: [{ key: 'toRecipients', label: 'To', type: 'string', required: true }, { key: 'subject', label: 'Subject', type: 'string', required: true }], optionalFields: [{ key: 'bodyContent', label: 'Body', type: 'string' }, { key: 'bodyContentType', label: 'Content Type', type: 'select', options: [{ value: 'Text', label: 'Text' }, { value: 'HTML', label: 'HTML' }] }, { key: 'ccRecipients', label: 'CC', type: 'string' }, { key: 'bccRecipients', label: 'BCC', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a message', parameters: [{ key: 'messageId', label: 'Message ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all messages', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'folderId', label: 'Folder ID', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a message', parameters: [{ key: 'messageId', label: 'Message ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'move', label: 'Move', description: 'Move a message', parameters: [{ key: 'messageId', label: 'Message ID', type: 'string', required: true }, { key: 'destinationId', label: 'Destination Folder ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'reply', label: 'Reply', description: 'Reply to a message', parameters: [{ key: 'messageId', label: 'Message ID', type: 'string', required: true }, { key: 'comment', label: 'Comment', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'folder',
        label: 'Folder',
        description: 'Folder operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all folders', parameters: [], optionalFields: [] },
          { value: 'create', label: 'Create', description: 'Create a folder', parameters: [{ key: 'displayName', label: 'Display Name', type: 'string', required: true }], optionalFields: [{ key: 'parentFolderId', label: 'Parent Folder ID', type: 'string' }] },
        ],
      },
      {
        value: 'draft',
        label: 'Draft',
        description: 'Draft operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a draft', parameters: [{ key: 'subject', label: 'Subject', type: 'string', required: true }], optionalFields: [{ key: 'bodyContent', label: 'Body', type: 'string' }, { key: 'toRecipients', label: 'To', type: 'string' }] },
          { value: 'send', label: 'Send', description: 'Send a draft', parameters: [{ key: 'messageId', label: 'Draft ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "msg1", subject: "Email Subject", from: { emailAddress: { address: "sender@example.com" } } } }],
  },

  microsoftExcel: {
    id: 'microsoftExcel',
    name: 'Microsoft Excel',
    description: 'Work with Excel spreadsheets',
    icon: '📊',
    color: '#217346',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsoftexcel/',
    version: '1.0',
    category: 'app',
    credentialType: 'microsoftExcelOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'table',
        label: 'Table',
        description: 'Table operations',
        operations: [
          { value: 'addRow', label: 'Add Row', description: 'Add a row to table', parameters: [{ key: 'workbookId', label: 'Workbook ID', type: 'string', required: true }, { key: 'worksheetId', label: 'Worksheet ID', type: 'string', required: true }, { key: 'tableId', label: 'Table ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getRows', label: 'Get Rows', description: 'Get rows from table', parameters: [{ key: 'workbookId', label: 'Workbook ID', type: 'string', required: true }, { key: 'worksheetId', label: 'Worksheet ID', type: 'string', required: true }, { key: 'tableId', label: 'Table ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'lookup', label: 'Lookup', description: 'Look up a row', parameters: [{ key: 'workbookId', label: 'Workbook ID', type: 'string', required: true }, { key: 'worksheetId', label: 'Worksheet ID', type: 'string', required: true }, { key: 'tableId', label: 'Table ID', type: 'string', required: true }, { key: 'lookupColumn', label: 'Lookup Column', type: 'string', required: true }, { key: 'lookupValue', label: 'Lookup Value', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'worksheet',
        label: 'Worksheet',
        description: 'Worksheet operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all worksheets', parameters: [{ key: 'workbookId', label: 'Workbook ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getContent', label: 'Get Content', description: 'Get worksheet content', parameters: [{ key: 'workbookId', label: 'Workbook ID', type: 'string', required: true }, { key: 'worksheetId', label: 'Worksheet ID', type: 'string', required: true }], optionalFields: [{ key: 'range', label: 'Range', type: 'string' }] },
          { value: 'append', label: 'Append', description: 'Append data', parameters: [{ key: 'workbookId', label: 'Workbook ID', type: 'string', required: true }, { key: 'worksheetId', label: 'Worksheet ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'clear', label: 'Clear', description: 'Clear a range', parameters: [{ key: 'workbookId', label: 'Workbook ID', type: 'string', required: true }, { key: 'worksheetId', label: 'Worksheet ID', type: 'string', required: true }, { key: 'range', label: 'Range', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'workbook',
        label: 'Workbook',
        description: 'Workbook operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all workbooks', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { values: [["Col1", "Col2"], ["Val1", "Val2"]] } }],
  },

  googleDocs: {
    id: 'googleDocs',
    name: 'Google Docs',
    description: 'Create and edit Google Docs',
    icon: '📄',
    color: '#4285F4',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledocs/',
    version: '1.0',
    category: 'app',
    credentialType: 'googleDocsOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'document',
        label: 'Document',
        description: 'Document operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a document', parameters: [{ key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'folderId', label: 'Folder ID', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a document', parameters: [{ key: 'documentId', label: 'Document ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'update', label: 'Update', description: 'Update a document', parameters: [{ key: 'documentId', label: 'Document ID', type: 'string', required: true }, { key: 'actions', label: 'Actions', type: 'json', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { documentId: "doc1", title: "My Document" } }],
  },

  contentful: {
    id: 'contentful',
    name: 'Contentful',
    description: 'Manage Contentful content',
    icon: '📦',
    color: '#2478CC',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.contentful/',
    version: '1.0',
    category: 'app',
    credentialType: 'contentfulApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'entry',
        label: 'Entry',
        description: 'Entry operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get an entry', parameters: [{ key: 'spaceId', label: 'Space ID', type: 'string', required: true }, { key: 'environmentId', label: 'Environment ID', type: 'string', required: true }, { key: 'entryId', label: 'Entry ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all entries', parameters: [{ key: 'spaceId', label: 'Space ID', type: 'string', required: true }, { key: 'environmentId', label: 'Environment ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }, { key: 'contentType', label: 'Content Type', type: 'string' }] },
        ],
      },
      {
        value: 'asset',
        label: 'Asset',
        description: 'Asset operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get an asset', parameters: [{ key: 'spaceId', label: 'Space ID', type: 'string', required: true }, { key: 'environmentId', label: 'Environment ID', type: 'string', required: true }, { key: 'assetId', label: 'Asset ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all assets', parameters: [{ key: 'spaceId', label: 'Space ID', type: 'string', required: true }, { key: 'environmentId', label: 'Environment ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
      {
        value: 'space',
        label: 'Space',
        description: 'Space operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a space', parameters: [{ key: 'spaceId', label: 'Space ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { sys: { id: "entry1" }, fields: { title: { "en-US": "Entry Title" } } } }],
  },

  ghost: {
    id: 'ghost',
    name: 'Ghost',
    description: 'Manage Ghost CMS content',
    icon: '👻',
    color: '#15171A',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.ghost/',
    version: '1.0',
    category: 'app',
    credentialType: 'ghostAdminApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'post',
        label: 'Post',
        description: 'Post operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a post', parameters: [{ key: 'title', label: 'Title', type: 'string', required: true }], optionalFields: [{ key: 'html', label: 'HTML Content', type: 'string' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'scheduled', label: 'Scheduled' }] }, { key: 'slug', label: 'Slug', type: 'string' }, { key: 'tags', label: 'Tags', type: 'string' }, { key: 'featured', label: 'Featured', type: 'boolean' }] },
          { value: 'get', label: 'Get', description: 'Get a post', parameters: [{ key: 'postId', label: 'Post ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all posts', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a post', parameters: [{ key: 'postId', label: 'Post ID', type: 'string', required: true }], optionalFields: [{ key: 'title', label: 'Title', type: 'string' }, { key: 'html', label: 'HTML Content', type: 'string' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a post', parameters: [{ key: 'postId', label: 'Post ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'member',
        label: 'Member',
        description: 'Member operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a member', parameters: [{ key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'labels', label: 'Labels', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a member', parameters: [{ key: 'memberId', label: 'Member ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all members', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a member', parameters: [{ key: 'memberId', label: 'Member ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'email', label: 'Email', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a member', parameters: [{ key: 'memberId', label: 'Member ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "post1", title: "Blog Post", slug: "blog-post", status: "published" } }],
  },

  medium: {
    id: 'medium',
    name: 'Medium',
    description: 'Publish articles on Medium',
    icon: '📝',
    color: '#000000',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.medium/',
    version: '1.0',
    category: 'app',
    credentialType: 'mediumApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'post',
        label: 'Post',
        description: 'Post operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a post', parameters: [{ key: 'title', label: 'Title', type: 'string', required: true }, { key: 'contentFormat', label: 'Content Format', type: 'select', required: true, options: [{ value: 'html', label: 'HTML' }, { value: 'markdown', label: 'Markdown' }] }, { key: 'content', label: 'Content', type: 'string', required: true }], optionalFields: [{ key: 'publishStatus', label: 'Publish Status', type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'public', label: 'Public' }, { value: 'unlisted', label: 'Unlisted' }] }, { key: 'tags', label: 'Tags', type: 'string' }, { key: 'canonicalUrl', label: 'Canonical URL', type: 'string' }] },
        ],
      },
      {
        value: 'publication',
        label: 'Publication',
        description: 'Publication operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all publications', parameters: [], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "post1", title: "Article Title", url: "https://medium.com/@user/article" } }],
  },

  basecamp: {
    id: 'basecamp',
    name: 'Basecamp',
    description: 'Manage Basecamp projects and todos',
    icon: '⛺',
    color: '#1D2D35',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.basecamp/',
    version: '1.0',
    category: 'app',
    credentialType: 'basecampOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'message',
        label: 'Message',
        description: 'Message operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a message', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'messageBoardId', label: 'Message Board ID', type: 'string', required: true }, { key: 'subject', label: 'Subject', type: 'string', required: true }, { key: 'content', label: 'Content', type: 'string', required: true }], optionalFields: [{ key: 'status', label: 'Status', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a message', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'messageId', label: 'Message ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all messages', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'messageBoardId', label: 'Message Board ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a message', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'messageId', label: 'Message ID', type: 'string', required: true }], optionalFields: [{ key: 'subject', label: 'Subject', type: 'string' }, { key: 'content', label: 'Content', type: 'string' }] },
        ],
      },
      {
        value: 'todoList',
        label: 'Todo List',
        description: 'Todo list operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a todo list', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'todoSetId', label: 'Todo Set ID', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }] },
          { value: 'getAll', label: 'Get All', description: 'Get all todo lists', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'todoSetId', label: 'Todo Set ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'todo',
        label: 'Todo',
        description: 'Todo operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a todo', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'todoListId', label: 'Todo List ID', type: 'string', required: true }, { key: 'content', label: 'Content', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'dueOn', label: 'Due On', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a todo', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'todoId', label: 'Todo ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all todos', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'todoListId', label: 'Todo List ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a todo', parameters: [{ key: 'projectId', label: 'Project ID', type: 'string', required: true }, { key: 'todoId', label: 'Todo ID', type: 'string', required: true }], optionalFields: [{ key: 'content', label: 'Content', type: 'string' }, { key: 'completed', label: 'Completed', type: 'boolean' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "123", title: "Todo Item", completed: false } }],
  },

  copper: {
    id: 'copper',
    name: 'Copper',
    description: 'Manage Copper CRM data',
    icon: '🔶',
    color: '#F48024',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.copper/',
    version: '1.0',
    category: 'app',
    credentialType: 'copperApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'person',
        label: 'Person',
        description: 'Person operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a person', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'emails', label: 'Emails', type: 'json' }, { key: 'phoneNumbers', label: 'Phone Numbers', type: 'json' }, { key: 'title', label: 'Title', type: 'string' }, { key: 'companyId', label: 'Company ID', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a person', parameters: [{ key: 'personId', label: 'Person ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all persons', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a person', parameters: [{ key: 'personId', label: 'Person ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'title', label: 'Title', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a person', parameters: [{ key: 'personId', label: 'Person ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'company',
        label: 'Company',
        description: 'Company operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a company', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'emailDomain', label: 'Email Domain', type: 'string' }, { key: 'address', label: 'Address', type: 'json' }] },
          { value: 'get', label: 'Get', description: 'Get a company', parameters: [{ key: 'companyId', label: 'Company ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all companies', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a company', parameters: [{ key: 'companyId', label: 'Company ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }] },
          { value: 'delete', label: 'Delete', description: 'Delete a company', parameters: [{ key: 'companyId', label: 'Company ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'opportunity',
        label: 'Opportunity',
        description: 'Opportunity operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an opportunity', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'monetaryValue', label: 'Monetary Value', type: 'number' }, { key: 'status', label: 'Status', type: 'string' }, { key: 'closeDate', label: 'Close Date', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get an opportunity', parameters: [{ key: 'opportunityId', label: 'Opportunity ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all opportunities', parameters: [], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update an opportunity', parameters: [{ key: 'opportunityId', label: 'Opportunity ID', type: 'string', required: true }], optionalFields: [{ key: 'name', label: 'Name', type: 'string' }, { key: 'monetaryValue', label: 'Monetary Value', type: 'number' }] },
          { value: 'delete', label: 'Delete', description: 'Delete an opportunity', parameters: [{ key: 'opportunityId', label: 'Opportunity ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: 123, name: "John Doe", emails: [{ email: "john@example.com" }] } }],
  },

  hunter: {
    id: 'hunter',
    name: 'Hunter',
    description: 'Find and verify email addresses',
    icon: '🎯',
    color: '#FF5C00',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.hunter/',
    version: '1.0',
    category: 'app',
    credentialType: 'hunterApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'email',
        label: 'Email',
        description: 'Email operations',
        operations: [
          { value: 'domainSearch', label: 'Domain Search', description: 'Search emails by domain', parameters: [{ key: 'domain', label: 'Domain', type: 'string', required: true }], optionalFields: [{ key: 'type', label: 'Type', type: 'select', options: [{ value: 'personal', label: 'Personal' }, { value: 'generic', label: 'Generic' }] }, { key: 'department', label: 'Department', type: 'string' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'emailFinder', label: 'Email Finder', description: 'Find email by name', parameters: [{ key: 'domain', label: 'Domain', type: 'string', required: true }], optionalFields: [{ key: 'firstName', label: 'First Name', type: 'string' }, { key: 'lastName', label: 'Last Name', type: 'string' }, { key: 'fullName', label: 'Full Name', type: 'string' }] },
          { value: 'emailVerifier', label: 'Email Verifier', description: 'Verify an email', parameters: [{ key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { data: { domain: "example.com", emails: [{ value: "contact@example.com" }] } } }],
  },

  clearbit: {
    id: 'clearbit',
    name: 'Clearbit',
    description: 'Enrich company and person data',
    icon: '💎',
    color: '#3592F2',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.clearbit/',
    version: '1.0',
    category: 'app',
    credentialType: 'clearbitApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'person',
        label: 'Person',
        description: 'Person enrichment',
        operations: [
          { value: 'enrich', label: 'Enrich', description: 'Enrich a person', parameters: [{ key: 'email', label: 'Email', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'company',
        label: 'Company',
        description: 'Company enrichment',
        operations: [
          { value: 'enrich', label: 'Enrich', description: 'Enrich a company', parameters: [{ key: 'domain', label: 'Domain', type: 'string', required: true }], optionalFields: [] },
          { value: 'autocomplete', label: 'Autocomplete', description: 'Autocomplete company', parameters: [{ key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { person: { name: { fullName: "John Doe" } }, company: { name: "Example Inc" } } }],
  },

  spotify: {
    id: 'spotify',
    name: 'Spotify',
    description: 'Access Spotify music data',
    icon: '🎵',
    color: '#1DB954',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.spotify/',
    version: '1.0',
    category: 'app',
    credentialType: 'spotifyOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'track',
        label: 'Track',
        description: 'Track operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a track', parameters: [{ key: 'trackId', label: 'Track ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAudioFeatures', label: 'Get Audio Features', description: 'Get audio features', parameters: [{ key: 'trackId', label: 'Track ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'album',
        label: 'Album',
        description: 'Album operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get an album', parameters: [{ key: 'albumId', label: 'Album ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getTracks', label: 'Get Tracks', description: 'Get album tracks', parameters: [{ key: 'albumId', label: 'Album ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
      {
        value: 'artist',
        label: 'Artist',
        description: 'Artist operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get an artist', parameters: [{ key: 'artistId', label: 'Artist ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAlbums', label: 'Get Albums', description: 'Get artist albums', parameters: [{ key: 'artistId', label: 'Artist ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'getTopTracks', label: 'Get Top Tracks', description: 'Get top tracks', parameters: [{ key: 'artistId', label: 'Artist ID', type: 'string', required: true }, { key: 'country', label: 'Country', type: 'string', required: true }], optionalFields: [] },
          { value: 'getRelatedArtists', label: 'Get Related Artists', description: 'Get related artists', parameters: [{ key: 'artistId', label: 'Artist ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'playlist',
        label: 'Playlist',
        description: 'Playlist operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a playlist', parameters: [{ key: 'userId', label: 'User ID', type: 'string', required: true }, { key: 'name', label: 'Name', type: 'string', required: true }], optionalFields: [{ key: 'description', label: 'Description', type: 'string' }, { key: 'public', label: 'Public', type: 'boolean' }] },
          { value: 'get', label: 'Get', description: 'Get a playlist', parameters: [{ key: 'playlistId', label: 'Playlist ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getTracks', label: 'Get Tracks', description: 'Get playlist tracks', parameters: [{ key: 'playlistId', label: 'Playlist ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'addTracks', label: 'Add Tracks', description: 'Add tracks to playlist', parameters: [{ key: 'playlistId', label: 'Playlist ID', type: 'string', required: true }, { key: 'trackIds', label: 'Track IDs', type: 'string', required: true }], optionalFields: [{ key: 'position', label: 'Position', type: 'number' }] },
          { value: 'removeTracks', label: 'Remove Tracks', description: 'Remove tracks', parameters: [{ key: 'playlistId', label: 'Playlist ID', type: 'string', required: true }, { key: 'trackIds', label: 'Track IDs', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'search',
        label: 'Search',
        description: 'Search operations',
        operations: [
          { value: 'search', label: 'Search', description: 'Search for items', parameters: [{ key: 'query', label: 'Query', type: 'string', required: true }, { key: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'track', label: 'Track' }, { value: 'album', label: 'Album' }, { value: 'artist', label: 'Artist' }, { value: 'playlist', label: 'Playlist' }] }], optionalFields: [{ key: 'limit', label: 'Limit', type: 'number' }, { key: 'market', label: 'Market', type: 'string' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "track1", name: "Song Name", artists: [{ name: "Artist" }] } }],
  },

  instagram: {
    id: 'instagram',
    name: 'Instagram',
    description: 'Access Instagram Business API',
    icon: '📷',
    color: '#E4405F',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.instagram/',
    version: '1.0',
    category: 'app',
    credentialType: 'instagramOAuth2',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'media',
        label: 'Media',
        description: 'Media operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get a media object', parameters: [{ key: 'mediaId', label: 'Media ID', type: 'string', required: true }], optionalFields: [{ key: 'fields', label: 'Fields', type: 'string' }] },
          { value: 'getAll', label: 'Get All', description: 'Get all media', parameters: [{ key: 'userId', label: 'User ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
      {
        value: 'user',
        label: 'User',
        description: 'User operations',
        operations: [
          { value: 'get', label: 'Get', description: 'Get user info', parameters: [{ key: 'userId', label: 'User ID', type: 'string', required: true }], optionalFields: [{ key: 'fields', label: 'Fields', type: 'string' }] },
        ],
      },
      {
        value: 'comment',
        label: 'Comment',
        description: 'Comment operations',
        operations: [
          { value: 'getAll', label: 'Get All', description: 'Get all comments', parameters: [{ key: 'mediaId', label: 'Media ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { id: "media1", media_type: "IMAGE", timestamp: "2024-01-01T00:00:00+0000" } }],
  },

  elasticsearch: {
    id: 'elasticsearch',
    name: 'Elasticsearch',
    description: 'Search and manage Elasticsearch data',
    icon: '🔍',
    color: '#00BFB3',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.elasticsearch/',
    version: '1.0',
    category: 'app',
    credentialType: 'elasticsearchApi',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'document',
        label: 'Document',
        description: 'Document operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create a document', parameters: [{ key: 'indexId', label: 'Index ID', type: 'string', required: true }, { key: 'body', label: 'Body', type: 'json', required: true }], optionalFields: [{ key: 'documentId', label: 'Document ID', type: 'string' }] },
          { value: 'get', label: 'Get', description: 'Get a document', parameters: [{ key: 'indexId', label: 'Index ID', type: 'string', required: true }, { key: 'documentId', label: 'Document ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all documents', parameters: [{ key: 'indexId', label: 'Index ID', type: 'string', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
          { value: 'update', label: 'Update', description: 'Update a document', parameters: [{ key: 'indexId', label: 'Index ID', type: 'string', required: true }, { key: 'documentId', label: 'Document ID', type: 'string', required: true }, { key: 'body', label: 'Body', type: 'json', required: true }], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete a document', parameters: [{ key: 'indexId', label: 'Index ID', type: 'string', required: true }, { key: 'documentId', label: 'Document ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'index',
        label: 'Index',
        description: 'Index operations',
        operations: [
          { value: 'create', label: 'Create', description: 'Create an index', parameters: [{ key: 'indexId', label: 'Index ID', type: 'string', required: true }], optionalFields: [{ key: 'mappings', label: 'Mappings', type: 'json' }, { key: 'settings', label: 'Settings', type: 'json' }] },
          { value: 'get', label: 'Get', description: 'Get an index', parameters: [{ key: 'indexId', label: 'Index ID', type: 'string', required: true }], optionalFields: [] },
          { value: 'getAll', label: 'Get All', description: 'Get all indices', parameters: [], optionalFields: [] },
          { value: 'delete', label: 'Delete', description: 'Delete an index', parameters: [{ key: 'indexId', label: 'Index ID', type: 'string', required: true }], optionalFields: [] },
        ],
      },
      {
        value: 'search',
        label: 'Search',
        description: 'Search operations',
        operations: [
          { value: 'search', label: 'Search', description: 'Search documents', parameters: [{ key: 'indexId', label: 'Index ID', type: 'string', required: true }, { key: 'query', label: 'Query', type: 'json', required: true }], optionalFields: [{ key: 'returnAll', label: 'Return All', type: 'boolean' }, { key: 'limit', label: 'Limit', type: 'number' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { _index: "index1", _id: "1", _source: { field: "value" } } }],
  },

  redis: {
    id: 'redis',
    name: 'Redis',
    description: 'Interact with Redis key-value store',
    icon: '🔴',
    color: '#DC382D',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.redis/',
    version: '1.0',
    category: 'app',
    credentialType: 'redis',
    credentialRequired: true,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'key',
        label: 'Key',
        description: 'Key operations',
        operations: [
          { value: 'set', label: 'Set', description: 'Set a key value', parameters: [{ key: 'key', label: 'Key', type: 'string', required: true }, { key: 'value', label: 'Value', type: 'string', required: true }], optionalFields: [{ key: 'expiration', label: 'Expiration (seconds)', type: 'number' }] },
          { value: 'get', label: 'Get', description: 'Get a key value', parameters: [{ key: 'key', label: 'Key', type: 'string', required: true }], optionalFields: [{ key: 'keyType', label: 'Key Type', type: 'select', options: [{ value: 'string', label: 'String' }, { value: 'hash', label: 'Hash' }, { value: 'list', label: 'List' }, { value: 'set', label: 'Set' }] }] },
          { value: 'delete', label: 'Delete', description: 'Delete a key', parameters: [{ key: 'key', label: 'Key', type: 'string', required: true }], optionalFields: [] },
          { value: 'keys', label: 'Keys', description: 'Get keys matching pattern', parameters: [{ key: 'keyPattern', label: 'Key Pattern', type: 'string', required: true }], optionalFields: [] },
          { value: 'incr', label: 'Increment', description: 'Increment a key', parameters: [{ key: 'key', label: 'Key', type: 'string', required: true }], optionalFields: [{ key: 'increment', label: 'Increment', type: 'number' }] },
        ],
      },
      {
        value: 'info',
        label: 'Info',
        description: 'Server info',
        operations: [
          { value: 'info', label: 'Info', description: 'Get server info', parameters: [], optionalFields: [] },
        ],
      },
      {
        value: 'pubSub',
        label: 'Pub/Sub',
        description: 'Publish/Subscribe operations',
        operations: [
          { value: 'publish', label: 'Publish', description: 'Publish a message', parameters: [{ key: 'channel', label: 'Channel', type: 'string', required: true }, { key: 'message', label: 'Message', type: 'string', required: true }], optionalFields: [] },
        ],
      },
    ],
    defaultMockData: [{ json: { key: "mykey", value: "myvalue" } }],
  },

  executeCommand: {
    id: 'executeCommand',
    name: 'Execute Command',
    description: 'Execute shell commands on the host system',
    icon: '💻',
    color: '#333333',
    docsUrl: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executecommand/',
    version: '1.0',
    category: 'app',
    credentialRequired: false,
    testable: true,
    testButtonLabel: 'Test step',
    resources: [
      {
        value: 'command',
        label: 'Command',
        description: 'Command execution',
        operations: [
          { value: 'execute', label: 'Execute', description: 'Execute a command', parameters: [{ key: 'command', label: 'Command', type: 'string', required: true }], optionalFields: [{ key: 'cwd', label: 'Working Directory', type: 'string' }, { key: 'executeOnce', label: 'Execute Once', type: 'boolean' }] },
        ],
      },
    ],
    defaultMockData: [{ json: { stdout: "command output", stderr: "", exitCode: 0 } }],
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
// RESOURCE SELECTOR (n8n-style)
// ============================================

interface ResourceSelectorProps {
  resources: NodeResource[];
  selectedResource: string;
  onResourceChange: (resource: string) => void;
}

function ResourceSelector({ resources, selectedResource, onResourceChange }: ResourceSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Resource</Label>
      <Select value={selectedResource} onValueChange={onResourceChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select resource..." />
        </SelectTrigger>
        <SelectContent>
          {resources.map((resource) => (
            <SelectItem key={resource.value} value={resource.value}>
              <div className="flex flex-col">
                <span>{resource.label}</span>
                {resource.description && (
                  <span className="text-xs text-muted-foreground">{resource.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ============================================
// OPERATION SELECTOR (n8n-style)
// ============================================

interface OperationSelectorProps {
  operations: NodeOperation[];
  selectedOperation: string;
  onOperationChange: (operation: string) => void;
}

function OperationSelector({ operations, selectedOperation, onOperationChange }: OperationSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Operation</Label>
      <Select value={selectedOperation} onValueChange={onOperationChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select operation..." />
        </SelectTrigger>
        <SelectContent>
          {operations.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              <div className="flex flex-col">
                <span>{op.label}</span>
                {op.description && (
                  <span className="text-xs text-muted-foreground">{op.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
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
  appNodeConfig: providedAppNodeConfig,
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

  // Auto-detect appNodeConfig for n8n-style Resource/Operation nodes
  const appNodeConfig = useMemo(() => {
    if (providedAppNodeConfig) return providedAppNodeConfig;
    if (!node) return null;
    
    // Try to find app config by appId
    const configId = node.appId || '';
    return appNodeConfigs[configId] || appNodeConfigs[configId.toLowerCase()] || null;
  }, [node, providedAppNodeConfig]);

  // Determine if this is an app node (with Resource/Operation) or a trigger node
  const isAppNode = !!appNodeConfig;

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
  const [mockData, setMockData] = useState<MockDataItem[]>(nodeConfig?.defaultMockData || appNodeConfig?.defaultMockData || []);
  const [isEditingMockData, setIsEditingMockData] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; data?: any; error?: string } | null>(null);

  // Resource/Operation state for app nodes
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedOperation, setSelectedOperation] = useState<string>('');

  // Get current resource and operation objects
  const currentResource = useMemo(() => {
    if (!appNodeConfig || !selectedResource) return null;
    return appNodeConfig.resources.find(r => r.value === selectedResource) || null;
  }, [appNodeConfig, selectedResource]);

  const currentOperation = useMemo(() => {
    if (!currentResource || !selectedOperation) return null;
    return currentResource.operations.find(o => o.value === selectedOperation) || null;
  }, [currentResource, selectedOperation]);

  // Reset state when node changes
  React.useEffect(() => {
    if (node) {
      setConfig(node.config || {});
      setMockData(nodeConfig?.defaultMockData || appNodeConfig?.defaultMockData || []);
      setAddedOptionalFields([]);
      setTestResult(null);
      
      // Reset Resource/Operation for app nodes
      if (appNodeConfig && appNodeConfig.resources.length > 0) {
        const firstResource = appNodeConfig.resources[0];
        setSelectedResource(node.config?.resource || firstResource.value);
        setSelectedOperation(node.config?.operation || (firstResource.operations[0]?.value || ''));
      }
    }
  }, [node?.id, nodeConfig, appNodeConfig]);

  // Reset operation when resource changes
  React.useEffect(() => {
    if (currentResource && currentResource.operations.length > 0) {
      // Only reset if current operation is not valid for this resource
      const validOp = currentResource.operations.find(o => o.value === selectedOperation);
      if (!validOp) {
        setSelectedOperation(currentResource.operations[0].value);
      }
    }
  }, [selectedResource, currentResource]);

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
      // Include resource/operation for app nodes
      const finalConfig = isAppNode 
        ? { ...config, resource: selectedResource, operation: selectedOperation }
        : config;
      onSave(node.id, finalConfig, settings);
      onClose();
    }
  }, [node, config, settings, isAppNode, selectedResource, selectedOperation, onSave, onClose]);

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

  // Use app node config if available, otherwise fall back to trigger config
  const displayName = isAppNode ? appNodeConfig!.name : (nodeConfig?.name || node.appName || node.name || 'Configure Node');
  const displayIcon = isAppNode ? appNodeConfig!.icon : (nodeConfig?.icon || node.appIcon || '⚙️');
  const displayVersion = isAppNode ? appNodeConfig!.version : nodeConfig?.version;
  const displayDocsUrl = isAppNode ? appNodeConfig!.docsUrl : nodeConfig?.docsUrl;
  const displayTestable = isAppNode ? appNodeConfig!.testable : nodeConfig?.testable;
  const displayTestButtonLabel = isAppNode ? appNodeConfig!.testButtonLabel : nodeConfig?.testButtonLabel;

  // Fallback config when no specific nodeConfig is found (for triggers)
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
            <span className="text-2xl">{displayIcon}</span>
            <div>
              <h2 className="font-semibold">{displayName}</h2>
              {displayVersion && (
                <span className="text-xs text-muted-foreground">
                  Version {displayVersion}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {displayDocsUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={displayDocsUrl} target="_blank" rel="noopener noreferrer">
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
              {displayTestable && (
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
                    {displayTestButtonLabel || 'Test'}
                  </Button>
                </div>
              )}
            </div>

            {/* Tab Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {activeTab === 'parameters' && (
                  <>
                    {/* App Node: Resource/Operation Selectors */}
                    {isAppNode && appNodeConfig && (
                      <>
                        {/* Credential selector (if required) */}
                        {appNodeConfig.credentialRequired && (
                          <div className="space-y-2 pb-4 border-b">
                            <Label className="text-sm font-medium">
                              Credential to connect with <span className="text-destructive">*</span>
                            </Label>
                            <Select
                              value={config.credential || ''}
                              onValueChange={(value) => setConfig(prev => ({ ...prev, credential: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select credential..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="create_new">
                                  <span className="text-primary">+ Create New Credential</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Resource Selector */}
                        <ResourceSelector
                          resources={appNodeConfig.resources}
                          selectedResource={selectedResource}
                          onResourceChange={setSelectedResource}
                        />

                        {/* Operation Selector */}
                        {currentResource && (
                          <OperationSelector
                            operations={currentResource.operations}
                            selectedOperation={selectedOperation}
                            onOperationChange={setSelectedOperation}
                          />
                        )}

                        {/* Operation Parameters */}
                        {currentOperation && currentOperation.parameters.length > 0 && (
                          <div className="space-y-4 pt-4 border-t">
                            {currentOperation.parameters.map((param) => (
                              <ParameterField
                                key={param.key}
                                param={param}
                                value={config[param.key]}
                                onChange={(value) => setConfig(prev => ({ ...prev, [param.key]: value }))}
                              />
                            ))}
                          </div>
                        )}

                        {/* Optional Fields for Operation */}
                        {currentOperation && currentOperation.optionalFields && currentOperation.optionalFields.length > 0 && (
                          <div className="space-y-4 pt-4">
                            <Separator />
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Options</p>
                            
                            {/* Show added optional fields */}
                            {addedOptionalFields.map(fieldKey => {
                              const field = currentOperation.optionalFields?.find(f => f.key === fieldKey);
                              if (!field) return null;
                              return (
                                <ParameterField
                                  key={field.key}
                                  param={field}
                                  value={config[field.key]}
                                  onChange={(value) => setConfig(prev => ({ ...prev, [field.key]: value }))}
                                  onRemove={() => handleRemoveOptionalField(field.key)}
                                  isOptional
                                />
                              );
                            })}
                            
                            {/* Add Field dropdown */}
                            <AddFieldDropdown
                              fields={currentOperation.optionalFields || []}
                              addedFields={addedOptionalFields}
                              onAddField={handleAddOptionalField}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Trigger Node: Regular Parameters */}
                    {!isAppNode && (
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
                      </>
                    )}
                  </>
                )}

                {/* Keep the existing settings tab as-is */}
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
