import { useState } from "react";
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
} from "@/components/ui/dropdown-menu";
import {
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
  MoreHorizontal,
  Copy,
  Trash2,
  Settings,
  GitBranch,
  Clock,
  RotateCcw,
  Zap,
  Target,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import type { FlowNode as FlowNodeType } from "./types";

interface FlowNodeProps {
  node: FlowNodeType;
  isSelected?: boolean;
  isConnecting?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onTest?: () => void;
  onConnect?: (handleId: string) => void;
  className?: string;
}

// Status icons and colors
const statusConfig = {
  incomplete: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    label: "Incomplete",
  },
  configured: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    label: "Configured",
  },
  error: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    label: "Error",
  },
  running: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    label: "Running",
  },
  success: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    label: "Success",
  },
};

// Node type badges
const nodeTypeConfig = {
  trigger: { label: "Trigger", icon: Zap, color: "bg-amber-500" },
  action: { label: "Action", icon: Play, color: "bg-blue-500" },
  condition: { label: "Condition", icon: GitBranch, color: "bg-purple-500" },
  delay: { label: "Delay", icon: Clock, color: "bg-orange-500" },
  loop: { label: "Loop", icon: RotateCcw, color: "bg-cyan-500" },
  router: { label: "Router", icon: GitBranch, color: "bg-indigo-500" },
  "error-handler": { label: "Error Handler", icon: AlertCircle, color: "bg-red-500" },
};

export function FlowNode({
  node,
  isSelected = false,
  isConnecting = false,
  onClick,
  onDoubleClick,
  onDelete,
  onDuplicate,
  onTest,
  onConnect,
  className,
}: FlowNodeProps) {
  const [showActions, setShowActions] = useState(false);
  const status = statusConfig[node.status];
  const nodeType = nodeTypeConfig[node.type];
  const StatusIcon = status.icon;
  const TypeIcon = nodeType.icon;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative group min-w-[240px] max-w-[280px]",
          "bg-card border-2 rounded-xl shadow-lg",
          "transition-all duration-200",
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          isConnecting && "ring-2 ring-blue-500/50",
          status.borderColor,
          "hover:shadow-xl hover:-translate-y-0.5",
          className
        )}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Connection handles - Top */}
        {node.type !== 'trigger' && (
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-muted border-2 border-border hover:bg-primary hover:border-primary cursor-pointer transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              onConnect?.('top');
            }}
          />
        )}

        {/* Header with app icon and type badge */}
        <div className="flex items-start gap-3 p-3 pb-2">
          {/* App Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-sm flex-shrink-0"
            style={{ backgroundColor: node.appColor + '20' }}
          >
            {node.appIcon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className={cn("h-5 text-[10px] gap-1", nodeType.color, "text-white")}
              >
                <TypeIcon className="h-3 w-3" />
                {nodeType.label}
              </Badge>
              <Tooltip>
                <TooltipTrigger>
                  <StatusIcon className={cn("h-4 w-4", status.color, node.status === 'running' && "animate-spin")} />
                </TooltipTrigger>
                <TooltipContent>{status.label}</TooltipContent>
              </Tooltip>
            </div>
            <h3 className="font-semibold text-sm truncate">{node.appName}</h3>
            <p className="text-xs text-muted-foreground truncate">{node.name}</p>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                  showActions && "opacity-100"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onTest?.(); }}>
                <Play className="h-4 w-4 mr-2" />
                Test this step
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(); }}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description / Config preview */}
        {node.description && (
          <div className="px-3 pb-2">
            <p className="text-xs text-muted-foreground line-clamp-2">
              {node.description}
            </p>
          </div>
        )}

        {/* Quick config preview */}
        {node.triggerId || node.actionId ? (
          <div className="mx-3 mb-3 p-2 rounded-lg bg-muted/50">
            <p className="text-[11px] text-muted-foreground">
              {node.type === 'trigger' ? '📥' : '📤'} {node.triggerId || node.actionId}
            </p>
          </div>
        ) : null}

        {/* Status bar at bottom */}
        <div className={cn(
          "flex items-center justify-between px-3 py-2 rounded-b-xl",
          status.bgColor
        )}>
          <span className={cn("text-[11px] font-medium", status.color)}>
            {status.label}
          </span>
          {node.status === 'configured' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] gap-1"
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

        {/* Connection handles - Bottom */}
        {node.type !== 'error-handler' && (
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-muted border-2 border-border hover:bg-primary hover:border-primary cursor-pointer transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              onConnect?.('bottom');
            }}
          />
        )}

        {/* Conditional branches - Left and Right handles */}
        {(node.type === 'condition' || node.type === 'router') && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 rounded-full bg-green-500 border-2 border-green-600 cursor-pointer z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConnect?.('true');
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="left">True path</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 border-2 border-red-600 cursor-pointer z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConnect?.('false');
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="right">False path</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

// Add action placeholder node
export function AddActionNode({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-60 p-4 border-2 border-dashed border-muted-foreground/30 rounded-xl",
        "flex flex-col items-center justify-center gap-2 text-center",
        "cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all",
        className
      )}
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <Target className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">Add Action</p>
        <p className="text-xs text-muted-foreground">Click or drag an app here</p>
      </div>
    </div>
  );
}

// Condition node placeholder
export function AddConditionNode({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-60 p-4 border-2 border-dashed border-purple-500/30 rounded-xl",
        "flex flex-col items-center justify-center gap-2 text-center",
        "cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all",
        className
      )}
      onClick={onClick}
    >
      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
        <GitBranch className="h-5 w-5 text-purple-500" />
      </div>
      <div>
        <p className="text-sm font-medium">Add Condition</p>
        <p className="text-xs text-muted-foreground">Add branching logic</p>
      </div>
    </div>
  );
}

export default FlowNode;
