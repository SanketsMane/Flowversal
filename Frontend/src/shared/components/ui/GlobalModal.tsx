/**
 * Global Modal Component - Flowversal UI
 * App-level modal with blurred background and gradient styling
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X, HelpCircle } from 'lucide-react';
import { useModal } from '@/core/stores/ModalContext';
import { useTheme } from '@/core/theme/ThemeContext';

export function GlobalModal() {
  const { modalState, closeModal } = useModal();
  const { theme } = useTheme();
  const [promptValue, setPromptValue] = useState('');

  const isDark = theme === 'dark';

  useEffect(() => {
    if (modalState.isOpen && modalState.type === 'prompt') {
      setPromptValue(modalState.promptOptions?.defaultValue || '');
    }
  }, [modalState.isOpen, modalState.type, modalState.promptOptions?.defaultValue]);

  if (!modalState.isOpen) return null;

  const getIcon = () => {
    switch (modalState.type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-400" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-16 h-16 text-yellow-400" />;
      case 'confirm':
        return <AlertTriangle className="w-16 h-16 text-orange-400" />;
      case 'prompt':
        return <HelpCircle className="w-16 h-16 text-blue-400" />;
      case 'info':
      default:
        return <Info className="w-16 h-16 text-blue-400" />;
    }
  };

  const getColors = () => {
    switch (modalState.type) {
      case 'success':
        return {
          border: 'border-green-500/30',
          bg: 'bg-green-500/10',
          text: 'text-green-400',
        };
      case 'error':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-500/10',
          text: 'text-red-400',
        };
      case 'warning':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-400',
        };
      case 'confirm':
        return {
          border: 'border-orange-500/30',
          bg: 'bg-orange-500/10',
          text: 'text-orange-400',
        };
      case 'prompt':
      case 'info':
      default:
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
        };
    }
  };

  const colors = getColors();

  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    } else {
      closeModal();
    }
  };

  const handleCancel = () => {
    if (modalState.onCancel) {
      modalState.onCancel();
    } else {
      closeModal();
    }
  };

  const handlePromptSubmit = () => {
    if (modalState.onPromptSubmit) {
      modalState.onPromptSubmit(promptValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && modalState.type !== 'prompt') {
      e.preventDefault();
      handleConfirm();
    }
  };

  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePromptSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Theme-based styling
  const bgOverlay = 'bg-black/70';
  const bgCard = isDark ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = isDark ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = isDark ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const inputBorder = isDark ? 'border-[#2A2A3E]' : 'border-gray-300';
  const inputText = isDark ? 'text-white' : 'text-gray-900';
  const hoverClose = isDark ? 'hover:text-white hover:bg-white/10' : 'hover:text-gray-900 hover:bg-gray-100';

  return (
    <div
      className={`fixed inset-0 ${bgOverlay} backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200`}
      onClick={handleCancel}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        className={`${bgCard} border ${borderColor} rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className={`absolute top-4 right-4 ${textSecondary} ${hoverClose} rounded-lg p-1 transition-all`}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`${colors.bg} ${colors.border} border-2 rounded-full p-5 mb-5`}>
            {getIcon()}
          </div>
          <h2 id="modal-title" className={`text-2xl ${textPrimary} mb-3`}>
            {modalState.title}
          </h2>
        </div>

        {/* Message */}
        <p id="modal-description" className={`${textSecondary} text-center mb-6 whitespace-pre-line leading-relaxed`}>
          {modalState.message}
        </p>

        {/* Prompt Input */}
        {modalState.type === 'prompt' && (
          <div className="mb-6">
            <input
              type={modalState.promptOptions?.inputType || 'text'}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={handlePromptKeyDown}
              placeholder={modalState.promptOptions?.placeholder || ''}
              className={`w-full px-4 py-3 ${inputBg} border ${inputBorder} ${inputText} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6FF]/50 focus:border-[#00C6FF] transition-all`}
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {modalState.type === 'confirm' || modalState.type === 'prompt' ? (
            <>
              <button
                onClick={handleCancel}
                className={`flex-1 px-6 py-3 rounded-lg border ${borderColor} ${textSecondary} ${isDark ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100'} transition-all`}
              >
                {modalState.cancelText || 'Cancel'}
              </button>
              <button
                onClick={modalState.type === 'prompt' ? handlePromptSubmit : handleConfirm}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/30 transition-all"
              >
                {modalState.confirmText || (modalState.type === 'prompt' ? 'Submit' : 'Confirm')}
              </button>
            </>
          ) : (
            <button
              onClick={handleConfirm}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/30 transition-all"
            >
              {modalState.confirmText || 'OK'}
            </button>
          )}
        </div>

        {/* Flowversal AI Branding */}
        <div className={`mt-6 pt-4 border-t ${borderColor} flex items-center justify-center gap-2`}>
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white">
              <path
                fill="currentColor"
                d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
              />
            </svg>
          </div>
          <span className={`text-xs ${textSecondary}`}>Flowversal AI</span>
        </div>
      </div>
    </div>
  );
}
