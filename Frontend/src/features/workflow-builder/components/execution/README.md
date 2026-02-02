# Visual Feedback System

Complete visual feedback system for workflow execution with loading states, success/error animations, and connection highlighting.

## 🎯 Features

### 1. Execution State Badges
Shows real-time execution status on workflow nodes.

**States:**
- `idle` - No badge shown
- `pending` - Yellow clock icon with pulse animation
- `running` - Blue spinner with rotating animation
- `success` - Green checkmark with pop animation
- `error` - Red X with shake animation
- `skipped` - Gray minus icon

**Usage:**
```tsx
import { ExecutionStateBadge } from './components/execution';

<ExecutionStateBadge 
  state="running" 
  duration={2340}  // Optional: show execution time
  error="Connection timeout"  // Optional: error message
  size="md"  // sm | md | lg
/>
```

### 2. Node Loading Overlay
Displays loading state with progress bar on executing nodes.

**Features:**
- Blur backdrop overlay
- Animated spinner
- Progress bar (0-100%)
- Custom message
- Animated loading dots

**Usage:**
```tsx
import { NodeLoadingOverlay } from './components/execution';

<NodeLoadingOverlay 
  isLoading={true}
  progress={65}
  message="Processing data..."
/>
```

### 3. Particle Effects
Celebratory or error particles for execution completion.

**Types:**
- `success` - Green particles with ✓, ★, ◆ shapes (12 particles)
- `error` - Red particles with ✕, !, ⚠ shapes (8 particles)

**Usage:**
```tsx
import { ParticleEffect } from './components/execution';

<ParticleEffect 
  type="success"
  trigger={showParticles}
  onComplete={() => setShowParticles(false)}
/>
```

### 4. Execution Progress Panel
Shows overall workflow execution progress at bottom-right.

**Features:**
- Current step tracking
- Progress bar with shimmer effect
- Success/error counts
- Execution duration
- Stop button

**Usage:**
```tsx
import { ExecutionProgress } from './components/execution';

<ExecutionProgress
  isExecuting={true}
  currentStep={3}
  totalSteps={10}
  successCount={2}
  errorCount={0}
  duration={5400}
  onStop={handleStop}
/>
```

### 5. Enhanced Connection Arrows
Interactive connection lines with hover effects.

**Features:**
- Glow effect on hover
- Animated execution flow
- Traveling dot during execution
- Color transitions
- Drop shadow effects

**Usage:**
```tsx
import { ConnectionArrow } from './components/connections';

<ConnectionArrow
  startX={100}
  startY={50}
  endX={300}
  endY={150}
  isActive={false}
  isExecuting={true}
  color="#818CF8"
  strokeWidth={2}
  onClick={() => console.log('clicked')}
/>
```

## 🎨 Animations

All animations are defined in `ExecutionStateBadge.css`:

- `execution-spin` - Spinning loader (1s)
- `execution-pulse` - Pulsing pending state (1.5s)
- `execution-success-pop` - Pop animation for success (0.5s)
- `execution-error-shake` - Shake animation for error (0.5s)
- `execution-glow` - Glow effect for active states (2s)
- `node-execution-highlight` - Node highlight during execution
- `success-particle` - Particle explosion effect (1s)
- `connection-glow` - Connection glow on hover (1.5s)
- `loading-dots` - Loading dots animation (1.4s)
- `shimmer` - Progress bar shimmer effect (1.5s)

## 🎯 State Management

Execution states are managed through utilities in `utils/executionState.ts`:

```typescript
export type NodeExecutionState = 
  | 'idle' 
  | 'pending' 
  | 'running' 
  | 'success' 
  | 'error' 
  | 'skipped';

export interface NodeExecutionResult {
  nodeId: string;
  state: NodeExecutionState;
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: string;
  output?: any;
}
```

**Helper Functions:**
- `getExecutionStateColor(state, theme)` - Get color for state
- `getExecutionStateIcon(state)` - Get icon name for state
- `formatDuration(ms)` - Format milliseconds to readable string

## 🎨 Theme Support

All components support both light and dark themes:

**Dark Theme:**
- Pending: `#FCD34D` (Yellow)
- Running: `#818CF8` (Indigo)
- Success: `#34D399` (Green)
- Error: `#FCA5A5` (Red)
- Idle/Skipped: `#888899` (Gray)

**Light Theme:**
- Pending: `#F59E0B` (Amber)
- Running: `#6366F1` (Indigo)
- Success: `#10B981` (Emerald)
- Error: `#EF4444` (Red)
- Idle/Skipped: `#9CA3AF` (Gray)

## 🚀 Integration Example

Complete integration in a workflow node:

```tsx
import { 
  ExecutionStateBadge, 
  NodeLoadingOverlay, 
  ParticleEffect 
} from './components/execution';

function WorkflowNode({ node, executionState }) {
  const [showParticles, setShowParticles] = useState(false);
  
  useEffect(() => {
    if (executionState === 'success' || executionState === 'error') {
      setShowParticles(true);
    }
  }, [executionState]);

  return (
    <div className="workflow-node">
      {/* Execution Badge */}
      <ExecutionStateBadge 
        state={executionState}
        duration={node.executionTime}
        error={node.error}
      />
      
      {/* Loading Overlay */}
      <NodeLoadingOverlay 
        isLoading={executionState === 'running'}
        progress={node.progress}
        message="Processing..."
      />
      
      {/* Particle Effect */}
      <ParticleEffect 
        type={executionState === 'success' ? 'success' : 'error'}
        trigger={showParticles}
        onComplete={() => setShowParticles(false)}
      />
      
      {/* Node Content */}
      <div className="node-content">
        {node.name}
      </div>
    </div>
  );
}
```

## 🎭 Demo

Test all visual feedback features with the demo component:

```tsx
import { ExecutionDemo } from './components/execution/ExecutionDemo';

// Show demo
<ExecutionDemo />
```

The demo includes:
- All execution state badges
- Interactive execution simulation
- Success/error animations
- Loading states with progress
- Particle effects

## 📦 Component Structure

```
/components/execution/
├── ExecutionStateBadge.tsx    # State badge with animations
├── ExecutionStateBadge.css    # Animation definitions
├── NodeLoadingOverlay.tsx     # Loading overlay with progress
├── ParticleEffect.tsx         # Success/error particles
├── ExecutionProgress.tsx      # Overall progress panel
├── ExecutionDemo.tsx          # Demo component
├── README.md                  # This file
└── index.ts                   # Exports

/components/connections/
├── ConnectionArrow.tsx        # Enhanced connection arrow
└── index.ts                   # Exports

/utils/
└── executionState.ts          # State utilities and types
```

## 🎨 CSS Classes

Custom classes for animations:
- `.execution-spin` - Rotating animation
- `.execution-pulse` - Pulsing animation
- `.execution-success-pop` - Pop animation
- `.execution-error-shake` - Shake animation
- `.execution-glow` - Glow effect
- `.node-executing` - Node highlight
- `.connection-hover` - Connection hover
- `.loading-dot` - Loading dot animation

## 🔧 Customization

All colors, animations, and timings can be customized through:
1. Theme context for colors
2. CSS variables for animations
3. Component props for behavior

## 🎯 Best Practices

1. **Always show loading states** - Users should know when something is processing
2. **Use appropriate feedback** - Match the visual feedback to the action severity
3. **Keep animations short** - Under 1 second for most transitions
4. **Provide error details** - Show helpful error messages in tooltips
5. **Test both themes** - Ensure visual feedback works in light and dark modes
6. **Use particle effects sparingly** - Only for significant actions (success/error)
7. **Track execution time** - Show duration for completed operations
