/**
 * Data Flow Renderer Component
 * Animates data flow along connections (n8n-style visualization)
 */

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ConnectionDataFlow, NodeExecutionState } from '../execution/VisualExecutionOverlay';

interface DataFlowRendererProps {
  connections: ConnectionDataFlow[];
  nodeStates: NodeExecutionState[];
  onConnectionHover?: (connectionId: string | null) => void;
}

export function DataFlowRenderer({
  connections,
  nodeStates,
  onConnectionHover,
}: DataFlowRendererProps) {
  const [activeFlows, setActiveFlows] = useState<Map<string, number>>(new Map());

  // Get node positions
  const getNodePosition = (nodeId: string): { x: number; y: number } | null => {
    const nodeState = nodeStates.find((n) => n.id === nodeId);
    return nodeState ? nodeState.position : null;
  };

  // Calculate connection path
  const getConnectionPath = (fromNodeId: string, toNodeId: string): string | null => {
    const fromPos = getNodePosition(fromNodeId);
    const toPos = getNodePosition(toNodeId);

    if (!fromPos || !toPos) return null;

    // Simple bezier curve path
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const cp1x = fromPos.x + dx * 0.5;
    const cp1y = fromPos.y;
    const cp2x = toPos.x - dx * 0.5;
    const cp2y = toPos.y;

    return `M ${fromPos.x} ${fromPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPos.x} ${toPos.y}`;
  };

  // Animate data packets along connections
  useEffect(() => {
    connections.forEach((connection) => {
      if (connection.active) {
        const flowId = connection.connectionId;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / 2000, 1); // 2 second animation

          setActiveFlows((prev) => {
            const next = new Map(prev);
            if (progress < 1) {
              next.set(flowId, progress);
            } else {
              next.delete(flowId);
            }
            return next;
          });

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      }
    });
  }, [connections]);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    >
      {connections.map((connection) => {
        const path = getConnectionPath(connection.fromNodeId, connection.toNodeId);
        if (!path) return null;

        const progress = activeFlows.get(connection.connectionId) || 0;
        const isActive = connection.active || progress > 0;

        return (
          <g key={connection.connectionId}>
            {/* Connection line */}
            <path
              d={path}
              fill="none"
              stroke={isActive ? '#00C6FF' : 'rgba(0, 198, 255, 0.3)'}
              strokeWidth={isActive ? 3 : 2}
              strokeDasharray={isActive ? '5,5' : 'none'}
              className="transition-all duration-300"
              style={{
                filter: isActive ? 'drop-shadow(0 0 8px rgba(0, 198, 255, 0.5))' : 'none',
              }}
              onMouseEnter={() => {
                if (onConnectionHover) {
                  onConnectionHover(connection.connectionId);
                }
              }}
              onMouseLeave={() => {
                if (onConnectionHover) {
                  onConnectionHover(null);
                }
              }}
              pointerEvents="stroke"
            />

            {/* Animated data packet */}
            {isActive && progress > 0 && (
              <motion.circle
                r={6}
                fill="#00C6FF"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(0, 198, 255, 0.8))',
                }}
              >
                <animateMotion
                  dur="2s"
                  repeatCount="indefinite"
                  path={path}
                />
              </motion.circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}
