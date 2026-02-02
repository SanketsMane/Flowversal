/**
 * Delete Confirmation Modal
 * Shows a confirmation dialog when user tries to delete nodes or triggers
 */

import { X, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useUIStore, useWorkflowStore } from '../../stores';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';

export function DeleteConfirmationModal() {
  const { theme } = useTheme();
  const { 
    isDeleteNodeConfirmOpen, 
    deleteNodeContext,
    closeDeleteNodeConfirm,
    isDeleteTriggerConfirmOpen,
    deleteTriggerContext,
    closeDeleteTriggerConfirm,
    isDeleteContainerConfirmOpen,
    deleteContainerContext,
    closeDeleteContainerConfirm,
  } = useUIStore();
  const { deleteNode, deleteTrigger, deleteContainer } = useWorkflowStore();
  const { removeNodeFromSubStep } = useSubStepStore();

  const isOpen = isDeleteNodeConfirmOpen || isDeleteTriggerConfirmOpen || isDeleteContainerConfirmOpen;
  
  if (!isOpen) return null;

  const bgColor = theme === 'dark' ? '#1A1A2E' : '#ffffff';
  const borderColor = theme === 'dark' ? '#2A2A3E' : '#E5E7EB';
  const textColor = theme === 'dark' ? '#FFFFFF' : '#111827';
  const mutedColor = theme === 'dark' ? '#CFCFE8' : '#6B7280';
  const inputBg = theme === 'dark' ? '#0E0E1F' : '#F9FAFB';

  const handleDelete = () => {
    if (isDeleteNodeConfirmOpen && deleteNodeContext) {
      // Check if this is a substep node deletion
      if (deleteNodeContext.isSubStep && deleteNodeContext.subStepId) {
        // Delete from substep
        removeNodeFromSubStep(deleteNodeContext.subStepId, deleteNodeContext.nodeId);
      } else {
        // Delete from main workflow
        deleteNode(deleteNodeContext.containerId, deleteNodeContext.nodeId);
      }
      closeDeleteNodeConfirm();
    } else if (isDeleteTriggerConfirmOpen && deleteTriggerContext) {
      deleteTrigger(deleteTriggerContext.triggerId);
      closeDeleteTriggerConfirm();
    } else if (isDeleteContainerConfirmOpen && deleteContainerContext) {
      deleteContainer(deleteContainerContext.containerId);
      closeDeleteContainerConfirm();
    }
  };

  const handleCancel = () => {
    if (isDeleteNodeConfirmOpen) {
      closeDeleteNodeConfirm();
    } else if (isDeleteTriggerConfirmOpen) {
      closeDeleteTriggerConfirm();
    } else if (isDeleteContainerConfirmOpen) {
      closeDeleteContainerConfirm();
    }
  };

  const itemName = isDeleteNodeConfirmOpen 
    ? deleteNodeContext?.nodeName 
    : isDeleteTriggerConfirmOpen
    ? deleteTriggerContext?.triggerName
    : deleteContainerContext?.containerName;
  
  const itemType = isDeleteNodeConfirmOpen ? 'Node' : isDeleteTriggerConfirmOpen ? 'Trigger' : 'Container';

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
        }}
        onClick={handleCancel}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '480px',
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          zIndex: 10001,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
            {/* Warning Icon */}
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle className="w-6 h-6" style={{ color: '#EF4444' }} />
            </div>

            {/* Title & Subtitle */}
            <div style={{ flex: 1 }}>
              <h2 style={{
                color: textColor,
                fontSize: '20px',
                fontWeight: '600',
                margin: 0,
                marginBottom: '4px',
              }}>
                Delete {itemType}
              </h2>
              <p style={{
                color: mutedColor,
                fontSize: '13px',
                margin: 0,
              }}>
                This action cannot be undone
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleCancel}
            style={{
              width: '32px',
              height: '32px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = inputBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X className="w-5 h-5" style={{ color: mutedColor }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Question */}
          <p style={{
            color: textColor,
            fontSize: '15px',
            margin: 0,
            marginBottom: '16px',
            fontWeight: '500',
          }}>
            Are you sure you want to delete this {itemType.toLowerCase()}?
          </p>

          {/* Item Name Box */}
          <div style={{
            padding: '16px',
            background: inputBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '10px',
            marginBottom: '16px',
          }}>
            <div style={{
              color: mutedColor,
              fontSize: '12px',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600',
            }}>
              {itemType} Name:
            </div>
            <div style={{
              color: textColor,
              fontSize: '15px',
              fontWeight: '600',
            }}>
              {itemName}
            </div>
          </div>

          {/* Warning Text */}
          <p style={{
            color: mutedColor,
            fontSize: '14px',
            margin: 0,
            marginBottom: '24px',
            lineHeight: '1.5',
          }}>
            This will permanently remove the {itemType.toLowerCase()} and all its configurations from the workflow.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
          }}>
            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              style={{
                padding: '12px 24px',
                background: inputBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                color: textColor,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = borderColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = inputBg;
              }}
            >
              Cancel
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              style={{
                padding: '12px 24px',
                background: '#EF4444',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#DC2626';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#EF4444';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Delete {itemType}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}