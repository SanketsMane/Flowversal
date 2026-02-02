/**
 * Condition Group Modal
 * Flowversal-styled modal for adding OR condition groups
 */

import React from 'react';
import { X } from 'lucide-react';

interface ConditionGroupModalProps {
  onClose: () => void;
  onAddGroup: (conditions: any[]) => void;
}

export function ConditionGroupModal({ onClose, onAddGroup }: ConditionGroupModalProps) {
  const bgOverlay = 'bg-black/50';
  const bgCard = 'bg-[#2A2A4E]'; // Dark navy for modal
  const borderColor = 'border-[#3A3A5E]';
  const textPrimary = 'text-white';
  const textSecondary = 'text-[#CFCFE8]';

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center ${bgOverlay} backdrop-blur-sm`}>
      <div className={`${bgCard} rounded-2xl border ${borderColor} shadow-2xl w-full max-w-md mx-4`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <h3 className={`${textPrimary} text-lg font-medium`}>Condition Groups (OR)</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${textSecondary} hover:bg-[#00C6FF]/10 transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#3A3A5E] flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <p className={`${textPrimary} text-lg mb-2`}>Coming Soon</p>
          <p className={`${textSecondary} text-sm`}>
            Condition Groups (OR) will be implemented in the next phase
          </p>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor}`}>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl bg-[#00C6FF] text-white hover:bg-[#00B5EE] transition-all font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}