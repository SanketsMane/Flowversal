import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface SearchableDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function SearchableDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder,
  label 
}: SearchableDropdownProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {label && <label className={`${textPrimary} text-sm`}>{label}</label>}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 rounded-lg ${bgInput} border ${borderColor} ${textPrimary} flex items-center justify-between hover:border-[#00C6FF]/50 transition-all`}
        >
          <span className={value ? '' : 'text-gray-500'}>{value || placeholder || 'Select...'}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className={`absolute z-20 w-full mt-1 ${bgInput} border ${borderColor} rounded-lg shadow-lg max-h-60 overflow-hidden`}>
              <div className={`p-2 border-b ${borderColor}`}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className={`w-full pl-9 pr-3 py-2 border ${borderColor} rounded ${textColor} ${bgInput} text-sm focus:outline-none focus:border-[#00C6FF]/50`}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onChange(opt);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-[#00C6FF]/10 ${
                        value === opt ? 'bg-[#00C6FF]/5 text-[#00C6FF]' : textColor
                      } text-sm transition-all`}
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
    </div>
  );
}
