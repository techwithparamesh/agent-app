/**
 * Empty Canvas Trigger Selector
 * 
 * Displays "What triggers this workflow?" panel when canvas is empty.
 * n8n-style trigger selection with categories.
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  MousePointer2,
  Zap,
  Clock,
  Webhook,
  FileText,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Plus,
  Layout,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface TriggerOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'manual' | 'event' | 'schedule' | 'webhook' | 'form' | 'chat' | 'workflow';
  hasSubmenu?: boolean;
  popular?: boolean;
}

export interface EmptyCanvasTriggerSelectorProps {
  onSelectTrigger: (triggerId: string, appId?: string) => void;
  onStartFromTemplate?: () => void;
  onBuildWithAI?: () => void;
  className?: string;
}

// ============================================
// TRIGGER OPTIONS
// ============================================

const triggerOptions: TriggerOption[] = [
  {
    id: 'manual',
    name: 'Trigger manually',
    description: 'Runs the flow on clicking a button. Good for getting started quickly',
    icon: '👆',
    color: '#8B5CF6',
    category: 'manual',
    popular: true,
  },
  {
    id: 'app_event',
    name: 'On app event',
    description: 'Runs the flow when something happens in an app like Telegram, Notion or Airtable',
    icon: '⚡',
    color: '#F59E0B',
    category: 'event',
    hasSubmenu: true,
    popular: true,
  },
  {
    id: 'schedule',
    name: 'On a schedule',
    description: 'Runs the flow every day, hour, or custom interval',
    icon: '🕐',
    color: '#10B981',
    category: 'schedule',
    popular: true,
  },
  {
    id: 'webhook',
    name: 'On webhook call',
    description: 'Runs the flow on receiving an HTTP request',
    icon: '🔗',
    color: '#6B7280',
    category: 'webhook',
    popular: true,
  },
  {
    id: 'form',
    name: 'On form submission',
    description: 'Generate webforms and pass their responses to the workflow',
    icon: '📋',
    color: '#EC4899',
    category: 'form',
  },
  {
    id: 'execute_workflow',
    name: 'When executed by another workflow',
    description: 'Runs the flow when called by the Execute Workflow node from a different workflow',
    icon: '🔄',
    color: '#3B82F6',
    category: 'workflow',
  },
  {
    id: 'chat_trigger',
    name: 'On chat message',
    description: 'Runs the flow when a chat message is received',
    icon: '💬',
    color: '#FF6D5A',
    category: 'chat',
    popular: true,
  },
];

// App event sub-options
const appEventOptions: TriggerOption[] = [
  { id: 'whatsapp_message', name: 'WhatsApp', description: 'When a message is received', icon: '💬', color: '#25D366', category: 'event' },
  { id: 'telegram_message', name: 'Telegram', description: 'When a message is received', icon: '✈️', color: '#0088CC', category: 'event' },
  { id: 'slack_message', name: 'Slack', description: 'When a message is posted', icon: '💼', color: '#4A154B', category: 'event' },
  { id: 'gmail_received', name: 'Gmail', description: 'When an email is received', icon: '📧', color: '#EA4335', category: 'event' },
  { id: 'notion_page', name: 'Notion', description: 'When a page is created/updated', icon: '📓', color: '#000000', category: 'event' },
  { id: 'airtable_record', name: 'Airtable', description: 'When a record is created/updated', icon: '📑', color: '#FCBF49', category: 'event' },
  { id: 'hubspot_contact', name: 'HubSpot', description: 'When a contact is created', icon: '🧲', color: '#FF7A59', category: 'event' },
  { id: 'stripe_payment', name: 'Stripe', description: 'When a payment is received', icon: '💳', color: '#635BFF', category: 'event' },
  { id: 'google_sheet_row', name: 'Google Sheets', description: 'When a row is added', icon: '📊', color: '#34A853', category: 'event' },
  { id: 'github_event', name: 'GitHub', description: 'When a push/PR/issue occurs', icon: '🐙', color: '#181717', category: 'event' },
];

// ============================================
// TRIGGER ITEM COMPONENT
// ============================================

interface TriggerItemProps {
  trigger: TriggerOption;
  onClick: () => void;
  showArrow?: boolean;
}

function TriggerItem({ trigger, onClick, showArrow }: TriggerItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: `${trigger.color}20` }}
      >
        {trigger.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{trigger.name}</span>
          {trigger.popular && (
            <span className="px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded">Popular</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {trigger.description}
        </p>
      </div>
      {(showArrow || trigger.hasSubmenu) && (
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
      )}
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function EmptyCanvasTriggerSelector({
  onSelectTrigger,
  onStartFromTemplate,
  onBuildWithAI,
  className,
}: EmptyCanvasTriggerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAppEvents, setShowAppEvents] = useState(false);

  // Filter triggers based on search
  const filteredTriggers = useMemo(() => {
    if (!searchQuery) return triggerOptions;
    const query = searchQuery.toLowerCase();
    return triggerOptions.filter(
      t => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredAppEvents = useMemo(() => {
    if (!searchQuery) return appEventOptions;
    const query = searchQuery.toLowerCase();
    return appEventOptions.filter(
      t => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleTriggerClick = (trigger: TriggerOption) => {
    if (trigger.id === 'app_event') {
      setShowAppEvents(true);
    } else {
      onSelectTrigger(trigger.id);
    }
  };

  return (
    <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none", className)}>
      {/* Right side - Trigger selector panel */}
      <div className="w-96 bg-background border rounded-lg shadow-lg overflow-hidden pointer-events-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg">
            {showAppEvents ? 'Select an app' : 'What triggers this workflow?'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {showAppEvents 
              ? 'Choose which app event should trigger this workflow'
              : 'A trigger is a step that starts your workflow'
            }
          </p>
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search triggers..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Trigger list */}
        <ScrollArea className="h-[350px]">
          <div className="p-2">
            {showAppEvents ? (
              <>
                <button
                  onClick={() => setShowAppEvents(false)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 px-2"
                >
                  ← Back to triggers
                </button>
                {filteredAppEvents.map((trigger) => (
                  <TriggerItem
                    key={trigger.id}
                    trigger={trigger}
                    onClick={() => onSelectTrigger(trigger.id, trigger.id.split('_')[0])}
                  />
                ))}
              </>
            ) : (
              filteredTriggers.map((trigger) => (
                <TriggerItem
                  key={trigger.id}
                  trigger={trigger}
                  onClick={() => handleTriggerClick(trigger)}
                  showArrow={trigger.hasSubmenu}
                />
              ))
            )}
          </div>
        </ScrollArea>
        
        {/* Template shortcut */}
        {onStartFromTemplate && (
          <div className="p-3 border-t bg-muted/30">
            <button
              onClick={onStartFromTemplate}
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
            >
              <Layout className="h-4 w-4" />
              Or start from a template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmptyCanvasTriggerSelector;
