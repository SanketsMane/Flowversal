/**
 * Empty Property State Component
 * Phase 2 - Component Extraction
 * 
 * Displays when nothing is selected
 */

import { MousePointer2 } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';

export function EmptyPropertyState() {
  const { theme } = useTheme();

  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00C6FF]/20 to-[#9D50BB]/20 flex items-center justify-center mb-4">
        <MousePointer2 className="w-8 h-8 text-[#00C6FF]" />
      </div>
      <h3 className="text-white font-semibold mb-2">
        No Selection
      </h3>
      <p className={`${textSecondary} text-sm`}>
        Select a trigger, node, or tool to view and edit its properties
      </p>
    </div>
  );
}
