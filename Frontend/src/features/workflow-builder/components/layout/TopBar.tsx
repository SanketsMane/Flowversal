/**
 * Top Bar Component
 * Phase 2 - Component Extraction
 * 
 * Header with workflow title, theme toggle, and action buttons
 */
import { X, Eye, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/core/theme/ThemeContext';
import { useWorkflowStore, useUIStore } from '../../stores';
import { Button } from '../../../../components/ui/button';
import { RunWorkflowButton } from './RunWorkflowButton';
import { PublishDropdown } from './PublishDropdown';
import { TemplatesDropdown } from './TemplatesDropdown';
interface TopBarProps {
  onClose: () => void;
  onPreview: () => void;
  onPublish: () => void;
  workflowId?: string; // Add workflowId prop
}
export function TopBar({ onClose, onPreview, onPublish, workflowId }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { workflowName, setWorkflowName } = useWorkflowStore();
  const { openCloseConfirm } = useUIStore();
  // Theme colors
  const panelBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-white';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';
  const buttonOutlineBg = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const buttonOutlineText = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-700';
  const buttonOutlineHover = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-200';
  const handleCloseClick = () => {
    // Check if there are unsaved changes
    const hasChanges = useWorkflowStore.getState().triggers.length > 0 || 
                       useWorkflowStore.getState().containers.some(c => c.nodes.length > 0) ||
                       useWorkflowStore.getState().formFields.length > 0;
    if (hasChanges) {
      openCloseConfirm();
    } else {
      onClose();
    }
  };
  return (
    <div className={`${panelBg} border-b ${borderColor} px-6 py-3 flex items-center justify-between`}>
      {/* Left Side - Close & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={handleCloseClick} 
          className={`p-2 rounded-lg ${hoverBg} border ${borderColor} transition-colors`}
          title="Close"
        >
          <X className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
        </button>
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className={`${textPrimary} text-xl bg-transparent border-none outline-none`}
          placeholder="Workflow Name"
        />
      </div>
      {/* Right Side - Actions */}
      <div className="flex items-center gap-3">
        {/* Templates Dropdown */}
        <TemplatesDropdown workflowId={workflowId} />
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg border ${borderColor} ${buttonOutlineBg} ${hoverBg} transition-all`}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700" />
          )}
        </button>
        {/* Preview Button - Icon Only */}
        <button 
          onClick={onPreview} 
          className={`p-2 rounded-lg border ${borderColor} ${buttonOutlineBg} ${buttonOutlineText} ${buttonOutlineHover} transition-all`}
          title="Preview Workflow"
        >
          <Eye className="w-5 h-5" />
        </button>
        {/* Run Button - Icon Only */}
        <RunWorkflowButton iconOnly workflowId={workflowId} />
        {/* Publish Dropdown */}
        <PublishDropdown 
          workflowId={workflowId}
          onPublishPublic={() => {
            onPublish();
          }}
          onPublishTemplate={() => {
            onPublish();
          }}
          onSavePersonal={() => {
            // Handle personal save
          }}
        />
      </div>
    </div>
  );
}