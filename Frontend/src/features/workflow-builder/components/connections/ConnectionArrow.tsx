/**
 * Connection Arrow Component
 * Enhanced arrow with hover effects and animations
 */
import React from 'react';
import { useTheme } from '../../../../components/ThemeContext';
interface ConnectionArrowProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isActive?: boolean;
  isExecuting?: boolean;
  color?: string;
  strokeWidth?: number;
  onClick?: () => void;
}
export function ConnectionArrow({
  startX,
  startY,
  endX,
  endY,
  isActive = false,
  isExecuting = false,
  color,
  strokeWidth = 2,
  onClick,
}: ConnectionArrowProps) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  const defaultColor = theme === 'dark' ? '#4A4A6A' : '#D1D5DB';
  const activeColor = theme === 'dark' ? '#818CF8' : '#6366F1';
  const hoverColor = theme === 'dark' ? '#A78BFA' : '#8B5CF6';
  const executingColor = theme === 'dark' ? '#34D399' : '#10B981';
  // Determine the stroke color
  const strokeColor = isExecuting 
    ? executingColor 
    : isActive 
      ? activeColor 
      : isHovered 
        ? hoverColor 
        : color || defaultColor;
  // Calculate control points for curved path
  const dx = endX - startX;
  const dy = endY - startY;
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);
  const controlPoint1X = startX + controlOffset;
  const controlPoint1Y = startY;
  const controlPoint2X = endX - controlOffset;
  const controlPoint2Y = endY;
  // 🐛 DEBUG: Connection line coordinates
  // Create SVG path
  const path = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;
  // Calculate arrow head angle
  const angle = Math.atan2(endY - controlPoint2Y, endX - controlPoint2X);
  const arrowSize = 8;
  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Invisible wider path for easier hovering */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ pointerEvents: 'stroke' }}
      />
      {/* Animated background glow for executing state */}
      {isExecuting && (
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 6}
          opacity={0.3}
          style={{
            filter: `drop-shadow(0 0 8px ${strokeColor})`,
          }}
        />
      )}
      {/* Main path */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isHovered ? strokeWidth + 1 : strokeWidth}
        style={{
          transition: 'all 0.2s ease',
          filter: isHovered || isExecuting ? `drop-shadow(0 0 4px ${strokeColor})` : 'none',
        }}
      />
      {/* Arrow head */}
      <polygon
        points={`
          ${endX},${endY}
          ${endX - arrowSize * Math.cos(angle - Math.PI / 6)},${endY - arrowSize * Math.sin(angle - Math.PI / 6)}
          ${endX - arrowSize * Math.cos(angle + Math.PI / 6)},${endY - arrowSize * Math.sin(angle + Math.PI / 6)}
        `}
        fill={strokeColor}
        style={{
          transition: 'all 0.2s ease',
          filter: isHovered || isExecuting ? `drop-shadow(0 0 4px ${strokeColor})` : 'none',
        }}
      />
      {/* Animated dot traveling along path when executing */}
      {isExecuting && (
        <>
          <circle r="4" fill={executingColor} style={{ filter: `drop-shadow(0 0 4px ${executingColor})` }}>
            <animateMotion dur="2s" repeatCount="indefinite" path={path} />
          </circle>
        </>
      )}
      {/* Pulse effect on hover */}
      {isHovered && (
        <circle
          cx={startX}
          cy={startY}
          r="6"
          fill={hoverColor}
          opacity={0.6}
          style={{
            animation: 'execution-pulse 1s ease-in-out infinite',
          }}
        />
      )}
    </g>
  );
}