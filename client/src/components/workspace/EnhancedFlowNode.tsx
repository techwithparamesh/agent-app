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

const NODE_WIDTH = 260;

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

// Node type configuration
const nodeTypeConfig: Record<string, { label: string; icon: typeof Zap; badgeClassName: string; gradient?: string }> = {
  trigger: { 
    label: "Trigger", 
    icon: Zap, 
    badgeClassName: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25",
  },
  action: { 
    label: "Action", 
    icon: ArrowRight, 
    badgeClassName: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25",
  },
  condition: { 
    label: "Condition", 
    icon: GitBranch, 
    badgeClassName: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25",
  },
  delay: { 
    label: "Delay", 
    icon: Clock, 
    badgeClassName: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/25",
  },
  loop: { 
    label: "Loop", 
    icon: RotateCcw, 
    badgeClassName: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25",
  },
  router: { 
    label: "Router", 
    icon: GitBranch, 
    badgeClassName: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25",
  },
  "error-handler": { 
    label: "Error Handler", 
    icon: AlertCircle, 
    badgeClassName: "bg-destructive/10 text-destructive border border-destructive/25",
  },
  switch: {
    label: "Switch",
    icon: GitBranch,
    badgeClassName: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/25",
  },
  filter: {
    label: "Filter",
    icon: GitBranch,
    badgeClassName: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25",
  },
  merge: {
    label: "Merge",
    icon: GitBranch,
    badgeClassName: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/25",
  },
  split: {
    label: "Split",
    icon: GitBranch,
    badgeClassName: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-500/25",
  },
  code: {
    label: "Code",
    icon: ArrowRight,
    badgeClassName: "bg-muted text-foreground border border-border",
  },
  transform: {
    label: "Transform",
    icon: RotateCcw,
    badgeClassName: "bg-lime-500/15 text-lime-700 dark:text-lime-300 border border-lime-500/25",
  },
  wait: {
    label: "Wait",
    icon: Clock,
    badgeClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
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
  const positionClasses = {
    top: "-top-2 left-1/2 -translate-x-1/2",
    bottom: "-bottom-2 left-1/2 -translate-x-1/2",
    left: "top-1/2 -left-2 -translate-y-1/2",
    right: "top-1/2 -right-2 -translate-y-1/2",
  };

  const labelPositionClasses = {
    top: "-top-6 left-1/2 -translate-x-1/2",
    bottom: "-bottom-6 left-1/2 -translate-x-1/2",
    left: "top-1/2 -left-8 -translate-y-1/2",
    right: "top-1/2 -right-8 -translate-y-1/2",
  };

  return (
    <div
      className={cn(
        "absolute z-20 group/handle",
        positionClasses[position]
      )}
    >
      {/* Label */}
      {label && (
        <span className={cn(
          "absolute text-[10px] font-medium whitespace-nowrap",
          "opacity-0 group-hover/handle:opacity-100 transition-opacity",
          labelPositionClasses[position],
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {label}
        </span>
      )}
      
      {/* Handle */}
      <div
        className={cn(
          "w-4 h-4 rounded-full border-2 cursor-crosshair transition-all duration-150",
          "flex items-center justify-center",
          type === 'input' 
            ? "bg-background border-muted-foreground/40" 
            : "bg-primary/20 border-primary",
          isActive && "scale-125 border-primary bg-primary/30 shadow-lg shadow-primary/20",
          isValidTarget && "scale-150 border-emerald-500 bg-emerald-500/30 animate-pulse",
          "hover:scale-125 hover:border-primary hover:bg-primary/20"
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
        {/* Main card */}
        <div
          className={cn(
            "relative rounded-xl border bg-card overflow-hidden",
            "transition-shadow duration-150",
            "shadow-sm hover:shadow-md",
            isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-primary/20",
            isValidDropTarget && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background",
            isDragging && "shadow-2xl cursor-grabbing",
            !isDragging && "cursor-grab",
            status.borderColor,
          )}
        >
          {/* Header */}
          <div className="relative flex items-start gap-3 p-3 pb-2">
            {/* Drag handle */}
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
              <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>

            {/* App Icon */}
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-xl shadow-md flex-shrink-0 mt-1"
              style={{ 
                backgroundColor: node.appColor + '25',
                border: `1px solid ${node.appColor}40`,
              }}
            >
              {node.appIcon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-0.5">
              {/* Type and status badges */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-5 text-[10px] gap-1 font-medium",
                    nodeType.badgeClassName
                  )}
                >
                  <TypeIcon className="h-3 w-3" />
                  {nodeType.label}
                </Badge>

                {node.status === 'incomplete' && (
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25"
                  >
                    Needs config
                  </Badge>
                )}
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                      "bg-muted/30 border border-border",
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
              </div>

              {/* App name */}
              <h3 className="font-semibold text-sm truncate leading-tight">
                {node.appName}
              </h3>
              
              {/* Step name */}
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {node.name}
              </p>
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 flex-shrink-0",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
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

        {/* Connection Handles */}
        {/* Input handle (top) - not for triggers */}
        {node.type !== 'trigger' && (
          <ConnectionHandle
            type="input"
            position="top"
            isActive={isConnecting}
            isValidTarget={isValidDropTarget}
            onMouseUp={(e) => handleConnectionEnd('input')}
          />
        )}

        {/* Output handle (bottom) */}
        {node.type !== 'condition' ? (
          <ConnectionHandle
            type="output"
            position="bottom"
            isActive={activeHandle === 'output'}
            onMouseDown={() => handleConnectionStart('output')}
            onMouseUp={() => handleConnectionEnd('output')}
          />
        ) : (
          // Condition node has true/false outputs
          <>
            <div className="absolute -bottom-2 left-1/4 -translate-x-1/2">
              <ConnectionHandle
                type="output"
                position="bottom"
                handleId="true"
                label="Yes"
                isActive={activeHandle === 'true'}
                onMouseDown={() => handleConnectionStart('true')}
              />
            </div>
            <div className="absolute -bottom-2 left-3/4 -translate-x-1/2">
              <ConnectionHandle
                type="output"
                position="bottom"
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
