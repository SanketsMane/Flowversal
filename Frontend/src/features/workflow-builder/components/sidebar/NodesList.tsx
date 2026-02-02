/**
 * Nodes List Component
 * Phase 2 - Component Extraction
 * 
 * Displays hierarchical list of available node templates
 * Uses existing HierarchicalNodePanel
 */

import { useState } from 'react';
import { HierarchicalNodePanel } from '../../../../components/workflow-builder/HierarchicalNodePanel';
import { useWorkflowStore } from '../../stores';
import { useWorkflow, useUIStore } from '../../index';

export function NodesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { addNodeFromTemplate } = useWorkflow();
  const { showNotification } = useUIStore();
  const { containers } = useWorkflowStore();

  const handleNodeClick = (nodeType: string) => {
    if (containers.length === 0) {
      showNotification('Please add a workflow step first', 'info');
      return;
    }

    // Add to first container by default
    addNodeFromTemplate(containers[0].id, nodeType);
  };

  return (
    <HierarchicalNodePanel
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNodeClick={handleNodeClick}
    />
  );
}