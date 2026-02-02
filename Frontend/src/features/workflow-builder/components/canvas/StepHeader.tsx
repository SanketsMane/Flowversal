/**
 * Step Header Component
 * Phase 2 - Component Extraction
 * 
 * Editable step title and subtitle
 */

import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore } from '../../stores';
import { Pencil } from 'lucide-react';

interface StepHeaderProps {
  containerId: string;
  title: string;
  subtitle?: string;
  stepNumber?: number;
}

export function StepHeader({ containerId, title, subtitle, stepNumber }: StepHeaderProps) {
  const { theme } = useTheme();
  const { updateContainer } = useWorkflowStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  const handleTitleChange = (newTitle: string) => {
    updateContainer(containerId, { title: newTitle });
  };

  const handleSubtitleChange = (newSubtitle: string) => {
    updateContainer(containerId, { subtitle: newSubtitle });
  };

  return (
    <div className="flex items-start gap-3">
      {/* Step Number Badge */}
      {stepNumber !== undefined && (
        <div className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-[#2A2A3E]' : 'bg-gray-200'} flex items-center justify-center flex-shrink-0 text-sm ${textSecondary}`}>
          {stepNumber}
        </div>
      )}

      {/* Title and Subtitle */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              autoFocus
              className={`${textPrimary} text-lg font-semibold bg-transparent border-b-2 border-[#00C6FF] outline-none w-full`}
            />
          ) : (
            <h3 
              className={`${textPrimary} text-lg font-semibold cursor-pointer hover:text-[#00C6FF] transition-colors`}
              onClick={() => setIsEditingTitle(true)}
              title="Click to edit title"
            >
              {title}
            </h3>
          )}
        </div>

        {/* Subtitle */}
        <div className="flex items-center gap-2 mt-1">
          {isEditingSubtitle ? (
            <input
              type="text"
              value={subtitle || ''}
              onChange={(e) => handleSubtitleChange(e.target.value)}
              onBlur={() => setIsEditingSubtitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingSubtitle(false);
                if (e.key === 'Escape') setIsEditingSubtitle(false);
              }}
              autoFocus
              placeholder="Add subtitle..."
              className={`${textSecondary} text-sm bg-transparent border-b border-[#00C6FF]/50 outline-none w-full`}
            />
          ) : (
            <p 
              className={`${textSecondary} text-sm cursor-pointer hover:text-[#00C6FF] transition-colors`}
              onClick={() => setIsEditingSubtitle(true)}
              title="Click to edit subtitle"
            >
              {subtitle || 'Click to add subtitle'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}