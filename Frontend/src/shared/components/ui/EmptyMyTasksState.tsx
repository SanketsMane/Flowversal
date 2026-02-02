/**
 * Empty My Tasks State Component
 */

import { CheckSquare, Plus } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

interface EmptyMyTasksStateProps {
  onCreateTask?: () => void;
}

export function EmptyMyTasksState({ onCreateTask }: EmptyMyTasksStateProps) {
  const { theme } = useTheme();

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className={`${bgCard} rounded-xl border ${borderColor} p-12 max-w-md text-center`}>
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
            <CheckSquare className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Content */}
        <h3 className={`text-xl mb-3 ${textPrimary}`}>No tasks assigned yet</h3>
        <p className={`text-sm ${textSecondary} mb-6`}>
          You don't have any tasks assigned to you. Create a task or ask your team to assign tasks to you.
        </p>

        {/* Action Button */}
        {onCreateTask && (
          <button
            onClick={onCreateTask}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        )}
      </div>
    </div>
  );
}
