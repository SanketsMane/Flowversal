# Frontend Development Guide

## Overview

This guide covers the frontend architecture, development patterns, and best practices for the FlowversalAI platform. The frontend follows a component-based architecture built with React, TypeScript, and modern development tools.

## Architecture Overview

### Core Principles

- **Component-Based**: Everything is a component with clear boundaries
- **Feature-Driven**: Code is organized around business features
- **Type Safety**: Comprehensive TypeScript coverage throughout
- **State Management**: Predictable state management with Zustand
- **Performance**: Optimized rendering with React best practices
- **Accessibility**: WCAG compliant components

### Feature Structure

Every frontend feature follows this consistent structure:

```
features/{feature}/
├── components/             # React components
│   ├── {Feature}.tsx          # Main feature component
│   ├── {SubFeature}/          # Sub-feature components
│   │   ├── index.ts          # Component exports
│   │   └── {SubFeature}.tsx  # Sub-component implementations
│   ├── modals/               # Modal components
│   │   ├── {ModalName}.tsx   # Modal implementations
│   │   └── index.ts          # Modal exports
│   ├── hooks/                # Feature-specific hooks
│   │   └── use{Feature}.ts   # Custom hooks
│   └── types/                # Component-specific types
│       └── {feature}.types.ts # Type definitions
├── store/                  # Feature state management
│   ├── {feature}Store.ts      # Zustand store
│   └── types/               # Store types
├── utils/                  # Feature utilities
│   ├── {feature}Utils.ts      # Utility functions
│   ├── constants.ts         # Feature constants
│   └── index.ts             # Utility exports
├── types/                  # Feature-level types
│   ├── index.ts             # Type exports
│   └── {feature}.types.ts   # Feature type definitions
├── data/                   # Static data and configurations
│   ├── {feature}Data.ts       # Static data
│   └── index.ts             # Data exports
└── index.ts               # Feature exports
```

## Creating a New Feature

### Step 1: Create Feature Structure

```bash
# Create feature directory and subdirectories
mkdir -p features/{your-feature}/{components,store,utils,types,data}

# Create component subdirectories
mkdir -p features/{your-feature}/components/{modals,hooks,types}

# Create store subdirectories
mkdir -p features/{your-feature}/store/types
```

### Step 2: Define Types

Create `features/{your-feature}/types/{your-feature}.types.ts`:

```typescript
// Data transfer objects
export interface YourFeature {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateYourFeatureData {
  name: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateYourFeatureData {
  id: string;
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'draft';
  metadata?: Record<string, any>;
}

export interface YourFeatureFilters {
  status?: 'active' | 'inactive' | 'draft';
  search?: string;
  limit?: number;
  offset?: number;
}

// Component props
export interface YourFeatureCardProps {
  feature: YourFeature;
  onEdit: (feature: YourFeature) => void;
  onDelete: (id: string) => void;
  theme: 'dark' | 'light';
}

export interface YourFeatureFormProps {
  initialData?: Partial<CreateYourFeatureData>;
  onSubmit: (data: CreateYourFeatureData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  theme: 'dark' | 'light';
}

// Store state
export interface YourFeatureState {
  features: YourFeature[];
  selectedFeature: YourFeature | null;
  filters: YourFeatureFilters;
  isLoading: boolean;
  error: string | null;
}

// Store actions
export interface YourFeatureActions {
  loadFeatures: (filters?: YourFeatureFilters) => Promise<void>;
  createFeature: (data: CreateYourFeatureData) => Promise<YourFeature>;
  updateFeature: (data: UpdateYourFeatureData) => Promise<YourFeature>;
  deleteFeature: (id: string) => Promise<void>;
  setSelectedFeature: (feature: YourFeature | null) => void;
  setFilters: (filters: YourFeatureFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
```

### Step 3: Create Zustand Store

Create `features/{your-feature}/store/{your-feature}Store.ts`:

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { YourFeatureState, YourFeatureActions, YourFeature, CreateYourFeatureData, UpdateYourFeatureData, YourFeatureFilters } from '../types/your-feature.types';
import { yourFeatureApi } from '../../api/your-feature.api';

type YourFeatureStore = YourFeatureState & YourFeatureActions;

export const useYourFeatureStore = create<YourFeatureStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        features: [],
        selectedFeature: null,
        filters: {
          status: 'active',
          limit: 20,
          offset: 0
        },
        isLoading: false,
        error: null,

        // Actions
        loadFeatures: async (filters) => {
          set({ isLoading: true, error: null });

          try {
            const appliedFilters = { ...get().filters, ...filters };
            const features = await yourFeatureApi.getFeatures(appliedFilters);

            set({
              features,
              filters: appliedFilters,
              isLoading: false
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to load features',
              isLoading: false
            });
          }
        },

        createFeature: async (data) => {
          set({ isLoading: true, error: null });

          try {
            const newFeature = await yourFeatureApi.createFeature(data);
            const features = [...get().features, newFeature];

            set({
              features,
              selectedFeature: newFeature,
              isLoading: false
            });

            return newFeature;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create feature';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
          }
        },

        updateFeature: async (data) => {
          set({ isLoading: true, error: null });

          try {
            const updatedFeature = await yourFeatureApi.updateFeature(data);
            const features = get().features.map(feature =>
              feature.id === data.id ? updatedFeature : feature
            );

            set({
              features,
              selectedFeature: updatedFeature,
              isLoading: false
            });

            return updatedFeature;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update feature';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
          }
        },

        deleteFeature: async (id) => {
          set({ isLoading: true, error: null });

          try {
            await yourFeatureApi.deleteFeature(id);
            const features = get().features.filter(feature => feature.id !== id);

            set({
              features,
              selectedFeature: get().selectedFeature?.id === id ? null : get().selectedFeature,
              isLoading: false
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete feature';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
          }
        },

        setSelectedFeature: (feature) => {
          set({ selectedFeature: feature });
        },

        setFilters: (filters) => {
          set({ filters: { ...get().filters, ...filters } });
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setError: (error) => {
          set({ error });
        }
      }),
      {
        name: 'your-feature-store',
        partialize: (state) => ({
          filters: state.filters,
          selectedFeature: state.selectedFeature
        })
      }
    ),
    {
      name: 'your-feature-store'
    }
  )
);
```

### Step 4: Create API Layer

Create `features/{your-feature}/api/{your-feature}.api.ts`:

```typescript
import { apiClient } from '../../../core/api/apiClient';
import { YourFeature, CreateYourFeatureData, UpdateYourFeatureData, YourFeatureFilters } from '../types/your-feature.types';

export class YourFeatureApi {
  private baseUrl = '/api/v1/your-features';

  async getFeatures(filters?: YourFeatureFilters): Promise<YourFeature[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`${this.baseUrl}?${params}`);
    return response.data;
  }

  async getFeature(id: string): Promise<YourFeature> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createFeature(data: CreateYourFeatureData): Promise<YourFeature> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async updateFeature(data: UpdateYourFeatureData): Promise<YourFeature> {
    const response = await apiClient.put(`${this.baseUrl}/${data.id}`, data);
    return response.data;
  }

  async deleteFeature(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const yourFeatureApi = new YourFeatureApi();
```

### Step 5: Create Components

Create `features/{your-feature}/components/YourFeatureCard.tsx`:

```typescript
import React from 'react';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import { YourFeature, YourFeatureCardProps } from '../types/your-feature.types';

export function YourFeatureCard({ feature, onEdit, onDelete, theme }: YourFeatureCardProps) {
  const bgColor = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'draft':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={`${textPrimary} font-medium text-lg mb-1`}>{feature.name}</h3>
          {feature.description && (
            <p className={`${textSecondary} text-sm mb-2`}>{feature.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(feature.status)}`} />
          <span className={`${textSecondary} text-xs capitalize`}>{feature.status}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className={`${textSecondary} text-xs`}>
          Created {new Date(feature.createdAt).toLocaleDateString()}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(feature)}
            className={`${textSecondary} hover:${textPrimary} p-1 rounded transition-colors`}
            title="Edit feature"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(feature.id)}
            className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
            title="Delete feature"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

Create `features/{your-feature}/components/YourFeatureList.tsx`:

```typescript
import React, { useEffect } from 'react';
import { useYourFeatureStore } from '../store/your-featureStore';
import { YourFeatureCard } from './YourFeatureCard';
import { useTheme } from '../../../core/theme/ThemeContext';

export function YourFeatureList() {
  const { theme } = useTheme();
  const {
    features,
    isLoading,
    error,
    loadFeatures,
    deleteFeature,
    setSelectedFeature
  } = useYourFeatureStore();

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleEdit = (feature: any) => {
    setSelectedFeature(feature);
    // Open edit modal or navigate to edit page
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        await deleteFeature(id);
      } catch (error) {
        // Error handled by store
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error loading features</div>
        <div className="text-gray-600 text-sm">{error}</div>
        <button
          onClick={() => loadFeatures()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-2">No features found</div>
        <div className="text-gray-400 text-sm">Create your first feature to get started</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map(feature => (
        <YourFeatureCard
          key={feature.id}
          feature={feature}
          onEdit={handleEdit}
          onDelete={handleDelete}
          theme={theme}
        />
      ))}
    </div>
  );
}
```

### Step 6: Create Custom Hooks

Create `features/{your-feature}/components/hooks/useYourFeatureForm.ts`:

```typescript
import { useState, useCallback } from 'react';
import { useYourFeatureStore } from '../store/your-featureStore';
import { CreateYourFeatureData } from '../types/your-feature.types';

interface UseYourFeatureFormOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useYourFeatureForm(options: UseYourFeatureFormOptions = {}) {
  const { onSuccess, onError } = options;
  const { createFeature, updateFeature, isLoading } = useYourFeatureStore();

  const [formData, setFormData] = useState<Partial<CreateYourFeatureData>>({
    name: '',
    description: '',
    metadata: {}
  });

  const updateField = useCallback((field: keyof CreateYourFeatureData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      metadata: {}
    });
  }, []);

  const submitForm = useCallback(async (isEdit = false, featureId?: string) => {
    try {
      if (!formData.name?.trim()) {
        throw new Error('Name is required');
      }

      if (isEdit && featureId) {
        await updateFeature({
          id: featureId,
          ...formData
        });
      } else {
        await createFeature(formData as CreateYourFeatureData);
      }

      resetForm();
      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
    }
  }, [formData, createFeature, updateFeature, resetForm, onSuccess, onError]);

  return {
    formData,
    updateField,
    submitForm,
    resetForm,
    isLoading
  };
}
```

### Step 7: Create Main Feature Component

Create `features/{your-feature}/components/YourFeature.tsx`:

```typescript
import React from 'react';
import { Plus } from 'lucide-react';
import { YourFeatureList } from './YourFeatureList';
import { YourFeatureForm } from './modals/YourFeatureForm';
import { useYourFeatureStore } from '../store/your-featureStore';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Button } from '../../../shared/components/ui/button';

export function YourFeature() {
  const { theme } = useTheme();
  const { selectedFeature, setSelectedFeature } = useYourFeatureStore();
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const handleCreateClick = () => {
    setSelectedFeature(null);
    setShowCreateForm(true);
  };

  const handleEditClick = () => {
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setSelectedFeature(null);
  };

  const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`min-h-screen ${bgColor} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`${textPrimary} text-3xl font-bold mb-2`}>Your Features</h1>
            <p className={`${textPrimary} opacity-70`}>
              Manage and organize your features
            </p>
          </div>

          <Button
            onClick={handleCreateClick}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Feature
          </Button>
        </div>

        {/* Feature List */}
        <YourFeatureList />

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <YourFeatureForm
            onClose={handleFormClose}
            initialData={selectedFeature || undefined}
          />
        )}
      </div>
    </div>
  );
}
```

### Step 8: Create Form Modal

Create `features/{your-feature}/components/modals/YourFeatureForm.tsx`:

```typescript
import React from 'react';
import { X } from 'lucide-react';
import { useYourFeatureForm } from '../hooks/useYourFeatureForm';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Button } from '../../../../shared/components/ui/button';
import { Input } from '../../../../shared/components/ui/input';
import { Textarea } from '../../../../shared/components/ui/textarea';

interface YourFeatureFormProps {
  onClose: () => void;
  initialData?: any;
}

export function YourFeatureForm({ onClose, initialData }: YourFeatureFormProps) {
  const { theme } = useTheme();
  const isEdit = !!initialData;

  const {
    formData,
    updateField,
    submitForm,
    isLoading
  } = useYourFeatureForm({
    onSuccess: onClose,
    onError: (error) => {
      // Could show toast notification here
      console.error('Form submission error:', error);
    }
  });

  // Initialize form with existing data if editing
  React.useEffect(() => {
    if (initialData) {
      updateField('name', initialData.name || '');
      updateField('description', initialData.description || '');
      updateField('metadata', initialData.metadata || {});
    }
  }, [initialData, updateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(isEdit, initialData?.id);
  };

  const bgModal = theme === 'dark' ? 'bg-black/70' : 'bg-black/50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`${bgModal} absolute inset-0`}
        onClick={onClose}
      />

      <div className={`${bgCard} border ${borderColor} rounded-lg shadow-xl w-full max-w-md relative`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className={`${textPrimary} text-xl font-semibold`}>
            {isEdit ? 'Edit Feature' : 'Create Feature'}
          </h2>
          <button
            onClick={onClose}
            className={`${textPrimary} hover:opacity-70 transition-opacity`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block ${textPrimary} text-sm font-medium mb-2`}>
              Name *
            </label>
            <Input
              type="text"
              value={formData.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter feature name"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className={`block ${textPrimary} text-sm font-medium mb-2`}>
              Description
            </label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Enter feature description"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name?.trim()}
            >
              {isLoading ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### Step 9: Create Feature Index

Create `features/{your-feature}/index.ts`:

```typescript
export { YourFeature } from './components/YourFeature';
export { YourFeatureList } from './components/YourFeatureList';
export { YourFeatureCard } from './components/YourFeatureCard';
export { useYourFeatureStore } from './store/your-featureStore';
export { yourFeatureApi } from './api/your-feature.api';
export * from './types/your-feature.types';
```

### Step 10: Add Tests

Create `features/{your-feature}/components/__tests__/YourFeatureCard.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { YourFeatureCard } from '../YourFeatureCard';

const mockFeature = {
  id: '1',
  name: 'Test Feature',
  description: 'Test description',
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockProps = {
  feature: mockFeature,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  theme: 'light' as const
};

describe('YourFeatureCard', () => {
  it('renders feature information correctly', () => {
    render(<YourFeatureCard {...mockProps} />);

    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<YourFeatureCard {...mockProps} />);

    const editButton = screen.getByTitle('Edit feature');
    fireEvent.click(editButton);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockFeature);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<YourFeatureCard {...mockProps} />);

    const deleteButton = screen.getByTitle('Delete feature');
    fireEvent.click(deleteButton);

    expect(mockProps.onDelete).toHaveBeenCalledWith('1');
  });
});
```

## Component Patterns

### Presentational vs Container Components

```typescript
// ✅ Good - Presentational component (pure, reusable)
interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

export function UserAvatar({ user, size = 'md', showStatus = false }: UserAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="relative">
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-full`}
      />
      {showStatus && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}

// ✅ Good - Container component (handles data and state)
export function UserProfile() {
  const { user, isLoading } = useUserStore();

  if (isLoading) return <UserAvatarSkeleton />;
  if (!user) return <div>User not found</div>;

  return (
    <div className="flex items-center gap-4">
      <UserAvatar user={user} size="lg" showStatus />
      <div>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
      </div>
    </div>
  );
}
```

### Custom Hooks for Logic Reuse

```typescript
// ✅ Good - Custom hook for form logic
export function useFormField(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    if (error && touched) {
      setError(validateField(newValue));
    }
  }, [error, touched]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    setError(validateField(value));
  }, [value]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    handleChange,
    handleBlur,
    reset,
    isValid: !error
  };
}

// ❌ Bad - Logic scattered in component
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Repeated validation logic...
}
```

### Compound Components Pattern

```typescript
// ✅ Good - Compound component pattern
interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface TabListProps {
  children: React.ReactNode;
}

interface TabProps {
  value: string;
  children: React.ReactNode;
}

interface TabContentProps {
  value: string;
  children: React.ReactNode;
}

function Tabs({ children, defaultValue, onValueChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      {children}
    </TabsContext.Provider>
  );
}

function TabList({ children }: TabListProps) {
  return <div className="flex border-b">{children}</div>;
}

function Tab({ value, children }: TabProps) {
  const { activeTab, onTabChange } = useContext(TabsContext);

  return (
    <button
      onClick={() => onTabChange(value)}
      className={`px-4 py-2 ${activeTab === value ? 'border-b-2 border-blue-500' : ''}`}
    >
      {children}
    </button>
  );
}

function TabContent({ value, children }: TabContentProps) {
  const { activeTab } = useContext(TabsContext);

  if (activeTab !== value) return null;
  return <div>{children}</div>;
}

// Usage
<Tabs defaultValue="profile">
  <TabList>
    <Tab value="profile">Profile</Tab>
    <Tab value="settings">Settings</Tab>
  </TabList>

  <TabContent value="profile">
    <ProfileForm />
  </TabContent>

  <TabContent value="settings">
    <SettingsForm />
  </TabContent>
</Tabs>
```

## State Management Patterns

### Zustand Store Patterns

```typescript
// ✅ Good - Action-based store
interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  isLoading: boolean;
  error: string | null;
}

interface TodoActions {
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => Promise<void>;
  setFilter: (filter: TodoState['filter']) => void;
  loadTodos: () => Promise<void>;
}

const useTodoStore = create<TodoState & TodoActions>((set, get) => ({
  // State
  todos: [],
  filter: 'all',
  isLoading: false,
  error: null,

  // Actions
  addTodo: async (text) => {
    set({ isLoading: true });
    try {
      const newTodo = await todoApi.create(text);
      set(state => ({ todos: [...state.todos, newTodo], isLoading: false }));
    } catch (error) {
      set({ error: 'Failed to add todo', isLoading: false });
    }
  },

  // More actions...
}));

// ❌ Bad - Direct state mutations
const useBadStore = create((set) => ({
  todos: [],

  addTodo: (text: string) => {
    // Direct mutation - hard to track
    set(state => {
      state.todos.push({ id: Date.now(), text, completed: false });
    });
  }
}));
```

### Computed Values and Selectors

```typescript
// ✅ Good - Computed values in store
const useTodoStore = create((set, get) => ({
  todos: [],

  // Computed: filtered todos
  get filteredTodos() {
    const { todos, filter } = get();
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  },

  // Computed: stats
  get stats() {
    const { todos } = get();
    return {
      total: todos.length,
      active: todos.filter(t => !t.completed).length,
      completed: todos.filter(t => t.completed).length
    };
  }
}));

// Usage in component
function TodoStats() {
  const stats = useTodoStore(state => state.stats);

  return (
    <div>
      Total: {stats.total}, Active: {stats.active}, Completed: {stats.completed}
    </div>
  );
}
```

## Performance Optimization

### React.memo for Component Memoization

```typescript
// ✅ Good - Memoize expensive components
interface ExpensiveListProps {
  items: Item[];
  onItemClick: (item: Item) => void;
}

const ExpensiveListItem = React.memo(({ item, onClick }: { item: Item; onClick: () => void }) => {
  // Expensive rendering logic
  return <div onClick={onClick}>{item.name}</div>;
});

export const ExpensiveList = React.memo<ExpensiveListProps>(({ items, onItemClick }) => {
  return (
    <div>
      {items.map(item => (
        <ExpensiveListItem
          key={item.id}
          item={item}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
});
```

### useMemo and useCallback

```typescript
// ✅ Good - Memoize expensive calculations
function UserList({ users, filter }: UserListProps) {
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [users, filter]);

  const handleUserClick = useCallback((userId: string) => {
    // Handle click
  }, []);

  return (
    <div>
      {filteredUsers.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onClick={() => handleUserClick(user.id)}
        />
      ))}
    </div>
  );
}
```

### Code Splitting and Lazy Loading

```typescript
// ✅ Good - Lazy load feature components
const LazyWorkflowBuilder = lazy(() => import('../features/workflows/WorkflowBuilder'));
const LazyTemplateLibrary = lazy(() => import('../features/templates/TemplateLibrary'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/workflows" element={<LazyWorkflowBuilder />} />
        <Route path="/templates" element={<LazyTemplateLibrary />} />
      </Routes>
    </Suspense>
  );
}
```

## Testing Strategies

### Component Testing with Testing Library

```typescript
// ✅ Good - Test user interactions
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoList } from './TodoList';

describe('TodoList', () => {
  it('allows users to add new todos', async () => {
    render(<TodoList />);

    const input = screen.getByPlaceholderText('Add a new todo');
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(input, { target: { value: 'Buy groceries' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
  });

  it('marks todos as complete', () => {
    render(<TodoList />);

    const todoItem = screen.getByText('Buy groceries');
    const checkbox = screen.getByRole('checkbox');

    fireEvent.click(checkbox);

    expect(todoItem).toHaveClass('line-through');
  });
});
```

### Custom Hook Testing

```typescript
// ✅ Good - Test custom hooks with @testing-library/react-hooks
import { renderHook, act } from '@testing-library/react-hooks';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('decrements counter', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });
});
```

### Store Testing

```typescript
// ✅ Good - Test Zustand stores
import { act, renderHook } from '@testing-library/react';
import { useTodoStore } from './todoStore';

describe('TodoStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTodoStore.setState({
      todos: [],
      filter: 'all',
      isLoading: false,
      error: null
    });
  });

  it('adds a new todo', () => {
    const { result } = renderHook(() => useTodoStore());

    act(() => {
      result.current.addTodo('Test todo');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Test todo');
  });
});
```

## Accessibility (a11y)

### Semantic HTML

```typescript
// ✅ Good - Semantic HTML
function Navigation() {
  return (
    <nav aria-label="Main navigation">
      <ul role="menubar">
        <li role="none">
          <a role="menuitem" href="/dashboard">Dashboard</a>
        </li>
        <li role="none">
          <a role="menuitem" href="/settings">Settings</a>
        </li>
      </ul>
    </nav>
  );
}

// ❌ Bad - Div soup
function BadNavigation() {
  return (
    <div>
      <div>
        <div>Dashboard</div>
        <div>Settings</div>
      </div>
    </div>
  );
}
```

### ARIA Labels and Roles

```typescript
// ✅ Good - Proper ARIA usage
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal-content">
        <header>
          <h2 id="modal-title">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
```

### Keyboard Navigation

```typescript
// ✅ Good - Keyboard accessible components
function DropdownMenu({ items, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev =>
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect(items[focusedIndex]);
        setIsOpen(false);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        Select option
      </button>

      {isOpen && (
        <ul role="listbox">
          {items.map((item, index) => (
            <li
              key={item.id}
              role="option"
              aria-selected={focusedIndex === index}
              tabIndex={focusedIndex === index ? 0 : -1}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Conclusion

Following this frontend development guide ensures:

- **Maintainable**: Feature-based organization with clear boundaries
- **Performant**: Optimized rendering and state management
- **Accessible**: WCAG compliant components
- **Testable**: Components designed for easy testing
- **Scalable**: Modular architecture that grows with your app
- **Consistent**: Standardized patterns across the codebase

Remember to always prioritize user experience, performance, and accessibility when building components. The patterns shown here provide a solid foundation for building robust, maintainable React applications.
