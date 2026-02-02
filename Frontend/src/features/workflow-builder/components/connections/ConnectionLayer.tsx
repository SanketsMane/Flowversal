/**
 * Connection Layer Component
 * Phase 2 - Visual Connection Lines
 * 
 * SVG overlay that renders all connection lines
 */

import React, { useState, useEffect } from 'react';
import { ConnectionLine, ConnectionLineType } from './ConnectionLine';
import { useConnectionRegistry } from '../../hooks/useConnectionRegistry';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useViewport } from '../../contexts/ViewportContext';

interface Connection {
  id: string;
  fromDotId: string;
  toDotId: string;
  type: ConnectionLineType;
  color: string;
  animated: boolean;
}

export function ConnectionLayer() {
  const { getAllPoints } = useConnectionRegistry();
  const { containers, trigger } = useWorkflowStore();
  const { viewport, connectionUpdateCounter } = useViewport();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null);

  // Auto-generate connections based on workflow structure
  useEffect(() => {
    const points = getAllPoints();
    const newConnections: Connection[] = [];

    // Get all point positions
    const pointMap = new Map(points.map(p => [p.id, p]));

    // 1. TRIGGER → FIRST STEP
    if (trigger && containers.length > 0) {
      const triggerOutput = points.find(
        p => p.ownerId === trigger.id && p.type === 'trigger-output'
      );
      const firstStepInput = points.find(
        p => p.ownerId === containers[0].id && p.type === 'step-input'
      );

      if (triggerOutput && firstStepInput) {
        newConnections.push({
          id: `trigger-to-step-0`,
          fromDotId: triggerOutput.id,
          toDotId: firstStepInput.id,
          type: 'vertical-spine',
          color: '#9D50BB',
          animated: false,
        });
      }
    }

    // 2. STEP → STEP (vertical spine)
    for (let i = 0; i < containers.length - 1; i++) {
      const currentStepOutput = points.find(
        p => p.ownerId === containers[i].id && p.type === 'step-output'
      );
      const nextStepInput = points.find(
        p => p.ownerId === containers[i + 1].id && p.type === 'step-input'
      );

      if (currentStepOutput && nextStepInput) {
        newConnections.push({
          id: `step-${i}-to-step-${i + 1}`,
          fromDotId: currentStepOutput.id,
          toDotId: nextStepInput.id,
          type: 'vertical-spine',
          color: '#00C6FF',
          animated: false,
        });
      }
    }

    // 3. STEP SPINE → NODES (horizontal branches)
    containers.forEach((container, containerIndex) => {
      const nodes = container.nodes || [];
      
      nodes.forEach((node, nodeIndex) => {
        // Find node's input and output dots
        const nodeInput = points.find(
          p => p.ownerId === node.id && p.type === 'node-input'
        );
        const nodeOutput = points.find(
          p => p.ownerId === node.id && p.type === 'node-output'
        );

        // Connect spine to first node's input
        if (nodeIndex === 0 && nodeInput) {
          const stepInput = points.find(
            p => p.ownerId === container.id && p.type === 'step-input'
          );
          
          if (stepInput) {
            newConnections.push({
              id: `step-${containerIndex}-spine-to-node-${nodeIndex}`,
              fromDotId: stepInput.id,
              toDotId: nodeInput.id,
              type: 'horizontal-branch',
              color: '#9D50BB',
              animated: false,
            });
          }
        }

        // Connect node-to-node within step
        if (nodeIndex < nodes.length - 1 && nodeOutput) {
          const nextNode = nodes[nodeIndex + 1];
          const nextNodeInput = points.find(
            p => p.ownerId === nextNode.id && p.type === 'node-input'
          );

          if (nextNodeInput) {
            newConnections.push({
              id: `node-${node.id}-to-node-${nextNode.id}`,
              fromDotId: nodeOutput.id,
              toDotId: nextNodeInput.id,
              type: 'node-to-node',
              color: '#9D50BB',
              animated: false,
            });
          }
        }

        // Connect last node output to step spine
        if (nodeIndex === nodes.length - 1 && nodeOutput) {
          const stepOutput = points.find(
            p => p.ownerId === container.id && p.type === 'step-output'
          );

          if (stepOutput) {
            newConnections.push({
              id: `node-${nodeIndex}-to-step-${containerIndex}-spine`,
              fromDotId: nodeOutput.id,
              toDotId: stepOutput.id,
              type: 'horizontal-branch',
              color: '#9D50BB',
              animated: false,
            });
          }
        }
      });
    });

    setConnections(newConnections);
  }, [containers, trigger, getAllPoints, connectionUpdateCounter]);

  // Get point positions for rendering
  const points = getAllPoints();
  const pointMap = new Map(points.map(p => [p.id, p]));

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ 
        zIndex: 2,
        transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.zoom})`,
        transformOrigin: '0 0',
      }}
    >
      {/* Glow filter definition */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Render all connections */}
      {connections.map(connection => {
        const fromPoint = pointMap.get(connection.fromDotId);
        const toPoint = pointMap.get(connection.toDotId);

        if (!fromPoint || !toPoint) return null;

        return (
          <ConnectionLine
            key={connection.id}
            id={connection.id}
            fromDotId={connection.fromDotId}
            toDotId={connection.toDotId}
            fromX={fromPoint.position.x}
            fromY={fromPoint.position.y}
            toX={toPoint.position.x}
            toY={toPoint.position.y}
            type={connection.type}
            color={connection.color}
            animated={connection.animated}
            isHovered={hoveredConnectionId === connection.id}
            onHover={(hovered) => {
              setHoveredConnectionId(hovered ? connection.id : null);
            }}
          />
        );
      })}
    </svg>
  );
}