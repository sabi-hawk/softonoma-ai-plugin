# Question Bank (draw from adaptively)

Don't ask all of these. Pick only the ones whose answers aren't already in the requirement.
Skip anything inferable. Batch related ones into a short numbered list.

## Scope & context
- Which application does this belong to — Website, Customer Portal, CRM, or CMS module?
- Which LOB(s) — flights, hotels, both?
- What's explicitly in scope for this phase, and what's deliberately deferred?
- Is this a new module or a change to an existing one?

## Actors & permissions
- Who uses this — Customer, CRM agent, admin? Any role-based differences?
- What can each role see / do / not do?
- Any approval steps or maker-checker flow?

## Flows & business rules
- What's the happy-path flow, step by step?
- What alternate or exception flows matter?
- Pricing rules — how is markup/commission applied? How is GBV calculated/displayed?
- Eligibility / availability rules?

## Data & lifecycle
- What entities are involved (Lead, Booking, payment link, voucher…) and their key fields?
- What states does each go through, and what triggers each transition?
- What is the Lead → Booking relationship for this flow?
- Validation rules on key fields?

## Integrations & ordering
- Which external services — LiteAPI (prebook/validation), payment gateway, others?
- What's the required order of operations? (Confirm payment-before-booking.)
- How are webhooks handled — idempotency key, retry behavior?
- What happens on the payment-succeeded-but-booking-failed path? Refund? Manual recovery? Alert?

## Non-functional
- Performance expectations — any pages needing ISR/caching? Acceptable latency?
- Security — confirm API keys are server-side only; any PII or payment-data handling rules?
- Availability/uptime expectations? Audit/logging needs?
- Target browsers/devices?

## Edge cases & acceptance
- Known edge cases or failure modes to handle explicitly?
- Concurrency concerns (double submission, duplicate webhook)?
- What are the acceptance criteria the team will test against?
- Anything still undecided that should be logged as an OPEN item with an owner?
