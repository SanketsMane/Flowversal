/**
 * Sidebar Tabs Component
 * Phase 2 - Component Extraction
 * 
 * Tab navigation for sidebar (Triggers, Nodes, Tools, Fields)
 */

import { Zap, Box, Wrench, FileText } from 'lucide-react';
import { useTheme } from '../../../../components/ThemeContext';
import { useUIStore, useWorkflowStore } from '../../stores';
import { LeftPanelView } from '../../types';

export function SidebarTabs() {
  const { theme } = useTheme();
  const { leftPanelView, setLeftPanelView } = useUIStore();
  const { triggers } = useWorkflowStore();

  // Theme colors
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

  // Check if form trigger exists
  const hasFormTrigger = () => triggers.some(t => t.type === 'form');

  const tabs: Array<{
    view: LeftPanelView;
    icon: typeof Zap;
    label: string;
    disabled?: boolean;
    title?: string;
  }> = [
    {
      view: 'triggers',
      icon: Zap,
      label: 'Triggers',
    },
    {
      view: 'nodes',
      icon: Box,
      label: 'Nodes',
    },
    {
      view: 'tools',
      icon: Wrench,
      label: 'Tools',
    },
    {
      view: 'formfields',
      icon: FileText,
      label: 'Fields',
      disabled: !hasFormTrigger(),
      title: !hasFormTrigger() ? 'Add a Form Submit Trigger first' : 'Manage form fields',
    },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map(({ view, icon: Icon, label, disabled, title }) => (
        <button
          key={view}
          onClick={() => setLeftPanelView(view)}
          disabled={disabled}
          title={title}
          className={`
            px-3 py-1.5 rounded text-sm transition-all
            ${leftPanelView === view 
              ? 'bg-gradient-to-r from-[#00C6FF]/20 to-[#9D50BB]/20 text-[#00C6FF]' 
              : textColor
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5'}
          `}
        >
          <Icon className="w-4 h-4 inline mr-1" />
          {label}
        </button>
      ))}
    </div>
  );
}
