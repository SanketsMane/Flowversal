/**
 * Selection Store - UI Selection State Management
 * Phase 1 Refactor
 * 
 * Manages what is currently selected in the workflow builder
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type SelectionType = 
  | { type: 'trigger'; index: number }
  | { type: 'node'; containerIndex: number; nodeIndex: number }
  | { type: 'tool'; containerIndex: number; nodeIndex: number; toolIndex: number }
  | { 
      type: 'conditionalNode'; 
      containerIndex: number; 
      nodeIndex: number; 
      branch: 'true' | 'false'; 
      conditionalNodeIndex: number;
    }
  | { type: 'container'; containerIndex: number }
  | null;

interface SelectionState {
  selection: SelectionType;
  
  // Actions
  selectTrigger: (index: number) => void;
  selectNode: (containerIndex: number, nodeIndex: number) => void;
  selectTool: (containerIndex: number, nodeIndex: number, toolIndex: number) => void;
  selectConditionalNode: (containerIndex: number, nodeIndex: number, branch: 'true' | 'false', conditionalNodeIndex: number) => void;
  selectContainer: (containerIndex: number) => void;
  clearSelection: () => void;
  
  // Getters
  getSelectedTrigger: () => number | null;
  getSelectedNode: () => { containerIndex: number; nodeIndex: number } | null;
  getSelectedTool: () => { containerIndex: number; nodeIndex: number; toolIndex: number } | null;
  getSelectedConditionalNode: () => { containerIndex: number; nodeIndex: number; branch: 'true' | 'false'; conditionalNodeIndex: number } | null;
  isSelected: (type: string, ...indices: number[]) => boolean;
}

export const useSelectionStore = create<SelectionState>()(
  devtools(
    (set, get) => ({
      selection: null,

      // Actions
      selectTrigger: (index) => set({ 
        selection: { type: 'trigger', index } 
      }),

      selectNode: (containerIndex, nodeIndex) => set({ 
        selection: { type: 'node', containerIndex, nodeIndex } 
      }),

      selectTool: (containerIndex, nodeIndex, toolIndex) => set({ 
        selection: { type: 'tool', containerIndex, nodeIndex, toolIndex } 
      }),

      selectConditionalNode: (containerIndex, nodeIndex, branch, conditionalNodeIndex) => set({ 
        selection: { type: 'conditionalNode', containerIndex, nodeIndex, branch, conditionalNodeIndex } 
      }),

      selectContainer: (containerIndex) => set({ 
        selection: { type: 'container', containerIndex } 
      }),

      clearSelection: () => set({ selection: null }),

      // Getters
      getSelectedTrigger: () => {
        const { selection } = get();
        return selection?.type === 'trigger' ? selection.index : null;
      },

      getSelectedNode: () => {
        const { selection } = get();
        return selection?.type === 'node' 
          ? { containerIndex: selection.containerIndex, nodeIndex: selection.nodeIndex }
          : null;
      },

      getSelectedTool: () => {
        const { selection } = get();
        return selection?.type === 'tool'
          ? { containerIndex: selection.containerIndex, nodeIndex: selection.nodeIndex, toolIndex: selection.toolIndex }
          : null;
      },

      getSelectedConditionalNode: () => {
        const { selection } = get();
        return selection?.type === 'conditionalNode'
          ? { 
              containerIndex: selection.containerIndex, 
              nodeIndex: selection.nodeIndex, 
              branch: selection.branch,
              conditionalNodeIndex: selection.conditionalNodeIndex 
            }
          : null;
      },

      isSelected: (type, ...indices) => {
        const { selection } = get();
        if (!selection || selection.type !== type) return false;

        switch (type) {
          case 'trigger':
            return selection.type === 'trigger' && selection.index === indices[0];
          case 'node':
            return selection.type === 'node' && 
                   selection.containerIndex === indices[0] && 
                   selection.nodeIndex === indices[1];
          case 'tool':
            return selection.type === 'tool' && 
                   selection.containerIndex === indices[0] && 
                   selection.nodeIndex === indices[1] && 
                   selection.toolIndex === indices[2];
          case 'conditionalNode':
            return selection.type === 'conditionalNode' && 
                   selection.containerIndex === indices[0] && 
                   selection.nodeIndex === indices[1] && 
                   selection.conditionalNodeIndex === indices[2];
          case 'container':
            return selection.type === 'container' && selection.containerIndex === indices[0];
          default:
            return false;
        }
      },
    }),
    { name: 'SelectionStore' }
  )
);
