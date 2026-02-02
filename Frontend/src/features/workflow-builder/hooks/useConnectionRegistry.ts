/**
 * Connection Point Registry
 * Centralized store for all connection dots and lines in Flowversal
 */

import { create } from 'zustand';
import { ConnectionPoint, ConnectionLine } from '../types/connections';

interface ConnectionRegistry {
  // Points
  points: Map<string, ConnectionPoint>;
  registerPoint: (point: ConnectionPoint) => void;
  unregisterPoint: (id: string) => void;
  updatePosition: (id: string, position: { x: number; y: number }) => void;
  getPoint: (id: string) => ConnectionPoint | undefined;
  getAllPoints: () => ConnectionPoint[];
  
  // Queries
  getPointsByOwner: (ownerId: string) => ConnectionPoint[];
  getStepInputDot: (stepId: string) => ConnectionPoint | undefined;
  getStepOutputDot: (stepId: string) => ConnectionPoint | undefined;
  getNodeInputDot: (nodeId: string) => ConnectionPoint | undefined;
  getNodeOutputDot: (nodeId: string) => ConnectionPoint | undefined;
  getTriggerOutputDot: (triggerId: string) => ConnectionPoint | undefined;
  
  // Lines
  lines: Map<string, ConnectionLine>;
  registerLine: (line: ConnectionLine) => void;
  unregisterLine: (id: string) => void;
  getLinesBySource: (sourceId: string) => ConnectionLine[];
  getLinesByTarget: (targetId: string) => ConnectionLine[];
  getAllLines: () => ConnectionLine[];
  
  // Debug
  debugInfo: () => void;
}

export const useConnectionRegistry = create<ConnectionRegistry>((set, get) => ({
  points: new Map(),
  lines: new Map(),
  
  // Point management
  registerPoint: (point) => {
    set((state) => {
      const newPoints = new Map(state.points);
      newPoints.set(point.id, point);
      return { points: newPoints };
    });
  },
  
  unregisterPoint: (id) => {
    set((state) => {
      const newPoints = new Map(state.points);
      newPoints.delete(id);
      return { points: newPoints };
    });
  },
  
  updatePosition: (id, position) => {
    set((state) => {
      const newPoints = new Map(state.points);
      const point = newPoints.get(id);
      if (point) {
        // Only update if position actually changed (prevent infinite loops)
        if (point.position.x === position.x && point.position.y === position.y) {
          return state; // No change, return same state to prevent re-render
        }
        newPoints.set(id, { ...point, position });
      }
      return { points: newPoints };
    });
  },
  
  getPoint: (id) => {
    return get().points.get(id);
  },
  
  getAllPoints: () => {
    return Array.from(get().points.values());
  },
  
  // Queries
  getPointsByOwner: (ownerId) => {
    return Array.from(get().points.values()).filter(
      (point) => point.ownerId === ownerId
    );
  },
  
  getStepInputDot: (stepId) => {
    return Array.from(get().points.values()).find(
      (point) => point.ownerId === stepId && point.type === 'step-input'
    );
  },
  
  getStepOutputDot: (stepId) => {
    return Array.from(get().points.values()).find(
      (point) => point.ownerId === stepId && point.type === 'step-output'
    );
  },
  
  getNodeInputDot: (nodeId) => {
    return Array.from(get().points.values()).find(
      (point) => point.ownerId === nodeId && point.type === 'node-input'
    );
  },
  
  getNodeOutputDot: (nodeId) => {
    return Array.from(get().points.values()).find(
      (point) => point.ownerId === nodeId && point.type === 'node-output'
    );
  },
  
  getTriggerOutputDot: (triggerId) => {
    return Array.from(get().points.values()).find(
      (point) => point.ownerId === triggerId && point.type === 'trigger-output'
    );
  },
  
  // Line management
  registerLine: (line) => {
    set((state) => {
      const newLines = new Map(state.lines);
      newLines.set(line.id, line);
      return { lines: newLines };
    });
  },
  
  unregisterLine: (id) => {
    set((state) => {
      const newLines = new Map(state.lines);
      newLines.delete(id);
      return { lines: newLines };
    });
  },
  
  getLinesBySource: (sourceId) => {
    return Array.from(get().lines.values()).filter(
      (line) => line.sourceId === sourceId
    );
  },
  
  getLinesByTarget: (targetId) => {
    return Array.from(get().lines.values()).filter(
      (line) => line.targetId === targetId
    );
  },
  
  getAllLines: () => {
    return Array.from(get().lines.values());
  },
  
  // Debug
  debugInfo: () => {
    const state = get();
    console.log('=== Connection Registry Debug ===');
    console.log('Total Points:', state.points.size);
    console.log('Total Lines:', state.lines.size);
    console.log('Points:', Array.from(state.points.entries()));
    console.log('Lines:', Array.from(state.lines.entries()));
  },
}));