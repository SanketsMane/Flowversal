# API Security Implementation Guide

## Overview

This document describes the role-based access control (RBAC) security implementation for the Flowversal API. All API endpoints are now protected with proper authentication and authorization.

---

## 🔒 Security Principles

### 1. **Defense in Depth**
- **Frontend restrictions** are NOT security - they're just UI/UX
- **Backend authorization** is the real security layer
- Even if UI hides buttons, API endpoints enforce permissions

### 2. **Principle of Least Privilege**
- Users only get permissions they need
- Default role is `MEMBER` (create, read, update - NO delete)
- Destructive operations require `ADMIN` role

### 3. **Resource Ownership Validation**
- Users can only modify their own resources
- Prevents unauthorized access to other users' data
- Double-check: permission + ownership

---

## 👥 User Roles

### **ADMIN**
- Full access to all operations
- Can delete projects and boards
- Default role for demo/development users
- **Use case:** Company administrators, team leads

### **MEMBER** (Default)
- Can create, read, and update resources
- **CANNOT** delete projects or boards
- Can delete tasks they created
- **Use case:** Regular team members, contributors

### **VIEWER** (Read-Only)
- Can only read/view data
- No create, update, or delete permissions
- **Use case:** Stakeholders, clients, observers

---

## 🛡️ Permission Matrix

| Operation | Admin | Member | Viewer |
|-----------|-------|--------|--------|
| **Projects** | | | |
| Create Project | ✅ | ✅ | ❌ |
| View Projects | ✅ | ✅ | ✅ |
| Update Project | ✅ | ✅ | ❌ |
| Delete Project | ✅ | ❌ | ❌ |
| **Boards** | | | |
| Create Board | ✅ | ✅ | ❌ |
| View Boards | ✅ | ✅ | ✅ |
| Update Board | ✅ | ✅ | ❌ |
| Delete Board | ✅ | ❌ | ❌ |
| **Tasks** | | | |
| Create Task | ✅ | ✅ | ❌ |
| View Tasks | ✅ | ✅ | ✅ |
| Update Task | ✅ | ✅ | ❌ |
| Delete Task | ✅ | ✅ | ❌ |

---

## 🔐 How It Works

### 1. **Authentication Check**
```typescript
const authResult = await verifyAuth(c.req.header('Authorization'));
if ('error' in authResult) {
  return c.json({ success: false, error: authResult.error }, 401);
}
```

### 2. **Permission Check**
```typescript
if (!hasPermission(authResult.user, 'project:delete')) {
  return c.json({
    success: false,
    error: 'Permission denied. Only administrators can delete projects.',
  }, 403);
}
```

### 3. **Ownership Verification**
```typescript
const ownsProject = await verifyOwnership(userId, 'project', projectId);
if (!ownsProject) {
  return c.json({
    success: false,
    error: 'Project not found or access denied',
  }, 404);
}
```

---

## 🚨 Security Threats Prevented

### ❌ **Without Security:**
```bash
# Anyone can delete ANY project via API
curl -X DELETE https://api.example.com/projects/important-project \
  -H "Authorization: Bearer any-token"
```

### ✅ **With Security:**
```bash
# Regular members get 403 Forbidden
{
  "success": false,
  "error": "Permission denied. Only administrators can delete projects."
}

# Trying to delete someone else's project gets 404
{
  "success": false,
  "error": "Project not found or access denied"
}
```

---

## 🔧 Setting User Roles

### **Method 1: User Metadata (Recommended for Production)**

Set role when creating user account:
```typescript
const { data, error } = await supabase.auth.admin.createUser({
  email: 'user@example.com',
  password: 'secure-password',
  user_metadata: {
    name: 'John Doe',
    role: 'member' // 'admin', 'member', or 'viewer'
  },
  email_confirm: true
});
```

### **Method 2: Update Existing User**

```typescript
const { data, error } = await supabase.auth.admin.updateUserById(
  userId,
  {
    user_metadata: { role: 'admin' }
  }
);
```

### **Method 3: Demo Mode**

Demo users automatically get `admin` role (for development only):
```typescript
// In verifyAuth function
if (token === 'demo-access-token') {
  return {
    user: {
      id: 'demo-user-id',
      email: 'demo@demo.com',
      user_metadata: { name: 'Demo User', role: 'admin' }
    }
  };
}
```

---

## 📝 API Endpoint Security Summary

### **Projects**
- `GET /projects` - All roles ✅
- `POST /projects` - Admin + Member ✅
- `PUT /projects/:id` - Admin + Member ✅ (own resources only)
- `DELETE /projects/:id` - **Admin only** 🔒

### **Boards**
- `GET /boards` - All roles ✅
- `POST /boards` - Admin + Member ✅
- `PUT /boards/:id` - Admin + Member ✅ (own resources only)
- `DELETE /boards/:id` - **Admin only** 🔒

### **Tasks**
- `GET /tasks` - All roles ✅
- `POST /tasks` - Admin + Member ✅
- `PUT /tasks/:id` - Admin + Member ✅ (own resources only)
- `DELETE /tasks/:id` - Admin + Member ✅ (own resources only)

---

## 🎯 Best Practices

### ✅ **DO:**
1. Always check permissions at the API level
2. Verify resource ownership before modifications
3. Use specific error messages for debugging (in logs)
4. Use generic error messages for users (avoid info leaks)
5. Log all permission denials for security auditing

### ❌ **DON'T:**
1. Rely on frontend/UI restrictions for security
2. Expose sensitive information in error messages
3. Give users more permissions than they need
4. Skip ownership checks even for admins
5. Return different errors for "not found" vs "no permission" (info leak)

---

## 🧪 Testing Security

### Test Permission Denial:
```bash
# As a MEMBER, try to delete a project (should fail)
curl -X DELETE https://your-api.com/functions/v1/make-server-020d2c80/projects/proj-123 \
  -H "Authorization: Bearer member-token"

# Expected: 403 Forbidden
{
  "success": false,
  "error": "Permission denied. Only administrators can delete projects."
}
```

### Test Ownership Validation:
```bash
# Try to update someone else's project (should fail)
curl -X PUT https://your-api.com/functions/v1/make-server-020d2c80/projects/other-user-project \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Hacked!"}'

# Expected: 404 Not Found (doesn't reveal if it exists)
{
  "success": false,
  "error": "Project not found or access denied"
}
```

---

## 🔄 Migration Guide

### Existing Users
- All existing users without a role will default to **MEMBER**
- Update important users to **ADMIN** role manually
- Viewers need to be explicitly set

### Code Changes Required
No changes required in frontend code - all security is server-side.

However, you may want to:
1. Show/hide delete buttons based on user role (UI/UX)
2. Display helpful messages when permissions are denied
3. Add role management UI for admins

---

## 📊 HTTP Status Codes

| Code | Meaning | When It Happens |
|------|---------|-----------------|
| `200` | Success | Operation completed |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | No auth token or invalid token |
| `403` | Forbidden | Valid token but insufficient permissions |
| `404` | Not Found | Resource doesn't exist OR user doesn't own it |
| `500` | Server Error | Unexpected server error |

---

## 🚀 Production Checklist

- [ ] Set proper user roles in production database
- [ ] Remove demo authentication in production
- [ ] Enable audit logging for all permission denials
- [ ] Set up monitoring for 403/404 errors (potential attacks)
- [ ] Document role assignment process for your team
- [ ] Test all CRUD operations with different roles
- [ ] Verify ownership checks work across all endpoints

---

## 💡 Future Enhancements

Consider adding:
1. **Team-based permissions** - Share projects with specific users
2. **Fine-grained permissions** - Per-project role assignments
3. **API rate limiting** - Prevent abuse
4. **Audit logs** - Track who did what and when
5. **2FA requirement** for admin operations
6. **IP whitelisting** for sensitive operations

---

## 📞 Support

For security concerns or questions:
- Review the code in `/supabase/functions/server/projects.ts`
- Check permission definitions in the `PERMISSIONS` constant
- Verify role checks in `hasPermission()` function
- Test ownership validation in `verifyOwnership()` function

**Remember: Security is not optional. Every API endpoint MUST be protected.**
