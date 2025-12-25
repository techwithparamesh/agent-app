/**
 * Canvas Mini Map Component
 * 
 * A bird's-eye view of the entire workflow canvas.
 * Shows node positions and allows quick navigation.
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Map,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import type { FlowNode } from './types';
import type { StickyNoteData } from './StickyNote';

// ============================================
// TYPES
// ============================================

export interface MiniMapNode {
  id: string;
  position: { x: number; y: number };
  type?: string;
  status?: string;
  color?: string;
}

export interface MiniMapViewport {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export interface CanvasMiniMapProps {
  nodes: FlowNode[] | MiniMapNode[];
  stickyNotes?: StickyNoteData[];
  viewport: MiniMapViewport;
  containerSize: { width: number; height: number };
  onViewportChange?: (viewport: { x: number; y: number }) => void;
  onNodeClick?: (nodeId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 140;
const MINIMAP_PADDING = 20;
const NODE_SIZE = 8;
const STICKY_SIZE = 6;

// Node type colors for mini map
const nodeTypeColors: Record<string, string> = {
  trigger: '#22c55e',      // green
  action: '#3b82f6',       // blue
  condition: '#f59e0b',    // amber
  loop: '#8b5cf6',         // purple
  ai: '#ec4899',           // pink
  webhook: '#06b6d4',      // cyan
  default: '#6b7280',      // gray
};

// Status colors
const statusColors: Record<string, string> = {
  success: '#22c55e',
  error: '#ef4444',
  running: '#3b82f6',
  idle: '#6b7280',
};

// ============================================
// COMPONENT
// ============================================

export function CanvasMiniMap({
  nodes,
  stickyNotes = [],
  viewport,
  containerSize,
  onViewportChange,
  onNodeClick,
  isCollapsed = false,
  onToggleCollapse,
  position = 'bottom-right',
  className,
}: CanvasMiniMapProps) {
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHoveredNodeId, setIsHoveredNodeId] = useState<string | null>(null);

  // Calculate bounds of all elements
  const bounds = useMemo(() => {
    if (nodes.length === 0 && stickyNotes.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 800, width: 1000, height: 800 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Include nodes
    nodes.forEach((node) => {
      const x = node.position.x;
      const y = node.position.y;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + 200); // Approximate node width
      maxY = Math.max(maxY, y + 100); // Approximate node height
    });

    // Include sticky notes
    stickyNotes.forEach((note) => {
      minX = Math.min(minX, note.position.x);
      minY = Math.min(minY, note.position.y);
      maxX = Math.max(maxX, note.position.x + note.size.width);
      maxY = Math.max(maxY, note.position.y + note.size.height);
    });

    // Add padding
    minX -= MINIMAP_PADDING * 10;
    minY -= MINIMAP_PADDING * 10;
    maxX += MINIMAP_PADDING * 10;
    maxY += MINIMAP_PADDING * 10;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [nodes, stickyNotes]);

  // Calculate scale to fit content in mini map
  const scale = useMemo(() => {
    const scaleX = (MINIMAP_WIDTH - MINIMAP_PADDING * 2) / bounds.width;
    const scaleY = (MINIMAP_HEIGHT - MINIMAP_PADDING * 2) / bounds.height;
    return Math.min(scaleX, scaleY, 0.2);
  }, [bounds]);

  // Transform canvas coordinates to mini map coordinates
  const toMiniMapCoords = useCallback((x: number, y: number) => {
    return {
      x: (x - bounds.minX) * scale + MINIMAP_PADDING,
      y: (y - bounds.minY) * scale + MINIMAP_PADDING,
    };
  }, [bounds, scale]);

  // Calculate viewport rectangle on mini map
  const viewportRect = useMemo(() => {
    const visibleWidth = containerSize.width / viewport.zoom;
    const visibleHeight = containerSize.height / viewport.zoom;
    const visibleX = -viewport.x / viewport.zoom;
    const visibleY = -viewport.y / viewport.zoom;

    const topLeft = toMiniMapCoords(visibleX, visibleY);
    
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: visibleWidth * scale,
      height: visibleHeight * scale,
    };
  }, [viewport, containerSize, scale, toMiniMapCoords]);

  // Handle click to navigate
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!miniMapRef.current) return;

    const rect = miniMapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert mini map click to canvas coordinates
    const canvasX = (clickX - MINIMAP_PADDING) / scale + bounds.minX;
    const canvasY = (clickY - MINIMAP_PADDING) / scale + bounds.minY;

    // Center viewport on clicked position
    const newX = -(canvasX - containerSize.width / viewport.zoom / 2) * viewport.zoom;
    const newY = -(canvasY - containerSize.height / viewport.zoom / 2) * viewport.zoom;

    onViewportChange?.({ x: newX, y: newY });
  }, [scale, bounds, containerSize, viewport.zoom, onViewportChange]);

  // Handle viewport drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - dragStart.x) / scale;
      const deltaY = (e.clientY - dragStart.y) / scale;

      const newX = viewport.x - deltaX * viewport.zoom;
      const newY = viewport.y - deltaY * viewport.zoom;

      setDragStart({ x: e.clientX, y: e.clientY });
      onViewportChange?.({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, scale, viewport, onViewportChange]);

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  // Collapsed state
  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                'absolute z-50 shadow-md',
                positionClasses[position],
                className
              )}
              onClick={onToggleCollapse}
            >
              <Map className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Show Mini Map</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      ref={miniMapRef}
      className={cn(
        'absolute z-50 rounded-lg border bg-background/95 backdrop-blur shadow-lg overflow-hidden',
        positionClasses[position],
        isDragging && 'cursor-grabbing',
        className
      )}
      style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 border-b bg-muted/50">
        <span className="text-xs font-medium text-muted-foreground">Mini Map</span>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={onToggleCollapse}
                >
                  <Minimize2 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Collapse</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Map Canvas */}
      <svg
        width="100%"
        height={MINIMAP_HEIGHT - 24}
        className="cursor-pointer"
        onClick={handleClick}
      >
        {/* Background grid pattern */}
        <defs>
          <pattern
            id="minimap-grid"
            width={10}
            height={10}
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.5" fill="currentColor" className="text-muted-foreground/20" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#minimap-grid)" />

        {/* Render sticky notes */}
        {stickyNotes.map((note) => {
          const coords = toMiniMapCoords(note.position.x, note.position.y);
          const stickyColors: Record<string, string> = {
            yellow: '#fbbf24',
            green: '#22c55e',
            blue: '#3b82f6',
            pink: '#ec4899',
            purple: '#8b5cf6',
            orange: '#f97316',
          };
          return (
            <rect
              key={`sticky-${note.id}`}
              x={coords.x}
              y={coords.y}
              width={Math.max(note.size.width * scale, STICKY_SIZE)}
              height={Math.max(note.size.height * scale, STICKY_SIZE)}
              fill={stickyColors[note.color] || '#fbbf24'}
              opacity={0.6}
              rx={1}
            />
          );
        })}

        {/* Render nodes */}
        {nodes.map((node) => {
          const coords = toMiniMapCoords(node.position.x, node.position.y);
          const nodeType = 'type' in node ? node.type : 'default';
          const nodeStatus = 'status' in node ? node.status : 'idle';
          const color = nodeTypeColors[nodeType || 'default'] || nodeTypeColors.default;
          const isHovered = isHoveredNodeId === node.id;
          
          return (
            <g key={node.id}>
              {/* Node dot */}
              <circle
                cx={coords.x + NODE_SIZE / 2}
                cy={coords.y + NODE_SIZE / 2}
                r={isHovered ? NODE_SIZE : NODE_SIZE / 1.5}
                fill={color}
                stroke={isHovered ? '#fff' : 'none'}
                strokeWidth={1}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setIsHoveredNodeId(node.id)}
                onMouseLeave={() => setIsHoveredNodeId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick?.(node.id);
                }}
              />
              {/* Status indicator */}
              {nodeStatus && nodeStatus !== 'idle' && (
                <circle
                  cx={coords.x + NODE_SIZE}
                  cy={coords.y}
                  r={2}
                  fill={statusColors[nodeStatus] || statusColors.idle}
                />
              )}
            </g>
          );
        })}

        {/* Viewport rectangle */}
        <rect
          x={viewportRect.x}
          y={viewportRect.y}
          width={Math.max(viewportRect.width, 20)}
          height={Math.max(viewportRect.height, 15)}
          fill="hsl(var(--primary) / 0.1)"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          rx={2}
          className={cn(
            'cursor-grab transition-opacity',
            isDragging && 'cursor-grabbing opacity-70'
          )}
          onMouseDown={handleMouseDown}
        />
      </svg>

      {/* Zoom indicator */}
      <div className="absolute bottom-1 right-2 text-[10px] text-muted-foreground">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
}

export default CanvasMiniMap;
