/**
 * Condition Builder Modal Wrapper
 * Window-level modal for configuring conditions in If/Switch nodes
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { useUIStore, useWorkflowStore } from '../../stores';
import { ConditionBuilder } from './ConditionBuilder';

export function ConditionBuilderModal() {
  const { theme } = useTheme();
  const { isConditionBuilderOpen, conditionBuilderContext, closeConditionBuilder } = useUIStore();
  const { containers, updateNode } = useWorkflowStore();

  if (!isConditionBuilderOpen || !conditionBuilderContext) return null;

  const container = containers.find(c => c.id === conditionBuilderContext.containerId);
  if (!container) return null;

  const node = container.nodes.find(n => n.id === conditionBuilderContext.nodeId);
  if (!node) return null;

  const conditionGroups = node.config.conditionGroups || [{
    id: `group-${Date.now()}`,
    conditions: [{
      id: `cond-${Date.now()}`,
      leftOperand: '',
      operator: 'equals',
      rightOperand: '',
      dataType: 'string'
    }],
    logicalOperator: 'AND',
    convertTypes: false
  }];

  const convertTypes = node.config.convertTypes || false;

  const handleUpdate = (groups: any) => {
    updateNode(container.id, node.id, {
      config: {
        ...node.config,
        conditionGroups: groups,
      },
    });
  };

  const handleConvertTypesChange = (value: boolean) => {
    updateNode(container.id, node.id, {
      config: {
        ...node.config,
        convertTypes: value,
      },
    });
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ 
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
      }}
      onClick={closeConditionBuilder}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <ConditionBuilder
          conditionGroups={conditionGroups}
          onUpdate={handleUpdate}
          convertTypes={convertTypes}
          onConvertTypesChange={handleConvertTypesChange}
          onClose={closeConditionBuilder}
        />
      </div>
    </div>
  );
}