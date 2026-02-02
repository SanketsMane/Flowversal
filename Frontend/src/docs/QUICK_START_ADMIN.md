# ⚡ Quick Start: Admin Panel

## 🎯 Access Admin Panel

```
http://localhost:5173/admin
```

## 🏗️ Architecture at a Glance

```
Main App (/app) ←→ Core Stores ←→ Admin Panel (/admin)
                       ↓
              [ONE SOURCE OF TRUTH]
              • authStore
              • userStore  
              • executionStore
```

**Key Concept:** Admin shows REAL data from your app, not mock data!

## 📁 What We Built (Sprint 1)

### **Core Stores** (`/stores/core/`)
- ✅ `authStore.ts` - Authentication & user session
- ✅ `userStore.ts` - All users (REAL!)
- ✅ `executionStore.ts` - All workflow executions (REAL!)

### **Admin Stores** (`/stores/admin/`)
- ✅ `analyticsStore.ts` - Computed metrics (NO MOCK DATA!)

### **Admin Pages** (`/apps/admin/pages/`)
- ✅ `Dashboard.tsx` - Real metrics & charts
- ✅ `Users.tsx` - Real CRUD operations
- ✅ `Workflows.tsx` - Structure ready
- ✅ `Executions.tsx` - Real execution logs

### **Routing** (`/routing/`)
- ✅ `domainDetector.ts` - Multi-domain support

## 🚀 Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Real User Data | ✅ | No mock users - uses actual userStore |
| User CRUD | ✅ | Create, suspend, activate, delete |
| Real Metrics | ✅ | Computed from actual data |
| Execution Tracking | ✅ | Real workflow execution logs |
| Charts | ✅ | User growth, executions, plan distribution |
| Multi-Domain Routing | ✅ | Works with paths now, subdomains in production |
| Admin Access Control | ✅ | Only admins can access admin panel |
| Consistent Design | ✅ | Same Flowversal theme throughout |

## 💡 How It's Different from Mock Data

### ❌ Old Way (Mock Data):
```typescript
// Fake users that don't exist anywhere
const mockUsers = [
  { id: '1', name: 'Fake User 1' },
  { id: '2', name: 'Fake User 2' },
];
```

### ✅ New Way (Real Data):
```typescript
// Real users from shared store
const users = useUserStore.getState().users;
// Same users in app and admin!
```

## 🎯 Test It Out

### **1. Check Dashboard**
```
/admin → Dashboard
```
See: Real user count, execution metrics, charts

### **2. Manage Users**
```
/admin → Users
```
Try: Suspend user, activate user, search, filter

### **3. View Executions**
```
/admin → Executions
```
See: All workflow runs (will be empty until you run workflows)

## 📊 Data Flow Example

When you create a user in the app:
```typescript
// In main app
useUserStore.getState().addUser({
  email: 'test@example.com',
  name: 'Test User',
  // ...
});
```

**Instantly visible in admin panel!** No sync needed - it's the same store.

## 🔧 Quick Code References

### **Import Core Stores:**
```typescript
import { useUserStore, useAuthStore, useExecutionStore } from '@/stores/core';
```

### **Import Admin Components:**
```typescript
import { AdminApp } from '@/apps/admin';
```

### **Check if Admin:**
```typescript
const { isAdmin } = useAuthStore();
if (isAdmin()) {
  // Show admin features
}
```

## 📝 File Locations

```
/stores/core/              # Shared stores
/stores/admin/             # Admin analytics
/apps/admin/               # Admin panel
  ├── AdminApp.tsx         # Main entry
  ├── layouts/             # Layout components
  ├── pages/               # Page components
  └── index.ts             # Exports

/routing/                  # Domain detection
/App.tsx                   # Updated with routing
```

## 🎨 Design Tokens

All using Flowversal colors:
- **Background:** `#0E0E1F`
- **Cards:** `#1A1A2E`
- **Borders:** `#2A2A3E`
- **Text:** `#CFCFE8` / `white`
- **Gradient:** `#00C6FF` → `#9D50BB`

## 🚀 Production Ready

### **Current (Dev):**
- App: `localhost:5173/`
- Admin: `localhost:5173/admin`

### **Production:**
- App: `app.flowversal.com`
- Admin: `admin.flowversal.com`

**Domain detector handles both automatically!**

## ✨ What Makes This Special

1. **Zero Dummy Data** - Everything is real or clearly marked
2. **One Source of Truth** - Shared stores = always in sync
3. **Startup Friendly** - Simple, not over-engineered
4. **Production Ready** - Real subdomain support built-in
5. **Type Safe** - Full TypeScript throughout
6. **Consistent Design** - Same theme everywhere

## 📈 Next Steps

**Want to enhance?**
- Add workflow registry → See all workflows in admin
- Connect payment system → Real billing data
- Add real-time updates → WebSocket integration
- Build marketing site → Sprint 4
- Add docs portal → Sprint 4

**Want to deploy?**
- Set up subdomains → Works automatically
- Deploy to production → No code changes needed
- Configure DNS → Point subdomains to server

## 🎉 You're Done!

**Sprint 1 Complete:**
- ✅ Real data architecture
- ✅ Functional admin panel
- ✅ Multi-domain routing
- ✅ Zero mock data
- ✅ Production ready

**Navigate to `/admin` and start managing your platform!** 🚀
