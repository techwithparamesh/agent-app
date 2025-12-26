import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Search,
  Star,
  ChevronRight,
  MessageCircle,
  Mail,
  Globe,
  Users,
  Zap,
  Database,
  ShoppingCart,
  Calendar,
  Webhook,
  Sparkles,
  Target,
  HeadphonesIcon,
  Phone,
  Video,
  GripVertical,
  Clock,
  Layers,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Category icons mapping
const categoryIcons: Record<string, React.ElementType> = {
  communication: MessageCircle,
  email: Mail,
  google: Globe,
  crm: Users,
  automation: Zap,
  storage: Database,
  ecommerce: ShoppingCart,
  productivity: Calendar,
  developer: Webhook,
  ai: Sparkles,
  marketing: Target,
  support: HeadphonesIcon,
  voice: Phone,
  video: Video,
  logic: Layers,
  triggers: Zap,
};

// Category colors
const categoryColors: Record<string, string> = {
  communication: "bg-blue-500",
  email: "bg-red-500",
  google: "bg-green-500",
  crm: "bg-purple-500",
  automation: "bg-orange-500",
  storage: "bg-cyan-500",
  ecommerce: "bg-pink-500",
  productivity: "bg-indigo-500",
  developer: "bg-gray-500",
  ai: "bg-violet-500",
  marketing: "bg-rose-500",
  support: "bg-teal-500",
  voice: "bg-amber-500",
  video: "bg-emerald-500",
  logic: "bg-yellow-500",
  triggers: "bg-orange-500",
};

// App types - determines if app can be trigger, action, or both
export type AppNodeType = 'trigger' | 'action' | 'both';

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  popular?: boolean;
  description: string;
  nodeTypes: AppNodeType; // What kind of nodes this app supports
  triggers?: { id: string; name: string; description: string }[];
  actions?: { id: string; name: string; description: string }[];
}

// App catalog - structured for the workspace with proper node types
export const appCatalog: AppDefinition[] = [
  // Communication - most have both triggers and actions
  { 
    id: 'whatsapp', name: 'WhatsApp Business', icon: '💬', category: 'communication', color: '#25D366', popular: true, 
    description: 'WhatsApp Business API',
    nodeTypes: 'both',
    triggers: [
      { id: 'new_message', name: 'New Message', description: 'When a new message is received' },
      { id: 'message_status', name: 'Message Status', description: 'When message status changes' },
    ],
    actions: [
      { id: 'send_message', name: 'Send Message', description: 'Send a text message' },
      { id: 'send_template', name: 'Send Template', description: 'Send a template message' },
      { id: 'send_media', name: 'Send Media', description: 'Send image, video, or document' },
    ]
  },
  { 
    id: 'telegram', name: 'Telegram', icon: '✈️', category: 'communication', color: '#0088cc', popular: true, 
    description: 'Telegram bot integration',
    nodeTypes: 'both',
    triggers: [
      { id: 'new_message', name: 'New Message', description: 'When bot receives a message' },
      { id: 'callback_query', name: 'Callback Query', description: 'When button is clicked' },
    ],
    actions: [
      { id: 'send_message', name: 'Send Message', description: 'Send a message' },
      { id: 'send_photo', name: 'Send Photo', description: 'Send a photo' },
      { id: 'edit_message', name: 'Edit Message', description: 'Edit an existing message' },
    ]
  },
  { 
    id: 'slack', name: 'Slack', icon: '💼', category: 'communication', color: '#4A154B', popular: true, 
    description: 'Slack workspace integration',
    nodeTypes: 'both',
    triggers: [
      { id: 'new_message', name: 'New Message', description: 'When a message is posted' },
      { id: 'reaction_added', name: 'Reaction Added', description: 'When a reaction is added' },
      { id: 'channel_created', name: 'Channel Created', description: 'When a new channel is created' },
    ],
    actions: [
      { id: 'send_message', name: 'Send Message', description: 'Post a message to a channel' },
      { id: 'update_message', name: 'Update Message', description: 'Update an existing message' },
      { id: 'add_reaction', name: 'Add Reaction', description: 'Add emoji reaction' },
    ]
  },
  { id: 'discord', name: 'Discord', icon: '🎮', category: 'communication', color: '#5865F2', description: 'Discord webhooks & bots', nodeTypes: 'both',
    triggers: [{ id: 'new_message', name: 'New Message', description: 'When a message is sent' }],
    actions: [{ id: 'send_message', name: 'Send Message', description: 'Send via webhook' }]
  },
  { id: 'microsoft_teams', name: 'Microsoft Teams', icon: '👥', category: 'communication', color: '#6264A7', description: 'Teams messaging', nodeTypes: 'action',
    actions: [{ id: 'send_message', name: 'Send Message', description: 'Post to channel' }]
  },
  { id: 'twilio_sms', name: 'Twilio SMS', icon: '📱', category: 'communication', color: '#F22F46', description: 'SMS via Twilio', nodeTypes: 'both',
    triggers: [{ id: 'sms_received', name: 'SMS Received', description: 'When SMS is received' }],
    actions: [{ id: 'send_sms', name: 'Send SMS', description: 'Send an SMS message' }]
  },
  { id: 'slack_bot', name: 'Slack Bot', icon: '🤖', category: 'communication', color: '#4A154B', description: 'Slack bot token integration', nodeTypes: 'both',
    triggers: [{ id: 'reaction_added', name: 'Reaction Added', description: 'When a reaction is added' }],
    actions: [{ id: 'post_message', name: 'Post Message', description: 'Post a message to a channel' }]
  },
  { id: 'discord_bot', name: 'Discord Bot', icon: '🎮', category: 'communication', color: '#5865F2', description: 'Discord bot token integration', nodeTypes: 'both',
    triggers: [{ id: 'interaction', name: 'Interaction', description: 'When an interaction is received' }],
    actions: [{ id: 'send_message', name: 'Send Message', description: 'Send a message to a channel' }]
  },
  { id: 'sms_twilio', name: 'Twilio SMS (Alt ID)', icon: '📱', category: 'communication', color: '#F22F46', description: 'Twilio SMS (catalog alias)', nodeTypes: 'both',
    triggers: [{ id: 'sms_received', name: 'SMS Received', description: 'When SMS is received' }],
    actions: [{ id: 'send_sms', name: 'Send SMS', description: 'Send an SMS message' }]
  },
  
  // Email - triggers for receiving, actions for sending
  { 
    id: 'gmail', name: 'Gmail', icon: '📧', category: 'email', color: '#EA4335', popular: true, 
    description: 'Gmail integration',
    nodeTypes: 'both',
    triggers: [
      { id: 'new_email', name: 'New Email', description: 'When a new email is received' },
      { id: 'new_labeled_email', name: 'New Labeled Email', description: 'When email with label is received' },
    ],
    actions: [
      { id: 'send_email', name: 'Send Email', description: 'Send an email' },
      { id: 'create_draft', name: 'Create Draft', description: 'Create email draft' },
      { id: 'add_label', name: 'Add Label', description: 'Add label to email' },
    ]
  },
  { id: 'outlook', name: 'Outlook', icon: '📨', category: 'email', color: '#0078D4', description: 'Microsoft Outlook email', nodeTypes: 'both',
    triggers: [{ id: 'new_email', name: 'New Email', description: 'When email is received' }],
    actions: [{ id: 'send_email', name: 'Send Email', description: 'Send an email' }]
  },
  { id: 'sendgrid', name: 'SendGrid', icon: '📤', category: 'email', color: '#1A82E2', description: 'Transactional emails', nodeTypes: 'action',
    actions: [{ id: 'send_email', name: 'Send Email', description: 'Send via SendGrid' }]
  },
  { id: 'mailgun', name: 'Mailgun', icon: '📬', category: 'email', color: '#DC2626', description: 'Send emails via Mailgun', nodeTypes: 'action',
    actions: [{ id: 'send_email', name: 'Send Email', description: 'Send via Mailgun' }]
  },
  { id: 'mailchimp', name: 'Mailchimp', icon: '🐵', category: 'email', color: '#FFE01B', description: 'Email marketing', nodeTypes: 'both',
    triggers: [{ id: 'subscriber_added', name: 'Subscriber Added', description: 'When subscriber joins' }],
    actions: [{ id: 'add_subscriber', name: 'Add Subscriber', description: 'Add to mailing list' }]
  },
  { id: 'smtp', name: 'SMTP', icon: '✉️', category: 'email', color: '#6B7280', description: 'Custom SMTP server', nodeTypes: 'action',
    actions: [{ id: 'send_email', name: 'Send Email', description: 'Send via SMTP' }]
  },
  
  // Google Services
  { 
    id: 'google_sheets', name: 'Google Sheets', icon: '📊', category: 'google', color: '#34A853', popular: true, 
    description: 'Spreadsheet automation',
    nodeTypes: 'both',
    triggers: [
      { id: 'new_row', name: 'New Row', description: 'When a new row is added' },
      { id: 'row_updated', name: 'Row Updated', description: 'When a row is updated' },
    ],
    actions: [
      { id: 'add_row', name: 'Add Row', description: 'Add a new row' },
      { id: 'update_row', name: 'Update Row', description: 'Update existing row' },
      { id: 'get_rows', name: 'Get Rows', description: 'Read rows from sheet' },
    ]
  },
  { id: 'google_drive', name: 'Google Drive', icon: '📁', category: 'google', color: '#4285F4', popular: true, description: 'File storage', nodeTypes: 'both',
    triggers: [{ id: 'new_file', name: 'New File', description: 'When file is uploaded' }],
    actions: [{ id: 'upload_file', name: 'Upload File', description: 'Upload a file' }, { id: 'create_folder', name: 'Create Folder', description: 'Create a folder' }]
  },
  { id: 'google_calendar', name: 'Google Calendar', icon: '📅', category: 'google', color: '#4285F4', description: 'Calendar events', nodeTypes: 'both',
    triggers: [{ id: 'event_start', name: 'Event Start', description: 'When event starts' }, { id: 'new_event', name: 'New Event', description: 'When event is created' }],
    actions: [{ id: 'create_event', name: 'Create Event', description: 'Create calendar event' }]
  },
  { id: 'google_docs', name: 'Google Docs', icon: '📝', category: 'google', color: '#4285F4', description: 'Document creation', nodeTypes: 'action',
    actions: [{ id: 'create_doc', name: 'Create Document', description: 'Create a new document' }]
  },
  { id: 'google_forms', name: 'Google Forms', icon: '📋', category: 'google', color: '#673AB7', description: 'Form responses', nodeTypes: 'trigger',
    triggers: [{ id: 'form_submitted', name: 'Form Submitted', description: 'When form is submitted' }]
  },
  
  // CRM - mostly actions with some triggers
  { 
    id: 'hubspot', name: 'HubSpot', icon: '🧲', category: 'crm', color: '#FF7A59', popular: true, 
    description: 'CRM & marketing',
    nodeTypes: 'both',
    triggers: [
      { id: 'new_contact', name: 'New Contact', description: 'When contact is created' },
      { id: 'deal_stage_changed', name: 'Deal Stage Changed', description: 'When deal stage changes' },
    ],
    actions: [
      { id: 'create_contact', name: 'Create Contact', description: 'Create a contact' },
      { id: 'update_contact', name: 'Update Contact', description: 'Update contact' },
      { id: 'create_deal', name: 'Create Deal', description: 'Create a deal' },
    ]
  },
  { id: 'hubspot_oauth', name: 'HubSpot (OAuth)', icon: '🧡', category: 'crm', color: '#FF7A59', description: 'HubSpot via OAuth', nodeTypes: 'both',
    triggers: [{ id: 'new_contact', name: 'New Contact', description: 'When contact is created' }],
    actions: [{ id: 'create_contact', name: 'Create Contact', description: 'Create a contact' }]
  },
  { id: 'hubspot_marketing', name: 'HubSpot Marketing', icon: '📣', category: 'crm', color: '#FF7A59', description: 'HubSpot marketing tools', nodeTypes: 'action',
    actions: [{ id: 'add_to_list', name: 'Add To List', description: 'Add a contact to a list' }]
  },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', category: 'crm', color: '#00A1E0', description: 'Enterprise CRM', nodeTypes: 'both',
    triggers: [{ id: 'new_lead', name: 'New Lead', description: 'When lead is created' }],
    actions: [{ id: 'create_lead', name: 'Create Lead', description: 'Create a lead' }, { id: 'update_record', name: 'Update Record', description: 'Update any record' }]
  },
  { id: 'pipedrive', name: 'Pipedrive', icon: '🔧', category: 'crm', color: '#1E825F', description: 'Sales pipeline', nodeTypes: 'both',
    triggers: [{ id: 'deal_updated', name: 'Deal Updated', description: 'When deal is updated' }],
    actions: [{ id: 'create_deal', name: 'Create Deal', description: 'Create a deal' }]
  },
  { id: 'zoho_crm', name: 'Zoho CRM', icon: '📈', category: 'crm', color: '#DC2626', description: 'Zoho CRM suite', nodeTypes: 'action',
    actions: [{ id: 'create_record', name: 'Create Record', description: 'Create a record' }]
  },
  { id: 'freshsales', name: 'Freshsales', icon: '🌱', category: 'crm', color: '#13B5EA', description: 'Freshworks CRM', nodeTypes: 'action',
    actions: [{ id: 'create_contact', name: 'Create Contact', description: 'Create contact' }]
  },
  
  // Core Triggers/Automation - these are primary trigger nodes
  { 
    id: 'webhook', name: 'Webhook', icon: '🔗', category: 'developer', color: '#6B7280', popular: true, 
    description: 'Receive HTTP requests',
    nodeTypes: 'trigger',
    triggers: [
      { id: 'webhook', name: 'Webhook', description: 'When webhook is called' },
    ]
  },
  { 
    id: 'schedule', name: 'Schedule', icon: '⏰', category: 'developer', color: '#8B5CF6', popular: true, 
    description: 'Time-based triggers',
    nodeTypes: 'trigger',
    triggers: [
      { id: 'cron', name: 'Cron', description: 'Run on schedule' },
      { id: 'interval', name: 'Interval', description: 'Run at intervals' },
    ]
  },
  { 
    id: 'manual', name: 'Manual Trigger', icon: '▶️', category: 'developer', color: '#10B981', 
    description: 'Start manually',
    nodeTypes: 'trigger',
    triggers: [
      { id: 'manual', name: 'Manual', description: 'Run manually' },
    ]
  },
  
  // Automation platforms (mostly actions to trigger external flows)
  { id: 'zapier', name: 'Zapier', icon: '⚡', category: 'automation', color: '#FF4A00', popular: true, description: 'Connect 5000+ apps', nodeTypes: 'action',
    actions: [{ id: 'trigger_zap', name: 'Trigger Zap', description: 'Trigger a Zapier workflow' }]
  },
  { id: 'ifttt', name: 'IFTTT', icon: '🤖', category: 'automation', color: '#FF4A00', description: 'Applet webhooks', nodeTypes: 'action',
    actions: [{ id: 'trigger_event', name: 'Trigger Event', description: 'Trigger an IFTTT Webhooks event' }]
  },
  { id: 'make', name: 'Make', icon: '🔄', category: 'automation', color: '#6F2DA8', popular: true, description: 'Visual automation', nodeTypes: 'action',
    actions: [{ id: 'trigger_scenario', name: 'Trigger Scenario', description: 'Trigger a Make scenario' }]
  },
  { id: 'n8n', name: 'n8n', icon: '🔗', category: 'automation', color: '#EA4B71', description: 'Open-source automation', nodeTypes: 'action',
    actions: [{ id: 'trigger_workflow', name: 'Trigger Workflow', description: 'Trigger n8n workflow' }]
  },
  { id: 'power_automate', name: 'Power Automate', icon: '⚙️', category: 'automation', color: '#0066FF', description: 'Microsoft flows', nodeTypes: 'action',
    actions: [{ id: 'trigger_flow', name: 'Trigger Flow', description: 'Trigger a flow' }]
  },
  
  // Storage - mostly actions
  { 
    id: 'airtable', name: 'Airtable', icon: '📑', category: 'storage', color: '#FCBF49', popular: true, 
    description: 'Spreadsheet database',
    nodeTypes: 'both',
    triggers: [{ id: 'new_record', name: 'New Record', description: 'When record is created' }],
    actions: [
      { id: 'create_record', name: 'Create Record', description: 'Create a record' },
      { id: 'update_record', name: 'Update Record', description: 'Update a record' },
      { id: 'search_records', name: 'Search Records', description: 'Search for records' },
    ]
  },
  { id: 'notion', name: 'Notion', icon: '📓', category: 'storage', color: '#000000', popular: true, description: 'All-in-one workspace', nodeTypes: 'both',
    triggers: [{ id: 'new_page', name: 'New Page', description: 'When page is created' }],
    actions: [{ id: 'create_page', name: 'Create Page', description: 'Create a page' }, { id: 'update_page', name: 'Update Page', description: 'Update page' }]
  },
  { id: 'firebase', name: 'Firebase', icon: '🔥', category: 'storage', color: '#FFCA28', description: 'Google Firebase', nodeTypes: 'action',
    actions: [{ id: 'add_document', name: 'Add Document', description: 'Add to Firestore' }]
  },
  { id: 'supabase', name: 'Supabase', icon: '⚡', category: 'storage', color: '#3ECF8E', description: 'Open-source Firebase', nodeTypes: 'both',
    triggers: [{ id: 'new_row', name: 'New Row', description: 'When row is inserted' }],
    actions: [{ id: 'insert_row', name: 'Insert Row', description: 'Insert a row' }]
  },
  { id: 'postgresql', name: 'PostgreSQL', icon: '🐘', category: 'storage', color: '#10B981', description: 'Postgres database', nodeTypes: 'action',
    actions: [{ id: 'query', name: 'Query', description: 'Run a SQL query' }]
  },
  { id: 'mysql', name: 'MySQL', icon: '🐬', category: 'storage', color: '#10B981', description: 'MySQL database', nodeTypes: 'action',
    actions: [{ id: 'query', name: 'Query', description: 'Run a SQL query' }]
  },
  { id: 'redis', name: 'Redis', icon: '🧱', category: 'storage', color: '#DC2626', description: 'Key-value store', nodeTypes: 'action',
    actions: [{ id: 'set', name: 'Set Key', description: 'Set a key value' }]
  },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃', category: 'storage', color: '#47A248', description: 'NoSQL database', nodeTypes: 'action',
    actions: [{ id: 'insert_document', name: 'Insert Document', description: 'Insert document' }, { id: 'find_documents', name: 'Find Documents', description: 'Query documents' }]
  },
  { id: 'dynamodb', name: 'DynamoDB', icon: '🗄️', category: 'storage', color: '#8B5CF6', description: 'AWS NoSQL DB', nodeTypes: 'action',
    actions: [{ id: 'put_item', name: 'Put Item', description: 'Insert or replace an item' }]
  },
  { id: 'elasticsearch', name: 'Elasticsearch', icon: '🔎', category: 'storage', color: '#6B7280', description: 'Search & indexing', nodeTypes: 'action',
    actions: [{ id: 'search', name: 'Search', description: 'Search an index' }]
  },
  { id: 'bigquery', name: 'BigQuery', icon: '🔷', category: 'storage', color: '#4285F4', description: 'Run SQL queries on BigQuery', nodeTypes: 'action',
    actions: [{ id: 'query', name: 'Run Query', description: 'Execute a SQL query' }]
  },
  { id: 'cosmosdb', name: 'Cosmos DB', icon: '🪐', category: 'storage', color: '#0078D4', description: 'Azure Cosmos DB operations', nodeTypes: 'action',
    actions: [{ id: 'query', name: 'Query', description: 'Query a container' }]
  },
  { id: 'aws_s3', name: 'AWS S3', icon: '☁️', category: 'storage', color: '#FF9900', description: 'Cloud storage', nodeTypes: 'action',
    actions: [{ id: 'upload_file', name: 'Upload File', description: 'Upload to S3' }]
  },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', category: 'storage', color: '#0061FF', description: 'File sync', nodeTypes: 'action',
    actions: [{ id: 'upload_file', name: 'Upload File', description: 'Upload file' }]
  },
  
  // E-commerce - triggers for events, actions for updates
  { 
    id: 'stripe', name: 'Stripe', icon: '💳', category: 'ecommerce', color: '#635BFF', popular: true, 
    description: 'Payment processing',
    nodeTypes: 'both',
    triggers: [
      { id: 'payment_received', name: 'Payment Received', description: 'When payment succeeds' },
      { id: 'subscription_created', name: 'Subscription Created', description: 'When subscription starts' },
    ],
    actions: [
      { id: 'create_charge', name: 'Create Charge', description: 'Charge a customer' },
      { id: 'create_customer', name: 'Create Customer', description: 'Create customer' },
    ]
  },
  { id: 'razorpay', name: 'Razorpay', icon: '💰', category: 'ecommerce', color: '#0066FF', description: 'India payments', nodeTypes: 'both',
    triggers: [{ id: 'payment_captured', name: 'Payment Captured', description: 'When payment captured' }],
    actions: [{ id: 'create_order', name: 'Create Order', description: 'Create payment order' }]
  },
  { id: 'shopify', name: 'Shopify', icon: '🛒', category: 'ecommerce', color: '#96BF48', description: 'E-commerce platform', nodeTypes: 'both',
    triggers: [{ id: 'new_order', name: 'New Order', description: 'When order is placed' }],
    actions: [{ id: 'create_product', name: 'Create Product', description: 'Create product' }]
  },
  { id: 'woocommerce', name: 'WooCommerce', icon: '🛍️', category: 'ecommerce', color: '#96588A', description: 'WordPress commerce', nodeTypes: 'both',
    triggers: [{ id: 'new_order', name: 'New Order', description: 'When order is placed' }],
    actions: [{ id: 'update_order', name: 'Update Order', description: 'Update order status' }]
  },
  { id: 'paypal', name: 'PayPal', icon: '🅿️', category: 'ecommerce', color: '#003087', description: 'PayPal payments', nodeTypes: 'both',
    triggers: [{ id: 'payment_received', name: 'Payment Received', description: 'When payment received' }],
    actions: [{ id: 'send_money', name: 'Send Money', description: 'Send payment' }]
  },
  { id: 'square', name: 'Square', icon: '⬛', category: 'ecommerce', color: '#111827', description: 'Payments and orders', nodeTypes: 'both',
    triggers: [{ id: 'payment_received', name: 'Payment Received', description: 'When payment is received' }],
    actions: [{ id: 'create_payment', name: 'Create Payment', description: 'Create a payment' }]
  },
  
  // Productivity - mostly both
  { id: 'trello', name: 'Trello', icon: '📋', category: 'productivity', color: '#0079BF', description: 'Kanban boards', nodeTypes: 'both',
    triggers: [{ id: 'card_created', name: 'Card Created', description: 'When card is created' }],
    actions: [{ id: 'create_card', name: 'Create Card', description: 'Create a card' }]
  },
  { id: 'asana', name: 'Asana', icon: '✅', category: 'productivity', color: '#F06A6A', description: 'Project management', nodeTypes: 'both',
    triggers: [{ id: 'task_created', name: 'Task Created', description: 'When task is created' }],
    actions: [{ id: 'create_task', name: 'Create Task', description: 'Create a task' }]
  },
  { id: 'jira', name: 'Jira', icon: '🎫', category: 'productivity', color: '#0052CC', description: 'Issue tracking', nodeTypes: 'both',
    triggers: [{ id: 'issue_created', name: 'Issue Created', description: 'When issue is created' }],
    actions: [{ id: 'create_issue', name: 'Create Issue', description: 'Create an issue' }]
  },
  { id: 'monday', name: 'Monday.com', icon: '📊', category: 'productivity', color: '#6C63FF', description: 'Work OS', nodeTypes: 'both',
    triggers: [{ id: 'item_created', name: 'Item Created', description: 'When item is created' }],
    actions: [{ id: 'create_item', name: 'Create Item', description: 'Create an item' }]
  },
  { id: 'clickup', name: 'ClickUp', icon: '🎯', category: 'productivity', color: '#7B68EE', description: 'Productivity platform', nodeTypes: 'both',
    triggers: [{ id: 'task_created', name: 'Task Created', description: 'When task is created' }],
    actions: [{ id: 'create_task', name: 'Create Task', description: 'Create a task' }]
  },
  { id: 'linear', name: 'Linear', icon: '📐', category: 'productivity', color: '#5E6AD2', description: 'Issue tracking', nodeTypes: 'action',
    actions: [{ id: 'create_issue', name: 'Create Issue', description: 'Create an issue' }]
  },
  { id: 'calendly', name: 'Calendly', icon: '📆', category: 'productivity', color: '#006BFF', description: 'Scheduling', nodeTypes: 'trigger',
    triggers: [{ id: 'event_scheduled', name: 'Event Scheduled', description: 'When meeting is scheduled' }]
  },
  
  // Developer Tools - webhook is trigger, rest are actions
  { id: 'rest_api', name: 'HTTP Request', icon: '🌐', category: 'developer', color: '#10B981', popular: true, description: 'Custom API calls', nodeTypes: 'action',
    actions: [
      { id: 'http_request', name: 'HTTP Request', description: 'Make HTTP request' },
    ]
  },
  { id: 'custom_api', name: 'Custom API', icon: '🧰', category: 'developer', color: '#10B981', description: 'Call any REST API', nodeTypes: 'action',
    actions: [{ id: 'request', name: 'Send Request', description: 'Send a request' }]
  },
  { id: 'custom_integration', name: 'Custom Integration', icon: '✨', category: 'developer', color: '#8B5CF6', description: 'Define your own integration', nodeTypes: 'action',
    actions: [{ id: 'define', name: 'Define Integration', description: 'Define a custom integration' }]
  },
  { id: 'webhook_outgoing', name: 'Outgoing Webhook', icon: '📤', category: 'developer', color: '#6366F1', description: 'Send HTTP requests to external systems', nodeTypes: 'action',
    actions: [{ id: 'send', name: 'Send Webhook', description: 'Send an HTTP request' }]
  },
  { id: 'graphql', name: 'GraphQL', icon: '◼️', category: 'developer', color: '#E535AB', description: 'GraphQL queries', nodeTypes: 'action',
    actions: [{ id: 'query', name: 'Execute Query', description: 'Execute GraphQL query' }]
  },
  { id: 'github', name: 'GitHub', icon: '🐙', category: 'developer', color: '#181717', description: 'Version control', nodeTypes: 'both',
    triggers: [{ id: 'push', name: 'Push', description: 'When code is pushed' }, { id: 'pull_request', name: 'Pull Request', description: 'When PR is opened' }],
    actions: [{ id: 'create_issue', name: 'Create Issue', description: 'Create an issue' }]
  },
  { id: 'gitlab', name: 'GitLab', icon: '🦊', category: 'developer', color: '#FC6D26', description: 'DevOps platform', nodeTypes: 'both',
    triggers: [{ id: 'push', name: 'Push', description: 'When code is pushed' }],
    actions: [{ id: 'create_issue', name: 'Create Issue', description: 'Create an issue' }]
  },
  { id: 'bitbucket', name: 'Bitbucket', icon: '🧩', category: 'developer', color: '#0052CC', description: 'Git hosting', nodeTypes: 'both',
    triggers: [{ id: 'push', name: 'Push', description: 'When code is pushed' }],
    actions: [{ id: 'create_issue', name: 'Create Issue', description: 'Create an issue' }]
  },
  
  // AI & ML - these are ACTION only (they don't trigger, they process)
  { 
    id: 'openai', name: 'OpenAI', icon: '🤖', category: 'ai', color: '#412991', popular: true, 
    description: 'GPT & DALL-E models',
    nodeTypes: 'action',
    actions: [
      { id: 'chat_completion', name: 'Chat Completion', description: 'Generate chat response' },
      { id: 'text_completion', name: 'Text Completion', description: 'Generate text' },
      { id: 'create_image', name: 'Create Image', description: 'Generate image with DALL-E' },
      { id: 'transcribe', name: 'Transcribe Audio', description: 'Transcribe with Whisper' },
    ]
  },
  { id: 'azure_openai', name: 'Azure OpenAI', icon: '🧩', category: 'ai', color: '#0078D4', description: 'Azure-hosted OpenAI models', nodeTypes: 'action',
    actions: [{ id: 'chat_completion', name: 'Chat Completion', description: 'Generate chat response' }]
  },
  { 
    id: 'anthropic', name: 'Claude', icon: '🧠', category: 'ai', color: '#C96442', popular: true, 
    description: 'Anthropic Claude AI',
    nodeTypes: 'action',
    actions: [
      { id: 'message', name: 'Send Message', description: 'Generate response with Claude' },
    ]
  },
  { id: 'google_ai', name: 'Gemini', icon: '✨', category: 'ai', color: '#4285F4', description: 'Google AI', nodeTypes: 'action',
    actions: [{ id: 'generate_content', name: 'Generate Content', description: 'Generate with Gemini' }]
  },
  { id: 'elevenlabs', name: 'ElevenLabs', icon: '🎙️', category: 'ai', color: '#000000', description: 'Voice AI', nodeTypes: 'action',
    actions: [{ id: 'text_to_speech', name: 'Text to Speech', description: 'Convert text to speech' }]
  },
  { id: 'replicate', name: 'Replicate', icon: '🔄', category: 'ai', color: '#000000', description: 'ML models', nodeTypes: 'action',
    actions: [{ id: 'run_model', name: 'Run Model', description: 'Run a model' }]
  },
  { id: 'huggingface', name: 'Hugging Face', icon: '🤗', category: 'ai', color: '#FFD21E', description: 'ML hub', nodeTypes: 'action',
    actions: [{ id: 'inference', name: 'Inference', description: 'Run inference' }]
  },
  
  // Marketing - mostly triggers for events
  { id: 'google_analytics', name: 'Google Analytics', icon: '📊', category: 'marketing', color: '#E37400', description: 'Web analytics', nodeTypes: 'action',
    actions: [{ id: 'track_event', name: 'Track Event', description: 'Track custom event' }]
  },
  { id: 'facebook_ads', name: 'Facebook Ads', icon: '📘', category: 'marketing', color: '#1877F2', description: 'Meta advertising', nodeTypes: 'action',
    actions: [{ id: 'create_ad', name: 'Create Ad', description: 'Create an ad' }]
  },
  { id: 'google_ads', name: 'Google Ads', icon: '🎯', category: 'marketing', color: '#4285F4', description: 'Search advertising', nodeTypes: 'action',
    actions: [{ id: 'create_campaign', name: 'Create Campaign', description: 'Create campaign' }]
  },
  { id: 'intercom', name: 'Intercom', icon: '💬', category: 'marketing', color: '#1F8FFF', description: 'Customer messaging', nodeTypes: 'both',
    triggers: [{ id: 'new_conversation', name: 'New Conversation', description: 'When conversation starts' }],
    actions: [{ id: 'send_message', name: 'Send Message', description: 'Send in-app message' }]
  },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', category: 'marketing', color: '#0A66C2', description: 'B2B marketing', nodeTypes: 'action',
    actions: [{ id: 'create_post', name: 'Create Post', description: 'Post to LinkedIn' }]
  },
  { id: 'twitter', name: 'Twitter / X', icon: '🐦', category: 'marketing', color: '#0A66C2', description: 'Social posting', nodeTypes: 'action',
    actions: [{ id: 'create_tweet', name: 'Create Tweet', description: 'Publish a tweet' }]
  },
  { id: 'instagram', name: 'Instagram', icon: '📸', category: 'marketing', color: '#EA4B71', description: 'Social media', nodeTypes: 'action',
    actions: [{ id: 'create_post', name: 'Create Post', description: 'Publish a post' }]
  },
  { id: 'youtube', name: 'YouTube', icon: '📺', category: 'marketing', color: '#DC2626', description: 'Video platform', nodeTypes: 'action',
    actions: [{ id: 'upload_video', name: 'Upload Video', description: 'Upload a video' }]
  },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', category: 'marketing', color: '#000000', description: 'Short video', nodeTypes: 'action',
    actions: [{ id: 'create_post', name: 'Create Post', description: 'Publish a post' }]
  },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', category: 'marketing', color: '#DC2626', description: 'Pins & boards', nodeTypes: 'action',
    actions: [{ id: 'create_pin', name: 'Create Pin', description: 'Create a new pin' }]
  },
  { id: 'reddit', name: 'Reddit', icon: '👽', category: 'marketing', color: '#FF4500', description: 'Reddit posting automation', nodeTypes: 'action',
    actions: [{ id: 'create_post', name: 'Create Post', description: 'Create a subreddit post' }]
  },
  { id: 'mastodon', name: 'Mastodon', icon: '🐘', category: 'marketing', color: '#6364FF', description: 'Post updates to Mastodon', nodeTypes: 'action',
    actions: [{ id: 'create_status', name: 'Create Status', description: 'Post a status' }]
  },
  { id: 'snapchat', name: 'Snapchat', icon: '👻', category: 'marketing', color: '#FDE047', description: 'Snapchat marketing', nodeTypes: 'action',
    actions: [{ id: 'create_post', name: 'Create Post', description: 'Create a post' }]
  },
  { id: 'mixpanel', name: 'Mixpanel', icon: '📈', category: 'marketing', color: '#8B5CF6', description: 'Product analytics tracking', nodeTypes: 'action',
    actions: [{ id: 'track', name: 'Track Event', description: 'Track an event' }]
  },
  { id: 'segment', name: 'Segment', icon: '🧩', category: 'marketing', color: '#111827', description: 'Customer data platform', nodeTypes: 'action',
    actions: [{ id: 'track', name: 'Track', description: 'Send a track call' }]
  },
  
  // Support - mostly triggers for tickets
  { id: 'zendesk', name: 'Zendesk', icon: '🎧', category: 'support', color: '#03363D', description: 'Customer support', nodeTypes: 'both',
    triggers: [{ id: 'ticket_created', name: 'Ticket Created', description: 'When ticket is created' }],
    actions: [{ id: 'create_ticket', name: 'Create Ticket', description: 'Create a ticket' }]
  },
  { id: 'freshdesk', name: 'Freshdesk', icon: '🎫', category: 'support', color: '#25C16F', description: 'Help desk', nodeTypes: 'both',
    triggers: [{ id: 'ticket_created', name: 'Ticket Created', description: 'When ticket is created' }],
    actions: [{ id: 'create_ticket', name: 'Create Ticket', description: 'Create a ticket' }]
  },
  { id: 'liveagent', name: 'LiveAgent', icon: '🎧', category: 'support', color: '#03363D', description: 'Help desk', nodeTypes: 'both',
    triggers: [{ id: 'ticket_created', name: 'Ticket Created', description: 'When ticket is created' }],
    actions: [{ id: 'create_ticket', name: 'Create Ticket', description: 'Create a ticket' }]
  },
  { id: 'helpscout', name: 'Help Scout', icon: '🛟', category: 'support', color: '#1292EE', description: 'Shared inbox', nodeTypes: 'both',
    triggers: [{ id: 'conversation_created', name: 'Conversation Created', description: 'When conversation is created' }],
    actions: [{ id: 'create_conversation', name: 'Create Conversation', description: 'Create a conversation' }]
  },
  { id: 'crisp', name: 'Crisp', icon: '💬', category: 'support', color: '#4B5CFA', description: 'Live chat', nodeTypes: 'both',
    triggers: [{ id: 'new_message', name: 'New Message', description: 'When message received' }],
    actions: [{ id: 'send_message', name: 'Send Message', description: 'Send a message' }]
  },
  { id: 'drift', name: 'Drift', icon: '💬', category: 'support', color: '#111827', description: 'Customer chat and messaging', nodeTypes: 'both',
    triggers: [{ id: 'new_message', name: 'New Message', description: 'When a message is received' }],
    actions: [{ id: 'send_message', name: 'Send Message', description: 'Send a message' }]
  },
  { id: 'tawk', name: 'Tawk.to', icon: '💭', category: 'support', color: '#03A84E', description: 'Free live chat', nodeTypes: 'trigger',
    triggers: [{ id: 'chat_started', name: 'Chat Started', description: 'When chat starts' }]
  },
  
  // Voice & Video - triggers for calls, actions for initiating
  { id: 'twilio_voice', name: 'Twilio Voice', icon: '📞', category: 'voice', color: '#F22F46', description: 'Voice calls', nodeTypes: 'both',
    triggers: [{ id: 'call_received', name: 'Call Received', description: 'When call is received' }],
    actions: [{ id: 'make_call', name: 'Make Call', description: 'Initiate a call' }]
  },
  { id: 'zoom', name: 'Zoom', icon: '🎥', category: 'video', color: '#2D8CFF', description: 'Video meetings', nodeTypes: 'both',
    triggers: [{ id: 'meeting_started', name: 'Meeting Started', description: 'When meeting starts' }],
    actions: [{ id: 'create_meeting', name: 'Create Meeting', description: 'Create a meeting' }]
  },
  { id: 'google_meet', name: 'Google Meet', icon: '📹', category: 'video', color: '#00897B', description: 'Video calls', nodeTypes: 'action',
    actions: [{ id: 'create_meeting', name: 'Create Meeting', description: 'Create meeting' }]
  },
  
  // Logic/Flow Control - these are special action nodes
  { 
    id: 'if_condition', name: 'IF', icon: '🔀', category: 'logic', color: '#F59E0B', popular: true, 
    description: 'Conditional branching',
    nodeTypes: 'action',
    actions: [{ id: 'if', name: 'IF Condition', description: 'Branch based on condition' }]
  },
  { 
    id: 'switch', name: 'Switch', icon: '🔃', category: 'logic', color: '#F59E0B', 
    description: 'Multiple branches',
    nodeTypes: 'action',
    actions: [{ id: 'switch', name: 'Switch', description: 'Multiple condition branches' }]
  },
  { 
    id: 'loop', name: 'Loop', icon: '🔁', category: 'logic', color: '#8B5CF6', 
    description: 'Iterate over items',
    nodeTypes: 'action',
    actions: [{ id: 'loop', name: 'Loop', description: 'Loop over array' }]
  },
  { 
    id: 'set_variable', name: 'Set Variable', icon: '📝', category: 'logic', color: '#6B7280', 
    description: 'Set workflow variables',
    nodeTypes: 'action',
    actions: [{ id: 'set', name: 'Set', description: 'Set a variable' }]
  },
  { 
    id: 'code', name: 'Code', icon: '💻', category: 'logic', color: '#374151', 
    description: 'Custom JavaScript/Python',
    nodeTypes: 'action',
    actions: [{ id: 'execute', name: 'Execute Code', description: 'Run custom code' }]
  },
];

// Categories list
const categories = [
  { id: 'all', label: 'All Apps', count: appCatalog.length },
  { id: 'triggers', label: '⚡ Triggers' },
  { id: 'logic', label: '🔀 Logic' },
  { id: 'communication', label: 'Communication' },
  { id: 'email', label: 'Email' },
  { id: 'google', label: 'Google' },
  { id: 'crm', label: 'CRM & Sales' },
  { id: 'automation', label: 'Automation' },
  { id: 'storage', label: 'Database & Storage' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'developer', label: 'Developer Tools' },
  { id: 'ai', label: 'AI & ML' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'support', label: 'Support' },
  { id: 'voice', label: 'Voice' },
  { id: 'video', label: 'Video' },
];

interface AppsPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onDragStart?: (app: typeof appCatalog[0]) => void;
  onAppSelect?: (app: typeof appCatalog[0]) => void;
  recentApps?: string[];
  highlightAddAction?: boolean;
}

export function AppsPanel({
  isCollapsed = false,
  onToggleCollapse,
  onDragStart,
  onAppSelect,
  recentApps = ['whatsapp', 'gmail', 'openai', 'slack'],
  highlightAddAction = false,
}: AppsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['popular', 'recent']);

  const recentAppsList = useMemo(() => {
    return appCatalog.filter(app => recentApps.includes(app.id));
  }, [recentApps]);

  const popularApps = useMemo(() => {
    return appCatalog.filter(app => app.popular);
  }, []);

  const filteredApps = useMemo(() => {
    let apps = appCatalog;
    
    if (searchQuery) {
      apps = apps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeCategory === 'triggers') {
      // Show only apps that can be triggers
      apps = apps.filter(app => app.nodeTypes === 'trigger' || app.nodeTypes === 'both');
    } else if (activeCategory !== 'all') {
      apps = apps.filter(app => app.category === activeCategory);
    }
    
    return apps;
  }, [searchQuery, activeCategory]);

  const groupedApps = useMemo(() => {
    const groups: Record<string, typeof appCatalog> = {};
    filteredApps.forEach(app => {
      if (!groups[app.category]) {
        groups[app.category] = [];
      }
      groups[app.category].push(app);
    });
    return groups;
  }, [filteredApps]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleDragStart = (e: React.DragEvent, app: typeof appCatalog[0]) => {
    e.dataTransfer.setData('application/json', JSON.stringify(app));
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(app);
  };

  if (isCollapsed) {
    return (
      <div className="w-14 h-full bg-background/95 border-r flex flex-col items-center py-4 gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="mb-4"
              >
                <Layers className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand Apps Panel</TooltipContent>
          </Tooltip>
          
          {popularApps.slice(0, 8).map(app => (
            <Tooltip key={app.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-lg"
                  draggable
                  onDragStart={(e) => handleDragStart(e, app)}
                  onClick={() => onAppSelect?.(app)}
                >
                  {app.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{app.name}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-72 h-full bg-background/95 backdrop-blur-sm border-r flex flex-col",
      highlightAddAction && "ring-2 ring-primary ring-inset"
    )}>
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">
            {highlightAddAction ? "Select an App" : "Apps"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleCollapse}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
        </div>

        {highlightAddAction && (
          <div className="p-2 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-xs text-primary font-medium">
              👆 Click an app below to add it as the next action in your flow
            </p>
          </div>
        )}
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 bg-muted/50"
            autoFocus={highlightAddAction}
          />
        </div>
      </div>

      {/* Categories tabs */}
      <div className="px-3 py-2 border-b overflow-x-auto">
        <div className="flex gap-1 pb-1">
          {categories.slice(0, 6).map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs whitespace-nowrap flex-shrink-0"
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Apps list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Recent Apps */}
          {!searchQuery && activeCategory === 'all' && (
            <Collapsible
              open={expandedCategories.includes('recent')}
              onOpenChange={() => toggleCategory('recent')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Recently Used
                </div>
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  expandedCategories.includes('recent') && "rotate-90"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {recentAppsList.map(app => (
                    <AppCard
                      key={app.id}
                      app={app}
                      compact
                      onDragStart={handleDragStart}
                      onClick={() => onAppSelect?.(app)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Popular Apps */}
          {!searchQuery && activeCategory === 'all' && (
            <Collapsible
              open={expandedCategories.includes('popular')}
              onOpenChange={() => toggleCategory('popular')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <div className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5" />
                  Popular
                </div>
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  expandedCategories.includes('popular') && "rotate-90"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {popularApps.slice(0, 8).map(app => (
                    <AppCard
                      key={app.id}
                      app={app}
                      compact
                      onDragStart={handleDragStart}
                      onClick={() => onAppSelect?.(app)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <Separator className="my-2" />

          {/* Grouped Apps by Category */}
          {activeCategory === 'all' ? (
            Object.entries(groupedApps).map(([category, apps]) => {
              const CategoryIcon = categoryIcons[category] || Layers;
              return (
                <Collapsible
                  key={category}
                  open={expandedCategories.includes(category)}
                  onOpenChange={() => toggleCategory(category)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center",
                        categoryColors[category] || "bg-gray-500"
                      )}>
                        <CategoryIcon className="h-3 w-3 text-white" />
                      </div>
                      {categories.find(c => c.id === category)?.label || category}
                      <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                        {apps.length}
                      </Badge>
                    </div>
                    <ChevronRight className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      expandedCategories.includes(category) && "rotate-90"
                    )} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-1 mt-2">
                      {apps.map(app => (
                        <AppCard
                          key={app.id}
                          app={app}
                          onDragStart={handleDragStart}
                          onClick={() => onAppSelect?.(app)}
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          ) : (
            <div className="space-y-1">
              {filteredApps.map(app => (
                <AppCard
                  key={app.id}
                  app={app}
                  onDragStart={handleDragStart}
                  onClick={() => onAppSelect?.(app)}
                />
              ))}
            </div>
          )}

          {filteredApps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No apps found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer hint */}
      <div className="p-3 border-t bg-muted/30">
        <p className="text-[11px] text-muted-foreground text-center">
          <GripVertical className="h-3 w-3 inline mr-1" />
          Drag apps to canvas to build your flow
        </p>
      </div>
    </div>
  );
}

// App card component
function AppCard({
  app,
  compact = false,
  onDragStart,
  onClick,
}: {
  app: typeof appCatalog[0];
  compact?: boolean;
  onDragStart?: (e: React.DragEvent, app: typeof appCatalog[0]) => void;
  onClick?: () => void;
}) {
  if (compact) {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart?.(e, app)}
        onClick={onClick}
        className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 cursor-grab active:cursor-grabbing transition-all group"
      >
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-sm flex-shrink-0"
          style={{ backgroundColor: app.color + '20' }}
        >
          {app.icon}
        </div>
        <span className="text-xs font-medium truncate">{app.name}</span>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, app)}
      onClick={onClick}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-all group"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 shadow-sm"
        style={{ backgroundColor: app.color + '20' }}
      >
        {app.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {app.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {app.description}
        </p>
      </div>
      <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
    </div>
  );
}

export default AppsPanel;
