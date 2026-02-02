# 🏗️ Architecture Overview - Workflow Builder

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         REACT COMPONENTS                         │
│                     (To be created in Phase 2)                  │
│                                                                  │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐        │
│  │  Sidebar   │  │    Canvas    │  │ Property Panel  │        │
│  │  (Left)    │  │   (Center)   │  │     (Right)     │        │
│  └────────────┘  └──────────────┘  └─────────────────┘        │
└───────────┬────────────┬─────────────────┬────────────────────┘
            │            │                 │
            ▼            ▼                 ▼
┌───────────────────────────────────────────────────────────────┐
│                      CUSTOM HOOKS                              │
│                   (Phase 1 - COMPLETE ✅)                      │
│                                                                │
│  ┌──────────────┐              ┌──────────────┐              │
│  │ useWorkflow  │              │ useSelection │              │
│  │              │              │              │              │
│  │ • addTrigger │              │ • selectNode │              │
│  │ • validate   │              │ • clearSel   │              │
│  │ • export     │              │ • isSelected │              │
│  └──────────────┘              └──────────────┘              │
└───────────┬────────────────────────┬──────────────────────────┘
            │                        │
            ▼                        ▼
┌───────────────────────────────────────────────────────────────┐
│                     ZUSTAND STORES                             │
│                   (Phase 1 - COMPLETE ✅)                      │
│                                                                │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │ workflowStore  │  │ selectionStore │  │   uiStore     │  │
│  │                │  │                │  │               │  │
│  │ • triggers     │  │ • selection    │  │ • panels      │  │
│  │ • containers   │  │ • isSelected() │  │ • modals      │  │
│  │ • nodes        │  │ • getSelected()│  │ • notification│  │
│  │ • tools        │  │                │  │ • search      │  │
│  └────────────────┘  └────────────────┘  └───────────────┘  │
└───────────┬────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│                   REGISTRY SYSTEM                              │
│                   (Phase 1 - COMPLETE ✅)                      │
│                                                                │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ TriggerRegistry │  │ NodeRegistry │  │  ToolRegistry   │ │
│  │                 │  │              │  │                 │ │
│  │ • getAll()      │  │ • getAll()   │  │ • getAll()      │ │
│  │ • get(type)     │  │ • search()   │  │ • search()      │ │
│  │ • search()      │  │ • getByCategory│ • getByCategory│ │
│  │ • create()      │  │ • create()   │  │ • create()      │ │
│  └─────────────────┘  └──────────────┘  └─────────────────┘ │
└───────────┬────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│                    TYPE DEFINITIONS                            │
│                   (Phase 1 - COMPLETE ✅)                      │
│                                                                │
│  • Trigger         • WorkflowNode      • AddedTool            │
│  • Container       • FormField         • ConditionalNode      │
│  • TriggerLogic    • NodeCategory      • LeftPanelView        │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Adding a Trigger (Example Flow)

```
User Clicks "Add Webhook Trigger"
          ↓
    useWorkflow()
          ↓
addTriggerFromTemplate('webhook')
          ↓
TriggerRegistry.createInstance('webhook')
          ↓
workflowStore.addTrigger(trigger)
          ↓
uiStore.showNotification('Trigger added!', 'success')
          ↓
Component Re-renders with New Trigger
```

### Selecting a Node (Example Flow)

```
User Clicks Node
          ↓
    useSelection()
          ↓
selectNode(containerIndex, nodeIndex)
          ↓
selectionStore.selectNode(...)
          ↓
uiStore.expandRightPanel()
          ↓
Property Panel Opens with Node Details
```

---

## 🧩 Component Hierarchy (Future - Phase 2)

```
WorkflowBuilder (Main Container)
├── WorkflowSidebar (Left Panel)
│   ├── SidebarTabs
│   ├── TriggersList
│   │   └── DraggableTrigger × N
│   ├── NodesList (Hierarchical)
│   │   └── DraggableNode × N
│   └── ToolsList
│       └── DraggableTool × N
│
├── WorkflowCanvas (Center)
│   ├── ZoomControls
│   ├── TriggerSection
│   │   ├── TriggerNode × N
│   │   └── LogicOperator (AND/OR)
│   └── StepContainer × N
│       ├── StepHeader (Editable)
│       ├── WorkflowNode × N
│       │   ├── PromptBuilderNode
│       │   │   └── ToolBox × N
│       │   └── ConditionalNode
│       │       ├── TrueBranch
│       │       └── FalseBranch
│       └── DropZone
│   └── ConnectingLines (SVG Overlay)
│
└── PropertiesPanel (Right Panel)
    ├── TriggerProperties
    │   ├── EnableToggle
    │   ├── NameInput
    │   └── ConfigFields
    ├── NodeProperties
    │   ├── EnableToggle
    │   ├── AIModelSelector
    │   └── ToolDropZone
    └── ToolProperties
        ├── EnableToggle
        └── ConfigFields
```

---

## 📊 State Management Strategy

### 🔵 Server State (Future - React Query)
```
Backend/Supabase
       ↓
React Query Cache
       ↓
Components
```

**For:**
- Saved workflows (CRUD)
- User data
- Templates from backend
- Shared workflows

### 🟢 Client State (Zustand - Phase 1)
```
User Interactions
       ↓
Zustand Stores
       ↓
Components
```

**For:**
- Current workflow being edited
- UI state (panels, modals)
- Selection state
- Temporary data

### 🟡 Component State (React useState)
```
User Input
    ↓
useState/useReducer
    ↓
Component Only
```

**For:**
- Form inputs
- Temporary UI state
- Animation states
- Component-specific data

---

## 🎯 Design Patterns Used

### 1. **Registry Pattern**
```typescript
// Register once, use everywhere
TriggerRegistry.register('webhook', {...});

// Use anywhere
const trigger = TriggerRegistry.createInstance('webhook');
```

**Benefits:**
- Easy to add new triggers/nodes/tools
- No core file modifications
- Plugin-style architecture

### 2. **Facade Pattern (Custom Hooks)**
```typescript
// Instead of:
const { triggers } = useWorkflowStore();
const { showNotification } = useUIStore();
const trigger = TriggerRegistry.createInstance('webhook');
// ... complex logic

// Use:
const { addTriggerFromTemplate } = useWorkflow();
addTriggerFromTemplate('webhook'); // Everything handled
```

**Benefits:**
- Simplified API
- Encapsulated complexity
- Consistent behavior

### 3. **Store Pattern (Zustand)**
```typescript
// Centralized state
const useWorkflowStore = create((set) => ({
  triggers: [],
  addTrigger: (trigger) => set((state) => ({
    triggers: [...state.triggers, trigger]
  }))
}));
```

**Benefits:**
- No prop drilling
- Predictable updates
- DevTools integration
- Automatic persistence

### 4. **Factory Pattern (Registry.createInstance)**
```typescript
// Create instances from templates
const trigger = TriggerRegistry.createInstance('webhook', {
  url: 'https://...'
});
```

**Benefits:**
- Consistent object creation
- Default values applied
- Type-safe instances

---

## 🔐 Type Safety Flow

```
TypeScript Interfaces (types/)
          ↓
Registry Definitions
          ↓
Zustand Store State
          ↓
Custom Hooks
          ↓
React Components
          ↓
Full IntelliSense + Type Checking
```

---

## 📦 Module Dependencies

```
Components (Phase 2)
    ↓ depends on
Custom Hooks (Phase 1) ✅
    ↓ depends on
Zustand Stores (Phase 1) ✅
    ↓ depends on
Registries (Phase 1) ✅
    ↓ depends on
Types (Phase 1) ✅
```

**Key principle:** Lower layers have NO dependencies on upper layers.

---

## 🚀 Future Scalability

### Adding a New Feature Module

```
/features/
├── workflow-builder/      # ✅ Phase 1 Complete
├── form-builder/          # 🔜 Future
├── ai-agents/             # 🔜 Future
├── analytics/             # 🔜 Future
└── automation-rules/      # 🔜 Future
```

Each feature follows the same pattern:
```
/feature-name/
├── types/
├── store/
├── hooks/
├── components/
├── utils/
└── index.ts
```

### Shared Code

```
/lib/
├── api/                   # Shared API helpers
├── utils/                 # Shared utilities
└── supabase/              # Supabase client

/hooks/
└── useAuth.ts             # Global auth hook

/components/common/
└── LoadingSpinner.tsx     # Shared components
```

---

## 🧪 Testing Strategy (Future)

```
Unit Tests
├── Store Tests (Zustand)
├── Hook Tests (React Testing Library)
├── Registry Tests (Jest)
└── Utility Tests (Jest)

Integration Tests
├── Component + Store Integration
└── Full Workflow Tests

E2E Tests (Playwright/Cypress)
└── User Journey Tests
```

---

## 📈 Performance Considerations

### Zustand Optimization
```typescript
// ❌ Bad - subscribes to entire store
const store = useWorkflowStore();

// ✅ Good - selective subscription
const triggers = useWorkflowStore(state => state.triggers);
```

### React Optimization
```typescript
// Memoization for expensive computations
const processedData = useMemo(() => {
  return expensiveOperation(data);
}, [data]);

// Callback memoization
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

### Component Splitting
```
Large Component (2,144 lines) ❌
    ↓ refactor into
50+ Focused Components (30-100 lines each) ✅
```

---

## 🎨 Design System Integration

```
Tailwind CSS + shadcn/ui
         ↓
Design Tokens (globals.css)
         ↓
Component Variants
         ↓
Consistent UI Across App
```

**Key files:**
- `/styles/globals.css` - Design tokens, dark theme
- `/components/ui/*` - shadcn components
- Consistent gradients: `bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500`

---

## 🔒 Data Persistence

```
User Edits Workflow
        ↓
Zustand Store (In-Memory)
        ↓
LocalStorage (Auto-Persist) - Phase 1 ✅
        ↓
Supabase (Backend) - Future
```

**Current:** Auto-save to localStorage via Zustand persist middleware
**Future:** Sync with Supabase for cloud storage

---

## 📱 Responsive Design (Future)

```
Desktop (1920px+)
├── 3-Panel Layout
└── Full Features

Tablet (768px-1919px)
├── Collapsible Panels
└── Most Features

Mobile (< 768px)
├── Single Panel View
├── Bottom Sheet for Properties
└── Essential Features
```

---

## 🎯 Key Architectural Principles

1. **Separation of Concerns**
   - Types ≠ Logic ≠ UI ≠ State

2. **Single Responsibility**
   - Each file/component has ONE job

3. **DRY (Don't Repeat Yourself)**
   - Shared logic in hooks/utils

4. **Open/Closed Principle**
   - Open for extension (registries)
   - Closed for modification (core logic)

5. **Dependency Inversion**
   - Depend on abstractions (types/interfaces)
   - Not concrete implementations

---

## 📚 Related Documentation

- [Quick Reference](./QUICK_REFERENCE.md) - Common tasks
- [README](./README.md) - Detailed documentation
- [Phase 1 Summary](/PHASE_1_COMPLETE.md) - Implementation status
- [Test Component](./examples/TestNewArchitecture.tsx) - Working examples

---

**Architecture Version:** 1.0.0 (Phase 1)
**Last Updated:** Phase 1 Complete
**Status:** ✅ Foundation Complete, Ready for Phase 2
