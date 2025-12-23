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
};

// App catalog - structured for the workspace
export const appCatalog = [
  // Communication
  { id: 'whatsapp', name: 'WhatsApp Business', icon: '💬', category: 'communication', color: '#25D366', popular: true, description: 'Send messages via WhatsApp' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', category: 'communication', color: '#0088cc', popular: true, description: 'Telegram bot integration' },
  { id: 'slack', name: 'Slack', icon: '💼', category: 'communication', color: '#4A154B', popular: true, description: 'Post to Slack channels' },
  { id: 'discord', name: 'Discord', icon: '🎮', category: 'communication', color: '#5865F2', description: 'Discord webhooks & bots' },
  { id: 'microsoft_teams', name: 'Microsoft Teams', icon: '👥', category: 'communication', color: '#6264A7', description: 'Teams messaging' },
  { id: 'twilio_sms', name: 'Twilio SMS', icon: '📱', category: 'communication', color: '#F22F46', description: 'SMS via Twilio' },
  
  // Email
  { id: 'gmail', name: 'Gmail', icon: '📧', category: 'email', color: '#EA4335', popular: true, description: 'Send emails via Gmail' },
  { id: 'outlook', name: 'Outlook', icon: '📨', category: 'email', color: '#0078D4', description: 'Microsoft Outlook email' },
  { id: 'sendgrid', name: 'SendGrid', icon: '📤', category: 'email', color: '#1A82E2', description: 'Transactional emails' },
  { id: 'mailchimp', name: 'Mailchimp', icon: '🐵', category: 'email', color: '#FFE01B', description: 'Email marketing' },
  { id: 'smtp', name: 'SMTP', icon: '✉️', category: 'email', color: '#6B7280', description: 'Custom SMTP server' },
  
  // Google Services
  { id: 'google_sheets', name: 'Google Sheets', icon: '📊', category: 'google', color: '#34A853', popular: true, description: 'Spreadsheet automation' },
  { id: 'google_drive', name: 'Google Drive', icon: '📁', category: 'google', color: '#4285F4', popular: true, description: 'File storage' },
  { id: 'google_calendar', name: 'Google Calendar', icon: '📅', category: 'google', color: '#4285F4', description: 'Calendar events' },
  { id: 'google_docs', name: 'Google Docs', icon: '📝', category: 'google', color: '#4285F4', description: 'Document creation' },
  { id: 'google_forms', name: 'Google Forms', icon: '📋', category: 'google', color: '#673AB7', description: 'Form responses' },
  
  // CRM
  { id: 'hubspot', name: 'HubSpot', icon: '🧲', category: 'crm', color: '#FF7A59', popular: true, description: 'CRM & marketing' },
  { id: 'salesforce', name: 'Salesforce', icon: '☁️', category: 'crm', color: '#00A1E0', description: 'Enterprise CRM' },
  { id: 'pipedrive', name: 'Pipedrive', icon: '🔧', category: 'crm', color: '#1E825F', description: 'Sales pipeline' },
  { id: 'zoho_crm', name: 'Zoho CRM', icon: '📈', category: 'crm', color: '#DC2626', description: 'Zoho CRM suite' },
  { id: 'freshsales', name: 'Freshsales', icon: '🌱', category: 'crm', color: '#13B5EA', description: 'Freshworks CRM' },
  
  // Automation
  { id: 'zapier', name: 'Zapier', icon: '⚡', category: 'automation', color: '#FF4A00', popular: true, description: 'Connect 5000+ apps' },
  { id: 'make', name: 'Make', icon: '🔄', category: 'automation', color: '#6F2DA8', popular: true, description: 'Visual automation' },
  { id: 'n8n', name: 'n8n', icon: '🔗', category: 'automation', color: '#EA4B71', description: 'Open-source automation' },
  { id: 'power_automate', name: 'Power Automate', icon: '⚙️', category: 'automation', color: '#0066FF', description: 'Microsoft flows' },
  
  // Storage
  { id: 'airtable', name: 'Airtable', icon: '📑', category: 'storage', color: '#FCBF49', popular: true, description: 'Spreadsheet database' },
  { id: 'notion', name: 'Notion', icon: '📓', category: 'storage', color: '#000000', popular: true, description: 'All-in-one workspace' },
  { id: 'firebase', name: 'Firebase', icon: '🔥', category: 'storage', color: '#FFCA28', description: 'Google Firebase' },
  { id: 'supabase', name: 'Supabase', icon: '⚡', category: 'storage', color: '#3ECF8E', description: 'Open-source Firebase' },
  { id: 'mongodb', name: 'MongoDB', icon: '🍃', category: 'storage', color: '#47A248', description: 'NoSQL database' },
  { id: 'aws_s3', name: 'AWS S3', icon: '☁️', category: 'storage', color: '#FF9900', description: 'Cloud storage' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦', category: 'storage', color: '#0061FF', description: 'File sync' },
  
  // E-commerce
  { id: 'stripe', name: 'Stripe', icon: '💳', category: 'ecommerce', color: '#635BFF', popular: true, description: 'Payment processing' },
  { id: 'razorpay', name: 'Razorpay', icon: '💰', category: 'ecommerce', color: '#0066FF', description: 'India payments' },
  { id: 'shopify', name: 'Shopify', icon: '🛒', category: 'ecommerce', color: '#96BF48', description: 'E-commerce platform' },
  { id: 'woocommerce', name: 'WooCommerce', icon: '🛍️', category: 'ecommerce', color: '#96588A', description: 'WordPress commerce' },
  { id: 'paypal', name: 'PayPal', icon: '🅿️', category: 'ecommerce', color: '#003087', description: 'PayPal payments' },
  
  // Productivity
  { id: 'trello', name: 'Trello', icon: '📋', category: 'productivity', color: '#0079BF', description: 'Kanban boards' },
  { id: 'asana', name: 'Asana', icon: '✅', category: 'productivity', color: '#F06A6A', description: 'Project management' },
  { id: 'jira', name: 'Jira', icon: '🎫', category: 'productivity', color: '#0052CC', description: 'Issue tracking' },
  { id: 'monday', name: 'Monday.com', icon: '📊', category: 'productivity', color: '#6C63FF', description: 'Work OS' },
  { id: 'clickup', name: 'ClickUp', icon: '🎯', category: 'productivity', color: '#7B68EE', description: 'Productivity platform' },
  { id: 'linear', name: 'Linear', icon: '📐', category: 'productivity', color: '#5E6AD2', description: 'Issue tracking' },
  { id: 'calendly', name: 'Calendly', icon: '📆', category: 'productivity', color: '#006BFF', description: 'Scheduling' },
  
  // Developer Tools
  { id: 'webhook', name: 'Webhook', icon: '🔗', category: 'developer', color: '#6B7280', popular: true, description: 'HTTP webhooks' },
  { id: 'rest_api', name: 'REST API', icon: '🌐', category: 'developer', color: '#10B981', description: 'Custom API calls' },
  { id: 'graphql', name: 'GraphQL', icon: '◼️', category: 'developer', color: '#E535AB', description: 'GraphQL queries' },
  { id: 'github', name: 'GitHub', icon: '🐙', category: 'developer', color: '#181717', description: 'Version control' },
  { id: 'gitlab', name: 'GitLab', icon: '🦊', category: 'developer', color: '#FC6D26', description: 'DevOps platform' },
  { id: 'bitbucket', name: 'Bitbucket', icon: '🧩', category: 'developer', color: '#0052CC', description: 'Git hosting' },
  
  // AI & ML
  { id: 'openai', name: 'OpenAI', icon: '🤖', category: 'ai', color: '#412991', popular: true, description: 'GPT models' },
  { id: 'anthropic', name: 'Claude', icon: '🧠', category: 'ai', color: '#C96442', popular: true, description: 'Anthropic AI' },
  { id: 'google_ai', name: 'Gemini', icon: '✨', category: 'ai', color: '#4285F4', description: 'Google AI' },
  { id: 'elevenlabs', name: 'ElevenLabs', icon: '🎙️', category: 'ai', color: '#000000', description: 'Voice AI' },
  { id: 'replicate', name: 'Replicate', icon: '🔄', category: 'ai', color: '#000000', description: 'ML models' },
  { id: 'huggingface', name: 'Hugging Face', icon: '🤗', category: 'ai', color: '#FFD21E', description: 'ML hub' },
  
  // Marketing
  { id: 'google_analytics', name: 'Google Analytics', icon: '📊', category: 'marketing', color: '#E37400', description: 'Web analytics' },
  { id: 'facebook_ads', name: 'Facebook Ads', icon: '📘', category: 'marketing', color: '#1877F2', description: 'Meta advertising' },
  { id: 'google_ads', name: 'Google Ads', icon: '🎯', category: 'marketing', color: '#4285F4', description: 'Search advertising' },
  { id: 'intercom', name: 'Intercom', icon: '💬', category: 'marketing', color: '#1F8FFF', description: 'Customer messaging' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', category: 'marketing', color: '#0A66C2', description: 'B2B marketing' },
  
  // Support
  { id: 'zendesk', name: 'Zendesk', icon: '🎧', category: 'support', color: '#03363D', description: 'Customer support' },
  { id: 'freshdesk', name: 'Freshdesk', icon: '🎫', category: 'support', color: '#25C16F', description: 'Help desk' },
  { id: 'crisp', name: 'Crisp', icon: '💬', category: 'support', color: '#4B5CFA', description: 'Live chat' },
  { id: 'tawk', name: 'Tawk.to', icon: '💭', category: 'support', color: '#03A84E', description: 'Free live chat' },
  
  // Voice & Video
  { id: 'twilio_voice', name: 'Twilio Voice', icon: '📞', category: 'voice', color: '#F22F46', description: 'Voice calls' },
  { id: 'zoom', name: 'Zoom', icon: '🎥', category: 'video', color: '#2D8CFF', description: 'Video meetings' },
  { id: 'google_meet', name: 'Google Meet', icon: '📹', category: 'video', color: '#00897B', description: 'Video calls' },
];

// Categories list
const categories = [
  { id: 'all', label: 'All Apps', count: appCatalog.length },
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
}

export function AppsPanel({
  isCollapsed = false,
  onToggleCollapse,
  onDragStart,
  onAppSelect,
  recentApps = ['whatsapp', 'gmail', 'openai', 'slack'],
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
    
    if (activeCategory !== 'all') {
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
    <div className="w-72 h-full bg-background/95 backdrop-blur-sm border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm">Apps</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleCollapse}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Categories tabs */}
      <div className="px-3 py-2 border-b">
        <ScrollArea className="w-full" orientation="horizontal">
          <div className="flex gap-1 pb-1">
            {categories.slice(0, 6).map(category => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs whitespace-nowrap"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
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
