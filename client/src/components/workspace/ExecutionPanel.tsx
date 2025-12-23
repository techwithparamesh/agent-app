/**
 * Execution Panel Component
 * 
 * Shows execution logs, step-by-step results, and 
 * real-time execution status for flow runs.
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  X,
  Play,
  Pause,
  StopCircle,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Copy,
  Download,
  Trash2,
  Loader2,
  Activity,
  FileJson,
  Bug,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================
// TYPES
// ============================================

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'error' | 'cancelled';

export interface StepExecution {
  nodeId: string;
  nodeName: string;
  appIcon: string;
  status: ExecutionStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  logs?: LogEntry[];
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

export interface ExecutionRun {
  id: string;
  flowId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: StepExecution[];
  triggeredBy: 'manual' | 'webhook' | 'schedule';
  error?: string;
}

export interface ExecutionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentRun?: ExecutionRun | null;
  runs?: ExecutionRun[];
  onStartExecution?: () => void;
  onStopExecution?: () => void;
  onClearLogs?: () => void;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

// ============================================
// STATUS CONFIG
// ============================================

const statusConfig: Record<ExecutionStatus, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
  animate?: boolean;
}> = {
  pending: {
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Pending",
  },
  running: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Running",
    animate: true,
  },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    label: "Success",
  },
  error: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Failed",
  },
  cancelled: {
    icon: StopCircle,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    label: "Cancelled",
  },
};

const logLevelConfig = {
  info: { color: "text-blue-500", bg: "bg-blue-500/10", icon: Info },
  warn: { color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertCircle },
  error: { color: "text-red-500", bg: "bg-red-500/10", icon: AlertCircle },
  debug: { color: "text-muted-foreground", bg: "bg-muted", icon: Bug },
};

// ============================================
// HELPER COMPONENTS
// ============================================

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
};

// Step Execution Item
const StepExecutionItem: React.FC<{
  step: StepExecution;
  onClick?: () => void;
}> = ({ step, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = statusConfig[step.status];
  const StatusIcon = status.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-3 p-3 hover:bg-accent/50 cursor-pointer transition-colors",
            "border-l-2",
            step.status === 'running' && "border-l-blue-500 bg-blue-500/5",
            step.status === 'success' && "border-l-emerald-500",
            step.status === 'error' && "border-l-red-500 bg-red-500/5",
            step.status === 'pending' && "border-l-muted-foreground/30",
          )}
          onClick={onClick}
        >
          {/* Expand icon */}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}

          {/* App icon */}
          <div className="text-xl flex-shrink-0">{step.appIcon}</div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{step.nodeName}</p>
            {step.duration !== undefined && (
              <p className="text-xs text-muted-foreground">
                {formatDuration(step.duration)}
              </p>
            )}
          </div>

          {/* Status */}
          <div className={cn("flex items-center gap-1.5", status.color)}>
            <StatusIcon className={cn("h-4 w-4", status.animate && "animate-spin")} />
            <span className="text-xs font-medium">{status.label}</span>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 py-3 bg-muted/30 border-t space-y-3">
          {/* Input data */}
          {step.input && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <FileJson className="h-3 w-3" />
                  Input
                </span>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <pre className="text-xs bg-background p-2 rounded border overflow-x-auto max-h-40">
                {JSON.stringify(step.input, null, 2)}
              </pre>
            </div>
          )}

          {/* Output data */}
          {step.output && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <FileJson className="h-3 w-3" />
                  Output
                </span>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <pre className="text-xs bg-background p-2 rounded border overflow-x-auto max-h-40">
                {JSON.stringify(step.output, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {step.error && (
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded">
              <p className="text-xs text-red-500 font-medium">{step.error}</p>
            </div>
          )}

          {/* Logs */}
          {step.logs && step.logs.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Logs ({step.logs.length})
              </span>
              <div className="bg-background rounded border p-1 max-h-32 overflow-y-auto">
                {step.logs.map((log, i) => {
                  const level = logLevelConfig[log.level];
                  const LogIcon = level.icon;
                  return (
                    <div key={i} className="flex items-start gap-2 p-1 text-xs font-mono">
                      <span className="text-muted-foreground whitespace-nowrap">
                        {formatTime(log.timestamp)}
                      </span>
                      <LogIcon className={cn("h-3 w-3 mt-0.5", level.color)} />
                      <span className={level.color}>{log.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  isOpen,
  onClose,
  currentRun,
  runs = [],
  onStartExecution,
  onStopExecution,
  onClearLogs,
  onNodeClick,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  if (!isOpen) return null;

  const runStatus = currentRun ? statusConfig[currentRun.status] : null;

  return (
    <TooltipProvider>
      <div
        className={cn(
          "w-96 h-full bg-background border-l flex flex-col",
          "animate-in slide-in-from-right duration-200",
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">Execution</h3>
              {currentRun && runStatus && (
                <p className={cn("text-xs", runStatus.color)}>
                  {runStatus.label}
                  {currentRun.duration && ` • ${formatDuration(currentRun.duration)}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Control buttons */}
            {currentRun?.status === 'running' ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onStopExecution}
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Stop Execution</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onStartExecution}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Run Flow</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onClearLogs}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear Logs</TooltipContent>
            </Tooltip>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <div className="px-4 pt-3">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="current" className="text-xs">
                Current Run
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                History ({runs.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Current Run */}
          <TabsContent value="current" className="flex-1 m-0">
            <ScrollArea className="h-full">
              {currentRun ? (
                <div className="divide-y">
                  {/* Run summary */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Started</span>
                      <span className="text-xs font-mono">
                        {formatTime(currentRun.startTime)}
                      </span>
                    </div>
                    {currentRun.endTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Ended</span>
                        <span className="text-xs font-mono">
                          {formatTime(currentRun.endTime)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Trigger</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {currentRun.triggeredBy}
                      </Badge>
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    {currentRun.steps.map((step) => (
                      <StepExecutionItem
                        key={step.nodeId}
                        step={step}
                        onClick={() => onNodeClick?.(step.nodeId)}
                      />
                    ))}
                  </div>

                  {/* Error */}
                  {currentRun.error && (
                    <div className="p-4">
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium text-red-500">Error</span>
                        </div>
                        <p className="text-xs text-red-500">{currentRun.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Play className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No Execution Running</p>
                  <p className="text-xs text-muted-foreground">
                    Click "Run Flow" to start executing your automation
                  </p>
                  <Button
                    className="mt-4 gap-2"
                    onClick={onStartExecution}
                  >
                    <Play className="h-4 w-4" />
                    Run Flow
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="flex-1 m-0">
            <ScrollArea className="h-full">
              {runs.length > 0 ? (
                <div className="divide-y">
                  {runs.map((run) => {
                    const status = statusConfig[run.status];
                    const StatusIcon = status.icon;
                    
                    return (
                      <div
                        key={run.id}
                        className="p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className={cn("flex items-center gap-1.5", status.color)}>
                            <StatusIcon className={cn("h-4 w-4", status.animate && "animate-spin")} />
                            <span className="text-xs font-medium">{status.label}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(run.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{run.steps.length} steps</span>
                          {run.duration && <span>{formatDuration(run.duration)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <Clock className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium mb-1">No History Yet</p>
                  <p className="text-xs text-muted-foreground">
                    Previous executions will appear here
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="p-3 border-t flex items-center justify-between">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="h-3 w-3" />
            Export Logs
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <RotateCcw className="h-3 w-3" />
            Retry Failed
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ExecutionPanel;
