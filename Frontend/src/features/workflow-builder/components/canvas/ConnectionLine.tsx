/**
 * Connection Line Component
 * Phase 3 Part 1 - Connecting Lines
 * 
 * Individual SVG line connecting workflow elements
 */

import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { Connection } from '../../hooks/useConnections';

interface ConnectionLineProps {
  connection: Connection;
  onHover?: (id: string | null) => void;
  onClick?: (connection: Connection) => void;
  isHighlighted?: boolean;
}

export function ConnectionLine({ connection, onHover, onClick, isHighlighted }: ConnectionLineProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(connection.id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(null);
  };

  const handleClick = () => {
    onClick?.(connection);
  };

  // Theme-aware colors
  const strokeColor = connection.color || (theme === 'dark' ? '#00C6FF' : '#0072FF');
  const flowColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 114, 255, 0.6)';
  const strokeWidth = isHovered || isHighlighted ? 3 : 2;
  const opacity = isHovered || isHighlighted ? 1 : (theme === 'dark' ? 0.6 : 0.8);
  const glowColor = isHovered || isHighlighted ? strokeColor : 'transparent';

  return (
    <g>
      {/* Invisible wider path for easier clicking/hovering */}
      <path
        d={connection.path.path}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="cursor-pointer"
        style={{ pointerEvents: 'stroke' }}
      />

      {/* Glow effect on hover */}
      {(isHovered || isHighlighted) && (
        <path
          d={connection.path.path}
          stroke={glowColor}
          strokeWidth={strokeWidth + 6}
          fill="none"
          opacity={0.3}
          className="transition-all pointer-events-none"
          style={{
            filter: `blur(8px) drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      )}

      {/* Visible path */}
      <path
        d={connection.path.path}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={connection.dashed ? '5,5' : 'none'}
        opacity={opacity}
        className="transition-all duration-200 pointer-events-none"
        markerEnd="url(#arrowhead)"
        style={{
          filter: isHovered || isHighlighted ? `drop-shadow(0 0 4px ${strokeColor})` : 'none',
        }}
      />

      {/* Animated flow effect */}
      {connection.animated && (
        <path
          d={connection.path.path}
          stroke={flowColor}
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,10"
          opacity={0.8}
          className="pointer-events-none"
          style={{
            animation: 'dash 20s linear infinite',
          }}
        />
      )}

      {/* Hover highlight circle at midpoint */}
      {isHovered && (
        <>
          <circle
            cx={connection.path.midPoint.x}
            cy={connection.path.midPoint.y}
            r="16"
            fill="#00C6FF"
            opacity="0.9"
            className="cursor-pointer"
            onClick={handleClick}
          />
          
          {/* Plus icon */}
          <g transform={`translate(${connection.path.midPoint.x}, ${connection.path.midPoint.y})`}>
            {/* Vertical line of + */}
            <line
              x1="0"
              y1="-6"
              x2="0"
              y2="6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Horizontal line of + */}
            <line
              x1="-6"
              y1="0"
              x2="6"
              y2="0"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </>
      )}
    </g>
  );
}