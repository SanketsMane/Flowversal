import { useMemo, useRef } from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';
import { AdvancedFilters, FilterOptions } from '@/shared/components/ui/AdvancedFilters';
import { AdvancedSort, SortOption } from '@/shared/components/ui/AdvancedSort';

interface BoardToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  showSort: boolean;
  setShowSort: (value: boolean) => void;
  advancedFilters: FilterOptions;
  setAdvancedFilters: (filters: FilterOptions) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  availableMembers: Array<{ id: string; name: string; avatar?: string }>;
  availableLabels: Array<{ id: string; name: string; color: string }>;
}

export function BoardToolbar({
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
  availableMembers,
  availableLabels,
}: BoardToolbarProps) {
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const sortButtonRef = useRef<HTMLButtonElement | null>(null);

  const filterCount = useMemo(
    () =>
      advancedFilters.members.length +
      advancedFilters.statuses.length +
      advancedFilters.priorities.length,
    [advancedFilters]
  );

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#A1A1AA]" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00C6FF] w-48"
        />
      </div>

      <div className="relative z-50">
        <button
          ref={filterButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowFilters(!showFilters);
          }}
          className={`px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5 text-xs transition-all ${
            filterCount
              ? 'bg-[#00C6FF]/20 text-[#00C6FF] border-[#00C6FF]'
              : 'bg-white text-gray-900'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
          {filterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#00C6FF] text-white text-[10px]">
              {filterCount}
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
          availableStatuses={['Backlog', 'To do', 'In Progress', 'Review', 'Blocked', 'Done']}
          availablePriorities={['Critical', 'High', 'Medium', 'Low']}
          availableLabels={availableLabels}
        />
      </div>

      <div className="relative z-50">
        <button
          ref={sortButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowSort(!showSort);
          }}
          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 flex items-center gap-1.5 text-xs transition-all"
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

