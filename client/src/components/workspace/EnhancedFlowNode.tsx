/**
 * Enhanced Flow Node Component
 * 
 * A fully interactive, n8n-style node with smooth drag behavior,
 * connection handles, context menu, and status indicators.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Play,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Copy,
  Trash2,
  Settings2,
  GitBranch,
  Clock,
  RotateCcw,
  Zap,
  ArrowRight,
  AlertTriangle,
  Pencil,
  Power,
  PowerOff,
  Eye,
  GripVertical,
  Circle,
} from "lucide-react";
import type { FlowNode as FlowNodeType } from "./types";

// ============================================
// TYPES
// ============================================

export interface EnhancedFlowNodeProps {
  node: FlowNodeType;
  isSelected?: boolean;
  isDragging?: boolean;
  isConnecting?: boolean;
  isValidDropTarget?: boolean;
  
  // Events
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onDragEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  
  // Connection events
  onConnectionStart?: (handle: string) => void;
  onConnectionEnd?: (handle: string) => void;
  
  // Actions
  onConfigure?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onTest?: () => void;
  onRename?: () => void;
  onToggleEnabled?: () => void;
  
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

// n8n uses fixed 240px width for consistent node sizing
const NODE_WIDTH = 240;

// Status configuration
const statusConfig = {
  idle: {
    icon: Circle,
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Not configured",
    pulse: false,
  },
  incomplete: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/35",
    label: "Needs Configuration",
    pulse: false,
  },
  configured: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Ready",
    pulse: false,
  },
  complete: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Complete",
    pulse: false,
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-muted/30",
    borderColor: "border-destructive/35",
    label: "Error",
    pulse: false,
  },
  running: {
    icon: Loader2,
    color: "text-primary",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Running",
    pulse: true,
  },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Success",
    pulse: false,
  },
};

// Node type configuration with n8n-style left border accent colors
const nodeTypeConfig: Record<string, { label: string; icon: typeof Zap; badgeClassName: string; accentColor: string }> = {
  trigger: { 
    label: "Trigger", 
    icon: Zap, 
    badgeClassName: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25",
    accentColor: "#f59e0b", // amber-500
  },
  action: { 
    label: "Action", 
    icon: ArrowRight, 
    badgeClassName: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25",
    accentColor: "#3b82f6", // blue-500
  },
  condition: { 
    label: "Condition", 
    icon: GitBranch, 
    badgeClassName: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25",
    accentColor: "#a855f7", // purple-500
  },
  delay: { 
    label: "Delay", 
    icon: Clock, 
    badgeClassName: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/25",
    accentColor: "#f97316", // orange-500
  },
  loop: { 
    label: "Loop", 
    icon: RotateCcw, 
    badgeClassName: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25",
    accentColor: "#06b6d4", // cyan-500
  },
  router: { 
    label: "Router", 
    icon: GitBranch, 
    badgeClassName: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25",
    accentColor: "#6366f1", // indigo-500
  },
  "error-handler": { 
    label: "Error Handler", 
    icon: AlertCircle, 
    badgeClassName: "bg-destructive/10 text-destructive border border-destructive/25",
    accentColor: "#ef4444", // red-500
  },
  switch: {
    label: "Switch",
    icon: GitBranch,
    badgeClassName: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/25",
    accentColor: "#8b5cf6", // violet-500
  },
  filter: {
    label: "Filter",
    icon: GitBranch,
    badgeClassName: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25",
    accentColor: "#10b981", // emerald-500
  },
  merge: {
    label: "Merge",
    icon: GitBranch,
    badgeClassName: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/25",
    accentColor: "#14b8a6", // teal-500
  },
  split: {
    label: "Split",
    icon: GitBranch,
    badgeClassName: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-500/25",
    accentColor: "#ec4899", // pink-500
  },
  code: {
    label: "Code",
    icon: ArrowRight,
    badgeClassName: "bg-muted text-foreground border border-border",
    accentColor: "#71717a", // zinc-500
  },
  transform: {
    label: "Transform",
    icon: RotateCcw,
    badgeClassName: "bg-lime-500/15 text-lime-700 dark:text-lime-300 border border-lime-500/25",
    accentColor: "#84cc16", // lime-500
  },
  wait: {
    label: "Wait",
    icon: Clock,
    badgeClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
    accentColor: "#d97706", // amber-600
  },
};

const shouldShowStatusRow = (status: FlowNodeType["status"]) =>
  status === "incomplete" || status === "error" || status === "running";

// ============================================
// CONNECTION HANDLE COMPONENT
// ============================================

interface ConnectionHandleProps {
  type: 'input' | 'output';
  position: 'top' | 'bottom' | 'left' | 'right';
  handleId?: string;
  label?: string;
  isActive?: boolean;
  isValidTarget?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * n8n-style Connection Handle
 * - Input handles on LEFT (centered vertically)
 * - Output handles on RIGHT (centered vertically)
 * - Larger 14px handles for better visibility and click target
 * - Smooth 150ms transitions for all interactions
 */
const ConnectionHandle: React.FC<ConnectionHandleProps> = ({
  type,
  position,
  handleId,
  label,
  isActive,
  isValidTarget,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave,
}) => {
  // n8n positions: input=left, output=right (both vertically centered)
  const positionClasses = {
    top: "-top-[7px] left-1/2 -translate-x-1/2",
    bottom: "-bottom-[7px] left-1/2 -translate-x-1/2",
    left: "top-1/2 -left-[7px] -translate-y-1/2",   // Input handle
    right: "top-1/2 -right-[7px] -translate-y-1/2", // Output handle
  };

  const labelPositionClasses = {
    top: "-top-6 left-1/2 -translate-x-1/2",
    bottom: "-bottom-6 left-1/2 -translate-x-1/2",
    left: "top-1/2 right-full mr-2 -translate-y-1/2",
    right: "top-1/2 left-full ml-2 -translate-y-1/2",
  };

  return (
    <div
      className={cn(
        "absolute z-20 group/handle",
        positionClasses[position]
      )}
    >
      {/* Label - shows on hover for better UX */}
      {label && (
        <span className={cn(
          "absolute text-[10px] font-medium whitespace-nowrap",
          "opacity-0 group-hover/handle:opacity-100 transition-opacity duration-150",
          labelPositionClasses[position],
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {label}
        </span>
      )}
      
      {/* Handle - n8n style: larger, more prominent */}
      <div
        className={cn(
          // Base: 14px circle (larger than before for better UX)
          "w-[14px] h-[14px] rounded-full border-2 cursor-crosshair",
          // Smooth 150ms transition for all states
          "transition-all duration-150 ease-out",
          "flex items-center justify-center",
          // Input vs Output styling (n8n convention)
          type === 'input' 
            ? "bg-background border-muted-foreground/50 hover:border-primary hover:bg-primary/10" 
            : "bg-background border-muted-foreground/50 hover:border-primary hover:bg-primary/10",
          // Active state (when dragging connection)
          isActive && "scale-125 border-primary bg-primary/20 shadow-md shadow-primary/25",
          // Valid drop target (pulse animation)
          isValidTarget && "scale-150 border-emerald-500 bg-emerald-500/20 shadow-md shadow-emerald-500/25 animate-pulse",
          // Hover state
          "hover:scale-110"
        )}
        onMouseDown={(e) => {
          e.stopPropagation();
          onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onMouseUp?.(e);
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Inner dot */}
        <div className={cn(
          "w-1.5 h-1.5 rounded-full transition-all",
          type === 'output' && "bg-primary",
          isActive && "bg-primary animate-pulse",
          isValidTarget && "bg-emerald-500"
        )} />
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const EnhancedFlowNode: React.FC<EnhancedFlowNodeProps> = ({
  node,
  isSelected = false,
  isDragging = false,
  isConnecting = false,
  isValidDropTarget = false,
  onClick,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  onContextMenu,
  onConnectionStart,
  onConnectionEnd,
  onConfigure,
  onDuplicate,
  onDelete,
  onTest,
  onRename,
  onToggleEnabled,
  className,
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragStarted, setIsDragStarted] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);

  const status = statusConfig[node.status] || statusConfig.incomplete;
  const nodeType = nodeTypeConfig[node.type] || nodeTypeConfig.action;
  const StatusIcon = status.icon;
  const TypeIcon = nodeType.icon;

  // Drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    setIsDragStarted(true);
    onDragStart?.(e);
  }, [onDragStart]);

  const handleMouseUp = useCallback(() => {
    if (isDragStarted) {
      setIsDragStarted(false);
      onDragEnd?.();
    }
  }, [isDragStarted, onDragEnd]);

  useEffect(() => {
    if (isDragStarted) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragStarted, handleMouseUp]);

  // Connection handle events
  const handleConnectionStart = useCallback((handle: string) => {
    setActiveHandle(handle);
    onConnectionStart?.(handle);
  }, [onConnectionStart]);

  const handleConnectionEnd = useCallback((handle: string) => {
    setActiveHandle(null);
    onConnectionEnd?.(handle);
  }, [onConnectionEnd]);

  const isEnabled = node.config?.enabled !== false;

  return (
    <TooltipProvider>
      <div
        ref={nodeRef}
        className={cn(
          "relative group",
          "transition-all duration-200 ease-out",
          isDragging && "opacity-80 scale-105 z-50",
          !isEnabled && "opacity-50",
          className
        )}
        style={{ width: NODE_WIDTH }}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick?.(e);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu?.(e);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main card - n8n style: 8px radius, visible shadow, smooth transitions */}
        <div
          className={cn(
            // Base: 8px rounded corners (rounded-lg), card background
            "relative rounded-lg border bg-card overflow-hidden",
            // Shadow: visible but light (n8n style)
            "shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)]",
            // Smooth 150ms transition for all state changes
            "transition-all duration-150 ease-out",
            // Hover: slightly elevated shadow
            "hover:shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)]",
            // Selected state: primary ring
            isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
            // Valid drop target: emerald ring
            isValidDropTarget && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background",
            // Dragging state: elevated shadow
            isDragging && "shadow-[0_8px_24px_rgba(0,0,0,0.2)] cursor-grabbing",
            !isDragging && "cursor-grab",
            status.borderColor,
          )}
        >
          {/* n8n-style colored left accent border - 3px wide */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
            style={{ backgroundColor: nodeType.accentColor }}
          />
          
          {/* 
           * Header - n8n style layout:
           * [Icon] [Title + Subtitle] [Status] [Menu]
           * - App icon on left (36x36)
           * - Bold title = App name
           * - Subtitle = "resource • operation" pattern
           * - Status indicator (small, right side)
           */}
          <div className="relative flex items-center gap-2.5 p-3 pl-4">
            {/* App Icon - n8n style: 36x36, subtle background */}
            <div
              className="w-9 h-9 rounded-md flex items-center justify-center text-lg flex-shrink-0"
              style={{ 
                backgroundColor: node.appColor + '18',
                border: `1px solid ${node.appColor}25`,
              }}
            >
              {node.appIcon}
            </div>

            {/* Title + Subtitle container */}
            <div className="flex-1 min-w-0">
              {/* Bold title: App name */}
              <h3 className="font-semibold text-[13px] truncate leading-tight text-foreground">
                {node.appName}
              </h3>
              
              {/* 
               * Subtitle: "resource • operation" pattern (n8n style)
               * Falls back to node.name if no resource/action
               */}
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {node.triggerId || node.actionId 
                  ? `${node.type === 'trigger' ? 'Trigger' : node.config?.resource || 'Action'} • ${node.triggerId || node.actionId}`
                  : node.name
                }
              </p>
            </div>

            {/* Status indicator - small dot in corner (n8n style) */}
            {node.status !== 'configured' && node.status !== 'complete' && node.status !== 'idle' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0",
                    node.status === 'incomplete' && "bg-amber-500/15",
                    node.status === 'error' && "bg-destructive/15",
                    node.status === 'success' && "bg-emerald-500/15",
                    node.status === 'running' && "bg-primary/15",
                    status.color
                  )}>
                    <StatusIcon className={cn(
                      "h-3 w-3",
                      status.pulse && "animate-spin"
                    )} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">{status.label}</TooltipContent>
              </Tooltip>
            )}

            {/* Actions menu - appears on hover */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 flex-shrink-0",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                    isHovered && "opacity-100"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={onConfigure}>
                  <Settings2 className="h-4 w-4 mr-2" />
                  Configure
                  <span className="ml-auto text-xs text-muted-foreground">⏎</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onTest}>
                  <Play className="h-4 w-4 mr-2" />
                  Test Step
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRename}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                  <span className="ml-auto text-xs text-muted-foreground">⌘D</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleEnabled}>
                  {isEnabled ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-2" />
                      Disable
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-2" />
                      Enable
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                  <span className="ml-auto text-xs">⌫</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {node.description && (
            <div className="relative px-3 pb-2">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {node.description}
              </p>
            </div>
          )}

          {/* Config preview */}
          {(node.triggerId || node.actionId || node.config?.aiModel) && (
            <div className="relative mx-3 mb-3 p-2 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex flex-wrap gap-1.5">
                {node.triggerId && (
                  <Badge variant="outline" className="text-[10px] h-5 gap-1">
                    <Zap className="h-2.5 w-2.5" />
                    {node.triggerId}
                  </Badge>
                )}
                {node.actionId && (
                  <Badge variant="outline" className="text-[10px] h-5 gap-1">
                    <ArrowRight className="h-2.5 w-2.5" />
                    {node.actionId}
                  </Badge>
                )}
                {node.config?.aiModel && (
                  <Badge variant="outline" className="text-[10px] h-5 gap-1">
                    ✨ {node.config.aiModel}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Status row (only when important) */}
          {shouldShowStatusRow(node.status) && (
            <div className={cn(
              "flex items-center justify-between px-3 py-2 border-t border-border/60 bg-transparent"
            )}>
              <span className={cn(
                "text-[11px] font-medium flex items-center gap-1.5",
                status.color
              )}>
                <StatusIcon className={cn(
                  "h-3 w-3",
                  status.pulse && "animate-spin"
                )} />
                {status.label}
              </span>

              {node.status === 'running' && (
                <span className="text-[11px] text-muted-foreground">Executing…</span>
              )}
            </div>
          )}
        </div>

        {/* Connection Handles - n8n style: INPUT on LEFT, OUTPUT on RIGHT */}
        
        {/* Input handle (LEFT side) - not shown for trigger nodes */}
        {node.type !== 'trigger' && (
          <ConnectionHandle
            type="input"
            position="left"  // n8n: input handles on left
            isActive={isConnecting}
            isValidTarget={isValidDropTarget}
            onMouseUp={(e) => handleConnectionEnd('input')}
          />
        )}

        {/* Output handle (RIGHT side) */}
        {node.type !== 'condition' ? (
          <ConnectionHandle
            type="output"
            position="right"  // n8n: output handles on right
            isActive={activeHandle === 'output'}
            onMouseDown={() => handleConnectionStart('output')}
            onMouseUp={() => handleConnectionEnd('output')}
          />
        ) : (
          // Condition node: two outputs (Yes/No) stacked vertically on right
          <>
            <div className="absolute top-1/3 -right-[7px] -translate-y-1/2">
              <ConnectionHandle
                type="output"
                position="right"
                handleId="true"
                label="Yes"
                isActive={activeHandle === 'true'}
                onMouseDown={() => handleConnectionStart('true')}
              />
            </div>
            <div className="absolute top-2/3 -right-[7px] -translate-y-1/2">
              <ConnectionHandle
                type="output"
                position="right"
                handleId="false"
                label="No"
                isActive={activeHandle === 'false'}
                onMouseDown={() => handleConnectionStart('false')}
              />
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default EnhancedFlowNode;
