/**
 * Flow State Management with Undo/Redo Support
 * 
 * A comprehensive state management system for the flow builder
 * that handles nodes, connections, selection, and history.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import type { FlowNode, Connection } from './types';

// ============================================
// TYPES
// ============================================

export interface FlowState {
  nodes: FlowNode[];
  connections: Connection[];
  selectedNodeIds: Set<string>;
  selectedConnectionIds: Set<string>;
  viewport: { x: number; y: number; zoom: number };
  isDirty: boolean;
}

export interface HistoryEntry {
  nodes: FlowNode[];
  connections: Connection[];
  timestamp: number;
  action: string;
}

export interface FlowActions {
  // Node operations
  addNode: (node: Omit<FlowNode, 'id'>, position?: { x: number; y: number }) => string;
  updateNode: (nodeId: string, updates: Partial<FlowNode>) => void;
  deleteNode: (nodeId: string) => void;
  deleteNodes: (nodeIds: string[]) => void;
  duplicateNode: (nodeId: string) => string | null;
  duplicateNodes: (nodeIds: string[]) => string[];
  moveNode: (nodeId: string, position: { x: number; y: number }) => void;
  moveNodes: (moves: Array<{ nodeId: string; position: { x: number; y: number } }>) => void;
  
  // Connection operations
  addConnection: (sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => string | null;
  deleteConnection: (connectionId: string) => void;
  deleteConnections: (connectionIds: string[]) => void;
  
  // Selection operations
  selectNode: (nodeId: string, addToSelection?: boolean) => void;
  selectNodes: (nodeIds: string[]) => void;
  selectConnection: (connectionId: string, addToSelection?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Viewport operations
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
  centerOnNode: (nodeId: string) => void;
  
  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Bulk operations
  clear: () => void;
  loadFlow: (nodes: FlowNode[], connections: Connection[]) => void;
  
  // Utility
  getNode: (nodeId: string) => FlowNode | undefined;
  getConnection: (connectionId: string) => Connection | undefined;
  getConnectedNodes: (nodeId: string) => FlowNode[];
  getIncomingConnections: (nodeId: string) => Connection[];
  getOutgoingConnections: (nodeId: string) => Connection[];
  validateConnection: (sourceId: string, targetId: string) => { valid: boolean; reason?: string };
}

// ============================================
// CONSTANTS
// ============================================

const MAX_HISTORY_SIZE = 50;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const GRID_SIZE = 20;

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateConnectionId = () => `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const snapToGrid = (value: number, gridSize: number = GRID_SIZE): number => {
  return Math.round(value / gridSize) * gridSize;
};

const cloneState = (nodes: FlowNode[], connections: Connection[]): { nodes: FlowNode[]; connections: Connection[] } => ({
  nodes: nodes.map(n => ({ ...n, config: { ...n.config }, position: { ...n.position } })),
  connections: connections.map(c => ({ ...c })),
});

// ============================================
// MAIN HOOK
// ============================================

export function useFlowState(
  initialNodes: FlowNode[] = [],
  initialConnections: Connection[] = []
): [FlowState, FlowActions] {
  // Core state
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<Set<string>>(new Set());
  const [viewport, setViewportState] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDirty, setIsDirty] = useState(false);

  // History for undo/redo
  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);

  // Push to history
  const pushHistory = useCallback((action: string) => {
    if (isUndoRedoRef.current) return;

    const entry: HistoryEntry = {
      nodes: nodes.map(n => ({ ...n, config: { ...n.config }, position: { ...n.position } })),
      connections: connections.map(c => ({ ...c })),
      timestamp: Date.now(),
      action,
    };

    // Remove any redo history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    
    // Add new entry
    historyRef.current.push(entry);
    historyIndexRef.current++;

    // Limit history size
    if (historyRef.current.length > MAX_HISTORY_SIZE) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }

    setIsDirty(true);
  }, [nodes, connections]);

  // ============================================
  // NODE OPERATIONS
  // ============================================

  const addNode = useCallback((nodeData: Omit<FlowNode, 'id'>, position?: { x: number; y: number }): string => {
    const id = generateId();
    const newNode: FlowNode = {
      ...nodeData,
      id,
      position: position ? {
        x: snapToGrid(position.x),
        y: snapToGrid(position.y),
      } : nodeData.position,
    };

    setNodes(prev => [...prev, newNode]);
    pushHistory(`Add ${nodeData.appName} node`);
    return id;
  }, [pushHistory]);

  const updateNode = useCallback((nodeId: string, updates: Partial<FlowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
    pushHistory('Update node');
  }, [pushHistory]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.sourceId !== nodeId && c.targetId !== nodeId));
    setSelectedNodeIds(prev => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
    pushHistory('Delete node');
  }, [pushHistory]);

  const deleteNodes = useCallback((nodeIds: string[]) => {
    const nodeIdSet = new Set(nodeIds);
    setNodes(prev => prev.filter(n => !nodeIdSet.has(n.id)));
    setConnections(prev => prev.filter(c => !nodeIdSet.has(c.sourceId) && !nodeIdSet.has(c.targetId)));
    setSelectedNodeIds(prev => {
      const next = new Set(prev);
      nodeIds.forEach(id => next.delete(id));
      return next;
    });
    pushHistory(`Delete ${nodeIds.length} nodes`);
  }, [pushHistory]);

  const duplicateNode = useCallback((nodeId: string): string | null => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const newId = generateId();
    const newNode: FlowNode = {
      ...node,
      id: newId,
      position: {
        x: node.position.x + 40,
        y: node.position.y + 40,
      },
      config: { ...node.config },
      status: 'incomplete',
    };

    setNodes(prev => [...prev, newNode]);
    pushHistory(`Duplicate ${node.appName}`);
    return newId;
  }, [nodes, pushHistory]);

  const duplicateNodes = useCallback((nodeIds: string[]): string[] => {
    const newIds: string[] = [];
    const idMap = new Map<string, string>();

    // First, create all duplicated nodes
    const newNodes: FlowNode[] = [];
    nodeIds.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        const newId = generateId();
        idMap.set(nodeId, newId);
        newIds.push(newId);
        newNodes.push({
          ...node,
          id: newId,
          position: {
            x: node.position.x + 40,
            y: node.position.y + 40,
          },
          config: { ...node.config },
          status: 'incomplete',
        });
      }
    });

    // Then, duplicate connections between the selected nodes
    const newConnections: Connection[] = [];
    connections.forEach(conn => {
      if (idMap.has(conn.sourceId) && idMap.has(conn.targetId)) {
        newConnections.push({
          ...conn,
          id: generateConnectionId(),
          sourceId: idMap.get(conn.sourceId)!,
          targetId: idMap.get(conn.targetId)!,
        });
      }
    });

    setNodes(prev => [...prev, ...newNodes]);
    setConnections(prev => [...prev, ...newConnections]);
    pushHistory(`Duplicate ${nodeIds.length} nodes`);
    
    return newIds;
  }, [nodes, connections, pushHistory]);

  const moveNode = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prev => prev.map(node =>
      node.id === nodeId
        ? { ...node, position: { x: snapToGrid(position.x), y: snapToGrid(position.y) } }
        : node
    ));
  }, []);

  const moveNodes = useCallback((moves: Array<{ nodeId: string; position: { x: number; y: number } }>) => {
    setNodes(prev => {
      const moveMap = new Map(moves.map(m => [m.nodeId, m.position]));
      return prev.map(node => {
        const newPos = moveMap.get(node.id);
        return newPos
          ? { ...node, position: { x: snapToGrid(newPos.x), y: snapToGrid(newPos.y) } }
          : node;
      });
    });
  }, []);

  // ============================================
  // CONNECTION OPERATIONS
  // ============================================

  const validateConnection = useCallback((sourceId: string, targetId: string): { valid: boolean; reason?: string } => {
    // Can't connect to self
    if (sourceId === targetId) {
      return { valid: false, reason: "Cannot connect a node to itself" };
    }

    // Check if connection already exists
    const exists = connections.some(c => c.sourceId === sourceId && c.targetId === targetId);
    if (exists) {
      return { valid: false, reason: "Connection already exists" };
    }

    // Check for circular connections
    const visited = new Set<string>();
    const checkCycle = (nodeId: string): boolean => {
      if (nodeId === sourceId) return true;
      if (visited.has(nodeId)) return false;
      visited.add(nodeId);
      
      const outgoing = connections.filter(c => c.sourceId === nodeId);
      return outgoing.some(c => checkCycle(c.targetId));
    };

    if (checkCycle(targetId)) {
      return { valid: false, reason: "Would create a circular connection" };
    }

    // Get source and target nodes
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);

    if (!sourceNode || !targetNode) {
      return { valid: false, reason: "Invalid nodes" };
    }

    // Triggers can only be sources, not targets
    if (sourceNode.type === 'trigger' && targetNode.type === 'trigger') {
      return { valid: false, reason: "Cannot connect two triggers" };
    }

    return { valid: true };
  }, [connections, nodes]);

  const addConnection = useCallback((
    sourceId: string,
    targetId: string,
    sourceHandle?: string,
    targetHandle?: string
  ): string | null => {
    const validation = validateConnection(sourceId, targetId);
    if (!validation.valid) {
      console.warn('Invalid connection:', validation.reason);
      return null;
    }

    const id = generateConnectionId();
    const newConnection: Connection = {
      id,
      sourceId,
      targetId,
      sourceHandle,
      targetHandle,
      type: 'default',
      animated: true,
    };

    setConnections(prev => [...prev, newConnection]);
    pushHistory('Add connection');
    return id;
  }, [validateConnection, pushHistory]);

  const deleteConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
    setSelectedConnectionIds(prev => {
      const next = new Set(prev);
      next.delete(connectionId);
      return next;
    });
    pushHistory('Delete connection');
  }, [pushHistory]);

  const deleteConnections = useCallback((connectionIds: string[]) => {
    const idSet = new Set(connectionIds);
    setConnections(prev => prev.filter(c => !idSet.has(c.id)));
    setSelectedConnectionIds(prev => {
      const next = new Set(prev);
      connectionIds.forEach(id => next.delete(id));
      return next;
    });
    pushHistory(`Delete ${connectionIds.length} connections`);
  }, [pushHistory]);

  // ============================================
  // SELECTION OPERATIONS
  // ============================================

  const selectNode = useCallback((nodeId: string, addToSelection = false) => {
    setSelectedConnectionIds(new Set());
    setSelectedNodeIds(prev => {
      if (addToSelection) {
        const next = new Set(prev);
        if (next.has(nodeId)) {
          next.delete(nodeId);
        } else {
          next.add(nodeId);
        }
        return next;
      }
      return new Set([nodeId]);
    });
  }, []);

  const selectNodes = useCallback((nodeIds: string[]) => {
    setSelectedConnectionIds(new Set());
    setSelectedNodeIds(new Set(nodeIds));
  }, []);

  const selectConnection = useCallback((connectionId: string, addToSelection = false) => {
    setSelectedNodeIds(new Set());
    setSelectedConnectionIds(prev => {
      if (addToSelection) {
        const next = new Set(prev);
        if (next.has(connectionId)) {
          next.delete(connectionId);
        } else {
          next.add(connectionId);
        }
        return next;
      }
      return new Set([connectionId]);
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedNodeIds(new Set(nodes.map(n => n.id)));
    setSelectedConnectionIds(new Set(connections.map(c => c.id)));
  }, [nodes, connections]);

  const clearSelection = useCallback(() => {
    setSelectedNodeIds(new Set());
    setSelectedConnectionIds(new Set());
  }, []);

  // ============================================
  // VIEWPORT OPERATIONS
  // ============================================

  const setViewport = useCallback((newViewport: { x: number; y: number; zoom: number }) => {
    setViewportState({
      x: newViewport.x,
      y: newViewport.y,
      zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newViewport.zoom)),
    });
  }, []);

  const zoomIn = useCallback(() => {
    setViewportState(prev => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, prev.zoom + ZOOM_STEP),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewportState(prev => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, prev.zoom - ZOOM_STEP),
    }));
  }, []);

  const fitView = useCallback(() => {
    if (nodes.length === 0) {
      setViewportState({ x: 0, y: 0, zoom: 1 });
      return;
    }

    // Calculate bounding box of all nodes
    const padding = 100;
    const minX = Math.min(...nodes.map(n => n.position.x)) - padding;
    const maxX = Math.max(...nodes.map(n => n.position.x + 280)) + padding;
    const minY = Math.min(...nodes.map(n => n.position.y)) - padding;
    const maxY = Math.max(...nodes.map(n => n.position.y + 150)) + padding;

    const width = maxX - minX;
    const height = maxY - minY;

    // Assuming canvas size of 1200x800 (will be adjusted in real implementation)
    const canvasWidth = 1200;
    const canvasHeight = 800;

    const zoomX = canvasWidth / width;
    const zoomY = canvasHeight / height;
    const zoom = Math.min(zoomX, zoomY, 1);

    setViewportState({
      x: -minX * zoom + (canvasWidth - width * zoom) / 2,
      y: -minY * zoom + (canvasHeight - height * zoom) / 2,
      zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)),
    });
  }, [nodes]);

  const centerOnNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Center the viewport on the node
    const canvasWidth = 1200;
    const canvasHeight = 800;

    setViewportState(prev => ({
      ...prev,
      x: canvasWidth / 2 - node.position.x - 140,
      y: canvasHeight / 2 - node.position.y - 75,
    }));
  }, [nodes]);

  // ============================================
  // HISTORY OPERATIONS
  // ============================================

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;

    isUndoRedoRef.current = true;
    historyIndexRef.current--;
    const entry = historyRef.current[historyIndexRef.current];
    
    if (entry) {
      setNodes(entry.nodes.map(n => ({ ...n })));
      setConnections(entry.connections.map(c => ({ ...c })));
    }
    
    isUndoRedoRef.current = false;
    setIsDirty(true);
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;

    isUndoRedoRef.current = true;
    historyIndexRef.current++;
    const entry = historyRef.current[historyIndexRef.current];
    
    if (entry) {
      setNodes(entry.nodes.map(n => ({ ...n })));
      setConnections(entry.connections.map(c => ({ ...c })));
    }
    
    isUndoRedoRef.current = false;
    setIsDirty(true);
  }, []);

  const canUndo = useCallback(() => historyIndexRef.current > 0, []);
  const canRedo = useCallback(() => historyIndexRef.current < historyRef.current.length - 1, []);

  // ============================================
  // BULK OPERATIONS
  // ============================================

  const clear = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeIds(new Set());
    setSelectedConnectionIds(new Set());
    historyRef.current = [];
    historyIndexRef.current = -1;
    setIsDirty(false);
  }, []);

  const loadFlow = useCallback((newNodes: FlowNode[], newConnections: Connection[]) => {
    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNodeIds(new Set());
    setSelectedConnectionIds(new Set());
    historyRef.current = [{
      nodes: cloneState(newNodes, newConnections).nodes,
      connections: cloneState(newNodes, newConnections).connections,
      timestamp: Date.now(),
      action: 'Load flow',
    }];
    historyIndexRef.current = 0;
    setIsDirty(false);
  }, []);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const getNode = useCallback((nodeId: string) => nodes.find(n => n.id === nodeId), [nodes]);
  const getConnection = useCallback((connectionId: string) => connections.find(c => c.id === connectionId), [connections]);

  const getConnectedNodes = useCallback((nodeId: string): FlowNode[] => {
    const connectedIds = new Set<string>();
    connections.forEach(c => {
      if (c.sourceId === nodeId) connectedIds.add(c.targetId);
      if (c.targetId === nodeId) connectedIds.add(c.sourceId);
    });
    return nodes.filter(n => connectedIds.has(n.id));
  }, [nodes, connections]);

  const getIncomingConnections = useCallback((nodeId: string): Connection[] => {
    return connections.filter(c => c.targetId === nodeId);
  }, [connections]);

  const getOutgoingConnections = useCallback((nodeId: string): Connection[] => {
    return connections.filter(c => c.sourceId === nodeId);
  }, [connections]);

  // ============================================
  // COMPOSE STATE AND ACTIONS
  // ============================================

  const state: FlowState = useMemo(() => ({
    nodes,
    connections,
    selectedNodeIds,
    selectedConnectionIds,
    viewport,
    isDirty,
  }), [nodes, connections, selectedNodeIds, selectedConnectionIds, viewport, isDirty]);

  const actions: FlowActions = useMemo(() => ({
    addNode,
    updateNode,
    deleteNode,
    deleteNodes,
    duplicateNode,
    duplicateNodes,
    moveNode,
    moveNodes,
    addConnection,
    deleteConnection,
    deleteConnections,
    selectNode,
    selectNodes,
    selectConnection,
    selectAll,
    clearSelection,
    setViewport,
    zoomIn,
    zoomOut,
    fitView,
    centerOnNode,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
    loadFlow,
    getNode,
    getConnection,
    getConnectedNodes,
    getIncomingConnections,
    getOutgoingConnections,
    validateConnection,
  }), [
    addNode, updateNode, deleteNode, deleteNodes, duplicateNode, duplicateNodes,
    moveNode, moveNodes, addConnection, deleteConnection, deleteConnections,
    selectNode, selectNodes, selectConnection, selectAll, clearSelection,
    setViewport, zoomIn, zoomOut, fitView, centerOnNode,
    undo, redo, canUndo, canRedo, clear, loadFlow,
    getNode, getConnection, getConnectedNodes, getIncomingConnections, getOutgoingConnections,
    validateConnection,
  ]);

  return [state, actions];
}

export default useFlowState;
