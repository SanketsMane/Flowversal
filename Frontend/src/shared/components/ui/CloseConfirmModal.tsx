import { useTheme } from '../ThemeContext';

interface CloseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseWithoutSaving: () => void;
  onSaveAndClose: () => void;
}

export function CloseConfirmModal({ 
  isOpen, 
  onClose, 
  onCloseWithoutSaving, 
  onSaveAndClose 
}: CloseConfirmModalProps) {
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className={`${bgCard} rounded-xl border ${borderColor} w-full max-w-md shadow-2xl`}>
        <div className="p-6">
          <h3 className={`text-xl ${textColor} mb-2`}>Close Workflow Builder?</h3>
          <p className={`${textSecondary} text-sm mb-6`}>
            You have unsaved changes. Do you want to save before closing?
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={onSaveAndClose}
              className="w-full py-3 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:shadow-lg transition-all text-center"
            >
              Save & Close
            </button>
            <button
              onClick={onCloseWithoutSaving}
              className={`w-full py-3 border ${borderColor} ${textColor} rounded-lg hover:border-cyan-500 transition-all text-center`}
            >
              Close Without Saving
            </button>
            <button
              onClick={onClose}
              className={`w-full py-3 ${textSecondary} hover:${textColor} transition-colors text-center`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
