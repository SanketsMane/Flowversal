/**
 * Close Confirmation Dialog
 * 
 * Shows a confirmation dialog with three options when closing the workflow:
 * - Save & Close
 * - Close Without Saving
 * - Cancel
 */

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import { useTheme } from '@/core/theme/ThemeContext';
import { Save, X } from 'lucide-react';

interface CloseConfirmDialogProps {
  isOpen: boolean;
  onSaveAndClose: () => void;
  onCloseWithoutSaving: () => void;
  onCancel: () => void;
}

export function CloseConfirmDialog({
  isOpen,
  onSaveAndClose,
  onCloseWithoutSaving,
  onCancel,
}: CloseConfirmDialogProps) {
  const { theme } = useTheme();

  // Theme colors
  const panelBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className={`${panelBg} ${borderColor} ${textPrimary} max-w-md z-[200]`}>
        <AlertDialogHeader>
          <AlertDialogTitle className={textPrimary}>
            Close Workflow?
          </AlertDialogTitle>
          <AlertDialogDescription className={textSecondary}>
            You have unsaved changes. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          {/* Save & Close Button */}
          <Button
            onClick={onSaveAndClose}
            className="w-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Close
          </Button>

          {/* Close Without Saving Button */}
          <Button
            onClick={onCloseWithoutSaving}
            variant="outline"
            className={`w-full ${borderColor} hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50`}
          >
            <X className="w-4 h-4 mr-2" />
            Close Without Saving
          </Button>

          {/* Cancel Button */}
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}