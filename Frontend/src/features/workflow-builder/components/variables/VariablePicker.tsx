/**
 * Variable Picker Component
 * Phase 4 Part 3 - Variable System
 * 
 * UI component for selecting variables
 */

import { useState, useMemo } from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { useVariables } from '../../stores/variableStore';
import {
  VariableDefinition,
  VariablePickerConfig,
  VariableInsertEvent,
} from '../../types/variable.types';
import { buildVariableReference } from '../../utils/variable.parser';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { 
  Search, 
  Zap, 
  Box, 
  FileText, 
  User, 
  Settings,
  Wrench,
  ChevronRight,
  Copy,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  trigger: <Zap className="h-4 w-4" />,
  step: <Box className="h-4 w-4" />,
  form: <FileText className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  system: <Settings className="h-4 w-4" />,
  custom: <Wrench className="h-4 w-4" />,
};

interface VariablePickerProps {
  config?: Partial<VariablePickerConfig>;
  onSelect?: (event: VariableInsertEvent) => void;
  onClose?: () => void;
  className?: string;
}

export function VariablePicker({ 
  config = {},
  onSelect,
  onClose,
  className = '',
}: VariablePickerProps) {
  const { theme } = useTheme();
  const { variables, getVariableGroups } = useVariables();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Filter variables based on config and search
  const filteredVariables = useMemo(() => {
    let filtered = variables;

    // Apply config filters
    if (config.allowedTypes && config.allowedTypes.length > 0) {
      filtered = filtered.filter(v => config.allowedTypes!.includes(v.type));
    }

    if (config.allowedScopes && config.allowedScopes.length > 0) {
      filtered = filtered.filter(v => config.allowedScopes!.includes(v.scope));
    }

    if (config.allowedCategories && config.allowedCategories.length > 0) {
      filtered = filtered.filter(v => 
        v.category && config.allowedCategories!.includes(v.category)
      );
    }

    if (config.customFilter) {
      filtered = filtered.filter(config.customFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.path.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }

    return filtered;
  }, [variables, config, searchQuery, selectedCategory]);

  // Group variables
  const groups = useMemo(() => {
    const allGroups = getVariableGroups();
    
    // Filter groups based on filtered variables
    return allGroups
      .map(group => ({
        ...group,
        variables: group.variables.filter(v => 
          filteredVariables.some(fv => fv.id === v.id)
        ),
      }))
      .filter(group => group.variables.length > 0);
  }, [getVariableGroups, filteredVariables]);

  const handleSelectVariable = (variable: VariableDefinition) => {
    const reference = buildVariableReference(variable.path);
    
    onSelect?.({
      variable,
      reference,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={`${bgCard} rounded-lg border ${borderColor} ${className}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`${textPrimary} font-medium`}>Insert Variable</h3>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${textSecondary}`} />
          <Input
            type="text"
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className={`px-4 py-2 border-b ${borderColor} flex gap-2 overflow-x-auto`}>
        <Button
          variant={selectedCategory === null ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Button>
        {groups.map(group => (
          <Button
            key={group.category}
            variant={selectedCategory === group.category ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory(group.category)}
            className="gap-2"
          >
            {CATEGORY_ICONS[group.category]}
            {group.label.replace(/^[⚡📦📝👤⚙️🔧]\s*/, '')}
          </Button>
        ))}
      </div>

      {/* Variable List */}
      <ScrollArea className="h-96">
        {filteredVariables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className={`h-12 w-12 ${textSecondary} opacity-50 mb-3`} />
            <p className={`${textSecondary} text-sm`}>
              {searchQuery ? 'No variables match your search' : 'No variables available'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {groups.map(group => (
              <div key={group.category}>
                {/* Group Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-[#00C6FF]">
                    {CATEGORY_ICONS[group.category]}
                  </div>
                  <h4 className={`${textPrimary} font-medium text-sm`}>
                    {group.label}
                  </h4>
                  <span className={`${textSecondary} text-xs`}>
                    ({group.variables.length})
                  </span>
                </div>

                {/* Variables */}
                <div className="space-y-1">
                  {group.variables.map(variable => (
                    <button
                      key={variable.id}
                      onClick={() => handleSelectVariable(variable)}
                      className={`w-full ${bgHover} rounded-lg p-3 text-left border ${borderColor} transition-colors group`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Name */}
                          <div className={`${textPrimary} font-medium mb-1 flex items-center gap-2`}>
                            {variable.name}
                            <span className={`${textSecondary} text-xs font-mono`}>
                              {variable.type}
                            </span>
                          </div>

                          {/* Path */}
                          <div className={`${textSecondary} text-xs font-mono mb-1 truncate`}>
                            {buildVariableReference(variable.path)}
                          </div>

                          {/* Description */}
                          {variable.description && (
                            <div className={`${textSecondary} text-xs`}>
                              {variable.description}
                            </div>
                          )}

                          {/* Example */}
                          {config.showExamples && variable.example && (
                            <div className={`${textSecondary} text-xs mt-1 font-mono`}>
                              Example: {variable.example}
                            </div>
                          )}

                          {/* Value (if available) */}
                          {variable.value !== undefined && (
                            <div className={`${textSecondary} text-xs mt-1`}>
                              Current: <span className="font-mono">{JSON.stringify(variable.value)}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(buildVariableReference(variable.path));
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <ChevronRight className={`h-4 w-4 ${textSecondary}`} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className={`px-4 py-3 border-t ${borderColor} ${textSecondary} text-xs`}>
        💡 Tip: Click a variable to insert it
      </div>
    </div>
  );
}
