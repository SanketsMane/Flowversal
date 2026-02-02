# User Metadata Configuration Guide for Flowversal

This guide explains how user metadata is structured and configured in Flowversal's authentication system.

## Overview

User metadata in Flowversal stores additional user information beyond email and password. This includes name, avatar, role, and timestamps.

## Metadata Structure

### User Metadata Schema

```typescript
{
  // User's display name
  name: string;
  
  // Profile avatar URL
  avatar_url?: string;
  
  // User role (for permissions)
  role?: 'user' | 'admin' | 'super_admin';
  
  // Account creation timestamp
  created_at: string;  // ISO 8601 format
  
  // Last profile update timestamp
  updated_at?: string;  // ISO 8601 format
  
  // OAuth provider data (when using Google OAuth)
  provider?: 'email' | 'google';
  provider_id?: string;
  
  // Custom fields (optional)
  company?: string;
  phone?: string;
  timezone?: string;
  preferences?: {
    theme: 'dark' | 'light';
    notifications: boolean;
    language: string;
  };
}
```

## Current Implementation

### Signup Metadata

When a user signs up via `/auth/signup` endpoint, the following metadata is automatically set:

```typescript
{
  name: name || email.split('@')[0],  // Use provided name or derive from email
  created_at: new Date().toISOString(),
  role: 'user',  // Default role
}
```

### Google OAuth Metadata

When signing in via Google OAuth, Supabase automatically provides:

```typescript
{
  name: full_name,           // From Google profile
  avatar_url: picture,        // From Google profile
  email: email,               // From Google profile
  email_verified: true,       // Google verifies emails
  provider: 'google',
  sub: provider_id,           // Google's user ID
}
```

### Profile Updates

Users can update their profile via the `/auth/update-profile` endpoint:

```typescript
{
  name: "Updated Name",
  avatar_url: "https://example.com/avatar.jpg",
  updated_at: new Date().toISOString(),
}
```

## Supabase Dashboard Configuration

### Viewing User Metadata

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click on any user to see their metadata

### Manually Editing User Metadata

1. Go to **Authentication** → **Users**
2. Click on a user
3. Scroll to **User Metadata** section
4. Click **Edit** (JSON editor)
5. Update fields and **Save**

Example:
```json
{
  "name": "John Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "role": "admin",
  "created_at": "2024-01-01T00:00:00.000Z",
  "company": "Flowversal Inc",
  "phone": "+1234567890"
}
```

## Role-Based Access Control (RBAC)

### User Roles

Flowversal supports three role levels:

1. **user** (Default)
   - Access to own projects and workflows
   - Cannot manage other users
   - Basic subscription features

2. **admin**
   - Access to all projects
   - Can manage users
   - Advanced features
   - Analytics dashboard

3. **super_admin**
   - Full system access
   - User management
   - System configuration
   - Billing management

### Setting User Roles

#### Via API (Server-side)

Update the signup endpoint to set roles:

```typescript
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  user_metadata: { 
    name: name || email.split('@')[0],
    created_at: new Date().toISOString(),
    role: 'user',  // or 'admin', 'super_admin'
  },
  email_confirm: true,
});
```

#### Via Dashboard

1. Go to **Authentication** → **Users**
2. Click on user
3. Edit **User Metadata**
4. Add/update `"role": "admin"`
5. Save

### Checking Roles in Frontend

```typescript
import { useAuth } from './contexts/AuthContext';

function AdminPanel() {
  const { user } = useAuth();
  
  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Panel</div>;
}
```

## Custom Metadata Fields

### Adding Custom Fields

You can add any custom fields to user metadata. Example:

```typescript
// During signup
user_metadata: {
  name: "John Doe",
  created_at: new Date().toISOString(),
  
  // Custom fields
  company: "Acme Inc",
  department: "Engineering",
  phone: "+1234567890",
  timezone: "America/New_York",
  preferences: {
    theme: "dark",
    notifications: true,
    language: "en",
  },
  onboarding_completed: false,
  trial_ends_at: "2024-12-31T23:59:59.000Z",
}
```

### Updating Custom Fields

```typescript
const { data, error } = await supabase.auth.admin.updateUserById(
  userId,
  {
    user_metadata: {
      ...existingMetadata,
      company: "New Company",
      department: "Sales",
      onboarding_completed: true,
    },
  }
);
```

## Avatar Management

### Uploading Avatars

Flowversal supports two methods for avatars:

#### Method 1: External URL (Simplest)

```typescript
await authService.updateProfile({
  avatar: "https://example.com/avatar.jpg"
});
```

#### Method 2: Supabase Storage (Recommended)

1. Upload to Supabase Storage:

```typescript
const file = event.target.files[0];

// Upload to storage
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file);

if (!error) {
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(`${userId}/avatar.jpg`);
  
  // Update profile
  await authService.updateProfile({
    avatar: urlData.publicUrl
  });
}
```

2. Set up storage bucket (first time):

```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Set up RLS policies
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### Default Avatars

Use a service like [UI Avatars](https://ui-avatars.com/) for automatic avatars:

```typescript
const getDefaultAvatar = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6E8EFB&color=fff&size=128`;
};

// Usage
user_metadata: {
  name: "John Doe",
  avatar_url: getDefaultAvatar("John Doe"),
}
```

## Metadata Best Practices

### 1. Keep Metadata Lightweight

❌ Don't store large objects:
```typescript
user_metadata: {
  all_workflows: [...],  // Don't do this
  project_data: {...},   // Don't do this
}
```

✅ Store references instead:
```typescript
user_metadata: {
  default_workspace_id: "workspace-123",
  preferences: { theme: "dark" },
}
```

### 2. Use Consistent Naming

```typescript
// Good
created_at, updated_at, avatar_url

// Avoid
createdAt, updatedAt, avatarURL
```

### 3. Validate Metadata

Always validate metadata before saving:

```typescript
const validateUserMetadata = (metadata: any) => {
  const schema = {
    name: (val: any) => typeof val === 'string' && val.length > 0,
    role: (val: any) => ['user', 'admin', 'super_admin'].includes(val),
    avatar_url: (val: any) => !val || isValidUrl(val),
  };
  
  for (const [key, validator] of Object.entries(schema)) {
    if (metadata[key] && !validator(metadata[key])) {
      throw new Error(`Invalid ${key}`);
    }
  }
};
```

### 4. Handle Missing Metadata

```typescript
const getUserName = (user: User) => {
  return user.user_metadata?.name || user.email?.split('@')[0] || 'User';
};

const getUserAvatar = (user: User) => {
  return user.user_metadata?.avatar_url || getDefaultAvatar(getUserName(user));
};
```

## Migration Scripts

### Bulk Update User Metadata

If you need to update metadata for existing users:

```typescript
// Server-side script
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateUserMetadata() {
  // Get all users
  const { data: users } = await supabase.auth.admin.listUsers();
  
  for (const user of users.users) {
    // Update metadata
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        // Add new fields
        created_at: user.created_at,
        role: user.user_metadata?.role || 'user',
      },
    });
  }
}
```

## Security Considerations

### 1. Never Store Sensitive Data

❌ Don't store:
- Passwords
- Credit card numbers
- SSNs or national IDs
- Private API keys

### 2. Use App Metadata for Sensitive Roles

For security-critical fields like roles, use `app_metadata` instead:

```typescript
// Server-side only
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: {
    role: 'admin',  // Users can't modify this
    subscription_tier: 'premium',
  },
});
```

### 3. Validate on Server-Side

Always validate metadata updates on the server, not just client:

```typescript
app.post("/make-server-020d2c80/auth/update-profile", async (c) => {
  const { name, avatar_url } = await c.req.json();
  
  // Validate
  if (name && (name.length < 1 || name.length > 100)) {
    return c.json({ error: "Invalid name" }, 400);
  }
  
  if (avatar_url && !isValidUrl(avatar_url)) {
    return c.json({ error: "Invalid avatar URL" }, 400);
  }
  
  // Update...
});
```

## Querying Users by Metadata

While Supabase Auth doesn't support direct metadata queries, you can:

### Option 1: Store in Separate Table

```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text,
  avatar_url text,
  role text,
  company text,
  created_at timestamptz DEFAULT now()
);

-- Query by metadata
SELECT * FROM user_profiles WHERE company = 'Acme Inc';
```

### Option 2: Use PostgreSQL JSON Queries

```sql
-- Find all admins (requires service role)
SELECT * FROM auth.users 
WHERE raw_user_meta_data->>'role' = 'admin';
```

## Testing Metadata

### Test User Creation with Metadata

```typescript
describe('User Metadata', () => {
  it('should create user with metadata', async () => {
    const result = await authService.signUp(
      'test@example.com',
      'password',
      'Test User'
    );
    
    expect(result.user?.name).toBe('Test User');
    expect(result.user?.role).toBe('user');
    expect(result.user?.createdAt).toBeDefined();
  });
  
  it('should update user metadata', async () => {
    const result = await authService.updateProfile({
      name: 'Updated Name',
      avatar: 'https://example.com/avatar.jpg',
    });
    
    expect(result.success).toBe(true);
  });
});
```

## Resources

- [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Metadata vs App Metadata](https://supabase.com/docs/guides/auth/managing-user-data#user-metadata)
- [RLS Policies for User Data](https://supabase.com/docs/guides/auth/row-level-security)

---

**Need Help?**
- Email: info@flowversal.com
- Phone: +91 97194 30007
