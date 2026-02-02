# Flowversal Connection Architecture

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLOWVERSAL WORKFLOW                          │
│                                                                   │
│  ┌──────────────┐                                                │
│  │   TRIGGER    │ ●────────────┐  ← Purple Dot (trigger-output) │
│  │   (Purple)   │               │                                │
│  └──────────────┘               │                                │
│                                  │                                │
│                                  ▼                                │
│                          ┌──────────────┐                        │
│                       ●──│  STEP 1      │──●                     │
│  Blue Dot (input) ──────▶│  (Blue)      │                        │
│                          │              │                        │
│                          │  ┌────────┐  │                        │
│                          │ ●│ Node 1 │● │  ← Green Dots          │
│                          │  └────────┘  │     (node in/out)      │
│                          │  ┌────────┐  │                        │
│                          │ ●│ Node 2 │● │                        │
│                          │  └────────┘  │                        │
│                          └──────────────┘                        │
│                                  │                                │
│                                  ▼                                │
│                          ┌──────────────┐                        │
│                       ●──│  STEP 2      │──●                     │
│                          │  (Blue)      │                        │
│                          │              │                        │
│                          │  ┌────────┐  │                        │
│                          │ ●│ If Node│● │                        │
│                          │  └────────┘  │                        │
│                          └──────────────┘                        │
│                                  │                                │
│                      ┌───────────┴───────────┐                   │
│                      │                       │                   │
│              ┌───────▼──────┐        ┌──────▼──────┐            │
│           ●──│  BRANCH 1    │──●  ●──│  BRANCH 2   │──●         │
│              │  (Red)       │        │  (Red)      │            │
│              │              │        │             │            │
│              │  ┌────────┐  │        │ ┌────────┐  │            │
│              │ ●│ Node 3 │● │        │●│ Node 4 │● │            │
│              │  └────────┘  │        │ └────────┘  │            │
│              └──────────────┘        └─────────────┘            │
│                      │                       │                   │
│                      └───────────┬───────────┘                   │
│                                  │                                │
│                                  ▼                                │
│                          ┌──────────────┐                        │
│                       ●──│  STEP 3      │──●                     │
│                          │  (Blue)      │                        │
│                          └──────────────┘                        │
└─────────────────────────────────────────────────────────────────┘

LEGEND:
● = Connection Dot (self-registering, auto-positioning)
──── = Connection Line (Phase 2)
Purple = Trigger dots
Blue = Step/Container dots  
Green = Node dots
Red = Branch dots
```

## Connection Dot Types

### 1. Trigger Dots (Purple)
```
┌────────────┐
│  TRIGGER   │
│  Schedule  │──● trigger-output (right side)
└────────────┘

Properties:
- Type: 'trigger-output'
- Color: Purple (#A855F7)
- Position: Right side
- Connects to: First step input
```

### 2. Step Dots (Blue)
```
    ┌──────────────┐
 ●──│  STEP        │──●
    │  Container   │
    └──────────────┘
    ↑              ↑
  step-input    step-output
  (left)        (right)

Properties:
- Input Type: 'step-input'
- Output Type: 'step-output'
- Color: Blue (#3B82F6)
- Input connects from: Previous step or trigger
- Output connects to: Next step
```

### 3. Node Dots (Green)
```
Inside Step Container:
┌────────────┐
│ ● Node ●   │
│            │
└────────────┘
↑        ↑
input    output

Properties:
- Input Type: 'node-input'
- Output Type: 'node-output'
- Color: Green (#10B981)
- Size: Small
- Input connects from: Previous node or spine
- Output connects to: Next node or spine
```

### 4. Branch Dots (Red)
```
Branch Split from If Node:
                 ┌────────┐
        ┌────────│  TRUE  │────────┐
        │        └────────┘        │
        ●                          ●
   branch-split              branch-rejoin

Properties:
- Split Type: 'branch-split'
- Output Type: 'branch-output'
- Rejoin Type: 'branch-rejoin'
- Color: Red (#EF4444)
```

## Data Flow

### 1. Component Mounts
```
TriggerCard renders
    ↓
<ConnectionDot> mounts
    ↓
useEffect runs
    ↓
Calculates position from DOM
    ↓
Registers in ConnectionRegistry
    ↓
Registry.points.set(dotId, { id, type, position, ... })
```

### 2. Position Updates
```
Parent element moves/resizes
    ↓
MutationObserver detects change
    ↓
ResizeObserver detects resize
    ↓
calculatePosition() runs
    ↓
Registry.updatePosition(dotId, newPos)
    ↓
Dot position updates in registry
```

### 3. Debug Mode
```
User presses Ctrl+Shift+D
    ↓
ConnectionDebugOverlay toggles
    ↓
Reads all points from registry
    ↓
Renders yellow circles at dot positions
    ↓
Shows stats and list in panel
```

## Registry Structure

```typescript
ConnectionRegistry {
  points: Map<string, ConnectionPoint> {
    "trigger-1:trigger-output" => {
      id: "trigger-1:trigger-output",
      type: "trigger-output",
      ownerId: "trigger-1",
      ownerType: "trigger",
      position: { x: 450, y: 120 },
      color: "purple",
      size: "medium",
      canConnectTo: ["step-input"],
      element: <div />
    },
    "container-1:step-input" => {
      id: "container-1:step-input",
      type: "step-input",
      ownerId: "container-1",
      ownerType: "step",
      position: { x: 100, y: 250 },
      color: "blue",
      size: "medium",
      canConnectTo: [],
      element: <div />
    },
    // ... more dots
  },
  
  lines: Map<string, ConnectionLine> {
    // Phase 2 - connection lines will be stored here
  }
}
```

## Connection Compatibility Matrix

```
FROM          ➜  TO
─────────────────────────────────────────────
trigger-output  →  step-input         ✅
step-output     →  step-input         ✅
node-output     →  node-input         ✅
node-output     →  step-input         ✅
branch-split    →  node-input         ✅
branch-output   →  branch-rejoin      ✅
branch-output   →  step-input         ✅

step-input      →  (anything)         ❌ (input only)
node-input      →  (anything)         ❌ (input only)
branch-rejoin   →  (anything)         ❌ (input only)
```

## Position Calculation

```
Connection Dot Position Calculation:

1. Get dot element: dotRef.current
2. Get dot bounding rect: dotRect = element.getBoundingClientRect()
3. Get canvas element: document.querySelector('.workflow-canvas')
4. Get canvas rect: canvasRect = canvas.getBoundingClientRect()
5. Calculate center of dot:
   x = dotRect.left + (dotRect.width / 2) - canvasRect.left
   y = dotRect.top + (dotRect.height / 2) - canvasRect.top
6. Apply offset if provided:
   x = x + offset.x
   y = y + offset.y
7. Return { x, y }

This ensures dots are positioned correctly regardless of:
- Canvas scroll position
- Canvas zoom level
- Parent element position
- Transform properties
```

## Component Hierarchy

```
WorkflowCanvas
├── ConnectionDebugOverlay (debug mode)
├── InfiniteCanvas (pan/zoom wrapper)
│   ├── TriggerSection
│   │   └── TriggerCard (has ConnectionDot ●)
│   ├── StepContainer (will have ConnectionDot ●●)
│   │   ├── NodeCard (will have ConnectionDot ●●)
│   │   ├── NodeCard (will have ConnectionDot ●●)
│   │   └── ...
│   ├── StepContainer
│   │   └── ...
│   └── DraggableBranchBox (will have ConnectionDot ●)
│       ├── NodeCard
│       └── ...
└── ConnectionManager (Phase 2 - renders lines)

Legend:
● = Has connection dots
●● = Has input AND output dots
```

## Event Flow

### Hover Over Connection Dot
```
Mouse enters dot
    ↓
onMouseEnter fires
    ↓
Adds CSS classes: ring-4, scale-150
    ↓
Visual feedback: dot grows and glows
    ↓
Mouse leaves
    ↓
onMouseLeave fires
    ↓
Removes classes
    ↓
Dot returns to normal size
```

### Drag Connection (Phase 2)
```
Mouse down on output dot
    ↓
onConnectionStart(dotId)
    ↓
Store source dot in state
    ↓
Show preview line
    ↓
Mouse moves
    ↓
Update preview line position
    ↓
Mouse enters compatible input dot
    ↓
Highlight target dot (valid connection)
    ↓
Mouse up on input dot
    ↓
onConnectionEnd(targetDotId)
    ↓
Validate connection compatibility
    ↓
Create connection in registry
    ↓
Render permanent connection line
```

## Performance Optimizations

### 1. Efficient Updates
```
Position updates are batched:
- MutationObserver: Only fires on style attribute changes
- ResizeObserver: Only fires when parent size changes
- Scroll listener: Passive mode for smooth scrolling
- Window resize: Debounced
```

### 2. Registry Lookups
```
O(1) operations using Map:
- get(id) - Instant lookup
- set(id, value) - Instant insert
- delete(id) - Instant removal
- values() - Linear scan only when needed
```

### 3. React Optimizations
```
- useMemo: Dot ID generation
- useCallback: Event handlers
- Conditional rendering: Dots only render when enabled
- Cleanup: Unregister on unmount
```

## Migration Strategy

### Current State (Phase 1)
```
✅ TriggerCard - Has connection dots
⏳ StepContainer - Next
⏳ NodeCard - Next
⏳ DraggableBranchBox - Next
```

### Migration Pattern
```
For each component:

1. Import ConnectionDot
2. Add dots to JSX (left/right sides)
3. Set correct type (trigger/step/node/branch)
4. Set correct color
5. Test with debug mode
6. Verify position updates
7. Move to next component
```

### Backward Compatibility
```
During migration:
- Old connection code still works
- SmartBranchConnections still renders
- New dots work alongside old system
- Can test incrementally
- No breaking changes
```

## Future Enhancements (Phase 2+)

### Phase 2: Connection Lines
- Render SVG lines between dots
- Support multiple path styles (curved, step, straight)
- Animate during execution
- Show labels on connections

### Phase 3: Interactive Connections
- Drag from dot to dot to create connections
- Visual feedback during drag
- Validation before creating connection
- Delete connections by clicking

### Phase 4: Advanced Features
- Connection grouping
- Connection filtering
- Connection search
- Bulk connection operations
- Connection templates
