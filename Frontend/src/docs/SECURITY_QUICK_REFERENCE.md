# Security Quick Reference 🔒

## TL;DR - What You Need to Know

### 🎯 **The Golden Rule**
**NEVER trust the frontend. ALWAYS enforce security at the API level.**

---

## 👤 User Roles (Default: MEMBER)

```
ADMIN   → Can do everything (including delete projects/boards)
MEMBER  → Can create, read, update (NO delete projects/boards)
VIEWER  → Can only read (no modifications)
```

---

## ⚡ Quick Permission Check

**Who can delete projects/boards?**  
→ **Only ADMIN** 🔒

**Who can delete tasks?**  
→ **ADMIN + MEMBER** ✅

**Who can create/update?**  
→ **ADMIN + MEMBER** ✅

**Who can only view?**  
→ **Everyone (ADMIN, MEMBER, VIEWER)** 👀

---

## 🛡️ Every API Endpoint Has:

1. ✅ **Authentication** - Who are you?
2. ✅ **Authorization** - What can you do?
3. ✅ **Ownership Check** - Is this yours?

---

## 🔐 Setting User Role

```typescript
// When creating user
user_metadata: {
  role: 'admin'  // or 'member' or 'viewer'
}

// Default if not set: 'member'
```

---

## 🚨 Security Status Codes

| Code | What It Means | Action |
|------|---------------|--------|
| `401` | Not logged in | Login required |
| `403` | Permission denied | Need higher role |
| `404` | Not found OR not yours | Check ownership |

---

## ✅ Why This Matters

### ❌ Without Security:
```javascript
// Someone can delete your entire project via browser console!
fetch('/api/projects/YOUR_PROJECT', { method: 'DELETE' })
```

### ✅ With Security:
```javascript
// API returns: "Permission denied. Only administrators can delete projects."
// Your data is safe! 🛡️
```

---

## 🎯 Best Practice Checklist

- [x] All endpoints check authentication
- [x] All endpoints check permissions
- [x] All endpoints verify ownership
- [x] Delete operations restricted to ADMIN
- [x] Sensitive operations logged
- [x] Error messages don't leak info

---

## 🔧 Common Tasks

### Make someone an admin:
```typescript
// Update user metadata
user_metadata: { role: 'admin' }
```

### Restrict someone to viewer:
```typescript
user_metadata: { role: 'viewer' }
```

### Check current user role:
```typescript
const userRole = getUserRole(user);
console.log(userRole); // 'admin', 'member', or 'viewer'
```

---

## 📝 Remember

1. **Frontend restrictions** = UI/UX niceness
2. **Backend permissions** = Real security
3. **Always validate on the server** = Non-negotiable

---

**Your API is now secure. Sleep well. 😴**

For full details, see `/API_SECURITY.md`
