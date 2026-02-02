/**
 * Advanced Sort Component
 * Sort tasks by various criteria with ascending/descending options
 */

import { useEffect, useRef, useState } from 'react';
import { SortAsc, SortDesc, Check, Calendar, Flag, User, Clock, Type, ListOrdered } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { Portal } from './Portal';

export type SortOption = 'dueDate' | 'priority' | 'name' | 'createdAt' | 'status' | 'assignee' | 'updated';

interface AdvancedSortProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

const sortOptions: Array<{ 
  value: SortOption; 
  label: string; 
  description: string;
  icon: any;
  gradient?: string;
}> = [
  { 
    value: 'priority', 
    label: 'Priority', 
    description: 'Critical → High → Medium → Low',
    icon: Flag,
    gradient: 'from-red-500 to-orange-500'
  },
  { 
    value: 'dueDate', 
    label: 'Due Date', 
    description: 'Earliest deadline first',
    icon: Calendar,
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    value: 'name', 
    label: 'Task Name', 
    description: 'Alphabetical A → Z',
    icon: Type,
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    value: 'status', 
    label: 'Status', 
    description: 'Grouped by workflow stage',
    icon: ListOrdered,
    gradient: 'from-green-500 to-teal-500'
  },
  { 
    value: 'assignee', 
    label: 'Assignee', 
    description: 'Grouped by team member',
    icon: User,
    gradient: 'from-indigo-500 to-violet-500'
  },
  { 
    value: 'createdAt', 
    label: 'Created Date', 
    description: 'Newest tasks first',
    icon: Clock,
    gradient: 'from-yellow-500 to-amber-500'
  },
  { 
    value: 'updated', 
    label: 'Last Updated', 
    description: 'Recently modified first',
    icon: Clock,
    gradient: 'from-cyan-500 to-blue-500'
  },
];

export function AdvancedSort({
  isOpen,
  onClose,
  sortBy,
  onSortChange,
  buttonRef
}: AdvancedSortProps) {
  console.log('🔥 AdvancedSort CALLED with isOpen:', isOpen);
  
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if click is on the button that opens the sort menu
      if (buttonRef?.current && buttonRef.current.contains(event.target as Node)) {
        return; // Don't close if clicking the button
      }
      
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      // Add a small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose, buttonRef]);

  // Calculate position based on button
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef && buttonRef.current && isOpen) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: buttonRect.bottom + 8,
          left: buttonRect.right - 288 // 288px = w-72
        });
      }
    };

    if (isOpen) {
      updatePosition();
      // Update position on scroll
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, buttonRef]);

  if (!isOpen) return null;

  console.log('AdvancedSort rendering, isOpen:', isOpen, 'position:', position);

  return (
    <Portal>
      <div
        ref={panelRef}
        className={`fixed w-72 ${bgMain} border ${borderColor} rounded-xl shadow-2xl overflow-hidden`}
        style={{ 
          zIndex: 9999,
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b ${borderColor} flex items-center gap-2`}>
          <SortAsc className="w-4 h-4 text-[#00C6FF]" />
          <h3 className={`${textPrimary}`}>Sort By</h3>
        </div>

        {/* Sort Options */}
        <div className="p-2">
          {sortOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg ${hoverBg} transition-all group ${
                  sortBy === option.value ? 'bg-[#00C6FF]/10 border border-[#00C6FF]/30' : 'border border-transparent'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  sortBy === option.value ? 'bg-gradient-to-r ' + option.gradient : bgMain
                } group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-4 h-4 ${sortBy === option.value ? 'text-white' : textSecondary}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-medium ${sortBy === option.value ? 'text-[#00C6FF]' : textPrimary}`}>
                    {option.label}
                  </p>
                  <p className={`text-xs ${textSecondary}`}>{option.description}</p>
                </div>
                {sortBy === option.value && (
                  <Check className="w-4 h-4 text-[#00C6FF] flex-shrink-0 animate-in fade-in zoom-in duration-200" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Portal>
  );
}