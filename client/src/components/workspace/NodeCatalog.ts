/**
 * Node Catalog - Triggers, Actions, and Logic nodes
 * 
 * Comprehensive catalog of all available node types
 * organized by category with proper triggers and actions.
 */

import { 
  Zap, 
  Webhook, 
  MessageCircle, 
  Mail, 
  Calendar, 
  Clock, 
  Globe,
  Database,
  FileText,
  CreditCard,
  Users,
  Bell,
  GitBranch,
  RotateCcw,
  AlertCircle,
  Phone,
  Video,
  ShoppingCart,
  Bot,
  Sparkles,
} from "lucide-react";

// ============================================
// TRIGGER CATALOG
// ============================================

export interface TriggerDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  appId?: string; // Links to app catalog
}

export const triggerCatalog: TriggerDefinition[] = [
  // Webhook & Manual
  { id: 'webhook', name: 'Webhook', description: 'Trigger when webhook URL is called', icon: '🔗', color: '#6B7280', category: 'developer' },
  { id: 'manual', name: 'Manual Trigger', description: 'Trigger workflow manually', icon: '👆', color: '#8B5CF6', category: 'manual' },
  { id: 'schedule', name: 'Schedule', description: 'Trigger on a schedule (cron)', icon: '⏰', color: '#F59E0B', category: 'time' },
  { id: 'interval', name: 'Interval', description: 'Trigger at regular intervals', icon: '🔄', color: '#10B981', category: 'time' },
  
  // Chat & Messaging Triggers
  { id: 'whatsapp_message', name: 'WhatsApp Message', description: 'When a WhatsApp message is received', icon: '💬', color: '#25D366', category: 'communication', appId: 'whatsapp' },
  { id: 'telegram_message', name: 'Telegram Message', description: 'When a Telegram message is received', icon: '✈️', color: '#0088CC', category: 'communication', appId: 'telegram' },
  { id: 'slack_message', name: 'Slack Message', description: 'When a Slack message is posted', icon: '💼', color: '#4A154B', category: 'communication', appId: 'slack' },
  { id: 'discord_message', name: 'Discord Message', description: 'When a Discord message is received', icon: '🎮', color: '#5865F2', category: 'communication', appId: 'discord' },
  { id: 'teams_message', name: 'Teams Message', description: 'When a Microsoft Teams message is received', icon: '👥', color: '#6264A7', category: 'communication', appId: 'microsoft_teams' },
  { id: 'sms_received', name: 'SMS Received', description: 'When an SMS is received via Twilio', icon: '📱', color: '#F22F46', category: 'communication', appId: 'twilio_sms' },
  
  // Email Triggers
  { id: 'gmail_received', name: 'Gmail Received', description: 'When a new email is received in Gmail', icon: '📧', color: '#EA4335', category: 'email', appId: 'gmail' },
  { id: 'outlook_received', name: 'Outlook Email', description: 'When a new Outlook email arrives', icon: '📨', color: '#0078D4', category: 'email', appId: 'outlook' },
  
  // Form & Survey Triggers  
  { id: 'form_submitted', name: 'Form Submitted', description: 'When a form is submitted', icon: '📋', color: '#8B5CF6', category: 'forms' },
  { id: 'google_form', name: 'Google Form Response', description: 'When a Google Form is submitted', icon: '📋', color: '#673AB7', category: 'forms', appId: 'google_forms' },
  { id: 'typeform_response', name: 'Typeform Response', description: 'When a Typeform is completed', icon: '📝', color: '#262627', category: 'forms' },
  
  // CRM Triggers
  { id: 'hubspot_contact', name: 'HubSpot Contact Created', description: 'When a new contact is created in HubSpot', icon: '🧲', color: '#FF7A59', category: 'crm', appId: 'hubspot' },
  { id: 'hubspot_deal', name: 'HubSpot Deal Updated', description: 'When a deal is updated in HubSpot', icon: '💼', color: '#FF7A59', category: 'crm', appId: 'hubspot' },
  { id: 'salesforce_lead', name: 'Salesforce Lead', description: 'When a new lead is created in Salesforce', icon: '☁️', color: '#00A1E0', category: 'crm', appId: 'salesforce' },
  { id: 'pipedrive_deal', name: 'Pipedrive Deal', description: 'When a deal is created/updated', icon: '🔧', color: '#1E825F', category: 'crm', appId: 'pipedrive' },
  
  // E-commerce Triggers
  { id: 'stripe_payment', name: 'Stripe Payment', description: 'When a payment is received', icon: '💳', color: '#635BFF', category: 'ecommerce', appId: 'stripe' },
  { id: 'stripe_subscription', name: 'Stripe Subscription', description: 'When subscription status changes', icon: '🔄', color: '#635BFF', category: 'ecommerce', appId: 'stripe' },
  { id: 'razorpay_payment', name: 'Razorpay Payment', description: 'When a Razorpay payment is made', icon: '💰', color: '#0066FF', category: 'ecommerce', appId: 'razorpay' },
  { id: 'shopify_order', name: 'Shopify Order', description: 'When a new order is placed', icon: '🛒', color: '#96BF48', category: 'ecommerce', appId: 'shopify' },
  { id: 'woocommerce_order', name: 'WooCommerce Order', description: 'When a WooCommerce order is created', icon: '🛍️', color: '#96588A', category: 'ecommerce', appId: 'woocommerce' },
  
  // Database/Storage Triggers
  { id: 'airtable_record', name: 'Airtable Record', description: 'When a record is created/updated', icon: '📑', color: '#FCBF49', category: 'storage', appId: 'airtable' },
  { id: 'notion_page', name: 'Notion Page Created', description: 'When a Notion page is created', icon: '📓', color: '#000000', category: 'storage', appId: 'notion' },
  { id: 'google_sheet_row', name: 'Google Sheets Row', description: 'When a new row is added', icon: '📊', color: '#34A853', category: 'storage', appId: 'google_sheets' },
  { id: 'firebase_change', name: 'Firebase Change', description: 'When data changes in Firebase', icon: '🔥', color: '#FFCA28', category: 'storage', appId: 'firebase' },
  
  // Calendar Triggers
  { id: 'google_calendar_event', name: 'Calendar Event', description: 'When a calendar event starts/is created', icon: '📅', color: '#4285F4', category: 'productivity', appId: 'google_calendar' },
  { id: 'calendly_booking', name: 'Calendly Booking', description: 'When a Calendly meeting is booked', icon: '📆', color: '#006BFF', category: 'productivity', appId: 'calendly' },
  
  // Developer Triggers
  { id: 'github_event', name: 'GitHub Event', description: 'When a GitHub event occurs (push, PR, issue)', icon: '🐙', color: '#181717', category: 'developer', appId: 'github' },
  { id: 'gitlab_event', name: 'GitLab Event', description: 'When a GitLab event occurs', icon: '🦊', color: '#FC6D26', category: 'developer', appId: 'gitlab' },
  
  // Support Triggers
  { id: 'zendesk_ticket', name: 'Zendesk Ticket', description: 'When a support ticket is created', icon: '🎧', color: '#03363D', category: 'support', appId: 'zendesk' },
  { id: 'freshdesk_ticket', name: 'Freshdesk Ticket', description: 'When a Freshdesk ticket is created', icon: '🎫', color: '#25C16F', category: 'support', appId: 'freshdesk' },
  { id: 'intercom_conversation', name: 'Intercom Conversation', description: 'When a new conversation starts', icon: '💬', color: '#1F8FFF', category: 'support', appId: 'intercom' },
  
  // Voice/Video Triggers
  { id: 'twilio_call', name: 'Phone Call Received', description: 'When an incoming call is received', icon: '📞', color: '#F22F46', category: 'voice', appId: 'twilio_voice' },
  { id: 'zoom_meeting', name: 'Zoom Meeting', description: 'When a Zoom meeting starts/ends', icon: '🎥', color: '#2D8CFF', category: 'video', appId: 'zoom' },
];

// ============================================
// ACTION CATALOG
// ============================================

export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  appId?: string;
}

export const actionCatalog: ActionDefinition[] = [
  // HTTP & Developer
  { id: 'http_request', name: 'HTTP Request', description: 'Make an HTTP/API request', icon: '🌐', color: '#10B981', category: 'developer' },
  { id: 'webhook_response', name: 'Respond to Webhook', description: 'Send a response to incoming webhook', icon: '↩️', color: '#6B7280', category: 'developer' },
  { id: 'run_code', name: 'Run Code', description: 'Execute custom JavaScript/Python code', icon: '💻', color: '#F59E0B', category: 'developer' },
  { id: 'graphql_request', name: 'GraphQL Request', description: 'Make a GraphQL query', icon: '◼️', color: '#E535AB', category: 'developer', appId: 'graphql' },
  
  // Messaging Actions
  { id: 'send_whatsapp', name: 'Send WhatsApp Message', description: 'Send a WhatsApp message', icon: '💬', color: '#25D366', category: 'communication', appId: 'whatsapp' },
  { id: 'send_telegram', name: 'Send Telegram Message', description: 'Send a Telegram message', icon: '✈️', color: '#0088CC', category: 'communication', appId: 'telegram' },
  { id: 'send_slack', name: 'Send Slack Message', description: 'Post a message to Slack', icon: '💼', color: '#4A154B', category: 'communication', appId: 'slack' },
  { id: 'send_discord', name: 'Send Discord Message', description: 'Send a Discord message', icon: '🎮', color: '#5865F2', category: 'communication', appId: 'discord' },
  { id: 'send_teams', name: 'Send Teams Message', description: 'Send a Microsoft Teams message', icon: '👥', color: '#6264A7', category: 'communication', appId: 'microsoft_teams' },
  { id: 'send_sms', name: 'Send SMS', description: 'Send an SMS via Twilio', icon: '📱', color: '#F22F46', category: 'communication', appId: 'twilio_sms' },
  
  // Email Actions
  { id: 'send_gmail', name: 'Send Gmail', description: 'Send an email via Gmail', icon: '📧', color: '#EA4335', category: 'email', appId: 'gmail' },
  { id: 'send_outlook', name: 'Send Outlook Email', description: 'Send an email via Outlook', icon: '📨', color: '#0078D4', category: 'email', appId: 'outlook' },
  { id: 'send_sendgrid', name: 'Send via SendGrid', description: 'Send transactional email', icon: '📤', color: '#1A82E2', category: 'email', appId: 'sendgrid' },
  
  // CRM Actions
  { id: 'create_hubspot_contact', name: 'Create HubSpot Contact', description: 'Create a new contact in HubSpot', icon: '🧲', color: '#FF7A59', category: 'crm', appId: 'hubspot' },
  { id: 'update_hubspot_deal', name: 'Update HubSpot Deal', description: 'Update a deal in HubSpot', icon: '💼', color: '#FF7A59', category: 'crm', appId: 'hubspot' },
  { id: 'create_salesforce_lead', name: 'Create Salesforce Lead', description: 'Create a lead in Salesforce', icon: '☁️', color: '#00A1E0', category: 'crm', appId: 'salesforce' },
  { id: 'create_pipedrive_deal', name: 'Create Pipedrive Deal', description: 'Create a deal in Pipedrive', icon: '🔧', color: '#1E825F', category: 'crm', appId: 'pipedrive' },
  
  // Storage Actions
  { id: 'create_airtable_record', name: 'Create Airtable Record', description: 'Add a record to Airtable', icon: '📑', color: '#FCBF49', category: 'storage', appId: 'airtable' },
  { id: 'update_airtable_record', name: 'Update Airtable Record', description: 'Update an Airtable record', icon: '📝', color: '#FCBF49', category: 'storage', appId: 'airtable' },
  { id: 'create_notion_page', name: 'Create Notion Page', description: 'Create a page in Notion', icon: '📓', color: '#000000', category: 'storage', appId: 'notion' },
  { id: 'add_sheets_row', name: 'Add Google Sheets Row', description: 'Add a row to Google Sheets', icon: '📊', color: '#34A853', category: 'storage', appId: 'google_sheets' },
  { id: 'update_sheets_row', name: 'Update Google Sheets Row', description: 'Update a row in Google Sheets', icon: '📊', color: '#34A853', category: 'storage', appId: 'google_sheets' },
  { id: 'upload_drive', name: 'Upload to Google Drive', description: 'Upload a file to Google Drive', icon: '📁', color: '#4285F4', category: 'storage', appId: 'google_drive' },
  { id: 'firebase_set', name: 'Set Firebase Data', description: 'Write data to Firebase', icon: '🔥', color: '#FFCA28', category: 'storage', appId: 'firebase' },
  { id: 'upload_s3', name: 'Upload to S3', description: 'Upload file to AWS S3', icon: '☁️', color: '#FF9900', category: 'storage', appId: 'aws_s3' },
  
  // E-commerce Actions
  { id: 'create_stripe_charge', name: 'Create Stripe Charge', description: 'Create a payment charge', icon: '💳', color: '#635BFF', category: 'ecommerce', appId: 'stripe' },
  { id: 'create_stripe_customer', name: 'Create Stripe Customer', description: 'Create a Stripe customer', icon: '👤', color: '#635BFF', category: 'ecommerce', appId: 'stripe' },
  { id: 'create_razorpay_order', name: 'Create Razorpay Order', description: 'Create a Razorpay order', icon: '💰', color: '#0066FF', category: 'ecommerce', appId: 'razorpay' },
  { id: 'update_shopify_order', name: 'Update Shopify Order', description: 'Update a Shopify order', icon: '🛒', color: '#96BF48', category: 'ecommerce', appId: 'shopify' },
  
  // Calendar Actions
  { id: 'create_calendar_event', name: 'Create Calendar Event', description: 'Create a Google Calendar event', icon: '📅', color: '#4285F4', category: 'productivity', appId: 'google_calendar' },
  { id: 'update_calendar_event', name: 'Update Calendar Event', description: 'Update a calendar event', icon: '📅', color: '#4285F4', category: 'productivity', appId: 'google_calendar' },
  
  // Project Management
  { id: 'create_trello_card', name: 'Create Trello Card', description: 'Create a Trello card', icon: '📋', color: '#0079BF', category: 'productivity', appId: 'trello' },
  { id: 'create_asana_task', name: 'Create Asana Task', description: 'Create a task in Asana', icon: '✅', color: '#F06A6A', category: 'productivity', appId: 'asana' },
  { id: 'create_jira_issue', name: 'Create Jira Issue', description: 'Create a Jira issue', icon: '🎫', color: '#0052CC', category: 'productivity', appId: 'jira' },
  { id: 'create_linear_issue', name: 'Create Linear Issue', description: 'Create a Linear issue', icon: '📐', color: '#5E6AD2', category: 'productivity', appId: 'linear' },
  
  // AI Actions
  { id: 'openai_completion', name: 'OpenAI Completion', description: 'Generate text with GPT', icon: '🤖', color: '#412991', category: 'ai', appId: 'openai' },
  { id: 'openai_chat', name: 'OpenAI Chat', description: 'Chat with GPT', icon: '💬', color: '#412991', category: 'ai', appId: 'openai' },
  { id: 'openai_image', name: 'Generate Image (DALL-E)', description: 'Generate image with DALL-E', icon: '🖼️', color: '#412991', category: 'ai', appId: 'openai' },
  { id: 'claude_completion', name: 'Claude Completion', description: 'Generate text with Claude', icon: '🧠', color: '#C96442', category: 'ai', appId: 'anthropic' },
  { id: 'gemini_completion', name: 'Gemini Completion', description: 'Generate text with Gemini', icon: '✨', color: '#4285F4', category: 'ai', appId: 'google_ai' },
  { id: 'elevenlabs_tts', name: 'Text to Speech', description: 'Convert text to speech', icon: '🎙️', color: '#000000', category: 'ai', appId: 'elevenlabs' },
  
  // Support Actions
  { id: 'create_zendesk_ticket', name: 'Create Zendesk Ticket', description: 'Create a support ticket', icon: '🎧', color: '#03363D', category: 'support', appId: 'zendesk' },
  { id: 'update_zendesk_ticket', name: 'Update Zendesk Ticket', description: 'Update a support ticket', icon: '🎧', color: '#03363D', category: 'support', appId: 'zendesk' },
  { id: 'send_intercom_message', name: 'Send Intercom Message', description: 'Send a message via Intercom', icon: '💬', color: '#1F8FFF', category: 'support', appId: 'intercom' },
  
  // GitHub Actions
  { id: 'create_github_issue', name: 'Create GitHub Issue', description: 'Create a GitHub issue', icon: '🐙', color: '#181717', category: 'developer', appId: 'github' },
  { id: 'create_github_pr', name: 'Create Pull Request', description: 'Create a GitHub PR', icon: '🔀', color: '#181717', category: 'developer', appId: 'github' },
  
  // Voice/Video
  { id: 'make_call', name: 'Make Phone Call', description: 'Make an outbound call', icon: '📞', color: '#F22F46', category: 'voice', appId: 'twilio_voice' },
  { id: 'create_zoom_meeting', name: 'Create Zoom Meeting', description: 'Create a Zoom meeting', icon: '🎥', color: '#2D8CFF', category: 'video', appId: 'zoom' },
];

// ============================================
// LOGIC NODES
// ============================================

export interface LogicNodeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'condition' | 'delay' | 'loop' | 'router' | 'error-handler' | 'action';
}

export const logicNodeCatalog: LogicNodeDefinition[] = [
  { id: 'condition', name: 'IF Condition', description: 'Branch based on true/false condition', icon: '🔀', color: '#8B5CF6', type: 'condition' },
  { id: 'switch', name: 'Switch', description: 'Route to different branches based on value', icon: '🔄', color: '#8B5CF6', type: 'router' },
  { id: 'delay', name: 'Wait / Delay', description: 'Wait for a specified time', icon: '⏱️', color: '#F97316', type: 'delay' },
  { id: 'loop', name: 'Loop', description: 'Iterate over items', icon: '🔁', color: '#06B6D4', type: 'loop' },
  { id: 'split', name: 'Split in Batches', description: 'Process items in batches', icon: '📦', color: '#06B6D4', type: 'loop' },
  { id: 'merge', name: 'Merge', description: 'Merge multiple branches', icon: '🔗', color: '#10B981', type: 'action' },
  { id: 'filter', name: 'Filter', description: 'Filter items based on condition', icon: '🔍', color: '#EAB308', type: 'action' },
  { id: 'set_variable', name: 'Set Variable', description: 'Set a workflow variable', icon: '📝', color: '#3B82F6', type: 'action' },
  { id: 'error_handler', name: 'Error Handler', description: 'Catch and handle errors', icon: '⚠️', color: '#EF4444', type: 'error-handler' },
  { id: 'stop', name: 'Stop Workflow', description: 'Stop workflow execution', icon: '🛑', color: '#EF4444', type: 'action' },
];

// ============================================
// CATEGORY HELPERS
// ============================================

export const triggerCategories = [
  { id: 'all', label: 'All Triggers' },
  { id: 'communication', label: 'Chat & Messaging' },
  { id: 'email', label: 'Email' },
  { id: 'forms', label: 'Forms & Surveys' },
  { id: 'crm', label: 'CRM' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'storage', label: 'Database' },
  { id: 'productivity', label: 'Calendar & Tasks' },
  { id: 'developer', label: 'Developer' },
  { id: 'support', label: 'Support' },
  { id: 'time', label: 'Schedule' },
];

export const actionCategories = [
  { id: 'all', label: 'All Actions' },
  { id: 'communication', label: 'Chat & Messaging' },
  { id: 'email', label: 'Email' },
  { id: 'crm', label: 'CRM' },
  { id: 'storage', label: 'Database & Files' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'ai', label: 'AI & ML' },
  { id: 'developer', label: 'Developer' },
  { id: 'support', label: 'Support' },
  { id: 'voice', label: 'Voice & Video' },
];

// Helper to get trigger by ID
export const getTriggerById = (id: string) => triggerCatalog.find(t => t.id === id);

// Helper to get action by ID
export const getActionById = (id: string) => actionCatalog.find(a => a.id === id);

// Helper to get triggers by category
export const getTriggersByCategory = (category: string) => 
  category === 'all' ? triggerCatalog : triggerCatalog.filter(t => t.category === category);

// Helper to get actions by category
export const getActionsByCategory = (category: string) => 
  category === 'all' ? actionCatalog : actionCatalog.filter(a => a.category === category);
