# Authentication & Database Architecture Fix

## Architecture Overview

Your application uses a **hybrid database architecture**:

1. **Supabase** = Authentication only (JWT tokens)
2. **MongoDB** = CRUD operations for Projects/Boards/Tasks
3. **Pinecone** = AI-related vector search

## How It Works

### Authentication Flow:

```
1. User logs in via Supabase (email/password or Google OAuth)
   ↓
2. Supabase returns JWT access token
   ↓
3. Frontend stores token and sends it in Authorization header:
   Authorization: Bearer <supabase_access_token>
   ↓
4. Backend auth plugin verifies token with Supabase API
   ↓
5. Backend extracts Supabase user ID (UUID) from token
   ↓
6. Backend sets request.user.id = Supabase UUID
   ↓
7. Routes call userService.getOrCreateUserFromSupabase(request.user.id)
   ↓
8. User service syncs user from Supabase → MongoDB:
   - Checks if user exists in MongoDB by supabaseId
   - If not found, fetches from Supabase admin API
   - Creates user in MongoDB with supabaseId reference
   ↓
9. Routes use MongoDB user ID (dbUser._id.toString()) for CRUD operations
   ↓
10. Projects/Boards/Tasks are stored in MongoDB with userId reference
```

## The Problem

The 401 errors occur because:

1. **Frontend is sending demo token** (`justin-access-token`) instead of real Supabase token
2. **Backend env vars not set** - Supabase URL/keys missing or incorrect
3. **Token verification fails** - Backend can't verify token with Supabase

## The Solution

### Step 1: Update Backend Environment Variables

**File:** `App/Backend/.env`

```env
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://ghuxzxxxuaiuumdmytkf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodXh6eHh4dWFpdXVtZG15dGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MTUyMTIsImV4cCI6MjA3OTA5MTIxMn0.rSSZu_kCaPy0CtjGvpGdIKZA95fE22BU5oeQ8-6GSc8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodXh6eHh4dWFpdXVtZG15dGtmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUxNTIxMiwiZXhwIjoyMDc5MDkxMjEyfQ.WnTg05gE_W4qxKCqgOVSlqsrxaUeB58EfzzvvkgHW3M

# JWT Secret (from Supabase Project Settings → API → JWT Secret)
JWT_SECRET=KkQ7eYPWTWu6f7Po7wiw2TjpkE46UduOtmdJIyvh/CcB0ACohBQ303qrjb5L0pW1Rbl7m4Gu4IFjDeXG3pUUyA==

# MongoDB (already configured)
MONGODB_URI=mongodb://localhost:27017/flowversal
MONGODB_DB_NAME=flowversal

# Pinecone (already configured)
PINECONE_API_KEY=your-pinecone-key
PINECONE_HOST=your-pinecone-host
PINECONE_INDEX_NAME=flowversalidx
```

### Step 2: Update Frontend Environment Variables

**File:** `App/Frontend/.env.local`

```env
VITE_API_URL=/api/v1
VITE_SUPABASE_URL=https://ghuxzxxxuaiuumdmytkf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodXh6eHh4dWFpdXVtZG15dGtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MTUyMTIsImV4cCI6MjA3OTA5MTIxMn0.rSSZu_kCaPy0CtjGvpGdIKZA95fE22BU5oeQ8-6GSc8
```

### Step 3: Frontend Must Use Real Supabase Tokens

**Critical:** The frontend must:

1. **Remove demo token** - Clear any stored `justin-access-token` from localStorage
2. **Use real Supabase session** - After login/signup, store the Supabase `access_token`
3. **Send real token** - Include `Authorization: Bearer <real_supabase_token>` in all API calls

**Example Frontend Code:**

```typescript
// After Supabase login
const { data: { session } } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Store the access token
localStorage.setItem('supabase_access_token', session.access_token);

// Use in API calls
const response = await fetch('/api/v1/projects', {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  }
});
```

### Step 4: Restart Both Servers

```bash
# Backend
cd App/Backend
npm run dev

# Frontend (in another terminal)
cd App/Frontend
npm run dev
```

## How MongoDB Sync Works

When a user makes an authenticated request:

1. **Auth Plugin** verifies Supabase token → extracts `user.id` (Supabase UUID)
2. **Routes** call `userService.getOrCreateUserFromSupabase(request.user.id)`
3. **User Service**:
   - Checks MongoDB for user with matching `supabaseId`
   - If found → returns MongoDB user
   - If not found → fetches from Supabase admin API → creates in MongoDB
4. **Routes** use MongoDB `_id` for all CRUD operations

## Testing the Fix

1. **Sign up** via `/api/v1/auth/signup` or Google OAuth
2. **Login** via `/api/v1/auth/login` → get `accessToken`
3. **Use token** in Authorization header for `/api/v1/projects`
4. **Check backend logs** - you should see:
   ```
   [Auth] Token verified successfully for user: user@example.com (uuid)
   [UserService] User synced to MongoDB successfully: user@example.com (mongodb_id)
   ```
5. **Check MongoDB** - User should appear in `users` collection with `supabaseId` field

## Troubleshooting

### Still getting 401?

1. **Check backend logs** - Look for `[Auth] Token verification failed` messages
2. **Verify env vars** - Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
3. **Check token** - Make sure frontend is sending real Supabase token, not demo token
4. **Verify Supabase** - Test token verification directly:
   ```bash
   curl -X POST https://ghuxzxxxuaiuumdmytkf.supabase.co/auth/v1/user \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### User not syncing to MongoDB?

1. **Check backend logs** - Look for `[UserService]` messages
2. **Verify SERVICE_ROLE_KEY** - Required for admin API calls
3. **Check MongoDB connection** - Ensure MongoDB is running and connected
4. **Check Supabase user exists** - User must exist in Supabase first

## Summary

✅ **Supabase** = Authentication (JWT tokens)  
✅ **MongoDB** = Projects/Boards/Tasks CRUD  
✅ **Pinecone** = AI vector search  

The key is ensuring:
1. Backend has correct Supabase env vars
2. Frontend uses real Supabase tokens (not demo tokens)
3. User sync happens automatically on first authenticated request

