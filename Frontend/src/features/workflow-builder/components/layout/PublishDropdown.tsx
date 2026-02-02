/**
 * Publish Dropdown Component
 * Provides options to save/publish workflows in different modes
 */

import React, { useState } from 'react';
import { ChevronDown, Globe, FileText, Save, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useUIStore } from '../../stores/uiStore';
import { useWorkflowRegistryStore } from '@/core/stores/core/workflowRegistryStore';
import { useAuthStore } from '@/core/stores/core/authStore';
import { useUserStore } from '@/core/stores/core/userStore';

interface PublishDropdownProps {
  onPublishPublic?: () => void;
  onPublishTemplate?: () => void;
  onSavePersonal?: () => void;
  workflowId?: string; // If editing existing workflow
}

export function PublishDropdown({ 
  onPublishPublic, 
  onPublishTemplate, 
  onSavePersonal,
  workflowId 
}: PublishDropdownProps) {
  const { theme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const workflowState = useWorkflowStore();
  const workflowRegistry = useWorkflowRegistryStore();
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const { openEditWorkflow, setIsPublishDropdownOpen } = useUIStore();

  const handlePublishPublic = () => {
    console.log('Opening workflow settings before publishing as Public');
    openEditWorkflow();
    onPublishPublic?.();
  };

  const handlePublishTemplate = () => {
    console.log('Opening workflow settings before publishing as Template');
    openEditWorkflow();
    onPublishTemplate?.();
  };

  const handleSavePersonal = () => {
    console.log('Opening workflow settings before saving as Personal');
    openEditWorkflow();
    onSavePersonal?.();
  };

  const hasChanges = 
    workflowState.triggers.length > 0 || 
    workflowState.containers.some(c => c.nodes.length > 0) ||
    workflowState.formFields.length > 0;

  return (
    <DropdownMenu onOpenChange={(open) => {
      setIsOpen(open);
      setIsPublishDropdownOpen(open);
    }}>
      <DropdownMenuTrigger asChild>
        <Button 
          className={`px-6 py-2 ${
            justSaved
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gradient-to-r from-[#00C6FF] to-[#9D50BB]'
          } text-white hover:opacity-90 transition-opacity flex items-center gap-2`}
        >
          {justSaved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              Publish
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={`w-56 ${theme === 'dark' ? 'bg-[#1A1A2E] border-[#2A2A3E]' : 'bg-white border-gray-200'}`}
      >
        <DropdownMenuItem 
          onClick={handlePublishPublic}
          className="cursor-pointer flex items-center gap-3 py-2.5"
        >
          <Globe className="w-4 h-4 text-blue-400" />
          <div className="flex flex-col">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Publish as Public
            </span>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Share with everyone
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handlePublishTemplate}
          className="cursor-pointer flex items-center gap-3 py-2.5"
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <div className="flex flex-col">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              Publish as Template
            </span>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Add to template library
            </span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleSavePersonal}
          disabled={!hasChanges || isSaving}
          className="cursor-pointer flex items-center gap-3 py-2.5"
        >
          <Save className="w-4 h-4 text-green-400" />
          <div className="flex flex-col">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
              {isSaving ? 'Saving...' : workflowId ? 'Update Personal' : 'Save as Personal'}
            </span>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Save to your workflows
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}