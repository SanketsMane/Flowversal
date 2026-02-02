# API Quickstart & Reference Pointers (Phase 7)

This doc orients engineers to the REST/WebSocket surface and how to explore it quickly. Backend stack: Fastify, Supabase Auth, MongoDB, Redis cache, Pinecone (RAG), Inngest (jobs), LangChain/LangGraph (AI/workflows).

## Base URL
- Local dev: `http://localhost:3001/api/v1`
- Compose: `http://localhost:3001/api/v1`
- Frontend dev proxies via `VITE_API_URL` (default `/api/v1`)

## Health & metrics
- `GET /api/v1/health` – readiness summary (services: mongo, redis, pinecone, supabase)
- `GET /metrics` – Prometheus metrics (protected by network boundary)

## Auth
- Supabase JWT bearer: `Authorization: Bearer <token>`
- Optional x-api-key plugin for trusted services: `x-api-key: <key>` (see env allowlist)
- MFA routes: `/api/v1/auth/mfa/*`

## Workflows
- `GET /workflows` – list
- `POST /workflows` – create
- `PUT /workflows/:id` – update
- `DELETE /workflows/:id` – delete
- `POST /workflows/:id/execute` – start execution (enqueue via Inngest when enabled)
- `POST /workflows/:id/stop` – stop
- `GET /workflows/:id/executions` – paginated executions
- `GET /workflows/executions/:executionId` – execution status
- WebSocket updates: `/api/v1/workflows/stream/:executionId`

## AI & RAG
- `POST /ai/chat` – routed via LangChain/model router
- `POST /ai/generate-workflow` – AI workflow generator
- RAG uses Pinecone; configure keys + host/index in env.

## Projects/Tasks (sample feature)
- `GET /projects`, `POST /projects`
- `GET /projects/boards`, `GET /projects/tasks`

## Subscriptions/Billing
- `POST /subscriptions/create-checkout`
- `POST /subscriptions/portal`
- `GET /subscriptions/status`
- Stripe webhook: `/subscriptions/webhook` (configure secret)

## OpenAPI / Swagger
- Swagger UI: `http://localhost:3001/docs`
- JSON: `http://localhost:3001/docs/json`
- Spec source: Fastify swagger registration in `App/Backend/src/server.ts`

## Curl smoke examples
```bash
curl http://localhost:3001/api/v1/health

curl -X POST http://localhost:3001/api/v1/workflows/<id>/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"input": {"foo": "bar"}}'

curl http://localhost:3001/api/v1/workflows/executions/<executionId> \
  -H "Authorization: Bearer $TOKEN"
```

## Environment knobs (backend)
- `USE_INNGEST_FOR_EXECUTIONS=true` to queue executions
- `REDIS_URL` to enable cache + rate-limit store
- `API_KEY_ALLOWLIST` for `x-api-key` auth
- `MFA_ENFORCED=true` to require MFA
- `CACHE_MAX_AGE` / `CACHE_STALE_WHILE_REVALIDATE` for cache headers

## Tracing & metrics
- Prometheus metrics: `src/core/monitoring/metrics.plugin.ts`
- Structured logs: `src/shared/utils/logger.util.ts`
- Audit logs: `src/shared/utils/audit.util.ts`

