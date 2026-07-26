---
name: supabase-patterns
description: Build on Supabase correctly — Postgres with RLS-first migrations, Supabase Auth with @supabase/ssr in Next.js App Router, Storage, and the Supabase-hosted-Postgres-behind-Prisma pattern. Use for any task touching Supabase clients, RLS policies, SQL migrations, auth sessions/cookies, storage buckets, or connection poolers. Triggers on "Supabase", "RLS", "row level security", "supabase-js", "@supabase/ssr", "service role", "anon key", "storage bucket", "pooler", "pgbouncer", "supabase migration".
metadata:
  version: "1.0.0"
---

# Supabase Patterns (Softonoma stack)

Softonoma runs Supabase in two shapes — know which one you're in before writing code:

1. **Full Supabase** (portal style): supabase-js + Supabase Auth + RLS is the security
   model; the app talks to Postgres through the Supabase API/client.
2. **Supabase-as-hosted-Postgres** (Dental2You style): the app's ORM (Prisma) talks to
   the Supabase Postgres directly; auth is the app's own (JWT). Supabase provides the
   database, pooler, and Storage (S3-compatible API) — supabase-js may not appear at all.
   In this shape, RLS is NOT the enforcement layer; the API is. See `prisma-postgres`.

## Clients & keys (full-Supabase shape)

- **Next.js App Router**: use `@supabase/ssr`. Browser client via `createBrowserClient`,
  server client via `createServerClient` with cookie handlers; refresh sessions in
  `middleware.ts`. Never cache a server client across requests.
- **anon key** = public, RLS-constrained. **service_role key** = bypasses RLS — server
  only, never in `NEXT_PUBLIC_*`, never in client bundles, and every service-role code
  path must do its own authorization checks.
- Auth: gate pages/actions on `supabase.auth.getUser()` (validates the JWT server-side),
  not `getSession()` alone, for trust decisions.

## RLS-first migrations (non-negotiable in full-Supabase)

- **Every new table gets RLS enabled + its policies in the same migration.** A table
  without policies is either wide open (RLS off) or bricked (RLS on, no policies) —
  both are bugs.
- Migrations are ordered SQL files (`supabase/migrations/NNNN_name.sql`) applied to the
  cloud DB via the project's migrate script — never edit an applied migration; write a
  new one. Update the schema index (`.claude/database/database.md`) in the same change.
- Policy hygiene: separate policies per operation (`select`/`insert`/`update`/`delete`);
  write them against `auth.uid()`/JWT claims; prefer security-definer helper functions
  for role checks so policies stay readable; test with the project's RLS test suite
  (portal: `npm run test:rls`).
- Defense in depth for sensitive columns (salary, CNIC, bank details): split into a
  private table (e.g. `employee_private`) with stricter policies + middleware + UI
  gating — RLS is the floor, not the whole strategy.

## Storage

- Buckets are provisioned by script/migration (not clicked together); public buckets
  only for genuinely public assets. Access files through signed URLs or storage
  policies mirroring the table RLS.
- S3-compatible API (Dental2You): credentials in `.env` only; uploads go through the
  backend so org-scoping/authorization applies — never presign from the client without
  an authorization check.

## Connections & poolers (both shapes)

- Serverless/Vercel: use the **transaction pooler** (port 6543) connection string for
  the app; the **session pooler**/direct (5432) for migrations and long-lived tools.
  With Prisma: `DATABASE_URL` → pooled (+ `pgbouncer=true`), `DIRECT_URL` → direct for
  `prisma migrate`.
- Never expose the database password in client-side env vars; keep `.env` hook-blocked.

## Checklist

- [ ] Correct shape identified (full Supabase vs hosted-Postgres-behind-ORM)?
- [ ] New tables: RLS enabled + per-operation policies in the same migration?
- [ ] No service_role/database credentials reachable from the client?
- [ ] Trust decisions on `getUser()` (or app JWT verify), not decoded/unverified data?
- [ ] Pooled vs direct connection strings used in the right places?
- [ ] Schema index + KB updated in the same change?
