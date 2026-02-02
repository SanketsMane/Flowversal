/**
 * Delete Confirmation Dialog
 * Reusable confirmation dialog for delete actions
 */

import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType: 'node' | 'trigger' | 'member' | 'substep';
  warningMessage?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  warningMessage,
}: DeleteConfirmationDialogProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getWarningMessage = () => {
    if (warningMessage) return warningMessage;
    
    switch (itemType) {
      case 'trigger':
        return 'This will permanently remove the trigger and all its configurations from the workflow.';
      case 'member':
        return 'This will permanently remove the member from your team. They will lose access immediately.';
      case 'substep':
        return 'This will permanently remove the sub-step and all its actions from the workflow.';
      case 'node':
      default:
        return 'This will permanently remove the node and all its configurations from the workflow.';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop with 70% opacity */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
        style={{ maxWidth: '480px' }}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          
          {/* Title and Subtitle */}
          <div className="flex-1 pt-1">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Question */}
          <p className="text-lg text-gray-900">
            Are you sure you want to delete this {itemType}?
          </p>

          {/* Item Name Box */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">
              {itemType === 'trigger' 
                ? 'Trigger Name:' 
                : itemType === 'member' 
                ? 'Member Name:' 
                : itemType === 'substep'
                ? 'Sub-Step Name:'
                : 'Node Name:'}
            </p>
            <p className="text-base font-medium text-gray-900">{itemName}</p>
          </div>

          {/* Warning Message */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {getWarningMessage()}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
            >
              Delete {itemType === 'trigger' ? 'Trigger' : itemType === 'member' ? 'Member' : itemType === 'substep' ? 'Sub-Step' : 'Node'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}