# 🚀 Production Setup Guide

## Welcome to Production-Ready Flowversal!

Your app is now ready for production with Supabase backend, PostgreSQL database, and Google OAuth!

---

## 📋 Setup Steps

### **Step 1: Create Supabase Project** (5 minutes)

1. **Go to Supabase**
   - Visit: https://supabase.com
   - Click "Start your project"
   - Sign in with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Name: `flowversal-production`
   - Database Password: (create a strong password - save it!)
   - Region: Choose closest to your users
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get Your Credentials**
   - Go to Settings (⚙️) → API
   - Copy these 2 values:
     - **Project URL** (looks like: `https://xxx.supabase.co`)
     - **anon public key** (long string starting with `eyJ...`)

### **Step 2: Configure Environment** (2 minutes)

1. **Create .env file**
   ```bash
   # In your project root
   cp .env.example .env
   ```

2. **Edit .env file**
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Paste your credentials**
   - Replace `your-project` with your actual project URL
   - Replace `your-anon-key-here` with your actual anon key

### **Step 3: Create Database Schema** (3 minutes)

1. **Open SQL Editor**
   - In Supabase dashboard
   - Click SQL Editor (left sidebar)
   - Click "New query"

2. **Copy Schema**
   - Open `/supabase/schema.sql` in your code
   - Copy ALL the SQL code

3. **Run Schema**
   - Paste into Supabase SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait for "Success. No rows returned"

4. **Verify Tables**
   - Click Table Editor (left sidebar)
   - You should see:
     - ✅ profiles
     - ✅ workflows
     - ✅ executions
     - ✅ user_settings

### **Step 4: Configure Google OAuth** (10 minutes)

1. **Create Google OAuth App**
   - Go to: https://console.cloud.google.com
   - Create new project or select existing
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Flowversal"
   
2. **Add Authorized Redirect URIs**
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
   Replace `your-project` with your Supabase project ID
   
3. **Get Client ID & Secret**
   - Copy Client ID
   - Copy Client Secret

4. **Configure in Supabase**
   - Supabase Dashboard → Authentication → Providers
   - Find "Google"
   - Toggle enabled
   - Paste Client ID
   - Paste Client Secret
   - Click "Save"

### **Step 5: Install Dependencies** (2 minutes)

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Or with yarn
yarn add @supabase/supabase-js
```

### **Step 6: Start Your App** (1 minute)

```bash
npm run dev
# or
yarn dev
```

Visit: http://localhost:5173

---

## ✅ Test Your Setup

### **Test 1: Sign Up**
1. Go to your app
2. Click "Sign up"
3. Enter email, password, name
4. Click "Create Account"
5. ✅ Should redirect to dashboard

### **Test 2: Google Login**
1. Click "Continue with Google"
2. Choose Google account
3. ✅ Should redirect to dashboard

### **Test 3: Create Workflow**
1. Go to Workflows
2. Create new workflow
3. Add triggers/nodes
4. Click "Save"
5. ✅ Should save to database

### **Test 4: Run Workflow**
1. Click "Run"
2. Wait for execution
3. ✅ Should show results

### **Test 5: Check Database**
1. Go to Supabase → Table Editor
2. Click "profiles" → You should see your user
3. Click "workflows" → You should see your workflow
4. Click "executions" → You should see execution logs
5. ✅ All data in database!

### **Test 6: Admin Panel**
1. Make yourself admin:
   - Supabase → Table Editor → profiles
   - Find your user
   - Edit → Set `role` to `admin`
   - Save
2. Go to `/admin`
3. ✅ Should see all data!

---

## 🔧 Troubleshooting

### **"Missing Supabase environment variables"**

**Solution:**
- Check `.env` file exists
- Check variables are named correctly:
  - `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
  - `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_KEY`)
- Restart dev server after changing `.env`

### **"Invalid API key"**

**Solution:**
- Double-check you copied the **anon public** key (not service role)
- Make sure no extra spaces in `.env`
- Key should start with `eyJ`

### **"relation does not exist"**

**Solution:**
- Database schema not created
- Go back to Step 3
- Run the entire `schema.sql` file

### **Google login fails**

**Solution:**
- Check redirect URI matches exactly
- Format: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
- Enable Google provider in Supabase
- Wait 5 minutes after configuring

### **"Failed to fetch"**

**Solution:**
- Check internet connection
- Check Supabase project is not paused
- Free tier pauses after 1 week of inactivity
- Go to dashboard and resume

---

## 🎯 What Changed from localStorage?

### **Before (localStorage)**
```typescript
// Data stored in browser
localStorage.setItem('workflows', JSON.stringify(workflows));
```

### **After (Supabase)**
```typescript
// Data stored in PostgreSQL
await supabase.from('workflows').insert(workflow);
```

### **Key Differences:**

| Feature | localStorage | Supabase |
|---------|--------------|----------|
| **Persistence** | Browser only | Cloud database |
| **Multi-device** | ❌ No | ✅ Yes |
| **Team sharing** | ❌ No | ✅ Yes |
| **Data loss** | If cache cleared | ✅ Never |
| **Authentication** | Fake | ✅ Real |
| **Scalability** | Limited to 5-10MB | ✅ Gigabytes |
| **Real-time** | ❌ No | ✅ Yes |

---

## 🚀 Deploy to Production

### **Option 1: Vercel** (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready with Supabase"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to: https://vercel.com
   - Click "New Project"
   - Import your GitHub repo
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Done!**
   - Your app is live!
   - Custom domain: Settings → Domains

### **Option 2: Netlify**

1. **Push to GitHub** (same as above)

2. **Deploy on Netlify**
   - Go to: https://netlify.com
   - Click "Add new site"
   - Import from Git
   - Add environment variables
   - Click "Deploy"

### **Update Google OAuth Redirect**

After deploying, update Google OAuth:
```
Add authorized redirect URI:
https://your-project.supabase.co/auth/v1/callback
https://your-domain.vercel.app/auth/callback
```

---

## 💰 Cost Breakdown

### **Development (FREE)**
- Supabase: Free tier
- Vercel: Free tier
- Total: $0/month

### **Production (as you scale)**

**Supabase Free Tier:**
- ✅ 500MB database
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth
- ✅ 1GB file storage
- **Cost: $0/month**

**Supabase Pro (when you outgrow free):**
- 8GB database
- 100,000 monthly active users
- 250GB bandwidth
- **Cost: $25/month**

**Vercel Free Tier:**
- ✅ 100GB bandwidth
- ✅ Unlimited deployments
- **Cost: $0/month**

**Total to start: $0/month** 🎉

---

## 📊 Database Structure

Your production database has:

### **Tables:**

1. **profiles** - User accounts
   - id, email, name, avatar
   - role (user/admin)
   - status (active/suspended)
   - Stats: workflows_created, workflows_executed, ai_tokens_used
   - Subscription info

2. **workflows** - Saved workflows
   - id, user_id, name, description
   - triggers[], containers[], variables[]
   - status (draft/published/archived)
   - Stats: execution_count, success_count, avg_time

3. **executions** - Execution logs
   - id, workflow_id, user_id
   - status, progress, results
   - timing, resources used

4. **user_settings** - User preferences
   - theme, notifications
   - defaults, custom settings

### **Security:**

- ✅ Row Level Security (RLS) enabled
- ✅ Users see only their data
- ✅ Admins see everything
- ✅ Auto-generated UUIDs
- ✅ Timestamps tracked

### **Automation:**

- ✅ Auto-create profile on signup
- ✅ Auto-update workflow stats on execution
- ✅ Auto-update user stats
- ✅ Auto-update timestamps

---

## 🎓 What's Working Now

### **Authentication:**
- ✅ Email/password signup
- ✅ Email/password login
- ✅ Google OAuth login
- ✅ Session management
- ✅ Auto-logout on token expiry
- ✅ Remember me

### **Data Persistence:**
- ✅ Workflows save to database
- ✅ Executions log to database
- ✅ User stats track automatically
- ✅ Multi-device sync
- ✅ Real-time updates

### **Admin Panel:**
- ✅ Real user management
- ✅ Real workflow management
- ✅ Real execution logs
- ✅ Real-time stats
- ✅ Live execution monitoring

### **Security:**
- ✅ Row-level security
- ✅ User data isolation
- ✅ Admin-only operations
- ✅ Secure API calls
- ✅ HTTPS encryption

---

## 🎯 Next Steps After Setup

1. **Create Your First User**
   - Sign up with your email
   - Make yourself admin (in Supabase)
   - Test all features

2. **Invite Team Members**
   - Share signup link
   - They create their accounts
   - Each gets isolated data

3. **Customize**
   - Add your branding
   - Configure email templates
   - Set up custom domain

4. **Monitor**
   - Supabase dashboard for usage
   - Execution logs for errors
   - User stats for growth

5. **Scale**
   - Add more features
   - Upgrade Supabase when needed
   - Add payment processing

---

## ❓ Need Help?

### **Common Issues:**

**Q: Google login not working?**
A: Check redirect URI matches exactly in Google Console

**Q: Can't see data in admin?**
A: Make sure your role is 'admin' in profiles table

**Q: Database error?**
A: Run schema.sql again in Supabase SQL Editor

**Q: Env variables not working?**
A: Restart dev server after changing .env

### **Documentation:**

- Supabase Docs: https://supabase.com/docs
- Google OAuth: https://support.google.com/cloud/answer/6158849
- Vercel Deploy: https://vercel.com/docs

---

## 🎉 You're Production Ready!

Your Flowversal app is now:
- ✅ Connected to real database
- ✅ Using real authentication
- ✅ Secured with RLS
- ✅ Ready for users
- ✅ Ready to scale
- ✅ Ready to deploy

**Time to launch!** 🚀

---

**Questions or issues?** Let me know and I'll help! 💪
