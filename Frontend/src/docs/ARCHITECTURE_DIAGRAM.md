# 🏗️ Flowversal Multi-Domain Architecture

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLOWVERSAL PLATFORM                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Main App   │  │ Admin Panel  │  │   Marketing  │         │
│  │ (app.flow... │  │(admin.flow..│  │  (flow...)   │         │
│  │              │  │              │  │              │         │
│  │  Workflows   │  │  Dashboard   │  │   Landing    │         │
│  │  Forms       │  │  Users       │  │   Pricing    │         │
│  │  Projects    │  │  Logs        │  │   Docs       │         │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘         │
│         │                  │                                    │
│         └──────────┬───────┘                                    │
│                    │                                            │
│         ┌──────────▼──────────┐                                │
│         │   CORE STORES       │                                │
│         │  (Shared Data)      │                                │
│         │                     │                                │
│         │  • authStore        │                                │
│         │  • userStore        │                                │
│         │  • executionStore   │                                │
│         │  • workflowStore    │                                │
│         └─────────────────────┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow: User Creation

```
Main App                Core Store              Admin Panel
────────                ──────────              ───────────

  User fills form
       │
       ▼
  createUser()
       │
       ├──────────────▶  userStore.addUser()
       │                       │
       │                 Saves to state
       │                       │
       │                Persists to localStorage
       │                       │
       │                       │
       │                       │
  New user created ◀───────────┤
       │                       │
       │                       │
       │                       └──────────▶ Admin fetches users
       │                                          │
       │                                          ▼
       │                                    Shows in Users table
       │                                          │
       │                                    Can suspend/delete
       │                                          │
       │                                          ▼
       │                                   Updates same store
       │                                          │
       ▼                                          │
  Sees own profile ◀───────────────────────────────┘
  updated instantly!
```

## 📁 Directory Structure

```
flowversal/
│
├── stores/
│   ├── core/                    # 🌟 SHARED ACROSS ALL DOMAINS
│   │   ├── authStore.ts         # Authentication
│   │   ├── userStore.ts         # User management
│   │   ├── executionStore.ts    # Execution logs
│   │   └── index.ts             # Exports
│   │
│   └── admin/                   # Admin-specific
│       └── analyticsStore.ts    # Computed metrics
│
├── apps/
│   └── admin/                   # 🎯 ADMIN PANEL
│       ├── AdminApp.tsx         # Main component
│       ├── index.ts
│       ├── layouts/
│       │   └── AdminLayout.tsx  # Sidebar + layout
│       └── pages/
│           ├── Dashboard.tsx    # Metrics & charts
│           ├── Users.tsx        # User management
│           ├── Workflows.tsx    # Workflow list
│           └── Executions.tsx   # Execution logs
│
├── routing/
│   └── domainDetector.ts        # 🌐 MULTI-DOMAIN ROUTING
│
├── components/                  # Main app components
├── features/                    # Workflow builder
└── App.tsx                      # Entry point with routing
```

## 🔀 Routing Logic

```
User visits URL
      │
      ▼
┌─────────────┐
│ App.tsx     │
│             │
│ Calls:      │
│ detectDomain()
└─────┬───────┘
      │
      ├─── Path: /admin ────────▶ AdminApp
      │                              │
      │                              ├─ Check isAdmin()
      │                              ├─ Show Dashboard
      │                              ├─ Show Users
      │                              └─ Show Executions
      │
      ├─── Path: /docs ─────────▶ DocsApp (future)
      │
      ├─── Path: /marketing ────▶ Marketing (future)
      │
      └─── Path: / ─────────────▶ Main App
                                     │
                                     ├─ Show Workflows
                                     ├─ Show Forms
                                     └─ Show Dashboard
```

## 💾 Data Persistence

```
┌─────────────────────────────────────────┐
│         Browser LocalStorage            │
│                                         │
│  flowversal-auth                       │
│  ├─ user                               │
│  ├─ isAuthenticated                    │
│  └─ role                               │
│                                         │
│  flowversal-users                      │
│  ├─ users[]                            │
│  │  ├─ id, name, email                │
│  │  ├─ subscription                    │
│  │  └─ stats                           │
│  └─ (persisted automatically)          │
│                                         │
│  flowversal-executions                 │
│  ├─ executions[]                       │
│  │  ├─ workflowId                     │
│  │  ├─ status                         │
│  │  └─ duration                       │
│  └─ (persisted automatically)          │
│                                         │
└─────────────────────────────────────────┘
         │                    ▲
         │ Save               │ Load
         ▼                    │
┌─────────────────────────────────────────┐
│         Zustand Stores                  │
│  (with persist middleware)              │
└─────────────────────────────────────────┘
```

## 🎯 Admin Panel Architecture

```
┌────────────────────────────────────────────────────┐
│              AdminApp Component                    │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │         AdminLayout                      │    │
│  │                                          │    │
│  │  ┌────────────┐  ┌──────────────────┐  │    │
│  │  │  Sidebar   │  │  Content Area    │  │    │
│  │  │            │  │                  │  │    │
│  │  │ Dashboard  │  │  ┌────────────┐ │  │    │
│  │  │ Users      │  │  │ Dashboard  │ │  │    │
│  │  │ Workflows  │  │  │   Page     │ │  │    │
│  │  │ Executions │  │  │            │ │  │    │
│  │  │            │  │  │ Uses:      │ │  │    │
│  │  │ Logout     │  │  │ analytics  │ │  │    │
│  │  │            │  │  │ Store      │ │  │    │
│  │  └────────────┘  │  └────────────┘ │  │    │
│  │                  │                  │  │    │
│  └──────────────────────────────────────┘  │    │
│                                             │    │
│  Current page rendered based on routing    │    │
└────────────────────────────────────────────────────┘
```

## 🔐 Access Control Flow

```
User navigates to /admin
         │
         ▼
   detectDomain() → "admin"
         │
         ▼
   Render AdminApp
         │
         ▼
   Check: isAuthenticated?
         │
    ┌────┴────┐
    │         │
   NO        YES
    │         │
    ▼         ▼
  Redirect  Check: isAdmin()?
  to /           │
             ┌───┴───┐
             │       │
            NO      YES
             │       │
             ▼       ▼
      "Access    Show Admin
       Denied"    Dashboard
```

## 📈 Analytics Computation Flow

```
Admin Dashboard Loads
         │
         ▼
   analyticsStore.getDashboardMetrics()
         │
         ├──────────▶ useUserStore.getState()
         │                  │
         │                  ├─ getTotalUsers()
         │                  ├─ getActiveUsers()
         │                  └─ getUserGrowthData()
         │
         ├──────────▶ useExecutionStore.getState()
         │                  │
         │                  ├─ getTotalExecutions()
         │                  ├─ getSuccessRate()
         │                  └─ getAverageTime()
         │
         ▼
   Return computed metrics
         │
         ▼
   Display in UI
         │
         ├─ Stats Cards
         ├─ Charts
         └─ Lists
```

## 🚀 Production Deployment Flow

```
Development              Production
───────────              ──────────

localhost:5173/         app.flowversal.com
localhost:5173/admin    admin.flowversal.com
localhost:5173/docs     docs.flowversal.com

         │                      │
         └──────────────────────┘
                   │
                   ▼
         Same codebase!
         Same components!
         Just different URLs!
                   │
                   ▼
         domainDetector.ts
         handles routing
         automatically
```

## 🎨 Component Reusability

```
┌─────────────────────────────────────────┐
│     Shared Design System                │
│  /lib/design-system/components/         │
│                                         │
│  • Button                              │
│  • Card                                │
│  • Table                               │
│  • Badge                               │
│  • Input                               │
│  • Modal                               │
└───────┬─────────────────────────────────┘
        │
    Used by ▼
        │
┌───────┴────────┬──────────┬─────────┐
│                │          │         │
▼                ▼          ▼         ▼
Main App      Admin     Marketing   Docs
Components    Pages     Site        Portal
```

## 💡 Key Principles

1. **Single Source of Truth**
   - Core stores are THE data
   - No duplication
   - Always in sync

2. **Domain Separation**
   - Each domain has its own entry point
   - Shared components and data
   - Independent routing

3. **Real Data Only**
   - No mock data in production code
   - Everything computed or from stores
   - Clear when features are "coming soon"

4. **Simple Architecture**
   - Easy to understand
   - Easy to extend
   - Startup-friendly

## 🎯 Summary

This architecture gives you:
- ✅ One codebase for all domains
- ✅ Shared data layer (no duplication)
- ✅ Easy multi-domain routing
- ✅ Real data everywhere
- ✅ Production-ready foundation
- ✅ Simple to maintain and extend

**The admin panel is a real management tool, not a separate app!**
