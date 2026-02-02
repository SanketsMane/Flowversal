/**
 * Sub-Step Store
 * Manages sub-step containers attached to workflow nodes
 * Sub-steps are full containers (like workflow steps) positioned to the right
 */

import { create } from 'zustand';
import { WorkflowNode } from '../types';

export interface SubStepContainer {
  id: string;
  parentNodeId: string; // The node this sub-step is connected to
  parentContainerId: string; // The main container ID
  name: string;
  description: string;
  nodes: WorkflowNode[];
  expanded: boolean;
  position: { x: number; y: number }; // Absolute position on canvas
}

interface SubStepStore {
  // State
  subStepContainers: SubStepContainer[];
  hoveredNodeId: string | null; // Track which node's dot is being hovered

  // Actions
  addSubStepContainer: (parentNodeId: string, parentContainerId: string) => void;
  removeSubStepContainer: (subStepId: string) => void;
  updateSubStepContainer: (subStepId: string, updates: Partial<SubStepContainer>) => void;
  getSubStepsForNode: (nodeId: string) => SubStepContainer[];
  setHoveredNodeId: (nodeId: string | null) => void;
  
  // Node management within sub-steps
  addNodeToSubStep: (subStepId: string, node: WorkflowNode) => void;
  removeNodeFromSubStep: (subStepId: string, nodeId: string) => void;
  updateNodeInSubStep: (subStepId: string, nodeId: string, updates: Partial<WorkflowNode>) => void;
  toggleNodeInSubStep: (subStepId: string, nodeId: string) => void;
}

export const useSubStepStore = create<SubStepStore>((set, get) => ({
  subStepContainers: [],
  hoveredNodeId: null,

  addSubStepContainer: (parentNodeId: string, parentContainerId: string) => {
    const newSubStep: SubStepContainer = {
      id: `substep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      parentNodeId,
      parentContainerId,
      name: 'Sub-step',
      description: 'Add actions to this sub-step',
      nodes: [],
      expanded: true,
      position: { x: 0, y: 0 }, // Default position
    };

    set((state) => ({
      subStepContainers: [...state.subStepContainers, newSubStep],
    }));
  },

  removeSubStepContainer: (subStepId: string) => {
    set((state) => ({
      subStepContainers: state.subStepContainers.filter((s) => s.id !== subStepId),
    }));
  },

  updateSubStepContainer: (subStepId: string, updates: Partial<SubStepContainer>) => {
    set((state) => ({
      subStepContainers: state.subStepContainers.map((s) => {
        if (s.id === subStepId) {
          const updated = { ...s, ...updates };
          // Sanitize nodes array if it's being updated
          if (updates.nodes) {
            updated.nodes = updates.nodes.filter((n) => n && n.id);
          }
          return updated;
        }
        return s;
      }),
    }));
  },

  getSubStepsForNode: (nodeId: string) => {
    return get().subStepContainers.filter((s) => s.parentNodeId === nodeId);
  },

  setHoveredNodeId: (nodeId: string | null) => {
    set({ hoveredNodeId: nodeId });
  },

  // Node management
  addNodeToSubStep: (subStepId: string, node: WorkflowNode) => {
    // Defensive check: ensure node is valid
    if (!node || !node.id) {
      console.error('❌ Cannot add invalid node to substep:', node);
      return;
    }

    set((state) => ({
      subStepContainers: state.subStepContainers.map((s) =>
        s.id === subStepId
          ? { ...s, nodes: [...s.nodes, node] }
          : s
      ),
    }));
  },

  removeNodeFromSubStep: (subStepId: string, nodeId: string) => {
    set((state) => ({
      subStepContainers: state.subStepContainers.map((s) =>
        s.id === subStepId
          ? { ...s, nodes: s.nodes.filter((n) => n && n.id && n.id !== nodeId) }
          : s
      ),
    }));
  },

  updateNodeInSubStep: (subStepId: string, nodeId: string, updates: Partial<WorkflowNode>) => {
    set((state) => ({
      subStepContainers: state.subStepContainers.map((s) =>
        s.id === subStepId
          ? {
              ...s,
              nodes: s.nodes
                .filter((n) => n && n.id) // Filter out invalid nodes
                .map((n) =>
                  n.id === nodeId ? { ...n, ...updates } : n
                ),
            }
          : s
      ),
    }));
  },

  toggleNodeInSubStep: (subStepId: string, nodeId: string) => {
    set((state) => ({
      subStepContainers: state.subStepContainers.map((s) =>
        s.id === subStepId
          ? {
              ...s,
              nodes: s.nodes
                .filter((n) => n && n.id) // Filter out invalid nodes
                .map((n) =>
                  n.id === nodeId ? { ...n, enabled: !n.enabled } : n
                ),
            }
          : s
      ),
    }));
  },
}));