/**
 * Transformation Picker Component
 * Phase 4 Part 3 - Variable System
 * 
 * UI for selecting variable transformations
 */

import { useState, useMemo } from 'react';
import { useTheme } from '../../../../components/ThemeContext';
import { 
  getAllTransformations,
  getTransformationCategories,
} from '../../utils/variable.transformations';
import { VariableTransformation } from '../../types/variable.types';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { Search, Sparkles } from 'lucide-react';

interface TransformationPickerProps {
  onSelect?: (transformation: VariableTransformation) => void;
  onClose?: () => void;
  selectedTransformations?: string[];
}

export function TransformationPicker({
  onSelect,
  onClose,
  selectedTransformations = [],
}: TransformationPickerProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const allTransformations = getAllTransformations();
  const categories = getTransformationCategories();

  // Filter transformations
  const filteredTransformations = useMemo(() => {
    let filtered = allTransformations;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allTransformations, selectedCategory, searchQuery]);

  // Group by category
  const groupedTransformations = useMemo(() => {
    const groups = new Map<string, VariableTransformation[]>();

    filteredTransformations.forEach(t => {
      const category = t.category || 'Other';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(t);
    });

    return Array.from(groups.entries()).map(([category, transformations]) => ({
      category,
      transformations,
    }));
  }, [filteredTransformations]);

  return (
    <div className={`${bgCard} rounded-lg border ${borderColor}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${borderColor}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className={`h-5 w-5 ${textSecondary}`} />
            <h3 className={`${textPrimary} font-medium`}>
              Add Transformation
            </h3>
          </div>
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
            placeholder="Search transformations..."
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
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Transformation List */}
      <ScrollArea className="h-96">
        {filteredTransformations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className={`h-12 w-12 ${textSecondary} opacity-50 mb-3`} />
            <p className={`${textSecondary} text-sm`}>
              No transformations found
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {groupedTransformations.map(({ category, transformations }) => (
              <div key={category}>
                {/* Category Header */}
                <h4 className={`${textPrimary} font-medium text-sm mb-2`}>
                  {category}
                </h4>

                {/* Transformations */}
                <div className="space-y-1">
                  {transformations.map(transformation => {
                    const isSelected = selectedTransformations.includes(transformation.id);

                    return (
                      <button
                        key={transformation.id}
                        onClick={() => onSelect?.(transformation)}
                        disabled={isSelected}
                        className={`w-full ${
                          isSelected ? 'opacity-50 cursor-not-allowed' : bgHover
                        } rounded-lg p-3 text-left border ${borderColor} transition-colors`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            {/* Name */}
                            <div className={`${textPrimary} font-medium mb-1 flex items-center gap-2`}>
                              {transformation.name}
                              <code className={`${textSecondary} text-xs font-mono`}>
                                |{transformation.id}
                              </code>
                              {isSelected && (
                                <span className="text-[#00C6FF] text-xs">✓ Added</span>
                              )}
                            </div>

                            {/* Description */}
                            <div className={`${textSecondary} text-sm mb-2`}>
                              {transformation.description}
                            </div>

                            {/* Example */}
                            {transformation.example && (
                              <div className={`${textSecondary} text-xs font-mono bg-[#0E0E1F] rounded px-2 py-1`}>
                                {transformation.example}
                              </div>
                            )}
                          </div>

                          <Sparkles className={`h-4 w-4 ${textSecondary} flex-shrink-0`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className={`px-4 py-3 border-t ${borderColor} ${textSecondary} text-xs`}>
        💡 Transformations are applied in order: <code className="px-1 py-0.5 bg-[#2A2A3E] rounded">{'{{value|upper|trim}}'}</code>
      </div>
    </div>
  );
}
