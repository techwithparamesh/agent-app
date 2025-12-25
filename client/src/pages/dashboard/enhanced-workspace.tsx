/**
 * Enhanced Integration Workspace
 * 
 * A fully redesigned, n8n-level flow builder with smooth interactions,
 * drag-and-drop, bezier connections, and professional UX.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  Save,
  Play,
  MoreHorizontal,
  Power,
  Copy,
  Download,
  Share2,
  Trash2,
  Settings,
  History,
  Activity,
  PanelRightClose,
  PanelRightOpen,
  Keyboard,
  StickyNote,
  Map,
  Key,
  Pin,
  Layout,
  Database,
} from "lucide-react";

// Workspace components
import { AppsPanel, appCatalog } from "@/components/workspace/AppsPanel";
import { FlowCanvas, type FlowCanvasRef } from "@/components/workspace/FlowCanvas";
import { FlowConnections } from "@/components/workspace/FlowConnections";
import { EnhancedFlowNode } from "@/components/workspace/EnhancedFlowNode";
import { ConfigPanelV2 } from "@/components/workspace/ConfigPanelV2";
import { ExecutionPanel } from "@/components/workspace/ExecutionPanel";
import { 
  ContextMenu, 
  buildNodeContextMenu,
  buildCanvasContextMenu,
  buildConnectionContextMenu,
} from "@/components/workspace/ContextMenu";
import { QuickNodePicker } from "@/components/workspace/QuickNodePicker";
import { AddNodePicker } from "@/components/workspace/AddNodePicker";
import { 
  triggerCatalog, 
  actionCatalog, 
  logicNodeCatalog,
  type TriggerDefinition,
  type ActionDefinition,
  type LogicNodeDefinition,
} from "@/components/workspace/NodeCatalog";
import { useFlowState } from "@/components/workspace/useFlowState";
import { useKeyboardShortcuts, buildFlowShortcuts, SHORTCUT_CATEGORIES } from "@/components/workspace/useKeyboardShortcuts";
import type { FlowNode, Connection } from "@/components/workspace/types";

// New n8n-style components
import { StickyNoteLayer, type StickyNoteData } from "@/components/workspace/StickyNote";
import { CanvasMiniMap } from "@/components/workspace/CanvasMiniMap";
import { CredentialManager, type Credential } from "@/components/workspace/CredentialManager";
import { DataPinningPanel, type PinnedData } from "@/components/workspace/DataPinningPanel";
import { TemplatesGallery, type WorkflowTemplate } from "@/components/workspace/TemplatesGallery";

// API hooks for backend sync
import { useCredentialsApi, useWorkflowsApi } from "@/hooks/useWorkflowApi";
import { useToast } from "@/hooks/use-toast";

// n8n Schema registry for apps
import { n8nSchemaRegistry, getAllN8nApps } from "@/components/workspace/n8n-schemas";

// ============================================
// SAMPLE DATA
// ============================================

const sampleTriggers = [
  { id: 'new_message', name: 'New Message Received', description: 'Triggers when a new message arrives' },
  { id: 'new_email', name: 'New Email', description: 'Triggers when a new email is received' },
  { id: 'webhook', name: 'Webhook Received', description: 'Triggers when a webhook is called' },
  { id: 'schedule', name: 'Scheduled', description: 'Triggers on a schedule' },
  { id: 'new_contact', name: 'New Contact', description: 'Triggers when a contact is created' },
];

const sampleActions = [
  { id: 'send_message', name: 'Send Message', description: 'Send a message' },
  { id: 'send_email', name: 'Send Email', description: 'Send an email' },
  { id: 'create_record', name: 'Create Record', description: 'Create a new record' },
  { id: 'update_record', name: 'Update Record', description: 'Update an existing record' },
  { id: 'call_api', name: 'HTTP Request', description: 'Make an API call' },
  { id: 'run_ai', name: 'AI Completion', description: 'Generate AI response' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function EnhancedWorkspace() {
  const [, setLocation] = useLocation();
  const canvasRef = useRef<FlowCanvasRef>(null);

  // Flow state with undo/redo
  const [flowState, flowActions] = useFlowState();

  // UI state
  const [flowName, setFlowName] = useState("New Integration Flow");
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Panel state
  const [appsPanelCollapsed, setAppsPanelCollapsed] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [executionPanelOpen, setExecutionPanelOpen] = useState(false);
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);

  // New panel states
  const [credentialsPanelOpen, setCredentialsPanelOpen] = useState(false);
  const [dataPinningPanelOpen, setDataPinningPanelOpen] = useState(false);
  const [templatesGalleryOpen, setTemplatesGalleryOpen] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Sticky notes state
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // API Hooks for backend sync
  const { toast } = useToast();
  const credentialsApi = useCredentialsApi();
  const workflowsApi = useWorkflowsApi();
  
  // Current workflow ID (for save/update)
  const [currentWorkflowId, setCurrentWorkflowId] = useState<number | null>(null);

  // Pinned data state (for testing)
  const [pinnedData, setPinnedData] = useState<PinnedData[]>([]);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    canvasPosition?: { x: number; y: number };
    type: 'node' | 'connection' | 'canvas';
    targetId?: string;
  } | null>(null);

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connection dragging
  const [pendingConnection, setPendingConnection] = useState<{
    sourceId: string;
    sourceHandle?: string;
    mousePosition: { x: number; y: number };
  } | null>(null);

  // Quick node picker (for dropping connections on empty canvas)
  const [quickNodePicker, setQuickNodePicker] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    canvasPosition: { x: number; y: number };
    sourceNodeId: string;
    sourceHandle?: string;
  } | null>(null);

  // Add node picker (for context menu Add Node)
  const [addNodePicker, setAddNodePicker] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    canvasPosition: { x: number; y: number };
    initialTab: 'triggers' | 'actions' | 'logic';
  } | null>(null);

  // Clipboard
  const [clipboard, setClipboard] = useState<{
    nodes: FlowNode[];
    connections: Connection[];
  } | null>(null);

  // Get selected node
  const selectedNode = useMemo(() => {
    if (flowState.selectedNodeIds.size !== 1) return null;
    const nodeId = Array.from(flowState.selectedNodeIds)[0];
    return flowActions.getNode(nodeId) || null;
  }, [flowState.selectedNodeIds, flowActions]);

  // Load workflows list on mount (for workflow selector later)
  useEffect(() => {
    workflowsApi.loadWorkflows();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  // Handle app drop from panel - determine node type based on app capabilities
  const handleAppDrop = useCallback((appData: typeof appCatalog[0], position: { x: number; y: number }) => {
    const isFirstNode = flowState.nodes.length === 0;
    const hasTrigger = flowState.nodes.some(n => n.type === 'trigger');
    
    // Determine node type based on app capabilities and workflow state
    let nodeType: 'trigger' | 'action' = 'action';
    let nodeName = 'Do this...';
    
    // Check if app can be a trigger
    const canBeTrigger = appData.nodeTypes === 'trigger' || appData.nodeTypes === 'both';
    const canBeAction = appData.nodeTypes === 'action' || appData.nodeTypes === 'both';
    
    if (isFirstNode || !hasTrigger) {
      // First node or no trigger yet - prefer trigger if app supports it
      if (canBeTrigger) {
        nodeType = 'trigger';
        nodeName = 'When this happens...';
      } else {
        nodeType = 'action';
        nodeName = appData.actions?.[0]?.name || 'Do this...';
      }
    } else {
      // Already have a trigger - must be action
      if (!canBeAction) {
        // App is trigger-only, can't add it
        console.warn(`${appData.name} can only be used as a trigger`);
        return;
      }
      nodeType = 'action';
      nodeName = appData.actions?.[0]?.name || 'Do this...';
    }
    
    const nodeData: Omit<FlowNode, 'id'> = {
      type: nodeType,
      appId: appData.id,
      appName: appData.name,
      appIcon: appData.icon,
      appColor: appData.color,
      name: nodeName,
      description: appData.description,
      position,
      status: 'incomplete',
      config: {},
      connections: [],
    };

    const newId = flowActions.addNode(nodeData, position);

    // Auto-connect to last node if not first
    if (!isFirstNode && flowState.nodes.length > 0) {
      const lastNode = flowState.nodes[flowState.nodes.length - 1];
      flowActions.addConnection(lastNode.id, newId);
    }

    // Select and configure
    flowActions.selectNode(newId);
    setConfigPanelOpen(true);
  }, [flowState.nodes, flowActions]);

  // Handle app select from panel (click)
  const handleAppSelect = useCallback((app: typeof appCatalog[0]) => {
    const lastNode = flowState.nodes[flowState.nodes.length - 1];
    const position = lastNode
      ? { x: lastNode.position.x, y: lastNode.position.y + 220 }
      : { x: 400, y: 100 };
    
    handleAppDrop(app, position);
  }, [flowState.nodes, handleAppDrop]);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    const addToSelection = e.shiftKey || e.ctrlKey || e.metaKey;
    flowActions.selectNode(nodeId, addToSelection);
  }, [flowActions]);

  // Handle node double click
  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    flowActions.selectNode(nodeId);
    setConfigPanelOpen(true);
  }, [flowActions]);

  // Handle node drag start
  const handleNodeDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    const node = flowActions.getNode(nodeId);
    if (!node || !canvasRef.current) return;

    const canvasPos = canvasRef.current.screenToCanvas(e.clientX, e.clientY);
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: canvasPos.x - node.position.x,
      y: canvasPos.y - node.position.y,
    });

    // Ensure node is selected
    if (!flowState.selectedNodeIds.has(nodeId)) {
      flowActions.selectNode(nodeId);
    }
  }, [flowActions, flowState.selectedNodeIds]);

  // Handle mouse move for dragging
  const handleCanvasMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;

    const canvasPos = canvasRef.current.screenToCanvas(e.clientX, e.clientY);

    // Node dragging
    if (draggingNodeId) {
      const newPosition = {
        x: canvasPos.x - dragOffset.x,
        y: canvasPos.y - dragOffset.y,
      };

      // Move selected nodes if multiple selected
      if (flowState.selectedNodeIds.size > 1 && flowState.selectedNodeIds.has(draggingNodeId)) {
        const baseNode = flowActions.getNode(draggingNodeId);
        if (baseNode) {
          const dx = newPosition.x - baseNode.position.x;
          const dy = newPosition.y - baseNode.position.y;
          
          const moves = Array.from(flowState.selectedNodeIds).map(id => {
            const node = flowActions.getNode(id)!;
            return {
              nodeId: id,
              position: { x: node.position.x + dx, y: node.position.y + dy },
            };
          });
          flowActions.moveNodes(moves);
        }
      } else {
        flowActions.moveNode(draggingNodeId, newPosition);
      }
    }

    // Connection dragging
    if (pendingConnection) {
      setPendingConnection(prev => prev ? { ...prev, mousePosition: canvasPos } : null);
    }
  }, [draggingNodeId, dragOffset, pendingConnection, flowActions, flowState.selectedNodeIds]);

  // Handle mouse up - special handling for connection drops on empty canvas
  const handleCanvasMouseUp = useCallback((e: MouseEvent) => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
    
    // If we were dragging a connection and released on empty canvas, show node picker
    if (pendingConnection && canvasRef.current) {
      const canvasPos = canvasRef.current.screenToCanvas(e.clientX, e.clientY);
      
      // Check if we dropped on a node (in which case connection is handled elsewhere)
      const droppedOnNode = flowState.nodes.some(node => {
        const nodeWidth = 260;
        const nodeHeight = 140;
        return (
          canvasPos.x >= node.position.x &&
          canvasPos.x <= node.position.x + nodeWidth &&
          canvasPos.y >= node.position.y - 20 && // Include input handle area
          canvasPos.y <= node.position.y + nodeHeight + 20
        );
      });

      if (!droppedOnNode) {
        // Show quick node picker at drop location
        setQuickNodePicker({
          isOpen: true,
          position: { x: e.clientX, y: e.clientY },
          canvasPosition: canvasPos,
          sourceNodeId: pendingConnection.sourceId,
          sourceHandle: pendingConnection.sourceHandle,
        });
      }
      
      setPendingConnection(null);
    }
  }, [draggingNodeId, pendingConnection, flowState.nodes]);

  // Set up global mouse handlers
  useEffect(() => {
    window.addEventListener('mousemove', handleCanvasMouseMove);
    window.addEventListener('mouseup', handleCanvasMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleCanvasMouseMove);
      window.removeEventListener('mouseup', handleCanvasMouseUp);
    };
  }, [handleCanvasMouseMove, handleCanvasMouseUp]);

  // Handle connection start
  const handleConnectionStart = useCallback((nodeId: string, handle: string) => {
    if (!canvasRef.current) return;
    const node = flowActions.getNode(nodeId);
    if (!node) return;

    setPendingConnection({
      sourceId: nodeId,
      sourceHandle: handle,
      mousePosition: {
        x: node.position.x + 130,
        y: node.position.y + 150,
      },
    });
  }, [flowActions]);

  // Handle connection end (drop on node)
  const handleConnectionEnd = useCallback((targetId: string) => {
    if (!pendingConnection) return;
    
    flowActions.addConnection(
      pendingConnection.sourceId,
      targetId,
      pendingConnection.sourceHandle,
      'input'
    );
    
    setPendingConnection(null);
  }, [pendingConnection, flowActions]);

  // Handle canvas click
  const handleCanvasClick = useCallback(() => {
    flowActions.clearSelection();
    setConfigPanelOpen(false);
  }, [flowActions]);

  // Handle canvas context menu
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent, canvasPosition: { x: number; y: number }) => {
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      canvasPosition,
      type: 'canvas',
    });
  }, []);

  // Handle node context menu
  const handleNodeContextMenu = useCallback((nodeId: string, e: React.MouseEvent) => {
    flowActions.selectNode(nodeId);
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      type: 'node',
      targetId: nodeId,
    });
  }, [flowActions]);

  // Handle connection click
  const handleConnectionClick = useCallback((connectionId: string) => {
    flowActions.selectConnection(connectionId);
  }, [flowActions]);

  // Handle connection context menu
  const handleConnectionContextMenu = useCallback((connectionId: string, e: React.MouseEvent) => {
    flowActions.selectConnection(connectionId);
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      type: 'connection',
      targetId: connectionId,
    });
  }, [flowActions]);

  // Handle node config save
  const handleNodeSave = useCallback((nodeId: string, config: Record<string, any>) => {
    flowActions.updateNode(nodeId, {
      config,
      name: config.name || flowActions.getNode(nodeId)?.name,
      triggerId: config.triggerId,
      actionId: config.actionId,
      status: config.triggerId || config.actionId ? 'configured' : 'incomplete',
    });
    setConfigPanelOpen(false);
  }, [flowActions]);

  // Handle quick node picker selection (from connection drop on empty canvas)
  const handleQuickNodeSelect = useCallback((app: typeof appCatalog[0], nodeType: 'action' | 'condition' | 'delay' | 'loop') => {
    if (!quickNodePicker) return;

    // Store connection info before clearing quickNodePicker
    const sourceNodeId = quickNodePicker.sourceNodeId;
    const sourceHandle = quickNodePicker.sourceHandle;
    const canvasPosition = quickNodePicker.canvasPosition;

    // Create the new node at the drop position
    const nodeData: Omit<FlowNode, 'id'> = {
      type: nodeType,
      appId: app.id,
      appName: app.name,
      appIcon: app.icon,
      appColor: app.color,
      name: nodeType === 'condition' ? 'Check condition' :
            nodeType === 'delay' ? 'Wait...' :
            nodeType === 'loop' ? 'For each item' :
            'Do this...',
      description: app.description || '',
      position: canvasPosition,
      status: 'incomplete',
      config: {},
      connections: [],
    };

    const newId = flowActions.addNode(nodeData, canvasPosition);

    // Auto-connect from source node (refs are updated immediately, no setTimeout needed)
    if (sourceNodeId && newId) {
      flowActions.addConnection(
        sourceNodeId,
        newId,
        sourceHandle,
        'input'
      );
    }

    // Select the new node and open config
    flowActions.selectNode(newId);
    setConfigPanelOpen(true);
    setQuickNodePicker(null);
  }, [quickNodePicker, flowActions]);

  // Handle add node picker selection (from context menu)
  const handleAddTrigger = useCallback((trigger: TriggerDefinition) => {
    if (!addNodePicker) return;
    
    const nodeData: Omit<FlowNode, 'id'> = {
      type: 'trigger',
      appId: trigger.appId || trigger.id,
      appName: trigger.name,
      appIcon: trigger.icon,
      appColor: trigger.color,
      name: 'When this happens...',
      description: trigger.description,
      position: addNodePicker.canvasPosition,
      status: 'incomplete',
      config: {},
      connections: [],
      triggerId: trigger.id,
    };

    const newId = flowActions.addNode(nodeData, addNodePicker.canvasPosition);
    flowActions.selectNode(newId);
    setConfigPanelOpen(true);
    setAddNodePicker(null);
  }, [addNodePicker, flowActions]);

  const handleAddAction = useCallback((action: ActionDefinition) => {
    if (!addNodePicker) return;
    
    const nodeData: Omit<FlowNode, 'id'> = {
      type: 'action',
      appId: action.appId || action.id,
      appName: action.name,
      appIcon: action.icon,
      appColor: action.color,
      name: 'Do this...',
      description: action.description,
      position: addNodePicker.canvasPosition,
      status: 'incomplete',
      config: {},
      connections: [],
      actionId: action.id,
    };

    const newId = flowActions.addNode(nodeData, addNodePicker.canvasPosition);
    flowActions.selectNode(newId);
    setConfigPanelOpen(true);
    setAddNodePicker(null);
  }, [addNodePicker, flowActions]);

  const handleAddLogic = useCallback((logic: LogicNodeDefinition) => {
    if (!addNodePicker) return;
    
    const nodeData: Omit<FlowNode, 'id'> = {
      type: logic.type,
      appId: logic.id,
      appName: logic.name,
      appIcon: logic.icon,
      appColor: logic.color,
      name: logic.name,
      description: logic.description,
      position: addNodePicker.canvasPosition,
      status: 'incomplete',
      config: {},
      connections: [],
    };

    const newId = flowActions.addNode(nodeData, addNodePicker.canvasPosition);
    flowActions.selectNode(newId);
    setConfigPanelOpen(true);
    setAddNodePicker(null);
  }, [addNodePicker, flowActions]);

  // Handle node test
  const handleNodeTest = useCallback((nodeId: string) => {
    flowActions.updateNode(nodeId, { status: 'running' });
    setTimeout(() => {
      flowActions.updateNode(nodeId, { status: 'success' });
    }, 2000);
  }, [flowActions]);

  // Copy/Cut/Paste handlers
  const handleCopy = useCallback(() => {
    if (flowState.selectedNodeIds.size === 0) return;
    
    const selectedNodes = flowState.nodes.filter(n => flowState.selectedNodeIds.has(n.id));
    const selectedConnections = flowState.connections.filter(c => 
      flowState.selectedNodeIds.has(c.sourceId) && flowState.selectedNodeIds.has(c.targetId)
    );
    
    setClipboard({ nodes: selectedNodes, connections: selectedConnections });
  }, [flowState]);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;
    
    const newIds = flowActions.duplicateNodes(
      clipboard.nodes.map(n => n.id)
    );
    
    flowActions.selectNodes(newIds);
  }, [clipboard, flowActions]);

  const handleDelete = useCallback(() => {
    if (flowState.selectedNodeIds.size > 0) {
      flowActions.deleteNodes(Array.from(flowState.selectedNodeIds));
    }
    if (flowState.selectedConnectionIds.size > 0) {
      flowActions.deleteConnections(Array.from(flowState.selectedConnectionIds));
    }
  }, [flowState, flowActions]);

  const handleDuplicate = useCallback(() => {
    if (flowState.selectedNodeIds.size === 0) return;
    const newIds = flowActions.duplicateNodes(Array.from(flowState.selectedNodeIds));
    flowActions.selectNodes(newIds);
  }, [flowState.selectedNodeIds, flowActions]);

  // Save flow to backend
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Extract connections from nodes
      const connections: Array<{ sourceId: string; targetId: string }> = [];
      flowState.nodes.forEach(node => {
        node.connections.forEach(targetId => {
          connections.push({ sourceId: node.id, targetId });
        });
      });

      // Get trigger config from first node if it's a trigger
      const triggerNode = flowState.nodes.find(n => n.type === 'trigger');
      const triggerConfig = triggerNode?.config || {};

      const result = await workflowsApi.saveWorkflow({
        name: flowName,
        description: '',
        nodes: flowState.nodes,
        connections,
        triggerConfig,
        isActive,
      }, currentWorkflowId || undefined);

      if (result) {
        setCurrentWorkflowId(result.id);
        toast({
          title: "Workflow saved",
          description: `"${flowName}" has been saved successfully.`,
        });
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
      toast({
        title: "Save failed",
        description: "Failed to save workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [flowState.nodes, flowName, isActive, currentWorkflowId, workflowsApi, toast]);

  // Handle template import
  const handleImportTemplate = useCallback((template: WorkflowTemplate) => {
    // Clear existing nodes
    flowState.nodes.forEach(node => flowActions.deleteNode(node.id));
    
    // Create nodes from template
    const nodeIdMap: Record<string, string> = {};
    
    template.nodes.forEach((templateNode) => {
      const nodeData: Omit<FlowNode, 'id'> = {
        type: templateNode.type.includes('trigger') ? 'trigger' : 'action',
        appId: templateNode.type,
        appName: templateNode.name,
        appIcon: '⚡',
        appColor: '#6366f1',
        name: templateNode.name,
        description: '',
        position: templateNode.position,
        status: 'incomplete',
        config: templateNode.parameters || {},
        connections: [],
      };
      
      const newId = flowActions.addNode(nodeData, templateNode.position);
      nodeIdMap[templateNode.id] = newId;
    });
    
    // Create connections
    template.connections.forEach((conn) => {
      const sourceId = nodeIdMap[conn.sourceNodeId];
      const targetId = nodeIdMap[conn.targetNodeId];
      if (sourceId && targetId) {
        flowActions.addConnection(sourceId, targetId);
      }
    });
    
    setFlowName(template.name);
    setTemplatesGalleryOpen(false);
  }, [flowState.nodes, flowActions]);

  // Credential handlers - connected to backend API
  const handleCreateCredential = useCallback(async (cred: Omit<Credential, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Credential> => {
    try {
      const newCred = await credentialsApi.createCredential(cred);
      toast({
        title: "Credential created",
        description: `"${cred.name}" has been saved securely.`,
      });
      return newCred;
    } catch (err) {
      toast({
        title: "Create failed",
        description: "Failed to create credential.",
        variant: "destructive",
      });
      throw err;
    }
  }, [credentialsApi, toast]);

  const handleUpdateCredential = useCallback(async (id: string, updates: Partial<Credential>): Promise<void> => {
    try {
      await credentialsApi.updateCredential(id, updates);
      toast({
        title: "Credential updated",
        description: "Your changes have been saved.",
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: "Failed to update credential.",
        variant: "destructive",
      });
      throw err;
    }
  }, [credentialsApi, toast]);

  const handleDeleteCredential = useCallback(async (id: string): Promise<void> => {
    try {
      await credentialsApi.deleteCredential(id);
      toast({
        title: "Credential deleted",
        description: "The credential has been removed.",
      });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: "Failed to delete credential.",
        variant: "destructive",
      });
      throw err;
    }
  }, [credentialsApi, toast]);

  const handleTestCredential = useCallback(async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await credentialsApi.testCredential(id);
      toast({
        title: result.success ? "Connection successful" : "Connection failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      return result;
    } catch (err) {
      toast({
        title: "Test failed",
        description: "Failed to test credential.",
        variant: "destructive",
      });
      return { success: false, message: 'Failed to test credential' };
    }
  }, [credentialsApi, toast]);

  // Data pinning handlers
  const handlePinData = useCallback((nodeId: string, items: any[]) => {
    const node = flowActions.getNode(nodeId);
    if (!node) return;
    
    const pinData: PinnedData = {
      nodeId,
      nodeName: node.name,
      nodeIcon: node.appIcon,
      nodeType: node.appId,
      items: items.map((item, idx) => ({ id: `item_${idx}`, json: item })),
      pinnedAt: new Date(),
      source: 'manual',
    };
    
    setPinnedData(prev => {
      const filtered = prev.filter(p => p.nodeId !== nodeId);
      return [...filtered, pinData];
    });
  }, [flowActions]);

  const handleUnpinData = useCallback((nodeId: string) => {
    setPinnedData(prev => prev.filter(p => p.nodeId !== nodeId));
  }, []);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================

  useKeyboardShortcuts({
    enabled: !configPanelOpen,
    shortcuts: buildFlowShortcuts({
      onUndo: flowActions.undo,
      onRedo: flowActions.redo,
      onCopy: handleCopy,
      onPaste: handlePaste,
      onDelete: handleDelete,
      onDuplicate: handleDuplicate,
      onSelectAll: flowActions.selectAll,
      onEscape: () => {
        flowActions.clearSelection();
        setConfigPanelOpen(false);
        setContextMenu(null);
      },
      onSave: handleSave,
      onZoomIn: flowActions.zoomIn,
      onZoomOut: flowActions.zoomOut,
      onFitView: flowActions.fitView,
    }),
  });

  // ============================================
  // CONTEXT MENU ITEMS
  // ============================================

  const getContextMenuItems = useCallback(() => {
    if (!contextMenu) return [];

    if (contextMenu.type === 'node' && contextMenu.targetId) {
      const node = flowActions.getNode(contextMenu.targetId);
      return buildNodeContextMenu({
        onConfigure: () => setConfigPanelOpen(true),
        onTest: () => node && handleNodeTest(node.id),
        onRename: () => {},
        onDuplicate: handleDuplicate,
        onCopy: handleCopy,
        onDelete: handleDelete,
        isEnabled: node?.config?.enabled !== false,
        canTest: node?.status === 'configured',
      });
    }

    if (contextMenu.type === 'connection' && contextMenu.targetId) {
      return buildConnectionContextMenu({
        onDelete: () => flowActions.deleteConnection(contextMenu.targetId!),
      });
    }

    return buildCanvasContextMenu({
      onAddTrigger: () => {
        setContextMenu(null);
        setAddNodePicker({
          isOpen: true,
          position: contextMenu.position,
          canvasPosition: contextMenu.canvasPosition || { x: 400, y: 100 },
          initialTab: 'triggers',
        });
      },
      onAddAction: () => {
        setContextMenu(null);
        setAddNodePicker({
          isOpen: true,
          position: contextMenu.position,
          canvasPosition: contextMenu.canvasPosition || { x: 400, y: 200 },
          initialTab: 'actions',
        });
      },
      onAddCondition: () => {
        setContextMenu(null);
        setAddNodePicker({
          isOpen: true,
          position: contextMenu.position,
          canvasPosition: contextMenu.canvasPosition || { x: 400, y: 200 },
          initialTab: 'logic',
        });
      },
      onAddDelay: () => {
        setContextMenu(null);
        setAddNodePicker({
          isOpen: true,
          position: contextMenu.position,
          canvasPosition: contextMenu.canvasPosition || { x: 400, y: 200 },
          initialTab: 'logic',
        });
      },
      onPaste: handlePaste,
      onSelectAll: flowActions.selectAll,
      onZoomIn: flowActions.zoomIn,
      onZoomOut: flowActions.zoomOut,
      onFitView: flowActions.fitView,
      onAutoLayout: () => {
        // Simple auto-layout: arrange nodes vertically
        const nodes = [...flowState.nodes];
        nodes.sort((a, b) => {
          // Triggers first, then by creation order
          if (a.type === 'trigger' && b.type !== 'trigger') return -1;
          if (a.type !== 'trigger' && b.type === 'trigger') return 1;
          return 0;
        });
        
        let y = 100;
        nodes.forEach((node, idx) => {
          flowActions.moveNode(node.id, { x: 400, y });
          y += 200;
        });
      },
      canPaste: !!clipboard,
    });
  }, [contextMenu, flowActions, handleDelete, handleDuplicate, handleCopy, handlePaste, handleNodeTest, clipboard]);

  // ============================================
  // LOAD INITIAL APP
  // ============================================

  useEffect(() => {
    const initialAppData = sessionStorage.getItem('workspace_initial_app');
    if (initialAppData) {
      try {
        const app = JSON.parse(initialAppData);
        sessionStorage.removeItem('workspace_initial_app');
        
        const nodeData: Omit<FlowNode, 'id'> = {
          type: 'trigger',
          appId: app.id,
          appName: app.name,
          appIcon: app.icon,
          appColor: app.categoryColor || '#6366f1',
          name: 'When this happens...',
          description: app.description,
          position: { x: 400, y: 100 },
          status: 'incomplete',
          config: {},
          connections: [],
        };
        
        const newId = flowActions.addNode(nodeData);
        setFlowName(`${app.name} Flow`);
        flowActions.selectNode(newId);
        setConfigPanelOpen(true);
      } catch (e) {
        console.error('Failed to parse initial app:', e);
      }
    }
  }, [flowActions]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <TooltipProvider>
      <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 z-30 flex-shrink-0">
          {/* Left */}
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
                onChange={(e) => setFlowName(e.target.value)}
                className="h-8 w-60 border-none bg-transparent font-medium text-sm"
              />
              {flowState.isDirty && (
                <Badge variant="outline" className="text-[10px]">Unsaved</Badge>
              )}
            </div>
          </div>

          {/* Center */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              {flowState.nodes.length} steps
            </Badge>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShortcutsDialogOpen(true)}
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard Shortcuts</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showMiniMap ? "secondary" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowMiniMap(!showMiniMap)}
                >
                  <Map className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Mini Map</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCredentialsPanelOpen(true)}
                >
                  <Key className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Credentials</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={pinnedData.length > 0 ? "secondary" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDataPinningPanelOpen(true)}
                >
                  <Pin className="h-4 w-4" />
                  {pinnedData.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] rounded-full flex items-center justify-center text-primary-foreground">
                      {pinnedData.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pinned Data ({pinnedData.length})</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setTemplatesGalleryOpen(true)}
                >
                  <Layout className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Templates</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setExecutionPanelOpen(!executionPanelOpen)}
                >
                  <Activity className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Execution Logs</TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-border" />

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
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
                  <History className="h-4 w-4 mr-2" />
                  Version History
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
            onAppSelect={handleAppSelect}
          />

          {/* Canvas */}
          <div className="flex-1 relative">
            <FlowCanvas
              ref={canvasRef}
              viewport={flowState.viewport}
              onViewportChange={flowActions.setViewport}
              onCanvasClick={handleCanvasClick}
              onCanvasContextMenu={handleCanvasContextMenu}
              onDrop={handleAppDrop}
              canUndo={flowActions.canUndo()}
              canRedo={flowActions.canRedo()}
              onUndo={flowActions.undo}
              onRedo={flowActions.redo}
            >
              {/* Sticky Notes Layer */}
              <StickyNoteLayer
                notes={stickyNotes}
                selectedNoteId={selectedNoteId}
                zoom={flowState.viewport.zoom || 1}
                onSelectNote={setSelectedNoteId}
                onUpdateNote={(noteId, updates) => {
                  setStickyNotes(prev => prev.map(n => 
                    n.id === noteId ? { ...n, ...updates } : n
                  ));
                }}
                onDuplicateNote={(noteId) => {
                  const note = stickyNotes.find(n => n.id === noteId);
                  if (note) {
                    const newNote: StickyNoteData = {
                      ...note,
                      id: `note_${Date.now()}`,
                      position: { x: note.position.x + 20, y: note.position.y + 20 },
                    };
                    setStickyNotes(prev => [...prev, newNote]);
                  }
                }}
                onDeleteNote={(noteId) => {
                  setStickyNotes(prev => prev.filter(n => n.id !== noteId));
                  if (selectedNoteId === noteId) setSelectedNoteId(null);
                }}
              />

              {/* Connections Layer */}
              <FlowConnections
                nodes={flowState.nodes}
                connections={flowState.connections}
                selectedConnectionIds={flowState.selectedConnectionIds}
                onConnectionClick={handleConnectionClick}
                onConnectionContextMenu={handleConnectionContextMenu}
                onConnectionDelete={(connectionId) => flowActions.deleteConnection(connectionId)}
                pendingConnection={pendingConnection}
              />

              {/* Nodes Layer */}
              {flowState.nodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute"
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    zIndex: draggingNodeId === node.id ? 100 : 
                            flowState.selectedNodeIds.has(node.id) ? 10 : 1,
                  }}
                >
                  <EnhancedFlowNode
                    node={node}
                    isSelected={flowState.selectedNodeIds.has(node.id)}
                    isDragging={draggingNodeId === node.id}
                    isConnecting={!!pendingConnection}
                    isValidDropTarget={
                      !!pendingConnection && 
                      pendingConnection.sourceId !== node.id &&
                      node.type !== 'trigger'
                    }
                    onClick={(e) => handleNodeClick(node.id, e)}
                    onDoubleClick={() => handleNodeDoubleClick(node.id)}
                    onDragStart={(e) => handleNodeDragStart(node.id, e)}
                    onContextMenu={(e) => handleNodeContextMenu(node.id, e)}
                    onConnectionStart={(handle) => handleConnectionStart(node.id, handle)}
                    onConnectionEnd={() => handleConnectionEnd(node.id)}
                    onConfigure={() => {
                      flowActions.selectNode(node.id);
                      setConfigPanelOpen(true);
                    }}
                    onDuplicate={() => {
                      flowActions.selectNode(node.id);
                      handleDuplicate();
                    }}
                    onDelete={() => flowActions.deleteNode(node.id)}
                    onTest={() => handleNodeTest(node.id)}
                  />
                </div>
              ))}
            </FlowCanvas>

            {/* Mini Map */}
            {showMiniMap && (
              <div className="absolute bottom-4 right-4 z-20">
                <CanvasMiniMap
                  nodes={flowState.nodes.map(n => ({
                    id: n.id,
                    position: n.position,
                    type: n.type,
                    color: n.appColor,
                  }))}
                  stickyNotes={stickyNotes}
                  viewport={{
                    x: flowState.viewport.x,
                    y: flowState.viewport.y,
                    width: 800,
                    height: 600,
                    zoom: flowState.viewport.zoom || 1,
                  }}
                  containerSize={{ width: 800, height: 600 }}
                  onViewportChange={(viewport) => flowActions.setViewport({ 
                    ...flowState.viewport, 
                    x: viewport.x, 
                    y: viewport.y 
                  })}
                  onNodeClick={(nodeId) => {
                    flowActions.selectNode(nodeId);
                    flowActions.centerOnNode(nodeId);
                  }}
                  className="shadow-lg"
                />
              </div>
            )}
          </div>

          {/* Right Config Panel - n8n-style wizard */}
          <ConfigPanelV2
            node={selectedNode}
            isOpen={configPanelOpen}
            onClose={() => setConfigPanelOpen(false)}
            onSave={handleNodeSave}
            onDelete={(id) => flowActions.deleteNode(id)}
            onTest={handleNodeTest}
          />

          {/* Execution Panel */}
          <ExecutionPanel
            isOpen={executionPanelOpen}
            onClose={() => setExecutionPanelOpen(false)}
            onNodeClick={(nodeId) => {
              flowActions.selectNode(nodeId);
              flowActions.centerOnNode(nodeId);
            }}
          />
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <ContextMenu
            isOpen={contextMenu.isOpen}
            position={contextMenu.position}
            items={getContextMenuItems()}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Quick Node Picker (for dropping connections on empty canvas) */}
        <QuickNodePicker
          isOpen={quickNodePicker?.isOpen || false}
          position={quickNodePicker?.position || { x: 0, y: 0 }}
          sourceNodeId={quickNodePicker?.sourceNodeId}
          sourceHandle={quickNodePicker?.sourceHandle}
          onSelect={handleQuickNodeSelect}
          onClose={() => setQuickNodePicker(null)}
        />

        {/* Add Node Picker (from context menu) */}
        <AddNodePicker
          isOpen={addNodePicker?.isOpen || false}
          position={addNodePicker?.position || { x: 0, y: 0 }}
          initialTab={addNodePicker?.initialTab || 'triggers'}
          onSelectTrigger={handleAddTrigger}
          onSelectAction={handleAddAction}
          onSelectLogic={handleAddLogic}
          onClose={() => setAddNodePicker(null)}
        />

        {/* Keyboard Shortcuts Dialog */}
        <Dialog open={shortcutsDialogOpen} onOpenChange={setShortcutsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-4">
              {SHORTCUT_CATEGORIES.map((category) => (
                <div key={category.name}>
                  <h4 className="font-semibold text-sm mb-3">{category.name}</h4>
                  <div className="space-y-2">
                    {category.shortcuts.map((shortcut, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, j) => (
                            <kbd
                              key={j}
                              className="px-2 py-0.5 bg-muted rounded text-xs font-mono"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Credentials Panel */}
        <Sheet open={credentialsPanelOpen} onOpenChange={setCredentialsPanelOpen}>
          <SheetContent side="right" className="w-[500px] sm:w-[600px] p-0">
            <CredentialManager
              credentials={credentialsApi.credentials}
              templates={[]}
              onCreateCredential={handleCreateCredential}
              onUpdateCredential={handleUpdateCredential}
              onDeleteCredential={handleDeleteCredential}
              onTestCredential={handleTestCredential}
            />
          </SheetContent>
        </Sheet>

        {/* Data Pinning Panel */}
        <Sheet open={dataPinningPanelOpen} onOpenChange={setDataPinningPanelOpen}>
          <SheetContent side="right" className="w-[500px] sm:w-[600px] p-0">
            <DataPinningPanel
              pinnedData={pinnedData}
              selectedNodeId={selectedNode?.id}
              onPinData={handlePinData}
              onUnpinData={handleUnpinData}
              onUpdatePinnedData={(nodeId, items) => {
                setPinnedData(prev => prev.map(p => 
                  p.nodeId === nodeId 
                    ? { ...p, items: items.map((item, idx) => ({ id: `item_${idx}`, json: item.json || item })) }
                    : p
                ));
              }}
              onClearAllPins={() => setPinnedData([])}
              onNodeSelect={(nodeId) => {
                flowActions.selectNode(nodeId);
                flowActions.centerOnNode(nodeId);
                setDataPinningPanelOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>

        {/* Templates Gallery */}
        <Dialog open={templatesGalleryOpen} onOpenChange={setTemplatesGalleryOpen}>
          <DialogContent className="max-w-5xl h-[80vh] p-0">
            <TemplatesGallery
              onImportTemplate={handleImportTemplate}
              onPreviewTemplate={(template) => {
                console.log('Preview template:', template);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

export default EnhancedWorkspace;
