# Cloud PMS — Multi-tenant Hotel & Property Management System

A modern, cloud-native **Property Management System (PMS)** for hotels, apartments,
vacation rentals and resorts — delivered as a **multi-tenant SaaS** so a single
deployment serves many independent businesses, each with isolated data.

Built from a detailed technical specification covering reservations, self
check‑in, smart‑lock integration, housekeeping, payments, channel manager (OTA)
and real‑time analytics.

> **Status:** production‑grade foundation, fully runnable and deployable.
> Backend core + marketing landing + operations dashboard are implemented and
> verified end‑to‑end. External integrations (OTAs, smart locks, payment PSPs,
> SMS/email) ship as clean **ports with mock adapters** ready to swap for real
> providers.

---

## ✨ Highlights

- **True multi‑tenancy** — every business is an isolated *tenant*. Data is scoped
  automatically by a Prisma client extension (defense‑in‑depth) plus optional
  PostgreSQL Row‑Level Security.
- **Reservations engine** — availability checking (no double‑booking), booking,
  modification, cancellation, **check‑in / check‑out**, automatic folio creation.
- **Front desk** — room rack, arrivals/departures, walk‑ins, guest CRM.
- **Housekeeping** — task assignment, status workflow, supervisor inspection,
  real‑time updates over WebSockets.
- **Finance** — folios, line‑item charges, payments & refunds via a swappable
  payment gateway (Stripe / Adyen / QPay adapters).
- **Analytics** — live **Occupancy, ADR, RevPAR**, revenue by day & channel.
- **Security** — JWT access/refresh, **RBAC** (9 roles), AES‑256‑GCM PII
  encryption, Helmet, rate limiting, validation, audit‑ready structure.
- **Self‑service onboarding** — sign up → a new tenant, owner account and first
  property are provisioned in one transaction with a 14‑day trial.

---

## 🏗 Architecture

A **modular monolith** whose module boundaries deliberately mirror the
microservices in the specification (`auth`, `reservations`, `rooms`, `guests`,
`housekeeping`, `finance`, `channels`, `locks`, `notifications`, `analytics`).
This is the pragmatic "monolith‑first" approach: it runs and deploys as one unit
today, while keeping a clean extraction path to independent services later
(each NestJS module ↔ one service).

```
┌───────────────┐     ┌────────────────────────────────────────┐
│   Next.js Web │     │            NestJS API (core)           │
│  Landing +    │────▶│  Auth · Tenancy · Reservations · Rooms │
│  Dashboard    │ JWT │  Guests · Housekeeping · Finance ·      │
│  (React/TW)   │◀────│  Analytics · Channels · Locks · Notify  │
└───────────────┘     └───────────────┬────────────────────────┘
                                       │
                  ┌────────────────────┼────────────────────┐
                  ▼                    ▼                     ▼
            PostgreSQL 16          Redis 7            Integration ports
          (multi‑tenant data)  (tokens/cache)   (OTA · locks · PSP · email)
```

| Layer        | Technology |
|--------------|------------|
| Frontend     | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend      | NestJS 10, TypeScript, Prisma ORM |
| Database     | PostgreSQL 16 (multi‑tenant), Redis 7 |
| Auth         | JWT (access + refresh), Passport, RBAC |
| Realtime     | Socket.IO (WebSocket gateway) |
| Docs         | OpenAPI / Swagger (`/api/docs`) |
| Infra        | Docker, docker‑compose, GitHub Actions CI |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design and
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for deployment options.

---

## 🚀 Quick start (Docker — one command)

```bash
cp .env.example .env            # edit secrets for anything public-facing
SEED_ON_START=true docker compose up -d --build
```

- Web app:      http://localhost:3000
- API:          http://localhost:4000
- API docs:     http://localhost:4000/api/docs
- Health:       http://localhost:4000/health

`SEED_ON_START=true` loads two demo businesses on first boot. Set it back to
`false` afterwards.

### Demo logins (password: `Passw0rd!`)

| Business           | Email                          | Role        |
|--------------------|--------------------------------|-------------|
| Grand Aurora Hotel | `owner@demo.cloudpms.app`      | Owner       |
| Grand Aurora Hotel | `frontdesk@demo.cloudpms.app`  | Front Desk  |
| Seaside Inn        | `owner@seaside.cloudpms.app`   | Owner       |

The two tenants prove isolation — neither can see the other's data.

---

## 🧑‍💻 Local development (without Docker)

Requires Node 20+, a PostgreSQL 16 instance and Redis.

```bash
# 1) API
cd apps/api
cp .env.example .env             # point DATABASE_URL / REDIS_URL at your services
npm install
npx prisma migrate dev           # create schema
npm run prisma:seed              # load demo data
npm run start:dev                # http://localhost:4000

# 2) Web (second terminal)
cd apps/web
cp .env.example .env.local
npm install
npm run dev                      # http://localhost:3000
```

---

## 📁 Project structure

```
HOTEL_PMS/
├── apps/
│   ├── api/                  # NestJS backend (the "core system")
│   │   ├── prisma/           # schema, migrations, seed
│   │   └── src/
│   │       ├── common/       # prisma, tenancy, crypto, guards, filters
│   │       ├── modules/      # auth, reservations, rooms, guests, ...
│   │       └── main.ts
│   └── web/                  # Next.js frontend (landing + dashboard)
│       └── src/{app,components,lib}
├── docs/                     # architecture & deployment docs
├── docker-compose.yml        # full stack
└── .github/workflows/ci.yml  # CI: build, lint, docker
```

---

## 🔐 Multi-tenancy in one minute

- A **Tenant** is a business/customer. It has a subscription, users, and one or
  more **Properties**.
- Every domain row carries a `tenantId`. The authenticated user's tenant is read
  from the JWT and stored in an `AsyncLocalStorage` context per request.
- A **Prisma client extension** automatically injects `tenantId` into queries, so
  cross‑tenant reads are impossible even if a query forgets to filter.
- An optional PostgreSQL **Row‑Level Security** script is provided for an extra
  database‑enforced layer (`apps/api/prisma/rls.optional.sql`).

---

## 🧩 Integration points (swap mock → real)

| Capability   | Port (interface)        | Mock adapter | Real options |
|--------------|-------------------------|--------------|--------------|
| Payments     | `PaymentGatewayService` | ✅           | Stripe, Adyen, QPay |
| Smart locks  | `LockAdapter`           | ✅           | Salto, VingCard, Dormakaba, Nuki, Igloohome, Kisi |
| OTA channels | `ChannelAdapter`        | ✅           | Booking.com, Airbnb, Expedia, SiteMinder |
| Notifications| `NotificationAdapter`   | ✅           | SendGrid, Twilio |

Each adapter is wired via a DI token, so going live is a one‑line provider swap.

---

## 📜 License

UNLICENSED — proprietary template. © 2026 Cloud PMS.
