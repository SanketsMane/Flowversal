import { CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}

export function ConfirmationPopup({
  isOpen,
  onClose,
  title = 'Success',
  message,
  buttonText = 'OK'
}: ConfirmationPopupProps) {
  const { theme } = useTheme();

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      }}
      onClick={onClose}
    >
      <div
        className={`${bgCard} rounded-xl border ${borderColor} shadow-2xl w-full max-w-md transform transition-all animate-in fade-in-0 zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div className="p-6 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#00C6FF]" />
            </div>
          </div>

          {/* Title */}
          <h3 className={`${textPrimary} text-xl mb-2`}>
            {title}
          </h3>

          {/* Message */}
          <p className={`${textSecondary} text-sm mb-6`}>
            {message}
          </p>

          {/* OK Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
