# Onboarding Guide (Phase 7)

This guide gets a new contributor productive in under 30 minutes. It covers environment setup, running locally (node and Docker), sanity checks, and where to find deeper docs.

## Prereqs
- Node 18+ and npm
- MongoDB 7+ and Redis (local or container)
- Docker + Docker Compose (optional, recommended)

## Quick start (Node runtime)
```bash
# Backend
cd App/Backend
cp .env.example .env   # fill secrets
npm install
npm run dev            # http://localhost:3001/api/v1/health

# Frontend
cd ../Frontend
cp .env.example .env   # set VITE_API_URL=http://localhost:3001/api/v1
npm install
npm run dev            # http://localhost:3000
```

## Quick start (Docker Compose)
```bash
cd App
docker compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001/api/v1/health
```

## Fast sanity checks
- Health: `curl http://localhost:3001/api/v1/health`
- Metrics: `curl http://localhost:3001/metrics`
- Auth (if enabled): hit `/api/v1/auth/session` with a valid token
- Frontend smoke: open http://localhost:3000 and load projects/workflows list

## Common scripts
- Backend: `npm run test`, `npm run lint`, `npm run type-check`, `npm run build`
- Frontend: `npm run test`, `npm run test:e2e`, `npm run build`
- Docker images: built automatically in CI; local `docker build` in `App/Backend` or `App/Frontend`

## Where things live
- API + services: `App/Backend/src/modules/*`
- Workflows/AI: `App/Backend/src/services/workflow`, `App/Backend/src/modules/ai`
- Background jobs (Inngest): `App/Backend/src/infrastructure/queue/jobs`
- Frontend API layer: `App/Frontend/src/core/api`
- Frontend workflow UI: `App/Frontend/src/features/workflow-builder`

## Credentials & env
- Backend `.env`: Mongo, Redis, JWT, Supabase keys, Stripe, OpenAI/Anthropic, Pinecone, GCS.
- Frontend `.env`: `VITE_API_URL`, Supabase anon, Stripe publishable, Pinecone host/index.

## Support
- Debugging tips: `docs/development/debugging.md`
- Testing strategy: `docs/development/testing.md`
- Storage notes (Supabase + GCS): `docs/development/storage-hybrid.md`

