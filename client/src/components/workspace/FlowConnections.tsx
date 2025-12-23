/**
 * Bezier Curve Connections Component
 * 
 * Renders smooth, animated bezier curves between nodes
 * with hover states, selection, and n8n-style aesthetics.
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

const NODE_WIDTH = 260;
const NODE_HEIGHT = 140;
const HANDLE_OFFSET = 10;
const CURVE_OFFSET = 80;
const STROKE_WIDTH = 2;
const STROKE_WIDTH_HOVER = 3;
const HIT_AREA_WIDTH = 20;

// Connection colors by type
const CONNECTION_COLORS = {
  default: 'hsl(var(--primary))',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  disabled: 'hsl(var(--muted-foreground))',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the output position of a node (bottom center)
 */
const getNodeOutputPosition = (node: FlowNode): ConnectionPoint => ({
  x: node.position.x + NODE_WIDTH / 2,
  y: node.position.y + NODE_HEIGHT + HANDLE_OFFSET,
});

/**
 * Get the input position of a node (top center)
 */
const getNodeInputPosition = (node: FlowNode): ConnectionPoint => ({
  x: node.position.x + NODE_WIDTH / 2,
  y: node.position.y - HANDLE_OFFSET,
});

/**
 * Get specific handle position for condition nodes
 */
const getHandlePosition = (node: FlowNode, handle?: string): ConnectionPoint => {
  if (node.type === 'condition') {
    if (handle === 'true') {
      return {
        x: node.position.x + NODE_WIDTH / 4,
        y: node.position.y + NODE_HEIGHT + HANDLE_OFFSET,
      };
    }
    if (handle === 'false') {
      return {
        x: node.position.x + (NODE_WIDTH * 3) / 4,
        y: node.position.y + NODE_HEIGHT + HANDLE_OFFSET,
      };
    }
  }
  return getNodeOutputPosition(node);
};

/**
 * Generate a smooth bezier curve path
 */
const generateBezierPath = (
  start: ConnectionPoint,
  end: ConnectionPoint,
  isVertical: boolean = true
): string => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  if (isVertical) {
    // Vertical flow (top to bottom)
    const curveOffset = Math.min(Math.abs(dy) / 2, CURVE_OFFSET);
    const midY = start.y + dy / 2;
    
    // If going upward, create a loop-back curve
    if (dy < 50) {
      const loopOffset = 80;
      return `
        M ${start.x} ${start.y}
        C ${start.x} ${start.y + loopOffset},
          ${end.x} ${end.y - loopOffset},
          ${end.x} ${end.y}
      `;
    }
    
    return `
      M ${start.x} ${start.y}
      C ${start.x} ${start.y + curveOffset},
        ${end.x} ${end.y - curveOffset},
        ${end.x} ${end.y}
    `;
  } else {
    // Horizontal flow (left to right)
    const curveOffset = Math.min(Math.abs(dx) / 2, CURVE_OFFSET);
    
    return `
      M ${start.x} ${start.y}
      C ${start.x + curveOffset} ${start.y},
        ${end.x - curveOffset} ${end.y},
        ${end.x} ${end.y}
    `;
  }
};

/**
 * Generate arrow marker path
 */
const generateArrowPath = (
  end: ConnectionPoint,
  isVertical: boolean = true
): string => {
  const size = 8;
  if (isVertical) {
    return `
      M ${end.x - size} ${end.y - size * 1.5}
      L ${end.x} ${end.y}
      L ${end.x + size} ${end.y - size * 1.5}
    `;
  }
  return `
    M ${end.x - size * 1.5} ${end.y - size}
    L ${end.x} ${end.y}
    L ${end.x - size * 1.5} ${end.y + size}
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

  const color = getColor();
  const strokeWidth = isHovered || isSelected ? STROKE_WIDTH_HOVER : STROKE_WIDTH;

  return (
    <g
      className={cn(
        "transition-all duration-150",
        isSelected && "drop-shadow-lg"
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
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          opacity={0.3}
          className="blur-[2px]"
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
        style={{
          filter: isHovered ? `drop-shadow(0 0 4px ${color})` : undefined,
        }}
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
        r={isHovered || isSelected ? 6 : 4}
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
