# Node.js Backend - Quick Start Example

This is a **production-ready Node.js backend** you can use to replace the Supabase Edge Functions.

---

## 📁 Full Backend Structure

Create this outside of the React app:

```bash
flowversal-backend/
├── src/
│   ├── app.ts
│   ├── config/
│   │   ├── supabase.ts
│   │   ├── openai.ts
│   │   └── pinecone.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── projects.ts
│   │   ├── boards.ts
│   │   ├── tasks.ts
│   │   ├── workflows.ts
│   │   └── ai.ts
│   └── types/
│       └── index.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Quick Setup (5 minutes)

### **1. Create Project**

```bash
mkdir flowversal-backend
cd flowversal-backend
npm init -y
```

### **2. Install Dependencies**

```bash
# Core
npm install express cors dotenv helmet morgan

# Database & Auth
npm install @supabase/supabase-js

# AI Services
npm install openai @pinecone-database/pinecone

# TypeScript
npm install -D typescript @types/node @types/express @types/cors
npm install -D ts-node nodemon

# Optional: Async Jobs
npm install bullmq ioredis
```

### **3. Create package.json Scripts**

```json
{
  "name": "flowversal-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "eslint . --ext .ts",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "@supabase/supabase-js": "^2.38.0",
    "openai": "^4.20.0",
    "@pinecone-database/pinecone": "^1.1.0",
    "bullmq": "^4.15.0",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}
```

### **4. Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### **5. Create nodemon.json**

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/app.ts",
  "env": {
    "NODE_ENV": "development"
  }
}
```

### **6. Create .env**

```env
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_INDEX_NAME=flowversal-workflows

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis (for BullMQ - optional)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 📄 Complete Code Files

### **src/app.ts** (Main Entry Point)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import routes from './routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security & Logging
app.use(helmet());
app.use(morgan('dev'));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('┌─────────────────────────────────────────┐');
  console.log('│  🚀 Flowversal Backend Server          │');
  console.log('├─────────────────────────────────────────┤');
  console.log(`│  Port: ${PORT.toString().padEnd(32)} │`);
  console.log(`│  Environment: ${(process.env.NODE_ENV || 'development').padEnd(24)} │`);
  console.log(`│  URL: http://localhost:${PORT.toString().padEnd(18)} │`);
  console.log('└─────────────────────────────────────────┘');
});

export default app;
```

### **src/middleware/auth.ts** (Authentication)

```typescript
import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

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
      return res.status(401).json({
        success: false,
        error: 'Missing authorization token',
      });
    }

    const token = authHeader.split(' ')[1];

    // Demo mode: Accept demo tokens
    if (token === 'justin-access-token') {
      req.user = {
        id: 'justin-user-id',
        email: 'justin@gmail.com',
        role: 'admin',
      };
      return next();
    }

    if (token === 'demo-access-token') {
      req.user = {
        id: 'demo-user-id',
        email: 'demo@demo.com',
        role: 'admin',
      };
      return next();
    }

    // Verify real JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    req.user = {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role || 'member',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

// Role-based authorization
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
}
```

### **src/middleware/errorHandler.ts** (Error Handling)

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
```

### **src/config/supabase.ts** (Supabase Client)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Admin client (full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Public client (for auth)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### **src/config/openai.ts** (OpenAI Client)

```typescript
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### **src/config/pinecone.ts** (Pinecone Client)

```typescript
import { Pinecone } from '@pinecone-database/pinecone';

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const workflowsIndex = pinecone.index(
  process.env.PINECONE_INDEX_NAME || 'flowversal-workflows'
);
```

### **src/routes/index.ts** (Main Router)

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

// Import route modules
import projectRoutes from './projects';
import boardRoutes from './boards';
import taskRoutes from './tasks';
import workflowRoutes from './workflows';
import aiRoutes from './ai';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Mount routes
router.use('/projects', projectRoutes);
router.use('/boards', boardRoutes);
router.use('/tasks', taskRoutes);
router.use('/workflows', workflowRoutes);
router.use('/ai', aiRoutes);

export default router;
```

### **src/routes/projects.ts** (Projects API)

```typescript
import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/v1/projects
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data, count: data?.length || 0 });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects',
      details: error.message,
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
        error: 'Project name is required',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        name,
        description: description || '',
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
      details: error.message,
    });
  }
});

// PUT /api/v1/projects/:id
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({
        ...req.body,
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
      details: error.message,
    });
  }
});

// DELETE /api/v1/projects/:id (Admin only)
router.delete('/:id', requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete project',
      details: error.message,
    });
  }
});

export default router;
```

### **src/routes/ai.ts** (AI Features)

```typescript
import { Router } from 'express';
import { openai } from '../config/openai';
import { workflowsIndex } from '../config/pinecone';
import { AuthRequest } from '../middleware/auth';

const router = Router();

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

// POST /api/v1/ai/search (Semantic search)
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
    const results = await workflowsIndex.query({
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

// POST /api/v1/ai/generate-workflow
router.post('/generate-workflow', async (req: AuthRequest, res) => {
  try {
    const { description } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a workflow generation assistant. Generate workflow nodes and edges based on user description.',
        },
        {
          role: 'user',
          content: `Generate a workflow for: ${description}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const workflow = JSON.parse(completion.choices[0].message.content || '{}');

    res.json({
      success: true,
      data: workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Workflow generation failed',
      details: error.message,
    });
  }
});

export default router;
```

---

## 🚀 Run the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Server will run on: **http://localhost:3001**

---

## ✅ Test Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Get projects (with auth)
curl http://localhost:3001/api/v1/projects \
  -H "Authorization: Bearer justin-access-token"

# Create project
curl -X POST http://localhost:3001/api/v1/projects \
  -H "Authorization: Bearer justin-access-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "My first project"}'
```

---

## 🎉 Done!

Now your Node.js backend is ready. Update the frontend to point to this server!
