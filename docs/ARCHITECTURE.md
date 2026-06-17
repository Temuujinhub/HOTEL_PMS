# Architecture

Cloud PMS is a multi-tenant SaaS for hospitality. This document explains the
design decisions, the domain model, and how the system maps to the original
microservice specification.

## 1. Design philosophy: modular monolith → microservices

The specification describes ~12 microservices (auth, reservation, room, guest,
checkin, housekeeping, finance, channel, notification, lock, analytics, pos).

We implement these as **modules inside one NestJS application** (a *modular
monolith*). Each module owns its controllers, services and DTOs and is
internally cohesive. This gives us:

- **One deployable unit** that runs and scales today (no service mesh, no
  cross‑service network latency, atomic transactions across aggregates).
- **A clean extraction path**: because module boundaries already match the
  service boundaries, any module can be lifted into its own service when scale
  demands it (e.g. move `channels` or `analytics` out first).

This is the widely recommended "monolith‑first" strategy — it avoids premature
distributed‑systems complexity while preserving the target architecture's intent.

## 2. Request lifecycle

```
HTTP → Helmet → CORS → ThrottlerGuard → (CLS middleware sets request store)
     → JwtAuthGuard (validates token, binds tenant context) → RolesGuard
     → ValidationPipe (DTO validation) → Controller → Service
     → Prisma (tenant‑scoped) / Redis → Response
errors → AllExceptionsFilter (uniform JSON envelope, Prisma error mapping)
```

## 3. Multi-tenancy

Three complementary layers:

1. **JWT claim** — the access token carries `tenantId`, `role`, `propertyId`.
2. **Tenant context** — `JwtStrategy.validate` writes the principal into an
   `AsyncLocalStorage` store (via `nestjs-cls`), available everywhere in the
   request without parameter threading.
3. **Automatic query scoping** — `PrismaService.scoped` is the client extended
   with a `tenantGuard` that injects `tenantId` into `where` clauses (reads,
   updates, deletes, counts, aggregates) and into `data` on creates. Forgetting
   to filter by tenant therefore cannot leak data.

> Unique‑key operations (`findUnique`/`update`/`delete`) are intentionally not
> auto‑scoped because their `where` accepts only unique fields. Services first
> fetch via `findFirst` (scoped) to verify ownership, then operate by id.

**Optional database enforcement:** `apps/api/prisma/rls.optional.sql` enables
PostgreSQL Row‑Level Security so isolation is also enforced at the database. It
requires the app to `SET app.current_tenant_id` per connection — see the file's
header for the trade‑offs (connection pooling, the existing app‑layer guard is
sufficient for most deployments).

## 4. Domain model

```
Tenant 1───1 Subscription
  │
  ├──* User            (staff; role ∈ RBAC)
  └──* Property
         ├──* RoomType ──* Room
         ├──* RatePlan
         ├──* Guest
         └──* Reservation 1──1 Folio ──* FolioItem
                   │                 └──* Payment
                   └──* HousekeepingTask
```

Key tables (see `apps/api/prisma/schema.prisma`):

- **Reservation** — dates, status machine (`PENDING → CONFIRMED → CHECKED_IN →
  CHECKED_OUT`, plus `CANCELLED`/`NO_SHOW`), channel, amounts.
- **Folio / FolioItem / Payment** — normalized billing. A folio is created with
  the room charge when a reservation is made; totals are recomputed from items
  and payments.
- **HousekeepingTask** — created automatically on check‑out; status workflow with
  supervisor inspection.

## 5. Security

| Concern | Implementation |
|---------|----------------|
| AuthN | JWT access (15 min) + refresh (7 d); refresh tokens tracked in Redis for revocation/rotation |
| AuthZ | `RolesGuard` + `@Roles()`; 9 roles; OWNER/SUPER_ADMIN bypass |
| PII | Passport numbers encrypted with AES‑256‑GCM (`CryptoService`), returned masked |
| Transport | Helmet headers; TLS terminated at the proxy/load balancer |
| Cards | Never stored — tokenized by the PSP; only gateway ref + last4 persisted |
| Abuse | `ThrottlerGuard` rate limiting; `class-validator` whitelisting |
| Errors | Uniform filter; Prisma errors mapped (P2002→409, P2025→404, …) |

## 6. Real-time

`HousekeepingGateway` (Socket.IO, namespace `/realtime`) broadcasts
`housekeeping.task.updated` events so dashboards and the housekeeping app update
live. The same gateway pattern extends to room‑status and reservation events.

## 7. Integration ports (hexagonal)

External systems sit behind interfaces with mock adapters wired via DI tokens:

- `PaymentGatewayService` — Stripe / Adyen / QPay
- `LockAdapter` — Salto, VingCard, Dormakaba, Nuki, Igloohome, Kisi
- `ChannelAdapter` — Booking.com, Airbnb, Expedia, SiteMinder (2‑way sync)
- `NotificationAdapter` — SendGrid (email) + Twilio (SMS)

Going live means implementing the interface for the real provider and swapping
the `useClass` binding — no changes to business logic.

## 8. Frontend

Next.js 14 App Router. The marketing **landing page** is statically rendered;
the **dashboard** (`/app/**`) is a client‑rendered authenticated app that talks
to the API via a small typed client (`src/lib/api.ts`) with transparent token
refresh. A `DashboardShell` provides navigation, the active‑property selector and
the auth guard.
