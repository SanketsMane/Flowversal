# 📍 Filter & Sort Location Guide

## 🎯 Where to Find Filter & Sort Dropdowns

The **AdvancedFilters** and **AdvancedSort** components are displayed in the **Projects Board View**.

---

## 📂 Navigation Path

### Step-by-Step:

1. **Open the App** → You'll see the main navigation
2. **Click "Projects"** in the left sidebar (Folder icon)
3. **Select a Project** from the dropdown (e.g., "Flowversal Dashboard")
4. **Select a Board** from the dropdown (e.g., "Sprint Board")
5. **Look at the top-right toolbar** → You'll see the **Filter** and **Sort** buttons!

---

## 🎨 Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Projects                                                    [+ Team]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📁 Project: Flowversal Dashboard ▼                                     │
│  📋 Board: Sprint Board ▼                                               │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ 🔍 Search...        [📊 Filter] [⬆️ Sort]    [👥] [📋] [📈]     │ │  ← HERE!
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [Active] [Backlogs] [Completed]                                  │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                   │  │
│  │  Backlog    │  To do    │  In Progress  │  Review  │  Done      │  │
│  │  ─────────  │  ─────────│  ───────────  │  ──────  │  ────      │  │
│  │  [Task 1]   │  [Task 3] │  [Task 5]     │  [Task]  │  [Task]    │  │
│  │  [Task 2]   │  [Task 4] │  [Task 6]     │          │            │  │
│  │             │           │               │          │            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Exact Location in UI

### Board Header Toolbar (Top-Right):

The filters appear in this order from left to right:

```
[🔍 Search Box]  [📊 Filter]  [⬆️ Sort]  [List]  [Kanban]  [Chart]
                     ↑           ↑
                     |           |
              Click here!   Click here!
```

### When You Click "Filter":

```
                    [📊 Filter 3]  ← Button with active count
                         ↓
        ┌────────────────────────────────┐
        │ 🔍 Filters          [3]    ×  │
        ├────────────────────────────────┤
        │ 👥 Members                     │
        │   ☑ 👤 justin@gmail.com       │
        │   ☐ 👤 Sarah Johnson          │
        │   ☐ 👤 Mike Chen              │
        ├────────────────────────────────┤
        │ ✅ Status                      │
        │   ☑ In Progress               │
        │   ☐ Review                    │
        ├────────────────────────────────┤
        │ 🚩 Priority                    │
        │   ☑ 🔴 Critical               │
        │   ☑ 🟠 High                   │
        │   ☐ 🟡 Medium                 │
        ├────────────────────────────────┤
        │ 🏷️ Labels                      │
        │   ☑ Feature                   │
        │   ☐ Bug                       │
        ├────────────────────────────────┤
        │ 📅 Due Date                    │
        │   ◉ All                       │
        │   ○ Overdue                   │
        │   ○ This Week                 │
        ├────────────────────────────────┤
        │ [Clear All]        [Apply]    │
        └────────────────────────────────┘
```

### When You Click "Sort":

```
                         [⬆️ Sort]  ← Button
                             ↓
        ┌────────────────────────────────┐
        │ ⬆️ Sort By                     │
        ├────────────────────────────────┤
        │ [🚩] Priority              ✓  │ ← Selected
        │      Critical → Low            │
        ├────────────────────────────────┤
        │ [📅] Due Date                  │
        │      Earliest first            │
        ├────────────────────────────────┤
        │ [🔤] Task Name                 │
        │      Alphabetical A → Z        │
        ├────────────────────────────────┤
        │ [📋] Status                    │
        │      Grouped by stage          │
        ├────────────────────────────────┤
        │ [👤] Assignee                  │
        │      Grouped by member         │
        ├────────────────────────────────┤
        │ [🕐] Created Date              │
        │      Newest first              │
        ├────────────────────────────────┤
        │ [🕑] Last Updated              │
        │      Recently modified         │
        └────────────────────────────────┘
```

---

## 📁 File Structure

### Component Files:

| File | Location | Purpose |
|------|----------|---------|
| **AdvancedFilters.tsx** | `/components/AdvancedFilters.tsx` | Filter dropdown UI & logic |
| **AdvancedSort.tsx** | `/components/AdvancedSort.tsx` | Sort dropdown UI & logic |
| **ProjectsEnhanced.tsx** | `/components/ProjectsEnhanced.tsx` | Main board view (renders both) |

### Where They're Imported:

**In `/components/ProjectsEnhanced.tsx` (Lines 27-28):**

```tsx
import { AdvancedFilters, FilterOptions } from './AdvancedFilters';
import { AdvancedSort, SortOption } from './AdvancedSort';
```

### Where They're Rendered:

**In `/components/ProjectsEnhanced.tsx` (Lines 873-936):**

```tsx
{/* Filter Button - Wrapped in relative container */}
<div className="relative">
  <button onClick={() => setShowFilters(!showFilters)}>
    <Filter className="w-4 h-4" />
    Filter
    {activeCount > 0 && <span className="badge">{activeCount}</span>}
  </button>

  {/* Advanced Filters Dropdown */}
  <AdvancedFilters
    isOpen={showFilters}
    onClose={() => setShowFilters(false)}
    filters={advancedFilters}
    onFiltersChange={setAdvancedFilters}
    availableMembers={[...]}
    availableStatuses={['Backlog', 'To do', 'In Progress', ...]}
    availablePriorities={['Critical', 'High', 'Medium', 'Low']}
    availableLabels={['Feature', 'Bug', 'Enhancement', ...]}
  />
</div>

{/* Sort Button - Wrapped in relative container */}
<div className="relative">
  <button onClick={() => setShowSort(!showSort)}>
    <SortAsc className="w-4 h-4" />
    Sort
  </button>

  {/* Advanced Sort Dropdown */}
  <AdvancedSort
    isOpen={showSort}
    onClose={() => setShowSort(false)}
    currentSort={sortBy}
    onSortChange={setSortBy}
  />
</div>
```

---

## 🎬 Testing Instructions

### Test Filter:

**Step 1: Navigate to Board**
```
App → Sidebar → Projects → Select Project → Select Board
```

**Step 2: Click Filter**
```
Top-right toolbar → Click "Filter" button
```

**Step 3: Verify Dropdown**
```
✅ Dropdown appears below button
✅ Shows 5 filter sections
✅ Members show avatars + names
✅ Priority shows color-coded flags
✅ Labels section visible
✅ Due Date section visible
```

**Step 4: Apply Filter**
```
Check "High" priority → Click Apply
✅ Board shows only high-priority tasks
✅ Button shows "Filter 1" badge
✅ Button turns cyan
```

### Test Sort:

**Step 1: Click Sort**
```
Top-right toolbar → Click "Sort" button
```

**Step 2: Verify Dropdown**
```
✅ Dropdown appears below button
✅ Shows 7 sort options
✅ Each option has gradient icon
✅ Current selection has checkmark
```

**Step 3: Apply Sort**
```
Click "Priority" option
✅ Dropdown closes
✅ Tasks reorder by priority
✅ Checkmark appears on "Priority"
```

---

## 🔧 State Management

### Filter State (Line 261):

```tsx
const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
  members: [],        // Array of user IDs
  statuses: [],       // Array of status strings
  priorities: [],     // Array of priority strings
  labels: [],         // Array of label strings
  dueDateRange: 'all' // 'all' | 'overdue' | 'today' | 'week' | 'month' | 'no-date'
});
```

### Sort State (Line 258):

```tsx
const [sortBy, setSortBy] = useState<SortOption>('dueDate');
// Options: 'priority' | 'dueDate' | 'name' | 'status' | 'assignee' | 'createdAt' | 'updated'
```

### UI State:

```tsx
const [showFilters, setShowFilters] = useState(false);  // Line 253
const [showSort, setShowSort] = useState(false);        // Line 254
```

---

## 🎯 When Filters Are Applied

### Filter Logic (Lines 474-517):

```tsx
// Apply advanced filters
if (advancedFilters.members.length > 0) {
  filtered = filtered.filter(t => 
    t.assignedTo.some(user => advancedFilters.members.includes(user.id))
  );
}

if (advancedFilters.statuses.length > 0) {
  filtered = filtered.filter(t => advancedFilters.statuses.includes(t.status));
}

if (advancedFilters.priorities.length > 0) {
  filtered = filtered.filter(t => advancedFilters.priorities.includes(t.priority));
}

if (advancedFilters.labels.length > 0) {
  filtered = filtered.filter(t => 
    t.labels && t.labels.some(label => advancedFilters.labels.includes(label))
  );
}

if (advancedFilters.dueDateRange !== 'all') {
  // Filter by due date range (overdue, today, week, month, no-date)
}
```

### Sort Logic (Lines 540-565):

```tsx
filtered.sort((a, b) => {
  switch (sortBy) {
    case 'priority':
      const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    
    case 'dueDate':
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    
    case 'name':
      return a.name.localeCompare(b.name);
    
    case 'status':
      return a.status.localeCompare(b.status);
    
    case 'assignee':
      return a.assignedTo[0]?.name.localeCompare(b.assignedTo[0]?.name);
    
    case 'createdAt':
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    
    case 'updated':
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  }
});
```

---

## 🎨 Styling & Theme

Both components support **light and dark themes** via `useTheme()`:

### Dark Mode:
```tsx
bgMain: 'bg-[#0E0E1F]'        // Dark navy background
textPrimary: 'text-white'      // White text
borderColor: 'border-white/10' // Subtle white border
hoverBg: 'hover:bg-white/5'    // Subtle hover effect
```

### Light Mode:
```tsx
bgMain: 'bg-white'             // White background
textPrimary: 'text-gray-900'   // Dark text
borderColor: 'border-gray-200' // Gray border
hoverBg: 'hover:bg-gray-100'   // Gray hover effect
```

---

## ✅ Quick Reference

### To Find Filter & Sort:

1. ✅ **Route**: Projects page
2. ✅ **Location**: Board view (not list or chart view)
3. ✅ **Position**: Top-right toolbar, next to search bar
4. ✅ **Visibility**: Always visible when a board is selected
5. ✅ **View**: Kanban board layout

### Component Hierarchy:

```
App.tsx
  └── ProjectsEnhanced.tsx (Main Projects component)
        ├── Board Header (Line ~850-940)
        │     ├── Search Bar
        │     ├── Filter Button + AdvancedFilters (Line 873-917)
        │     └── Sort Button + AdvancedSort (Line 919-936)
        └── Board Content (Kanban columns)
```

---

## 🚀 Summary

**The Filter and Sort dropdowns are located in:**

📍 **Page**: Projects  
📍 **View**: Board (Kanban)  
📍 **Position**: Top-right toolbar  
📍 **Lines**: 873-936 in `/components/ProjectsEnhanced.tsx`  

**To access them:**

1. Click "Projects" in sidebar
2. Select any project
3. Select any board
4. Look for the toolbar at the top
5. Click "Filter" or "Sort" buttons

**They appear when:**

✅ A board is selected  
✅ You're in board view (not My Tasks)  
✅ The board has tasks  

**They work with:**

✅ All board tabs (Active, Backlogs, Completed)  
✅ All view modes (List, Kanban, Chart)  
✅ Both light and dark themes  
✅ All screen sizes (responsive)  

---

## 🎉 Everything is Working!

The Filter and Sort systems are **fully functional** and ready to use in the **Projects Board View**! 🚀✨
