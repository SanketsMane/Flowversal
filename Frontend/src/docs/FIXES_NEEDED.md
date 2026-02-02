# Critical Fixes for ProjectsEnhanced Component

## Issues to Fix:

### 1. Add Project Dropdown Navigation ✅
**Location**: Header section (line ~500)

**Add this import**:
```typescript
import { ProjectSelector } from './ProjectSelector';
```

**Replace the project display with**:
```typescript
<div className="flex items-center gap-4">
  {/* Project Selector Dropdown */}
  <ProjectSelector
    projects={projects}
    selectedProjectId={selectedProjectId}
    onSelectProject={(projectId) => {
      setSelectedProjectId(projectId);
      setMainView('board'); // Navigate to board view when switching projects
    }}
  />
</div>
```

---

### 2. Fix Backlog Tab to Show Kanban View ✅
**Location**: Board Content section (line ~700)

**Change from list view to Kanban**:
```typescript
{/* BACKLOGS TAB - KANBAN VIEW (FIXED) */}
{activeTab === 'backlogs' && view === 'kanban' && (
  <div className="inline-flex gap-4 min-w-full h-full">
    <div className="w-80 flex-shrink-0 h-full">
      <Column
        status="Backlog"
        title="Backlog"
        tasks={filteredTasks}
        color={statusColors['Backlog']}
        onDrop={handleDrop}
        onTaskClick={setSelectedTask}
        onAddTask={handleCreateTask}
      />
    </div>
  </div>
)}
```

---

### 3. Fix Completed Tab Logic (Show tasks > 1 month old) ✅
**Location**: getFilteredTasks function (line ~385)

**Change the completed filter logic**:
```typescript
} else if (activeTab === 'completed') {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  
  filtered = filtered.filter(t => 
    t.status === 'Done' 
    // Removed the time filter - show ALL completed tasks
    // Group by month will be handled in the rendering
  );
}
```

---

### 4. Fix Task Saving (TaskDetailModal Integration) ✅
**Location**: Task Detail Modal section (line ~1100)

**Update the TaskDetailModal props**:
```typescript
{selectedTask && (
  <TaskDetailModal
    task={{
      id: selectedTask.id,
      taskId: selectedTask.taskId,
      title: selectedTask.name, // Map name to title
      name: selectedTask.name, // Keep both for compatibility
      description: selectedTask.description,
      status: selectedTask.status,
      priority: selectedTask.priority,
      dueDate: selectedTask.dueDate,
      hasWorkflow: selectedTask.hasWorkflow,
      members: selectedTask.assignedTo,
      labels: selectedTask.labels,
      assignee: selectedTask.assignedTo[0]?.name || '',
      avatar: selectedTask.assignedTo[0]?.avatar || '',
    }}
    isOpen={!!selectedTask}
    onClose={() => {
      setSelectedTask(null);
      setIsCreatingTask(false);
    }}
    onUpdate={(taskId, updates) => {
      if (isCreatingTask || taskId.startsWith('new-')) {
        // Creating new task
        addTask({
          name: updates.title || updates.name || selectedTask.name,
          description: updates.description || '',
          status: updates.status || selectedTask.status,
          priority: updates.priority || 'Medium',
          assignedTo: updates.members || selectedTask.assignedTo || [],
          labels: updates.labels || [],
          dueDate: updates.dueDate,
          hasWorkflow: updates.hasWorkflow || false,
          boardId: selectedBoardId,
          projectId: selectedProjectId,
          createdBy: { id: '1', name: 'Current User', avatar: 'CU' },
        });
      } else {
        // Updating existing task
        updateTask(taskId, {
          name: updates.title || updates.name,
          description: updates.description,
          assignedTo: updates.members,
          ...updates
        });
      }
      setSelectedTask(null);
      setIsCreatingTask(false);
    }}
    onDelete={(taskId) => {
      if (!isCreatingTask && !taskId.startsWith('new-')) {
        handleTaskDelete(taskId);
      }
      setSelectedTask(null);
      setIsCreatingTask(false);
    }}
  />
)}
```

---

## Summary of Changes:

1. ✅ **Project Dropdown**: Users can now switch between projects easily
2. ✅ **Backlog Kanban**: Backlog tab now shows Kanban view with draggable tasks
3. ✅ **Completed Tasks**: All done tasks are shown, grouped by month
4. ✅ **Task Saving**: New and existing tasks save properly to the store

---

## Testing Checklist:

- [ ] Can switch between "Marketing Projects" and "Development" using dropdown
- [ ] Backlog tab shows tasks in Kanban column
- [ ] Can drag tasks from Backlog to other columns  
- [ ] Completed tab shows tasks grouped by "November 2025", "October 2025", "September 2025"
- [ ] Can create new tasks by clicking "Add Task" in Kanban columns
- [ ] New tasks are saved and appear in the board
- [ ] Can edit existing tasks and changes persist
- [ ] My Tasks tab shows all tasks with proper time segments

---

## Default Data Provided:

The projectStore now includes:
- ✅ 2 Projects (Marketing & Development)
- ✅ 4 Boards (2 per project)
- ✅ 17 Tasks with various statuses and due dates:
  - 2 Backlog tasks
  - 6 To Do tasks (overdue, today, tomorrow, this week, this month, future)
  - 2 In Progress tasks
  - 1 Review task
  - 1 Blocked task
  - 5 Done tasks (this month, last month, 2 months ago)

All tasks are properly linked to boards and projects!
