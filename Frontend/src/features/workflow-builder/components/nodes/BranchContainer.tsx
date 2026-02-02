/**
 * Branch Container Component
 * Standalone branch containers rendered outside If/Switch nodes
 * Displays as separate cards with connecting lines
 */

import { useTheme } from '../../../../components/ThemeContext';
import { WorkflowNode, BranchRoute } from '../../types/node.types';
import { useWorkflowStore, useUIStore } from '../../stores';
import { Plus, Settings, X, Workflow } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../../components/ui/button';

interface BranchContainerProps {
  parentNode: WorkflowNode;
  route: BranchRoute;
  containerId: string;
  index: number;
  totalBranches: number;
}

export function BranchContainer({ parentNode, route, containerId, index, totalBranches }: BranchContainerProps) {
  const { theme } = useTheme();
  const { containers, updateNode } = useWorkflowStore();
  const { openNodePicker } = useUIStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-50';

  const branchNodes = parentNode.branches?.find(b => b.id === route.id)?.nodes || [];

  // Branch colors
  const getBranchColor = (type: string) => {
    switch (type) {
      case 'true':
        return {
          badge: 'text-green-500 bg-green-500/10 border-green-500/30',
          gradient: 'from-green-500/5 to-green-500/10',
          line: '#10B981',
        };
      case 'false':
        return {
          badge: 'text-red-500 bg-red-500/10 border-red-500/30',
          gradient: 'from-red-500/5 to-red-500/10',
          line: '#EF4444',
        };
      case 'default':
        return {
          badge: 'text-gray-500 bg-gray-500/10 border-gray-500/30',
          gradient: 'from-gray-500/5 to-gray-500/10',
          line: '#6B7280',
        };
      default:
        return {
          badge: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
          gradient: 'from-blue-500/5 to-blue-500/10',
          line: '#3B82F6',
        };
    }
  };

  const colorConfig = getBranchColor(route.type);

  // Update route action
  const handleUpdateRoute = (action: 'continue' | 'end' | 'goto', targetStepId?: string | null) => {
    const newRoutes = parentNode.routes?.map(r =>
      r.id === route.id
        ? { ...r, action, targetStepId: action === 'goto' ? targetStepId : null }
        : r
    ) || [];
    updateNode(containerId, parentNode.id, { routes: newRoutes });
  };

  // Delete case (for switch cases only)
  const handleDeleteCase = () => {
    if (route.type !== 'case') return;
    
    const confirmed = window.confirm(`Delete ${route.label}?`);
    if (!confirmed) return;

    // Remove route and corresponding branch
    const newRoutes = parentNode.routes?.filter(r => r.id !== route.id) || [];
    const newBranches = parentNode.branches?.filter(b => b.id !== route.id) || [];
    
    updateNode(containerId, parentNode.id, { 
      routes: newRoutes,
      branches: newBranches,
    });
  };

  // Get available steps for "Go to Step" dropdown
  const getAvailableSteps = () => {
    return containers.map((container, index) => ({
      id: container.id,
      label: container.title || `Step ${index + 1}`,
      stepNumber: index + 1,
    }));
  };

  const availableSteps = getAvailableSteps();

  return (
    <div className="relative flex items-start gap-4">
      {/* Connecting Line */}
      <div className="absolute left-0 top-0 w-16 h-8 pointer-events-none">
        <svg width="100%" height="100%" className="overflow-visible">
          <path
            d={`M 0 16 L 64 16`}
            fill="none"
            stroke={colorConfig.line}
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <circle
            cx="64"
            cy="16"
            r="4"
            fill={colorConfig.line}
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Branch Container Card */}
      <div 
        className={`${bgCard} border-2 ${borderColor} rounded-lg overflow-hidden flex flex-col min-h-[180px] w-[280px] ml-16`}
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
      >
        {/* Branch Header */}
        <div className={`p-3 border-b ${borderColor} bg-gradient-to-br ${colorConfig.gradient}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium border ${colorConfig.badge}`}>
              {route.label}
            </span>
            
            <div className="flex items-center gap-1">
              {/* Delete Case Button (for switch cases only) */}
              {route.type === 'case' && (
                <button
                  onClick={handleDeleteCase}
                  className={`p-1 rounded ${bgHover} hover:bg-red-500/20 transition-colors`}
                  title="Delete case"
                >
                  <X className="h-3 w-3 text-red-400" />
                </button>
              )}
              
              {/* Expand/Collapse Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1 rounded ${bgHover} transition-colors`}
              >
                <Settings className={`h-3 w-3 ${textSecondary}`} />
              </button>
            </div>
          </div>

          {/* Route Info */}
          <p className={`${textSecondary} text-xs truncate`}>
            {route.action === 'continue' && 'Continue →'}
            {route.action === 'end' && 'End ✕'}
            {route.action === 'goto' && route.targetStepId && (
              `→ ${availableSteps.find(s => s.id === route.targetStepId)?.label || 'Unknown'}`
            )}
          </p>
        </div>

        {/* Routing Settings (Expandable) */}
        {isExpanded && (
          <div className={`p-3 border-b ${borderColor} space-y-2 bg-[#0E0E1F]/30`}>
            {/* Action Dropdown */}
            <div>
              <label className={`${textSecondary} text-xs mb-1 block`}>Action</label>
              <select
                value={route.action}
                onChange={(e) => handleUpdateRoute(e.target.value as any)}
                className={`w-full ${bgCard} border ${borderColor} rounded px-2 py-1 ${textPrimary} text-xs`}
              >
                <option value="continue">Continue</option>
                <option value="goto">Go to Step</option>
                <option value="end">End</option>
              </select>
            </div>

            {/* Target Step (if goto) */}
            {route.action === 'goto' && (
              <div>
                <label className={`${textSecondary} text-xs mb-1 block`}>Target</label>
                <select
                  value={route.targetStepId || ''}
                  onChange={(e) => handleUpdateRoute('goto', e.target.value)}
                  className={`w-full ${bgCard} border ${borderColor} rounded px-2 py-1 ${textPrimary} text-xs`}
                >
                  <option value="">Select...</option>
                  {availableSteps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Branch Nodes */}
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          {branchNodes.length > 0 ? (
            branchNodes.map((branchNode) => (
              <div
                key={branchNode.id}
                className={`${bgHover} border ${borderColor} rounded p-2 text-xs ${textPrimary} flex items-start gap-2`}
              >
                <Workflow className="h-4 w-4 shrink-0 text-[#00C6FF] mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{branchNode.label}</div>
                  <div className={`${textSecondary} text-xs truncate`}>{branchNode.type}</div>
                </div>
              </div>
            ))
          ) : (
            <div className={`${textSecondary} text-xs text-center py-6`}>
              No nodes yet
            </div>
          )}
        </div>

        {/* Add Node Button */}
        <div className="p-3 border-t border-[#2A2A3E]">
          <button
            onClick={() => {
              openNodePicker('branch', containerId, parentNode.id, route.id);
            }}
            className={`w-full px-3 py-2 border-2 border-dashed ${borderColor} rounded ${bgHover} ${textSecondary} hover:text-[#00C6FF] hover:border-[#00C6FF]/50 transition-all text-xs flex items-center justify-center gap-2`}
          >
            <Plus className="h-4 w-4" />
            Add Node
          </button>
        </div>
      </div>
    </div>
  );
}