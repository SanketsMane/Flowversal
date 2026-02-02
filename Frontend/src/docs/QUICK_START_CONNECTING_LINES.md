# ⚡ Quick Start: Connecting Lines Integration

## 🎯 Overview
This is a condensed checklist for quickly integrating the connecting lines system into WorkflowBuilderMerged.tsx

---

## ✅ Pre-flight Checklist

- [ ] File created: `/components/workflow-builder/WorkflowConnectingLines.tsx` ✓ (Already done)
- [ ] Preview Mode fixed with proper buttons ✓ (Already done)
- [ ] Ready to edit: `/components/WorkflowBuilderMerged.tsx`

---

## 📝 Integration Steps (Quick Version)

### **Step 1: Imports** (Line ~1-50)
```typescript
import { WorkflowConnectingLines } from './workflow-builder/WorkflowConnectingLines';
```

### **Step 2: Add State** (Line ~1150-1200)
```typescript
const [enabledStates, setEnabledStates] = useState({
  triggers: {} as Record<string, boolean>,
  fields: {} as Record<string, boolean>,
  nodes: {} as Record<string, boolean>,
  tools: {} as Record<string, boolean>
});
```

### **Step 3: Initialize State** (Line ~1250-1300)
```typescript
useEffect(() => {
  const newStates = {
    triggers: {} as Record<string, boolean>,
    fields: {} as Record<string, boolean>,
    nodes: {} as Record<string, boolean>,
    tools: {} as Record<string, boolean>
  };

  triggers.forEach(trigger => {
    newStates.triggers[trigger.id] = trigger.config?.enabled !== false;
  });

  containers.forEach(container => {
    container.elements?.forEach((element: any) => {
      newStates.fields[element.id] = element.enabled !== false;
    });
    container.nodes?.forEach((node: any) => {
      newStates.nodes[node.id] = node.enabled !== false;
      node.tools?.forEach((tool: any) => {
        newStates.tools[tool.id || `${node.id}-${tool.type}`] = tool.enabled !== false;
      });
    });
  });

  setEnabledStates(newStates);
}, [containers, triggers]);
```

### **Step 4: Add Handler** (Line ~1400-1500)
```typescript
const handleDotClick = (
  type: 'trigger' | 'field' | 'node' | 'tool',
  id: string,
  containerIndex?: number,
  nodeIndex?: number
) => {
  const newStates = { ...enabledStates };
  
  if (type === 'trigger') {
    newStates.triggers[id] = !newStates.triggers[id];
    const triggerIdx = triggers.findIndex(t => t.id === id);
    if (triggerIdx !== -1) {
      const newTriggers = [...triggers];
      newTriggers[triggerIdx].config.enabled = newStates.triggers[id];
      setTriggers(newTriggers);
    }
  } else if (type === 'field') {
    newStates.fields[id] = !newStates.fields[id];
    const newContainers = [...containers];
    for (let i = 0; i < newContainers.length; i++) {
      const fieldIdx = newContainers[i].elements?.findIndex((e: any) => e.id === id);
      if (fieldIdx !== undefined && fieldIdx !== -1) {
        newContainers[i].elements[fieldIdx].enabled = newStates.fields[id];
        setContainers(newContainers);
        break;
      }
    }
  } else if (type === 'node') {
    newStates.nodes[id] = !newStates.nodes[id];
    if (containerIndex !== undefined) {
      const newContainers = [...containers];
      const nodeIdx = newContainers[containerIndex].nodes?.findIndex((n: any) => n.id === id);
      if (nodeIdx !== undefined && nodeIdx !== -1) {
        newContainers[containerIndex].nodes![nodeIdx].enabled = newStates.nodes[id];
        setContainers(newContainers);
      }
    }
  } else if (type === 'tool') {
    newStates.tools[id] = !newStates.tools[id];
    if (containerIndex !== undefined && nodeIndex !== undefined) {
      const newContainers = [...containers];
      const tool = newContainers[containerIndex].nodes?.[nodeIndex]?.config?.tools?.find((t: any) => (t.id || `${newContainers[containerIndex].nodes![nodeIndex].id}-${t.type}`) === id);
      if (tool) {
        tool.enabled = newStates.tools[id];
        setContainers(newContainers);
      }
    }
  }
  
  setEnabledStates(newStates);
};
```

---

## 🏷️ Data Attributes to Add

### **Triggers** (Search: `triggers.map`)
```typescript
data-trigger-id={trigger.id}
```

### **Containers** (Search: `containers.map`)
```typescript
data-container-id={container.id}
```

### **Fields** (Search: `container.elements?.map`)
```typescript
data-container-index={containerIndex}
data-element-index={elementIndex}
```

### **Nodes** (Search: `container.nodes?.map`)
```typescript
data-node-container={containerIndex}
data-node-index={nodeIndex}
```

### **Tools** (Search: `node.config.tools?.map` or `node.tools?.map`)
```typescript
data-tool-node={`${containerIndex}-${nodeIndex}`}
data-tool-index={toolIndex}
```

---

## 🎨 Add Canvas Component

**Find:** The main canvas wrapper (has `position: relative` and `overflow-auto`)

**Add:** Right after the opening div tag:
```typescript
<WorkflowConnectingLines
  containers={containers}
  triggers={triggers}
  theme={theme}
  selectedItem={selectedItem}
  onDotClick={handleDotClick}
  enabledStates={enabledStates}
/>
```

---

## 🎛️ Add Toggle Controls

### **Field Properties Panel**
```typescript
<div>
  <label className="flex items-center justify-between">
    <span className={`text-sm ${textSecondary}`}>Enable Field</span>
    <button
      onClick={() => {
        const element = getSelectedElementData();
        if (element) {
          const newEnabled = !enabledStates.fields[element.id];
          updateSelectedElement({ enabled: newEnabled });
          setEnabledStates(prev => ({
            ...prev,
            fields: { ...prev.fields, [element.id]: newEnabled }
          }));
        }
      }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        getSelectedElementData() && enabledStates.fields[getSelectedElementData()!.id]
          ? 'bg-[#00C6FF]' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        getSelectedElementData() && enabledStates.fields[getSelectedElementData()!.id] ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  </label>
</div>
```

### **Node Properties Panel**
```typescript
<div>
  <label className="flex items-center justify-between">
    <span className={`text-sm ${textSecondary}`}>Enable Node</span>
    <button
      onClick={() => {
        if (selectedNode) {
          const node = containers[selectedNode.containerIndex].nodes![selectedNode.nodeIndex];
          const newEnabled = !enabledStates.nodes[node.id];
          const newContainers = [...containers];
          newContainers[selectedNode.containerIndex].nodes![selectedNode.nodeIndex].enabled = newEnabled;
          setContainers(newContainers);
          setEnabledStates(prev => ({
            ...prev,
            nodes: { ...prev.nodes, [node.id]: newEnabled }
          }));
        }
      }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        selectedNode && enabledStates.nodes[containers[selectedNode.containerIndex].nodes![selectedNode.nodeIndex].id]
          ? 'bg-[#00C6FF]' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        selectedNode && enabledStates.nodes[containers[selectedNode.containerIndex].nodes![selectedNode.nodeIndex].id] ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  </label>
</div>
```

### **Tool Properties Panel**
```typescript
<div>
  <label className="flex items-center justify-between">
    <span className={`text-sm ${textSecondary}`}>Enable Tool</span>
    <button
      onClick={() => {
        if (selectedNode && selectedToolIndex !== null) {
          const node = containers[selectedNode.containerIndex].nodes![selectedNode.nodeIndex];
          const tool = node.config.tools[selectedToolIndex];
          const toolId = tool.id || `${node.id}-${tool.type}`;
          const newEnabled = !enabledStates.tools[toolId];
          
          const newContainers = [...containers];
          newContainers[selectedNode.containerIndex].nodes![selectedNode.nodeIndex].config.tools[selectedToolIndex].enabled = newEnabled;
          setContainers(newContainers);
          setEnabledStates(prev => ({
            ...prev,
            tools: { ...prev.tools, [toolId]: newEnabled }
          }));
        }
      }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        /* check enabled state */ 'bg-[#00C6FF]' /* or gray */
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
    </button>
  </label>
</div>
```

---

## 🔍 Search Patterns (for finding locations)

| What to find | Search term | Approximate line |
|--------------|-------------|------------------|
| Trigger rendering | `triggers.map((trigger` | ~2100-2300 |
| Container rendering | `containers.map((container` | ~2400-2600 |
| Field rendering | `container.elements?.map` | ~2600-2900 |
| Node rendering | `container.nodes?.map` | ~2900-3100 |
| Tool rendering | `node.config.tools?.map` | ~3100-3300 |
| Canvas wrapper | `overflow-auto` + `relative` | ~3800-3900 |
| Field properties | `selectedItem?.type === 'element'` | ~3200-3400 |
| Node properties | `selectedNode` | ~2965-3200 |
| Tool properties | `selectedToolIndex` | ~3000-3200 |

---

## 🎨 Quick Color Reference

- Main Branch: `#E0E0E0` (gray)
- Triggers: `#00C6FF` (cyan)
- Fields: `#9D50BB` (purple)
- Nodes: `#10B981` (green)
- Tools: `#F59E0B` (orange)

---

## ✅ Final Testing Checklist

1. [ ] Import added
2. [ ] State added
3. [ ] useEffect added
4. [ ] Handler added
5. [ ] Data attributes on triggers
6. [ ] Data attributes on containers
7. [ ] Data attributes on fields
8. [ ] Data attributes on nodes
9. [ ] Data attributes on tools
10. [ ] Canvas component added to JSX
11. [ ] Toggle control for fields
12. [ ] Toggle control for nodes
13. [ ] Toggle control for tools
14. [ ] Lines appear when items added
15. [ ] Lines disappear when items deleted
16. [ ] Dots are clickable
17. [ ] Enable/disable works
18. [ ] Colors are correct
19. [ ] No console errors
20. [ ] Preview mode working (with proper buttons)

---

## 🚀 You're Ready!

After completing all steps:
1. Save the file
2. Test in browser
3. Add triggers, fields, nodes, tools
4. Watch the beautiful connecting lines appear!

---

**For detailed explanations, see:**
- `CONNECTING_LINES_INTEGRATION_GUIDE.md` - Full integration instructions
- `CONNECTING_LINES_VISUAL_GUIDE.md` - Visual reference and examples

**Good luck! 🎉**
