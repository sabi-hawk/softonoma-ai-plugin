# FRD Structure (mandatory)

Use this exact section order. Every section below is required for a full-detail FRD. If a section
genuinely has no content, write "Not applicable for this phase" rather than deleting it.

## Title page / header
- Document title: "Functional Requirements Document — <Module>"
- Application & LOB, version (start at v1.0), date, author, reviewer/approver
- Status (Draft / Approved)

## 1. Document control
- Version history table: Version | Date | Author | Summary of changes
- Reviewers / approvers table: Name | Role | Status

## 2. Introduction
- 2.1 Purpose — what this module does and why
- 2.2 Scope — what's in scope for this phase
- 2.3 Out of scope — explicitly excluded items
- 2.4 Definitions, acronyms, glossary — define domain terms used (LOB, LiteAPI, prebook,
  Lead, Booking, payment link, voucher, GBV, markup/commission, ISR, CRM, CMS)
- 2.5 References — related docs (FRD vNN, README, CLAUDE.md, external API docs)

## 3. Overall description
- 3.1 Context — where this module sits in the system (Website / Customer Portal / CRM / CMS)
- 3.2 Actors & roles — each actor and what they can do
- 3.3 Assumptions & dependencies — external services (LiteAPI, payment gateway), other modules
- 3.4 Constraints — technical/business constraints (server-side-only API keys, stack limits)

## 4. Functional requirements
The core of the document. For each capability:
- A stable ID (FR-1, FR-1.1 …), a one-line title, and a testable description
- Preconditions, trigger, primary flow (numbered steps), alternate/exception flows
- Business rules that apply (pricing, markup/commission, GBV, eligibility)
- Priority (Must / Should / Could)
Group requirements by sub-feature or user flow. Cover the happy path AND alternate flows.

## 5. User flows / process flows
- Describe the end-to-end flow(s) in prose and/or a step list.
- Call out ordering constraints explicitly (e.g. payment-before-booking).
- A simple sequence/flow description for the critical path is expected.

## 6. Data requirements
- 6.1 Entities & key fields — each entity (Lead, Booking, payment link, voucher…) with key fields and types
- 6.2 State / lifecycle — state transitions (e.g. Lead → Booking; payment pending → succeeded → booked / failed)
- 6.3 Validation rules — field-level and cross-field validation

## 7. Integration requirements
- Each external integration (e.g. Nuitee LiteAPI prebook/validation, payment gateway, webhooks)
- Direction, trigger, request/response essentials, and ordering
- Idempotency requirements for webhooks
- The payment-succeeded-but-booking-failed recovery path (mandatory when payments + booking exist)

## 8. Non-functional requirements
Give each an NFR-N ID. Cover at least:
- Performance (response times, ISR/caching expectations)
- Security (server-side-only API keys, authn/authz, PII handling, payment data)
- Availability & reliability
- Scalability
- Auditability / logging
- Accessibility & compatibility (browsers/devices) where relevant

## 9. Edge cases & error handling
- Enumerate edge cases and the expected system behavior for each
- Failure handling, retries, user-facing error messaging
- Concurrency / double-submission / duplicate webhook handling

## 10. Acceptance criteria
- Per major requirement, in Given/When/Then form where it adds clarity
- These should map directly to test cases

## 11. Open items & assumptions
- Table: Item | Description | Owner | Status (OPEN/RESOLVED)
- Anything not confirmed during questioning goes here rather than being silently assumed
