---
name: better-auth-security
description: Harden a Better Auth deployment — secret management, rate limiting, CSRF protection, trusted origins, session/cookie security, and OAuth token encryption. Use when securing an auth setup, reviewing auth code, preventing brute force, or hardening before a PR.
---
<!-- Softonoma distillation of better-auth/skills `security` (no upstream LICENSE — original text, not vendored). Authoritative source: https://better-auth.com/docs — synced 2026-07-17. -->

# Better Auth — Security Hardening (Softonoma stack)

Checklist for locking down Better Auth on **Next.js/Vercel + MongoDB + Redis**.
Use during implementation and as a security-review gate. Verify against the live
docs: **https://better-auth.com/docs**.

## Secret management
- Resolution order: `options.secret` → `BETTER_AUTH_SECRET` → `AUTH_SECRET`.
- Better Auth **rejects default/placeholder secrets in production** and warns if
  the secret is under 32 chars / ~120 bits entropy. Generate with
  `openssl rand -base64 32`. Never commit secrets; set them in Vercel env per
  environment.

## Rate limiting
- Enabled in production by default (`window: 10s`, `max: 100`) across all endpoints.
- **Storage on Softonoma = Redis** (`storage: "secondary-storage"`). Avoid `"memory"`
  on Vercel — it resets per invocation and gives no real protection. `"database"`
  is the persistent fallback.
- Sensitive endpoints (`/sign-in`, `/sign-up`, `/change-password`, `/change-email`)
  default to ~3 req / 10s. Tighten further via `rateLimit.customRules`, e.g.
  `"/api/auth/sign-in/email": { window: 60, max: 5 }`.

## CSRF protection
- Multi-layer: origin-header validation + Fetch Metadata + first-login protection.
- Keep `advanced.disableCSRFCheck: false` and `advanced.disableOriginCheck: false`.
  Disabling either is a **security finding** unless an alternative CSRF mechanism is
  documented.

## Trusted origins
- `baseURL`'s origin is trusted automatically. Add app/admin origins via
  `trustedOrigins` (array, wildcard like `*.example.com`, or an async function for
  multi-tenant). Also settable via `BETTER_AUTH_TRUSTED_ORIGINS`.
- Better Auth validates `callbackURL`, `redirectTo`, `errorCallbackURL`,
  `newUserCallbackURL`, and `origin` against this list — mismatches get 403. Keep
  the list tight; no `*` in production for redirect targets.

## Session & cookie security
- `session.expiresIn` (default 7d), `session.updateAge` (default 24h). Bump
  `cookieCache.version` to invalidate all sessions on demand.
- Cookie defaults: `secure: true`, `sameSite: "lax"`, `httpOnly: true`, `path: "/"`,
  `__Secure-` prefix. For high-sensitivity apps set `defaultCookieAttributes.sameSite:
  "strict"` and consider scoping `path`.
- Use `useSecureCookies: true` in production. When the session carries sensitive
  data, use the `jwe` (encrypted) cookie-cache strategy.

## OAuth & IP
- Encrypt stored OAuth tokens; behind Vercel/proxies set
  `advanced.ipAddress.ipAddressHeaders` so rate limiting and audit logs see the
  real client IP, not the proxy.

## Softonoma review gate
Before any auth/payments PR, confirm: strong secret set in Vercel env, Redis-backed
rate limiting, CSRF + origin checks on, tight `trustedOrigins`, secure cookies, and
2FA on money/admin paths (`better-auth-two-factor`). Pairs with **security-audit**,
**sentry-security-review**, and **pci-compliance**.

## Related skills
- **better-auth-best-practices**, **better-auth-two-factor**, **redis-security**.
