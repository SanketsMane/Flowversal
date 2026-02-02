import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface CustomNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'error' | 'success' | 'info';
}

export function CustomNotification({ isOpen, onClose, message, type = 'error' }: CustomNotificationProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'info':
        return 'border-blue-500/30 bg-blue-500/10';
      default:
        return 'border-red-500/30 bg-red-500/10';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className={`${bgCard} rounded-xl border ${borderColor} w-full max-w-md shadow-2xl`}>
        <div className={`p-6 ${getColors()} border rounded-xl`}>
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1">
              <p className={`${textColor}`}>{message}</p>
            </div>
            <button
              onClick={onClose}
              className={`flex-shrink-0 w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:shadow-lg transition-all"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
