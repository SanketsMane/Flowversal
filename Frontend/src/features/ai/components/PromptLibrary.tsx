/**
 * Prompt Library Component
 * Displays pre-defined and user-saved prompts for users to quickly start workflows or conversations.
 * Features:
 * - Discover Mode: Browse categorized templates
 * - My Prompts Mode: Create, manage, and execute custom prompts
 * - LocalStorage persistence for user prompts
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { ArrowLeft, ArrowRight, Copy, Play, Plus, Search, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  promptText: string;
  icons?: string[]; // URLs or identifiers for icons
}

interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

interface PromptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

const promptCategories = [
  'All',
  'Communication',
  'Research',
  'Content-Creation',
  'Decision-Making',
  'Productivity',
  'Coding',
];

// Mock Data based on the user's screenshot and extended for Flowversal
const prompts: Prompt[] = [
  {
    id: '1',
    title: 'Daily Market Briefing & Audio Summary',
    description: 'Generate a daily investment briefing with current stock data, market sentiment analysis, and a 30-60 second audio narration summary.',
    category: 'Research',
    promptText: 'Generate a daily investment briefing with current stock data (AAPL, TSLA, GOOGL, NVDA, top 3 movers), market sentiment analysis, and a 30-60 second audio narration summary. Provide the final briefing text and audio link.',
    icons: ['finance', 'audio', 'slack'],
  },
  {
    id: '2',
    title: 'Enchanted Forest Visual Inspiration',
    description: 'Search for enchanted forest images, analyze lighting and textures, and generate a prompt for a fantasy forest scene.',
    category: 'Content-Creation',
    promptText: 'Search for enchanted forest images on Unsplash with misty air and vibrant foliage, analyze the lighting and textures like soft moss and glowing fireflies, create a prompt for a fantasy forest scene with magical glowing trees, and generate this image for my storybook illustration.',
    icons: ['image', 'ai'],
  },
  {
    id: '3',
    title: 'Tech Guru Opinions',
    description: 'Find recent smartphone reviews from top tech reviewers, analyze key points, and recommend a purchase.',
    category: 'Decision-Making',
    promptText: "I'm planning to buy a new phone and need expert opinions. Find the 2 most recent and popular smartphone review videos from MKBHD and Mrwhosetheboss, analyze each video's key points, and recommend which phone I should consider.",
    icons: ['youtube', 'analysis'],
  },
  {
    id: '4',
    title: 'Wearable AI Healthcare Paper Finder',
    description: 'Find a recent research paper on wearable AI in healthcare and break it down into simple points.',
    category: 'Research',
    promptText: 'I\'m trying to explore wearable AI in healthcare. Can you find me a recent research paper on this topic and break it down into simple points I can skim through?',
    icons: ['scholar', 'summary'],
  },
  {
    id: '5',
    title: 'Morning News Audio Digest',
    description: 'Gather top global news, summarize key points, and convert to audio for a morning routine.',
    category: 'Productivity',
    promptText: 'Gather today\'s top global news stories, summarize the key points from each in a concise format, and convert this summary into an audio file I can listen to.',
    icons: ['news', 'audio'],
  },
  {
    id: '6',
    title: 'Automate Social Media Posting',
    description: 'Create a workflow to post to Twitter, LinkedIn, and Facebook when a new blog post is published.',
    category: 'Content-Creation',
    promptText: 'Create an automated workflow that instantly posts to Twitter, LinkedIn, and Facebook whenever I publish a new blog post on my website. Include automatic hashtag generation.',
    icons: ['social', 'automation'],
  },
  {
    id: '7',
    title: 'Python Learning Resources',
    description: 'Find tutorials, articles, and compile them into a Notion page for learning Python.',
    category: 'Coding',
    promptText: 'I\'m learning Python programming and need a collection of resources. Find YouTube tutorials on Python basics, search for related articles, and compile everything into a Notion page.',
    icons: ['youtube', 'notion', 'python'],
  },
  {
    id: '8',
    title: 'Customer Support Assistant',
    description: 'Draft professional responses to common customer complaints like delayed delivery or refund requests.',
    category: 'Communication',
    promptText: 'Help me draft professional responses to common customer complaints for my online clothing store. Create templates for issues like delayed delivery, wrong size received, and refund requests.',
    icons: ['mail', 'support'],
  },
  {
    id: '9',
    title: 'Compare and Book Best Flights',
    description: 'Find best flights from Mumbai to Dubai for specific dates, comparing airlines and prices.',
    category: 'Decision-Making',
    promptText: 'Find me the best flights from Mumbai to Dubai for December 20th with 2 passengers. Show me different airline options with prices, flight times, and duration.',
    icons: ['travel', 'money'],
  },
  {
    id: '10',
    title: 'Launch My Website',
    description: 'Deploy Next.js portfolio to Vercel with custom domain and performance checks.',
    category: 'Coding',
    promptText: 'Deploy my Next.js portfolio website to Vercel with custom domain setup, SSL certificate, and performance optimization. Monitor build status and set up automatic deployments.',
    icons: ['code', 'deploy'],
  },
];

export function PromptLibrary({ isOpen, onClose, onSelectPrompt }: PromptLibraryProps) {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'saved'>('discover');
  
  // Saved Prompts State
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme from DOM
    const checkTheme = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    checkTheme();
    
    // Watch for class changes on html element
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setIsMounted(true);
    // Load saved prompts from localStorage
    const saved = localStorage.getItem('flowversal_saved_prompts');
    if (saved) {
      try {
        setSavedPrompts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved prompts', e);
      }
    }
    return () => setIsMounted(false);
  }, []);

  const savePrompt = () => {
    if (!newPromptTitle.trim() || !newPromptContent.trim()) return;

    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      title: newPromptTitle,
      content: newPromptContent,
      createdAt: Date.now(),
    };

    const updatedPrompts = [...savedPrompts, newPrompt];
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('flowversal_saved_prompts', JSON.stringify(updatedPrompts));
    
    // Reset form
    setNewPromptTitle('');
    setNewPromptContent('');
    setIsCreatingPrompt(false);
  };

  const deletePrompt = (id: string) => {
    const updatedPrompts = savedPrompts.filter(p => p.id !== id);
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('flowversal_saved_prompts', JSON.stringify(updatedPrompts));
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      const matchesCategory = selectedCategory === 'All' || prompt.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const filteredSavedPrompts = useMemo(() => {
    return savedPrompts.filter(prompt => 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [savedPrompts, searchQuery]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div 
        className={`w-[90%] max-w-[1200px] h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in-95 duration-200 border ${
          isDarkMode ? 'border-gray-800' : 'border-transparent'
        }`}
        style={{ backgroundColor: isDarkMode ? '#0F1115' : '#FFFFFF' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className={`px-8 py-6 border-b flex items-center justify-between sticky top-0 z-10 ${
            isDarkMode ? 'border-gray-800' : 'border-gray-100'
          }`}
          style={{ backgroundColor: isDarkMode ? '#0F1115' : '#FFFFFF' }}
        >
          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold text-black dark:text-white text-center md:text-left">
                {isCreatingPrompt ? 'New Prompt' : (
                  activeTab === 'discover' ? (
                    <>Discover <span className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-transparent bg-clip-text">Prompts</span></>
                  ) : (
                    <>Saved <span className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-transparent bg-clip-text">Prompts</span></>
                  )
                )}
              </h2>
              {!isCreatingPrompt && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {activeTab === 'discover' 
                    ? 'Select a prompt to instantly start a workflow'
                    : 'Manage and reuse your custom prompts'
                  }
                </p>
              )}
            </div>

            {/* Tabs */}
            {!isCreatingPrompt && (
              <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-[#1A1D21]' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setActiveTab('discover')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'discover'
                      ? (isDarkMode ? 'bg-[#2A2D35] text-white' : 'bg-white text-black shadow-sm')
                      : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-black')
                  }`}
                >
                  Discover
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'saved'
                      ? (isDarkMode ? 'bg-[#2A2D35] text-white' : 'bg-white text-black shadow-sm')
                      : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-black')
                  }`}
                >
                  My Prompts
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab === 'saved' && !isCreatingPrompt && (
              <button
                onClick={() => setIsCreatingPrompt(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium shadow-sm hover:opacity-90"
                style={{ backgroundColor: '#10B981', color: 'white' }}
              >
                <Plus className="w-4 h-4" style={{ color: 'white' }} />
                <span className="font-semibold" style={{ color: 'white' }}>New Prompt</span>
              </button>
            )}
            
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#1A1D21] rounded-xl transition-colors text-gray-500 dark:text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-8"
          style={{ backgroundColor: isDarkMode ? '#0F1115' : '#F9FAFB' }}
        >
          <div className="max-w-7xl mx-auto">
            
            {/* Create Prompt View */}
            {isCreatingPrompt ? (
              <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
                <button 
                  onClick={() => setIsCreatingPrompt(false)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors mb-4 ${isDarkMode ? 'bg-[#1A1D21] hover:bg-[#2A2D35]' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>

                <div className="space-y-6">
                  <div>
                    <input
                      type="text"
                      placeholder="Enter prompt title..."
                      value={newPromptTitle}
                      onChange={(e) => setNewPromptTitle(e.target.value)}
                      className={`w-full text-3xl font-bold bg-transparent border-none focus:ring-0 px-0 ${isDarkMode ? 'text-white placeholder:text-gray-600' : 'text-gray-900 placeholder:text-gray-300'}`}
                      autoFocus
                    />
                  </div>

                  <div className={`rounded-xl p-4 min-h-[300px] shadow-lg border ${isDarkMode ? 'bg-[#1A1D21] border-gray-800' : 'bg-white border-gray-200'}`}>
                    <textarea
                      placeholder="Write your prompt here..."
                      value={newPromptContent}
                      onChange={(e) => setNewPromptContent(e.target.value)}
                      className={`w-full h-full min-h-[300px] bg-transparent resize-none border-none focus:ring-0 text-lg leading-relaxed ${isDarkMode ? 'text-gray-200 placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'}`}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setIsCreatingPrompt(false)}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-[#1A1D21]' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={savePrompt}
                      disabled={!newPromptTitle.trim() || !newPromptContent.trim()}
                      className="px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                      style={{ backgroundColor: '#10B981', color: 'white' }}
                    >
                      <span className="font-semibold" style={{ color: 'white' }}>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'discover' ? (
              /* Discover View */
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Search & Categories */}
                <div className="space-y-6">
                   {/* Search Bar */}
                   <div className="relative max-w-md mx-auto md:mx-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search prompts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6FF]/20 focus:border-[#00C6FF] ${
                        isDarkMode ? 'border-gray-800 bg-[#1A1D21] text-white' : 'border-gray-200 bg-white text-gray-900'
                      }`}
                    />
                  </div>
    
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {promptCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white shadow-lg shadow-blue-500/20 border-transparent'
                            : isDarkMode 
                              ? 'bg-[#1A1D21] border-gray-800 text-gray-400 hover:bg-[#2A2D35]' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-[#00C6FF]/30'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
    
                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredPrompts.map(prompt => (
                    <div
                      key={prompt.id}
                      onClick={() => {
                        onSelectPrompt(prompt.promptText);
                        onClose();
                      }}
                      className={`group relative border rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-[#00C6FF]/30 transition-all duration-300 cursor-pointer flex flex-col gap-4 overflow-hidden ${
                        isDarkMode ? 'bg-[#1A1D21] border-gray-800' : 'bg-white border-gray-100'
                      }`}
                    >
                      {/* Hover Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00C6FF]/5 to-[#9D50BB]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10 flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className={`font-semibold group-hover:text-[#00C6FF] transition-colors line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {prompt.title}
                          </h3>
                          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-[#2A2D35] flex items-center justify-center shrink-0 group-hover:bg-white dark:group-hover:bg-[#3A3D45] group-hover:shadow-sm transition-all">
                            <Sparkles className="w-4 h-4 text-[#00C6FF]" />
                          </div>
                        </div>
                        
                        <p className={`text-sm line-clamp-4 leading-relaxed ${isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-600'}`}>
                          {prompt.description}
                        </p>
                      </div>
    
                      {/* Footer / Action */}
                      <div className="relative z-10 pt-2 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 mt-auto">
                        <div className="flex -space-x-2">
                          {/* Placeholder icons - in real app, map icons prop to actual components */}
                          {[1, 2].map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-[#2A2D35] border-2 border-white dark:border-[#1A1D21] flex items-center justify-center text-[10px] text-gray-400">
                              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full opacity-50" />
                            </div>
                          ))}
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-[#00C6FF]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <ArrowRight className="w-4 h-4 text-[#00C6FF]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
    
                {filteredPrompts.length === 0 && (
                  <div className="text-center py-20 text-gray-500">
                    <p className="text-lg font-medium">No prompts found matching "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try adjusting your search or category filter</p>
                  </div>
                )}
              </div>
            ) : (
              /* Saved Prompts View */
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Search Bar */}
                <div className="flex justify-end mb-6">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search saved prompts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        isDarkMode ? 'bg-[#1A1D21] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                {filteredSavedPrompts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <p className="text-lg font-medium mb-2">No prompts yet</p>
                    <p className="text-sm">Create your first custom prompt to get started</p>
                  </div>
                ) : (
                  <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-[#1A1D21] border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className={`grid grid-cols-[1fr_auto] gap-4 p-4 border-b text-sm font-medium ${
                      isDarkMode ? 'border-gray-800 bg-[#222529] text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}>
                      <div>Prompt</div>
                      <div className="w-[200px] text-right">Actions</div>
                    </div>
                    {filteredSavedPrompts.map(prompt => (
                      <div 
                        key={prompt.id}
                        className={`grid grid-cols-[1fr_auto] gap-4 p-4 border-b last:border-0 transition-colors items-center group ${
                          isDarkMode ? 'border-gray-800 hover:bg-[#222529]' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <h3 className={`font-medium mb-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{prompt.title}</h3>
                          <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{prompt.content}</p>
                        </div>
                        <div className="flex items-center gap-2 w-[200px] justify-end opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              onSelectPrompt(prompt.content);
                              onClose();
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors shadow-sm hover:opacity-90"
                            style={{ backgroundColor: '#10B981', color: 'white' }}
                          >
                            <Play className="w-3 h-3 fill-current" style={{ color: 'white' }} />
                            <span className="font-semibold" style={{ color: 'white' }}>Execute</span>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(prompt.content);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePrompt(prompt.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                            title="Delete prompt"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level
  if (!isMounted || typeof document === 'undefined') return null;
  
  return createPortal(
    <div className={isDarkMode ? 'dark' : ''}>
      {modalContent}
    </div>,
    document.body
  );
}

