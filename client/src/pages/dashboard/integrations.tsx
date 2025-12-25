import { useState, useMemo, Component, ErrorInfo, ReactNode } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Database,
  Webhook,
  Mail,
  Globe,
  Plus,
  Play,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Zap,
  Loader2,
  Eye,
  Search,
  MessageCircle,
  Send,
  Cloud,
  Calendar,
  Users,
  ShoppingCart,
  CreditCard,
  Bell,
  Bot,
  Phone,
  Video,
  FileText,
  Image,
  HardDrive,
  Link,
  Settings,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  RefreshCw,
  Clock,
  Activity,
  Filter,
  MoreVertical,
  Copy,
  Edit,
  Power,
  Sparkles,
  GitBranch,
  X,
  Layers,
  ChevronRight,
  ChevronLeft,
  Workflow,
  Target,
  Cog,
  PlugZap,
  Layout,
} from "lucide-react";

// ============= INTEGRATION CATALOG (n8n-style) =============
const integrationCatalog = {
  // Communication
  communication: {
    label: "Communication",
    icon: MessageCircle,
    color: "bg-blue-500",
    integrations: [
      { 
        id: 'whatsapp', 
        name: 'WhatsApp Business', 
        icon: '💬',
        description: 'Send messages, templates, and media via WhatsApp Cloud API',
        category: 'communication',
        popular: true,
        fields: ['accessToken', 'phoneNumberId', 'wabaId', 'webhookVerifyToken'],
      },
      { 
        id: 'telegram', 
        name: 'Telegram', 
        icon: '✈️',
        description: 'Send messages and files to Telegram chats/channels',
        category: 'communication',
        popular: true,
        fields: ['botToken', 'chatId', 'parseMode'],
      },
      { 
        id: 'slack', 
        name: 'Slack', 
        icon: '💼',
        description: 'Post messages to Slack channels',
        category: 'communication',
        fields: ['webhookUrl'],
      },
      { 
        id: 'slack_bot', 
        name: 'Slack Bot', 
        icon: '🤖',
        description: 'Full Slack API access with bot token',
        category: 'communication',
        fields: ['botToken', 'signingSecret', 'appToken'],
      },
      { 
        id: 'discord', 
        name: 'Discord', 
        icon: '🎮',
        description: 'Send messages to Discord servers',
        category: 'communication',
        fields: ['webhookUrl'],
      },
      { 
        id: 'discord_bot', 
        name: 'Discord Bot', 
        icon: '🎮',
        description: 'Full Discord API access with bot',
        category: 'communication',
        fields: ['botToken', 'applicationId', 'publicKey'],
      },
      { 
        id: 'sms_twilio', 
        name: 'Twilio SMS', 
        icon: '📱',
        description: 'Send SMS messages via Twilio',
        category: 'communication',
        fields: ['accountSid', 'authToken', 'fromNumber', 'messagingServiceSid'],
      },
      { 
        id: 'microsoft_teams', 
        name: 'Microsoft Teams', 
        icon: '👥',
        description: 'Post messages to Teams channels',
        category: 'communication',
        fields: ['webhookUrl'],
      },
    ]
  },
  
  // Email
  email: {
    label: "Email",
    icon: Mail,
    color: "bg-red-500",
    integrations: [
      { 
        id: 'gmail', 
        name: 'Gmail', 
        icon: '📧',
        description: 'Send emails via Gmail API (OAuth)',
        category: 'email',
        popular: true,
        fields: ['clientId', 'clientSecret', 'refreshToken'],
      },
      { 
        id: 'outlook', 
        name: 'Microsoft Outlook', 
        icon: '📨',
        description: 'Send emails via Outlook/Office 365 (OAuth)',
        category: 'email',
        fields: ['clientId', 'clientSecret', 'tenantId', 'refreshToken'],
      },
      { 
        id: 'smtp', 
        name: 'SMTP Email', 
        icon: '✉️',
        description: 'Send emails via any SMTP server',
        category: 'email',
        fields: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'fromEmail', 'fromName', 'secure'],
      },
      { 
        id: 'sendgrid', 
        name: 'SendGrid', 
        icon: '📤',
        description: 'Send transactional emails via SendGrid',
        category: 'email',
        popular: true,
        fields: ['apiKey', 'fromEmail', 'fromName'],
      },
      { 
        id: 'mailchimp', 
        name: 'Mailchimp', 
        icon: '🐵',
        description: 'Add contacts to Mailchimp lists',
        category: 'email',
        fields: ['apiKey', 'audienceId', 'datacenter'],
      },
      { 
        id: 'mailgun', 
        name: 'Mailgun', 
        icon: '📬',
        description: 'Send emails via Mailgun',
        category: 'email',
        fields: ['apiKey', 'domain', 'fromEmail'],
      },
    ]
  },
  
  // Google Services
  google: {
    label: "Google",
    icon: Globe,
    color: "bg-green-500",
    integrations: [
      { 
        id: 'google_sheets', 
        name: 'Google Sheets', 
        icon: '📊',
        description: 'Read/write data to Google Sheets',
        category: 'google',
        popular: true,
        fields: ['clientId', 'clientSecret', 'refreshToken', 'spreadsheetId', 'sheetName'],
      },
      { 
        id: 'google_drive', 
        name: 'Google Drive', 
        icon: '📁',
        description: 'Upload and manage files in Google Drive',
        category: 'google',
        popular: true,
        fields: ['clientId', 'clientSecret', 'refreshToken', 'folderId'],
      },
      { 
        id: 'google_calendar', 
        name: 'Google Calendar', 
        icon: '📅',
        description: 'Create and manage calendar events',
        category: 'google',
        fields: ['clientId', 'clientSecret', 'refreshToken', 'calendarId'],
      },
      { 
        id: 'google_docs', 
        name: 'Google Docs', 
        icon: '📝',
        description: 'Create and edit Google Docs',
        category: 'google',
        fields: ['clientId', 'clientSecret', 'refreshToken'],
      },
      { 
        id: 'google_forms', 
        name: 'Google Forms', 
        icon: '📋',
        description: 'Receive form submissions',
        category: 'google',
        fields: ['clientId', 'clientSecret', 'refreshToken', 'formId'],
      },
    ]
  },
  
  // CRM & Sales
  crm: {
    label: "CRM & Sales",
    icon: Users,
    color: "bg-purple-500",
    integrations: [
      { 
        id: 'hubspot', 
        name: 'HubSpot', 
        icon: '🧲',
        description: 'Manage contacts, deals, and tickets',
        category: 'crm',
        popular: true,
        fields: ['privateAppToken'],
      },
      { 
        id: 'hubspot_oauth', 
        name: 'HubSpot (OAuth)', 
        icon: '🧲',
        description: 'HubSpot with full OAuth 2.0 access',
        category: 'crm',
        fields: ['clientId', 'clientSecret', 'refreshToken', 'accessToken'],
      },
      { 
        id: 'salesforce', 
        name: 'Salesforce', 
        icon: '☁️',
        description: 'Sync with Salesforce CRM',
        category: 'crm',
        fields: ['instanceUrl', 'clientId', 'clientSecret', 'refreshToken', 'accessToken'],
      },
      { 
        id: 'pipedrive', 
        name: 'Pipedrive', 
        icon: '🔧',
        description: 'Manage deals and contacts',
        category: 'crm',
        fields: ['apiToken', 'companyDomain'],
      },
      { 
        id: 'zoho_crm', 
        name: 'Zoho CRM', 
        icon: '📈',
        description: 'Sync leads and contacts',
        category: 'crm',
        fields: ['clientId', 'clientSecret', 'refreshToken', 'datacenter'],
      },
      { 
        id: 'freshsales', 
        name: 'Freshsales', 
        icon: '🌱',
        description: 'Manage Freshsales contacts',
        category: 'crm',
        fields: ['apiKey', 'domain'],
      },
    ]
  },
  
  // Automation Platforms
  automation: {
    label: "Automation",
    icon: Zap,
    color: "bg-orange-500",
    integrations: [
      { 
        id: 'zapier', 
        name: 'Zapier', 
        icon: '⚡',
        description: 'Connect to 5000+ apps via Zapier webhooks',
        category: 'automation',
        popular: true,
        fields: ['webhookUrl'],
      },
      { 
        id: 'make', 
        name: 'Make (Integromat)', 
        icon: '🔄',
        description: 'Trigger Make scenarios via webhook',
        category: 'automation',
        popular: true,
        fields: ['webhookUrl'],
      },
      { 
        id: 'n8n', 
        name: 'n8n', 
        icon: '🔗',
        description: 'Trigger n8n workflows',
        category: 'automation',
        fields: ['webhookUrl', 'authHeader', 'authValue'],
      },
      { 
        id: 'ifttt', 
        name: 'IFTTT', 
        icon: '🔀',
        description: 'Trigger IFTTT applets',
        category: 'automation',
        fields: ['webhookKey', 'eventName'],
      },
      { 
        id: 'power_automate', 
        name: 'Power Automate', 
        icon: '⚙️',
        description: 'Trigger Microsoft Power Automate flows',
        category: 'automation',
        fields: ['webhookUrl'],
      },
    ]
  },
  
  // Database & Storage
  storage: {
    label: "Database & Storage",
    icon: Database,
    color: "bg-cyan-500",
    integrations: [
      { 
        id: 'airtable', 
        name: 'Airtable', 
        icon: '📑',
        description: 'Read/write to Airtable bases',
        category: 'storage',
        popular: true,
        fields: ['personalAccessToken', 'baseId', 'tableId'],
      },
      { 
        id: 'notion', 
        name: 'Notion', 
        icon: '📓',
        description: 'Create pages and database entries',
        category: 'storage',
        popular: true,
        fields: ['integrationToken', 'databaseId'],
      },
      { 
        id: 'firebase', 
        name: 'Firebase', 
        icon: '🔥',
        description: 'Store data in Firestore',
        category: 'storage',
        fields: ['projectId', 'privateKey', 'clientEmail', 'databaseUrl'],
      },
      { 
        id: 'supabase', 
        name: 'Supabase', 
        icon: '⚡',
        description: 'Store data in Supabase',
        category: 'storage',
        fields: ['url', 'apiKey', 'serviceRoleKey'],
      },
      { 
        id: 'mongodb', 
        name: 'MongoDB', 
        icon: '🍃',
        description: 'Store data in MongoDB',
        category: 'storage',
        fields: ['connectionString', 'database', 'collection'],
      },
      { 
        id: 'dropbox', 
        name: 'Dropbox', 
        icon: '📦',
        description: 'Upload files to Dropbox',
        category: 'storage',
        fields: ['accessToken', 'refreshToken', 'appKey', 'appSecret'],
      },
      { 
        id: 'aws_s3', 
        name: 'AWS S3', 
        icon: '☁️',
        description: 'Store files in S3 buckets',
        category: 'storage',
        fields: ['accessKeyId', 'secretAccessKey', 'bucket', 'region', 'endpoint'],
      },
      {
        id: 'redis',
        name: 'Redis',
        icon: '⚡',
        description: 'Read/write key-value data in Redis',
        category: 'storage',
        fields: ['host', 'port', 'password', 'username', 'tls'],
      },
      {
        id: 'elasticsearch',
        name: 'Elasticsearch',
        icon: '🔎',
        description: 'Index and search documents using Elasticsearch/OpenSearch',
        category: 'storage',
        fields: ['endpoint', 'username', 'password', 'index', 'apiKey', 'cloudId'],
      },
    ]
  },
  
  // E-commerce & Payments
  ecommerce: {
    label: "E-commerce",
    icon: ShoppingCart,
    color: "bg-pink-500",
    integrations: [
      { 
        id: 'stripe', 
        name: 'Stripe', 
        icon: '💳',
        description: 'Process payments and manage customers',
        category: 'ecommerce',
        popular: true,
        fields: ['secretKey', 'webhookSecret', 'publishableKey'],
      },
      { 
        id: 'razorpay', 
        name: 'Razorpay', 
        icon: '💰',
        description: 'Process payments via Razorpay',
        category: 'ecommerce',
        popular: true,
        fields: ['keyId', 'keySecret', 'webhookSecret'],
      },
      { 
        id: 'shopify', 
        name: 'Shopify', 
        icon: '🛒',
        description: 'Manage Shopify orders and products',
        category: 'ecommerce',
        fields: ['shopDomain', 'accessToken', 'apiVersion'],
      },
      { 
        id: 'woocommerce', 
        name: 'WooCommerce', 
        icon: '🛍️',
        description: 'Manage WooCommerce orders',
        category: 'ecommerce',
        fields: ['siteUrl', 'consumerKey', 'consumerSecret', 'version'],
      },
      { 
        id: 'paypal', 
        name: 'PayPal', 
        icon: '🅿️',
        description: 'Process PayPal payments',
        category: 'ecommerce',
        fields: ['clientId', 'clientSecret', 'mode'],
      },
      { 
        id: 'square', 
        name: 'Square', 
        icon: '⬜',
        description: 'Process payments via Square',
        category: 'ecommerce',
        fields: ['accessToken', 'locationId', 'environment'],
      },
    ]
  },
  
  // Project Management
  productivity: {
    label: "Productivity",
    icon: Calendar,
    color: "bg-indigo-500",
    integrations: [
      { 
        id: 'trello', 
        name: 'Trello', 
        icon: '📋',
        description: 'Create cards and manage boards',
        category: 'productivity',
        fields: ['apiKey', 'token', 'boardId'],
      },
      { 
        id: 'asana', 
        name: 'Asana', 
        icon: '✅',
        description: 'Create tasks in Asana',
        category: 'productivity',
        fields: ['accessToken', 'workspaceId'],
      },
      { 
        id: 'jira', 
        name: 'Jira', 
        icon: '🎫',
        description: 'Create Jira issues',
        category: 'productivity',
        fields: ['domain', 'email', 'apiToken', 'projectKey'],
      },
      { 
        id: 'monday', 
        name: 'Monday.com', 
        icon: '📊',
        description: 'Create items in Monday boards',
        category: 'productivity',
        fields: ['apiToken', 'boardId'],
      },
      { 
        id: 'clickup', 
        name: 'ClickUp', 
        icon: '🎯',
        description: 'Create tasks in ClickUp',
        category: 'productivity',
        fields: ['accessToken', 'listId'],
      },
      { 
        id: 'calendly', 
        name: 'Calendly', 
        icon: '📆',
        description: 'Schedule meetings via Calendly',
        category: 'productivity',
        fields: ['personalAccessToken', 'organizationUri', 'userUri'],
      },
      { 
        id: 'linear', 
        name: 'Linear', 
        icon: '📐',
        description: 'Create and manage Linear issues',
        category: 'productivity',
        fields: ['apiKey', 'teamId'],
      },
    ]
  },
  
  // Webhooks & APIs
  developer: {
    label: "Developer Tools",
    icon: Webhook,
    color: "bg-gray-600",
    integrations: [
      { 
        id: 'custom_integration', 
        name: '✨ Build Custom Integration', 
        icon: '🛠️',
        description: 'Create a custom integration from scratch with your own logic',
        category: 'developer',
        popular: true,
        isCustom: true,
        fields: ['webhookUrl', 'method', 'headers', 'bodyTemplate', 'timeout', 'retryCount'],
      },
      { 
        id: 'webhook', 
        name: 'Webhook (Incoming)', 
        icon: '🔗',
        description: 'Receive data from external services via webhook',
        category: 'developer',
        popular: true,
        fields: ['webhookUrl', 'method', 'headers', 'secretKey'],
      },
      { 
        id: 'webhook_outgoing', 
        name: 'Webhook (Outgoing)', 
        icon: '📤',
        description: 'Send data to any HTTP endpoint when triggered',
        category: 'developer',
        fields: ['webhookUrl', 'method', 'headers', 'bodyTemplate', 'timeout'],
      },
      { 
        id: 'custom_api', 
        name: 'REST API', 
        icon: '🌐',
        description: 'Call any REST API endpoint',
        category: 'developer',
        fields: ['apiUrl', 'method', 'headers', 'authType', 'apiKey', 'timeout'],
      },
      { 
        id: 'graphql', 
        name: 'GraphQL', 
        icon: '◼️',
        description: 'Execute GraphQL queries',
        category: 'developer',
        fields: ['endpoint', 'headers', 'authToken'],
      },
      { 
        id: 'github', 
        name: 'GitHub', 
        icon: '🐙',
        description: 'Create issues and manage repos',
        category: 'developer',
        fields: ['accessToken', 'owner', 'repo'],
      },
      {
        id: 'gitlab',
        name: 'GitLab',
        icon: '🦊',
        description: 'Create issues, trigger pipelines and interact with GitLab APIs',
        category: 'developer',
        fields: ['accessToken', 'projectId', 'baseUrl'],
      },
      {
        id: 'bitbucket',
        name: 'Bitbucket',
        icon: '🧩',
        description: 'Create issues and trigger pipelines in Bitbucket',
        category: 'developer',
        fields: ['username', 'appPassword', 'workspace', 'repoSlug'],
      },
    ]
  },

  // AI & Machine Learning
  ai: {
    label: "AI & ML",
    icon: Sparkles,
    color: "bg-violet-500",
    integrations: [
      {
        id: 'openai',
        name: 'OpenAI',
        icon: '🤖',
        description: 'GPT-4, DALL-E, Whisper and more AI capabilities',
        category: 'ai',
        popular: true,
        fields: ['apiKey', 'model', 'maxTokens', 'temperature', 'organizationId'],
      },
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        icon: '🧠',
        description: 'Claude AI for advanced conversations and analysis',
        category: 'ai',
        popular: true,
        fields: ['apiKey', 'model', 'maxTokens'],
      },
      {
        id: 'google_ai',
        name: 'Google AI (Gemini)',
        icon: '✨',
        description: 'Google Gemini models for multimodal AI',
        category: 'ai',
        fields: ['apiKey', 'model', 'projectId'],
      },
      {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        icon: '🎙️',
        description: 'AI voice synthesis and text-to-speech',
        category: 'ai',
        fields: ['apiKey', 'voiceId', 'modelId', 'stability', 'similarityBoost'],
      },
      {
        id: 'azure_openai',
        name: 'Azure OpenAI',
        icon: '☁️',
        description: 'OpenAI models hosted on Azure',
        category: 'ai',
        fields: ['apiKey', 'endpoint', 'deploymentName', 'apiVersion'],
      },
      {
        id: 'replicate',
        name: 'Replicate',
        icon: '🔄',
        description: 'Run open-source ML models via API',
        category: 'ai',
        fields: ['apiToken', 'modelVersion'],
      },
    ]
  },

  // Marketing & Analytics
  marketing: {
    label: "Marketing",
    icon: Target,
    color: "bg-rose-500",
    integrations: [
      {
        id: 'google_analytics',
        name: 'Google Analytics',
        icon: '📊',
        description: 'Track and analyze website traffic (GA4 Data API)',
        category: 'marketing',
        fields: ['propertyId', 'clientEmail', 'privateKey'],
      },
      {
        id: 'facebook_ads',
        name: 'Facebook Ads',
        icon: '📘',
        description: 'Manage Facebook advertising campaigns',
        category: 'marketing',
        fields: ['accessToken', 'adAccountId', 'appId', 'appSecret'],
      },
      {
        id: 'google_ads',
        name: 'Google Ads',
        icon: '🎯',
        description: 'Manage Google advertising campaigns',
        category: 'marketing',
        fields: ['clientId', 'clientSecret', 'developerToken', 'refreshToken', 'customerId', 'loginCustomerId'],
      },
      {
        id: 'intercom',
        name: 'Intercom',
        icon: '💬',
        description: 'Customer messaging and engagement platform',
        category: 'marketing',
        popular: true,
        fields: ['accessToken', 'appId'],
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: '💼',
        description: 'Post content and manage LinkedIn presence',
        category: 'marketing',
        fields: ['clientId', 'clientSecret', 'accessToken', 'refreshToken', 'organizationId'],
      },
      {
        id: 'hubspot_marketing',
        name: 'HubSpot Marketing',
        icon: '🧲',
        description: 'Marketing automation and email campaigns',
        category: 'marketing',
        fields: ['privateAppToken', 'portalId'],
      },
      {
        id: 'segment',
        name: 'Segment',
        icon: '📊',
        description: 'Customer data platform',
        category: 'marketing',
        fields: ['writeKey', 'sourceId'],
      },
      {
        id: 'mixpanel',
        name: 'Mixpanel',
        icon: '📈',
        description: 'Product analytics and user tracking',
        category: 'marketing',
        fields: ['projectToken', 'apiSecret', 'serviceAccountUsername', 'serviceAccountPassword'],
      },
    ]
  },

  // Support & Help Desk
  support: {
    label: "Support",
    icon: Bell,
    color: "bg-amber-500",
    integrations: [
      {
        id: 'zendesk',
        name: 'Zendesk',
        icon: '🎫',
        description: 'Create tickets and manage support workflows',
        category: 'support',
        popular: true,
        fields: ['subdomain', 'email', 'apiToken'],
      },
      {
        id: 'freshdesk',
        name: 'Freshdesk',
        icon: '🌿',
        description: 'Manage support tickets in Freshdesk',
        category: 'support',
        fields: ['domain', 'apiKey'],
      },
      {
        id: 'zoom',
        name: 'Zoom',
        icon: '📹',
        description: 'Create meetings and manage webinars',
        category: 'support',
        fields: ['clientId', 'clientSecret', 'accountId'],
      },
      {
        id: 'liveagent',
        name: 'LiveAgent',
        icon: '🎧',
        description: 'Manage support tickets and live chat',
        category: 'support',
        fields: ['apiKey', 'domain'],
      },
      {
        id: 'helpscout',
        name: 'Help Scout',
        icon: '🔍',
        description: 'Manage conversations and help desk',
        category: 'support',
        fields: ['apiKey', 'appId', 'appSecret', 'mailboxId'],
      },
      {
        id: 'crisp',
        name: 'Crisp',
        icon: '💭',
        description: 'Customer messaging platform',
        category: 'support',
        fields: ['websiteId', 'tokenId', 'tokenKey'],
      },
      {
        id: 'drift',
        name: 'Drift',
        icon: '🌊',
        description: 'Conversational marketing and sales',
        category: 'support',
        fields: ['accessToken'],
      },
      {
        id: 'tawk',
        name: 'Tawk.to',
        icon: '💬',
        description: 'Free live chat software',
        category: 'support',
        fields: ['apiKey', 'propertyId', 'widgetId'],
      },
    ]
  },

  // Database
  database: {
    label: "Databases",
    icon: HardDrive,
    color: "bg-emerald-500",
    integrations: [
      {
        id: 'postgresql',
        name: 'PostgreSQL',
        icon: '🐘',
        description: 'Connect to PostgreSQL databases',
        category: 'database',
        fields: ['host', 'port', 'database', 'user', 'password', 'ssl'],
      },
      {
        id: 'mysql',
        name: 'MySQL',
        icon: '🐬',
        description: 'Connect to MySQL databases',
        category: 'database',
        fields: ['host', 'port', 'database', 'user', 'password', 'ssl'],
      },
      {
        id: 'dynamodb',
        name: 'AWS DynamoDB',
        icon: '⚡',
        description: 'NoSQL database on AWS',
        category: 'database',
        fields: ['accessKeyId', 'secretAccessKey', 'region', 'tableName'],
      },
      {
        id: 'cosmosdb',
        name: 'Azure Cosmos DB',
        icon: '🌌',
        description: 'Globally distributed multi-model database',
        category: 'database',
        fields: ['endpoint', 'primaryKey', 'databaseId', 'containerId'],
      },
      {
        id: 'bigquery',
        name: 'Google BigQuery',
        icon: '📊',
        description: 'Serverless data warehouse',
        category: 'database',
        fields: ['projectId', 'clientEmail', 'privateKey', 'datasetId'],
      },
    ]
  },

  // Social Media
  social: {
    label: "Social Media",
    icon: Globe,
    color: "bg-sky-500",
    integrations: [
      {
        id: 'twitter',
        name: 'Twitter/X',
        icon: '🐦',
        description: 'Post tweets and manage Twitter presence (API v2)',
        category: 'social',
        fields: ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret', 'bearerToken'],
      },
      {
        id: 'instagram',
        name: 'Instagram',
        icon: '📸',
        description: 'Post content to Instagram (Graph API)',
        category: 'social',
        fields: ['accessToken', 'refreshToken', 'businessAccountId', 'appId', 'appSecret'],
      },
      {
        id: 'youtube',
        name: 'YouTube',
        icon: '▶️',
        description: 'Upload videos and manage channel',
        category: 'social',
        fields: ['clientId', 'clientSecret', 'refreshToken', 'channelId'],
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        icon: '🎵',
        description: 'Post content to TikTok (Content Posting API)',
        category: 'social',
        fields: ['clientKey', 'clientSecret', 'accessToken', 'refreshToken', 'openId'],
      },
      {
        id: 'pinterest',
        name: 'Pinterest',
        icon: '📌',
        description: 'Create pins and manage boards',
        category: 'social',
        fields: ['accessToken', 'refreshToken', 'appId', 'appSecret', 'boardId'],
      },
      {
        id: 'snapchat',
        name: 'Snapchat',
        icon: '👻',
        description: 'Manage Snapchat Ads and marketing',
        category: 'social',
        fields: ['clientId', 'clientSecret', 'accessToken', 'refreshToken', 'adAccountId'],
      },
      {
        id: 'reddit',
        name: 'Reddit',
        icon: '🤖',
        description: 'Post to subreddits and manage Reddit presence',
        category: 'social',
        fields: ['clientId', 'clientSecret', 'username', 'password', 'userAgent'],
      },
      {
        id: 'mastodon',
        name: 'Mastodon',
        icon: '🐘',
        description: 'Post to Mastodon instances',
        category: 'social',
        fields: ['instanceUrl', 'accessToken'],
      },
    ]
  },
};

// Flatten all integrations for search
const allIntegrations = Object.values(integrationCatalog).flatMap(cat => 
  cat.integrations.map(int => ({ ...int, categoryLabel: cat.label, categoryColor: cat.color }))
);

// Trigger events
const triggerEvents = [
  { id: 'appointment_booked', name: 'Appointment Booked', category: 'Appointments', icon: '📅' },
  { id: 'appointment_cancelled', name: 'Appointment Cancelled', category: 'Appointments', icon: '❌' },
  { id: 'appointment_reminder', name: 'Appointment Reminder', category: 'Appointments', icon: '⏰' },
  { id: 'lead_captured', name: 'New Lead Captured', category: 'Leads', icon: '🎯' },
  { id: 'message_received', name: 'Message Received', category: 'Conversations', icon: '💬' },
  { id: 'conversation_ended', name: 'Conversation Ended', category: 'Conversations', icon: '✅' },
  { id: 'order_placed', name: 'Order Placed', category: 'Orders', icon: '🛒' },
  { id: 'order_completed', name: 'Order Completed', category: 'Orders', icon: '📦' },
  { id: 'payment_received', name: 'Payment Received', category: 'Billing', icon: '💰' },
  { id: 'invoice_sent', name: 'Invoice Sent', category: 'Billing', icon: '📄' },
  { id: 'complaint_raised', name: 'Complaint Raised', category: 'Support', icon: '⚠️' },
  { id: 'feedback_received', name: 'Feedback Received', category: 'Support', icon: '⭐' },
  { id: 'human_handoff', name: 'Human Handoff Requested', category: 'Support', icon: '👤' },
  { id: 'custom', name: 'Custom Event', category: 'Custom', icon: '🔧' },
];

interface Integration {
  id: string;
  userId: string;
  agentId: string | null;
  type: string;
  name: string;
  description: string | null;
  config: any;
  triggers: Array<{ event: string; conditions?: any }>;
  isActive: boolean;
  lastTriggeredAt: string | null;
  lastError: string | null;
  errorCount: number;
  createdAt: string;
}

interface IntegrationLog {
  id: string;
  integrationId: string;
  triggerEvent: string;
  inputData: any;
  outputData: any;
  status: string;
  errorMessage: string | null;
  executionTimeMs: number;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
}

// Error Boundary for catching render errors
class IntegrationErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('IntegrationsPage Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <DashboardLayout>
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">
                <p>Failed to load the integrations page. This might be due to missing database tables.</p>
                <p className="mt-2 text-xs font-mono bg-destructive/10 p-2 rounded">
                  {this.state.error?.message}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </DashboardLayout>
      );
    }
    return this.props.children;
  }
}

function IntegrationsPageContent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Navigate to workspace to create flow with selected app
  const openWorkspace = (integration?: any) => {
    if (integration) {
      // Store selected app in sessionStorage for the workspace to pick up
      sessionStorage.setItem('workspace_initial_app', JSON.stringify(integration));
    }
    setLocation('/dashboard/integrations/workspace');
  };

  // Navigate to automations to create automation with selected app
  const openAutomation = (integration?: any) => {
    if (integration) {
      // Store selected app in sessionStorage for automations to pick up
      sessionStorage.setItem('automation_initial_app', JSON.stringify(integration));
    }
    setLocation('/dashboard/automations');
  };

  // Filter integrations based on search and category
  const filteredIntegrations = useMemo(() => {
    return allIntegrations.filter(int => {
      const matchesSearch = !searchQuery || 
        int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        int.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || int.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // Popular integrations
  const popularIntegrations = useMemo(() => {
    return allIntegrations.filter(int => 'popular' in int && int.popular);
  }, []);

  // Fetch user's configured integrations
  const { data: integrationsData, isLoading, error } = useQuery({
    queryKey: ['/api/integrations'],
    queryFn: async () => {
      const res = await fetch('/api/integrations', { credentials: 'include' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to fetch integrations');
      }
      return res.json() as Promise<{ integrations: Integration[] }>;
    },
  });

  // Fetch agents for selector
  const { data: agentsData } = useQuery({
    queryKey: ['/api/agents'],
    queryFn: async () => {
      const res = await fetch('/api/agents', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch agents');
      return res.json() as Promise<Agent[]>;
    },
  });

  // Fetch integration logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/integrations', selectedIntegration?.id, 'logs'],
    queryFn: async () => {
      if (!selectedIntegration) return { logs: [] };
      const res = await fetch(`/api/integrations/${selectedIntegration.id}/logs`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch logs');
      return res.json() as Promise<{ logs: IntegrationLog[] }>;
    },
    enabled: !!selectedIntegration && isLogsOpen,
  });

  // Toggle active status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/integrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error('Failed to update integration');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
  });

  // Delete integration
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/integrations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete integration');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      toast({ title: 'Integration deleted' });
    },
  });

  // Test integration
  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/integrations/${id}/test`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to test integration');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: 'Test successful!', description: data.message });
      } else {
        toast({ title: 'Test failed', description: data.message, variant: 'destructive' });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
  });

  // Create integration
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create integration');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setIsCreateOpen(false);
      setSelectedType(null);
      toast({ title: 'Integration created successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to create integration', description: error.message, variant: 'destructive' });
    },
  });

  const userIntegrations = integrationsData?.integrations || [];
  const agents = agentsData || [];

  const getIntegrationInfo = (type: string) => {
    return allIntegrations.find(i => i.id === type);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              Integrations
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect 50+ apps and automate your workflows like n8n
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Quick Setup
            </Button>
            <Button size="lg" onClick={() => openWorkspace()} className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90">
              <Layout className="h-5 w-5 mr-2" />
              Open Flow Builder
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load integrations. Please make sure the integrations tables are created in your database.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Integrations</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{userIntegrations.length}</p>
                </div>
                <Link className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Active</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {userIntegrations.filter(i => i.isActive).length}
                  </p>
                </div>
                <Power className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">With Errors</p>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {userIntegrations.filter(i => i.errorCount > 0).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Available Apps</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{allIntegrations.length}</p>
                </div>
                <Globe className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="my-integrations" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-integrations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              My Integrations
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse Apps
            </TabsTrigger>
          </TabsList>

          {/* My Integrations Tab */}
          <TabsContent value="my-integrations" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : userIntegrations.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No integrations configured yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Connect your AI agents to external apps like Google Sheets, Telegram, Zapier, and 50+ more to automate your workflows.
                  </p>
                  <Button size="lg" onClick={() => openWorkspace()}>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Integration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {userIntegrations.map((integration) => {
                  const info = getIntegrationInfo(integration.type);
                  return (
                    <Card key={integration.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${info?.categoryColor || 'bg-gray-100'}`}>
                              {info?.icon || '🔗'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{integration.name}</span>
                                {!integration.isActive ? (
                                  <Badge variant="secondary">Disabled</Badge>
                                ) : integration.errorCount > 0 ? (
                                  <Badge variant="destructive">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {integration.errorCount} errors
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {info?.name || integration.type}
                              </p>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {integration.triggers?.slice(0, 3).map((trigger, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {triggerEvents.find(e => e.id === trigger.event)?.icon}{' '}
                                    {triggerEvents.find(e => e.id === trigger.event)?.name || trigger.event}
                                  </Badge>
                                ))}
                                {(integration.triggers?.length || 0) > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{(integration.triggers?.length || 0) - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {integration.lastTriggeredAt && (
                              <span className="text-xs text-muted-foreground hidden md:block">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {new Date(integration.lastTriggeredAt).toLocaleDateString()}
                              </span>
                            )}
                            <Switch
                              checked={integration.isActive}
                              onCheckedChange={(checked) =>
                                toggleMutation.mutate({ id: integration.id, isActive: checked })
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedIntegration(integration);
                                setIsLogsOpen(true);
                              }}
                            >
                              <Activity className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => testMutation.mutate(integration.id)}
                              disabled={testMutation.isPending}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                if (confirm('Delete this integration?')) {
                                  deleteMutation.mutate(integration.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {integration.lastError && (
                          <Alert variant="destructive" className="mt-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">{integration.lastError}</AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Browse Apps Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search 50+ integrations..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(integrationCatalog).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Popular Integrations */}
            {activeCategory === 'all' && !searchQuery && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Popular Integrations
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {popularIntegrations.map((int) => (
                    <Card
                      key={int.id}
                      className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                      onClick={() => openWorkspace(int)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl ${int.categoryColor}`}>
                          {int.icon}
                        </div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{int.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Categories */}
            {activeCategory === 'all' && !searchQuery ? (
              Object.entries(integrationCatalog).map(([key, category]) => {
                const CategoryIcon = category.icon;
                return (
                <div key={key}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5" />
                    {category.label}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.integrations.map((int) => (
                      <Card
                        key={int.id}
                        className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                        onClick={() => openWorkspace({ ...int, categoryColor: category.color })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${category.color} text-white`}>
                              {int.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium group-hover:text-primary transition-colors">{int.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{int.description}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
              })
            ) : (
              /* Filtered Results */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredIntegrations.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No integrations found for "{searchQuery}"</p>
                  </div>
                ) : (
                  filteredIntegrations.map((int) => (
                    <Card
                      key={int.id}
                      className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                      onClick={() => openWorkspace(int)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${int.categoryColor} text-white`}>
                            {int.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium group-hover:text-primary transition-colors">{int.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{int.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{int.categoryLabel}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Integration - Modern Full-Screen Sheet */}
        <Sheet open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setSelectedType(null);
        }}>
          <SheetContent 
            side="right" 
            className="w-full sm:max-w-[900px] p-0 overflow-hidden flex flex-col"
          >
            {selectedType ? (
              <IntegrationConfigForm
                integrationType={selectedType}
                agents={agents}
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setSelectedType(null)}
                isLoading={createMutation.isPending}
                onClose={() => setIsCreateOpen(false)}
              />
            ) : (
              <>
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-r from-primary/5 via-primary/10 to-transparent">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <PlugZap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Add New Integration</h2>
                      <p className="text-sm text-muted-foreground">Connect your favorite apps and automate workflows</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search 50+ integrations..."
                      className="pl-11 h-11 bg-background/80 backdrop-blur-sm border-muted-foreground/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Integration Grid */}
                <ScrollArea className="flex-1 p-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {searchQuery ? 'Search Results' : 'Popular Integrations'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(searchQuery 
                        ? allIntegrations.filter(i => 
                            i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            i.description.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                        : popularIntegrations
                      ).map((int) => (
                        <Card
                          key={int.id}
                          className="group cursor-pointer border-2 border-transparent hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                          onClick={() => {
                            setIsCreateOpen(false);
                            openWorkspace(int);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${int.categoryColor} text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                                {int.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm group-hover:text-primary transition-colors">{int.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{int.description}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {!searchQuery && (
                    <div className="mt-8">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        All Categories
                      </h3>
                      {Object.entries(integrationCatalog).map(([key, category]) => (
                        <div key={key} className="mb-6">
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-md ${category.color} flex items-center justify-center`}>
                              <category.icon className="h-3.5 w-3.5 text-white" />
                            </div>
                            {category.label}
                            <Badge variant="secondary" className="text-xs">{category.integrations.length}</Badge>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {category.integrations.map((int: any) => (
                              <Card
                                key={int.id}
                                className="group cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                                onClick={() => {
                                  setIsCreateOpen(false);
                                  openWorkspace({
                                    ...int,
                                    categoryLabel: category.label,
                                    categoryColor: category.color,
                                  });
                                }}
                              >
                                <CardContent className="p-3 flex items-center gap-3">
                                  <span className="text-xl">{int.icon}</span>
                                  <span className="text-sm font-medium flex-1">{int.name}</span>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Logs Dialog */}
        <Dialog open={isLogsOpen} onOpenChange={setIsLogsOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Execution Logs - {selectedIntegration?.name}
              </DialogTitle>
              <DialogDescription>Recent execution history and status</DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[400px]">
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (logsData?.logs?.length || 0) === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No executions yet</p>
                  <p className="text-sm">Logs will appear when the integration is triggered</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logsData?.logs.map((log) => (
                    <Card key={log.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {log.status === 'success' ? (
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="h-4 w-4 text-red-600" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {triggerEvents.find(e => e.id === log.triggerEvent)?.icon}{' '}
                                {triggerEvents.find(e => e.id === log.triggerEvent)?.name || log.triggerEvent}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{log.executionTimeMs}ms</Badge>
                        </div>
                        {log.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                            {log.errorMessage}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// ============= COMPREHENSIVE INTEGRATION SYSTEM =============
// Each integration has: TRIGGERS (inbound), ACTIONS (outbound), and AI Instructions

interface IntegrationTrigger {
  id: string;
  name: string;
  icon: string;
  description: string;
  category?: string; // Optional category for grouping
  dataFields: string[]; // What data comes with this trigger
}

interface IntegrationAction {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: Array<{ 
    key: string; 
    label: string; 
    type: 'text' | 'textarea' | 'email' | 'number' | 'select' | 'password'; 
    placeholder?: string; 
    helpText?: string; 
    default?: string;
    options?: string[];
    required?: boolean;
  }>;
}

interface IntegrationConfig {
  triggers: IntegrationTrigger[];
  actions: IntegrationAction[];
  aiInstructions?: string; // Default AI behavior
}

const comprehensiveIntegrations: Record<string, IntegrationConfig> = {
  // ==================== COMMUNICATION ====================
  whatsapp: {
    triggers: [
      { id: 'message_received', name: 'Message Received', icon: '📩', description: 'When a WhatsApp message is received', dataFields: ['sender_phone', 'sender_name', 'message_text', 'message_type', 'timestamp', 'message_id', 'wa_id'] },
      { id: 'image_received', name: 'Image Received', icon: '🖼️', description: 'When image is received', dataFields: ['sender_phone', 'image_url', 'caption', 'media_id'] },
      { id: 'document_received', name: 'Document Received', icon: '📎', description: 'When document is received', dataFields: ['sender_phone', 'document_url', 'filename', 'media_id'] },
      { id: 'audio_received', name: 'Voice Note Received', icon: '🎤', description: 'When voice note is received', dataFields: ['sender_phone', 'audio_url', 'duration', 'media_id'] },
      { id: 'location_received', name: 'Location Received', icon: '📍', description: 'When location is shared', dataFields: ['sender_phone', 'latitude', 'longitude', 'address'] },
      { id: 'button_clicked', name: 'Button Clicked', icon: '🔘', description: 'When quick reply/button is clicked', dataFields: ['sender_phone', 'button_id', 'button_text', 'context'] },
      { id: 'list_item_selected', name: 'List Item Selected', icon: '📋', description: 'When list item is selected', dataFields: ['sender_phone', 'list_id', 'item_title', 'item_description'] },
      { id: 'message_read', name: 'Message Read', icon: '👁️', description: 'When your message is read', dataFields: ['recipient_phone', 'message_id', 'read_at'] },
      { id: 'message_delivered', name: 'Message Delivered', icon: '✅', description: 'When message is delivered', dataFields: ['recipient_phone', 'message_id', 'delivered_at'] },
      { id: 'message_failed', name: 'Message Failed', icon: '❌', description: 'When message fails to send', dataFields: ['recipient_phone', 'message_id', 'error_code', 'error_message'] },
    ],
    actions: [
      { id: 'send_message', name: 'Send Text Message', icon: '💬', description: 'Send a text message', fields: [
        { key: 'to', label: 'To Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true, helpText: 'Include country code e.g., +919876543210' },
        { key: 'message', label: 'Message Text', type: 'textarea', placeholder: 'Hello {{customer_name}}!\n\n{{ai_response}}\n\nThank you!', required: true },
        { key: 'previewUrl', label: 'Show Link Preview?', type: 'select', options: ['yes', 'no'], default: 'no' },
      ]},
      { id: 'reply_message', name: 'Reply to Message', icon: '↩️', description: 'Reply in context to a message', fields: [
        { key: 'to', label: 'To Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'replyToMessageId', label: 'Reply to Message ID', type: 'text', placeholder: '{{message_id}}', required: true, helpText: 'Quote the original message' },
        { key: 'message', label: 'Reply Text', type: 'textarea', placeholder: '{{ai_response}}', required: true },
      ]},
      { id: 'send_template', name: 'Send Template Message', icon: '📋', description: 'Send pre-approved template', fields: [
        { key: 'to', label: 'To Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'templateName', label: 'Template Name', type: 'text', placeholder: 'appointment_confirmation', required: true, helpText: 'Must be approved in Business Manager' },
        { key: 'languageCode', label: 'Language Code', type: 'text', placeholder: 'en', default: 'en' },
        { key: 'param1', label: 'Parameter 1 ({{1}})', type: 'text', placeholder: '{{customer_name}}' },
        { key: 'param2', label: 'Parameter 2 ({{2}})', type: 'text', placeholder: '{{date}}' },
        { key: 'param3', label: 'Parameter 3 ({{3}})', type: 'text', placeholder: '{{time}}' },
        { key: 'param4', label: 'Parameter 4 ({{4}})', type: 'text', placeholder: '{{location}}' },
      ]},
      { id: 'send_image', name: 'Send Image', icon: '🖼️', description: 'Send an image with caption', fields: [
        { key: 'to', label: 'To Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'imageUrl', label: 'Image URL', type: 'text', placeholder: 'https://example.com/image.jpg', required: true, helpText: 'Must be publicly accessible URL' },
        { key: 'caption', label: 'Caption', type: 'textarea', placeholder: 'Here is your requested image!\n{{ai_description}}' },
      ]},
      { id: 'send_document', name: 'Send Document', icon: '📎', description: 'Send a PDF or document', fields: [
        { key: 'to', label: 'To Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'documentUrl', label: 'Document URL', type: 'text', placeholder: 'https://example.com/file.pdf', required: true },
        { key: 'filename', label: 'File Name', type: 'text', placeholder: 'Invoice_{{order_id}}.pdf', required: true },
        { key: 'caption', label: 'Caption', type: 'textarea', placeholder: 'Please find attached your invoice.' },
      ]},
      { id: 'send_video', name: 'Send Video', icon: '🎬', description: 'Send a video with caption', fields: [
        { key: 'to', label: 'To Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'videoUrl', label: 'Video URL', type: 'text', placeholder: 'https://example.com/video.mp4', required: true },
        { key: 'caption', label: 'Caption', type: 'textarea', placeholder: 'Check out this video!' },
      ]},
      { id: 'send_audio', name: 'Send Audio', icon: '🎵', description: 'Send audio file', fields: [
        { key: 'to', label: 'To Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'audioUrl', label: 'Audio URL', type: 'text', placeholder: 'https://example.com/audio.mp3', required: true },
      ]},
      { id: 'send_location', name: 'Send Location', icon: '📍', description: 'Share a location', fields: [
        { key: 'to', label: 'To Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'latitude', label: 'Latitude', type: 'text', placeholder: '{{latitude}} or 12.9716', required: true },
        { key: 'longitude', label: 'Longitude', type: 'text', placeholder: '{{longitude}} or 77.5946', required: true },
        { key: 'name', label: 'Location Name', type: 'text', placeholder: '{{business_name}}' },
        { key: 'address', label: 'Address', type: 'text', placeholder: '{{full_address}}' },
      ]},
      { id: 'send_buttons', name: 'Send Quick Reply Buttons', icon: '🔘', description: 'Send message with up to 3 buttons', fields: [
        { key: 'to', label: 'To Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'bodyText', label: 'Message Body', type: 'textarea', placeholder: 'How would you like to proceed?', required: true },
        { key: 'headerText', label: 'Header (optional)', type: 'text', placeholder: 'Please choose' },
        { key: 'footerText', label: 'Footer (optional)', type: 'text', placeholder: 'Reply within 24 hours' },
        { key: 'button1', label: 'Button 1 Text', type: 'text', placeholder: 'Yes ✅', required: true },
        { key: 'button2', label: 'Button 2 Text', type: 'text', placeholder: 'No ❌' },
        { key: 'button3', label: 'Button 3 Text', type: 'text', placeholder: 'Maybe Later' },
      ]},
      { id: 'send_list', name: 'Send List Menu', icon: '📋', description: 'Send interactive list (max 10 items)', fields: [
        { key: 'to', label: 'To Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'bodyText', label: 'Message Body', type: 'textarea', placeholder: 'Please select an option from the menu below:', required: true },
        { key: 'buttonText', label: 'Menu Button Text', type: 'text', placeholder: 'View Options', required: true },
        { key: 'sections', label: 'Sections (JSON)', type: 'textarea', placeholder: '[\n  {\n    "title": "Services",\n    "rows": [\n      {"id": "svc1", "title": "Consultation", "description": "30 min call"},\n      {"id": "svc2", "title": "Support", "description": "Technical help"}\n    ]\n  }\n]', required: true },
      ]},
      { id: 'send_contact', name: 'Send Contact Card', icon: '👤', description: 'Share a contact', fields: [
        { key: 'to', label: 'To Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'contactName', label: 'Contact Name', type: 'text', placeholder: '{{agent_name}}', required: true },
        { key: 'contactPhone', label: 'Contact Phone', type: 'text', placeholder: '+919876543210', required: true },
        { key: 'contactEmail', label: 'Contact Email', type: 'text', placeholder: 'support@company.com' },
        { key: 'organization', label: 'Organization', type: 'text', placeholder: '{{company_name}}' },
      ]},
      { id: 'mark_read', name: 'Mark as Read', icon: '✅', description: 'Mark message as read (blue ticks)', fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
      ]},
      { id: 'react_to_message', name: 'React to Message', icon: '👍', description: 'Add emoji reaction', fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'emoji', label: 'Emoji', type: 'text', placeholder: '👍', required: true, helpText: 'Any emoji: 👍 ❤️ 😂 😮 😢 🙏' },
      ]},
      { id: 'get_media', name: 'Download Media', icon: '⬇️', description: 'Download received media file', fields: [
        { key: 'mediaId', label: 'Media ID', type: 'text', placeholder: '{{media_id}}', required: true },
        { key: 'saveTo', label: 'Save to', type: 'select', options: ['google_drive', 'local', 's3'], default: 'google_drive' },
        { key: 'filename', label: 'Save As', type: 'text', placeholder: '{{sender_phone}}_{{timestamp}}.jpg' },
      ]},
    ],
    aiInstructions: 'Respond professionally to customer inquiries. Be helpful and concise. Use emojis sparingly. Maintain context from previous messages.',
  },

  telegram: {
    triggers: [
      { id: 'message_received', name: 'Message Received', icon: '📩', description: 'When a Telegram message is received', dataFields: ['chat_id', 'sender_name', 'username', 'message_text', 'message_type', 'message_id'] },
      { id: 'photo_received', name: 'Photo Received', icon: '🖼️', description: 'When photo is received', dataFields: ['chat_id', 'photo_id', 'caption', 'sender_name'] },
      { id: 'document_received', name: 'Document Received', icon: '📎', description: 'When document is received', dataFields: ['chat_id', 'file_id', 'file_name', 'mime_type'] },
      { id: 'voice_received', name: 'Voice Message Received', icon: '🎤', description: 'When voice message is received', dataFields: ['chat_id', 'voice_id', 'duration', 'sender_name'] },
      { id: 'command_received', name: 'Command Received', icon: '⌨️', description: 'When a /command is received', dataFields: ['chat_id', 'command', 'arguments', 'sender_name'] },
      { id: 'callback_query', name: 'Button Clicked', icon: '🔘', description: 'When inline button is clicked', dataFields: ['chat_id', 'callback_data', 'message_id', 'user_id'] },
      { id: 'new_member', name: 'New Member Joined', icon: '👋', description: 'When new member joins group', dataFields: ['chat_id', 'user_id', 'username', 'first_name'] },
      { id: 'member_left', name: 'Member Left', icon: '🚪', description: 'When member leaves group', dataFields: ['chat_id', 'user_id', 'username'] },
    ],
    actions: [
      { id: 'send_message', name: 'Send Message', icon: '💬', description: 'Send text message', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}} or @channelname', required: true, helpText: 'User chat ID or @channel username' },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: '*Hello* {{customer_name}}!\n\n{{ai_response}}\n\n_Powered by AI_', required: true },
        { key: 'parseMode', label: 'Format', type: 'select', options: ['Markdown', 'MarkdownV2', 'HTML', 'None'], default: 'Markdown' },
        { key: 'disablePreview', label: 'Disable Link Preview', type: 'select', options: ['no', 'yes'], default: 'no' },
      ]},
      { id: 'reply_message', name: 'Reply to Message', icon: '↩️', description: 'Reply to a specific message', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'replyToMessageId', label: 'Reply to Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'message', label: 'Reply Text', type: 'textarea', placeholder: '{{ai_response}}', required: true },
        { key: 'parseMode', label: 'Format', type: 'select', options: ['Markdown', 'HTML', 'None'], default: 'Markdown' },
      ]},
      { id: 'send_photo', name: 'Send Photo', icon: '🖼️', description: 'Send an image', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'photoUrl', label: 'Photo URL', type: 'text', placeholder: 'https://example.com/image.jpg', required: true },
        { key: 'caption', label: 'Caption', type: 'textarea', placeholder: '📸 {{image_description}}' },
        { key: 'parseMode', label: 'Caption Format', type: 'select', options: ['Markdown', 'HTML', 'None'], default: 'Markdown' },
      ]},
      { id: 'send_document', name: 'Send Document', icon: '📎', description: 'Send a file', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'documentUrl', label: 'Document URL', type: 'text', placeholder: 'https://example.com/file.pdf', required: true },
        { key: 'filename', label: 'File Name', type: 'text', placeholder: '{{customer_name}}_invoice.pdf' },
        { key: 'caption', label: 'Caption', type: 'textarea', placeholder: '📄 Here is your document' },
      ]},
      { id: 'send_video', name: 'Send Video', icon: '🎬', description: 'Send a video', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'videoUrl', label: 'Video URL', type: 'text', placeholder: 'https://example.com/video.mp4', required: true },
        { key: 'caption', label: 'Caption', type: 'textarea', placeholder: '🎬 Check out this video!' },
      ]},
      { id: 'send_audio', name: 'Send Audio', icon: '🎵', description: 'Send audio file', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'audioUrl', label: 'Audio URL', type: 'text', placeholder: 'https://example.com/audio.mp3', required: true },
        { key: 'title', label: 'Track Title', type: 'text', placeholder: '{{audio_title}}' },
        { key: 'performer', label: 'Performer', type: 'text', placeholder: '{{artist_name}}' },
      ]},
      { id: 'send_location', name: 'Send Location', icon: '📍', description: 'Share a location', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'latitude', label: 'Latitude', type: 'text', placeholder: '{{latitude}}', required: true },
        { key: 'longitude', label: 'Longitude', type: 'text', placeholder: '{{longitude}}', required: true },
      ]},
      { id: 'send_venue', name: 'Send Venue', icon: '🏢', description: 'Share a venue/place', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'latitude', label: 'Latitude', type: 'text', placeholder: '{{latitude}}', required: true },
        { key: 'longitude', label: 'Longitude', type: 'text', placeholder: '{{longitude}}', required: true },
        { key: 'title', label: 'Venue Name', type: 'text', placeholder: '{{business_name}}', required: true },
        { key: 'address', label: 'Address', type: 'text', placeholder: '{{full_address}}', required: true },
      ]},
      { id: 'send_contact', name: 'Send Contact', icon: '👤', description: 'Share a contact', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'phoneNumber', label: 'Phone Number', type: 'text', placeholder: '+919876543210', required: true },
        { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{contact_name}}', required: true },
        { key: 'lastName', label: 'Last Name', type: 'text', placeholder: '' },
      ]},
      { id: 'send_buttons', name: 'Send Inline Buttons', icon: '🔘', description: 'Send message with clickable buttons', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Please choose an option:', required: true },
        { key: 'buttons', label: 'Buttons (JSON)', type: 'textarea', placeholder: '[\n  [{"text": "✅ Yes", "callback_data": "yes"}],\n  [{"text": "❌ No", "callback_data": "no"}],\n  [{"text": "🔗 Visit Website", "url": "https://example.com"}]\n]', required: true, helpText: 'Array of button rows. Each row is an array of buttons.' },
      ]},
      { id: 'send_keyboard', name: 'Send Reply Keyboard', icon: '⌨️', description: 'Send custom keyboard', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Choose from the keyboard below:', required: true },
        { key: 'keyboard', label: 'Keyboard (JSON)', type: 'textarea', placeholder: '[\n  ["Option 1", "Option 2"],\n  ["Option 3", "Option 4"],\n  ["Cancel"]\n]', required: true },
        { key: 'oneTime', label: 'One-time Keyboard', type: 'select', options: ['yes', 'no'], default: 'yes' },
        { key: 'resize', label: 'Resize Keyboard', type: 'select', options: ['yes', 'no'], default: 'yes' },
      ]},
      { id: 'remove_keyboard', name: 'Remove Keyboard', icon: '🗑️', description: 'Remove custom keyboard', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Keyboard removed.', required: true },
      ]},
      { id: 'edit_message', name: 'Edit Message', icon: '✏️', description: 'Edit a sent message', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'newText', label: 'New Text', type: 'textarea', placeholder: '{{updated_message}}', required: true },
        { key: 'parseMode', label: 'Format', type: 'select', options: ['Markdown', 'HTML', 'None'], default: 'Markdown' },
      ]},
      { id: 'delete_message', name: 'Delete Message', icon: '🗑️', description: 'Delete a message', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
      ]},
      { id: 'answer_callback', name: 'Answer Callback Query', icon: '✅', description: 'Answer inline button click', fields: [
        { key: 'callbackQueryId', label: 'Callback Query ID', type: 'text', placeholder: '{{callback_query_id}}', required: true },
        { key: 'text', label: 'Notification Text', type: 'text', placeholder: 'Processing...', helpText: 'Brief notification shown to user' },
        { key: 'showAlert', label: 'Show as Alert', type: 'select', options: ['no', 'yes'], default: 'no' },
      ]},
      { id: 'pin_message', name: 'Pin Message', icon: '📌', description: 'Pin a message in chat', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'notify', label: 'Send Notification', type: 'select', options: ['yes', 'no'], default: 'yes' },
      ]},
      { id: 'get_chat_info', name: 'Get Chat Info', icon: 'ℹ️', description: 'Get chat details', fields: [
        { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '{{chat_id}}', required: true },
      ]},
      { id: 'get_user_photos', name: 'Get User Profile Photos', icon: '📷', description: 'Get user profile pictures', fields: [
        { key: 'userId', label: 'User ID', type: 'text', placeholder: '{{user_id}}', required: true },
        { key: 'limit', label: 'Max Photos', type: 'number', placeholder: '1', default: '1' },
      ]},
    ],
    aiInstructions: 'Respond to Telegram users in a friendly manner. Use Markdown for formatting (*bold*, _italic_). Use emojis appropriately. For groups, be concise.',
  },

  slack: {
    triggers: [
      { id: 'message_received', name: 'Message Posted', icon: '📩', description: 'When a message is posted in channel', dataFields: ['channel', 'channel_name', 'user', 'user_name', 'text', 'timestamp', 'thread_ts'] },
      { id: 'message_in_thread', name: 'Thread Reply', icon: '💬', description: 'When someone replies in a thread', dataFields: ['channel', 'user', 'text', 'thread_ts', 'parent_message'] },
      { id: 'mention', name: 'Bot Mentioned', icon: '🔔', description: 'When your bot is @mentioned', dataFields: ['channel', 'user', 'text', 'timestamp'] },
      { id: 'reaction_added', name: 'Reaction Added', icon: '👍', description: 'When reaction is added to message', dataFields: ['channel', 'user', 'reaction', 'message_ts', 'item_user'] },
      { id: 'reaction_removed', name: 'Reaction Removed', icon: '👎', description: 'When reaction is removed', dataFields: ['channel', 'user', 'reaction', 'message_ts'] },
      { id: 'channel_created', name: 'Channel Created', icon: '📢', description: 'When new channel is created', dataFields: ['channel_id', 'channel_name', 'creator'] },
      { id: 'member_joined', name: 'Member Joined Channel', icon: '👋', description: 'When member joins channel', dataFields: ['channel', 'user', 'user_name'] },
      { id: 'file_shared', name: 'File Shared', icon: '📎', description: 'When file is shared', dataFields: ['channel', 'user', 'file_id', 'file_name', 'file_type'] },
      { id: 'app_home_opened', name: 'App Home Opened', icon: '🏠', description: 'When user opens app home', dataFields: ['user', 'user_name'] },
      { id: 'slash_command', name: 'Slash Command', icon: '⌨️', description: 'When slash command is used', dataFields: ['command', 'text', 'user', 'channel'] },
    ],
    actions: [
      { id: 'send_message', name: 'Send Message', icon: '💬', description: 'Post to channel', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general or C0123456789', required: true, helpText: 'Channel name with # or channel ID' },
        { key: 'message', label: 'Message (Slack Markdown)', type: 'textarea', placeholder: ':wave: Hello {{customer_name}}!\n\n{{ai_response}}\n\n_Sent via AI Agent_', required: true },
        { key: 'unfurlLinks', label: 'Unfurl Links', type: 'select', options: ['yes', 'no'], default: 'yes' },
        { key: 'unfurlMedia', label: 'Unfurl Media', type: 'select', options: ['yes', 'no'], default: 'yes' },
      ]},
      { id: 'send_dm', name: 'Send Direct Message', icon: '✉️', description: 'Send DM to user', fields: [
        { key: 'userId', label: 'User ID', type: 'text', placeholder: 'U0123456789 or {{user_id}}', required: true, helpText: 'Slack user ID (starts with U)' },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Hi there! {{ai_response}}', required: true },
      ]},
      { id: 'reply_thread', name: 'Reply in Thread', icon: '↩️', description: 'Reply to a thread', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '{{channel}}', required: true },
        { key: 'threadTs', label: 'Thread Timestamp', type: 'text', placeholder: '{{thread_ts}} or {{timestamp}}', required: true, helpText: 'The ts of the parent message' },
        { key: 'message', label: 'Reply Message', type: 'textarea', placeholder: '{{ai_response}}', required: true },
        { key: 'broadcast', label: 'Also Post to Channel', type: 'select', options: ['no', 'yes'], default: 'no' },
      ]},
      { id: 'send_blocks', name: 'Send Rich Message', icon: '🎨', description: 'Send formatted Block Kit message', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general', required: true },
        { key: 'blocks', label: 'Blocks (JSON)', type: 'textarea', placeholder: '[\n  {\n    "type": "section",\n    "text": {\n      "type": "mrkdwn",\n      "text": "*New Lead:* {{customer_name}}"\n    }\n  },\n  {\n    "type": "section",\n    "fields": [\n      {"type": "mrkdwn", "text": "*Email:*\\n{{customer_email}}"},\n      {"type": "mrkdwn", "text": "*Phone:*\\n{{customer_phone}}"}\n    ]\n  }\n]', required: true },
        { key: 'text', label: 'Fallback Text', type: 'text', placeholder: 'New lead from {{customer_name}}', helpText: 'Shown in notifications' },
      ]},
      { id: 'send_attachment', name: 'Send with Attachment', icon: '📎', description: 'Send message with attachment', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general', required: true },
        { key: 'text', label: 'Message Text', type: 'textarea', placeholder: 'Check out this update!' },
        { key: 'attachmentTitle', label: 'Attachment Title', type: 'text', placeholder: '{{title}}' },
        { key: 'attachmentText', label: 'Attachment Text', type: 'textarea', placeholder: '{{details}}' },
        { key: 'attachmentColor', label: 'Color', type: 'text', placeholder: '#36a64f', default: '#36a64f' },
        { key: 'attachmentFooter', label: 'Footer', type: 'text', placeholder: 'Via AI Agent' },
      ]},
      { id: 'update_message', name: 'Update Message', icon: '✏️', description: 'Edit an existing message', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '{{channel}}', required: true },
        { key: 'ts', label: 'Message Timestamp', type: 'text', placeholder: '{{timestamp}}', required: true },
        { key: 'message', label: 'New Message', type: 'textarea', placeholder: '{{updated_message}}', required: true },
      ]},
      { id: 'delete_message', name: 'Delete Message', icon: '🗑️', description: 'Delete a message', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '{{channel}}', required: true },
        { key: 'ts', label: 'Message Timestamp', type: 'text', placeholder: '{{timestamp}}', required: true },
      ]},
      { id: 'add_reaction', name: 'Add Reaction', icon: '👍', description: 'Add emoji reaction to message', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '{{channel}}', required: true },
        { key: 'timestamp', label: 'Message Timestamp', type: 'text', placeholder: '{{timestamp}}', required: true },
        { key: 'emoji', label: 'Emoji Name', type: 'text', placeholder: 'thumbsup', required: true, helpText: 'Emoji name without colons (e.g., thumbsup, heart, check)' },
      ]},
      { id: 'remove_reaction', name: 'Remove Reaction', icon: '➖', description: 'Remove emoji reaction', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '{{channel}}', required: true },
        { key: 'timestamp', label: 'Message Timestamp', type: 'text', placeholder: '{{timestamp}}', required: true },
        { key: 'emoji', label: 'Emoji Name', type: 'text', placeholder: 'thumbsup', required: true },
      ]},
      { id: 'upload_file', name: 'Upload File', icon: '📤', description: 'Upload file to channel', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general', required: true },
        { key: 'fileUrl', label: 'File URL', type: 'text', placeholder: '{{file_url}}', required: true },
        { key: 'filename', label: 'File Name', type: 'text', placeholder: 'report.pdf', required: true },
        { key: 'title', label: 'Title', type: 'text', placeholder: '{{document_title}}' },
        { key: 'initialComment', label: 'Comment', type: 'textarea', placeholder: 'Here is the report you requested.' },
      ]},
      { id: 'set_topic', name: 'Set Channel Topic', icon: '📝', description: 'Update channel topic', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general', required: true },
        { key: 'topic', label: 'New Topic', type: 'textarea', placeholder: '{{new_topic}}', required: true },
      ]},
      { id: 'invite_user', name: 'Invite User to Channel', icon: '➕', description: 'Add user to channel', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general', required: true },
        { key: 'userId', label: 'User ID', type: 'text', placeholder: '{{user_id}}', required: true },
      ]},
      { id: 'kick_user', name: 'Remove User from Channel', icon: '➖', description: 'Remove user from channel', fields: [
        { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general', required: true },
        { key: 'userId', label: 'User ID', type: 'text', placeholder: '{{user_id}}', required: true },
      ]},
      { id: 'get_user_info', name: 'Get User Info', icon: 'ℹ️', description: 'Get user details', fields: [
        { key: 'userId', label: 'User ID', type: 'text', placeholder: '{{user_id}}', required: true },
      ]},
      { id: 'list_channels', name: 'List Channels', icon: '📋', description: 'Get list of channels', fields: [
        { key: 'limit', label: 'Max Results', type: 'number', placeholder: '100', default: '100' },
        { key: 'types', label: 'Channel Types', type: 'text', placeholder: 'public_channel,private_channel', default: 'public_channel' },
      ]},
      { id: 'create_channel', name: 'Create Channel', icon: '➕', description: 'Create new channel', fields: [
        { key: 'name', label: 'Channel Name', type: 'text', placeholder: 'project-{{project_name}}', required: true, helpText: 'Lowercase, no spaces' },
        { key: 'isPrivate', label: 'Private Channel', type: 'select', options: ['no', 'yes'], default: 'no' },
      ]},
    ],
    aiInstructions: 'Use Slack mrkdwn formatting (*bold*, _italic_, ~strike~). Be professional but approachable. Use appropriate emojis. Keep messages scannable.',
  },

  discord: {
    triggers: [
      { id: 'message_received', name: 'Message Received', icon: '📩', description: 'When a message is posted', dataFields: ['channel_id', 'guild_id', 'author_id', 'author_name', 'content', 'message_id'] },
      { id: 'message_in_thread', name: 'Thread Message', icon: '💬', description: 'When message posted in thread', dataFields: ['channel_id', 'thread_id', 'author_id', 'content'] },
      { id: 'reaction_added', name: 'Reaction Added', icon: '👍', description: 'When reaction is added', dataFields: ['channel_id', 'user_id', 'emoji', 'message_id'] },
      { id: 'member_joined', name: 'Member Joined', icon: '👋', description: 'When new member joins server', dataFields: ['guild_id', 'user_id', 'user_name', 'joined_at'] },
      { id: 'member_left', name: 'Member Left', icon: '🚪', description: 'When member leaves server', dataFields: ['guild_id', 'user_id', 'user_name'] },
      { id: 'slash_command', name: 'Slash Command', icon: '⌨️', description: 'When slash command is used', dataFields: ['command', 'options', 'user_id', 'channel_id'] },
      { id: 'button_clicked', name: 'Button Clicked', icon: '🔘', description: 'When button is clicked', dataFields: ['custom_id', 'user_id', 'message_id'] },
      { id: 'select_menu_used', name: 'Select Menu Used', icon: '📋', description: 'When select menu option chosen', dataFields: ['custom_id', 'values', 'user_id'] },
    ],
    actions: [
      { id: 'send_message', name: 'Send Message', icon: '💬', description: 'Post to channel', fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true, helpText: 'Discord channel ID (numeric)' },
        { key: 'message', label: 'Message (Discord Markdown)', type: 'textarea', placeholder: '**Hello!** {{ai_response}}\n\n> Quote example\n```code block```', required: true },
        { key: 'tts', label: 'Text-to-Speech', type: 'select', options: ['no', 'yes'], default: 'no' },
      ]},
      { id: 'reply_message', name: 'Reply to Message', icon: '↩️', description: 'Reply to specific message', fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'messageId', label: 'Message ID to Reply', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'message', label: 'Reply', type: 'textarea', placeholder: '{{ai_response}}', required: true },
        { key: 'mentionAuthor', label: 'Mention Author', type: 'select', options: ['yes', 'no'], default: 'yes' },
      ]},
      { id: 'send_embed', name: 'Send Embed', icon: '🎨', description: 'Send rich embed message', fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'title', label: 'Embed Title', type: 'text', placeholder: '{{title}}' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: '**Name:** {{customer_name}}\n**Email:** {{customer_email}}\n**Message:**\n{{message}}' },
        { key: 'color', label: 'Color (decimal)', type: 'text', placeholder: '5814783', default: '5814783', helpText: 'Decimal color code (5814783 = Discord blue)' },
        { key: 'thumbnailUrl', label: 'Thumbnail URL', type: 'text', placeholder: '{{image_url}}' },
        { key: 'imageUrl', label: 'Image URL', type: 'text', placeholder: '{{image_url}}' },
        { key: 'footerText', label: 'Footer Text', type: 'text', placeholder: 'Powered by AI Agent' },
        { key: 'timestamp', label: 'Show Timestamp', type: 'select', options: ['yes', 'no'], default: 'no' },
      ]},
      { id: 'send_buttons', name: 'Send with Buttons', icon: '🔘', description: 'Send message with buttons', fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Choose an option:', required: true },
        { key: 'buttons', label: 'Buttons (JSON)', type: 'textarea', placeholder: '[\n  {"label": "Approve", "style": "success", "custom_id": "approve"},\n  {"label": "Reject", "style": "danger", "custom_id": "reject"},\n  {"label": "Website", "style": "link", "url": "https://example.com"}\n]', required: true, helpText: 'Styles: primary, secondary, success, danger, link' },
      ]},
      { id: 'send_select_menu', name: 'Send Select Menu', icon: '📋', description: 'Send dropdown menu', fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Select an option:', required: true },
        { key: 'placeholder', label: 'Placeholder', type: 'text', placeholder: 'Choose...', default: 'Choose an option' },
        { key: 'options', label: 'Options (JSON)', type: 'textarea', placeholder: '[\n  {"label": "Option 1", "value": "opt1", "description": "First option"},\n  {"label": "Option 2", "value": "opt2", "description": "Second option"}\n]', required: true },
      ]},
      { id: 'edit_message', name: 'Edit Message', icon: '✏️', description: 'Edit existing message', fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'newContent', label: 'New Content', type: 'textarea', placeholder: '{{updated_message}}', required: true },
      ]},
      { id: 'delete_message', name: 'Delete Message', icon: '🗑️', description: 'Delete a message', fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
      ]},
      { id: 'add_reaction', name: 'Add Reaction', icon: '👍', description: 'Add emoji reaction', fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'emoji', label: 'Emoji', type: 'text', placeholder: '👍 or custom:123456789', required: true },
      ]},
      { id: 'send_dm', name: 'Send DM', icon: '✉️', description: 'Send direct message to user', fields: [
        { key: 'userId', label: 'User ID', type: 'text', placeholder: '{{user_id}}', required: true },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: '{{ai_response}}', required: true },
      ]},
      { id: 'create_thread', name: 'Create Thread', icon: '🧵', description: 'Start a thread from message', fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'name', label: 'Thread Name', type: 'text', placeholder: 'Discussion: {{topic}}', required: true },
        { key: 'autoArchive', label: 'Auto Archive (minutes)', type: 'select', options: ['60', '1440', '4320', '10080'], default: '1440' },
      ]},
      { id: 'pin_message', name: 'Pin Message', icon: '📌', description: 'Pin a message', fields: [
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
      ]},
      { id: 'assign_role', name: 'Assign Role', icon: '🏷️', description: 'Assign role to member', fields: [
        { key: 'guildId', label: 'Server ID', type: 'text', placeholder: '{{guild_id}}', required: true },
        { key: 'userId', label: 'User ID', type: 'text', placeholder: '{{user_id}}', required: true },
        { key: 'roleId', label: 'Role ID', type: 'text', placeholder: '{{role_id}}', required: true },
      ]},
      { id: 'remove_role', name: 'Remove Role', icon: '🏷️', description: 'Remove role from member', fields: [
        { key: 'guildId', label: 'Server ID', type: 'text', placeholder: '{{guild_id}}', required: true },
        { key: 'userId', label: 'User ID', type: 'text', placeholder: '{{user_id}}', required: true },
        { key: 'roleId', label: 'Role ID', type: 'text', placeholder: '{{role_id}}', required: true },
      ]},
      { id: 'kick_member', name: 'Kick Member', icon: '🚪', description: 'Kick member from server', fields: [
        { key: 'guildId', label: 'Server ID', type: 'text', placeholder: '{{guild_id}}', required: true },
        { key: 'userId', label: 'User ID', type: 'text', placeholder: '{{user_id}}', required: true },
        { key: 'reason', label: 'Reason', type: 'text', placeholder: '{{kick_reason}}' },
      ]},
    ],
    aiInstructions: 'Use Discord markdown (**bold**, *italic*, __underline__, ~~strike~~, `code`, ```code block```). Keep responses concise. Use embeds for structured data.',
  },

  sms_twilio: {
    triggers: [
      { id: 'sms_received', name: 'SMS Received', icon: '📩', description: 'When an SMS is received', dataFields: ['from', 'to', 'body', 'timestamp', 'message_sid', 'num_media'] },
      { id: 'sms_with_media', name: 'MMS Received', icon: '🖼️', description: 'When MMS with media is received', dataFields: ['from', 'body', 'media_urls', 'media_types'] },
      { id: 'sms_status_update', name: 'SMS Status Update', icon: '📊', description: 'When SMS status changes', dataFields: ['message_sid', 'status', 'error_code', 'to'] },
      { id: 'call_received', name: 'Call Received', icon: '📞', description: 'When phone call is received', dataFields: ['from', 'to', 'call_sid', 'call_status'] },
    ],
    actions: [
      { id: 'send_sms', name: 'Send SMS', icon: '📱', description: 'Send text message', fields: [
        { key: 'to', label: 'To Phone', type: 'text', placeholder: '{{customer_phone}}', required: true, helpText: 'Include country code: +1234567890' },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Hi {{customer_name}}, {{ai_response}}', required: true },
        { key: 'statusCallback', label: 'Status Callback URL', type: 'text', placeholder: 'https://your-webhook.com/sms-status', helpText: 'Get delivery status updates' },
      ]},
      { id: 'send_mms', name: 'Send MMS', icon: '🖼️', description: 'Send with media', fields: [
        { key: 'to', label: 'To Phone', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Check this out! {{description}}' },
        { key: 'mediaUrl', label: 'Media URL', type: 'text', placeholder: 'https://example.com/image.jpg', required: true, helpText: 'Publicly accessible image/video URL' },
      ]},
      { id: 'send_whatsapp', name: 'Send WhatsApp (Twilio)', icon: '💬', description: 'Send via WhatsApp', fields: [
        { key: 'to', label: 'To Phone (WhatsApp)', type: 'text', placeholder: 'whatsapp:+{{customer_phone}}', required: true, helpText: 'Format: whatsapp:+1234567890' },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: '{{ai_response}}', required: true },
      ]},
      { id: 'make_call', name: 'Make Call', icon: '📞', description: 'Initiate phone call', fields: [
        { key: 'to', label: 'To Phone', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'twimlUrl', label: 'TwiML URL', type: 'text', placeholder: 'https://your-server.com/twiml', required: true, helpText: 'URL returning TwiML for call flow' },
        { key: 'statusCallback', label: 'Status Callback', type: 'text', placeholder: 'https://your-webhook.com/call-status' },
      ]},
      { id: 'send_verification', name: 'Send Verification Code', icon: '🔐', description: 'Send OTP via SMS', fields: [
        { key: 'to', label: 'To Phone', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'channel', label: 'Channel', type: 'select', options: ['sms', 'call', 'whatsapp'], default: 'sms' },
        { key: 'serviceSid', label: 'Verify Service SID', type: 'text', placeholder: 'VAxxxxxxxxxx', required: true },
      ]},
      { id: 'check_verification', name: 'Check Verification Code', icon: '✅', description: 'Verify OTP', fields: [
        { key: 'to', label: 'Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'code', label: 'Code', type: 'text', placeholder: '{{verification_code}}', required: true },
        { key: 'serviceSid', label: 'Verify Service SID', type: 'text', placeholder: 'VAxxxxxxxxxx', required: true },
      ]},
      { id: 'lookup_phone', name: 'Lookup Phone Number', icon: '🔍', description: 'Get phone number info', fields: [
        { key: 'phoneNumber', label: 'Phone Number', type: 'text', placeholder: '{{customer_phone}}', required: true },
        { key: 'type', label: 'Lookup Type', type: 'select', options: ['carrier', 'caller-name', 'line-type-intelligence'], default: 'carrier' },
      ]},
      { id: 'get_message', name: 'Get Message Details', icon: 'ℹ️', description: 'Get message info', fields: [
        { key: 'messageSid', label: 'Message SID', type: 'text', placeholder: '{{message_sid}}', required: true },
      ]},
    ],
    aiInstructions: 'Keep SMS under 160 characters when possible. For longer messages, use multiple segments wisely. Include opt-out info for marketing messages.',
  },

  microsoft_teams: {
    triggers: [
      { id: 'message_received', name: 'Message Received', icon: '📩', description: 'When message is posted', dataFields: ['channel', 'team_id', 'from', 'text', 'timestamp', 'message_id'] },
      { id: 'mention', name: 'Bot Mentioned', icon: '🔔', description: 'When bot is mentioned', dataFields: ['channel', 'team_id', 'from', 'text'] },
      { id: 'channel_created', name: 'Channel Created', icon: '📢', description: 'When new channel is created', dataFields: ['channel_id', 'channel_name', 'team_id'] },
      { id: 'member_added', name: 'Member Added', icon: '👋', description: 'When member joins team', dataFields: ['team_id', 'member_id', 'member_name'] },
      { id: 'member_removed', name: 'Member Removed', icon: '🚪', description: 'When member leaves team', dataFields: ['team_id', 'member_id'] },
      { id: 'file_consent', name: 'File Consent', icon: '📎', description: 'When user accepts file upload', dataFields: ['context', 'value'] },
      { id: 'task_module_fetch', name: 'Task Module Opened', icon: '📋', description: 'When task module is opened', dataFields: ['data', 'context'] },
      { id: 'card_action', name: 'Card Action', icon: '🎴', description: 'When adaptive card action triggered', dataFields: ['action_type', 'action_data', 'user'] },
    ],
    actions: [
      { id: 'send_message', name: 'Send Message', icon: '💬', description: 'Post to Teams channel', fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '{{team_id}}', required: true },
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: '**New Lead:** {{customer_name}}\n\n{{ai_response}}', required: true },
      ]},
      { id: 'reply_message', name: 'Reply to Message', icon: '↩️', description: 'Reply in thread', fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '{{team_id}}', required: true },
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'message', label: 'Reply', type: 'textarea', placeholder: '{{ai_response}}', required: true },
      ]},
      { id: 'send_card', name: 'Send Adaptive Card', icon: '🎨', description: 'Send rich card message', fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '{{team_id}}', required: true },
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'cardJson', label: 'Adaptive Card JSON', type: 'textarea', placeholder: '{\n  "type": "AdaptiveCard",\n  "body": [\n    {\n      "type": "TextBlock",\n      "text": "New Lead: {{customer_name}}",\n      "weight": "bolder",\n      "size": "large"\n    },\n    {\n      "type": "FactSet",\n      "facts": [\n        {"title": "Email:", "value": "{{customer_email}}"},\n        {"title": "Phone:", "value": "{{customer_phone}}"}\n      ]\n    }\n  ],\n  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",\n  "version": "1.4"\n}', required: true },
      ]},
      { id: 'send_dm', name: 'Send Direct Message', icon: '✉️', description: 'Send DM to user', fields: [
        { key: 'userId', label: 'User ID or Email', type: 'text', placeholder: '{{user_id}} or user@company.com', required: true },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Hi! {{ai_response}}', required: true },
      ]},
      { id: 'update_message', name: 'Update Message', icon: '✏️', description: 'Edit posted message', fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '{{team_id}}', required: true },
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'message', label: 'New Message', type: 'textarea', placeholder: '{{updated_content}}', required: true },
      ]},
      { id: 'delete_message', name: 'Delete Message', icon: '🗑️', description: 'Delete a message', fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '{{team_id}}', required: true },
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
      ]},
      { id: 'create_meeting', name: 'Schedule Meeting', icon: '📅', description: 'Create Teams meeting', fields: [
        { key: 'subject', label: 'Meeting Subject', type: 'text', placeholder: 'Call with {{customer_name}}', required: true },
        { key: 'startDateTime', label: 'Start Time (ISO)', type: 'text', placeholder: '2024-12-20T10:00:00', required: true },
        { key: 'endDateTime', label: 'End Time (ISO)', type: 'text', placeholder: '2024-12-20T10:30:00', required: true },
        { key: 'attendees', label: 'Attendee Emails', type: 'textarea', placeholder: '{{customer_email}}, team@company.com', helpText: 'Comma-separated emails' },
        { key: 'content', label: 'Meeting Notes', type: 'textarea', placeholder: 'Agenda:\n1. {{topic}}\n2. Q&A' },
      ]},
      { id: 'create_channel', name: 'Create Channel', icon: '➕', description: 'Create new channel', fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '{{team_id}}', required: true },
        { key: 'displayName', label: 'Channel Name', type: 'text', placeholder: '{{channel_name}}', required: true },
        { key: 'description', label: 'Description', type: 'text', placeholder: 'Channel for {{purpose}}' },
      ]},
      { id: 'add_member', name: 'Add Team Member', icon: '👤', description: 'Add user to team', fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '{{team_id}}', required: true },
        { key: 'userId', label: 'User ID or Email', type: 'text', placeholder: '{{user_email}}', required: true },
        { key: 'role', label: 'Role', type: 'select', options: ['member', 'owner'], default: 'member' },
      ]},
      { id: 'get_team_members', name: 'Get Team Members', icon: '👥', description: 'List team members', fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '{{team_id}}', required: true },
      ]},
      { id: 'upload_file', name: 'Upload File', icon: '📤', description: 'Upload file to channel', fields: [
        { key: 'teamId', label: 'Team ID', type: 'text', placeholder: '{{team_id}}', required: true },
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: '{{channel_id}}', required: true },
        { key: 'fileUrl', label: 'File URL', type: 'text', placeholder: '{{file_url}}', required: true },
        { key: 'fileName', label: 'File Name', type: 'text', placeholder: '{{file_name}}', required: true },
      ]},
    ],
    aiInstructions: 'Use Teams markdown formatting. Be professional and concise. For complex data, use Adaptive Cards.',
  },

  // ==================== EMAIL ====================
  gmail: {
    triggers: [
      { id: 'email_received', name: 'Email Received', icon: '📩', description: 'When new email arrives', dataFields: ['from', 'to', 'subject', 'body', 'body_html', 'attachments', 'date', 'thread_id', 'email_id'] },
      { id: 'email_from_specific', name: 'Email from Specific Sender', icon: '👤', description: 'When email from specific address arrives', dataFields: ['from', 'subject', 'body', 'date', 'thread_id'] },
      { id: 'email_with_subject', name: 'Email with Subject Match', icon: '🔍', description: 'When email subject contains keyword', dataFields: ['from', 'subject', 'body', 'date', 'thread_id'] },
      { id: 'email_with_attachment', name: 'Email with Attachment', icon: '📎', description: 'When email has attachments', dataFields: ['from', 'subject', 'attachments', 'date', 'thread_id'] },
      { id: 'email_labeled', name: 'Email Labeled', icon: '🏷️', description: 'When email gets a label', dataFields: ['email_id', 'label', 'subject'] },
      { id: 'email_starred', name: 'Email Starred', icon: '⭐', description: 'When email is starred', dataFields: ['email_id', 'subject', 'from'] },
    ],
    actions: [
      { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send new email', fields: [
        { key: 'to', label: 'To', type: 'email', placeholder: '{{customer_email}}', required: true, helpText: 'Recipient email address' },
        { key: 'cc', label: 'CC', type: 'text', placeholder: 'cc@example.com', helpText: 'Comma-separated for multiple' },
        { key: 'bcc', label: 'BCC', type: 'text', placeholder: 'bcc@example.com' },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Re: {{subject}}', required: true },
        { key: 'body', label: 'Email Body (HTML)', type: 'textarea', placeholder: '<p>Dear {{customer_name}},</p>\n<p>{{ai_response}}</p>\n<p>Best regards</p>', required: true },
        { key: 'attachmentUrl', label: 'Attachment URL (optional)', type: 'text', placeholder: '{{file_url}}', helpText: 'URL of file to attach' },
      ]},
      { id: 'reply_email', name: 'Reply to Email', icon: '↩️', description: 'Reply in same thread', fields: [
        { key: 'threadId', label: 'Thread ID', type: 'text', placeholder: '{{thread_id}}', required: true, helpText: 'From the trigger data' },
        { key: 'body', label: 'Reply Body (HTML)', type: 'textarea', placeholder: '<p>{{ai_response}}</p>', required: true },
      ]},
      { id: 'reply_all', name: 'Reply All', icon: '↩️👥', description: 'Reply to all recipients', fields: [
        { key: 'threadId', label: 'Thread ID', type: 'text', placeholder: '{{thread_id}}', required: true },
        { key: 'body', label: 'Reply Body', type: 'textarea', placeholder: '{{ai_response}}', required: true },
      ]},
      { id: 'forward_email', name: 'Forward Email', icon: '➡️', description: 'Forward to someone', fields: [
        { key: 'to', label: 'Forward To', type: 'email', placeholder: 'manager@company.com', required: true },
        { key: 'threadId', label: 'Thread ID', type: 'text', placeholder: '{{thread_id}}', required: true },
        { key: 'note', label: 'Forward Note', type: 'textarea', placeholder: 'FYI - {{ai_summary}}' },
      ]},
      { id: 'add_label', name: 'Add Label', icon: '🏷️', description: 'Add label to email', fields: [
        { key: 'emailId', label: 'Email ID', type: 'text', placeholder: '{{email_id}}', required: true },
        { key: 'label', label: 'Label Name', type: 'text', placeholder: 'Processed', required: true, helpText: 'Label will be created if it doesn\'t exist' },
      ]},
      { id: 'remove_label', name: 'Remove Label', icon: '🏷️❌', description: 'Remove label from email', fields: [
        { key: 'emailId', label: 'Email ID', type: 'text', placeholder: '{{email_id}}', required: true },
        { key: 'label', label: 'Label Name', type: 'text', placeholder: 'Inbox', required: true },
      ]},
      { id: 'create_draft', name: 'Create Draft', icon: '📝', description: 'Save as draft for review', fields: [
        { key: 'to', label: 'To', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: '{{subject}}', required: true },
        { key: 'body', label: 'Draft Body', type: 'textarea', placeholder: '{{ai_response}}', required: true },
      ]},
      { id: 'mark_read', name: 'Mark as Read', icon: '✅', description: 'Mark email as read', fields: [
        { key: 'emailId', label: 'Email ID', type: 'text', placeholder: '{{email_id}}', required: true },
      ]},
      { id: 'mark_unread', name: 'Mark as Unread', icon: '📬', description: 'Mark email as unread', fields: [
        { key: 'emailId', label: 'Email ID', type: 'text', placeholder: '{{email_id}}', required: true },
      ]},
      { id: 'star_email', name: 'Star Email', icon: '⭐', description: 'Add star to email', fields: [
        { key: 'emailId', label: 'Email ID', type: 'text', placeholder: '{{email_id}}', required: true },
      ]},
      { id: 'archive_email', name: 'Archive Email', icon: '📥', description: 'Archive email (remove from inbox)', fields: [
        { key: 'emailId', label: 'Email ID', type: 'text', placeholder: '{{email_id}}', required: true },
      ]},
      { id: 'trash_email', name: 'Move to Trash', icon: '🗑️', description: 'Send email to trash', fields: [
        { key: 'emailId', label: 'Email ID', type: 'text', placeholder: '{{email_id}}', required: true },
      ]},
      { id: 'search_emails', name: 'Search Emails', icon: '🔍', description: 'Search for emails', fields: [
        { key: 'query', label: 'Search Query', type: 'text', placeholder: 'from:{{customer_email}} subject:order', required: true, helpText: 'Gmail search syntax' },
        { key: 'maxResults', label: 'Max Results', type: 'number', placeholder: '10', default: '10' },
      ]},
      { id: 'get_email_content', name: 'Get Email Content', icon: '📄', description: 'Get full email content', fields: [
        { key: 'emailId', label: 'Email ID', type: 'text', placeholder: '{{email_id}}', required: true },
      ]},
      { id: 'download_attachment', name: 'Download Attachment', icon: '📎', description: 'Download email attachment', fields: [
        { key: 'emailId', label: 'Email ID', type: 'text', placeholder: '{{email_id}}', required: true },
        { key: 'attachmentIndex', label: 'Attachment Index', type: 'number', placeholder: '0', default: '0', helpText: '0 for first attachment' },
        { key: 'saveTo', label: 'Save Location', type: 'select', options: ['google_drive', 'local', 'dropbox'], default: 'google_drive' },
      ]},
    ],
    aiInstructions: 'Write professional emails. Match the tone of the incoming email. Include proper greeting and signature. When replying, reference the original context.',
  },

  outlook: {
    triggers: [
      { id: 'email_received', name: 'Email Received', icon: '📩', description: 'When new email arrives', dataFields: ['from', 'to', 'subject', 'body', 'body_html', 'date', 'conversation_id', 'message_id', 'has_attachments'] },
      { id: 'email_from_specific', name: 'Email from Sender', icon: '👤', description: 'When email from specific address', dataFields: ['from', 'subject', 'body', 'date', 'conversation_id'] },
      { id: 'email_with_attachment', name: 'Email with Attachment', icon: '📎', description: 'When email has attachments', dataFields: ['from', 'subject', 'attachments', 'date'] },
      { id: 'calendar_event', name: 'Calendar Event Created', icon: '📅', description: 'When calendar event is created', dataFields: ['event_id', 'title', 'start', 'end', 'attendees', 'organizer'] },
      { id: 'calendar_event_updated', name: 'Calendar Event Updated', icon: '✏️', description: 'When event is modified', dataFields: ['event_id', 'title', 'changes', 'updated_by'] },
      { id: 'meeting_invite', name: 'Meeting Invitation', icon: '📬', description: 'When meeting invite received', dataFields: ['event_id', 'title', 'organizer', 'start', 'end'] },
    ],
    actions: [
      { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send new email', fields: [
        { key: 'to', label: 'To', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'cc', label: 'CC', type: 'text', placeholder: 'cc1@example.com, cc2@example.com' },
        { key: 'bcc', label: 'BCC', type: 'text', placeholder: 'bcc@example.com' },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Re: {{subject}}', required: true },
        { key: 'body', label: 'Email Body', type: 'textarea', placeholder: '<p>Dear {{customer_name}},</p>\n<p>{{ai_response}}</p>\n<p>Best regards</p>', required: true },
        { key: 'importance', label: 'Importance', type: 'select', options: ['low', 'normal', 'high'], default: 'normal' },
      ]},
      { id: 'reply_email', name: 'Reply to Email', icon: '↩️', description: 'Reply to email in thread', fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'body', label: 'Reply', type: 'textarea', placeholder: '{{ai_response}}', required: true },
        { key: 'replyAll', label: 'Reply All', type: 'select', options: ['no', 'yes'], default: 'no' },
      ]},
      { id: 'forward_email', name: 'Forward Email', icon: '➡️', description: 'Forward email to someone', fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'to', label: 'Forward To', type: 'email', placeholder: 'colleague@company.com', required: true },
        { key: 'comment', label: 'Comment', type: 'textarea', placeholder: 'FYI - {{ai_summary}}' },
      ]},
      { id: 'create_draft', name: 'Create Draft', icon: '📝', description: 'Save as draft', fields: [
        { key: 'to', label: 'To', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: '{{subject}}', required: true },
        { key: 'body', label: 'Body', type: 'textarea', placeholder: '{{ai_response}}', required: true },
      ]},
      { id: 'move_email', name: 'Move Email', icon: '📁', description: 'Move to folder', fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'folder', label: 'Destination Folder', type: 'text', placeholder: 'Archive or folder path', required: true },
      ]},
      { id: 'flag_email', name: 'Flag Email', icon: '🚩', description: 'Add flag to email', fields: [
        { key: 'messageId', label: 'Message ID', type: 'text', placeholder: '{{message_id}}', required: true },
        { key: 'flagStatus', label: 'Flag Status', type: 'select', options: ['flagged', 'complete', 'notFlagged'], default: 'flagged' },
      ]},
      { id: 'create_event', name: 'Create Calendar Event', icon: '📅', description: 'Create meeting/event', fields: [
        { key: 'subject', label: 'Event Title', type: 'text', placeholder: 'Meeting with {{customer_name}}', required: true },
        { key: 'body', label: 'Description', type: 'textarea', placeholder: 'Agenda:\n1. {{topic}}\n2. Q&A' },
        { key: 'start', label: 'Start Time (ISO)', type: 'text', placeholder: '2024-01-15T10:00:00', required: true },
        { key: 'end', label: 'End Time (ISO)', type: 'text', placeholder: '2024-01-15T10:30:00', required: true },
        { key: 'attendees', label: 'Attendees', type: 'text', placeholder: '{{customer_email}}, team@company.com' },
        { key: 'location', label: 'Location', type: 'text', placeholder: '{{meeting_link}}' },
        { key: 'isOnlineMeeting', label: 'Online Meeting', type: 'select', options: ['yes', 'no'], default: 'yes' },
      ]},
      { id: 'update_event', name: 'Update Event', icon: '✏️', description: 'Modify calendar event', fields: [
        { key: 'eventId', label: 'Event ID', type: 'text', placeholder: '{{event_id}}', required: true },
        { key: 'subject', label: 'New Subject', type: 'text', placeholder: '{{updated_title}}' },
        { key: 'body', label: 'New Description', type: 'textarea', placeholder: '{{updated_description}}' },
        { key: 'start', label: 'New Start Time', type: 'text', placeholder: '2024-01-15T11:00:00' },
        { key: 'end', label: 'New End Time', type: 'text', placeholder: '2024-01-15T11:30:00' },
      ]},
      { id: 'cancel_event', name: 'Cancel Event', icon: '❌', description: 'Cancel calendar event', fields: [
        { key: 'eventId', label: 'Event ID', type: 'text', placeholder: '{{event_id}}', required: true },
        { key: 'comment', label: 'Cancellation Note', type: 'textarea', placeholder: 'This meeting has been cancelled due to...' },
      ]},
      { id: 'respond_invite', name: 'Respond to Invite', icon: '✅', description: 'Accept/decline meeting invite', fields: [
        { key: 'eventId', label: 'Event ID', type: 'text', placeholder: '{{event_id}}', required: true },
        { key: 'response', label: 'Response', type: 'select', options: ['accept', 'tentative', 'decline'], required: true },
        { key: 'comment', label: 'Response Note', type: 'textarea', placeholder: 'Optional message' },
      ]},
      { id: 'search_emails', name: 'Search Emails', icon: '🔍', description: 'Search mailbox', fields: [
        { key: 'query', label: 'Search Query', type: 'text', placeholder: 'from:{{customer_email}} subject:order', required: true, helpText: 'Outlook search query syntax' },
        { key: 'folder', label: 'Folder', type: 'text', placeholder: 'inbox', default: 'inbox' },
        { key: 'maxResults', label: 'Max Results', type: 'number', placeholder: '10', default: '10' },
      ]},
    ],
    aiInstructions: 'Write professional business emails. Be courteous and clear. Use proper email etiquette.',
  },

  smtp: {
    triggers: [], // SMTP is outbound only
    actions: [
      { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send via SMTP', fields: [
        { key: 'to', label: 'To', type: 'text', placeholder: '{{customer_email}}', required: true, helpText: 'Comma-separated for multiple' },
        { key: 'cc', label: 'CC', type: 'text', placeholder: 'cc@example.com' },
        { key: 'bcc', label: 'BCC', type: 'text', placeholder: 'bcc@example.com' },
        { key: 'replyTo', label: 'Reply-To', type: 'email', placeholder: 'support@company.com' },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Re: {{subject}}', required: true },
        { key: 'body', label: 'Email Body', type: 'textarea', placeholder: '{{ai_response}}', required: true },
        { key: 'isHtml', label: 'HTML Email', type: 'select', options: ['yes', 'no'], default: 'yes' },
        { key: 'fromName', label: 'From Name', type: 'text', placeholder: 'Your Company Name' },
      ]},
      { id: 'send_with_attachment', name: 'Send with Attachment', icon: '📎', description: 'Send email with file', fields: [
        { key: 'to', label: 'To', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: '{{subject}}', required: true },
        { key: 'body', label: 'Email Body', type: 'textarea', placeholder: '{{ai_response}}', required: true },
        { key: 'attachmentUrl', label: 'Attachment URL', type: 'text', placeholder: '{{file_url}}', required: true },
        { key: 'attachmentName', label: 'Attachment Name', type: 'text', placeholder: 'document.pdf' },
      ]},
      { id: 'send_template', name: 'Send Template', icon: '📋', description: 'Send using HTML template', fields: [
        { key: 'to', label: 'To', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: '{{subject}}', required: true },
        { key: 'templateHtml', label: 'HTML Template', type: 'textarea', placeholder: '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello {{customer_name}}</h1>\n  <p>{{ai_response}}</p>\n</body>\n</html>', required: true },
      ]},
    ],
    aiInstructions: 'Write clear and professional emails. Format properly for HTML when needed.',
  },

  sendgrid: {
    triggers: [
      { id: 'email_opened', name: 'Email Opened', icon: '👁️', description: 'When email is opened', dataFields: ['email', 'subject', 'opened_at', 'user_agent', 'ip'] },
      { id: 'email_clicked', name: 'Link Clicked', icon: '🔗', description: 'When link in email is clicked', dataFields: ['email', 'url', 'clicked_at'] },
      { id: 'email_bounced', name: 'Email Bounced', icon: '⚠️', description: 'When email bounces', dataFields: ['email', 'reason', 'bounce_type', 'timestamp'] },
      { id: 'email_delivered', name: 'Email Delivered', icon: '✅', description: 'When email is delivered', dataFields: ['email', 'subject', 'delivered_at'] },
      { id: 'email_dropped', name: 'Email Dropped', icon: '🚫', description: 'When email is dropped', dataFields: ['email', 'reason', 'timestamp'] },
      { id: 'unsubscribe', name: 'Unsubscribed', icon: '🚪', description: 'When user unsubscribes', dataFields: ['email', 'timestamp'] },
      { id: 'spam_report', name: 'Spam Report', icon: '⚠️', description: 'When marked as spam', dataFields: ['email', 'timestamp'] },
    ],
    actions: [
      { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send transactional email', fields: [
        { key: 'to', label: 'To', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'toName', label: 'Recipient Name', type: 'text', placeholder: '{{customer_name}}' },
        { key: 'cc', label: 'CC', type: 'text', placeholder: 'cc@example.com' },
        { key: 'bcc', label: 'BCC', type: 'text', placeholder: 'bcc@example.com' },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: '{{subject}}', required: true },
        { key: 'body', label: 'Email Body (HTML)', type: 'textarea', placeholder: '<p>Dear {{customer_name}},</p>\n<p>{{ai_response}}</p>', required: true },
        { key: 'category', label: 'Category', type: 'text', placeholder: 'transactional', helpText: 'For analytics grouping' },
      ]},
      { id: 'send_template', name: 'Send Template Email', icon: '📋', description: 'Use SendGrid template', fields: [
        { key: 'to', label: 'To', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'toName', label: 'Recipient Name', type: 'text', placeholder: '{{customer_name}}' },
        { key: 'templateId', label: 'Template ID', type: 'text', placeholder: 'd-xxxxxxxxxxxx', required: true, helpText: 'Dynamic template ID from SendGrid' },
        { key: 'dynamicData', label: 'Dynamic Data (JSON)', type: 'textarea', placeholder: '{\n  "name": "{{customer_name}}",\n  "order_id": "{{order_id}}",\n  "message": "{{ai_response}}"\n}', required: true },
      ]},
      { id: 'send_bulk', name: 'Send Bulk Email', icon: '📤', description: 'Send to multiple recipients', fields: [
        { key: 'recipients', label: 'Recipients (JSON array)', type: 'textarea', placeholder: '[\n  {"email": "user1@example.com", "name": "User 1"},\n  {"email": "user2@example.com", "name": "User 2"}\n]', required: true },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: '{{subject}}', required: true },
        { key: 'body', label: 'Email Body', type: 'textarea', placeholder: '{{ai_response}}', required: true },
      ]},
      { id: 'add_contact', name: 'Add Contact', icon: '👤', description: 'Add to contact list', fields: [
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{first_name}}' },
        { key: 'lastName', label: 'Last Name', type: 'text', placeholder: '{{last_name}}' },
        { key: 'listIds', label: 'List IDs', type: 'text', placeholder: 'list-id-1, list-id-2', helpText: 'Comma-separated list IDs' },
        { key: 'customFields', label: 'Custom Fields (JSON)', type: 'textarea', placeholder: '{"phone": "{{customer_phone}}", "company": "{{company}}"}' },
      ]},
      { id: 'remove_contact', name: 'Remove Contact', icon: '🗑️', description: 'Remove from list', fields: [
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'listIds', label: 'List IDs (optional)', type: 'text', placeholder: 'Leave empty to delete completely' },
      ]},
      { id: 'search_contacts', name: 'Search Contacts', icon: '🔍', description: 'Search contact database', fields: [
        { key: 'query', label: 'Search Query', type: 'text', placeholder: 'email LIKE \'%@company.com\' AND first_name=\'John\'', required: true, helpText: 'SGQL query syntax' },
      ]},
      { id: 'get_stats', name: 'Get Email Stats', icon: '📊', description: 'Get email statistics', fields: [
        { key: 'startDate', label: 'Start Date', type: 'text', placeholder: '2024-01-01', required: true },
        { key: 'endDate', label: 'End Date', type: 'text', placeholder: '2024-01-31' },
        { key: 'aggregatedBy', label: 'Aggregate By', type: 'select', options: ['day', 'week', 'month'], default: 'day' },
      ]},
    ],
    aiInstructions: 'Create engaging email content that drives opens and clicks. Use personalization tokens effectively.',
  },

  mailchimp: {
    triggers: [
      { id: 'subscriber_added', name: 'New Subscriber', icon: '👤', description: 'When someone subscribes', dataFields: ['email', 'first_name', 'last_name', 'list_id', 'subscribed_at', 'merge_fields'] },
      { id: 'subscriber_updated', name: 'Subscriber Updated', icon: '✏️', description: 'When subscriber info changes', dataFields: ['email', 'changed_fields', 'updated_at'] },
      { id: 'subscriber_unsubscribed', name: 'Unsubscribed', icon: '🚪', description: 'When someone unsubscribes', dataFields: ['email', 'reason', 'unsubscribed_at'] },
      { id: 'campaign_sent', name: 'Campaign Sent', icon: '📤', description: 'When campaign is sent', dataFields: ['campaign_id', 'subject', 'list_id', 'sent_at'] },
      { id: 'campaign_opened', name: 'Campaign Opened', icon: '👁️', description: 'When campaign is opened', dataFields: ['campaign_id', 'email', 'opened_at'] },
      { id: 'campaign_clicked', name: 'Link Clicked', icon: '🔗', description: 'When link is clicked', dataFields: ['campaign_id', 'email', 'url', 'clicked_at'] },
    ],
    actions: [
      { id: 'add_subscriber', name: 'Add Subscriber', icon: '👤', description: 'Add to mailing list', fields: [
        { key: 'listId', label: 'List/Audience ID', type: 'text', placeholder: 'Your list ID', required: true, helpText: 'Find in Audience > Settings > Audience ID' },
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{first_name}}' },
        { key: 'lastName', label: 'Last Name', type: 'text', placeholder: '{{last_name}}' },
        { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
        { key: 'status', label: 'Status', type: 'select', options: ['subscribed', 'pending', 'unsubscribed'], default: 'subscribed' },
        { key: 'tags', label: 'Tags', type: 'text', placeholder: 'lead, whatsapp, {{ai_category}}', helpText: 'Comma-separated' },
      ]},
      { id: 'update_subscriber', name: 'Update Subscriber', icon: '✏️', description: 'Update subscriber info', fields: [
        { key: 'listId', label: 'List ID', type: 'text', placeholder: 'Your list ID', required: true },
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'mergeFields', label: 'Merge Fields (JSON)', type: 'textarea', placeholder: '{\n  "FNAME": "{{customer_name}}",\n  "PHONE": "{{customer_phone}}",\n  "COMPANY": "{{company}}"\n}' },
      ]},
      { id: 'add_tag', name: 'Add Tag', icon: '🏷️', description: 'Add tag to subscriber', fields: [
        { key: 'listId', label: 'List ID', type: 'text', placeholder: 'Your list ID', required: true },
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'tags', label: 'Tags to Add', type: 'text', placeholder: '{{ai_category}}, qualified', required: true },
      ]},
      { id: 'remove_tag', name: 'Remove Tag', icon: '🏷️❌', description: 'Remove tag from subscriber', fields: [
        { key: 'listId', label: 'List ID', type: 'text', placeholder: 'Your list ID', required: true },
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'tags', label: 'Tags to Remove', type: 'text', placeholder: 'prospect', required: true },
      ]},
      { id: 'unsubscribe', name: 'Unsubscribe', icon: '🚪', description: 'Unsubscribe email', fields: [
        { key: 'listId', label: 'List ID', type: 'text', placeholder: 'Your list ID', required: true },
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
      ]},
      { id: 'archive_subscriber', name: 'Archive Subscriber', icon: '📦', description: 'Archive (soft delete)', fields: [
        { key: 'listId', label: 'List ID', type: 'text', placeholder: 'Your list ID', required: true },
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
      ]},
      { id: 'search_subscribers', name: 'Search Subscribers', icon: '🔍', description: 'Search in audience', fields: [
        { key: 'listId', label: 'List ID', type: 'text', placeholder: 'Your list ID', required: true },
        { key: 'query', label: 'Search Query', type: 'text', placeholder: '{{customer_email}} or name', required: true },
      ]},
      { id: 'get_subscriber', name: 'Get Subscriber Info', icon: 'ℹ️', description: 'Get subscriber details', fields: [
        { key: 'listId', label: 'List ID', type: 'text', placeholder: 'Your list ID', required: true },
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
      ]},
      { id: 'add_to_segment', name: 'Add to Segment', icon: '📊', description: 'Add to saved segment', fields: [
        { key: 'listId', label: 'List ID', type: 'text', placeholder: 'Your list ID', required: true },
        { key: 'segmentId', label: 'Segment ID', type: 'text', placeholder: 'segment_id', required: true },
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
      ]},
      { id: 'create_campaign', name: 'Create Campaign', icon: '📧', description: 'Create email campaign', fields: [
        { key: 'listId', label: 'List ID', type: 'text', placeholder: 'Your list ID', required: true },
        { key: 'subject', label: 'Subject Line', type: 'text', placeholder: '{{campaign_subject}}', required: true },
        { key: 'previewText', label: 'Preview Text', type: 'text', placeholder: 'Preview text shown in inbox' },
        { key: 'fromName', label: 'From Name', type: 'text', placeholder: 'Your Company', required: true },
        { key: 'replyTo', label: 'Reply-To Email', type: 'email', placeholder: 'reply@company.com', required: true },
      ]},
    ],
    aiInstructions: 'Categorize contacts appropriately. Use tags to segment based on conversation topics. Keep subscriber data updated.',
  },

  // ==================== GOOGLE SERVICES ====================
  google_sheets: {
    triggers: [
      { id: 'row_added', name: 'New Row Added', icon: '➕', description: 'When a new row is added to sheet', dataFields: ['row_number', 'row_data', 'sheet_name', 'timestamp'] },
      { id: 'row_updated', name: 'Row Updated', icon: '✏️', description: 'When a row is modified', dataFields: ['row_number', 'old_data', 'new_data', 'sheet_name'] },
      { id: 'row_deleted', name: 'Row Deleted', icon: '🗑️', description: 'When a row is deleted', dataFields: ['row_number', 'deleted_data', 'sheet_name', 'timestamp'] },
      { id: 'cell_changed', name: 'Cell Changed', icon: '📝', description: 'When specific cell changes', dataFields: ['cell', 'old_value', 'new_value', 'sheet_name'] },
      { id: 'sheet_created', name: 'New Sheet Created', icon: '📋', description: 'When a new worksheet is added', dataFields: ['sheet_name', 'sheet_id', 'created_by', 'timestamp'] },
      { id: 'specific_column_changed', name: 'Column Value Changed', icon: '📊', description: 'When a specific column value changes', dataFields: ['column', 'row_number', 'old_value', 'new_value', 'sheet_name'] },
    ],
    actions: [
      { id: 'append_row', name: 'Add Row', icon: '➕', description: 'Append a new row to sheet', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL: /d/[SPREADSHEET_ID]/edit', required: true, helpText: 'Copy from the Google Sheets URL between /d/ and /edit' },
        { key: 'sheetName', label: 'Sheet/Tab Name', type: 'text', placeholder: 'Sheet1', required: true, helpText: 'Name of the worksheet tab (bottom of spreadsheet)' },
        { key: 'values', label: 'Row Values (comma separated)', type: 'textarea', placeholder: '{{customer_name}}, {{customer_email}}, {{customer_phone}}, {{message}}, {{timestamp}}', required: true, helpText: 'Values will be added as columns A, B, C, D, E...' },
      ]},
      { id: 'update_row', name: 'Update Row', icon: '✏️', description: 'Update an existing row by row number', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL: /d/[SPREADSHEET_ID]/edit', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'rowNumber', label: 'Row Number', type: 'number', placeholder: '2', required: true, helpText: 'Row 1 is usually headers. Use {{row_number}} for dynamic.' },
        { key: 'values', label: 'New Values (comma separated)', type: 'textarea', placeholder: '{{customer_name}}, {{status}}, {{updated_at}}', required: true },
      ]},
      { id: 'update_cell', name: 'Update Cell', icon: '📝', description: 'Update a single cell', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL: /d/[SPREADSHEET_ID]/edit', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'cell', label: 'Cell Reference', type: 'text', placeholder: 'A2 or B5', required: true, helpText: 'Column letter + row number' },
        { key: 'value', label: 'New Value', type: 'text', placeholder: '{{customer_status}}', required: true },
      ]},
      { id: 'find_row', name: 'Find Row by Value', icon: '🔍', description: 'Search for a row containing a value', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'searchColumn', label: 'Column to Search', type: 'text', placeholder: 'A or B or Email', required: true, helpText: 'Column letter or header name' },
        { key: 'searchValue', label: 'Value to Find', type: 'text', placeholder: '{{customer_email}}', required: true },
        { key: 'returnColumns', label: 'Return Columns', type: 'text', placeholder: 'A:D or all', helpText: 'Which columns to return, e.g., A:D or "all"' },
      ]},
      { id: 'find_and_update', name: 'Find & Update Row', icon: '🔄', description: 'Find a row and update specific columns', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'searchColumn', label: 'Search Column', type: 'text', placeholder: 'A or Email', required: true },
        { key: 'searchValue', label: 'Search Value', type: 'text', placeholder: '{{customer_email}}', required: true },
        { key: 'updateColumn', label: 'Column to Update', type: 'text', placeholder: 'D or Status', required: true },
        { key: 'newValue', label: 'New Value', type: 'text', placeholder: '{{new_status}}', required: true },
      ]},
      { id: 'delete_row', name: 'Delete Row', icon: '🗑️', description: 'Delete a row by row number', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'rowNumber', label: 'Row Number', type: 'number', placeholder: '{{row_number}}', required: true, helpText: 'The row will be permanently deleted' },
      ]},
      { id: 'find_and_delete', name: 'Find & Delete Row', icon: '🔍🗑️', description: 'Find and delete a row by value', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'searchColumn', label: 'Search Column', type: 'text', placeholder: 'A or Email', required: true },
        { key: 'searchValue', label: 'Value to Match', type: 'text', placeholder: '{{customer_email}}', required: true },
        { key: 'deleteAll', label: 'Delete All Matches?', type: 'select', options: ['no', 'yes'], default: 'no', helpText: 'Delete first match only, or all matching rows' },
      ]},
      { id: 'get_values', name: 'Get Range Values', icon: '📊', description: 'Read a range of cells', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'range', label: 'Cell Range', type: 'text', placeholder: 'A1:D10', required: true, helpText: 'e.g., A1:D10, A:A (entire column), 1:1 (entire row)' },
      ]},
      { id: 'get_row', name: 'Get Specific Row', icon: '📄', description: 'Get data from a specific row', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'rowNumber', label: 'Row Number', type: 'number', placeholder: '2', required: true },
        { key: 'columns', label: 'Columns', type: 'text', placeholder: 'A:E or leave empty for all' },
      ]},
      { id: 'clear_range', name: 'Clear Range', icon: '🧹', description: 'Clear values in a range (keep formatting)', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'range', label: 'Range to Clear', type: 'text', placeholder: 'A2:D100', required: true, helpText: 'Clears content but keeps formatting' },
      ]},
      { id: 'create_sheet', name: 'Create New Sheet/Tab', icon: '📋', description: 'Add a new worksheet tab', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL', required: true },
        { key: 'sheetName', label: 'New Sheet Name', type: 'text', placeholder: '{{month}}_{{year}}_Data', required: true },
        { key: 'headers', label: 'Column Headers (optional)', type: 'textarea', placeholder: 'Name, Email, Phone, Date, Status', helpText: 'Comma-separated. Will be added as row 1.' },
      ]},
      { id: 'copy_sheet', name: 'Copy Sheet to Another', icon: '📑', description: 'Copy sheet to another spreadsheet', fields: [
        { key: 'sourceSpreadsheetId', label: 'Source Spreadsheet ID', type: 'text', required: true },
        { key: 'sourceSheetName', label: 'Source Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'destinationSpreadsheetId', label: 'Destination Spreadsheet ID', type: 'text', required: true },
      ]},
      { id: 'get_last_row', name: 'Get Last Row Number', icon: '⬇️', description: 'Get the last row with data', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'column', label: 'Column to Check', type: 'text', placeholder: 'A', helpText: 'Which column to check for last value' },
      ]},
      { id: 'count_rows', name: 'Count Rows', icon: '🔢', description: 'Count rows with data or matching criteria', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'filterColumn', label: 'Filter Column (optional)', type: 'text', placeholder: 'D or Status' },
        { key: 'filterValue', label: 'Filter Value (optional)', type: 'text', placeholder: 'active', helpText: 'Count only rows where column equals this value' },
      ]},
      { id: 'batch_update', name: 'Batch Update Multiple Cells', icon: '📝📝', description: 'Update multiple cells at once', fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: 'From URL', required: true },
        { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
        { key: 'updates', label: 'Updates (JSON)', type: 'textarea', placeholder: '[\n  {"cell": "A2", "value": "{{name}}"},\n  {"cell": "B2", "value": "{{email}}"},\n  {"cell": "C2", "value": "{{status}}"}\n]', required: true, helpText: 'JSON array of cell updates' },
      ]},
    ],
    aiInstructions: 'Log data accurately. Use consistent date/time formats. When searching, match exact values. For bulk operations, use batch methods.',
  },

  google_drive: {
    triggers: [
      { id: 'file_uploaded', name: 'File Uploaded', icon: '📤', description: 'When new file is uploaded', dataFields: ['file_id', 'file_name', 'file_type', 'folder_id', 'uploaded_by', 'size'] },
      { id: 'file_modified', name: 'File Modified', icon: '✏️', description: 'When file is modified', dataFields: ['file_id', 'file_name', 'modified_by', 'timestamp'] },
      { id: 'file_shared', name: 'File Shared', icon: '🔗', description: 'When file is shared', dataFields: ['file_id', 'file_name', 'shared_with', 'permission'] },
      { id: 'file_deleted', name: 'File Deleted', icon: '🗑️', description: 'When file is deleted', dataFields: ['file_id', 'file_name', 'deleted_by', 'timestamp'] },
      { id: 'folder_created', name: 'Folder Created', icon: '📁', description: 'When new folder is created', dataFields: ['folder_id', 'folder_name', 'parent_id', 'created_by'] },
      { id: 'comment_added', name: 'Comment Added', icon: '💬', description: 'When comment is added to file', dataFields: ['file_id', 'comment_text', 'author', 'timestamp'] },
    ],
    actions: [
      { id: 'upload_file', name: 'Upload File', icon: '📤', description: 'Upload file to Drive', fields: [
        { key: 'folderId', label: 'Folder ID', type: 'text', placeholder: 'Leave empty for root', helpText: 'Find in folder URL after /folders/' },
        { key: 'fileUrl', label: 'File URL', type: 'text', placeholder: '{{file_url}}', required: true, helpText: 'URL of file to upload' },
        { key: 'fileName', label: 'File Name', type: 'text', placeholder: '{{customer_name}}_document.pdf', required: true },
        { key: 'mimeType', label: 'File Type', type: 'select', options: ['auto-detect', 'application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/json'], default: 'auto-detect' },
      ]},
      { id: 'create_folder', name: 'Create Folder', icon: '📁', description: 'Create new folder', fields: [
        { key: 'folderName', label: 'Folder Name', type: 'text', placeholder: '{{customer_name}}_files', required: true },
        { key: 'parentFolderId', label: 'Parent Folder ID', type: 'text', placeholder: 'Leave empty for root' },
        { key: 'description', label: 'Description', type: 'text', placeholder: 'Files for {{customer_name}}' },
      ]},
      { id: 'share_file', name: 'Share File', icon: '🔗', description: 'Share file with someone', fields: [
        { key: 'fileId', label: 'File ID', type: 'text', placeholder: '{{file_id}}', required: true },
        { key: 'email', label: 'Share With Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'role', label: 'Permission', type: 'select', options: ['reader', 'commenter', 'writer'], default: 'reader' },
        { key: 'sendNotification', label: 'Send Notification', type: 'select', options: ['yes', 'no'], default: 'yes' },
        { key: 'message', label: 'Notification Message', type: 'textarea', placeholder: 'Here is the document we discussed.' },
      ]},
      { id: 'share_link', name: 'Create Share Link', icon: '🔗', description: 'Generate shareable link', fields: [
        { key: 'fileId', label: 'File ID', type: 'text', placeholder: '{{file_id}}', required: true },
        { key: 'access', label: 'Who Can Access', type: 'select', options: ['anyone', 'anyone_with_link', 'domain', 'private'], default: 'anyone_with_link' },
        { key: 'role', label: 'Permission', type: 'select', options: ['reader', 'commenter', 'writer'], default: 'reader' },
      ]},
      { id: 'move_file', name: 'Move File', icon: '📦', description: 'Move file to folder', fields: [
        { key: 'fileId', label: 'File ID', type: 'text', placeholder: '{{file_id}}', required: true },
        { key: 'destinationFolderId', label: 'Destination Folder ID', type: 'text', placeholder: 'folder_id', required: true },
      ]},
      { id: 'copy_file', name: 'Copy File', icon: '📋', description: 'Create a copy of file', fields: [
        { key: 'fileId', label: 'File ID', type: 'text', placeholder: '{{file_id}}', required: true },
        { key: 'newName', label: 'New File Name', type: 'text', placeholder: 'Copy of {{file_name}}' },
        { key: 'destinationFolderId', label: 'Destination Folder', type: 'text', placeholder: 'Optional - same folder if empty' },
      ]},
      { id: 'rename_file', name: 'Rename File', icon: '✏️', description: 'Rename file or folder', fields: [
        { key: 'fileId', label: 'File ID', type: 'text', placeholder: '{{file_id}}', required: true },
        { key: 'newName', label: 'New Name', type: 'text', placeholder: '{{new_name}}', required: true },
      ]},
      { id: 'delete_file', name: 'Delete File', icon: '🗑️', description: 'Move file to trash', fields: [
        { key: 'fileId', label: 'File ID', type: 'text', placeholder: '{{file_id}}', required: true },
        { key: 'permanent', label: 'Permanently Delete', type: 'select', options: ['no', 'yes'], default: 'no', helpText: 'Move to trash or delete forever' },
      ]},
      { id: 'search_files', name: 'Search Files', icon: '🔍', description: 'Search in Drive', fields: [
        { key: 'query', label: 'Search Query', type: 'text', placeholder: 'name contains "{{search_term}}"', required: true, helpText: 'Drive query syntax' },
        { key: 'folderId', label: 'Search in Folder', type: 'text', placeholder: 'Leave empty for all' },
        { key: 'maxResults', label: 'Max Results', type: 'number', placeholder: '10', default: '10' },
      ]},
      { id: 'get_file_info', name: 'Get File Info', icon: 'ℹ️', description: 'Get file metadata', fields: [
        { key: 'fileId', label: 'File ID', type: 'text', placeholder: '{{file_id}}', required: true },
      ]},
      { id: 'list_folder', name: 'List Folder Contents', icon: '📂', description: 'List files in folder', fields: [
        { key: 'folderId', label: 'Folder ID', type: 'text', placeholder: 'root for root folder', default: 'root' },
        { key: 'maxResults', label: 'Max Results', type: 'number', placeholder: '100', default: '100' },
      ]},
      { id: 'add_comment', name: 'Add Comment', icon: '💬', description: 'Add comment to file', fields: [
        { key: 'fileId', label: 'File ID', type: 'text', placeholder: '{{file_id}}', required: true },
        { key: 'comment', label: 'Comment', type: 'textarea', placeholder: '{{ai_comment}}', required: true },
      ]},
    ],
    aiInstructions: 'Organize files logically. Use descriptive names. Keep folder structures clean and intuitive.',
  },

  google_calendar: {
    triggers: [
      { id: 'event_created', name: 'Event Created', icon: '📅', description: 'When new event is created', dataFields: ['event_id', 'title', 'start_time', 'end_time', 'attendees', 'location', 'description'] },
      { id: 'event_updated', name: 'Event Updated', icon: '✏️', description: 'When event is modified', dataFields: ['event_id', 'title', 'changes', 'updated_by'] },
      { id: 'event_cancelled', name: 'Event Cancelled', icon: '❌', description: 'When event is cancelled', dataFields: ['event_id', 'title', 'cancelled_by', 'reason'] },
      { id: 'event_starting', name: 'Event Starting Soon', icon: '⏰', description: 'Minutes before event starts', dataFields: ['event_id', 'title', 'start_time', 'attendees', 'location'] },
      { id: 'rsvp_received', name: 'RSVP Received', icon: '✅', description: 'When attendee responds', dataFields: ['event_id', 'attendee_email', 'response', 'timestamp'] },
      { id: 'event_ended', name: 'Event Ended', icon: '🏁', description: 'When event ends', dataFields: ['event_id', 'title', 'end_time', 'attendees'] },
    ],
    actions: [
      { id: 'create_event', name: 'Create Event', icon: '📅', description: 'Schedule a new event', fields: [
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', default: 'primary', helpText: 'Use "primary" for main calendar' },
        { key: 'title', label: 'Event Title', type: 'text', placeholder: 'Meeting with {{customer_name}}', required: true },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Agenda:\n1. {{topic}}\n2. Follow-up items' },
        { key: 'startDateTime', label: 'Start Date & Time', type: 'text', placeholder: '2024-01-15T10:00:00', required: true, helpText: 'ISO format: YYYY-MM-DDTHH:MM:SS' },
        { key: 'endDateTime', label: 'End Date & Time', type: 'text', placeholder: '2024-01-15T10:30:00', required: true },
        { key: 'timezone', label: 'Timezone', type: 'text', placeholder: 'America/New_York', default: 'America/New_York' },
        { key: 'attendees', label: 'Attendee Emails', type: 'textarea', placeholder: '{{customer_email}}, team@company.com', helpText: 'Comma-separated' },
        { key: 'location', label: 'Location', type: 'text', placeholder: 'Zoom: {{meeting_link}}' },
        { key: 'sendNotifications', label: 'Send Invites', type: 'select', options: ['yes', 'no'], default: 'yes' },
        { key: 'conferenceType', label: 'Video Conference', type: 'select', options: ['none', 'hangoutsMeet', 'addOn'], default: 'none' },
      ]},
      { id: 'create_quick_event', name: 'Quick Add Event', icon: '⚡', description: 'Create event from text', fields: [
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', default: 'primary' },
        { key: 'text', label: 'Event Text', type: 'text', placeholder: 'Meeting with {{customer_name}} tomorrow at 3pm', required: true, helpText: 'Natural language like "Lunch tomorrow at noon"' },
      ]},
      { id: 'update_event', name: 'Update Event', icon: '✏️', description: 'Modify existing event', fields: [
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', default: 'primary' },
        { key: 'eventId', label: 'Event ID', type: 'text', placeholder: '{{event_id}}', required: true },
        { key: 'title', label: 'New Title', type: 'text', placeholder: '{{updated_title}}' },
        { key: 'description', label: 'New Description', type: 'textarea', placeholder: '{{updated_description}}' },
        { key: 'startDateTime', label: 'New Start Time', type: 'text', placeholder: '2024-01-15T11:00:00' },
        { key: 'endDateTime', label: 'New End Time', type: 'text', placeholder: '2024-01-15T11:30:00' },
        { key: 'location', label: 'New Location', type: 'text', placeholder: '{{new_location}}' },
      ]},
      { id: 'delete_event', name: 'Delete/Cancel Event', icon: '❌', description: 'Delete or cancel event', fields: [
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', default: 'primary' },
        { key: 'eventId', label: 'Event ID', type: 'text', placeholder: '{{event_id}}', required: true },
        { key: 'sendNotification', label: 'Notify Attendees', type: 'select', options: ['yes', 'no'], default: 'yes' },
      ]},
      { id: 'find_free_slot', name: 'Find Free Time', icon: '🔍', description: 'Find available time slots', fields: [
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', default: 'primary' },
        { key: 'durationMinutes', label: 'Duration (minutes)', type: 'number', placeholder: '30', required: true },
        { key: 'startDate', label: 'Search From', type: 'text', placeholder: '2024-01-15', required: true },
        { key: 'endDate', label: 'Search Until', type: 'text', placeholder: '2024-01-22' },
        { key: 'workingHoursStart', label: 'Working Hours Start', type: 'text', placeholder: '09:00', default: '09:00' },
        { key: 'workingHoursEnd', label: 'Working Hours End', type: 'text', placeholder: '17:00', default: '17:00' },
      ]},
      { id: 'list_events', name: 'List Events', icon: '📋', description: 'Get upcoming events', fields: [
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', default: 'primary' },
        { key: 'timeMin', label: 'From Date', type: 'text', placeholder: '2024-01-15T00:00:00' },
        { key: 'timeMax', label: 'To Date', type: 'text', placeholder: '2024-01-22T23:59:59' },
        { key: 'maxResults', label: 'Max Results', type: 'number', placeholder: '10', default: '10' },
        { key: 'searchQuery', label: 'Search Query', type: 'text', placeholder: '{{customer_name}}' },
      ]},
      { id: 'get_event', name: 'Get Event Details', icon: 'ℹ️', description: 'Get specific event info', fields: [
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', default: 'primary' },
        { key: 'eventId', label: 'Event ID', type: 'text', placeholder: '{{event_id}}', required: true },
      ]},
      { id: 'add_attendee', name: 'Add Attendee', icon: '👤', description: 'Add attendee to event', fields: [
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', default: 'primary' },
        { key: 'eventId', label: 'Event ID', type: 'text', placeholder: '{{event_id}}', required: true },
        { key: 'email', label: 'Attendee Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'optional', label: 'Optional Attendee', type: 'select', options: ['no', 'yes'], default: 'no' },
      ]},
      { id: 'remove_attendee', name: 'Remove Attendee', icon: '👤❌', description: 'Remove attendee from event', fields: [
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', default: 'primary' },
        { key: 'eventId', label: 'Event ID', type: 'text', placeholder: '{{event_id}}', required: true },
        { key: 'email', label: 'Attendee Email', type: 'email', placeholder: '{{customer_email}}', required: true },
      ]},
      { id: 'create_all_day', name: 'Create All-Day Event', icon: '📆', description: 'Create full-day event', fields: [
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', default: 'primary' },
        { key: 'title', label: 'Event Title', type: 'text', placeholder: '{{event_name}}', required: true },
        { key: 'date', label: 'Date', type: 'text', placeholder: '2024-01-15', required: true, helpText: 'Format: YYYY-MM-DD' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: '{{description}}' },
      ]},
      { id: 'set_reminder', name: 'Set Reminder', icon: '⏰', description: 'Add reminder to event', fields: [
        { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary', default: 'primary' },
        { key: 'eventId', label: 'Event ID', type: 'text', placeholder: '{{event_id}}', required: true },
        { key: 'method', label: 'Reminder Method', type: 'select', options: ['email', 'popup'], default: 'popup' },
        { key: 'minutesBefore', label: 'Minutes Before', type: 'number', placeholder: '30', required: true },
      ]},
    ],
    aiInstructions: 'Schedule meetings during business hours. Always include clear titles and descriptions. Check for conflicts before scheduling.',
  },

  google_docs: {
    triggers: [
      { id: 'doc_created', name: 'Document Created', icon: '📄', description: 'When new doc is created', dataFields: ['doc_id', 'title', 'created_by', 'timestamp'] },
      { id: 'doc_edited', name: 'Document Edited', icon: '✏️', description: 'When doc is modified', dataFields: ['doc_id', 'title', 'edited_by', 'changes'] },
      { id: 'comment_added', name: 'Comment Added', icon: '💬', description: 'When comment is added', dataFields: ['doc_id', 'comment_text', 'author', 'timestamp'] },
      { id: 'comment_resolved', name: 'Comment Resolved', icon: '✅', description: 'When comment is resolved', dataFields: ['doc_id', 'comment_text', 'resolved_by'] },
    ],
    actions: [
      { id: 'create_doc', name: 'Create Document', icon: '📄', description: 'Create new Google Doc', fields: [
        { key: 'title', label: 'Document Title', type: 'text', placeholder: '{{customer_name}} - Proposal', required: true },
        { key: 'content', label: 'Initial Content', type: 'textarea', placeholder: '# Welcome {{customer_name}}\n\n{{ai_generated_content}}' },
        { key: 'folderId', label: 'Folder ID', type: 'text', placeholder: 'Optional - folder to save in' },
      ]},
      { id: 'create_from_template', name: 'Create from Template', icon: '📋', description: 'Create doc from template', fields: [
        { key: 'templateId', label: 'Template Doc ID', type: 'text', placeholder: 'Template document ID', required: true },
        { key: 'newTitle', label: 'New Document Title', type: 'text', placeholder: '{{customer_name}} - {{template_name}}', required: true },
        { key: 'folderId', label: 'Destination Folder', type: 'text', placeholder: 'Leave empty for same folder' },
      ]},
      { id: 'append_text', name: 'Append Text', icon: '➕', description: 'Add text to end of doc', fields: [
        { key: 'docId', label: 'Document ID', type: 'text', placeholder: '{{doc_id}}', required: true },
        { key: 'text', label: 'Text to Append', type: 'textarea', placeholder: '\n\n## New Section\n{{ai_response}}', required: true },
      ]},
      { id: 'prepend_text', name: 'Prepend Text', icon: '⬆️', description: 'Add text to beginning', fields: [
        { key: 'docId', label: 'Document ID', type: 'text', placeholder: '{{doc_id}}', required: true },
        { key: 'text', label: 'Text to Prepend', type: 'textarea', placeholder: '# Document Title\n\n{{date}}\n\n', required: true },
      ]},
      { id: 'replace_text', name: 'Find & Replace', icon: '🔄', description: 'Find and replace text', fields: [
        { key: 'docId', label: 'Document ID', type: 'text', placeholder: '{{doc_id}}', required: true },
        { key: 'findText', label: 'Find Text', type: 'text', placeholder: '{{placeholder}}', required: true },
        { key: 'replaceWith', label: 'Replace With', type: 'text', placeholder: '{{customer_name}}', required: true },
        { key: 'matchCase', label: 'Match Case', type: 'select', options: ['no', 'yes'], default: 'no' },
      ]},
      { id: 'batch_replace', name: 'Batch Replace', icon: '🔄🔄', description: 'Replace multiple placeholders', fields: [
        { key: 'docId', label: 'Document ID', type: 'text', placeholder: '{{doc_id}}', required: true },
        { key: 'replacements', label: 'Replacements (JSON)', type: 'textarea', placeholder: '{\n  "{{customer_name}}": "John Doe",\n  "{{customer_email}}": "john@example.com",\n  "{{date}}": "January 15, 2024"\n}', required: true },
      ]},
      { id: 'get_content', name: 'Get Document Content', icon: '📖', description: 'Read document content', fields: [
        { key: 'docId', label: 'Document ID', type: 'text', placeholder: '{{doc_id}}', required: true },
        { key: 'format', label: 'Output Format', type: 'select', options: ['plain_text', 'html', 'markdown'], default: 'plain_text' },
      ]},
      { id: 'insert_image', name: 'Insert Image', icon: '🖼️', description: 'Add image to document', fields: [
        { key: 'docId', label: 'Document ID', type: 'text', placeholder: '{{doc_id}}', required: true },
        { key: 'imageUrl', label: 'Image URL', type: 'text', placeholder: '{{image_url}}', required: true },
        { key: 'position', label: 'Position', type: 'select', options: ['end', 'start', 'at_index'], default: 'end' },
        { key: 'index', label: 'Index (if at_index)', type: 'number', placeholder: '1' },
      ]},
      { id: 'insert_table', name: 'Insert Table', icon: '📊', description: 'Add table to document', fields: [
        { key: 'docId', label: 'Document ID', type: 'text', placeholder: '{{doc_id}}', required: true },
        { key: 'rows', label: 'Number of Rows', type: 'number', placeholder: '3', required: true },
        { key: 'columns', label: 'Number of Columns', type: 'number', placeholder: '3', required: true },
        { key: 'data', label: 'Table Data (JSON)', type: 'textarea', placeholder: '[["Header1", "Header2"], ["Row1Col1", "Row1Col2"]]' },
      ]},
      { id: 'add_comment', name: 'Add Comment', icon: '💬', description: 'Add comment to document', fields: [
        { key: 'docId', label: 'Document ID', type: 'text', placeholder: '{{doc_id}}', required: true },
        { key: 'comment', label: 'Comment Text', type: 'textarea', placeholder: '{{ai_feedback}}', required: true },
        { key: 'quotedText', label: 'Quote Text (optional)', type: 'text', placeholder: 'Text to attach comment to' },
      ]},
    ],
    aiInstructions: 'Generate professional document content. Use proper formatting and structure. Include all relevant placeholders.',
  },

  google_forms: {
    triggers: [
      { id: 'response_submitted', name: 'Form Response', icon: '📋', description: 'When form is submitted', dataFields: ['response_id', 'form_id', 'form_title', 'answers', 'respondent_email', 'timestamp'] },
    ],
    actions: [
      { id: 'get_responses', name: 'Get All Responses', icon: '📊', description: 'Retrieve form responses', fields: [
        { key: 'formId', label: 'Form ID', type: 'text', placeholder: 'Form ID from URL', required: true },
        { key: 'limit', label: 'Max Responses', type: 'number', placeholder: '100', default: '100' },
      ]},
      { id: 'get_response', name: 'Get Single Response', icon: '📄', description: 'Get specific response', fields: [
        { key: 'formId', label: 'Form ID', type: 'text', placeholder: 'Form ID', required: true },
        { key: 'responseId', label: 'Response ID', type: 'text', placeholder: '{{response_id}}', required: true },
      ]},
      { id: 'create_form', name: 'Create Form', icon: '📝', description: 'Create new form', fields: [
        { key: 'title', label: 'Form Title', type: 'text', placeholder: 'Customer Feedback - {{campaign}}', required: true },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Please share your feedback about {{topic}}' },
      ]},
      { id: 'add_question', name: 'Add Question', icon: '❓', description: 'Add question to form', fields: [
        { key: 'formId', label: 'Form ID', type: 'text', placeholder: 'Form ID', required: true },
        { key: 'title', label: 'Question Text', type: 'text', placeholder: 'How satisfied are you?', required: true },
        { key: 'type', label: 'Question Type', type: 'select', options: ['short_answer', 'paragraph', 'multiple_choice', 'checkbox', 'dropdown', 'linear_scale'], required: true },
        { key: 'required', label: 'Required', type: 'select', options: ['yes', 'no'], default: 'no' },
        { key: 'options', label: 'Options (for choice questions)', type: 'textarea', placeholder: 'Very satisfied\nSatisfied\nNeutral\nDissatisfied', helpText: 'One option per line' },
      ]},
      { id: 'update_form_settings', name: 'Update Settings', icon: '⚙️', description: 'Update form settings', fields: [
        { key: 'formId', label: 'Form ID', type: 'text', placeholder: 'Form ID', required: true },
        { key: 'collectEmail', label: 'Collect Emails', type: 'select', options: ['yes', 'no'], default: 'no' },
        { key: 'limitResponses', label: 'Limit to 1 Response', type: 'select', options: ['yes', 'no'], default: 'no' },
        { key: 'confirmationMessage', label: 'Confirmation Message', type: 'textarea', placeholder: 'Thank you for your response!' },
      ]},
    ],
    aiInstructions: 'Process form responses and extract relevant information. Categorize responses appropriately.',
  },

  // ==================== MICROSOFT SERVICES ====================
  outlook_calendar: {
    triggers: [
      { id: 'event_created', name: 'Event Created', icon: '📅', description: 'When new event is created', dataFields: ['event_id', 'subject', 'start', 'end', 'organizer', 'attendees'] },
      { id: 'event_updated', name: 'Event Updated', icon: '✏️', description: 'When event is modified', dataFields: ['event_id', 'subject', 'changes'] },
      { id: 'event_cancelled', name: 'Event Cancelled', icon: '❌', description: 'When event is cancelled', dataFields: ['event_id', 'subject', 'cancelled_by'] },
    ],
    actions: [
      { id: 'create_event', name: 'Create Event', icon: '📅', description: 'Schedule Outlook event', fields: [
        { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Meeting: {{customer_name}}', required: true },
        { key: 'body', label: 'Description', type: 'textarea', placeholder: 'Agenda: {{topic}}' },
        { key: 'start', label: 'Start DateTime', type: 'text', placeholder: '2024-01-15T10:00:00', required: true },
        { key: 'end', label: 'End DateTime', type: 'text', placeholder: '2024-01-15T10:30:00', required: true },
        { key: 'attendees', label: 'Attendees', type: 'text', placeholder: '{{customer_email}}' },
      ]},
      { id: 'update_event', name: 'Update Event', icon: '✏️', description: 'Modify event', fields: [
        { key: 'eventId', label: 'Event ID', type: 'text', placeholder: '{{event_id}}', required: true },
        { key: 'subject', label: 'New Subject', type: 'text', placeholder: '{{updated_subject}}' },
        { key: 'body', label: 'New Description', type: 'textarea', placeholder: '{{updated_description}}' },
      ]},
    ],
    aiInstructions: 'Schedule within business hours. Include clear meeting objectives.',
  },

  onedrive: {
    triggers: [
      { id: 'file_created', name: 'File Created', icon: '📄', description: 'When new file is uploaded', dataFields: ['file_id', 'name', 'path', 'created_by', 'size'] },
      { id: 'file_modified', name: 'File Modified', icon: '✏️', description: 'When file is changed', dataFields: ['file_id', 'name', 'modified_by', 'timestamp'] },
      { id: 'file_shared', name: 'File Shared', icon: '🔗', description: 'When file is shared', dataFields: ['file_id', 'name', 'shared_with', 'permission'] },
    ],
    actions: [
      { id: 'upload_file', name: 'Upload File', icon: '📤', description: 'Upload to OneDrive', fields: [
        { key: 'folderPath', label: 'Folder Path', type: 'text', placeholder: '/Documents/{{customer_name}}' },
        { key: 'fileUrl', label: 'File URL', type: 'text', placeholder: '{{file_url}}', required: true },
        { key: 'fileName', label: 'File Name', type: 'text', placeholder: '{{document_name}}.pdf', required: true },
      ]},
      { id: 'create_folder', name: 'Create Folder', icon: '📁', description: 'Create new folder', fields: [
        { key: 'folderPath', label: 'Folder Path', type: 'text', placeholder: '/Projects/{{project_name}}', required: true },
      ]},
      { id: 'share_file', name: 'Share File', icon: '🔗', description: 'Share with user', fields: [
        { key: 'fileId', label: 'File ID', type: 'text', placeholder: '{{file_id}}', required: true },
        { key: 'email', label: 'Share With', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'permission', label: 'Permission', type: 'select', options: ['view', 'edit'], default: 'view' },
      ]},
      { id: 'get_share_link', name: 'Get Share Link', icon: '🔗', description: 'Generate shareable link', fields: [
        { key: 'fileId', label: 'File ID', type: 'text', placeholder: '{{file_id}}', required: true },
        { key: 'type', label: 'Link Type', type: 'select', options: ['view', 'edit'], default: 'view' },
      ]},
    ],
    aiInstructions: 'Organize files in logical folder structures. Use descriptive names.',
  },

  // ==================== CRM & SALES ====================
  hubspot: {
    triggers: [
      { id: 'contact_created', name: 'Contact Created', icon: '👤', description: 'When new contact is added', dataFields: ['contact_id', 'email', 'firstname', 'lastname', 'phone', 'company', 'created_at'] },
      { id: 'contact_updated', name: 'Contact Updated', icon: '✏️', description: 'When contact is modified', dataFields: ['contact_id', 'email', 'changed_properties', 'updated_at'] },
      { id: 'deal_created', name: 'Deal Created', icon: '💰', description: 'When new deal is created', dataFields: ['deal_id', 'deal_name', 'amount', 'stage', 'contact_id', 'created_at'] },
      { id: 'deal_stage_changed', name: 'Deal Stage Changed', icon: '📊', description: 'When deal moves to new stage', dataFields: ['deal_id', 'deal_name', 'old_stage', 'new_stage', 'amount'] },
      { id: 'deal_won', name: 'Deal Won', icon: '🏆', description: 'When deal is marked as won', dataFields: ['deal_id', 'deal_name', 'amount', 'contact_id'] },
      { id: 'deal_lost', name: 'Deal Lost', icon: '❌', description: 'When deal is marked as lost', dataFields: ['deal_id', 'deal_name', 'reason', 'contact_id'] },
      { id: 'form_submitted', name: 'Form Submitted', icon: '📋', description: 'When HubSpot form is submitted', dataFields: ['form_id', 'form_name', 'submission_data', 'contact_email'] },
      { id: 'ticket_created', name: 'Ticket Created', icon: '🎫', description: 'When support ticket is created', dataFields: ['ticket_id', 'subject', 'priority', 'contact_id', 'created_at'] },
    ],
    actions: [
      { id: 'create_contact', name: 'Create Contact', icon: '👤', description: 'Add new contact', fields: [
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'firstname', label: 'First Name', type: 'text', placeholder: '{{customer_name}}' },
        { key: 'lastname', label: 'Last Name', type: 'text', placeholder: '' },
        { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
        { key: 'company', label: 'Company', type: 'text', placeholder: '{{company_name}}' },
        { key: 'lifecyclestage', label: 'Lifecycle Stage', type: 'select', options: ['subscriber', 'lead', 'marketingqualifiedlead', 'salesqualifiedlead', 'opportunity', 'customer'], default: 'lead' },
      ]},
      { id: 'update_contact', name: 'Update Contact', icon: '✏️', description: 'Update existing contact', fields: [
        { key: 'email', label: 'Contact Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'properties', label: 'Properties (JSON)', type: 'textarea', placeholder: '{"phone": "{{phone}}", "lifecyclestage": "customer"}' },
      ]},
      { id: 'create_deal', name: 'Create Deal', icon: '💰', description: 'Create new deal', fields: [
        { key: 'dealname', label: 'Deal Name', type: 'text', placeholder: '{{customer_name}} - {{product}}', required: true },
        { key: 'amount', label: 'Amount', type: 'number', placeholder: '{{deal_amount}}' },
        { key: 'dealstage', label: 'Deal Stage', type: 'text', placeholder: 'appointmentscheduled', default: 'appointmentscheduled' },
        { key: 'contactEmail', label: 'Associate Contact Email', type: 'email', placeholder: '{{customer_email}}' },
      ]},
      { id: 'update_deal_stage', name: 'Update Deal Stage', icon: '📊', description: 'Move deal to new stage', fields: [
        { key: 'dealId', label: 'Deal ID', type: 'text', placeholder: '{{deal_id}}', required: true },
        { key: 'dealstage', label: 'New Stage', type: 'text', placeholder: 'closedwon', required: true },
      ]},
      { id: 'add_note', name: 'Add Note', icon: '📝', description: 'Add note to contact/deal', fields: [
        { key: 'contactEmail', label: 'Contact Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'note', label: 'Note Content', type: 'textarea', placeholder: 'Call summary: {{ai_summary}}', required: true },
      ]},
      { id: 'create_ticket', name: 'Create Ticket', icon: '🎫', description: 'Create support ticket', fields: [
        { key: 'subject', label: 'Subject', type: 'text', placeholder: '{{issue_summary}}', required: true },
        { key: 'content', label: 'Description', type: 'textarea', placeholder: '{{customer_message}}', required: true },
        { key: 'priority', label: 'Priority', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
        { key: 'contactEmail', label: 'Contact Email', type: 'email', placeholder: '{{customer_email}}' },
      ]},
    ],
    aiInstructions: 'Qualify leads based on conversation. Update lifecycle stages appropriately. Add detailed notes after interactions.',
  },

  salesforce: {
    triggers: [
      { id: 'lead_created', name: 'Lead Created', icon: '👤', description: 'When new lead is added', dataFields: ['lead_id', 'email', 'name', 'company', 'phone', 'source', 'created_at'] },
      { id: 'lead_converted', name: 'Lead Converted', icon: '🔄', description: 'When lead converts to contact', dataFields: ['lead_id', 'contact_id', 'account_id', 'opportunity_id'] },
      { id: 'opportunity_created', name: 'Opportunity Created', icon: '💰', description: 'When new opportunity is created', dataFields: ['opportunity_id', 'name', 'amount', 'stage', 'account_id'] },
      { id: 'opportunity_stage_changed', name: 'Opportunity Stage Changed', icon: '📊', description: 'When opportunity moves stages', dataFields: ['opportunity_id', 'name', 'old_stage', 'new_stage', 'amount'] },
      { id: 'opportunity_closed_won', name: 'Opportunity Won', icon: '🏆', description: 'When opportunity is won', dataFields: ['opportunity_id', 'name', 'amount', 'account_id'] },
      { id: 'case_created', name: 'Case Created', icon: '🎫', description: 'When support case is created', dataFields: ['case_id', 'subject', 'priority', 'contact_id', 'account_id'] },
    ],
    actions: [
      { id: 'create_lead', name: 'Create Lead', icon: '👤', description: 'Create new lead', fields: [
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{first_name}}' },
        { key: 'lastName', label: 'Last Name', type: 'text', placeholder: '{{last_name}}', required: true },
        { key: 'company', label: 'Company', type: 'text', placeholder: '{{company_name}}', required: true },
        { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
        { key: 'leadSource', label: 'Lead Source', type: 'text', placeholder: 'WhatsApp Bot', default: 'WhatsApp Bot' },
      ]},
      { id: 'update_lead', name: 'Update Lead', icon: '✏️', description: 'Update existing lead', fields: [
        { key: 'leadId', label: 'Lead ID', type: 'text', placeholder: '{{lead_id}}', required: true },
        { key: 'fields', label: 'Fields (JSON)', type: 'textarea', placeholder: '{"Status": "Contacted", "Rating": "Hot"}' },
      ]},
      { id: 'create_opportunity', name: 'Create Opportunity', icon: '💰', description: 'Create new opportunity', fields: [
        { key: 'name', label: 'Opportunity Name', type: 'text', placeholder: '{{customer_name}} - {{product}}', required: true },
        { key: 'amount', label: 'Amount', type: 'number', placeholder: '{{deal_amount}}' },
        { key: 'stageName', label: 'Stage', type: 'text', placeholder: 'Prospecting', default: 'Prospecting' },
        { key: 'closeDate', label: 'Close Date', type: 'text', placeholder: '{{expected_close_date}}', required: true },
        { key: 'accountId', label: 'Account ID', type: 'text', placeholder: '{{account_id}}' },
      ]},
      { id: 'create_task', name: 'Create Task', icon: '✅', description: 'Create follow-up task', fields: [
        { key: 'subject', label: 'Task Subject', type: 'text', placeholder: 'Follow up: {{customer_name}}', required: true },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: '{{ai_generated_task}}' },
        { key: 'dueDate', label: 'Due Date', type: 'text', placeholder: '{{due_date}}', required: true },
        { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Normal', 'Low'], default: 'Normal' },
        { key: 'whoId', label: 'Related To (Contact/Lead ID)', type: 'text', placeholder: '{{contact_id}}' },
      ]},
      { id: 'create_case', name: 'Create Case', icon: '🎫', description: 'Create support case', fields: [
        { key: 'subject', label: 'Subject', type: 'text', placeholder: '{{issue_summary}}', required: true },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: '{{customer_message}}', required: true },
        { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'], default: 'Medium' },
        { key: 'origin', label: 'Case Origin', type: 'text', placeholder: 'WhatsApp', default: 'WhatsApp' },
      ]},
    ],
    aiInstructions: 'Qualify leads and update status. Create tasks for follow-ups. Log all interactions.',
  },

  pipedrive: {
    triggers: [
      { id: 'person_created', name: 'Person Created', icon: '👤', description: 'When new person is added', dataFields: ['person_id', 'name', 'email', 'phone', 'org_id', 'created_at'] },
      { id: 'deal_created', name: 'Deal Created', icon: '💰', description: 'When new deal is created', dataFields: ['deal_id', 'title', 'value', 'stage_id', 'person_id', 'org_id'] },
      { id: 'deal_stage_changed', name: 'Deal Stage Changed', icon: '📊', description: 'When deal moves stages', dataFields: ['deal_id', 'title', 'old_stage', 'new_stage', 'value'] },
      { id: 'deal_won', name: 'Deal Won', icon: '🏆', description: 'When deal is won', dataFields: ['deal_id', 'title', 'value', 'person_id'] },
      { id: 'deal_lost', name: 'Deal Lost', icon: '❌', description: 'When deal is lost', dataFields: ['deal_id', 'title', 'lost_reason'] },
      { id: 'activity_completed', name: 'Activity Completed', icon: '✅', description: 'When activity is marked done', dataFields: ['activity_id', 'type', 'subject', 'deal_id', 'person_id'] },
    ],
    actions: [
      { id: 'create_person', name: 'Create Person', icon: '👤', description: 'Add new person', fields: [
        { key: 'name', label: 'Name', type: 'text', placeholder: '{{customer_name}}', required: true },
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}' },
        { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
        { key: 'orgName', label: 'Organization', type: 'text', placeholder: '{{company_name}}' },
      ]},
      { id: 'create_deal', name: 'Create Deal', icon: '💰', description: 'Create new deal', fields: [
        { key: 'title', label: 'Deal Title', type: 'text', placeholder: '{{customer_name}} - {{product}}', required: true },
        { key: 'value', label: 'Deal Value', type: 'number', placeholder: '{{deal_amount}}' },
        { key: 'personEmail', label: 'Person Email', type: 'email', placeholder: '{{customer_email}}' },
        { key: 'stageId', label: 'Stage ID', type: 'number', placeholder: '1' },
      ]},
      { id: 'update_deal_stage', name: 'Update Deal Stage', icon: '📊', description: 'Move deal to stage', fields: [
        { key: 'dealId', label: 'Deal ID', type: 'text', placeholder: '{{deal_id}}', required: true },
        { key: 'stageId', label: 'Stage ID', type: 'number', placeholder: '2', required: true },
      ]},
      { id: 'create_activity', name: 'Create Activity', icon: '📅', description: 'Schedule activity', fields: [
        { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Call {{customer_name}}', required: true },
        { key: 'type', label: 'Type', type: 'select', options: ['call', 'meeting', 'task', 'deadline', 'email'], default: 'call' },
        { key: 'dueDate', label: 'Due Date', type: 'text', placeholder: '{{due_date}}', required: true },
        { key: 'dealId', label: 'Deal ID', type: 'text', placeholder: '{{deal_id}}' },
        { key: 'note', label: 'Note', type: 'textarea', placeholder: '{{ai_note}}' },
      ]},
      { id: 'add_note', name: 'Add Note', icon: '📝', description: 'Add note to deal/person', fields: [
        { key: 'dealId', label: 'Deal ID', type: 'text', placeholder: '{{deal_id}}' },
        { key: 'personId', label: 'Person ID', type: 'text', placeholder: '{{person_id}}' },
        { key: 'content', label: 'Note Content', type: 'textarea', placeholder: '{{ai_summary}}', required: true },
      ]},
    ],
    aiInstructions: 'Track deals through pipeline. Add notes after conversations. Schedule follow-up activities.',
  },

  zoho_crm: {
    triggers: [
      { id: 'lead_created', name: 'Lead Created', icon: '👤', description: 'When new lead is added', dataFields: ['lead_id', 'email', 'full_name', 'company', 'phone', 'source'] },
      { id: 'lead_converted', name: 'Lead Converted', icon: '🔄', description: 'When lead converts', dataFields: ['lead_id', 'contact_id', 'account_id', 'deal_id'] },
      { id: 'deal_created', name: 'Deal Created', icon: '💰', description: 'When new deal is created', dataFields: ['deal_id', 'deal_name', 'amount', 'stage', 'account_id'] },
      { id: 'deal_stage_changed', name: 'Deal Stage Changed', icon: '📊', description: 'When deal stage changes', dataFields: ['deal_id', 'deal_name', 'old_stage', 'new_stage'] },
      { id: 'contact_created', name: 'Contact Created', icon: '👥', description: 'When new contact is added', dataFields: ['contact_id', 'email', 'full_name', 'phone', 'account_id'] },
    ],
    actions: [
      { id: 'create_lead', name: 'Create Lead', icon: '👤', description: 'Add new lead', fields: [
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}' },
        { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{first_name}}' },
        { key: 'lastName', label: 'Last Name', type: 'text', placeholder: '{{last_name}}', required: true },
        { key: 'company', label: 'Company', type: 'text', placeholder: '{{company_name}}' },
        { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
        { key: 'leadSource', label: 'Lead Source', type: 'text', placeholder: 'WhatsApp', default: 'WhatsApp' },
      ]},
      { id: 'create_contact', name: 'Create Contact', icon: '👥', description: 'Add new contact', fields: [
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}' },
        { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{first_name}}' },
        { key: 'lastName', label: 'Last Name', type: 'text', placeholder: '{{last_name}}', required: true },
        { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
      ]},
      { id: 'create_deal', name: 'Create Deal', icon: '💰', description: 'Create new deal', fields: [
        { key: 'dealName', label: 'Deal Name', type: 'text', placeholder: '{{customer_name}} - {{product}}', required: true },
        { key: 'amount', label: 'Amount', type: 'number', placeholder: '{{deal_amount}}' },
        { key: 'stage', label: 'Stage', type: 'text', placeholder: 'Qualification', default: 'Qualification' },
        { key: 'closingDate', label: 'Closing Date', type: 'text', placeholder: '{{close_date}}' },
      ]},
      { id: 'add_note', name: 'Add Note', icon: '📝', description: 'Add note to record', fields: [
        { key: 'module', label: 'Module', type: 'select', options: ['Leads', 'Contacts', 'Deals'], required: true },
        { key: 'recordId', label: 'Record ID', type: 'text', placeholder: '{{record_id}}', required: true },
        { key: 'noteContent', label: 'Note', type: 'textarea', placeholder: '{{ai_summary}}', required: true },
      ]},
    ],
    aiInstructions: 'Manage leads through conversion. Update deal stages based on conversation outcomes.',
  },

  freshsales: {
    triggers: [
      { id: 'lead_created', name: 'Lead Created', icon: '👤', description: 'When new lead is added', dataFields: ['lead_id', 'email', 'name', 'company', 'phone'] },
      { id: 'lead_updated', name: 'Lead Updated', icon: '✏️', description: 'When lead is modified', dataFields: ['lead_id', 'email', 'changed_fields'] },
      { id: 'deal_created', name: 'Deal Created', icon: '💰', description: 'When new deal is created', dataFields: ['deal_id', 'name', 'amount', 'stage'] },
      { id: 'deal_won', name: 'Deal Won', icon: '🏆', description: 'When deal is won', dataFields: ['deal_id', 'name', 'amount'] },
      { id: 'task_due', name: 'Task Due', icon: '⏰', description: 'When task is due', dataFields: ['task_id', 'title', 'due_date', 'lead_id'] },
    ],
    actions: [
      { id: 'create_lead', name: 'Create Lead', icon: '👤', description: 'Add new lead', fields: [
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}' },
        { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{first_name}}' },
        { key: 'lastName', label: 'Last Name', type: 'text', placeholder: '{{last_name}}', required: true },
        { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
        { key: 'company', label: 'Company', type: 'text', placeholder: '{{company_name}}' },
      ]},
      { id: 'create_deal', name: 'Create Deal', icon: '💰', description: 'Create new deal', fields: [
        { key: 'name', label: 'Deal Name', type: 'text', placeholder: '{{customer_name}} - {{product}}', required: true },
        { key: 'amount', label: 'Amount', type: 'number', placeholder: '{{deal_amount}}' },
        { key: 'expectedClose', label: 'Expected Close', type: 'text', placeholder: '{{close_date}}' },
      ]},
      { id: 'create_task', name: 'Create Task', icon: '✅', description: 'Create follow-up task', fields: [
        { key: 'title', label: 'Task Title', type: 'text', placeholder: 'Follow up with {{customer_name}}', required: true },
        { key: 'dueDate', label: 'Due Date', type: 'text', placeholder: '{{due_date}}', required: true },
        { key: 'leadId', label: 'Lead ID', type: 'text', placeholder: '{{lead_id}}' },
      ]},
      { id: 'add_note', name: 'Add Note', icon: '📝', description: 'Add note', fields: [
        { key: 'leadId', label: 'Lead ID', type: 'text', placeholder: '{{lead_id}}', required: true },
        { key: 'description', label: 'Note', type: 'textarea', placeholder: '{{ai_summary}}', required: true },
      ]},
    ],
    aiInstructions: 'Capture leads from conversations. Create follow-up tasks automatically.',
  },

  // ==================== AUTOMATION PLATFORMS ====================
  zapier: {
    triggers: [
      { id: 'webhook_received', name: 'Webhook Received', icon: '📩', description: 'When data is received from Zapier', dataFields: ['payload', 'timestamp', 'zap_id'] },
    ],
    actions: [
      { id: 'trigger_zap', name: 'Trigger Zap', icon: '⚡', description: 'Send data to Zapier webhook', fields: [
        { key: 'webhookUrl', label: 'Zapier Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/...', required: true, helpText: 'Get this from your Zap\'s webhook trigger' },
        { key: 'data', label: 'Data to Send (JSON)', type: 'textarea', placeholder: '{\n  "customer_name": "{{customer_name}}",\n  "email": "{{customer_email}}",\n  "phone": "{{customer_phone}}",\n  "message": "{{message}}",\n  "ai_response": "{{ai_response}}"\n}', required: true },
      ]},
      { id: 'trigger_with_template', name: 'Send Lead Data', icon: '👤', description: 'Send formatted lead data', fields: [
        { key: 'webhookUrl', label: 'Zapier Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/...', required: true },
        { key: 'name', label: 'Customer Name', type: 'text', placeholder: '{{customer_name}}' },
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}' },
        { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
        { key: 'source', label: 'Lead Source', type: 'text', placeholder: 'WhatsApp Bot', default: 'WhatsApp Bot' },
        { key: 'notes', label: 'Notes', type: 'textarea', placeholder: '{{ai_summary}}' },
      ]},
    ],
    aiInstructions: 'Format data properly before sending to Zapier. Include all relevant customer information.',
  },

  make: {
    triggers: [
      { id: 'webhook_received', name: 'Webhook Received', icon: '📩', description: 'When data is received from Make', dataFields: ['payload', 'scenario_id', 'timestamp'] },
    ],
    actions: [
      { id: 'trigger_scenario', name: 'Trigger Scenario', icon: '🔄', description: 'Send data to Make webhook', fields: [
        { key: 'webhookUrl', label: 'Make Webhook URL', type: 'text', placeholder: 'https://hook.make.com/...', required: true, helpText: 'Get this from your Make scenario\'s webhook module' },
        { key: 'data', label: 'Data to Send (JSON)', type: 'textarea', placeholder: '{\n  "customer": "{{customer_name}}",\n  "contact": "{{customer_phone}}",\n  "inquiry": "{{message}}"\n}', required: true },
      ]},
      { id: 'send_structured_data', name: 'Send Structured Data', icon: '📦', description: 'Send with predefined structure', fields: [
        { key: 'webhookUrl', label: 'Make Webhook URL', type: 'text', placeholder: 'https://hook.make.com/...', required: true },
        { key: 'eventType', label: 'Event Type', type: 'select', options: ['new_lead', 'new_order', 'support_request', 'feedback', 'custom'], default: 'new_lead' },
        { key: 'customerName', label: 'Customer Name', type: 'text', placeholder: '{{customer_name}}' },
        { key: 'customerEmail', label: 'Email', type: 'email', placeholder: '{{customer_email}}' },
        { key: 'customerPhone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
        { key: 'additionalData', label: 'Additional Data', type: 'textarea', placeholder: '{{ai_extracted_data}}' },
      ]},
    ],
    aiInstructions: 'Structure data according to scenario requirements. Validate data before sending.',
  },

  n8n: {
    triggers: [
      { id: 'webhook_received', name: 'Webhook Received', icon: '📩', description: 'When data is received from n8n', dataFields: ['payload', 'workflow_id', 'timestamp'] },
    ],
    actions: [
      { id: 'trigger_workflow', name: 'Trigger Workflow', icon: '🔗', description: 'Send data to n8n webhook', fields: [
        { key: 'webhookUrl', label: 'n8n Webhook URL', type: 'text', placeholder: 'https://your-n8n.com/webhook/...', required: true, helpText: 'Get this from your n8n workflow\'s webhook node' },
        { key: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'GET'], default: 'POST' },
        { key: 'data', label: 'Data to Send (JSON)', type: 'textarea', placeholder: '{\n  "action": "new_lead",\n  "data": {\n    "name": "{{customer_name}}",\n    "phone": "{{customer_phone}}"\n  }\n}', required: true },
      ]},
      { id: 'trigger_with_auth', name: 'Trigger with Auth', icon: '🔐', description: 'Send data with authentication', fields: [
        { key: 'webhookUrl', label: 'n8n Webhook URL', type: 'text', placeholder: 'https://your-n8n.com/webhook/...', required: true },
        { key: 'headerKey', label: 'Auth Header Name', type: 'text', placeholder: 'X-Auth-Token', default: 'X-Auth-Token' },
        { key: 'headerValue', label: 'Auth Header Value', type: 'text', placeholder: 'your-secret-token' },
        { key: 'data', label: 'Data (JSON)', type: 'textarea', placeholder: '{"customer": "{{customer_name}}"}', required: true },
      ]},
    ],
    aiInstructions: 'Send properly formatted JSON data. Include authentication when required.',
  },

  ifttt: {
    triggers: [
      { id: 'webhook_received', name: 'Webhook Received', icon: '📩', description: 'When triggered by IFTTT', dataFields: ['value1', 'value2', 'value3', 'timestamp'] },
    ],
    actions: [
      { id: 'trigger_applet', name: 'Trigger Applet', icon: '🔀', description: 'Trigger IFTTT applet via webhook', fields: [
        { key: 'webhookKey', label: 'Webhook Key', type: 'text', placeholder: 'Your IFTTT webhook key', required: true, helpText: 'Find at ifttt.com/maker_webhooks/settings' },
        { key: 'eventName', label: 'Event Name', type: 'text', placeholder: 'new_whatsapp_lead', required: true },
        { key: 'value1', label: 'Value 1', type: 'text', placeholder: '{{customer_name}}' },
        { key: 'value2', label: 'Value 2', type: 'text', placeholder: '{{customer_phone}}' },
        { key: 'value3', label: 'Value 3', type: 'text', placeholder: '{{message}}' },
      ]},
    ],
    aiInstructions: 'Use the three value fields efficiently. Combine data if needed.',
  },

  power_automate: {
    triggers: [
      { id: 'webhook_received', name: 'Flow Triggered', icon: '📩', description: 'When flow sends data', dataFields: ['payload', 'flow_id', 'timestamp'] },
    ],
    actions: [
      { id: 'trigger_flow', name: 'Trigger Flow', icon: '⚙️', description: 'Trigger Power Automate flow', fields: [
        { key: 'webhookUrl', label: 'Flow HTTP URL', type: 'text', placeholder: 'https://prod-xx.westus.logic.azure.com/...', required: true, helpText: 'Get from "When HTTP request is received" trigger' },
        { key: 'data', label: 'Request Body (JSON)', type: 'textarea', placeholder: '{\n  "customer_name": "{{customer_name}}",\n  "email": "{{customer_email}}",\n  "phone": "{{customer_phone}}",\n  "message": "{{message}}"\n}', required: true },
      ]},
      { id: 'trigger_teams_flow', name: 'Notify Teams', icon: '💬', description: 'Trigger Teams notification flow', fields: [
        { key: 'webhookUrl', label: 'Flow HTTP URL', type: 'text', placeholder: 'https://prod-xx.westus.logic.azure.com/...', required: true },
        { key: 'title', label: 'Notification Title', type: 'text', placeholder: 'New Lead: {{customer_name}}', required: true },
        { key: 'message', label: 'Message', type: 'textarea', placeholder: '**Name:** {{customer_name}}\n**Phone:** {{customer_phone}}\n**Message:** {{message}}', required: true },
        { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'normal', 'high'], default: 'normal' },
      ]},
    ],
    aiInstructions: 'Format JSON according to flow schema. Use proper data types.',
  },

  // ==================== DATABASE & STORAGE ====================
  airtable: {
    triggers: [
      { id: 'record_created', name: 'Record Created', icon: '➕', description: 'When new record is added', dataFields: ['record_id', 'fields', 'table_name', 'created_time'] },
      { id: 'record_updated', name: 'Record Updated', icon: '✏️', description: 'When record is modified', dataFields: ['record_id', 'fields', 'changed_fields', 'table_name'] },
      { id: 'record_deleted', name: 'Record Deleted', icon: '🗑️', description: 'When record is deleted', dataFields: ['record_id', 'table_name', 'deleted_time'] },
      { id: 'record_matches_condition', name: 'Record Matches Condition', icon: '🎯', description: 'When a record matches a filter', dataFields: ['record_id', 'fields', 'matched_condition'] },
      { id: 'field_value_changed', name: 'Specific Field Changed', icon: '📝', description: 'When specific field value changes', dataFields: ['record_id', 'field_name', 'old_value', 'new_value'] },
    ],
    actions: [
      { id: 'create_record', name: 'Create Record', icon: '➕', description: 'Add new record to table', fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true, helpText: 'Found in Airtable URL or API docs' },
        { key: 'tableId', label: 'Table ID or Name', type: 'text', placeholder: 'tblXXXXX or "Leads"', required: true },
        { key: 'fields', label: 'Fields (JSON)', type: 'textarea', placeholder: '{\n  "Name": "{{customer_name}}",\n  "Email": "{{customer_email}}",\n  "Phone": "{{customer_phone}}",\n  "Status": "New",\n  "Source": "WhatsApp",\n  "Date Added": "{{timestamp}}"\n}', required: true, helpText: 'Use your Airtable column names exactly' },
      ]},
      { id: 'update_record', name: 'Update Record', icon: '✏️', description: 'Update existing record by ID', fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
        { key: 'tableId', label: 'Table ID or Name', type: 'text', placeholder: 'tblXXXXX', required: true },
        { key: 'recordId', label: 'Record ID', type: 'text', placeholder: 'recXXXXXXXXXXXXXX or {{record_id}}', required: true },
        { key: 'fields', label: 'Fields to Update (JSON)', type: 'textarea', placeholder: '{\n  "Status": "Contacted",\n  "Notes": "{{ai_summary}}",\n  "Last Contact": "{{timestamp}}"\n}', required: true },
      ]},
      { id: 'find_record', name: 'Find Record', icon: '🔍', description: 'Search for a single record', fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
        { key: 'tableId', label: 'Table ID or Name', type: 'text', placeholder: 'tblXXXXX', required: true },
        { key: 'filterFormula', label: 'Filter Formula', type: 'text', placeholder: '{Email} = "{{customer_email}}"', required: true, helpText: 'Airtable formula syntax: {Field} = "value"' },
      ]},
      { id: 'find_and_update', name: 'Find & Update Record', icon: '🔄', description: 'Find a record and update it', fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
        { key: 'tableId', label: 'Table ID or Name', type: 'text', placeholder: 'tblXXXXX', required: true },
        { key: 'filterFormula', label: 'Find by Formula', type: 'text', placeholder: '{Email} = "{{customer_email}}"', required: true },
        { key: 'fields', label: 'Fields to Update (JSON)', type: 'textarea', placeholder: '{"Status": "{{new_status}}"}', required: true },
        { key: 'createIfNotFound', label: 'Create if Not Found?', type: 'select', options: ['no', 'yes'], default: 'no' },
      ]},
      { id: 'delete_record', name: 'Delete Record', icon: '🗑️', description: 'Delete a record', fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
        { key: 'tableId', label: 'Table ID or Name', type: 'text', placeholder: 'tblXXXXX', required: true },
        { key: 'recordId', label: 'Record ID', type: 'text', placeholder: '{{record_id}}', required: true },
      ]},
      { id: 'find_and_delete', name: 'Find & Delete Record', icon: '🔍🗑️', description: 'Find and delete a record', fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
        { key: 'tableId', label: 'Table ID or Name', type: 'text', placeholder: 'tblXXXXX', required: true },
        { key: 'filterFormula', label: 'Find by Formula', type: 'text', placeholder: '{Email} = "{{customer_email}}"', required: true },
      ]},
      { id: 'list_records', name: 'List Records', icon: '📋', description: 'Get multiple records', fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
        { key: 'tableId', label: 'Table ID or Name', type: 'text', placeholder: 'tblXXXXX', required: true },
        { key: 'filterFormula', label: 'Filter (optional)', type: 'text', placeholder: '{Status} = "New"' },
        { key: 'sortField', label: 'Sort by Field', type: 'text', placeholder: 'Date Added' },
        { key: 'sortDirection', label: 'Sort Direction', type: 'select', options: ['asc', 'desc'], default: 'desc' },
        { key: 'maxRecords', label: 'Max Records', type: 'number', placeholder: '100', default: '100' },
      ]},
      { id: 'get_record', name: 'Get Record by ID', icon: '📄', description: 'Get a specific record', fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
        { key: 'tableId', label: 'Table ID or Name', type: 'text', placeholder: 'tblXXXXX', required: true },
        { key: 'recordId', label: 'Record ID', type: 'text', placeholder: '{{record_id}}', required: true },
      ]},
      { id: 'batch_create', name: 'Batch Create Records', icon: '➕➕', description: 'Create multiple records at once', fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
        { key: 'tableId', label: 'Table ID or Name', type: 'text', placeholder: 'tblXXXXX', required: true },
        { key: 'records', label: 'Records (JSON Array)', type: 'textarea', placeholder: '[\n  {"fields": {"Name": "John", "Email": "john@example.com"}},\n  {"fields": {"Name": "Jane", "Email": "jane@example.com"}}\n]', required: true },
      ]},
      { id: 'batch_update', name: 'Batch Update Records', icon: '✏️✏️', description: 'Update multiple records', fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
        { key: 'tableId', label: 'Table ID or Name', type: 'text', placeholder: 'tblXXXXX', required: true },
        { key: 'records', label: 'Records (JSON Array)', type: 'textarea', placeholder: '[\n  {"id": "recXXX", "fields": {"Status": "Updated"}},\n  {"id": "recYYY", "fields": {"Status": "Updated"}}\n]', required: true },
      ]},
      { id: 'count_records', name: 'Count Records', icon: '🔢', description: 'Count matching records', fields: [
        { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
        { key: 'tableId', label: 'Table ID or Name', type: 'text', placeholder: 'tblXXXXX', required: true },
        { key: 'filterFormula', label: 'Filter (optional)', type: 'text', placeholder: '{Status} = "Active"' },
      ]},
    ],
    aiInstructions: 'Store data with consistent field names. Use appropriate field types. When searching, use exact formula syntax.',
  },

  notion: {
    triggers: [
      { id: 'page_created', name: 'Page Created', icon: '📄', description: 'When new page is created', dataFields: ['page_id', 'title', 'properties', 'created_by', 'created_time'] },
      { id: 'page_updated', name: 'Page Updated', icon: '✏️', description: 'When page is modified', dataFields: ['page_id', 'title', 'changed_properties', 'updated_by'] },
      { id: 'database_item_created', name: 'Database Item Created', icon: '➕', description: 'When item added to database', dataFields: ['page_id', 'properties', 'database_id'] },
    ],
    actions: [
      { id: 'create_page', name: 'Create Page', icon: '📄', description: 'Create new Notion page', fields: [
        { key: 'parentPageId', label: 'Parent Page ID', type: 'text', placeholder: 'Page ID to create under', helpText: 'Leave empty for workspace root' },
        { key: 'title', label: 'Page Title', type: 'text', placeholder: '{{customer_name}} - Notes', required: true },
        { key: 'content', label: 'Content (Markdown)', type: 'textarea', placeholder: '## Customer Info\n- **Name:** {{customer_name}}\n- **Phone:** {{customer_phone}}\n\n## Notes\n{{ai_summary}}' },
      ]},
      { id: 'add_database_item', name: 'Add to Database', icon: '➕', description: 'Add item to Notion database', fields: [
        { key: 'databaseId', label: 'Database ID', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', required: true },
        { key: 'properties', label: 'Properties (JSON)', type: 'textarea', placeholder: '{\n  "Name": {"title": [{"text": {"content": "{{customer_name}}"}}]},\n  "Email": {"email": "{{customer_email}}"},\n  "Status": {"select": {"name": "New"}}\n}', required: true, helpText: 'Use Notion property format' },
      ]},
      { id: 'update_page', name: 'Update Page', icon: '✏️', description: 'Update page properties', fields: [
        { key: 'pageId', label: 'Page ID', type: 'text', placeholder: '{{page_id}}', required: true },
        { key: 'properties', label: 'Properties (JSON)', type: 'textarea', placeholder: '{"Status": {"select": {"name": "Contacted"}}}', required: true },
      ]},
      { id: 'append_block', name: 'Append Content', icon: '📝', description: 'Add content to page', fields: [
        { key: 'pageId', label: 'Page ID', type: 'text', placeholder: '{{page_id}}', required: true },
        { key: 'content', label: 'Content (Markdown)', type: 'textarea', placeholder: '---\n**Update {{timestamp}}:**\n{{ai_response}}', required: true },
      ]},
      { id: 'query_database', name: 'Query Database', icon: '🔍', description: 'Search database', fields: [
        { key: 'databaseId', label: 'Database ID', type: 'text', placeholder: 'Database ID', required: true },
        { key: 'filter', label: 'Filter (JSON)', type: 'textarea', placeholder: '{"property": "Email", "email": {"equals": "{{customer_email}}"}}' },
      ]},
    ],
    aiInstructions: 'Create organized pages with clear structure. Use databases for structured data.',
  },

  firebase: {
    triggers: [
      { id: 'document_created', name: 'Document Created', icon: '➕', description: 'When Firestore document is created', dataFields: ['document_id', 'data', 'collection', 'created_at'] },
      { id: 'document_updated', name: 'Document Updated', icon: '✏️', description: 'When document is modified', dataFields: ['document_id', 'data', 'changed_fields', 'collection'] },
      { id: 'document_deleted', name: 'Document Deleted', icon: '🗑️', description: 'When document is deleted', dataFields: ['document_id', 'collection', 'deleted_at'] },
    ],
    actions: [
      { id: 'add_document', name: 'Add Document', icon: '➕', description: 'Create Firestore document', fields: [
        { key: 'collection', label: 'Collection', type: 'text', placeholder: 'leads', required: true },
        { key: 'documentId', label: 'Document ID (optional)', type: 'text', placeholder: 'Auto-generated if empty' },
        { key: 'data', label: 'Document Data (JSON)', type: 'textarea', placeholder: '{\n  "name": "{{customer_name}}",\n  "email": "{{customer_email}}",\n  "phone": "{{customer_phone}}",\n  "createdAt": "{{timestamp}}"\n}', required: true },
      ]},
      { id: 'update_document', name: 'Update Document', icon: '✏️', description: 'Update Firestore document', fields: [
        { key: 'collection', label: 'Collection', type: 'text', placeholder: 'leads', required: true },
        { key: 'documentId', label: 'Document ID', type: 'text', placeholder: '{{document_id}}', required: true },
        { key: 'data', label: 'Fields to Update (JSON)', type: 'textarea', placeholder: '{"status": "contacted", "notes": "{{ai_summary}}"}', required: true },
      ]},
      { id: 'get_document', name: 'Get Document', icon: '📄', description: 'Read document data', fields: [
        { key: 'collection', label: 'Collection', type: 'text', placeholder: 'leads', required: true },
        { key: 'documentId', label: 'Document ID', type: 'text', placeholder: '{{document_id}}', required: true },
      ]},
      { id: 'query_collection', name: 'Query Collection', icon: '🔍', description: 'Search documents', fields: [
        { key: 'collection', label: 'Collection', type: 'text', placeholder: 'leads', required: true },
        { key: 'field', label: 'Field to Filter', type: 'text', placeholder: 'email', required: true },
        { key: 'operator', label: 'Operator', type: 'select', options: ['==', '!=', '<', '<=', '>', '>=', 'array-contains'], default: '==' },
        { key: 'value', label: 'Value', type: 'text', placeholder: '{{customer_email}}', required: true },
      ]},
      { id: 'delete_document', name: 'Delete Document', icon: '🗑️', description: 'Delete document', fields: [
        { key: 'collection', label: 'Collection', type: 'text', placeholder: 'leads', required: true },
        { key: 'documentId', label: 'Document ID', type: 'text', placeholder: '{{document_id}}', required: true },
      ]},
    ],
    aiInstructions: 'Use consistent collection and field naming. Include timestamps for tracking.',
  },

  supabase: {
    triggers: [
      { id: 'row_inserted', name: 'Row Inserted', icon: '➕', description: 'When new row is inserted', dataFields: ['id', 'row_data', 'table', 'created_at'] },
      { id: 'row_updated', name: 'Row Updated', icon: '✏️', description: 'When row is updated', dataFields: ['id', 'old_data', 'new_data', 'table'] },
      { id: 'row_deleted', name: 'Row Deleted', icon: '🗑️', description: 'When row is deleted', dataFields: ['id', 'table', 'deleted_data'] },
    ],
    actions: [
      { id: 'insert_row', name: 'Insert Row', icon: '➕', description: 'Add new row to table', fields: [
        { key: 'table', label: 'Table Name', type: 'text', placeholder: 'leads', required: true },
        { key: 'data', label: 'Row Data (JSON)', type: 'textarea', placeholder: '{\n  "name": "{{customer_name}}",\n  "email": "{{customer_email}}",\n  "phone": "{{customer_phone}}",\n  "status": "new"\n}', required: true },
      ]},
      { id: 'update_row', name: 'Update Row', icon: '✏️', description: 'Update existing row', fields: [
        { key: 'table', label: 'Table Name', type: 'text', placeholder: 'leads', required: true },
        { key: 'matchColumn', label: 'Match Column', type: 'text', placeholder: 'email', required: true },
        { key: 'matchValue', label: 'Match Value', type: 'text', placeholder: '{{customer_email}}', required: true },
        { key: 'data', label: 'Data to Update (JSON)', type: 'textarea', placeholder: '{"status": "contacted", "notes": "{{ai_summary}}"}', required: true },
      ]},
      { id: 'upsert_row', name: 'Upsert Row', icon: '🔄', description: 'Insert or update row', fields: [
        { key: 'table', label: 'Table Name', type: 'text', placeholder: 'leads', required: true },
        { key: 'data', label: 'Row Data (JSON)', type: 'textarea', placeholder: '{"email": "{{customer_email}}", "name": "{{customer_name}}", "updated_at": "{{timestamp}}"}', required: true },
        { key: 'onConflict', label: 'Conflict Column', type: 'text', placeholder: 'email', required: true, helpText: 'Column to check for existing row' },
      ]},
      { id: 'select_rows', name: 'Select Rows', icon: '🔍', description: 'Query table data', fields: [
        { key: 'table', label: 'Table Name', type: 'text', placeholder: 'leads', required: true },
        { key: 'columns', label: 'Columns', type: 'text', placeholder: '*', default: '*' },
        { key: 'filter', label: 'Filter (column=value)', type: 'text', placeholder: 'email={{customer_email}}' },
        { key: 'limit', label: 'Limit', type: 'number', placeholder: '10', default: '10' },
      ]},
      { id: 'delete_row', name: 'Delete Row', icon: '🗑️', description: 'Delete row from table', fields: [
        { key: 'table', label: 'Table Name', type: 'text', placeholder: 'leads', required: true },
        { key: 'matchColumn', label: 'Match Column', type: 'text', placeholder: 'id', required: true },
        { key: 'matchValue', label: 'Match Value', type: 'text', placeholder: '{{record_id}}', required: true },
      ]},
    ],
    aiInstructions: 'Use proper SQL column types. Include created_at/updated_at timestamps.',
  },

  mongodb: {
    triggers: [
      { id: 'document_inserted', name: 'Document Inserted', icon: '➕', description: 'When document is inserted', dataFields: ['_id', 'document', 'collection', 'timestamp'] },
      { id: 'document_updated', name: 'Document Updated', icon: '✏️', description: 'When document is updated', dataFields: ['_id', 'updateDescription', 'collection'] },
      { id: 'document_deleted', name: 'Document Deleted', icon: '🗑️', description: 'When document is deleted', dataFields: ['_id', 'collection', 'timestamp'] },
    ],
    actions: [
      { id: 'insert_document', name: 'Insert Document', icon: '➕', description: 'Add new document', fields: [
        { key: 'collection', label: 'Collection', type: 'text', placeholder: 'leads', required: true },
        { key: 'document', label: 'Document (JSON)', type: 'textarea', placeholder: '{\n  "name": "{{customer_name}}",\n  "email": "{{customer_email}}",\n  "phone": "{{customer_phone}}",\n  "createdAt": {"$date": "{{timestamp}}"}\n}', required: true },
      ]},
      { id: 'update_document', name: 'Update Document', icon: '✏️', description: 'Update document', fields: [
        { key: 'collection', label: 'Collection', type: 'text', placeholder: 'leads', required: true },
        { key: 'filter', label: 'Filter (JSON)', type: 'textarea', placeholder: '{"email": "{{customer_email}}"}', required: true },
        { key: 'update', label: 'Update (JSON)', type: 'textarea', placeholder: '{"$set": {"status": "contacted", "notes": "{{ai_summary}}"}}', required: true },
      ]},
      { id: 'find_documents', name: 'Find Documents', icon: '🔍', description: 'Query documents', fields: [
        { key: 'collection', label: 'Collection', type: 'text', placeholder: 'leads', required: true },
        { key: 'filter', label: 'Filter (JSON)', type: 'textarea', placeholder: '{"email": "{{customer_email}}"}', required: true },
        { key: 'limit', label: 'Limit', type: 'number', placeholder: '10', default: '10' },
      ]},
      { id: 'delete_document', name: 'Delete Document', icon: '🗑️', description: 'Delete document', fields: [
        { key: 'collection', label: 'Collection', type: 'text', placeholder: 'leads', required: true },
        { key: 'filter', label: 'Filter (JSON)', type: 'textarea', placeholder: '{"_id": "{{document_id}}"}', required: true },
      ]},
    ],
    aiInstructions: 'Use proper MongoDB operators. Index frequently queried fields.',
  },

  dropbox: {
    triggers: [
      { id: 'file_added', name: 'File Added', icon: '📄', description: 'When file is uploaded', dataFields: ['file_id', 'name', 'path', 'size', 'modified'] },
      { id: 'file_modified', name: 'File Modified', icon: '✏️', description: 'When file is changed', dataFields: ['file_id', 'name', 'path', 'modified'] },
      { id: 'folder_created', name: 'Folder Created', icon: '📁', description: 'When folder is created', dataFields: ['folder_id', 'name', 'path'] },
    ],
    actions: [
      { id: 'upload_file', name: 'Upload File', icon: '📤', description: 'Upload file to Dropbox', fields: [
        { key: 'path', label: 'Destination Path', type: 'text', placeholder: '/Leads/{{customer_name}}/document.pdf', required: true },
        { key: 'fileUrl', label: 'File URL', type: 'text', placeholder: '{{file_url}}', required: true },
        { key: 'mode', label: 'If Exists', type: 'select', options: ['add', 'overwrite'], default: 'add' },
      ]},
      { id: 'create_folder', name: 'Create Folder', icon: '📁', description: 'Create new folder', fields: [
        { key: 'path', label: 'Folder Path', type: 'text', placeholder: '/Customers/{{customer_name}}', required: true },
      ]},
      { id: 'get_share_link', name: 'Get Share Link', icon: '🔗', description: 'Create shareable link', fields: [
        { key: 'path', label: 'File Path', type: 'text', placeholder: '/Documents/{{file_name}}', required: true },
      ]},
      { id: 'move_file', name: 'Move File', icon: '📦', description: 'Move file to new location', fields: [
        { key: 'fromPath', label: 'From Path', type: 'text', placeholder: '/Inbox/{{file_name}}', required: true },
        { key: 'toPath', label: 'To Path', type: 'text', placeholder: '/Processed/{{file_name}}', required: true },
      ]},
      { id: 'delete_file', name: 'Delete File', icon: '🗑️', description: 'Delete file or folder', fields: [
        { key: 'path', label: 'Path', type: 'text', placeholder: '/Temp/{{file_name}}', required: true },
      ]},
    ],
    aiInstructions: 'Organize files in logical folder structure. Use descriptive file names.',
  },

  aws_s3: {
    triggers: [
      { id: 'object_created', name: 'Object Created', icon: '📄', description: 'When object is uploaded', dataFields: ['bucket', 'key', 'size', 'etag', 'event_time'] },
      { id: 'object_deleted', name: 'Object Deleted', icon: '🗑️', description: 'When object is deleted', dataFields: ['bucket', 'key', 'event_time'] },
    ],
    actions: [
      { id: 'put_object', name: 'Upload Object', icon: '📤', description: 'Upload file to S3', fields: [
        { key: 'key', label: 'Object Key (path)', type: 'text', placeholder: 'leads/{{customer_id}}/{{filename}}', required: true },
        { key: 'fileUrl', label: 'File URL', type: 'text', placeholder: '{{file_url}}', required: true },
        { key: 'contentType', label: 'Content Type', type: 'text', placeholder: 'application/pdf', helpText: 'e.g., image/jpeg, application/pdf' },
      ]},
      { id: 'get_object', name: 'Get Object', icon: '📥', description: 'Download file from S3', fields: [
        { key: 'key', label: 'Object Key', type: 'text', placeholder: 'documents/{{filename}}', required: true },
      ]},
      { id: 'get_presigned_url', name: 'Get Presigned URL', icon: '🔗', description: 'Generate temporary URL', fields: [
        { key: 'key', label: 'Object Key', type: 'text', placeholder: 'documents/{{filename}}', required: true },
        { key: 'expiresIn', label: 'Expires In (seconds)', type: 'number', placeholder: '3600', default: '3600' },
        { key: 'operation', label: 'Operation', type: 'select', options: ['getObject', 'putObject'], default: 'getObject' },
      ]},
      { id: 'delete_object', name: 'Delete Object', icon: '🗑️', description: 'Delete file from S3', fields: [
        { key: 'key', label: 'Object Key', type: 'text', placeholder: 'temp/{{filename}}', required: true },
      ]},
      { id: 'list_objects', name: 'List Objects', icon: '📋', description: 'List files in prefix', fields: [
        { key: 'prefix', label: 'Prefix (folder)', type: 'text', placeholder: 'leads/{{customer_id}}/' },
        { key: 'maxKeys', label: 'Max Results', type: 'number', placeholder: '100', default: '100' },
      ]},
    ],
    aiInstructions: 'Use consistent key naming conventions. Set appropriate content types.',
  },

  // ==================== E-COMMERCE & PAYMENTS ====================
  stripe: {
    triggers: [
      { id: 'payment_succeeded', name: 'Payment Succeeded', icon: '✅', description: 'When payment is successful', dataFields: ['payment_intent_id', 'amount', 'currency', 'customer_id', 'customer_email', 'metadata'] },
      { id: 'payment_failed', name: 'Payment Failed', icon: '❌', description: 'When payment fails', dataFields: ['payment_intent_id', 'amount', 'error_message', 'customer_email'] },
      { id: 'subscription_created', name: 'Subscription Created', icon: '🔄', description: 'When subscription starts', dataFields: ['subscription_id', 'customer_id', 'plan_id', 'amount', 'interval'] },
      { id: 'subscription_cancelled', name: 'Subscription Cancelled', icon: '🚫', description: 'When subscription is cancelled', dataFields: ['subscription_id', 'customer_id', 'cancelled_at', 'reason'] },
      { id: 'invoice_paid', name: 'Invoice Paid', icon: '📄', description: 'When invoice is paid', dataFields: ['invoice_id', 'customer_id', 'amount', 'invoice_pdf'] },
      { id: 'customer_created', name: 'Customer Created', icon: '👤', description: 'When customer is created', dataFields: ['customer_id', 'email', 'name', 'created'] },
      { id: 'refund_created', name: 'Refund Created', icon: '💸', description: 'When refund is issued', dataFields: ['refund_id', 'amount', 'reason', 'payment_intent_id'] },
    ],
    actions: [
      { id: 'create_customer', name: 'Create Customer', icon: '👤', description: 'Create Stripe customer', fields: [
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'name', label: 'Name', type: 'text', placeholder: '{{customer_name}}' },
        { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
        { key: 'metadata', label: 'Metadata (JSON)', type: 'textarea', placeholder: '{"source": "whatsapp", "agent_id": "{{agent_id}}"}' },
      ]},
      { id: 'create_payment_link', name: 'Create Payment Link', icon: '🔗', description: 'Generate payment link', fields: [
        { key: 'priceId', label: 'Price ID', type: 'text', placeholder: 'price_XXXXX', required: true, helpText: 'From Stripe dashboard' },
        { key: 'quantity', label: 'Quantity', type: 'number', placeholder: '1', default: '1' },
        { key: 'metadata', label: 'Metadata (JSON)', type: 'textarea', placeholder: '{"customer_phone": "{{customer_phone}}"}' },
      ]},
      { id: 'create_invoice', name: 'Create Invoice', icon: '📄', description: 'Create and send invoice', fields: [
        { key: 'customerId', label: 'Customer ID', type: 'text', placeholder: '{{stripe_customer_id}}', required: true },
        { key: 'items', label: 'Line Items (JSON)', type: 'textarea', placeholder: '[{"price": "price_XXX", "quantity": 1}]', required: true },
        { key: 'autoSend', label: 'Auto-send Email', type: 'select', options: ['true', 'false'], default: 'true' },
      ]},
      { id: 'create_refund', name: 'Create Refund', icon: '💸', description: 'Issue refund', fields: [
        { key: 'paymentIntentId', label: 'Payment Intent ID', type: 'text', placeholder: '{{payment_intent_id}}', required: true },
        { key: 'amount', label: 'Amount (cents)', type: 'number', placeholder: 'Leave empty for full refund' },
        { key: 'reason', label: 'Reason', type: 'select', options: ['duplicate', 'fraudulent', 'requested_by_customer'], default: 'requested_by_customer' },
      ]},
      { id: 'get_customer', name: 'Get Customer', icon: '🔍', description: 'Retrieve customer details', fields: [
        { key: 'customerId', label: 'Customer ID', type: 'text', placeholder: '{{stripe_customer_id}}' },
        { key: 'email', label: 'Or Email', type: 'email', placeholder: '{{customer_email}}' },
      ]},
    ],
    aiInstructions: 'Handle payment data securely. Confirm amounts before processing. Always include metadata for tracking.',
  },

  razorpay: {
    triggers: [
      { id: 'payment_captured', name: 'Payment Captured', icon: '✅', description: 'When payment is captured', dataFields: ['payment_id', 'order_id', 'amount', 'currency', 'email', 'contact'] },
      { id: 'payment_failed', name: 'Payment Failed', icon: '❌', description: 'When payment fails', dataFields: ['payment_id', 'order_id', 'error_code', 'error_description'] },
      { id: 'refund_processed', name: 'Refund Processed', icon: '💸', description: 'When refund is processed', dataFields: ['refund_id', 'payment_id', 'amount', 'status'] },
      { id: 'subscription_activated', name: 'Subscription Activated', icon: '🔄', description: 'When subscription starts', dataFields: ['subscription_id', 'plan_id', 'customer_id', 'current_start'] },
    ],
    actions: [
      { id: 'create_order', name: 'Create Order', icon: '📦', description: 'Create Razorpay order', fields: [
        { key: 'amount', label: 'Amount (paise)', type: 'number', placeholder: '10000 (for ₹100)', required: true, helpText: 'Amount in smallest currency unit' },
        { key: 'currency', label: 'Currency', type: 'text', placeholder: 'INR', default: 'INR' },
        { key: 'receipt', label: 'Receipt ID', type: 'text', placeholder: 'order_{{timestamp}}' },
        { key: 'notes', label: 'Notes (JSON)', type: 'textarea', placeholder: '{"customer_name": "{{customer_name}}", "phone": "{{customer_phone}}"}' },
      ]},
      { id: 'create_payment_link', name: 'Create Payment Link', icon: '🔗', description: 'Generate payment link', fields: [
        { key: 'amount', label: 'Amount (paise)', type: 'number', placeholder: '10000', required: true },
        { key: 'currency', label: 'Currency', type: 'text', placeholder: 'INR', default: 'INR' },
        { key: 'description', label: 'Description', type: 'text', placeholder: 'Payment for {{product_name}}', required: true },
        { key: 'customerName', label: 'Customer Name', type: 'text', placeholder: '{{customer_name}}' },
        { key: 'customerEmail', label: 'Customer Email', type: 'email', placeholder: '{{customer_email}}' },
        { key: 'customerPhone', label: 'Customer Phone', type: 'text', placeholder: '{{customer_phone}}' },
        { key: 'expireBy', label: 'Expire After (minutes)', type: 'number', placeholder: '1440', default: '1440' },
      ]},
      { id: 'create_refund', name: 'Create Refund', icon: '💸', description: 'Process refund', fields: [
        { key: 'paymentId', label: 'Payment ID', type: 'text', placeholder: '{{payment_id}}', required: true },
        { key: 'amount', label: 'Amount (paise)', type: 'number', placeholder: 'Leave empty for full refund' },
        { key: 'notes', label: 'Notes (JSON)', type: 'textarea', placeholder: '{"reason": "customer_request"}' },
      ]},
      { id: 'fetch_payment', name: 'Fetch Payment', icon: '🔍', description: 'Get payment details', fields: [
        { key: 'paymentId', label: 'Payment ID', type: 'text', placeholder: '{{payment_id}}', required: true },
      ]},
    ],
    aiInstructions: 'Amounts must be in paise (smallest unit). Validate before processing payments.',
  },

  shopify: {
    triggers: [
      { id: 'order_created', name: 'Order Created', icon: '🛒', description: 'When new order is placed', dataFields: ['order_id', 'order_number', 'total_price', 'customer_email', 'line_items', 'shipping_address'] },
      { id: 'order_fulfilled', name: 'Order Fulfilled', icon: '📦', description: 'When order is shipped', dataFields: ['order_id', 'tracking_number', 'tracking_url', 'fulfillment_status'] },
      { id: 'order_cancelled', name: 'Order Cancelled', icon: '❌', description: 'When order is cancelled', dataFields: ['order_id', 'cancel_reason', 'refund_amount'] },
      { id: 'customer_created', name: 'Customer Created', icon: '👤', description: 'When new customer signs up', dataFields: ['customer_id', 'email', 'first_name', 'last_name', 'phone'] },
      { id: 'product_updated', name: 'Product Updated', icon: '📝', description: 'When product is modified', dataFields: ['product_id', 'title', 'variants', 'inventory_quantity'] },
      { id: 'checkout_abandoned', name: 'Checkout Abandoned', icon: '🛑', description: 'When checkout is abandoned', dataFields: ['checkout_id', 'email', 'abandoned_url', 'total_price', 'line_items'] },
    ],
    actions: [
      { id: 'create_order', name: 'Create Order', icon: '🛒', description: 'Create draft order', fields: [
        { key: 'customerEmail', label: 'Customer Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'lineItems', label: 'Line Items (JSON)', type: 'textarea', placeholder: '[{"variant_id": 123456, "quantity": 1}]', required: true },
        { key: 'shippingAddress', label: 'Shipping Address (JSON)', type: 'textarea', placeholder: '{"first_name": "{{first_name}}", "address1": "{{address}}", "city": "{{city}}", "zip": "{{zip}}", "country": "IN"}' },
        { key: 'note', label: 'Order Note', type: 'text', placeholder: 'Via WhatsApp Bot' },
      ]},
      { id: 'update_order', name: 'Update Order', icon: '✏️', description: 'Update order details', fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', placeholder: '{{order_id}}', required: true },
        { key: 'note', label: 'Note', type: 'textarea', placeholder: '{{update_note}}' },
        { key: 'tags', label: 'Tags', type: 'text', placeholder: 'whatsapp, priority' },
      ]},
      { id: 'fulfill_order', name: 'Fulfill Order', icon: '📦', description: 'Mark as shipped', fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', placeholder: '{{order_id}}', required: true },
        { key: 'trackingNumber', label: 'Tracking Number', type: 'text', placeholder: '{{tracking_number}}' },
        { key: 'trackingCompany', label: 'Shipping Company', type: 'text', placeholder: 'FedEx' },
        { key: 'notifyCustomer', label: 'Notify Customer', type: 'select', options: ['true', 'false'], default: 'true' },
      ]},
      { id: 'get_order', name: 'Get Order', icon: '🔍', description: 'Fetch order details', fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', placeholder: '{{order_id}}' },
        { key: 'orderNumber', label: 'Or Order Number', type: 'text', placeholder: '{{order_number}}' },
      ]},
      { id: 'search_products', name: 'Search Products', icon: '🔍', description: 'Search product catalog', fields: [
        { key: 'query', label: 'Search Query', type: 'text', placeholder: '{{product_query}}', required: true },
        { key: 'limit', label: 'Max Results', type: 'number', placeholder: '10', default: '10' },
      ]},
      { id: 'update_inventory', name: 'Update Inventory', icon: '📊', description: 'Adjust stock level', fields: [
        { key: 'inventoryItemId', label: 'Inventory Item ID', type: 'text', placeholder: '{{inventory_item_id}}', required: true },
        { key: 'adjustment', label: 'Adjustment (+/-)', type: 'number', placeholder: '-1', required: true },
      ]},
    ],
    aiInstructions: 'Help customers find products. Provide order status updates. Handle returns gracefully.',
  },

  woocommerce: {
    triggers: [
      { id: 'order_created', name: 'Order Created', icon: '🛒', description: 'When new order is placed', dataFields: ['order_id', 'status', 'total', 'billing_email', 'line_items', 'billing_address'] },
      { id: 'order_status_changed', name: 'Order Status Changed', icon: '🔄', description: 'When order status updates', dataFields: ['order_id', 'old_status', 'new_status'] },
      { id: 'order_completed', name: 'Order Completed', icon: '✅', description: 'When order is completed', dataFields: ['order_id', 'total', 'customer_email'] },
      { id: 'customer_created', name: 'Customer Created', icon: '👤', description: 'When customer registers', dataFields: ['customer_id', 'email', 'first_name', 'last_name'] },
      { id: 'product_low_stock', name: 'Low Stock Alert', icon: '⚠️', description: 'When product stock is low', dataFields: ['product_id', 'name', 'stock_quantity'] },
    ],
    actions: [
      { id: 'create_order', name: 'Create Order', icon: '🛒', description: 'Create new order', fields: [
        { key: 'customerEmail', label: 'Customer Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'lineItems', label: 'Line Items (JSON)', type: 'textarea', placeholder: '[{"product_id": 123, "quantity": 1}]', required: true },
        { key: 'billingAddress', label: 'Billing Address (JSON)', type: 'textarea', placeholder: '{"first_name": "{{name}}", "email": "{{email}}", "phone": "{{phone}}"}' },
        { key: 'status', label: 'Status', type: 'select', options: ['pending', 'processing', 'on-hold', 'completed'], default: 'pending' },
      ]},
      { id: 'update_order_status', name: 'Update Order Status', icon: '🔄', description: 'Change order status', fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', placeholder: '{{order_id}}', required: true },
        { key: 'status', label: 'New Status', type: 'select', options: ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded'], required: true },
        { key: 'note', label: 'Order Note', type: 'textarea', placeholder: 'Status updated via AI agent' },
      ]},
      { id: 'get_order', name: 'Get Order', icon: '🔍', description: 'Fetch order details', fields: [
        { key: 'orderId', label: 'Order ID', type: 'text', placeholder: '{{order_id}}', required: true },
      ]},
      { id: 'search_products', name: 'Search Products', icon: '🔍', description: 'Search products', fields: [
        { key: 'search', label: 'Search Term', type: 'text', placeholder: '{{product_query}}', required: true },
        { key: 'perPage', label: 'Results Per Page', type: 'number', placeholder: '10', default: '10' },
      ]},
      { id: 'create_customer', name: 'Create Customer', icon: '👤', description: 'Register customer', fields: [
        { key: 'email', label: 'Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{first_name}}' },
        { key: 'lastName', label: 'Last Name', type: 'text', placeholder: '{{last_name}}' },
        { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
      ]},
    ],
    aiInstructions: 'Assist with order inquiries. Provide product recommendations. Handle order status updates.',
  },

  paypal: {
    triggers: [
      { id: 'payment_completed', name: 'Payment Completed', icon: '✅', description: 'When payment is completed', dataFields: ['transaction_id', 'amount', 'currency', 'payer_email', 'payer_name'] },
      { id: 'payment_refunded', name: 'Payment Refunded', icon: '💸', description: 'When refund is processed', dataFields: ['refund_id', 'transaction_id', 'amount', 'status'] },
      { id: 'subscription_activated', name: 'Subscription Activated', icon: '🔄', description: 'When subscription starts', dataFields: ['subscription_id', 'plan_id', 'subscriber_email'] },
      { id: 'subscription_cancelled', name: 'Subscription Cancelled', icon: '🚫', description: 'When subscription ends', dataFields: ['subscription_id', 'cancellation_time'] },
      { id: 'dispute_created', name: 'Dispute Created', icon: '⚠️', description: 'When dispute is opened', dataFields: ['dispute_id', 'transaction_id', 'reason', 'amount'] },
    ],
    actions: [
      { id: 'create_payment_link', name: 'Create Payment', icon: '🔗', description: 'Create PayPal payment', fields: [
        { key: 'amount', label: 'Amount', type: 'number', placeholder: '99.99', required: true },
        { key: 'currency', label: 'Currency', type: 'text', placeholder: 'USD', default: 'USD' },
        { key: 'description', label: 'Description', type: 'text', placeholder: '{{product_name}}', required: true },
        { key: 'returnUrl', label: 'Return URL', type: 'text', placeholder: 'https://yoursite.com/success', required: true },
        { key: 'cancelUrl', label: 'Cancel URL', type: 'text', placeholder: 'https://yoursite.com/cancel', required: true },
      ]},
      { id: 'create_invoice', name: 'Create Invoice', icon: '📄', description: 'Send PayPal invoice', fields: [
        { key: 'recipientEmail', label: 'Recipient Email', type: 'email', placeholder: '{{customer_email}}', required: true },
        { key: 'items', label: 'Items (JSON)', type: 'textarea', placeholder: '[{"name": "{{product}}", "quantity": "1", "unit_amount": {"currency_code": "USD", "value": "99.99"}}]', required: true },
        { key: 'note', label: 'Note', type: 'textarea', placeholder: 'Thank you for your business!' },
      ]},
      { id: 'refund_payment', name: 'Refund Payment', icon: '💸', description: 'Issue refund', fields: [
        { key: 'captureId', label: 'Capture ID', type: 'text', placeholder: '{{capture_id}}', required: true },
        { key: 'amount', label: 'Amount', type: 'number', placeholder: 'Leave empty for full refund' },
        { key: 'note', label: 'Note to Payer', type: 'text', placeholder: 'Refund processed' },
      ]},
      { id: 'get_transaction', name: 'Get Transaction', icon: '🔍', description: 'Fetch transaction details', fields: [
        { key: 'transactionId', label: 'Transaction ID', type: 'text', placeholder: '{{transaction_id}}', required: true },
      ]},
    ],
    aiInstructions: 'Handle payment queries professionally. Verify transaction details before refunds.',
  },

  // ==================== PRODUCTIVITY ====================
  trello: {
    triggers: [
      { id: 'card_created', name: 'Card Created', icon: '➕', description: 'When new card is created', dataFields: ['card_id', 'name', 'description', 'list_id', 'list_name', 'board_id'] },
      { id: 'card_moved', name: 'Card Moved', icon: '📦', description: 'When card moves to different list', dataFields: ['card_id', 'card_name', 'old_list', 'new_list', 'board_id'] },
      { id: 'card_updated', name: 'Card Updated', icon: '✏️', description: 'When card is modified', dataFields: ['card_id', 'card_name', 'changed_fields'] },
      { id: 'comment_added', name: 'Comment Added', icon: '💬', description: 'When comment is added to card', dataFields: ['card_id', 'card_name', 'comment_text', 'author'] },
      { id: 'due_date_approaching', name: 'Due Date Soon', icon: '⏰', description: 'When card due date is approaching', dataFields: ['card_id', 'card_name', 'due_date', 'list_name'] },
    ],
    actions: [
      { id: 'create_card', name: 'Create Card', icon: '➕', description: 'Create new Trello card', fields: [
        { key: 'listId', label: 'List ID', type: 'text', placeholder: 'List ID from Trello', required: true, helpText: 'Find in list URL or API' },
        { key: 'name', label: 'Card Title', type: 'text', placeholder: '{{customer_name}} - {{inquiry_type}}', required: true },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: '**Contact:** {{customer_phone}}\n**Email:** {{customer_email}}\n\n**Details:**\n{{message}}' },
        { key: 'dueDate', label: 'Due Date', type: 'text', placeholder: '{{due_date}} or leave empty' },
        { key: 'labels', label: 'Label IDs', type: 'text', placeholder: 'label_id1,label_id2', helpText: 'Comma-separated label IDs' },
      ]},
      { id: 'move_card', name: 'Move Card', icon: '📦', description: 'Move card to different list', fields: [
        { key: 'cardId', label: 'Card ID', type: 'text', placeholder: '{{card_id}}', required: true },
        { key: 'listId', label: 'Destination List ID', type: 'text', placeholder: 'Target list ID', required: true },
      ]},
      { id: 'update_card', name: 'Update Card', icon: '✏️', description: 'Update card details', fields: [
        { key: 'cardId', label: 'Card ID', type: 'text', placeholder: '{{card_id}}', required: true },
        { key: 'name', label: 'New Name', type: 'text', placeholder: '{{updated_title}}' },
        { key: 'description', label: 'New Description', type: 'textarea', placeholder: '{{updated_description}}' },
        { key: 'dueDate', label: 'Due Date', type: 'text', placeholder: '{{new_due_date}}' },
      ]},
      { id: 'add_comment', name: 'Add Comment', icon: '💬', description: 'Add comment to card', fields: [
        { key: 'cardId', label: 'Card ID', type: 'text', placeholder: '{{card_id}}', required: true },
        { key: 'text', label: 'Comment', type: 'textarea', placeholder: '**Update {{timestamp}}:**\n{{ai_summary}}', required: true },
      ]},
      { id: 'add_member', name: 'Add Member', icon: '👤', description: 'Assign member to card', fields: [
        { key: 'cardId', label: 'Card ID', type: 'text', placeholder: '{{card_id}}', required: true },
        { key: 'memberId', label: 'Member ID', type: 'text', placeholder: 'Trello member ID', required: true },
      ]},
    ],
    aiInstructions: 'Create well-organized cards with clear titles. Move cards through workflow stages based on progress.',
  },

  asana: {
    triggers: [
      { id: 'task_created', name: 'Task Created', icon: '➕', description: 'When new task is created', dataFields: ['task_id', 'name', 'notes', 'project_id', 'assignee', 'due_date'] },
      { id: 'task_completed', name: 'Task Completed', icon: '✅', description: 'When task is marked complete', dataFields: ['task_id', 'name', 'completed_by', 'completed_at'] },
      { id: 'task_updated', name: 'Task Updated', icon: '✏️', description: 'When task is modified', dataFields: ['task_id', 'name', 'changed_fields'] },
      { id: 'comment_added', name: 'Comment Added', icon: '💬', description: 'When comment is added', dataFields: ['task_id', 'task_name', 'comment_text', 'author'] },
      { id: 'due_date_approaching', name: 'Due Date Soon', icon: '⏰', description: 'When task due date approaches', dataFields: ['task_id', 'task_name', 'due_date', 'assignee'] },
    ],
    actions: [
      { id: 'create_task', name: 'Create Task', icon: '➕', description: 'Create new Asana task', fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'Project GID', required: true },
        { key: 'name', label: 'Task Name', type: 'text', placeholder: '{{customer_name}} - Follow up', required: true },
        { key: 'notes', label: 'Description', type: 'textarea', placeholder: '**Contact Info:**\n- Phone: {{customer_phone}}\n- Email: {{customer_email}}\n\n**Notes:**\n{{message}}' },
        { key: 'dueOn', label: 'Due Date', type: 'text', placeholder: 'YYYY-MM-DD' },
        { key: 'assignee', label: 'Assignee Email', type: 'email', placeholder: 'team@company.com' },
      ]},
      { id: 'update_task', name: 'Update Task', icon: '✏️', description: 'Update task details', fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', placeholder: '{{task_id}}', required: true },
        { key: 'name', label: 'New Name', type: 'text', placeholder: '{{updated_name}}' },
        { key: 'notes', label: 'New Notes', type: 'textarea', placeholder: '{{updated_notes}}' },
        { key: 'completed', label: 'Mark Complete', type: 'select', options: ['true', 'false'] },
      ]},
      { id: 'add_comment', name: 'Add Comment', icon: '💬', description: 'Add comment to task', fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', placeholder: '{{task_id}}', required: true },
        { key: 'text', label: 'Comment', type: 'textarea', placeholder: '{{ai_update}}', required: true },
      ]},
      { id: 'add_subtask', name: 'Add Subtask', icon: '📝', description: 'Create subtask', fields: [
        { key: 'parentTaskId', label: 'Parent Task ID', type: 'text', placeholder: '{{task_id}}', required: true },
        { key: 'name', label: 'Subtask Name', type: 'text', placeholder: '{{subtask_name}}', required: true },
        { key: 'dueOn', label: 'Due Date', type: 'text', placeholder: 'YYYY-MM-DD' },
      ]},
      { id: 'assign_task', name: 'Assign Task', icon: '👤', description: 'Assign task to user', fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', placeholder: '{{task_id}}', required: true },
        { key: 'assignee', label: 'Assignee Email', type: 'email', placeholder: '{{assignee_email}}', required: true },
      ]},
    ],
    aiInstructions: 'Create actionable tasks with clear names and descriptions. Set realistic due dates.',
  },

  jira: {
    triggers: [
      { id: 'issue_created', name: 'Issue Created', icon: '➕', description: 'When new issue is created', dataFields: ['issue_key', 'summary', 'description', 'issue_type', 'priority', 'reporter'] },
      { id: 'issue_updated', name: 'Issue Updated', icon: '✏️', description: 'When issue is modified', dataFields: ['issue_key', 'summary', 'changed_fields', 'updated_by'] },
      { id: 'issue_status_changed', name: 'Status Changed', icon: '🔄', description: 'When issue status changes', dataFields: ['issue_key', 'summary', 'old_status', 'new_status'] },
      { id: 'comment_added', name: 'Comment Added', icon: '💬', description: 'When comment is added', dataFields: ['issue_key', 'comment_body', 'author'] },
      { id: 'issue_assigned', name: 'Issue Assigned', icon: '👤', description: 'When issue is assigned', dataFields: ['issue_key', 'summary', 'assignee', 'assigned_by'] },
    ],
    actions: [
      { id: 'create_issue', name: 'Create Issue', icon: '➕', description: 'Create Jira issue', fields: [
        { key: 'projectKey', label: 'Project Key', type: 'text', placeholder: 'PROJ', required: true },
        { key: 'issueType', label: 'Issue Type', type: 'select', options: ['Bug', 'Task', 'Story', 'Epic', 'Support'], default: 'Task', required: true },
        { key: 'summary', label: 'Summary', type: 'text', placeholder: '[{{customer_name}}] {{issue_summary}}', required: true },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'h3. Customer Details\n* *Name:* {{customer_name}}\n* *Phone:* {{customer_phone}}\n* *Email:* {{customer_email}}\n\nh3. Issue Details\n{{message}}' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['Highest', 'High', 'Medium', 'Low', 'Lowest'], default: 'Medium' },
        { key: 'assignee', label: 'Assignee (username)', type: 'text', placeholder: 'Leave empty for unassigned' },
        { key: 'labels', label: 'Labels', type: 'text', placeholder: 'whatsapp,customer-support', helpText: 'Comma-separated' },
      ]},
      { id: 'update_issue', name: 'Update Issue', icon: '✏️', description: 'Update issue fields', fields: [
        { key: 'issueKey', label: 'Issue Key', type: 'text', placeholder: 'PROJ-123', required: true },
        { key: 'summary', label: 'New Summary', type: 'text', placeholder: '{{updated_summary}}' },
        { key: 'description', label: 'New Description', type: 'textarea', placeholder: '{{updated_description}}' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['Highest', 'High', 'Medium', 'Low', 'Lowest'] },
      ]},
      { id: 'transition_issue', name: 'Change Status', icon: '🔄', description: 'Move issue to new status', fields: [
        { key: 'issueKey', label: 'Issue Key', type: 'text', placeholder: 'PROJ-123', required: true },
        { key: 'transitionName', label: 'Transition Name', type: 'text', placeholder: 'In Progress', required: true, helpText: 'e.g., "To Do", "In Progress", "Done"' },
      ]},
      { id: 'add_comment', name: 'Add Comment', icon: '💬', description: 'Add comment to issue', fields: [
        { key: 'issueKey', label: 'Issue Key', type: 'text', placeholder: 'PROJ-123', required: true },
        { key: 'body', label: 'Comment', type: 'textarea', placeholder: '*Update from AI Agent:*\n{{ai_summary}}', required: true },
      ]},
      { id: 'assign_issue', name: 'Assign Issue', icon: '👤', description: 'Assign to user', fields: [
        { key: 'issueKey', label: 'Issue Key', type: 'text', placeholder: 'PROJ-123', required: true },
        { key: 'assignee', label: 'Assignee Username', type: 'text', placeholder: '{{assignee}}', required: true },
      ]},
    ],
    aiInstructions: 'Create well-structured issues with proper categorization. Use Jira markup for formatting.',
  },

  monday: {
    triggers: [
      { id: 'item_created', name: 'Item Created', icon: '➕', description: 'When new item is created', dataFields: ['item_id', 'name', 'board_id', 'group_id', 'column_values'] },
      { id: 'item_updated', name: 'Item Updated', icon: '✏️', description: 'When item is modified', dataFields: ['item_id', 'name', 'changed_columns', 'previous_values'] },
      { id: 'status_changed', name: 'Status Changed', icon: '🔄', description: 'When status column changes', dataFields: ['item_id', 'item_name', 'old_status', 'new_status'] },
      { id: 'column_changed', name: 'Column Changed', icon: '📝', description: 'When specific column changes', dataFields: ['item_id', 'column_id', 'old_value', 'new_value'] },
    ],
    actions: [
      { id: 'create_item', name: 'Create Item', icon: '➕', description: 'Create new board item', fields: [
        { key: 'boardId', label: 'Board ID', type: 'text', placeholder: 'Board ID from URL', required: true },
        { key: 'groupId', label: 'Group ID', type: 'text', placeholder: 'Group ID (e.g., "new_group")', required: true },
        { key: 'itemName', label: 'Item Name', type: 'text', placeholder: '{{customer_name}} - {{request_type}}', required: true },
        { key: 'columnValues', label: 'Column Values (JSON)', type: 'textarea', placeholder: '{\n  "status": {"label": "New"},\n  "text": "{{customer_phone}}",\n  "email": {"email": "{{customer_email}}", "text": "{{customer_email}}"}\n}', helpText: 'Use Monday column IDs and value format' },
      ]},
      { id: 'update_item', name: 'Update Item', icon: '✏️', description: 'Update item columns', fields: [
        { key: 'itemId', label: 'Item ID', type: 'text', placeholder: '{{item_id}}', required: true },
        { key: 'columnValues', label: 'Column Values (JSON)', type: 'textarea', placeholder: '{"status": {"label": "Working on it"}}', required: true },
      ]},
      { id: 'change_status', name: 'Change Status', icon: '🔄', description: 'Update status column', fields: [
        { key: 'itemId', label: 'Item ID', type: 'text', placeholder: '{{item_id}}', required: true },
        { key: 'columnId', label: 'Status Column ID', type: 'text', placeholder: 'status', default: 'status' },
        { key: 'label', label: 'New Status Label', type: 'text', placeholder: 'Done', required: true },
      ]},
      { id: 'add_update', name: 'Add Update', icon: '💬', description: 'Add update/comment to item', fields: [
        { key: 'itemId', label: 'Item ID', type: 'text', placeholder: '{{item_id}}', required: true },
        { key: 'body', label: 'Update Text', type: 'textarea', placeholder: '<b>AI Agent Update:</b><br>{{ai_summary}}', required: true },
      ]},
      { id: 'move_item', name: 'Move to Group', icon: '📦', description: 'Move item to different group', fields: [
        { key: 'itemId', label: 'Item ID', type: 'text', placeholder: '{{item_id}}', required: true },
        { key: 'groupId', label: 'Target Group ID', type: 'text', placeholder: 'completed_group', required: true },
      ]},
    ],
    aiInstructions: 'Create items with all relevant columns filled. Update status based on conversation progress.',
  },

  clickup: {
    triggers: [
      { id: 'task_created', name: 'Task Created', icon: '➕', description: 'When new task is created', dataFields: ['task_id', 'name', 'description', 'status', 'list_id', 'assignees'] },
      { id: 'task_updated', name: 'Task Updated', icon: '✏️', description: 'When task is modified', dataFields: ['task_id', 'name', 'changed_fields'] },
      { id: 'task_status_changed', name: 'Status Changed', icon: '🔄', description: 'When task status changes', dataFields: ['task_id', 'task_name', 'old_status', 'new_status'] },
      { id: 'task_completed', name: 'Task Completed', icon: '✅', description: 'When task is marked done', dataFields: ['task_id', 'task_name', 'completed_by'] },
      { id: 'comment_added', name: 'Comment Added', icon: '💬', description: 'When comment is added', dataFields: ['task_id', 'comment_text', 'author'] },
    ],
    actions: [
      { id: 'create_task', name: 'Create Task', icon: '➕', description: 'Create new ClickUp task', fields: [
        { key: 'listId', label: 'List ID', type: 'text', placeholder: 'List ID from ClickUp', required: true },
        { key: 'name', label: 'Task Name', type: 'text', placeholder: '{{customer_name}} - {{request_type}}', required: true },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: '## Contact Info\n- **Phone:** {{customer_phone}}\n- **Email:** {{customer_email}}\n\n## Details\n{{message}}' },
        { key: 'status', label: 'Status', type: 'text', placeholder: 'to do', default: 'to do' },
        { key: 'priority', label: 'Priority (1-4)', type: 'number', placeholder: '3', helpText: '1=Urgent, 2=High, 3=Normal, 4=Low' },
        { key: 'dueDate', label: 'Due Date (timestamp)', type: 'text', placeholder: '{{due_timestamp}}' },
        { key: 'assignees', label: 'Assignee User IDs', type: 'text', placeholder: 'user_id1,user_id2', helpText: 'Comma-separated' },
      ]},
      { id: 'update_task', name: 'Update Task', icon: '✏️', description: 'Update task details', fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', placeholder: '{{task_id}}', required: true },
        { key: 'name', label: 'New Name', type: 'text', placeholder: '{{updated_name}}' },
        { key: 'description', label: 'New Description', type: 'textarea', placeholder: '{{updated_description}}' },
        { key: 'status', label: 'New Status', type: 'text', placeholder: 'in progress' },
        { key: 'priority', label: 'Priority (1-4)', type: 'number', placeholder: '2' },
      ]},
      { id: 'add_comment', name: 'Add Comment', icon: '💬', description: 'Add comment to task', fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', placeholder: '{{task_id}}', required: true },
        { key: 'commentText', label: 'Comment', type: 'textarea', placeholder: '**Update:** {{ai_summary}}', required: true },
      ]},
      { id: 'change_status', name: 'Change Status', icon: '🔄', description: 'Update task status', fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', placeholder: '{{task_id}}', required: true },
        { key: 'status', label: 'New Status', type: 'text', placeholder: 'complete', required: true },
      ]},
      { id: 'add_checklist', name: 'Add Checklist', icon: '☑️', description: 'Add checklist to task', fields: [
        { key: 'taskId', label: 'Task ID', type: 'text', placeholder: '{{task_id}}', required: true },
        { key: 'name', label: 'Checklist Name', type: 'text', placeholder: 'Follow-up Steps', required: true },
        { key: 'items', label: 'Items (one per line)', type: 'textarea', placeholder: 'Send quote\nSchedule call\nFollow up in 3 days' },
      ]},
    ],
    aiInstructions: 'Create detailed tasks with proper status and priority. Add checklists for multi-step processes.',
  },

  calendly: {
    triggers: [
      { id: 'event_scheduled', name: 'Event Scheduled', icon: '📅', description: 'When meeting is booked', dataFields: ['event_id', 'event_type', 'invitee_name', 'invitee_email', 'start_time', 'end_time', 'location', 'questions_answers'] },
      { id: 'event_cancelled', name: 'Event Cancelled', icon: '❌', description: 'When meeting is cancelled', dataFields: ['event_id', 'invitee_name', 'invitee_email', 'cancel_reason', 'cancelled_by'] },
      { id: 'event_rescheduled', name: 'Event Rescheduled', icon: '🔄', description: 'When meeting is rescheduled', dataFields: ['event_id', 'invitee_name', 'old_time', 'new_time'] },
    ],
    actions: [
      { id: 'get_scheduling_link', name: 'Get Scheduling Link', icon: '🔗', description: 'Get Calendly booking link', fields: [
        { key: 'eventTypeSlug', label: 'Event Type Slug', type: 'text', placeholder: '30min-meeting', required: true, helpText: 'From your Calendly event URL' },
        { key: 'prefillName', label: 'Prefill Name', type: 'text', placeholder: '{{customer_name}}' },
        { key: 'prefillEmail', label: 'Prefill Email', type: 'email', placeholder: '{{customer_email}}' },
      ]},
      { id: 'cancel_event', name: 'Cancel Event', icon: '❌', description: 'Cancel scheduled event', fields: [
        { key: 'eventUuid', label: 'Event UUID', type: 'text', placeholder: '{{event_id}}', required: true },
        { key: 'reason', label: 'Cancellation Reason', type: 'text', placeholder: 'Customer requested reschedule' },
      ]},
      { id: 'list_events', name: 'List Events', icon: '📋', description: 'Get scheduled events', fields: [
        { key: 'inviteeEmail', label: 'Invitee Email', type: 'email', placeholder: '{{customer_email}}' },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'canceled'], default: 'active' },
        { key: 'maxResults', label: 'Max Results', type: 'number', placeholder: '10', default: '10' },
      ]},
    ],
    aiInstructions: 'Share booking links proactively. Confirm meeting details after scheduling.',
  },

  // ==================== DEVELOPER TOOLS ====================
  webhook: {
    triggers: [
      { id: 'webhook_received', name: 'Webhook Received', icon: '📩', description: 'When data is received', dataFields: ['headers', 'body', 'method', 'timestamp'] },
    ],
    actions: [
      { id: 'send_webhook', name: 'Send Webhook', icon: '🔗', description: 'POST data to URL', fields: [
        { key: 'url', label: 'Webhook URL', type: 'text', placeholder: 'https://your-endpoint.com/webhook', required: true },
        { key: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'PUT', 'PATCH'], default: 'POST' },
        { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Content-Type": "application/json", "Authorization": "Bearer {{token}}"}' },
        { key: 'body', label: 'Request Body (JSON)', type: 'textarea', placeholder: '{\n  "event": "new_lead",\n  "data": {\n    "name": "{{customer_name}}",\n    "phone": "{{customer_phone}}",\n    "email": "{{customer_email}}",\n    "message": "{{message}}"\n  },\n  "timestamp": "{{timestamp}}"\n}', required: true },
      ]},
      { id: 'send_get', name: 'GET Request', icon: '🌐', description: 'Send GET request', fields: [
        { key: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/data?email={{customer_email}}', required: true },
        { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer {{token}}"}' },
      ]},
    ],
    aiInstructions: 'Format JSON properly. Include appropriate headers for authentication.',
  },

  custom_api: {
    triggers: [
      { id: 'api_response', name: 'API Response', icon: '📩', description: 'When API returns data', dataFields: ['status_code', 'headers', 'body', 'endpoint'] },
    ],
    actions: [
      { id: 'call_api', name: 'Call REST API', icon: '🌐', description: 'Make HTTP request', fields: [
        { key: 'url', label: 'API Endpoint', type: 'text', placeholder: 'https://api.example.com/v1/resource', required: true },
        { key: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], default: 'GET', required: true },
        { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{api_key}}",\n  "X-Custom-Header": "value"\n}' },
        { key: 'body', label: 'Request Body (JSON)', type: 'textarea', placeholder: '{\n  "field1": "{{value1}}",\n  "field2": "{{value2}}"\n}', helpText: 'Only for POST, PUT, PATCH' },
        { key: 'queryParams', label: 'Query Parameters', type: 'textarea', placeholder: 'param1={{value1}}&param2={{value2}}', helpText: 'Will be appended to URL' },
      ]},
      { id: 'call_with_auth', name: 'Call with Basic Auth', icon: '🔐', description: 'API call with basic auth', fields: [
        { key: 'url', label: 'API Endpoint', type: 'text', placeholder: 'https://api.example.com/resource', required: true },
        { key: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], default: 'GET' },
        { key: 'username', label: 'Username', type: 'text', placeholder: '{{api_username}}', required: true },
        { key: 'password', label: 'Password', type: 'text', placeholder: '{{api_password}}', required: true },
        { key: 'body', label: 'Request Body', type: 'textarea', placeholder: '{}' },
      ]},
    ],
    aiInstructions: 'Use appropriate HTTP methods. Handle errors gracefully. Validate responses.',
  },

  graphql: {
    triggers: [
      { id: 'subscription_data', name: 'Subscription Data', icon: '📩', description: 'When subscription receives data', dataFields: ['operation', 'data', 'timestamp'] },
    ],
    actions: [
      { id: 'query', name: 'Execute Query', icon: '🔍', description: 'Run GraphQL query', fields: [
        { key: 'endpoint', label: 'GraphQL Endpoint', type: 'text', placeholder: 'https://api.example.com/graphql', required: true },
        { key: 'query', label: 'Query', type: 'textarea', placeholder: 'query GetUser($email: String!) {\n  user(email: $email) {\n    id\n    name\n    email\n  }\n}', required: true },
        { key: 'variables', label: 'Variables (JSON)', type: 'textarea', placeholder: '{"email": "{{customer_email}}"}' },
        { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer {{token}}"}' },
      ]},
      { id: 'mutation', name: 'Execute Mutation', icon: '✏️', description: 'Run GraphQL mutation', fields: [
        { key: 'endpoint', label: 'GraphQL Endpoint', type: 'text', placeholder: 'https://api.example.com/graphql', required: true },
        { key: 'mutation', label: 'Mutation', type: 'textarea', placeholder: 'mutation CreateUser($input: UserInput!) {\n  createUser(input: $input) {\n    id\n    name\n  }\n}', required: true },
        { key: 'variables', label: 'Variables (JSON)', type: 'textarea', placeholder: '{"input": {"name": "{{customer_name}}", "email": "{{customer_email}}"}}', required: true },
        { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer {{token}}"}' },
      ]},
    ],
    aiInstructions: 'Write efficient queries requesting only needed fields. Use variables for dynamic data.',
  },

  github: {
    triggers: [
      { id: 'issue_opened', name: 'Issue Opened', icon: '➕', description: 'When new issue is created', dataFields: ['issue_number', 'title', 'body', 'author', 'labels', 'repo'] },
      { id: 'issue_closed', name: 'Issue Closed', icon: '✅', description: 'When issue is closed', dataFields: ['issue_number', 'title', 'closed_by', 'repo'] },
      { id: 'pr_opened', name: 'PR Opened', icon: '🔀', description: 'When pull request is opened', dataFields: ['pr_number', 'title', 'author', 'branch', 'repo'] },
      { id: 'pr_merged', name: 'PR Merged', icon: '✅', description: 'When PR is merged', dataFields: ['pr_number', 'title', 'merged_by', 'repo'] },
      { id: 'comment_created', name: 'Comment Created', icon: '💬', description: 'When comment is added', dataFields: ['issue_number', 'comment_body', 'author'] },
      { id: 'push', name: 'Push Event', icon: '📤', description: 'When code is pushed', dataFields: ['ref', 'commits', 'pusher', 'repo'] },
    ],
    actions: [
      { id: 'create_issue', name: 'Create Issue', icon: '➕', description: 'Create GitHub issue', fields: [
        { key: 'owner', label: 'Repo Owner', type: 'text', placeholder: 'username or org', required: true },
        { key: 'repo', label: 'Repository', type: 'text', placeholder: 'repo-name', required: true },
        { key: 'title', label: 'Issue Title', type: 'text', placeholder: '[{{customer_name}}] {{issue_summary}}', required: true },
        { key: 'body', label: 'Issue Body', type: 'textarea', placeholder: '## Customer Details\n- **Name:** {{customer_name}}\n- **Email:** {{customer_email}}\n\n## Issue Description\n{{message}}' },
        { key: 'labels', label: 'Labels', type: 'text', placeholder: 'bug,customer-report', helpText: 'Comma-separated' },
        { key: 'assignees', label: 'Assignees', type: 'text', placeholder: 'username1,username2', helpText: 'Comma-separated usernames' },
      ]},
      { id: 'add_comment', name: 'Add Comment', icon: '💬', description: 'Comment on issue/PR', fields: [
        { key: 'owner', label: 'Repo Owner', type: 'text', placeholder: 'username or org', required: true },
        { key: 'repo', label: 'Repository', type: 'text', placeholder: 'repo-name', required: true },
        { key: 'issueNumber', label: 'Issue/PR Number', type: 'number', placeholder: '{{issue_number}}', required: true },
        { key: 'body', label: 'Comment', type: 'textarea', placeholder: '**AI Agent Update:**\n{{ai_summary}}', required: true },
      ]},
      { id: 'close_issue', name: 'Close Issue', icon: '✅', description: 'Close an issue', fields: [
        { key: 'owner', label: 'Repo Owner', type: 'text', placeholder: 'username', required: true },
        { key: 'repo', label: 'Repository', type: 'text', placeholder: 'repo-name', required: true },
        { key: 'issueNumber', label: 'Issue Number', type: 'number', placeholder: '{{issue_number}}', required: true },
      ]},
      { id: 'add_labels', name: 'Add Labels', icon: '🏷️', description: 'Add labels to issue', fields: [
        { key: 'owner', label: 'Repo Owner', type: 'text', placeholder: 'username', required: true },
        { key: 'repo', label: 'Repository', type: 'text', placeholder: 'repo-name', required: true },
        { key: 'issueNumber', label: 'Issue Number', type: 'number', placeholder: '{{issue_number}}', required: true },
        { key: 'labels', label: 'Labels to Add', type: 'text', placeholder: 'in-progress,priority-high', required: true },
      ]},
      { id: 'create_gist', name: 'Create Gist', icon: '📝', description: 'Create code snippet', fields: [
        { key: 'description', label: 'Description', type: 'text', placeholder: 'Code from {{customer_name}}' },
        { key: 'filename', label: 'Filename', type: 'text', placeholder: 'snippet.js', required: true },
        { key: 'content', label: 'Content', type: 'textarea', placeholder: '{{code_content}}', required: true },
        { key: 'public', label: 'Public', type: 'select', options: ['true', 'false'], default: 'false' },
      ]},
    ],
    aiInstructions: 'Create well-formatted issues with proper markdown. Use appropriate labels for categorization.',
  },

  // GitLab
  gitlab: {
    triggers: [
      { id: 'issue_opened', name: 'Issue Opened', icon: '➕', description: 'When new issue is created', dataFields: ['issue_iid', 'title', 'description', 'author', 'labels', 'project'] },
      { id: 'issue_closed', name: 'Issue Closed', icon: '✅', description: 'When issue is closed', dataFields: ['issue_iid', 'title', 'closed_by', 'project'] },
      { id: 'mr_opened', name: 'Merge Request Opened', icon: '🔀', description: 'When MR is opened', dataFields: ['mr_iid', 'title', 'author', 'source_branch', 'target_branch'] },
      { id: 'mr_merged', name: 'Merge Request Merged', icon: '✅', description: 'When MR is merged', dataFields: ['mr_iid', 'title', 'merged_by', 'project'] },
      { id: 'pipeline_completed', name: 'Pipeline Completed', icon: '🔧', description: 'When CI/CD pipeline completes', dataFields: ['pipeline_id', 'status', 'ref', 'duration'] },
      { id: 'push', name: 'Push Event', icon: '📤', description: 'When code is pushed', dataFields: ['ref', 'commits', 'user_name', 'project'] },
    ],
    actions: [
      { id: 'create_issue', name: 'Create Issue', icon: '➕', description: 'Create GitLab issue', fields: [
        { key: 'projectId', label: 'Project ID/Path', type: 'text', placeholder: 'namespace/project or 12345', required: true },
        { key: 'title', label: 'Issue Title', type: 'text', placeholder: '[{{customer_name}}] {{issue_summary}}', required: true },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: '## Details\n{{message}}' },
        { key: 'labels', label: 'Labels', type: 'text', placeholder: 'bug,customer-report', helpText: 'Comma-separated' },
        { key: 'assignee_ids', label: 'Assignee IDs', type: 'text', placeholder: '1,2,3', helpText: 'Comma-separated user IDs' },
      ]},
      { id: 'add_comment', name: 'Add Note', icon: '💬', description: 'Comment on issue/MR', fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'namespace/project', required: true },
        { key: 'issueIid', label: 'Issue IID', type: 'number', placeholder: '{{issue_iid}}', required: true },
        { key: 'body', label: 'Note Content', type: 'textarea', placeholder: '**Update:** {{ai_summary}}', required: true },
      ]},
      { id: 'trigger_pipeline', name: 'Trigger Pipeline', icon: '🚀', description: 'Run CI/CD pipeline', fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'namespace/project', required: true },
        { key: 'ref', label: 'Branch/Tag', type: 'text', placeholder: 'main', required: true },
        { key: 'variables', label: 'Variables (JSON)', type: 'textarea', placeholder: '{"key": "DEPLOY_ENV", "value": "production"}' },
      ]},
      { id: 'close_issue', name: 'Close Issue', icon: '✅', description: 'Close an issue', fields: [
        { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'namespace/project', required: true },
        { key: 'issueIid', label: 'Issue IID', type: 'number', placeholder: '{{issue_iid}}', required: true },
      ]},
    ],
    aiInstructions: 'Create well-structured issues. Use GitLab markdown for formatting.',
  },

  // Bitbucket
  bitbucket: {
    triggers: [
      { id: 'issue_created', name: 'Issue Created', icon: '➕', description: 'When new issue is created', dataFields: ['issue_id', 'title', 'content', 'reporter', 'priority'] },
      { id: 'issue_updated', name: 'Issue Updated', icon: '✏️', description: 'When issue is updated', dataFields: ['issue_id', 'title', 'changes', 'actor'] },
      { id: 'pr_created', name: 'Pull Request Created', icon: '🔀', description: 'When PR is created', dataFields: ['pr_id', 'title', 'author', 'source_branch', 'destination_branch'] },
      { id: 'pr_merged', name: 'Pull Request Merged', icon: '✅', description: 'When PR is merged', dataFields: ['pr_id', 'title', 'merged_by'] },
      { id: 'pipeline_completed', name: 'Pipeline Completed', icon: '🔧', description: 'When pipeline completes', dataFields: ['pipeline_uuid', 'state', 'build_number', 'duration'] },
      { id: 'push', name: 'Push Event', icon: '📤', description: 'When code is pushed', dataFields: ['commits', 'actor', 'repository', 'branch'] },
    ],
    actions: [
      { id: 'create_issue', name: 'Create Issue', icon: '➕', description: 'Create Bitbucket issue', fields: [
        { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'your-workspace', required: true },
        { key: 'repoSlug', label: 'Repository Slug', type: 'text', placeholder: 'repo-name', required: true },
        { key: 'title', label: 'Issue Title', type: 'text', placeholder: '{{issue_summary}}', required: true },
        { key: 'content', label: 'Description', type: 'textarea', placeholder: '{{message}}' },
        { key: 'priority', label: 'Priority', type: 'select', options: ['trivial', 'minor', 'major', 'critical', 'blocker'], default: 'major' },
        { key: 'kind', label: 'Kind', type: 'select', options: ['bug', 'enhancement', 'proposal', 'task'], default: 'bug' },
      ]},
      { id: 'add_comment', name: 'Add Comment', icon: '💬', description: 'Comment on issue/PR', fields: [
        { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'your-workspace', required: true },
        { key: 'repoSlug', label: 'Repository', type: 'text', placeholder: 'repo-name', required: true },
        { key: 'issueId', label: 'Issue ID', type: 'number', placeholder: '{{issue_id}}', required: true },
        { key: 'content', label: 'Comment', type: 'textarea', placeholder: '**Update:** {{ai_summary}}', required: true },
      ]},
      { id: 'trigger_pipeline', name: 'Trigger Pipeline', icon: '🚀', description: 'Run pipeline', fields: [
        { key: 'workspace', label: 'Workspace', type: 'text', placeholder: 'your-workspace', required: true },
        { key: 'repoSlug', label: 'Repository', type: 'text', placeholder: 'repo-name', required: true },
        { key: 'target_ref_name', label: 'Branch', type: 'text', placeholder: 'main', required: true },
      ]},
    ],
    aiInstructions: 'Create issues with appropriate priority and kind. Use Bitbucket markdown.',
  },

  // Redis
  redis: {
    triggers: [], // Redis is primarily action-only
    actions: [
      { id: 'set_value', name: 'Set Key', icon: '📝', description: 'Set a key-value pair', fields: [
        { key: 'key', label: 'Key', type: 'text', placeholder: 'user:{{customer_id}}', required: true },
        { key: 'value', label: 'Value', type: 'textarea', placeholder: '{{data}}', required: true },
        { key: 'expireSeconds', label: 'Expire After (seconds)', type: 'number', placeholder: '3600', helpText: 'Leave empty for no expiration' },
      ]},
      { id: 'get_value', name: 'Get Key', icon: '📖', description: 'Get value by key', fields: [
        { key: 'key', label: 'Key', type: 'text', placeholder: 'user:{{customer_id}}', required: true },
      ]},
      { id: 'delete_key', name: 'Delete Key', icon: '🗑️', description: 'Delete a key', fields: [
        { key: 'key', label: 'Key', type: 'text', placeholder: 'user:{{customer_id}}', required: true },
      ]},
      { id: 'increment', name: 'Increment', icon: '➕', description: 'Increment numeric value', fields: [
        { key: 'key', label: 'Key', type: 'text', placeholder: 'counter:{{event_type}}', required: true },
        { key: 'amount', label: 'Amount', type: 'number', placeholder: '1', default: '1' },
      ]},
      { id: 'hash_set', name: 'Hash Set', icon: '🗂️', description: 'Set hash field', fields: [
        { key: 'key', label: 'Hash Key', type: 'text', placeholder: 'user:{{customer_id}}', required: true },
        { key: 'field', label: 'Field', type: 'text', placeholder: 'last_seen', required: true },
        { key: 'value', label: 'Value', type: 'text', placeholder: '{{timestamp}}', required: true },
      ]},
      { id: 'list_push', name: 'List Push', icon: '📋', description: 'Push to list', fields: [
        { key: 'key', label: 'List Key', type: 'text', placeholder: 'events:{{customer_id}}', required: true },
        { key: 'value', label: 'Value', type: 'textarea', placeholder: '{{event_data}}', required: true },
        { key: 'direction', label: 'Direction', type: 'select', options: ['left', 'right'], default: 'right' },
      ]},
    ],
    aiInstructions: 'Use appropriate key naming conventions. Set TTL for cache data.',
  },

  // Elasticsearch
  elasticsearch: {
    triggers: [], // Elasticsearch is primarily action-only
    actions: [
      { id: 'index_document', name: 'Index Document', icon: '📝', description: 'Add/update document', fields: [
        { key: 'index', label: 'Index Name', type: 'text', placeholder: 'conversations', required: true },
        { key: 'id', label: 'Document ID', type: 'text', placeholder: '{{conversation_id}}', helpText: 'Leave empty for auto-generated' },
        { key: 'document', label: 'Document (JSON)', type: 'textarea', placeholder: '{\n  "customer": "{{customer_name}}",\n  "message": "{{message}}",\n  "timestamp": "{{timestamp}}"\n}', required: true },
      ]},
      { id: 'search', name: 'Search', icon: '🔍', description: 'Search documents', fields: [
        { key: 'index', label: 'Index Name', type: 'text', placeholder: 'conversations', required: true },
        { key: 'query', label: 'Query (JSON)', type: 'textarea', placeholder: '{\n  "match": {\n    "message": "{{search_term}}"\n  }\n}', required: true },
        { key: 'size', label: 'Max Results', type: 'number', placeholder: '10', default: '10' },
      ]},
      { id: 'get_document', name: 'Get Document', icon: '📖', description: 'Get document by ID', fields: [
        { key: 'index', label: 'Index Name', type: 'text', placeholder: 'conversations', required: true },
        { key: 'id', label: 'Document ID', type: 'text', placeholder: '{{document_id}}', required: true },
      ]},
      { id: 'delete_document', name: 'Delete Document', icon: '🗑️', description: 'Delete document', fields: [
        { key: 'index', label: 'Index Name', type: 'text', placeholder: 'conversations', required: true },
        { key: 'id', label: 'Document ID', type: 'text', placeholder: '{{document_id}}', required: true },
      ]},
      { id: 'bulk_index', name: 'Bulk Index', icon: '📦', description: 'Index multiple documents', fields: [
        { key: 'index', label: 'Index Name', type: 'text', placeholder: 'conversations', required: true },
        { key: 'documents', label: 'Documents (JSON Array)', type: 'textarea', placeholder: '[\n  {"id": "1", "doc": {...}},\n  {"id": "2", "doc": {...}}\n]', required: true },
      ]},
    ],
    aiInstructions: 'Use proper Elasticsearch query DSL. Index documents with appropriate fields for search.',
  },

  // Custom Integration - Build from scratch
  custom_integration: {
    triggers: [
      { id: 'webhook_received', name: 'Webhook Received', icon: '🎣', description: 'When webhook data is received', dataFields: ['payload', 'headers', 'method', 'query_params', 'timestamp'] },
      { id: 'scheduled_trigger', name: 'Scheduled Trigger', icon: '⏰', description: 'Run on a schedule', dataFields: ['trigger_time', 'schedule_id', 'execution_count'] },
      { id: 'manual_trigger', name: 'Manual Trigger', icon: '▶️', description: 'Manually start workflow', dataFields: ['triggered_by', 'timestamp', 'manual_input'] },
      { id: 'api_polling', name: 'API Polling', icon: '🔄', description: 'Poll API for changes', dataFields: ['response_data', 'status_code', 'polling_interval', 'last_check'] },
      { id: 'file_upload', name: 'File Upload', icon: '📁', description: 'When file is uploaded', dataFields: ['file_name', 'file_size', 'file_type', 'file_url'] },
      { id: 'data_changed', name: 'Data Changed', icon: '📊', description: 'When monitored data changes', dataFields: ['old_value', 'new_value', 'field_name', 'change_type'] },
    ],
    actions: [
      { id: 'http_request', name: 'HTTP Request', icon: '🌐', description: 'Make custom HTTP request', fields: [
        { key: 'url', label: 'Request URL', type: 'text', placeholder: 'https://api.example.com/endpoint', required: true },
        { key: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'], required: true },
        { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{\n  "Authorization": "Bearer {{api_key}}",\n  "Content-Type": "application/json"\n}' },
        { key: 'body', label: 'Request Body', type: 'textarea', placeholder: '{\n  "data": "{{variable}}"\n}' },
        { key: 'timeout', label: 'Timeout (ms)', type: 'number', placeholder: '30000', helpText: 'Request timeout in milliseconds' },
        { key: 'retry', label: 'Retry on Failure', type: 'select', options: ['0', '1', '2', '3'], default: '1' },
      ]},
      { id: 'transform_data', name: 'Transform Data', icon: '🔄', description: 'Transform and map data', fields: [
        { key: 'inputPath', label: 'Input Data Path', type: 'text', placeholder: '$.response.data', helpText: 'JSONPath to source data' },
        { key: 'transformation', label: 'Transformation Script', type: 'textarea', placeholder: '// Transform input data\nreturn input.map(item => ({\n  id: item.id,\n  name: item.fullName,\n  email: item.contact.email\n}));' },
        { key: 'outputVariable', label: 'Output Variable', type: 'text', placeholder: 'transformed_data', required: true },
      ]},
      { id: 'run_code', name: 'Run Code', icon: '💻', description: 'Execute custom JavaScript', fields: [
        { key: 'code', label: 'JavaScript Code', type: 'textarea', placeholder: '// Access variables with context.variables\nconst result = context.variables.input_data;\n\n// Process data\nconst processed = result.filter(item => item.active);\n\n// Return result\nreturn { success: true, data: processed };', required: true },
        { key: 'timeout', label: 'Execution Timeout', type: 'number', placeholder: '5000', helpText: 'Max execution time (ms)' },
      ]},
      { id: 'set_variable', name: 'Set Variable', icon: '📝', description: 'Set workflow variable', fields: [
        { key: 'variableName', label: 'Variable Name', type: 'text', placeholder: 'my_variable', required: true },
        { key: 'value', label: 'Value', type: 'textarea', placeholder: '{{computed_value}}', required: true },
        { key: 'scope', label: 'Scope', type: 'select', options: ['workflow', 'step', 'global'], default: 'workflow' },
      ]},
      { id: 'conditional_branch', name: 'Conditional Branch', icon: '🔀', description: 'Branch based on condition', fields: [
        { key: 'condition', label: 'Condition', type: 'textarea', placeholder: '{{status}} === "active" && {{count}} > 0', required: true },
        { key: 'trueAction', label: 'If True', type: 'text', placeholder: 'Continue to next step' },
        { key: 'falseAction', label: 'If False', type: 'text', placeholder: 'Skip to end' },
      ]},
      { id: 'loop', name: 'Loop/Iterator', icon: '🔁', description: 'Loop through array data', fields: [
        { key: 'arrayPath', label: 'Array to Loop', type: 'text', placeholder: '{{items}}', required: true },
        { key: 'itemVariable', label: 'Item Variable Name', type: 'text', placeholder: 'current_item', required: true },
        { key: 'indexVariable', label: 'Index Variable Name', type: 'text', placeholder: 'index' },
        { key: 'maxIterations', label: 'Max Iterations', type: 'number', placeholder: '100', helpText: 'Safety limit' },
      ]},
      { id: 'delay', name: 'Delay', icon: '⏱️', description: 'Wait before continuing', fields: [
        { key: 'duration', label: 'Duration (seconds)', type: 'number', placeholder: '5', required: true },
        { key: 'unit', label: 'Time Unit', type: 'select', options: ['seconds', 'minutes', 'hours'], default: 'seconds' },
      ]},
      { id: 'aggregate', name: 'Aggregate Data', icon: '📊', description: 'Combine and aggregate data', fields: [
        { key: 'operation', label: 'Operation', type: 'select', options: ['sum', 'average', 'count', 'min', 'max', 'concat', 'unique'], required: true },
        { key: 'inputArray', label: 'Input Array', type: 'text', placeholder: '{{data_array}}', required: true },
        { key: 'field', label: 'Field to Aggregate', type: 'text', placeholder: 'amount', helpText: 'For object arrays' },
        { key: 'outputVariable', label: 'Output Variable', type: 'text', placeholder: 'aggregated_result', required: true },
      ]},
      { id: 'error_handler', name: 'Error Handler', icon: '⚠️', description: 'Handle errors gracefully', fields: [
        { key: 'onError', label: 'On Error Action', type: 'select', options: ['retry', 'skip', 'stop', 'fallback'], required: true },
        { key: 'retryCount', label: 'Retry Count', type: 'number', placeholder: '3' },
        { key: 'fallbackValue', label: 'Fallback Value', type: 'textarea', placeholder: '{"status": "error", "message": "Operation failed"}' },
        { key: 'notifyOnError', label: 'Notify on Error', type: 'select', options: ['yes', 'no'], default: 'no' },
      ]},
      { id: 'log_output', name: 'Log Output', icon: '📋', description: 'Log data for debugging', fields: [
        { key: 'message', label: 'Log Message', type: 'textarea', placeholder: 'Processing {{item_count}} items at {{timestamp}}', required: true },
        { key: 'level', label: 'Log Level', type: 'select', options: ['info', 'debug', 'warn', 'error'], default: 'info' },
        { key: 'includeContext', label: 'Include Context', type: 'select', options: ['yes', 'no'], default: 'yes' },
      ]},
    ],
    aiInstructions: 'Use custom integration for advanced workflows. Validate JSON in headers/body fields. Use proper error handling.',
  },

  // Webhook Outgoing
  webhook_outgoing: {
    triggers: [
      { id: 'any_trigger', name: 'Any Event', icon: '🎯', description: 'Trigger from any source', dataFields: ['event_type', 'event_data', 'timestamp'] },
    ],
    actions: [
      { id: 'send_webhook', name: 'Send Webhook', icon: '📤', description: 'Send data to external URL', fields: [
        { key: 'url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.example.com/webhook', required: true },
        { key: 'method', label: 'HTTP Method', type: 'select', options: ['POST', 'PUT', 'PATCH'], required: true },
        { key: 'payload', label: 'Payload (JSON)', type: 'textarea', placeholder: '{\n  "event": "{{event_type}}",\n  "data": {{data}}\n}', required: true },
        { key: 'headers', label: 'Custom Headers (JSON)', type: 'textarea', placeholder: '{\n  "X-Custom-Header": "value"\n}' },
        { key: 'auth_type', label: 'Authentication', type: 'select', options: ['none', 'basic', 'bearer', 'api_key'] },
        { key: 'auth_value', label: 'Auth Value', type: 'password', placeholder: 'Token or credentials' },
      ]},
    ],
    aiInstructions: 'Ensure webhook URL is valid. Use proper JSON formatting for payload.',
  },
};

// Extract actions from comprehensive integrations for the form
const integrationActions: Record<string, any[]> = {};
Object.entries(comprehensiveIntegrations).forEach(([key, config]) => {
  integrationActions[key] = config.actions || [];
});

// Old format actions for backward compatibility
const legacyActions: Record<string, any[]> = {
  outlook: [
    { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send an email', templates: [
      { key: 'to', label: 'To Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Booking Confirmed' },
      { key: 'body', label: 'Email Body', type: 'textarea', placeholder: 'Dear {{customer_name}}, your booking is confirmed.' },
    ]},
  ],
  smtp: [
    { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send via SMTP', templates: [
      { key: 'to', label: 'To Email(s)', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'New Lead: {{customer_name}}' },
      { key: 'body', label: 'Email Body', type: 'textarea', placeholder: 'Name: {{customer_name}}\nPhone: {{customer_phone}}\nMessage: {{message}}' },
    ]},
  ],
  sendgrid: [
    { id: 'send_email', name: 'Send Email', icon: '📧', description: 'Send transactional email', templates: [
      { key: 'to', label: 'To Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Welcome {{customer_name}}!' },
      { key: 'body', label: 'Email Body', type: 'textarea', placeholder: 'Thank you for your interest...' },
    ]},
    { id: 'add_contact', name: 'Add Contact', icon: '👤', description: 'Add to contact list', templates: [
      { key: 'email', label: 'Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{customer_name}}' },
    ]},
  ],
  mailchimp: [
    { id: 'add_subscriber', name: 'Add Subscriber', icon: '👤', description: 'Add to mailing list', templates: [
      { key: 'email', label: 'Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{customer_name}}' },
      { key: 'tags', label: 'Tags (comma separated)', type: 'text', placeholder: 'lead, website' },
    ]},
  ],
  // Google Actions
  google_sheets: [
    { id: 'add_row', name: 'Add Row', icon: '➕', description: 'Append data as new row', templates: [
      { key: 'values', label: 'Row Values (comma separated)', type: 'textarea', placeholder: '{{customer_name}}, {{customer_email}}, {{customer_phone}}, {{date}}, {{message}}', helpText: 'Values will be added as columns A, B, C...' },
    ]},
    { id: 'update_row', name: 'Update Row', icon: '✏️', description: 'Update existing row', templates: [
      { key: 'searchColumn', label: 'Search Column', type: 'text', placeholder: 'A', helpText: 'Column to search in' },
      { key: 'searchValue', label: 'Search Value', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'updateColumn', label: 'Update Column', type: 'text', placeholder: 'D' },
      { key: 'updateValue', label: 'New Value', type: 'text', placeholder: '{{status}}' },
    ]},
  ],
  google_drive: [
    { id: 'upload_file', name: 'Upload File', icon: '📤', description: 'Upload a file', templates: [
      { key: 'fileName', label: 'File Name', type: 'text', placeholder: 'lead_{{customer_name}}_{{date}}.pdf' },
      { key: 'fileUrl', label: 'File URL', type: 'text', placeholder: '{{document_url}}' },
    ]},
  ],
  google_calendar: [
    { id: 'create_event', name: 'Create Event', icon: '📅', description: 'Create calendar event', templates: [
      { key: 'title', label: 'Event Title', type: 'text', placeholder: 'Appointment with {{customer_name}}' },
      { key: 'startTime', label: 'Start Time', type: 'text', placeholder: '{{appointment_datetime}}', helpText: 'ISO format: 2024-12-20T10:00:00' },
      { key: 'duration', label: 'Duration (minutes)', type: 'text', placeholder: '30', default: '30' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Customer: {{customer_name}}\nPhone: {{customer_phone}}' },
    ]},
  ],
  // CRM Actions
  hubspot: [
    { id: 'create_contact', name: 'Create Contact', icon: '👤', description: 'Create new contact', templates: [
      { key: 'email', label: 'Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{customer_name}}' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
    ]},
    { id: 'create_deal', name: 'Create Deal', icon: '💰', description: 'Create new deal', templates: [
      { key: 'dealName', label: 'Deal Name', type: 'text', placeholder: '{{customer_name}} - {{service}}' },
      { key: 'amount', label: 'Amount', type: 'text', placeholder: '{{amount}}' },
      { key: 'stage', label: 'Stage', type: 'text', placeholder: 'appointmentscheduled' },
    ]},
  ],
  salesforce: [
    { id: 'create_lead', name: 'Create Lead', icon: '🎯', description: 'Create new lead', templates: [
      { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{customer_name}}' },
      { key: 'email', label: 'Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
      { key: 'company', label: 'Company', type: 'text', placeholder: '{{company}}', default: 'Individual' },
    ]},
  ],
  pipedrive: [
    { id: 'create_person', name: 'Create Person', icon: '👤', description: 'Create contact', templates: [
      { key: 'name', label: 'Name', type: 'text', placeholder: '{{customer_name}}' },
      { key: 'email', label: 'Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
    ]},
    { id: 'create_deal', name: 'Create Deal', icon: '💰', description: 'Create deal', templates: [
      { key: 'title', label: 'Deal Title', type: 'text', placeholder: '{{customer_name}} - Inquiry' },
      { key: 'value', label: 'Value', type: 'text', placeholder: '{{amount}}' },
    ]},
  ],
  zoho_crm: [
    { id: 'create_lead', name: 'Create Lead', icon: '🎯', description: 'Create new lead', templates: [
      { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{customer_name}}' },
      { key: 'email', label: 'Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
    ]},
  ],
  freshsales: [
    { id: 'create_contact', name: 'Create Contact', icon: '👤', description: 'Create contact', templates: [
      { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{customer_name}}' },
      { key: 'email', label: 'Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
    ]},
  ],
  // Automation/Webhook Actions  
  zapier: [
    { id: 'trigger_zap', name: 'Trigger Zap', icon: '⚡', description: 'Send data to Zapier', templates: [
      { key: 'customData', label: 'Custom Data (JSON)', type: 'textarea', placeholder: '{"name": "{{customer_name}}", "email": "{{customer_email}}", "phone": "{{customer_phone}}"}', helpText: 'This data will be sent to your Zap' },
    ]},
  ],
  make: [
    { id: 'trigger_scenario', name: 'Trigger Scenario', icon: '⚡', description: 'Send data to Make', templates: [
      { key: 'customData', label: 'Custom Data (JSON)', type: 'textarea', placeholder: '{"name": "{{customer_name}}", "email": "{{customer_email}}", "event": "{{trigger_event}}"}' },
    ]},
  ],
  n8n: [
    { id: 'trigger_workflow', name: 'Trigger Workflow', icon: '⚡', description: 'Send data to n8n', templates: [
      { key: 'customData', label: 'Custom Data (JSON)', type: 'textarea', placeholder: '{"name": "{{customer_name}}", "email": "{{customer_email}}"}' },
    ]},
  ],
  webhook: [
    { id: 'send_webhook', name: 'Send Webhook', icon: '🔗', description: 'Send HTTP request', templates: [
      { key: 'payload', label: 'JSON Payload', type: 'textarea', placeholder: '{"event": "{{trigger_event}}", "customer": {"name": "{{customer_name}}", "email": "{{customer_email}}"}}' },
    ]},
  ],
  // Storage Actions
  airtable: [
    { id: 'create_record', name: 'Create Record', icon: '➕', description: 'Add new record', templates: [
      { key: 'fields', label: 'Fields (JSON)', type: 'textarea', placeholder: '{"Name": "{{customer_name}}", "Email": "{{customer_email}}", "Phone": "{{customer_phone}}", "Date": "{{date}}"}' },
    ]},
  ],
  notion: [
    { id: 'create_page', name: 'Create Page', icon: '📄', description: 'Create database entry', templates: [
      { key: 'title', label: 'Title', type: 'text', placeholder: '{{customer_name}} - {{date}}' },
      { key: 'properties', label: 'Properties (JSON)', type: 'textarea', placeholder: '{"Email": "{{customer_email}}", "Phone": "{{customer_phone}}", "Status": "New"}' },
    ]},
  ],
  firebase: [
    { id: 'add_document', name: 'Add Document', icon: '➕', description: 'Add to Firestore', templates: [
      { key: 'collection', label: 'Collection', type: 'text', placeholder: 'leads' },
      { key: 'data', label: 'Document Data (JSON)', type: 'textarea', placeholder: '{"name": "{{customer_name}}", "email": "{{customer_email}}", "createdAt": "{{timestamp}}"}' },
    ]},
  ],
  supabase: [
    { id: 'insert_row', name: 'Insert Row', icon: '➕', description: 'Insert into table', templates: [
      { key: 'table', label: 'Table Name', type: 'text', placeholder: 'leads' },
      { key: 'data', label: 'Row Data (JSON)', type: 'textarea', placeholder: '{"name": "{{customer_name}}", "email": "{{customer_email}}", "phone": "{{customer_phone}}"}' },
    ]},
  ],
  mongodb: [
    { id: 'insert_document', name: 'Insert Document', icon: '➕', description: 'Insert document', templates: [
      { key: 'document', label: 'Document (JSON)', type: 'textarea', placeholder: '{"name": "{{customer_name}}", "email": "{{customer_email}}", "phone": "{{customer_phone}}"}' },
    ]},
  ],
  dropbox: [
    { id: 'upload_file', name: 'Upload File', icon: '📤', description: 'Upload file to Dropbox', templates: [
      { key: 'path', label: 'File Path', type: 'text', placeholder: '/leads/{{customer_name}}_{{date}}.txt' },
      { key: 'content', label: 'File Content', type: 'textarea', placeholder: 'Customer: {{customer_name}}\nEmail: {{customer_email}}\nPhone: {{customer_phone}}' },
    ]},
  ],
  aws_s3: [
    { id: 'upload_file', name: 'Upload File', icon: '📤', description: 'Upload to S3 bucket', templates: [
      { key: 'key', label: 'File Key (path)', type: 'text', placeholder: 'leads/{{customer_email}}_{{timestamp}}.json' },
      { key: 'content', label: 'File Content', type: 'textarea', placeholder: '{"name": "{{customer_name}}", "email": "{{customer_email}}"}' },
    ]},
  ],
  // Productivity Actions
  trello: [
    { id: 'create_card', name: 'Create Card', icon: '📋', description: 'Create Trello card', templates: [
      { key: 'listId', label: 'List ID', type: 'text', placeholder: 'Your list ID' },
      { key: 'name', label: 'Card Name', type: 'text', placeholder: '{{customer_name}} - Follow up' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Email: {{customer_email}}\nPhone: {{customer_phone}}\nMessage: {{message}}' },
    ]},
  ],
  asana: [
    { id: 'create_task', name: 'Create Task', icon: '✅', description: 'Create Asana task', templates: [
      { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'Your project GID' },
      { key: 'name', label: 'Task Name', type: 'text', placeholder: 'Follow up: {{customer_name}}' },
      { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Contact: {{customer_email}}, {{customer_phone}}' },
    ]},
  ],
  jira: [
    { id: 'create_issue', name: 'Create Issue', icon: '🎫', description: 'Create Jira issue', templates: [
      { key: 'issueType', label: 'Issue Type', type: 'text', placeholder: 'Task', default: 'Task' },
      { key: 'summary', label: 'Summary', type: 'text', placeholder: '{{customer_name}} - {{subject}}' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Customer: {{customer_name}}\nEmail: {{customer_email}}\nDetails: {{message}}' },
    ]},
  ],
  monday: [
    { id: 'create_item', name: 'Create Item', icon: '➕', description: 'Create Monday item', templates: [
      { key: 'itemName', label: 'Item Name', type: 'text', placeholder: '{{customer_name}}' },
      { key: 'columnValues', label: 'Column Values (JSON)', type: 'textarea', placeholder: '{"email": "{{customer_email}}", "phone": "{{customer_phone}}"}' },
    ]},
  ],
  clickup: [
    { id: 'create_task', name: 'Create Task', icon: '✅', description: 'Create ClickUp task', templates: [
      { key: 'name', label: 'Task Name', type: 'text', placeholder: 'Follow up with {{customer_name}}' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: '{{customer_email}} - {{customer_phone}}' },
    ]},
  ],
  calendly: [
    { id: 'get_event', name: 'Log Event', icon: '📅', description: 'Log Calendly events', templates: [
      { key: 'eventType', label: 'Event Type', type: 'text', placeholder: 'All events' },
    ]},
  ],
  // E-commerce Actions
  stripe: [
    { id: 'create_customer', name: 'Create Customer', icon: '👤', description: 'Create Stripe customer', templates: [
      { key: 'email', label: 'Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'name', label: 'Name', type: 'text', placeholder: '{{customer_name}}' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
    ]},
    { id: 'create_invoice', name: 'Create Invoice', icon: '📄', description: 'Create invoice', templates: [
      { key: 'customerId', label: 'Customer ID', type: 'text', placeholder: '{{stripe_customer_id}}' },
      { key: 'amount', label: 'Amount (cents)', type: 'text', placeholder: '{{amount}}' },
      { key: 'description', label: 'Description', type: 'text', placeholder: '{{service}}' },
    ]},
  ],
  razorpay: [
    { id: 'create_customer', name: 'Create Customer', icon: '👤', description: 'Create customer', templates: [
      { key: 'email', label: 'Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'name', label: 'Name', type: 'text', placeholder: '{{customer_name}}' },
      { key: 'contact', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
    ]},
  ],
  shopify: [
    { id: 'create_customer', name: 'Create Customer', icon: '👤', description: 'Create customer', templates: [
      { key: 'email', label: 'Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{customer_name}}' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '{{customer_phone}}' },
    ]},
  ],
  woocommerce: [
    { id: 'create_customer', name: 'Create Customer', icon: '👤', description: 'Create customer', templates: [
      { key: 'email', label: 'Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'firstName', label: 'First Name', type: 'text', placeholder: '{{customer_name}}' },
    ]},
  ],
  paypal: [
    { id: 'create_invoice', name: 'Create Invoice', icon: '📄', description: 'Create PayPal invoice', templates: [
      { key: 'recipientEmail', label: 'Recipient Email', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'amount', label: 'Amount', type: 'text', placeholder: '{{amount}}' },
      { key: 'currency', label: 'Currency', type: 'text', placeholder: 'USD', default: 'USD' },
      { key: 'description', label: 'Description', type: 'text', placeholder: '{{service}}' },
    ]},
  ],
  // Google Missing Actions
  google_docs: [
    { id: 'create_document', name: 'Create Document', icon: '📝', description: 'Create new Google Doc', templates: [
      { key: 'title', label: 'Document Title', type: 'text', placeholder: 'Lead - {{customer_name}} - {{date}}' },
      { key: 'content', label: 'Document Content', type: 'textarea', placeholder: 'Customer Details\n\nName: {{customer_name}}\nEmail: {{customer_email}}\nPhone: {{customer_phone}}\nMessage: {{message}}' },
    ]},
  ],
  google_forms: [
    { id: 'log_response', name: 'Log Form Response', icon: '📋', description: 'Log form submission data', templates: [
      { key: 'logFormat', label: 'Log Format', type: 'textarea', placeholder: 'Form submitted by {{customer_name}} at {{timestamp}}' },
    ]},
  ],
  // Automation Missing Actions
  ifttt: [
    { id: 'trigger_applet', name: 'Trigger Applet', icon: '🔀', description: 'Trigger IFTTT applet', templates: [
      { key: 'value1', label: 'Value 1', type: 'text', placeholder: '{{customer_name}}' },
      { key: 'value2', label: 'Value 2', type: 'text', placeholder: '{{customer_email}}' },
      { key: 'value3', label: 'Value 3', type: 'text', placeholder: '{{customer_phone}}' },
    ]},
  ],
  power_automate: [
    { id: 'trigger_flow', name: 'Trigger Flow', icon: '⚙️', description: 'Trigger Power Automate flow', templates: [
      { key: 'payload', label: 'Data Payload (JSON)', type: 'textarea', placeholder: '{"name": "{{customer_name}}", "email": "{{customer_email}}", "phone": "{{customer_phone}}", "event": "{{trigger_event}}"}' },
    ]},
  ],
  // Developer Missing Actions
  custom_api: [
    { id: 'send_request', name: 'Send API Request', icon: '🌐', description: 'Send HTTP request', templates: [
      { key: 'body', label: 'Request Body (JSON)', type: 'textarea', placeholder: '{"customer": {"name": "{{customer_name}}", "email": "{{customer_email}}", "phone": "{{customer_phone}}"}, "event": "{{trigger_event}}"}' },
    ]},
  ],
  graphql: [
    { id: 'execute_mutation', name: 'Execute Mutation', icon: '◼️', description: 'Run GraphQL mutation', templates: [
      { key: 'query', label: 'GraphQL Mutation', type: 'textarea', placeholder: 'mutation CreateLead($input: LeadInput!) {\n  createLead(input: $input) {\n    id\n    name\n  }\n}' },
      { key: 'variables', label: 'Variables (JSON)', type: 'textarea', placeholder: '{"input": {"name": "{{customer_name}}", "email": "{{customer_email}}"}}' },
    ]},
  ],
  github: [
    { id: 'create_issue', name: 'Create Issue', icon: '🐛', description: 'Create GitHub issue', templates: [
      { key: 'title', label: 'Issue Title', type: 'text', placeholder: 'New Lead: {{customer_name}}' },
      { key: 'body', label: 'Issue Body', type: 'textarea', placeholder: '## New Lead\n\n- **Name:** {{customer_name}}\n- **Email:** {{customer_email}}\n- **Phone:** {{customer_phone}}\n- **Message:** {{message}}' },
      { key: 'labels', label: 'Labels (comma separated)', type: 'text', placeholder: 'lead, new' },
    ]},
  ],
};

// Merge legacy actions into integrationActions
Object.entries(legacyActions).forEach(([key, actions]) => {
  if (!integrationActions[key]) {
    integrationActions[key] = actions;
  }
});

// Available template variables with descriptions
const templateVariables = [
  { var: '{{customer_name}}', desc: 'Customer full name' },
  { var: '{{customer_email}}', desc: 'Customer email' },
  { var: '{{customer_phone}}', desc: 'Customer phone' },
  { var: '{{date}}', desc: 'Current/appointment date' },
  { var: '{{time}}', desc: 'Appointment time' },
  { var: '{{message}}', desc: 'Customer message' },
  { var: '{{agent_name}}', desc: 'AI Agent name' },
  { var: '{{trigger_event}}', desc: 'Event that triggered this' },
  { var: '{{amount}}', desc: 'Order/payment amount' },
  { var: '{{order_id}}', desc: 'Order ID' },
  { var: '{{timestamp}}', desc: 'Current timestamp' },
  { var: '{{ai_response}}', desc: 'AI generated response' },
  { var: '{{ai_summary}}', desc: 'AI conversation summary' },
];

// ============= QUICK SETUP TEMPLATES =============
// Pre-configured templates for common use cases - users just select and go!
interface QuickSetupTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  integrationId: string;
  trigger: string;
  action: string;
  aiInstructions: string;
  prefilledConfig: Record<string, string>;
  prefilledActionConfig: Record<string, string>;
}

const quickSetupTemplates: QuickSetupTemplate[] = [
  // 🔥 LEAD CAPTURE
  {
    id: 'lead_to_sheets',
    name: 'Lead → Google Sheets',
    description: 'Automatically save all new leads to a Google Sheet',
    icon: '📊',
    category: 'Lead Capture',
    integrationId: 'google_sheets',
    trigger: 'lead_captured',
    action: 'append_row',
    aiInstructions: 'Extract customer details and format consistently',
    prefilledConfig: {},
    prefilledActionConfig: { 
      sheetName: 'Leads',
      values: '{{customer_name}}, {{customer_email}}, {{customer_phone}}, {{message}}, {{timestamp}}'
    },
  },
  {
    id: 'lead_to_hubspot',
    name: 'Lead → HubSpot CRM',
    description: 'Create HubSpot contact for every new lead',
    icon: '🧲',
    category: 'Lead Capture',
    integrationId: 'hubspot',
    trigger: 'lead_captured',
    action: 'create_contact',
    aiInstructions: 'Qualify the lead and set appropriate lifecycle stage',
    prefilledConfig: {},
    prefilledActionConfig: {
      lifecyclestage: 'lead',
    },
  },
  {
    id: 'lead_to_airtable',
    name: 'Lead → Airtable',
    description: 'Store leads in your Airtable base',
    icon: '📑',
    category: 'Lead Capture',
    integrationId: 'airtable',
    trigger: 'lead_captured',
    action: 'create_record',
    aiInstructions: 'Capture all relevant lead information',
    prefilledConfig: {},
    prefilledActionConfig: {
      fields: '{"Name": "{{customer_name}}", "Email": "{{customer_email}}", "Phone": "{{customer_phone}}", "Message": "{{message}}", "Status": "New"}',
    },
  },
  {
    id: 'lead_to_notion',
    name: 'Lead → Notion Database',
    description: 'Add leads to your Notion CRM database',
    icon: '📓',
    category: 'Lead Capture',
    integrationId: 'notion',
    trigger: 'lead_captured',
    action: 'add_database_item',
    aiInstructions: 'Organize lead information in Notion format',
    prefilledConfig: {},
    prefilledActionConfig: {},
  },
  {
    id: 'lead_to_slack',
    name: 'Lead → Slack Alert',
    description: 'Get instant Slack notification for new leads',
    icon: '💼',
    category: 'Lead Capture',
    integrationId: 'slack',
    trigger: 'lead_captured',
    action: 'send_message',
    aiInstructions: 'Format lead details in a clear, actionable message',
    prefilledConfig: {},
    prefilledActionConfig: {
      message: '🎯 *New Lead!*\n\n*Name:* {{customer_name}}\n*Phone:* {{customer_phone}}\n*Email:* {{customer_email}}\n\n*Message:* {{message}}',
    },
  },

  // 📅 APPOINTMENTS
  {
    id: 'booking_to_calendar',
    name: 'Booking → Google Calendar',
    description: 'Auto-create calendar events for appointments',
    icon: '📅',
    category: 'Appointments',
    integrationId: 'google_calendar',
    trigger: 'appointment_booked',
    action: 'create_event',
    aiInstructions: 'Create professional calendar events with clear details',
    prefilledConfig: {},
    prefilledActionConfig: {
      duration: '30',
    },
  },
  {
    id: 'booking_whatsapp_confirm',
    name: 'Booking → WhatsApp Confirmation',
    description: 'Send booking confirmation via WhatsApp',
    icon: '💬',
    category: 'Appointments',
    integrationId: 'whatsapp',
    trigger: 'appointment_booked',
    action: 'send_message',
    aiInstructions: 'Send friendly, professional booking confirmation',
    prefilledConfig: {},
    prefilledActionConfig: {
      message: '✅ Your appointment is confirmed!\n\n📅 Date: {{date}}\n⏰ Time: {{time}}\n\nWe look forward to seeing you!',
    },
  },
  {
    id: 'booking_to_email',
    name: 'Booking → Email Confirmation',
    description: 'Send email confirmation for appointments',
    icon: '📧',
    category: 'Appointments',
    integrationId: 'gmail',
    trigger: 'appointment_booked',
    action: 'send_email',
    aiInstructions: 'Send professional email confirmation with all details',
    prefilledConfig: {},
    prefilledActionConfig: {
      subject: 'Appointment Confirmed - {{date}}',
      body: 'Dear {{customer_name}},\n\nYour appointment has been confirmed.\n\nDate: {{date}}\nTime: {{time}}\n\nBest regards',
    },
  },
  {
    id: 'reminder_whatsapp',
    name: 'Reminder → WhatsApp',
    description: 'Send appointment reminders via WhatsApp',
    icon: '⏰',
    category: 'Appointments',
    integrationId: 'whatsapp',
    trigger: 'appointment_reminder',
    action: 'send_message',
    aiInstructions: 'Send friendly reminder with appointment details',
    prefilledConfig: {},
    prefilledActionConfig: {
      message: '⏰ Reminder: You have an appointment tomorrow!\n\n📅 {{date}} at {{time}}\n\nReply YES to confirm or RESCHEDULE to change.',
    },
  },

  // 🛒 E-COMMERCE
  {
    id: 'order_to_sheets',
    name: 'Order → Google Sheets',
    description: 'Log all orders to a Google Sheet',
    icon: '🛒',
    category: 'E-commerce',
    integrationId: 'google_sheets',
    trigger: 'order_placed',
    action: 'append_row',
    aiInstructions: 'Record order details for tracking and reporting',
    prefilledConfig: {},
    prefilledActionConfig: {
      sheetName: 'Orders',
      values: '{{order_id}}, {{customer_name}}, {{customer_email}}, {{amount}}, {{timestamp}}',
    },
  },
  {
    id: 'order_whatsapp_confirm',
    name: 'Order → WhatsApp Confirmation',
    description: 'Send order confirmation via WhatsApp',
    icon: '📦',
    category: 'E-commerce',
    integrationId: 'whatsapp',
    trigger: 'order_placed',
    action: 'send_message',
    aiInstructions: 'Send friendly order confirmation with details',
    prefilledConfig: {},
    prefilledActionConfig: {
      message: '🛒 Order Confirmed!\n\nOrder #{{order_id}}\nAmount: {{amount}}\n\nThank you for your purchase, {{customer_name}}!',
    },
  },
  {
    id: 'payment_to_slack',
    name: 'Payment → Slack Alert',
    description: 'Get Slack notification for every payment',
    icon: '💰',
    category: 'E-commerce',
    integrationId: 'slack',
    trigger: 'payment_received',
    action: 'send_message',
    aiInstructions: 'Format payment notification clearly',
    prefilledConfig: {},
    prefilledActionConfig: {
      message: '💰 *Payment Received!*\n\nFrom: {{customer_name}}\nAmount: {{amount}}\nOrder: #{{order_id}}',
    },
  },
  {
    id: 'payment_stripe_link',
    name: 'Invoice → Stripe Payment Link',
    description: 'Send Stripe payment links for invoices',
    icon: '💳',
    category: 'E-commerce',
    integrationId: 'stripe',
    trigger: 'invoice_sent',
    action: 'create_payment_link',
    aiInstructions: 'Generate secure payment links for customers',
    prefilledConfig: {},
    prefilledActionConfig: {},
  },

  // 📋 TASK MANAGEMENT
  {
    id: 'lead_to_trello',
    name: 'Lead → Trello Card',
    description: 'Create Trello card for each new lead',
    icon: '📋',
    category: 'Task Management',
    integrationId: 'trello',
    trigger: 'lead_captured',
    action: 'create_card',
    aiInstructions: 'Create organized cards with all lead details',
    prefilledConfig: {},
    prefilledActionConfig: {
      name: '{{customer_name}} - New Lead',
      description: '**Contact:** {{customer_phone}}\n**Email:** {{customer_email}}\n\n**Message:**\n{{message}}',
    },
  },
  {
    id: 'lead_to_asana',
    name: 'Lead → Asana Task',
    description: 'Create Asana task for follow-up',
    icon: '✅',
    category: 'Task Management',
    integrationId: 'asana',
    trigger: 'lead_captured',
    action: 'create_task',
    aiInstructions: 'Create actionable tasks with clear descriptions',
    prefilledConfig: {},
    prefilledActionConfig: {
      name: 'Follow up: {{customer_name}}',
      notes: '**Contact:** {{customer_phone}}\n**Email:** {{customer_email}}\n\n**Details:**\n{{message}}',
    },
  },
  {
    id: 'lead_to_clickup',
    name: 'Lead → ClickUp Task',
    description: 'Create ClickUp task for new leads',
    icon: '🎯',
    category: 'Task Management',
    integrationId: 'clickup',
    trigger: 'lead_captured',
    action: 'create_task',
    aiInstructions: 'Create detailed tasks with proper priority',
    prefilledConfig: {},
    prefilledActionConfig: {
      priority: '3',
      status: 'to do',
    },
  },
  {
    id: 'support_to_jira',
    name: 'Support → Jira Ticket',
    description: 'Create Jira issue for support requests',
    icon: '🎫',
    category: 'Task Management',
    integrationId: 'jira',
    trigger: 'message_received',
    action: 'create_issue',
    aiInstructions: 'Create well-structured support tickets',
    prefilledConfig: {},
    prefilledActionConfig: {
      issueType: 'Support',
      priority: 'Medium',
    },
  },

  // 🔔 NOTIFICATIONS
  {
    id: 'message_to_email',
    name: 'Message → Email Alert',
    description: 'Get email for every customer message',
    icon: '📬',
    category: 'Notifications',
    integrationId: 'gmail',
    trigger: 'message_received',
    action: 'send_email',
    aiInstructions: 'Forward important messages with context',
    prefilledConfig: {},
    prefilledActionConfig: {
      subject: 'New Message from {{customer_name}}',
      body: 'You received a new message:\n\nFrom: {{customer_name}}\nPhone: {{customer_phone}}\n\nMessage:\n{{message}}',
    },
  },
  {
    id: 'message_to_telegram',
    name: 'Message → Telegram Alert',
    description: 'Forward messages to Telegram',
    icon: '✈️',
    category: 'Notifications',
    integrationId: 'telegram',
    trigger: 'message_received',
    action: 'send_message',
    aiInstructions: 'Format messages for Telegram with emojis',
    prefilledConfig: {},
    prefilledActionConfig: {
      message: '📩 *New Message*\n\nFrom: {{customer_name}}\n📱 {{customer_phone}}\n\n{{message}}',
      parseMode: 'Markdown',
    },
  },
  {
    id: 'message_to_discord',
    name: 'Message → Discord Alert',
    description: 'Send notifications to Discord channel',
    icon: '🎮',
    category: 'Notifications',
    integrationId: 'discord',
    trigger: 'message_received',
    action: 'send_message',
    aiInstructions: 'Format for Discord with markdown',
    prefilledConfig: {},
    prefilledActionConfig: {
      message: '**📩 New Message**\n\nFrom: {{customer_name}}\nPhone: {{customer_phone}}\n\n> {{message}}',
    },
  },
  {
    id: 'message_to_teams',
    name: 'Message → Teams Alert',
    description: 'Send notifications to Microsoft Teams',
    icon: '💼',
    category: 'Notifications',
    integrationId: 'microsoft_teams',
    trigger: 'message_received',
    action: 'send_message',
    aiInstructions: 'Format professionally for Teams',
    prefilledConfig: {},
    prefilledActionConfig: {
      message: '**New Customer Message**\n\n- **From:** {{customer_name}}\n- **Phone:** {{customer_phone}}\n\n**Message:**\n{{message}}',
    },
  },

  // 🤖 AUTOMATION
  {
    id: 'lead_to_zapier',
    name: 'Lead → Zapier',
    description: 'Send leads to Zapier for custom workflows',
    icon: '⚡',
    category: 'Automation',
    integrationId: 'zapier',
    trigger: 'lead_captured',
    action: 'trigger_zap',
    aiInstructions: 'Format data properly for Zapier',
    prefilledConfig: {},
    prefilledActionConfig: {
      data: '{"name": "{{customer_name}}", "email": "{{customer_email}}", "phone": "{{customer_phone}}", "message": "{{message}}"}',
    },
  },
  {
    id: 'lead_to_make',
    name: 'Lead → Make (Integromat)',
    description: 'Trigger Make scenarios for leads',
    icon: '🔄',
    category: 'Automation',
    integrationId: 'make',
    trigger: 'lead_captured',
    action: 'trigger_scenario',
    aiInstructions: 'Structure data for Make scenarios',
    prefilledConfig: {},
    prefilledActionConfig: {
      eventType: 'new_lead',
    },
  },
  {
    id: 'order_to_webhook',
    name: 'Order → Custom Webhook',
    description: 'Send orders to your custom endpoint',
    icon: '🔗',
    category: 'Automation',
    integrationId: 'webhook',
    trigger: 'order_placed',
    action: 'send_webhook',
    aiInstructions: 'Send complete order data',
    prefilledConfig: {},
    prefilledActionConfig: {
      method: 'POST',
      body: '{"event": "order_placed", "order_id": "{{order_id}}", "customer": {"name": "{{customer_name}}", "email": "{{customer_email}}", "phone": "{{customer_phone}}"}, "amount": "{{amount}}"}',
    },
  },

  // 📁 FILE & DOCS
  {
    id: 'lead_to_drive',
    name: 'Lead → Google Drive Folder',
    description: 'Create Drive folder for each lead',
    icon: '📁',
    category: 'File Management',
    integrationId: 'google_drive',
    trigger: 'lead_captured',
    action: 'create_folder',
    aiInstructions: 'Organize lead documents in folders',
    prefilledConfig: {},
    prefilledActionConfig: {
      folderName: '{{customer_name}} - {{timestamp}}',
    },
  },
  {
    id: 'lead_to_docs',
    name: 'Lead → Google Doc',
    description: 'Create detailed lead document',
    icon: '📝',
    category: 'File Management',
    integrationId: 'google_docs',
    trigger: 'lead_captured',
    action: 'create_doc',
    aiInstructions: 'Create well-formatted lead document',
    prefilledConfig: {},
    prefilledActionConfig: {
      title: 'Lead - {{customer_name}}',
      content: '# Lead Details\n\n## Contact Information\n- **Name:** {{customer_name}}\n- **Email:** {{customer_email}}\n- **Phone:** {{customer_phone}}\n\n## Message\n{{message}}\n\n## Notes\n_Add follow-up notes here_',
    },
  },

  // 💌 EMAIL MARKETING
  {
    id: 'lead_to_mailchimp',
    name: 'Lead → Mailchimp List',
    description: 'Add leads to Mailchimp audience',
    icon: '🐵',
    category: 'Email Marketing',
    integrationId: 'mailchimp',
    trigger: 'lead_captured',
    action: 'add_subscriber',
    aiInstructions: 'Add subscribers with proper tags',
    prefilledConfig: {},
    prefilledActionConfig: {
      tags: 'lead, whatsapp',
    },
  },
  {
    id: 'lead_to_sendgrid',
    name: 'Lead → SendGrid Contact',
    description: 'Add leads to SendGrid contact list',
    icon: '📤',
    category: 'Email Marketing',
    integrationId: 'sendgrid',
    trigger: 'lead_captured',
    action: 'add_contact',
    aiInstructions: 'Add contacts with relevant fields',
    prefilledConfig: {},
    prefilledActionConfig: {},
  },
];

// Group templates by category
const templateCategories = [...new Set(quickSetupTemplates.map(t => t.category))];

// Dynamic Integration Configuration Form - Modern Full-Screen Design
function IntegrationConfigForm({
  integrationType,
  agents,
  onSubmit,
  onCancel,
  isLoading,
  onClose,
}: {
  integrationType: any;
  agents: Agent[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  onClose?: () => void;
}) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [setupMode, setSetupMode] = useState<'quick' | 'custom'>('quick');
  const [selectedTemplate, setSelectedTemplate] = useState<QuickSetupTemplate | null>(null);
  const [name, setName] = useState(integrationType.name);
  const [description, setDescription] = useState('');
  const [agentId, setAgentId] = useState<string>('');
  const [aiModel, setAiModel] = useState<string>('openai-gpt-4o');
  const [aiApiKey, setAiApiKey] = useState<string>('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [config, setConfig] = useState<Record<string, string>>({});
  const [actionConfig, setActionConfig] = useState<Record<string, string>>({});

  // ============ n8n-STYLE WORKFLOW DATA MODEL ============
  // Each step is a node in the workflow. Conditions have branches that contain their own steps.
  type WorkflowStep = {
    id: string;
    type: 'action' | 'condition' | 'delay' | 'loop';
    // For action steps
    appId?: string;
    appName?: string;
    appIcon?: string;
    actionId?: string;
    actionName?: string;
    actionIcon?: string;
    config: Record<string, string>;
    // For condition steps - TRUE/FALSE branches each have their own workflow
    conditions?: Array<{
      id: string;
      field: string;
      operator: string;
      value: string;
      logicOperator: 'AND' | 'OR';
    }>;
    trueBranch?: WorkflowStep[];  // Steps to execute if TRUE
    falseBranch?: WorkflowStep[]; // Steps to execute if FALSE
    // For delay steps
    delayAmount?: number;
    delayUnit?: 'seconds' | 'minutes' | 'hours' | 'days';
    // For loop steps
    loopType?: 'count' | 'forEach' | 'while';
    loopCount?: number;
    loopArray?: string;
    loopCondition?: string;
    loopSteps?: WorkflowStep[];
  };
  
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [addStepType, setAddStepType] = useState<'action' | 'condition' | 'delay' | null>(null);
  const [addStepAppId, setAddStepAppId] = useState<string>('');
  const [addStepActionId, setAddStepActionId] = useState<string>('');
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingBranch, setEditingBranch] = useState<'true' | 'false' | null>(null); // Which branch we're adding to
  const [aiInstructions, setAiInstructions] = useState<string>('');
  
  // Legacy Conditional Branching State (for first action - keeping for backward compatibility)
  const [useConditionalLogic, setUseConditionalLogic] = useState(false);
  const [conditions, setConditions] = useState<Array<{
    id: string;
    field: string;
    operator: string;
    value: string;
    logicOperator: 'AND' | 'OR';
  }>>([]);
  const [trueAction, setTrueAction] = useState<string>('');
  const [falseAction, setFalseAction] = useState<string>('');
  const [trueActionConfig, setTrueActionConfig] = useState<Record<string, string>>({});
  const [falseActionConfig, setFalseActionConfig] = useState<Record<string, string>>({});

  // Condition operators
  const conditionOperators = [
    { value: 'equals', label: 'Equals', icon: '=' },
    { value: 'not_equals', label: 'Not Equals', icon: '≠' },
    { value: 'contains', label: 'Contains', icon: '∈' },
    { value: 'not_contains', label: 'Does Not Contain', icon: '∉' },
    { value: 'starts_with', label: 'Starts With', icon: '^' },
    { value: 'ends_with', label: 'Ends With', icon: '$' },
    { value: 'is_empty', label: 'Is Empty', icon: '∅' },
    { value: 'is_not_empty', label: 'Is Not Empty', icon: '≠∅' },
    { value: 'greater_than', label: 'Greater Than', icon: '>' },
    { value: 'less_than', label: 'Less Than', icon: '<' },
    { value: 'greater_equal', label: 'Greater or Equal', icon: '≥' },
    { value: 'less_equal', label: 'Less or Equal', icon: '≤' },
    { value: 'regex_match', label: 'Matches Regex', icon: '.*' },
    { value: 'ai_sentiment_positive', label: 'AI: Sentiment is Positive', icon: '😊' },
    { value: 'ai_sentiment_negative', label: 'AI: Sentiment is Negative', icon: '😠' },
    { value: 'ai_intent_matches', label: 'AI: Intent Matches', icon: '🎯' },
    { value: 'ai_custom', label: 'AI: Custom Condition', icon: '🤖' },
  ];

  // Available condition fields (from trigger data)
  const conditionFields = [
    { value: '{{message}}', label: 'Message Text', category: 'Message' },
    { value: '{{customer_name}}', label: 'Customer Name', category: 'Customer' },
    { value: '{{customer_email}}', label: 'Customer Email', category: 'Customer' },
    { value: '{{customer_phone}}', label: 'Customer Phone', category: 'Customer' },
    { value: '{{trigger_event}}', label: 'Trigger Event', category: 'System' },
    { value: '{{timestamp}}', label: 'Timestamp', category: 'System' },
    { value: '{{amount}}', label: 'Amount', category: 'Data' },
    { value: '{{order_id}}', label: 'Order ID', category: 'Data' },
    { value: '{{status}}', label: 'Status', category: 'Data' },
    { value: '{{priority}}', label: 'Priority', category: 'Data' },
    { value: '{{category}}', label: 'Category', category: 'Data' },
    { value: '{{ai_response}}', label: 'AI Response', category: 'AI' },
    { value: '{{ai_summary}}', label: 'AI Summary', category: 'AI' },
    { value: 'custom', label: 'Custom Field...', category: 'Custom' },
  ];

  // Add new condition
  const addCondition = () => {
    setConditions([...conditions, {
      id: `cond_${Date.now()}`,
      field: '{{message}}',
      operator: 'contains',
      value: '',
      logicOperator: 'AND',
    }]);
  };

  // Remove condition
  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  // Update condition
  const updateCondition = (id: string, updates: Partial<typeof conditions[0]>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // === MULTI-STEP WORKFLOW HELPERS ===
  
  // Generic actions that apply to all apps (for apps without specific actions defined)
  const genericActions = [
    { id: 'send_data', name: 'Send Data', icon: '📤', description: 'Send data to this app via API/webhook' },
    { id: 'create_record', name: 'Create Record', icon: '➕', description: 'Create a new record/entry' },
    { id: 'update_record', name: 'Update Record', icon: '✏️', description: 'Update an existing record' },
    { id: 'delete_record', name: 'Delete Record', icon: '🗑️', description: 'Delete a record' },
    { id: 'fetch_data', name: 'Fetch Data', icon: '📥', description: 'Retrieve data from this app' },
    { id: 'trigger_webhook', name: 'Trigger Webhook', icon: '🔗', description: 'Call a webhook endpoint' },
  ];
  
  // Get ALL integrations from the catalog (flat list)
  const allCatalogIntegrations = Object.values(integrationCatalog).flatMap(category => 
    category.integrations.map(int => ({
      ...int,
      categoryLabel: category.label,
    }))
  );
  
  // Get all available apps for adding steps - merge catalog with comprehensiveIntegrations actions
  const availableApps = allCatalogIntegrations.map(catalogApp => {
    // Get specific actions from comprehensiveIntegrations if they exist
    const comprehensiveData = comprehensiveIntegrations[catalogApp.id];
    const specificActions = comprehensiveData?.actions || integrationActions[catalogApp.id] || [];
    
    return {
      id: catalogApp.id,
      name: catalogApp.name,
      icon: catalogApp.icon,
      category: catalogApp.categoryLabel || catalogApp.category,
      // Use specific actions if available, otherwise provide generic actions
      actions: specificActions.length > 0 ? specificActions : genericActions.map(a => ({
        ...a,
        description: `${a.description} for ${catalogApp.name}`
      })),
      hasSpecificActions: specificActions.length > 0,
    };
  });

  // Add a new workflow step (action type)
  const addWorkflowStep = (appId: string, actionId: string) => {
    const appData = availableApps.find(a => a.id === appId);
    const action = appData?.actions.find((a: any) => a.id === actionId);
    
    if (!appData || !action) {
      toast({
        title: "Error",
        description: "Could not add step. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: 'action',
      appId,
      appName: appData.name,
      appIcon: appData.icon,
      actionId,
      actionName: action.name,
      actionIcon: action.icon,
      config: {},
    };

    setWorkflowSteps([...workflowSteps, newStep]);
    setIsAddingStep(false);
    setAddStepType(null);
    setAddStepAppId('');
    setAddStepActionId('');
    
    toast({
      title: "Step Added",
      description: `${appData.icon} ${action.name} added to workflow`,
      duration: 2000,
    });
  };

  // Add a new condition step with proper branch arrays
  const addConditionStep = () => {
    const newStep: WorkflowStep = {
      id: `condition_${Date.now()}`,
      type: 'condition',
      config: {},
      conditions: [{
        id: `cond_${Date.now()}`,
        field: 'message_text',
        operator: 'contains',
        value: '',
        logicOperator: 'AND'
      }],
      trueBranch: [],   // n8n-style: array of steps for TRUE path
      falseBranch: [],  // n8n-style: array of steps for FALSE path
    };

    setWorkflowSteps([...workflowSteps, newStep]);
    setIsAddingStep(false);
    setAddStepType(null);
    setEditingStepId(newStep.id);
    
    toast({
      title: "Condition Added",
      description: "Configure your IF/ELSE condition with branch workflows",
      duration: 2000,
    });
  };

  // Add a delay step
  const addDelayStep = () => {
    const newStep: WorkflowStep = {
      id: `delay_${Date.now()}`,
      type: 'delay',
      config: {},
      delayAmount: 5,
      delayUnit: 'minutes',
    };

    setWorkflowSteps([...workflowSteps, newStep]);
    setIsAddingStep(false);
    setAddStepType(null);
    setEditingStepId(newStep.id);
    
    toast({
      title: "Delay Added",
      description: "Configure your wait time",
      duration: 2000,
    });
  };

  // Add step to a condition branch (TRUE or FALSE path)
  const addStepToBranch = (conditionStepId: string, branch: 'true' | 'false', actionId: string, actionName: string, appIcon: string) => {
    // Find the app that contains this action
    const appData = availableApps.find(a => a.actions.some((act: any) => act.id === actionId));
    const action = appData?.actions.find((a: any) => a.id === actionId);
    
    if (!action) return;

    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: 'action',
      appId: appData?.id,
      appName: appData?.name,
      appIcon: appIcon || appData?.icon,
      actionId,
      actionName: actionName || action.name,
      actionIcon: action.icon,
      config: {},
    };

    setWorkflowSteps(workflowSteps.map(s => {
      if (s.id === conditionStepId && s.type === 'condition') {
        if (branch === 'true') {
          return { ...s, trueBranch: [...(s.trueBranch || []), newStep] };
        } else {
          return { ...s, falseBranch: [...(s.falseBranch || []), newStep] };
        }
      }
      return s;
    }));

    setEditingBranch(null);
    setAddStepAppId('');
    setAddStepActionId('');
    
    toast({
      title: "Step Added to Branch",
      description: `${appIcon} ${actionName} added to ${branch.toUpperCase()} path`,
      duration: 2000,
    });
  };

  // Remove step from a branch
  const removeStepFromBranch = (conditionStepId: string, branch: 'true' | 'false', stepId: string) => {
    setWorkflowSteps(workflowSteps.map(s => {
      if (s.id === conditionStepId && s.type === 'condition') {
        if (branch === 'true') {
          return { ...s, trueBranch: (s.trueBranch || []).filter(b => b.id !== stepId) };
        } else {
          return { ...s, falseBranch: (s.falseBranch || []).filter(b => b.id !== stepId) };
        }
      }
      return s;
    }));
  };

  // Update condition step
  const updateConditionStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflowSteps(workflowSteps.map(s => 
      s.id === stepId ? { ...s, ...updates } : s
    ));
  };

  // Add condition to a condition step
  const addConditionToStep = (stepId: string) => {
    setWorkflowSteps(workflowSteps.map(s => {
      if (s.id === stepId && s.type === 'condition') {
        return {
          ...s,
          conditions: [...(s.conditions || []), {
            id: `cond_${Date.now()}`,
            field: 'message_text',
            operator: 'contains',
            value: '',
            logicOperator: 'AND'
          }]
        };
      }
      return s;
    }));
  };

  // Update a condition within a condition step
  const updateConditionInStep = (stepId: string, conditionId: string, updates: any) => {
    setWorkflowSteps(workflowSteps.map(s => {
      if (s.id === stepId && s.type === 'condition') {
        return {
          ...s,
          conditions: (s.conditions || []).map(c => 
            c.id === conditionId ? { ...c, ...updates } : c
          )
        };
      }
      return s;
    }));
  };

  // Remove condition from a condition step
  const removeConditionFromStep = (stepId: string, conditionId: string) => {
    setWorkflowSteps(workflowSteps.map(s => {
      if (s.id === stepId && s.type === 'condition') {
        return {
          ...s,
          conditions: (s.conditions || []).filter(c => c.id !== conditionId)
        };
      }
      return s;
    }));
  };

  // Remove a workflow step
  const removeWorkflowStep = (stepId: string) => {
    setWorkflowSteps(workflowSteps.filter(s => s.id !== stepId));
    if (editingStepId === stepId) {
      setEditingStepId(null);
    }
  };

  // Update a workflow step's config
  const updateWorkflowStepConfig = (stepId: string, config: Record<string, string>) => {
    setWorkflowSteps(workflowSteps.map(s => 
      s.id === stepId ? { ...s, config } : s
    ));
  };

  // Move step up/down
  const moveWorkflowStep = (stepId: string, direction: 'up' | 'down') => {
    const index = workflowSteps.findIndex(s => s.id === stepId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= workflowSteps.length) return;
    
    const newSteps = [...workflowSteps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setWorkflowSteps(newSteps);
  };

  // Get step action fields for configuration
  const getStepActionFields = (appId: string, actionId: string) => {
    const appActions = integrationActions[appId] || [];
    const action = appActions.find((a: any) => a.id === actionId);
    return action?.fields || action?.templates || [];
  };

  // AI Model options - Comprehensive list with 50+ models
  const aiModelOptions = [
    // OpenAI Models
    { value: 'openai-gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
    { value: 'openai-gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI' },
    { value: 'openai-gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI' },
    { value: 'openai-gpt-4', label: 'GPT-4', provider: 'OpenAI' },
    { value: 'openai-gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
    { value: 'openai-o1', label: 'O1', provider: 'OpenAI' },
    { value: 'openai-o1-mini', label: 'O1 Mini', provider: 'OpenAI' },
    { value: 'openai-o1-preview', label: 'O1 Preview', provider: 'OpenAI' },
    
    // Anthropic Models
    { value: 'anthropic-claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { value: 'anthropic-claude-3-opus', label: 'Claude 3 Opus', provider: 'Anthropic' },
    { value: 'anthropic-claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'Anthropic' },
    { value: 'anthropic-claude-3-haiku', label: 'Claude 3 Haiku', provider: 'Anthropic' },
    { value: 'anthropic-claude-3.5-haiku', label: 'Claude 3.5 Haiku', provider: 'Anthropic' },
    
    // Google Models
    { value: 'google-gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'Google' },
    { value: 'google-gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'Google' },
    { value: 'google-gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'Google' },
    { value: 'google-gemini-pro', label: 'Gemini Pro', provider: 'Google' },
    { value: 'google-gemma-2', label: 'Gemma 2', provider: 'Google' },
    
    // Mistral Models
    { value: 'mistral-large', label: 'Mistral Large', provider: 'Mistral' },
    { value: 'mistral-medium', label: 'Mistral Medium', provider: 'Mistral' },
    { value: 'mistral-small', label: 'Mistral Small', provider: 'Mistral' },
    { value: 'mistral-nemo', label: 'Mistral Nemo', provider: 'Mistral' },
    { value: 'mistral-codestral', label: 'Codestral', provider: 'Mistral' },
    { value: 'mixtral-8x7b', label: 'Mixtral 8x7B', provider: 'Mistral' },
    { value: 'mixtral-8x22b', label: 'Mixtral 8x22B', provider: 'Mistral' },
    
    // Meta Llama Models
    { value: 'meta-llama-3.2-90b', label: 'Llama 3.2 90B', provider: 'Meta' },
    { value: 'meta-llama-3.2-11b', label: 'Llama 3.2 11B', provider: 'Meta' },
    { value: 'meta-llama-3.1-405b', label: 'Llama 3.1 405B', provider: 'Meta' },
    { value: 'meta-llama-3.1-70b', label: 'Llama 3.1 70B', provider: 'Meta' },
    { value: 'meta-llama-3.1-8b', label: 'Llama 3.1 8B', provider: 'Meta' },
    
    // Groq (Fast Inference)
    { value: 'groq-llama-3.2-90b', label: 'Llama 3.2 90B (Groq)', provider: 'Groq' },
    { value: 'groq-llama-3.1-70b', label: 'Llama 3.1 70B (Groq)', provider: 'Groq' },
    { value: 'groq-mixtral-8x7b', label: 'Mixtral 8x7B (Groq)', provider: 'Groq' },
    { value: 'groq-gemma-7b', label: 'Gemma 7B (Groq)', provider: 'Groq' },
    
    // Cohere Models
    { value: 'cohere-command-r-plus', label: 'Command R+', provider: 'Cohere' },
    { value: 'cohere-command-r', label: 'Command R', provider: 'Cohere' },
    { value: 'cohere-command', label: 'Command', provider: 'Cohere' },
    
    // xAI Models
    { value: 'xai-grok-2', label: 'Grok 2', provider: 'xAI' },
    { value: 'xai-grok-2-mini', label: 'Grok 2 Mini', provider: 'xAI' },
    { value: 'xai-grok-beta', label: 'Grok Beta', provider: 'xAI' },
    
    // Perplexity Models
    { value: 'perplexity-sonar-large', label: 'Sonar Large', provider: 'Perplexity' },
    { value: 'perplexity-sonar-small', label: 'Sonar Small', provider: 'Perplexity' },
    
    // Together AI Models
    { value: 'together-qwen-2.5-72b', label: 'Qwen 2.5 72B', provider: 'Together' },
    { value: 'together-deepseek-v2.5', label: 'DeepSeek V2.5', provider: 'Together' },
    { value: 'together-yi-large', label: 'Yi Large', provider: 'Together' },
    
    // AWS Bedrock Models
    { value: 'aws-titan-text', label: 'Titan Text', provider: 'AWS Bedrock' },
    { value: 'aws-claude-3', label: 'Claude 3 (Bedrock)', provider: 'AWS Bedrock' },
    
    // Azure Models
    { value: 'azure-gpt-4', label: 'GPT-4 (Azure)', provider: 'Azure' },
    { value: 'azure-gpt-4o', label: 'GPT-4o (Azure)', provider: 'Azure' },
    
    // Local/Custom Options
    { value: 'ollama-local', label: 'Ollama (Local)', provider: 'Local' },
    { value: 'lmstudio-local', label: 'LM Studio (Local)', provider: 'Local' },
    { value: 'custom', label: 'Custom API Endpoint', provider: 'Custom' },
  ];

  const actions = integrationActions[integrationType.id] || [];
  
  // Get integration-specific triggers from comprehensiveIntegrations
  const integrationTriggers = comprehensiveIntegrations[integrationType.id]?.triggers || [];
  
  // Use only integration-specific triggers. If none are defined, show none
  // (previous behavior fell back to global `triggerEvents` which caused unrelated triggers to appear)
  const availableTriggers = integrationTriggers.length > 0 ? integrationTriggers : [];
  
  // Get templates for this integration
  const availableTemplates = quickSetupTemplates.filter(t => t.integrationId === integrationType.id);

  // Apply template when selected
  const applyTemplate = (template: QuickSetupTemplate) => {
    setSelectedTemplate(template);
    setName(template.name);
    setDescription(template.description);
    setSelectedAction(template.action);
    setSelectedTriggers([template.trigger]);
    setAiInstructions(template.aiInstructions);
    setActionConfig(template.prefilledActionConfig);
    if (Object.keys(template.prefilledConfig).length > 0) {
      setConfig(template.prefilledConfig);
    }
  };

  // Clear selected template and reset to defaults
  const clearTemplate = () => {
    setSelectedTemplate(null);
    setName(integrationType.name);
    setDescription('');
    setSelectedAction('');
    setSelectedTriggers([]);
    setAiInstructions('');
    setActionConfig({});
    setSetupMode('custom');
  };

  // Field configurations for different integration types
  const fieldConfigs: Record<string, Array<{ key: string; label: string; type: string; placeholder?: string; required?: boolean; helpText?: string; options?: string[] }>> = {
    // Communication
    whatsapp: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your WhatsApp API key', required: true },
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', placeholder: '1234567890', required: true },
      { key: 'businessAccountId', label: 'Business Account ID', type: 'text', placeholder: 'Your WABA ID' },
    ],
    telegram: [
      { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: '123456:ABC-DEF...', required: true, helpText: 'Get from @BotFather' },
      { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '-1001234567890', helpText: 'Channel or group chat ID' },
    ],
    slack: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/services/...', required: true },
      { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general' },
    ],
    discord: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://discord.com/api/webhooks/...', required: true },
    ],
    sms_twilio: [
      { key: 'accountSid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxx', required: true },
      { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Your auth token', required: true },
      { key: 'fromNumber', label: 'From Number', type: 'text', placeholder: '+1234567890', required: true },
    ],
    microsoft_teams: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://outlook.office.com/webhook/...', required: true },
    ],
    
    // Email
    gmail: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'OAuth Client ID', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'OAuth Client Secret', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', placeholder: 'OAuth Refresh Token', required: true },
      { key: 'fromEmail', label: 'From Email', type: 'email', placeholder: 'sender@gmail.com' },
    ],
    outlook: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Azure App Client ID', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Azure App Secret', required: true },
      { key: 'tenantId', label: 'Tenant ID', type: 'text', placeholder: 'Azure Tenant ID', required: true },
    ],
    smtp: [
      { key: 'smtpHost', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com', required: true },
      { key: 'smtpPort', label: 'SMTP Port', type: 'number', placeholder: '587', required: true },
      { key: 'smtpUser', label: 'Username', type: 'text', placeholder: 'user@example.com', required: true },
      { key: 'smtpPass', label: 'Password', type: 'password', placeholder: 'App password', required: true },
      { key: 'toEmails', label: 'Default Recipients', type: 'text', placeholder: 'email1@example.com, email2@example.com' },
    ],
    sendgrid: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'SG.xxxxxxx', required: true },
      { key: 'fromEmail', label: 'From Email', type: 'email', placeholder: 'noreply@yourdomain.com' },
    ],
    mailchimp: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Mailchimp API key', required: true },
      { key: 'audienceId', label: 'Audience ID', type: 'text', placeholder: 'List/Audience ID' },
    ],
    
    // Google
    google_sheets: [
      { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', required: true, helpText: 'From URL: docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit' },
      { key: 'sheetName', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}', helpText: 'Paste your service account credentials JSON' },
    ],
    google_drive: [
      { key: 'folderId', label: 'Folder ID', type: 'text', placeholder: '1abc...', helpText: 'Leave empty for root folder' },
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}', required: true },
    ],
    google_calendar: [
      { key: 'calendarId', label: 'Calendar ID', type: 'text', placeholder: 'primary or calendar@group.calendar.google.com', required: true },
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}', required: true },
    ],
    google_docs: [
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}', required: true },
    ],
    google_forms: [
      { key: 'formId', label: 'Form ID', type: 'text', placeholder: 'From form URL', required: true },
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}', required: true },
    ],
    
    // CRM
    hubspot: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your HubSpot API key', required: true },
    ],
    salesforce: [
      { key: 'instanceUrl', label: 'Instance URL', type: 'text', placeholder: 'https://yourorg.salesforce.com', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'OAuth access token', required: true },
    ],
    pipedrive: [
      { key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Your Pipedrive API token', required: true },
    ],
    zoho_crm: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'OAuth Client ID', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'OAuth Client Secret', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', placeholder: 'OAuth Refresh Token', required: true },
    ],
    freshsales: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Freshsales API key', required: true },
      { key: 'domain', label: 'Domain', type: 'text', placeholder: 'yourcompany.freshsales.io', required: true },
    ],
    
    // Automation
    zapier: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/hooks/catch/...', required: true, helpText: 'Create a Zap with "Webhooks by Zapier" trigger' },
    ],
    make: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hook.eu1.make.com/...', required: true, helpText: 'Create a scenario with Webhooks module' },
    ],
    n8n: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://your-n8n.com/webhook/...', required: true },
    ],
    ifttt: [
      { key: 'webhookKey', label: 'Webhook Key', type: 'password', placeholder: 'Your IFTTT webhook key', required: true },
      { key: 'eventName', label: 'Event Name', type: 'text', placeholder: 'agent_trigger', required: true },
    ],
    power_automate: [
      { key: 'webhookUrl', label: 'HTTP POST URL', type: 'text', placeholder: 'https://prod-xx.westus.logic.azure.com/...', required: true },
    ],
    
    // Storage
    airtable: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Airtable API key', required: true },
      { key: 'baseId', label: 'Base ID', type: 'text', placeholder: 'appXXXXXXXXXXXXXX', required: true },
      { key: 'tableId', label: 'Table Name/ID', type: 'text', placeholder: 'Table name or ID', required: true },
    ],
    notion: [
      { key: 'apiKey', label: 'Integration Token', type: 'password', placeholder: 'secret_xxxxxxx', required: true },
      { key: 'databaseId', label: 'Database ID', type: 'text', placeholder: 'Database page ID' },
    ],
    firebase: [
      { key: 'projectId', label: 'Project ID', type: 'text', placeholder: 'your-project-id', required: true },
      { key: 'credentials', label: 'Service Account JSON', type: 'textarea', placeholder: '{"type": "service_account", ...}', required: true },
    ],
    supabase: [
      { key: 'url', label: 'Project URL', type: 'text', placeholder: 'https://xxxxx.supabase.co', required: true },
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Supabase anon/service key', required: true },
    ],
    mongodb: [
      { key: 'connectionString', label: 'Connection String', type: 'password', placeholder: 'mongodb+srv://...', required: true },
      { key: 'database', label: 'Database', type: 'text', placeholder: 'my_database', required: true },
      { key: 'collection', label: 'Collection', type: 'text', placeholder: 'my_collection', required: true },
    ],
    dropbox: [
      { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Your Dropbox access token', required: true },
    ],
    aws_s3: [
      { key: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'AKIAIOSFODNN7EXAMPLE', required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', required: true },
      { key: 'bucket', label: 'Bucket Name', type: 'text', placeholder: 'my-bucket', required: true },
      { key: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1', required: true },
    ],
    redis: [
      { key: 'host', label: 'Redis Host', type: 'text', placeholder: 'redis.example.com', required: true },
      { key: 'port', label: 'Port', type: 'number', placeholder: '6379', required: true },
      { key: 'password', label: 'Password', type: 'password', placeholder: 'Redis password (optional)' },
    ],
    elasticsearch: [
      { key: 'endpoint', label: 'Elasticsearch Endpoint', type: 'text', placeholder: 'https://search-domain.region.es.amazonaws.com', required: true },
      { key: 'username', label: 'Username', type: 'text', placeholder: 'elastic_user' },
      { key: 'password', label: 'Password', type: 'password', placeholder: 'elastic_password' },
      { key: 'index', label: 'Index Name', type: 'text', placeholder: 'conversations', required: true },
    ],
    
    // E-commerce
    stripe: [
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_xxx or sk_test_xxx', required: true },
    ],
    razorpay: [
      { key: 'keyId', label: 'Key ID', type: 'text', placeholder: 'rzp_live_xxx', required: true },
      { key: 'keySecret', label: 'Key Secret', type: 'password', placeholder: 'Your Razorpay secret', required: true },
    ],
    shopify: [
      { key: 'shopDomain', label: 'Shop Domain', type: 'text', placeholder: 'your-store.myshopify.com', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'shpat_xxx', required: true },
    ],
    woocommerce: [
      { key: 'siteUrl', label: 'Site URL', type: 'text', placeholder: 'https://yourstore.com', required: true },
      { key: 'consumerKey', label: 'Consumer Key', type: 'text', placeholder: 'ck_xxx', required: true },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', placeholder: 'cs_xxx', required: true },
    ],
    paypal: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Your PayPal client ID', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Your PayPal secret', required: true },
    ],
    
    // Productivity
    trello: [
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Your Trello API key', required: true },
      { key: 'token', label: 'Token', type: 'password', placeholder: 'Your Trello token', required: true },
      { key: 'boardId', label: 'Board ID', type: 'text', placeholder: 'Board ID to create cards' },
    ],
    asana: [
      { key: 'accessToken', label: 'Personal Access Token', type: 'password', placeholder: 'Your Asana PAT', required: true },
      { key: 'workspaceId', label: 'Workspace ID', type: 'text', placeholder: 'Workspace GID' },
    ],
    jira: [
      { key: 'domain', label: 'Jira Domain', type: 'text', placeholder: 'yourcompany.atlassian.net', required: true },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
      { key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Your Jira API token', required: true },
      { key: 'projectKey', label: 'Project Key', type: 'text', placeholder: 'PROJECT' },
    ],
    monday: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your Monday.com API key', required: true },
      { key: 'boardId', label: 'Board ID', type: 'text', placeholder: 'Board ID' },
    ],
    clickup: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Your ClickUp API key', required: true },
      { key: 'listId', label: 'List ID', type: 'text', placeholder: 'List ID for tasks' },
    ],
    calendly: [
      { key: 'apiKey', label: 'Personal Access Token', type: 'password', placeholder: 'Your Calendly token', required: true },
    ],
    
    // Developer Tools
    custom_integration: [
      { key: 'integrationName', label: 'Integration Name', type: 'text', placeholder: 'My Custom Integration', required: true, helpText: 'A friendly name for your custom integration' },
      { key: 'webhookUrl', label: 'Endpoint URL', type: 'text', placeholder: 'https://your-api.com/endpoint', required: true, helpText: 'The URL to send/receive data' },
      { key: 'method', label: 'HTTP Method', type: 'select', placeholder: 'POST', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], required: true },
      { key: 'authType', label: 'Authentication Type', type: 'select', placeholder: 'None', options: ['None', 'API Key', 'Bearer Token', 'Basic Auth', 'OAuth2', 'Custom Header'] },
      { key: 'authValue', label: 'Auth Value', type: 'password', placeholder: 'Your API key or token', helpText: 'The authentication value (API key, token, etc.)' },
      { key: 'headers', label: 'Custom Headers (JSON)', type: 'textarea', placeholder: '{\n  "Content-Type": "application/json",\n  "X-Custom-Header": "value"\n}', helpText: 'Additional headers to send with requests' },
      { key: 'bodyTemplate', label: 'Request Body Template', type: 'textarea', placeholder: '{\n  "message": "{{message}}",\n  "customer": "{{customer_name}}",\n  "timestamp": "{{timestamp}}"\n}', helpText: 'JSON template for request body. Use {{variables}} for dynamic data' },
      { key: 'responseMapping', label: 'Response Mapping (optional)', type: 'textarea', placeholder: '{\n  "success": "data.status == success",\n  "id": "data.id"\n}', helpText: 'Map response fields for use in subsequent steps' },
    ],
    webhook: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://your-api.com/webhook', required: true },
      { key: 'method', label: 'HTTP Method', type: 'select', placeholder: 'POST', options: ['POST', 'PUT', 'PATCH'] },
      { key: 'headers', label: 'Custom Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer xxx"}' },
    ],
    webhook_outgoing: [
      { key: 'webhookUrl', label: 'Destination URL', type: 'text', placeholder: 'https://external-service.com/webhook', required: true, helpText: 'URL to send data to when triggered' },
      { key: 'method', label: 'HTTP Method', type: 'select', placeholder: 'POST', options: ['POST', 'PUT', 'PATCH'], required: true },
      { key: 'authHeader', label: 'Authorization Header', type: 'password', placeholder: 'Bearer your-token-here', helpText: 'Optional auth header value' },
      { key: 'headers', label: 'Custom Headers (JSON)', type: 'textarea', placeholder: '{"Content-Type": "application/json"}' },
      { key: 'bodyTemplate', label: 'Body Template (JSON)', type: 'textarea', placeholder: '{\n  "event": "{{trigger_event}}",\n  "data": {\n    "message": "{{message}}",\n    "from": "{{customer_name}}"\n  }\n}', required: true, helpText: 'Use {{variables}} for dynamic content' },
    ],
    custom_api: [
      { key: 'apiUrl', label: 'API URL', type: 'text', placeholder: 'https://api.example.com/endpoint', required: true },
      { key: 'method', label: 'HTTP Method', type: 'select', placeholder: 'POST', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      { key: 'apiKey', label: 'API Key/Token', type: 'password', placeholder: 'Bearer token or API key' },
      { key: 'headers', label: 'Custom Headers (JSON)', type: 'textarea', placeholder: '{"Content-Type": "application/json"}' },
    ],
    graphql: [
      { key: 'endpoint', label: 'GraphQL Endpoint', type: 'text', placeholder: 'https://api.example.com/graphql', required: true },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer xxx"}' },
      { key: 'query', label: 'GraphQL Query', type: 'textarea', placeholder: 'mutation CreateItem($input: ItemInput!) {\n  createItem(input: $input) {\n    id\n    name\n  }\n}', helpText: 'Your GraphQL query or mutation' },
      { key: 'variables', label: 'Variables Template (JSON)', type: 'textarea', placeholder: '{\n  "input": {\n    "name": "{{customer_name}}",\n    "message": "{{message}}"\n  }\n}', helpText: 'Variables for the query. Use {{variables}} for dynamic data' },
    ],
    github: [
      { key: 'accessToken', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_xxx', required: true },
      { key: 'owner', label: 'Owner/Org', type: 'text', placeholder: 'username or org name' },
      { key: 'repo', label: 'Repository', type: 'text', placeholder: 'repo-name' },
    ],
    gitlab: [
      { key: 'accessToken', label: 'Personal Access Token', type: 'password', placeholder: 'glpat_xxx', required: true },
      { key: 'projectId', label: 'Project ID or Path', type: 'text', placeholder: 'namespace/project', required: true },
    ],
    bitbucket: [
      { key: 'username', label: 'Username', type: 'text', placeholder: 'your-username', required: true },
      { key: 'appPassword', label: 'App Password', type: 'password', placeholder: 'app_password', required: true },
      { key: 'repoSlug', label: 'Repository Slug', type: 'text', placeholder: 'repo-name', required: true },
    ],
  };

  const fields = fieldConfigs[integrationType.id] || [];
  const currentAction = actions.find(a => a.id === selectedAction);
  const trueActionDetails = actions.find(a => a.id === trueAction);
  const falseActionDetails = actions.find(a => a.id === falseAction);

  const handleSubmit = () => {
    onSubmit({
      type: integrationType.id,
      name,
      description,
      agentId: agentId || null,
      config: { 
        ...config, 
        // Simple flow (no conditions) - first action
        action: useConditionalLogic ? undefined : selectedAction, 
        actionTemplates: useConditionalLogic ? undefined : actionConfig,
        // Conditional flow
        useConditionalLogic,
        conditions: useConditionalLogic ? conditions : undefined,
        trueAction: useConditionalLogic ? trueAction : undefined,
        falseAction: useConditionalLogic ? falseAction : undefined,
        trueActionConfig: useConditionalLogic ? trueActionConfig : undefined,
        falseActionConfig: useConditionalLogic ? falseActionConfig : undefined,
        // Multi-step workflow (additional steps after first action)
        workflowSteps: workflowSteps.length > 0 ? workflowSteps : undefined,
        // Common
        aiInstructions,
        aiModel,
        aiApiKey: aiApiKey || undefined,
      },
      triggers: selectedTriggers.map(event => ({ event })),
    });
  };

  const isStep1Valid = name.trim() !== '' && aiModel !== '' && (aiModel === 'custom' ? aiApiKey.trim() !== '' : true);
  
  // Check if all required fields in Step 2 are filled
  const isStep2Valid = fields.length === 0 || fields.every((field: any) => {
    if (field.required) {
      return config[field.key] && config[field.key].trim() !== '';
    }
    return true;
  });
  
  // Step 3 validation - triggers (require triggers only if integration has triggers available)
  const isStep3Valid = availableTriggers.length === 0 || selectedTriggers.length > 0;
  
  // Step 4 validation - either simple action OR conditional logic with both actions
  // Workflow steps are optional additions
  const isStep4Valid = useConditionalLogic 
    ? (conditions.length > 0 && trueAction !== '' && conditions.every(c => c.value.trim() !== '' || c.operator === 'is_empty' || c.operator === 'is_not_empty'))
    : selectedAction !== '';

  return (
    <div className="flex flex-col h-full">
      {/* Modern Header with App Info */}
      <div className="flex-shrink-0 border-b bg-gradient-to-r from-background via-muted/30 to-background">
        <div className="p-4 sm:p-6">
          {/* Back button and close */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to apps
            </Button>
          </div>
          
          {/* App Info Banner */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${integrationType.categoryColor} text-white`}>
              {integrationType.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{integrationType.name}</h2>
              <p className="text-sm text-muted-foreground">{integrationType.description}</p>
            </div>
            {selectedTemplate && (
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Using Template
              </Badge>
            )}
          </div>
        </div>
        
        {/* Modern Stepper */}
        <div className="px-4 sm:px-6 pb-4">
          <div className="flex items-center justify-between bg-muted/50 rounded-xl p-1">
            {[
              { num: 1, label: 'Setup', icon: Cog, desc: 'Basic settings' },
              { num: 2, label: 'Connect', icon: PlugZap, desc: 'API credentials' },
              { num: 3, label: 'Triggers', icon: Target, desc: 'When to run' },
              { num: 4, label: 'Actions', icon: Workflow, desc: 'What to do' },
            ].map((s, i) => (
              <div 
                key={s.num} 
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                  step === s.num 
                    ? 'bg-background shadow-sm' 
                    : step > s.num 
                      ? 'text-green-600' 
                      : 'text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => {
                  // Only allow going back to completed steps
                  if (s.num < step) setStep(s.num);
                }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step === s.num 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                    : step > s.num 
                      ? 'bg-green-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step > s.num ? <CheckCircle className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm font-medium ${step === s.num ? 'text-foreground' : ''}`}>{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      {/* Step 1: Quick Setup or Custom */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Quick Setup Templates (if available) */}
          {availableTemplates.length > 0 && (
            <Card className="border-2 border-dashed border-yellow-500/30 bg-yellow-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Quick Setup Templates</CardTitle>
                      <CardDescription>One-click pre-configured workflows</CardDescription>
                    </div>
                  </div>
                  {selectedTemplate && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearTemplate();
                      }}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id 
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                          : 'border-transparent bg-muted/50 hover:border-primary/30 hover:bg-muted'
                      }`}
                      onClick={() => {
                        if (selectedTemplate?.id === template.id) {
                          clearTemplate();
                        } else {
                          applyTemplate(template);
                          setSetupMode('quick');
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{template.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
                        </div>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Divider */}
          {availableTemplates.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-medium">Or configure manually</span>
              </div>
            </div>
          )}

          {/* Manual Configuration - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Integration Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (selectedTemplate) setSetupMode('custom');
                    }}
                    placeholder={`My ${integrationType.name} Integration`}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What will this integration do?"
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Link to Agent</Label>
                  <Select value={agentId || "all"} onValueChange={(v) => setAgentId(v === "all" ? "" : v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="All agents (global)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          All Agents (Global)
                        </span>
                      </SelectItem>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <span className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            {agent.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Which AI agent should use this integration?</p>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - AI Configuration */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">AI Configuration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    AI Model *
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  </Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Groq', 'Cohere', 'Custom'].map((provider) => (
                        <div key={provider}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                            {provider}
                          </div>
                          {aiModelOptions
                            .filter(m => m.provider === provider)
                            .map(model => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {aiModel === 'custom' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Custom API Endpoint *</Label>
                    <Input
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="https://api.your-model.com/v1"
                      className="h-11"
                    />
                  </div>
                )}

                {aiModel && aiModel !== 'custom' && (
                  <div className="p-3 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{aiModelOptions.find(m => m.value === aiModel)?.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {aiModelOptions.find(m => m.value === aiModel)?.provider} model selected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep(2)} disabled={!isStep1Valid} size="lg" className="gap-2">
              Continue to Connect
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Connection Settings */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Connection Header Card */}
          <Card className="border-2 border-dashed border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <PlugZap className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Connect {integrationType.name}</h3>
                  <p className="text-sm text-muted-foreground">Enter your API credentials to establish connection</p>
                </div>
                <Badge variant="outline" className="border-blue-500/30 text-blue-500">
                  Step 2 of 4
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Credentials Form */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                API Credentials
              </CardTitle>
              <CardDescription>
                Securely connect your {integrationType.name} account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 rounded-xl bg-green-500/5 border border-green-500/20">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold text-green-600">No credentials required!</p>
                  <p className="text-sm text-muted-foreground mt-1">This integration is ready to use.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {fields.map((field: any) => {
                    const isMissing = field.required && (!config[field.key] || config[field.key].trim() === '');
                    return (
                      <div key={field.key} className="space-y-2">
                        <Label className={`text-sm font-medium flex items-center gap-2 ${isMissing ? 'text-red-500' : ''}`}>
                          {field.label}
                          {field.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                        </Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            value={config[field.key] || ''}
                            onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            rows={4}
                            className={`font-mono text-sm resize-none ${isMissing ? 'border-red-500 focus:ring-red-500' : ''}`}
                          />
                        ) : field.type === 'select' && field.options ? (
                          <Select 
                            value={config[field.key] || field.options[0]} 
                            onValueChange={(v) => setConfig({ ...config, [field.key]: v })}
                          >
                            <SelectTrigger className={`h-11 ${isMissing ? 'border-red-500' : ''}`}>
                              <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((opt: string) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field.type === 'password' ? 'password' : 'text'}
                            value={config[field.key] || ''}
                            onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            className={`h-11 ${isMissing ? 'border-red-500 focus:ring-red-500' : ''}`}
                          />
                        )}
                        {field.helpText && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {field.helpText}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Validation message */}
              {!isStep2Valid && fields.some((f: any) => f.required) && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please fill in all required fields to continue
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!isStep2Valid} size="lg" className="gap-2">
              Continue to Triggers
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Trigger Events - WHEN should this run? */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Triggers Header Card */}
          <Card className="border-2 border-dashed border-orange-500/30 bg-orange-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">When should this run?</h3>
                  <p className="text-sm text-muted-foreground">Select events that will trigger this integration</p>
                </div>
                {selectedTriggers.length > 0 && (
                  <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                    {selectedTriggers.length} selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trigger Selection Grid */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                Available Triggers
              </CardTitle>
              <CardDescription>
                Choose one or more events that will start this workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableTriggers.length === 0 ? (
                <div className="text-center py-8 rounded-xl bg-muted/30">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="font-medium text-muted-foreground">No triggers available</p>
                  <p className="text-sm text-muted-foreground">This integration is action-only (outbound)</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableTriggers.map((event) => (
                    <label
                      key={event.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTriggers.includes(event.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <Checkbox
                        checked={selectedTriggers.includes(event.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTriggers([...selectedTriggers, event.id]);
                          } else {
                            setSelectedTriggers(selectedTriggers.filter(e => e !== event.id));
                          }
                        }}
                      />
                      <span className="text-xl">{event.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.name}</p>
                        <p className="text-xs text-muted-foreground">{event.description || event.category}</p>
                      </div>
                      {selectedTriggers.includes(event.id) && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Instructions */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <CardTitle className="text-base">AI Behavior Instructions</CardTitle>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
              <CardDescription>
                Tell the AI how to behave when these events are triggered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                placeholder={integrationType.aiInstructions || `Describe how the AI should handle ${integrationType.name} events...\n\nExamples:\n• "Reply to all support messages with helpful responses"\n• "Summarize incoming data and categorize it"\n• "Auto-respond to common questions"`}
                rows={4}
                className="text-sm resize-none"
              />
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setStep(4)} disabled={!isStep3Valid} size="lg" className="gap-2">
              Continue to Actions
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Action Logic - WHAT should happen? */}
      {step === 4 && (
        <div className="space-y-6">
          {/* ============ n8n-STYLE VISUAL WORKFLOW BUILDER ============ */}
          
          {/* Workflow Canvas Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Workflow className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Workflow Builder</h3>
                <p className="text-sm text-muted-foreground">Design your automation flow visually</p>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary">
              {1 + workflowSteps.length + (useConditionalLogic ? 1 : 0)} nodes
            </Badge>
          </div>

          {/* ============ VISUAL WORKFLOW CANVAS ============ */}
          <Card className="border-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
            <CardContent className="p-6">
              {/* Workflow Flow */}
              <div className="flex flex-col gap-4">
                
                {/* ROW 1: Trigger Node */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    {/* Trigger Node */}
                    <div className="relative group">
                      <div className="w-48 p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl">
                            {integrationType.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-blue-200 font-medium">TRIGGER</p>
                            <p className="text-sm font-semibold truncate">{integrationType.name}</p>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <p className="text-[10px] text-blue-200">
                            {selectedTriggers.length > 0 
                              ? `${selectedTriggers.length} trigger${selectedTriggers.length > 1 ? 's' : ''} selected`
                              : 'No triggers configured'}
                          </p>
                        </div>
                      </div>
                      {/* Connection Line Down */}
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-blue-500 to-transparent" />
                    </div>
                  </div>
                </div>

                {/* Connector */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-muted-foreground/30" />
                </div>

                {/* ROW 2: Add Condition or Action */}
                <div className="flex items-center justify-center gap-4">
                  {/* Add Node Buttons - Show when no action selected and not in adding mode */}
                  {!selectedAction && !useConditionalLogic && !isAddingStep && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="h-auto py-3 px-4 border-dashed border-2 hover:border-green-500 hover:bg-green-500/5"
                          onClick={() => {
                            setIsAddingStep(true);
                            setAddStepType('action');
                            setAddStepAppId('');
                          }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                              <Zap className="h-4 w-4 text-green-500" />
                            </div>
                            <span className="text-xs font-medium">Add Action</span>
                          </div>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-auto py-3 px-4 border-dashed border-2 hover:border-purple-500 hover:bg-purple-500/5"
                          onClick={() => setUseConditionalLogic(true)}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                              <GitBranch className="h-4 w-4 text-purple-500" />
                            </div>
                            <span className="text-xs font-medium">Add Condition</span>
                          </div>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Choose what happens next</p>
                    </div>
                  )}

                  {/* Action Selection Panel - Shows when Add Action is clicked */}
                  {!selectedAction && !useConditionalLogic && isAddingStep && addStepType === 'action' && (
                    <Card className="w-full max-w-md border-green-500/30 bg-card/95 backdrop-blur">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4 text-green-500" />
                            Select Action
                          </CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => setIsAddingStep(false)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription className="text-xs">Choose an app and action to perform</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* App Selection */}
                        <div className="space-y-2">
                          <Label className="text-xs">Select App</Label>
                          <Select value={addStepAppId} onValueChange={setAddStepAppId}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Choose an app..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableApps.map(app => (
                                <SelectItem key={app.id} value={app.id}>
                                  <span className="flex items-center gap-2">
                                    <span>{app.icon}</span>
                                    <span>{app.name}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Action Selection - Only show after app is selected */}
                        {addStepAppId && (() => {
                          const selectedApp = availableApps.find(a => a.id === addStepAppId);
                          if (!selectedApp) return null;
                          
                          return (
                            <div className="space-y-2">
                              <Label className="text-xs">Select Action</Label>
                              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                {selectedApp.actions.map(action => (
                                  <Button
                                    key={action.id}
                                    variant="outline"
                                    className="h-auto py-2 px-3 justify-start hover:border-green-500 hover:bg-green-500/5"
                                    onClick={() => {
                                      setSelectedAction(action.id);
                                      setIsAddingStep(false);
                                    }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Zap className="h-3 w-3 text-green-500" />
                                      <span className="text-xs truncate">{action.name}</span>
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Condition Node (IF/ELSE) */}
                  {useConditionalLogic && (
                    <div className="relative">
                      {/* Condition Node */}
                      <div 
                        className="w-56 p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20 border border-purple-400/30 cursor-pointer hover:ring-2 hover:ring-purple-400/50 transition-all"
                        onClick={() => setEditingStepId('condition')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <GitBranch className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-purple-200 font-medium">IF / ELSE</p>
                            <p className="text-sm font-semibold">Condition</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUseConditionalLogic(false);
                              setConditions([]);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <p className="text-[10px] text-purple-200">
                            {conditions.length > 0 
                              ? `${conditions.length} condition${conditions.length > 1 ? 's' : ''} defined`
                              : 'Click to configure conditions'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Branch Lines */}
                      <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
                        <div className="flex items-end gap-16">
                          <div className="flex flex-col items-center">
                            <div className="w-0.5 h-6 bg-green-500" />
                            <span className="text-[10px] text-green-500 font-bold">TRUE</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-0.5 h-6 bg-red-500" />
                            <span className="text-[10px] text-red-500 font-bold">FALSE</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simple Action Node (non-conditional) */}
                  {!useConditionalLogic && selectedAction && (
                    <div className="relative group">
                      <div 
                        className="w-48 p-3 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg shadow-green-500/20 border border-green-400/30 cursor-pointer hover:ring-2 hover:ring-green-400/50 transition-all"
                        onClick={() => setEditingStepId('action1')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl">
                            {currentAction?.icon || '⚡'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-green-200 font-medium">ACTION 1</p>
                            <p className="text-sm font-semibold truncate">{currentAction?.name || 'Select action'}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAction('');
                              setActionConfig({});
                              setEditingStepId(null);
                              // Also clear workflow steps that depend on this action
                              setWorkflowSteps([]);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <p className="text-[10px] text-green-200">Click to configure</p>
                        </div>
                      </div>
                      {/* Connection Line Down */}
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-green-500 to-transparent" />
                    </div>
                  )}
                </div>

                {/* Conditional Branch Actions */}
                {useConditionalLogic && (
                  <>
                    <div className="h-8" /> {/* Spacer for branch lines */}
                    <div className="flex justify-center gap-8">
                      {/* TRUE Branch Action */}
                      <div className="relative">
                        <div 
                          className={`w-44 p-3 rounded-xl cursor-pointer transition-all ${
                            trueAction 
                              ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg shadow-green-500/20 border border-green-400/30 hover:ring-2 hover:ring-green-400/50'
                              : 'bg-muted/50 border-2 border-dashed border-green-500/50 hover:border-green-500 hover:bg-green-500/5'
                          }`}
                          onClick={() => setEditingStepId('trueAction')}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trueAction ? 'bg-white/20 text-lg' : 'bg-green-500/20'}`}>
                              {trueAction ? (trueActionDetails?.icon || '✅') : <Plus className="h-4 w-4 text-green-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium ${trueAction ? 'text-green-200' : 'text-green-600'}`}>IF TRUE</p>
                              <p className={`text-sm font-semibold truncate ${trueAction ? '' : 'text-muted-foreground'}`}>
                                {trueAction ? (trueActionDetails?.name || 'Action') : 'Add Action'}
                              </p>
                            </div>
                          </div>
                        </div>
                        {trueAction && (
                          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-green-500 to-transparent" />
                        )}
                      </div>

                      {/* FALSE Branch Action */}
                      <div className="relative">
                        <div 
                          className={`w-44 p-3 rounded-xl cursor-pointer transition-all ${
                            falseAction 
                              ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20 border border-red-400/30 hover:ring-2 hover:ring-red-400/50'
                              : 'bg-muted/50 border-2 border-dashed border-red-500/50 hover:border-red-500 hover:bg-red-500/5'
                          }`}
                          onClick={() => setEditingStepId('falseAction')}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${falseAction ? 'bg-white/20 text-lg' : 'bg-red-500/20'}`}>
                              {falseAction ? (falseActionDetails?.icon || '⏭️') : <Plus className="h-4 w-4 text-red-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium ${falseAction ? 'text-red-200' : 'text-red-600'}`}>IF FALSE</p>
                              <p className={`text-sm font-semibold truncate ${falseAction ? '' : 'text-muted-foreground'}`}>
                                {falseAction ? (falseActionDetails?.name || 'Action') : 'Skip / Add'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Additional Workflow Steps (after first action or conditional) */}
                {(selectedAction || (useConditionalLogic && trueAction)) && (
                  <>
                    {/* First connector with Insert Button */}
                    <div className="flex justify-center group/connector relative">
                      <div className="w-0.5 h-8 bg-muted-foreground/30" />
                      {/* Insert Step Popover - First Position */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/connector:opacity-100 transition-opacity z-10">
                        <Select
                          value=""
                          onValueChange={(value) => {
                            if (value === '__condition__') {
                              const newCondition: WorkflowStep = {
                                id: `condition-${Date.now()}`,
                                type: 'condition',
                                conditions: [],
                                trueBranch: [],
                                falseBranch: [],
                                config: {}
                              };
                              setWorkflowSteps([newCondition, ...workflowSteps]);
                            } else if (value === '__delay__') {
                              const newDelay: WorkflowStep = {
                                id: `delay-${Date.now()}`,
                                type: 'delay',
                                delayAmount: 5,
                                delayUnit: 'minutes',
                                config: {}
                              };
                              setWorkflowSteps([newDelay, ...workflowSteps]);
                            } else {
                              const action = actions.find(a => a.id === value);
                              if (action) {
                                const selectedAppData = availableApps.find(app => 
                                  app.actions.some(a => a.id === value)
                                );
                                const newStep: WorkflowStep = {
                                  id: `step-${Date.now()}`,
                                  type: 'action',
                                  appId: selectedAppData?.id || '',
                                  appName: selectedAppData?.name || '',
                                  appIcon: selectedAppData?.icon || '⚡',
                                  actionId: value,
                                  actionName: action.name,
                                  config: {}
                                };
                                setWorkflowSteps([newStep, ...workflowSteps]);
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="h-6 w-6 p-0 rounded-full bg-background border-2 border-dashed border-muted-foreground/50 hover:border-primary flex items-center justify-center">
                            <Plus className="h-3 w-3 text-muted-foreground" />
                          </SelectTrigger>
                          <SelectContent align="center">
                            <SelectItem value="__condition__">
                              <span className="flex items-center gap-2">
                                <GitBranch className="h-3 w-3 text-purple-500" />
                                <span>Add Condition</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="__delay__">
                              <span className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-orange-500" />
                                <span>Add Delay</span>
                              </span>
                            </SelectItem>
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">Actions</div>
                            {availableApps.map((app) => (
                              <React.Fragment key={app.id}>
                                <div className="px-2 py-1 text-[10px] text-muted-foreground/70 flex items-center gap-1">
                                  <span>{app.icon}</span> {app.name}
                                </div>
                                {app.actions.map((action) => (
                                  <SelectItem key={action.id} value={action.id}>
                                    <span className="flex items-center gap-2 pl-2">
                                      <Zap className="h-3 w-3 text-green-500" />
                                      <span className="text-xs">{action.name}</span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </React.Fragment>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Additional Steps - Actions and Conditions */}
                    {workflowSteps.map((wfStep, index) => (
                      <React.Fragment key={wfStep.id}>
                        {/* Render Action Step */}
                        {wfStep.type === 'action' && (
                          <div className="flex items-center justify-center">
                            <div className="relative group">
                              <div 
                                className="w-48 p-3 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-500/20 border border-violet-400/30 cursor-pointer hover:ring-2 hover:ring-violet-400/50 transition-all"
                                onClick={() => setEditingStepId(wfStep.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl">
                                    {wfStep.appIcon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-violet-200 font-medium">STEP {index + 2}</p>
                                    <p className="text-sm font-semibold truncate">{wfStep.actionName}</p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeWorkflowStep(wfStep.id);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between">
                                  <p className="text-[10px] text-violet-200">{wfStep.appName}</p>
                                  <Settings className="h-3 w-3 text-violet-300" />
                                </div>
                              </div>
                              {/* Connection Line */}
                              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-violet-500 to-transparent" />
                            </div>
                          </div>
                        )}

                        {/* Render Condition Step - n8n Style with Branch Workflows */}
                        {wfStep.type === 'condition' && (
                          <div className="flex flex-col items-center w-full">
                            {/* Condition Node */}
                            <div className="relative group">
                              <div 
                                className="w-56 p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20 border border-purple-400/30 cursor-pointer hover:ring-2 hover:ring-purple-400/50 transition-all"
                                onClick={() => setEditingStepId(wfStep.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <GitBranch className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-purple-200 font-medium">STEP {index + 2} • IF/ELSE</p>
                                    <p className="text-sm font-semibold">Condition</p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeWorkflowStep(wfStep.id);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="mt-2 pt-2 border-t border-white/20">
                                  <p className="text-[10px] text-purple-200">
                                    {(wfStep.conditions?.length || 0)} condition{(wfStep.conditions?.length || 0) !== 1 ? 's' : ''} defined
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Branch Split Visual */}
                            <div className="flex items-start gap-0 mt-2">
                              {/* Left connector */}
                              <div className="w-24 h-4 border-l-2 border-t-2 border-green-500 rounded-tl-xl" />
                              {/* Right connector */}
                              <div className="w-24 h-4 border-r-2 border-t-2 border-red-500 rounded-tr-xl" />
                            </div>
                            
                            {/* n8n-Style Branch Columns */}
                            <div className="flex gap-6 w-full max-w-xl justify-center">
                              {/* TRUE Branch Column */}
                              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                                <div className="w-0.5 h-3 bg-green-500" />
                                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold mb-2 border border-green-500/30">
                                  ✓ TRUE PATH
                                </div>
                                
                                {/* TRUE Branch Steps */}
                                {(wfStep.trueBranch || []).map((branchStep, bIdx) => (
                                  <div key={branchStep.id} className="flex flex-col items-center w-full">
                                    <div className="relative group w-full">
                                      <div className="w-full p-2 rounded-lg bg-green-600/90 text-white border border-green-400/30 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <span className="text-base">{branchStep.appIcon}</span>
                                          <span className="text-xs font-medium truncate">{branchStep.actionName}</span>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-5 w-5 text-white/70 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removeStepFromBranch(wfStep.id, 'true', branchStep.id);
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-0.5 h-3 bg-green-500/50" />
                                  </div>
                                ))}
                                
                                {/* Add to TRUE Branch - Inline Action Selector */}
                                <Select
                                  value=""
                                  onValueChange={(actionId) => {
                                    const action = actions.find(a => a.id === actionId);
                                    if (action) {
                                      const selectedAppData = availableApps.find(app => 
                                        app.actions.some(a => a.id === actionId)
                                      );
                                      addStepToBranch(
                                        wfStep.id, 
                                        'true', 
                                        actionId, 
                                        action.name, 
                                        selectedAppData?.icon || '⚡'
                                      );
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-[10px] border-dashed border-green-500/50 hover:border-green-500 bg-green-500/5 text-green-600 w-full">
                                    <SelectValue placeholder="➕ Add Action..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableApps.map((app) => (
                                      <React.Fragment key={app.id}>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                          <span>{app.icon}</span> {app.name}
                                        </div>
                                        {app.actions.map((action) => (
                                          <SelectItem key={action.id} value={action.id}>
                                            <span className="flex items-center gap-2 pl-4">
                                              <Zap className="h-3 w-3" />
                                              <span>{action.name}</span>
                                            </span>
                                          </SelectItem>
                                        ))}
                                      </React.Fragment>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* FALSE Branch Column */}
                              <div className="flex flex-col items-center flex-1 max-w-[200px]">
                                <div className="w-0.5 h-3 bg-red-500" />
                                <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold mb-2 border border-red-500/30">
                                  ✗ FALSE PATH
                                </div>
                                
                                {/* FALSE Branch Steps */}
                                {(wfStep.falseBranch || []).map((branchStep, bIdx) => (
                                  <div key={branchStep.id} className="flex flex-col items-center w-full">
                                    <div className="relative group w-full">
                                      <div className="w-full p-2 rounded-lg bg-red-600/90 text-white border border-red-400/30 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <span className="text-base">{branchStep.appIcon}</span>
                                          <span className="text-xs font-medium truncate">{branchStep.actionName}</span>
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-5 w-5 text-white/70 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              removeStepFromBranch(wfStep.id, 'false', branchStep.id);
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-0.5 h-3 bg-red-500/50" />
                                  </div>
                                ))}
                                
                                {/* Add to FALSE Branch - Inline Action Selector */}
                                <Select
                                  value=""
                                  onValueChange={(actionId) => {
                                    const action = actions.find(a => a.id === actionId);
                                    if (action) {
                                      const selectedAppData = availableApps.find(app => 
                                        app.actions.some(a => a.id === actionId)
                                      );
                                      addStepToBranch(
                                        wfStep.id, 
                                        'false', 
                                        actionId, 
                                        action.name, 
                                        selectedAppData?.icon || '⚡'
                                      );
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-[10px] border-dashed border-red-500/50 hover:border-red-500 bg-red-500/5 text-red-600 w-full">
                                    <SelectValue placeholder={(wfStep.falseBranch || []).length === 0 ? "➕ Add or Skip..." : "➕ Add Action..."} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(wfStep.falseBranch || []).length === 0 && (
                                      <SelectItem value="__skip__" disabled>
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                          <span>⏭️</span>
                                          <span>Leave empty to skip</span>
                                        </span>
                                      </SelectItem>
                                    )}
                                    {availableApps.map((app) => (
                                      <React.Fragment key={app.id}>
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                          <span>{app.icon}</span> {app.name}
                                        </div>
                                        {app.actions.map((action) => (
                                          <SelectItem key={action.id} value={action.id}>
                                            <span className="flex items-center gap-2 pl-4">
                                              <Zap className="h-3 w-3" />
                                              <span>{action.name}</span>
                                            </span>
                                          </SelectItem>
                                        ))}
                                      </React.Fragment>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            {/* Merge Visual */}
                            <div className="flex items-end gap-0 mt-2">
                              <div className="w-24 h-4 border-l-2 border-b-2 border-muted-foreground/30 rounded-bl-xl" />
                              <div className="w-24 h-4 border-r-2 border-b-2 border-muted-foreground/30 rounded-br-xl" />
                            </div>
                            <div className="w-0.5 h-3 bg-muted-foreground/30" />
                          </div>
                        )}

                        {/* Render Delay Step */}
                        {wfStep.type === 'delay' && (
                          <div className="flex items-center justify-center">
                            <div className="relative group">
                              <div 
                                className="w-48 p-3 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-500/20 border border-orange-400/30 cursor-pointer hover:ring-2 hover:ring-orange-400/50 transition-all"
                                onClick={() => setEditingStepId(wfStep.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                    <Clock className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-orange-200 font-medium">STEP {index + 2} • DELAY</p>
                                    <p className="text-sm font-semibold">
                                      Wait {wfStep.delayAmount || 5} {wfStep.delayUnit || 'minutes'}
                                    </p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeWorkflowStep(wfStep.id);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-orange-500 to-transparent" />
                            </div>
                          </div>
                        )}

                        {/* Connector with Insert Button */}
                        <div className="flex justify-center group/connector relative">
                          <div className="w-0.5 h-8 bg-muted-foreground/30" />
                          {/* Insert Step Popover */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/connector:opacity-100 transition-opacity z-10">
                            <Select
                              value=""
                              onValueChange={(value) => {
                                if (value === '__condition__') {
                                  // Insert condition at this position
                                  const newCondition: WorkflowStep = {
                                    id: `condition-${Date.now()}`,
                                    type: 'condition',
                                    conditions: [],
                                    trueBranch: [],
                                    falseBranch: [],
                                    config: {}
                                  };
                                  const newSteps = [...workflowSteps];
                                  newSteps.splice(index + 1, 0, newCondition);
                                  setWorkflowSteps(newSteps);
                                } else if (value === '__delay__') {
                                  // Insert delay at this position
                                  const newDelay: WorkflowStep = {
                                    id: `delay-${Date.now()}`,
                                    type: 'delay',
                                    delayAmount: 5,
                                    delayUnit: 'minutes',
                                    config: {}
                                  };
                                  const newSteps = [...workflowSteps];
                                  newSteps.splice(index + 1, 0, newDelay);
                                  setWorkflowSteps(newSteps);
                                } else {
                                  // Insert action
                                  const action = actions.find(a => a.id === value);
                                  if (action) {
                                    const selectedAppData = availableApps.find(app => 
                                      app.actions.some(a => a.id === value)
                                    );
                                    const newStep: WorkflowStep = {
                                      id: `step-${Date.now()}`,
                                      type: 'action',
                                      appId: selectedAppData?.id || '',
                                      appName: selectedAppData?.name || '',
                                      appIcon: selectedAppData?.icon || '⚡',
                                      actionId: value,
                                      actionName: action.name,
                                      config: {}
                                    };
                                    const newSteps = [...workflowSteps];
                                    newSteps.splice(index + 1, 0, newStep);
                                    setWorkflowSteps(newSteps);
                                  }
                                }
                              }}
                            >
                              <SelectTrigger className="h-6 w-6 p-0 rounded-full bg-background border-2 border-dashed border-muted-foreground/50 hover:border-primary flex items-center justify-center">
                                <Plus className="h-3 w-3 text-muted-foreground" />
                              </SelectTrigger>
                              <SelectContent align="center">
                                <SelectItem value="__condition__">
                                  <span className="flex items-center gap-2">
                                    <GitBranch className="h-3 w-3 text-purple-500" />
                                    <span>Add Condition</span>
                                  </span>
                                </SelectItem>
                                <SelectItem value="__delay__">
                                  <span className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-orange-500" />
                                    <span>Add Delay</span>
                                  </span>
                                </SelectItem>
                                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground border-t mt-1 pt-1">Actions</div>
                                {availableApps.map((app) => (
                                  <React.Fragment key={app.id}>
                                    <div className="px-2 py-1 text-[10px] text-muted-foreground/70 flex items-center gap-1">
                                      <span>{app.icon}</span> {app.name}
                                    </div>
                                    {app.actions.map((action) => (
                                      <SelectItem key={action.id} value={action.id}>
                                        <span className="flex items-center gap-2 pl-2">
                                          <Zap className="h-3 w-3 text-green-500" />
                                          <span className="text-xs">{action.name}</span>
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </React.Fragment>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </React.Fragment>
                    ))}

                    {/* Add More Steps - Choice between Action, Condition, or Delay */}
                    <div className="flex justify-center">
                      {!isAddingStep ? (
                        <div className="flex gap-2 flex-wrap justify-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-dashed border-2 hover:border-green-500 hover:bg-green-500/5 gap-2"
                            onClick={() => {
                              setIsAddingStep(true);
                              setAddStepType('action');
                            }}
                          >
                            <Zap className="h-4 w-4 text-green-500" />
                            Add Action
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-dashed border-2 hover:border-purple-500 hover:bg-purple-500/5 gap-2"
                            onClick={() => addConditionStep()}
                          >
                            <GitBranch className="h-4 w-4 text-purple-500" />
                            Add Condition
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-dashed border-2 hover:border-orange-500 hover:bg-orange-500/5 gap-2"
                            onClick={() => addDelayStep()}
                          >
                            <Clock className="h-4 w-4 text-orange-500" />
                            Add Delay
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">Adding step...</Badge>
                      )}
                    </div>
                  </>
                )}

                {/* End Node */}
                {(selectedAction || (useConditionalLogic && trueAction)) && (
                  <>
                    <div className="flex justify-center">
                      <div className="w-0.5 h-6 bg-muted-foreground/30" />
                    </div>
                    <div className="flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-muted-foreground/30">
                        <CheckCircle className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ============ NODE CONFIGURATION PANEL ============ */}
          {/* Action Selection Panel */}
          {((editingStepId === 'action1' && !useConditionalLogic) || 
            (!selectedAction && !useConditionalLogic && !editingStepId)) && (
            <Card className="border-green-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-500" />
                  Select Action
                </CardTitle>
                <CardDescription>Choose what action to perform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                  {actions.length === 0 ? (
                    <div className="col-span-full text-center py-4 text-muted-foreground">
                      No actions available for this integration
                    </div>
                  ) : (
                    actions.map((action) => (
                      <div
                        key={action.id}
                        className={`p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          selectedAction === action.id
                            ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500/20'
                            : 'border-transparent bg-muted/50 hover:border-green-500/50 hover:bg-muted'
                        }`}
                        onClick={() => {
                          setSelectedAction(action.id);
                          setActionConfig({});
                          setEditingStepId(null);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{action.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{action.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Configuration Panel */}
          {selectedAction && currentAction && editingStepId === 'action1' && (currentAction.fields || currentAction.templates) && (
            <Card className="border-green-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-xl">{currentAction.icon}</span>
                    Configure: {currentAction.name}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setEditingStepId(null)}>
                    Done
                  </Button>
                </div>
                <CardDescription>
                  Use {'{{variables}}'} like {'{{customer_name}}'} for dynamic data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(currentAction.fields || currentAction.templates || []).map((field: any) => (
                  <div key={field.key} className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      {field.label}
                      {field.required && <Badge variant="destructive" className="text-[10px]">Required</Badge>}
                    </Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        value={actionConfig[field.key] || field.default || ''}
                        onChange={(e) => setActionConfig({ ...actionConfig, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        rows={3}
                        className="font-mono text-sm"
                      />
                    ) : field.type === 'select' ? (
                      <Select 
                        value={actionConfig[field.key] || field.default || ''} 
                        onValueChange={(v) => setActionConfig({ ...actionConfig, [field.key]: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || 'Select...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options || []).map((opt: string) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type === 'password' ? 'password' : 'text'}
                        value={actionConfig[field.key] || field.default || ''}
                        onChange={(e) => setActionConfig({ ...actionConfig, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                      />
                    )}
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground">{field.helpText}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Condition Configuration Panel */}
          {editingStepId === 'condition' && useConditionalLogic && (
            <Card className="border-purple-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-purple-500" />
                    Configure Conditions
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setEditingStepId(null)}>
                    Done
                  </Button>
                </div>
                <CardDescription>Define when the TRUE path should execute</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {conditions.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed rounded-xl bg-muted/30">
                    <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">No conditions yet</p>
                    <Button variant="outline" size="sm" onClick={addCondition}>
                      <Plus className="h-4 w-4 mr-2" /> Add First Condition
                    </Button>
                  </div>
                ) : (
                  <>
                    {conditions.map((condition, index) => (
                      <div key={condition.id} className="space-y-2">
                        {index > 0 && (
                          <div className="flex items-center gap-2 py-2">
                            <div className="flex-1 h-px bg-border" />
                            <Select 
                              value={condition.logicOperator} 
                              onValueChange={(v) => updateCondition(condition.id, { logicOperator: v as 'AND' | 'OR' })}
                            >
                              <SelectTrigger className="w-20 h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">AND</SelectItem>
                                <SelectItem value="OR">OR</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex-1 h-px bg-border" />
                          </div>
                        )}
                        <div className="p-3 rounded-xl bg-muted/50 border space-y-2">
                          <div className="grid grid-cols-12 gap-2">
                            {/* Field */}
                            <div className="col-span-4">
                              <Select value={condition.field} onValueChange={(v) => updateCondition(condition.id, { field: v })}>
                                <SelectTrigger className="h-9 text-xs">
                                  <SelectValue placeholder="Field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {conditionFields.map(f => (
                                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Operator */}
                            <div className="col-span-4">
                              <Select value={condition.operator} onValueChange={(v) => updateCondition(condition.id, { operator: v })}>
                                <SelectTrigger className="h-9 text-xs">
                                  <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                  {conditionOperators.map(op => (
                                    <SelectItem key={op.value} value={op.value}>
                                      <span className="flex items-center gap-2">
                                        <span>{op.icon}</span>
                                        <span>{op.label}</span>
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Value */}
                            <div className="col-span-3">
                              {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                                <Input
                                  value={condition.value}
                                  onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                                  placeholder="Value..."
                                  className="h-9 text-xs"
                                />
                              )}
                            </div>
                            {/* Remove */}
                            <div className="col-span-1 flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-9 w-9 text-destructive hover:text-destructive"
                                onClick={() => removeCondition(condition.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addCondition} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Another Condition
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* TRUE Action Selection Panel */}
          {editingStepId === 'trueAction' && useConditionalLogic && (
            <Card className="border-green-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    IF TRUE → Select Action
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setEditingStepId(null)}>
                    Done
                  </Button>
                </div>
                <CardDescription>Action to perform when conditions are met</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto">
                  {actions.map((action) => (
                    <div
                      key={action.id}
                      className={`p-3 rounded-xl cursor-pointer transition-all border-2 ${
                        trueAction === action.id
                          ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500/20'
                          : 'border-transparent bg-muted/50 hover:border-green-500/50 hover:bg-muted'
                      }`}
                      onClick={() => {
                        setTrueAction(action.id);
                        setTrueActionConfig({});
                      }}
                    >
                      <div className="text-center">
                        <span className="text-2xl">{action.icon}</span>
                        <p className="text-xs font-medium mt-1 truncate">{action.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* TRUE Action Config Fields */}
                {trueAction && trueActionDetails?.fields && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    {trueActionDetails.fields.slice(0, 3).map((field: any) => (
                      <div key={field.key} className="space-y-1">
                        <Label className="text-xs">{field.label}</Label>
                        <Input
                          value={trueActionConfig[field.key] || ''}
                          onChange={(e) => setTrueActionConfig({ ...trueActionConfig, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          className="h-9"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* FALSE Action Selection Panel */}
          {editingStepId === 'falseAction' && useConditionalLogic && (
            <Card className="border-red-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    IF FALSE → Select Action (Optional)
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setEditingStepId(null)}>
                    Done
                  </Button>
                </div>
                <CardDescription>Action when conditions are NOT met</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto">
                  {/* Skip Option */}
                  <div
                    className={`p-3 rounded-xl cursor-pointer transition-all border-2 ${
                      falseAction === ''
                        ? 'border-muted-foreground bg-muted ring-2 ring-muted-foreground/20'
                        : 'border-transparent bg-muted/50 hover:border-muted-foreground/50'
                    }`}
                    onClick={() => {
                      setFalseAction('');
                      setFalseActionConfig({});
                    }}
                  >
                    <div className="text-center">
                      <span className="text-2xl">⏭️</span>
                      <p className="text-xs font-medium mt-1">Skip</p>
                    </div>
                  </div>
                  {actions.map((action) => (
                    <div
                      key={action.id}
                      className={`p-3 rounded-xl cursor-pointer transition-all border-2 ${
                        falseAction === action.id
                          ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500/20'
                          : 'border-transparent bg-muted/50 hover:border-red-500/50 hover:bg-muted'
                      }`}
                      onClick={() => {
                        setFalseAction(action.id);
                        setFalseActionConfig({});
                      }}
                    >
                      <div className="text-center">
                        <span className="text-2xl">{action.icon}</span>
                        <p className="text-xs font-medium mt-1 truncate">{action.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add App Step Panel */}
          {isAddingStep && addStepType === 'action' && (
            <Card className="border-violet-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    Add Action Step
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setIsAddingStep(false);
                    setAddStepType(null);
                    setAddStepAppId('');
                    setAddStepActionId('');
                  }}>
                    Cancel
                  </Button>
                </div>
                <CardDescription>Chain another app action to your workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* App Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">1. Choose App</Label>
                  <Select value={addStepAppId} onValueChange={(v) => {
                    setAddStepAppId(v);
                    setAddStepActionId('');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an app..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {availableApps.map(app => (
                        <SelectItem key={app.id} value={app.id}>
                          <span className="flex items-center gap-2">
                            <span className="text-lg">{app.icon}</span>
                            <span>{app.name}</span>
                            {!app.hasSpecificActions && (
                              <Badge variant="outline" className="text-[9px] ml-1">Generic</Badge>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Selection */}
                {addStepAppId && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">2. Choose Action</Label>
                    {(() => {
                      const selectedApp = availableApps.find(a => a.id === addStepAppId);
                      const appActions = selectedApp?.actions || [];
                      
                      return appActions.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No actions available</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                          {appActions.map((action: any) => (
                            <div
                              key={action.id}
                              className={`p-2 rounded-lg cursor-pointer transition-all border-2 ${
                                addStepActionId === action.id
                                  ? 'border-violet-500 bg-violet-500/10'
                                  : 'border-transparent bg-muted/50 hover:border-violet-500/50'
                              }`}
                              onClick={() => setAddStepActionId(action.id)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{action.icon}</span>
                                <span className="text-xs font-medium truncate">{action.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Add Button */}
                {addStepAppId && addStepActionId && (
                  <Button 
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    onClick={() => addWorkflowStep(addStepAppId, addStepActionId)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Workflow
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Workflow Step Configuration Panel - Action Type */}
          {editingStepId && !['action1', 'condition', 'trueAction', 'falseAction'].includes(editingStepId) && (() => {
            const editingStep = workflowSteps.find(s => s.id === editingStepId);
            if (!editingStep) return null;
            
            // Handle Action Step Configuration
            if (editingStep.type === 'action') {
              const stepFields = getStepActionFields(editingStep.appId || '', editingStep.actionId || '');
              
              return (
                <Card className="border-violet-500/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span className="text-xl">{editingStep.appIcon}</span>
                        Configure: {editingStep.actionName}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setEditingStepId(null)}>
                        Done
                      </Button>
                    </div>
                    <CardDescription>{editingStep.appName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {stepFields.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No configuration needed</p>
                    ) : (
                      stepFields.map((field: any) => (
                        <div key={field.key} className="space-y-1">
                          <Label className="text-xs flex items-center gap-2">
                            {field.label}
                            {field.required && <Badge variant="destructive" className="text-[9px]">Required</Badge>}
                          </Label>
                          {field.type === 'textarea' ? (
                            <Textarea
                              value={editingStep.config[field.key] || ''}
                              onChange={(e) => updateWorkflowStepConfig(editingStep.id, {
                                ...editingStep.config,
                                [field.key]: e.target.value
                              })}
                              placeholder={field.placeholder}
                              rows={2}
                              className="text-sm"
                            />
                          ) : (
                            <Input
                              value={editingStep.config[field.key] || ''}
                              onChange={(e) => updateWorkflowStepConfig(editingStep.id, {
                                ...editingStep.config,
                                [field.key]: e.target.value
                              })}
                              placeholder={field.placeholder}
                              className="h-9"
                            />
                          )}
                        </div>
                      ))
                    )}
                    <div className="pt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => moveWorkflowStep(editingStep.id, 'up')}>
                        <ArrowUp className="h-4 w-4 mr-1" /> Move Up
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => moveWorkflowStep(editingStep.id, 'down')}>
                        <ArrowDown className="h-4 w-4 mr-1" /> Move Down
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            
            // Handle Condition Step Configuration
            if (editingStep.type === 'condition') {
              return (
                <Card className="border-purple-500/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-purple-500" />
                        Configure Condition Step
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setEditingStepId(null)}>
                        Done
                      </Button>
                    </div>
                    <CardDescription>Define conditions and actions for TRUE/FALSE paths</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Conditions Builder */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <span className="text-purple-500">IF</span> Conditions
                      </Label>
                      
                      {(editingStep.conditions || []).length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed rounded-xl bg-muted/30">
                          <GitBranch className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground mb-2">No conditions defined</p>
                          <Button variant="outline" size="sm" onClick={() => addConditionToStep(editingStep.id)}>
                            <Plus className="h-3 w-3 mr-1" /> Add Condition
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(editingStep.conditions || []).map((cond, idx) => (
                            <div key={cond.id} className="space-y-2">
                              {idx > 0 && (
                                <div className="flex items-center gap-2 py-1">
                                  <div className="flex-1 h-px bg-border" />
                                  <Select 
                                    value={cond.logicOperator} 
                                    onValueChange={(v) => updateConditionInStep(editingStep.id, cond.id, { logicOperator: v })}
                                  >
                                    <SelectTrigger className="w-16 h-6 text-[10px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="AND">AND</SelectItem>
                                      <SelectItem value="OR">OR</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <div className="flex-1 h-px bg-border" />
                                </div>
                              )}
                              <div className="p-2 rounded-lg bg-muted/50 border">
                                <div className="grid grid-cols-12 gap-1.5">
                                  <div className="col-span-4">
                                    <Select value={cond.field} onValueChange={(v) => updateConditionInStep(editingStep.id, cond.id, { field: v })}>
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Field" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {conditionFields.map(f => (
                                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-3">
                                    <Select value={cond.operator} onValueChange={(v) => updateConditionInStep(editingStep.id, cond.id, { operator: v })}>
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Op" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {conditionOperators.map(op => (
                                          <SelectItem key={op.value} value={op.value}>
                                            <span className="flex items-center gap-1">
                                              <span>{op.icon}</span>
                                              <span className="text-xs">{op.label}</span>
                                            </span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-4">
                                    {!['is_empty', 'is_not_empty'].includes(cond.operator) && (
                                      <Input
                                        value={cond.value}
                                        onChange={(e) => updateConditionInStep(editingStep.id, cond.id, { value: e.target.value })}
                                        placeholder="Value"
                                        className="h-8 text-xs"
                                      />
                                    )}
                                  </div>
                                  <div className="col-span-1 flex justify-end">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => removeConditionFromStep(editingStep.id, cond.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={() => addConditionToStep(editingStep.id)} className="w-full">
                            <Plus className="h-3 w-3 mr-1" /> Add Another Condition
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* TRUE Branch - n8n Style */}
                    <div className="space-y-3 pt-3 border-t">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">TRUE PATH</span>
                        <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-500">
                          {(editingStep.trueBranch || []).length} step{(editingStep.trueBranch || []).length !== 1 ? 's' : ''}
                        </Badge>
                      </Label>
                      
                      {(editingStep.trueBranch || []).length > 0 ? (
                        <div className="space-y-2">
                          {(editingStep.trueBranch || []).map((step, idx) => (
                            <div key={step.id} className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                              <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-600">
                                {idx + 1}
                              </div>
                              <span className="text-lg">{step.appIcon}</span>
                              <span className="text-sm flex-1">{step.actionName}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => removeStepFromBranch(editingStep.id, 'true', step.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 border-2 border-dashed border-green-500/30 rounded-lg bg-green-500/5">
                          <p className="text-xs text-muted-foreground">No actions in TRUE path</p>
                        </div>
                      )}
                      
                      {/* Add Action to TRUE Branch */}
                      <Select 
                        value="" 
                        onValueChange={(actionId) => {
                          const action = actions.find(a => a.id === actionId);
                          if (action) {
                            const selectedAppData = availableApps.find(app => 
                              app.actions.some(a => a.id === actionId)
                            );
                            addStepToBranch(
                              editingStep.id, 
                              'true', 
                              actionId, 
                              action.name, 
                              selectedAppData?.icon || '⚡'
                            );
                          }
                        }}
                      >
                        <SelectTrigger className="h-9 border-dashed border-green-500/50 hover:border-green-500">
                          <SelectValue placeholder="➕ Add action to TRUE path..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableApps.map((app) => (
                            <React.Fragment key={app.id}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2 bg-muted/50">
                                <span>{app.icon}</span> {app.name}
                              </div>
                              {app.actions.map((action) => (
                                <SelectItem key={action.id} value={action.id}>
                                  <span className="flex items-center gap-2 pl-3">
                                    <Zap className="h-3 w-3 text-green-500" />
                                    <span>{action.name}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </React.Fragment>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* FALSE Branch - n8n Style */}
                    <div className="space-y-3 pt-3 border-t">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-500">FALSE PATH</span>
                        <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-500">
                          {(editingStep.falseBranch || []).length === 0 ? 'Skip' : `${(editingStep.falseBranch || []).length} step${(editingStep.falseBranch || []).length !== 1 ? 's' : ''}`}
                        </Badge>
                      </Label>
                      
                      {(editingStep.falseBranch || []).length > 0 ? (
                        <div className="space-y-2">
                          {(editingStep.falseBranch || []).map((step, idx) => (
                            <div key={step.id} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                              <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center text-xs font-bold text-red-600">
                                {idx + 1}
                              </div>
                              <span className="text-lg">{step.appIcon}</span>
                              <span className="text-sm flex-1">{step.actionName}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={() => removeStepFromBranch(editingStep.id, 'false', step.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 border-2 border-dashed border-red-500/30 rounded-lg bg-red-500/5">
                          <p className="text-xs text-muted-foreground">Skip (no actions)</p>
                        </div>
                      )}
                      
                      {/* Add Action to FALSE Branch */}
                      <Select 
                        value="" 
                        onValueChange={(actionId) => {
                          const action = actions.find(a => a.id === actionId);
                          if (action) {
                            const selectedAppData = availableApps.find(app => 
                              app.actions.some(a => a.id === actionId)
                            );
                            addStepToBranch(
                              editingStep.id, 
                              'false', 
                              actionId, 
                              action.name, 
                              selectedAppData?.icon || '⚡'
                            );
                          }
                        }}
                      >
                        <SelectTrigger className="h-9 border-dashed border-red-500/50 hover:border-red-500">
                          <SelectValue placeholder="➕ Add action to FALSE path..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__skip__" disabled>
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <span>⏭️</span>
                              <span>Leave empty to skip</span>
                            </span>
                          </SelectItem>
                          {availableApps.map((app) => (
                            <React.Fragment key={app.id}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-2 bg-muted/50">
                                <span>{app.icon}</span> {app.name}
                              </div>
                              {app.actions.map((action) => (
                                <SelectItem key={action.id} value={action.id}>
                                  <span className="flex items-center gap-2 pl-3">
                                    <Zap className="h-3 w-3 text-red-500" />
                                    <span>{action.name}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </React.Fragment>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Move buttons */}
                    <div className="pt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => moveWorkflowStep(editingStep.id, 'up')}>
                        <ArrowUp className="h-4 w-4 mr-1" /> Move Up
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => moveWorkflowStep(editingStep.id, 'down')}>
                        <ArrowDown className="h-4 w-4 mr-1" /> Move Down
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            
            // Handle Delay Step Configuration
            if (editingStep.type === 'delay') {
              return (
                <Card className="border-orange-500/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        Configure Delay Step
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setEditingStepId(null)}>
                        Done
                      </Button>
                    </div>
                    <CardDescription>Add a wait/delay between steps</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-2">
                        <Label className="text-sm">Duration</Label>
                        <Input
                          type="number"
                          min={1}
                          value={editingStep.delayAmount || 5}
                          onChange={(e) => {
                            setWorkflowSteps(workflowSteps.map(s => 
                              s.id === editingStep.id ? { ...s, delayAmount: parseInt(e.target.value) || 1 } : s
                            ));
                          }}
                          className="h-9"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label className="text-sm">Unit</Label>
                        <Select 
                          value={editingStep.delayUnit || 'minutes'} 
                          onValueChange={(v) => {
                            setWorkflowSteps(workflowSteps.map(s => 
                              s.id === editingStep.id ? { ...s, delayUnit: v as 'seconds' | 'minutes' | 'hours' | 'days' } : s
                            ));
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="seconds">Seconds</SelectItem>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <p className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>
                          Wait <strong>{editingStep.delayAmount || 5} {editingStep.delayUnit || 'minutes'}</strong> before continuing
                        </span>
                      </p>
                    </div>
                    
                    {/* Move buttons */}
                    <div className="pt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => moveWorkflowStep(editingStep.id, 'up')}>
                        <ArrowUp className="h-4 w-4 mr-1" /> Move Up
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => moveWorkflowStep(editingStep.id, 'down')}>
                        <ArrowDown className="h-4 w-4 mr-1" /> Move Down
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }
            
            return null;
          })()}

          {/* Integration Summary */}
          <Card className="bg-gradient-to-br from-muted/50 to-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Integration Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">App:</span>
                  <span className="font-medium flex items-center gap-1">
                    {integrationType.icon} {integrationType.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Triggers:</span>
                  <span className="font-medium">{selectedTriggers.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flow Type:</span>
                  {useConditionalLogic ? (
                    <Badge variant="secondary" className="text-xs">
                      <GitBranch className="h-3 w-3 mr-1" />
                      Conditional
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Linear
                    </Badge>
                  )}
                </div>
                {workflowSteps.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Steps:</span>
                    <Badge variant="outline" className="text-xs">
                      {1 + workflowSteps.length + (useConditionalLogic ? 1 : 0)} nodes
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !isStep4Valid} 
              size="lg" 
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Zap className="h-4 w-4" />
              Create Integration
            </Button>
          </div>
        </div>
      )}

        </div>
      </ScrollArea>
    </div>
  );
}

// Export wrapped component with error boundary
export default function IntegrationsPage() {
  return (
    <IntegrationErrorBoundary>
      <IntegrationsPageContent />
    </IntegrationErrorBoundary>
  );
}
