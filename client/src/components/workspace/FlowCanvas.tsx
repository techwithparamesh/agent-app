/**
 * Enhanced Flow Canvas Component
 * 
 * A professional-grade canvas with smooth zoom/pan, grid snapping,
 * selection box, and n8n-like interactions.
 */

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  MousePointer2,
  Undo2,
  Redo2,
  Lock,
  Unlock,
  Grid3X3,
  Hand,
  Crosshair,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ============================================
// TYPES
// ============================================

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface FlowCanvasProps {
  children: React.ReactNode;
  viewport: CanvasViewport;
  onViewportChange: (viewport: CanvasViewport) => void;
  onSelectionBox?: (box: SelectionBox | null) => void;
  onCanvasClick?: (position: { x: number; y: number }) => void;
  onCanvasContextMenu?: (e: React.MouseEvent, position: { x: number; y: number }) => void;
  onDrop?: (data: any, position: { x: number; y: number }) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  className?: string;
}

export interface FlowCanvasRef {
  screenToCanvas: (screenX: number, screenY: number) => { x: number; y: number };
  canvasToScreen: (canvasX: number, canvasY: number) => { x: number; y: number };
  getViewport: () => CanvasViewport;
}

// ============================================
// CONSTANTS
// ============================================

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2;
const ZOOM_SENSITIVITY = 0.001;
const GRID_SIZE = 20;
const SNAP_THRESHOLD = 10;

// ============================================
// COMPONENT
// ============================================

export const FlowCanvas = forwardRef<FlowCanvasRef, FlowCanvasProps>(({
  children,
  viewport,
  onViewportChange,
  onSelectionBox,
  onCanvasClick,
  onCanvasContextMenu,
  onDrop,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  className,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Interaction state
  const [tool, setTool] = useState<'select' | 'pan'>('select');
  const [isPanning, setIsPanning] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Drag state refs
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // ============================================
  // COORDINATE TRANSFORMS
  // ============================================

  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    return {
      x: (screenX - rect.left - viewport.x) / viewport.zoom,
      y: (screenY - rect.top - viewport.y) / viewport.zoom,
    };
  }, [viewport]);

  const canvasToScreen = useCallback((canvasX: number, canvasY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    return {
      x: canvasX * viewport.zoom + viewport.x + rect.left,
      y: canvasY * viewport.zoom + viewport.y + rect.top,
    };
  }, [viewport]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    screenToCanvas,
    canvasToScreen,
    getViewport: () => viewport,
  }), [screenToCanvas, canvasToScreen, viewport]);

  // ============================================
  // ZOOM CONTROLS
  // ============================================

  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    if (isLocked) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Default center to canvas center
    const cx = centerX ?? rect.width / 2;
    const cy = centerY ?? rect.height / 2;

    // Calculate new zoom
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewport.zoom * (1 + delta)));

    // Adjust pan to zoom toward cursor
    const scale = newZoom / viewport.zoom;
    const newX = cx - (cx - viewport.x) * scale;
    const newY = cy - (cy - viewport.y) * scale;

    onViewportChange({ x: newX, y: newY, zoom: newZoom });
  }, [viewport, onViewportChange, isLocked]);

  const handleZoomIn = useCallback(() => handleZoom(0.2), [handleZoom]);
  const handleZoomOut = useCallback(() => handleZoom(-0.2), [handleZoom]);
  
  const handleFitView = useCallback(() => {
    onViewportChange({ x: 0, y: 0, zoom: 1 });
  }, [onViewportChange]);

  // ============================================
  // MOUSE HANDLERS
  // ============================================

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isLocked) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    dragStartRef.current = { x: mouseX, y: mouseY };
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    // Middle mouse button or space+click = pan
    if (e.button === 1 || (e.button === 0 && tool === 'pan')) {
      e.preventDefault();
      setIsPanning(true);
      return;
    }

    // Left click on canvas = selection box
    if (e.button === 0 && tool === 'select' && e.target === canvasRef.current) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setIsSelecting(true);
      setSelectionBox({
        startX: canvasPos.x,
        startY: canvasPos.y,
        endX: canvasPos.x,
        endY: canvasPos.y,
      });
    }
  }, [tool, isLocked, screenToCanvas]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isLocked) return;

    // Pan
    if (isPanning) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };

      onViewportChange({
        ...viewport,
        x: viewport.x + dx,
        y: viewport.y + dy,
      });
      return;
    }

    // Selection box
    if (isSelecting && selectionBox) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const newBox = {
        ...selectionBox,
        endX: canvasPos.x,
        endY: canvasPos.y,
      };
      setSelectionBox(newBox);
      onSelectionBox?.(newBox);
    }
  }, [isPanning, isSelecting, selectionBox, viewport, onViewportChange, screenToCanvas, isLocked, onSelectionBox]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (isSelecting) {
      setIsSelecting(false);
      onSelectionBox?.(null);
      setSelectionBox(null);
    }

    // Click on canvas background
    if (e.target === canvasRef.current && !isPanning && !isSelecting) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      onCanvasClick?.(canvasPos);
    }
  }, [isPanning, isSelecting, screenToCanvas, onCanvasClick, onSelectionBox]);

  const handleMouseLeave = useCallback(() => {
    if (isPanning) setIsPanning(false);
    if (isSelecting) {
      setIsSelecting(false);
      setSelectionBox(null);
      onSelectionBox?.(null);
    }
  }, [isPanning, isSelecting, onSelectionBox]);

  // ============================================
  // WHEEL HANDLER (ZOOM)
  // ============================================

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (isLocked) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Ctrl/Cmd + wheel = zoom
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * ZOOM_SENSITIVITY * 2;
      handleZoom(delta, e.clientX - rect.left, e.clientY - rect.top);
    } else {
      // Regular wheel = pan
      onViewportChange({
        ...viewport,
        x: viewport.x - e.deltaX,
        y: viewport.y - e.deltaY,
      });
    }
  }, [viewport, onViewportChange, handleZoom, isLocked]);

  // ============================================
  // CONTEXT MENU
  // ============================================

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    onCanvasContextMenu?.(e, canvasPos);
  }, [screenToCanvas, onCanvasContextMenu]);

  // ============================================
  // DRAG & DROP
  // ============================================

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set false if leaving the container
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      
      // Snap to grid
      const snappedPos = {
        x: Math.round(canvasPos.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(canvasPos.y / GRID_SIZE) * GRID_SIZE,
      };
      
      onDrop?.(data, snappedPos);
    } catch (err) {
      console.error('Drop error:', err);
    }
  }, [screenToCanvas, onDrop]);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space = temporary pan mode
      if (e.code === 'Space' && !e.repeat) {
        setTool('pan');
      }

      // Ctrl/Cmd + Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
      }

      // Ctrl/Cmd + Shift + Z or Ctrl + Y = Redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        onRedo?.();
      }

      // + / = = Zoom in
      if ((e.key === '+' || e.key === '=') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleZoomIn();
      }

      // - = Zoom out
      if (e.key === '-' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleZoomOut();
      }

      // 0 = Reset zoom
      if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleFitView();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onUndo, onRedo, handleZoomIn, handleZoomOut, handleFitView]);

  // ============================================
  // RENDER
  // ============================================

  const gridPattern = showGrid ? `
    radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)
  ` : 'none';

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full overflow-hidden bg-background select-none",
          tool === 'pan' && "cursor-grab",
          isPanning && "cursor-grabbing",
          isDragOver && "ring-2 ring-primary ring-inset",
          className
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: gridPattern,
            backgroundSize: `${GRID_SIZE * viewport.zoom}px ${GRID_SIZE * viewport.zoom}px`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px`,
            opacity: Math.min(1, viewport.zoom),
          }}
        />

        {/* Canvas Content */}
        <div
          ref={canvasRef}
          className="absolute inset-0"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {children}
        </div>

        {/* Selection Box */}
        {selectionBox && (
          <div
            className="absolute border-2 border-primary bg-primary/10 pointer-events-none z-50"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.endX) * viewport.zoom + viewport.x,
              top: Math.min(selectionBox.startY, selectionBox.endY) * viewport.zoom + viewport.y,
              width: Math.abs(selectionBox.endX - selectionBox.startX) * viewport.zoom,
              height: Math.abs(selectionBox.endY - selectionBox.startY) * viewport.zoom,
            }}
          />
        )}

        {/* Top Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-1.5 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg">
          {/* Tool selection */}
          <div className="flex items-center gap-0.5 pr-2 border-r">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'select' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setTool('select')}
                >
                  <MousePointer2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Select (V)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'pan' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setTool('pan')}
                >
                  <Hand className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pan (Hold Space)</TooltipContent>
            </Tooltip>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 px-2 border-r">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out (Ctrl+-)</TooltipContent>
            </Tooltip>
            
            <Badge variant="secondary" className="min-w-[50px] justify-center font-mono text-xs">
              {Math.round(viewport.zoom * 100)}%
            </Badge>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In (Ctrl++)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleFitView}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fit View (Ctrl+0)</TooltipContent>
            </Tooltip>
          </div>

          {/* View options */}
          <div className="flex items-center gap-0.5 px-2 border-r">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Grid</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isLocked ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsLocked(!isLocked)}
                >
                  {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isLocked ? 'Unlock Canvas' : 'Lock Canvas'}</TooltipContent>
            </Tooltip>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Minimap */}
        <div className="absolute bottom-4 right-4 w-40 h-28 bg-background/90 backdrop-blur-sm border rounded-lg z-20 overflow-hidden shadow-lg">
          <div className="w-full h-full p-1.5">
            <div className="w-full h-full bg-muted/30 rounded relative">
              {/* Viewport indicator */}
              <div 
                className="absolute border-2 border-primary bg-primary/20 rounded transition-all duration-75"
                style={{
                  width: `${Math.min(100, 100 / viewport.zoom)}%`,
                  height: `${Math.min(100, 100 / viewport.zoom)}%`,
                  left: `${Math.max(0, Math.min(80, 50 - viewport.x / 20))}%`,
                  top: `${Math.max(0, Math.min(80, 50 - viewport.y / 15))}%`,
                }}
              />
              {/* Node indicators */}
              <div className="absolute inset-0 p-1">
                {/* Will be populated with node dots */}
              </div>
            </div>
          </div>
        </div>

        {/* Coordinates */}
        <div className="absolute bottom-4 left-4 z-20 px-2 py-1 bg-background/90 backdrop-blur-sm border rounded text-xs font-mono text-muted-foreground shadow-lg">
          <span className="text-primary">{Math.round(-viewport.x / viewport.zoom)}</span>
          <span className="mx-1">,</span>
          <span className="text-primary">{Math.round(-viewport.y / viewport.zoom)}</span>
        </div>

        {/* Empty state */}
        {React.Children.count(children) === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={cn(
              "text-center p-8 rounded-2xl border-2 border-dashed transition-all duration-200",
              isDragOver 
                ? "border-primary bg-primary/5 scale-105" 
                : "border-muted-foreground/20"
            )}>
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Crosshair className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Building Your Flow</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Drag an app from the left panel or double-click to add your first node
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
});

FlowCanvas.displayName = 'FlowCanvas';

export default FlowCanvas;
