import { useDrop } from 'react-dnd';
import { useTheme } from '../ThemeContext';
import { Plus } from 'lucide-react';
import { useRef } from 'react';

interface VariableDropInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (e: any) => void;
  onFocus?: () => void;
  placeholder?: string;
  isActive?: boolean;
  onPlusClick?: () => void;
  type?: 'input' | 'textarea';
  rows?: number;
  maxHeight?: string;
}

export function VariableDropInput({
  value,
  onChange,
  onSelect,
  onFocus,
  placeholder,
  isActive,
  onPlusClick,
  type = 'input',
  rows = 2,
  maxHeight = 'max-h-32'
}: VariableDropInputProps) {
  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'VARIABLE',
    drop: (item: { variable: { id: string; name: string; value: string; type: string } }) => {
      const input = inputRef.current;
      if (!input) return;

      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      
      // Format variable as {{ $json.variableName }}
      const variableText = `{{ $json.${item.variable.name} }}`;
      
      // If text is selected, replace it; otherwise insert at cursor
      const newValue = value.slice(0, start) + variableText + value.slice(end);
      onChange(newValue);

      // Set cursor position after inserted variable
      setTimeout(() => {
        const newPosition = start + variableText.length;
        input.setSelectionRange(newPosition, newPosition);
        input.focus();
      }, 0);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const activeClass = isActive ? 'border-[#00C6FF] ring-2 ring-[#00C6FF]/30' : borderColor;
  const dropIndicatorClass = isOver && canDrop ? 'border-[#00C6FF] ring-2 ring-[#00C6FF]/50 bg-[#00C6FF]/5' : '';
  const commonClasses = `w-full px-3 py-2 pr-10 rounded-lg ${bgInput} border ${dropIndicatorClass || activeClass} ${textPrimary} placeholder:${textSecondary} transition-all focus:outline-none focus:border-[#00C6FF]/50`;

  return (
    <div className="relative" ref={drop}>
      {type === 'textarea' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={onSelect}
          onFocus={onFocus}
          placeholder={placeholder}
          rows={rows}
          className={`${commonClasses} resize-none overflow-y-auto ${maxHeight}`}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={onSelect}
          onFocus={onFocus}
          placeholder={placeholder}
          className={commonClasses}
        />
      )}
      {onPlusClick && (
        <button
          onClick={onPlusClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded bg-[#00C6FF] hover:bg-[#00A8E8] text-white transition-all"
          title="Add variable"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}