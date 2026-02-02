/**
 * Empty Completed State Component
 * Shows when no tasks are completed
 */

import { CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';

export function EmptyCompletedState() {
  const { theme } = useTheme();

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';

  return (
    <div className="flex items-center justify-center h-full py-20">
      <div className={`${bgCard} rounded-2xl border-2 border-dashed ${borderColor} p-12 max-w-md text-center`}>
        <div className="w-20 h-20 rounded-full bg-green-500/20 mx-auto mb-6 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className={`text-2xl ${textPrimary} mb-3`}>No completed tasks yet</h3>
        <p className={`text-sm ${textSecondary}`}>
          Complete your tasks to see them here
        </p>
      </div>
    </div>
  );
}
