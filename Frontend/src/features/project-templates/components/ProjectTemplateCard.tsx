/**
 * Project Template Card Component
 * Displays a single project template in the gallery
 */

import React from 'react';
import { ProjectTemplate } from '../types/projectTemplate.types';
import { getTemplateStats } from '../utils/projectTemplateManager';
import { Clock, Layers, CheckSquare, Zap, TrendingUp } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { RenderIconByName } from '@/shared/components/ui/SimpleIconPicker';

interface ProjectTemplateCardProps {
  template: ProjectTemplate;
  onClick: () => void;
}

export const ProjectTemplateCard: React.FC<ProjectTemplateCardProps> = ({ template, onClick }) => {
  const { theme } = useTheme();
  const stats = getTemplateStats(template);
  
  // Theme colors
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgHover = theme === 'dark' ? 'hover:bg-[#252540]' : 'hover:bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  
  // Difficulty badge colors
  const difficultyColors = {
    beginner: theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
    intermediate: theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    advanced: theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
  };

  return (
    <div
      onClick={onClick}
      className={`${bgCard} ${bgHover} border ${borderColor} rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group`}
    >
      {/* Header with icon and badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 flex items-center justify-center">
            <RenderIconByName name={template.icon} className="w-6 h-6 text-[#00C6FF]" />
          </div>
          <div>
            <h3 className={`text-lg ${textPrimary} group-hover:text-[#00C6FF] transition-colors`}>
              {template.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[template.difficulty]}`}>
                {template.difficulty}
              </span>
              {template.featured && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className={`${textSecondary} text-sm mb-4 line-clamp-2`}>
        {template.description}
      </p>

      {/* Industries */}
      <div className="flex flex-wrap gap-1 mb-4">
        {template.industry.slice(0, 3).map((ind, idx) => (
          <span
            key={idx}
            className={`text-xs px-2 py-1 rounded ${
              theme === 'dark' ? 'bg-[#2A2A3E] text-[#CFCFE8]' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {ind}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Layers className={`w-4 h-4 ${textMuted}`} />
          <span className={`text-xs ${textSecondary}`}>
            {stats.totalBoards} boards
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckSquare className={`w-4 h-4 ${textMuted}`} />
          <span className={`text-xs ${textSecondary}`}>
            {stats.totalTasks} tasks
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${textMuted}`} />
          <span className={`text-xs ${textSecondary}`}>
            {stats.totalWorkflows} workflows
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${textMuted}`} />
          <span className={`text-xs ${textSecondary}`}>
            ~{template.estimatedSetupTime}
          </span>
        </div>
      </div>

      {/* Usage count */}
      {template.usageCount && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
          <TrendingUp className={`w-4 h-4 ${textMuted}`} />
          <span className={`text-xs ${textMuted}`}>
            Used by {template.usageCount.toLocaleString()} teams
          </span>
        </div>
      )}
    </div>
  );
};
