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
import { APP_CONFIGS } from "@/components/workspace/AppConfigurations";

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

export const appCatalog: AppDefinition[] = (() => {
  const seen = new Set<string>();
  const configs = Object.values(APP_CONFIGS)
    .filter((cfg) => cfg && typeof cfg.id === 'string' && cfg.id.length > 0)
    .filter((cfg) => {
      if (seen.has(cfg.id)) return false;
      seen.add(cfg.id);
      return true;
    });

  const out: AppDefinition[] = configs.map((cfg) => {
    const triggers = (cfg.triggers || []).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
    }));
    const actions = (cfg.actions || []).map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
    }));

    const canBeTrigger = triggers.length > 0;
    const canBeAction = actions.length > 0;
    const nodeTypes: AppNodeType = canBeTrigger && canBeAction ? 'both' : canBeTrigger ? 'trigger' : 'action';

    return {
      id: cfg.id,
      name: cfg.name,
      icon: cfg.icon,
      category: cfg.category,
      color: cfg.color,
      description: cfg.description,
      nodeTypes,
      triggers,
      actions,
    };
  });

  // Keep the list stable and easy to scan
  out.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    return a.name.localeCompare(b.name);
  });

  return out;
})();

// Categories list - n8n style ordering: Triggers first, then Actions, then Logic
const categories = [
  { id: 'all', label: 'All' },
  { id: 'triggers', label: 'Triggers', icon: '⚡' },
  { id: 'actions', label: 'Actions', icon: '▶️' },
  { id: 'logic', label: 'Logic', icon: '🔀' },
  { id: 'ai', label: 'AI' },
  { id: 'communication', label: 'Communication' },
  { id: 'email', label: 'Email' },
  { id: 'crm', label: 'CRM' },
  { id: 'automation', label: 'Automation' },
  { id: 'storage', label: 'Storage' },
  { id: 'developer', label: 'Developer' },
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
      "w-64 h-full bg-background border-r flex flex-col",
      highlightAddAction && "ring-2 ring-primary/50 ring-inset"
    )}>
      {/* Header - n8n style compact */}
      <div className="px-3 py-3 border-b space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-foreground/90">
            {highlightAddAction ? "Add step" : "Nodes"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={onToggleCollapse}
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
          </Button>
        </div>

        {highlightAddAction && (
          <div className="px-2.5 py-2 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-primary/90">
              Select a node to add to your workflow
            </p>
          </div>
        )}
        
        {/* Search - n8n style */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/30 border-muted-foreground/20 focus:border-primary/50"
            autoFocus={highlightAddAction}
          />
        </div>
      </div>

      {/* Categories tabs - n8n style pill tabs */}
      <div className="px-2 py-2 border-b bg-muted/20">
        <div className="flex flex-wrap gap-1">
          {categories.slice(0, 7).map(category => (
            <button
              key={category.id}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-150",
                activeCategory === category.id 
                  ? "bg-background text-foreground shadow-sm border border-border/50" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Apps list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {/* Recent Apps */}
          {!searchQuery && activeCategory === 'all' && (
            <Collapsible
              open={expandedCategories.includes('recent')}
              onOpenChange={() => toggleCategory('recent')}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Recent
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
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide">
                <div className="flex items-center gap-1.5">
                  <Star className="h-3 w-3" />
                  Popular
                </div>
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  expandedCategories.includes('popular') && "rotate-90"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
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

          <Separator className="my-1.5" />

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
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-4 h-4 rounded flex items-center justify-center",
                        categoryColors[category] || "bg-gray-500"
                      )}>
                        <CategoryIcon className="h-2.5 w-2.5 text-white" />
                      </div>
                      {categories.find(c => c.id === category)?.label || category}
                      <Badge variant="secondary" className="h-4 px-1 text-[9px] font-normal">
                        {apps.length}
                      </Badge>
                    </div>
                    <ChevronRight className={cn(
                      "h-3 w-3 transition-transform",
                      expandedCategories.includes(category) && "rotate-90"
                    )} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-0.5 mt-1.5">
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
        className="flex items-center gap-1.5 p-1.5 rounded-md border border-transparent bg-muted/30 hover:bg-muted/60 hover:border-border/50 cursor-grab active:cursor-grabbing transition-all duration-150 group"
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0"
          style={{ backgroundColor: app.color + '15' }}
        >
          {app.icon}
        </div>
        <span className="text-[11px] font-medium truncate text-muted-foreground group-hover:text-foreground transition-colors">{app.name}</span>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, app)}
      onClick={onClick}
      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-all duration-150 group"
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0"
        style={{ backgroundColor: app.color + '15' }}
      >
        {app.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate group-hover:text-foreground text-muted-foreground transition-colors">
          {app.name}
        </p>
        <p className="text-[10px] text-muted-foreground/70 truncate leading-tight">
          {app.description}
        </p>
      </div>
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors opacity-0 group-hover:opacity-100" />
    </div>
  );
}

export default AppsPanel;
