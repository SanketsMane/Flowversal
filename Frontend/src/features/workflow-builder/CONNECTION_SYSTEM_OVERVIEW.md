# 🔗 Connection System - Complete Overview

## Architecture Summary

The connection system is built in **2 phases**:

### **Phase 1: Connection Dots** ✅
- Smart self-registering dots on all components
- Zustand-based registry for position tracking
- Auto-updates on viewport changes
- Debug overlay (Ctrl+Shift+D)

### **Phase 2: Connection Lines** ✅
- Auto-generating SVG connections
- Three line types (vertical-spine, horizontal-branch, node-to-node)
- Smooth bezier curves with hover effects
- Viewport-aware positioning

---

## 🎯 Component Hierarchy

```
InfiniteCanvas (pan/zoom container)
├── Transformed Content Container
│   ├── TriggerCard (with dots)
│   ├── StepContainer (with dots)
│   │   ├── NodeCard (with dots)
│   │   └── FormNode (with dots)
│   └── ...
└── ConnectionLayer (SVG overlay)
    └── ConnectionLine × N
```

---

## 🔌 Connection Dot Types

| Type | Color | Position | Used On | Purpose |
|------|-------|----------|---------|---------|
| `trigger-input` | Blue | Left | Trigger | Flow returns here after execution |
| `trigger-output` | Purple | Right | Trigger | Flow starts from here |
| `step-input` | Blue | Left | Step | Receives from previous step/trigger |
| `step-output` | Blue | Right | Step | Sends to next step |
| `node-input` | Purple | Left | Nodes | Receives data from spine or previous node |
| `node-output` | Purple | Right | Nodes | Sends data to spine or next node |

---

## 📊 Connection Flow Rules

### **1. Trigger to First Step**
```
Trigger (purple-output) ──➤ Step 1 (blue-input)
Type: vertical-spine
Color: #9D50BB (purple)
```

### **2. Step to Step**
```
Step 1 (blue-output) ──➤ Step 2 (blue-input)
Type: vertical-spine  
Color: #00C6FF (blue)
```

### **3. Step Spine to First Node**
```
Step (blue-input) ──➤ Node 1 (purple-input)
Type: horizontal-branch
Color: #9D50BB (purple)
```

### **4. Node to Node**
```
Node 1 (purple-output) ──➤ Node 2 (purple-input)
Type: node-to-node
Color: #9D50BB (purple)
```

### **5. Last Node to Step Spine**
```
Node N (purple-output) ──➤ Step (blue-output)
Type: horizontal-branch
Color: #9D50BB (purple)
```

---

## 🎨 Visual Styling

### **Line Widths:**
- Vertical spine: 3px (main flow)
- Horizontal branch: 2px (side branches)
- Node-to-node: 2px (internal connections)
- Hover: +1px

### **Colors:**
- Purple (`#9D50BB`): Trigger/node connections
- Blue (`#00C6FF`): Step spine

### **Effects:**
- Opacity: 0.8 (normal) → 1.0 (hover)
- Glow: 4px blur + shadow on hover
- Animation: 2s gradient flow (when animated)

---

## 🔧 Key Files

### **Phase 1 Files:**
1. `hooks/useConnectionRegistry.ts` - Zustand store for dots
2. `components/connections/ConnectionDot.tsx` - Self-registering dot
3. `components/connections/ConnectionDebugOverlay.tsx` - Debug UI

### **Phase 2 Files:**
4. `components/connections/ConnectionLine.tsx` - SVG path renderer
5. `components/connections/ConnectionLayer.tsx` - Auto-connection generator

### **Integration Points:**
6. `components/canvas/TriggerCard.tsx` - Has blue + purple dots
7. `components/canvas/StepContainer.tsx` - Has blue dots
8. `components/canvas/NodeCard.tsx` - Has purple dots
9. `components/nodes/FormNode.tsx` - Has purple dots
10. `components/canvas/InfiniteCanvas.tsx` - Renders ConnectionLayer

---

## 📐 Coordinate System

### **Dot Registration:**
```typescript
// Dots register in CANVAS coordinates (not screen)
const rect = element.getBoundingClientRect();
const { zoom, offsetX, offsetY } = viewport;

// Convert to canvas coordinates
const canvasX = (rect.left - offsetX) / zoom;
const canvasY = (rect.top - offsetY) / zoom;
```

### **Line Rendering:**
```typescript
// Lines render in same canvas coordinate space
<svg style={{
  transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
  transformOrigin: '0 0'
}}>
  <path d="M fromX fromY C ..." />
</svg>
```

---

## 🐛 Debugging

### **Enable Debug Mode:**
Press **`Ctrl+Shift+D`** to toggle debug overlay

### **Debug Overlay Shows:**
- 🔵 All registered connection dots (with IDs)
- 📊 Dot count by type
- 🔍 Hover to see dot details
- ⚠️ Missing dots (expected but not registered)

### **Expected Dot Counts:**
- **1 Trigger**: 2 dots (blue left, purple right)
- **1 Step**: 2 dots (blue left, blue right)
- **1 Node**: 2 dots (purple left, purple right)
- **1 Form Node**: 2 dots (purple left, purple right)

**Formula**: `Total Dots = (Triggers × 2) + (Steps × 2) + (Nodes × 2)`

---

## ✅ Testing Workflow

1. **Create Basic Flow:**
   ```
   Trigger → Step 1 → Step 2
   ```
   Expected: 2 connections (purple + blue)

2. **Add Nodes:**
   ```
   Trigger → Step 1 (Node A, Node B) → Step 2
   ```
   Expected: 5 connections
   - Trigger → Step 1
   - Step 1 spine → Node A
   - Node A → Node B
   - Node B → Step 1 spine
   - Step 1 → Step 2

3. **Test Interactions:**
   - ✅ Hover over lines (should glow)
   - ✅ Zoom in/out (lines scale correctly)
   - ✅ Pan around (connections follow)
   - ✅ Add/remove nodes (connections update)

---

## 🚀 Future Enhancements (Phase 3)

1. **Interactive Connection Creation:**
   - Drag from output dot
   - Preview line follows cursor
   - Drop on compatible input dot
   - Validation (prevent invalid connections)

2. **Connection Editing:**
   - Click to select connection
   - Delete key to remove
   - Right-click context menu
   - Connection properties panel

3. **Advanced Features:**
   - Conditional routing (if/else branches)
   - Connection labels/annotations
   - Connection types (data vs control flow)
   - Custom connection styles per workflow

4. **Performance:**
   - Virtual rendering for large workflows
   - Connection caching
   - Lazy updates

---

## 📝 Code Examples

### **Adding a New Component with Dots:**

```typescript
import { ConnectionDot } from '../connections/ConnectionDot';

function MyCustomNode({ node }: { node: WorkflowNode }) {
  return (
    <div data-node-id={node.id}>
      {/* Left input dot */}
      <ConnectionDot
        ownerId={node.id}
        ownerType="node"
        type="node-input"
        position="left"
        color="purple"
        size="small"
      />
      
      {/* Right output dot */}
      <ConnectionDot
        ownerId={node.id}
        ownerType="node"
        type="node-output"
        position="right"
        color="purple"
        size="small"
      />
      
      {/* Node content */}
      <div>My Custom Node</div>
    </div>
  );
}
```

### **Auto-Connection Logic:**

```typescript
// In ConnectionLayer.tsx
const triggerOutput = points.find(
  p => p.ownerId === trigger.id && p.type === 'trigger-output'
);
const firstStepInput = points.find(
  p => p.ownerId === containers[0].id && p.type === 'step-input'
);

if (triggerOutput && firstStepInput) {
  connections.push({
    id: 'trigger-to-step-0',
    fromDotId: triggerOutput.id,
    toDotId: firstStepInput.id,
    type: 'vertical-spine',
    color: '#9D50BB',
    animated: false,
  });
}
```

---

## 🎉 Status

- ✅ **Phase 1**: Connection dots on all components
- ✅ **Phase 2**: Auto-generated SVG connection lines
- ⏳ **Phase 3**: Interactive drag-to-connect (future)

**Current Status: Fully Functional & Production Ready!** 🚀
