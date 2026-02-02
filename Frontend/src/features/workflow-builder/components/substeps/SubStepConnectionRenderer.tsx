/**
 * Sub-Step Connection Renderer
 * Draws dynamic SVG connections from parent nodes to sub-step nodes
 * Updates automatically when sub-steps are dragged
 */

import { useEffect, useState } from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';
import { useWorkflowStore } from '../../stores/workflowStore';

export function SubStepConnectionRenderer() {
  const { theme } = useTheme();
  const { subStepContainers } = useSubStepStore();
  const { containers } = useWorkflowStore();
  const [connections, setConnections] = useState<Array<{
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    type: 'parent-to-substep' | 'substep-to-substep';
  }>>([]);

  useEffect(() => {
    // Recalculate connections on each render
    const updateConnections = () => {
      const newConnections: typeof connections = [];

      subStepContainers.forEach((subStep) => {
        // Find the parent node element
        const parentNodeElement = document.querySelector(`[data-node-id="${subStep.parentNodeId}"]`);
        
        if (parentNodeElement && subStep.nodes.length > 0) {
          // Get parent node position (right side connection dot)
          const parentRect = parentNodeElement.getBoundingClientRect();
          const canvasElement = document.querySelector('.infinite-canvas-content');
          const canvasRect = canvasElement?.getBoundingClientRect();
          
          if (canvasRect) {
            // Parent node's right connection dot position
            const parentX = parentRect.right - canvasRect.left;
            const parentY = parentRect.top - canvasRect.top + (parentRect.height / 2);

            // Sub-step's first node (we'll connect to its left connection dot)
            // The first node is inside the sub-step container
            const firstNodeInSubStep = subStep.nodes[0];
            if (firstNodeInSubStep) {
              // Calculate position of first node in sub-step
              // Sub-step position + header height (~52px) + padding (16px) + half node height (~40px)
              const subStepX = subStep.position.x;
              const subStepY = subStep.position.y + 52 + 16 + 40;

              newConnections.push({
                id: `parent-${subStep.parentNodeId}-to-substep-${subStep.id}`,
                x1: parentX,
                y1: parentY,
                x2: subStepX,
                y2: subStepY,
                type: 'parent-to-substep',
              });
            }
          }
        }
      });

      setConnections(newConnections);
    };

    updateConnections();

    // Update connections on animation frame for smooth dragging
    const intervalId = setInterval(updateConnections, 50);
    return () => clearInterval(intervalId);
  }, [subStepContainers, containers]);

  // Create curved path for connection
  const createPath = (x1: number, y1: number, x2: number, y2: number): string => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Control point offset (creates the curve)
    const curvature = Math.min(distance * 0.3, 100);
    
    // Cubic bezier curve
    const cx1 = x1 + curvature;
    const cy1 = y1;
    const cx2 = x2 - curvature;
    const cy2 = y2;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  if (connections.length === 0) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <defs>
        {/* Gradient for connections */}
        <linearGradient id="substep-connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C6FF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#9D50BB" stopOpacity="0.6" />
        </linearGradient>

        {/* Animated gradient for active connections */}
        <linearGradient id="substep-connection-gradient-animated" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C6FF" stopOpacity="0.8">
            <animate attributeName="stop-opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#9D50BB" stopOpacity="0.8">
            <animate attributeName="stop-opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
          </stop>
        </linearGradient>

        {/* Glow filter */}
        <filter id="substep-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {connections.map((connection) => (
        <g key={connection.id}>
          {/* Glow layer */}
          <path
            d={createPath(connection.x1, connection.y1, connection.x2, connection.y2)}
            stroke="url(#substep-connection-gradient-animated)"
            strokeWidth="3"
            fill="none"
            filter="url(#substep-glow)"
            opacity="0.4"
          />
          {/* Main line */}
          <path
            d={createPath(connection.x1, connection.y1, connection.x2, connection.y2)}
            stroke="url(#substep-connection-gradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray={connection.type === 'substep-to-substep' ? '5,5' : '0'}
          />
          {/* Arrowhead */}
          <circle
            cx={connection.x2}
            cy={connection.y2}
            r="4"
            fill="#9D50BB"
            opacity="0.8"
          />
        </g>
      ))}
    </svg>
  );
}
