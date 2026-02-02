# 🚀 Quick Reference - New Architecture

## 📦 Import Paths

```typescript
// Everything from one place
import { 
  // Types
  Trigger, WorkflowNode, AddedTool, Container,
  // Stores
  useWorkflowStore, useSelectionStore, useUIStore,
  // Hooks
  useWorkflow, useSelection,
  // Registries
  TriggerRegistry, NodeRegistry, ToolRegistry,
} from '@/features/workflow-builder';
```

---

## 🎯 Common Tasks

### Add a Trigger
```typescript
const { addTriggerFromTemplate } = useWorkflow();
addTriggerFromTemplate('webhook'); // Automatic notification
```

### Add a Node
```typescript
const { addNodeFromTemplate } = useWorkflow();
addNodeFromTemplate(containerId, 'prompt_builder');
```

### Add a Tool
```typescript
const { addToolFromTemplate } = useWorkflow();
addToolFromTemplate(containerId, nodeId, 'slack');
```

### Update a Trigger
```typescript
const { updateTrigger } = useWorkflowStore();
updateTrigger(triggerId, { 
  label: 'New Label',
  config: { url: 'https://new-url.com' }
});
```

### Delete a Node
```typescript
const { deleteNode } = useWorkflowStore();
deleteNode(containerId, nodeId);
```

### Toggle Enable/Disable
```typescript
const { toggleTrigger, toggleNode, toggleTool } = useWorkflowStore();
toggleTrigger(triggerId);
toggleNode(containerId, nodeId);
toggleTool(containerId, nodeId, toolIndex);
```

### Select Items
```typescript
const { selectTrigger, selectNode, selectTool } = useSelection();
selectTrigger(0); // Auto-expands right panel
selectNode(0, 0); // containerIndex, nodeIndex
selectTool(0, 0, 0); // containerIndex, nodeIndex, toolIndex
```

### Validate Workflow
```typescript
const { validateWorkflow } = useWorkflow();
const { valid, errors } = validateWorkflow();
if (!valid) {
  console.error('Validation errors:', errors);
}
```

### Export Workflow
```typescript
const { exportWorkflow } = useWorkflow();
const data = exportWorkflow();
// Send to backend or download as JSON
```

### Show Notification
```typescript
const { showNotification } = useUIStore();
showNotification('Success!', 'success');
showNotification('Error occurred', 'error');
showNotification('FYI', 'info');
```

### Toggle Panels
```typescript
const { toggleLeftPanel, toggleRightPanel } = useUIStore();
toggleLeftPanel();
toggleRightPanel();
```

### Search
```typescript
// Search nodes
const results = NodeRegistry.search('prompt');

// Search tools
const tools = ToolRegistry.search('slack');

// Get by category
const aiNodes = NodeRegistry.getByCategory('ai');
```

---

## 🔍 Registry Methods

### TriggerRegistry
```typescript
// Get all triggers
TriggerRegistry.getAll();

// Get specific trigger
TriggerRegistry.get('webhook');

// Check if exists
TriggerRegistry.has('webhook');

// Search
TriggerRegistry.search('webhook');

// Create instance
TriggerRegistry.createInstance('webhook', { url: 'https://...' });

// Register new trigger
TriggerRegistry.register('custom', {
  type: 'custom',
  label: 'Custom Trigger',
  icon: MyIcon,
  defaultConfig: {},
});
```

### NodeRegistry
```typescript
// Same methods as TriggerRegistry, plus:
NodeRegistry.getByCategory('ai');
NodeRegistry.getCategories(); // ['logic', 'ai', 'action', ...]
```

### ToolRegistry
```typescript
// Same methods as TriggerRegistry
ToolRegistry.getByCategory('communication');
ToolRegistry.getCategories();
```

---

## 🏪 Store Selectors

### Workflow Store
```typescript
const { 
  // State
  workflowName,
  triggers,
  containers,
  formFields,
  triggerLogic,
  
  // Trigger actions
  addTrigger,
  updateTrigger,
  deleteTrigger,
  toggleTrigger,
  moveTrigger,
  
  // Container actions
  addContainer,
  updateContainer,
  deleteContainer,
  
  // Node actions
  addNode,
  updateNode,
  deleteNode,
  toggleNode,
  moveNode,
  
  // Tool actions
  addTool,
  updateTool,
  deleteTool,
  toggleTool,
  moveTool,
  
  // Conditional node actions
  addConditionalNode,
  updateConditionalNode,
  deleteConditionalNode,
  toggleConditionalNode,
  
  // Utility
  reset,
  loadWorkflow,
} = useWorkflowStore();
```

### Selection Store
```typescript
const {
  // State
  selection,
  
  // Actions
  selectTrigger,
  selectNode,
  selectTool,
  selectConditionalNode,
  selectContainer,
  clearSelection,
  
  // Getters
  getSelectedTrigger,
  getSelectedNode,
  getSelectedTool,
  getSelectedConditionalNode,
  isSelected,
} = useSelectionStore();
```

### UI Store
```typescript
const {
  // State
  isLeftPanelMinimized,
  isRightPanelMinimized,
  leftPanelView,
  showPreview,
  showCloseConfirm,
  searchQuery,
  notification,
  currentStep,
  
  // Panel actions
  toggleLeftPanel,
  toggleRightPanel,
  setLeftPanelView,
  minimizeLeftPanel,
  expandLeftPanel,
  minimizeRightPanel,
  expandRightPanel,
  
  // Modal actions
  openPreview,
  closePreview,
  openCloseConfirm,
  closeCloseConfirm,
  
  // Search actions
  setSearchQuery,
  clearSearch,
  
  // Notification actions
  showNotification,
  hideNotification,
  
  // Step actions
  setCurrentStep,
  nextStep,
  previousStep,
} = useUIStore();
```

---

## 🎨 Component Patterns

### Using Workflow State in a Component
```typescript
import { useWorkflowStore } from '@/features/workflow-builder';

function MyComponent() {
  const triggers = useWorkflowStore(state => state.triggers);
  const addTrigger = useWorkflowStore(state => state.addTrigger);
  
  return (
    <div>
      <p>Triggers: {triggers.length}</p>
      <button onClick={() => {
        const trigger = TriggerRegistry.createInstance('webhook');
        addTrigger(trigger);
      }}>
        Add Trigger
      </button>
    </div>
  );
}
```

### Using High-Level Hooks
```typescript
import { useWorkflow } from '@/features/workflow-builder';

function MyComponent() {
  const { triggers, addTriggerFromTemplate } = useWorkflow();
  
  return (
    <div>
      <p>Triggers: {triggers.length}</p>
      <button onClick={() => addTriggerFromTemplate('webhook')}>
        Add Trigger
      </button>
    </div>
  );
}
```

### Subscribing to Specific State
```typescript
// Only re-render when triggers change
const triggers = useWorkflowStore(state => state.triggers);

// Multiple selectors
const { triggers, containers } = useWorkflowStore(state => ({
  triggers: state.triggers,
  containers: state.containers,
}));
```

---

## 🐛 Debugging

### Check Store State in Console
```javascript
// In browser console
useWorkflowStore.getState()
useSelectionStore.getState()
useUIStore.getState()
```

### Redux DevTools
Install Redux DevTools extension, then:
- Open DevTools
- Go to "Redux" tab
- See all store actions and state changes

### Log Registry Contents
```javascript
console.log('All triggers:', TriggerRegistry.getAll());
console.log('All nodes:', NodeRegistry.getAll());
console.log('All tools:', ToolRegistry.getAll());
```

---

## 📝 Type Definitions

### Trigger
```typescript
interface Trigger {
  id: string;
  type: string;
  label: string;
  config: Record<string, any>;
  enabled?: boolean;
}
```

### WorkflowNode
```typescript
interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  category: string;
  icon: LucideIcon;
  config: Record<string, any>;
  enabled?: boolean;
}
```

### AddedTool
```typescript
interface AddedTool {
  type: string;
  label: string;
  config: Record<string, any>;
  enabled?: boolean;
}
```

### Container
```typescript
interface Container {
  id: string;
  type: 'container';
  title: string;
  subtitle?: string;
  elements: FormElement[];
  nodes: WorkflowNode[];
  fields?: FormField[];
  isFormContainer?: boolean;
}
```

---

## ⚡ Performance Tips

### Selective Subscriptions
```typescript
// ❌ Bad - re-renders on any store change
const store = useWorkflowStore();

// ✅ Good - only re-renders when triggers change
const triggers = useWorkflowStore(state => state.triggers);
```

### Memoization
```typescript
import { useMemo } from 'react';

function MyComponent() {
  const triggers = useWorkflowStore(state => state.triggers);
  
  const activeTriggers = useMemo(
    () => triggers.filter(t => t.enabled),
    [triggers]
  );
  
  return <div>{activeTriggers.length} active</div>;
}
```

---

## 🔗 Related Files

- Full documentation: `/features/workflow-builder/README.md`
- Phase 1 summary: `/PHASE_1_COMPLETE.md`
- Test component: `/features/workflow-builder/examples/TestNewArchitecture.tsx`
- Type definitions: `/features/workflow-builder/types/`
- Stores: `/features/workflow-builder/store/`
- Hooks: `/features/workflow-builder/hooks/`
- Registries: `/features/workflow-builder/registries/`
