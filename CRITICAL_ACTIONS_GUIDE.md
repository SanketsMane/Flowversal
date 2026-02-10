# Critical Manual Actions - Step-by-Step Guide

**Time Required:** 4-5 hours total  
**Difficulty:** Medium  
**Priority:** Must complete before production deployment

---

## ⚠️ Before You Start

1. **Backup your current .env files** (just in case):
   ```bash
   cp Backend/.env Backend/.env.backup
   cp Frontend/.env Frontend/.env.backup
   ```

2. **Have these accounts ready:**
   - MongoDB Atlas account
   - Supabase account
   - Pinecone account
   - Redis provider account (choose one below)
   - Neon Database account
   - OpenRouter account (if using)
   - Inngest account (if using)

3. **Stop any running servers** (for credential rotation):
   ```bash
   # Press Ctrl+C in both terminal windows
   ```

---

## Action 1: Set Up Redis Instance (30-60 minutes)

### Option A: Upstash (Easiest - Recommended for Getting Started)

1. **Go to [Upstash Console](https://console.upstash.com/)**
2. **Sign up/Login** (free tier available)
3. **Create Redis Database:**
   - Click "Create Database"
   - Name: `flowversalai-prod`
   - Type: Regional (or Global for multi-region)
   - Region: Choose closest to your backend
   - Click "Create"

4. **Get Connection Details:**
   - Copy the connection details shown
   - Look for: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

5. **Add to Backend/.env:**
   ```env
   # Redis Configuration (Upstash)
   REDIS_HOST=<your-redis-url>.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=<your-password>
   ```

### Option B: Redis Cloud (Good for Production)

1. **Go to [Redis Cloud](https://redis.com/try-free/)**
2. **Create free account**
3. **Create Database:**
   - Click "New Database"
   - Select plan (Free 30MB available)
   - Choose cloud provider & region
   - Database name: `flowversalai-prod`
   - Click "Activate"

4. **Get Credentials:**
   - Click on your database
   - Copy: `Public endpoint` and `Default user password`

5. **Add to Backend/.env:**
   ```env
   # Redis Configuration (Redis Cloud)
   REDIS_HOST=redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com
   REDIS_PORT=12345
   REDIS_PASSWORD=your-password-here
   ```

### Option C: AWS ElastiCache (Best for AWS Deployments)

1. **Go to AWS Console → ElastiCache**
2. **Create Redis Cluster:**
   - Click "Create"
   - Choose "Redis"
   - Cluster mode: Disabled
   - Name: `flowversalai-prod`
   - Node type: cache.t3.micro (or larger)
   - Number of replicas: 0 (for cost savings)

3. **Configure Security:**
   - VPC: Select your VPC
   - Security groups: Allow port 6379 from your backend
   - Encryption: Enable in-transit and at-rest

4. **Get Endpoint:**
   - Wait for cluster to be "available"
   - Copy the "Primary endpoint"

5. **Add to Backend/.env:**
   ```env
   # Redis Configuration (AWS ElastiCache)
   REDIS_HOST=your-cluster.abc123.0001.use1.cache.amazonaws.com
   REDIS_PORT=6379
   REDIS_PASSWORD=  # Leave empty if not using AUTH
   ```

### Verify Redis Connection

```bash
cd Backend
npm run verify:connections
```

Look for:
```
✅ Redis: Connected
```

---

## Action 2: Rotate All Exposed Credentials (2-3 hours)

Go through each service and generate new credentials:

### 2.1 MongoDB Atlas

1. **Login to [MongoDB Atlas](https://cloud.mongodb.com/)**
2. **Go to:** Database Access → Database Users
3. **Create New User:**
   - Username: `flowversalai_prod` (different from current)
   - Password: Click "Autogenerate Secure Password" → Copy it
   - Database User Privileges: Read and write to any database
   - Click "Add User"

4. **Get New Connection String:**
   - Go to: Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with the password you copied

5. **Update Backend/.env:**
   ```env
   MONGODB_URI=mongodb+srv://flowversalai_prod:<NEW-PASSWORD>@cluster0.xxxxx.mongodb.net/FlowVersalDB?retryWrites=true&w=majority
   MONGODB_DB_NAME=FlowVersalDB
   ```

6. **Test the connection:**
   ```bash
   npm run verify:connections
   ```

7. **Delete old user** (after confirming new one works):
   - Database Access → Find old user → Delete

### 2.2 Supabase

1. **Login to [Supabase](https://supabase.com/dashboard)**
2. **Select your project**
3. **Generate New Service Role Key:**
   - Go to: Settings → API
   - Click "Generate new service role key"
   - Copy the new key

4. **Get New Anon Key:**
   - It should be shown on the same page
   - Copy the anon key

5. **Generate New JWT Secret:**
   - Settings → API → JWT Settings
   - **WARNING:** Changing this will invalidate all existing sessions
   - If you change it, copy the new secret

6. **Update Backend/.env:**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<NEW-SERVICE-ROLE-KEY>
   SUPABASE_ANON_KEY=<NEW-ANON-KEY>
   JWT_SECRET=<NEW-JWT-SECRET>
   ```

7. **Update Frontend/.env:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=<NEW-ANON-KEY>
   ```

8. **Revoke old keys** (after testing):
   - Settings → API → Revoke old service role key

### 2.3 Pinecone

1. **Login to [Pinecone](https://app.pinecone.io/)**
2. **Go to:** API Keys
3. **Create New API Key:**
   - Click "Create API Key"
   - Name: `FlowversalAI Production`
   - Click "Create Key"
   - Copy the key (shown only once!)

4. **Update Backend/.env:**
   ```env
   PINECONE_API_KEY=<NEW-API-KEY>
   PINECONE_INDEX_NAME=flowversalidx
   PINECONE_HOST=https://flowversalidx-xxxxx.svc.aped-4627-b74a.pinecone.io
   ```

5. **Delete old API key** (after testing):
   - API Keys → Find old key → Delete

### 2.4 Neon Database

1. **Login to [Neon](https://console.neon.tech/)**
2. **Select your project**
3. **Reset Password:**
   - Go to: Connection Details
   - Click "Reset password"
   - Copy new password

4. **Get New Connection String:**
   - Copy the connection string with new password

5. **Update Backend/.env:**
   ```env
   NEON_DATABASE_URL=postgresql://neondb_owner:<NEW-PASSWORD>@ep-crimson-sea-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 2.5 OpenRouter (Optional)

1. **Login to [OpenRouter](https://openrouter.ai/)**
2. **Go to:** Keys
3. **Create new key** → Copy it
4. **Update Backend/.env:**
   ```env
   OPENROUTER_API_KEY=<NEW-KEY>
   ```
5. **Delete old key**

### 2.6 Inngest (Optional)

1. **Login to [Inngest](https://app.inngest.com/)**
2. **Go to:** Settings → Keys
3. **Rotate keys:**
   - Event Key: Click "Rotate" → Copy new key
   - Signing Key: Click "Rotate" → Copy new key

4. **Update Backend/.env:**
   ```env
   INNGEST_EVENT_KEY=<NEW-EVENT-KEY>
   INNGEST_SIGNING_KEY=<NEW-SIGNING-KEY>
   ```

### 2.7 Verify All Connections

```bash
cd Backend
npm run validate:env
npm run verify:connections
```

**Expected output:**
```
✅ All environment variables valid
✅ MongoDB: Connected
✅ Pinecone: Connected
✅ Supabase: Connected
✅ Neon PostgreSQL: Connected
✅ Redis: Connected
```

---

## Action 3: Remove .env from Git History (30 minutes)

### Option A: Simple Removal (Removes from tracking only)

**⚠️ WARNING:** This does NOT remove from git history, only from future commits

```bash
cd c:\Users\rohan\Documents\FlowversalAI-main\FlowversalAI-main

# Remove from tracking
git rm --cached Backend/.env
git rm --cached Frontend/.env

# Commit
git commit -m "chore: remove .env files from git tracking"

# Push (if working with remote)
git push origin main
```

### Option B: Complete Removal (Recommended - Rewrites History)

**⚠️ WARNING:** This REWRITES git history. If repository is shared, coordinate with team.

**Step 1: Install BFG Repo-Cleaner**

```bash
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
# Or use this direct link:
# https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# Save to: c:\Users\rohan\Downloads\bfg-1.14.0.jar
```

**Step 2: Backup Your Repository**

```bash
cd c:\Users\rohan\Documents\FlowversalAI-main
# Create a complete backup
xcopy FlowversalAI-main FlowversalAI-main-backup /E /I /H
```

**Step 3: Remove .env Files from Entire History**

```bash
cd FlowversalAI-main

# Run BFG to remove all .env files from history
java -jar c:\Users\rohan\Downloads\bfg-1.14.0.jar --delete-files .env

# Clean up the repository
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Step 4: Verify Removal**

```bash
# Search for .env in history - should return nothing
git log --all --full-history --source --find-copies-harder -- "*/.env" "*.env"
git log --all --full-history --source --find-copies-harder -- "Backend/.env" "Frontend/.env"

# If nothing is returned, .env files are removed from history ✅
```

**Step 5: Force Push (if using remote)**

```bash
# ⚠️ WARNING: This will overwrite remote history
# Make sure team is aware!

git push origin --force --all
git push origin --force --tags
```

**Step 6: Verify Files Still Exist Locally**

```bash
# These should still exist (they're just not tracked by git)
dir Backend\.env
dir Frontend\.env
```

### Alternative: Using git filter-branch (More Manual)

```bash
# Remove Backend/.env
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch Backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Remove Frontend/.env
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch Frontend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

---

## Final Verification Checklist

After completing all 3 actions, verify everything:

### ✅ Redis Setup
```bash
cd Backend
npm run verify:connections
# Should show: ✅ Redis: Connected
```

### ✅ Credentials Rotated
```bash
cd Backend
npm run validate:env
# Should show: ✅ All environment variables valid

npm run verify:connections
# All services should show: ✅ Connected
```

### ✅ .env Removed from Git
```bash
# Check git status
git status
# Backend/.env and Frontend/.env should NOT appear as tracked files

# Check history
git log --all --full-history -- "*/.env"
# Should return nothing (if using BFG method)
```

### ✅ Application Still Works
```bash
# Terminal 1: Start Backend
cd Backend
npm run dev

# Terminal 2: Start Frontend
cd Frontend
npm run dev

# Test:
# - Login works
# - API calls work
# - No authentication errors
```

---

## Troubleshooting

### Redis Connection Fails
```bash
# Check if Redis is accessible
# For Upstash/Redis Cloud, test with curl:
curl https://your-redis-url.upstash.io

# For AWS ElastiCache, check security groups allow your IP
```

### Database Connection Fails
```bash
# Test MongoDB connection
npm run verify:connections

# If fails, check:
# 1. Network access whitelist in MongoDB Atlas
# 2. Correct username/password
# 3. Database name matches
```

### BFG Fails
```bash
# Make sure you have Java installed
java -version

# If not installed:
# Download from: https://www.java.com/download/
```

---

## Time Tracking

- [ ] Redis setup: _____ minutes (target: 30-60)
- [ ] Credential rotation: _____ minutes (target: 120-180)
- [ ] Git history cleanup: _____ minutes (target: 30)
- [ ] Total time: _____ minutes (target: 180-300)

---

## After Completion

Once all 3 actions are complete:

1. **Update the production readiness checklist**
2. **Deploy to staging environment**
3. **Run full integration tests**
4. **Monitor for 24-48 hours**
5. **Deploy to production** 🚀

Good luck! 💪
