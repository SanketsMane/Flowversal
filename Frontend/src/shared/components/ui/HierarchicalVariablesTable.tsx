import { useState } from 'react';
import { ChevronDown, ChevronRight, Zap, FileText, Sparkles, Wrench } from 'lucide-react';

interface HierarchicalVariablesTableProps {
  triggers: any[];
  containers: any[];
  theme: string;
}

export function HierarchicalVariablesTable({
  triggers,
  containers,
  theme
}: HierarchicalVariablesTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['triggers']));

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  // Theme colors
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';
  const panelBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';

  interface TableRow {
    id: string;
    level: number;
    isGroup: boolean;
    icon?: any;
    color?: string;
    name: string;
    path: string;
    value: string;
    type: string;
    hasChildren?: boolean;
  }

  const generateTableRows = (): TableRow[] => {
    const rows: TableRow[] = [];

    // 1. Triggers
    if (triggers.length > 0) {
      rows.push({
        id: 'triggers',
        level: 0,
        isGroup: true,
        icon: Zap,
        color: '#00C6FF',
        name: 'Triggers',
        path: 'triggers',
        value: `${triggers.length} trigger(s)`,
        type: 'group',
        hasChildren: true
      });

      if (expandedRows.has('triggers')) {
        triggers.forEach((trigger, idx) => {
          rows.push(
            {
              id: `trigger-${idx}-id`,
              level: 1,
              isGroup: false,
              name: `${trigger.label || `Trigger ${idx + 1}`} ID`,
              path: `triggers[${idx}].id`,
              value: trigger.id || 'trigger_id',
              type: 'string'
            },
            {
              id: `trigger-${idx}-type`,
              level: 1,
              isGroup: false,
              name: `${trigger.label || `Trigger ${idx + 1}`} Type`,
              path: `triggers[${idx}].type`,
              value: trigger.type || 'webhook',
              type: 'string'
            },
            {
              id: `trigger-${idx}-timestamp`,
              level: 1,
              isGroup: false,
              name: `${trigger.label || `Trigger ${idx + 1}`} Timestamp`,
              path: `triggers[${idx}].timestamp`,
              value: new Date().toISOString(),
              type: 'string'
            }
          );
        });
      }
    }

    // 2. Workflow Steps
    containers.forEach((container, containerIdx) => {
      const stepId = `step-${containerIdx}`;
      const hasFields = container.elements && container.elements.length > 0;
      const hasNodes = container.nodes && container.nodes.length > 0;

      if (hasFields || hasNodes) {
        rows.push({
          id: stepId,
          level: 0,
          isGroup: true,
          icon: FileText,
          color: '#6366F1',
          name: container.title || `Step ${containerIdx + 1}`,
          path: `steps[${containerIdx}]`,
          value: `${(container.elements?.length || 0) + (container.nodes?.length || 0)} item(s)`,
          type: 'group',
          hasChildren: true
        });

        if (expandedRows.has(stepId)) {
          // Fields
          if (hasFields) {
            const fieldsId = `${stepId}-fields`;
            rows.push({
              id: fieldsId,
              level: 1,
              isGroup: true,
              icon: FileText,
              color: '#9D50BB',
              name: 'Fields',
              path: `steps[${containerIdx}].fields`,
              value: `${container.elements.length} field(s)`,
              type: 'group',
              hasChildren: true
            });

            if (expandedRows.has(fieldsId)) {
              container.elements.forEach((element: any, elementIdx: number) => {
                rows.push(
                  {
                    id: `field-${containerIdx}-${elementIdx}-value`,
                    level: 2,
                    isGroup: false,
                    name: element.label || `Field ${elementIdx + 1}`,
                    path: `steps[${containerIdx}].fields[${elementIdx}].value`,
                    value: element.defaultValue || '',
                    type: element.type || 'text'
                  },
                  {
                    id: `field-${containerIdx}-${elementIdx}-label`,
                    level: 2,
                    isGroup: false,
                    name: `${element.label || `Field ${elementIdx + 1}`} Label`,
                    path: `steps[${containerIdx}].fields[${elementIdx}].label`,
                    value: element.label || '',
                    type: 'string'
                  }
                );
              });
            }
          }

          // Nodes
          if (hasNodes) {
            const nodesId = `${stepId}-nodes`;
            rows.push({
              id: nodesId,
              level: 1,
              isGroup: true,
              icon: Sparkles,
              color: '#10B981',
              name: 'Nodes',
              path: `steps[${containerIdx}].nodes`,
              value: `${container.nodes.length} node(s)`,
              type: 'group',
              hasChildren: true
            });

            if (expandedRows.has(nodesId)) {
              container.nodes.forEach((node: any, nodeIdx: number) => {
                const nodeId = `${stepId}-node-${nodeIdx}`;
                const hasTools = node.config?.tools && node.config.tools.length > 0;

                rows.push({
                  id: nodeId,
                  level: 2,
                  isGroup: true,
                  icon: Sparkles,
                  color: '#10B981',
                  name: node.label || `Node ${nodeIdx + 1}`,
                  path: `steps[${containerIdx}].nodes[${nodeIdx}]`,
                  value: hasTools ? `${node.config.tools.length} tool(s)` : 'No tools',
                  type: 'group',
                  hasChildren: true
                });

                if (expandedRows.has(nodeId)) {
                  rows.push(
                    {
                      id: `node-${containerIdx}-${nodeIdx}-id`,
                      level: 3,
                      isGroup: false,
                      name: `${node.label || `Node ${nodeIdx + 1}`} ID`,
                      path: `steps[${containerIdx}].nodes[${nodeIdx}].id`,
                      value: node.id || 'node_id',
                      type: 'string'
                    },
                    {
                      id: `node-${containerIdx}-${nodeIdx}-output`,
                      level: 3,
                      isGroup: false,
                      name: `${node.label || `Node ${nodeIdx + 1}`} Output`,
                      path: `steps[${containerIdx}].nodes[${nodeIdx}].output`,
                      value: 'AI generated output',
                      type: 'string'
                    }
                  );

                  // Tools
                  if (hasTools) {
                    const toolsId = `${nodeId}-tools`;
                    rows.push({
                      id: toolsId,
                      level: 3,
                      isGroup: true,
                      icon: Wrench,
                      color: '#F59E0B',
                      name: 'Tools',
                      path: `steps[${containerIdx}].nodes[${nodeIdx}].tools`,
                      value: `${node.config.tools.length} tool(s)`,
                      type: 'group',
                      hasChildren: true
                    });

                    if (expandedRows.has(toolsId)) {
                      node.config.tools.forEach((tool: any, toolIdx: number) => {
                        rows.push(
                          {
                            id: `tool-${containerIdx}-${nodeIdx}-${toolIdx}-result`,
                            level: 4,
                            isGroup: false,
                            name: `${tool.label || `Tool ${toolIdx + 1}`} Result`,
                            path: `steps[${containerIdx}].nodes[${nodeIdx}].tools[${toolIdx}].result`,
                            value: 'Tool execution result',
                            type: 'string'
                          },
                          {
                            id: `tool-${containerIdx}-${nodeIdx}-${toolIdx}-status`,
                            level: 4,
                            isGroup: false,
                            name: `${tool.label || `Tool ${toolIdx + 1}`} Status`,
                            path: `steps[${containerIdx}].nodes[${nodeIdx}].tools[${toolIdx}].status`,
                            value: 'success',
                            type: 'string'
                          }
                        );
                      });
                    }
                  }
                }
              });
            }
          }
        }
      }
    });

    return rows;
  };

  const tableRows = generateTableRows();

  return (
    <div className={`${bgInput} border ${borderColor} rounded-lg overflow-hidden`}>
      <table className="w-full text-sm">
        <thead className={`${panelBg} border-b ${borderColor}`}>
          <tr>
            <th className={`px-3 py-2 text-left ${textSecondary} font-medium`}>Name</th>
            <th className={`px-3 py-2 text-left ${textSecondary} font-medium`}>Path</th>
            <th className={`px-3 py-2 text-left ${textSecondary} font-medium`}>Value</th>
            <th className={`px-3 py-2 text-left ${textSecondary} font-medium text-xs`}>Type</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row) => {
            const Icon = row.icon;
            const paddingLeft = row.level * 20 + 12;

            return (
              <tr key={row.id} className={`border-b ${borderColor} last:border-0 hover:bg-[#2A2A3E]/20`}>
                <td className={`px-3 py-2.5 ${textPrimary}`} style={{ paddingLeft: `${paddingLeft}px` }}>
                  <div className="flex items-center gap-2">
                    {row.isGroup && row.hasChildren && (
                      <button
                        onClick={() => toggleRow(row.id)}
                        className="p-0.5 hover:bg-[#00C6FF]/10 rounded"
                      >
                        {expandedRows.has(row.id) ? (
                          <ChevronDown className="w-3.5 h-3.5" style={{ color: row.color }} />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" style={{ color: row.color }} />
                        )}
                      </button>
                    )}
                    {!row.isGroup && <div className="w-4" />}
                    {Icon && <Icon className="w-3.5 h-3.5" style={{ color: row.color }} />}
                    <span className={row.isGroup ? 'font-medium' : ''}>{row.name}</span>
                  </div>
                </td>
                <td className={`px-3 py-2.5 ${textSecondary} text-xs font-mono`}>
                  {row.path}
                </td>
                <td className={`px-3 py-2.5 ${textSecondary} truncate max-w-[200px]`}>
                  {row.value}
                </td>
                <td className={`px-3 py-2.5 ${textSecondary} text-xs`}>
                  {row.type}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
