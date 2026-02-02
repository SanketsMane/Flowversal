/**
 * Triggers List Component
 * Phase 2 - Component Extraction
 * 
 * Displays list of available trigger templates
 */

import { useTheme } from '../../../../components/ThemeContext';
import { useWorkflow } from '../../hooks';
import { TriggerRegistry } from '../../registries';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function TriggersList() {
  const { theme } = useTheme();
  const { addTriggerFromTemplate } = useWorkflow();
  const [searchQuery, setSearchQuery] = useState('');

  // Theme colors
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  // Get all triggers or search results
  const triggers = searchQuery 
    ? TriggerRegistry.search(searchQuery)
    : TriggerRegistry.getAll();

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search triggers..."
          className={`w-full pl-10 pr-3 py-2 rounded-lg ${bgInput} border ${borderColor} text-sm focus:outline-none focus:border-[#00C6FF]/50 transition-colors`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Trigger Templates */}
      <div className="space-y-2">
        {triggers.length === 0 ? (
          <div className={`p-4 text-center ${textSecondary} text-sm`}>
            No triggers found
          </div>
        ) : (
          triggers.map((trigger) => {
            const Icon = trigger.icon;
            return (
              <button
                key={trigger.type}
                onClick={() => addTriggerFromTemplate(trigger.type)}
                className={`
                  w-full p-3 rounded-lg border ${borderColor} ${bgInput} 
                  hover:border-[#00C6FF]/50 transition-all text-left
                  group
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`${textPrimary} text-sm font-medium truncate`}>
                      {trigger.label}
                    </p>
                    {trigger.description && (
                      <p className={`${textSecondary} text-xs truncate`}>
                        {trigger.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
