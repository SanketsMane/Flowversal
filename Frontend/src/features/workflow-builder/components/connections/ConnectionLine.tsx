/**
 * Connection Line Component
 * Phase 2 - Visual Connection Lines
 * 
 * Renders SVG paths between connection dots
 */

import React from 'react';

export type ConnectionLineType = 
  | 'vertical-spine'     // Main vertical flow (trigger → step → step)
  | 'horizontal-branch'  // Branch to/from node (spine ↔ node)
  | 'node-to-node';      // Between nodes in same step

export interface ConnectionLineProps {
  id: string;
  fromDotId: string;
  toDotId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: ConnectionLineType;
  color?: string;
  animated?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
}

export const ConnectionLine = React.memo(function ConnectionLine({
  id,
  fromX,
  fromY,
  toX,
  toY,
  type,
  color = '#9D50BB',
  animated = false,
  isHovered = false,
  onClick,
  onHover,
}: ConnectionLineProps) {
  
  // Calculate path based on connection type
  const path = calculatePath(fromX, fromY, toX, toY, type);
  
  // Determine stroke width
  const strokeWidth = type === 'vertical-spine' ? 3 : 2;
  const hoverStrokeWidth = strokeWidth + 1;
  
  // Gradient ID for animated flow
  const gradientId = `gradient-${id}`;
  
  return (
    <g
      data-connection-id={id}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Gradient definition for animation */}
      {animated && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2">
              <animate
                attributeName="offset"
                values="-2; 1"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor={color} stopOpacity="1">
              <animate
                attributeName="offset"
                values="-1; 2"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={color} stopOpacity="0.2">
              <animate
                attributeName="offset"
                values="0; 3"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
      )}
      
      {/* Invisible wider path for easier hover detection */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        style={{ pointerEvents: onClick || onHover ? 'stroke' : 'none' }}
      />
      
      {/* Glow effect when hovered */}
      {isHovered && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={hoverStrokeWidth + 4}
          opacity="0.3"
          filter="url(#glow)"
        />
      )}
      
      {/* Main connection line */}
      <path
        d={path}
        fill="none"
        stroke={animated ? `url(#${gradientId})` : color}
        strokeWidth={isHovered ? hoverStrokeWidth : strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isHovered ? 1 : 0.8}
        className="transition-all duration-200"
      />
      
      {/* Arrow marker for direction */}
      {type === 'vertical-spine' && (
        <circle
          cx={toX}
          cy={toY - 8}
          r={3}
          fill={color}
          opacity={isHovered ? 1 : 0.6}
        />
      )}
    </g>
  );
});

/**
 * Calculate SVG path based on connection type
 */
function calculatePath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  type: ConnectionLineType
): string {
  switch (type) {
    case 'vertical-spine':
      // Smooth S-curve for vertical connections
      return calculateVerticalSpinePath(fromX, fromY, toX, toY);
    
    case 'horizontal-branch':
      // L-shape or curved branch for node connections
      return calculateHorizontalBranchPath(fromX, fromY, toX, toY);
    
    case 'node-to-node':
      // Simple vertical connection between nodes
      return calculateNodeToNodePath(fromX, fromY, toX, toY);
    
    default:
      // Fallback: straight line
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  }
}

/**
 * Vertical spine path - smooth S-curve
 */
function calculateVerticalSpinePath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): string {
  const midY = (fromY + toY) / 2;
  const curveStrength = Math.min(Math.abs(toY - fromY) / 3, 40);
  
  // If horizontal offset, add curve
  if (Math.abs(toX - fromX) > 5) {
    return `
      M ${fromX} ${fromY}
      C ${fromX} ${fromY + curveStrength},
        ${fromX} ${midY - curveStrength},
        ${(fromX + toX) / 2} ${midY}
      S ${toX} ${toY - curveStrength},
        ${toX} ${toY}
    `;
  }
  
  // Straight vertical with slight curve
  return `
    M ${fromX} ${fromY}
    C ${fromX} ${fromY + curveStrength},
      ${toX} ${toY - curveStrength},
      ${toX} ${toY}
  `;
}

/**
 * Horizontal branch path - L-shape with rounded corners
 */
function calculateHorizontalBranchPath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): string {
  const radius = 8;
  const isLeftToRight = toX > fromX;
  const deltaY = toY - fromY;
  
  // If very close vertically, use simple horizontal line
  if (Math.abs(deltaY) < 5) {
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  }
  
  // L-shape with rounded corner
  if (isLeftToRight) {
    const cornerX = toX - radius;
    const cornerY = fromY;
    const endCornerY = fromY + (deltaY > 0 ? radius : -radius);
    
    return `
      M ${fromX} ${fromY}
      L ${cornerX} ${cornerY}
      Q ${toX} ${cornerY}, ${toX} ${endCornerY}
      L ${toX} ${toY}
    `;
  } else {
    const cornerX = toX + radius;
    const cornerY = fromY;
    const endCornerY = fromY + (deltaY > 0 ? radius : -radius);
    
    return `
      M ${fromX} ${fromY}
      L ${cornerX} ${cornerY}
      Q ${toX} ${cornerY}, ${toX} ${endCornerY}
      L ${toX} ${toY}
    `;
  }
}

/**
 * Node-to-node path - vertical with slight S-curve
 */
function calculateNodeToNodePath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): string {
  const midY = (fromY + toY) / 2;
  const curveStrength = 15;
  
  return `
    M ${fromX} ${fromY}
    C ${fromX} ${fromY + curveStrength},
      ${toX} ${toY - curveStrength},
      ${toX} ${toY}
  `;
}
