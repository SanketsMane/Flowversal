/**
 * Logic Operator Button Component
 * Phase 2 - Component Extraction
 * 
 * Displays AND/OR operator toggle switch between triggers
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { TriggerLogic } from '../../types';

interface LogicOperatorButtonProps {
  logic: TriggerLogic;
  onToggle: () => void;
}

export function LogicOperatorButton({ logic, onToggle }: LogicOperatorButtonProps) {
  const { theme } = useTheme();

  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-300';

  return (
    <div className="flex items-center justify-center my-3">
      <div 
        className={`flex items-center ${bgColor} border ${borderColor} rounded-full p-1 shadow-sm`}
        style={{ width: 'fit-content' }}
      >
        {/* AND Option */}
        <button
          onClick={() => logic === 'OR' && onToggle()}
          className={`
            px-6 py-1.5 rounded-full text-sm font-semibold transition-all
            ${logic === 'AND' 
              ? 'bg-gradient-to-r from-[#9D50BB] to-[#7B3FA0] text-white shadow-md' 
              : theme === 'dark' ? 'text-[#CFCFE8] hover:text-[#9D50BB]' : 'text-gray-600 hover:text-[#9D50BB]'
            }
          `}
        >
          AND
        </button>

        {/* OR Option */}
        <button
          onClick={() => logic === 'AND' && onToggle()}
          className={`
            px-6 py-1.5 rounded-full text-sm font-semibold transition-all
            ${logic === 'OR' 
              ? 'bg-gradient-to-r from-[#00C6FF] to-[#0099CC] text-white shadow-md' 
              : theme === 'dark' ? 'text-[#CFCFE8] hover:text-[#00C6FF]' : 'text-gray-600 hover:text-[#00C6FF]'
            }
          `}
        >
          OR
        </button>
      </div>
    </div>
  );
}