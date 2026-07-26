---
name: better-auth-create-auth
description: Scaffold authentication in a Next.js (App Router) app with Better Auth — detect framework/DB, create the server config and route handler, wire the React client, add OAuth providers, and generate auth UI. Use when adding login, sign-up, sessions, or social auth to an Softonoma project.
---
<!-- Softonoma distillation of better-auth/skills `create-auth` (no upstream LICENSE — original text, not vendored). Authoritative source: https://better-auth.com/docs — synced 2026-07-17. -->

# Create Auth (Better Auth × Softonoma stack)

Adds authentication to a Next.js App Router project using **Better Auth**.
Softonoma stack defaults: **Next.js on Vercel, MongoDB, Redis**. Always confirm code
against the live docs — the API moves: **https://better-auth.com/docs**.

## Phase 1 — Plan before writing code (required)

1. **Scan the repo** to auto-fill defaults; only ask what you can't detect:
   - Framework: `next.config.*` → Next.js App Router (assume App Router on Softonoma).
   - DB/ORM: `mongodb`/`mongoose` in `package.json` → use the **MongoDB adapter**
     (`better-auth/adapters/mongodb`). Softonoma is Mongo-first; do not introduce
     Prisma/Drizzle unless the project already uses them.
   - Existing auth: look for `next-auth`, `lucia`, `clerk`, `@supabase/auth` — if
     present, this is a **migration**, not a greenfield add.
   - Package manager: lockfile (`pnpm-lock.yaml` / `package-lock.json` / …).
2. **Ask the user** (batch the questions) only for genuinely open choices:
   sign-in methods (email+password / social / magic link / passkey), which social
   providers, whether email verification is required, email sender (Resend vs a
   mock during dev), extra plugins (2FA, organizations, admin, API keys, password
   reset), and which auth pages + visual style.
3. **Summarize the plan as a checklist** and get explicit sign-off before Phase 2.

## Phase 2 — Implementation (Softonoma layout)

1. `npm install better-auth` (+ any scoped plugin packages).
2. Env: `BETTER_AUTH_SECRET` (min 32 chars — `openssl rand -base64 32`) and
   `BETTER_AUTH_URL`. Server-side only; never expose to the client. On Vercel,
   set them per-environment (Preview/Production).
3. `lib/auth.ts` — server config with the MongoDB adapter, chosen
   `emailAndPassword`/`socialProviders`, and plugins.
4. `lib/auth-client.ts` — `createAuthClient` from `better-auth/react` with the
   matching client plugins.
5. Route handler at `app/api/auth/[...all]/route.ts` mounting the handler.
6. Run the CLI to create/upgrade the schema
   (`npx @better-auth/cli@latest migrate` for the built-in/Mongo adapter;
   `generate` for Prisma/Drizzle). **Re-run whenever you add or change a plugin.**
7. Verify: `GET /api/auth/ok` returns `{ status: "ok" }`.
8. Build the sign-in / sign-up (and password-reset / verification) pages.

## Softonoma-specific rules

- Secrets and all Better Auth server calls live in server code only.
- Prefer **Redis as `secondaryStorage`** (see `better-auth-best-practices` and
  `better-auth-security`) so sessions and rate-limit counters survive Vercel's
  serverless model — `"memory"` storage does not.
- Sensitive flows (payments/PII) → also apply `better-auth-two-factor` and run the
  `better-auth-security` hardening checklist before PR.

## Related skills
- **better-auth-best-practices** — config, adapters, sessions, plugins, gotchas.
- **better-auth-two-factor** — TOTP / OTP / backup codes.
- **better-auth-security** — secrets, rate limiting, CSRF, trusted origins, cookies.
