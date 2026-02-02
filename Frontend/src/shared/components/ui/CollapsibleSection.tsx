import { ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CollapsibleSection({ title, isOpen, onToggle, children }: CollapsibleSectionProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';

  return (
    <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 ${bgHover} transition-colors`}
      >
        <span className={`${textColor} text-sm font-medium`}>{title}</span>
        {isOpen ? (
          <ChevronUp className={`w-4 h-4 ${textColor}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 ${textColor}`} />
        )}
      </button>
      {isOpen && (
        <div className="px-4 py-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}
