# Admin Panel Fixes Required

## Issues to Fix:

### 1. Theme Support ❌
**Problem**: Analytics, Users, Monitoring, Activity Logs, Workflows, Executions pages show dark mode even when light mode is activated.

**Status**: Partially Fixed
- ✅ AnalyticsPage.tsx - Theme support added
- ❌ SystemMonitoring.tsx - Needs theme
- ❌ ActivityLog.tsx - Needs theme  
- ❌ Workflows page - Needs theme
- ❌ Executions page - Needs theme

### 2. Category Management ❌
**Problem**: Need category management in admin sidebar for workflow categories

**Requirements**:
- Add "Categories" option in admin sidebar
- CRUD operations for categories
- Categories should reflect in app's AI Apps tab
- Workflows segr

egated by categories

**Status**: Not Started

### 3. My Workflows Display ❌
**Problem**: My Workflows tab doesn't show workflows

**Status**: Not Started

### 4. Project Filters Enhancement ❌
**Problem**: Need Days filter for Projects page

**Current Filters**:
- ✅ Status (All/Active/Archived/Suspended)
- ✅ Visibility (All/Private/Public)
- ✅ Sort By (Name/Date/Workflows/Executions)
- ❌ Days filter (7/30/90/365)

**Status**: Not Started

### 5. Admin Authentication ❌
**Problem**: Admin panel auto-logs in from app

**Requirements**:
- Separate admin authentication
- Admin signin screen with credentials
- Password recovery option
- Don't auto-login from app

**Status**: Not Started

---

## Implementation Plan:

### Phase 1: Theme Fixes (30 min)
1. Fix SystemMonitoring.tsx
2. Fix ActivityLog.tsx
3. Fix Workflows page
4. Fix Executions page

### Phase 2: Category Management (60 min)
1. Create category store
2. Add Categories sidebar option
3. Create Categories management page
4. Connect to workflow system
5. Update AI Apps tab

### Phase 3: My Workflows Fix (15 min)
1. Check workflow store
2. Fix My Workflows display
3. Ensure workflows show

### Phase 4: Days Filter (15 min)
1. Add days filter to Projects
2. Implement filter logic

### Phase 5: Admin Auth (45 min)
1. Create admin auth store
2. Create admin signin screen
3. Add password recovery
4. Separate from app auth

**Total Estimated Time**: 2.5 hours

---

## Priority Order:
1. Admin Authentication (Most Critical)
2. Category Management (High Priority)
3. Theme Fixes (Medium Priority)
4. My Workflows Fix (Medium Priority)
5. Days Filter (Low Priority)
