/**
 * Connections Overlay Component
 * SVG overlay for main branch connection lines (Trigger → Steps → Steps)
 * Branch connections are handled separately by SmartBranchConnections
 */
import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useConnections, Connection } from '../../hooks/useConnections';
import { ConnectionLine } from './ConnectionLine';
export function ConnectionsOverlay() {
  const { connections } = useConnections();
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null);
  const { theme } = useTheme();
  const handleConnectionClick = (connection: Connection) => {
  };
  if (connections.length === 0) {
    return null;
  }
  // Theme-aware arrow fill color
  const arrowFill = theme === 'dark' ? '#00C6FF' : '#0072FF';
  return (
    <>
      {/* SVG overlay for main branch connections */}
      <svg
        className="absolute pointer-events-none"
        style={{ 
          top: 0,
          left: 0,
          width: '100%', 
          height: '100%',
          zIndex: 1,
          overflow: 'visible',
        }}
      >
        {/* Gradient definitions */}
        <defs>
          {/* Blue to Violet gradient for main branch */}
          <linearGradient id="gradient-blue-violet" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00C6FF" />
            <stop offset="100%" stopColor="#9D50BB" />
          </linearGradient>
          {/* Arrowhead marker - theme aware */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={arrowFill} />
          </marker>
          {/* Arrowhead for highlighted state */}
          <marker
            id="arrowhead-highlight"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={arrowFill} opacity="1" />
          </marker>
        </defs>
        {/* Connection lines */}
        {connections.map((connection) => (
          <ConnectionLine
            key={connection.id}
            connection={connection}
            onHover={setHoveredConnectionId}
            onClick={handleConnectionClick}
            isHighlighted={hoveredConnectionId === connection.id}
          />
        ))}
      </svg>
      {/* Animation styles */}
      <style>{`
        @keyframes dash {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -200;
          }
        }
      `}</style>
    </>
  );
}