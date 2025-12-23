/**
 * Quick Node Picker Component
 * 
 * Appears when user drags a connection and drops on empty canvas.
 * Provides a fast search and selection interface for adding nodes.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Zap,
  ArrowRight,
  GitBranch,
  Clock,
  RotateCcw,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Mail,
  Globe,
  Database,
  Webhook,
  Star,
} from "lucide-react";
import { appCatalog } from "./AppsPanel";

// ============================================
// TYPES
// ============================================

export interface QuickNodePickerProps {
  isOpen: boolean;
  position: { x: number; y: number };
  sourceNodeId?: string;
  sourceHandle?: string;
  onSelect: (app: typeof appCatalog[0], nodeType: 'action' | 'condition' | 'delay' | 'loop') => void;
  onClose: () => void;
}

// ============================================
// LOGIC NODES
// ============================================

const logicNodes = [
  {
    id: 'condition',
    name: 'Condition',
    description: 'Branch based on true/false',
    icon: GitBranch,
    color: '#8b5cf6',
    type: 'condition' as const,
  },
  {
    id: 'delay',
    name: 'Delay',
    description: 'Wait before continuing',
    icon: Clock,
    color: '#f97316',
    type: 'delay' as const,
  },
  {
    id: 'loop',
    name: 'Loop',
    description: 'Repeat actions',
    icon: RotateCcw,
    color: '#06b6d4',
    type: 'loop' as const,
  },
  {
    id: 'error_handler',
    name: 'Error Handler',
    description: 'Catch and handle errors',
    icon: AlertCircle,
    color: '#ef4444',
    type: 'action' as const,
  },
];

// ============================================
// CATEGORY ICONS
// ============================================

const categoryIcons: Record<string, React.ElementType> = {
  communication: MessageCircle,
  email: Mail,
  google: Globe,
  crm: Database,
  automation: Zap,
  storage: Database,
  ai: Sparkles,
  developer: Webhook,
};

// ============================================
// MAIN COMPONENT
// ============================================

export const QuickNodePicker: React.FC<QuickNodePickerProps> = ({
  isOpen,
  position,
  sourceNodeId,
  sourceHandle,
  onSelect,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter apps and logic nodes
  const filteredItems = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    
    // Filter apps
    const filteredApps = appCatalog.filter(app =>
      app.name.toLowerCase().includes(searchLower) ||
      app.category.toLowerCase().includes(searchLower) ||
      app.description?.toLowerCase().includes(searchLower)
    );

    // Filter logic nodes
    const filteredLogic = logicNodes.filter(node =>
      node.name.toLowerCase().includes(searchLower) ||
      node.description.toLowerCase().includes(searchLower)
    );

    // Combine results
    const items: Array<{
      id: string;
      name: string;
      description: string;
      icon: React.ElementType | string;
      color: string;
      isLogic: boolean;
      type: 'action' | 'condition' | 'delay' | 'loop';
      popular?: boolean;
    }> = [];

    // Add logic nodes first if search matches
    filteredLogic.forEach(node => {
      items.push({
        id: node.id,
        name: node.name,
        description: node.description,
        icon: node.icon,
        color: node.color,
        isLogic: true,
        type: node.type,
      });
    });

    // Add popular apps if no search, otherwise add all matches
    const appsToShow = searchLower
      ? filteredApps.slice(0, 30)
      : filteredApps.slice(0, 20);

    appsToShow.forEach(app => {
      items.push({
        id: app.id,
        name: app.name,
        description: app.description || '',
        icon: app.icon,
        color: app.color,
        isLogic: false,
        type: 'action',
        popular: app.popular,
      });
    });

    return items;
  }, [search]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          const item = filteredItems[selectedIndex];
          if (item.isLogic) {
            const logicNode = logicNodes.find(n => n.id === item.id);
            if (logicNode) {
              onSelect({
                id: item.id,
                name: item.name,
                icon: '🔀',
                category: 'logic',
                color: item.color,
                description: item.description,
              } as any, item.type);
            }
          } else {
            const app = appCatalog.find(a => a.id === item.id);
            if (app) {
              onSelect(app, 'action');
            }
          }
        }
        break;
    }
  }, [filteredItems, selectedIndex, onSelect]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length]);

  if (!isOpen) return null;

  // Calculate position to keep picker in viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 350),
    y: Math.min(position.y, window.innerHeight - 450),
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-[100] w-[320px] max-h-[400px]",
        "bg-popover border border-border rounded-xl shadow-2xl",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
        "overflow-hidden"
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Search header */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search apps and logic..."
            className="pl-9 pr-9 h-10 bg-muted/50 border-0 focus-visible:ring-1"
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

      {/* Results */}
      <ScrollArea className="h-[320px]">
        <div className="p-2">
          {/* Logic nodes section */}
          {filteredItems.some(i => i.isLogic) && (
            <>
              <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Logic
              </div>
              {filteredItems
                .filter(i => i.isLogic)
                .map((item, idx) => {
                  const globalIdx = filteredItems.indexOf(item);
                  const Icon = item.icon as React.ElementType;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        const logicNode = logicNodes.find(n => n.id === item.id);
                        if (logicNode) {
                          onSelect({
                            id: item.id,
                            name: item.name,
                            icon: '🔀',
                            category: 'logic',
                            color: item.color,
                            description: item.description,
                          } as any, item.type);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                        "transition-colors text-left",
                        globalIdx === selectedIndex
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: item.color }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </>
          )}

          {/* Apps section */}
          {filteredItems.some(i => !i.isLogic) && (
            <>
              <div className="px-2 py-1.5 mt-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {search ? 'Apps' : 'Popular Apps'}
              </div>
              {filteredItems
                .filter(i => !i.isLogic)
                .map((item, idx) => {
                  const globalIdx = filteredItems.indexOf(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        const app = appCatalog.find(a => a.id === item.id);
                        if (app) {
                          onSelect(app, 'action');
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                        "transition-colors text-left",
                        globalIdx === selectedIndex
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: item.color + '20' }}
                      >
                        {typeof item.icon === 'string' ? item.icon : <Zap className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm flex items-center gap-2">
                          {item.name}
                          {item.popular && (
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </>
          )}

          {/* No results */}
          {filteredItems.length === 0 && (
            <div className="px-3 py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No apps found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Hint footer */}
      <div className="px-3 py-2 bg-muted/30 border-t border-border">
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[9px]">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[9px]">Enter</kbd>
            Select
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

export default QuickNodePicker;
