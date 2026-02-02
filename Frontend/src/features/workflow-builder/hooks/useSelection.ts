/**
 * useSelection Hook - Selection Management
 * Phase 1 Refactor
 * 
 * Simplifies selection logic with helper functions
 */

import { useSelectionStore } from '../stores/selectionStore';
import { useUIStore } from '../stores/uiStore';

export function useSelection() {
  const selectionStore = useSelectionStore();
  const { expandRightPanel, minimizeRightPanel } = useUIStore();

  /**
   * Select a trigger and open the right panel
   */
  const selectTrigger = (index: number) => {
    selectionStore.selectTrigger(index);
    expandRightPanel();
  };

  /**
   * Select a node and open the right panel
   */
  const selectNode = (containerIndex: number, nodeIndex: number) => {
    selectionStore.selectNode(containerIndex, nodeIndex);
    expandRightPanel();
  };

  /**
   * Select a tool and open the right panel
   */
  const selectTool = (containerIndex: number, nodeIndex: number, toolIndex: number) => {
    selectionStore.selectTool(containerIndex, nodeIndex, toolIndex);
    expandRightPanel();
  };

  /**
   * Select a conditional node and open the right panel
   */
  const selectConditionalNode = (
    containerIndex: number, 
    nodeIndex: number, 
    branch: 'true' | 'false', 
    conditionalNodeIndex: number
  ) => {
    selectionStore.selectConditionalNode(containerIndex, nodeIndex, branch, conditionalNodeIndex);
    expandRightPanel();
  };

  /**
   * Clear selection and minimize right panel
   */
  const clearSelection = () => {
    selectionStore.clearSelection();
    minimizeRightPanel();
  };

  return {
    ...selectionStore,
    selectTrigger,
    selectNode,
    selectTool,
    selectConditionalNode,
    clearSelection,
  };
}
