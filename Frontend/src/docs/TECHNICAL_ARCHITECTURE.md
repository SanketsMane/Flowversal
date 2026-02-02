# 🏗️ Technical Architecture - Flowversal Workflow Builder

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Builder UI                       │
│                                                               │
│  ┌────────────┐  ┌─────────────────┐  ┌──────────────────┐ │
│  │   Left     │  │     Canvas      │  │      Right       │ │
│  │   Panel    │  │                  │  │     Panel        │ │
│  │            │  │  ┌────────────┐  │  │                  │ │
│  │  • Forms   │  │  │  Builder   │  │  │  • Properties  │ │
│  │  • Nodes   │  │  │    View    │  │  │  • Settings    │ │
│  │  • Tools   │  │  └────────────┘  │  │  • Variables   │ │
│  │  • Vars    │  │       OR          │  │                  │ │
│  │            │  │  ┌────────────┐  │  │                  │ │
│  └────────────┘  │  │  Mind Map  │  │  └──────────────────┘ │
│                  │  │    View    │  │                       │
│                  │  └────────────┘  │                       │
│                  └─────────────────┘                       │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Preview Modal (Overlay)                   │  │
│  │  ┌──────────────────┐  ┌──────────────────┐          │  │
│  │  │  Form (50%)      │  │  Output (50%)    │          │  │
│  │  └──────────────────┘  └──────────────────┘          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Core Components

### **1. WorkflowBuilderMerged.tsx**

The main orchestrator component.

**Responsibilities:**
- State management (triggers, containers, nodes, tools)
- View mode switching (builder/mindmap)
- Panel visibility control
- Drag & drop coordination
- Modal management
- Data persistence

**Key State:**
```typescript
// Workflow data
const [containers, setContainers] = useState<ContainerElement[]>([])
const [triggers, setTriggers] = useState<TriggerNodeType[]>([])

// UI state
const [viewMode, setViewMode] = useState<'builder' | 'mindmap'>('builder')
const [selectedItem, setSelectedItem] = useState<SelectedItem>(null)
const [showPreview, setShowPreview] = useState(false)

// Connecting lines
const [enabledStates, setEnabledStates] = useState({
  triggers: {},
  fields: {},
  nodes: {},
  tools: {}
})
```

**Render Flow:**
```
WorkflowBuilderMerged
  ├─ Top Bar (View Toggle, Theme, Save, Preview, Publish)
  ├─ Left Panel (Forms, Nodes, Tools, Variables)
  ├─ Canvas
  │   ├─ Builder View
  │   │   ├─ Triggers Section
  │   │   └─ Workflow Steps
  │   │       ├─ Form Fields
  │   │       └─ AI Nodes
  │   │           └─ Tools
  │   └─ Mind Map View
  │       └─ WorkflowMindMapView
  ├─ Right Panel (Properties)
  └─ Modals
      ├─ EnhancedPreviewModal
      ├─ CloseConfirmModal
      └─ DeleteConfirmModal
```

---

### **2. WorkflowMindMapView.tsx**

Canvas-based mind map visualization.

**Architecture:**
```typescript
interface Node {
  id: string
  type: 'trigger' | 'workflow-step' | 'field' | 'node' | 'tool'
  label: string
  x: number  // Calculated position
  y: number
  width: number
  height: number
  color: string
  parentId?: string  // For hierarchical layout
}

interface Connection {
  from: string  // Node ID
  to: string    // Node ID
  color: string
  type: 'main' | 'sub' | 'tool'
}
```

**Rendering Pipeline:**
```
1. Data Transform
   └─ Containers + Triggers → Nodes + Connections

2. Layout Calculation
   └─ Hierarchical positioning algorithm

3. Canvas Rendering
   ├─ Clear canvas
   ├─ Apply zoom/pan transformations
   ├─ Draw grid background
   ├─ Draw connections (Bezier curves)
   └─ Draw nodes (rounded rectangles)

4. Interaction Layer
   ├─ Mouse events → Canvas coordinates
   ├─ Hit detection on nodes
   └─ Callback to parent component
```

**Layout Algorithm:**
```typescript
function calculateLayout(containers, triggers) {
  let currentY = 100
  const centerX = 600
  const nodes: Node[] = []
  
  // Level 1: Triggers (top, horizontal)
  triggers.forEach((trigger, idx) => {
    nodes.push({
      x: centerX + (idx - triggers.length/2) * 200,
      y: currentY,
      type: 'trigger'
    })
  })
  currentY += 250
  
  // Level 2: Workflow Steps (centered)
  containers.forEach((container) => {
    nodes.push({
      x: centerX - 150,
      y: currentY,
      type: 'workflow-step'
    })
    currentY += 150
    
    // Level 3: Fields (horizontal under step)
    container.elements.forEach((element, idx) => {
      nodes.push({
        x: centerX + (idx - elements.length/2) * 160,
        y: currentY,
        type: 'field',
        parentId: container.id
      })
    })
    currentY += 120
    
    // Level 4: Nodes (horizontal)
    container.nodes.forEach((node, idx) => {
      nodes.push({
        x: centerX + (idx - nodes.length/2) * 180,
        y: currentY,
        type: 'node',
        parentId: container.id
      })
      
      // Level 5: Tools (horizontal under each node)
      node.tools.forEach((tool, toolIdx) => {
        nodes.push({
          x: nodeX + (toolIdx - tools.length/2) * 100,
          y: currentY + 120,
          type: 'tool',
          parentId: node.id
        })
      })
    })
    currentY += 250
  })
  
  return nodes
}
```

**Performance Optimizations:**
- Canvas rendering (GPU-accelerated)
- RequestAnimationFrame for smooth animations
- Debounced resize handler
- Efficient hit detection
- Lazy redraw (only on state change)

---

### **3. EnhancedPreviewModal.tsx**

Professional form preview with execution.

**Layout Structure:**
```typescript
Modal (fixed, centered)
├─ Header
│   ├─ Title & Description
│   ├─ Manual Run Button (if triggers)
│   ├─ Close Button
│   └─ Tags (Triggers, Fields, Nodes counts)
│
├─ Content (50/50 split)
│   ├─ Left (50%): Form
│   │   ├─ Step Header
│   │   ├─ Form Card
│   │   │   ├─ Fields (rendered by type)
│   │   │   └─ Navigation
│   │   │       ├─ Previous Button
│   │   │       └─ Next/Run Workflow Button
│   │   └─ Progress Bar (multi-step)
│   │
│   └─ Right (50%): Output
│       ├─ Output Header
│       │   ├─ "Workflow Output"
│       │   ├─ Status Badge
│       │   └─ Actions (Copy, Download, Rerun)
│       └─ Output Content
│           └─ Word-formatted text
│
└─ [Outside modals for dropdowns, etc.]
```

**Form Field Rendering:**
```typescript
function renderFormElement(element: FormElement) {
  // Handle visibility
  if (element.hidden) return null
  if (element.grayedOut) return <GrayedOutView />
  
  // Render by type
  switch (element.type) {
    case 'text':
    case 'email':
    case 'number':
      return <input type={element.type} />
    
    case 'textarea':
    case 'notes':
      return <textarea />
    
    case 'dropdown':
      return <select><option>...</option></select>
    
    case 'radio':
      return <div>{options.map(opt => 
        <label><input type="radio" />{opt}</label>
      )}</div>
    
    case 'checklist':
      return <div>{options.map(opt =>
        <label><input type="checkbox" />{opt}</label>
      )}</div>
    
    case 'toggle':
      return <ToggleSwitch />
    
    case 'date-picker':
      return <input type="date" />
    
    case 'time':
      return <input type="time" />
    
    case 'url':
      return <div><input name /><input url /></div>
    
    case 'uploaded':
    case 'image':
    case 'file':
      return <FileUpload />
    
    default:
      return null
  }
}
```

**Default Value System:**
```typescript
// Initialize form data with defaults
useEffect(() => {
  const initialData = {}
  
  containers.forEach(container => {
    container.elements.forEach(element => {
      if (element.defaultValue) {
        switch (element.type) {
          case 'toggle':
            initialData[element.id] = element.defaultValue === 'true'
            break
          case 'checklist':
            initialData[element.id] = element.defaultValue.split(',')
            break
          case 'date-picker':
          case 'time':
            initialData[element.id] = parseDate(element.defaultValue)
            break
          default:
            initialData[element.id] = element.defaultValue
        }
      }
    })
  })
  
  setFormData(initialData)
}, [isOpen, containers])
```

**Output Formatting:**
```typescript
function formatOutput(data, status) {
  return `
Workflow Execution Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${status === 'success' ? '✅' : '❌'} Status: ${status}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Submitted Data
──────────────────────────────────────────────

${Object.entries(data).map(([k,v]) => 
  `  • ${k}: ${JSON.stringify(v)}`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Additional sections...]
`
}
```

---

### **4. WorkflowConnectingLines.tsx**

Visual connection system (ready to integrate).

**Line Types:**
```typescript
// Main branch (vertical gray line on left)
{
  from: { x: 40, y: triggerTop },
  to: { x: 40, y: lastNodeBottom },
  color: '#E0E0E0',
  width: 2
}

// Sub branches (colored, per type)
{
  trigger: '#00C6FF',   // Cyan
  field: '#9D50BB',     // Purple
  node: '#10B981',      // Green
  tool: '#F59E0B'       // Orange
}

// Connection dots
{
  radius: 6,
  border: 2,
  color: branchColor,
  glow: `0 0 10px ${branchColor}`,
  clickable: true
}
```

**Drawing Algorithm:**
```typescript
function drawConnectingLines() {
  const canvas = getCanvas()
  const ctx = canvas.getContext('2d')
  
  // 1. Main vertical branch
  drawLine(ctx, {
    from: { x: 40, y: firstTrigger },
    to: { x: 40, y: lastNode },
    color: '#E0E0E0',
    width: 2
  })
  
  // 2. Trigger sub-branch
  const triggers = getElementsWithAttr('[data-trigger-id]')
  const triggerBranchX = triggers[0].left - 30
  
  // Vertical line connecting all triggers
  drawLine(ctx, {
    from: { x: triggerBranchX, y: triggers[0].top },
    to: { x: triggerBranchX, y: triggers[last].bottom },
    color: '#00C6FF',
    width: 2
  })
  
  // Horizontal lines from branch to each trigger
  triggers.forEach(trigger => {
    const dotY = trigger.centerY
    
    // Draw dot
    drawDot(ctx, {
      x: triggerBranchX,
      y: dotY,
      color: '#00C6FF',
      enabled: enabledStates.triggers[trigger.id]
    })
    
    // Draw horizontal line
    drawLine(ctx, {
      from: { x: triggerBranchX, y: dotY },
      to: { x: trigger.left, y: dotY },
      color: '#00C6FF',
      width: 2
    })
  })
  
  // 3. Field sub-branch (same pattern)
  // 4. Node sub-branch (same pattern)
  // 5. Tool super sub-branch (same pattern)
}
```

---

## 🔄 Data Flow

### **State Management**

```
User Action
    ↓
Event Handler (WorkflowBuilderMerged)
    ↓
State Update (setContainers / setTriggers / etc.)
    ↓
React Re-render
    ↓
┌───────────────┬─────────────────┐
│               │                 │
Builder View    Mind Map View     Preview Modal
    ↓               ↓                 ↓
Trigger/Step    Calculate Layout   Render Form
Rendering       Draw Canvas        Execute Workflow
```

### **View Switching**

```
[Builder] Button Click
    ↓
setViewMode('builder')
    ↓
Conditional Render
    ↓
Show: <BuilderCanvas />
Hide: <WorkflowMindMapView />

[Mind Map] Button Click
    ↓
setViewMode('mindmap')
    ↓
Conditional Render
    ↓
Hide: <BuilderCanvas />
Show: <WorkflowMindMapView />
```

### **Click-to-Edit Flow**

```
Mind Map: Click Node
    ↓
onNodeClick(type, id, containerIndex, nodeIndex)
    ↓
Parent Handler (WorkflowBuilderMerged)
    ↓
1. setViewMode('builder')
2. Switch based on type:
   - trigger: setSelectedTrigger(idx)
   - field: setSelectedItem({type, containerIndex, elementIndex})
   - node: setSelectedNode({containerIndex, nodeIndex})
    ↓
React Re-render
    ↓
Builder View: Element Highlighted
Right Panel: Properties Shown
Canvas: Scrolls to Element (if needed)
```

---

## 🎨 Styling Architecture

### **Theme System**

```typescript
// Theme context
const { theme } = useTheme()  // 'dark' | 'light'

// Dynamic colors
const bgColor = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50'
const panelBg = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white'
const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900'
const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600'
const borderColor = theme === 'dark' ? 'border-[#2A2A3E]' : 'border-gray-200'
```

### **Color Palette**

```typescript
const colors = {
  // Primary gradient
  primary: {
    from: '#00C6FF',  // Cyan
    to: '#9D50BB'     // Purple
  },
  
  // Element types
  trigger: '#00C6FF',    // Cyan
  field: '#9D50BB',      // Purple
  node: '#10B981',       // Green
  tool: '#F59E0B',       // Orange
  workflowStep: '#6366F1', // Indigo
  
  // States
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#6366F1',
  
  // Dark theme
  dark: {
    bg: '#0E0E1F',
    panel: '#1A1A2E',
    border: '#2A2A3E',
    text: '#FFFFFF',
    textSecondary: '#CFCFE8',
    input: '#0E0E1F'
  },
  
  // Light theme
  light: {
    bg: '#F9FAFB',
    panel: '#FFFFFF',
    border: '#E5E7EB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    input: '#FFFFFF'
  }
}
```

### **Tailwind Classes**

```typescript
// Spacing
'gap-2'  // 0.5rem
'gap-3'  // 0.75rem
'gap-4'  // 1rem
'p-4'    // 1rem padding
'px-6'   // 1.5rem horizontal
'py-3'   // 0.75rem vertical

// Border radius
'rounded'     // 0.25rem
'rounded-lg'  // 0.5rem
'rounded-xl'  // 0.75rem

// Shadows
'shadow-md'  // Medium
'shadow-lg'  // Large
'shadow-xl'  // Extra large

// Transitions
'transition-all'  // All properties
'duration-200'    // 200ms
'ease-in-out'     // Easing

// Hover effects
'hover:bg-[#00C6FF]/10'
'hover:border-cyan-500'
'hover:shadow-lg'
```

---

## 📊 Performance Considerations

### **Optimization Techniques**

1. **Canvas Rendering**
```typescript
// Use requestAnimationFrame
function draw() {
  requestAnimationFrame(() => {
    ctx.clearRect(...)
    drawGrid()
    drawConnections()
    drawNodes()
  })
}

// Debounce resize
const handleResize = debounce(() => {
  updateCanvasSize()
  recalculateLayout()
}, 150)
```

2. **Conditional Rendering**
```typescript
// Only render visible panels
{!isLeftPanelMinimized && <LeftPanel />}
{!isRightPanelMinimized && <RightPanel />}

// Lazy load modal content
{showPreview && <EnhancedPreviewModal />}
```

3. **Memoization**
```typescript
// Memoize expensive calculations
const layoutNodes = useMemo(() => 
  calculateLayout(containers, triggers),
  [containers, triggers]
)

// Memoize callbacks
const handleNodeClick = useCallback((type, id) => {
  // ...
}, [setViewMode, setSelectedItem])
```

4. **Virtual Scrolling** (Future)
```typescript
// For very large workflows
// Only render visible nodes
const visibleNodes = nodes.filter(node =>
  isInViewport(node, viewport)
)
```

### **Memory Management**

```typescript
// Cleanup on unmount
useEffect(() => {
  const canvas = canvasRef.current
  
  return () => {
    // Remove event listeners
    canvas.removeEventListener('mousemove', handleMove)
    canvas.removeEventListener('mouseup', handleUp)
    
    // Clear canvas context
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}, [])
```

---

## 🔒 TypeScript Types

### **Core Interfaces**

```typescript
// Workflow Element
interface FormElement {
  id: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'dropdown' | ...
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  hidden?: boolean
  grayedOut?: boolean
  enabled?: boolean
  defaultValue?: string | boolean | string[]
  options?: string[]  // For dropdown, radio, checklist
  nestedFields?: FormElement[]
}

// Container (Workflow Step)
interface ContainerElement {
  id: string
  type: 'container'
  title: string
  subtitle: string
  elements: FormElement[]
  nodes?: WorkflowNodeType[]
}

// Trigger
interface TriggerNodeType {
  id: string
  type: 'schedule' | 'webhook' | 'manual' | 'email' | ...
  label: string
  config: {
    enabled?: boolean
    [key: string]: any
  }
}

// AI Node
interface WorkflowNodeType {
  id: string
  type: string
  label: string
  category: string
  icon: string
  enabled?: boolean
  config: {
    tools?: ToolType[]
    [key: string]: any
  }
}

// Tool
interface ToolType {
  id?: string
  type: string
  label: string
  enabled?: boolean
  config: Record<string, any>
}

// Selected Item (for properties panel)
type SelectedItem = 
  | { type: 'element'; containerIndex: number; elementIndex: number }
  | { type: 'container'; containerIndex: number }
  | null
```

---

## 🧪 Testing Strategy

### **Unit Tests**

```typescript
// Layout algorithm
describe('calculateLayout', () => {
  it('positions triggers horizontally at top', () => {
    const nodes = calculateLayout(containers, triggers)
    expect(nodes.filter(n => n.type === 'trigger')[0].y).toBe(100)
  })
  
  it('spaces workflow steps vertically', () => {
    const nodes = calculateLayout(containers, triggers)
    const steps = nodes.filter(n => n.type === 'workflow-step')
    expect(steps[1].y - steps[0].y).toBeGreaterThan(200)
  })
})

// Default value parsing
describe('parseDefaultValue', () => {
  it('parses toggle boolean', () => {
    expect(parseDefaultValue('true', 'toggle')).toBe(true)
  })
  
  it('parses checklist array', () => {
    expect(parseDefaultValue('a,b,c', 'checklist')).toEqual(['a','b','c'])
  })
})
```

### **Integration Tests**

```typescript
describe('View Switching', () => {
  it('switches from builder to mind map', () => {
    render(<WorkflowBuilderMerged />)
    
    fireEvent.click(screen.getByText('Mind Map'))
    
    expect(screen.getByTestId('mindmap-canvas')).toBeInTheDocument()
    expect(screen.queryByTestId('builder-canvas')).not.toBeInTheDocument()
  })
  
  it('navigates back to builder on node click', () => {
    render(<WorkflowBuilderMerged />)
    
    fireEvent.click(screen.getByText('Mind Map'))
    fireEvent.click(screen.getByTestId('node-trigger-1'))
    
    expect(screen.getByTestId('builder-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('trigger-1')).toHaveClass('selected')
  })
})
```

### **E2E Tests** (Future)

```typescript
// Playwright
test('create and visualize workflow', async ({ page }) => {
  await page.goto('/workflows/builder')
  
  // Add elements
  await page.click('[data-testid="add-trigger"]')
  await page.click('[data-testid="add-step"]')
  await page.dragAndDrop('[data-testid="field-text"]', '[data-testid="drop-zone"]')
  
  // Switch to mind map
  await page.click('text=Mind Map')
  
  // Verify visualization
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.locator('text=1 Trigger')).toBeVisible()
  
  // Export
  await page.click('[data-testid="download-button"]')
  // ... verify download
})
```

---

## 🚀 Deployment

### **Build Configuration**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "lucide-react": "^0.263.1",
    "tailwindcss": "^4.0.0"
  }
}
```

### **Environment Variables**

```env
NEXT_PUBLIC_API_URL=https://api.flowversal.com
NEXT_PUBLIC_ENV=production
```

### **Performance Metrics**

```typescript
// Target metrics
{
  FCP: < 1.5s,      // First Contentful Paint
  LCP: < 2.5s,      // Largest Contentful Paint
  FID: < 100ms,     // First Input Delay
  CLS: < 0.1,       // Cumulative Layout Shift
  TTI: < 3.5s       // Time to Interactive
}
```

---

## 📈 Scalability

### **Large Workflows**

```typescript
// Handle workflows with 100+ elements

// 1. Virtual rendering (future)
const visibleElements = elements.filter(isInViewport)

// 2. Lazy loading
const [loadedContainers, setLoadedContainers] = useState(
  containers.slice(0, 10)
)

// 3. Pagination in mind map
const [currentPage, setCurrentPage] = useState(0)
const nodesPerPage = 50

// 4. Search and filter
const filteredNodes = nodes.filter(node =>
  node.label.toLowerCase().includes(searchTerm)
)
```

### **Performance Budget**

```typescript
// Max rendering time
const MAX_RENDER_TIME = 100ms

// Max canvas size
const MAX_CANVAS_WIDTH = 10000px
const MAX_CANVAS_HEIGHT = 10000px

// Max elements
const MAX_TRIGGERS = 20
const MAX_STEPS = 50
const MAX_FIELDS_PER_STEP = 50
const MAX_NODES_PER_STEP = 20
const MAX_TOOLS_PER_NODE = 10
```

---

## 🔮 Future Architecture Enhancements

### **1. State Management (Redux/Zustand)**

```typescript
// Centralized state
const useWorkflowStore = create((set) => ({
  containers: [],
  triggers: [],
  viewMode: 'builder',
  
  addTrigger: (trigger) => 
    set(state => ({ triggers: [...state.triggers, trigger] })),
  
  setViewMode: (mode) => 
    set({ viewMode: mode }),
}))
```

### **2. Undo/Redo System**

```typescript
interface HistoryState {
  past: WorkflowState[]
  present: WorkflowState
  future: WorkflowState[]
}

function undo() {
  const previous = history.past[history.past.length - 1]
  setState(previous)
}

function redo() {
  const next = history.future[0]
  setState(next)
}
```

### **3. Real-time Collaboration**

```typescript
// WebSocket connection
const socket = io('wss://api.flowversal.com')

socket.on('workflow:update', (update) => {
  applyUpdate(update)
})

function applyUpdate(update) {
  // Conflict resolution
  // Operational transformation
  // Apply changes
}
```

### **4. Plugin System**

```typescript
interface Plugin {
  id: string
  name: string
  version: string
  
  onInit?: () => void
  onDestroy?: () => void
  
  // Extend node types
  nodeTypes?: NodeTypeDefinition[]
  
  // Add toolbar buttons
  toolbarButtons?: ToolbarButton[]
  
  // Custom renderers
  renderers?: CustomRenderer[]
}

function registerPlugin(plugin: Plugin) {
  plugins.set(plugin.id, plugin)
  plugin.onInit?.()
}
```

---

## 📚 Code Organization

```
/components
  /workflow-builder
    WorkflowBuilderMerged.tsx       # Main orchestrator
    WorkflowMindMapView.tsx         # Mind map visualization
    WorkflowConnectingLines.tsx     # Connection lines
    EnhancedPreviewModal.tsx        # Preview mode
    
    /canvas
      CanvasElement.tsx             # Field renderer
      TriggerNode.tsx               # Trigger renderer
      WorkflowNode.tsx              # Node renderer
      
    /panels
      LeftPanel.tsx                 # Forms/nodes/tools
      RightPanel.tsx                # Properties
      
    /modals
      CloseConfirmModal.tsx
      DeleteConfirmModal.tsx
      
    /utils
      layoutAlgorithm.ts            # Mind map layout
      defaultValues.ts              # Default value parsing
      exportToPNG.ts                # Export functionality
      
    /types
      types.ts                      # TypeScript interfaces
      
    /constants
      constants.ts                  # Configuration values
```

---

**This architecture is designed for:**
- 🚀 Performance (Canvas, memoization, lazy loading)
- 🔧 Maintainability (Modular, typed, documented)
- 📈 Scalability (Virtual rendering, pagination ready)
- 🎨 Extensibility (Plugin system ready)
- 🧪 Testability (Unit, integration, E2E)

**Ready for production! 🎉**
