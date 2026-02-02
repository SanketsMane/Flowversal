/**
 * Connection Store - FRESH REWRITE v2 - CACHE BUST 2025
 * Phase 3 - New Connection System
 * 
 * Manages both automatic (left) and manual (right) connections
 * Integrated with undo/redo history
 * 
 * COMPLETE FRESH FILE - Cache busted! TIMESTAMP: 2025-01-24T10:30:00Z
 */

import { create } from 'zustand';
import { useWorkflowStore } from './workflowStore';

export interface Connection {
  id: string;
  sourceId: string;
  sourceType: 'trigger' | 'step' | 'node';
  targetId: string;
  targetType: 'trigger' | 'step' | 'node';
  connectionType: 'automatic' | 'manual';
  side: 'left' | 'right';
  // For conditional nodes (If/Switch)
  branchOutput?: string;
}

interface DragConnection {
  isActive: boolean;
  sourceId: string | null;
  sourceType: 'trigger' | 'step' | 'node' | null;
  branchOutput?: string;
  mousePosition: { x: number; y: number } | null;
}

interface ConnectionState {
  connections: Connection[];
  dragConnection: DragConnection;
  
  // Actions
  addConnection: (connection: Omit<Connection, 'id'>) => void;
  removeConnection: (connectionId: string) => void;
  startDragConnection: (
    sourceId: string, 
    sourceType: 'trigger' | 'step' | 'node', 
    branchOutput?: string
  ) => void;
  updateDragPosition: (position: { x: number; y: number }) => void;
  endDragConnection: (targetId?: string, targetType?: 'trigger' | 'step' | 'node') => void;
  cancelDragConnection: () => void;
  clearConnections: () => void;
  getConnectionsForNode: (nodeId: string, side?: 'left' | 'right') => Connection[];
}

console.log('🟢 NEW ConnectionStore LOADING... [CACHE BUST 2025]');

export const useConnectionStore = create<ConnectionState>((set, get) => {
  console.log('🟢 NEW ConnectionStore CREATING... [CACHE BUST 2025]');
  
  return {
    connections: [],
    dragConnection: {
      isActive: false,
      sourceId: null,
      sourceType: null,
      mousePosition: null,
    },

    addConnection: (connection) => {
      console.log('🟢 addConnection', connection);
      
      // REMOVED: No validation - allow multiple connections to the same target!
      // Users can now connect multiple outputs to the same input
      
      const newConnection: Connection = {
        ...connection,
        id: `conn-${Date.now()}-${Math.random()}`,
      };
      
      console.log('✅ Adding connection (multiple connections allowed):', newConnection);
      
      set((state) => ({
        connections: [...state.connections, newConnection],
      }));
      
      const workflowStore = useWorkflowStore.getState();
      workflowStore.setWorkflowName(workflowStore.workflowName);
    },

    removeConnection: (connectionId) => {
      console.log('🟢 removeConnection', connectionId);
      set((state) => ({
        connections: state.connections.filter((c) => c.id !== connectionId),
      }));
      
      const workflowStore = useWorkflowStore.getState();
      workflowStore.setWorkflowName(workflowStore.workflowName);
    },

    startDragConnection: (sourceId, sourceType, branchOutput) => {
      console.log('🟢 startDragConnection', { sourceId, sourceType, branchOutput });
      set({
        dragConnection: {
          isActive: true,
          sourceId,
          sourceType,
          branchOutput,
          mousePosition: null,
        },
      });
    },

    updateDragPosition: (position) => {
      set((state) => ({
        dragConnection: {
          ...state.dragConnection,
          mousePosition: position,
        },
      }));
    },

    endDragConnection: (targetId, targetType) => {
      console.log('🟢 endDragConnection', { targetId, targetType });
      const { dragConnection, addConnection } = get();
      
      if (dragConnection.sourceId && targetId && dragConnection.sourceType && targetType) {
        addConnection({
          sourceId: dragConnection.sourceId,
          sourceType: dragConnection.sourceType,
          targetId,
          targetType,
          connectionType: 'manual',
          side: 'right',
          branchOutput: dragConnection.branchOutput,
        });
      }
      
      set({
        dragConnection: {
          isActive: false,
          sourceId: null,
          sourceType: null,
          mousePosition: null,
        },
      });
    },

    cancelDragConnection: () => {
      console.log('🟢 cancelDragConnection - THIS SHOULD WORK! [v2025]');
      set({
        dragConnection: {
          isActive: false,
          sourceId: null,
          sourceType: null,
          mousePosition: null,
        },
      });
    },

    clearConnections: () => {
      console.log('🟢 clearConnections');
      set({ connections: [] });
    },

    getConnectionsForNode: (nodeId, side) => {
      const state = get();
      return state.connections.filter((c) => {
        const matches = c.sourceId === nodeId || c.targetId === nodeId;
        if (!matches) return false;
        if (side) {
          return c.side === side;
        }
        return true;
      });
    },
  };
});

console.log('🟢 NEW ConnectionStore LOADED! [CACHE BUST 2025]', { 
  cancelExists: typeof useConnectionStore.getState().cancelDragConnection === 'function',
  timestamp: new Date().toISOString()
});