# Pending UI/UX Fixes - Flowversal

## ✅ Completed
1. Created ConfirmDialog component for consistent delete confirmations
2. Added TeamManagement import for ConfirmDialog

## 🔧 Remaining Fixes

### 1. TeamManagement Modal Hover Issues
**Files**: `/components/TeamManagement.tsx`

**Issues**:
- [ ] Close button (X) not visible on hover in light mode
- [ ] Close button should be: `hover:text-red-500` instead of `hover:text-white`
- [ ] Cancel button hover background disappears (white on white)
- [ ] Permission checkboxes hover text turns white in light mode

**Solution**:
Replace all instances of:
- `hover:text-white` → `hover:text-red-500` (for close buttons)
- Permission labels: `group-hover:text-white` → Remove and use conditional based on theme
- Cancel buttons: Add conditional hover based on theme

### 2. Permission Tags Not Updating
**File**: `/components/TeamManagement.tsx`
**Line**: ~415 (Permissions column in table)

**Current Code**:
```tsx
{member.permissions.createWorkflows && <span>Create</span>}
{member.permissions.editWorkflows && <span>Edit</span>}
{member.permissions.deleteWorkflows && <span>Delete</span>}
{member.permissions.manageTeam && <span>Manage Team</span>}
```

**Missing**: Task permissions tags

**Fix Needed**:
```tsx
{member.permissions.createTasks && <span>Create Tasks</span>}
{member.permissions.editTasks && <span>Edit Tasks</span>}
{member.permissions.assignTasks && <span>Assign</span>}
```

### 3. Delete Confirmation Dialog
**Files**: Multiple

**Replace**: `window.confirm()` with `ConfirmDialog` component

**Locations**:
- `/components/TeamManagement.tsx` - handleRemoveMember()
- Workflow builder trigger delete
- Workflow builder node delete

### 4. Trigger System Enhancements
**Files**: `/features/workflow-builder/components/TriggerSection.tsx`

**Required Changes**:
- [ ] Remove "Add node" button below triggers
- [ ] Add AND/OR toggle switch between triggers
- [ ] Allow adding triggers in workflow steps (not just trigger section)

**New Features**:
- Toggle switch component between triggers
- State to track AND/OR logic
- Visual indicator of conditional logic

### 5. Schedule Trigger Improvements
**Files**: 
- Create new `/features/workflow-builder/components/triggers/ScheduleTriggerPanel.tsx`

**Features Needed**:
- Parameters tab (default)
- Settings tab
- Docs tab
- Info banner with activate instructions
- Trigger Rules section
- Interval dropdown: Seconds, Minutes, Hours, Days, Weeks, Months, Custom (Cron)
- Fixed/Expression toggle
- Dynamic form based on interval type

**Reference**: See attached images in user message

### 6. Quick Theme-Safe Hover Fix Pattern

For all hover states that need theme awareness:

```tsx
// Bad (always white)
className="hover:text-white"

// Good (theme-aware for close buttons)
className={theme === 'dark' ? 'hover:text-white' : 'hover:text-red-500'}

// Good (theme-aware for regular text)
className={theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'}

// Good (theme-aware for cancel buttons)
className={theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-200'}
```

## Implementation Order

1. **Phase 1** (High Priority - UX Blockers):
   - Fix all hover states in TeamManagement (30 min)
   - Add permission tags for tasks (10 min)
   - Replace window.confirm with ConfirmDialog (20 min)

2. **Phase 2** (Medium Priority - Feature Enhancement):
   - Trigger AND/OR toggles (45 min)
   - Remove "Add node" button in triggers (5 min)
   - Allow triggers in workflow steps (30 min)

3. **Phase 3** (Advanced Features):
   - Schedule Trigger panel redesign (90 min)
   - Interval selection system (60 min)
   - Fixed/Expression toggle (30 min)

## Files to Modify

### Critical Files:
1. `/components/TeamManagement.tsx` - All hover fixes, permission tags
2. `/components/ConfirmDialog.tsx` - Already created ✅
3. `/features/workflow-builder/components/TriggerSection.tsx` - AND/OR toggles
4. `/features/workflow-builder/components/triggers/ScheduleTriggerPanel.tsx` - New file

### Supporting Files:
5. `/features/workflow-builder/store/workflow.store.ts` - Add trigger logic state
6. `/features/workflow-builder/types/trigger.types.ts` - Add AND/OR type

## Testing Checklist

- [ ] Light mode: All hover states visible and correct color
- [ ] Dark mode: All hover states visible and correct color  
- [ ] Permission tags update immediately after editing
- [ ] Delete confirmation shows Flowversal-styled modal
- [ ] AND/OR toggle works between triggers
- [ ] Schedule trigger shows correct fields for each interval type
- [ ] Trigger conditions properly saved and executed

---

**Next Action**: Start with Phase 1 fixes (hover states + permission tags)
