---
name: xero-integration
description: Build and maintain Xero accounting integrations with xero-node — OAuth2 flows, tenant handling, token refresh/storage, idempotent contact/invoice/payment sync, rate-limit retry, and reconciliation. Use for any task touching Xero API, accounting sync, or invoice/bill/credit-note push. Triggers on "Xero", "xero-node", "OAuth2 tenant", "tenant id", "invoices", "contacts sync", "credit note", "ACCREC", "payroll", "webhooks", "rate limits", "429", "idempotent sync", "accounting integration".
metadata:
  version: "1.0.0"
---

# Xero Integration (Softonoma stack)

Reference implementation: Dental2You (`dental2you-backend/src/modules/xero/*` — NestJS + Prisma +
`xero-node`). Apply these patterns to any project; adjust table/module names.

## OAuth2 & tenants

- **Authorization-code flow** (multi-org SaaS): xero-node stores PKCE/state on the client
  *instance*, which is gone by callback time in a stateless server. Do what D2Y does
  (`oauth/xero-oauth.service.ts`): build the consent URL manually
  (`login.xero.com/identity/connect/authorize` + encode `{organizationId, userId}` in `state`),
  exchange the code with a direct POST to `identity.xero.com/connect/token` (Basic auth), then
  `client.setTokenSet()`. **Client-credentials** ("custom connections") suits single-org
  internal apps — no consent UI, same token endpoint with `grant_type=client_credentials`.
- **Tenant ID is mandatory on every API call.** After token exchange, GET
  `https://api.xero.com/connections`, store `tenantId` (+ org name) per local organization.
  Fail loudly if it's missing — "reconnect via /connect", never guess.
- **Scopes**: request only what you use; new apps must use granular scopes
  (`accounting.invoices`, `accounting.payments`, …) — `accounting.transactions` is deprecated.
  Adding a scope later (attachments, reports, payroll.*) requires a **user re-consent/reconnect**.

## Tokens: storage & refresh

- Credentials (`XERO_CLIENT_ID/SECRET/REDIRECT_URI`) live in env only — never in code or client
  bundles. Tokens live in a per-organization DB row (D2Y: `xeroIntegration`), never in files.
  Encrypt tokens at rest (D2Y stores plaintext — a known backlog item, not a pattern to copy).
- Wrap every call site behind one `getAuthorizedClient(orgId)` helper: refresh when the access
  token is expired **or within 5 minutes of expiry**; persist the new refresh token, falling back
  to the old one if Xero didn't rotate it. Refresh tokens are single-use-rotating — losing one
  means a full reconnect, so the DB write must succeed before you use the new token.

## Sync architecture

- **Direction of truth**: your app is the source for records it creates (invoices, contacts);
  Xero is the source for accounting state (PAID status, reference data). Pull reference data
  (chart of accounts, tax rates, currencies, items, branding themes) on connect and on demand —
  never hardcode account codes or tax types beyond documented business defaults.
- **Idempotent upserts keyed on external ids**: store the Xero GUID per local record — either a
  column (`patient.xeroId`) or a link table (D2Y: `xeroEntityLink` keyed on
  `organizationId + entityType + localRecordId` → `xeroRemoteId`, `lastSyncedAt`, deep link).
  Validate the GUID before reuse; send it on update so Xero updates instead of duplicating.
- **Contact before document**: an invoice/bill/credit-note needs a Xero Contact GUID — upsert
  the contact first, write its id back, then push the document referencing `contactID`.
- **Rate limits**: 60 calls/min/tenant, 5 concurrent, 1,000/day for uncertified apps (5,000
  certified). On 429, honour `Retry-After` and retry with exponential backoff + jitter; batch
  where the API allows. For volume, use a durable outbox/queue — fire-and-forget in-process
  sync (D2Y's current state) loses work on restart.
- **Removal semantics**: Xero rarely deletes. DRAFT/SUBMITTED docs → `DELETED`;
  AUTHORISED/PAID → `VOIDED` (with fallback between them). Currencies cannot be deleted at all;
  contacts/accounts are archived.

## Entity mapping

- Local customer/patient/supplier → **Contact** (Xero has no customer/supplier split; usage
  decides). Sales invoice → Invoice `ACCREC`; supplier bill → Invoice `ACCPAY`; refund →
  CreditNote `ACCRECCREDIT`; payment → `PUT Payments` (Account + Invoice + Date + Amount).
- Line items carry `itemCode`/`itemID` (from synced Items), `accountCode` (chart of accounts),
  `taxType` (synced tax rates), optional `tracking[]` (max 2 active categories per org).
  Validate compatibility before push (D2Y: account type vs tax rate checks) — fail locally with
  a clear message rather than round-tripping a Xero validation error.
- Map statuses both ways (DRAFT/SUBMITTED/AUTHORISED/PAID/VOIDED/DELETED) in one util, not
  inline. Store the Xero deep link (`go.xero.com/app/{shortCode}/...`) for one-click navigation.
- Payments push needs an explicit payment-method → Xero account mapping table; **unmapped means
  no push** (fail closed). Skip non-AUTHORISED invoices instead of auto-authorising them.

## Errors, reconciliation, audit

- xero-node often returns the HTTP body as a **JSON string** with `ValidationErrors` nested
  under `Elements[]` or per-entity arrays — parse recursively (D2Y:
  `outbound/xero-api-errors.util.ts`) or you'll log a useless generic failure.
- Persist the last sync error on the record itself so users see *why* ("Invoice number already
  exists"), clear it on success. Audit-log every connect/disconnect/push with actor + org.
- Reconcile with a pull path: fetch document status from Xero and write it back locally
  (or better, webhooks: HMAC-SHA256 signature over the **raw body**, respond 200 within 5s,
  process async, pass the intent-to-receive check).

## Capability gaps — check before promising a feature

- Emailing invoices: `POST Invoices/{id}/Email` sends Xero's branded template only — **no custom
  body**, invoice must be ACCREC **and AUTHORISED** (drafts can't be emailed), and ACCPAY bills
  can't be emailed at all. Custom emails go through your own mailer (SendGrid).
- `GET Invoices/{id}/OnlineInvoice` gives a shareable view/pay URL — the cheap "customer-facing
  invoice" answer. Attachments need the `accounting.attachments` scope (re-consent) + your own
  server-side PDF.
- Tracking categories: org limit 2 active; API quirk — returns only 1 option per line.
- Payroll AU is a **separate API** (payroll.* scopes, Payroll Admin, Standard/Premium plan);
  pay runs/timesheets/super lines are API-writable but **STP/ATO submission and payment
  authorisation are not** — a human clicks in Xero. Model contractor super via supplier
  ACCPAY bills unless the client explicitly chooses payroll.

## Checklist

- [ ] Tenant ID stored per org and sent on every call; missing → explicit reconnect error?
- [ ] Tokens in DB (encrypted), refresh-before-expiry behind a single helper, secrets in env only?
- [ ] Every push keyed on a stored Xero GUID (upsert, never blind create)? Contact before document?
- [ ] 429/backoff handling and daily-limit awareness; durable queue for bulk syncs?
- [ ] Validation errors parsed from nested/stringified bodies and stored on the record?
- [ ] Feature promises checked against the gap list (email body, drafts, ACCPAY email, payroll STP)?
