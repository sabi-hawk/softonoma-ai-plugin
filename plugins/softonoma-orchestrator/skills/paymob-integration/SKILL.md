---
name: paymob-integration
description: Implement and review Paymob payment flows on the Softonoma stack — Intention API / payment keys, Unified Checkout, and (critically) HMAC verification of transaction callbacks/webhooks. Use for any task touching Paymob charges, refunds, saved cards, or payment webhooks.
---
<!-- In-house Softonoma skill (original). Grounded in Paymob's official docs: https://developers.paymob.com — synced 2026-07-17. Verify field lists/endpoints against the live docs before shipping. -->

# Paymob Integration (Softonoma stack)

Server-side payment integration with **Paymob** for Next.js on Vercel. Money path —
treat correctness and callback authenticity as non-negotiable. Authoritative
reference: **https://developers.paymob.com** (Egypt account).

## Credentials (server-side only — never expose to the client)
From the Paymob dashboard → Account Info / Developers:
- **API key** / **Secret key** — authenticate API calls.
- **Public key** — used by the hosted/Unified Checkout.
- **HMAC secret** — used to verify callbacks. Store all of these as Vercel env
  vars per environment; never ship any to the browser or log them.

## Payment flow (Intention API — preferred)
1. **Create an intention** server-side (amount in the smallest currency unit —
   piasters for EGP — plus billing data, items, and your callback URLs). You get
   back a `client_secret`.
2. **Present checkout** — redirect the customer to the Unified Checkout URL built
   from the public key + `client_secret` (or render the iframe). Never build the
   charge amount on the client.
3. **Customer pays** on Paymob's hosted page.
4. **Receive two callbacks** you configure under Developers → Payment
   Integrations:
   - **Transaction processed callback** — server-to-server webhook (source of
     truth). **Verify HMAC here**, then fulfil the order.
   - **Transaction response callback** — browser redirect back to your app (UX
     only; never fulfil on this alone — it is user-controllable).

> The older flow (auth token → order → payment key) still exists; prefer the
> Intention API for new work and keep amount/currency authoritative on the server.

## HMAC verification (mandatory on every callback)
Paymob signs callbacks with **HMAC-SHA512** over a **specific, ordered
concatenation** of transaction fields (the exact field list differs per callback
type — card transaction vs card-token/subscription; take it from the docs, don't
guess). Steps:
1. Read the fields in the documented order, concatenate them (no separator).
2. Compute HMAC-SHA512 using the **HMAC secret**.
3. Compare (constant-time) to the `hmac` value from the callback query/body.
4. **Reject and 4xx on mismatch.** Only a verified `success = true` transaction
   may fulfil an order.

## Non-negotiable Softonoma rules
- All Paymob calls and secrets live in **server code** (route handlers / server
  actions) — never client-side.
- **Idempotency:** fulfilment keyed on Paymob's transaction/order id; a repeated
  webhook (Paymob retries) must not double-fulfil, double-ship, or double-refund.
- **Amount integrity:** the charged amount is computed and validated server-side
  from your own data, never trusted from the client or the redirect.
- Persist the raw verified callback + your decision for audit/reconciliation.
- Test on Paymob **test cards** in staging; verify both the success and the
  declined/timeout paths, and that an unverified/altered HMAC is rejected.
- Refunds/voids go through the server API with the same auth + audit trail.

## Review checklist (for security/QA before PR)
- [ ] HMAC verified on the processed callback with the correct ordered fields.
- [ ] Order fulfilled only from the verified server webhook, not the redirect.
- [ ] Idempotent fulfilment (safe under Paymob retries).
- [ ] Secrets in env, absent from client bundle and logs.
- [ ] Amount/currency authoritative server-side.

## Related skills
- **pci-compliance** — card-data handling requirements. **better-auth-security** /
  **security-audit** — broader hardening. **api-design-principles** — webhook
  endpoint contracts.
