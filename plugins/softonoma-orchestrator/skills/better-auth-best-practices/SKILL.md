---
name: better-auth-best-practices
description: Configure Better Auth correctly on the Softonoma stack — server/client setup, MongoDB adapter, Redis secondary storage, sessions, cookie cache, email flows, hooks, and plugins. Use when working in auth.ts/auth-client.ts, wiring sessions, or debugging a Better Auth config.
---
<!-- Softonoma distillation of better-auth/skills `best-practices` (no upstream LICENSE — original text, not vendored). Authoritative source: https://better-auth.com/docs/reference/options — synced 2026-07-17. -->

# Better Auth — Best Practices (Softonoma stack)

Configuration reference for Better Auth on **Next.js App Router + MongoDB + Redis**.
Always cross-check the live options reference: **https://better-auth.com/docs/reference/options**.

## Setup workflow
1. `npm install better-auth`.
2. Env: `BETTER_AUTH_SECRET` (≥32 chars) + `BETTER_AUTH_URL`. Only set `secret`/
   `baseURL` in config if the env vars are absent.
3. Create `auth.ts` (server) with database + config. The CLI looks for it in
   `./`, `./lib`, `./utils`, or under `./src` (`--config` for a custom path).
4. Mount the route handler at `app/api/auth/[...all]/route.ts`.
5. Generate/apply schema: `npx @better-auth/cli@latest migrate` (built-in/Mongo
   adapter) or `generate` for Prisma/Drizzle. **Re-run after every plugin change.**
6. Verify: `GET /api/auth/ok` → `{ status: "ok" }`.

## Core config options
- `database` — required for most features. On Softonoma use
  `better-auth/adapters/mongodb`. **Config uses the adapter *model* name, not the
  DB table/collection name.**
- `secondaryStorage` — **use Redis here** on Softonoma. When set, sessions and
  rate-limit counters live in Redis, not the DB (see below).
- `emailAndPassword: { enabled: true }`, `socialProviders: { google: {...} }`.
- `plugins` — array (import from dedicated paths for tree-shaking, e.g.
  `better-auth/plugins/two-factor`, **not** `better-auth/plugins`).
- `trustedOrigins` — CSRF allowlist (see `better-auth-security`).
- `basePath` — default `/api/auth`.

## Sessions
Storage priority: (1) if `secondaryStorage` is defined, sessions go there;
(2) set `session.storeSessionInDatabase: true` to also persist to the DB;
(3) no DB + `cookieCache` → fully stateless.
Key knobs: `session.expiresIn` (default 7d), `session.updateAge` (refresh
interval), `session.cookieCache.maxAge`, and `session.cookieCache.version`
(bump to invalidate all sessions).

Cookie-cache strategies: `compact` (default, Base64url+HMAC, smallest),
`jwt` (signed, readable), `jwe` (encrypted — use when the session holds sensitive
data). **Custom session fields are NOT cached and are always re-fetched.**

## User & account
`user.additionalFields`, `user.changeEmail.enabled` (off by default),
`user.deleteUser.enabled` (off by default). `email` and `name` are required at
registration. `account.accountLinking.enabled` for linking OAuth accounts.

## Email flows
Define `emailVerification.sendVerificationEmail` (required for verification to
work), `emailVerification.sendOnSignUp`/`sendOnSignIn`, and
`emailAndPassword.sendResetPassword`. On Softonoma, route these through the existing
email provider (WebEngage/Resend) inside server code.

## Hooks
- Endpoint hooks: `hooks.before` / `hooks.after` — arrays of `{ matcher, handler }`
  via `createAuthMiddleware`; read `ctx.path`, `ctx.context.session`.
- Database hooks: `databaseHooks.user.create.before/after` (same for `session`,
  `account`) for defaults and post-create side effects.

## Client
Import from `better-auth/react` on Softonoma. Methods: `signUp.email()`,
`signIn.email()`, `signIn.social()`, `signOut()`, `useSession()`, `getSession()`,
`revokeSession()`, `revokeSessions()`. Client plugins go in
`createAuthClient({ plugins: [...] })`.

## Type safety
Infer with `typeof auth.$Infer.Session` / `.user`. For a separate client project,
`createAuthClient<typeof auth>()`.

## Common gotchas
1. Config uses the ORM **model** name, not the DB collection/table name.
2. Re-run the CLI after adding/changing plugins.
3. With `secondaryStorage` set, sessions default to Redis, not the DB.
4. Custom session fields aren't cached — always re-fetched.
5. No DB = session lives only in the cookie; logout on cache expiry.
6. Change-email sends to the current address first, then the new one.

## Related skills
- **better-auth-create-auth** — scaffolding workflow.
- **better-auth-security** — hardening (rate limit, CSRF, trusted origins, cookies).
- **better-auth-two-factor** — MFA. **redis-connections** — serverless Redis wiring.
