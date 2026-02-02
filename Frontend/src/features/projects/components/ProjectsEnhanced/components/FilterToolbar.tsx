import { useMemo, useRef } from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';
import { AdvancedFilters, FilterOptions } from '@/shared/components/ui/AdvancedFilters';
import { AdvancedSort, SortOption } from '@/shared/components/ui/AdvancedSort';
import { Task } from '@/core/stores/projectStore';

interface FilterToolbarProps {
  tasks: Task[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  showSort: boolean;
  setShowSort: (value: boolean) => void;
  advancedFilters: FilterOptions;
  setAdvancedFilters: (filters: FilterOptions) => void;
  sortBy: SortOption;
  setSortBy: (value: SortOption) => void;
  borderColor: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  hoverBg: string;
}

const availableStatuses = ['Backlog', 'To do', 'In Progress', 'Review', 'Blocked', 'Done'];
const availablePriorities = ['Critical', 'High', 'Medium', 'Low'];

export function FilterToolbar({
  tasks,
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  showSort,
  setShowSort,
  advancedFilters,
  setAdvancedFilters,
  sortBy,
  setSortBy,
  borderColor,
  bgCard,
  textPrimary,
  textSecondary,
  hoverBg,
}: FilterToolbarProps) {
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);

  const availableMembers = useMemo(() => {
    const memberMap = new Map<string, { id: string; name: string; avatar: string; email?: string }>();
    tasks.forEach((task) => {
      task.assignedTo.forEach((member) => {
        if (!memberMap.has(member.id)) {
          memberMap.set(member.id, member);
        }
      });
    });
    return Array.from(memberMap.values());
  }, [tasks]);

  const availableLabels = useMemo(() => {
    const labelMap = new Map<string, { id: string; name: string; color: string }>();
    tasks.forEach((task) => {
      (task.labels || []).forEach((label) => {
        if (!labelMap.has(label.id)) {
          labelMap.set(label.id, label);
        }
      });
    });
    return Array.from(labelMap.values());
  }, [tasks]);

  const toggleFilters = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowFilters(!showFilters);
  };

  const toggleSort = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowSort(!showSort);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 ${textSecondary}`} />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`pl-8 pr-3 py-1.5 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm placeholder:${textSecondary} focus:outline-none focus:ring-2 focus:ring-[#00C6FF] w-48`}
        />
      </div>

      <div className="relative z-50">
        <button
          ref={filterButtonRef}
          onClick={toggleFilters}
          className={`px-3 py-1.5 rounded-lg border ${borderColor} ${
            advancedFilters.members.length > 0 ||
            advancedFilters.statuses.length > 0 ||
            advancedFilters.priorities.length > 0
              ? 'bg-[#00C6FF]/20 text-[#00C6FF] border-[#00C6FF]'
              : `${bgCard} ${textPrimary}`
          } ${hoverBg} flex items-center gap-1.5 transition-all text-xs`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
          {(advancedFilters.members.length +
            advancedFilters.statuses.length +
            advancedFilters.priorities.length) > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#00C6FF] text-white text-[10px]">
              {advancedFilters.members.length +
                advancedFilters.statuses.length +
                advancedFilters.priorities.length}
            </span>
          )}
        </button>

        <AdvancedFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          buttonRef={filterButtonRef}
          availableMembers={availableMembers}
          availableStatuses={availableStatuses}
          availablePriorities={availablePriorities}
          availableLabels={availableLabels}
        />
      </div>

      <div className="relative z-50">
        <button
          ref={sortButtonRef}
          onClick={toggleSort}
          className={`px-3 py-1.5 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} ${hoverBg} flex items-center gap-1.5 transition-all text-xs`}
        >
          <SortAsc className="w-3.5 h-3.5" />
          Sort
        </button>

        <AdvancedSort
          isOpen={showSort}
          onClose={() => setShowSort(false)}
          currentSort={sortBy}
          onSortChange={setSortBy}
          buttonRef={sortButtonRef}
        />
      </div>
    </div>
  );
}

