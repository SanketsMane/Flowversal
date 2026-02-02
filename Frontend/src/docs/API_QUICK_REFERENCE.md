# API Quick Reference Guide 🚀

## Authentication

**Demo Mode (Default):**
- Email: `demo@demo.com`
- Password: `demo@123`
- Token: `demo-access-token` (automatically used)
- No Supabase setup required!

**Production Mode:**
- Uses real Supabase JWT tokens
- Automatically detected and used
- See `/AUTH_FIX_DEMO_MODE.md` for details

## Quick Start

### 1. Check Console Logs
Open browser DevTools console to see all API activity:
```
[DataInitializer] Loading user data for: user@example.com
[Project Store] Loading all data from API
[API Service] GET /projects
[API Service] Response: {"success":true,"data":[...],"count":2}
```

### 2. Create a Project
```typescript
// In any component
import { useProjectStore } from '../stores/projectStore';

const { addProject } = useProjectStore();

// Authentication is automatic - uses current Supabase session
await addProject({
  name: 'My Project',
  description: 'Project description',
  icon: 'Briefcase',
  iconColor: '#3B82F6',
});
```

**Console Output:**
```
[ProjectsEnhanced] Creating project: My Project
[Project Store] Adding project: My Project
[API Service] POST /projects
[API Service] Request payload: {...}
[API] POST /projects - Creating new project
[API] POST /projects - Success - Project ID: proj-123
[Project Store] Project created successfully: proj-123
```

### 3. Create a Board
```typescript
const { addBoard } = useProjectStore();

await addBoard({
  name: 'Sprint Board',
  icon: 'Zap',
  iconColor: '#3B82F6',
  projectId: 'proj-123',
});
```

### 4. Create a Task
```typescript
const { addTask } = useProjectStore();

await addTask({
  name: 'Design landing page',
  description: 'Create mockups',
  boardId: 'board-123',
  projectId: 'proj-123',
  status: 'To do',
  priority: 'High',
  assignedTo: [],
  labels: [],
  createdBy: { id: '1', name: 'User', avatar: 'U' },
  hasWorkflow: false,
});
```

## API Endpoints Cheat Sheet

### Projects
- `GET    /make-server-020d2c80/projects` - List all
- `POST   /make-server-020d2c80/projects` - Create new
- `PUT    /make-server-020d2c80/projects/:id` - Update
- `DELETE /make-server-020d2c80/projects/:id` - Delete

### Boards
- `GET    /make-server-020d2c80/projects/boards?projectId=X` - List by project
- `POST   /make-server-020d2c80/projects/boards` - Create new
- `PUT    /make-server-020d2c80/projects/boards/:id` - Update
- `DELETE /make-server-020d2c80/projects/boards/:id` - Delete

### Tasks
- `GET    /make-server-020d2c80/projects/tasks?boardId=X` - List by board
- `POST   /make-server-020d2c80/projects/tasks` - Create new
- `PUT    /make-server-020d2c80/projects/tasks/:id` - Update
- `DELETE /make-server-020d2c80/projects/tasks/:id` - Delete

## Service Layer Functions

```typescript
import * as projectsAPI from '../services/projects.service';

// All functions automatically use current Supabase session for auth
// No need to pass access tokens - it's handled automatically!

// Projects
await projectsAPI.fetchProjects();
await projectsAPI.createProject(data);
await projectsAPI.updateProject(id, data);
await projectsAPI.deleteProject(id);

// Boards
await projectsAPI.fetchBoards(projectId?);
await projectsAPI.createBoard(data);
await projectsAPI.updateBoard(id, data);
await projectsAPI.deleteBoard(id);

// Tasks
await projectsAPI.fetchTasks(filters?);
await projectsAPI.createTask(data);
await projectsAPI.updateTask(id, data);
await projectsAPI.deleteTask(id);

// Bulk operations
await projectsAPI.fetchAllUserData();
await projectsAPI.fetchCompleteProjectData(projectId);
```

## Store Functions

```typescript
import { useProjectStore } from '../stores/projectStore';

const {
  // Data
  projects,
  boards,
  tasks,
  isLoading,
  
  // Projects
  addProject,
  updateProject,
  deleteProject,
  
  // Boards
  addBoard,
  updateBoard,
  deleteBoard,
  getBoardsByProject,
  
  // Tasks
  addTask,
  updateTask,
  deleteTask,
  getTasksByBoard,
  getTasksByProject,
  getAllUserTasks,
  
  // Load data
  loadAllData,
} = useProjectStore();
```

## Log Prefixes

- `[API Service]` - Client-side API calls
- `[Project Store]` - State management
- `[ProjectsEnhanced]` - UI component
- `[DataInitializer]` - App initialization
- `[API]` - Server-side (check server logs)

## Common Patterns

### Pattern 1: Create and Navigate
```typescript
const handleCreate = async () => {
  try {
    const id = await addProject(data);
    navigate(`/projects/${id}`);
  } catch (error) {
    alert('Failed to create project');
  }
};
```

### Pattern 2: Update with Optimistic UI
```typescript
const handleUpdate = async (id, updates) => {
  // Store handles optimistic update and rollback
  await updateProject(id, updates);
};
```

### Pattern 3: Delete with Confirmation
```typescript
const handleDelete = async (id) => {
  if (confirm('Are you sure?')) {
    await deleteProject(id);
  }
};
```

## Error Handling

### Store Level (Auto-handled)
- Optimistic updates
- Automatic rollback on failure
- Console error logging

### Component Level (Manual)
```typescript
try {
  await addProject(data);
  // Success handling
} catch (error) {
  // Error handling
  console.error('Failed:', error);
  alert('Operation failed');
}
```

## Debugging Tips

### 1. Check Browser Console
All operations log to console. Look for:
- Request payloads
- Response data
- Error messages
- Operation flow

### 2. Check Network Tab
See actual HTTP requests:
- Request headers (Authorization)
- Request body
- Response status
- Response body

### 3. Check Server Logs
In your Supabase dashboard:
- Edge Functions logs
- Error messages
- Request details

### 4. Common Issues

**Issue**: No data showing
- Check: `[DataInitializer]` logs
- Solution: Ensure user is authenticated

**Issue**: Create not working
- Check: `[API Service]` response
- Solution: Check server logs for validation errors

**Issue**: Updates not persisting
- Check: Network tab for 401 errors
- Solution: Refresh auth token

## File Locations

```
/supabase/functions/server/
  ├── index.tsx              # Main server
  └── projects.ts            # Project/Board/Task routes

/services/
  └── projects.service.ts    # API service layer

/stores/
  └── projectStore.ts        # State management

/components/
  ├── DataInitializer.tsx    # Data loading
  ├── ProjectsEnhanced.tsx   # Main UI
  ├── CreateProjectModal.tsx # Create project
  ├── CreateBoardModal.tsx   # Create board
  └── CreateTaskModal.tsx    # Create task
```

## Testing Checklist

- [ ] Create a project → Check console logs
- [ ] Create a board → Check console logs
- [ ] Create a task → Check console logs
- [ ] Update a task → Check console logs
- [ ] Delete a task → Check console logs
- [ ] Refresh page → Data should load
- [ ] Disconnect internet → Should show error
- [ ] Reconnect → Should work again

## Support

If something isn't working:

1. Open browser console
2. Look for error messages
3. Check the last API call that failed
4. Verify authentication (should see Bearer token in requests)
5. Check server logs in Supabase dashboard

All operations now have comprehensive logging to help you debug any issues!
