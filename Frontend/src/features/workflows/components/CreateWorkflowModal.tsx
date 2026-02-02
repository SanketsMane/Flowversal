import { X, Search, Zap, Brain, MessageSquare, Image as ImageIcon, Heart, Star, Target, TrendingUp, Users, Globe, Lock, Sparkles, Workflow, Code, Database, Cloud, Mail, Phone, Calendar, FileText, Video, Music, ShoppingCart, DollarSign, BarChart, Megaphone, Share2, Eye, MousePointer, PieChart, Activity, Layers, Box, GitBranch, Terminal, Package, Cpu, Server, HardDrive, Smartphone, Monitor, Laptop, Tablet, Pencil, Palette, Send, MessageCircle, ThumbsUp, Filter, Layout, Settings, Wrench, Briefcase, Award, Bookmark, Flag, Lightbulb, Rocket, Hash, AtSign, Link, Repeat, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useCategoryStore } from '@/core/stores/admin/categoryStore';
import { IconLibrary, RenderIcon } from '@/shared/components/ui/IconLibrary';

interface CreateWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkflow?: (data: WorkflowData) => void;
  onStartWorkflow?: (data: WorkflowData) => void;
}

interface WorkflowData {
  name: string;
  description: string;
  category: string | string[];
  icon: string;
  coverImage?: string;
}

export function CreateWorkflowModal({ isOpen, onClose, onCreateWorkflow, onStartWorkflow }: CreateWorkflowModalProps) {
  const { theme, toggleTheme } = useTheme();
  const { getActiveCategories } = useCategoryStore();
  const [formData, setFormData] = useState<WorkflowData>({
    name: '',
    description: '',
    category: [],
    icon: 'Workflow',
    coverImage: undefined,
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showIconLibrary, setShowIconLibrary] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  // Get categories from store
  const storeCategories = getActiveCategories();
  const categories = storeCategories.map(cat => cat.name);

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
        setFormData({ ...formData, coverImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description || (Array.isArray(formData.category) && formData.category.length === 0)) {
      setWarningMessage('Please fill in all required fields (Name, Description, and at least one Category)');
      setShowWarning(true);
      return;
    }
    if (formData.description.length < 10) {
      setWarningMessage('Description must be at least 10 characters long. Please provide a more detailed description.');
      setShowWarning(true);
      return;
    }
    
    // Call the onStartWorkflow callback to open the FormBuilder
    if (onStartWorkflow) {
      onStartWorkflow(formData);
    } else {
      onCreateWorkflow?.(formData);
    }
    
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: [],
      icon: 'Workflow',
      coverImage: undefined,
    });
    setCoverImagePreview(null);
    setShowIconLibrary(false);
    setShowCategoryDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className={`${bgCard} rounded-xl border ${borderColor} max-w-md w-full shadow-2xl p-6`}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`${textColor} font-semibold mb-1`}>Validation Error</h3>
                <p className={`${textSecondary} text-sm`}>{warningMessage}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowWarning(false)}
                className="px-5 py-2 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-lg hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`${bgCard} rounded-2xl border ${borderColor} w-full max-w-3xl my-8 shadow-2xl`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b ${borderColor} flex items-center justify-between`}>
          <div>
            <h2 className={`text-2xl ${textColor}`}>Create New Workflow</h2>
            <p className={`${textSecondary} text-sm mt-1`}>Fill in the details below to create your workflow</p>
          </div>
          <button
            onClick={handleClose}
            className={`w-10 h-10 rounded-lg ${hoverBg} flex items-center justify-center transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-visible"
          style={{ position: 'relative' }}
        >
          {/* Welcome Message */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-green-500 text-sm">
                Welcome back, <span className="font-semibold">Justin J. Ruiz!</span> You can create your workflow.
              </p>
            </div>
          </div>

          {/* Cover Image Upload (Optional) */}
          <div>
            <label className={`block ${textColor} mb-2 text-sm`}>
              Cover Image <span className={`${textSecondary} text-xs`}>(Optional)</span>
            </label>
            <div className="relative">
              {coverImagePreview ? (
                <div className="relative group">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-xl border-2 border-dashed border-[#00C6FF]/30"
                  />
                  <button
                    onClick={() => {
                      setCoverImagePreview(null);
                      setFormData({ ...formData, coverImage: undefined });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed ${borderColor} rounded-xl cursor-pointer ${hoverBg} transition-colors`}>
                  <ImageIcon className={`w-12 h-12 ${textSecondary} mb-2`} />
                  <p className={`${textSecondary} text-sm mb-1`}>Click to upload cover image</p>
                  <p className={`${textSecondary} text-xs`}>PNG, JPG or GIF (max. 5MB)</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className={`block ${textColor} mb-2 text-sm`}>
              Workflow Icon <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowIconLibrary(!showIconLibrary)}
                className={`w-full flex items-center gap-3 px-4 py-3 ${inputBg} border ${borderColor} rounded-xl ${hoverBg} transition-colors`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#9D50BB] flex items-center justify-center">
                  <RenderIcon name={formData.icon} className="w-5 h-5 text-white" />
                </div>
                <span className={textColor}>{formData.icon}</span>
                <Search className={`w-4 h-4 ${textSecondary} ml-auto`} />
              </button>
            </div>
          </div>

          {/* Workflow Name */}
          <div>
            <label className={`block ${textColor} mb-2 text-sm`}>
              Workflow Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter workflow name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 ${inputBg} border ${borderColor} rounded-xl ${textColor} placeholder:text-[#CFCFE8]/50 focus:outline-none focus:border-[#00C6FF]/50 transition-all`}
            />
            <p className={`${textSecondary} text-xs mt-1.5`}>This will be displayed as the workflow name</p>
          </div>

          {/* Workflow Description */}
          <div>
            <label className={`block ${textColor} mb-2 text-sm`}>
              Workflow Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter workflow description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className={`w-full px-4 py-3 ${inputBg} border ${
                formData.description && formData.description.length >= 10
                  ? 'border-green-500/50'
                  : borderColor
              } rounded-xl ${textColor} placeholder:text-[#CFCFE8]/50 focus:outline-none focus:border-[#00C6FF]/50 transition-all resize-none`}
            />
            <p className={`${textSecondary} text-xs mt-1.5`}>
              Provide a clear description of what this workflow does (minimum 10 characters)
            </p>
          </div>

          {/* Workflow Category */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block ${textColor} text-sm`}>
                Workflow Categories <span className="text-red-500">*</span>
              </label>
              {Array.isArray(formData.category) && formData.category.length > 0 && (
                <span className={`${textSecondary} text-xs`}>
                  {formData.category.length} selected
                </span>
              )}
            </div>
            
            <div className="relative z-50">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className={`w-full flex items-center justify-between px-4 py-3 ${inputBg} border ${borderColor} rounded-xl ${textColor} ${hoverBg} transition-colors`}
              >
                <span className={Array.isArray(formData.category) && formData.category.length > 0 ? textColor : textSecondary}>
                  {Array.isArray(formData.category) && formData.category.length > 0
                    ? `${formData.category.length} categories selected`
                    : 'Select categories'}
                </span>
                <svg className={`w-4 h-4 ${textSecondary} transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCategoryDropdown && (
                <div 
                  className={`absolute z-[100] w-full mb-2 ${bgPanel} border ${borderColor} rounded-xl shadow-2xl overflow-hidden`}
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    right: 0,
                  }}
                >
                  <div className="max-h-[240px] overflow-y-auto">
                    {categories.map((category) => {
                      const isSelected = Array.isArray(formData.category) && formData.category.includes(category);
                      return (
                        <label
                          key={category}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${hoverBg} transition-colors border-b ${borderColor} last:border-0`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const currentCategories = Array.isArray(formData.category) ? formData.category : [];
                              if (e.target.checked) {
                                setFormData({ ...formData, category: [...currentCategories, category] });
                              } else {
                                setFormData({ ...formData, category: currentCategories.filter(c => c !== category) });
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-[#00C6FF] focus:ring-[#00C6FF]"
                          />
                          <span className={textColor}>{category}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Selected Categories Chips - Now below the dropdown */}
            {Array.isArray(formData.category) && formData.category.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.category.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#00C6FF]/10 to-[#9D50BB]/10 border border-[#00C6FF]/30 rounded-full text-xs"
                  >
                    <span className={textColor}>{cat}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          category: (formData.category as string[]).filter(c => c !== cat)
                        });
                      }}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <p className={`${textSecondary} text-xs mt-1.5`}>Select one or more categories for your workflow</p>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor} flex items-center justify-end gap-3`}>
          <button
            onClick={handleClose}
            className={`px-6 py-2.5 ${inputBg} border ${borderColor} rounded-xl ${textColor} hover:bg-white/5 transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white rounded-xl hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all"
          >
            Start Workflow
          </button>
        </div>
      </div>

      {/* Icon Library Modal */}
      {showIconLibrary && (
        <IconLibrary
          selectedIcon={formData.icon}
          onSelectIcon={(icon) => {
            setFormData({ ...formData, icon });
            setShowIconLibrary(false);
          }}
          onClose={() => setShowIconLibrary(false)}
          theme={theme}
        />
      )}
    </div>
  );
}