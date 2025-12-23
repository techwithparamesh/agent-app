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
  incomplete: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/40",
    label: "Needs Configuration",
    pulse: false,
  },
  configured: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/40",
    label: "Ready",
    pulse: false,
  },
  error: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/40",
    label: "Error",
    pulse: false,
  },
  running: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/40",
    label: "Running",
    pulse: true,
  },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/40",
    label: "Success",
    pulse: false,
  },
};

// Node type configuration
const nodeTypeConfig: Record<string, { label: string; icon: typeof Zap; color: string; gradient: string }> = {
  trigger: { 
    label: "Trigger", 
    icon: Zap, 
    color: "bg-amber-500",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  action: { 
    label: "Action", 
    icon: ArrowRight, 
    color: "bg-blue-500",
    gradient: "from-blue-500/20 to-indigo-500/10",
  },
  condition: { 
    label: "Condition", 
    icon: GitBranch, 
    color: "bg-violet-500",
    gradient: "from-violet-500/20 to-purple-500/10",
  },
  delay: { 
    label: "Delay", 
    icon: Clock, 
    color: "bg-orange-500",
    gradient: "from-orange-500/20 to-red-500/10",
  },
  loop: { 
    label: "Loop", 
    icon: RotateCcw, 
    color: "bg-cyan-500",
    gradient: "from-cyan-500/20 to-teal-500/10",
  },
  router: { 
    label: "Router", 
    icon: GitBranch, 
    color: "bg-indigo-500",
    gradient: "from-indigo-500/20 to-blue-500/10",
  },
  "error-handler": { 
    label: "Error Handler", 
    icon: AlertCircle, 
    color: "bg-red-500",
    gradient: "from-red-500/20 to-rose-500/10",
  },
  switch: {
    label: "Switch",
    icon: GitBranch,
    color: "bg-violet-500",
    gradient: "from-violet-500/20 to-fuchsia-500/10",
  },
  filter: {
    label: "Filter",
    icon: GitBranch,
    color: "bg-emerald-500",
    gradient: "from-emerald-500/20 to-green-500/10",
  },
  merge: {
    label: "Merge",
    icon: GitBranch,
    color: "bg-teal-500",
    gradient: "from-teal-500/20 to-cyan-500/10",
  },
  split: {
    label: "Split",
    icon: GitBranch,
    color: "bg-pink-500",
    gradient: "from-pink-500/20 to-rose-500/10",
  },
  code: {
    label: "Code",
    icon: ArrowRight,
    color: "bg-slate-500",
    gradient: "from-slate-500/20 to-gray-500/10",
  },
  transform: {
    label: "Transform",
    icon: RotateCcw,
    color: "bg-lime-500",
    gradient: "from-lime-500/20 to-green-500/10",
  },
  wait: {
    label: "Wait",
    icon: Clock,
    color: "bg-orange-400",
    gradient: "from-orange-400/20 to-amber-500/10",
  },
};

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
            "relative rounded-xl border-2 bg-card overflow-hidden",
            "transition-all duration-200 ease-out",
            "shadow-lg hover:shadow-xl",
            isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-primary/20",
            isValidDropTarget && "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background",
            isDragging && "shadow-2xl cursor-grabbing",
            !isDragging && "cursor-grab",
            status.borderColor,
          )}
        >
          {/* Gradient header background */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-20 opacity-50",
            `bg-gradient-to-br ${nodeType.gradient}`
          )} />

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
                    nodeType.color, "text-white"
                  )}
                >
                  <TypeIcon className="h-3 w-3" />
                  {nodeType.label}
                </Badge>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                      status.bgColor, status.color
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

          {/* Status footer */}
          <div className={cn(
            "flex items-center justify-between px-3 py-2",
            status.bgColor,
            "border-t",
            status.borderColor
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
            
            {node.status === 'configured' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px] gap-1.5 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onTest?.();
                }}
              >
                <Play className="h-3 w-3" />
                Test
              </Button>
            )}
          </div>
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
