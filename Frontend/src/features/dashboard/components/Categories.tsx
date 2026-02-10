import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { WorkflowCard } from '@/features/workflows/components/WorkflowCard';
import { TaskDetailModal } from '@/features/tasks/components/TaskDetailModal';
import { AttachTaskModal } from '@/features/tasks/components/AttachTaskModal';
import { Lightbulb, FileEdit, MessageSquareText, Image as ImageIcon, Linkedin, Video, Palette, TrendingUp, Mail, FileCode, ChevronDown, Filter, X, Search, CheckSquare } from 'lucide-react';
interface CategoriesProps {
  selectedCategory?: string;
  onWorkflowClick: (name: string) => void;
}
interface Task {
  id: string;
  name: string;
  assignee: string;
  avatar: string;
  status: 'To do' | 'In Progress' | 'Review' | 'Done' | 'Blocked' | 'Backlog';
  description?: string;
  boardName?: string;
}
interface Workflow {
  icon: any;
  iconBgColor: string;
  name: string;
  description: string;
  views: string;
  likes: string;
  isPro?: boolean;
  category: string;
}
export function Categories({ selectedCategory, onWorkflowClick }: CategoriesProps) {
  const [selectedSort, setSelectedSort] = useState('Most Liked');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showAttachTaskModal, setShowAttachTaskModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState('');
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const { theme } = useTheme();
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const sortOptions = ['Most Liked', 'Most Viewed', 'Recently Added', 'Favorites', 'My Tools'];
  const filterOptions = ['Pro', 'Free'];
  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const allWorkflows = [
    {
      icon: Lightbulb,
      iconBgColor: '#9D50BB',
      name: 'Logo Design Ideas',
      description: 'Looking for a Unique Logo? Get inspired with Our Ideas.',
      views: '730K',
      likes: '2K',
      isPro: true,
      category: 'Blog Workflow',
    },
    {
      icon: FileEdit,
      iconBgColor: '#0072FF',
      name: 'Rewrite Article',
      description: 'Transform Existing Blogs into Unique, AI-Detection Free Articles.',
      views: '655.6K',
      likes: '2.8K',
      isPro: true,
      category: 'Rewriting Tools',
    },
    {
      icon: MessageSquareText,
      iconBgColor: '#9D50BB',
      name: 'Paraphrasing Content',
      description: 'Quickly transform your text into a new and unique form.',
      views: '311.7K',
      likes: '677',
      category: 'Rewriting Tools',
    },
    {
      icon: ImageIcon,
      iconBgColor: '#E53E3E',
      name: 'AI Image Generation Prompts',
      description: 'Bring Your Scripts to Life with Engaging Image Prompts.',
      views: '523K',
      likes: '1.9K',
      category: 'Image Prompts',
    },
    {
      icon: Linkedin,
      iconBgColor: '#D946EF',
      name: 'LinkedIn Profile Builder',
      description: 'Enhance your LinkedIn profile with tailored content—our tool',
      views: '402K',
      likes: '1.2K',
      category: 'Social Media Tools',
    },
    {
      icon: Video,
      iconBgColor: '#DC2626',
      name: 'Youtube Script Creator',
      description: 'Save time and effort by generating captivating video scripts.',
      views: '891K',
      likes: '3.1K',
      category: 'YouTube Tools',
    },
    {
      icon: Palette,
      iconBgColor: '#7C3AED',
      name: 'Creative Ad Copy Generator',
      description: 'Generate compelling ad copy for your marketing campaigns instantly.',
      views: '442K',
      likes: '1.5K',
      category: 'Social Media Tools',
    },
    {
      icon: TrendingUp,
      iconBgColor: '#0891B2',
      name: 'SEO Content Optimizer',
      description: 'Optimize your content for search engines with AI-powered suggestions.',
      views: '612K',
      likes: '2.2K',
      isPro: true,
      category: 'SEO Tools',
    },
    {
      icon: Mail,
      iconBgColor: '#DC2626',
      name: 'Email Campaign Builder',
      description: 'Create professional email campaigns with personalized templates.',
      views: '338K',
      likes: '891',
      category: 'E-Commerce Tools',
    },
    {
      icon: FileCode,
      iconBgColor: '#0072FF',
      name: 'Code Documentation AI',
      description: 'Automatically generate documentation for your codebase.',
      views: '276K',
      likes: '743',
      category: 'Blog Workflow',
    },
    {
      icon: MessageSquareText,
      iconBgColor: '#9D50BB',
      name: 'Chatbot Flow Designer',
      description: 'Design conversational flows for your AI chatbot applications.',
      views: '501K',
      likes: '1.7K',
      category: 'Blog Workflow',
    },
    {
      icon: ImageIcon,
      iconBgColor: '#E53E3E',
      name: 'Product Image Enhancer',
      description: 'Enhance and optimize product images for e-commerce platforms.',
      views: '389K',
      likes: '1.1K',
      category: 'E-Commerce Tools',
    },
  ];
  // Filter workflows based on selected category and filters
  let workflows = selectedCategory && selectedCategory !== 'All Apps'
    ? allWorkflows.filter(w => w.category === selectedCategory)
    : allWorkflows;
  // Apply search filter
  if (workflowSearchQuery.trim()) {
    workflows = workflows.filter(w =>
      w.name.toLowerCase().includes(workflowSearchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(workflowSearchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(workflowSearchQuery.toLowerCase())
    );
  }
  // Apply Pro/Free filter
  if (selectedFilters.length > 0) {
    workflows = workflows.filter(w => {
      if (selectedFilters.includes('Pro') && selectedFilters.includes('Free')) {
        return true;
      }
      if (selectedFilters.includes('Pro')) {
        return w.isPro === true;
      }
      if (selectedFilters.includes('Free')) {
        return !w.isPro;
      }
      return true;
    });
  }
  // Apply sorting
  if (selectedSort === 'Most Viewed') {
    workflows = [...workflows].sort((a, b) => {
      const aViews = parseFloat(a.views.replace('K', '')) * 1000;
      const bViews = parseFloat(b.views.replace('K', '')) * 1000;
      return bViews - aViews;
    });
  } else if (selectedSort === 'Most Liked') {
    workflows = [...workflows].sort((a, b) => {
      const aLikes = parseFloat(a.likes.replace('K', '')) * 1000;
      const bLikes = parseFloat(b.likes.replace('K', '')) * 1000;
      return bLikes - aLikes;
    });
  }
  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };
  const handleWorkflowAction = (workflow: Workflow, action: 'create' | 'attach') => {
    setSelectedWorkflow(workflow);
    if (action === 'create') {
      setShowCreateTaskModal(true);
    } else {
      setShowAttachTaskModal(true);
    }
  };
  const handleTaskSelect = (task: Task) => {
    // Attach workflow to task and open task for editing
    setShowAttachTaskModal(false);
    setSelectedTaskForEdit(task);
  };
  return (
    <div className={`min-h-screen ${bgMain} transition-colors duration-300`}>
      {/* Main Content */}
      <main className="mt-16 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`${textPrimary} text-3xl mb-2`}>
            {selectedCategory && selectedCategory !== 'All Apps' ? selectedCategory : 'All Apps'}
          </h1>
          <p className={`${textSecondary}`}>
            {selectedCategory && selectedCategory !== 'All Apps'
              ? `Browse workflows in ${selectedCategory}`
              : 'Browse all available workflows and tools'}
          </p>
        </div>
        {/* Search Bar */}
        <div className="mb-6">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${borderColor} ${bgCard} focus-within:border-[#00C6FF]/50 transition-all max-w-xl`}>
            <Search className={`w-5 h-5 ${textSecondary}`} />
            <input
              type="text"
              placeholder="Search workflows..."
              value={workflowSearchQuery}
              onChange={(e) => setWorkflowSearchQuery(e.target.value)}
              className={`flex-1 bg-transparent outline-none ${textPrimary} placeholder:${textSecondary}`}
            />
            {workflowSearchQuery && (
              <button
                onClick={() => setWorkflowSearchQuery('')}
                className={`p-1 rounded ${hoverBg}`}
              >
                <X className={`w-4 h-4 ${textSecondary}`} />
              </button>
            )}
          </div>
        </div>
        {/* Filter Bar */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <span className={textSecondary}>Sort by:</span>
          {/* Sort Dropdown */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white'} border ${borderColor} ${hoverBg} ${textPrimary} shadow-sm`}
            >
              {selectedSort}
              <ChevronDown className={`w-4 h-4 ${textSecondary}`} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortDropdown(false);
                }}
                className={`ml-1 p-1 rounded ${hoverBg}`}
              >
                <X className={`w-3 h-3 ${textSecondary}`} />
              </button>
            </button>
            {showSortDropdown && (
              <div className={`absolute top-full left-0 mt-2 w-48 ${bgCard} border ${borderColor} rounded-lg shadow-2xl z-50`}>
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSelectedSort(option);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 ${hoverBg} transition-colors ${
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
          {/* Filter Dropdown */}
          <div className="relative" ref={filterDropdownRef}>
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white'} border ${borderColor} ${hoverBg} ${textPrimary} relative shadow-sm`}
            >
              <Filter className={`w-4 h-4 ${textSecondary}`} />
              Filter
              {selectedFilters.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedFilters.length}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterDropdown(false);
                }}
                className={`ml-1 p-1 rounded ${hoverBg}`}
              >
                <X className={`w-3 h-3 ${textSecondary}`} />
              </button>
            </button>
            {showFilterDropdown && (
              <div className={`absolute top-full left-0 mt-2 w-48 ${bgCard} border ${borderColor} rounded-lg shadow-2xl z-50 p-3`}>
                <div className="space-y-2">
                  {filterOptions.map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hoverBg} cursor-pointer ${
                        selectedFilters.includes(option)
                          ? theme === 'dark'
                            ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20'
                            : 'bg-gradient-to-r from-[#00C6FF]/30 to-[#9D50BB]/30'
                          : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilters.includes(option)}
                        onChange={() => toggleFilter(option)}
                        className={`rounded ${theme === 'dark' ? 'accent-[#00C6FF]' : 'accent-[#0072FF]'}`}
                      />
                      <span className={textPrimary}>{option}</span>
                    </label>
                  ))}
                </div>
                {selectedFilters.length > 0 && (
                  <button
                    onClick={() => setSelectedFilters([])}
                    className={`w-full mt-3 pt-3 border-t ${borderColor} text-sm ${textSecondary} ${hoverBg} py-2 rounded-lg`}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Active Filters Display */}
          {selectedFilters.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedFilters.map((filter) => (
                <div
                  key={filter}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 border border-[#00C6FF]/30"
                >
                  <span className={`text-sm ${textPrimary}`}>{filter}</span>
                  <button
                    onClick={() => toggleFilter(filter)}
                    className="hover:bg-white/10 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {workflows.map((workflow, index) => (
            <WorkflowCard 
              key={index} 
              {...workflow} 
              onClick={() => onWorkflowClick(workflow.name)}
              onPlusClick={(action) => handleWorkflowAction(workflow, action)}
            />
          ))}
        </div>
        {workflows.length === 0 && (
          <div className="text-center py-16">
            <p className={`${textSecondary} text-lg`}>No workflows found matching your criteria.</p>
          </div>
        )}
        {/* Footer */}
        <footer className={`text-center py-8 border-t ${borderColor} mt-8`}>
          <p className={`${textSecondary} text-sm`}>
            © 2025 Flowversal AI — Empowering the Future of Automation
          </p>
        </footer>
      </main>
      {/* Attach to Task Modal */}
      {showAttachTaskModal && selectedWorkflow && (
        <AttachTaskModal
          workflowName={selectedWorkflow.name}
          onClose={() => {
            setShowAttachTaskModal(false);
            setSelectedWorkflow(null);
          }}
          onTaskSelect={handleTaskSelect}
        />
      )}
      {/* Create Task Modal */}
      {showCreateTaskModal && selectedWorkflow && (
        <TaskDetailModal
          task={{
            id: Date.now().toString(),
            name: `Task for ${selectedWorkflow.name}`,
            status: 'Backlog',
            description: selectedWorkflow.description,
            assignee: 'U',
            avatar: 'U',
            boardName: 'Backlogs',
          }}
          onClose={() => {
            setShowCreateTaskModal(false);
            setSelectedWorkflow(null);
          }}
          onUpdate={(taskId, updates) => {
            setShowCreateTaskModal(false);
            setSelectedWorkflow(null);
          }}
          onDelete={() => {
            setShowCreateTaskModal(false);
            setSelectedWorkflow(null);
          }}
          preAttachedWorkflow={selectedWorkflow}
        />
      )}
      {/* Edit Task with Attached Workflow Modal */}
      {selectedTaskForEdit && selectedWorkflow && (
        <TaskDetailModal
          task={{
            id: selectedTaskForEdit.id,
            name: selectedTaskForEdit.name,
            status: selectedTaskForEdit.status,
            description: selectedTaskForEdit.description,
            assignee: selectedTaskForEdit.assignee,
            avatar: selectedTaskForEdit.avatar,
            boardName: selectedTaskForEdit.boardName,
          }}
          onClose={() => {
            setSelectedTaskForEdit(null);
            setSelectedWorkflow(null);
          }}
          onUpdate={(taskId, updates) => {
            setSelectedTaskForEdit(null);
            setSelectedWorkflow(null);
          }}
          onDelete={(taskId) => {
            setSelectedTaskForEdit(null);
            setSelectedWorkflow(null);
          }}
          preAttachedWorkflow={selectedWorkflow}
        />
      )}
    </div>
  );
}
