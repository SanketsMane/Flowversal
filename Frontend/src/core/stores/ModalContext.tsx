/**
 * Global Modal Context - App-Level Popup System
 * Replaces all browser-native popups with Flowversal-branded modals
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setGlobalModalFunctions } from '@/shared/utils/modalHelpers';

export type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'prompt';

interface PromptOptions {
  defaultValue?: string;
  placeholder?: string;
  inputType?: 'text' | 'email' | 'password' | 'number';
}

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onPromptSubmit?: (value: string) => void;
  confirmText?: string;
  cancelText?: string;
  promptOptions?: PromptOptions;
}

interface ModalContextType {
  // Core modal state
  modalState: ModalState;
  
  // Show methods
  showSuccess: (title: string, message: string, onClose?: () => void) => void;
  showError: (title: string, message: string, onClose?: () => void) => void;
  showWarning: (title: string, message: string, onClose?: () => void) => void;
  showInfo: (title: string, message: string, onClose?: () => void) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; onCancel?: () => void }
  ) => void;
  showPrompt: (
    title: string,
    message: string,
    onSubmit: (value: string) => void,
    options?: PromptOptions & { onCancel?: () => void }
  ) => void;
  
  // Close method
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const defaultModalState: ModalState = {
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
};

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>(defaultModalState);

  const closeModal = () => {
    setModalState(defaultModalState);
  };

  const showSuccess = (title: string, message: string, onClose?: () => void) => {
    setModalState({
      isOpen: true,
      type: 'success',
      title,
      message,
      onConfirm: () => {
        onClose?.();
        closeModal();
      },
    });
  };

  const showError = (title: string, message: string, onClose?: () => void) => {
    setModalState({
      isOpen: true,
      type: 'error',
      title,
      message,
      onConfirm: () => {
        onClose?.();
        closeModal();
      },
    });
  };

  const showWarning = (title: string, message: string, onClose?: () => void) => {
    setModalState({
      isOpen: true,
      type: 'warning',
      title,
      message,
      onConfirm: () => {
        onClose?.();
        closeModal();
      },
    });
  };

  const showInfo = (title: string, message: string, onClose?: () => void) => {
    setModalState({
      isOpen: true,
      type: 'info',
      title,
      message,
      onConfirm: () => {
        onClose?.();
        closeModal();
      },
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; onCancel?: () => void }
  ) => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        onConfirm();
        closeModal();
      },
      onCancel: () => {
        options?.onCancel?.();
        closeModal();
      },
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
    });
  };

  const showPrompt = (
    title: string,
    message: string,
    onSubmit: (value: string) => void,
    options?: PromptOptions & { onCancel?: () => void }
  ) => {
    setModalState({
      isOpen: true,
      type: 'prompt',
      title,
      message,
      onPromptSubmit: (value: string) => {
        onSubmit(value);
        closeModal();
      },
      onCancel: () => {
        options?.onCancel?.();
        closeModal();
      },
      promptOptions: {
        defaultValue: options?.defaultValue || '',
        placeholder: options?.placeholder || '',
        inputType: options?.inputType || 'text',
      },
    });
  };

  // Set global modal functions for use outside React components
  useEffect(() => {
    setGlobalModalFunctions({
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showConfirm,
      showPrompt,
    });
  }, []);

  return (
    <ModalContext.Provider
      value={{
        modalState,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        showPrompt,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

// Helper hook for replacing window.confirm
export function useConfirm() {
  const { showConfirm } = useModal();
  
  return (message: string, title?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      showConfirm(
        title || 'Confirm Action',
        message,
        () => resolve(true),
        {
          onCancel: () => resolve(false),
        }
      );
    });
  };
}

// Helper hook for replacing window.alert
export function useAlert() {
  const { showInfo } = useModal();
  
  return (message: string, title?: string) => {
    showInfo(title || 'Alert', message);
  };
}

// Helper hook for replacing window.prompt
export function usePrompt() {
  const { showPrompt } = useModal();
  
  return (message: string, defaultValue?: string, title?: string): Promise<string | null> => {
    return new Promise((resolve) => {
      showPrompt(
        title || 'Input Required',
        message,
        (value) => resolve(value),
        {
          defaultValue,
          onCancel: () => resolve(null),
        }
      );
    });
  };
}
