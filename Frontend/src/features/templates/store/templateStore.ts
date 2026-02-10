/**
 * Template Store - State Management for Templates
 * Manages template browsing, filtering, and installation
 */
import { create } from 'zustand';
import { WorkflowTemplate, TemplateCategory, TemplateFilterOptions } from '../types/template.types';
import { TEMPLATE_METADATA } from '../data/templateMetadata';
interface TemplateState {
  // Data
  templates: WorkflowTemplate[];
  filteredTemplates: WorkflowTemplate[];
  selectedTemplate: WorkflowTemplate | null;
  // UI State
  isTemplateLibraryOpen: boolean;
  isPreviewOpen: boolean;
  // Filters
  activeCategory: TemplateCategory;
  searchQuery: string;
  activeDifficulty: 'all' | 'beginner' | 'intermediate' | 'advanced';
  // Installation callback for opening workflow builder from MyWorkflows
  onTemplateInstall?: (templateData: any) => void;
  // Actions
  openTemplateLibrary: () => void;
  closeTemplateLibrary: () => void;
  selectTemplate: (template: WorkflowTemplate) => void;
  openPreview: (template: WorkflowTemplate) => void;
  closePreview: () => void;
  setInstallCallback: (callback?: (templateData: any) => void) => void;
  // Filtering
  setCategory: (category: TemplateCategory) => void;
  setSearchQuery: (query: string) => void;
  setDifficulty: (difficulty: 'all' | 'beginner' | 'intermediate' | 'advanced') => void;
  applyFilters: () => void;
  resetFilters: () => void;
}
export const useTemplateStore = create<TemplateState>((set, get) => ({
  // Initial State - Use lightweight metadata (NO workflowData)
  templates: TEMPLATE_METADATA as WorkflowTemplate[],
  filteredTemplates: TEMPLATE_METADATA as WorkflowTemplate[],
  selectedTemplate: null,
  isTemplateLibraryOpen: false,
  isPreviewOpen: false,
  activeCategory: 'all',
  searchQuery: '',
  activeDifficulty: 'all',
  // Actions
  openTemplateLibrary: () => {
    set({ isTemplateLibraryOpen: true });
  },
  closeTemplateLibrary: () => {
    set({ 
      isTemplateLibraryOpen: false,
      searchQuery: '',
      activeCategory: 'all',
      activeDifficulty: 'all',
      filteredTemplates: TEMPLATE_METADATA as WorkflowTemplate[]
    });
  },
  selectTemplate: (template) => {
    set({ selectedTemplate: template });
  },
  openPreview: (template) => {
    // We don't need the full workflowData for preview anymore
    // Just show the metadata (name, description, tags, use cases, etc.)
    set({ 
      selectedTemplate: template,
      isPreviewOpen: true 
    });
  },
  closePreview: () => {
    set({ 
      isPreviewOpen: false,
      selectedTemplate: null 
    });
  },
  setInstallCallback: (callback) => {
    set({ onTemplateInstall: callback });
  },
  // Filtering
  setCategory: (category) => {
    set({ activeCategory: category });
    get().applyFilters();
  },
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },
  setDifficulty: (difficulty) => {
    set({ activeDifficulty: difficulty });
    get().applyFilters();
  },
  applyFilters: () => {
    const { templates, activeCategory, searchQuery, activeDifficulty } = get();
    let filtered = [...templates];
    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(t => t.category === activeCategory);
    }
    // Apply difficulty filter
    if (activeDifficulty !== 'all') {
      filtered = filtered.filter(t => t.difficulty === activeDifficulty);
    }
    // Apply search filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        t.useCases.some(uc => uc.toLowerCase().includes(lowerQuery))
      );
    }
    // Sort by popularity
    filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    set({ filteredTemplates: filtered });
  },
  resetFilters: () => {
    set({
      activeCategory: 'all',
      searchQuery: '',
      activeDifficulty: 'all',
      filteredTemplates: TEMPLATE_METADATA as WorkflowTemplate[]
    });
  }
}));