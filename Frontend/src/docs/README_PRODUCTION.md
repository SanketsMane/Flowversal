# 🚀 Flowversal - Production Setup

## 🎉 Your App is Production-Ready!

Flowversal now supports **two modes**:

1. **Development Mode** (localStorage) - No setup needed
2. **Production Mode** (Supabase) - Full database + auth

---

## 🔄 How It Works

The app automatically detects which mode to use:

```typescript
// If Supabase env variables are configured
✅ Production Mode: Real database, Google OAuth, multi-device sync

// If no Supabase env variables
💻 Development Mode: localStorage, demo auth, single device
```

**No code changes needed!** Just add/remove environment variables.

---

## 💻 Development Mode (Current)

**What's working:**
- ✅ Everything works with localStorage
- ✅ All features functional
- ✅ Perfect for development
- ✅ No setup required

**To start:**
```bash
npm install
npm run dev
```

That's it! App runs on http://localhost:5173

---

## 🚀 Production Mode (Supabase)

### **Step 1: Create Supabase Project**

1. Go to https://supabase.com
2. Sign up/Login
3. Create new project
4. Wait 2-3 minutes for setup

### **Step 2: Get Credentials**

1. Go to Project Settings → API
2. Copy:
   - Project URL
   - anon public key

### **Step 3: Create .env File**

```bash
# Copy example file
cp .env.example .env

# Edit .env and paste your credentials:
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### **Step 4: Run Database Schema**

1. Open Supabase Dashboard → SQL Editor
2. Copy all SQL from `/supabase/schema.sql`
3. Paste and click "Run"
4. Verify tables created: profiles, workflows, executions, user_settings

### **Step 5: Configure Google OAuth** (Optional)

1. Create OAuth app: https://console.cloud.google.com
2. Add redirect URI: `https://yourproject.supabase.co/auth/v1/callback`
3. Get Client ID & Secret
4. Add to Supabase: Authentication → Providers → Google

### **Step 6: Install Dependencies**

```bash
npm install @supabase/supabase-js
```

### **Step 7: Restart App**

```bash
npm run dev
```

**That's it!** App now runs in production mode with Supabase!

---

## 🎯 Feature Comparison

| Feature | Development (localStorage) | Production (Supabase) |
|---------|----------------------------|------------------------|
| **Setup Time** | 0 minutes | 15 minutes |
| **Authentication** | Demo | Real (Email + Google OAuth) |
| **Data Storage** | Browser only | Cloud database |
| **Multi-device** | ❌ No | ✅ Yes |
| **Team Sharing** | ❌ No | ✅ Yes |
| **Data Loss Risk** | High (cache clear) | ✅ Never |
| **Scalability** | ~5MB limit | ✅ Gigabytes |
| **Real-time** | ❌ No | ✅ Yes |
| **Cost** | Free | Free (then $25/mo) |
| **Best For** | Development, testing | Production, real users |

---

## 📦 What's Included

### **Database Schema:**

**Tables Created:**
- ✅ `profiles` - User accounts with stats
- ✅ `workflows` - Saved workflows with metadata
- ✅ `executions` - Execution logs with results
- ✅ `user_settings` - User preferences

**Security:**
- ✅ Row Level Security (RLS) enabled
- ✅ Users see only their data
- ✅ Admins see everything
- ✅ Automatic triggers for stats

### **Authentication:**

**Methods:**
- ✅ Email + Password signup/login
- ✅ Google OAuth (one-click login)
- ✅ Session management
- ✅ Auto profile creation

### **Real-time Features:**

- ✅ Live execution monitoring
- ✅ Dashboard auto-updates
- ✅ Multi-user support
- ✅ Instant data sync

---

## 🧪 Testing

### **Test Development Mode:**

```bash
# Remove .env file (if exists)
rm .env

# Start app
npm run dev

# You should see in console:
💻 Running in DEVELOPMENT mode with localStorage
```

### **Test Production Mode:**

```bash
# Create .env with Supabase credentials
# (see Step 3 above)

# Start app
npm run dev

# You should see in console:
🚀 Running in PRODUCTION mode with Supabase
```

---

## 🔧 Troubleshooting

### **"Missing Supabase environment variables"**

**Cause:** `.env` file not found or variables missing

**Solution:**
1. Check `.env` file exists in project root
2. Check variables start with `VITE_`
3. Restart dev server after creating `.env`

### **App still uses localStorage**

**Cause:** Environment variables not loaded

**Solution:**
```bash
# Stop dev server (Ctrl+C)
# Restart
npm run dev
```

### **"Invalid API key"**

**Cause:** Wrong key copied

**Solution:**
1. Make sure you copied **anon public** key (not service role)
2. Key should start with `eyJ`
3. No extra spaces in `.env`

### **Google OAuth not working**

**Cause:** Redirect URI mismatch

**Solution:**
1. Check Google Console redirect URI matches exactly:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
2. Enable Google provider in Supabase
3. Wait 5 minutes after configuration

---

## 🚀 Deploy to Production

### **Vercel (Recommended)**

```bash
# 1. Push to GitHub
git add .
git commit -m "Production ready"
git push

# 2. Deploy on Vercel
# - Go to vercel.com
# - Import GitHub repo
# - Add environment variables:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
# - Deploy!
```

### **Netlify**

```bash
# Same steps as Vercel
# Add env variables in Netlify dashboard
```

### **After Deploy:**

Update Google OAuth redirect URI:
```
https://your-domain.vercel.app/auth/callback
```

---

## 💰 Costs

### **Free Tier (Perfect for Launch!):**

**Supabase:**
- 500MB database
- 50,000 monthly users
- 2GB bandwidth
- **Cost: $0/month**

**Vercel:**
- 100GB bandwidth
- Unlimited deployments
- **Cost: $0/month**

**Total: $0/month** until you have thousands of users!

### **Pro Tier (When You Scale):**

**Supabase Pro:**
- 8GB database
- 100,000 monthly users
- **Cost: $25/month**

---

## 📚 Documentation

**Full Setup Guide:**
- See `/PRODUCTION_SETUP_GUIDE.md`

**Supabase Docs:**
- https://supabase.com/docs

**Google OAuth Setup:**
- https://support.google.com/cloud/answer/6158849

---

## 🎯 Quick Commands

```bash
# Development Mode (localStorage)
npm run dev

# Production Mode (Supabase)
# 1. Create .env with Supabase credentials
# 2. npm run dev

# Build for Production
npm run build

# Preview Production Build
npm run preview
```

---

## ✅ Checklist

### **For Development:**
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Done! ✨

### **For Production:**
- [ ] Create Supabase project
- [ ] Get credentials (URL + anon key)
- [ ] Create `.env` file
- [ ] Run database schema in Supabase
- [ ] `npm install @supabase/supabase-js`
- [ ] `npm run dev`
- [ ] Configure Google OAuth (optional)
- [ ] Test everything
- [ ] Deploy to Vercel/Netlify
- [ ] Launch! 🚀

---

## 🎉 You're Ready!

**Development:** Works out of the box with localStorage

**Production:** 15 minutes to Supabase setup, then deploy!

Your Flowversal app is ready to scale from 0 to 1000s of users! 🚀

---

**Questions?** Check `/PRODUCTION_SETUP_GUIDE.md` for detailed instructions!
