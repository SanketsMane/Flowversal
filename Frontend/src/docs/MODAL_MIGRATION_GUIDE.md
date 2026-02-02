# Modal Migration Guide

## Overview
All browser-native popups (`alert`, `confirm`, `prompt`) have been replaced with the Flowversal UI global modal system.

## Setup

### 1. Import the modal hook
```typescript
import { useModal } from '../contexts/ModalContext';
```

### 2. Use the hook in your component
```typescript
export function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo, showConfirm } = useModal();
  
  // ... component code
}
```

## Migration Examples

### Replacing `alert()`

**Before:**
```typescript
alert('Task created successfully!');
```

**After:**
```typescript
showSuccess('Success', 'Task created successfully!');
// or for errors
showError('Error', 'Failed to create task. Please try again.');
// or for warnings
showWarning('Warning', 'This action cannot be undone.');
// or for info
showInfo('Info', 'This feature is coming soon.');
```

### Replacing `window.confirm()`

**Before:**
```typescript
if (confirm('Are you sure you want to delete this item?')) {
  deleteItem();
}
```

**After:**
```typescript
showConfirm(
  'Confirm Delete',
  'Are you sure you want to delete this item? This action cannot be undone.',
  () => {
    // This callback runs when user clicks "Confirm"
    deleteItem();
  },
  {
    confirmText: 'Delete',  // optional, defaults to 'Confirm'
    cancelText: 'Cancel',   // optional, defaults to 'Cancel'
    onCancel: () => {       // optional callback for cancel action
      console.log('Delete cancelled');
    }
  }
);
```

### Replacing `window.prompt()`

For prompt dialogs, use the `showPrompt` method:

```typescript
const { showPrompt } = useModal();

showPrompt(
  'Enter Name',
  'Please enter your name:',
  (value) => {
    // This callback runs when user submits
    console.log('User entered:', value);
  },
  {
    defaultValue: 'John Doe',  // optional
    placeholder: 'Your name',   // optional
    inputType: 'text',          // optional, can be 'text', 'email', 'password', 'number'
    onCancel: () => {           // optional
      console.log('Cancelled');
    }
  }
);
```

### Using Helper Hooks (Alternative Methods)

```typescript
import { useConfirm, useAlert, usePrompt } from '../contexts/ModalContext';

export function MyComponent() {
  const confirm = useConfirm();
  const alert = useAlert();
  const prompt = usePrompt();
  
  const handleDelete = async () => {
    // Returns a promise that resolves to boolean
    const confirmed = await confirm('Are you sure you want to delete this?', 'Confirm Delete');
    if (confirmed) {
      deleteItem();
    }
  };
  
  const handleAlert = () => {
    // Simple alert replacement
    alert('This is an alert message', 'Alert Title');
  };
  
  const handlePrompt = async () => {
    // Returns a promise that resolves to string or null
    const value = await prompt('Enter value:', 'default value', 'Input Title');
    if (value !== null) {
      console.log('User entered:', value);
    }
  };
}
```

## Benefits

1. **Consistent UI**: All popups now match the Flowversal design system
2. **Theme Support**: Automatically adapts to light/dark mode
3. **Blurred Background**: App-level overlay with backdrop blur
4. **Better UX**: Smooth animations and transitions
5. **Accessibility**: Proper ARIA labels and keyboard support
6. **No Browser Dependency**: Works consistently across all browsers

## Files Already Migrated

- `/components/ProjectsEnhanced.tsx` - Error alerts
- `/components/ChangePasswordModal.tsx` - Validation alert

## Files To Migrate

Search for these patterns in the codebase:
- `alert(`
- `window.alert(`
- `confirm(`
- `window.confirm(`
- `prompt(`
- `window.prompt(`

Replace them with the appropriate modal method as shown above.
