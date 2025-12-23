/**
 * Add Node Picker Component
 * 
 * Shows a comprehensive picker for adding triggers, actions, or logic nodes.
 * Used when clicking "Add Node" from the context menu.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Zap,
  ArrowRight,
  GitBranch,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  triggerCatalog,
  actionCatalog,
  logicNodeCatalog,
  triggerCategories,
  actionCategories,
  type TriggerDefinition,
  type ActionDefinition,
  type LogicNodeDefinition,
} from "./NodeCatalog";

// ============================================
// TYPES
// ============================================

export interface AddNodePickerProps {
  isOpen: boolean;
  position: { x: number; y: number };
  initialTab?: 'triggers' | 'actions' | 'logic';
  onSelectTrigger: (trigger: TriggerDefinition) => void;
  onSelectAction: (action: ActionDefinition) => void;
  onSelectLogic: (logic: LogicNodeDefinition) => void;
  onClose: () => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const AddNodePicker: React.FC<AddNodePickerProps> = ({
  isOpen,
  position,
  initialTab = 'triggers',
  onSelectTrigger,
  onSelectAction,
  onSelectLogic,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'triggers' | 'actions' | 'logic'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter triggers
  const filteredTriggers = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    return triggerCatalog.filter(trigger => {
      const matchesSearch = !searchLower || 
        trigger.name.toLowerCase().includes(searchLower) ||
        trigger.description.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === 'all' || trigger.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  // Filter actions
  const filteredActions = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    return actionCatalog.filter(action => {
      const matchesSearch = !searchLower || 
        action.name.toLowerCase().includes(searchLower) ||
        action.description.toLowerCase().includes(searchLower);
      const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  // Filter logic nodes
  const filteredLogic = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    return logicNodeCatalog.filter(node => {
      const matchesSearch = !searchLower || 
        node.name.toLowerCase().includes(searchLower) ||
        node.description.toLowerCase().includes(searchLower);
      return matchesSearch;
    });
  }, [search]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setActiveTab(initialTab);
      setSelectedCategory('all');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialTab]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Get current categories
  const currentCategories = activeTab === 'triggers' ? triggerCategories : actionCategories;

  if (!isOpen) return null;

  // Calculate position to keep picker in viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 520),
    y: Math.min(position.y, window.innerHeight - 550),
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-[100] w-[500px] max-h-[520px]",
        "bg-popover border border-border rounded-xl shadow-2xl",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        "overflow-hidden flex flex-col"
      )}
      style={{
        left: Math.max(10, adjustedPosition.x),
        top: Math.max(10, adjustedPosition.y),
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add Node
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search triggers, actions..."
            className="pl-9 pr-9 h-10 bg-background border-muted-foreground/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setSelectedCategory('all'); }} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 grid grid-cols-3">
          <TabsTrigger value="triggers" className="gap-2">
            <Zap className="h-4 w-4" />
            Triggers
            <Badge variant="secondary" className="text-[10px] h-5">{filteredTriggers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            Actions
            <Badge variant="secondary" className="text-[10px] h-5">{filteredActions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="logic" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Logic
            <Badge variant="secondary" className="text-[10px] h-5">{filteredLogic.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Category filters */}
        {activeTab !== 'logic' && (
          <div className="px-4 pt-3">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <div className="flex gap-2 pb-2">
                {currentCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="flex-1 overflow-hidden m-0 mt-2">
          <ScrollArea className="h-[300px] px-4">
            <div className="space-y-1 pb-4">
              {filteredTriggers.map(trigger => (
                <button
                  key={trigger.id}
                  onClick={() => onSelectTrigger(trigger)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "transition-colors text-left hover:bg-muted/50",
                    "group"
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: trigger.color + '20' }}
                  >
                    {trigger.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">
                      {trigger.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {trigger.description}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </button>
              ))}
              {filteredTriggers.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No triggers found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="flex-1 overflow-hidden m-0 mt-2">
          <ScrollArea className="h-[300px] px-4">
            <div className="space-y-1 pb-4">
              {filteredActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => onSelectAction(action)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "transition-colors text-left hover:bg-muted/50",
                    "group"
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: action.color + '20' }}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">
                      {action.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {action.description}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </button>
              ))}
              {filteredActions.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No actions found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Logic Tab */}
        <TabsContent value="logic" className="flex-1 overflow-hidden m-0 mt-2">
          <ScrollArea className="h-[320px] px-4">
            <div className="space-y-1 pb-4">
              {filteredLogic.map(node => (
                <button
                  key={node.id}
                  onClick={() => onSelectLogic(node)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "transition-colors text-left hover:bg-muted/50",
                    "group"
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: node.color + '20' }}
                  >
                    {node.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">
                      {node.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {node.description}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {node.type}
                  </Badge>
                </button>
              ))}
              {filteredLogic.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No logic nodes found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Footer hint */}
      <div className="px-4 py-2 bg-muted/30 border-t border-border">
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Tab</kbd>
            Switch tabs
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
};

export default AddNodePicker;
