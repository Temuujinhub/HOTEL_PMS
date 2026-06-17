# Deployment

## Option A — Docker Compose (simplest)

Suitable for a single VM (e.g. a 2 vCPU / 4 GB cloud instance).

```bash
git clone <repo> && cd HOTEL_PMS
cp .env.example .env
# Edit .env: set strong JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY,
# POSTGRES_PASSWORD, CORS_ORIGINS and NEXT_PUBLIC_API_URL (your public API URL).
SEED_ON_START=true docker compose up -d --build   # first boot only
```

The API container runs `prisma migrate deploy` automatically on start, then the
app. Put a TLS‑terminating reverse proxy (Caddy / Nginx / Traefik) in front of
ports 3000 (web) and 4000 (api).

> **Important:** `NEXT_PUBLIC_API_URL` is baked into the web bundle at *build*
> time. To point the browser at your real API domain, rebuild the web image with
> `--build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com` (compose reads it
> from `.env`).

### Production secrets checklist
- [ ] `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — long random strings
- [ ] `ENCRYPTION_KEY` — 32+ chars (rotating it invalidates stored PII ciphertext)
- [ ] `POSTGRES_PASSWORD` — strong
- [ ] `CORS_ORIGINS` — your web origin(s)
- [ ] `SEED_ON_START=false` after first boot

## Option B — Managed platform

- **Database:** managed PostgreSQL 16 (RDS, Cloud SQL, Neon, Supabase). Set
  `DATABASE_URL`.
- **Cache:** managed Redis (ElastiCache, Upstash). Set `REDIS_URL`.
- **API:** deploy the `apps/api` image to any container host (ECS/Fargate, Cloud
  Run, Fly.io, Railway, Render). Run `prisma migrate deploy` on release (the
  bundled entrypoint already does this).
- **Web:** deploy `apps/web` to Vercel (native Next.js) or as the container image
  to the same host. Set `NEXT_PUBLIC_API_URL` at build time.

## Option C — Kubernetes

The spec targets Kubernetes (EKS). The provided Docker images are
K8s‑ready (stateless API and web, health endpoints at `/health` and
`/health/live`). A typical layout:

- `Deployment` + `Service` + `HPA` for `api` and `web`
- `Secret` for env vars, `ConfigMap` for non‑secret config
- managed Postgres + Redis (or operators)
- Ingress with TLS
- run `prisma migrate deploy` as a `Job`/init container per release

## Scaling notes

- The API is stateless (sessions live in Redis) → scale horizontally behind a
  load balancer.
- Postgres is the primary scaling concern: use a read replica for analytics, and
  connection pooling (PgBouncer) under high concurrency.
- When a module becomes a hotspot (e.g. `channels` doing OTA sync, or
  `analytics`), extract it into its own service — the module boundary already
  isolates it.

## Backups & DR

- Daily automated Postgres backups, 30‑day retention (per spec).
- Multi‑AZ database for HA; target RTO < 1 h, RPO < 15 min.

## Health & observability

- Liveness: `GET /health/live`  ·  Readiness (DB): `GET /health`
- Structured JSON logs (pino) — ship to your log stack.
- Add Sentry/Prometheus/Grafana as described in the spec for production.
