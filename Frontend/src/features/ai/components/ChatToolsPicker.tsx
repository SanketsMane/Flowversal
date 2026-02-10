/**
 * Chat Tools Picker Component
 * Modal for selecting tools to add to chat
 * Matches screenshot design - white background, clean card layout
 */
import { useTheme } from '@/core/theme/ThemeContext';
import { nodeTemplates } from '@/features/workflow-builder/utils/nodeTemplates';
import { toolTemplates } from '@/features/workflow-builder/utils/toolTemplates';
import { triggerTemplates } from '@/features/workflow-builder/utils/triggerTemplates';
import {
  Bot,
  Briefcase,
  Check,
  GitBranch,
  Globe,
  Home,
  LucideIcon,
  Pen,
  Search,
  X,
  Zap,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
export interface SelectedTool {
  type: string;
  label: string;
  category: string;
  icon: LucideIcon;
  description?: string;
  itemType: 'trigger' | 'node' | 'tool';
}
interface ChatToolsPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: SelectedTool) => void;
  selectedTools: SelectedTool[];
  mode: 'agent' | 'ask';
}
interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}
interface Item {
  type: string;
  label: string;
  category: string;
  icon: any;
  description?: string;
  itemType: 'trigger' | 'node' | 'tool';
}
export function ChatToolsPicker({
  isOpen,
  onClose,
  onSelectTool,
  selectedTools,
  mode,
}: ChatToolsPickerProps) {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('home'); // categories like existing picker
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    // Check initial theme from DOM
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkTheme();
    // Watch for class changes on html element
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  // Get all items based on mode - moved before early return
  const getAllItems = (): Item[] => {
    const items: Item[] = [];
    if (mode === 'agent') {
      // Add triggers
      triggerTemplates.forEach(trigger => {
        items.push({
          type: trigger.type,
          label: trigger.label,
          category: 'triggers',
          icon: trigger.icon,
          description: trigger.description,
          itemType: 'trigger',
        });
      });
      // Add nodes
      nodeTemplates.forEach(node => {
        items.push({
          type: node.type,
          label: node.label,
          category: node.category,
          icon: node.icon,
          description: node.description,
          itemType: 'node',
        });
      });
      // Add tools
      toolTemplates.forEach(tool => {
        items.push({
          type: tool.type,
          label: tool.label,
          category: tool.category || 'action',
          icon: tool.icon,
          description: tool.description,
          itemType: 'tool',
        });
      });
    } else {
      // For 'ask' mode, show workflow-focused items
      nodeTemplates.forEach(node => {
        items.push({
          type: node.type,
          label: node.label,
          category: node.category,
          icon: node.icon,
          description: node.description,
          itemType: 'node',
        });
      });
    }
    return items;
  };
  // Filter items similar to UnifiedNodePickerModal: grouping only when searching in Home
  const filteredItems = useMemo(() => {
    let items = getAllItems();
    // Filter by category (except home)
    if (selectedCategory !== 'home') {
      items = items.filter(item => {
        if (selectedCategory === 'triggers') return item.itemType === 'trigger';
        return item.category === selectedCategory;
      });
    }
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          item.label.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
      );
      // If searching from home, group by category
      if (selectedCategory === 'home') {
        const grouped: Record<string, Item[]> = {};
        items.forEach((item) => {
          const key = item.itemType === 'trigger' ? 'triggers' : item.category || 'other';
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        });
        return grouped;
      }
    }
    return items;
  }, [searchQuery, mode, selectedCategory]);
  const isGrouped = useMemo(() => !Array.isArray(filteredItems), [filteredItems]);
  // Mount check for portal
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  // Debug: Log when component renders
  useEffect(() => {
    if (isOpen) {
    }
  }, [isOpen, isMounted]);
  const categories: Category[] = [
    { id: 'home', label: 'Home', icon: Home, description: 'All items' },
    { id: 'triggers', label: 'Triggers', icon: Zap, description: 'Start your workflow' },
    { id: 'ai', label: 'AI', icon: Bot, description: 'AI and ML capabilities' },
    { id: 'action', label: 'Action by tools', icon: Globe, description: 'External integrations' },
    { id: 'data', label: 'Data Transformation', icon: Pen, description: 'Transform and manipulate data' },
    { id: 'flow', label: 'Flow', icon: GitBranch, description: 'Control workflow flow' },
    { id: 'core', label: 'Core', icon: Briefcase, description: 'Core utilities' },
  ];
  // Early return AFTER all hooks
  if (!isOpen) {
    return null;
  }
  const isToolSelected = (type: string) => {
    return selectedTools.some(t => t.type === type);
  };
  const handleItemClick = (item: Item, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from closing
    onSelectTool({
      type: item.type,
      label: item.label,
      category: item.category,
      icon: item.icon,
      description: item.description,
      itemType: item.itemType,
    });
    // Don't close modal - allow multiple selections
  };
  // Get item card color based on category - matches screenshot
  const getItemCardColor = (category: string, itemType: string) => {
    if (itemType === 'trigger') {
      return 'bg-orange-500'; // Orange for triggers (matches screenshot)
    }
    switch (category) {
      case 'ai':
        return 'bg-purple-500';
      case 'action':
        return 'bg-blue-500';
      case 'data':
        return 'bg-green-500';
      case 'flow':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ zIndex: 99999, position: 'fixed' }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        style={{ position: 'absolute' }}
      />
      {/* Modal - Inspired by UnifiedNodePickerModal */}
      <div
        className={`relative w-[90%] max-w-[1000px] h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col border ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 100000, position: 'relative', backgroundColor: isDarkMode ? '#0F1115' : '#FFFFFF' }}
      >
        {/* Header */}
        <div className={`px-6 py-5 border-b ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`} style={{ backgroundColor: isDarkMode ? '#0F1115' : '#FFFFFF' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-black dark:text-white">Add to Workflow</h2>
              <p className="text-base mt-1 text-gray-700 dark:text-gray-400">
                Choose triggers, nodes, and tools to build your workflow
              </p>
            </div>
            <button
              onClick={onClose}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                isDarkMode 
                  ? 'bg-[#1A1D21] border-gray-800 hover:bg-[#2A2D35] text-gray-400' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Search bar */}
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`} style={{ backgroundColor: isDarkMode ? '#0F1115' : '#FFFFFF' }}>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition focus-within:border-[#00C6FF] ${
            isDarkMode ? 'bg-[#1A1D21] border-gray-800' : 'bg-gray-50 border-gray-200'
          }`}>
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all triggers, nodes, and tools..."
              className={`flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            />
          </div>
        </div>
        {/* Content with categories sidebar + grid - Fixed layout matching UnifiedNodePickerModal */}
        <div className={`flex flex-1 overflow-hidden ${
          isDarkMode ? 'bg-[#0F1115]' : 'bg-white'
        }`}>
          {/* Categories Sidebar - Fixed width, always visible on desktop/tablet */}
          <div className={`w-[240px] flex-shrink-0 border-r overflow-y-auto ${
            isDarkMode ? 'bg-[#1A1D21] border-gray-800' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`px-4 py-3 border-b ${
              isDarkMode ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>CATEGORIES</div>
            </div>
            <div className="p-2 space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white shadow'
                        : isDarkMode 
                          ? 'hover:bg-[#2A2D35] text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected 
                        ? 'bg-white/20' 
                        : isDarkMode ? 'bg-[#2A2D35] border border-gray-700' : 'bg-white border border-gray-200'
                    }`}>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{cat.label}</div>
                      {cat.description && (
                        <div className={`text-[11px] truncate ${isSelected ? 'opacity-80' : 'text-gray-400 dark:text-gray-500'}`}>
                          {cat.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Items grid */}
          <div className={`flex-1 overflow-y-auto p-6 ${
            isDarkMode ? 'bg-[#0F1115]' : 'bg-white'
          }`}>
            {isGrouped ? (
              <div className="space-y-8">
                {Object.entries(filteredItems as Record<string, Item[]>).map(([group, items]) => (
                  <div key={group} className="space-y-4">
                    <h3 className={`flex items-center gap-2 font-semibold text-base capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {group}
                      <span className={`text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>({items.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const isSelected = isToolSelected(item.type);
                        const cardColor = getItemCardColor(item.category, item.itemType);
                        return (
                          <button
                            key={`${item.itemType}-${item.type}`}
                            onClick={(e) => handleItemClick(item, e)}
                            className={`group relative flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 border ${
                              isSelected
                                ? 'border-[#00C6FF] bg-[#00C6FF]/5 shadow-[0_0_15px_rgba(0,198,255,0.15)] ring-1 ring-[#00C6FF]'
                                : isDarkMode 
                                  ? 'border-gray-800 bg-[#1A1D21] hover:border-[#00C6FF]/50' 
                                  : 'border-gray-200 bg-white hover:border-[#00C6FF]/50 hover:shadow-sm'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cardColor} shadow-sm group-hover:scale-105 transition-transform`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</div>
                              {item.description && (
                                <div className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#00C6FF] flex items-center justify-center shadow-[0_0_10px_rgba(0,198,255,0.4)]">
                                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = isToolSelected(item.type);
                  const cardColor = getItemCardColor(item.category, item.itemType);
                  return (
                    <button
                      key={`${item.itemType}-${item.type}`}
                      onClick={(e) => handleItemClick(item, e)}
                      className={`group relative flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 border ${
                        isSelected
                          ? 'border-[#00C6FF] bg-[#00C6FF]/5 shadow-[0_0_15px_rgba(0,198,255,0.15)] ring-1 ring-[#00C6FF]'
                          : isDarkMode 
                            ? 'border-gray-800 bg-[#1A1D21] hover:border-[#00C6FF]/50' 
                            : 'border-gray-200 bg-white hover:border-[#00C6FF]/50 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cardColor} shadow-sm group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</div>
                        {item.description && (
                          <div className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.description}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#00C6FF] flex items-center justify-center shadow-[0_0_10px_rgba(0,198,255,0.4)]">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
                {filteredItems.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      isDarkMode ? 'bg-[#1A1D21]' : 'bg-gray-50'
                    }`}>
                      <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-base font-medium text-gray-900 dark:text-white">No items found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try searching for something else</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className={`p-4 flex items-center justify-between border-t ${
          isDarkMode ? 'border-gray-800 bg-[#0F1115]' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedTools.length > 0 ? (
              <>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Selected:</span>
                {selectedTools.slice(0, 6).map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.type}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="text-xs font-medium">{tool.label}</span>
                    </div>
                  );
                })}
                {selectedTools.length > 6 && (
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    +{selectedTools.length - 6} more
                  </span>
                )}
              </>
            ) : (
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Select multiple tools, triggers, or nodes to add them to your workflow
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {selectedTools.length > 0 ? `Done (${selectedTools.length})` : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
  // Use portal to render at document body level
  if (!isMounted || typeof document === 'undefined') {
    return null;
  }
  return createPortal(
    <div className={isDarkMode ? 'dark' : ''}>
      {modalContent}
    </div>,
    document.body
  );
}
