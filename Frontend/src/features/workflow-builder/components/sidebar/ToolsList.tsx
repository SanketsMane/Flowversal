/**
 * Tools List Component
 * Phase 2 - Component Extraction
 * 
 * Displays list of available tool templates with search and categories
 */

import { useState } from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { ToolRegistry } from '../../registries';
import { Search } from 'lucide-react';
import { CollapsibleSection } from '../../../../components/workflow-builder/CollapsibleSection';

export function ToolsList() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Theme colors
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  // Get all tools or search results
  const tools = searchQuery 
    ? ToolRegistry.search(searchQuery)
    : ToolRegistry.getAll();

  // Group by category
  const categories = ToolRegistry.getCategories();
  const toolsByCategory = categories.reduce((acc, category) => {
    acc[category] = tools.filter(t => t.category === category);
    return acc;
  }, {} as Record<string, typeof tools>);

  // Uncategorized tools
  const uncategorizedTools = tools.filter(t => !t.category);

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tools..."
          className={`w-full pl-10 pr-3 py-2 rounded-lg ${bgInput} border ${borderColor} text-sm focus:outline-none focus:border-[#00C6FF]/50 transition-colors`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tool Templates */}
      <div className="space-y-2">
        {tools.length === 0 ? (
          <div className={`p-4 text-center ${textSecondary} text-sm`}>
            No tools found
          </div>
        ) : searchQuery ? (
          // Show flat list when searching
          tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.type}
                draggable
                className={`
                  p-3 rounded-lg border ${borderColor} ${bgInput} 
                  cursor-move hover:border-[#00C6FF]/50 transition-all
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${textPrimary} text-sm font-medium truncate`}>
                      {tool.label}
                    </p>
                    {tool.description && (
                      <p className={`${textSecondary} text-xs truncate`}>
                        {tool.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Show categorized list
          <>
            {categories.map((category) => {
              const categoryTools = toolsByCategory[category];
              if (!categoryTools || categoryTools.length === 0) return null;

              return (
                <CollapsibleSection
                  key={category}
                  title={category.charAt(0).toUpperCase() + category.slice(1)}
                  defaultOpen={true}
                >
                  <div className="space-y-2 mt-2">
                    {categoryTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <div
                          key={tool.type}
                          draggable
                          className={`
                            p-3 rounded-lg border ${borderColor} ${bgInput} 
                            cursor-move hover:border-[#00C6FF]/50 transition-all
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center flex-shrink-0">
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`${textPrimary} text-sm font-medium truncate`}>
                                {tool.label}
                              </p>
                              {tool.description && (
                                <p className={`${textSecondary} text-xs truncate`}>
                                  {tool.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleSection>
              );
            })}

            {/* Uncategorized Tools */}
            {uncategorizedTools.length > 0 && (
              <div className="space-y-2">
                {uncategorizedTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.type}
                      draggable
                      className={`
                        p-3 rounded-lg border ${borderColor} ${bgInput} 
                        cursor-move hover:border-[#00C6FF]/50 transition-all
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`${textPrimary} text-sm font-medium truncate`}>
                            {tool.label}
                          </p>
                          {tool.description && (
                            <p className={`${textSecondary} text-xs truncate`}>
                              {tool.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Drag Instruction */}
      <div className={`${bgInput} p-3 rounded-lg border ${borderColor} ${textSecondary} text-xs text-center`}>
        💡 Drag tools to Prompt Builder nodes
      </div>
    </div>
  );
}
