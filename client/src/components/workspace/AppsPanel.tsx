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
