# Supabase Setup Guide for Flowversal AI

## 🚨 Current Status
The application is currently using **placeholder Supabase credentials** that will not work. You need to configure a real Supabase project to enable authentication features.

## ⚙️ Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - **Project Name**: flowversal-ai
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to your users
4. Wait for project provisioning (2-3 minutes)

### 2. Get Your Credentials

Once your project is ready:

1. Go to **Project Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIs...`

### 3. Configure Frontend

**Option A: Using Environment Variables (Recommended)**

Create a `.env` file in `App/Frontend/`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_API_URL=http://localhost:8000
```

**Option B: Update info.tsx directly**

Edit `App/Frontend/src/shared/utils/supabase/info.tsx`:

```typescript
export const projectId = "your-project-id"
export const publicAnonKey = "your-anon-key"
```

### 4. Configure Backend

Update `App/Backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Set Up Database Schema

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create executions table
CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  result JSONB,
  error TEXT
);

-- Row Level Security Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view own workflows"
  ON workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflows"
  ON workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 6. Restart Development Server

```bash
# Stop current server (Ctrl+C)
cd App/Frontend
npm run dev
```

## 🔧 Troubleshooting

### Error: ERR_NAME_NOT_RESOLVED
**Cause**: Invalid or placeholder Supabase URL
**Fix**: Follow setup instructions above to configure real Supabase project

### Error: Failed to fetch
**Cause**: Invalid anon key or network issues
**Fix**: Verify your anon key is correct and Supabase project is active

### Error: 404 Not Found
**Cause**: Supabase tables not created
**Fix**: Run the database schema SQL commands above

## 🚀 Development Without Supabase

If you want to develop without Supabase authentication:

1. The application will show a warning but won't crash
2. Authentication features will be disabled
3. Use backend's temporary demo tokens for testing

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
