/**
 * Close Workflow Dialog
 * Dialog for closing workflow with unsaved changes warning
 */

import { X, Save } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface CloseWorkflowDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onSaveAndClose: () => void;
  onCloseWithoutSaving: () => void;
  onCancel?: () => void;
  onDirectClose?: () => void;
}

export function CloseWorkflowDialog({
  isOpen,
  onClose,
  onSaveAndClose,
  onCloseWithoutSaving,
  onCancel,
}: CloseWorkflowDialogProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleClose = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop with 70% opacity and blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        style={{ maxWidth: '420px' }}
      >
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900">Close Workflow?</h2>
          
          {/* Message */}
          <p className="text-sm text-gray-600">
            You have unsaved changes. What would you like to do?
          </p>

          {/* Save & Close Button */}
          <button
            onClick={() => {
              onSaveAndClose();
            }}
            className="w-full px-6 py-3 rounded-lg font-medium text-white transition-all shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #00C6FF 0%, #9D50BB 100%)',
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Save & Close
            </div>
          </button>

          {/* Close Without Saving Button */}
          <button
            onClick={() => {
              onCloseWithoutSaving();
            }}
            className="w-full px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Close Without Saving
          </button>

          {/* Cancel Button */}
          <button
            onClick={handleClose}
            className="w-full px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}