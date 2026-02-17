# Frontend-Backend Integration Summary

## ✅ Changes Made

After moving both frontend and backend into the `App/` folder, the following updates were made to ensure proper integration:

### 1. **Frontend API Configuration** ✅
**File:** `App/Frontend/src/config/api.config.ts`
- Changed `BACKEND_TYPE` from `'supabase-edge'` to `'nodejs'`
- Frontend now points to Node.js backend by default
- Uses `http://localhost:3001/api/v1` in development (configurable via `VITE_API_URL`)

### 2. **Workflow API Client** ✅
**File:** `App/Frontend/src/utils/api/workflows.ts`
- Removed hardcoded Supabase Edge Function URL
- Now uses centralized `buildApiUrl()` function
- All workflow endpoints updated to use Node.js backend paths:
  - `/workflows` → `/workflows`
  - `/langchain/rag-search` → `/ai/search`
  - `/langchain/chat` → `/ai/chat`
  - `/langchain/generate-workflow` → `/ai/generate-workflow`
  - `/langchain/execute-agent` → `/ai/mcp/execute`

### 3. **Chat Component** ✅
**File:** `App/Frontend/src/components/Chat.tsx`
- Updated to use `buildApiUrl()` instead of hardcoded URLs
- AI chat and workflow generation now use Node.js backend

### 4. **AI Agent Executor** ✅
**File:** `App/Frontend/src/features/workflow-builder/components/nodes/AIAgentExecutor.tsx`
- All hardcoded Supabase URLs replaced with `buildApiUrl()`
- Updated all AI endpoints to match Node.js backend routes

### 5. **Backend CORS Configuration** ✅
**File:** `App/Backend/src/plugins/cors.plugin.ts`
- Updated to allow frontend origins in development:
  - `http://localhost:3000` (React default)
  - `http://127.0.0.1:3000`
  - `http://localhost:5173` (Vite default)
  - `http://127.0.0.1:5173`
- Production origins can be configured via `FRONTEND_URL` environment variable

## 📋 Next Steps

### 1. **Set Up Environment Variables**

#### Frontend (`App/Frontend/.env` or `.env.local`):
```env
# Node.js Backend URL (development). Use relative path with Vite proxy.
VITE_API_URL=/api/v1

# Supabase (for authentication)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Backend (`App/Backend/.env`):
```env
# Server
NODE_ENV=development
PORT=3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017/flowversal

# Pinecone
PINECONE_API_KEY=your-key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=flowversal-index

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Models
OLLAMA_BASE_URL=http://localhost:11434
OPENROUTER_API_KEY=your-key

# Inngest
INNGEST_EVENT_KEY=your-key
INNGEST_SIGNING_KEY=your-key

# JWT
JWT_SECRET=your-secret
```

### 2. **Start the Backend**
```bash
cd App/Backend
npm install
npm run dev
```
Backend will run on `http://localhost:3001`

### 3. **Start the Frontend**
```bash
cd App/Frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:3000` (or port 5173 if using Vite)

### 4. **Verify Connection**
1. Check backend health: `http://localhost:3001/health`
2. Check frontend can reach backend: Open browser console and verify API calls go to `http://localhost:3001/api/v1/...`

## 🔄 API Endpoint Mapping

### Workflow Endpoints
| Frontend Call | Backend Route |
|--------------|---------------|
| `POST /workflows` | `POST /api/v1/workflows` |
| `GET /workflows` | `GET /api/v1/workflows` |
| `GET /workflows/:id` | `GET /api/v1/workflows/:id` |
| `PUT /workflows/:id` | `PUT /api/v1/workflows/:id` |
| `DELETE /workflows/:id` | `DELETE /api/v1/workflows/:id` |

### AI Endpoints
| Frontend Call | Backend Route |
|--------------|---------------|
| `POST /ai/chat` | `POST /api/v1/ai/chat` |
| `POST /ai/generate-workflow` | `POST /api/v1/ai/generate-workflow` |
| `POST /ai/search` | `POST /api/v1/ai/search` |
| `POST /ai/mcp/execute` | `POST /api/v1/ai/mcp/execute` |

## ⚠️ Notes

1. **Authentication**: The frontend still uses Supabase for authentication. The backend verifies Supabase JWT tokens.

2. **Remaining Hardcoded URLs**: Some files may still have hardcoded Supabase URLs (e.g., `auth.service.ts`, `subscription.service.ts`). These are intentional if they still use Supabase Edge Functions for those specific features.

3. **CORS**: Make sure the backend CORS allows your frontend origin. In development, this is automatically handled.

4. **Environment Variables**: Make sure to set `VITE_API_URL` in the frontend to point to your backend URL.

## 🐛 Troubleshooting

### Frontend can't reach backend
- Check backend is running on port 3001
- Check `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Verify backend CORS configuration allows your frontend origin

### Authentication errors
- Ensure Supabase credentials are correct
- Check that JWT tokens are being sent in `Authorization` header
- Verify backend auth plugin is configured correctly

### API endpoint not found (404)
- Check that the endpoint path matches between frontend and backend
- Verify the backend route is registered in `App/Backend/src/routes/index.ts`
- Check backend logs for route registration

