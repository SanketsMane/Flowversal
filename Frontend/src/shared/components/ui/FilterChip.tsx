import { useTheme } from '@/core/theme/ThemeContext';

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function FilterChip({ label, active = false, onClick }: FilterChipProps) {
  const { theme } = useTheme();
  
  const bgInactive = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderInactive = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textInactive = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg transition-all
        ${active 
          ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 border-2 border-transparent bg-clip-padding relative before:absolute before:inset-0 before:rounded-lg before:p-[2px] before:bg-gradient-to-r before:from-[#00C6FF] before:to-[#9D50BB] before:-z-10 text-white' 
          : `${bgInactive} border ${borderInactive} ${textInactive} hover:border-[#00C6FF]/50`
        }
      `}
    >
      {label}
    </button>
  );
}
