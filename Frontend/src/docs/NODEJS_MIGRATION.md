# Node.js Backend Migration Guide

## 🎯 Overview

This document explains how to migrate from **Supabase Edge Functions (Deno)** to **Node.js Backend**.

**Current Architecture:**
```
React Frontend → Supabase Edge Functions (Deno) → Supabase DB
```

**Target Architecture:**
```
React Frontend → Node.js Backend → Supabase DB + Pinecone
```

---

## 📋 Migration Steps

### **Phase 1: Prepare Node.js Backend**

#### **1.1 Create Node.js Project**

```bash
mkdir flowversal-backend
cd flowversal-backend
npm init -y
```

#### **1.2 Install Dependencies**

Choose your framework:

**Option A: Express (Simple)**
```bash
npm install express cors dotenv
npm install @supabase/supabase-js
npm install openai @pinecone-database/pinecone
npm install -D typescript @types/node @types/express ts-node nodemon
```

**Option B: Fastify (Fast)**
```bash
npm install fastify @fastify/cors dotenv
npm install @supabase/supabase-js
npm install openai @pinecone-database/pinecone
npm install -D typescript @types/node ts-node nodemon
```

**Option C: NestJS (Enterprise)**
```bash
npm install -g @nestjs/cli
nest new flowversal-backend
npm install @supabase/supabase-js openai @pinecone-database/pinecone
```

#### **1.3 Create Environment Variables**

Create `.env` file:

```env
# Server
NODE_ENV=development
PORT=3001

# Supabase (for DB access only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=flowversal-workflows

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

### **Phase 2: Implement Node.js Backend**

#### **2.1 Project Structure**

```
flowversal-backend/
├── src/
│   ├── config/
│   │   ├── supabase.ts      # Supabase client
│   │   ├── openai.ts        # OpenAI client
│   │   └── pinecone.ts      # Pinecone client
│   ├── middleware/
│   │   ├── auth.ts          # JWT verification
│   │   └── errorHandler.ts  # Error handling
│   ├── routes/
│   │   ├── projects.ts      # Projects API
│   │   ├── boards.ts        # Boards API
│   │   ├── tasks.ts         # Tasks API
│   │   ├── workflows.ts     # Workflows API
│   │   ├── ai.ts            # AI features
│   │   └── subscriptions.ts # Stripe
│   ├── services/
│   │   ├── projectService.ts
│   │   ├── workflowService.ts
│   │   └── aiService.ts
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── app.ts               # Main app
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

#### **2.2 Example: Express Server**

**src/app.ts:**
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import projectRoutes from './routes/projects';
import boardRoutes from './routes/boards';
import taskRoutes from './routes/tasks';
import workflowRoutes from './routes/workflows';
import aiRoutes from './routes/ai';
import subscriptionRoutes from './routes/subscriptions';

// Import middleware
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes (all require auth except health)
app.use('/api/v1', authMiddleware); // Apply auth to all routes below

app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/boards', boardRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/workflows', workflowRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
```

**src/config/supabase.ts:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role (full access)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Client-side compatible client (for auth verification)
export const supabaseAuth = createClient(
  supabaseUrl, 
  process.env.SUPABASE_ANON_KEY!
);
```

**src/middleware/auth.ts:**
```typescript
import { Request, Response, NextFunction } from 'express';
import { supabaseAuth } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.split(' ')[1];
    
    // Demo mode support
    if (token === 'justin-access-token') {
      req.user = {
        id: 'justin-user-id',
        email: 'justin@gmail.com',
        role: 'admin',
      };
      return next();
    }
    
    // Verify JWT with Supabase
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role || 'member',
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}
```

**src/routes/projects.ts:**
```typescript
import { Router } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/v1/projects
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch projects',
      details: error.message 
    });
  }
});

// POST /api/v1/projects
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, description, icon, iconColor, configuration } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Project name is required' 
      });
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        icon: icon || 'Briefcase',
        icon_color: iconColor || '#3B82F6',
        configuration: configuration || {},
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create project',
      details: error.message 
    });
  }
});

// PUT /api/v1/projects/:id
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const updates = req.body;
    
    // Verify ownership
    const { data: existing } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (!existing || existing.user_id !== userId) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update project',
      details: error.message 
    });
  }
});

// DELETE /api/v1/projects/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    
    // Check permission
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only administrators can delete projects' 
      });
    }
    
    // Verify ownership
    const { data: existing } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();
    
    if (!existing || existing.user_id !== userId) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      });
    }
    
    // Delete project (cascade will delete boards and tasks)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete project',
      details: error.message 
    });
  }
});

export default router;
```

**src/routes/ai.ts:**
```typescript
import { Router } from 'express';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// POST /api/v1/ai/chat
router.post('/chat', async (req: AuthRequest, res) => {
  try {
    const { messages, model = 'gpt-4' } = req.body;
    
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    res.json({
      success: true,
      data: {
        message: completion.choices[0].message,
        usage: completion.usage,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'AI chat failed',
      details: error.message,
    });
  }
});

// POST /api/v1/ai/search
router.post('/search', async (req: AuthRequest, res) => {
  try {
    const { query, topK = 5 } = req.body;
    const userId = req.user!.id;
    
    // Generate embedding
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });
    
    const embedding = embeddingResponse.data[0].embedding;
    
    // Search Pinecone
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    const results = await index.query({
      vector: embedding,
      topK,
      filter: { userId },
      includeMetadata: true,
    });
    
    res.json({
      success: true,
      data: results.matches,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Semantic search failed',
      details: error.message,
    });
  }
});

export default router;
```

---

### **Phase 3: Update Frontend Configuration**

#### **3.1 Change Backend Type**

In `/config/api.config.ts`:

```typescript
// Change this line:
export const BACKEND_TYPE: 'supabase-edge' | 'nodejs' = 'nodejs';  // ← Changed!

// Update API URL for Node.js:
export const API_BASE_URL = 
  BACKEND_TYPE === 'nodejs'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'  // ← Your Node.js server
    : `https://${projectId}.supabase.co/functions/v1/make-server-020d2c80`;
```

#### **3.2 Add Environment Variable**

Create `.env` in frontend root:

```env
# Node.js Backend URL
VITE_API_URL=http://localhost:3001/api/v1

# Production
# VITE_API_URL=https://api.flowversal.com/api/v1

# Optional: Stripe public key (if using Stripe)
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional: Pinecone environment
# VITE_PINECONE_ENV=us-west1-gcp
```

---

### **Phase 4: Create Supabase Database Tables**

Since you're moving from KV Store to Supabase tables:

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Briefcase',
  icon_color TEXT DEFAULT '#3B82F6',
  configuration JSONB DEFAULT '{}',
  user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Boards table
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Folder',
  icon_color TEXT DEFAULT '#3B82F6',
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  configuration JSONB DEFAULT '{}',
  user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  assigned_to JSONB DEFAULT '[]',
  status TEXT DEFAULT 'To do',
  priority TEXT DEFAULT 'Medium',
  labels JSONB DEFAULT '[]',
  due_date TIMESTAMP,
  has_workflow BOOLEAN DEFAULT false,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by JSONB,
  task_order INTEGER DEFAULT 0,
  user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB DEFAULT '[]',
  edges JSONB DEFAULT '[]',
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can only access their own projects"
  ON projects FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own boards"
  ON boards FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own tasks"
  ON tasks FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only access their own workflows"
  ON workflows FOR ALL
  USING (user_id = auth.uid());
```

---

### **Phase 5: Testing & Deployment**

#### **5.1 Test Locally**

1. Start Node.js backend:
```bash
cd flowversal-backend
npm run dev  # or: nodemon src/app.ts
```

2. Start React frontend:
```bash
cd flowversal-frontend
npm run dev
```

3. Test all features:
   - ✅ Authentication
   - ✅ Projects CRUD
   - ✅ Boards CRUD
   - ✅ Tasks CRUD
   - ✅ Workflows
   - ✅ AI Chat
   - ✅ Semantic Search

#### **5.2 Deploy Node.js Backend**

**Option A: Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway init
railway up
```

**Option B: Render**
```bash
# Create render.yaml
services:
  - type: web
    name: flowversal-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

**Option C: DigitalOcean App Platform**
- Push to GitHub
- Connect repository
- Configure environment variables
- Deploy

#### **5.3 Update Frontend Environment**

Production `.env`:
```env
NEXT_PUBLIC_API_URL=https://api.flowversal.com/api/v1
```

---

## ✅ Migration Checklist

### Backend Setup
- [ ] Create Node.js project
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Implement auth middleware
- [ ] Create project routes
- [ ] Create board routes
- [ ] Create task routes
- [ ] Create workflow routes
- [ ] Create AI routes
- [ ] Test all endpoints

### Database Setup
- [ ] Create Supabase tables
- [ ] Set up Row Level Security
- [ ] Migrate data from KV Store to tables
- [ ] Test database queries

### Frontend Update
- [ ] Change `BACKEND_TYPE` to 'nodejs'
- [ ] Set `NEXT_PUBLIC_API_URL`
- [ ] Test all API calls
- [ ] Verify auth flow

### Deployment
- [ ] Deploy Node.js backend
- [ ] Update frontend environment variables
- [ ] Deploy frontend
- [ ] Test production environment

### Cleanup
- [ ] Remove old Supabase Edge Functions (optional)
- [ ] Update documentation
- [ ] Update CI/CD pipelines

---

## 🎉 Benefits After Migration

✅ **Full Control**: Complete control over backend logic  
✅ **Better Performance**: Node.js is optimized for I/O operations  
✅ **Easier Debugging**: Standard Node.js debugging tools  
✅ **More Libraries**: Access to entire npm ecosystem  
✅ **Async Jobs**: Easy integration with BullMQ/Temporal  
✅ **Microservices**: Can split into multiple services  

---

## 📚 Additional Resources

- [Express Documentation](https://expressjs.com/)
- [Fastify Documentation](https://www.fastify.io/)
- [NestJS Documentation](https://nestjs.com/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Pinecone Documentation](https://docs.pinecone.io/)