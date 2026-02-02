# 🎯 How to Use Your New Admin Panel

## Quick Start

### **1. Access the Admin Panel**

Simply navigate to:
```
http://localhost:5173/admin
```

The app will automatically detect you're on the admin route and show the admin panel!

### **2. Login Check**

The admin panel checks if you're logged in with an admin account. 

**Default Demo User is an Admin:**
- Email: `demo@flowversal.com`
- Role: `admin`

If you see "Access Denied", you need to:
1. Go back to main app (`/`)
2. Login
3. Return to `/admin`

## 📱 Navigation

### **Admin Sidebar:**
- **Dashboard** - Overview metrics and charts
- **Users** - Manage all users
- **Workflows** - View all workflows (coming soon)
- **Executions** - View all execution logs

## 🧪 Test Real Data Connection

### **Test 1: User Management**

1. **Go to Users page**
2. **You'll see 1 user** (the demo user)
3. **Try these actions:**
   - Click "Suspend" → User status changes to "suspended"
   - Click "Activate" → User status changes back to "active"
   - Search by name/email → Filtering works
   - Filter by status → Shows active/suspended users

**This is REAL data!** If you suspend yourself, you won't be able to login to the main app!

### **Test 2: Dashboard Metrics**

1. **Go to Dashboard**
2. **Check the metrics:**
   - Total Users: `1` (the demo user)
   - Total Workflows: `0` (none created yet)
   - Total Executions: `0` (none run yet)

**All real numbers from actual stores!**

### **Test 3: Executions Tracking**

Currently empty because no workflows have been executed yet.

**To populate executions:**

Option 1: Run workflows in the main app (when execution is hooked up)

Option 2: Manually add a test execution (for testing):

```typescript
// In browser console while on /admin:
useExecutionStore.getState().addExecution({
  workflowId: 'test-wf-1',
  workflowName: 'Test Workflow',
  userId: 'user-1',
  userName: 'Demo User',
  status: 'success',
  startedAt: Date.now() - 5000,
  completedAt: Date.now(),
  duration: 5000,
  triggerType: 'Manual',
  stepsExecuted: 3,
  totalSteps: 3,
  aiTokensUsed: 150,
  apiCallsMade: 2,
});
```

Then refresh the Executions page and you'll see it!

## 🎨 Admin Panel Features

### **Dashboard Page**

**Stats Cards:**
- Total Users
- Total Workflows
- Total Executions
- Pro Plan Users
- Avg Execution Time
- AI Tokens Used

**Charts:**
- User Growth (line chart)
- Workflow Executions (bar chart)
- Plan Distribution (pie chart)

**Lists:**
- Top 5 Workflows
- Top 5 Users

**Everything updates in real-time as data changes!**

### **Users Page**

**Actions:**
- ✅ Search users by name/email
- ✅ Filter by status (All/Active/Suspended)
- ✅ Suspend users
- ✅ Activate users
- ✅ Delete users (soft delete)
- ✅ View user stats (workflows, executions)

**Table Columns:**
- User (name + email)
- Role
- Plan (Free/Pro/Enterprise)
- Status (Active/Suspended)
- Usage (workflows + executions)
- Joined date
- Actions (suspend/activate/delete)

### **Executions Page**

**Features:**
- ✅ Search by workflow name or user
- ✅ Filter by status (All/Success/Failed/Running)
- ✅ View progress (steps executed / total)
- ✅ See duration
- ✅ View timestamps

**Shows:**
- Workflow name
- User who ran it
- Status badge
- Progress bar
- Duration
- Started timestamp

### **Workflows Page**

Currently shows a "Coming Soon" message. 

**Will show:** All workflows when you add a central workflow registry/save feature.

## 🔧 Developer Tips

### **Adding New Users:**

```typescript
import { useUserStore } from './stores/core/userStore';

// Add a new user
useUserStore.getState().addUser({
  email: 'newuser@example.com',
  name: 'New User',
  role: 'user',
  status: 'active',
  lastLogin: Date.now(),
  subscription: {
    plan: 'free',
    status: 'active',
    startDate: Date.now(),
    cancelAtPeriodEnd: false,
  },
});

// Now check /admin users page - new user appears!
```

### **Tracking Workflow Executions:**

When you run a workflow in your main app, call:

```typescript
import { useExecutionStore } from './stores/core/executionStore';

// Start execution
const execId = useExecutionStore.getState().addExecution({
  workflowId: workflow.id,
  workflowName: workflow.name,
  userId: currentUser.id,
  userName: currentUser.name,
  status: 'running',
  startedAt: Date.now(),
  triggerType: 'Manual',
  stepsExecuted: 0,
  totalSteps: workflow.steps.length,
  aiTokensUsed: 0,
  apiCallsMade: 0,
});

// Update progress...
useExecutionStore.getState().updateExecution(execId, {
  stepsExecuted: 1,
});

// Complete execution
useExecutionStore.getState().completeExecution(
  execId,
  'success',
  { result: 'data' }
);

// Check /admin executions page - execution appears!
```

### **Checking if User is Admin:**

```typescript
import { useAuthStore } from './stores/core/authStore';

const { isAdmin } = useAuthStore();

if (isAdmin()) {
  // Show admin-only features
}
```

## 🚀 Going to Production

### **Subdomain Setup:**

When you deploy to production, the domain router will automatically work with real subdomains:

**Development (current):**
- Main App: `http://localhost:5173/`
- Admin: `http://localhost:5173/admin`

**Production (automatic):**
- Main App: `https://app.flowversal.com`
- Admin: `https://admin.flowversal.com`

**No code changes needed!** The `domainDetector.ts` handles both modes automatically.

### **DNS Configuration:**

Add these DNS records:
```
app.flowversal.com    → Your server IP
admin.flowversal.com  → Your server IP
docs.flowversal.com   → Your server IP (future)
```

## 📊 Data Persistence

All admin data is persisted to localStorage using Zustand's persist middleware:

**Storage Keys:**
- `flowversal-auth` - Authentication state
- `flowversal-users` - User data
- `flowversal-executions` - Execution logs

**Clear data:**
```javascript
// In browser console
localStorage.clear();
// Then refresh
```

## 🎯 Common Tasks

### **View All Users:**
1. Go to `/admin`
2. Click "Users" in sidebar
3. See all users with their stats

### **Check System Health:**
1. Go to `/admin`
2. Dashboard shows:
   - How many users
   - How many active workflows
   - Execution success rate
   - System usage

### **Find Failed Executions:**
1. Go to `/admin`
2. Click "Executions"
3. Click "Failed" filter button
4. See all failed executions

### **Track User Activity:**
1. Go to `/admin` 
2. Click "Users"
3. Each user shows:
   - Workflows created
   - Executions run
   - Join date
   - Last login (coming soon)

## 🎨 Customization

The admin panel uses your Flowversal design tokens. To customize:

**Colors are in the components:**
- Background: `bg-[#0E0E1F]`
- Cards: `bg-[#1A1A2E]`
- Borders: `border-[#2A2A3E]`
- Gradient: `from-[#00C6FF] to-[#9D50BB]`

All consistent with your main app!

## 💡 Tips

1. **Keep Admin Tab Open** - Watch metrics update in real-time as you use the main app
2. **Use Two Browser Windows** - Main app in one, admin in another
3. **Check Executions** - See exactly what's happening when workflows run
4. **User Management** - Easily manage user access and subscriptions

## 🎉 You're Ready!

Your admin panel is fully functional with real data. Start using it to manage your Flowversal platform! 🚀

**Questions?**
- Check `/SPRINT_1_COMPLETE.md` for technical details
- All admin code is in `/apps/admin/`
- All core stores are in `/stores/core/`
