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
// DEFAULT TEMPLATES
// ============================================

const DEFAULT_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'welcome-message',
    name: 'WhatsApp Welcome Message',
    description: 'Send an automated welcome message when a new customer contacts you on WhatsApp.',
    category: 'communication',
    tags: ['whatsapp', 'welcome', 'automation'],
    icon: '👋',
    nodes: [
      { id: '1', type: 'whatsapp_trigger', name: 'WhatsApp Trigger', position: { x: 100, y: 200 } },
      { id: '2', type: 'condition', name: 'Is New Customer?', position: { x: 350, y: 200 } },
      { id: '3', type: 'whatsapp_send', name: 'Send Welcome', position: { x: 600, y: 150 } },
      { id: '4', type: 'whatsapp_send', name: 'Send Reply', position: { x: 600, y: 250 } },
    ],
    connections: [
      { sourceNodeId: '1', targetNodeId: '2' },
      { sourceNodeId: '2', targetNodeId: '3', sourceOutput: 'true' },
      { sourceNodeId: '2', targetNodeId: '4', sourceOutput: 'false' },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    author: 'Template Team',
    usageCount: 1250,
    rating: 4.8,
    isFeatured: true,
  },
  {
    id: 'lead-capture',
    name: 'Lead Capture to CRM',
    description: 'Automatically capture leads from forms and add them to your CRM with AI enrichment.',
    category: 'sales',
    tags: ['lead', 'crm', 'automation', 'ai'],
    icon: '🎯',
    nodes: [
      { id: '1', type: 'webhook', name: 'Form Webhook', position: { x: 100, y: 200 } },
      { id: '2', type: 'ai_enrichment', name: 'AI Enrichment', position: { x: 350, y: 200 } },
      { id: '3', type: 'hubspot', name: 'Create Contact', position: { x: 600, y: 200 } },
      { id: '4', type: 'slack', name: 'Notify Sales', position: { x: 850, y: 200 } },
    ],
    connections: [
      { sourceNodeId: '1', targetNodeId: '2' },
      { sourceNodeId: '2', targetNodeId: '3' },
      { sourceNodeId: '3', targetNodeId: '4' },
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
    author: 'Template Team',
    usageCount: 890,
    rating: 4.6,
    isFeatured: true,
  },
  {
    id: 'ai-chatbot',
    name: 'AI Customer Support Bot',
    description: 'Intelligent chatbot that answers customer questions using your knowledge base.',
    category: 'ai',
    tags: ['ai', 'chatbot', 'support', 'openai'],
    icon: '🤖',
    nodes: [
      { id: '1', type: 'whatsapp_trigger', name: 'Message Received', position: { x: 100, y: 200 } },
      { id: '2', type: 'knowledge_search', name: 'Search KB', position: { x: 350, y: 200 } },
      { id: '3', type: 'openai', name: 'Generate Response', position: { x: 600, y: 200 } },
      { id: '4', type: 'whatsapp_send', name: 'Send Reply', position: { x: 850, y: 200 } },
    ],
    connections: [
      { sourceNodeId: '1', targetNodeId: '2' },
      { sourceNodeId: '2', targetNodeId: '3' },
      { sourceNodeId: '3', targetNodeId: '4' },
    ],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-01'),
    author: 'Template Team',
    usageCount: 2100,
    rating: 4.9,
    isFeatured: true,
  },
  {
    id: 'order-notification',
    name: 'E-Commerce Order Updates',
    description: 'Send WhatsApp notifications when order status changes in your store.',
    category: 'ecommerce',
    tags: ['ecommerce', 'orders', 'notifications', 'shopify'],
    icon: '📦',
    nodes: [
      { id: '1', type: 'shopify_trigger', name: 'Order Updated', position: { x: 100, y: 200 } },
      { id: '2', type: 'switch', name: 'Status Switch', position: { x: 350, y: 200 } },
      { id: '3', type: 'whatsapp_template', name: 'Order Confirmed', position: { x: 600, y: 100 } },
      { id: '4', type: 'whatsapp_template', name: 'Order Shipped', position: { x: 600, y: 200 } },
      { id: '5', type: 'whatsapp_template', name: 'Order Delivered', position: { x: 600, y: 300 } },
    ],
    connections: [
      { sourceNodeId: '1', targetNodeId: '2' },
      { sourceNodeId: '2', targetNodeId: '3', sourceOutput: 'confirmed' },
      { sourceNodeId: '2', targetNodeId: '4', sourceOutput: 'shipped' },
      { sourceNodeId: '2', targetNodeId: '5', sourceOutput: 'delivered' },
    ],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-20'),
    author: 'Template Team',
    usageCount: 1560,
    rating: 4.7,
  },
  {
    id: 'daily-digest',
    name: 'Daily Metrics Digest',
    description: 'Compile and send daily business metrics summary to Slack every morning.',
    category: 'productivity',
    tags: ['analytics', 'slack', 'scheduled', 'reporting'],
    icon: '📊',
    nodes: [
      { id: '1', type: 'schedule', name: '9 AM Daily', position: { x: 100, y: 200 } },
      { id: '2', type: 'google_analytics', name: 'Get Analytics', position: { x: 350, y: 150 } },
      { id: '3', type: 'stripe', name: 'Get Revenue', position: { x: 350, y: 250 } },
      { id: '4', type: 'merge', name: 'Combine Data', position: { x: 600, y: 200 } },
      { id: '5', type: 'slack', name: 'Send Digest', position: { x: 850, y: 200 } },
    ],
    connections: [
      { sourceNodeId: '1', targetNodeId: '2' },
      { sourceNodeId: '1', targetNodeId: '3' },
      { sourceNodeId: '2', targetNodeId: '4' },
      { sourceNodeId: '3', targetNodeId: '4' },
      { sourceNodeId: '4', targetNodeId: '5' },
    ],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-25'),
    author: 'Template Team',
    usageCount: 780,
    rating: 4.5,
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminders',
    description: 'Automatically send appointment reminders via WhatsApp based on calendar events.',
    category: 'productivity',
    tags: ['calendar', 'reminders', 'whatsapp', 'scheduling'],
    icon: '📅',
    nodes: [
      { id: '1', type: 'google_calendar', name: 'Calendar Trigger', position: { x: 100, y: 200 } },
      { id: '2', type: 'wait', name: 'Wait Until 24h Before', position: { x: 350, y: 200 } },
      { id: '3', type: 'whatsapp_template', name: 'Send Reminder', position: { x: 600, y: 200 } },
    ],
    connections: [
      { sourceNodeId: '1', targetNodeId: '2' },
      { sourceNodeId: '2', targetNodeId: '3' },
    ],
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-02-10'),
    author: 'Template Team',
    usageCount: 1120,
    rating: 4.6,
  },
  {
    id: 'feedback-collection',
    name: 'Customer Feedback Collection',
    description: 'Collect customer feedback after interactions and store responses in a spreadsheet.',
    category: 'support',
    tags: ['feedback', 'survey', 'google sheets', 'automation'],
    icon: '⭐',
    nodes: [
      { id: '1', type: 'schedule', name: 'Daily at 6 PM', position: { x: 100, y: 200 } },
      { id: '2', type: 'airtable', name: 'Get Interactions', position: { x: 350, y: 200 } },
      { id: '3', type: 'loop', name: 'For Each Customer', position: { x: 600, y: 200 } },
      { id: '4', type: 'whatsapp_template', name: 'Send Survey', position: { x: 850, y: 200 } },
    ],
    connections: [
      { sourceNodeId: '1', targetNodeId: '2' },
      { sourceNodeId: '2', targetNodeId: '3' },
      { sourceNodeId: '3', targetNodeId: '4' },
    ],
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-03-01'),
    author: 'Template Team',
    usageCount: 650,
    rating: 4.4,
  },
  {
    id: 'data-sync',
    name: 'Multi-Platform Data Sync',
    description: 'Keep customer data synchronized across CRM, email marketing, and support tools.',
    category: 'data',
    tags: ['sync', 'integration', 'crm', 'automation'],
    icon: '🔄',
    nodes: [
      { id: '1', type: 'hubspot_trigger', name: 'Contact Updated', position: { x: 100, y: 200 } },
      { id: '2', type: 'mailchimp', name: 'Update Subscriber', position: { x: 350, y: 150 } },
      { id: '3', type: 'zendesk', name: 'Update Customer', position: { x: 350, y: 250 } },
      { id: '4', type: 'slack', name: 'Log Sync', position: { x: 600, y: 200 } },
    ],
    connections: [
      { sourceNodeId: '1', targetNodeId: '2' },
      { sourceNodeId: '1', targetNodeId: '3' },
      { sourceNodeId: '2', targetNodeId: '4' },
      { sourceNodeId: '3', targetNodeId: '4' },
    ],
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-03-05'),
    author: 'Template Team',
    usageCount: 420,
    rating: 4.3,
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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl">
              {template.icon}
            </div>
            <div>
              <DialogTitle>{template.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {template.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
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
                <div key={node.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {idx + 1}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <Badge variant="outline">{node.name}</Badge>
                  <span className="text-xs text-muted-foreground">({node.type})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onImport}>
            <Download className="w-4 h-4 mr-2" />
            Import Template
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
      <div className={cn('flex flex-col h-full', className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
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
        <div className="p-4 border-b space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
            </div>

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
        <div className="flex flex-1 min-h-0">
          {/* Category Sidebar */}
          <div className="w-48 border-r flex-shrink-0">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-1">
                {(Object.entries(CATEGORY_CONFIG) as [TemplateCategory, { label: string; icon: React.ReactNode }][]).map(
                  ([key, { label, icon }]) => (
                    <Button
                      key={key}
                      variant={activeCategory === key ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
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
          <ScrollArea className="flex-1">
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
