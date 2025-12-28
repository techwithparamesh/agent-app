/**
 * Templates Gallery Component
 * 
 * Browse, search, and import pre-built workflow templates.
 * Features: Categories, import/export, search, preview.
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Search,
  Layout,
  Download,
  Upload,
  Star,
  StarOff,
  MoreVertical,
  Copy,
  ExternalLink,
  Clock,
  Users,
  Zap,
  MessageSquare,
  Mail,
  Calendar,
  Database,
  Globe,
  Bot,
  FileText,
  ShoppingCart,
  BarChart3,
  Workflow,
  ArrowRight,
  Check,
  Filter,
  SortAsc,
  Grid3X3,
  List,
  Plus,
  Play,
  Eye,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type TemplateCategory =
  | 'all'
  | 'featured'
  | 'marketing'
  | 'sales'
  | 'support'
  | 'ai'
  | 'data'
  | 'productivity'
  | 'ecommerce'
  | 'communication';

export interface TemplateNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  parameters?: Record<string, unknown>;
}

export interface TemplateConnection {
  sourceNodeId: string;
  targetNodeId: string;
  sourceOutput?: string;
  targetInput?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  icon: string;
  nodes: TemplateNode[];
  connections: TemplateConnection[];
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  usageCount?: number;
  rating?: number;
  isFeatured?: boolean;
  isStarred?: boolean;
}

export interface TemplatesGalleryProps {
  templates?: WorkflowTemplate[];
  onImportTemplate?: (template: WorkflowTemplate) => void;
  onPreviewTemplate?: (template: WorkflowTemplate) => void;
  onStarTemplate?: (templateId: string, starred: boolean) => void;
  onUploadTemplate?: (file: File) => void;
  className?: string;
}

// ============================================
// CATEGORY CONFIG
// ============================================

const CATEGORY_CONFIG: Record<TemplateCategory, { label: string; icon: React.ReactNode }> = {
  all: { label: 'All Templates', icon: <Layout className="w-4 h-4" /> },
  featured: { label: 'Featured', icon: <Star className="w-4 h-4" /> },
  marketing: { label: 'Marketing', icon: <BarChart3 className="w-4 h-4" /> },
  sales: { label: 'Sales', icon: <ShoppingCart className="w-4 h-4" /> },
  support: { label: 'Support', icon: <MessageSquare className="w-4 h-4" /> },
  ai: { label: 'AI & Automation', icon: <Bot className="w-4 h-4" /> },
  data: { label: 'Data & Analytics', icon: <Database className="w-4 h-4" /> },
  productivity: { label: 'Productivity', icon: <Zap className="w-4 h-4" /> },
  ecommerce: { label: 'E-Commerce', icon: <ShoppingCart className="w-4 h-4" /> },
  communication: { label: 'Communication', icon: <Mail className="w-4 h-4" /> },
};

// ============================================
// DEFAULT TEMPLATES - Real End-to-End Workflows
// ============================================

const DEFAULT_TEMPLATES: WorkflowTemplate[] = [
  // ==========================================
  // FEATURED / COMMUNICATION
  // ==========================================
  {
    id: 'whatsapp-lead-nurture',
    name: 'WhatsApp Lead Nurturing Workflow',
    description: 'When a new lead comes via WhatsApp, enrich with AI, add to HubSpot CRM, and send personalized follow-up sequence.',
    category: 'featured',
    tags: ['whatsapp', 'hubspot', 'ai', 'lead-nurturing', 'automation'],
    icon: '🚀',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'WhatsApp Message Received', position: { x: 100, y: 200 }, parameters: { appId: 'whatsapp', triggerId: 'message_received' } },
      { id: 'action-1', type: 'action', name: 'Extract Lead Info (OpenAI)', position: { x: 380, y: 200 }, parameters: { appId: 'openai', actionId: 'chat_completion', prompt: 'Extract name, email, phone, and intent from this message: {{trigger.message}}' } },
      { id: 'action-2', type: 'action', name: 'Create HubSpot Contact', position: { x: 660, y: 140 }, parameters: { appId: 'hubspot', actionId: 'create_contact' } },
      { id: 'action-3', type: 'action', name: 'Send Welcome Reply', position: { x: 660, y: 260 }, parameters: { appId: 'whatsapp', actionId: 'send_message', message: 'Hi {{name}}! Thanks for reaching out. Our team will contact you shortly. 🎉' } },
      { id: 'action-4', type: 'action', name: 'Notify Sales on Slack', position: { x: 940, y: 200 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#sales-leads' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-2' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-3' },
      { sourceNodeId: 'action-2', targetNodeId: 'action-4' },
    ],
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-28'),
    author: 'AgentSphere Team',
    usageCount: 3420,
    rating: 4.9,
    isFeatured: true,
  },
  {
    id: 'email-to-slack-ai-summary',
    name: 'Email → AI Summary → Slack',
    description: 'When important emails arrive in Gmail, use AI to summarize and post to Slack with priority tagging.',
    category: 'communication',
    tags: ['gmail', 'openai', 'slack', 'productivity', 'ai-summary'],
    icon: '📧',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'New Gmail Email', position: { x: 100, y: 200 }, parameters: { appId: 'gmail', triggerId: 'new_email', filter: 'is:important' } },
      { id: 'condition-1', type: 'condition', name: 'Check Priority', position: { x: 380, y: 200 }, parameters: { condition: '{{trigger.headers.priority}} == "high" OR contains({{trigger.from}}, "client")' } },
      { id: 'action-1', type: 'action', name: 'AI Summarize Email', position: { x: 660, y: 140 }, parameters: { appId: 'openai', actionId: 'chat_completion', prompt: 'Summarize this email in 2-3 bullet points and identify action items:\n\nFrom: {{trigger.from}}\nSubject: {{trigger.subject}}\nBody: {{trigger.body}}' } },
      { id: 'action-2', type: 'action', name: 'Post to Slack #urgent', position: { x: 940, y: 140 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#urgent-emails' } },
      { id: 'action-3', type: 'action', name: 'Log to Google Sheets', position: { x: 660, y: 280 }, parameters: { appId: 'google_sheets', actionId: 'append_row' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'condition-1' },
      { sourceNodeId: 'condition-1', targetNodeId: 'action-1', sourceOutput: 'true' },
      { sourceNodeId: 'condition-1', targetNodeId: 'action-3', sourceOutput: 'false' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-2' },
    ],
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-12-20'),
    author: 'AgentSphere Team',
    usageCount: 2150,
    rating: 4.7,
    isFeatured: true,
  },

  // ==========================================
  // MARKETING
  // ==========================================
  {
    id: 'social-content-automation',
    name: 'AI Social Media Content Pipeline',
    description: 'Generate AI content ideas, create posts, schedule to multiple platforms, and track engagement.',
    category: 'marketing',
    tags: ['openai', 'twitter', 'linkedin', 'buffer', 'content-marketing'],
    icon: '📱',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'Weekly Schedule (Mon 9AM)', position: { x: 100, y: 200 }, parameters: { appId: 'schedule', triggerId: 'cron', cron: '0 9 * * 1' } },
      { id: 'action-1', type: 'action', name: 'Generate 5 Content Ideas', position: { x: 380, y: 200 }, parameters: { appId: 'openai', actionId: 'chat_completion', prompt: 'Generate 5 engaging social media post ideas for a SaaS product. Include hooks and hashtags.' } },
      { id: 'action-2', type: 'action', name: 'Create Twitter Thread', position: { x: 660, y: 120 }, parameters: { appId: 'twitter', actionId: 'create_tweet' } },
      { id: 'action-3', type: 'action', name: 'Create LinkedIn Post', position: { x: 660, y: 240 }, parameters: { appId: 'linkedin', actionId: 'create_post' } },
      { id: 'action-4', type: 'action', name: 'Save to Content Calendar', position: { x: 940, y: 180 }, parameters: { appId: 'notion', actionId: 'create_page' } },
      { id: 'action-5', type: 'action', name: 'Notify Marketing Team', position: { x: 1220, y: 180 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#marketing' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-2' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-3' },
      { sourceNodeId: 'action-2', targetNodeId: 'action-4' },
      { sourceNodeId: 'action-3', targetNodeId: 'action-4' },
      { sourceNodeId: 'action-4', targetNodeId: 'action-5' },
    ],
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-12-15'),
    author: 'AgentSphere Team',
    usageCount: 1890,
    rating: 4.6,
  },
  {
    id: 'mailchimp-abandoned-cart',
    name: 'Abandoned Cart Email Sequence',
    description: 'When cart is abandoned in Shopify, trigger Mailchimp email sequence with personalized product recommendations.',
    category: 'marketing',
    tags: ['shopify', 'mailchimp', 'ecommerce', 'abandoned-cart', 'email'],
    icon: '🛒',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'Shopify Cart Abandoned', position: { x: 100, y: 200 }, parameters: { appId: 'shopify', triggerId: 'checkout_abandoned' } },
      { id: 'action-1', type: 'action', name: 'Wait 1 Hour', position: { x: 380, y: 200 }, parameters: { appId: 'delay', actionId: 'wait', duration: '1h' } },
      { id: 'condition-1', type: 'condition', name: 'Still Abandoned?', position: { x: 660, y: 200 }, parameters: { condition: '{{shopify.checkout_status}} != "completed"' } },
      { id: 'action-2', type: 'action', name: 'Send Recovery Email #1', position: { x: 940, y: 140 }, parameters: { appId: 'mailchimp', actionId: 'send_campaign' } },
      { id: 'action-3', type: 'action', name: 'Wait 24 Hours', position: { x: 1220, y: 140 }, parameters: { appId: 'delay', actionId: 'wait', duration: '24h' } },
      { id: 'action-4', type: 'action', name: 'Send 10% Discount Email', position: { x: 1500, y: 140 }, parameters: { appId: 'mailchimp', actionId: 'send_campaign', template: 'discount_offer' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'action-1', targetNodeId: 'condition-1' },
      { sourceNodeId: 'condition-1', targetNodeId: 'action-2', sourceOutput: 'true' },
      { sourceNodeId: 'action-2', targetNodeId: 'action-3' },
      { sourceNodeId: 'action-3', targetNodeId: 'action-4' },
    ],
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-12-01'),
    author: 'AgentSphere Team',
    usageCount: 2340,
    rating: 4.8,
  },

  // ==========================================
  // SALES
  // ==========================================
  {
    id: 'hubspot-deal-automation',
    name: 'HubSpot Deal Stage Automation',
    description: 'When deal moves stages in HubSpot, create tasks, update Slack, generate proposal in Google Docs.',
    category: 'sales',
    tags: ['hubspot', 'slack', 'google-docs', 'sales-automation', 'crm'],
    icon: '💼',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'HubSpot Deal Stage Changed', position: { x: 100, y: 200 }, parameters: { appId: 'hubspot', triggerId: 'deal_stage_changed' } },
      { id: 'switch-1', type: 'switch', name: 'Route by Stage', position: { x: 380, y: 200 }, parameters: { field: '{{trigger.deal_stage}}' } },
      { id: 'action-1', type: 'action', name: 'Create Proposal Doc', position: { x: 660, y: 80 }, parameters: { appId: 'google_docs', actionId: 'create_document', template: 'sales_proposal' } },
      { id: 'action-2', type: 'action', name: 'Assign Task to Rep', position: { x: 660, y: 180 }, parameters: { appId: 'hubspot', actionId: 'create_task' } },
      { id: 'action-3', type: 'action', name: 'Generate Contract', position: { x: 660, y: 280 }, parameters: { appId: 'google_docs', actionId: 'create_document', template: 'contract' } },
      { id: 'action-4', type: 'action', name: 'Celebrate in Slack 🎉', position: { x: 660, y: 380 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#sales-wins' } },
      { id: 'action-5', type: 'action', name: 'Log to Analytics', position: { x: 940, y: 200 }, parameters: { appId: 'google_sheets', actionId: 'append_row' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'switch-1' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-1', sourceOutput: 'proposal' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-2', sourceOutput: 'negotiation' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-3', sourceOutput: 'contract_sent' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-4', sourceOutput: 'closed_won' },
      { sourceNodeId: 'action-4', targetNodeId: 'action-5' },
    ],
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-12-10'),
    author: 'AgentSphere Team',
    usageCount: 1560,
    rating: 4.7,
    isFeatured: true,
  },
  {
    id: 'calendly-crm-sync',
    name: 'Calendly Meeting → CRM + Prep',
    description: 'When meeting is booked via Calendly, create CRM activity, send prep email, and add to Google Calendar.',
    category: 'sales',
    tags: ['calendly', 'hubspot', 'gmail', 'google-calendar', 'meetings'],
    icon: '📅',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'Calendly Booking Created', position: { x: 100, y: 200 }, parameters: { appId: 'calendly', triggerId: 'invitee_created' } },
      { id: 'action-1', type: 'action', name: 'Find/Create HubSpot Contact', position: { x: 380, y: 140 }, parameters: { appId: 'hubspot', actionId: 'search_contact' } },
      { id: 'action-2', type: 'action', name: 'Create Meeting Activity', position: { x: 660, y: 140 }, parameters: { appId: 'hubspot', actionId: 'create_engagement' } },
      { id: 'action-3', type: 'action', name: 'Send Prep Email to Rep', position: { x: 380, y: 280 }, parameters: { appId: 'gmail', actionId: 'send_email', to: '{{trigger.owner_email}}', subject: 'Prep for meeting with {{trigger.invitee_name}}' } },
      { id: 'action-4', type: 'action', name: 'Add Agenda to Calendar', position: { x: 660, y: 280 }, parameters: { appId: 'google_calendar', actionId: 'update_event' } },
      { id: 'action-5', type: 'action', name: 'Notify in Slack', position: { x: 940, y: 200 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#meetings' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-3' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-2' },
      { sourceNodeId: 'action-3', targetNodeId: 'action-4' },
      { sourceNodeId: 'action-2', targetNodeId: 'action-5' },
      { sourceNodeId: 'action-4', targetNodeId: 'action-5' },
    ],
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-11-25'),
    author: 'AgentSphere Team',
    usageCount: 1120,
    rating: 4.5,
  },

  // ==========================================
  // SUPPORT
  // ==========================================
  {
    id: 'zendesk-ai-triage',
    name: 'Zendesk AI Ticket Triage',
    description: 'New support tickets are analyzed by AI, auto-categorized, prioritized, and routed to the right team.',
    category: 'support',
    tags: ['zendesk', 'openai', 'slack', 'support', 'ai-triage'],
    icon: '🎫',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'New Zendesk Ticket', position: { x: 100, y: 200 }, parameters: { appId: 'zendesk', triggerId: 'ticket_created' } },
      { id: 'action-1', type: 'action', name: 'AI Analyze & Categorize', position: { x: 380, y: 200 }, parameters: { appId: 'openai', actionId: 'chat_completion', prompt: 'Analyze this support ticket and return JSON with: category (billing/technical/general), priority (high/medium/low), sentiment (positive/negative/neutral), suggested_response.\n\nTicket: {{trigger.subject}}\n{{trigger.description}}' } },
      { id: 'action-2', type: 'action', name: 'Update Ticket Tags', position: { x: 660, y: 200 }, parameters: { appId: 'zendesk', actionId: 'update_ticket' } },
      { id: 'switch-1', type: 'switch', name: 'Route by Priority', position: { x: 940, y: 200 }, parameters: { field: '{{ai_result.priority}}' } },
      { id: 'action-3', type: 'action', name: 'Alert #urgent-support', position: { x: 1220, y: 100 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#urgent-support' } },
      { id: 'action-4', type: 'action', name: 'Queue in #support', position: { x: 1220, y: 200 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#support-queue' } },
      { id: 'action-5', type: 'action', name: 'Log to Dashboard', position: { x: 1220, y: 300 }, parameters: { appId: 'google_sheets', actionId: 'append_row' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-2' },
      { sourceNodeId: 'action-2', targetNodeId: 'switch-1' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-3', sourceOutput: 'high' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-4', sourceOutput: 'medium' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-5', sourceOutput: 'low' },
    ],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-12-18'),
    author: 'AgentSphere Team',
    usageCount: 1780,
    rating: 4.8,
    isFeatured: true,
  },
  {
    id: 'whatsapp-support-bot',
    name: 'WhatsApp AI Support Bot',
    description: 'AI-powered WhatsApp support that answers FAQs, creates tickets for complex issues, and escalates to humans.',
    category: 'support',
    tags: ['whatsapp', 'openai', 'zendesk', 'ai-support', 'chatbot'],
    icon: '🤖',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'WhatsApp Message', position: { x: 100, y: 200 }, parameters: { appId: 'whatsapp', triggerId: 'message_received' } },
      { id: 'action-1', type: 'action', name: 'AI Generate Response', position: { x: 380, y: 200 }, parameters: { appId: 'openai', actionId: 'chat_completion', system: 'You are a helpful support agent. Answer questions about our product. If the issue requires human support, respond with [ESCALATE].' } },
      { id: 'condition-1', type: 'condition', name: 'Needs Escalation?', position: { x: 660, y: 200 }, parameters: { condition: 'contains({{ai_response}}, "[ESCALATE]")' } },
      { id: 'action-2', type: 'action', name: 'Create Zendesk Ticket', position: { x: 940, y: 120 }, parameters: { appId: 'zendesk', actionId: 'create_ticket' } },
      { id: 'action-3', type: 'action', name: 'Reply: Agent will contact', position: { x: 1220, y: 120 }, parameters: { appId: 'whatsapp', actionId: 'send_message', message: 'I understand this needs human attention. A support agent will contact you shortly. Your ticket number is #{{zendesk.ticket_id}}' } },
      { id: 'action-4', type: 'action', name: 'Send AI Response', position: { x: 940, y: 280 }, parameters: { appId: 'whatsapp', actionId: 'send_message', message: '{{ai_response}}' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'action-1', targetNodeId: 'condition-1' },
      { sourceNodeId: 'condition-1', targetNodeId: 'action-2', sourceOutput: 'true' },
      { sourceNodeId: 'condition-1', targetNodeId: 'action-4', sourceOutput: 'false' },
      { sourceNodeId: 'action-2', targetNodeId: 'action-3' },
    ],
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-22'),
    author: 'AgentSphere Team',
    usageCount: 2890,
    rating: 4.9,
  },

  // ==========================================
  // AI & AUTOMATION
  // ==========================================
  {
    id: 'ai-content-review',
    name: 'AI Content Review & Approval',
    description: 'Review blog posts with AI for SEO, tone, grammar. Auto-approve or flag for human review.',
    category: 'ai',
    tags: ['openai', 'notion', 'slack', 'content-review', 'seo'],
    icon: '✨',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'New Notion Page (Draft)', position: { x: 100, y: 200 }, parameters: { appId: 'notion', triggerId: 'page_created', filter: 'status:Draft' } },
      { id: 'action-1', type: 'action', name: 'AI Review Content', position: { x: 380, y: 200 }, parameters: { appId: 'openai', actionId: 'chat_completion', prompt: 'Review this blog post for: 1) SEO optimization (title, headings, keywords) 2) Grammar and clarity 3) Tone consistency. Return JSON with scores (1-10) and suggestions.\n\nContent: {{trigger.content}}' } },
      { id: 'condition-1', type: 'condition', name: 'All Scores > 7?', position: { x: 660, y: 200 }, parameters: { condition: '{{review.seo_score}} > 7 AND {{review.grammar_score}} > 7' } },
      { id: 'action-2', type: 'action', name: 'Auto-Approve: Ready', position: { x: 940, y: 120 }, parameters: { appId: 'notion', actionId: 'update_page', status: 'Ready to Publish' } },
      { id: 'action-3', type: 'action', name: 'Flag for Review', position: { x: 940, y: 280 }, parameters: { appId: 'notion', actionId: 'update_page', status: 'Needs Review' } },
      { id: 'action-4', type: 'action', name: 'Notify Editor', position: { x: 1220, y: 280 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#content-review' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'action-1', targetNodeId: 'condition-1' },
      { sourceNodeId: 'condition-1', targetNodeId: 'action-2', sourceOutput: 'true' },
      { sourceNodeId: 'condition-1', targetNodeId: 'action-3', sourceOutput: 'false' },
      { sourceNodeId: 'action-3', targetNodeId: 'action-4' },
    ],
    createdAt: new Date('2024-09-25'),
    updatedAt: new Date('2024-12-05'),
    author: 'AgentSphere Team',
    usageCount: 890,
    rating: 4.6,
  },
  {
    id: 'ai-image-generation-pipeline',
    name: 'AI Image Generation Pipeline',
    description: 'Generate product images with AI, resize for platforms, upload to cloud storage, and post to social.',
    category: 'ai',
    tags: ['openai', 'dalle', 'aws-s3', 'twitter', 'image-generation'],
    icon: '🎨',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'New Airtable Record', position: { x: 100, y: 200 }, parameters: { appId: 'airtable', triggerId: 'record_created', table: 'Image Requests' } },
      { id: 'action-1', type: 'action', name: 'Generate Image (DALL-E)', position: { x: 380, y: 200 }, parameters: { appId: 'openai', actionId: 'generate_image', prompt: '{{trigger.prompt}}', size: '1024x1024' } },
      { id: 'action-2', type: 'action', name: 'Upload to S3', position: { x: 660, y: 200 }, parameters: { appId: 'aws_s3', actionId: 'upload_file', bucket: 'generated-images' } },
      { id: 'action-3', type: 'action', name: 'Update Airtable with URL', position: { x: 940, y: 140 }, parameters: { appId: 'airtable', actionId: 'update_record' } },
      { id: 'condition-1', type: 'condition', name: 'Auto-Post Enabled?', position: { x: 940, y: 280 }, parameters: { condition: '{{trigger.auto_post}} == true' } },
      { id: 'action-4', type: 'action', name: 'Post to Twitter', position: { x: 1220, y: 280 }, parameters: { appId: 'twitter', actionId: 'create_tweet_with_media' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-2' },
      { sourceNodeId: 'action-2', targetNodeId: 'action-3' },
      { sourceNodeId: 'action-2', targetNodeId: 'condition-1' },
      { sourceNodeId: 'condition-1', targetNodeId: 'action-4', sourceOutput: 'true' },
    ],
    createdAt: new Date('2024-10-10'),
    updatedAt: new Date('2024-12-12'),
    author: 'AgentSphere Team',
    usageCount: 1240,
    rating: 4.7,
  },

  // ==========================================
  // DATA & ANALYTICS
  // ==========================================
  {
    id: 'daily-metrics-dashboard',
    name: 'Daily Metrics Dashboard Report',
    description: 'Pull metrics from Stripe, Google Analytics, HubSpot every morning. Compile and send to Slack.',
    category: 'data',
    tags: ['stripe', 'google-analytics', 'hubspot', 'slack', 'reporting'],
    icon: '📊',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'Daily at 8 AM', position: { x: 100, y: 200 }, parameters: { appId: 'schedule', triggerId: 'cron', cron: '0 8 * * *' } },
      { id: 'action-1', type: 'action', name: 'Get Stripe Revenue', position: { x: 380, y: 100 }, parameters: { appId: 'stripe', actionId: 'get_balance_transactions', period: 'yesterday' } },
      { id: 'action-2', type: 'action', name: 'Get GA Sessions', position: { x: 380, y: 200 }, parameters: { appId: 'google_analytics', actionId: 'get_report', metrics: 'sessions,users,bounceRate' } },
      { id: 'action-3', type: 'action', name: 'Get HubSpot Deals', position: { x: 380, y: 300 }, parameters: { appId: 'hubspot', actionId: 'get_deals', filter: 'created:yesterday' } },
      { id: 'action-4', type: 'action', name: 'Format Report (AI)', position: { x: 660, y: 200 }, parameters: { appId: 'openai', actionId: 'chat_completion', prompt: 'Create a concise daily metrics summary with emojis:\nRevenue: {{stripe.total}}\nSessions: {{ga.sessions}}\nNew Deals: {{hubspot.count}}' } },
      { id: 'action-5', type: 'action', name: 'Post to #metrics', position: { x: 940, y: 200 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#daily-metrics' } },
      { id: 'action-6', type: 'action', name: 'Save to Sheets', position: { x: 940, y: 320 }, parameters: { appId: 'google_sheets', actionId: 'append_row', spreadsheet: 'Metrics History' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-2' },
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-3' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-4' },
      { sourceNodeId: 'action-2', targetNodeId: 'action-4' },
      { sourceNodeId: 'action-3', targetNodeId: 'action-4' },
      { sourceNodeId: 'action-4', targetNodeId: 'action-5' },
      { sourceNodeId: 'action-4', targetNodeId: 'action-6' },
    ],
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-12-01'),
    author: 'AgentSphere Team',
    usageCount: 2450,
    rating: 4.8,
    isFeatured: true,
  },
  {
    id: 'database-sync-pipeline',
    name: 'Multi-Database Sync Pipeline',
    description: 'Keep PostgreSQL, MongoDB, and Airtable in sync. Detect changes and propagate across systems.',
    category: 'data',
    tags: ['postgresql', 'mongodb', 'airtable', 'data-sync', 'etl'],
    icon: '🔄',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'PostgreSQL Row Updated', position: { x: 100, y: 200 }, parameters: { appId: 'postgresql', triggerId: 'row_updated', table: 'customers' } },
      { id: 'action-1', type: 'action', name: 'Transform Data', position: { x: 380, y: 200 }, parameters: { appId: 'code', actionId: 'run_javascript', code: 'return { ...data, updatedAt: new Date().toISOString() }' } },
      { id: 'action-2', type: 'action', name: 'Update MongoDB', position: { x: 660, y: 140 }, parameters: { appId: 'mongodb', actionId: 'update_document', collection: 'customers' } },
      { id: 'action-3', type: 'action', name: 'Update Airtable', position: { x: 660, y: 280 }, parameters: { appId: 'airtable', actionId: 'update_record', table: 'Customers' } },
      { id: 'action-4', type: 'action', name: 'Log Sync Event', position: { x: 940, y: 200 }, parameters: { appId: 'google_sheets', actionId: 'append_row', spreadsheet: 'Sync Log' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-2' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-3' },
      { sourceNodeId: 'action-2', targetNodeId: 'action-4' },
      { sourceNodeId: 'action-3', targetNodeId: 'action-4' },
    ],
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-11-20'),
    author: 'AgentSphere Team',
    usageCount: 980,
    rating: 4.5,
  },

  // ==========================================
  // PRODUCTIVITY
  // ==========================================
  {
    id: 'meeting-notes-automation',
    name: 'Meeting Notes → Tasks Automation',
    description: 'After Google Meet, transcribe recording, extract action items with AI, create tasks in Asana.',
    category: 'productivity',
    tags: ['google-meet', 'openai', 'asana', 'notion', 'meeting-notes'],
    icon: '📝',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'Google Meet Recording Ready', position: { x: 100, y: 200 }, parameters: { appId: 'google_meet', triggerId: 'recording_ready' } },
      { id: 'action-1', type: 'action', name: 'Transcribe Audio (Whisper)', position: { x: 380, y: 200 }, parameters: { appId: 'openai', actionId: 'transcribe_audio' } },
      { id: 'action-2', type: 'action', name: 'Extract Action Items (GPT)', position: { x: 660, y: 200 }, parameters: { appId: 'openai', actionId: 'chat_completion', prompt: 'Extract action items, decisions, and key points from this meeting transcript. Return as structured JSON.' } },
      { id: 'action-3', type: 'action', name: 'Create Notion Page', position: { x: 940, y: 140 }, parameters: { appId: 'notion', actionId: 'create_page', template: 'Meeting Notes' } },
      { id: 'action-4', type: 'action', name: 'Create Asana Tasks', position: { x: 940, y: 280 }, parameters: { appId: 'asana', actionId: 'create_task' } },
      { id: 'action-5', type: 'action', name: 'Email Summary to Attendees', position: { x: 1220, y: 200 }, parameters: { appId: 'gmail', actionId: 'send_email', to: '{{trigger.attendees}}' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-2' },
      { sourceNodeId: 'action-2', targetNodeId: 'action-3' },
      { sourceNodeId: 'action-2', targetNodeId: 'action-4' },
      { sourceNodeId: 'action-3', targetNodeId: 'action-5' },
    ],
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-12-08'),
    author: 'AgentSphere Team',
    usageCount: 1670,
    rating: 4.7,
  },
  {
    id: 'github-issue-workflow',
    name: 'GitHub Issue → Project Management',
    description: 'New GitHub issues auto-create Linear tickets, notify Slack, and assign based on labels.',
    category: 'productivity',
    tags: ['github', 'linear', 'slack', 'project-management', 'devops'],
    icon: '🐙',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'New GitHub Issue', position: { x: 100, y: 200 }, parameters: { appId: 'github', triggerId: 'issue_created' } },
      { id: 'action-1', type: 'action', name: 'AI Categorize Issue', position: { x: 380, y: 200 }, parameters: { appId: 'openai', actionId: 'chat_completion', prompt: 'Categorize this GitHub issue: bug, feature, docs, or question. Also estimate priority (high/medium/low).\n\nTitle: {{trigger.title}}\nBody: {{trigger.body}}' } },
      { id: 'action-2', type: 'action', name: 'Create Linear Ticket', position: { x: 660, y: 200 }, parameters: { appId: 'linear', actionId: 'create_issue' } },
      { id: 'switch-1', type: 'switch', name: 'Route by Priority', position: { x: 940, y: 200 }, parameters: { field: '{{ai_result.priority}}' } },
      { id: 'action-3', type: 'action', name: 'Alert #urgent-bugs', position: { x: 1220, y: 120 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#urgent-bugs' } },
      { id: 'action-4', type: 'action', name: 'Post to #engineering', position: { x: 1220, y: 280 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#engineering' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-2' },
      { sourceNodeId: 'action-2', targetNodeId: 'switch-1' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-3', sourceOutput: 'high' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-4', sourceOutput: 'medium' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-4', sourceOutput: 'low' },
    ],
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-11-30'),
    author: 'AgentSphere Team',
    usageCount: 1340,
    rating: 4.6,
  },

  // ==========================================
  // E-COMMERCE
  // ==========================================
  {
    id: 'shopify-order-fulfillment',
    name: 'Shopify Order Fulfillment Flow',
    description: 'Complete order lifecycle: payment confirmed → inventory check → fulfillment → tracking → customer notification.',
    category: 'ecommerce',
    tags: ['shopify', 'whatsapp', 'slack', 'inventory', 'fulfillment'],
    icon: '📦',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'Shopify Order Paid', position: { x: 100, y: 200 }, parameters: { appId: 'shopify', triggerId: 'order_paid' } },
      { id: 'action-1', type: 'action', name: 'Check Inventory', position: { x: 380, y: 200 }, parameters: { appId: 'shopify', actionId: 'get_inventory_levels' } },
      { id: 'condition-1', type: 'condition', name: 'In Stock?', position: { x: 660, y: 200 }, parameters: { condition: '{{inventory.available}} >= {{order.quantity}}' } },
      { id: 'action-2', type: 'action', name: 'Create Fulfillment', position: { x: 940, y: 120 }, parameters: { appId: 'shopify', actionId: 'create_fulfillment' } },
      { id: 'action-3', type: 'action', name: 'Send WhatsApp: Shipped!', position: { x: 1220, y: 120 }, parameters: { appId: 'whatsapp', actionId: 'send_template', template: 'order_shipped' } },
      { id: 'action-4', type: 'action', name: 'Alert: Out of Stock', position: { x: 940, y: 300 }, parameters: { appId: 'slack', actionId: 'send_message', channel: '#inventory-alerts' } },
      { id: 'action-5', type: 'action', name: 'Email Customer: Backorder', position: { x: 1220, y: 300 }, parameters: { appId: 'gmail', actionId: 'send_email', template: 'backorder_notice' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'action-1' },
      { sourceNodeId: 'action-1', targetNodeId: 'condition-1' },
      { sourceNodeId: 'condition-1', targetNodeId: 'action-2', sourceOutput: 'true' },
      { sourceNodeId: 'condition-1', targetNodeId: 'action-4', sourceOutput: 'false' },
      { sourceNodeId: 'action-2', targetNodeId: 'action-3' },
      { sourceNodeId: 'action-4', targetNodeId: 'action-5' },
    ],
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-12-15'),
    author: 'AgentSphere Team',
    usageCount: 3120,
    rating: 4.9,
    isFeatured: true,
  },
  {
    id: 'stripe-subscription-lifecycle',
    name: 'Stripe Subscription Lifecycle',
    description: 'Handle subscription events: new signup welcome, renewal reminders, failed payments, and churn prevention.',
    category: 'ecommerce',
    tags: ['stripe', 'gmail', 'slack', 'subscription', 'billing'],
    icon: '💳',
    nodes: [
      { id: 'trigger-1', type: 'trigger', name: 'Stripe Subscription Event', position: { x: 100, y: 200 }, parameters: { appId: 'stripe', triggerId: 'subscription_updated' } },
      { id: 'switch-1', type: 'switch', name: 'Event Type', position: { x: 380, y: 200 }, parameters: { field: '{{trigger.event_type}}' } },
      { id: 'action-1', type: 'action', name: 'Welcome Email', position: { x: 660, y: 80 }, parameters: { appId: 'gmail', actionId: 'send_email', template: 'subscription_welcome' } },
      { id: 'action-2', type: 'action', name: 'Renewal Reminder', position: { x: 660, y: 180 }, parameters: { appId: 'gmail', actionId: 'send_email', template: 'renewal_reminder' } },
      { id: 'action-3', type: 'action', name: 'Payment Failed Alert', position: { x: 660, y: 280 }, parameters: { appId: 'gmail', actionId: 'send_email', template: 'payment_failed' } },
      { id: 'action-4', type: 'action', name: 'Churn Prevention Flow', position: { x: 660, y: 380 }, parameters: { appId: 'hubspot', actionId: 'enroll_workflow', workflow: 'churn_prevention' } },
      { id: 'action-5', type: 'action', name: 'Update CRM', position: { x: 940, y: 200 }, parameters: { appId: 'hubspot', actionId: 'update_contact' } },
    ],
    connections: [
      { sourceNodeId: 'trigger-1', targetNodeId: 'switch-1' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-1', sourceOutput: 'created' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-2', sourceOutput: 'upcoming_renewal' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-3', sourceOutput: 'payment_failed' },
      { sourceNodeId: 'switch-1', targetNodeId: 'action-4', sourceOutput: 'canceled' },
      { sourceNodeId: 'action-1', targetNodeId: 'action-5' },
      { sourceNodeId: 'action-4', targetNodeId: 'action-5' },
    ],
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-12-10'),
    author: 'AgentSphere Team',
    usageCount: 1890,
    rating: 4.7,
  },
];

// ============================================
// TEMPLATE CARD
// ============================================

interface TemplateCardProps {
  template: WorkflowTemplate;
  viewMode: 'grid' | 'list';
  onImport?: () => void;
  onPreview?: () => void;
  onStar?: (starred: boolean) => void;
}

function TemplateCard({ template, viewMode, onImport, onPreview, onStar }: TemplateCardProps) {
  const isGrid = viewMode === 'grid';

  return (
    <div
      className={cn(
        'group rounded-lg border bg-card hover:shadow-md transition-all',
        isGrid ? 'flex flex-col' : 'flex items-center gap-4 p-4'
      )}
    >
      {/* Icon & Header */}
      <div className={cn(isGrid ? 'p-4 pb-2' : 'flex items-center gap-3 flex-shrink-0')}>
        <div
          className={cn(
            'rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center',
            isGrid ? 'w-12 h-12 text-2xl mb-3' : 'w-10 h-10 text-xl'
          )}
        >
          {template.icon}
        </div>
        {!isGrid && (
          <div className="min-w-[150px]">
            <h4 className="font-medium line-clamp-1">{template.name}</h4>
            <p className="text-xs text-muted-foreground">
              {template.nodes.length} nodes
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn(isGrid ? 'px-4 pb-3 flex-1' : 'flex-1 min-w-0')}>
        {isGrid && (
          <h4 className="font-medium mb-1 line-clamp-1">{template.name}</h4>
        )}
        <p
          className={cn(
            'text-sm text-muted-foreground',
            isGrid ? 'line-clamp-2' : 'line-clamp-1'
          )}
        >
          {template.description}
        </p>

        {/* Tags */}
        <div className={cn('flex flex-wrap gap-1', isGrid ? 'mt-3' : 'mt-2')}>
          {template.tags.slice(0, isGrid ? 3 : 4).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats & Actions */}
      <div
        className={cn(
          isGrid
            ? 'px-4 py-3 border-t bg-muted/30 flex items-center justify-between'
            : 'flex items-center gap-4 flex-shrink-0'
        )}
      >
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {template.usageCount !== undefined && (
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {template.usageCount.toLocaleString()}
            </span>
          )}
          {template.rating !== undefined && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {template.rating}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onStar?.(!template.isStarred)}
              >
                {template.isStarred ? (
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                ) : (
                  <StarOff className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{template.isStarred ? 'Unstar' : 'Star'}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onPreview}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview</TooltipContent>
          </Tooltip>

          <Button size="sm" className="h-8" onClick={onImport}>
            <Download className="w-4 h-4 mr-1" />
            Use
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TEMPLATE PREVIEW DIALOG
// ============================================

interface TemplatePreviewDialogProps {
  template: WorkflowTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport?: () => void;
}

function TemplatePreviewDialog({
  template,
  open,
  onOpenChange,
  onImport,
}: TemplatePreviewDialogProps) {
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl flex-shrink-0">
              {template.icon}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg">{template.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {template.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-4 space-y-4">
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-muted-foreground" />
                <span>{template.nodes.length} nodes</span>
              </div>
              {template.usageCount !== undefined && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{template.usageCount.toLocaleString()} uses</span>
                </div>
              )}
              {template.rating !== undefined && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{template.rating} rating</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Workflow Preview */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="text-sm font-medium mb-3">Workflow Structure</h4>
              <div className="space-y-2">
                {template.nodes.map((node, idx) => (
                  <div key={node.id} className="flex items-center gap-2 flex-wrap">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {idx + 1}
                    </div>
                    {idx > 0 && <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    <Badge variant="outline" className="flex-shrink-0">{node.name}</Badge>
                    <span className="text-xs text-muted-foreground">({node.type})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Updated {template.updatedAt.toLocaleDateString()}</span>
              </div>
              {template.author && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>By {template.author}</span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onImport}>
            <Download className="w-4 h-4 mr-2" />
            Use Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TemplatesGallery({
  templates = DEFAULT_TEMPLATES,
  onImportTemplate,
  onPreviewTemplate,
  onStarTemplate,
  onUploadTemplate,
  className,
}: TemplatesGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Category filter
    if (activeCategory === 'featured') {
      result = result.filter((t) => t.isFeatured);
    } else if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.usageCount || 0) - (a.usageCount || 0);
        case 'recent':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [templates, activeCategory, searchQuery, sortBy]);

  // File upload handler
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onUploadTemplate?.(file);
      }
    };
    input.click();
  };

  return (
    <TooltipProvider>
      <div className={cn('flex flex-col h-full overflow-hidden', className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Workflow Templates
            </h3>
            <p className="text-sm text-muted-foreground">
              {filteredTemplates.length} templates available
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleFileUpload}>
                  <Upload className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload Template</TooltipContent>
            </Tooltip>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b space-y-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SortAsc className="w-4 h-4 mr-2" />
                  {sortBy === 'popular' && 'Most Popular'}
                  {sortBy === 'recent' && 'Most Recent'}
                  {sortBy === 'rating' && 'Highest Rated'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('popular')}>
                  {sortBy === 'popular' && <Check className="w-4 h-4 mr-2" />}
                  Most Popular
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('recent')}>
                  {sortBy === 'recent' && <Check className="w-4 h-4 mr-2" />}
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('rating')}>
                  {sortBy === 'rating' && <Check className="w-4 h-4 mr-2" />}
                  Highest Rated
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Categories & Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Category Sidebar */}
          <div className="w-48 border-r flex-shrink-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {(Object.entries(CATEGORY_CONFIG) as [TemplateCategory, { label: string; icon: React.ReactNode }][]).map(
                  ([key, { label, icon }]) => (
                    <Button
                      key={key}
                      variant={activeCategory === key ? 'secondary' : 'ghost'}
                      className="w-full justify-start text-sm"
                      size="sm"
                      onClick={() => setActiveCategory(key)}
                    >
                      {icon}
                      <span className="ml-2 truncate">{label}</span>
                    </Button>
                  )
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Templates Grid/List */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Layout className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No templates found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <div
                    className={cn(
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-3'
                    )}
                  >
                    {filteredTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        viewMode={viewMode}
                        onImport={() => onImportTemplate?.(template)}
                        onPreview={() => setPreviewTemplate(template)}
                        onStar={(starred) => onStarTemplate?.(template.id, starred)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Preview Dialog */}
        <TemplatePreviewDialog
          template={previewTemplate}
          open={!!previewTemplate}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
          onImport={() => {
            if (previewTemplate) {
              onImportTemplate?.(previewTemplate);
              setPreviewTemplate(null);
            }
          }}
        />
      </div>
    </TooltipProvider>
  );
}

export default TemplatesGallery;
