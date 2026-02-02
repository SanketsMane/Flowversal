/**
 * Delete Trigger Confirmation Container
 * App-level container for trigger deletion confirmation
 */

import { useUIStore, useWorkflowStore } from '../../stores';
import { DeleteConfirmationDialog } from '../dialogs/DeleteConfirmationDialog';

export function DeleteTriggerConfirmContainer() {
  const { isDeleteTriggerConfirmOpen, deleteTriggerContext, closeDeleteTriggerConfirm } = useUIStore();
  const { deleteTrigger, triggers } = useWorkflowStore();

  if (!isDeleteTriggerConfirmOpen || !deleteTriggerContext) return null;

  const trigger = triggers.find(t => t.id === deleteTriggerContext.triggerId);
  if (!trigger) return null;

  const handleConfirm = () => {
    deleteTrigger(deleteTriggerContext.triggerId);
    closeDeleteTriggerConfirm();
  };

  return (
    <DeleteConfirmationDialog
      isOpen={true}
      onClose={closeDeleteTriggerConfirm}
      onConfirm={handleConfirm}
      title="Delete Trigger"
      itemName={trigger.label}
      itemType="trigger"
    />
  );
}
