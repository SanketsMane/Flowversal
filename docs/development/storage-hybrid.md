# Hybrid Storage: Supabase Auth + Google Cloud Storage (GCS)

## Goals
- Keep Supabase for authentication and metadata.
- Store large objects in GCS via signed URLs.
- Enforce per-user access and short-lived URLs.

## Backend
- Env vars:
  - `GCS_BUCKET`, `GCS_PROJECT_ID`, `GCS_CLIENT_EMAIL`, `GCS_PRIVATE_KEY` (escape newlines).
- Routes (auth required):
  - `POST /api/v1/storage/sign-upload` -> `{ uploadUrl, objectKey }`
  - `GET /api/v1/storage/sign-download?objectKey=...` -> `{ downloadUrl }`
- Object keys are user-prefixed (`userId/...`) to enforce ownership.
- TTL default: 15 minutes (configurable per request).

## Frontend Flow
1) Request upload URL; receive `uploadUrl` and `objectKey`.
2) PUT file directly to GCS using the signed URL (set `Content-Type`).
3) Persist metadata (path, size, checksum) via your API if needed.
4) For downloads, request signed download URL; browser fetches directly from GCS.

## Security
- Buckets remain private; only signed URLs are used.
- Validate file type/size before signing; short TTLs.
- Enforce that download objectKey starts with the requester’s userId prefix.

## Performance & Cost
- Use regional bucket near your backend.
- For very large uploads, use resumable uploads (GCS supports it with signed URLs).
- Apply lifecycle rules (e.g., transition cold data to cheaper classes).

## Migration Notes
- Existing Supabase Storage can coexist; use GCS for large/bulk assets.
- Keep Supabase Auth; store pointers/metadata in your DB or Supabase tables.

