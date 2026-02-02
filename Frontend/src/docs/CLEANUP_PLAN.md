# 🧹 Code Cleanup Plan

## Files to Keep vs Remove

### ✅ KEEP - Active Files (In Use)

#### Main Entry Points
- `/App.tsx` - Main app entry (USES WorkflowBuilderMerged)
- `/components/WorkflowBuilderMerged.tsx` - Currently in use
- `/components/WorkflowBuilderV2.tsx` - Backup/legacy but imported

#### New Architecture (Phase 1-4) - KEEP ALL
- `/features/workflow-builder/**` - All new architecture files (34+ files)

### ⚠️ POTENTIALLY OBSOLETE

#### Old Workflow Builder Components
These are in `/components/workflow-builder/` and may be duplicates:

**Decision Needed:**
1. `/components/WorkflowBuilder.tsx` - Imported in App.tsx but not used?
2. `/components/WorkflowBuilderV2.tsx` - Imported but WorkflowBuilderMerged is used
3. All files in `/components/workflow-builder/` - Do these conflict with new architecture?

### 🗑️ DEFINITELY REMOVE

#### Temporary/Test Files
- `/temp_section.txt` - Temp file
- `/test-conditional-context.ts` - Test file
- `/App_mobile_updated.tsx` - Duplicate/old version

#### Duplicate Documentation (Keep Latest)
Too many PHASE docs - consolidate:
- Keep: Latest versions
- Remove: Intermediate versions

## Detailed Analysis

### 1. Workflow Builder Files

**Current Usage:**
```typescript
// App.tsx line 28
import { WorkflowBuilderMerged } from './components/WorkflowBuilderMerged';

// Line 174-180
const workflowBuilderMemo = useMemo(() => (
  <WorkflowBuilderMerged
    isOpen={showWorkflowBuilder}
    onClose={() => setShowWorkflowBuilder(false)}
    workflowData={workflowData}
  />
), [showWorkflowBuilder, workflowData]);
```

**Status:** `WorkflowBuilderMerged` is the ACTIVE component

**Imported but not used:**
- `WorkflowBuilder` - Line 26 (imported but never rendered)
- `WorkflowBuilderV2` - Line 27 (imported but never rendered)

### 2. Components in `/components/workflow-builder/`

These files exist but may duplicate new architecture:

**Old Components (44 files):**
- TriggerNode.tsx
- WorkflowNode.tsx
- ConditionalNode.tsx
- DraggableTrigger.tsx
- DraggableNodeTemplate.tsx
- DraggableTool.tsx
- etc...

**New Components (in `/features/workflow-builder/`):**
- Similar but better structured
- Uses proper architecture
- Phase 1-4 refactored code

**Conflict Check Needed:** Are old components still imported by WorkflowBuilderMerged?

### 3. Documentation Files

**Keep (Latest):**
- PHASE_4_COMPLETE.md
- PRODUCTION_CHECKLIST.md
- QUICK_START_INTEGRATION.md
- WHATS_NEXT.md

**Consider Archiving:**
- PHASE_1_COMPLETE.md → Move to /docs/archive/
- PHASE_2_COMPLETE.md → Move to /docs/archive/
- PHASE_3_COMPLETE.md → Move to /docs/archive/
- All intermediate guides

## Recommended Actions

### Action 1: Check Dependencies
Analyze what WorkflowBuilderMerged actually imports.

### Action 2: Safe Cleanup
Remove only confirmed unused files:
1. Temp files
2. Unused imports in App.tsx
3. Duplicate docs

### Action 3: Archive
Move old phase docs to archive folder.

### Action 4: Consolidate
Create single source of truth for workflow builder.

## Safety First! 🛡️

Before deleting anything:
1. ✅ Check all imports
2. ✅ Search codebase for usage
3. ✅ Test after removal
4. ✅ Keep backups
