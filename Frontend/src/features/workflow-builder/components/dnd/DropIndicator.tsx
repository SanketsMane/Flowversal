/**
 * Drop Indicator Component
 * Shows a glowing line where a node will be dropped during drag operations
 */

import { useTheme } from '@/core/theme/ThemeContext';

interface DropIndicatorProps {
  position: 'top' | 'bottom';
  isVisible: boolean;
}

export function DropIndicator({ position, isVisible }: DropIndicatorProps) {
  const { theme } = useTheme();
  
  if (!isVisible) return null;

  const gradientColor = theme === 'dark' 
    ? 'from-[#00C6FF] via-[#9D50BB] to-[#00C6FF]' 
    : 'from-blue-400 via-purple-500 to-blue-400';

  return (
    <div
      className={`
        absolute left-0 right-0 h-0.5 z-50
        ${position === 'top' ? '-top-2' : '-bottom-2'}
        bg-gradient-to-r ${gradientColor}
        animate-pulse
      `}
      style={{
        boxShadow: theme === 'dark'
          ? '0 0 12px rgba(0, 198, 255, 0.8), 0 0 24px rgba(157, 80, 187, 0.6)'
          : '0 0 12px rgba(59, 130, 246, 0.8), 0 0 24px rgba(168, 85, 247, 0.6)',
      }}
    >
      {/* Glowing orb at the left */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]"
        style={{
          boxShadow: '0 0 8px rgba(0, 198, 255, 0.9), 0 0 16px rgba(157, 80, 187, 0.7)',
        }}
      />
      {/* Glowing orb at the right */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-[#9D50BB] to-[#00C6FF]"
        style={{
          boxShadow: '0 0 8px rgba(157, 80, 187, 0.9), 0 0 16px rgba(0, 198, 255, 0.7)',
        }}
      />
    </div>
  );
}
