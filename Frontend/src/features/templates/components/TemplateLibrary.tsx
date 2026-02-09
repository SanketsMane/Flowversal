/**
 * Template Library Component
 * Main interface for browsing and selecting workflow templates
 * Updated: Fixed import system to use unified workflow manager
 */
import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { useUIStore } from '../../workflow-builder/stores/uiStore';
import { loadFullTemplate } from '../utils/templateLoader';
import { 
  parseWorkflowFile, 
  loadWorkflowIntoStores,
  importAndLoadWorkflow 
} from '../../workflow-builder/utils/workflowManager';
import { TemplateCard } from './TemplateCard';
import { TemplatePreview } from './TemplatePreview';
import { 
  FullScreenDialog,
  FullScreenDialogContent, 
  FullScreenDialogHeader, 
  FullScreenDialogTitle, 
  FullScreenDialogDescription 
} from './FullScreenDialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { WorkflowTemplate, TemplateCategory } from '../types/template.types';
import { useTheme } from '@/core/theme/ThemeContext';
export const TemplateLibrary: React.FC = () => {
  const { theme } = useTheme();
  // Template store - handles all template state and filtering
  const {
    isTemplateLibraryOpen,
    closeTemplateLibrary,
    filteredTemplates,
    selectedTemplate,
    isPreviewOpen,
    openPreview,
    closePreview,
    activeCategory,
    setCategory,
    searchQuery,
    setSearchQuery,
    activeDifficulty,
    setDifficulty,
    resetFilters,
    onTemplateInstall
  } = useTemplateStore();
  // File input ref for JSON import
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // Theme-aware colors
  const bgDialog = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const bgInput = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const bgCategory = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-100';
  const bgCategoryActive = theme === 'dark' ? 'bg-[#2A2A3E]' : 'bg-blue-100';
  const textCategoryActive = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const categories: { value: TemplateCategory; label: string; icon: any }[] = [
    { value: 'all', label: 'All Templates', icon: LucideIcons.LayoutGrid },
    { value: 'automation', label: 'Automation', icon: LucideIcons.Zap },
    { value: 'data-processing', label: 'Data Processing', icon: LucideIcons.Database },
    { value: 'communication', label: 'Communication', icon: LucideIcons.MessageSquare },
    { value: 'content-generation', label: 'Content', icon: LucideIcons.FileText },
    { value: 'integration', label: 'Integration', icon: LucideIcons.Plug },
    { value: 'customer-service', label: 'Support', icon: LucideIcons.Headphones },
    { value: 'productivity', label: 'Productivity', icon: LucideIcons.Target },
    { value: 'analytics', label: 'Analytics', icon: LucideIcons.BarChart3 }
  ];
  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];
  const handleInstallTemplate = async (template: WorkflowTemplate) => {
    try {
      // Lazy load the FULL template with workflowData
      const fullTemplate = await loadFullTemplate(template.id);
      if (!fullTemplate || !fullTemplate.workflowData) {
        console.error('❌ Could not find full template data for:', template.id);
        const { showNotification } = useUIStore.getState();
        showNotification('Error: Template data not found', 'error');
        return;
      }
      // Close the library first to free up resources
      closeTemplateLibrary();
      // Check if there's a callback (from MyWorkflows) to open the workflow builder
      if (onTemplateInstall) {
        // Call the callback to open workflow builder with template data
        setTimeout(() => {
          onTemplateInstall(fullTemplate.workflowData);
          const { showNotification } = useUIStore.getState();
          showNotification(`Template "${template.name}" loaded successfully! You can now customize it.`, 'success');
        }, 200);
      } else {
        // Already in workflow builder - load template directly
        // loadWorkflowIntoStores handles all clearing internally
        setTimeout(() => {
          try {
            loadWorkflowIntoStores(fullTemplate.workflowData);
            // loadWorkflowIntoStores handles clearing and shows success notification
          } catch (error) {
            console.error('❌ [Flow 4 Pre-built] Error installing template:', error);
            const { showNotification } = useUIStore.getState();
            showNotification(`Error loading template: ${error}`, 'error');
          }
        }, 150);
      }
    } catch (error) {
      console.error('❌ Error loading full template:', error);
      const { showNotification } = useUIStore.getState();
      showNotification(`Error loading template: ${error}`, 'error');
    }
  };
  const handleClose = () => {
    closeTemplateLibrary();
    resetFilters();
  };
  // Handle importing a template from JSON file
  const handleImportTemplate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      // Ensure URL reflects workflow builder for imported templates
      if (typeof window !== 'undefined' && window.location.pathname !== '/workflow-builder') {
        window.history.pushState({}, '', '/workflow-builder');
      }
      // Close the library first
      closeTemplateLibrary();
      // Check if there's a callback (from Dashboard/MyWorkflows) to open the workflow builder
      if (onTemplateInstall) {
        // Parse file first
        const workflowData = await parseWorkflowFile(file);
        // Call the callback to open workflow builder with template data
        setTimeout(() => {
          onTemplateInstall(workflowData);
          const { showNotification } = useUIStore.getState();
          showNotification(`Workflow "${workflowData.name}" imported successfully! You can now customize it.`, 'success');
        }, 200);
      } else {
        // Already in workflow builder - use the SAME function as dropdown import
        // Small delay to allow dialog to close and free resources
        setTimeout(async () => {
          await importAndLoadWorkflow(file);
        }, 150);
      }
    } catch (error) {
      console.error('❌ [Popup Import] Error importing template:', error);
      const { showNotification } = useUIStore.getState();
      showNotification(`Error importing workflow: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  return (
    <>
      <FullScreenDialog open={isTemplateLibraryOpen} onOpenChange={handleClose}>
        <FullScreenDialogContent 
          className={`${bgDialog} ${borderColor} ${textPrimary} flex flex-col`}
        >
          {/* Compact Header */}
          <FullScreenDialogHeader className={`px-6 py-4 border-b ${borderColor} flex-shrink-0`}>
            <div className="flex items-center justify-between pr-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-blue-500/20">
                  <LucideIcons.Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <FullScreenDialogTitle className={`text-xl ${textPrimary}`}>
                    Workflow Templates
                  </FullScreenDialogTitle>
                  <FullScreenDialogDescription className={`${textSecondary} text-sm`}>
                    {filteredTemplates.length} templates available
                  </FullScreenDialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportClick}
                  className={`${borderColor} ${textSecondary}`}
                >
                  <LucideIcons.Upload className="w-4 h-4 mr-1.5" />
                  Import JSON
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className={textSecondary}
                >
                  <LucideIcons.RotateCcw className="w-4 h-4 mr-1.5" />
                  Reset
                </Button>
              </div>
            </div>
          </FullScreenDialogHeader>
          {/* Compact Search and Filters */}
          <div className={`px-6 py-3 border-b ${borderColor} ${bgInput}/30 flex-shrink-0`}>
            {/* Search and Difficulty in one row */}
            <div className="flex items-center gap-4 mb-3">
              <div className="relative flex-1 max-w-md">
                <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-9 h-9 text-sm ${bgInput} ${borderColor} ${textPrimary} placeholder:text-gray-500`}
                />
              </div>
              {/* Difficulty Filter - Compact */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${textSecondary} shrink-0`}>Difficulty:</span>
                {difficulties.map((diff) => (
                  <button
                    key={diff.value}
                    onClick={() => setDifficulty(diff.value as any)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      activeDifficulty === diff.value
                        ? 'bg-violet-500/20 border border-violet-500/50 text-violet-300'
                        : `${bgCategory} border ${borderColor} ${textSecondary} hover:border-opacity-70`
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Category Tabs - Compact horizontal scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`shrink-0 px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 text-xs font-medium ${
                      isActive
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : `${bgCategory} ${borderColor} ${textSecondary} hover:border-opacity-70`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Template Grid - Maximum space */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <LucideIcons.Search className={`w-16 h-16 ${textSecondary} mb-4`} />
                <h3 className={`text-xl ${textPrimary} mb-2`}>No templates found</h3>
                <p className={`${textSecondary} text-sm mb-4`}>
                  Try adjusting your search or filters
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className={`${borderColor} ${textSecondary}`}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={openPreview}
                  />
                ))}
              </div>
            )}
          </div>
        </FullScreenDialogContent>
      </FullScreenDialog>
      {/* Template Preview Modal */}
      <TemplatePreview
        template={selectedTemplate}
        isOpen={isPreviewOpen}
        onClose={closePreview}
        onInstall={handleInstallTemplate}
      />
      {/* Hidden file input for importing templates */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleImportTemplate}
      />
    </>
  );
};
