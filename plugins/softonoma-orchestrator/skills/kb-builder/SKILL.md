---
name: kb-builder
description: Standard format for reverse-engineering knowledge-base documents. Use whenever writing or updating anything in knowledge-base/ — module analyses, legacy behavior docs, parity references. Always use this format for legacy analysis output, even if the requester doesn't mention "knowledge base".
---

# Knowledge Base Document Format

Output location: `knowledge-base/<module>/README.md` (split into multiple files only if >800 lines; then README.md is the index).

Required sections, in order:

1. **Overview** — what the module does, who uses it, key entities.
2. **Entry Points** — every route/screen/job/webhook/event, with legacy file path.
3. **Data Model** — tables/collections, fields that matter, relationships, status enums with ALL values and their transitions.
4. **Business Rules** — numbered list. Each rule: plain-English statement, exact formula/condition, legacy source `file:line`, and edge cases. This is the parity contract — be exhaustive.
5. **Side Effects** — emails, notifications, logs, third-party calls, queued jobs.
6. **Permissions** — role/ability checks per action.
7. **Error & Edge Behavior** — validation messages, failure paths, race conditions handled (or not) in legacy.
8. **Open Questions** — anything ambiguous. Never resolve ambiguity by assumption.
9. **Implementation Log** — appended after delivery: what was built, intentional deviations, follow-ups.

Style: terse, factual, verifiable. Every claim about legacy behavior must carry a `file:line` citation.
