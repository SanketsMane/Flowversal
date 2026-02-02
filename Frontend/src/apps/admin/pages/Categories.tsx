/**
 * Categories Management Page
 * CRUD operations for workflow categories
 * Categories reflect in app's AI Apps tab
 */

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { useThemeStore } from '@/core/stores/admin/themeStore';
import { useCategoryStore, WorkflowCategory } from '@/core/stores/admin/categoryStore';
import { IconLibrary, RenderIcon } from '@/shared/components/ui/IconLibrary';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Folder,
  Search,
  Wand2,
} from 'lucide-react';

export function CategoriesPage() {
  const { theme } = useThemeStore();
  const { categories, addCategory, updateCategory, deleteCategory, toggleCategory } = useCategoryStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WorkflowCategory | null>(null);
  const [showIconLibrary, setShowIconLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Folder',
    color: '#00C6FF',
  });

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const cardBg = theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200';
  const inputBg = theme === 'dark' ? 'bg-[#0E0E1F] border-[#2A2A3E] text-white' : 'bg-gray-50 border-gray-200 text-gray-900';
  const hoverBg = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';

  // Filter categories by search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      setEditingCategory(null);
    } else {
      addCategory({
        ...formData,
        order: categories.length + 1,
        isActive: true,
      });
    }

    setFormData({ name: '', description: '', icon: 'Folder', color: '#00C6FF' });
    setShowAddModal(false);
  };

  const handleEdit = (category: WorkflowCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCategory(id);
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: 'Folder', color: '#00C6FF' });
  };

  const colorOptions = [
    '#00C6FF', '#9D50BB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#14B8A6', '#F97316', '#6366F1', '#A855F7'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl ${textColor}`}>Workflow Categories</h1>
          <p className={mutedColor}>
            Manage workflow categories - {categories.length} total
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${mutedColor}`} />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories by name or description..."
          className={`pl-10 ${inputBg}`}
        />
      </div>

      {/* Categories List */}
      <div className="space-y-3">
        {filteredCategories.map((category) => (
          <Card
            key={category.id}
            className={`${cardBg} p-4 ${
              !category.isActive ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Drag Handle */}
              <div className="cursor-move">
                <GripVertical className={`w-5 h-5 ${mutedColor}`} />
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: category.color + '20' }}
              >
                <RenderIcon name={category.icon} className="w-6 h-6" style={{ color: category.color }} />
              </div>

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className={`font-semibold ${textColor}`}>{category.name}</h3>
                  {category.isActive ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                      Inactive
                    </Badge>
                  )}
                  <span className={`text-xs ${mutedColor}`}>Order: {category.order}</span>
                </div>
                <p className={`text-sm ${mutedColor} truncate`}>
                  {category.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    category.isActive
                      ? 'text-green-400 hover:bg-green-500/10'
                      : 'text-gray-500 hover:bg-gray-500/10'
                  }`}
                  title={category.isActive ? 'Deactivate' : 'Activate'}
                >
                  {category.isActive ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                  className="text-red-400 border-red-500/20 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className={mutedColor}>No categories found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancel}
        >
          <Card
            className={`${cardBg} p-6 max-w-lg w-full`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl ${textColor}`}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button onClick={handleCancel} className={mutedColor}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className={`block text-sm font-medium ${mutedColor} mb-2`}>
                  Category Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Customer Service"
                  className={inputBg}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium ${mutedColor} mb-2`}>
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category..."
                  className={inputBg}
                  rows={3}
                />
              </div>

              {/* Icon */}
              <div>
                <label className={`block text-sm font-medium ${mutedColor} mb-2`}>
                  Icon - Click to browse 1000+ icons
                </label>
                <button
                  type="button"
                  onClick={() => setShowIconLibrary(true)}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    theme === 'dark'
                      ? 'border-white/10 hover:border-white/20 bg-[#0E0E1F]'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: formData.color + '20' }}
                  >
                    <RenderIcon name={formData.icon} className="w-6 h-6" style={{ color: formData.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm ${textColor}`}>{formData.icon}</p>
                    <p className={`text-xs ${mutedColor}`}>Click to change icon</p>
                  </div>
                  <Wand2 className={`w-5 h-5 ${mutedColor}`} />
                </button>
              </div>

              {/* Color */}
              <div>
                <label className={`block text-sm font-medium ${mutedColor} mb-2`}>
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-full h-10 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? 'border-white scale-110'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]"
                  onClick={handleSubmit}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

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