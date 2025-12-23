import { useState, useCallback } from "react";
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
import { ConfigPanel } from "@/components/workspace/ConfigPanel";
import type { FlowNode as FlowNodeType, Connection } from "@/components/workspace/types";

// Sample triggers/actions for demo
const sampleTriggers = [
  { id: 'new_message', name: 'New Message Received', description: 'Triggers when a new message arrives' },
  { id: 'new_contact', name: 'New Contact Added', description: 'Triggers when a contact is created' },
  { id: 'status_change', name: 'Status Changed', description: 'Triggers on status updates' },
];

const sampleActions = [
  { id: 'send_message', name: 'Send Message', description: 'Send a message to a contact' },
  { id: 'create_contact', name: 'Create Contact', description: 'Create a new contact record' },
  { id: 'update_record', name: 'Update Record', description: 'Update an existing record' },
  { id: 'send_email', name: 'Send Email', description: 'Send an email notification' },
  { id: 'add_to_list', name: 'Add to List', description: 'Add contact to a list' },
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

  // Flow state
  const [nodes, setNodes] = useState<FlowNodeType[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  // Generate unique ID
  const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle drop from apps panel
  const handleDrop = useCallback((appData: typeof appCatalog[0], position: { x: number; y: number }) => {
    const isFirstNode = nodes.length === 0;
    
    const newNode: FlowNodeType = {
      id: generateId(),
      type: isFirstNode ? 'trigger' : 'action',
      appId: appData.id,
      appName: appData.name,
      appIcon: appData.icon,
      appColor: appData.color,
      name: isFirstNode ? 'When this happens...' : 'Do this...',
      description: appData.description,
      position: {
        x: isFirstNode ? 400 : position.x,
        y: isFirstNode ? 100 : position.y,
      },
      status: 'incomplete',
      config: {},
      connections: [],
    };

    setNodes(prev => [...prev, newNode]);
    setIsSaved(false);

    // Auto-connect to previous node if not first
    if (!isFirstNode && nodes.length > 0) {
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
        return {
          ...node,
          config,
          name: config.name || node.name,
          description: config.description || node.description,
          triggerId: config.triggerId,
          actionId: config.actionId,
          status: config.triggerId || config.actionId ? 'configured' : 'incomplete',
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
            }}
          />

          {/* Main Canvas */}
          <WorkspaceCanvas
            onDrop={handleDrop}
            className="bg-muted/30"
          >
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
                      // Open app picker or show apps panel
                    }} />
                    <AddConditionNode onClick={handleAddCondition} />
                  </div>
                </div>
              )}
            </div>
          </WorkspaceCanvas>

          {/* Right Config Panel */}
          <ConfigPanel
            node={selectedNode}
            isOpen={configPanelOpen}
            onClose={() => setConfigPanelOpen(false)}
            onSave={handleNodeSave}
            onDelete={handleNodeDelete}
            onTest={handleNodeTest}
            availableTriggers={selectedNode?.type === 'trigger' ? sampleTriggers : []}
            availableActions={selectedNode?.type === 'action' ? sampleActions : []}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}

export default IntegrationWorkspace;
