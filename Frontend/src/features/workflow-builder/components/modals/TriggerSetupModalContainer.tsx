/**
 * Trigger Setup Modal Container
 * Connects UnifiedSetupModal to Zustand store for triggers
 */

import { UnifiedSetupModal } from './UnifiedSetupModal';
import { TriggerParameters } from './parameters/TriggerParameters';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useTheme } from '@/core/theme/ThemeContext';

export function TriggerSetupModalContainer() {
  const { theme } = useTheme();
  const { isTriggerSetupOpen, triggerSetupContext, closeTriggerSetup } = useUIStore();
  const { triggers, updateTrigger } = useWorkflowStore();

  if (!isTriggerSetupOpen || !triggerSetupContext) {
    return null;
  }

  const { triggerId } = triggerSetupContext;
  const trigger = triggers.find(t => t.id === triggerId);

  if (!trigger) {
    return null;
  }

  const handleSave = (config: any) => {
    updateTrigger(triggerId, { config });
  };

  // Triggers don't have previous nodes (they are the start)
  const previousNodes: any[] = [];

  return (
    <UnifiedSetupModal
      isOpen={isTriggerSetupOpen}
      onClose={closeTriggerSetup}
      item={trigger}
      itemType="trigger"
      onSave={handleSave}
      previousNodes={previousNodes}
      parametersContent={
        <TriggerParameters
          trigger={trigger}
          onSave={handleSave}
          theme={theme}
        />
      }
    />
  );
}