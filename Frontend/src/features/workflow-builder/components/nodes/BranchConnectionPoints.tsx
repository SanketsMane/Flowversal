/**
 * Branch Connection Points Component
 * Shows connection points on the right side of If/Switch nodes
 * for True/False or Case branches
 */
import { BranchOutputDots } from '../connections/BranchOutputDots';
import { WorkflowNode } from '../../types/node.types';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';
interface BranchConnectionPointsProps {
  node: WorkflowNode;
  containerId?: string; // Parent container ID for creating sub-steps (could be workflow container or sub-step ID)
}
export function BranchConnectionPoints({ node, containerId }: BranchConnectionPointsProps) {
  const { updateNode } = useWorkflowStore();
  const { updateNodeInSubStep, subStepContainers } = useSubStepStore();
  // Check if containerId is a sub-step
  const isSubStep = subStepContainers.some(s => s.id === containerId);
  // Handler to add a new branch to switch nodes
  const handleAddBranch = () => {
    if (!containerId) return;
    const currentRoutes = node.routes || [];
    // Find the highest case number
    const existingCaseNumbers = currentRoutes
      .map(r => {
        const match = r.type.match(/case(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);
    const nextCaseNumber = existingCaseNumbers.length > 0 
      ? Math.max(...existingCaseNumbers) + 1 
      : 1;
    const newRoute = {
      id: `${node.id}-case${nextCaseNumber}`,
      type: `case${nextCaseNumber}`,
      label: `Case ${nextCaseNumber}`,
      action: 'continue',
      targetStepId: null,
    };
    // Also add a corresponding branch
    const newBranches = [
      ...(node.branches || []),
      {
        id: newRoute.id,
        type: newRoute.type,
        label: newRoute.label,
        nodes: [],
        position: { x: 0, y: 0 }, // Will be positioned by BranchPositionManager
      }
    ];
    // Use appropriate update function based on context
    if (isSubStep) {
      updateNodeInSubStep(containerId, node.id, {
        routes: [...currentRoutes, newRoute],
        branches: newBranches as any,
      });
    } else {
      updateNode(containerId, node.id, {
        routes: [...currentRoutes, newRoute],
        branches: newBranches as any,
      });
    }
  };
  // Handler to delete a branch from switch nodes
  const handleDeleteBranch = (branchToDelete: string) => {
    if (!containerId) return;
    // Prevent deletion of 'default' branch
    if (branchToDelete === 'default') {
      console.warn('Cannot delete the default case');
      return;
    }
    const currentRoutes = node.routes || [];
    // Find the route being deleted to get its ID
    const routeToDelete = currentRoutes.find(route => route.type === branchToDelete);
    // Delete all nodes in the branch being deleted
    if (node.branches && routeToDelete) {
      const branchContainer = node.branches.find(b => b.id === routeToDelete.id);
      if (branchContainer && branchContainer.nodes) {
        // Delete each node in the branch
        branchContainer.nodes.forEach(branchNode => {
          // Note: We would need a deleteNodeFromBranch function here
          // For now, we'll just clear the branch in the routes update
        });
      }
    }
    // Filter out only the specific branch to delete
    const updatedRoutes = currentRoutes.filter(route => route.type !== branchToDelete);
    // Also update branches to remove the deleted branch
    const updatedBranches = node.branches?.filter(branch => {
      const correspondingRoute = currentRoutes.find(r => r.id === branch.id);
      return correspondingRoute && correspondingRoute.type !== branchToDelete;
    });
    // Use appropriate update function based on context
    if (isSubStep) {
      updateNodeInSubStep(containerId, node.id, {
        routes: updatedRoutes,
        branches: updatedBranches,
      });
    } else {
      updateNode(containerId, node.id, {
        routes: updatedRoutes,
        branches: updatedBranches,
      });
    }
  };
  // If node - show True/False dots
  if (node.type === 'if') {
    return (
      <BranchOutputDots 
        nodeId={node.id}
        nodeType="if"
        ownerType="node"
        branches={['true', 'false']}
        parentContainerId={containerId}
      />
    );
  }
  // Switch node - show dots for all cases
  if (node.type === 'switch') {
    // Extract case names from routes - ensure 'default' is always included
    let branches: string[] = [];
    if (node.routes && node.routes.length > 0) {
      branches = node.routes.map((r, idx) => r.type || `case${idx + 1}`);
    } else {
      // If routes don't exist yet, show at least default case
      branches = ['default'];
    }
    // Ensure 'default' is always present
    if (!branches.includes('default')) {
      branches.unshift('default');
    }
    return (
      <BranchOutputDots 
        nodeId={node.id}
        nodeType="switch"
        ownerType="node"
        branches={branches}
        parentContainerId={containerId}
        onAddBranch={handleAddBranch}
        onDeleteBranch={handleDeleteBranch}
      />
    );
  }
  return null;
}