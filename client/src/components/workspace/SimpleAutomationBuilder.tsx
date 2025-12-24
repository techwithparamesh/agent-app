/**
 * Simple Automation Builder
 * 
 * A clean, user-friendly workflow builder inspired by n8n's simplicity.
 * Uses drag-and-drop for reordering steps and form-based configuration.
 * 
 * Key Features:
 * - Drag & drop step reordering
 * - Visual step cards with icons
 * - Side panel configuration (like n8n)
 * - Expression support with variable picker
 * - Clear status indicators
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  Play,
  Save,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Check,
  AlertCircle,
  Clock,
  Loader2,
  Zap,
  Settings,
  Copy,
  MoreHorizontal,
  Search,
  ArrowRight,
  Workflow,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeConfigForm } from './NodeConfigForm';
import {
  NODE_REGISTRY,
  getNodesByCategory,
  searchNodes,
  type NodeDefinition,
} from './nodes/registry';

// =============================================================================
// TYPES
// =============================================================================

interface AutomationStep {
  id: string;
  nodeId: string; // Reference to NODE_REGISTRY
  name: string;
  config: Record<string, any>;
  status: 'idle' | 'configured' | 'error' | 'running' | 'success';
  outputs?: any;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: AutomationStep | null;
  steps: AutomationStep[];
  isActive: boolean;
  lastRun?: Date;
}

interface SimpleAutomationBuilderProps {
  automation?: Automation;
  initialApp?: {
    id: string;
    name: string;
    icon: string;
    description?: string;
    category?: string;
    categoryColor?: string;
  } | null;
  onSave: (automation: Automation) => void;
  onRun?: (automation: Automation) => void;
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

const generateId = () => `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createStep = (nodeDef: NodeDefinition): AutomationStep => ({
  id: generateId(),
  nodeId: nodeDef.id,  // Use id to match NODE_REGISTRY keys
  name: nodeDef.displayName,
  config: {},
  status: 'idle',
});

// =============================================================================
// NODE PICKER
// =============================================================================

interface NodePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (node: NodeDefinition) => void;
  filter?: 'trigger' | 'action' | 'all';
}

function NodePicker({ open, onOpenChange, onSelect, filter = 'all' }: NodePickerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Map<string, NodeDefinition[]>();
    Object.values(NODE_REGISTRY).forEach(node => {
      if (filter === 'trigger' && node.category !== 'trigger') return;
      if (filter === 'action' && node.category === 'trigger') return;
      
      // Use first group or category as the primary group
      const group = (node.group && node.group.length > 0) ? node.group[0] : node.category;
      if (!cats.has(group)) {
        cats.set(group, []);
      }
      cats.get(group)!.push(node);
    });
    return cats;
  }, [filter]);

  const filteredNodes = useMemo(() => {
    if (!search) return null;
    return searchNodes(search).filter(node => {
      if (filter === 'trigger') return node.category === 'trigger';
      if (filter === 'action') return node.category !== 'trigger';
      return true;
    });
  }, [search, filter]);

  const handleSelect = (node: NodeDefinition) => {
    onSelect(node);
    onOpenChange(false);
    setSearch('');
    setSelectedCategory(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {filter === 'trigger' ? 'Choose a Trigger' : filter === 'action' ? 'Add an Action' : 'Add a Node'}
          </DialogTitle>
          <DialogDescription>
            {filter === 'trigger' 
              ? 'Select what starts your automation' 
              : 'Choose an app or action to add to your workflow'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {filteredNodes ? (
            // Search results
            <div className="grid grid-cols-2 gap-2">
              {filteredNodes.length === 0 ? (
                <p className="col-span-2 text-center py-8 text-muted-foreground">
                  No nodes found for "{search}"
                </p>
              ) : (
                filteredNodes.map((node) => (
                  <NodeCard 
                    key={node.name} 
                    node={node} 
                    onClick={() => handleSelect(node)}
                  />
                ))
              )}
            </div>
          ) : selectedCategory ? (
            // Category view
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="mb-3"
              >
                ← Back to categories
              </Button>
              <div className="grid grid-cols-2 gap-2">
                {categories.get(selectedCategory)?.map((node) => (
                  <NodeCard 
                    key={node.name} 
                    node={node} 
                    onClick={() => handleSelect(node)}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Categories view
            <div className="grid grid-cols-2 gap-3">
              {Array.from(categories.entries()).map(([category, nodes]) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="text-left p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <span className="font-medium capitalize">{category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {nodes.slice(0, 4).map((n) => (
                      <span key={n.name} className="text-sm" title={n.displayName}>
                        {n.icon}
                      </span>
                    ))}
                    {nodes.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{nodes.length - 4}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    trigger: '⚡',
    flow: '🔀',
    transform: '🔧',
    ai: '🤖',
    communication: '💬',
    productivity: '📋',
    crm: '👥',
    developer: '💻',
    data: '📊',
    marketing: '📢',
  };
  return icons[category] || '📦';
}

interface NodeCardProps {
  node: NodeDefinition;
  onClick: () => void;
}

function NodeCard({ node, onClick }: NodeCardProps) {
  return (
    <button
      onClick={onClick}
      className="text-left p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: `${node.color}20` }}
        >
          {node.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{node.displayName}</div>
          <div className="text-xs text-muted-foreground truncate">{node.description}</div>
        </div>
        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

// =============================================================================
// STEP CARD
// =============================================================================

interface StepCardProps {
  step: AutomationStep;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isTrigger?: boolean;
}

function StepCard({ 
  step, 
  index, 
  isSelected, 
  onClick, 
  onDelete, 
  onDuplicate,
  isTrigger 
}: StepCardProps) {
  const nodeDef = NODE_REGISTRY[step.nodeId];
  
  const statusIcon = {
    idle: <AlertCircle className="h-4 w-4 text-amber-500" />,
    configured: <Check className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-destructive" />,
    running: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    success: <Check className="h-4 w-4 text-green-500" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative",
        !isTrigger && "pl-4"
      )}
    >
      {/* Connection line */}
      {!isTrigger && (
        <div className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center">
          <div className="w-0.5 h-full bg-border" />
        </div>
      )}

      <div
        onClick={onClick}
        className={cn(
          "relative flex items-center gap-3 p-4 rounded-lg border bg-card cursor-pointer transition-all",
          isSelected && "ring-2 ring-primary border-primary",
          !isSelected && "hover:border-primary/50"
        )}
      >
        {/* Drag handle (only for non-trigger) */}
        {!isTrigger && (
          <div className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        )}

        {/* Node icon */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ backgroundColor: nodeDef ? `${nodeDef.color}20` : undefined }}
        >
          {nodeDef?.icon || '❓'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isTrigger && (
              <Badge variant="secondary" className="text-[10px]">
                <Zap className="h-3 w-3 mr-1" />
                Trigger
              </Badge>
            )}
            {!isTrigger && (
              <Badge variant="outline" className="text-[10px]">
                Step {index}
              </Badge>
            )}
          </div>
          <div className="font-medium mt-1">{step.name}</div>
          <div className="text-sm text-muted-foreground truncate">
            {nodeDef?.description || 'Configure this step'}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {statusIcon[step.status]}
          
          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Arrow to next step */}
      {!isTrigger && index < 999 && (
        <div className="absolute -bottom-3 left-4 w-0.5 h-3 bg-border" />
      )}
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function SimpleAutomationBuilder({
  automation: initialAutomation,
  initialApp,
  onSave,
  onRun,
  className,
}: SimpleAutomationBuilderProps) {
  // State
  const [automation, setAutomation] = useState<Automation>(
    initialAutomation || {
      id: generateId(),
      name: initialApp ? `${initialApp.name} Automation` : 'New Automation',
      description: '',
      trigger: null,
      steps: [],
      isActive: false,
    }
  );
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [nodePickerOpen, setNodePickerOpen] = useState(false);
  const [nodePickerFilter, setNodePickerFilter] = useState<'trigger' | 'action'>('action');
  const [initialAppProcessed, setInitialAppProcessed] = useState(false);

  // Handle initial app from integrations page
  React.useEffect(() => {
    if (initialApp && !initialAppProcessed) {
      setInitialAppProcessed(true);
      
      // Try to find a matching node in the registry
      const matchingNodes = Object.values(NODE_REGISTRY).filter(node => 
        node.displayName.toLowerCase().includes(initialApp.name.toLowerCase()) ||
        node.name.toLowerCase().includes(initialApp.id.toLowerCase())
      );
      
      if (matchingNodes.length > 0) {
        // Find trigger or action based on what the app supports
        const triggerNode = matchingNodes.find(n => n.category === 'trigger');
        const actionNode = matchingNodes.find(n => n.category !== 'trigger');
        
        if (triggerNode) {
          // Auto-add as trigger
          const newTrigger = createStep(triggerNode);
          setAutomation(prev => ({
            ...prev,
            name: `${initialApp.name} Automation`,
            trigger: newTrigger,
          }));
          setSelectedStep(newTrigger.id);
        } else if (actionNode) {
          // Auto-add as first step (need trigger first, so open picker)
          setNodePickerFilter('trigger');
          setNodePickerOpen(true);
        }
      } else {
        // No matching node found, let user choose
        setNodePickerFilter('trigger');
        setNodePickerOpen(true);
      }
    }
  }, [initialApp, initialAppProcessed]);
  const [isRunning, setIsRunning] = useState(false);

  // Computed
  const selectedStepData = useMemo(() => {
    if (!selectedStep) return null;
    if (automation.trigger?.id === selectedStep) return automation.trigger;
    return automation.steps.find((s) => s.id === selectedStep);
  }, [selectedStep, automation]);

  // Available expressions for the selected step
  const availableExpressions = useMemo(() => {
    if (!selectedStep) return [];
    
    const expressions: { label: string; value: string; type: string; source: string }[] = [];
    
    // Add trigger outputs if exists
    if (automation.trigger) {
      const triggerDef = NODE_REGISTRY[automation.trigger.nodeId];
      if (triggerDef?.outputs) {
        triggerDef.outputs.forEach((output) => {
          const outputLabel: string = output.displayName ?? output.name;
          expressions.push({
            label: outputLabel,
            value: `$trigger.${output.name}`,
            type: output.type,
            source: 'Trigger',
          });
        });
      }
    }

    // Add outputs from previous steps
    const selectedIndex = automation.steps.findIndex((s) => s.id === selectedStep);
    automation.steps.slice(0, selectedIndex).forEach((step, idx) => {
      const stepDef = NODE_REGISTRY[step.nodeId];
      if (stepDef?.outputs) {
        stepDef.outputs.forEach((output) => {
          const outputLabel: string = output.displayName ?? output.name;
          expressions.push({
            label: outputLabel,
            value: `$node['${step.id}'].${output.name}`,
            type: output.type,
            source: `Step ${idx + 1}`,
          });
        });
      }
    });

    return expressions;
  }, [selectedStep, automation]);

  // Handlers
  const handleAddTrigger = () => {
    setNodePickerFilter('trigger');
    setNodePickerOpen(true);
  };

  const handleAddStep = () => {
    setNodePickerFilter('action');
    setNodePickerOpen(true);
  };

  const handleNodeSelect = (node: NodeDefinition) => {
    const newStep = createStep(node);
    
    if (nodePickerFilter === 'trigger') {
      setAutomation((prev) => ({ ...prev, trigger: newStep }));
    } else {
      setAutomation((prev) => ({ ...prev, steps: [...prev.steps, newStep] }));
    }
    
    setSelectedStep(newStep.id);
  };

  const handleStepConfigChange = (stepId: string, config: Record<string, any>) => {
    if (automation.trigger?.id === stepId) {
      setAutomation((prev) => ({
        ...prev,
        trigger: prev.trigger ? { ...prev.trigger, config, status: 'configured' } : null,
      }));
    } else {
      setAutomation((prev) => ({
        ...prev,
        steps: prev.steps.map((s) =>
          s.id === stepId ? { ...s, config, status: 'configured' } : s
        ),
      }));
    }
  };

  const handleDeleteStep = (stepId: string) => {
    if (automation.trigger?.id === stepId) {
      setAutomation((prev) => ({ ...prev, trigger: null }));
    } else {
      setAutomation((prev) => ({
        ...prev,
        steps: prev.steps.filter((s) => s.id !== stepId),
      }));
    }
    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
  };

  const handleDuplicateStep = (stepId: string) => {
    const step = automation.steps.find((s) => s.id === stepId);
    if (!step) return;
    
    const newStep: AutomationStep = {
      ...step,
      id: generateId(),
      name: `${step.name} (Copy)`,
      status: 'idle',
    };
    
    const index = automation.steps.findIndex((s) => s.id === stepId);
    const newSteps = [...automation.steps];
    newSteps.splice(index + 1, 0, newStep);
    
    setAutomation((prev) => ({ ...prev, steps: newSteps }));
  };

  const handleReorder = (newSteps: AutomationStep[]) => {
    setAutomation((prev) => ({ ...prev, steps: newSteps }));
  };

  const handleRun = async () => {
    if (!automation.trigger) return;
    
    setIsRunning(true);
    onRun?.(automation);
    
    // Simulate execution
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  const handleSave = () => {
    onSave(automation);
  };

  return (
    <div className={cn("flex h-full", className)}>
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Workflow className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Input
                value={automation.name}
                onChange={(e) => setAutomation((prev) => ({ ...prev, name: e.target.value }))}
                className="font-semibold text-lg border-0 px-0 h-auto focus-visible:ring-0"
              />
              <p className="text-sm text-muted-foreground">
                {automation.steps.length} step{automation.steps.length !== 1 ? 's' : ''}
                {automation.lastRun && ` • Last run ${automation.lastRun.toLocaleString()}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button 
              onClick={handleRun}
              disabled={!automation.trigger || isRunning}
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isRunning ? 'Running...' : 'Run'}
            </Button>
          </div>
        </div>

        {/* Steps List */}
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-2xl mx-auto space-y-3">
            {/* Trigger */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">When this happens...</span>
              </div>
              
              {automation.trigger ? (
                <StepCard
                  step={automation.trigger}
                  index={0}
                  isSelected={selectedStep === automation.trigger.id}
                  onClick={() => setSelectedStep(automation.trigger!.id)}
                  onDelete={() => handleDeleteStep(automation.trigger!.id)}
                  onDuplicate={() => {}}
                  isTrigger
                />
              ) : (
                <button
                  onClick={handleAddTrigger}
                  className="w-full p-6 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors"
                >
                  <div className="flex flex-col items-center gap-2 text-amber-600 dark:text-amber-400">
                    <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50">
                      <Zap className="h-6 w-6" />
                    </div>
                    <span className="font-medium">Add a Trigger</span>
                    <span className="text-sm text-muted-foreground">
                      Choose what starts this automation
                    </span>
                  </div>
                </button>
              )}
            </div>

            {/* Connector */}
            {automation.trigger && (
              <div className="flex justify-center py-2">
                <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
              </div>
            )}

            {/* Steps */}
            {automation.trigger && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Then do this...</span>
                </div>

                <Reorder.Group
                  axis="y"
                  values={automation.steps}
                  onReorder={handleReorder}
                  className="space-y-3"
                >
                  <AnimatePresence>
                    {automation.steps.map((step, index) => (
                      <Reorder.Item key={step.id} value={step}>
                        <StepCard
                          step={step}
                          index={index + 1}
                          isSelected={selectedStep === step.id}
                          onClick={() => setSelectedStep(step.id)}
                          onDelete={() => handleDeleteStep(step.id)}
                          onDuplicate={() => handleDuplicateStep(step.id)}
                        />
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>

                {/* Add Step Button */}
                <motion.button
                  layout
                  onClick={handleAddStep}
                  className="w-full mt-3 p-4 rounded-lg border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-2 text-muted-foreground group-hover:text-primary">
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Add another step</span>
                  </div>
                </motion.button>
              </div>
            )}

            {/* Empty state for first time */}
            {!automation.trigger && (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Start building your automation</h3>
                <p className="text-muted-foreground mb-6">
                  Add a trigger to begin, then add steps to create your workflow
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Config Panel */}
      <Sheet open={!!selectedStep} onOpenChange={() => setSelectedStep(null)}>
        <SheetContent className="w-[450px] sm:w-[540px] p-0">
          {selectedStepData && (
            <NodeConfigForm
              nodeId={selectedStepData.id}
              nodeDefinitionId={selectedStepData.nodeId}
              initialValues={selectedStepData.config}
              onChange={(config) => handleStepConfigChange(selectedStepData.id, config)}
              onClose={() => setSelectedStep(null)}
              availableExpressions={availableExpressions}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Node Picker */}
      <NodePicker
        open={nodePickerOpen}
        onOpenChange={setNodePickerOpen}
        onSelect={handleNodeSelect}
        filter={nodePickerFilter}
      />
    </div>
  );
}

export default SimpleAutomationBuilder;
