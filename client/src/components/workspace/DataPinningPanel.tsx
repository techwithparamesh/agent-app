/**
 * Data Pinning Panel
 * 
 * Pin and manage test data for workflow development.
 * Features: Pin/unpin per node, data preview, persist across sessions.
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Pin,
  PinOff,
  ChevronRight,
  ChevronDown,
  Copy,
  Trash2,
  Download,
  Upload,
  Edit2,
  Check,
  X,
  FileJson,
  Clock,
  Layers,
  MoreVertical,
  Search,
  RefreshCw,
  Zap,
  AlertCircle,
  Eye,
  Code,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface PinnedDataItem {
  id: string;
  json: Record<string, unknown>;
  binary?: Record<string, unknown>;
}

export interface PinnedData {
  nodeId: string;
  nodeName: string;
  nodeIcon?: string;
  nodeType?: string;
  items: PinnedDataItem[];
  pinnedAt: Date;
  source: 'manual' | 'execution';
  executionId?: string;
}

export interface DataPinningPanelProps {
  pinnedData: PinnedData[];
  selectedNodeId?: string | null;
  onPinData?: (nodeId: string, data: PinnedDataItem[]) => void;
  onUnpinData?: (nodeId: string) => void;
  onUpdatePinnedData?: (nodeId: string, data: PinnedDataItem[]) => void;
  onClearAllPins?: () => void;
  onNodeSelect?: (nodeId: string) => void;
  className?: string;
}

// ============================================
// HELPERS
// ============================================

function formatJson(data: unknown, indent = 2): string {
  try {
    return JSON.stringify(data, null, indent);
  } catch {
    return String(data);
  }
}

function truncateValue(value: unknown, maxLength = 50): string {
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

function getDataPreview(items: PinnedDataItem[]): { key: string; value: string; type: string }[] {
  if (!items.length) return [];
  
  const firstItem = items[0].json;
  return Object.entries(firstItem).slice(0, 5).map(([key, value]) => ({
    key,
    value: truncateValue(value),
    type: Array.isArray(value) ? 'array' : typeof value,
  }));
}

// ============================================
// DATA VIEWER COMPONENT
// ============================================

interface DataViewerProps {
  data: unknown;
  className?: string;
}

function DataViewer({ data, className }: DataViewerProps) {
  const [view, setView] = useState<'tree' | 'json'>('tree');

  const renderTree = (obj: unknown, depth = 0): React.ReactNode => {
    if (obj === null) return <span className="text-muted-foreground">null</span>;
    if (obj === undefined) return <span className="text-muted-foreground">undefined</span>;
    
    if (Array.isArray(obj)) {
      return (
        <div className="space-y-1">
          {obj.map((item, idx) => (
            <Collapsible key={idx} defaultOpen={depth < 2}>
              <CollapsibleTrigger className="flex items-center gap-1 hover:bg-muted rounded px-1 w-full text-left">
                <ChevronRight className="w-3 h-3 transition-transform data-[state=open]:rotate-90" />
                <span className="text-muted-foreground">[{idx}]</span>
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {typeof item === 'object' ? 'object' : typeof item}
                </Badge>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4">
                {renderTree(item, depth + 1)}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      );
    }
    
    if (typeof obj === 'object') {
      return (
        <div className="space-y-1">
          {Object.entries(obj as Record<string, unknown>).map(([key, value]) => (
            <Collapsible key={key} defaultOpen={depth < 2}>
              <CollapsibleTrigger className="flex items-center gap-1 hover:bg-muted rounded px-1 w-full text-left">
                {typeof value === 'object' && value !== null ? (
                  <ChevronRight className="w-3 h-3 transition-transform data-[state=open]:rotate-90" />
                ) : (
                  <span className="w-3" />
                )}
                <span className="font-medium text-primary">{key}:</span>
                {typeof value !== 'object' && (
                  <span className="text-muted-foreground ml-1">
                    {truncateValue(value, 30)}
                  </span>
                )}
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {Array.isArray(value) ? `array[${value.length}]` : typeof value}
                </Badge>
              </CollapsibleTrigger>
              {typeof value === 'object' && value !== null && (
                <CollapsibleContent className="pl-4">
                  {renderTree(value, depth + 1)}
                </CollapsibleContent>
              )}
            </Collapsible>
          ))}
        </div>
      );
    }
    
    return (
      <span className={cn(
        typeof obj === 'string' && 'text-green-600 dark:text-green-400',
        typeof obj === 'number' && 'text-blue-600 dark:text-blue-400',
        typeof obj === 'boolean' && 'text-amber-600 dark:text-amber-400'
      )}>
        {typeof obj === 'string' ? `"${obj}"` : String(obj)}
      </span>
    );
  };

  return (
    <div className={cn('rounded-lg border bg-muted/30', className)}>
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
        <span className="text-xs font-medium text-muted-foreground">Data Preview</span>
        <div className="flex items-center gap-1">
          <Button
            variant={view === 'tree' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setView('tree')}
          >
            <Layers className="w-3 h-3 mr-1" />
            Tree
          </Button>
          <Button
            variant={view === 'json' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setView('json')}
          >
            <Code className="w-3 h-3 mr-1" />
            JSON
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="p-3">
          {view === 'tree' ? (
            <div className="text-sm font-mono">
              {renderTree(data)}
            </div>
          ) : (
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              {formatJson(data)}
            </pre>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// PINNED NODE CARD
// ============================================

interface PinnedNodeCardProps {
  pinnedData: PinnedData;
  isSelected?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onSelect?: () => void;
  onUnpin?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onExport?: () => void;
}

function PinnedNodeCard({
  pinnedData,
  isSelected,
  isExpanded,
  onToggleExpand,
  onSelect,
  onUnpin,
  onEdit,
  onCopy,
  onExport,
}: PinnedNodeCardProps) {
  const preview = getDataPreview(pinnedData.items);
  const itemCount = pinnedData.items.length;

  return (
    <div
      className={cn(
        'rounded-lg border bg-card transition-all',
        isSelected && 'ring-2 ring-primary',
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Pin className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-xl flex-shrink-0">{pinnedData.nodeIcon || '📦'}</span>
          <div className="min-w-0">
            <p className="font-medium truncate">{pinnedData.nodeName}</p>
            <p className="text-xs text-muted-foreground">
              {itemCount} item{itemCount !== 1 ? 's' : ''} pinned
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {pinnedData.source === 'execution' ? 'From run' : 'Manual'}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSelect}>
                <Eye className="w-4 h-4 mr-2" />
                Select Node
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onUnpin}
                className="text-destructive focus:text-destructive"
              >
                <PinOff className="w-4 h-4 mr-2" />
                Unpin Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ChevronRight
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </div>
      </div>

      {/* Preview / Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t">
          <div className="pt-3 space-y-3">
            {/* Quick preview */}
            {preview.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground mb-2">Fields</p>
                {preview.map((field) => (
                  <div key={field.key} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-primary">{field.key}</span>
                    <span className="text-muted-foreground">:</span>
                    <span className="text-muted-foreground truncate">{field.value}</span>
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      {field.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Full data viewer */}
            <DataViewer data={pinnedData.items} />

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Pinned {pinnedData.pinnedAt.toLocaleDateString()}</span>
              </div>
              {pinnedData.executionId && (
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Run #{pinnedData.executionId.slice(0, 8)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DataPinningPanel({
  pinnedData,
  selectedNodeId,
  onPinData,
  onUnpinData,
  onUpdatePinnedData,
  onClearAllPins,
  onNodeSelect,
  className,
}: DataPinningPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingJson, setEditingJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  // Filter pinned data
  const filteredData = useMemo(() => {
    if (!searchQuery) return pinnedData;
    const query = searchQuery.toLowerCase();
    return pinnedData.filter((pd) =>
      pd.nodeName.toLowerCase().includes(query) ||
      pd.nodeId.toLowerCase().includes(query)
    );
  }, [pinnedData, searchQuery]);

  // Toggle expand
  const toggleExpand = (nodeId: string) => {
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Copy data to clipboard
  const handleCopy = (data: PinnedData) => {
    const json = JSON.stringify(data.items, null, 2);
    navigator.clipboard.writeText(json);
  };

  // Export data
  const handleExport = (data: PinnedData) => {
    const json = JSON.stringify(data.items, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.nodeName.replace(/\s+/g, '_')}_pinned_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open edit dialog
  const handleEdit = (data: PinnedData) => {
    setEditingNodeId(data.nodeId);
    setEditingJson(JSON.stringify(data.items, null, 2));
    setJsonError(null);
    setIsEditDialogOpen(true);
  };

  // Save edited data
  const handleSaveEdit = () => {
    if (!editingNodeId) return;

    try {
      const parsed = JSON.parse(editingJson);
      if (!Array.isArray(parsed)) {
        setJsonError('Data must be an array of items');
        return;
      }
      onUpdatePinnedData?.(editingNodeId, parsed);
      setIsEditDialogOpen(false);
      setEditingNodeId(null);
    } catch (err) {
      setJsonError('Invalid JSON format');
    }
  };

  // Import data from file
  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        // For now, just show in edit dialog
        setEditingJson(JSON.stringify(data, null, 2));
        setIsEditDialogOpen(true);
      } catch (err) {
        console.error('Failed to import file:', err);
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
              <Pin className="w-5 h-5" />
              Pinned Data
            </h3>
            <p className="text-sm text-muted-foreground">
              {pinnedData.length} node{pinnedData.length !== 1 ? 's' : ''} pinned
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleImport}>
                  <Upload className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import Data</TooltipContent>
            </Tooltip>
            {pinnedData.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsClearDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear All Pins</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search pinned nodes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Pinned Data List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Pin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No pinned data</p>
                <p className="text-sm">
                  Pin node output to use test data during development
                </p>
              </div>
            ) : (
              filteredData.map((data) => (
                <PinnedNodeCard
                  key={data.nodeId}
                  pinnedData={data}
                  isSelected={selectedNodeId === data.nodeId}
                  isExpanded={expandedNodeIds.has(data.nodeId)}
                  onToggleExpand={() => toggleExpand(data.nodeId)}
                  onSelect={() => onNodeSelect?.(data.nodeId)}
                  onUnpin={() => onUnpinData?.(data.nodeId)}
                  onEdit={() => handleEdit(data)}
                  onCopy={() => handleCopy(data)}
                  onExport={() => handleExport(data)}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Info Footer */}
        <div className="p-3 border-t bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>
              Pinned data is used instead of executing nodes during test runs.
            </span>
          </div>
        </div>

        {/* Edit Dialog */}
        <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <AlertDialogContent className="sm:max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Pinned Data</AlertDialogTitle>
              <AlertDialogDescription>
                Edit the JSON data directly. Make sure it's valid JSON array format.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3">
              <Textarea
                value={editingJson}
                onChange={(e) => {
                  setEditingJson(e.target.value);
                  setJsonError(null);
                }}
                className="font-mono text-sm h-[300px]"
                placeholder='[{"json": {"key": "value"}}]'
              />
              {jsonError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {jsonError}
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveEdit}>
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Clear All Dialog */}
        <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Pinned Data</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove all pinned data? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onClearAllPins?.();
                  setIsClearDialogOpen(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

export default DataPinningPanel;
