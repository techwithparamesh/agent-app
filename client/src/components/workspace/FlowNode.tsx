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
  Circle,
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

const shouldShowStatusRow = (status: FlowNodeType["status"]) =>
  status === "incomplete" || status === "error" || status === "running";

// Status icons and colors
const statusConfig = {
  idle: {
    icon: Circle,
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Not Configured",
  },
  incomplete: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Needs Configuration",
  },
  configured: {
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Configured",
  },
  complete: {
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Complete",
  },
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Error",
  },
  running: {
    icon: Loader2,
    color: "text-primary",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Running",
  },
  success: {
    icon: CheckCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-muted/30",
    borderColor: "border-border",
    label: "Success",
  },
};

// Node type badges
const nodeTypeConfig: Record<string, { label: string; icon: typeof Zap; className: string }> = {
  trigger: { label: "Trigger", icon: Zap, className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25" },
  action: { label: "Action", icon: Play, className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/25" },
  condition: { label: "Condition", icon: GitBranch, className: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/25" },
  delay: { label: "Delay", icon: Clock, className: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/25" },
  loop: { label: "Loop", icon: RotateCcw, className: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/25" },
  router: { label: "Router", icon: GitBranch, className: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25" },
  "error-handler": { label: "Error Handler", icon: AlertCircle, className: "bg-destructive/10 text-destructive border border-destructive/25" },
  switch: { label: "Switch", icon: GitBranch, className: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/25" },
  filter: { label: "Filter", icon: GitBranch, className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25" },
  merge: { label: "Merge", icon: GitBranch, className: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/25" },
  split: { label: "Split", icon: GitBranch, className: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border border-pink-500/25" },
  code: { label: "Code", icon: Play, className: "bg-muted text-foreground border border-border" },
  transform: { label: "Transform", icon: RotateCcw, className: "bg-lime-500/15 text-lime-700 dark:text-lime-300 border border-lime-500/25" },
  wait: { label: "Wait", icon: Clock, className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20" },
  // AI Nodes
  "ai-agent": { label: "AI Agent", icon: Target, className: "bg-muted text-foreground border border-border" },
  "ai-memory": { label: "Memory", icon: Clock, className: "bg-muted text-foreground border border-border" },
  "ai-tool": { label: "Tool", icon: Zap, className: "bg-muted text-foreground border border-border" },
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
          "bg-card border rounded-xl shadow-sm",
          "transition-shadow duration-150",
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          isConnecting && "ring-2 ring-primary/30",
          status.borderColor,
          "hover:shadow-md",
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
            className={cn(
              "absolute -top-2 left-1/2 -translate-x-1/2 z-10",
              "w-3.5 h-3.5 rounded-full border bg-background",
              "shadow-sm",
              "opacity-0 group-hover:opacity-100",
              isSelected && "opacity-100",
              "transition-opacity"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onConnect?.('top');
            }}
          >
            <div className="w-full h-full rounded-full bg-muted-foreground/30 hover:bg-primary/70 transition-colors" />
          </div>
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
                className={cn("h-5 text-[10px] gap-1 font-medium", nodeType.className)}
              >
                <TypeIcon className="h-3 w-3" />
                {nodeType.label}
              </Badge>
              {node.status === 'incomplete' && (
                <Badge
                  variant="outline"
                  className="h-5 text-[10px] font-medium border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/10"
                >
                  Needs config
                </Badge>
              )}
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

        {/* Status row (only when actionable/important) */}
        {shouldShowStatusRow(node.status) && (
          <div className={cn(
            "flex items-center justify-between px-3 py-2 rounded-b-xl border-t border-border/60 bg-transparent"
          )}>
            <span className={cn("text-[11px] font-medium", status.color)}>
              {status.label}
            </span>
            {node.status === 'running' && (
              <span className="text-[11px] text-muted-foreground">Executing…</span>
            )}
          </div>
        )}

        {/* Connection handles - Bottom */}
        {node.type !== 'error-handler' && (
          <div
            className={cn(
              "absolute -bottom-2 left-1/2 -translate-x-1/2 z-10",
              "w-3.5 h-3.5 rounded-full border bg-background",
              "shadow-sm",
              "opacity-0 group-hover:opacity-100",
              isSelected && "opacity-100",
              "transition-opacity"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onConnect?.('bottom');
            }}
          >
            <div className="w-full h-full rounded-full bg-muted-foreground/30 hover:bg-primary/70 transition-colors" />
          </div>
        )}

        {/* Conditional branches - Left and Right handles */}
        {(node.type === 'condition' || node.type === 'router') && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-emerald-500/70 border border-emerald-500/60 cursor-pointer z-10 shadow-sm"
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
                  className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-rose-500/70 border border-rose-500/60 cursor-pointer z-10 shadow-sm"
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
