import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflows } from '@/shared/lib/WorkflowContext';
import { WorkflowCard } from '@/features/workflows/components/WorkflowCard';
import { WorkflowPreviewModal } from '@/features/workflows/components/WorkflowPreviewModal';
import { ToolCategoryPanel } from '@/shared/components/ui/ToolCategoryPanel';
import { useCategoryStore } from '@/core/stores/admin/categoryStore';
import { Search, SlidersHorizontal, Sparkles, FileText, Globe, Youtube, Share2, Mail, Code, Image as ImageIcon, Target, Calendar, FileCheck, Edit, Repeat, Search as SearchIcon, PenTool, Monitor, Palette, BarChart, Book, Package, Briefcase, Film, Box, Lightbulb, UserCircle, GraduationCap, Users, Headphones, UserCheck, Video, Smile, ShoppingBag, Megaphone, Plus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface AIAppsProps {
  onWorkflowClick: (name: string) => void;
  onWorkflowPlusClick?: (workflow: { name: string; description: string }, action: 'create' | 'attach') => void;
  isSidebarCollapsed: boolean;
  onCreateClick?: () => void;
}

// Icon mapping for different tools
const iconMap: Record<string, LucideIcon> = {
  'blog-post': FileText,
  'seo': Globe,
  'youtube': Youtube,
  'social': Share2,
  'email': Mail,
  'code': Code,
  'image': ImageIcon,
  'marketing': Target,
  'calendar': Calendar,
  'checklist': FileCheck,
  'writing': Edit,
  'rewrite': Repeat,
  'search': SearchIcon,
  'pen': PenTool,
  'monitor': Monitor,
  'palette': Palette,
  'chart': BarChart,
  'book': Book,
  'package': Package,
  'briefcase': Briefcase,
  'film': Film,
  'box': Box,
  'lightbulb': Lightbulb,
  'user': UserCircle,
  'education': GraduationCap,
  'users': Users,
  'headphones': Headphones,
  'usercheck': UserCheck,
  'video': Video,
  'smile': Smile,
  'shopping': ShoppingBag,
  'megaphone': Megaphone,
  'workflow': Sparkles,
};

// Mock AI tools data based on categories
const aiToolsData: Record<string, Array<{ name: string; description: string; iconKey: string; category: string; isPro?: boolean }>> = {
  'all': [
    { name: 'Blog Post Generator', description: 'Generate engaging blog posts with AI', iconKey: 'blog-post', category: 'Blog Tools', isPro: false },
    { name: 'SEO Optimizer', description: 'Optimize your content for search engines', iconKey: 'seo', category: 'SEO Tools', isPro: true },
    { name: 'YouTube Script Writer', description: 'Create compelling YouTube video scripts', iconKey: 'youtube', category: 'YouTube Tools', isPro: true },
    { name: 'Social Media Manager', description: 'Manage and schedule social media posts', iconKey: 'social', category: 'Social Media Tools', isPro: false },
    { name: 'Email Campaign Creator', description: 'Design effective email marketing campaigns', iconKey: 'email', category: 'E-mail Tools', isPro: true },
    { name: 'Code Assistant', description: 'Get AI-powered coding help and suggestions', iconKey: 'code', category: 'Code Tools', isPro: true },
    { name: 'Image Prompt Generator', description: 'Create detailed prompts for AI image generation', iconKey: 'image', category: 'Image Prompts', isPro: false },
    { name: 'Marketing Strategy Builder', description: 'Build comprehensive marketing strategies', iconKey: 'marketing', category: 'Marketing Tools', isPro: false },
  ],
  'blog-workflow': [
    { name: 'Blog Workflow Manager', description: 'Manage your entire blog workflow', iconKey: 'checklist', category: 'Blog Workflow' },
    { name: 'Content Calendar', description: 'Plan and schedule your blog content', iconKey: 'calendar', category: 'Blog Workflow' },
    { name: 'SEO Blog Optimizer', description: 'Optimize blog posts for SEO', iconKey: 'seo', category: 'Blog Workflow' },
  ],
  'blog-tools': [
    { name: 'Blog Post Generator', description: 'Generate engaging blog posts with AI', iconKey: 'blog-post', category: 'Blog Tools', isPro: false },
    { name: 'Blog Title Creator', description: 'Create catchy blog post titles', iconKey: 'lightbulb', category: 'Blog Tools', isPro: true },
    { name: 'Blog Outline Builder', description: 'Build structured blog outlines', iconKey: 'checklist', category: 'Blog Tools', isPro: false },
    { name: 'Blog Meta Description', description: 'Write compelling meta descriptions', iconKey: 'blog-post', category: 'Blog Tools', isPro: true },
  ],
  'youtube-tools': [
    { name: 'YouTube Script Writer', description: 'Create compelling YouTube video scripts', iconKey: 'youtube', category: 'YouTube Tools', isPro: true },
    { name: 'Video Title Generator', description: 'Generate click-worthy video titles', iconKey: 'film', category: 'YouTube Tools', isPro: false },
    { name: 'Thumbnail Designer', description: 'Design eye-catching video thumbnails', iconKey: 'image', category: 'YouTube Tools', isPro: true },
    { name: 'Video Description Writer', description: 'Write optimized video descriptions', iconKey: 'blog-post', category: 'YouTube Tools', isPro: false },
  ],
  'rewriting-tools': [
    { name: 'Content Rewriter', description: 'Rewrite content while maintaining meaning', iconKey: 'rewrite', category: 'Rewriting Tools' },
    { name: 'Paraphrasing Tool', description: 'Paraphrase text with AI assistance', iconKey: 'writing', category: 'Rewriting Tools' },
    { name: 'Tone Adjuster', description: 'Adjust the tone of your content', iconKey: 'palette', category: 'Rewriting Tools' },
  ],
  'seo-tools': [
    { name: 'SEO Optimizer', description: 'Optimize your content for search engines', iconKey: 'seo', category: 'SEO Tools', isPro: true },
    { name: 'Keyword Research', description: 'Find the best keywords for your content', iconKey: 'search', category: 'SEO Tools', isPro: false },
    { name: 'Meta Tag Generator', description: 'Generate SEO-friendly meta tags', iconKey: 'blog-post', category: 'SEO Tools', isPro: true },
    { name: 'Backlink Analyzer', description: 'Analyze and track backlinks', iconKey: 'chart', category: 'SEO Tools', isPro: true },
  ],
  'writing-assistant': [
    { name: 'AI Writing Assistant', description: 'Get AI-powered writing suggestions', iconKey: 'writing', category: 'Writing Assistant' },
    { name: 'Grammar Checker', description: 'Check and fix grammar errors', iconKey: 'checklist', category: 'Writing Assistant' },
    { name: 'Style Improver', description: 'Improve your writing style', iconKey: 'palette', category: 'Writing Assistant' },
  ],
  'social-media-tools': [
    { name: 'Social Media Manager', description: 'Manage and schedule social media posts', iconKey: 'social', category: 'Social Media Tools' },
    { name: 'Caption Generator', description: 'Generate engaging social media captions', iconKey: 'writing', category: 'Social Media Tools' },
    { name: 'Hashtag Research', description: 'Find trending hashtags', iconKey: 'search', category: 'Social Media Tools' },
    { name: 'Social Analytics', description: 'Track social media performance', iconKey: 'chart', category: 'Social Media Tools' },
  ],
  'image-prompts': [
    { name: 'Image Prompt Generator', description: 'Create detailed prompts for AI image generation', iconKey: 'image', category: 'Image Prompts' },
    { name: 'Style Reference Creator', description: 'Generate style references for images', iconKey: 'palette', category: 'Image Prompts' },
    { name: 'Art Direction Tool', description: 'Define artistic direction for AI images', iconKey: 'lightbulb', category: 'Image Prompts' },
  ],
  'ecommerce-tools': [
    { name: 'Product Description Writer', description: 'Write compelling product descriptions', iconKey: 'shopping', category: 'E-Commerce Tools' },
    { name: 'Store Manager', description: 'Manage your e-commerce store', iconKey: 'briefcase', category: 'E-Commerce Tools' },
    { name: 'Pricing Optimizer', description: 'Optimize product pricing strategies', iconKey: 'chart', category: 'E-Commerce Tools' },
  ],
  'advertising-tools': [
    { name: 'Ad Copy Generator', description: 'Generate effective ad copy', iconKey: 'megaphone', category: 'Advertising Tools' },
    { name: 'Campaign Manager', description: 'Manage advertising campaigns', iconKey: 'marketing', category: 'Advertising Tools' },
    { name: 'A/B Test Analyzer', description: 'Analyze A/B test results', iconKey: 'chart', category: 'Advertising Tools' },
  ],
  'code-tools': [
    { name: 'Code Assistant', description: 'Get AI-powered coding help and suggestions', iconKey: 'code', category: 'Code Tools', isPro: true },
    { name: 'Code Review Tool', description: 'Review and improve your code', iconKey: 'search', category: 'Code Tools', isPro: false },
    { name: 'Documentation Generator', description: 'Generate code documentation', iconKey: 'blog-post', category: 'Code Tools', isPro: true },
    { name: 'Bug Finder', description: 'Find and fix bugs in your code', iconKey: 'search', category: 'Code Tools', isPro: true },
  ],
  'marketing-tools': [
    { name: 'Marketing Strategy Builder', description: 'Build comprehensive marketing strategies', iconKey: 'marketing', category: 'Marketing Tools' },
    { name: 'Content Planner', description: 'Plan your marketing content', iconKey: 'calendar', category: 'Marketing Tools' },
    { name: 'Analytics Dashboard', description: 'Track marketing performance', iconKey: 'chart', category: 'Marketing Tools' },
  ],
  'book-writing': [
    { name: 'Book Outline Creator', description: 'Create detailed book outlines', iconKey: 'book', category: 'Book Writing' },
    { name: 'Chapter Generator', description: 'Generate book chapters', iconKey: 'blog-post', category: 'Book Writing' },
    { name: 'Character Developer', description: 'Develop compelling characters', iconKey: 'user', category: 'Book Writing' },
  ],
  'product-management': [
    { name: 'Product Roadmap', description: 'Plan your product roadmap', iconKey: 'package', category: 'Product Management' },
    { name: 'Feature Prioritization', description: 'Prioritize product features', iconKey: 'checklist', category: 'Product Management' },
    { name: 'User Story Generator', description: 'Generate user stories', iconKey: 'blog-post', category: 'Product Management' },
  ],
  'business': [
    { name: 'Business Plan Generator', description: 'Create comprehensive business plans', iconKey: 'briefcase', category: 'Business' },
    { name: 'Financial Forecaster', description: 'Forecast business finances', iconKey: 'chart', category: 'Business' },
    { name: 'Pitch Deck Creator', description: 'Create compelling pitch decks', iconKey: 'monitor', category: 'Business' },
  ],
  'website-content': [
    { name: 'Website Copy Writer', description: 'Write effective website copy', iconKey: 'seo', category: 'Website Content' },
    { name: 'Landing Page Creator', description: 'Create high-converting landing pages', iconKey: 'monitor', category: 'Website Content' },
    { name: 'About Page Generator', description: 'Generate engaging about pages', iconKey: 'blog-post', category: 'Website Content' },
  ],
  'email-tools': [
    { name: 'Email Campaign Creator', description: 'Design effective email marketing campaigns', iconKey: 'email', category: 'E-mail Tools', isPro: true },
    { name: 'Newsletter Generator', description: 'Create engaging newsletters', iconKey: 'email', category: 'E-mail Tools', isPro: false },
    { name: 'Subject Line Tester', description: 'Test and optimize email subject lines', iconKey: 'checklist', category: 'E-mail Tools', isPro: true },
  ],
  '2d-animation': [
    { name: '2D Animation Studio', description: 'Create 2D animations', iconKey: 'film', category: '2D Animation' },
    { name: 'Character Animator', description: 'Animate 2D characters', iconKey: 'user', category: '2D Animation' },
    { name: 'Motion Graphics', description: 'Create motion graphics', iconKey: 'palette', category: '2D Animation' },
  ],
  '3d-animation': [
    { name: '3D Animation Studio', description: 'Create 3D animations', iconKey: 'box', category: '3D Animation' },
    { name: '3D Model Creator', description: 'Create 3D models', iconKey: 'box', category: '3D Animation' },
    { name: 'Rigging Tool', description: 'Rig 3D models for animation', iconKey: 'package', category: '3D Animation' },
  ],
  'movie-script': [
    { name: 'Movie Script Writer', description: 'Write compelling movie scripts', iconKey: 'film', category: 'Movie Script Writing' },
    { name: 'Scene Builder', description: 'Build detailed movie scenes', iconKey: 'video', category: 'Movie Script Writing' },
    { name: 'Dialogue Generator', description: 'Generate natural dialogue', iconKey: 'writing', category: 'Movie Script Writing' },
  ],
  'idea-generation': [
    { name: 'Idea Generator', description: 'Generate creative ideas', iconKey: 'lightbulb', category: 'Idea Generation' },
    { name: 'Brainstorming Tool', description: 'Facilitate brainstorming sessions', iconKey: 'users', category: 'Idea Generation' },
    { name: 'Concept Developer', description: 'Develop concepts from ideas', iconKey: 'marketing', category: 'Idea Generation' },
  ],
  'personal-tools': [
    { name: 'Personal Assistant', description: 'AI-powered personal assistant', iconKey: 'user', category: 'Personal Tools' },
    { name: 'Task Manager', description: 'Manage your personal tasks', iconKey: 'checklist', category: 'Personal Tools' },
    { name: 'Habit Tracker', description: 'Track and build habits', iconKey: 'chart', category: 'Personal Tools' },
  ],
  'education-tools': [
    { name: 'Lesson Plan Generator', description: 'Generate educational lesson plans', iconKey: 'education', category: 'Education Tools' },
    { name: 'Quiz Creator', description: 'Create educational quizzes', iconKey: 'checklist', category: 'Education Tools' },
    { name: 'Study Guide Builder', description: 'Build comprehensive study guides', iconKey: 'book', category: 'Education Tools' },
  ],
  'hr-tools': [
    { name: 'Job Description Writer', description: 'Write effective job descriptions', iconKey: 'users', category: 'HR Tools' },
    { name: 'Interview Question Generator', description: 'Generate interview questions', iconKey: 'checklist', category: 'HR Tools' },
    { name: 'Performance Review Tool', description: 'Conduct performance reviews', iconKey: 'chart', category: 'HR Tools' },
  ],
  'support-tools': [
    { name: 'Support Ticket Manager', description: 'Manage customer support tickets', iconKey: 'headphones', category: 'Support Tools' },
    { name: 'FAQ Generator', description: 'Generate FAQ content', iconKey: 'checklist', category: 'Support Tools' },
    { name: 'Response Template Creator', description: 'Create support response templates', iconKey: 'writing', category: 'Support Tools' },
  ],
  'sales-tools': [
    { name: 'Sales Script Generator', description: 'Generate effective sales scripts', iconKey: 'usercheck', category: 'Sales Tools' },
    { name: 'Proposal Builder', description: 'Build compelling proposals', iconKey: 'blog-post', category: 'Sales Tools' },
    { name: 'Lead Qualifier', description: 'Qualify and score leads', iconKey: 'marketing', category: 'Sales Tools' },
  ],
  'film-making-tools': [
    { name: 'Film Production Planner', description: 'Plan film production', iconKey: 'film', category: 'Film Making Tools' },
    { name: 'Storyboard Creator', description: 'Create detailed storyboards', iconKey: 'palette', category: 'Film Making Tools' },
    { name: 'Shot List Generator', description: 'Generate comprehensive shot lists', iconKey: 'checklist', category: 'Film Making Tools' },
  ],
  'extras': [
    { name: 'General Purpose AI', description: 'Versatile AI for various tasks', iconKey: 'smile', category: 'Extras' },
    { name: 'Custom Workflow Builder', description: 'Build custom AI workflows', iconKey: 'package', category: 'Extras' },
    { name: 'API Integration Tool', description: 'Integrate with external APIs', iconKey: 'code', category: 'Extras' },
  ],
};

// Helper function to create workflow preview data for built-in AI tools
const createToolWorkflowPreview = (tool: { name: string; description: string; iconKey: string; category: string }) => {
  return {
    id: `builtin-${tool.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: tool.name,
    description: tool.description,
    formTitle: tool.name,
    formDescription: tool.description,
    category: tool.category,
    views: '1.2k',
    likes: '234',
    isPro: false,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    containers: [
      {
        id: 'step-1',
        type: 'form',
        label: 'Input Form',
        elements: [
          { id: 'input', type: 'textarea', label: 'Your Input', placeholder: `Enter your ${tool.category.toLowerCase()} requirements...`, required: true },
          { id: 'model', type: 'dropdown', label: 'AI Model', options: ['GPT-4', 'GPT-3.5', 'Claude 3', 'Custom'], defaultValue: 'GPT-4' },
          { id: 'tone', type: 'dropdown', label: 'Tone', options: ['Professional', 'Casual', 'Creative', 'Technical'], defaultValue: 'Professional' },
        ],
      },
    ],
    triggers: [],
  };
};

export function AIApps({ onWorkflowClick, onWorkflowPlusClick, isSidebarCollapsed, onCreateClick }: AIAppsProps) {
  const { theme } = useTheme();
  const { workflows } = useWorkflows();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [previewWorkflow, setPreviewWorkflow] = useState<any>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close filters when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showFilters]);

  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const inputBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Combine user workflows with AI tools
  const userWorkflows = workflows.map(workflow => ({
    name: workflow.name,
    description: workflow.description,
    iconKey: 'workflow',
    category: Array.isArray(workflow.category) ? workflow.category : [workflow.category],
    isUserWorkflow: true,
    workflowData: workflow,
  }));

  const currentTools = aiToolsData[selectedCategory] || aiToolsData['all'];
  const combinedTools = [...userWorkflows, ...currentTools];
  
  const filteredTools = combinedTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    
    // Check if tool matches the selected category
    if (tool.isUserWorkflow) {
      const categories = Array.isArray(tool.category) ? tool.category : [tool.category];
      const categoryMatch = useCategoryStore.getState().categories.find(cat => cat.id === selectedCategory);
      return matchesSearch && categories.some(cat => cat === categoryMatch?.name);
    }
    
    return matchesSearch;
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Calculate margins for main content
  const getMainContentMargin = () => {
    if (isMobile) {
      // On mobile, show minimized panel (64px width) on the left
      return 'ml-16';
    }
    
    // Calculate total margin based on sidebar + tool panel
    if (isPanelOpen) {
      // Main sidebar (140px or 220px) + Tool panel (288px = 72 * 4)
      return isSidebarCollapsed ? 'ml-0 lg:ml-[428px]' : 'ml-0 lg:ml-[508px]';
    }
    
    // Just main sidebar margin when tool panel is closed
    return isSidebarCollapsed ? 'ml-0 lg:ml-[140px]' : 'ml-0 lg:ml-[220px]';
  };

  return (
    <div className={`min-h-screen ${bgColor} pt-16`}>
      {/* Tool Category Panel */}
      <ToolCategoryPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        isSidebarCollapsed={isSidebarCollapsed}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${getMainContentMargin()}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-cyan-500" />
                <h1 className={`${textColor} text-2xl lg:text-3xl`}>
                  AI Apps & Tools
                </h1>
              </div>
              <p className={`${textColor} opacity-70`}>
                {selectedCategory === 'all'
                  ? 'Explore all available AI-powered tools and workflows'
                  : `Showing ${currentTools.length} tool${currentTools.length !== 1 ? 's' : ''} in ${useCategoryStore.getState().categories.find(cat => cat.id === selectedCategory)?.name || 'selected category'}`}
              </p>
            </div>
            
            {/* Create Button */}
            {onCreateClick && (
              <button
                onClick={onCreateClick}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Create Workflow</span>
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${textColor} opacity-50`} />
              <input
                type="text"
                placeholder="Search AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 ${inputBg} ${borderColor} border rounded-lg ${textColor} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
              />
            </div>
            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`${cardBg} ${borderColor} border px-4 py-3 rounded-lg ${textColor} hover:border-cyan-500 transition-colors flex items-center gap-2 justify-center sm:w-auto`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
              
              {/* Filter Dropdown */}
              {showFilters && (
                <div className={`absolute right-0 mt-2 w-64 ${cardBg} ${borderColor} border rounded-lg shadow-xl z-50 p-4`}>
                  <h3 className={`${textColor} mb-3`}>Filter Options</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className={`${textColor} text-sm`}>Pro Tools Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className={`${textColor} text-sm`}>Free Tools Only</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className={`${textColor} text-sm`}>Most Popular</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel Toggle Button (Desktop) */}
          {!isMobile && !isPanelOpen && (
            <button
              onClick={() => setIsPanelOpen(true)}
              className={`mb-6 ${cardBg} ${borderColor} border px-4 py-2 rounded-lg ${textColor} hover:border-cyan-500 transition-colors flex items-center gap-2`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Show Categories</span>
            </button>
          )}

          {/* Tools Grid - Always 3 columns on desktop */}
          {filteredTools.length === 0 ? (
            <div className={`${cardBg} ${borderColor} border rounded-lg p-12 text-center`}>
              <SearchIcon className={`w-16 h-16 mx-auto mb-4 ${textColor} opacity-30`} />
              <h3 className={`${textColor} text-xl mb-2`}>No tools found</h3>
              <p className={`${textColor} opacity-60`}>
                Try adjusting your search or select a different category
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => {
                const IconComponent = iconMap[tool.iconKey] || Sparkles;
                return (
                  <WorkflowCard
                    key={index}
                    name={tool.name}
                    description={tool.description}
                    icon={IconComponent}
                    iconBgColor="rgba(0, 114, 255, 0.2)"
                    views={tool.isUserWorkflow ? tool.workflowData.views : "1.2k"}
                    likes={tool.isUserWorkflow ? tool.workflowData.likes : "234"}
                    isPro={tool.isPro || false}
                    onClick={() => {
                      if (tool.isUserWorkflow) {
                        setPreviewWorkflow(tool.workflowData);
                      } else {
                        // Create preview data for built-in AI tools
                        const previewData = createToolWorkflowPreview(tool);
                        setPreviewWorkflow(previewData);
                      }
                    }}
                    onPlusClick={
                      onWorkflowPlusClick
                        ? (action) => onWorkflowPlusClick(tool, action)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
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