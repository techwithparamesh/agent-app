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
// n8n uses 20px grid for visual pattern, 10px snap for precision
const GRID_SIZE = 20;
const SNAP_SIZE = 10;  // Node positions snap to 10px grid

/**
 * Snap a value to the nearest grid point
 * n8n snaps node positions to 10px increments
 */
export const snapToGrid = (value: number, gridSize: number = SNAP_SIZE): number => {
  return Math.round(value / gridSize) * gridSize;
};

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

  /**
   * n8n-style dotted grid pattern
   * - Subtle dots at 20px intervals
   * - Scales with zoom for consistent visual density
   * - Professional appearance with cross-pattern at intersections
   */
  const gridPattern = showGrid
    ? `radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)`
    : 'none';

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full overflow-hidden select-none",
          "bg-[hsl(var(--background))]",
          tool === 'pan' && "cursor-grab",
          isPanning && "cursor-grabbing",
          isDragOver && "ring-2 ring-primary/50 ring-inset",
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
        {/* Grid Background - n8n-style dotted pattern */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            backgroundImage: gridPattern,
            backgroundSize: `${GRID_SIZE * viewport.zoom}px ${GRID_SIZE * viewport.zoom}px`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px`,
            opacity: Math.min(1, viewport.zoom * 1.5), // Fade in as zoom increases
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

        {/* Top Toolbar - n8n style floating controls */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 px-1.5 py-1 bg-background/95 backdrop-blur-md border border-border/60 rounded-xl shadow-lg">
          {/* Tool selection */}
          <div className="flex items-center gap-0.5 pr-1.5 mr-1.5 border-r border-border/40">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'select' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => setTool('select')}
                >
                  <MousePointer2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Select (V)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'pan' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => setTool('pan')}
                >
                  <Hand className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Pan (Space)</TooltipContent>
            </Tooltip>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 pr-1.5 mr-1.5 border-r border-border/40">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Zoom Out</TooltipContent>
            </Tooltip>
            
            <Badge variant="secondary" className="min-w-[44px] h-6 justify-center font-mono text-[10px] rounded-md px-1.5">
              {Math.round(viewport.zoom * 100)}%
            </Badge>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Zoom In</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={handleFitView}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Fit View</TooltipContent>
            </Tooltip>
          </div>

          {/* View options */}
          <div className="flex items-center gap-0.5 pr-1.5 mr-1.5 border-r border-border/40">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Toggle Grid</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isLocked ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => setIsLocked(!isLocked)}
                >
                  {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{isLocked ? 'Unlock' : 'Lock'}</TooltipContent>
            </Tooltip>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Undo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Redo</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Minimap - n8n style compact */}
        <div className="absolute bottom-4 right-4 w-36 h-24 bg-background/90 backdrop-blur-md border border-border/60 rounded-lg z-20 overflow-hidden shadow-lg">
          <div className="w-full h-full p-1">
            <div className="w-full h-full bg-muted/20 rounded relative">
              {/* Viewport indicator */}
              <div 
                className="absolute border border-primary/60 bg-primary/10 rounded-sm transition-all duration-100"
                style={{
                  width: `${Math.min(100, 100 / viewport.zoom)}%`,
                  height: `${Math.min(100, 100 / viewport.zoom)}%`,
                  left: `${Math.max(0, Math.min(80, 50 - viewport.x / 20))}%`,
                  top: `${Math.max(0, Math.min(80, 50 - viewport.y / 15))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Coordinates - n8n style subtle */}
        <div className="absolute bottom-4 left-4 z-20 px-2 py-1 bg-background/80 backdrop-blur-sm border border-border/40 rounded-md text-[10px] font-mono text-muted-foreground">
          <span className="text-foreground/70">{Math.round(-viewport.x / viewport.zoom)}</span>
          <span className="mx-1 opacity-50">,</span>
          <span className="text-foreground/70">{Math.round(-viewport.y / viewport.zoom)}</span>
        </div>

        {/* Empty state - subtle hint when no children */}
        {React.Children.count(children) === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={cn(
              "text-center p-6 rounded-xl border-2 border-dashed transition-all duration-200",
              isDragOver 
                ? "border-primary/50 bg-primary/5 scale-[1.02]" 
                : "border-muted-foreground/15 bg-transparent"
            )}>
              <div className="w-12 h-12 rounded-xl bg-muted/50 mx-auto mb-3 flex items-center justify-center">
                <Crosshair className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground/70 max-w-[200px]">
                Drag apps here to build your flow
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
