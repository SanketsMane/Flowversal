/**
 * Branch Routing Component
 * Workflow routing controls for If/Switch nodes
 * Branch containers are rendered separately outside the node
 */

import { useTheme } from '@/core/theme/ThemeContext';
import { WorkflowNode, BranchRoute } from '../../types/node.types';
import { useWorkflowStore, useUIStore } from '../../stores';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';
import { Plus, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { calculateBranchPositions } from '../../utils/branchPositioning';

interface BranchRoutingProps {
  node: WorkflowNode;
  containerId: string;
}

export function BranchRouting({ node, containerId }: BranchRoutingProps) {
  const { theme } = useTheme();
  const { updateNode } = useWorkflowStore();
  const { updateNodeInSubStep, subStepContainers } = useSubStepStore();
  const { openConditionBuilder } = useUIStore();

  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Check if containerId is a sub-step
  const isSubStep = subStepContainers.some(s => s.id === containerId);

  // Initialize routes if not present
  useEffect(() => {
    if (!node.routes || node.routes.length === 0) {
      const defaultRoutes: BranchRoute[] = node.type === 'if' ? [
        {
          id: `${node.id}-true`,
          type: 'true',
          label: 'True',
          action: 'continue',
          targetStepId: null,
        },
        {
          id: `${node.id}-false`,
          type: 'false',
          label: 'False',
          action: 'continue',
          targetStepId: null,
        },
      ] : [
        {
          id: `${node.id}-default`,
          type: 'default',
          label: 'Default',
          action: 'continue',
          targetStepId: null,
        },
        {
          id: `${node.id}-case1`,
          type: 'case1',
          label: 'Case 1',
          action: 'continue',
          targetStepId: null,
        },
      ];

      // Create branches at the same time with HORIZONTAL ROW ON THE RIGHT
      // ALL branches on RIGHT side, same Y level (horizontal)
      // Branches will be positioned by BranchPositionManager
      
      const initialBranches = defaultRoutes.map((route, index) => {
        return {
          id: route.id,
          type: route.type,
          label: route.label,
          nodes: [],
          position: { 
            x: 0, // Will be positioned by BranchPositionManager
            y: 0, // Will be positioned by BranchPositionManager
          },
        };
      }) as any;

      console.log('🔥 BranchRouting: Creating routes and branches at (0,0) for BranchPositionManager', { 
        defaultRoutes, 
        initialBranches,
        positions: initialBranches.map((b: any) => ({ id: b.id, pos: b.position }))
      });
      
      // Update both routes and branches in a single call
      if (isSubStep) {
        updateNodeInSubStep(containerId, node.id, { 
          routes: defaultRoutes,
          branches: initialBranches,
        });
      } else {
        updateNode(containerId, node.id, { 
          routes: defaultRoutes,
          branches: initialBranches,
        });
      }
    }
  }, [node.id, node.type, node.routes, containerId, updateNode, updateNodeInSubStep, isSubStep]);

  const routes = node.routes || [];

  // Add new case (for switch nodes only)
  const handleAddCase = () => {
    // Find the highest case number
    const existingCaseNumbers = routes
      .map(r => {
        const match = r.type.match(/case(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);
    
    const nextCaseNumber = existingCaseNumbers.length > 0 
      ? Math.max(...existingCaseNumbers) + 1 
      : 1;
    
    const newRoute: BranchRoute = {
      id: `${node.id}-case${nextCaseNumber}`,
      type: `case${nextCaseNumber}`,
      label: `Case ${nextCaseNumber}`,
      action: 'continue',
      targetStepId: null,
    };

    // Add new case at the END (after all existing cases, but default stays first)
    // Order: Default, Case 1, Case 2, Case 3, ...
    const newRoutes = [...routes, newRoute];
    
    // Also add a corresponding branch - append to end
    const newBranches = [
      ...(node.branches || []),
      {
        id: newRoute.id,
        type: newRoute.type,
        label: newRoute.label,
        nodes: [],
        position: { 
          x: 0, // Will be positioned by BranchPositionManager
          y: 0, // Will be positioned by BranchPositionManager
        },
      } as any
    ];
    
    if (isSubStep) {
      updateNodeInSubStep(containerId, node.id, { 
        routes: newRoutes,
        branches: newBranches,
      });
    } else {
      updateNode(containerId, node.id, { 
        routes: newRoutes,
        branches: newBranches,
      });
    }
  };

  // Get branch colors for info display
  const getBranchColor = (type: string) => {
    switch (type) {
      case 'true':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'false':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'default':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-3">
      {/* Branch Summary */}
      <div className={`p-3 border ${borderColor} rounded-lg`} style={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, rgba(0, 198, 255, 0.05) 0%, rgba(157, 80, 187, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(0, 198, 255, 0.03) 0%, rgba(157, 80, 187, 0.03) 100%)'
      }}>
        <div className={`${textSecondary} text-xs font-medium mb-2.5`}>
          Routes ({routes.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {routes.map((route) => {
            const colorClass = getBranchColor(route.type);
            const nodeCount = node.branches?.find(b => b.id === route.id)?.nodes.length || 0;
            
            return (
              <div
                key={route.id}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium border ${colorClass} flex items-center gap-1.5`}
              >
                <span>{route.label}</span>
                {nodeCount > 0 && (
                  <span className="opacity-70">• {nodeCount}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Case Button (for switch nodes only) */}
      {node.type === 'switch' && routes.length < 6 && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddCase}
          className={`w-full ${textSecondary} border-${borderColor} border-dashed`}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Case
        </Button>
      )}
    </div>
  );
}