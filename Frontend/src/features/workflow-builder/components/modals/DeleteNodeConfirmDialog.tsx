/**
 * Delete Node Confirmation Dialog
 * Custom confirmation dialog for deleting nodes
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteNodeConfirmDialogProps {
  isOpen: boolean;
  nodeName: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme?: 'dark' | 'light';
}

export function DeleteNodeConfirmDialog({ 
  isOpen, 
  nodeName, 
  onConfirm, 
  onCancel,
  theme = 'dark'
}: DeleteNodeConfirmDialogProps) {
  if (!isOpen) return null;

  const bgModal = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className={`${bgModal} rounded-xl border ${borderColor} shadow-2xl w-full max-w-md relative z-10`}
      >
        {/* Header */}
        <div className={`${bgCard} border-b ${borderColor} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className={`${textPrimary} font-semibold`}>Delete Node</h2>
              <p className={`${textSecondary} text-xs`}>This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className={`${textSecondary} hover:text-white transition-colors p-1`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`${textPrimary} mb-2`}>
            Are you sure you want to delete this node?
          </p>
          <div className={`${bgCard} border ${borderColor} rounded-lg p-3 mb-4`}>
            <p className={`${textSecondary} text-xs mb-1`}>Node Name:</p>
            <p className={`${textPrimary} font-medium`}>{nodeName}</p>
          </div>
          <p className={`${textSecondary} text-sm`}>
            This will permanently remove the node and all its configurations from the workflow.
          </p>
        </div>

        {/* Actions */}
        <div className={`${bgCard} border-t ${borderColor} px-6 py-4 flex items-center justify-end gap-3`}>
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg ${bgCard} border ${borderColor} ${textPrimary} hover:bg-white/5 transition-all`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
          >
            Delete Node
          </button>
        </div>
      </div>
    </div>
  );
}
