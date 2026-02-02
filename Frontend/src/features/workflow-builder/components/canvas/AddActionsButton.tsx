/**
 * Add Actions Button Component
 * Reusable button for adding nodes/triggers/tools to containers
 */

import React from 'react';
import { Plus, Box, Zap, Wrench } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useUIStore } from '../../stores/uiStore';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';

interface AddActionsButtonProps {
  containerId: string;
  isSubStep?: boolean;
}

export function AddActionsButton({ containerId, isSubStep = false }: AddActionsButtonProps) {
  const { theme } = useTheme();
  const { openNodePicker } = useUIStore();

  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`w-full border-2 border-dashed ${borderColor} rounded-lg p-3 text-sm ${textSecondary} hover:border-[#00C6FF]/50 hover:text-[#00C6FF] transition-all flex items-center justify-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          Add Actions
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`w-64 ${theme === 'dark' ? 'bg-[#1A1A2E] border-white/10' : 'bg-white border-gray-200'}`}
        align="center"
      >
        <DropdownMenuLabel className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
          Choose Action Type
        </DropdownMenuLabel>
        <DropdownMenuSeparator className={theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} />

        {/* Add Node */}
        <DropdownMenuItem
          onClick={() => openNodePicker(isSubStep ? 'substep' : 'step', containerId)}
          className={`flex items-center gap-3 cursor-pointer ${
            theme === 'dark'
              ? 'hover:bg-[#00C6FF]/10 focus:bg-[#00C6FF]/10 text-[#CFCFE8]'
              : 'hover:bg-gray-100 focus:bg-gray-100 text-gray-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C6FF] to-[#0099CC] flex items-center justify-center">
            <Box className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Add Node
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Logic, actions, and integrations
            </div>
          </div>
        </DropdownMenuItem>

        {/* Add Trigger */}
        <DropdownMenuItem
          onClick={() => openNodePicker('trigger')}
          className={`flex items-center gap-3 cursor-pointer ${
            theme === 'dark'
              ? 'hover:bg-[#9D50BB]/10 focus:bg-[#9D50BB]/10 text-[#CFCFE8]'
              : 'hover:bg-gray-100 focus:bg-gray-100 text-gray-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9D50BB] to-[#7D3A99] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Add Trigger
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Schedule, webhook, or event
            </div>
          </div>
        </DropdownMenuItem>

        {/* Add Tool */}
        <DropdownMenuItem
          onClick={() => openNodePicker('tool')}
          className={`flex items-center gap-3 cursor-pointer ${
            theme === 'dark'
              ? 'hover:bg-[#00C6FF]/10 focus:bg-[#00C6FF]/10 text-[#CFCFE8]'
              : 'hover:bg-gray-100 focus:bg-gray-100 text-gray-700'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#CC5555] flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Add Tool
            </div>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              External tools and APIs
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
