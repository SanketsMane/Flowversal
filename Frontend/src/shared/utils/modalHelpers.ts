/**
 * Modal Helper Utilities
 * 
 * Import these helpers in components that need quick access to modal functions
 * without using the hook pattern (useful for non-React contexts).
 * 
 * Note: These should only be used where hooks cannot be used.
 * For React components, prefer using the useModal() hook directly.
 */

// Global modal state - will be set by the ModalProvider
let globalModalFunctions: {
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
    options?: {
      defaultValue?: string;
      placeholder?: string;
      inputType?: 'text' | 'email' | 'password' | 'number';
      onCancel?: () => void;
    }
  ) => void;
} | null = null;

export function setGlobalModalFunctions(functions: typeof globalModalFunctions) {
  globalModalFunctions = functions;
}

// Helper functions that can be called from anywhere
export function showSuccessModal(title: string, message: string, onClose?: () => void) {
  if (globalModalFunctions) {
    globalModalFunctions.showSuccess(title, message, onClose);
  } else {
    console.warn('Modal system not initialized. Falling back to browser alert.');
    alert(`${title}\n\n${message}`);
  }
}

export function showErrorModal(title: string, message: string, onClose?: () => void) {
  if (globalModalFunctions) {
    globalModalFunctions.showError(title, message, onClose);
  } else {
    console.warn('Modal system not initialized. Falling back to browser alert.');
    alert(`Error: ${title}\n\n${message}`);
  }
}

export function showWarningModal(title: string, message: string, onClose?: () => void) {
  if (globalModalFunctions) {
    globalModalFunctions.showWarning(title, message, onClose);
  } else {
    console.warn('Modal system not initialized. Falling back to browser alert.');
    alert(`Warning: ${title}\n\n${message}`);
  }
}

export function showInfoModal(title: string, message: string, onClose?: () => void) {
  if (globalModalFunctions) {
    globalModalFunctions.showInfo(title, message, onClose);
  } else {
    console.warn('Modal system not initialized. Falling back to browser alert.');
    alert(`${title}\n\n${message}`);
  }
}

export function showConfirmModal(
  title: string,
  message: string,
  onConfirm: () => void,
  options?: { confirmText?: string; cancelText?: string; onCancel?: () => void }
): void {
  if (globalModalFunctions) {
    globalModalFunctions.showConfirm(title, message, onConfirm, options);
  } else {
    console.warn('Modal system not initialized. Falling back to browser confirm.');
    if (confirm(`${title}\n\n${message}`)) {
      onConfirm();
    } else if (options?.onCancel) {
      options.onCancel();
    }
  }
}

/**
 * Promise-based confirm helper
 * Returns a promise that resolves to true if confirmed, false if cancelled
 */
export function confirmAsync(message: string, title: string = 'Confirm'): Promise<boolean> {
  return new Promise((resolve) => {
    if (globalModalFunctions) {
      globalModalFunctions.showConfirm(
        title,
        message,
        () => resolve(true),
        { onCancel: () => resolve(false) }
      );
    } else {
      console.warn('Modal system not initialized. Falling back to browser confirm.');
      resolve(confirm(`${title}\n\n${message}`));
    }
  });
}

/**
 * Promise-based prompt helper
 * Returns a promise that resolves to the entered value or null if cancelled
 */
export function promptAsync(
  message: string,
  defaultValue: string = '',
  title: string = 'Input'
): Promise<string | null> {
  return new Promise((resolve) => {
    if (globalModalFunctions) {
      globalModalFunctions.showPrompt(
        title,
        message,
        (value) => resolve(value),
        {
          defaultValue,
          onCancel: () => resolve(null),
        }
      );
    } else {
      console.warn('Modal system not initialized. Falling back to browser prompt.');
      resolve(prompt(`${title}\n\n${message}`, defaultValue));
    }
  });
}
