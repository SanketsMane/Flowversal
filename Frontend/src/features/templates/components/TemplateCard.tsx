/**
 * Template Card Component
 * Displays a workflow template in a card format
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { WorkflowTemplate } from '../types/template.types';
import { Badge } from '@/shared/components/ui/badge';
import { useTheme } from '@/core/theme/ThemeContext';

interface TemplateCardProps {
  template: WorkflowTemplate;
  onSelect: (template: WorkflowTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const { theme } = useTheme();
  
  // Get the icon component dynamically
  const IconComponent = (LucideIcons as any)[template.icon] || LucideIcons.FileText;
  
  // Theme-aware colors
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const borderHover = theme === 'dark' ? 'hover:border-blue-500/50' : 'hover:border-blue-400';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const textTertiary = theme === 'dark' ? 'text-gray-500' : 'text-gray-500';
  const bgTag = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const borderTag = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const borderDivider = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'intermediate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'advanced':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };
  
  // Non-blocking click handler
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🖱️ Template card clicked:', template.name);
    
    // Direct call - no need to defer since we stripped workflowData
    onSelect(template);
  };
  
  return (
    <div
      onClick={handleClick}
      className={`group relative ${bgCard} border ${borderColor} ${borderHover} rounded-xl p-5 transition-all cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1`}
    >
      {/* Featured Badge */}
      {template.featured && (
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-gradient-to-r from-blue-500/20 to-violet-500/20 text-blue-300 border-blue-500/30 text-xs">
            ⭐ Featured
          </Badge>
        </div>
      )}
      
      {/* Icon - Larger and more prominent */}
      <div className="mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-blue-500/20 mb-3">
          <IconComponent className="w-7 h-7 text-blue-400" />
        </div>
        
        <div>
          <h3 className={`${textPrimary} font-semibold mb-2 group-hover:text-blue-400 transition-colors line-clamp-1`}>
            {template.name}
          </h3>
          <p className={`${textSecondary} text-sm line-clamp-2 leading-relaxed`}>
            {template.description}
          </p>
        </div>
      </div>
      
      {/* Tags - More compact */}
      <div className="flex flex-wrap gap-1.5 mb-4 min-h-[28px]">
        {template.tags.slice(0, 2).map((tag, index) => (
          <Badge 
            key={index} 
            variant="outline" 
            className={`${bgTag} ${textSecondary} ${borderTag} text-xs px-2 py-0.5`}
          >
            {tag}
          </Badge>
        ))}
        {template.tags.length > 2 && (
          <Badge 
            variant="outline" 
            className={`${bgTag} ${textSecondary} ${borderTag} text-xs px-2 py-0.5`}
          >
            +{template.tags.length - 2}
          </Badge>
        )}
      </div>
      
      {/* Footer - More prominent */}
      <div className={`flex items-center justify-between pt-3 border-t ${borderDivider}`}>
        <div className="flex items-center gap-2">
          <Badge className={`${getDifficultyColor(template.difficulty)} text-xs px-2 py-1`}>
            {template.difficulty}
          </Badge>
          <span className={`text-xs ${textTertiary} flex items-center gap-1`}>
            <LucideIcons.Clock className="w-3.5 h-3.5" />
            {template.estimatedTime}
          </span>
        </div>
        
        {template.popularity && (
          <div className={`flex items-center gap-1 text-xs ${textTertiary}`}>
            <LucideIcons.TrendingUp className="w-3.5 h-3.5" />
            {template.popularity}%
          </div>
        )}
      </div>
      
      {/* Hover Indicator */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};