import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface SearchableSelectProps {
  options: string[];
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({ options, placeholder, className }: SearchableSelectProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} flex items-center justify-between`}
      >
        <span>{selectedValue || placeholder || 'Select...'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className={`absolute z-20 w-full mt-1 ${bgInput} border ${borderColor} rounded-lg shadow-lg max-h-60 overflow-hidden`}>
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className={`w-full pl-9 pr-3 py-2 border ${borderColor} rounded ${textColor} ${bgInput} text-sm`}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedValue(opt);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-cyan-500/10 ${textColor} text-sm`}
                  >
                    {opt}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No options found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
