---
name: prisma-postgres
description: Prisma ORM on Postgres the Softonoma way — multifile schema organization, migration discipline, query scoping for multi-tenant data, DTO/where-clause parity in NestJS, and pooled connections (Supabase/pgbouncer). Use for any task touching schema.prisma files, prisma migrate, Prisma Client queries, or NestJS + Prisma services. Triggers on "Prisma", "prisma migrate", "schema.prisma", "multifile schema", "Prisma Client", "P2002", "findMany", "transaction", "tenant scoping", "DIRECT_URL".
metadata:
  version: "1.0.0"
---

# Prisma + Postgres (Softonoma stack)

Grounded in the Dental2You backend (NestJS 10 + Fastify + Prisma 6, multifile schema,
Supabase-hosted Postgres). Adapt names to the project at hand.

## Schema organization

- **Multifile schema**: one domain per file under `prisma/schema/` (e.g. `user.prisma`,
  `centre.prisma`, `payments.prisma`). New models go in the right domain file — or a new
  file — never appended to an unrelated one.
- Every schema change ships as **one change**: migration + access-control scope on the
  new data + `.claude/database/database.md` index update (+ seed update if needed).
- Conventions: snake_case table names via `@@map` if the codebase does so; explicit
  `@relation` names on multiple relations between the same models; `@updatedAt` and
  `createdAt` on mutable business tables; enums over free-text status strings.

## Migration discipline

- `prisma migrate dev` locally to generate; commit the generated SQL; review it —
  especially destructive statements (column drops, type changes) which need an explicit
  backfill/rollout note in the plan.
- Never edit an applied migration; write a follow-up. Never `db push` against shared or
  production databases — `db push` is for throwaway local prototyping only.
- On Supabase/pgbouncer: `DATABASE_URL` = transaction pooler (+`pgbouncer=true`) for the
  app, `DIRECT_URL` = direct/session connection for `migrate` and `studio`.
- `prisma generate` runs before dev/build (wire it into the npm scripts).

## Query rules (multi-tenant / NestJS)

- **Tenant scope on every query.** If data is partitioned (by organization, clinic,
  user), every `findMany`/`findFirst`/`update`/`delete` carries the scope in `where` —
  taken from the authenticated caller, never from request input. Prisma has no RLS
  safety net here; the service layer IS the enforcement layer. Consider a scoped
  Prisma client extension/helper so it can't be forgotten.
- **DTO ↔ where parity** (NestJS with `forbidNonWhitelisted`): a new filterable query
  param is added to the `*QueryDto` AND the `where` builder in the same change, or the
  request 400s / the filter silently no-ops.
- Use `select`/`include` deliberately — never return whole rows with sensitive columns
  to list endpoints; paginate (`take`/`skip` or cursor) every unbounded list.
- Multi-step writes that must be atomic (e.g. payment + status event row) go in
  `prisma.$transaction`; idempotency keys are checked inside the transaction.
- Map known error codes (`P2002` unique, `P2025` not found) to proper HTTP errors
  instead of leaking 500s.

## Checklist

- [ ] Model in the right schema file; migration generated, reviewed, committed?
- [ ] Access scope + `database.md` updated in the same change?
- [ ] Every query tenant-scoped from the caller's auth context?
- [ ] DTO and `where` updated together; lists paginated; sensitive columns excluded?
- [ ] Atomic flows in transactions; Prisma error codes handled?
- [ ] Pooled vs direct URLs correct for app vs migrations?
