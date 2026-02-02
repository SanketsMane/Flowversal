import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Zap, FileText, Sparkles, Wrench } from 'lucide-react';
import { useDrag } from 'react-dnd';

interface Variable {
  id: string;
  name: string;
  value: string;
  type: string;
  path: string;
}

interface VariableGroup {
  id: string;
  label: string;
  icon: any;
  color: string;
  variables: Variable[];
  children?: VariableGroup[];
}

interface HierarchicalVariablesPanelProps {
  triggers: any[];
  containers: any[];
  theme: string;
  activeTextboxForVariable: string | null;
  onVariableClick?: (path: string) => void;
  onDragStart?: (variable: Variable) => void;
  onAddVariable?: (groupId: string) => void;
  selectedItem?: any;
  selectedTrigger?: number | null;
  selectedTriggerBox?: boolean;
  selectedNode?: { containerIndex: number; nodeIndex: number } | null;
  selectedToolIndex?: number | null;
}

export function HierarchicalVariablesPanel({
  triggers,
  containers,
  theme,
  activeTextboxForVariable,
  onVariableClick,
  onDragStart,
  onAddVariable,
  selectedItem,
  selectedTrigger,
  selectedTriggerBox,
  selectedNode,
  selectedToolIndex
}: HierarchicalVariablesPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['triggers']));

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Auto-expand relevant sections based on selection
  useEffect(() => {
    const newExpanded = new Set<string>();

    // If trigger box or specific trigger is selected, ONLY expand triggers
    if (selectedTriggerBox || selectedTrigger !== null) {
      newExpanded.add('triggers');
    }

    // If a field is selected, ONLY expand its parent step and fields group
    else if (selectedItem?.type === 'element') {
      const containerIdx = selectedItem.containerIndex;
      newExpanded.add(`step-${containerIdx}`);
      newExpanded.add(`step-${containerIdx}-fields`);
    }

    // If a container is selected, ONLY expand that step
    else if (selectedItem?.type === 'container') {
      const containerIdx = selectedItem.containerIndex;
      newExpanded.add(`step-${containerIdx}`);
    }

    // If a node is selected, ONLY expand its parent step, nodes group, and the specific node
    else if (selectedNode) {
      const { containerIndex, nodeIndex } = selectedNode;
      newExpanded.add(`step-${containerIndex}`);
      newExpanded.add(`step-${containerIndex}-nodes`);
      newExpanded.add(`step-${containerIndex}-node-${nodeIndex}`);
      
      // If a tool is selected within the node, also expand tools
      if (selectedToolIndex !== null) {
        newExpanded.add(`step-${containerIndex}-node-${nodeIndex}-tools`);
      }
    }

    // If nothing is selected, default to triggers expanded
    else {
      newExpanded.add('triggers');
    }

    setExpandedGroups(newExpanded);
  }, [selectedTriggerBox, selectedTrigger, selectedItem, selectedNode, selectedToolIndex]);

  // Generate hierarchical variable structure
  const generateVariableGroups = (): VariableGroup[] => {
    const groups: VariableGroup[] = [];

    // 1. Triggers Group
    if (triggers.length > 0) {
      const triggerVariables: Variable[] = triggers.flatMap((trigger, idx) => [
        {
          id: `trigger-${idx}-id`,
          name: `${trigger.label || `Trigger ${idx + 1}`} ID`,
          value: trigger.id || 'trigger_id',
          type: 'string',
          path: `triggers[${idx}].id`
        },
        {
          id: `trigger-${idx}-type`,
          name: `${trigger.label || `Trigger ${idx + 1}`} Type`,
          value: trigger.type || 'webhook',
          type: 'string',
          path: `triggers[${idx}].type`
        },
        {
          id: `trigger-${idx}-timestamp`,
          name: `${trigger.label || `Trigger ${idx + 1}`} Timestamp`,
          value: new Date().toISOString(),
          type: 'string',
          path: `triggers[${idx}].timestamp`
        }
      ]);

      groups.push({
        id: 'triggers',
        label: 'Triggers',
        icon: Zap,
        color: '#00C6FF',
        variables: triggerVariables
      });
    }

    // 2. Workflow Steps Groups
    containers.forEach((container, containerIdx) => {
      const workflowStepChildren: VariableGroup[] = [];

      // 2a. Fields Group
      if (container.elements && container.elements.length > 0) {
        const fieldVariables: Variable[] = container.elements.flatMap((element: any, elementIdx: number) => {
          const baseVars = [
            {
              id: `field-${containerIdx}-${elementIdx}-value`,
              name: `${element.label || `Field ${elementIdx + 1}`}`,
              value: element.defaultValue || '',
              type: element.type || 'text',
              path: `steps[${containerIdx}].fields[${elementIdx}].value`
            },
            {
              id: `field-${containerIdx}-${elementIdx}-label`,
              name: `${element.label || `Field ${elementIdx + 1}`} Label`,
              value: element.label || '',
              type: 'string',
              path: `steps[${containerIdx}].fields[${elementIdx}].label`
            }
          ];

          // Add type-specific variables
          if (element.type === 'toggle') {
            baseVars.push({
              id: `field-${containerIdx}-${elementIdx}-checked`,
              name: `${element.label || `Field ${elementIdx + 1}`} Checked`,
              value: element.defaultValue ? 'true' : 'false',
              type: 'boolean',
              path: `steps[${containerIdx}].fields[${elementIdx}].checked`
            });
          }

          return baseVars;
        });

        workflowStepChildren.push({
          id: `step-${containerIdx}-fields`,
          label: 'Fields',
          icon: FileText,
          color: '#9D50BB',
          variables: fieldVariables
        });
      }

      // 2b. Nodes Group (with nested Tools)
      if (container.nodes && container.nodes.length > 0) {
        const nodeChildren: VariableGroup[] = [];

        container.nodes.forEach((node: any, nodeIdx: number) => {
          const nodeVariables: Variable[] = [
            {
              id: `node-${containerIdx}-${nodeIdx}-id`,
              name: `${node.label || `Node ${nodeIdx + 1}`} ID`,
              value: node.id || 'node_id',
              type: 'string',
              path: `steps[${containerIdx}].nodes[${nodeIdx}].id`
            },
            {
              id: `node-${containerIdx}-${nodeIdx}-output`,
              name: `${node.label || `Node ${nodeIdx + 1}`} Output`,
              value: 'AI generated output',
              type: 'string',
              path: `steps[${containerIdx}].nodes[${nodeIdx}].output`
            },
            {
              id: `node-${containerIdx}-${nodeIdx}-status`,
              name: `${node.label || `Node ${nodeIdx + 1}`} Status`,
              value: 'completed',
              type: 'string',
              path: `steps[${containerIdx}].nodes[${nodeIdx}].status`
            }
          ];

          // Tools sub-group for this node
          const toolVariables: Variable[] = [];
          if (node.config?.tools && node.config.tools.length > 0) {
            node.config.tools.forEach((tool: any, toolIdx: number) => {
              toolVariables.push(
                {
                  id: `tool-${containerIdx}-${nodeIdx}-${toolIdx}-result`,
                  name: `${tool.label || `Tool ${toolIdx + 1}`} Result`,
                  value: 'Tool execution result',
                  type: 'string',
                  path: `steps[${containerIdx}].nodes[${nodeIdx}].tools[${toolIdx}].result`
                },
                {
                  id: `tool-${containerIdx}-${nodeIdx}-${toolIdx}-status`,
                  name: `${tool.label || `Tool ${toolIdx + 1}`} Status`,
                  value: 'success',
                  type: 'string',
                  path: `steps[${containerIdx}].nodes[${nodeIdx}].tools[${toolIdx}].status`
                }
              );
            });
          }

          nodeChildren.push({
            id: `step-${containerIdx}-node-${nodeIdx}`,
            label: node.label || `Node ${nodeIdx + 1}`,
            icon: Sparkles,
            color: '#10B981',
            variables: nodeVariables,
            children: toolVariables.length > 0 ? [{
              id: `step-${containerIdx}-node-${nodeIdx}-tools`,
              label: 'Tools',
              icon: Wrench,
              color: '#F59E0B',
              variables: toolVariables
            }] : undefined
          });
        });

        workflowStepChildren.push({
          id: `step-${containerIdx}-nodes`,
          label: 'Nodes',
          icon: Sparkles,
          color: '#10B981',
          variables: [],
          children: nodeChildren
        });
      }

      // Add the workflow step group
      if (workflowStepChildren.length > 0) {
        groups.push({
          id: `step-${containerIdx}`,
          label: container.title || `Step ${containerIdx + 1}`,
          icon: FileText,
          color: '#6366F1',
          variables: [],
          children: workflowStepChildren
        });
      }
    });

    return groups;
  };

  const variableGroups = generateVariableGroups();

  // Theme colors
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgHover = theme === 'dark' ? 'hover:bg-[#2A2A3E]' : 'hover:bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Separate component for variable item to use hooks properly
  const VariableItem = ({ variable }: { variable: Variable }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'variable',
      item: variable,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });

    return (
      <div
        ref={drag}
        onClick={() => onVariableClick?.(variable.path)}
        className={`group px-3 py-2 rounded-lg ${bgHover} cursor-pointer transition-colors border ${borderColor} ${
          activeTextboxForVariable ? 'cursor-pointer' : 'cursor-move'
        } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className={`text-sm ${textPrimary} font-medium truncate`}>
              {variable.name}
            </div>
            <div className={`text-xs ${textSecondary} truncate mt-0.5`}>
              {variable.path}
            </div>
          </div>
          {onAddVariable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddVariable(variable.id);
              }}
              className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded hover:bg-[#00C6FF]/10"
            >
              <Plus className="w-3 h-3 text-[#00C6FF]" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderVariable = (variable: Variable) => {
    return <VariableItem key={variable.id} variable={variable} />;
  };

  const renderGroup = (group: VariableGroup, level: number = 0) => {
    const isExpanded = expandedGroups.has(group.id);
    const Icon = group.icon;
    const paddingLeft = level * 12;

    return (
      <div key={group.id} className="mb-1">
        {/* Group Header */}
        <div
          onClick={() => toggleGroup(group.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgHover} cursor-pointer transition-colors`}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" style={{ color: group.color }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: group.color }} />
          )}
          <Icon className="w-4 h-4" style={{ color: group.color }} />
          <span className={`${textPrimary} text-sm font-medium flex-1`}>
            {group.label}
          </span>
          <span className={`${textSecondary} text-xs`}>
            {group.variables.length + (group.children?.reduce((acc, child) => acc + child.variables.length, 0) || 0)}
          </span>
        </div>

        {/* Group Content */}
        {isExpanded && (
          <div className="mt-1 space-y-1" style={{ paddingLeft: `${paddingLeft + 12}px` }}>
            {/* Direct variables */}
            {group.variables.map(renderVariable)}

            {/* Child groups */}
            {group.children?.map(child => renderGroup(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {variableGroups.map(group => renderGroup(group))}
      
      {variableGroups.length === 0 && (
        <div className={`text-center py-8 ${textSecondary}`}>
          <p className="text-sm">No variables yet</p>
          <p className="text-xs mt-1">Add triggers, fields, or nodes to see variables</p>
        </div>
      )}
    </div>
  );
}