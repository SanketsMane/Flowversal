/**
 * Flowversal AI-Style Alert/Popup Component
 * Replaces browser alerts with branded modal dialogs
 */

import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface FlowversalAlertProps {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function FlowversalAlert({
  isOpen,
  type,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
}: FlowversalAlertProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-400" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
      case 'confirm':
        return <AlertTriangle className="w-12 h-12 text-orange-400" />;
      case 'info':
      default:
        return <Info className="w-12 h-12 text-blue-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
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
      case 'confirm':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-400',
        };
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
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Card
        className="bg-[#1A1A2E] border-[#2A2A3E] p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`${colors.bg} ${colors.border} border-2 rounded-full p-4 mb-4`}>
            {getIcon()}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        </div>

        {/* Message */}
        <p className="text-[#CFCFE8] text-center mb-6 whitespace-pre-line">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          {type === 'confirm' ? (
            <>
              <Button
                variant="outline"
                className="flex-1 border-[#2A2A3E] text-white hover:bg-[#2A2A3E]"
                onClick={onClose}
              >
                {cancelText}
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/30"
                onClick={handleConfirm}
              >
                {confirmText}
              </Button>
            </>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/30"
              onClick={onClose}
            >
              {confirmText}
            </Button>
          )}
        </div>

        {/* Flowversal AI Branding */}
        <div className="mt-6 pt-4 border-t border-[#2A2A3E] flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white">
              <path
                fill="currentColor"
                d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
              />
            </svg>
          </div>
          <span className="text-xs text-[#CFCFE8]">Flowversal AI</span>
        </div>
      </Card>
    </div>
  );
}

/**
 * Hook for using Flowversal Alerts
 */
export function useFlowversalAlert() {
  const [alert, setAlert] = React.useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    options?: {
      onConfirm?: () => void;
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: options?.onConfirm,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
    });
  };

  const showSuccess = (title: string, message: string) => {
    showAlert('success', title, message);
  };

  const showError = (title: string, message: string) => {
    showAlert('error', title, message);
  };

  const showWarning = (title: string, message: string) => {
    showAlert('warning', title, message);
  };

  const showInfo = (title: string, message: string) => {
    showAlert('info', title, message);
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string }
  ) => {
    showAlert('confirm', title, message, {
      onConfirm,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
    });
  };

  const closeAlert = () => {
    setAlert({ ...alert, isOpen: false });
  };

  const AlertComponent = () => (
    <FlowversalAlert
      isOpen={alert.isOpen}
      type={alert.type}
      title={alert.title}
      message={alert.message}
      onClose={closeAlert}
      onConfirm={alert.onConfirm}
      confirmText={alert.confirmText}
      cancelText={alert.cancelText}
    />
  );

  return {
    AlertComponent,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
}
