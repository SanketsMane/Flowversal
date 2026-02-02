/**
 * Advanced Filters Component
 * Filters by Members, Status, Priority, Labels, and Due Date
 */

import { useState, useEffect, useRef } from 'react';
import { Filter, X, Users, Flag, CheckSquare, Tag, Calendar, Clock } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { Portal } from './Portal';

export interface FilterOptions {
  members: string[];
  statuses: string[];
  priorities: string[];
  labels: string[];
  dueDateRange: 'all' | 'overdue' | 'today' | 'week' | 'month' | 'no-date';
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableMembers: Array<{ id: string; name: string; avatar: string }>;
  availableStatuses: string[];
  availablePriorities: string[];
  availableLabels: Array<{ id: string; name: string; color: string }>;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

export function AdvancedFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableMembers,
  availableStatuses,
  availablePriorities,
  availableLabels,
  buttonRef
}: AdvancedFiltersProps) {
  console.log('🔥 AdvancedFilters CALLED with isOpen:', isOpen);
  
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if click is on the button that opens the filter
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

  const toggleMember = (memberId: string) => {
    onFiltersChange({
      ...filters,
      members: filters.members.includes(memberId)
        ? filters.members.filter(id => id !== memberId)
        : [...filters.members, memberId]
    });
  };

  const toggleStatus = (status: string) => {
    onFiltersChange({
      ...filters,
      statuses: filters.statuses.includes(status)
        ? filters.statuses.filter(s => s !== status)
        : [...filters.statuses, status]
    });
  };

  const togglePriority = (priority: string) => {
    onFiltersChange({
      ...filters,
      priorities: filters.priorities.includes(priority)
        ? filters.priorities.filter(p => p !== priority)
        : [...filters.priorities, priority]
    });
  };

  const toggleLabel = (label: string) => {
    onFiltersChange({
      ...filters,
      labels: filters.labels.includes(label)
        ? filters.labels.filter(l => l !== label)
        : [...filters.labels, label]
    });
  };

  const setDueDateRange = (range: 'all' | 'overdue' | 'today' | 'week' | 'month' | 'no-date') => {
    onFiltersChange({
      ...filters,
      dueDateRange: range
    });
  };

  const clearAll = () => {
    onFiltersChange({ members: [], statuses: [], priorities: [], labels: [], dueDateRange: 'all' });
  };

  const activeFiltersCount = filters.members.length + filters.statuses.length + filters.priorities.length + filters.labels.length + (filters.dueDateRange !== 'all' ? 1 : 0);

  // Calculate position - MUST be before early return
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef && buttonRef.current && isOpen) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: buttonRect.bottom,
          left: buttonRect.left
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

  console.log('AdvancedFilters render state:', { isOpen, position });

  if (!isOpen) return null;

  console.log('AdvancedFilters rendering, isOpen:', isOpen);

  return (
    <Portal>
      <div
        ref={panelRef}
        className={`fixed w-80 ${bgMain} border ${borderColor} rounded-xl shadow-2xl overflow-hidden`}
        style={{ 
          zIndex: 9999, 
          top: `${position.top + 8}px`, 
          left: `${position.left}px` 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00C6FF]" />
            <h3 className={`${textPrimary}`}>Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#00C6FF] text-white text-xs">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className={`p-1 rounded ${hoverBg}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Content */}
        <div className="max-h-96 overflow-y-auto">
          {/* Members Filter */}
          <div className={`p-4 border-b ${borderColor}`}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-[#00C6FF]" />
              <h4 className={`text-sm ${textPrimary}`}>Members</h4>
            </div>
            <div className="space-y-2">
              {availableMembers.map(member => (
                <label key={member.id} className={`flex items-center gap-3 p-2 rounded-lg ${hoverBg} cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={filters.members.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                  />
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                    {member.avatar}
                  </div>
                  <span className={`text-sm ${textPrimary}`}>{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className={`p-4 border-b ${borderColor}`}>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="w-4 h-4 text-[#00C6FF]" />
              <h4 className={`text-sm ${textPrimary}`}>Status</h4>
            </div>
            <div className="space-y-2">
              {availableStatuses.map(status => (
                <label key={status} className={`flex items-center gap-3 p-2 rounded-lg ${hoverBg} cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                  />
                  <span className={`text-sm ${textPrimary}`}>{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-4 h-4 text-[#00C6FF]" />
              <h4 className={`text-sm ${textPrimary}`}>Priority</h4>
            </div>
            <div className="space-y-2">
              {availablePriorities.map(priority => {
                const priorityColor = 
                  priority === 'Critical' ? 'text-red-500' :
                  priority === 'High' ? 'text-orange-500' :
                  priority === 'Medium' ? 'text-yellow-500' :
                  'text-gray-500';
                
                return (
                  <label key={priority} className={`flex items-center gap-3 p-2 rounded-lg ${hoverBg} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={filters.priorities.includes(priority)}
                      onChange={() => togglePriority(priority)}
                      className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                    />
                    <Flag className={`w-4 h-4 ${priorityColor}`} />
                    <span className={`text-sm ${textPrimary}`}>{priority}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Labels Filter */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#00C6FF]" />
              <h4 className={`text-sm ${textPrimary}`}>Labels</h4>
            </div>
            <div className="space-y-2">
              {availableLabels.map(label => (
                <label key={label.id} className={`flex items-center gap-3 p-2 rounded-lg ${hoverBg} cursor-pointer`}>
                  <input
                    type="checkbox"
                    checked={filters.labels.includes(label.id)}
                    onChange={() => toggleLabel(label.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                  />
                  <span className={`flex items-center gap-2 text-sm ${textPrimary}`}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: label.color }}></span>
                    {label.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Due Date Filter */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#00C6FF]" />
              <h4 className={`text-sm ${textPrimary}`}>Due Date</h4>
            </div>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 p-2 rounded-lg ${hoverBg} cursor-pointer`}>
                <input
                  type="radio"
                  checked={filters.dueDateRange === 'all'}
                  onChange={() => setDueDateRange('all')}
                  className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                />
                <span className={`text-sm ${textPrimary}`}>All</span>
              </label>
              <label className={`flex items-center gap-3 p-2 rounded-lg ${hoverBg} cursor-pointer`}>
                <input
                  type="radio"
                  checked={filters.dueDateRange === 'overdue'}
                  onChange={() => setDueDateRange('overdue')}
                  className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                />
                <span className={`text-sm ${textPrimary}`}>Overdue</span>
              </label>
              <label className={`flex items-center gap-3 p-2 rounded-lg ${hoverBg} cursor-pointer`}>
                <input
                  type="radio"
                  checked={filters.dueDateRange === 'today'}
                  onChange={() => setDueDateRange('today')}
                  className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                />
                <span className={`text-sm ${textPrimary}`}>Today</span>
              </label>
              <label className={`flex items-center gap-3 p-2 rounded-lg ${hoverBg} cursor-pointer`}>
                <input
                  type="radio"
                  checked={filters.dueDateRange === 'week'}
                  onChange={() => setDueDateRange('week')}
                  className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                />
                <span className={`text-sm ${textPrimary}`}>This Week</span>
              </label>
              <label className={`flex items-center gap-3 p-2 rounded-lg ${hoverBg} cursor-pointer`}>
                <input
                  type="radio"
                  checked={filters.dueDateRange === 'month'}
                  onChange={() => setDueDateRange('month')}
                  className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                />
                <span className={`text-sm ${textPrimary}`}>This Month</span>
              </label>
              <label className={`flex items-center gap-3 p-2 rounded-lg ${hoverBg} cursor-pointer`}>
                <input
                  type="radio"
                  checked={filters.dueDateRange === 'no-date'}
                  onChange={() => setDueDateRange('no-date')}
                  className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                />
                <span className={`text-sm ${textPrimary}`}>No Date</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${borderColor} flex items-center justify-between`}>
          <button
            onClick={clearAll}
            className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
              activeFiltersCount === 0 
                ? `${textSecondary} opacity-50 cursor-not-allowed` 
                : `text-red-500 ${hoverBg} hover:bg-red-500/10 font-medium`
            }`}
            disabled={activeFiltersCount === 0}
          >
            Clear All ({activeFiltersCount})
          </button>
          <button
            onClick={onClose}
            className="text-sm px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
        </div>
      </div>
    </Portal>
  );
}