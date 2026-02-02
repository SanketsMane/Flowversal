/**
 * Property Field Component
 * Phase 2 - Component Extraction
 * 
 * Reusable field wrapper with label
 */

import { ReactNode } from 'react';
import { useTheme } from '../../../../components/ThemeContext';

interface PropertyFieldProps {
  label: string;
  description?: string;
  children: ReactNode;
  required?: boolean;
}

export function PropertyField({ label, description, children, required }: PropertyFieldProps) {
  const { theme } = useTheme();

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <div>
      <label className={`${textPrimary} text-sm mb-2 block`}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {description && (
        <p className={`${textSecondary} text-xs mt-1`}>
          {description}
        </p>
      )}
    </div>
  );
}
