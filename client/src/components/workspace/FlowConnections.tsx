/**
 * Bezier Curve Connections Component
 * 
 * Renders smooth, animated bezier curves between nodes
 * with hover states, selection, and polished aesthetics.
 */

import React, { useMemo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import type { FlowNode, Connection } from "./types";

// ============================================
// TYPES
// ============================================

export interface ConnectionPoint {
  x: number;
  y: number;
}

export interface FlowConnectionsProps {
  nodes: FlowNode[];
  connections: Connection[];
  selectedConnectionIds: Set<string>;
  onConnectionClick?: (connectionId: string, e: React.MouseEvent) => void;
  onConnectionContextMenu?: (connectionId: string, e: React.MouseEvent) => void;
  onConnectionDelete?: (connectionId: string) => void;
  pendingConnection?: {
    sourceId: string;
    sourceHandle?: string;
    mousePosition: { x: number; y: number };
  } | null;
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

// 240px fixed width, horizontal flow (left-to-right)
const NODE_WIDTH = 240;
const NODE_HEIGHT = 100; // Approximate height for calculations
const HANDLE_OFFSET = 7;  // Handle protrusion from node edge
const CURVE_OFFSET = 60;  // Bezier curve control point offset
const STROKE_WIDTH = 2;
const STROKE_WIDTH_HOVER = 3;
const HIT_AREA_WIDTH = 20;

// Connection colors by type (increased opacity for visibility)
const CONNECTION_COLORS = {
  default: 'hsl(var(--muted-foreground) / 0.65)',
  hover: 'hsl(var(--primary) / 0.85)',
  selected: 'hsl(var(--primary))',
  success: 'hsl(142 76% 45% / 0.85)',
  error: 'hsl(var(--destructive))',
  warning: 'hsl(38 92% 50% / 0.85)',
  disabled: 'hsl(var(--muted-foreground) / 0.40)',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the output position of a node (RIGHT side, vertically centered)
 * n8n style: outputs on the right edge
 */
const getNodeOutputPosition = (node: FlowNode): ConnectionPoint => ({
  x: node.position.x + NODE_WIDTH + HANDLE_OFFSET,
  y: node.position.y + NODE_HEIGHT / 2,
});

/**
 * Get the input position of a node (LEFT side, vertically centered)
 * n8n style: inputs on the left edge
 */
const getNodeInputPosition = (node: FlowNode): ConnectionPoint => ({
  x: node.position.x - HANDLE_OFFSET,
  y: node.position.y + NODE_HEIGHT / 2,
});

/**
 * Get specific handle position for condition nodes (multiple outputs on right)
 * n8n style: Yes/No outputs stacked vertically on right side
 */
const getHandlePosition = (node: FlowNode, handle?: string): ConnectionPoint => {
  if (node.type === 'condition') {
    if (handle === 'true') {
      return {
        x: node.position.x + NODE_WIDTH + HANDLE_OFFSET,
        y: node.position.y + NODE_HEIGHT / 3,  // Upper third
      };
    }
    if (handle === 'false') {
      return {
        x: node.position.x + NODE_WIDTH + HANDLE_OFFSET,
        y: node.position.y + (NODE_HEIGHT * 2) / 3,  // Lower third
      };
    }
  }
  return getNodeOutputPosition(node);
};

/**
 * Generate a smooth bezier curve path
 * n8n style: horizontal flow (left-to-right) is the default
 */
const generateBezierPath = (
  start: ConnectionPoint,
  end: ConnectionPoint,
  isHorizontal: boolean = true  // n8n default: horizontal flow
): string => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  if (isHorizontal) {
    // Horizontal flow (left to right) - n8n default
    const curveOffset = Math.min(Math.max(Math.abs(dx) / 2, 40), CURVE_OFFSET);
    
    // If going backwards (right to left), create a loop-around curve
    if (dx < 50) {
      const loopOffset = 80;
      return `
        M ${start.x} ${start.y}
        C ${start.x + loopOffset} ${start.y},
          ${end.x - loopOffset} ${end.y},
          ${end.x} ${end.y}
      `;
    }
    
    return `
      M ${start.x} ${start.y}
      C ${start.x + curveOffset} ${start.y},
        ${end.x - curveOffset} ${end.y},
        ${end.x} ${end.y}
    `;
  } else {
    // Vertical flow (top to bottom) - fallback
    const curveOffset = Math.min(Math.abs(dy) / 2, CURVE_OFFSET);
    
    return `
      M ${start.x} ${start.y}
      C ${start.x} ${start.y + curveOffset},
        ${end.x} ${end.y - curveOffset},
        ${end.x} ${end.y}
    `;
  }
};

/**
 * Generate arrow marker path
 * n8n style: arrow points right (horizontal flow)
 */
const generateArrowPath = (
  end: ConnectionPoint,
  isHorizontal: boolean = true  // n8n default: horizontal
): string => {
  const size = 6;  // Slightly smaller for cleaner look
  if (isHorizontal) {
    // Arrow pointing right (for horizontal flow)
    return `
      M ${end.x - size * 1.5} ${end.y - size}
      L ${end.x} ${end.y}
      L ${end.x - size * 1.5} ${end.y + size}
    `;
  }
  // Arrow pointing down (for vertical flow)
  return `
    M ${end.x - size} ${end.y - size * 1.5}
    L ${end.x} ${end.y}
    L ${end.x + size} ${end.y - size * 1.5}
  `;
};

// ============================================
// SINGLE CONNECTION COMPONENT
// ============================================

interface SingleConnectionProps {
  connection: Connection;
  sourceNode: FlowNode;
  targetNode: FlowNode;
  isSelected: boolean;
  onClick?: (connectionId: string, e: React.MouseEvent) => void;
  onContextMenu?: (connectionId: string, e: React.MouseEvent) => void;
  onDelete?: (connectionId: string) => void;
}

const SingleConnection: React.FC<SingleConnectionProps> = ({
  connection,
  sourceNode,
  targetNode,
  isSelected,
  onClick,
  onContextMenu,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const start = useMemo(
    () => getHandlePosition(sourceNode, connection.sourceHandle),
    [sourceNode, connection.sourceHandle]
  );

  const end = useMemo(
    () => getNodeInputPosition(targetNode),
    [targetNode]
  );

  const path = useMemo(() => generateBezierPath(start, end), [start, end]);
  const arrowPath = useMemo(() => generateArrowPath(end), [end]);

  // Determine connection color
  const getColor = () => {
    if (connection.sourceHandle === 'true') return CONNECTION_COLORS.success;
    if (connection.sourceHandle === 'false') return CONNECTION_COLORS.error;
    if (sourceNode.status === 'error') return CONNECTION_COLORS.error;
    if (targetNode.status === 'error') return CONNECTION_COLORS.error;
    return CONNECTION_COLORS.default;
  };

  const baseColor = getColor();
  const color = isSelected ? CONNECTION_COLORS.selected : isHovered ? CONNECTION_COLORS.hover : baseColor;
  const strokeWidth = isHovered || isSelected ? STROKE_WIDTH_HOVER : STROKE_WIDTH;

  return (
    <g
      className={cn(
        "transition-all duration-150"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(connection.id, e);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(connection.id, e);
      }}
    >
      {/* Hit area (invisible, wider path for easier clicking) */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={HIT_AREA_WIDTH}
        className="cursor-pointer"
      />

      {/* Glow effect when selected */}
      {isSelected && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 2}
          strokeLinecap="round"
          opacity={0.18}
          className="blur-[1px]"
        />
      )}

      {/* Main connection line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={cn(
          "transition-all duration-150",
          connection.animated && "animate-dash"
        )}
        strokeDasharray={connection.animated ? "8 4" : undefined}
        style={undefined}
      />

      {/* Arrow at end */}
      <path
        d={arrowPath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Connection dot at start */}
      <circle
        cx={start.x}
        cy={start.y}
        r={isHovered || isSelected ? 5 : 4}
        fill={color}
        className="transition-all duration-150"
      />

      {/* Delete button on hover */}
      {isHovered && (
        <g
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(connection.id);
          }}
        >
          <circle
            cx={(start.x + end.x) / 2}
            cy={(start.y + end.y) / 2}
            r={12}
            fill="hsl(var(--destructive))"
            className="transition-transform hover:scale-110"
          />
          <path
            d={`M ${(start.x + end.x) / 2 - 4} ${(start.y + end.y) / 2 - 4} 
                L ${(start.x + end.x) / 2 + 4} ${(start.y + end.y) / 2 + 4}
                M ${(start.x + end.x) / 2 + 4} ${(start.y + end.y) / 2 - 4}
                L ${(start.x + end.x) / 2 - 4} ${(start.y + end.y) / 2 + 4}`}
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
};

// ============================================
// PENDING CONNECTION (WHILE DRAGGING)
// ============================================

interface PendingConnectionProps {
  sourceNode: FlowNode;
  sourceHandle?: string;
  mousePosition: { x: number; y: number };
}

const PendingConnection: React.FC<PendingConnectionProps> = ({
  sourceNode,
  sourceHandle,
  mousePosition,
}) => {
  const start = useMemo(
    () => getHandlePosition(sourceNode, sourceHandle),
    [sourceNode, sourceHandle]
  );

  const path = useMemo(
    () => generateBezierPath(start, mousePosition),
    [start, mousePosition]
  );

  return (
    <g className="pointer-events-none">
      {/* Glow */}
      <path
        d={path}
        fill="none"
        stroke={CONNECTION_COLORS.default}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.2}
        className="blur-[2px]"
      />
      
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={CONNECTION_COLORS.default}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray="8 4"
        className="animate-dash"
      />

      {/* End dot */}
      <circle
        cx={mousePosition.x}
        cy={mousePosition.y}
        r={6}
        fill={CONNECTION_COLORS.default}
        className="animate-pulse"
      />
    </g>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const FlowConnections: React.FC<FlowConnectionsProps> = ({
  nodes,
  connections,
  selectedConnectionIds,
  onConnectionClick,
  onConnectionContextMenu,
  onConnectionDelete,
  pendingConnection,
  className,
}) => {
  // Create node lookup map
  const nodeMap = useMemo(() => {
    const map = new Map<string, FlowNode>();
    nodes.forEach(node => map.set(node.id, node));
    return map;
  }, [nodes]);

  // Get source node for pending connection
  const pendingSourceNode = pendingConnection
    ? nodeMap.get(pendingConnection.sourceId)
    : null;

  return (
    <svg
      className={cn(
        "absolute inset-0 w-full h-full pointer-events-none overflow-visible",
        className
      )}
      style={{ zIndex: 0 }}
    >
      <defs>
        {/* Animated dash pattern */}
        <style>
          {`
            @keyframes dash {
              to {
                stroke-dashoffset: -24;
              }
            }
            .animate-dash {
              animation: dash 1s linear infinite;
            }
          `}
        </style>

        {/* Arrow marker */}
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={CONNECTION_COLORS.default}
          />
        </marker>
      </defs>

      <g className="pointer-events-auto">
        {/* Render all connections */}
        {connections.map(connection => {
          const sourceNode = nodeMap.get(connection.sourceId);
          const targetNode = nodeMap.get(connection.targetId);

          if (!sourceNode || !targetNode) return null;

          return (
            <SingleConnection
              key={connection.id}
              connection={connection}
              sourceNode={sourceNode}
              targetNode={targetNode}
              isSelected={selectedConnectionIds.has(connection.id)}
              onClick={onConnectionClick}
              onContextMenu={onConnectionContextMenu}
              onDelete={onConnectionDelete}
            />
          );
        })}

        {/* Pending connection while dragging */}
        {pendingConnection && pendingSourceNode && (
          <PendingConnection
            sourceNode={pendingSourceNode}
            sourceHandle={pendingConnection.sourceHandle}
            mousePosition={pendingConnection.mousePosition}
          />
        )}
      </g>
    </svg>
  );
};

export default FlowConnections;
