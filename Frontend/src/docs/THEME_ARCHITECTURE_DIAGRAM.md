# Theme & Auth Architecture Diagram 🏗️

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLOWVERSAL APP                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Domain Detection
                              ▼
        ┌─────────────────────┬─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   /  (root)            /admin                  /app
   Marketing            Admin Panel          Main Dashboard
   Public               ✓ Auth Required       ✓ Auth Required
                        │                     │
                        │                     │
                ┌───────┴────────┐   ┌────────┴────────┐
                │                │   │                 │
                ▼                ▼   ▼                 ▼
         Admin Auth      Admin Theme  User Auth   App Theme
         (Separate)      System       (Separate)  System
```

## Authentication Flow Comparison

### Admin Panel (`/admin`)
```
┌────────────────────────────────────────────────┐
│            ADMIN AUTHENTICATION                │
├────────────────────────────────────────────────┤
│                                                │
│  Store:  /stores/admin/adminAuthStore.ts      │
│  Login:  /apps/admin/pages/AdminLogin.tsx     │
│  Creds:  admin@admin.com / admin@123          │
│                                                │
│  Features:                                     │
│  • Simple admin-only login                     │
│  • No Google OAuth                             │
│  • localStorage: 'admin-auth'                  │
│  • Completely separate from user auth          │
│                                                │
└────────────────────────────────────────────────┘
```

### Main App (`/app`)
```
┌────────────────────────────────────────────────┐
│             USER AUTHENTICATION                │
├────────────────────────────────────────────────┤
│                                                │
│  Context: /contexts/AuthContext.tsx            │
│  Service: /services/auth.service.ts            │
│  UI:      /components/Login.tsx                │
│           /components/Signup.tsx               │
│           /components/ForgotPassword.tsx       │
│  Creds:   demo@demo.com / demo@123            │
│                                                │
│  Features:                                     │
│  • Email/Password login                        │
│  • Google OAuth                                │
│  • Sign up flow                                │
│  • Password reset                              │
│  • Supabase integration                        │
│                                                │
└────────────────────────────────────────────────┘
```

## Theme System Architecture

### Admin Panel Theme
```
┌───────────────────────────────────────────────┐
│          ADMIN THEME SYSTEM                   │
├───────────────────────────────────────────────┤
│                                               │
│  Store: /stores/admin/themeStore.ts          │
│  Hook:  useThemeStore()                      │
│                                               │
│  Usage Pattern:                               │
│  ┌──────────────────────────────────────┐   │
│  │ const { theme } = useThemeStore();   │   │
│  │                                      │   │
│  │ // Manual conditionals               │   │
│  │ className={                          │   │
│  │   theme === 'dark'                   │   │
│  │     ? 'bg-[#0E0E1F]'                 │   │
│  │     : 'bg-gray-50'                   │   │
│  │ }                                    │   │
│  └──────────────────────────────────────┘   │
│                                               │
│  Scope: /admin/** pages only                 │
│  localStorage: 'admin-theme'                  │
│                                               │
└───────────────────────────────────────────────┘
```

### Main App Theme (NEW! ⭐)
```
┌───────────────────────────────────────────────┐
│          MAIN APP THEME SYSTEM                │
├───────────────────────────────────────────────┤
│                                               │
│  Store:  /stores/app/themeStore.ts           │
│  Hook:   useAppThemeStore()                  │
│  Helper: getThemeClasses(theme)              │
│                                               │
│  Usage Pattern:                               │
│  ┌──────────────────────────────────────┐   │
│  │ const { theme } = useAppThemeStore();│   │
│  │ const t = getThemeClasses(theme);    │   │
│  │                                      │   │
│  │ // Simple & maintainable!            │   │
│  │ className={t.bgMain}                 │   │
│  │ className={t.textPrimary}            │   │
│  │ className={`${t.bgCard} ${t.border}`}│   │
│  └──────────────────────────────────────┘   │
│                                               │
│  Scope: /app/** and /components/**           │
│  localStorage: 'app-theme'                    │
│                                               │
└───────────────────────────────────────────────┘
```

## Theme Helper Function

```
getThemeClasses(theme: 'dark' | 'light')
           │
           ├─► Returns object with consistent classes
           │
           ▼
    ┌─────────────────────────────┐
    │  Dark Mode    │  Light Mode  │
    ├───────────────┼──────────────┤
    │ bgMain        │  bgMain      │
    │ bgCard        │  bgCard      │
    │ bgSecondary   │  bgSecondary │
    │ textPrimary   │  textPrimary │
    │ textSecondary │  textSecondary│
    │ border        │  border      │
    │ hoverBg       │  hoverBg     │
    │ shadow        │  shadow      │
    │ ... etc       │  ... etc     │
    └─────────────────────────────┘
           │
           ▼
    Used in components as:
    • t.bgMain
    • t.textPrimary
    • t.border
```

## Login Flow Diagram

### User Accesses /app

```
      User navigates to /app
              │
              ▼
      Domain detected: 'app'
              │
              ▼
      Check: isAuthenticated?
              │
      ┌───────┴───────┐
      │               │
      NO              YES
      │               │
      ▼               ▼
  Show Login      Show Dashboard
  Component       Component
      │               │
      ├─► Login       ├─► AI Apps
      ├─► Signup      ├─► Workflows
      └─► Forgot      ├─► Projects
          Password    └─► etc.
```

### Login Component Flow

```
┌─────────────────────────────────────────┐
│         LOGIN COMPONENT                 │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐  │
│  │   Continue with Google          │  │
│  │   ┌────────────────────┐       │  │
│  │   │  Google OAuth      │       │  │
│  │   └────────────────────┘       │  │
│  └─────────────────────────────────┘  │
│                 OR                    │
│  ┌─────────────────────────────────┐  │
│  │   Email/Password Form           │  │
│  │   ┌────────────────────┐       │  │
│  │   │  email@email.com   │       │  │
│  │   │  ●●●●●●●●           │       │  │
│  │   └────────────────────┘       │  │
│  │   [Sign In]                     │  │
│  └─────────────────────────────────┘  │
│                                         │
│  Demo: demo@demo.com / demo@123        │
│                                         │
└─────────────────────────────────────────┘
```

## Component Theming Flow

```
Component Needs Theming
        │
        ▼
Import theme store & helper
        │
        ▼
const { theme } = useAppThemeStore()
        │
        ▼
const t = getThemeClasses(theme)
        │
        ▼
Use theme classes in JSX
        │
        ├─► Background: t.bgMain, t.bgCard
        ├─► Text: t.textPrimary, t.textSecondary
        ├─► Borders: t.border
        └─► Effects: t.hoverBg, t.shadow
        │
        ▼
Component auto-updates when theme changes!
```

## File Dependencies

```
Main App
│
├── App.tsx
│   └── Uses domain detector
│       └── Routes to correct app
│
├── /app Route
│   ├── AuthProvider
│   │   └── Provides: useAuth()
│   │
│   └── Components
│       ├── AuthRequired.tsx
│       │   ├── Login.tsx
│       │   │   └── Uses: useAppThemeStore
│       │   ├── Signup.tsx
│       │   │   └── Uses: useAppThemeStore
│       │   └── ForgotPassword.tsx
│       │
│       └── Dashboard Components
│           └── (Should use useAppThemeStore)
│
└── /admin Route
    ├── AdminAuthProvider
    │   └── Provides: useAdminAuthStore
    │
    └── Admin Components
        └── Uses: useThemeStore (admin)
```

## State Management

```
┌─────────────────────────────────────────┐
│        ZUSTAND STORES                   │
├─────────────────────────────────────────┤
│                                         │
│  Admin Stores (isolated)                │
│  ├── adminAuthStore                     │
│  ├── themeStore (admin)                 │
│  ├── categoryStore                      │
│  └── analyticsStore                     │
│                                         │
│  App Stores (isolated)                  │
│  ├── themeStore (app) ← NEW!           │
│  └── (Future app-specific stores)      │
│                                         │
│  Shared Stores (core)                   │
│  ├── workflowRegistryStore             │
│  ├── executionStore                     │
│  └── userStore                          │
│                                         │
└─────────────────────────────────────────┘
```

## localStorage Keys

```
┌──────────────────────────────────┐
│      localStorage Keys           │
├──────────────────────────────────┤
│  admin-auth     → Admin session  │
│  admin-theme    → Admin theme    │
│  app-theme      → App theme      │
│  user-auth      → User session   │
└──────────────────────────────────┘
```

## Summary

```
┌─────────────────────────────────────────────────┐
│             SEPARATION OF CONCERNS              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ADMIN PANEL (/admin)                          │
│  • Separate auth (adminAuthStore)              │
│  • Separate theme (admin themeStore)           │
│  • Admin-only features                          │
│  • Manual theme conditionals                    │
│                                                 │
│  MAIN APP (/app)                               │
│  • User auth (AuthContext + Supabase)          │
│  • App theme (app themeStore + helper) ⭐      │
│  • User-facing features                         │
│  • Easy theme helper function                   │
│                                                 │
│  MARKETING (/)                                  │
│  • No auth required                             │
│  • Public pages                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Key Innovation: Theme Helper

**Before (Admin Pattern):**
```typescript
// Repeated in every component
const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
// ... 10+ more lines per component ❌
```

**After (App Pattern):**
```typescript
// One line to get all theme classes
const t = getThemeClasses(theme);
// Use anywhere: t.bgCard, t.textPrimary ✅
```

**Benefits:**
- ✅ 90% less code
- ✅ Consistent colors
- ✅ Easy to maintain
- ✅ Type-safe
- ✅ Self-documenting

---

This architecture ensures clean separation, maintainability, and scalability! 🚀
