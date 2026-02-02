/**
 * Empty Board State Component
 * Shows when a project has no boards
 */

import { LayoutGrid, Plus } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface EmptyBoardStateProps {
  onCreateBoard: () => void;
}

export function EmptyBoardState({ onCreateBoard }: EmptyBoardStateProps) {
  const { theme } = useTheme();

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';

  return (
    <div className="flex items-center justify-center h-full py-20">
      <div className={`${bgCard} rounded-2xl border-2 border-dashed ${borderColor} p-12 max-w-md text-center`}>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] mx-auto mb-6 flex items-center justify-center">
          <LayoutGrid className="w-10 h-10 text-white" />
        </div>
        <h3 className={`text-2xl ${textPrimary} mb-3`}>No boards yet</h3>
        <p className={`text-sm ${textSecondary} mb-6`}>
          Create your first board to start organizing tasks and workflows
        </p>
        <button
          onClick={onCreateBoard}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 hover:scale-105 transition-all flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          New Board
        </button>
      </div>
    </div>
  );
}
