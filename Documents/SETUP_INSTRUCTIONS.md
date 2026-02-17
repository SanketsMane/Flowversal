# Setup Instructions - Restructured Codebase

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd App/Backend

# Install dependencies
npm install

# Create .env file (copy from .env.example if exists)
# Set NODE_ENV=development
# Set PORT=3001
# Configure MongoDB, Supabase, Pinecone, etc.

# Start development server
npm run dev
```

The backend will start on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd App/Frontend

# Install dependencies
npm install

# Create .env file
# Set VITE_API_URL=http://localhost:3001/api/v1
# Configure other environment variables

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## ✅ CORS Configuration

CORS is now properly configured:

- **Development**: Allows all origins (localhost, 127.0.0.1, etc.)
- **Production**: Restrict to specific domains

The CORS plugin is registered **FIRST** in the server setup to ensure headers are always present.

## 📁 Project Structure

```
App/
├── Backend/              # Node.js + Fastify
│   ├── src/
│   │   ├── plugins/      # Fastify plugins
│   │   │   └── cors.plugin.ts  # CORS configuration
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── server.ts      # Server entry point
│   └── package.json
│
└── Frontend/             # React + TypeScript
    ├── src/
    │   ├── lib/
    │   │   └── api-client.ts  # Standardized API client
    │   ├── services/      # Service layer
    │   ├── config/        # Configuration
    │   └── utils/         # Utilities
    └── package.json
```

## 🔧 API Client Usage

The new standardized API client is available at `App/Frontend/src/lib/api-client.ts`:

```typescript
import api from '@/lib/api-client';

// GET request
const response = await api.get('/projects');
if (response.success) {
  console.log(response.data);
}

// POST request
const response = await api.post('/projects', {
  name: 'My Project'
});
```

## 🐛 Troubleshooting

### CORS Errors Still Appearing?

1. **Restart Backend Server** - Required after CORS changes
2. **Check NODE_ENV** - Should be `development` for local development
3. **Verify Frontend URL** - Should be `http://localhost:3000`
4. **Check Browser Console** - Look for CORS error details

### API Calls Failing?

1. **Check Backend is Running** - `http://localhost:3001/api/v1/health`
2. **Verify API URL** - Should be `http://localhost:3001/api/v1`
3. **Check Authentication** - Token should be in localStorage
4. **Review Network Tab** - Check request/response details

## 📝 Environment Variables

### Backend Required Variables

- `NODE_ENV` - `development` or `production`
- `PORT` - Server port (default: 3001)
- `MONGODB_URI` - MongoDB connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

### Frontend Required Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:3001/api/v1`)

## ✅ Verification Checklist

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] CORS headers are present in responses
- [ ] API calls from frontend to backend work
- [ ] Authentication tokens are sent correctly
- [ ] Health endpoint responds: `http://localhost:3001/api/v1/health`

## 🎯 Next Steps

1. Test the integration
2. Migrate existing services to use new API client (optional)
3. Clean up old markdown files and temp files
4. Add shared types between frontend and backend

