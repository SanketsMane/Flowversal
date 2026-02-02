/**
 * Edit Workflow Modal
 * Allows editing workflow metadata: name, description, icon, image, categories, difficulty, tags, use cases
 */

import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Upload } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore, useUIStore } from '../../stores';
import { useCategoryStore } from '@/core/stores/admin/categoryStore';
import { IconLibrary, RenderIcon } from '@/shared/components/ui/IconLibrary';

// Difficulty levels
const DIFFICULTY_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

export function EditWorkflowModal() {
  const { theme } = useTheme();
  
  // Get modal state from UIStore
  const isOpen = useUIStore(state => state.isEditWorkflowOpen);
  const closeEditWorkflow = useUIStore(state => state.closeEditWorkflow);
  
  // Use selectors to avoid unnecessary re-renders
  const workflowName = useWorkflowStore(state => state.workflowName);
  const workflowDescription = useWorkflowStore(state => state.workflowDescription);
  const workflowMetadata = useWorkflowStore(state => state.workflowMetadata);
  const setWorkflowName = useWorkflowStore(state => state.setWorkflowName);
  const setWorkflowDescription = useWorkflowStore(state => state.setWorkflowDescription);
  const updateWorkflowMetadata = useWorkflowStore(state => state.updateWorkflowMetadata);
  
  // Get categories from admin store
  const { getActiveCategories } = useCategoryStore();
  const availableCategories = getActiveCategories();

  // Local state
  const [name, setName] = useState(workflowName);
  const [description, setDescription] = useState(workflowDescription);
  const [icon, setIcon] = useState(workflowMetadata?.icon || 'Workflow');
  const [coverImage, setCoverImage] = useState(workflowMetadata?.coverImage || '');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    workflowMetadata?.categoryIds || []
  );
  const [difficulty, setDifficulty] = useState(workflowMetadata?.difficulty || 'all');
  const [tags, setTags] = useState<string[]>(workflowMetadata?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [useCases, setUseCases] = useState<string[]>(workflowMetadata?.useCases || []);
  const [useCaseInput, setUseCaseInput] = useState('');
  const [showIconLibrary, setShowIconLibrary] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(coverImage);
  
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with store when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(workflowName);
      setDescription(workflowDescription);
      setIcon(workflowMetadata?.icon || 'Workflow');
      setCoverImage(workflowMetadata?.coverImage || '');
      setImagePreview(workflowMetadata?.coverImage || null);
      setSelectedCategoryIds(workflowMetadata?.categoryIds || []);
      setDifficulty(workflowMetadata?.difficulty || 'all');
      setTags(workflowMetadata?.tags || []);
      setUseCases(workflowMetadata?.useCases || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoryDropdown]);

  // Theme colors
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-[#E0E0FF]' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100';

  const handleSave = () => {
    setWorkflowName(name);
    setWorkflowDescription(description);
    updateWorkflowMetadata({
      icon,
      coverImage,
      categoryIds: selectedCategoryIds,
      difficulty,
      tags,
      useCases,
    });
    closeEditWorkflow();
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addUseCase = () => {
    if (useCaseInput.trim() && !useCases.includes(useCaseInput.trim())) {
      setUseCases([...useCases, useCaseInput.trim()]);
      setUseCaseInput('');
    }
  };

  const removeUseCase = (useCase: string) => {
    setUseCases(useCases.filter(u => u !== useCase));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a local URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setCoverImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get selected category names
  const selectedCategoryNames = availableCategories
    .filter(cat => selectedCategoryIds.includes(cat.id))
    .map(cat => cat.name)
    .join(', ');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className={`${bgCard} rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border ${borderColor}`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
            <h2 className={`text-xl font-semibold ${textPrimary}`}>Edit Workflow Settings</h2>
            <button
              onClick={closeEditWorkflow}
              className={`p-2 rounded-lg ${hoverBg} ${textSecondary} transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="space-y-6">
              {/* Workflow Name */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Workflow Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${inputBg} border ${borderColor} ${textPrimary} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="Enter workflow name"
                />
                <p className={`text-xs ${textSecondary} mt-1`}>This will be displayed as the workflow name</p>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg ${inputBg} border ${borderColor} ${textPrimary} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none`}
                  placeholder="Describe what this workflow does"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Icon
                </label>
                <button
                  type="button"
                  onClick={() => setShowIconLibrary(true)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${inputBg} border ${borderColor} ${textPrimary} ${hoverBg} transition-all w-full`}
                >
                  <RenderIcon name={icon} className="w-5 h-5" />
                  <span>{icon}</span>
                </button>
              </div>

              {/* Cover Image */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Cover Image
                </label>
                <div className="space-y-3">
                  {/* Image URL Input */}
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => {
                      setCoverImage(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className={`w-full px-4 py-2 rounded-lg ${inputBg} border ${borderColor} ${textPrimary} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    placeholder="https://example.com/image.jpg"
                  />
                  
                  {/* Upload Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${inputBg} border ${borderColor} ${textPrimary} ${hoverBg} transition-all`}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </button>
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className={`w-24 h-24 rounded-lg border ${borderColor} overflow-hidden flex items-center justify-center ${inputBg}`}>
                        <img 
                          src={imagePreview} 
                          alt="Cover Preview" 
                          className="w-full h-full object-cover"
                          onError={() => setImagePreview(null)}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Categories Dropdown */}
              <div ref={categoryDropdownRef}>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Categories (Multiple selection allowed)
                </label>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg ${inputBg} border ${borderColor} ${textPrimary} ${hoverBg} transition-all w-full`}
                >
                  <span className={selectedCategoryIds.length > 0 ? textPrimary : textSecondary}>
                    {selectedCategoryIds.length > 0 ? selectedCategoryNames : 'Select categories...'}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showCategoryDropdown && (
                  <div className={`mt-2 ${bgCard} border ${borderColor} rounded-lg shadow-xl overflow-hidden`}>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {availableCategories.map((category) => (
                        <label
                          key={category.id}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg ${hoverBg} cursor-pointer transition-colors`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(category.id)}
                            onChange={() => toggleCategory(category.id)}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                          />
                          <span className={textPrimary}>{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Difficulty Level */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Difficulty Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setDifficulty(level.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        difficulty === level.value
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                          : `${inputBg} ${borderColor} ${textSecondary} ${hoverBg}`
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className={`flex-1 px-4 py-2 rounded-lg ${inputBg} border ${borderColor} ${textPrimary} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full ${inputBg} border ${borderColor}`}
                      >
                        <span className={`text-sm ${textPrimary}`}>{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className={`${textSecondary} hover:text-red-500 transition-colors`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Use Cases */}
              <div>
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                  Use Cases
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={useCaseInput}
                    onChange={(e) => setUseCaseInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUseCase())}
                    className={`flex-1 px-4 py-2 rounded-lg ${inputBg} border ${borderColor} ${textPrimary} focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                    placeholder="Add a use case and press Enter"
                  />
                  <button
                    onClick={addUseCase}
                    className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
                  >
                    Add
                  </button>
                </div>
                {useCases.length > 0 && (
                  <div className="space-y-2">
                    {useCases.map((useCase, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg ${inputBg} border ${borderColor}`}
                      >
                        <span className={`text-sm ${textPrimary}`}>{useCase}</span>
                        <button
                          onClick={() => removeUseCase(useCase)}
                          className={`${textSecondary} hover:text-red-500 transition-colors`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-end gap-3 p-6 border-t ${borderColor}`}>
            <button
              onClick={closeEditWorkflow}
              className={`px-6 py-2 rounded-lg ${inputBg} border ${borderColor} ${textPrimary} ${hoverBg} transition-all`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Icon Library Modal */}
      {showIconLibrary && (
        <IconLibrary
          selectedIcon={icon}
          onSelectIcon={(selectedIcon) => {
            setIcon(selectedIcon);
            setShowIconLibrary(false);
          }}
          onClose={() => setShowIconLibrary(false)}
          theme={theme}
        />
      )}
    </>
  );
}