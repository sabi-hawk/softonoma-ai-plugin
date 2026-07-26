---
name: webengage-integration
description: Implement WebEngage marketing automation on the Softonoma stack — track users and custom events via the server-side REST API, pick the correct data-center host, and model event/user attributes cleanly. Use for any task sending events/users to WebEngage or wiring campaign triggers.
---
<!-- In-house Softonoma skill (original). Grounded in WebEngage's official docs: https://docs.webengage.com — synced 2026-07-17. Verify endpoints/payloads against the live docs before shipping. -->

# WebEngage Integration (Softonoma stack)

Server-side marketing-automation events for Next.js on Vercel. Authoritative
reference: **https://docs.webengage.com** (REST API).

## Credentials & host (server-side only)
From the dashboard → **Data Platform → Integrations → REST API**:
- **API key** — sent as `Authorization: Bearer <API_KEY>`.
- **License code** — your account id, embedded in every URL path.

**Pick the host by data center** (matches your dashboard URL):
- Global → `https://api.webengage.com`
- India (`dashboard.in.webengage.com`) → `https://api.in.webengage.com`
- KSA (`dashboard.ksa.webengage.com`) → `https://api.ksa.webengage.com`

Using the wrong DC host silently fails to land data — confirm Softonoma's account DC
and store host + license code + API key as server env vars.

## Core endpoints
Base path: `/v1/accounts/{LICENSE_CODE}`.
- **Track / upsert a user** — `POST {host}/v1/accounts/{LICENSE_CODE}/users`
  with `userId` + attributes (`firstName`, `lastName`, `email`, `phone`,
  `birthDate`, and custom attributes under the documented shape).
- **Track an event** — `POST {host}/v1/accounts/{LICENSE_CODE}/events`
  with `userId`, `eventName`, `eventTime` (ISO-8601 **with timezone**), and
  `eventData` (the custom properties campaigns segment on).
- **Bulk user/event API** — batch large volumes instead of N single calls.

All calls: `Authorization: Bearer <API_KEY>` + `Content-Type: application/json`.

## Non-negotiable Softonoma rules
- All WebEngage calls run in **server code** — the API key never reaches the
  client. Fire events from route handlers/server actions or a queue worker, not
  the browser.
- **`userId` is the stable join key** — use Softonoma's canonical user id
  consistently across `/users` and `/events`, or campaigns target the wrong
  people.
- **Don't block the user path:** enqueue events (Redis queue / background job)
  and retry on failure; a WebEngage outage must not fail checkout or signup.
- **Idempotency & retries:** make the send retry-safe; avoid emitting the same
  event twice for one business action (double-counts corrupt campaign triggers).
- **`eventTime` carries a timezone** — send the real occurrence time, not "now at
  delivery", so journeys/segments compute correctly.
- Only send attributes you intend to segment/personalize on; treat PII per policy
  and keep it out of logs.

## Review checklist (QA/security before PR)
- [ ] Correct DC host for Softonoma's account.
- [ ] API key server-side only; absent from client bundle and logs.
- [ ] Canonical `userId` used consistently.
- [ ] Event sends are async + retry-safe + idempotent; failures don't break the flow.
- [ ] `eventTime` is ISO-8601 with timezone.

## Related skills
- **api-design-principles** — event/attribute contract design.
- **redis-core** / **redis-connections** — queueing event sends off the hot path.
- **systematic-debugging** — trace events that never arrive (usually DC host or userId).
