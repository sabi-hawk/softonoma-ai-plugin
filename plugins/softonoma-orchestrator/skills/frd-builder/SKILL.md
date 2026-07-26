---
name: frd-builder
description: >
  Turn a raw feature/module requirement from a BA, product manager, or project manager into a
  finalized, standards-compliant Functional Requirements Document (FRD), delivered as both an
  editable Word (.docx) file and a locked PDF. Use this skill whenever someone provides a
  requirement, feature request, module description, user story, or scope note and wants it
  analyzed, clarified, and written up formally — even if they don't say the words "FRD". Trigger
  on phrases like "here's the requirement for X module", "write up the requirements", "we need an
  FRD for", "spec this out", "document this feature", "the BA gave me this scope", or any time a
  half-baked requirement needs to become a reviewable requirements document. The skill runs a
  structured workflow: analyze the requirement, ask only the clarifying questions that requirement
  actually needs, present a summary for explicit sign-off, and only then generate the FRD.
---
<!-- Vendored from Muhammad's user skill (in-house) — synced 2026-07-16 -->


# FRD Builder

Convert a raw requirement into a complete, review-ready Functional Requirements Document.

This is a **conversational, gated workflow** — not a one-shot generator. Do not jump straight to writing the document. Move through the four phases below in order, and never generate the FRD before the user has explicitly approved the summary in Phase 3.

## The four phases

### Phase 1 — Analyze the requirement

Read what the user gave you and understand it before asking anything.

- Identify the **module/feature** and which **application** it belongs to (e.g. Website, Customer Portal, CRM, CMS module) and which **LOB** if relevant (e.g. flights, hotels).
- Extract what's already specified vs. what's missing or ambiguous.
- Infer the actors (Customer, CRM agent, admin), the core flow, and likely data entities (Lead, Booking, payment link, voucher, etc.).
- Note dependencies on external services (e.g. Nuitee LiteAPI prebook/validation, payment gateway, webhooks).

Briefly reflect back your understanding in one short paragraph so the user can correct a wrong assumption early. Then move to questions.

### Phase 2 — Ask clarifying questions (adaptive)

**Decide per requirement how many questions are needed and how to group them.** A crisp, detailed requirement may need two or three questions; a one-line request may need a full round. Do not ask boilerplate questions whose answers are already in the requirement or inferable from context.

Cover whichever of these are genuinely unresolved — see `references/question-bank.md` for a domain-tuned checklist to draw from:

- Scope boundaries (what's explicitly in vs. out for this phase)
- Actors, roles, and permissions
- The happy-path flow and key alternate flows
- Business rules (markup/commission, pricing, GBV calculation, eligibility)
- Data: entities, key fields, states/lifecycle (Lead → Booking, etc.)
- Integrations and the order of operations (e.g. **payment-before-booking**, idempotent webhook handling, the payment-succeeded-but-booking-failed path)
- Non-functional needs (performance/ISR, security — server-side-only API keys, availability, audit)
- Edge cases and failure handling
- Acceptance criteria the team will test against

Prefer batching related questions into a short numbered list so the user can answer efficiently. Ask follow-ups if an answer opens a new gap. Keep going until you have enough to write a complete FRD — then stop asking.

### Phase 3 — Summarize and get explicit approval (gate)

Before writing anything, present a concise **requirements summary**: the module, scope in/out, actors, core + alternate flows, key business rules, data entities and states, integrations and ordering constraints, NFRs, and the acceptance criteria. Use a compact structure the user can scan.

Then ask plainly for sign-off, e.g. "Does this capture it correctly? Reply **approved** and I'll generate the FRD, or tell me what to change." **Do not proceed to Phase 4 until the user explicitly approves.** If they request changes, revise the summary and ask again.

### Phase 4 — Generate the FRD (both .docx and PDF)

Once approved, write the full FRD following the exact section structure in `references/frd-structure.md`. This is a **full-detail** document: functional requirements, non-functional requirements, data model, and edge cases are all required sections — do not abbreviate them.

Generation steps:

1. Read `references/frd-structure.md` for the mandatory section order and the content expected in each section.
2. **Read `/mnt/skills/public/docx/SKILL.md` and follow it** to produce the `.docx`. That skill is the authority on how to build Word files correctly in this environment.
3. From the same content, produce the `.pdf`. Read `/mnt/skills/public/pdf/SKILL.md` if you need guidance; the simplest reliable path is to convert the generated `.docx` to PDF (e.g. LibreOffice headless) so both files are identical in content and layout.
4. Save both files to `/mnt/user-data/outputs/` using a name like `FRD_<Module>_v1.0.<ext>`.
5. Present both files with `present_files`, .docx first (it's the editable deliverable), then the PDF. Keep the accompanying message short.

**Numbering caution:** each requirement's "Primary flow" is its own numbered list and must restart at 1. In docx-js, reusing one numbering `reference` across requirements makes the counter run continuously (FR-2 starting at 5, etc.). Give each flow its own numbering reference (or reset the list) so every flow starts at 1.

## Style and conventions

- Use the team's domain vocabulary naturally: LOB, LiteAPI, prebook/validation, Lead, Booking, payment link, voucher, markup/commission, GBV, ISR, CRM/CMS distinction, payment link.
- Write requirements as testable statements. Give every functional requirement a stable ID (FR-1, FR-1.1, …) and every non-functional one an NFR-N ID so they can be traced to test cases and ClickUp tasks.
- Write acceptance criteria in Given/When/Then form where it adds clarity.
- Be precise about ordering and failure constraints — these are where requirements documents usually fail. Always pin down payment-before-booking ordering, idempotent webhook processing, and the payment-succeeded-but-booking-failed recovery path when payments and a downstream booking are involved.
- Mark genuinely unresolved items as **OPEN** with an owner rather than silently guessing.

## What not to do

- Don't skip the questions and don't skip the approval gate.
- Don't pad the document with generic filler; every line should be specific to this module.
- Don't invent business rules — if it wasn't stated or confirmed, it's an OPEN item.
