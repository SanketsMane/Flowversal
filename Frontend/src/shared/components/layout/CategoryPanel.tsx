import { Pencil, Youtube, FileText, Search as SearchIcon, Share2, Image, ShoppingCart, X, Grid3x3 } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useState } from 'react';

interface CategoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryClick: (category: string) => void;
  isSidebarCollapsed?: boolean;
}

export function CategoryPanel({ isOpen, onClose, onCategoryClick, isSidebarCollapsed = true }: CategoryPanelProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Apps');

  const categoryItems = [
    { icon: Pencil, label: 'Blog Workflow', color: 'from-[#9D50BB] to-[#B876D5]', count: 3 },
    { icon: Youtube, label: 'YouTube Tools', color: 'from-[#DC2626] to-[#EF4444]', count: 1 },
    { icon: FileText, label: 'Rewriting Tools', color: 'from-[#0072FF] to-[#4F7BF7]', count: 2 },
    { icon: SearchIcon, label: 'SEO Tools', color: 'from-[#0891B2] to-[#06B6D4]', count: 1 },
    { icon: Share2, label: 'Social Media Tools', color: 'from-[#D946EF] to-[#E879F9]', count: 2 },
    { icon: Image, label: 'Image Prompts', color: 'from-[#E53E3E] to-[#F87171]', count: 1 },
    { icon: ShoppingCart, label: 'E-Commerce Tools', color: 'from-[#7C3AED] to-[#A78BFA]', count: 2 },
  ];

  // Filter categories based on search query
  const filteredCategories = categoryItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    onCategoryClick(category);
  };

  if (!isOpen) return null;

  const leftPosition = isSidebarCollapsed ? 'left-20' : 'left-[220px]';

  return (
    <div className={`fixed ${leftPosition} top-16 bottom-0 w-[280px] ${bgColor} border-r ${borderColor} transition-all duration-300 z-40`}>
      {/* Gradient accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00C6FF] via-[#0072FF] to-[#9D50BB]"></div>

      {/* Header */}
      <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
        <h3 className={`${textPrimary}`}>AI Apps</h3>
        <button
          onClick={onClose}
          className={`w-8 h-8 rounded-lg ${textColor} hover:bg-gradient-to-r hover:from-[#00C6FF]/10 hover:to-[#9D50BB]/10 hover:text-white transition-all flex items-center justify-center`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className={`p-4 border-b ${borderColor}`}>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${bgCard} focus-within:border-[#00C6FF]/50 transition-all`}>
          <SearchIcon className={`w-4 h-4 ${textColor}`} />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`flex-1 bg-transparent outline-none ${textPrimary} placeholder:${textColor} text-sm`}
          />
        </div>
      </div>

      {/* All Apps Option */}
      <div className="p-4 pb-2">
        <button
          onClick={() => handleCategorySelect('All Apps')}
          className={`w-full ${selectedCategory === 'All Apps' ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 border-[#00C6FF]/50' : bgCard} border ${borderColor} rounded-lg p-3 ${hoverBg} transition-all duration-300 flex items-center gap-3`}
        >
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center flex-shrink-0`}>
            <Grid3x3 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <span className={`${selectedCategory === 'All Apps' ? 'text-white' : textPrimary} text-sm block`}>All Apps</span>
            <span className={`${textColor} text-xs`}>12 workflows</span>
          </div>
        </button>
      </div>

      {/* Categories List */}
      <div className="px-4 pb-4 overflow-y-auto h-full pb-20">
        <div className="space-y-2">
          {filteredCategories.map((item, index) => (
            <button
              key={index}
              onClick={() => handleCategorySelect(item.label)}
              className={`w-full ${selectedCategory === item.label ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 border-[#00C6FF]/50' : bgCard} border ${borderColor} rounded-lg p-3 ${hoverBg} transition-all duration-300 flex items-center gap-3`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <span className={`${selectedCategory === item.label ? 'text-white' : textPrimary} text-sm block`}>{item.label}</span>
                <span className={`${textColor} text-xs`}>{item.count} {item.count === 1 ? 'workflow' : 'workflows'}</span>
              </div>
            </button>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-8">
            <p className={`${textColor} text-sm`}>No apps found</p>
          </div>
        )}
      </div>
    </div>
  );
}
