/**
 * Template Preview Component
 * Shows detailed preview of a workflow template before installation
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { WorkflowTemplate } from '../types/template.types';
import { 
  FullScreenDialog,
  FullScreenDialogContent, 
  FullScreenDialogDescription, 
  FullScreenDialogHeader, 
  FullScreenDialogTitle 
} from './FullScreenDialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { useTheme } from '@/core/theme/ThemeContext';

interface TemplatePreviewProps {
  template: WorkflowTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onInstall: (template: WorkflowTemplate) => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  isOpen,
  onClose,
  onInstall
}) => {
  const { theme } = useTheme();
  
  if (!template) return null;
  
  const IconComponent = (LucideIcons as any)[template.icon] || LucideIcons.FileText;
  
  // Theme-aware colors
  const bgDialog = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const separatorColor = theme === 'dark' ? 'bg-[#2A2A3E]' : 'bg-gray-200';
  
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
  
  const handleInstall = () => {
    onInstall(template);
    onClose();
  };
  
  return (
    <FullScreenDialog open={isOpen} onOpenChange={onClose}>
      <FullScreenDialogContent 
        className={`w-screen h-screen max-w-none ${bgDialog} ${borderColor} ${textPrimary} overflow-hidden flex flex-col rounded-none p-0 m-0`}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: 'none',
          maxWidth: '100vw',
          maxHeight: '100vh'
        }}
      >
        <FullScreenDialogHeader className={`px-8 pt-8 pb-6 border-b ${borderColor} flex-shrink-0`}>
          <div className="flex items-start gap-6">
            <div className="shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-blue-500/20">
              <IconComponent className="w-10 h-10 text-blue-400" />
            </div>
            <div className="flex-1">
              <FullScreenDialogTitle className={`text-3xl mb-3 ${textPrimary}`}>{template.name}</FullScreenDialogTitle>
              <FullScreenDialogDescription className={`${textSecondary} text-base`}>
                {template.description}
              </FullScreenDialogDescription>
            </div>
          </div>
        </FullScreenDialogHeader>
        
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${getDifficultyColor(template.difficulty)} px-4 py-2 text-sm`}>
                {template.difficulty}
              </Badge>
              <Badge variant="outline" className={`${bgCard} ${textSecondary} ${borderColor} px-4 py-2 text-sm`}>
                <LucideIcons.Clock className="w-4 h-4 mr-2" />
                {template.estimatedTime}
              </Badge>
              <Badge variant="outline" className={`${bgCard} ${textSecondary} ${borderColor} px-4 py-2 text-sm`}>
                <LucideIcons.Tag className="w-4 h-4 mr-2" />
                {template.category}
              </Badge>
              {template.popularity && (
                <Badge variant="outline" className={`${bgCard} ${textSecondary} ${borderColor} px-4 py-2 text-sm`}>
                  <LucideIcons.TrendingUp className="w-4 h-4 mr-2" />
                  {template.popularity}% popular
                </Badge>
              )}
            </div>
            
            <Separator className={separatorColor} />
            
            {/* Use Cases */}
            <div>
              <h3 className={`${textPrimary} text-xl font-semibold mb-4 flex items-center gap-2`}>
                <LucideIcons.Target className="w-5 h-5 text-blue-400" />
                Use Cases
              </h3>
              <ul className="space-y-3">
                {template.useCases.map((useCase, index) => (
                  <li key={index} className={`flex items-start gap-3 ${textSecondary} text-base`}>
                    <LucideIcons.Check className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Separator className={separatorColor} />
            
            {/* Tags */}
            <div>
              <h3 className={`${textPrimary} text-xl font-semibold mb-4 flex items-center gap-2`}>
                <LucideIcons.Tags className="w-5 h-5 text-blue-400" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-3">
                {template.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`${bgCard} ${textSecondary} ${borderColor} px-4 py-2 text-sm`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Author & Date */}
            {(template.author || template.createdAt) && (
              <>
                <Separator className={separatorColor} />
                <div className={`flex items-center gap-6 text-base ${textSecondary}`}>
                  {template.author && (
                    <div className="flex items-center gap-2">
                      <LucideIcons.User className="w-5 h-5" />
                      <span>By {template.author}</span>
                    </div>
                  )}
                  {template.createdAt && (
                    <div className="flex items-center gap-2">
                      <LucideIcons.Calendar className="w-5 h-5" />
                      <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className={`flex items-center justify-end gap-4 px-8 py-6 border-t ${borderColor} flex-shrink-0`}>
          <Button
            variant="outline"
            onClick={onClose}
            size="lg"
            className={`${borderColor} hover:${bgCard} ${textSecondary}`}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInstall}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white"
          >
            <LucideIcons.Download className="w-5 h-5 mr-2" />
            Use This Template
          </Button>
        </div>
      </FullScreenDialogContent>
    </FullScreenDialog>
  );
};