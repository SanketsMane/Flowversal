interface HierarchicalVariablesJSONProps {
  triggers: any[];
  containers: any[];
  theme: string;
}

export function HierarchicalVariablesJSON({
  triggers,
  containers,
  theme
}: HierarchicalVariablesJSONProps) {
  // Generate hierarchical JSON structure
  const generateJSON = () => {
    const data: any = {};

    // 1. Triggers
    if (triggers.length > 0) {
      data.triggers = triggers.map((trigger, idx) => ({
        id: trigger.id || 'trigger_id',
        type: trigger.type || 'webhook',
        label: trigger.label || `Trigger ${idx + 1}`,
        timestamp: new Date().toISOString(),
        enabled: trigger.config?.enabled !== false
      }));
    }

    // 2. Workflow Steps
    if (containers.length > 0) {
      data.steps = containers.map((container, containerIdx) => {
        const step: any = {
          id: container.id,
          title: container.title || `Step ${containerIdx + 1}`,
          subtitle: container.subtitle || ''
        };

        // Fields
        if (container.elements && container.elements.length > 0) {
          step.fields = container.elements.map((element: any, elementIdx: number) => ({
            id: element.id,
            label: element.label || `Field ${elementIdx + 1}`,
            type: element.type || 'text',
            value: element.defaultValue || '',
            enabled: element.enabled !== false,
            path: `steps[${containerIdx}].fields[${elementIdx}].value`
          }));
        }

        // Nodes
        if (container.nodes && container.nodes.length > 0) {
          step.nodes = container.nodes.map((node: any, nodeIdx: number) => {
            const nodeData: any = {
              id: node.id,
              label: node.label || `Node ${nodeIdx + 1}`,
              type: node.type || 'ai',
              output: 'AI generated output',
              status: 'completed',
              enabled: node.enabled !== false,
              path: `steps[${containerIdx}].nodes[${nodeIdx}].output`
            };

            // Tools
            if (node.config?.tools && node.config.tools.length > 0) {
              nodeData.tools = node.config.tools.map((tool: any, toolIdx: number) => ({
                id: tool.id || `tool_${toolIdx}`,
                label: tool.label || `Tool ${toolIdx + 1}`,
                type: tool.type || 'function',
                result: 'Tool execution result',
                status: 'success',
                enabled: tool.enabled !== false,
                path: `steps[${containerIdx}].nodes[${nodeIdx}].tools[${toolIdx}].result`
              }));
            }

            return nodeData;
          });
        }

        return step;
      });
    }

    return data;
  };

  const jsonData = generateJSON();

  // Theme colors
  const textColor = theme === 'dark' ? 'text-[#E0E0E0]' : 'text-gray-800';
  const bgInput = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200';

  // Custom JSON syntax highlighting
  const renderJSON = (obj: any, indent = 0): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const indentStr = '  '.repeat(indent);

    if (Array.isArray(obj)) {
      elements.push(
        <div key={`array-open-${indent}`}>
          <span className="text-[#E0E0E0]">[</span>
        </div>
      );

      obj.forEach((item, idx) => {
        elements.push(
          <div key={`array-item-${indent}-${idx}`}>
            {indentStr}  {renderJSON(item, indent + 1)}
            {idx < obj.length - 1 && <span className="text-[#E0E0E0]">,</span>}
          </div>
        );
      });

      elements.push(
        <div key={`array-close-${indent}`}>
          {indentStr}<span className="text-[#E0E0E0]">]</span>
        </div>
      );
    } else if (typeof obj === 'object' && obj !== null) {
      elements.push(
        <div key={`obj-open-${indent}`}>
          <span className="text-[#E0E0E0]">{'{'}</span>
        </div>
      );

      const keys = Object.keys(obj);
      keys.forEach((key, idx) => {
        const value = obj[key];
        elements.push(
          <div key={`obj-key-${indent}-${key}`} className="flex">
            <span className="text-[#E0E0E0]">{indentStr}  </span>
            <span className="text-[#00C6FF]">"{key}"</span>
            <span className="text-[#E0E0E0]">: </span>
            <span>
              {typeof value === 'string' ? (
                <span className="text-[#9D50BB]">"{value}"</span>
              ) : typeof value === 'number' ? (
                <span className="text-[#F59E0B]">{value}</span>
              ) : typeof value === 'boolean' ? (
                <span className="text-[#10B981]">{value.toString()}</span>
              ) : (
                renderJSON(value, indent + 1)
              )}
            </span>
            {idx < keys.length - 1 && <span className="text-[#E0E0E0]">,</span>}
          </div>
        );
      });

      elements.push(
        <div key={`obj-close-${indent}`}>
          {indentStr}<span className="text-[#E0E0E0]">{'}'}</span>
        </div>
      );
    } else if (typeof obj === 'string') {
      return [<span key={`str-${indent}`} className="text-[#9D50BB]">"{obj}"</span>];
    } else if (typeof obj === 'number') {
      return [<span key={`num-${indent}`} className="text-[#F59E0B]">{obj}</span>];
    } else if (typeof obj === 'boolean') {
      return [<span key={`bool-${indent}`} className="text-[#10B981]">{obj.toString()}</span>];
    }

    return elements;
  };

  return (
    <div className={`${bgInput} border ${borderColor} rounded-lg p-4 overflow-auto max-h-[600px]`}>
      <pre className={`text-xs ${textColor} font-mono leading-relaxed`}>
        {JSON.stringify(jsonData, null, 2)}
      </pre>
    </div>
  );
}
