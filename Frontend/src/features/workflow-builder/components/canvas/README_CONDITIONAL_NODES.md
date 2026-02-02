# Conditional Nodes - Visual Branching System

## Overview
The conditional node system provides an intuitive visual representation of If/Switch logic with clear branching paths.

## Components

### 1. ConditionalNodeCard
**Location**: `/components/canvas/ConditionalNodeCard.tsx`
**Purpose**: Main card component for rendering If/Switch nodes with visual branching

**Features**:
- Collapsible/Expandable view
- True/False branch tabs
- Visual branch indicators (green for true, red for false)
- Inline condition summary
- Drag & drop support
- Configure/Enable/Disable/Delete actions

**Visual Structure**:
```
┌─────────────────────────────────────┐
│  [Drag] [Icon] Node Label           │
│         Condition Summary           │
│         [Expand] [Menu]             │
├─────────────────────────────────────┤
│  [True Tab] [False Tab]             │
├─────────────────────────────────────┤
│  Branch Nodes:                      │
│  ├─ Node 1 (green/red indicator)    │
│  ├─ Node 2                          │
│  └─ Node 3                          │
└─────────────────────────────────────┘
```

### 2. BranchFlowCard
**Location**: `/components/canvas/BranchFlowCard.tsx`
**Purpose**: Individual node card within a branch with visual connectors

**Features**:
- Branch-specific color coding (green/red)
- Visual connection line
- Connection dot indicators
- Hover states
- Status indicators (enabled/disabled)

**Visual Structure**:
```
  │ (vertical connector)
  ●─┐
    └─ [Icon] Node Name
         Type • Category
```

### 3. BranchFlowVisualizer
**Location**: `/components/canvas/BranchFlowVisualizer.tsx`
**Purpose**: Shows the complete workflow structure with both branches side-by-side

**Features**:
- Side-by-side branch comparison
- True path (green) and False path (red)
- Branch node counts
- Empty state indicators
- Merge indicator when both paths exist

**Visual Structure**:
```
┌────────────── Flow Structure ───────────────┐
│                                              │
│  TRUE PATH (2)        FALSE PATH (1)         │
│  ├─ Node A            ├─ Node X             │
│  └─ Node B            └─ (empty)            │
│                                              │
│  → Paths merge and continue                 │
└──────────────────────────────────────────────┘
```

## Integration with StepContainer

The `StepContainer` component now automatically detects conditional nodes and renders them using `ConditionalNodeCard` instead of the regular `NodeCard`:

```tsx
// In StepContainer.tsx
const isConditional = node.type === 'if' || node.type === 'switch';

if (isConditional) {
  return <ConditionalNodeCard ... />;
}

return <NodeCard ... />;
```

## Color Coding

### True Branch (Success Path)
- Primary Color: `text-green-400`
- Background: `bg-green-500/10` to `bg-green-500/30`
- Border: `border-green-500/30`
- Icon: Green indicators

### False Branch (Alternative Path)
- Primary Color: `text-red-400`
- Background: `bg-red-500/10` to `bg-red-500/30`
- Border: `border-red-500/30`
- Icon: Red indicators

### Conditional Node Header
- Gradient: `from-[#FFB75E] to-[#ED8F03]` (Orange gradient)
- Icon: GitBranch

## Property Panel Integration

The `IfSwitchNodeProperties` component provides:
1. **Parameters Tab**:
   - Condition Builder (multiple conditions with AND/OR logic)
   - Branch Configuration (add nodes to true/false paths)
   
2. **Settings Tab**:
   - Node name/label
   - Description
   - Evaluation strategy (for Switch nodes)

## User Workflow

1. **Add Conditional Node**: Drag "If Condition" from sidebar
2. **Configure Conditions**: Click node → Configure in properties panel
3. **Add Branch Nodes**: Click "Add Node to True/False Branch" buttons
4. **Visual Feedback**: See branches in card with color-coded indicators
5. **Expand/Collapse**: Use chevron to show/hide branch details

## Data Structure

```typescript
{
  type: 'if' | 'switch',
  config: {
    conditionGroups: ConditionGroup[],
    convertTypes: boolean,
    trueNodes: ConditionalNode[],
    falseNodes: ConditionalNode[],
    _activeBranch?: 'true' | 'false'
  }
}
```

## Future Enhancements

- [ ] Drag & drop nodes between branches
- [ ] Visual connection lines from conditional to branch nodes
- [ ] Nested conditional support
- [ ] Switch node with multiple cases (beyond true/false)
- [ ] Branch execution history/debugging
- [ ] Performance metrics per branch
