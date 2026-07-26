---
name: better-auth-two-factor
description: Add two-factor auth with Better Auth's twoFactor plugin — TOTP authenticator apps, email/SMS OTP, backup codes, and trusted devices. Use when a feature needs MFA/2FA, authenticator setup, or step-up login security, especially on payment/PII flows.
---
<!-- Softonoma distillation of better-auth/skills `twoFactor` (no upstream LICENSE — original text, not vendored). Authoritative source: https://better-auth.com/docs — synced 2026-07-17. -->

# Better Auth — Two-Factor Authentication (Softonoma stack)

Enable MFA on Next.js App Router with the `twoFactor` plugin. On Softonoma, treat 2FA
as **mandatory for admin, payment, and PII-touching flows**. Verify APIs against
the live docs: **https://better-auth.com/docs**.

## Setup
1. Add `twoFactor({ issuer: "Softonoma" })` to the server config plugins.
2. Add `twoFactorClient({ onTwoFactorRedirect() { … } })` to the client config.
3. Run `npx @better-auth/cli@latest migrate` (built-in/Mongo adapter) — or
   generate + push for Drizzle/Prisma.
4. Verify the `twoFactorSecret` column/field exists on the user model.

## Enabling 2FA for a user
`authClient.twoFactor.enable({ password })` requires password re-entry and returns
`data.totpURI` (render as a QR code) and `data.backupCodes` (show once, store
securely). **`twoFactorEnabled` flips to true only after the first successful TOTP
verification** — don't set `skipVerificationOnEnable: true` in production.

## TOTP (authenticator app)
- Render `totpURI` as a QR (e.g. `react-qr-code`).
- Verify with `authClient.twoFactor.verifyTotp({ code, trustDevice: true })`
  (accepts codes ±1 period).
- `totpOptions: { digits: 6, period: 30 }` (defaults).

## OTP (email / SMS)
Configure delivery via `twoFactor({ otpOptions: { sendOTP: async ({ user, otp }) => …,
period: 5, digits: 6, allowedAttempts: 5 } })`. On Softonoma, send through the existing
email/SMS integration (WebEngage/Resend) in **server code only**.
Send with `authClient.twoFactor.sendOtp()`, verify with
`authClient.twoFactor.verifyOtp({ code, trustDevice: true })`.

**OTP storage:** set `otpOptions.storeOTP` to `"encrypted"` or `"hashed"` — never
leave it `"plain"` for real deployments.

## Backup codes & trusted devices
Backup codes are single-use recovery codes — display once and let users
regenerate. `trustDevice: true` skips 2FA on that device for the trusted window;
document the tradeoff in the task summary for sensitive apps.

## Softonoma rules
- 2FA is required on money paths (Paymob) and admin surfaces — flag any such
  feature that ships without it as a security finding.
- Rate-limit the verify endpoints (see `better-auth-security`).

## Related skills
- **better-auth-security** — rate limiting the 2FA endpoints, cookie/session hardening.
- **better-auth-best-practices** — plugin wiring and tree-shaken imports.
