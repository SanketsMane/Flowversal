/**
 * useConnections Hook - ZOOM-STABLE VERSION
 * Manages main branch connections (Trigger → Steps → Steps)
 * Uses canvas-space coordinates for zoom stability
 */

import { useEffect, useState, useCallback } from 'react';
import { useWorkflowStore } from '../stores';
import { useViewport } from '../contexts/ViewportContext';
import { getElementCanvasPosition, Point } from '../utils/canvas-position.utils';

export interface ConnectionPath {
  from: Point;
  to: Point;
  path: string;
  midPoint: Point;
}

export interface Connection {
  id: string;
  type: 'trigger-to-step' | 'step-to-step' | 'node-to-node' | 'branch' | 'tool';
  fromId: string;
  toId: string;
  path: ConnectionPath;
  animated?: boolean;
  color?: string;
  dashed?: boolean;
}

/**
 * Calculate a smooth curved path between two points
 */
function calculateSmoothPath(from: Point, to: Point): ConnectionPath {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  const offset = Math.min(Math.abs(dy) * 0.5, 100);
  
  const path = `M ${from.x} ${from.y} C ${from.x} ${from.y + offset}, ${to.x} ${to.y - offset}, ${to.x} ${to.y}`;
  
  const midPoint = {
    x: from.x + dx * 0.5,
    y: from.y + dy * 0.5,
  };
  
  return { from, to, path, midPoint };
}

export function useConnections() {
  const { triggers, containers } = useWorkflowStore();
  const { connectionUpdateCounter } = useViewport();
  const [connections, setConnections] = useState<Connection[]>([]);

  const calculateConnections = useCallback(() => {
    const newConnections: Connection[] = [];

    try {
      // 1. Connect triggers to first step (main branch)
      if (triggers.length > 0 && containers.length > 0) {
        const lastTriggerEl = document.querySelector(
          `[data-trigger-id="${triggers[triggers.length - 1].id}"]`
        ) as HTMLElement;
        const firstContainerEl = document.querySelector(
          `[data-container-id="${containers[0].id}"]`
        ) as HTMLElement;

        if (lastTriggerEl && firstContainerEl) {
          const from = getElementCanvasPosition(lastTriggerEl, 'left');
          const to = getElementCanvasPosition(firstContainerEl, 'left');

          if (from && to) {
            // Offset to the LEFT by 80px for the main branch line
            const offsetFrom = { x: from.x - 80, y: from.y };
            const offsetTo = { x: to.x - 80, y: to.y };
            
            const path = calculateSmoothPath(offsetFrom, offsetTo);
            newConnections.push({
              id: `trigger-to-step-0`,
              type: 'trigger-to-step',
              fromId: triggers[triggers.length - 1].id,
              toId: containers[0].id,
              path,
              animated: true,
              color: 'url(#gradient-blue-violet)',
            });
          }
        }
      }

      // 2. Connect steps to each other (main branch continues)
      for (let i = 0; i < containers.length - 1; i++) {
        const currentContainerEl = document.querySelector(
          `[data-container-id="${containers[i].id}"]`
        ) as HTMLElement;
        const nextContainerEl = document.querySelector(
          `[data-container-id="${containers[i + 1].id}"]`
        ) as HTMLElement;

        if (currentContainerEl && nextContainerEl) {
          const from = getElementCanvasPosition(currentContainerEl, 'left');
          const to = getElementCanvasPosition(nextContainerEl, 'left');

          if (from && to) {
            // Offset to the LEFT by 80px for the main branch line
            const offsetFrom = { x: from.x - 80, y: from.y };
            const offsetTo = { x: to.x - 80, y: to.y };
            
            const path = calculateSmoothPath(offsetFrom, offsetTo);
            newConnections.push({
              id: `step-${i}-to-${i + 1}`,
              type: 'step-to-step',
              fromId: containers[i].id,
              toId: containers[i + 1].id,
              path,
              animated: true,
              color: 'url(#gradient-blue-violet)',
            });
          }
        }
      }

      // 3. Connect nodes within each container
      // (nodes that are NOT branch-creating nodes like If/Switch)
      containers.forEach((container) => {
        for (let i = 0; i < container.nodes.length - 1; i++) {
          const currentNode = container.nodes[i];
          const nextNode = container.nodes[i + 1];
          
          // Skip connections for If/Switch nodes as they use SmartBranchConnections
          if (currentNode.type === 'if' || currentNode.type === 'switch') continue;

          const currentNodeEl = document.querySelector(
            `[data-node-id="${currentNode.id}"]`
          ) as HTMLElement;
          const nextNodeEl = document.querySelector(
            `[data-node-id="${nextNode.id}"]`
          ) as HTMLElement;

          if (currentNodeEl && nextNodeEl) {
            const from = getElementCanvasPosition(currentNodeEl, 'bottom');
            const to = getElementCanvasPosition(nextNodeEl, 'top');

            if (from && to) {
              const path = calculateSmoothPath(from, to);
              newConnections.push({
                id: `node-${container.id}-${i}-to-${i + 1}`,
                type: 'node-to-node',
                fromId: currentNode.id,
                toId: nextNode.id,
                path,
                color: '#00C6FF',
              });
            }
          }
        }
      });

      setConnections(newConnections);
    } catch (error) {
      console.debug('Connection calculation error:', error);
    }
  }, [triggers, containers]);

  // Recalculate continuously for smooth tracking
  useEffect(() => {
    calculateConnections();

    let rafId: number;
    const animate = () => {
      calculateConnections();
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [calculateConnections, connectionUpdateCounter]);

  const recalculate = useCallback(() => {
    calculateConnections();
  }, [calculateConnections]);

  return {
    connections,
    recalculate,
  };
}