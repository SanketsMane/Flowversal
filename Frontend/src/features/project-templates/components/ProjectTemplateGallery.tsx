/**
 * Project Template Gallery Component
 * Main UI for browsing and selecting project templates
 */

import React, { useState } from 'react';
import { ProjectTemplate, ProjectTemplateCategory, TemplateConfigurationData } from '../types/projectTemplate.types';
import { PROJECT_TEMPLATES, CATEGORY_INFO, getTemplatesByCategory, searchTemplates } from '../templates';
import { ProjectTemplateCard } from './ProjectTemplateCard';
import { ConfigurationWizard } from './ConfigurationWizard';
import { TemplatePreview } from './TemplatePreview';
import { createProjectFromTemplate, getTasksForBoard } from '../utils/projectTemplateManager';
import { useProjectStore } from '@/core/stores/projectStore';
import type { ProjectConfiguration, BoardConfiguration } from '@/core/stores/projectStore';
import { useTheme } from '@/core/theme/ThemeContext';
import { X, Search, Filter, Star, TrendingUp, ShoppingCart, Megaphone, Briefcase, Headphones, Users, PenTool, Code } from 'lucide-react';
import { toast } from 'sonner';
import { RenderIconByName } from '@/shared/components/ui/SimpleIconPicker';

interface ProjectTemplateGalleryProps {
  onClose: () => void;
}

export const ProjectTemplateGallery: React.FC<ProjectTemplateGalleryProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const { addProject, addBoard, addTask, updateBoardConfiguration } = useProjectStore();
  
  const [selectedCategory, setSelectedCategory] = useState<ProjectTemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ProjectTemplate | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showWizard && !previewTemplate) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, showWizard, previewTemplate]);

  // Theme colors
  const bgModal = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPage = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const inputBorder = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-300';

  // Filter templates
  const getFilteredTemplates = (): ProjectTemplate[] => {
    let filtered = getTemplatesByCategory(selectedCategory);
    
    if (searchQuery.trim()) {
      filtered = searchTemplates(searchQuery);
    }
    
    return filtered;
  };

  const filteredTemplates = getFilteredTemplates();
  const featuredTemplates = filteredTemplates.filter(t => t.featured);

  const handleTemplateClick = (template: ProjectTemplate) => {
    setPreviewTemplate(template);
  };

  const handleUseTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setPreviewTemplate(null);
    setShowWizard(true);
  };

  const handleWizardComplete = async (config: TemplateConfigurationData) => {
    if (!selectedTemplate) return;

    try {
      // Create the project
      const projectData = createProjectFromTemplate(selectedTemplate, config, '4'); // Justin's user ID
      const newProjectId = await addProject({
        ...projectData,
        configuration: {
          companyName: config.companyName,
          email: config.email,
          apiKeys: config.apiKeys,
          templateId: selectedTemplate.id,
          customFields: config.customFields,
        },
      });

      // Create boards and tasks
      for (const boardTemplate of selectedTemplate.boards) {
        // Add board
        const newBoardId = await addBoard({
          name: boardTemplate.name,
          icon: boardTemplate.icon || 'LayoutDashboard',
          iconColor: boardTemplate.color || '#9D50BB',
          projectId: newProjectId,
        });

        // Store configuration at board level
        const boardConfig: BoardConfiguration = {
          companyName: config.companyName,
          email: config.email,
          apiKeys: config.apiKeys,
          templateId: selectedTemplate.id,
          customFields: config.customFields,
        };
        updateBoardConfiguration(newBoardId, boardConfig);

        // Add tasks for this board
        const tasks = getTasksForBoard(
          selectedTemplate,
          boardTemplate.id,
          newBoardId,
          newProjectId,
          config,
          '4' // Justin's user ID
        );

        // Await all task creations
        for (const task of tasks) {
          await addTask(task);
        }
      }

      toast.success('Project created successfully!', {
        description: `${selectedTemplate.name} has been set up with ${selectedTemplate.boards.length} boards and ${selectedTemplate.boards.reduce((sum, b) => sum + b.tasks.length, 0)} tasks.`,
      });

      setShowWizard(false);
      onClose();
    } catch (error) {
      console.error('Error creating project from template:', error);
      toast.error('Failed to create project', {
        description: 'There was an error creating your project. Please try again.',
      });
    }
  };

  // All categories including 'all' at the beginning
  const categories: ProjectTemplateCategory[] = ['all', 'ecommerce', 'marketing', 'sales', 'customer-support', 'hr', 'content', 'development'];

  return (
    <>
      {/* Full-screen overlay at app level */}
      <div className="fixed inset-0 z-[9999] flex flex-col" onClick={(e) => {
        // Close if clicking directly on the outer container (not on content)
        if (e.target === e.currentTarget && !showWizard && !previewTemplate) {
          onClose();
        }
      }}>
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />
        
        {/* Content - Full screen */}
        <div className={`relative ${bgPage} w-full h-full flex flex-col pointer-events-auto`}>
          {/* Header */}
          <div className={`px-8 py-6 border-b ${borderColor} bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-3xl ${textPrimary} mb-2`}>Project Templates</h2>
                <p className={`${textSecondary}`}>
                  Start with a pre-built project template and customize to your needs
                </p>
              </div>
              <button
                onClick={onClose}
                className={`${textMuted} hover:text-red-500 transition-colors`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textMuted}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className={`w-full ${inputBg} border ${inputBorder} ${textPrimary} rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00C6FF]`}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className={`px-8 py-4 border-b ${borderColor} overflow-x-auto`}>
            <div className="flex items-center gap-2">
              {categories.map(category => {
                const info = CATEGORY_INFO[category];
                const isActive = selectedCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white'
                        : theme === 'dark'
                        ? 'bg-[#2A2A3E] text-[#CFCFE8] hover:bg-[#3A3A4E]'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <RenderIconByName name={info.iconName} className="w-4 h-4" />
                    <span className="text-sm">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Featured Section */}
            {selectedCategory === 'all' && featuredTemplates.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className={`text-xl ${textPrimary}`}>Featured Templates</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredTemplates.map(template => (
                    <ProjectTemplateCard
                      key={template.id}
                      template={template}
                      onClick={() => handleTemplateClick(template)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates */}
            {filteredTemplates.length > 0 ? (
              <div>
                {selectedCategory === 'all' && featuredTemplates.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#00C6FF]" />
                    <h3 className={`text-xl ${textPrimary}`}>All Templates</h3>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map(template => (
                    <ProjectTemplateCard
                      key={template.id}
                      template={template}
                      onClick={() => handleTemplateClick(template)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className={`${bgPage} border ${borderColor} rounded-xl p-12 text-center`}>
                <Filter className={`w-16 h-16 ${textMuted} mx-auto mb-4`} />
                <h3 className={`text-xl ${textPrimary} mb-2`}>No templates found</h3>
                <p className={`${textSecondary}`}>
                  Try adjusting your search or category filter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onUse={() => handleUseTemplate(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* Configuration Wizard */}
      {showWizard && selectedTemplate && (
        <ConfigurationWizard
          template={selectedTemplate}
          onComplete={handleWizardComplete}
          onCancel={() => {
            setShowWizard(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </>
  );
};
