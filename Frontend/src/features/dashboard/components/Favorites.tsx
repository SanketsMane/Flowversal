import { useState } from 'react';
import { WorkflowCard } from '@/features/workflows/components/WorkflowCard';
import { WorkflowPreviewModal } from '@/features/workflows/components/WorkflowPreviewModal';
import { Heart, Search, Grid3x3, List, Image, FileText, Video, Code, BarChart3, Mail, Share2, Globe } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflows } from '@/shared/lib/WorkflowContext';

interface FavoritesProps {
  onWorkflowClick?: (workflowName: string) => void;
  onWorkflowPlusClick?: (workflow: { name: string; description: string }, action: 'create' | 'attach') => void;
}

// Helper function to create workflow preview data for sample favorites
const createSampleWorkflowPreview = (workflow: { name: string; description: string; category: string }) => {
  return {
    id: `sample-${workflow.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: workflow.name,
    description: workflow.description,
    formTitle: workflow.name,
    formDescription: workflow.description,
    category: workflow.category,
    views: '2.5k',
    likes: '450',
    isPro: false,
    isFavorite: true,
    createdAt: new Date().toISOString(),
    containers: [
      {
        id: 'step-1',
        type: 'form',
        label: 'Input Form',
        elements: [
          { id: 'input', type: 'textarea', label: 'Your Input', placeholder: `Describe what you want to create...`, required: true },
          { id: 'style', type: 'dropdown', label: 'Style', options: ['Professional', 'Creative', 'Technical', 'Casual'], defaultValue: 'Professional' },
          { id: 'length', type: 'dropdown', label: 'Length', options: ['Short', 'Medium', 'Long', 'Custom'], defaultValue: 'Medium' },
        ],
      },
    ],
    triggers: [],
  };
};

export function Favorites({ onWorkflowClick, onWorkflowPlusClick }: FavoritesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [previewWorkflow, setPreviewWorkflow] = useState<any>(null);
  const { theme } = useTheme();
  const { workflows } = useWorkflows();

  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-gray-50';

  // Get favorite workflows from user workflows
  const userFavoriteWorkflows = workflows
    .filter(workflow => workflow.isFavorite)
    .map(workflow => ({
      name: workflow.name,
      description: workflow.description,
      category: Array.isArray(workflow.category) ? workflow.category[0] || 'General' : workflow.category || 'General',
      icon: FileText,
      iconBgColor: 'rgba(59, 130, 246, 0.2)',
      views: workflow.views,
      likes: workflow.likes,
      isPro: workflow.isPro,
      workflowData: workflow,
    }));

  // Sample favorite workflows if user has none
  const sampleFavorites = [
    {
      name: 'AI Image Generator',
      description: 'Generate stunning images from text prompts using advanced AI models',
      category: 'Image',
      icon: Image,
      iconBgColor: 'rgba(168, 85, 247, 0.2)',
      views: '2.5k',
      likes: '450',
      isPro: true,
    },
    {
      name: 'Content Writer',
      description: 'Create engaging content, articles, and blog posts with AI assistance',
      category: 'Content',
      icon: FileText,
      iconBgColor: 'rgba(59, 130, 246, 0.2)',
      views: '3.2k',
      likes: '680',
      isPro: false,
    },
    {
      name: 'Video Summarizer',
      description: 'Extract key points and create summaries from video content',
      category: 'Video',
      icon: Video,
      iconBgColor: 'rgba(249, 115, 22, 0.2)',
      views: '1.8k',
      likes: '320',
      isPro: true,
    },
    {
      name: 'Code Assistant',
      description: 'Get help with coding, debugging, and code optimization',
      category: 'Development',
      icon: Code,
      iconBgColor: 'rgba(34, 197, 94, 0.2)',
      views: '4.1k',
      likes: '890',
      isPro: false,
    },
    {
      name: 'Data Analyzer',
      description: 'Analyze datasets and generate insights with AI-powered analytics',
      category: 'Analytics',
      icon: BarChart3,
      iconBgColor: 'rgba(99, 102, 241, 0.2)',
      views: '2.9k',
      likes: '510',
      isPro: true,
    },
    {
      name: 'Email Generator',
      description: 'Craft professional emails for any purpose with AI assistance',
      category: 'Communication',
      icon: Mail,
      iconBgColor: 'rgba(6, 182, 212, 0.2)',
      views: '3.6k',
      likes: '720',
      isPro: false,
    },
    {
      name: 'Social Media Manager',
      description: 'Create and schedule engaging social media posts',
      category: 'Marketing',
      icon: Share2,
      iconBgColor: 'rgba(236, 72, 153, 0.2)',
      views: '2.2k',
      likes: '410',
      isPro: true,
    },
    {
      name: 'Document Translator',
      description: 'Translate documents while preserving formatting and context',
      category: 'Language',
      icon: Globe,
      iconBgColor: 'rgba(20, 184, 166, 0.2)',
      views: '1.5k',
      likes: '280',
      isPro: false,
    },
  ];

  // Combine user favorites with samples
  const favoriteWorkflows = userFavoriteWorkflows.length > 0 ? userFavoriteWorkflows : sampleFavorites;

  const categories = ['all', 'Image', 'Content', 'Video', 'Development', 'Analytics', 'Communication', 'Marketing', 'Language'];

  const filteredWorkflows = favoriteWorkflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || workflow.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`min-h-screen ${bgColor} pt-16 pb-8`}>
      <div className="px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className={`text-3xl ${textPrimary}`}>My Favorites</h1>
          </div>
          <p className={textSecondary}>Your favorite workflows and tools for quick access</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${textSecondary}`} />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${inputBg} border ${borderColor} rounded-xl py-2.5 pl-12 pr-4 ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:border-[#00C6FF]/50 focus:ring-2 focus:ring-[#00C6FF]/20 transition-all`}
            />
          </div>

          {/* View Mode Toggle */}
          <div className={`flex items-center gap-1 p-1 ${bgCard} border ${borderColor} rounded-lg`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white' : textSecondary} transition-all`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white' : textSecondary} transition-all`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedFilter(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedFilter === category
                  ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white shadow-lg shadow-[#00C6FF]/30'
                  : `${bgCard} border ${borderColor} ${textSecondary} hover:border-[#00C6FF]/50`
              }`}
            >
              {category === 'all' ? 'All Favorites' : category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className={`mb-4 ${textSecondary} text-sm`}>
          Showing {filteredWorkflows.length} of {favoriteWorkflows.length} favorites
        </div>

        {/* Workflows Grid/List */}
        {filteredWorkflows.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredWorkflows.map((workflow, index) => (
              <WorkflowCard
                key={index}
                name={workflow.name}
                description={workflow.description}
                icon={workflow.icon}
                iconBgColor={workflow.iconBgColor}
                views={workflow.views}
                likes={workflow.likes}
                isPro={workflow.isPro}
                onClick={() => {
                  if (workflow.workflowData) {
                    setPreviewWorkflow(workflow.workflowData);
                  } else {
                    // Create preview data for sample workflows
                    const previewData = createSampleWorkflowPreview({
                      name: workflow.name,
                      description: workflow.description,
                      category: workflow.category,
                    });
                    setPreviewWorkflow(previewData);
                  }
                }}
                onPlusClick={(action) => onWorkflowPlusClick?.({ name: workflow.name, description: workflow.description }, action)}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 ${bgCard} border ${borderColor} rounded-xl`}>
            <Heart className={`w-16 h-16 mx-auto mb-4 ${textSecondary} opacity-50`} />
            <h3 className={`text-xl mb-2 ${textPrimary}`}>No favorites found</h3>
            <p className={textSecondary}>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
      
      {/* Workflow Preview Modal */}
      {previewWorkflow && (
        <WorkflowPreviewModal
          isOpen={!!previewWorkflow}
          onClose={() => setPreviewWorkflow(null)}
          formTitle={previewWorkflow.formTitle}
          formDescription={previewWorkflow.formDescription}
          containers={previewWorkflow.containers}
          triggers={previewWorkflow.triggers}
          theme={theme}
        />
      )}
    </div>
  );
}
