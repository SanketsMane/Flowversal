import { useState, useEffect } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useCategoryStore } from '@/core/stores/admin/categoryStore';
import { RenderIcon } from './IconLibrary';
import { Search, X, Menu, Layers } from 'lucide-react';

export interface ToolCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface ToolCategoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isSidebarCollapsed: boolean;
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  isMobile?: boolean;
}

export function ToolCategoryPanel({ isOpen, onClose, isSidebarCollapsed, selectedCategory, onCategorySelect, isMobile = false }: ToolCategoryPanelProps) {
  const { theme } = useTheme();
  const { getActiveCategories } = useCategoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMinimized, setIsMinimized] = useState(isMobile);

  useEffect(() => {
    if (isMobile) {
      setIsMinimized(!isOpen);
    } else {
      setIsMinimized(false);
    }
  }, [isMobile, isOpen]);

  // Get categories from store
  const storeCategories = getActiveCategories();
  
  // Convert store categories to tool categories format with "All Tools" first
  const toolCategories: ToolCategory[] = [
    { 
      id: 'all', 
      name: 'All Tools', 
      icon: <Layers className="w-5 h-5" /> 
    },
    ...storeCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: <RenderIcon name={cat.icon} className="w-5 h-5" style={{ color: cat.color }} />
    }))
  ];

  const filteredCategories = toolCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100';
  const selectedBg = theme === 'dark' ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-l-2 border-l-cyan-500' : 'bg-blue-50 border-l-2 border-l-blue-500';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';

  // Mobile minimized state
  if (isMobile && isMinimized) {
    return (
      <div className={`fixed top-16 left-0 ${bgColor} ${borderColor} border-r h-[calc(100vh-4rem)] z-40 flex flex-col items-center py-4 px-2 w-16 transition-all duration-300`}>
        <button
          onClick={() => setIsMinimized(false)}
          className={`p-2 rounded-lg ${hoverBg} ${textColor} transition-colors mb-4`}
          aria-label="Expand categories"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex-1 overflow-y-auto space-y-2 w-full">
          {toolCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onCategorySelect(category.id);
              }}
              className={`w-full p-2 rounded-lg transition-colors flex items-center justify-center ${
                selectedCategory === category.id
                  ? 'text-cyan-500 bg-cyan-500/10'
                  : `${textColor} ${hoverBg}`
              }`}
              title={category.name}
            >
              {category.icon}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const leftPosition = isMobile ? 'left-0' : isSidebarCollapsed ? 'left-0 lg:left-[140px]' : 'left-0 lg:left-[220px]';
  const width = isMobile ? 'w-64' : 'w-64 lg:w-72';

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && !isMinimized && (
        <div
          className="fixed inset-0 bg-black/50 z-30 top-16"
          onClick={() => setIsMinimized(true)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-16 ${leftPosition} ${width} ${bgColor} ${borderColor} border-r h-[calc(100vh-4rem)] z-40 flex flex-col transition-all duration-300 ${
          isOpen || (isMobile && !isMinimized) ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className={`p-4 ${borderColor} border-b flex items-center justify-between`}>
          <h2 className={`${textColor}`}>Tool Categories</h2>
          {isMobile ? (
            <button
              onClick={() => setIsMinimized(true)}
              className={`p-1 rounded ${hoverBg} ${textColor}`}
              aria-label="Minimize"
            >
              <Menu className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className={`p-1 rounded ${hoverBg} ${textColor}`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textColor}`} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${inputBg} ${borderColor} border rounded-lg ${textColor} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filteredCategories.length === 0 ? (
            <div className={`text-center py-8 ${textColor} opacity-60`}>
              No categories found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategorySelect(category.id)}
                  className={`w-full px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    selectedCategory === category.id
                      ? selectedBg
                      : `${textColor} ${hoverBg}`
                  }`}
                >
                  <span className={selectedCategory === category.id ? 'text-cyan-500' : ''}>
                    {category.icon}
                  </span>
                  <span className={`flex-1 text-left ${selectedCategory === category.id ? 'text-cyan-500' : ''}`}>
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}