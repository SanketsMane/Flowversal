/**
 * Undo/Redo Buttons Component
 * Provides undo and redo functionality for workflow actions
 */

import { Undo, Redo } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore } from '../../stores';

export function UndoRedoButtons() {
  const { theme } = useTheme();
  const { undo, redo, canUndo, canRedo } = useWorkflowStore();

  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const buttonOutlineBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const buttonOutlineText = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-700';
  const buttonOutlineHover = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-200';

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="flex items-center gap-1">
      {/* Undo Button */}
      <button
        onClick={undo}
        disabled={!canUndo()}
        className={`p-2 rounded-lg border ${borderColor} ${buttonOutlineBg} ${buttonOutlineText} ${buttonOutlineHover} transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
        title={`Undo (${cmdKey}+Z)`}
      >
        <Undo className="w-5 h-5" />
      </button>

      {/* Redo Button */}
      <button
        onClick={redo}
        disabled={!canRedo()}
        className={`p-2 rounded-lg border ${borderColor} ${buttonOutlineBg} ${buttonOutlineText} ${buttonOutlineHover} transition-all disabled:opacity-30 disabled:cursor-not-allowed`}
        title={`Redo (${cmdKey}+Shift+Z)`}
      >
        <Redo className="w-5 h-5" />
      </button>
    </div>
  );
}
