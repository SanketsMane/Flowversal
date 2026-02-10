/**
 * Save Workflow Button Component
 * Saves workflow to Node.js backend API
 */
import { Check, Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { getAuthHeaders } from '../../../../core/api/api.config';
import { useAuthStore } from '../../../../storess/core/authStore';
import { useUserStore } from '../../../../storess/core/userStore';
import { useWorkflowRegistryStore } from '../../../../storess/core/workflowRegistryStore';
import { createWorkflow, indexWorkflow, updateWorkflow } from '../../../../utils/api/workflows';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowStore } from '../../stores/workflowStore';
interface SaveWorkflowButtonProps {
  workflowId?: string; // If editing existing workflow
  onSaveSuccess?: (workflowId: string) => void; // Callback when save succeeds
}
export function SaveWorkflowButton({ workflowId, onSaveSuccess }: SaveWorkflowButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const workflowState = useWorkflowStore();
  const workflowRegistry = useWorkflowRegistryStore();
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const uiStore = useUIStore();
  const handleSave = async () => {
    const user = authStore.user;
    if (!user) {
      uiStore.showNotification('Please log in to save workflows', 'error');
      return;
    }
    // Validate workflow has content
    if (!workflowState.workflowName.trim()) {
      uiStore.showNotification('Please enter a workflow name', 'error');
      return;
    }
    if (workflowState.triggers.length === 0 && workflowState.containers.length === 0) {
      uiStore.showNotification('Please add at least one trigger or step to the workflow', 'error');
      return;
    }
    setIsSaving(true);
    try {
      // Get access token
      const headers = await getAuthHeaders();
      const accessToken = headers['Authorization']?.replace('Bearer ', '') || '';
      // Prepare workflow data
      const workflowData = {
        name: workflowState.workflowName,
        description: workflowState.workflowDescription || '',
        data: {
          triggers: workflowState.triggers,
          containers: workflowState.containers,
          formFields: workflowState.formFields || [],
          triggerLogic: workflowState.triggerLogic || [],
        },
        tags: workflowState.workflowMetadata?.tags || [],
      };
      let savedWorkflowId = workflowId;
      if (workflowId) {
        // Update existing workflow
        const result = await updateWorkflow(accessToken, workflowId, workflowData);
        if (!result.success) {
          throw new Error(result.error || 'Failed to update workflow');
        }
        // Update local registry
        workflowRegistry.updateWorkflow(workflowId, {
          name: workflowState.workflowName,
          description: workflowState.workflowDescription,
          triggers: workflowState.triggers,
          containers: workflowState.containers,
          formFields: workflowState.formFields,
        });
        uiStore.showNotification('Workflow updated successfully', 'success');
      } else {
        // Create new workflow
        const result = await createWorkflow(accessToken, workflowData);
        if (!result.success || !result.workflow) {
          throw new Error(result.error || 'Failed to create workflow');
        }
        savedWorkflowId = result.workflow.id;
        // Update local registry
        workflowRegistry.saveWorkflow({
          id: savedWorkflowId,
          name: workflowState.workflowName,
          description: workflowState.workflowDescription,
          userId: user.id,
          userName: user.name,
          triggers: workflowState.triggers,
          containers: workflowState.containers,
          formFields: workflowState.formFields,
          status: 'draft',
          isPublic: false,
          tags: workflowData.tags,
        });
        // Increment user's workflow count
        userStore.incrementWorkflowCreated(user.id);
        // Auto-index to Pinecone for semantic search
        try {
          await indexWorkflow(
            accessToken,
            savedWorkflowId,
            workflowState.workflowName,
            workflowState.workflowDescription,
            workflowData.tags
          );
        } catch (indexError) {
          console.warn('[Save Workflow] Failed to index workflow (non-critical):', indexError);
          // Don't fail the save if indexing fails
        }
        uiStore.showNotification('Workflow saved successfully', 'success');
        // Call success callback if provided
        if (onSaveSuccess) {
          onSaveSuccess(savedWorkflowId);
        }
      }
      // Show success feedback
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (error: any) {
      console.error('[Save Workflow] Failed to save workflow:', error);
      uiStore.showNotification(
        `Failed to save workflow: ${error.message || 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };
  const hasChanges = 
    workflowState.triggers.length > 0 || 
    workflowState.containers.some(c => c.nodes.length > 0) ||
    workflowState.formFields.length > 0;
  return (
    <Button
      onClick={handleSave}
      disabled={!hasChanges || isSaving || justSaved}
      className={`gap-2 ${
        justSaved
          ? 'bg-green-500 hover:bg-green-600'
          : 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:opacity-90'
      }`}
    >
      {justSaved ? (
        <>
          <Check className="w-4 h-4" />
          Saved!
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : workflowId ? 'Update' : 'Save Workflow'}
        </>
      )}
    </Button>
  );
}