import { useState, useCallback, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft,
  Save,
  Play,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Trash2,
  Copy,
  Download,
  Share2,
  History,
  Power,
  Zap,
  Plus,
  GitBranch,
} from "lucide-react";

import { AppsPanel, appCatalog } from "@/components/workspace/AppsPanel";
import { WorkspaceCanvas } from "@/components/workspace/WorkspaceCanvas";
import { FlowNode, AddActionNode, AddConditionNode } from "@/components/workspace/FlowNode";
import { ConfigPanelV2 } from "@/components/workspace/ConfigPanelV2";
import { validateWorkflow, WorkflowStatus } from "@/components/workspace/WorkflowValidator";
import { getAppConfig } from "@/components/workspace/AppConfigurations";
import type { FlowNode as FlowNodeType, Connection } from "@/components/workspace/types";

// Sample triggers/actions for demo
const sampleTriggers = [
  { id: 'new_message', name: 'New Message Received', description: 'Triggers when a new message arrives' },
  { id: 'new_contact', name: 'New Contact Added', description: 'Triggers when a contact is created' },
  { id: 'status_change', name: 'Status Changed', description: 'Triggers on status updates' },
  { id: 'new_email', name: 'New Email Received', description: 'Triggers when a new email arrives' },
  { id: 'form_submitted', name: 'Form Submitted', description: 'Triggers when a form is submitted' },
  { id: 'webhook_received', name: 'Webhook Received', description: 'Triggers when a webhook is received' },
  { id: 'schedule', name: 'Scheduled Trigger', description: 'Triggers on a schedule' },
];

const sampleActions = [
  { id: 'send_message', name: 'Send Message', description: 'Send a message to a contact' },
  { id: 'create_contact', name: 'Create Contact', description: 'Create a new contact record' },
  { id: 'update_record', name: 'Update Record', description: 'Update an existing record' },
  { id: 'send_email', name: 'Send Email', description: 'Send an email notification' },
  { id: 'add_to_list', name: 'Add to List', description: 'Add contact to a list' },
  { id: 'create_task', name: 'Create Task', description: 'Create a new task' },
  { id: 'call_api', name: 'Call API', description: 'Make an HTTP request' },
  { id: 'run_script', name: 'Run Script', description: 'Execute custom code' },
];

export function IntegrationWorkspace() {
  const [, setLocation] = useLocation();
  const [flowName, setFlowName] = useState("New Integration Flow");
  const [isActive, setIsActive] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  
  // Panels state
  const [appsPanelCollapsed, setAppsPanelCollapsed] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showAppPicker, setShowAppPicker] = useState(false);

  // Flow state
  const [nodes, setNodes] = useState<FlowNodeType[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  
  // Validate workflow whenever nodes change
  const workflowValidation = validateWorkflow(nodes);

  // Generate unique ID
  const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Check for initial app passed from integrations page OR create default Manual Trigger
  useEffect(() => {
    const initialAppData = sessionStorage.getItem('workspace_initial_app');
    if (initialAppData) {
      try {
        const app = JSON.parse(initialAppData);
        sessionStorage.removeItem('workspace_initial_app');
        
        // Convert integration catalog format to appCatalog format
        const appForWorkspace = {
          id: app.id,
          name: app.name,
          icon: app.icon,
          color: app.categoryColor || '#6366f1',
          description: app.description,
          category: app.category,
        };
        
        // Check if app supports triggers
        const appConfig = getAppConfig(appForWorkspace.id);
        const hasTriggers = appConfig?.triggers && appConfig.triggers.length > 0;
        
        if (!hasTriggers) {
          // Action-only app - show alert and don't create node
          alert(`⚠️ ${appForWorkspace.name} is an action-only app.\n\nWorkflows must start with a trigger.\n\nPlease choose a trigger app like Webhook or Schedule from the apps panel.`);
          return;
        }
        
        // Auto-create the first trigger node
        const newNode: FlowNodeType = {
          id: generateId(),
          type: 'trigger',
          appId: appForWorkspace.id,
          appName: appForWorkspace.name,
          appIcon: appForWorkspace.icon,
          appColor: appForWorkspace.color,
          name: 'When this happens...',
          description: appForWorkspace.description,
          position: { x: 400, y: 100 },
          status: 'incomplete',
          config: {},
          connections: [],
        };
        
        setNodes([newNode]);
        setFlowName(`${appForWorkspace.name} Flow`);
        setSelectedNodeId(newNode.id);
        setConfigPanelOpen(true);
        setIsSaved(false);
      } catch (e) {
        console.error('Failed to parse initial app data:', e);
      }
    } else if (nodes.length === 0) {
      // n8n-style: Create default Manual Trigger node when workspace loads
      const defaultTrigger: FlowNodeType = {
        id: generateId(),
        type: 'trigger',
        appId: 'manual-trigger',
        appName: 'Manual Trigger',
        appIcon: '👆',
        appColor: '#F59E0B',
        name: 'Manual Trigger',
        description: 'Trigger workflow manually',
        position: { x: 400, y: 100 },
        status: 'configured', // Manual triggers are already configured!
        config: {
          triggerType: 'manual',
          isAuthenticated: true, // Manual triggers don't need auth
        },
        connections: [],
      };
      
      setNodes([defaultTrigger]);
      setFlowName('New Workflow');
    }
  }, []);

  // Handle drop from apps panel
  const handleDrop = useCallback((appData: typeof appCatalog[0], position: { x: number; y: number }) => {
    const isFirstNode = nodes.length === 0;
    
    // Get app config to check if it supports triggers
    const appConfig = appData.id ? getAppConfig(appData.id) : null;
    const hasTriggers = appConfig?.triggers && appConfig.triggers.length > 0;
    
    // n8n-style enforcement: First node must be a trigger app
    if (isFirstNode) {
      if (!hasTriggers) {
        // This app doesn't support triggers - can't be first node
        alert(`⚠️ ${appData.name} is an action-only app.\n\nWorkflows must start with a trigger (like Webhook or Schedule).\n\n1️⃣ Add a trigger app first\n2️⃣ Then add ${appData.name} as an action`);
        return;
      }
      
      const newNode: FlowNodeType = {
        id: generateId(),
        type: 'trigger',
        appId: appData.id,
        appName: appData.name,
        appIcon: appData.icon,
        appColor: appData.color,
        name: 'When this happens...',
        description: appData.description,
        position: { x: 400, y: 100 },
        status: 'incomplete',
        config: {},
        connections: [],
      };
      
      setNodes([newNode]);
      setFlowName(`${appData.name} Flow`);
      setSelectedNodeId(newNode.id);
      setConfigPanelOpen(true);
      setIsSaved(false);
      return;
    }
    
    // n8n-style enforcement: Can only add actions if trigger is configured
    const hasTriggerWithType = nodes.some(n => n.type === 'trigger' && n.config?.triggerType);
    if (!hasTriggerWithType) {
      // Show toast warning
      return;
    }
    
    const newNode: FlowNodeType = {
      id: generateId(),
      type: 'action',
      appId: appData.id,
      appName: appData.name,
      appIcon: appData.icon,
      appColor: appData.color,
      name: 'Do this...',
      description: appData.description,
      position,
      status: 'incomplete',
      config: {},
      connections: [],
    };
    
    setNodes(prev => [...prev, newNode]);
    setIsSaved(false);

    // Auto-connect to previous node
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const newConnection: Connection = {
        id: `conn_${Date.now()}`,
        sourceId: lastNode.id,
        targetId: newNode.id,
        type: 'default',
        animated: true,
      };
      setConnections(prev => [...prev, newConnection]);
    }

    // Open config panel for new node
    setSelectedNodeId(newNode.id);
    setConfigPanelOpen(true);
  }, [nodes]);

  // Handle node selection
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setConfigPanelOpen(true);
  };

  // Handle node deletion
  const handleNodeDelete = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.sourceId !== nodeId && c.targetId !== nodeId));
    setSelectedNodeId(null);
    setConfigPanelOpen(false);
    setIsSaved(false);
  };

  // Handle node config save
  const handleNodeSave = (nodeId: string, config: Record<string, any>) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        // Manual triggers are always configured (no auth needed)
        const isManualTrigger = node.type === 'trigger' && config.triggerType === 'manual';
        
        // Determine if the node is properly configured
        const isTriggerConfigured = node.type === 'trigger' && (
          config.triggerType || config.selectedTriggerId || config.triggerId
        );
        const isActionConfigured = node.type === 'action' && (
          config.selectedActionId || config.actionId
        );
        const isAuthenticated = config.isAuthenticated || isManualTrigger;
        const isConfigured = (isTriggerConfigured || isActionConfigured) && isAuthenticated;
        
        return {
          ...node,
          config: {
            ...config,
            isAuthenticated, // Ensure this is saved
          },
          name: config.name || node.name,
          description: config.description || node.description,
          triggerId: config.triggerId || config.selectedTriggerId,
          actionId: config.actionId || config.selectedActionId,
          status: isConfigured ? 'configured' : 'incomplete',
        };
      }
      return node;
    }));
    setIsSaved(false);
    setConfigPanelOpen(false);
  };

  // Handle test
  const handleNodeTest = (nodeId: string) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        return { ...node, status: 'running' };
      }
      return node;
    }));

    // Simulate test completion
    setTimeout(() => {
      setNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          return { ...node, status: 'success' };
        }
        return node;
      }));
    }, 2000);
  };

  // Add condition node
  const handleAddCondition = () => {
    if (nodes.length === 0) return;
    
    const lastNode = nodes[nodes.length - 1];
    const newNode: FlowNodeType = {
      id: generateId(),
      type: 'condition',
      appId: 'condition',
      appName: 'Condition',
      appIcon: '🔀',
      appColor: '#8B5CF6',
      name: 'If/Else Condition',
      description: 'Branch flow based on conditions',
      position: {
        x: lastNode.position.x,
        y: lastNode.position.y + 200,
      },
      status: 'incomplete',
      config: {},
      connections: [],
    };

    setNodes(prev => [...prev, newNode]);
    
    const newConnection: Connection = {
      id: `conn_${Date.now()}`,
      sourceId: lastNode.id,
      targetId: newNode.id,
      type: 'default',
      animated: true,
    };
    setConnections(prev => [...prev, newConnection]);
    setIsSaved(false);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  
  // Get nodes that come before the selected node (for data mapping context)
  const getPreviousNodes = useCallback((nodeId: string | null): FlowNodeType[] => {
    if (!nodeId) return [];
    
    const result: FlowNodeType[] = [];
    const visited = new Set<string>();
    
    // Find all nodes that connect TO this node
    const findPrevious = (targetId: string) => {
      connections
        .filter(c => c.targetId === targetId)
        .forEach(conn => {
          if (!visited.has(conn.sourceId)) {
            visited.add(conn.sourceId);
            const sourceNode = nodes.find(n => n.id === conn.sourceId);
            if (sourceNode) {
              result.push(sourceNode);
              findPrevious(conn.sourceId);
            }
          }
        });
    };
    
    findPrevious(nodeId);
    return result.reverse(); // Order from first to last in the chain
  }, [nodes, connections]);
  
  const previousNodes = getPreviousNodes(selectedNodeId);

  return (
    <TooltipProvider>
      <div className="h-screen w-full flex flex-col bg-background">
        {/* Top Header Bar */}
        <header className="h-14 border-b bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 z-30 flex-shrink-0">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/dashboard/integrations')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="h-6 w-px bg-border" />
            
            <div className="flex items-center gap-2">
              <Input
                value={flowName}
                onChange={(e) => {
                  setFlowName(e.target.value);
                  setIsSaved(false);
                }}
                className="h-8 w-60 border-none bg-transparent font-medium text-sm focus-visible:ring-1"
              />
              {!isSaved && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Unsaved
                </Badge>
              )}
            </div>
          </div>

          {/* Center section - Flow status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isActive ? "bg-green-500" : "bg-muted-foreground"
              )} />
              <span className="text-muted-foreground">
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs gap-1">
              <Zap className="h-3 w-3" />
              {nodes.length} steps
            </Badge>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden md:inline">Version History</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View version history</TooltipContent>
            </Tooltip>

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              disabled={!workflowValidation.canExecute}
              onClick={() => {
                // Test flow logic
              }}
            >
              <Play className="h-4 w-4" />
              Test
            </Button>

            <Button 
              size="sm" 
              className="gap-2"
              onClick={() => setIsSaved(true)}
            >
              <Save className="h-4 w-4" />
              Save
            </Button>

            <Button
              variant={isActive ? "destructive" : "default"}
              size="sm"
              className="gap-2"
              onClick={() => setIsActive(!isActive)}
            >
              <Power className="h-4 w-4" />
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Flow
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Flow
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Apps Panel */}
          <AppsPanel
            isCollapsed={appsPanelCollapsed}
            onToggleCollapse={() => setAppsPanelCollapsed(!appsPanelCollapsed)}
            onAppSelect={(app) => {
              // Add app at default position
              handleDrop(app, { x: 400, y: 100 + nodes.length * 200 });
              setShowAppPicker(false);
            }}
            highlightAddAction={showAppPicker}
          />

          {/* Main Canvas */}
          <WorkspaceCanvas
            onDrop={handleDrop}
            className="bg-muted/30"
          >
            {/* Workflow Status Panel - Bottom Left */}
            <div className="absolute bottom-6 left-6 z-10 w-80">
              <WorkflowStatus validation={workflowValidation} />
            </div>

            {/* Render nodes */}
            <div className="relative">
              {nodes.map((node, index) => (
                <div
                  key={node.id}
                  className="absolute"
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                  }}
                >
                  {/* Connection line to previous node */}
                  {index > 0 && (
                    <svg
                      className="absolute pointer-events-none"
                      style={{
                        left: 120,
                        top: -100,
                        width: 2,
                        height: 100,
                        overflow: 'visible',
                      }}
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="100"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        className="animate-pulse"
                      />
                      <circle
                        cx="0"
                        cy="100"
                        r="4"
                        fill="hsl(var(--primary))"
                      />
                    </svg>
                  )}
                  
                  <FlowNode
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    onClick={() => handleNodeClick(node.id)}
                    onDoubleClick={() => handleNodeClick(node.id)}
                    onDelete={() => handleNodeDelete(node.id)}
                    onTest={() => handleNodeTest(node.id)}
                  />
                </div>
              ))}

              {/* Add action placeholder */}
              {nodes.length > 0 && (
                <div
                  className="absolute flex flex-col items-center gap-4"
                  style={{
                    left: nodes[nodes.length - 1].position.x,
                    top: nodes[nodes.length - 1].position.y + 180,
                  }}
                >
                  {/* Connection line */}
                  <svg
                    className="absolute pointer-events-none"
                    style={{
                      left: 120,
                      top: -80,
                      width: 2,
                      height: 80,
                      overflow: 'visible',
                    }}
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="80"
                      stroke="hsl(var(--muted-foreground) / 0.3)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>

                  <div className="flex gap-3">
                    <AddActionNode onClick={() => {
                      // Expand apps panel and focus on adding action
                      setAppsPanelCollapsed(false);
                      setShowAppPicker(true);
                    }} />
                    <AddConditionNode onClick={handleAddCondition} />
                  </div>
                </div>
              )}
            </div>
          </WorkspaceCanvas>

          {/* Right Config Panel - n8n-style wizard flow */}
          <ConfigPanelV2
            node={selectedNode}
            isOpen={configPanelOpen}
            onClose={() => setConfigPanelOpen(false)}
            onSave={handleNodeSave}
            onDelete={handleNodeDelete}
            onTest={handleNodeTest}
            previousNodes={previousNodes}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

export default IntegrationWorkspace;
