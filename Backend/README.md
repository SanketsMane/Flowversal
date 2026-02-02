# Flowversal Backend API

Production-ready Node.js backend for Flowversal workflow automation platform.

## Tech Stack

- **Framework**: Fastify (high-performance, async-first)
- **Database**: MongoDB (Mongoose ODM)
- **Vector DB**: Pinecone Serverless
- **Auth**: Supabase Auth
- **File Storage**: Supabase Storage
- **Workflow Engine**: Inngest
- **AI Models**: 
  - Local: Ollama (LLaMA 3, Qwen-2, Mistral)
  - Remote: OpenRouter (GPT-4.1, Claude 3.5, Gemini 2.0)
- **AI Framework**: LangChain
- **RAG**: Pinecone + LangChain embeddings
- **MCP**: Custom MCP server architecture

## Architecture Flow

```
Frontend (React + Zustand)
    ↓
Backend API (Fastify / Node.js)
    ↓
AI Layer (Local 32B Models + OpenRouter)
    ↓
Inngest Workflow Runner
    ↓
Databases: MongoDB + Supabase + Pinecone
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or cloud)
- Pinecone account
- Supabase project
- (Optional) Ollama for local AI models

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
   - MongoDB connection string
   - Pinecone API key
   - Supabase URL and keys
   - OpenRouter API key (if using remote models)
   - Ollama URL (if using local models)

### Development

Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Overall health status
- `GET /api/v1/health/live` - Liveness probe
- `GET /api/v1/health/ready` - Readiness probe

### Authentication
All routes (except health checks) require a Supabase JWT token:
```
Authorization: Bearer <your-supabase-jwt-token>
```

## Project Structure

```
Backend/
├── src/
│   ├── config/           # Environment & service configs
│   ├── db/              # Database connections & models
│   ├── services/        # Business logic services
│   ├── routes/          # Fastify route handlers
│   ├── plugins/         # Fastify plugins
│   ├── utils/           # Helpers, validators
│   ├── types/           # TypeScript types
│   ├── agents/          # AI agents & MCP servers
│   ├── jobs/            # Inngest job definitions
│   └── server.ts        # Fastify app entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

See `.env.example` for all required environment variables.

## Development Status

- ✅ Phase 1: Foundation & Core Setup
- ⏳ Phase 2: Authentication & User Management
- ⏳ Phase 3: Core Workflow Features
- ⏳ Phase 4: AI Integration Foundation
- ⏳ Phase 5: Advanced AI Features (RAG)
- ⏳ Phase 6: MCP Server Architecture
- ⏳ Phase 7: Inngest Integration
- ⏳ Phase 8: Additional Features

## License

MIT

