import { useState, useRef, useEffect } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, Eye, Download, Trash2, Edit, X, ChevronDown, 
  CheckCircle, Clock, XCircle, AlertCircle, Sparkles, FileText, Code, Image, 
  Video, BarChart3, Mail, Workflow, LucideIcon 
} from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflows } from '@/shared/lib/WorkflowContext';
import { useTemplateStore } from '@/features/templates';
import { MyWorkflowCard } from '@/features/workflows/components/MyWorkflowCard'; // Add missing import
import { WorkflowPreviewModal } from '@/features/workflows/components/WorkflowPreviewModal'; // Add missing import
import { loadWorkflowIntoStores } from '@/features/workflow-builder/utils/workflowManager';

// Icon mapping for string to component conversion
const iconMap: Record<string, LucideIcon> = {
  FileText,
  Code,
  Image,
  Video,
  BarChart3,
  Mail,
  Workflow,
  Sparkles,
  CheckCircle,
  Clock,
};

interface MyWorkflowsProps {
  onWorkflowClick: (name: string) => void;
  onWorkflowPlusClick?: (workflow: { name: string; description: string }, action: 'create' | 'attach') => void;
  onCreateClick?: () => void;
}

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: number;
  views: string;
  likes: string;
  created: string;
  status: 'published' | 'pending' | 'rejected' | 'approved' | 'draft';
  icon: any;
  iconBgColor: string;
  isPro?: boolean;
  workflowData?: any;
}

// Helper function to create workflow preview data for sample workflows
const createSampleWorkflowPreview = (workflow: WorkflowItem) => {
  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    formTitle: workflow.name,
    formDescription: workflow.description,
    category: workflow.category,
    views: workflow.views,
    likes: workflow.likes,
    isPro: workflow.isPro || false,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    containers: [
      {
        id: 'step-1',
        type: 'form',
        label: 'Input Form',
        elements: [
          { id: 'input', type: 'textarea', label: 'Input', placeholder: 'Enter your requirements...', required: true },
          { id: 'options', type: 'dropdown', label: 'Options', options: ['Option 1', 'Option 2', 'Option 3'], defaultValue: 'Option 1' },
        ],
      },
    ],
    triggers: [],
  };
};

export function MyWorkflows({ onWorkflowClick, onWorkflowPlusClick, onCreateClick }: MyWorkflowsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'published'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState('Most Recent');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [previewWorkflow, setPreviewWorkflow] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<{ id: string; name: string } | null>(null);
  
  const categoryRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  
  const { theme } = useTheme();
  const { workflows, deleteWorkflow } = useWorkflows();
  
  // Set up template install callback for opening workflow builder from MyWorkflows
  useEffect(() => {
    const { setInstallCallback } = useTemplateStore.getState();
    
    // Set the callback to open workflow builder with template data for editing
    // This is called when a template is clicked from the Template Library
    setInstallCallback((templateData: any) => {
      console.log('🚀 MyWorkflows: Template selected - opening workflow builder for editing');
      // Use onWorkflowClick to trigger the workflow builder opening
      // The template data has already been loaded into stores by the TemplateLibrary component
      if (onWorkflowClick) {
        onWorkflowClick('__TEMPLATE_FROM_LIBRARY__');
      }
    });
    
    // Clean up callback when component unmounts
    return () => {
      setInstallCallback(undefined);
    };
  }, [onWorkflowClick]);

  // Convert saved workflows to the expected format
  const userWorkflowList: WorkflowItem[] = (workflows || []).map(workflow => {
    const categoryStr = Array.isArray(workflow.category) 
      ? workflow.category[0] || 'General'
      : workflow.category || 'General';
    
    return {
      id: workflow.id,
      name: workflow.name || 'Untitled Workflow',
      description: workflow.description || 'No description',
      category: categoryStr,
      steps: workflow.containers?.length || 0,
      views: '0',
      likes: '0',
      created: new Date(workflow.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: 'published' as const,
      icon: workflow.icon || 'Workflow',
      iconBgColor: 'rgba(59, 130, 246, 0.2)',
      isPro: workflow.isPro || false,
      workflowData: workflow,
    };
  });

  // Start with user workflows or add example workflows if none exist
  const workflowList: WorkflowItem[] = userWorkflowList.length > 0 ? userWorkflowList : [
    {
      id: '1',
      name: 'AI Content Generator',
      description: 'Generate high-quality content using advanced AI models',
      category: 'Content',
      steps: 3,
      views: '2.1k',
      likes: '340',
      created: 'Oct 25',
      status: 'published',
      icon: 'FileText',
      iconBgColor: 'rgba(59, 130, 246, 0.2)',
      isPro: true,
    } as WorkflowItem,
    {
      id: '2',
      name: 'Code Review Assistant',
      description: 'Automated code review and optimization suggestions',
      category: 'Development',
      steps: 5,
      views: '3.5k',
      likes: '680',
      created: 'Oct 22',
      status: 'published',
      icon: 'Code',
      iconBgColor: 'rgba(34, 197, 94, 0.2)',
      isPro: false,
    },
    {
      id: '3',
      name: 'Image Enhancement',
      description: 'Enhance and upscale images with AI technology',
      category: 'Image',
      steps: 2,
      views: '1.8k',
      likes: '290',
      created: 'Oct 20',
      status: 'published',
      icon: 'Image',
      iconBgColor: 'rgba(168, 85, 247, 0.2)',
      isPro: true,
    },
    {
      id: '4',
      name: 'Video Analytics',
      description: 'Analyze video content and extract insights',
      category: 'Video',
      steps: 4,
      views: '1.2k',
      likes: '180',
      created: 'Oct 18',
      status: 'approved',
      icon: 'Video',
      iconBgColor: 'rgba(249, 115, 22, 0.2)',
      isPro: false,
    },
    {
      id: '5',
      name: 'Data Visualization',
      description: 'Create beautiful charts and graphs from your data',
      category: 'Analytics',
      steps: 3,
      views: '890',
      likes: '120',
      created: 'Oct 15',
      status: 'rejected',
      icon: 'BarChart3',
      iconBgColor: 'rgba(99, 102, 241, 0.2)',
      isPro: true,
    },
    {
      id: '6',
      name: 'Email Automation',
      description: 'Automate email responses and follow-ups',
      category: 'Communication',
      steps: 2,
      views: '560',
      likes: '95',
      created: 'Oct 12',
      status: 'pending',
      icon: 'Mail',
      iconBgColor: 'rgba(6, 182, 212, 0.2)',
      isPro: false,
    },
    {
      id: '7',
      name: 'Workflow Orchestrator',
      description: 'Connect multiple workflows into a single pipeline',
      category: 'Automation',
      steps: 1,
      views: '0',
      likes: '0',
      created: 'Nov 2',
      status: 'draft',
      icon: 'Workflow',
      iconBgColor: 'rgba(236, 72, 153, 0.2)',
      isPro: false,
    } as WorkflowItem
  ];

  const categories = ['All', ...Array.from(new Set(workflowList.map(w => w.category)))];
  const sortOptions = ['Most Recent', 'Most Liked', 'Most Viewed', 'Alphabetical'];

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter and sort workflows
  let filteredWorkflows = workflowList.filter(workflow => {
    // Tab filter
    const tabMatch = 
      activeTab === 'all' ? true :
      activeTab === 'draft' ? (workflow.status === 'draft' || workflow.status === 'pending' || workflow.status === 'rejected') :
      activeTab === 'published' ? (workflow.status === 'published' || workflow.status === 'approved') :
      true;

    // Search filter
    const searchMatch = searchQuery.trim() === '' ||
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const categoryMatch = selectedCategory === 'All' || workflow.category === selectedCategory;

    return tabMatch && searchMatch && categoryMatch;
  });

  // Apply sorting
  if (selectedSort === 'Most Recent') {
    // Already sorted by default (newest first)
  } else if (selectedSort === 'Most Liked') {
    filteredWorkflows = [...filteredWorkflows].sort((a, b) => {
      const aLikes = parseFloat(a.likes.replace('k', '')) * (a.likes.includes('k') ? 1000 : 1);
      const bLikes = parseFloat(b.likes.replace('k', '')) * (b.likes.includes('k') ? 1000 : 1);
      return bLikes - aLikes;
    });
  } else if (selectedSort === 'Most Viewed') {
    filteredWorkflows = [...filteredWorkflows].sort((a, b) => {
      const aViews = parseFloat(a.views.replace('k', '')) * (a.views.includes('k') ? 1000 : 1);
      const bViews = parseFloat(b.views.replace('k', '')) * (b.views.includes('k') ? 1000 : 1);
      return bViews - aViews;
    });
  } else if (selectedSort === 'Alphabetical') {
    filteredWorkflows = [...filteredWorkflows].sort((a, b) => a.name.localeCompare(b.name));
  }

  const handleEdit = (workflowId: string) => {
    console.log('📝 Edit workflow:', workflowId);
    // Find the workflow data
    const workflow = workflowList.find(w => w.id === workflowId);
    if (workflow) {
      // If workflow has workflowData, use it; otherwise create sample data
      const workflowData = workflow.workflowData || createSampleWorkflowPreview(workflow);
      console.log('✅ Loading workflow into builder for editing');
      // Load the workflow data into the builder stores
      loadWorkflowIntoStores(workflowData);
      // Open the workflow builder via callback
      if (onWorkflowClick) {
        onWorkflowClick('__EDIT_WORKFLOW__');
      }
    } else {
      console.error('❌ Workflow not found for:', workflowId);
    }
  };

  const handleDelete = (workflowId: string) => {
    console.log('🗑️ Delete workflow:', workflowId);
    // Find the workflow to get its name
    const workflow = workflowList.find(w => w.id === workflowId);
    if (workflow) {
      setWorkflowToDelete({ id: workflowId, name: workflow.name });
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (workflowToDelete) {
      deleteWorkflow(workflowToDelete.id);
      console.log('✅ Workflow deleted successfully');
      setShowDeleteConfirm(false);
      setWorkflowToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setWorkflowToDelete(null);
  };

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  const allCount = workflowList.length;
  const draftCount = workflowList.filter(w => w.status === 'draft' || w.status === 'pending' || w.status === 'rejected').length;
  const publishedCount = workflowList.filter(w => w.status === 'published' || w.status === 'approved').length;

  return (
    <div className={`min-h-full h-full flex flex-col transition-colors duration-300 pt-16 ${
      theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white'
    }`}>
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className={`${textPrimary} text-3xl mb-2`}>My Workflows</h1>
            <p className={`${textSecondary} text-sm`}>Manage your workflow offerings and track their status</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button 
              onClick={() => useTemplateStore.getState().openTemplateLibrary()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border transition-all font-medium whitespace-nowrap ${
                theme === 'dark'
                  ? 'border-[#00C6FF]/30 bg-[#00C6FF]/10 text-[#00C6FF] hover:bg-[#00C6FF]/20'
                  : 'border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Start from Template
            </button>
            <button 
              onClick={onCreateClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Create Workflow
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-8">{/* Changed from p-8 pt-0 */}

        {/* Search and Filters */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
          {/* Search Bar */}
          <div className={`flex-1 min-w-[300px] max-w-xl flex items-center gap-2 px-4 py-2.5 rounded-lg border ${borderColor} ${bgCard} focus-within:border-[#00C6FF]/50 transition-all`}>
            <Search className={`w-5 h-5 ${textSecondary}`} />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${textPrimary} placeholder:${textSecondary}`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className={`p-1 rounded ${hoverBg}`}>
                <X className={`w-4 h-4 ${textSecondary}`} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative" ref={categoryRef}>
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowSortDropdown(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white'} border ${borderColor} ${hoverBg} ${textPrimary} min-w-[180px]`}
            >
              <Filter className={`w-4 h-4 ${textSecondary}`} />
              <span className="flex-1 text-left">
                <span className={`${textSecondary} text-sm mr-2`}>Category:</span>
                {selectedCategory}
              </span>
              <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
              {selectedCategory !== 'All' && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('All');
                    setShowCategoryDropdown(false);
                  }}
                  className={`p-0.5 rounded ${hoverBg} cursor-pointer`}
                >
                  <X className={`w-3 h-3 ${textSecondary}`} />
                </span>
              )}
            </button>

            {showCategoryDropdown && (
              <div className={`absolute top-full left-0 mt-2 w-full ${bgCard} border ${borderColor} rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto`}>
                {/* Close button */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#2A2A3E]">
                  <span className={`text-sm ${textSecondary}`}>Select Category</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCategoryDropdown(false);
                    }}
                    className={`p-1 rounded ${hoverBg} transition-colors`}
                  >
                    <X className={`w-4 h-4 ${textSecondary}`} />
                  </button>
                </div>
                
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 ${hoverBg} transition-colors ${
                      selectedCategory === category 
                        ? theme === 'dark'
                          ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 text-white'
                          : 'bg-gradient-to-r from-[#00C6FF]/30 to-[#9D50BB]/30 text-[#0072FF]'
                        : textPrimary
                    } last:rounded-b-lg`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowCategoryDropdown(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white'} border ${borderColor} ${hoverBg} ${textPrimary} min-w-[200px]`}
            >
              <span className="flex-1 text-left">
                <span className={`${textSecondary} text-sm mr-2`}>Sort:</span>
                {selectedSort}
              </span>
              <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
            </button>

            {showSortDropdown && (
              <div className={`absolute top-full left-0 mt-2 w-full ${bgCard} border ${borderColor} rounded-lg shadow-2xl z-50`}>
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedSort(option);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 ${hoverBg} transition-colors ${
                      selectedSort === option 
                        ? theme === 'dark'
                          ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 text-white'
                          : 'bg-gradient-to-r from-[#00C6FF]/30 to-[#9D50BB]/30 text-[#0072FF]'
                        : textPrimary
                    } first:rounded-t-lg last:rounded-b-lg`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex items-center gap-6 mb-8 border-b ${borderColor}`}>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-1 transition-all ${
              activeTab === 'all'
                ? 'text-[#00C6FF] border-b-2 border-[#00C6FF]'
                : `${textSecondary} hover:text-[#00C6FF]`
            }`}
          >
            All Workflows ({allCount})
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`pb-3 px-1 transition-all ${
              activeTab === 'draft'
                ? 'text-[#00C6FF] border-b-2 border-[#00C6FF]'
                : `${textSecondary} hover:text-[#00C6FF]`
            }`}
          >
            Draft/Pending ({draftCount})
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`pb-3 px-1 transition-all ${
              activeTab === 'published'
                ? 'text-[#00C6FF] border-b-2 border-[#00C6FF]'
                : `${textSecondary} hover:text-[#00C6FF]`
            }`}
          >
            Published ({publishedCount})
          </button>
        </div>

        {/* Workflow Grid */}
        {filteredWorkflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-16">
            {filteredWorkflows.map((workflow) => {
              // Convert string icon to component if needed
              const IconComponent = typeof workflow.icon === 'string' 
                ? (iconMap[workflow.icon] || Workflow) 
                : workflow.icon;
              
              return (
                <MyWorkflowCard
                  key={workflow.id}
                  name={workflow.name}
                  description={workflow.description}
                  icon={IconComponent}
                  iconBgColor={workflow.iconBgColor}
                  views={workflow.views}
                  likes={workflow.likes}
                  isPro={workflow.isPro}
                  status={workflow.status}
                  createdDate={workflow.created}
                  steps={workflow.steps}
                  onClick={() => {
                    if (workflow.workflowData) {
                      setPreviewWorkflow(workflow.workflowData);
                    } else {
                      // Create preview data for sample workflows
                      const previewData = createSampleWorkflowPreview(workflow);
                      setPreviewWorkflow(previewData);
                    }
                  }}
                  onEdit={() => handleEdit(workflow.id)}
                  onDelete={() => handleDelete(workflow.id)}
                  onPlusClick={(action) => onWorkflowPlusClick?.({ name: workflow.name, description: workflow.description }, action)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className={`${textSecondary} text-lg mb-2`}>No workflows found</p>
            <p className={`${textSecondary} text-sm`}>Try adjusting your search or filters</p>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && workflowToDelete && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)'
            }}
            onClick={cancelDelete}
          />

          {/* Modal */}
          <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-[480px] ${bgCard} rounded-2xl shadow-2xl overflow-hidden border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 border-b ${borderColor} flex items-start justify-between gap-4`}>
              <div className="flex items-start gap-4 flex-1">
                {/* Warning Icon */}
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>

                {/* Title & Subtitle */}
                <div className="flex-1">
                  <h2 className={`${textPrimary} text-xl mb-1`}>
                    Delete Workflow
                  </h2>
                  <p className={`${textSecondary} text-xs`}>
                    This action cannot be undone
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={cancelDelete}
                className={`w-8 h-8 ${hoverBg} rounded-lg flex items-center justify-center transition-colors`}
              >
                <X className={`w-5 h-5 ${textSecondary}`} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Question */}
              <p className={`${textPrimary} text-[15px] mb-4`}>
                Are you sure you want to delete this workflow?
              </p>

              {/* Workflow Name Box */}
              <div className={`p-4 ${bgPanel} border ${borderColor} rounded-lg mb-4`}>
                <div className={`${textSecondary} text-[11px] mb-1 uppercase tracking-wide`}>
                  Workflow Name:
                </div>
                <div className={`${textPrimary} text-[15px]`}>
                  {workflowToDelete.name}
                </div>
              </div>

              {/* Warning Text */}
              <p className={`${textSecondary} text-sm mb-6 leading-relaxed`}>
                This will permanently remove the workflow and all its configurations. This action cannot be undone.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                {/* Cancel Button */}
                <button
                  onClick={cancelDelete}
                  className={`px-6 py-2.5 ${bgPanel} border ${borderColor} rounded-lg ${textPrimary} text-sm hover:bg-opacity-80 transition-all`}
                >
                  Cancel
                </button>

                {/* Delete Button */}
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all transform hover:-translate-y-0.5"
                >
                  Delete Workflow
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}