/**
 * Templates Dropdown Component
 * Provides options to Import and Export workflows
 */

import React, { useRef } from 'react';
import { ChevronDown, Download, Upload, Sparkles, FileJson } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useUIStore } from '../../stores/uiStore';
import { useTemplateStore } from '../../../templates';
import { 
  exportWorkflowAsJSON, 
  importAndLoadWorkflow 
} from '../../utils/workflowManager';

interface TemplatesDropdownProps {
  workflowId?: string;
}

export function TemplatesDropdown({ workflowId }: TemplatesDropdownProps) {
  const { theme } = useTheme();
  const workflowState = useWorkflowStore();
  const { showNotification } = useUIStore();
  const { openTemplateLibrary } = useTemplateStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Export current workflow as JSON
   * Using centralized utility
   */
  const handleExport = () => {
    exportWorkflowAsJSON();
  };

  /**
   * Open Template Library - Browse templates
   */
  const handleBrowseTemplates = () => {
    openTemplateLibrary();
  };

  /**
   * Import workflow from JSON file directly
   */
  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file selection for JSON import
   * Using centralized utility
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Use centralized import function
    await importAndLoadWorkflow(file);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline"
            className={`border ${
              theme === 'dark' 
                ? 'border-blue-500/30 bg-[#0E0E1F] hover:bg-white/5' 
                : 'border-blue-300 bg-gray-50 hover:bg-gray-200'
            } flex items-center gap-2 text-blue-400`}
          >
            <span className="text-xl">✨</span>
            <span>Templates</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className={`w-56 ${theme === 'dark' ? 'bg-[#1A1A2E] border-[#2A2A3E]' : 'bg-white border-gray-200'}`}
        >
          <DropdownMenuItem 
            onClick={handleBrowseTemplates}
            className="cursor-pointer flex items-center gap-3 py-2.5"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <div className="flex flex-col">
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Browse Templates
              </span>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Explore pre-built workflows
              </span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleImportJSON}
            className="cursor-pointer flex items-center gap-3 py-2.5"
          >
            <FileJson className="w-4 h-4 text-blue-400" />
            <div className="flex flex-col">
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Import JSON
              </span>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Upload JSON file
              </span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleExport}
            className="cursor-pointer flex items-center gap-3 py-2.5"
          >
            <Download className="w-4 h-4 text-green-400" />
            <div className="flex flex-col">
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Export
              </span>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Download as JSON
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
    </>
  );
}