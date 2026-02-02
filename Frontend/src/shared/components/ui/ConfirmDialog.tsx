/**
 * Flowversal Confirmation Dialog
 * Beautiful confirmation modal matching the Flowversal UI style
 */

import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmDialogProps) {
  const { theme } = useTheme();

  if (!isOpen) return null;

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgSecondary = theme === 'dark' ? 'bg-[#13131F]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-200';

  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-500',
      confirmBg: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-500',
      confirmBg: 'bg-yellow-500 hover:bg-yellow-600'
    },
    info: {
      icon: AlertTriangle,
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-500',
      confirmBg: 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] hover:opacity-90'
    }
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className={`${bgCard} rounded-2xl border ${borderColor} shadow-2xl w-full max-w-md relative z-10 overflow-hidden`}>
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className={`${textPrimary} text-lg mb-2`}>{title}</h3>
              <p className={`${textSecondary} text-sm leading-relaxed`}>{message}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`p-6 pt-2 flex items-center gap-3`}>
          <button
            onClick={onCancel}
            className={`flex-1 px-4 py-2.5 ${bgSecondary} ${textSecondary} rounded-lg ${hoverBg} transition-colors`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 ${config.confirmBg} text-white rounded-lg transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
