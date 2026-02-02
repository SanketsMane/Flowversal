# 🔌 Connecting Lines Integration Guide

## Overview
This guide provides step-by-step instructions to integrate the connecting lines system into the WorkflowBuilderMerged component.

---

## 📋 Step 1: Add State for Enabled Items

**Location:** Near the top of `WorkflowBuilderMergedContent` function, after existing useState declarations (around line 1150-1200)

**Code to Add:**
```typescript
const [enabledStates, setEnabledStates] = useState({
  triggers: {} as Record<string, boolean>,
  fields: {} as Record<string, boolean>,
  nodes: {} as Record<string, boolean>,
  tools: {} as Record<string, boolean>
});
```

**Why:** This state tracks which items are enabled/disabled and controls line visibility.

---

## 📋 Step 2: Import WorkflowConnectingLines Component

**Location:** At the top of the file with other imports

**Code to Add:**
```typescript
import { WorkflowConnectingLines } from './workflow-builder/WorkflowConnectingLines';
```

---

## 📋 Step 3: Initialize Enabled States

**Location:** Add a useEffect after the existing useEffects (around line 1250-1300)

**Code to Add:**
```typescript
// Initialize enabled states when containers or triggers change
useEffect(() => {
  const newStates = {
    triggers: {} as Record<string, boolean>,
    fields: {} as Record<string, boolean>,
    nodes: {} as Record<string, boolean>,
    tools: {} as Record<string, boolean>
  };

  // Set all triggers as enabled by default (checking their config)
  triggers.forEach(trigger => {
    newStates.triggers[trigger.id] = trigger.config?.enabled !== false;
  });

  // Set all fields, nodes, and tools as enabled by default
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

**Why:** This keeps the enabled states in sync with the actual workflow configuration.

---

## 📋 Step 4: Add Data Attributes to TRIGGERS

**Location:** Find where triggers are rendered (search for `triggers.map`)

**What to Find:**
```typescript
{triggers.map((trigger, index) => (
  <div 
    key={trigger.id}
    // ... existing props
```

**What to Add:**
Add `data-trigger-id={trigger.id}` to the trigger div:
```typescript
{triggers.map((trigger, index) => (
  <div 
    key={trigger.id}
    data-trigger-id={trigger.id}  // ADD THIS LINE
    // ... existing props
```

**Example Context:** Look for the trigger rendering around line 2100-2300 where it shows trigger names and icons.

---

## 📋 Step 5: Add Data Attributes to CONTAINERS

**Location:** Find where containers are rendered (search for `containers.map`)

**What to Find:**
```typescript
{containers.map((container, containerIndex) => (
  <div
    key={container.id}
    // ... existing props
```

**What to Add:**
Add `data-container-id={container.id}` to the container div:
```typescript
{containers.map((container, containerIndex) => (
  <div
    key={container.id}
    data-container-id={container.id}  // ADD THIS LINE
    // ... existing props
```

**Example Context:** Around line 2400-2600 where workflow steps are rendered.

---

## 📋 Step 6: Add Data Attributes to FIELDS/ELEMENTS

**Location:** Find where elements are rendered inside containers (search for `container.elements?.map`)

**What to Find:**
```typescript
{container.elements?.map((element, elementIndex) => (
  <div
    key={element.id}
    // ... existing props
```

**What to Add:**
Add both data attributes to the element div:
```typescript
{container.elements?.map((element, elementIndex) => (
  <div
    key={element.id}
    data-container-index={containerIndex}  // ADD THIS LINE
    data-element-index={elementIndex}      // ADD THIS LINE
    // ... existing props
```

**Example Context:** Around line 2600-2900 where form fields are rendered.

---

## 📋 Step 7: Add Data Attributes to NODES

**Location:** Find where nodes are rendered inside containers (search for `container.nodes?.map`)

**What to Find:**
```typescript
{container.nodes?.map((node, nodeIndex) => (
  <div
    key={node.id}
    // ... existing props
```

**What to Add:**
Add both data attributes to the node div:
```typescript
{container.nodes?.map((node, nodeIndex) => (
  <div
    key={node.id}
    data-node-container={containerIndex}  // ADD THIS LINE
    data-node-index={nodeIndex}           // ADD THIS LINE
    // ... existing props
```

**Example Context:** Around line 2900-3100 where AI nodes are rendered.

---

## 📋 Step 8: Add Data Attributes to TOOLS (if rendered separately)

**Location:** Find where tools are rendered inside nodes (search for `node.tools?.map` or `node.config.tools?.map`)

**What to Find:**
```typescript
{node.config.tools?.map((tool, toolIndex) => (
  <div
    key={toolIndex}
    // ... existing props
```

**What to Add:**
Add both data attributes to the tool div:
```typescript
{node.config.tools?.map((tool, toolIndex) => (
  <div
    key={toolIndex}
    data-tool-node={`${containerIndex}-${nodeIndex}`}  // ADD THIS LINE
    data-tool-index={toolIndex}                         // ADD THIS LINE
    // ... existing props
```

**Example Context:** Around line 3100-3300 where tools within nodes are rendered.

---

## 📋 Step 9: Add Dot Click Handler

**Location:** Add this function after the existing handlers (around line 1400-1500)

**Code to Add:**
```typescript
const handleDotClick = (
  type: 'trigger' | 'field' | 'node' | 'tool',
  id: string,
  containerIndex?: number,
  nodeIndex?: number
) => {
  const newStates = { ...enabledStates };
  
  if (type === 'trigger') {
    // Toggle trigger enabled state
    newStates.triggers[id] = !newStates.triggers[id];
    
    // Update the actual trigger config
    const triggerIdx = triggers.findIndex(t => t.id === id);
    if (triggerIdx !== -1) {
      const newTriggers = [...triggers];
      newTriggers[triggerIdx].config.enabled = newStates.triggers[id];
      setTriggers(newTriggers);
    }
  } else if (type === 'field') {
    // Toggle field enabled state
    newStates.fields[id] = !newStates.fields[id];
    
    // Update the actual field
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
    // Toggle node enabled state
    newStates.nodes[id] = !newStates.nodes[id];
    
    // Update the actual node
    if (containerIndex !== undefined) {
      const newContainers = [...containers];
      const nodeIdx = newContainers[containerIndex].nodes?.findIndex((n: any) => n.id === id);
      if (nodeIdx !== undefined && nodeIdx !== -1) {
        newContainers[containerIndex].nodes![nodeIdx].enabled = newStates.nodes[id];
        setContainers(newContainers);
      }
    }
  } else if (type === 'tool') {
    // Toggle tool enabled state
    newStates.tools[id] = !newStates.tools[id];
    
    // Update the actual tool
    if (containerIndex !== undefined && nodeIndex !== undefined) {
      const newContainers = [...containers];
      const toolIdx = newContainers[containerIndex].nodes?.[nodeIndex]?.config?.tools?.findIndex((t: any) => (t.id || `${newContainers[containerIndex].nodes![nodeIndex].id}-${t.type}`) === id);
      if (toolIdx !== undefined && toolIdx !== -1) {
        newContainers[containerIndex].nodes![nodeIndex].config.tools[toolIdx].enabled = newStates.tools[id];
        setContainers(newContainers);
      }
    }
  }
  
  setEnabledStates(newStates);
};
```

**Why:** This handles clicking on connection dots to enable/disable items.

---

## 📋 Step 10: Add Toggle Controls to Property Panels

### For Fields (in Field Properties Panel):

**Location:** Find the field properties panel (where field label, description, etc. are edited)

**Code to Add:**
```typescript
{/* Enable Field Toggle */}
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
          ? 'bg-[#00C6FF]' 
          : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          getSelectedElementData() && enabledStates.fields[getSelectedElementData()!.id] ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </label>
</div>
```

**Where:** Add this in the field properties section, similar to where "Required" toggle is.

---

### For Nodes (in Node Properties Panel):

**Location:** Find the node properties panel

**Code to Add:**
```typescript
{/* Enable Node Toggle */}
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
          ? 'bg-[#00C6FF]' 
          : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          selectedNode && enabledStates.nodes[containers[selectedNode.containerIndex].nodes![selectedNode.nodeIndex].id] ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </label>
</div>
```

---

### For Tools (in Tool Properties Panel):

**Location:** Find where tool settings are shown

**Code to Add:**
```typescript
{/* Enable Tool Toggle */}
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
        selectedNode && selectedToolIndex !== null && enabledStates.tools[/* get tool id */]
          ? 'bg-[#00C6FF]' 
          : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${/* check if enabled */}`} />
    </button>
  </label>
</div>
```

---

## 📋 Step 11: Add WorkflowConnectingLines Component to JSX

**Location:** Find the main canvas/workflow area rendering (around line 3800-3900), look for where containers are mapped and rendered

**What to Find:**
The div that wraps the entire workflow canvas area (should be a relative container)

**What to Add:**
```typescript
<div className="relative flex-1 overflow-auto ...">  {/* The main canvas wrapper */}
  {/* ADD THIS RIGHT AFTER THE OPENING DIV */}
  <WorkflowConnectingLines
    containers={containers}
    triggers={triggers}
    theme={theme}
    selectedItem={selectedItem}
    onDotClick={handleDotClick}
    enabledStates={enabledStates}
  />
  
  {/* ... rest of the canvas content (containers, triggers, etc.) ... */}
</div>
```

**Why:** This renders the canvas component that draws all the connecting lines on top of the workflow.

---

## 🎨 Color Reference

The connecting lines use these colors:
- **Main Branch**: `#E0E0E0` (light gray) in dark mode, `#9CA3AF` in light mode
- **Triggers**: `#00C6FF` (cyan)
- **Fields**: `#9D50BB` (purple)
- **Nodes**: `#10B981` (green)
- **Tools**: `#F59E0B` (orange)

---

## ✅ Testing Checklist

After integration, test:
1. ✅ Lines appear when triggers, fields, nodes, and tools are added
2. ✅ Main branch connects Triggers → Fields → Nodes
3. ✅ Sub-branches connect all triggers together (cyan)
4. ✅ Sub-branches connect all fields together (purple)
5. ✅ Sub-branches connect all nodes together (green)
6. ✅ Super sub-branches connect tools under each node (orange)
7. ✅ Clicking dots toggles enable/disable state
8. ✅ Disabled items show grayed-out dots and no connecting lines
9. ✅ Lines update in real-time when items are added/removed/reordered
10. ✅ Lines only show in Builder mode, not Preview mode
11. ✅ Lines disappear smoothly when items are deleted
12. ✅ Toggle controls work in property panels

---

## 🐛 Troubleshooting

**Lines not appearing:**
- Check that data attributes are correctly added to ALL rendered elements
- Verify WorkflowConnectingLines is imported and added to JSX
- Check browser console for errors

**Lines in wrong positions:**
- Ensure data attributes match the selectors in WorkflowConnectingLines.tsx
- Check that the canvas wrapper has `position: relative`

**Dots not clickable:**
- The canvas has `pointer-events-none` but dots should be clickable areas
- This feature may need additional click detection logic

**Lines not updating:**
- Check that enabledStates is being updated correctly
- Verify the useEffect dependencies in step 3

---

## 📝 Notes

- The WorkflowConnectingLines component uses HTML Canvas for rendering
- Lines are drawn using requestAnimationFrame for smooth animations
- The component automatically recalculates positions when window resizes
- Z-index is set to 5 to appear above the background but below modals

---

## 🎯 Next Steps After Integration

1. Test thoroughly with different workflow configurations
2. Fine-tune line colors and thickness if needed
3. Add smooth animations for line appearance/disappearance
4. Consider adding hover effects on lines
5. Implement click detection on lines (not just dots) if needed

---

**Need help?** Check the WorkflowConnectingLines.tsx file for implementation details!
