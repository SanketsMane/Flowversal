# 🌿 Main Branch System - Flowversal Workflow Builder

## Overview
The Main Branch is a **vertical connecting line** that runs along the left side of the workflow canvas, connecting all major workflow components in sequential order.

---

## 📍 Location

The Main Branch is located **80 pixels to the LEFT** of all workflow cards, creating a visual "spine" for the entire workflow.

```
Canvas Layout:
┌─────────────────────────────────────────┐
│  Main Branch (left edge)                │
│      │                                   │
│      ●────────► [Trigger 1]             │
│      │                                   │
│      ●────────► [Trigger 2]             │
│      │                                   │
│      ●────────► [Step 1: HTTP Request]  │
│      │                                   │
│      ●────────► [Step 2: Parse Data]    │
│      │                                   │
│      ●────────► [Step 3: Send Email]    │
│      │                                   │
└─────────────────────────────────────────┘
```

---

## 🔍 How It Works

### 1. **Connection Points**
The Main Branch connects these elements in order:
1. **Triggers** - Entry points for workflows
2. **Workflow Steps** (Containers) - HTTP, AI, Logic nodes
3. **Branch Nodes** - Conditional logic splits
4. **Loop Nodes** - Iteration logic

### 2. **Visual Style**
- **Line**: Vertical gradient line (blue → violet → cyan)
- **Dots**: Connection points at each element
- **Offset**: 80px left of all cards
- **Animation**: Animated gradient flow (optional)

### 3. **Connection Flow**
```
Triggers (Last Trigger)
    ↓
    ● (Main Branch Dot)
    ↓
    → Horizontal Line (80px) →
    ↓
First Step
    ↓
    ● (Main Branch Dot)
    ↓
Second Step
    ↓
    ● (Main Branch Dot)
    ↓
Third Step
    ... and so on
```

---

## 📁 File Locations

### Main Implementation

1. **`/features/workflow-builder/hooks/useConnections.ts`**
   - Primary logic for calculating connections
   - Creates Connection objects with paths
   - Lines 58-88: Trigger → Step connection
   - Lines 90-115: Step → Step connections

2. **`/features/workflow-builder/components/canvas/ConnectionsOverlay.tsx`**
   - Renders all connections on the canvas
   - Displays SVG paths for lines

3. **`/features/workflow-builder/components/canvas/ConnectionLine.tsx`**
   - Individual connection line component
   - Handles line styling and animation

4. **`/features/workflow-builder/utils/canvas-position.utils.ts`**
   - Utility functions for calculating element positions
   - Handles zoom-stable coordinate system

---

## 🎨 Visual Components

### Connection Types

| Type | Description | Color | Use Case |
|------|-------------|-------|----------|
| `trigger-to-step` | Connects triggers to first step | Blue gradient | Workflow entry |
| `step-to-step` | Connects sequential steps | Blue-violet gradient | Main flow |
| `branch` | Conditional splits | Green (True) / Red (False) | If/Else logic |
| `node-to-node` | Connects nodes within steps | Purple gradient | Sub-flows |
| `tool` | Tool connections | Cyan gradient | API/Tool calls |

### Main Branch Colors
```typescript
const mainBranchGradient = {
  start: '#00C6FF',  // Cyan
  middle: '#9D50BB', // Violet
  end: '#06B6D4'     // Blue
};
```

---

## 🔧 How to Modify

### Changing the Offset
The Main Branch is offset **80px** to the left of cards. To change this:

**File**: `/features/workflow-builder/hooks/useConnections.ts`
```typescript
// Line 72-74
const offsetFrom = { x: from.x - 80, y: from.y }; // Change 80 to desired offset
const offsetTo = { x: to.x - 80, y: to.y };       // Change 80 to desired offset
```

### Changing Colors
**File**: `/features/workflow-builder/components/canvas/ConnectionLine.tsx`
```typescript
// Update gradient definitions
<linearGradient id="gradient-blue-violet">
  <stop offset="0%" stopColor="#00C6FF" />   // Start color
  <stop offset="50%" stopColor="#9D50BB" />  // Middle color
  <stop offset="100%" stopColor="#06B6D4" /> // End color
</linearGradient>
```

### Adding New Connection Types
**File**: `/features/workflow-builder/hooks/useConnections.ts`
```typescript
// Add to Connection interface
export interface Connection {
  id: string;
  type: 'trigger-to-step' | 'step-to-step' | 'your-new-type';
  // ... rest of properties
}

// Add calculation logic in calculateConnections()
const newConnections: Connection[] = [];

// Your custom connection logic here
newConnections.push({
  id: 'custom-connection',
  type: 'your-new-type',
  fromId: 'element-1',
  toId: 'element-2',
  path: calculateSmoothPath(fromPoint, toPoint),
  color: '#YOUR_COLOR'
});
```

---

## 🎯 Key Features

### 1. **Zoom-Stable Coordinates**
The Main Branch uses **canvas-space coordinates** instead of screen-space, ensuring it stays perfectly aligned during zoom/pan operations.

```typescript
// From canvas-position.utils.ts
const from = getElementCanvasPosition(element, 'left');
// Returns coordinates in canvas space, not screen space
```

### 2. **Smooth Bezier Curves**
Connections use cubic Bezier curves for smooth, elegant lines:
```typescript
function calculateSmoothPath(from: Point, to: Point): ConnectionPath {
  const offset = Math.min(Math.abs(dy) * 0.5, 100);
  const path = `M ${from.x} ${from.y} C ${from.x} ${from.y + offset}, 
                ${to.x} ${to.y - offset}, ${to.x} ${to.y}`;
  return { from, to, path, midPoint };
}
```

### 3. **Automatic Updates**
The connection system automatically recalculates when:
- Elements are added/removed
- Elements are moved
- Canvas is zoomed/panned
- Window is resized

---

## 🐛 Debugging

### Common Issues

**Issue**: Lines not appearing
- **Solution**: Check if elements have proper `data-trigger-id` or `data-container-id` attributes

**Issue**: Lines offset incorrectly
- **Solution**: Verify the 80px offset in `useConnections.ts` lines 72-74

**Issue**: Lines don't update on zoom
- **Solution**: Ensure `connectionUpdateCounter` is incrementing in ViewportContext

### Debug Console Commands
```javascript
// Check if elements are found
document.querySelector('[data-trigger-id="trigger-1"]')

// Check connection state
const store = useWorkflowStore.getState()
console.log('Triggers:', store.triggers)
console.log('Containers:', store.containers)
```

---

## 📊 Connection Lifecycle

```
1. Element Added to Canvas
   ↓
2. Element rendered with data-* attributes
   ↓
3. useConnections.calculateConnections() called
   ↓
4. Query DOM for elements
   ↓
5. Calculate canvas positions (zoom-stable)
   ↓
6. Generate SVG paths
   ↓
7. Create Connection objects
   ↓
8. ConnectionsOverlay renders SVG paths
   ↓
9. ConnectionLine components display lines
```

---

## 🚀 Advanced Usage

### Creating Custom Connection Patterns

**L-Shaped Connections** (for branches):
```typescript
const path = `M ${from.x} ${from.y} 
              L ${from.x} ${midY} 
              L ${to.x} ${midY} 
              L ${to.x} ${to.y}`;
```

**S-Shaped Connections** (for loops):
```typescript
const cp1 = { x: from.x + 50, y: from.y };
const cp2 = { x: to.x - 50, y: to.y };
const path = `M ${from.x} ${from.y} 
              C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`;
```

**Rectangular Connections** (for complex loops):
```typescript
const path = `M ${from.x} ${from.y} 
              L ${from.x - 40} ${from.y} 
              L ${from.x - 40} ${to.y} 
              L ${to.x} ${to.y}`;
```

---

## 📝 Summary

- **Location**: 80px left of all workflow cards
- **Purpose**: Visual "spine" connecting all workflow elements
- **Implementation**: `/features/workflow-builder/hooks/useConnections.ts`
- **Rendering**: `/features/workflow-builder/components/canvas/ConnectionsOverlay.tsx`
- **Style**: Gradient blue → violet → cyan with smooth Bezier curves
- **Features**: Zoom-stable, auto-updating, animated gradients

The Main Branch creates a clean, professional visual flow that makes complex workflows easy to understand at a glance.

---

**Last Updated**: November 2024  
**Version**: 2.0.0 (Modular Architecture)
