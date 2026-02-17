# ⚠️ TEMPORARY FIXES - DEVELOPMENT ONLY

## 🔴 CRITICAL: These fixes bypass security and MUST be removed before production!

### 1. Onboarding Endpoint Security Bypass

**File**: `src/server.ts`
**Line**: Auth plugin configuration

**What was done**:
- Added `/api/v1/users/me/onboarding` to the `skipAuth` list
- This completely bypasses authentication for the onboarding endpoint

**Why this is dangerous**:
- Anyone can submit onboarding data without authentication
- No way to verify who is creating the user account
- Could allow spam/abuse of the onboarding system

**Proper fix needed**:
1. Implement proper demo token validation in auth middleware
2. Use real Supabase JWT tokens for actual users
3. Remove the onboarding endpoint from skipAuth list

---

### 2. Demo User Auto-Creation

**File**: `src/modules/users/routes/user.routes.ts`
**Function**: `/me/onboarding` POST handler

**What was done**:
- Auto-creates a demo user if `request.user` is null
- Assigns a hardcoded demo user ID: `'demo-user-123'`

**Why this is dangerous**:
- Multiple requests will overwrite the same demo user's data
- No unique user identification
- All demo sessions share the same user record in MongoDB

**Proper fix needed**:
1. Ensure auth middleware always sets `request.user`
2. Generate unique demo user IDs per session
3. Or better: require proper authentication for all users

---

### 3. Demo Token Bypass in Auth Middleware

**File**: `src/core/middleware/plugins/auth.plugin.ts`
**Function**: `preHandler` hook

**What was done**:
- Added special handling for tokens starting with `'demo-'`
- Bypasses Supabase JWT verification for demo tokens
- Only active when `isDevelopment === true`

**Why this is dangerous**:
- Any token starting with 'demo-' will be accepted
- No actual token validation
- If isDevelopment check fails, production could be vulnerable

**Proper fix needed**:
1. Implement proper demo session management with unique tokens
2. Store demo sessions server-side (Redis/Memory)
3. Or remove demo login and require real authentication

---

### 4. Email Encryption Bypass for Demo Users

**Files**: 
- `src/modules/users/services/user.service.ts`
- Functions: `createUser`, `findByEmail`, `toUserType`

**What was done**:
- Demo user emails are NOT encrypted (stored as plain text)
- Added fallback in decryption if it fails (returns plain text)
- `findByEmail` searches for both encrypted and plain text emails

**Why this is dangerous**:
- Inconsistent data format in database (some encrypted, some not)
- Email data might be exposed in plain text for demo users
- Query performance degraded (searching two conditions)
- Data integrity issues (same email could exist in both formats)

**Proper fix needed**:
1. Decide on encryption policy: all emails encrypted or none
2. If encrypting: migrate all existing plain text emails
3. If not encrypting: remove encryption entirely from email field
4. Ensure consistent data format across all users
5. Clean up MongoDB to remove duplicate/malformed entries

---

## 🎯 Action Items to Remove These Fixes

1. **Implement Real Authentication Flow**:
   - Users must sign up with Supabase (email/password or OAuth)
   - Store Supabase JWT tokens properly
   - Validate tokens on every request

2. **Remove Demo Login Feature** (if not needed):
   - Delete demo login code from frontend
   - Remove demo token bypass from auth middleware
   - Remove onboarding endpoint from skipAuth

3. **Or Implement Proper Demo Sessions** (if demo login is required):
   - Generate unique demo session IDs
   - Store demo sessions server-side
   - Validate demo tokens against stored sessions
   - Add expiration to demo sessions

4. **Testing Checklist Before Production**:
   - [ ] Remove `/api/v1/users/me/onboarding` from skipAuth
   - [ ] Remove demo user auto-creation from onboarding route
   - [ ] Remove demo token bypass from auth middleware
   - [ ] Verify all endpoints require valid JWT tokens
   - [ ] Test with real Supabase authentication
   - [ ] Ensure NODE_ENV is set to 'production'

---

## 📝 Current State

**Status**: ✅ Working in development, but INSECURE

**When to fix**: Before deploying to production or exposing to external users

**Risk Level**: 🔴 HIGH - Complete bypass of authentication system

---

**Created**: December 14, 2025
**Reason**: Temporary fix to allow onboarding flow to work during development
**Must be removed by**: Before production deployment
