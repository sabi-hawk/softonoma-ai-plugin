---
name: liteapi-integration
description: Implement LiteAPI hotel/travel booking on the Softonoma stack — the search → prebook → book flow, X-API-Key auth, sandbox vs production keys, and re-validating price/cancellation changes before charging. Use for any task touching hotel search, rates, prebooking, or bookings.
---
<!-- In-house Softonoma skill (original). Grounded in LiteAPI's official docs: https://docs.liteapi.travel — synced 2026-07-17. Verify endpoints/versions/payloads against the live docs before shipping. -->

# LiteAPI Integration (Softonoma stack)

Server-side hotel booking via **LiteAPI (Nuitee)** for Next.js on Vercel. This is a
money + inventory path — correctness of the prebook→book handoff is critical.
Authoritative reference: **https://docs.liteapi.travel**.

## Credentials (server-side only)
- Auth header on every request: **`X-API-Key: <key>`**.
- **Sandbox keys** are prefixed `sandbox_`/`sand_`; **production** keys `prod_`.
  The sandbox runs the full flow (including payment) without reserving rooms or
  moving money — build and test there first. Store keys as Vercel env vars per
  environment; never expose them to the client.

## Booking flow (three calls, in order)
1. **Search rates** — `POST /hotels/rates` with destination/hotel ids, check-in/
   check-out dates, occupancy, currency, nationality/guest info. Returns available
   room rates with a `rateId` and real-time pricing.
2. **Prebook** — confirms the chosen rate is **still available** and returns a
   `prebookId` **and a new `rateId`**, plus flags indicating whether **price,
   cancellation policy, or board/boarding changed** since search.
3. **Book** — confirm with the `prebookId` + the `rateId` **from prebook** (not
   from search) plus guest and payment details. Returns the confirmed booking.

Also useful: booking retrieval and cancellation endpoints (respect the returned
cancellation policy/deadlines).

## Non-negotiable Softonoma rules
- All LiteAPI calls and keys live in **server code** — never client-side.
- **Always prebook immediately before book** and use prebook's returned `rateId`.
  Booking with a stale search `rateId` is a bug.
- **Surface prebook changes:** if price/cancellation/board changed, re-confirm
  with the user (or apply your documented policy) **before** charging — never
  silently book a changed price.
- **Idempotency:** guard the book call so a retry/double-submit can't create two
  bookings; key on your own booking intent id and persist LiteAPI's booking id.
- **Pin the API version** in the base URL and keep the currency explicit and
  server-authoritative.
- Persist search/prebook/book responses for reconciliation and support.
- Handle sold-out / price-changed / payment-declined paths explicitly; test each
  in sandbox.

## Review checklist (QA/security before PR)
- [ ] `X-API-Key` server-side only; correct sandbox vs prod key per environment.
- [ ] book uses the `prebookId` + prebook's `rateId`, not search's.
- [ ] Price/cancellation/board changes from prebook are handled before charging.
- [ ] Book is idempotent (no double bookings on retry).
- [ ] Cancellation respects the returned policy/deadline.

## Related skills
- **paymob-integration** — if the customer payment leg goes through Paymob.
- **api-design-principles** — booking endpoint contracts and error modelling.
- **redis-core** — cache search results within their short validity window only.
