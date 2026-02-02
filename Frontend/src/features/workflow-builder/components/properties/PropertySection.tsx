/**
 * Property Section Component
 * Phase 2 - Component Extraction
 * 
 * Reusable section wrapper for property panels
 */

import { ReactNode } from 'react';
import { useTheme } from '../../../../components/ThemeContext';

interface PropertySectionProps {
  title?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function PropertySection({ title, children, collapsible = false, defaultOpen = true }: PropertySectionProps) {
  const { theme } = useTheme();

  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`${bgInput} p-4 rounded-lg border ${borderColor}`}>
      {title && (
        <h4 className={`${textPrimary} text-sm font-semibold mb-3`}>
          {title}
        </h4>
      )}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
