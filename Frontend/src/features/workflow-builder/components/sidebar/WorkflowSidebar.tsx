/**
 * Workflow Sidebar Component
 * Phase 2 - Component Extraction
 * 
 * Left panel containing triggers, nodes, tools, and form fields
 */

import { ChevronLeft, ChevronRight, Zap, Box, Wrench, FileText } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { useUIStore, useWorkflowStore } from '../../stores';
import { SidebarTabs } from './SidebarTabs';
import { TriggersList } from './TriggersList';
import { NodesList } from './NodesList';
import { ToolsList } from './ToolsList';

export function WorkflowSidebar() {
  const { theme } = useTheme();
  const { isLeftPanelMinimized, leftPanelView, toggleLeftPanel, setLeftPanelView, expandLeftPanel } = useUIStore();
  const { triggers } = useWorkflowStore();

  // Theme colors
  const panelBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';

  // Check if form trigger exists
  const hasFormTrigger = () => triggers.some(t => t.type === 'form');

  return (
    <div className={`${panelBg} border-r ${borderColor} ${isLeftPanelMinimized ? 'w-20' : 'w-80'} transition-all flex flex-col`}>
      {/* Panel Header */}
      <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
        {!isLeftPanelMinimized && <SidebarTabs />}
        
        <button
          onClick={toggleLeftPanel}
          className="p-1.5 hover:bg-gray-700/20 rounded transition-colors"
          title={isLeftPanelMinimized ? 'Expand sidebar' : 'Minimize sidebar'}
        >
          {isLeftPanelMinimized ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLeftPanelMinimized ? (
          // Minimized view - icon buttons
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => { 
                expandLeftPanel(); 
                setLeftPanelView('triggers'); 
              }} 
              className="flex flex-col items-center gap-1 hover:bg-white/5 p-2 rounded transition-colors"
              title="Triggers"
            >
              <Zap className="w-6 h-6 text-[#00C6FF]" />
              <span className={`text-xs ${textSecondary}`}>Triggers</span>
            </button>

            <button 
              onClick={() => { 
                expandLeftPanel(); 
                setLeftPanelView('nodes'); 
              }} 
              className="flex flex-col items-center gap-1 hover:bg-white/5 p-2 rounded transition-colors"
              title="Nodes"
            >
              <Box className="w-6 h-6 text-[#9D50BB]" />
              <span className={`text-xs ${textSecondary}`}>Nodes</span>
            </button>

            <button 
              onClick={() => { 
                expandLeftPanel(); 
                setLeftPanelView('tools'); 
              }} 
              className="flex flex-col items-center gap-1 hover:bg-white/5 p-2 rounded transition-colors"
              title="Tools"
            >
              <Wrench className="w-6 h-6 text-[#00C6FF]" />
              <span className={`text-xs ${textSecondary}`}>Tools</span>
            </button>

            <button 
              onClick={() => { 
                expandLeftPanel(); 
                setLeftPanelView('formfields'); 
              }} 
              className="flex flex-col items-center gap-1 hover:bg-white/5 p-2 rounded transition-colors"
              disabled={!hasFormTrigger()}
              title={!hasFormTrigger() ? 'Add a Form Submit Trigger first' : 'Manage form fields'}
            >
              <FileText className={`w-6 h-6 ${hasFormTrigger() ? 'text-[#9D50BB]' : 'text-gray-500'}`} />
              <span className={`text-xs ${textSecondary}`}>Fields</span>
            </button>
          </div>
        ) : (
          // Expanded view - full content
          <>
            {leftPanelView === 'triggers' && <TriggersList />}
            {leftPanelView === 'nodes' && <NodesList />}
            {leftPanelView === 'tools' && <ToolsList />}
            {leftPanelView === 'formfields' && (
              <div className={`p-4 text-center ${textSecondary} text-sm`}>
                Form Fields panel - Coming soon
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
