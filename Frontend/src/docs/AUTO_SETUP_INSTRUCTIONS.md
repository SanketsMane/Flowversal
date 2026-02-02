# 🚀 Quick Setup for Justin User

## Current Status: API Routes Fixed ✅

The API routing issues have been resolved. All endpoints are now properly configured:
- ✅ Projects: `GET /`
- ✅ Boards: `GET /boards`
- ✅ Tasks: `GET /tasks`
- ✅ All CRUD operations working

## 🎯 To Get Started with Justin User

### Option 1: Use Dev Tools (Easiest) 🛠️

1. **Look for the "🛠️ Dev Tools" button** in the bottom-right corner of the screen
2. **Click "👤 Login as Justin"** - This will:
   - Log you in as justin@gmail.com
   - Automatically reload the page
3. **Click "🌱 Seed Justin Data"** - This will:
   - Create 3 sample projects
   - Create 3 sample boards
   - Create 5 sample tasks with proper assignments to Justin
   - Reload the page with all data loaded

### Option 2: Manual Login

1. **Logout** if currently logged in
2. **Login with these credentials:**
   - Email: `justin@gmail.com`
   - Password: `justin@123`
3. **The app will automatically create initial data on first login**

### Option 3: Browser Console (Advanced)

```javascript
// Login as Justin
const loginAsJustin = async () => {
  const response = await fetch('https://YOUR_PROJECT.supabase.co/functions/v1/make-server-020d2c80/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'justin@gmail.com',
      password: 'justin@123'
    })
  });
  const result = await response.json();
  console.log('Login result:', result);
  window.location.reload();
};

loginAsJustin();
```

## 📊 What You'll Get

After seeding data, Justin will have:

### Projects (3):
1. **🎨 Website Redesign** - Complete overhaul of company website
2. **📱 Mobile App** - iOS and Android mobile application
3. **🤖 AI Integration** - Integrate AI capabilities into platform

### Boards (3):
1. **✨ Design Sprint** (Website Redesign)
2. **💻 Development** (Website Redesign)
3. **🚀 App Development** (Mobile App)

### Tasks (5):
- **TASK-1**: Create wireframes (To Do, High Priority) - Assigned to Justin
- **TASK-2**: Design system (In Progress, High Priority) - Assigned to Justin
- **TASK-3**: User testing (Review, Medium Priority) - Assigned to Justin
- **TASK-4**: Setup project (Done, High Priority) - Assigned to Justin ✅ Has Workflow
- **TASK-5**: Build components (In Progress, High Priority) - Assigned to Justin

## 🔍 Troubleshooting

### Still seeing "Unknown error"?

1. **Hard refresh your browser:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Check browser console for these logs:**
   ```
   [Projects Service] Service initialized with base URL: ...
   [API Service] GET /
   [API Service] Full URL: https://...
   [API Service] Response text: ...
   ```

3. **If you see 401 Unauthorized:**
   - You're not logged in
   - Use Dev Tools to login as Justin
   - Or login manually with justin@gmail.com / justin@123

4. **If you see 404 Not Found:**
   - The Supabase function might not be deployed
   - Check that the edge function is running
   - Try the health check: `GET /make-server-020d2c80/projects/health`

5. **If you see empty/blank response:**
   - The server might be returning non-JSON
   - Check the console for "Response text:"
   - This will show the raw server response

### Health Check

Test if the server is running:
```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-020d2c80/projects/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "projects",
  "timestamp": "2024-11-29T..."
}
```

## 🔐 User Credentials Available

### Justin (Admin)
- Email: `justin@gmail.com`
- Password: `justin@123`
- Role: Admin (Full access)
- Token: `justin-access-token`

### Demo (Regular User)
- Email: `demo@demo.com`
- Password: `demo@123`
- Role: User (No delete permissions)
- Token: `demo-access-token`

## 📝 Notes

- **Justin has admin role** - Can create, read, update, and delete everything
- **Demo has user role** - Can create, read, update, but cannot delete projects/boards
- **All data is stored in KV store** - Persists across sessions
- **Dev Tools is always visible** - Easy to switch users or reseed data
- **Security is enforced** - Role-based permissions are active

## ✅ Verification

After logging in as Justin and seeding data, you should see:
1. ✅ Projects list with 3 projects
2. ✅ Each project shows board count
3. ✅ Click a project to see its boards
4. ✅ Click a board to see Kanban view with tasks
5. ✅ All tasks are assigned to Justin
6. ✅ No empty states or errors
7. ✅ Add Task buttons visible at top of columns
8. ✅ Filter/sort functionality working

## 🎉 Success!

Once you see Justin's projects and tasks, everything is working correctly!

**The API routing issues are now fully resolved.** 🚀
