# QA Issue task-description template

Source: "Ticket Handoff Playbook" — the pre-read for the "AI Development
Automation - Claude Team Orchestration" workshop (2026-09-08). Treat as
provisional until that session locks the final template; update this file
as the single source of truth if the locked version differs.

Lighter than the FR/CR templates by design — this is for bug triage, not
requirements authoring — but keeps the same discipline: exact values over
vague language, and nothing left silently unanswered. A screenshot or
screen recording is **required**; numbered repro steps are **required**.

```markdown
## Summary
*one-line description of what's wrong — precise, not vague*

## Sources / Evidence
- Screenshots or screen recording: *REQUIRED — attach*
- Related BR/FR/task (if this is a regression of an implemented requirement): *link, or "N/A"*

## Steps to Reproduce
1. *step 1*
2. *step 2*
3. *step 3*

## Expected Result
*what should have happened — exact values/state where relevant, not "should work properly"*

## Actual Result
*what actually happened*

## Environment
*staging / production, URL, browser or device, role used (no real credentials)*

## Severity
*Blocker / Major / Minor / Cosmetic — and why*

## Affected Areas
- *specific product area(s) — not "sitewide" unless genuinely confirmed*

## Impact
- Blocks / blocked by: *other tickets, if any*
- Reused elsewhere?: *is the broken element/logic shared with other flows?*

## Open Questions
- *anything not yet confirmed — never silently omitted*
```
