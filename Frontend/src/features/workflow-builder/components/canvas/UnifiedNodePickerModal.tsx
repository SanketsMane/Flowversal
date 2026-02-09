/**
 * Unified Node Picker Modal - Version 284 Restoration
 * Zapier-inspired modal with categories sidebar and items grid
 * Replaces LHS panel functionality
 */
import { useState, useEffect } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { X, Search, Home, Zap, Bot, Globe, Pen, GitBranch, Briefcase, Plus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import TriggerRegistry from '../../registries/triggerRegistry';
import NodeRegistry from '../../registries/nodeRegistry';
import ToolRegistry from '../../registries/toolRegistry';
import { useWorkflowStore, useUIStore } from '../../stores';
import { useSubStepStore } from '@/features/workflow-builder/stores/subStepStore';
import { useConnectionStore } from '@/features/workflow-builder/stores/connectionStore';
import { triggerTemplates } from '@/features/workflow-builder/utils/triggerTemplates';
import { nodeTemplates } from '@/features/workflow-builder/utils/nodeTemplates';
import { toolTemplates } from '@/features/workflow-builder/utils/toolTemplates';
interface UnifiedNodePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}
interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}
interface Item {
  type: string;
  label: string;
  category: string;
  icon: any;
  description?: string;
  itemType: 'trigger' | 'node' | 'tool';
}
export function UnifiedNodePickerModal({ isOpen, onClose }: UnifiedNodePickerModalProps) {
  const { theme } = useTheme();
  const { addTrigger, addNode, addNodeToBranch, insertContainerAt, containers } = useWorkflowStore();
  const { nodePickerContext } = useUIStore();
  const { addSubStepContainer, addNodeToSubStep } = useSubStepStore();
  const { addConnection } = useConnectionStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState('');
  // Debug logging
  useEffect(() => {
    if (isOpen) {
    }
  }, [isOpen, nodePickerContext, containers.length]);
  if (!isOpen) return null;
  const bgColor = theme === 'dark' ? '#1A1A2E' : '#ffffff';
  const borderColor = theme === 'dark' ? '#2A2A3E' : '#E5E7EB';
  const textColor = theme === 'dark' ? '#FFFFFF' : '#111827';
  const mutedColor = theme === 'dark' ? '#CFCFE8' : '#6B7280';
  const inputBg = theme === 'dark' ? '#0E0E1F' : '#F9FAFB';
  const sidebarBg = theme === 'dark' ? '#0E0E1F' : '#F9FAFB';
  // Define categories
  const categories: Category[] = [
    { id: 'home', label: 'Home', icon: Home, description: 'All items' },
    { id: 'triggers', label: 'Triggers', icon: Zap, description: 'Start your workflow' },
    { id: 'ai', label: 'AI', icon: Bot, description: 'AI and ML capabilities' },
    { id: 'action', label: 'Action by tools', icon: Globe, description: 'External integrations' },
    { id: 'data', label: 'Data Transformation', icon: Pen, description: 'Transform and manipulate data' },
    { id: 'flow', label: 'Flow', icon: GitBranch, description: 'Control workflow flow' },
    { id: 'core', label: 'Core', icon: Briefcase, description: 'Core functionality' },
  ];
  // Get all items (triggers + nodes + tools)
  const getAllItems = (): Item[] => {
    const items: Item[] = [];
    // Add triggers
    triggerTemplates.forEach(trigger => {
      items.push({
        type: trigger.type,
        label: trigger.label,
        category: 'triggers',
        icon: trigger.icon,
        description: trigger.description,
        itemType: 'trigger',
      });
    });
    // Add nodes
    nodeTemplates.forEach(node => {
      items.push({
        type: node.type,
        label: node.label,
        category: node.category,
        icon: node.icon,
        description: node.description,
        itemType: 'node',
      });
    });
    // Add tools
    toolTemplates.forEach(tool => {
      items.push({
        type: tool.type,
        label: tool.label,
        category: tool.category || 'action',
        icon: tool.icon,
        description: tool.description,
        itemType: 'tool',
      });
    });
    return items;
  };
  const allItems = getAllItems();
  // Filter items based on selected category and search
  const getFilteredItems = (): Item[] | { [category: string]: Item[] } => {
    let filtered = allItems;
    // Filter by category (except 'home' which shows all)
    if (selectedCategory !== 'home') {
      filtered = filtered.filter(item => {
        if (selectedCategory === 'triggers') {
          return item.itemType === 'trigger';
        }
        return item.category === selectedCategory;
      });
    }
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      // If searching from 'home', group results by category
      if (selectedCategory === 'home') {
        const grouped: { [category: string]: Item[] } = {};
        filtered.forEach(item => {
          const cat = item.itemType === 'trigger' ? 'Triggers' : item.category;
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item);
        });
        return grouped;
      }
    }
    return filtered;
  };
  const filteredItems = getFilteredItems();
  const isGrouped = !Array.isArray(filteredItems);
  // Handle item selection
  const handleSelectItem = (item: Item) => {
    if (item.itemType === 'trigger') {
      // Always add triggers
      const newTriggerId = `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      addTrigger({
        id: newTriggerId,
        type: item.type,
        label: item.label,
        enabled: true,
        config: {},
      });
    } else if (item.itemType === 'node' || item.itemType === 'tool') {
      const newNode = NodeRegistry.createInstance(item.type);
      if (!newNode) {
        console.error('Failed to create node:', item.type);
        return;
      }
      // Check if we're adding node to trigger box
      if (nodePickerContext?.source === 'trigger-node') {
        const triggers = useWorkflowStore.getState().triggers;
        if (triggers.length === 0) {
          console.error('❌ No triggers found to add node to');
          return;
        }
        // Add to the first trigger (you could also allow user to select which trigger)
        const firstTriggerId = triggers[0].id;
        const { addNodeToTrigger } = useWorkflowStore.getState();
        addNodeToTrigger(firstTriggerId, newNode);
      }
      // Check if we're adding from the floating [+] button at top-left
      else if (nodePickerContext?.source === 'floating') {
        // Calculate position at the right side of the workflow
        // Position relative to the trigger section or first container
        const canvasElement = document.querySelector('.infinite-canvas-content');
        const triggerSection = document.querySelector('[data-trigger-section]');
        const firstContainer = containers.length > 0 ? document.querySelector(`[data-container-id="${containers[0].id}"]`) : null;
        let position = { x: 900, y: 100 }; // Default: right side, near top
        if (canvasElement) {
          const canvasRect = canvasElement.getBoundingClientRect();
          // Position relative to trigger section if it exists
          if (triggerSection) {
            const triggerRect = triggerSection.getBoundingClientRect();
            position = {
              x: 900, // 900px to the right of main content
              y: triggerRect.top - canvasRect.top,
            };
          }
          // Otherwise position relative to first container
          else if (firstContainer) {
            const containerRect = firstContainer.getBoundingClientRect();
            position = {
              x: 900,
              y: containerRect.top - canvasRect.top,
            };
          }
        }
        // Create a standalone sub-step (no parent node)
        const newSubStepId = `substep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const subStepContainer = {
          id: newSubStepId,
          parentNodeId: null, // No parent - it's a standalone substep
          parentContainerId: null,
          name: 'New Action',
          description: item.label,
          nodes: [newNode],
          expanded: true,
          position: position,
        };
        // Add the sub-step using the store
        useSubStepStore.getState().subStepContainers.push(subStepContainer);
        useSubStepStore.setState({ 
          subStepContainers: [...useSubStepStore.getState().subStepContainers] 
        });
      }
      // Check if we're inserting between connected nodes (from connection line hover)
      else if (nodePickerContext?.connectionContext) {
        const { sourceId, targetId, connectionId } = nodePickerContext.connectionContext;
        // Find which node this connection is connected to
        // The sourceId could be a node within a container OR within a sub-step
        let parentContainer = null;
        let parentNode = null;
        let targetNode = null;
        let sourceNodeInfo = null;
        let targetNodeInfo = null;
        // First, search in main containers
        for (const container of containers) {
          const foundSource = container.nodes?.find(n => n.id === sourceId);
          const foundTarget = container.nodes?.find(n => n.id === targetId);
          if (foundSource) {
            parentContainer = container;
            parentNode = foundSource;
            sourceNodeInfo = { node: foundSource, container: container, isSubStep: false };
          }
          if (foundTarget) {
            targetNode = foundTarget;
            targetNodeInfo = { node: foundTarget, container: container, isSubStep: false };
          }
        }
        // If not found in main containers, search in sub-step containers
        const existingSubSteps = useSubStepStore.getState().subStepContainers;
        if (!sourceNodeInfo) {
          for (const subStep of existingSubSteps) {
            const foundSource = subStep.nodes?.find(n => n.id === sourceId);
            if (foundSource) {
              sourceNodeInfo = { node: foundSource, subStep: subStep, isSubStep: true };
              parentNode = foundSource;
              // For sub-steps, find the parent container
              parentContainer = containers.find(c => c.id === subStep.parentContainerId);
              break;
            }
          }
        }
        if (!targetNodeInfo) {
          for (const subStep of existingSubSteps) {
            const foundTarget = subStep.nodes?.find(n => n.id === targetId);
            if (foundTarget) {
              targetNodeInfo = { node: foundTarget, subStep: subStep, isSubStep: true };
              targetNode = foundTarget;
              break;
            }
          }
        }
        if (!sourceNodeInfo || !parentNode) {
          console.error('❌ Could not find source node:', sourceId);
          return;
        }
        if (!targetNodeInfo || !targetNode) {
          console.error('❌ Could not find target node:', targetId);
          return;
        }
        // Calculate smart position: centered between source and target nodes, offset downward
        const sourceElement = document.querySelector(`[data-node-id="${sourceId}"]`);
        const targetElement = document.querySelector(`[data-node-id="${targetId}"]`);
        let position = { x: 0, y: 0 };
        if (sourceElement && targetElement) {
          const sourceRect = sourceElement.getBoundingClientRect();
          const targetRect = targetElement.getBoundingClientRect();
          const canvasElement = document.querySelector('.infinite-canvas-content');
          const canvasRect = canvasElement?.getBoundingClientRect();
          if (canvasRect) {
            // Calculate positions relative to canvas
            const sourceX = sourceRect.left - canvasRect.left + (sourceRect.width / 2);
            const sourceY = sourceRect.top - canvasRect.top + (sourceRect.height / 2);
            const targetX = targetRect.left - canvasRect.left + (targetRect.width / 2);
            const targetY = targetRect.top - canvasRect.top + (targetRect.height / 2);
            // Calculate current distance between source and target
            const currentDistance = Math.abs(targetX - sourceX);
            // We want to create 2x space, so we need to add the current distance as extra space
            const additionalSpaceNeeded = currentDistance;
            // 🚀 SMART REPOSITIONING: Shift target and all consecutive sub-steps to the right
            const existingSubSteps = useSubStepStore.getState().subStepContainers;
            // Find the target node's container/substep to shift it along with consecutive ones
            let targetNodeContainer = null;
            // Check if target is in a sub-step
            for (const subStep of existingSubSteps) {
              if (subStep.nodes?.find(n => n.id === targetId)) {
                targetNodeContainer = subStep;
                break;
              }
            }
            // Find all sub-steps that need to be shifted (target and everything to its right)
            const subsStepsToShift = existingSubSteps.filter(subStep => {
              // Get the subStep's X position
              const subStepX = subStep.position.x;
              // Only shift sub-steps that are:
              // 1. At or to the right of the target position
              // 2. Within a reasonable vertical range (to avoid shifting unrelated sub-steps)
              const targetBaseX = targetRect.left - canvasRect.left;
              const isAtOrToRight = subStepX >= targetBaseX - 50; // Small tolerance for floating point
              const isInVerticalRange = Math.abs(subStep.position.y - sourceY) < 200;
              return isAtOrToRight && isInVerticalRange;
            });
            // Shift all identified sub-steps to the right to create 2x space
            subsStepsToShift.forEach(subStep => {
              subStep.position.x += additionalSpaceNeeded;
            });
            // Update the store with repositioned sub-steps
            if (subsStepsToShift.length > 0) {
              useSubStepStore.setState({ 
                subStepContainers: [...existingSubSteps] 
              });
            }
            // Now calculate midpoint position for the new sub-step
            // The target has moved, so recalculate based on new positions
            const newMidX = (sourceX + targetX + additionalSpaceNeeded) / 2;
            const midY = (sourceY + targetY) / 2;
            // Position sub-step at the new midpoint, offset downward for visibility
            position = {
              x: newMidX - 100, // Center the sub-step (assuming ~200px width)
              y: midY + 80, // Offset downward
            };
          }
        } else if (sourceElement) {
          // Fallback: position to the right of source
          const sourceRect = sourceElement.getBoundingClientRect();
          const canvasElement = document.querySelector('.infinite-canvas-content');
          const canvasRect = canvasElement?.getBoundingClientRect();
          if (canvasRect) {
            position = {
              x: sourceRect.right - canvasRect.left + 150,
              y: sourceRect.top - canvasRect.top + 80,
            };
          }
        }
        // Create a new sub-step attached to the parent node
        const newSubStepId = `substep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const subStepContainer = {
          id: newSubStepId,
          parentNodeId: parentNode.id,
          parentContainerId: parentContainer ? parentContainer.id : (sourceNodeInfo.isSubStep ? sourceNodeInfo.subStep.parentContainerId : 'unknown'),
          name: 'Sub-step',
          description: item.label,
          nodes: [newNode],
          expanded: true,
          position: position,
        };
        // Add the sub-step using the store
        useSubStepStore.getState().subStepContainers.push(subStepContainer);
        useSubStepStore.setState({ 
          subStepContainers: [...useSubStepStore.getState().subStepContainers] 
        });
        // Update connections:
        // 1. Remove the old connection from source → target
        useConnectionStore.getState().removeConnection(connectionId);
        // 2. Create new connection from source → new substep node (INPUT dot)
        addConnection({
          sourceId: sourceId,
          sourceType: 'node',
          targetId: newNode.id,  // Connect to the actual node inside sub-step
          targetType: 'node',
          connectionType: 'manual',
          side: 'right',
        });
        // 3. Create new connection from new substep node → target (OUTPUT dot)
        addConnection({
          sourceId: newNode.id,  // Connect from the actual node inside sub-step
          sourceType: 'node',
          targetId: targetId,
          targetType: 'node',
          connectionType: 'manual',
          side: 'right',
        });
      }
      // Check if we should insert a new container at a specific index
      else if (nodePickerContext?.insertIndex !== undefined) {
        const containerIndex = containers.length + 1;
        const newContainer = {
          id: `container-${Date.now()}`,
          type: 'container' as const,
          title: `Step ${containerIndex}`,
          subtitle: 'Add nodes to this step',
          elements: [],
          nodes: [newNode],
        };
        insertContainerAt(newContainer, nodePickerContext.insertIndex);
      }
      // If opened from a sub-step, add to that sub-step
      else if (nodePickerContext?.source === 'substep' && nodePickerContext.containerId) {
        // Check if substepId is provided (adding to existing substep)
        if (nodePickerContext.subStepId) {
          // Add node to the existing substep
          useSubStepStore.getState().addNodeToSubStep(nodePickerContext.subStepId, newNode);
        } else {
          // Create NEW substep (legacy behavior)
          const parentContainerId = nodePickerContext.containerId;
          const parentNodeId = nodePickerContext.nodeId;
          if (!parentNodeId) {
            console.error('❌ No parent node ID provided for substep creation');
            console.error('❌ Context received:', nodePickerContext);
            console.error('❌ This error typically means openNodePicker was called with missing nodeId parameter');
            console.error('❌ Expected: openNodePicker("substep", containerId, nodeId)');
            return;
          }
          // Calculate position to the right of the parent node
          const nodeElement = document.querySelector(`[data-node-id="${parentNodeId}"]`);
          let position = { x: 0, y: 0 };
          if (nodeElement) {
            const rect = nodeElement.getBoundingClientRect();
            const canvasElement = document.querySelector('.infinite-canvas-content');
            const canvasRect = canvasElement?.getBoundingClientRect();
            if (canvasRect) {
              // Position 200px to the right of the node
              position = {
                x: rect.right - canvasRect.left + 200,
                y: rect.top - canvasRect.top,
              };
            }
          }
          // Create the new sub-step container with the selected node
          const newSubStepId = `substep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const subStepContainer = {
            id: newSubStepId,
            parentNodeId: parentNodeId,
            parentContainerId: parentContainerId,
            name: 'Sub-step',
            description: item.label,
            nodes: [newNode],
            expanded: true,
            position: position,
          };
          // Add the sub-step using the store
          useSubStepStore.getState().subStepContainers.push(subStepContainer);
          useSubStepStore.setState({ 
            subStepContainers: [...useSubStepStore.getState().subStepContainers] 
          });
          // Create automatic connection from parent node to the first node in the sub-step
          addConnection({
            sourceId: parentNodeId,
            sourceType: 'node',
            targetId: newNode.id,  // Connect to the actual node inside the sub-step
            targetType: 'node',
            connectionType: 'manual',
            side: 'right',
          });
        }
      } 
      // If opened from a branch output dot ([+] button), create sub-step with branch connection
      else if (nodePickerContext?.source === 'branch-substep' && 
          nodePickerContext.containerId && 
          nodePickerContext.nodeId && 
          nodePickerContext.branchId) {
        const parentContainerId = nodePickerContext.containerId;
        const parentNodeId = nodePickerContext.nodeId;
        const branch = nodePickerContext.branchId;
        // Find the parent node - check both main containers AND substeps
        let parentNode = null;
        // Search in main workflow containers
        const mainContainerNodes = useWorkflowStore.getState().containers.flatMap(c => c.nodes || []);
        parentNode = mainContainerNodes.find(n => n.id === parentNodeId);
        // If not found in main containers, search in substeps
        if (!parentNode) {
          const allSubSteps = useSubStepStore.getState().subStepContainers;
          for (const subStep of allSubSteps) {
            const found = subStep.nodes?.find(n => n.id === parentNodeId);
            if (found) {
              parentNode = found;
              break;
            }
          }
        }
        // Calculate position to the right of the parent node with vertical offset based on branch
        const nodeElement = document.querySelector(`[data-node-id="${parentNodeId}"]`);
        let position = { x: 0, y: 0 };
        if (nodeElement) {
          const rect = nodeElement.getBoundingClientRect();
          const canvasElement = document.querySelector('.infinite-canvas-content');
          const canvasRect = canvasElement?.getBoundingClientRect();
          if (canvasRect) {
            let yOffset = 0;
            if (parentNode) {
              // Calculate Y offset based on branch position to avoid overlap
              if (parentNode.type === 'if') {
                // IF node: True above, False below
                if (branch === 'true') {
                  yOffset = -120; // True branch goes up
                } else if (branch === 'false') {
                  yOffset = 120; // False branch goes down
                }
              } else if (parentNode.type === 'switch') {
                // SWITCH node: Get branches from routes array
                let branches: string[] = [];
                if (parentNode.routes && parentNode.routes.length > 0) {
                  branches = parentNode.routes.map((r: any, idx: number) => r.type || `case${idx + 1}`);
                } else {
                  branches = ['default'];
                }
                // Ensure 'default' is always present
                if (!branches.includes('default')) {
                  branches.unshift('default');
                }
                const branchIndex = branches.indexOf(branch);
                if (branchIndex !== -1) {
                  // Space branches vertically: 150px apart
                  const BRANCH_SPACING = 150;
                  const totalBranches = branches.length;
                  const centerOffset = -((totalBranches - 1) * BRANCH_SPACING) / 2;
                  yOffset = centerOffset + (branchIndex * BRANCH_SPACING);
                } else {
                  // Default case or unknown branch
                  console.warn('⚠️ Branch not found in branches array:', { branch, branches });
                  yOffset = 0;
                }
              }
            } else {
              console.warn('⚠️ Parent node not found, using default position');
            }
            // Position 200px to the right of the node with calculated Y offset
            position = {
              x: rect.right - canvasRect.left + 200,
              y: rect.top - canvasRect.top + yOffset,
            };
          }
        }
        // Get branch label for naming
        const getBranchLabel = (branchId: string) => {
          if (branchId === 'true') return 'True';
          if (branchId === 'false') return 'False';
          if (branchId === 'default') return 'Default';
          const caseMatch = branchId.match(/case(\d+)/i);
          if (caseMatch) return `Case ${caseMatch[1]}`;
          return branchId;
        };
        const branchLabel = getBranchLabel(branch);
        // Create the new sub-step container with the selected node
        const newSubStepId = `substep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const subStepContainer = {
          id: newSubStepId,
          parentNodeId: parentNodeId,
          parentContainerId: parentContainerId,
          name: `${branchLabel} Branch`,
          description: `Actions for ${branchLabel} path`,
          nodes: [newNode],
          expanded: true,
          position: position,
        };
        // Add the sub-step using the store
        useSubStepStore.getState().subStepContainers.push(subStepContainer);
        useSubStepStore.setState({ 
          subStepContainers: [...useSubStepStore.getState().subStepContainers] 
        });
        // Create connection from parent node's branch to the first node in the sub-step
        // This uses the existing manual connection system (purple connection lines) with branch output
        addConnection({
          sourceId: parentNodeId,
          sourceType: 'node',
          targetId: newNode.id,  // Connect to the actual node inside the sub-step
          targetType: 'node',
          connectionType: 'manual',
          side: 'right',
          branchOutput: branch,  // Include the branch output (true/false/case1/etc.)
        });
      }
      else if (nodePickerContext?.source === 'branch' && 
          nodePickerContext.containerId && 
          nodePickerContext.nodeId && 
          nodePickerContext.branchId) {
        // If opened from a branch, add to that branch
        addNodeToBranch(
          nodePickerContext.containerId,
          nodePickerContext.nodeId,
          nodePickerContext.branchId,
          newNode
        );
      } else if (nodePickerContext?.source === 'step' && nodePickerContext.containerId) {
        // If opened from a step container, add to that container
        addNode(nodePickerContext.containerId, newNode);
      } else if (nodePickerContext?.source === 'container' && nodePickerContext.containerId) {
        // If opened from container ([+] button), add to that container
        addNode(nodePickerContext.containerId, newNode);
      } else {
        // Default: show notification
      }
    }
    onClose();
    setSearchQuery('');
  };
  // Render item card
  const renderItemCard = (item: Item) => {
    const Icon = item.icon;
    const gradientBg = 
      item.itemType === 'trigger' 
        ? 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)'
        : item.category === 'ai'
        ? 'linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)'
        : item.category === 'flow'
        ? 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)'
        : 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    return (
      <button
        key={`${item.itemType}-${item.type}`}
        onClick={() => handleSelectItem(item)}
        style={{
          width: '100%',
          padding: '16px',
          background: inputBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          transition: 'all 0.2s',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#00C6FF';
          e.currentTarget.style.background = bgColor;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 198, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = borderColor;
          e.currentTarget.style.background = inputBg;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Icon */}
        <div style={{
          width: '48px',
          height: '48px',
          background: gradientBg,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {Icon && typeof Icon === 'function' ? (
            <Icon className="w-6 h-6 text-white" />
          ) : item.itemType === 'trigger' ? (
            <span style={{ fontSize: '24px' }}>⚡</span>
          ) : (
            <span style={{ fontSize: '24px' }}>⚙️</span>
          )}
        </div>
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: textColor,
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '4px',
          }}>
            {item.label}
          </div>
          <div style={{
            color: mutedColor,
            fontSize: '12px',
            lineHeight: '1.4',
          }}>
            {item.description || item.type}
          </div>
        </div>
      </button>
    );
  };
  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '900px',
          height: '85vh',
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{
              color: textColor,
              fontSize: '24px',
              fontWeight: '600',
              margin: 0,
              marginBottom: '4px',
            }}>
              Add to Workflow
            </h2>
            <p style={{
              color: mutedColor,
              fontSize: '14px',
              margin: 0,
            }}>
              Choose triggers, nodes, and tools to build your workflow
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              background: inputBg,
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = borderColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = inputBg;
            }}
          >
            <X className="w-6 h-6" style={{ color: mutedColor }} />
          </button>
        </div>
        {/* Search Bar */}
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${borderColor}` }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search className="w-5 h-5" style={{
              position: 'absolute',
              left: '16px',
              color: mutedColor,
            }} />
            <input
              type="text"
              placeholder="Search across all triggers, nodes, and tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                background: inputBg,
                border: `2px solid ${borderColor}`,
                borderRadius: '10px',
                color: textColor,
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#00C6FF';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = borderColor;
              }}
            />
          </div>
        </div>
        {/* Main Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Categories Sidebar */}
          <div style={{
            width: '240px',
            background: sidebarBg,
            borderRight: `1px solid ${borderColor}`,
            padding: '16px',
            overflowY: 'auto',
          }}>
            <div style={{
              color: mutedColor,
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px',
              paddingLeft: '12px',
            }}>
              Categories
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSearchQuery('');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: isActive 
                        ? 'linear-gradient(135deg, #00C6FF 0%, #9D50BB 100%)'
                        : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = borderColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {Icon && <Icon className="w-5 h-5" style={{ 
                      color: isActive ? 'white' : mutedColor,
                      flexShrink: 0,
                    }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: isActive ? 'white' : textColor,
                        fontSize: '14px',
                        fontWeight: isActive ? '600' : '500',
                      }}>
                        {category.label}
                      </div>
                      {!isActive && category.description && (
                        <div style={{
                          color: mutedColor,
                          fontSize: '11px',
                          marginTop: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {category.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Items Grid */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
          }}>
            {isGrouped ? (
              // Grouped results (when searching from Home)
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {Object.entries(filteredItems as { [category: string]: Item[] }).map(([categoryName, items]) => (
                  <div key={categoryName}>
                    <h3 style={{
                      color: textColor,
                      fontSize: '16px',
                      fontWeight: '600',
                      marginBottom: '16px',
                      textTransform: 'capitalize',
                    }}>
                      {categoryName}
                      <span style={{
                        color: mutedColor,
                        fontSize: '14px',
                        fontWeight: '400',
                        marginLeft: '8px',
                      }}>
                        ({items.length})
                      </span>
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '12px',
                    }}>
                      {items.map(item => renderItemCard(item))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Regular grid
              <>
                {(filteredItems as Item[]).length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                  }}>
                    <div style={{
                      color: mutedColor,
                      fontSize: '16px',
                      marginBottom: '8px',
                    }}>
                      No items found
                    </div>
                    <div style={{
                      color: mutedColor,
                      fontSize: '14px',
                    }}>
                      Try adjusting your search or browse different categories
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                  }}>
                    {(filteredItems as Item[]).map(item => renderItemCard(item))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}