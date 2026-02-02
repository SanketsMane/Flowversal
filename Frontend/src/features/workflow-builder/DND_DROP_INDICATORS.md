# Drag & Drop Visual Indicators

## Overview
Enhanced the workflow builder's drag-and-drop system with visual drop indicators that show users exactly where nodes will be placed during drag operations.

## Features

### Visual Drop Indicators
- **Glowing Line**: A gradient blue-violet-cyan animated line appears at the drop position
- **Position Awareness**: Shows whether the node will drop above or below the target
- **Glowing Orbs**: Animated orbs at both ends of the line for enhanced visibility
- **Smooth Animation**: Pulsing animation draws attention to the drop zone
- **Theme Support**: Works seamlessly in both light and dark modes

### Drag & Drop Behavior
1. **Within Workflow Steps**: Nodes can be dragged and reordered within their container
2. **Within Sub-Steps**: Nodes inside sub-step containers can also be reordered
3. **Container Isolation**: Nodes can only be moved within the same container (cannot drag between different steps or sub-steps)
4. **Real-time Preview**: Drop indicator updates in real-time as you hover over different positions

### How It Works

#### For Main Workflow Steps
- Nodes in `/features/workflow-builder/components/canvas/StepContainer.tsx` use the enhanced `NodeCard`
- The `moveNode` function in the workflow store handles reordering
- Drop indicators show between existing nodes

#### For Sub-Steps
- Sub-step nodes in `/features/workflow-builder/components/substeps/SubStepContainer.tsx` also use `NodeCard`
- The `handleNodeMove` function manages node reordering within sub-steps
- Same visual feedback as main workflow steps

## Components

### DropIndicator Component
**Location**: `/features/workflow-builder/components/dnd/DropIndicator.tsx`

Renders a glowing horizontal line with animated orbs to indicate where a node will be dropped.

**Props**:
- `position`: 'top' | 'bottom' - Where to show the indicator relative to the node
- `isVisible`: boolean - Controls visibility

**Styling**:
- Gradient colors: `from-[#00C6FF] via-[#9D50BB] to-[#00C6FF]`
- Pulsing animation for attention
- Glowing shadow effects
- Positioned absolutely above or below the node

### Enhanced NodeCard
**Location**: `/features/workflow-builder/components/canvas/NodeCard.tsx`

The NodeCard component now includes:
- State for tracking drop indicator position (`dropIndicatorPosition`)
- Enhanced drag item with container ID and sub-step context
- Improved hover logic to determine if drop is in top or bottom half
- Visual indicators rendered at top and bottom based on hover position

## Visual Design

### Drop Indicator Appearance
```
┌─────────────────────────────────────┐
│ ● ══════════════════════════════ ● │  ← Glowing line (top)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        Node Content             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ● ══════════════════════════════ ● │  ← Glowing line (bottom)
└─────────────────────────────────────┘
```

- **●**: Glowing orbs with shadow effects
- **═**: Gradient animated line
- Position determined by cursor location (top 50% vs bottom 50%)

### Colors
- **Dark Mode**: Bright cyan and violet with strong glow
- **Light Mode**: Blue and purple with moderate glow
- **Animation**: Subtle pulse effect (animate-pulse)

## User Experience

### Dragging a Node
1. **Grab**: Click and hold the grip handle (⋮⋮) on any node
2. **Hover**: Move cursor over another node in the same container
3. **See Indicator**: A glowing line appears showing drop position
4. **Drop**: Release mouse to place node at indicated position
5. **Confirm**: Node moves to new position, connections update automatically

### Benefits
- **Clear Feedback**: Users know exactly where the node will go before dropping
- **Prevents Errors**: Visual confirmation reduces accidental mis-placements
- **Professional Feel**: Smooth animations and glowing effects feel polished
- **Accessibility**: High contrast indicators work in all themes

## Technical Implementation

### Drag State Management
```typescript
const [dropIndicatorPosition, setDropIndicatorPosition] = useState<'top' | 'bottom' | null>(null);
```

### Hover Detection
```typescript
// Get mouse position relative to node
const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
const hoverClientY = clientOffset.y - hoverBoundingRect.top;

// Determine position
if (hoverClientY < hoverMiddleY) {
  setDropIndicatorPosition('top');
} else {
  setDropIndicatorPosition('bottom');
}
```

### Cleanup
- Indicators auto-hide when mouse leaves
- State resets on drop completion
- No memory leaks or lingering state

## Browser Compatibility
- Works with react-dnd's built-in browser compatibility
- CSS animations supported in all modern browsers
- Fallback: Even without animations, indicators still visible

## Future Enhancements
Potential improvements for future iterations:
- Cross-container drag and drop with visual connection lines
- Multi-select for batch reordering
- Keyboard shortcuts for reordering (Cmd+Up/Down)
- Undo/redo for drag operations
- Snap-to-grid positioning

## Files Modified
1. `/features/workflow-builder/components/canvas/NodeCard.tsx` - Enhanced with drop indicators
2. `/features/workflow-builder/components/dnd/DropIndicator.tsx` - New component
3. `/features/workflow-builder/components/dnd/NodeDropZone.tsx` - New wrapper component (currently unused but available)
4. `/features/workflow-builder/components/dnd/index.ts` - Added exports

## Testing Checklist
- [x] Drag nodes within main workflow steps
- [x] Drag nodes within sub-step containers
- [x] Visual indicators appear correctly
- [x] Indicators position correctly (top/bottom)
- [x] Indicators hide on drop
- [x] Indicators hide on mouse leave
- [x] Works in dark mode
- [x] Works in light mode
- [x] No console errors
- [x] Smooth animations
