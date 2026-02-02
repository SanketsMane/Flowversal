/**
 * Node Setup Modal Container
 * Connects UnifiedSetupModal to Zustand store for nodes
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';
import { Clock } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { UnifiedSetupModal } from './UnifiedSetupModal';
import { NodeParameters } from './parameters/NodeParameters';

export function NodeSetupModalContainer() {
  const { theme } = useTheme();
  const { isNodeSetupOpen, nodeSetupContext, closeNodeSetup } = useUIStore();
  const { containers, updateNode, triggers } = useWorkflowStore();
  const { subStepContainers, updateNodeInSubStep } = useSubStepStore();

  if (!isNodeSetupOpen || !nodeSetupContext) {
    return null;
  }

  const { containerId, nodeId } = nodeSetupContext;

  // Try to find the node in main workflow containers first
  let container = containers.find(c => c.id === containerId);
  let node = container?.nodes.find(n => n.id === nodeId);
  let isSubStepNode = false;
  let subStepId = '';

  // If not found in main containers, check sub-step containers
  if (!node) {
    const subStep = subStepContainers.find(s => s.id === containerId);
    if (subStep) {
      node = subStep.nodes.find(n => n.id === nodeId);
      isSubStepNode = true;
      subStepId = subStep.id;
      // Create a virtual container for consistency
      container = {
        id: subStep.id,
        name: subStep.name,
        description: subStep.description,
        nodes: subStep.nodes,
        expanded: true,
      };
    }
  }

  if (!node) {
    return null;
  }

  const handleSave = (config: any) => {
    if (isSubStepNode) {
      // Update node in sub-step
      updateNodeInSubStep(subStepId, nodeId, { config });
    } else {
      // Update node in main workflow
      updateNode(containerId, nodeId, { config });
    }
  };

  // Get previous nodes for INPUT panel
  const previousNodes = [];
  
  // Add triggers as previous nodes
  triggers.forEach(trigger => {
    previousNodes.push({
      id: trigger.id,
      label: trigger.label,
      icon: <Clock className="w-4 h-4" />,
      outputs: {
        timestamp: '2025-11-16T18:54:29.287+05:30',
        'Readable date': 'November 16th 2025, 6:54:29 pm',
        'Readable time': '6:54:29 pm',
        'Day of week': 'Sunday',
        Year: '2025',
        Month: 'November',
        'Day of month': '16',
        Hour: '18',
        Minute: '54',
        Second: '29',
        Timezone: 'Asia/Calcutta (UTC+05:30)'
      }
    });
  });

  // Add nodes from main workflow containers (no mock output; waiting for execution results)
  containers.forEach(cont => {
    cont.nodes.forEach(n => {
      if (n.id !== nodeId) {
        previousNodes.push({
          id: n.id,
          label: n.label,
          icon: <div>📦</div>,
          outputs: {},
        });
      }
    });
  });

  // Add nodes from sub-step containers
  subStepContainers.forEach(subStep => {
    subStep.nodes.forEach(n => {
      if (n.id !== nodeId) {
        previousNodes.push({
          id: n.id,
          label: n.label,
          icon: <div>📦</div>,
          outputs: {},
        });
      }
    });
  });

  return (
    <UnifiedSetupModal
      isOpen={isNodeSetupOpen}
      onClose={closeNodeSetup}
      item={node}
      itemType="node"
      onSave={handleSave}
      containerId={containerId}
      previousNodes={previousNodes}
      parametersContent={
        <NodeParameters
          node={node}
          onSave={handleSave}
          containerId={containerId}
          theme={theme}
        />
      }
    />
  );
}