---
name: signoff-cu
description: Guide a BA/PM/product owner through a live sign-off walkthrough of a CU that has reached FOR BA SIGN-OFF (or any later release-track status) — opens the right environment (staging/UAT/production, inferred from the CU's current status), hands login to the person themselves, then walks them through the ticket's acceptance criteria one by one on the real application so they can see it and decide. Records the sign-off (advancing the CU's status) or the kick-back (specific gaps, status back to ISSUES FOUND/FOR BA TO CONFIRM). Use whenever someone says "sign off on CU <id>", "walk me through this ticket", "is this ready for release", or invokes /softonoma-ops:signoff-cu <cu-link>.
---

# Sign Off a CU (/signoff-cu)

You are guiding a BA/PM/product owner through their own **live** look at a
CU before they sign off on it — this is a walkthrough for a human's
judgment, not an autonomous pass/fail run like `verify-cu`. Reuse
`verify-cu`'s Phase 2 (browser + human login + session capture) and Phase 3
(reconnaissance-then-action navigation, screenshots) mechanics directly
rather than re-deriving them — the difference here is entirely in *how* the
run is presented and how it ends.

`$ARGUMENTS` = a CU link or ID. With none, ask for one.

## Phase 1 — Fetch and pick the environment
1. Fetch the CU (`clickup_get_task`, description + Acceptance Criteria + its
   current status).
2. Infer the environment from the CU's **current status** against the flow
   in `clickup-workflows`: `IN PROGRESS - STAGING TEST` / `READY FOR STAGING`
   → staging; `READY TO TEST - UAT` / `IN PROGRESS - UAT TEST` /
   `FOR BA SIGN-OFF` → UAT; `READY FOR COMMS…` / `COMMS. SENT! IN PRODUCTION`
   → production. If the status doesn't map cleanly, or the CU's Environment
   field disagrees with the inference, ask (AskUserQuestion) which
   environment/URL to use rather than guessing.
3. If this CU isn't at `FOR BA SIGN-OFF` or later, say so plainly and ask
   whether to continue anyway (an early look before formal sign-off is a
   legitimate use) or wait.

## Phase 2 — Open the browser, hand off login
Same as `verify-cu` Phase 2: open a real, headed browser at the chosen
environment's URL, hand it to the person to log in themselves — never ask
for or accept a password/OTP, never fill the login form yourself — then
capture the session (`playwright-cli state-save`) once they confirm they're in.

## Phase 3 — Walk them through it, one criterion at a time
Take the CU's numbered Acceptance Criteria (or, for a QA Issue CU, its Steps
to Reproduce / Expected Result) as the walkthrough script. For each one, in order:
1. Navigate to the relevant screen/flow (reconnaissance-then-action, as in
   `verify-cu` Phase 3).
2. Show what's there — a screenshot plus a one-line plain-language summary
   of what you found, tied explicitly to that criterion's wording.
3. **Pause and ask them** ("Does this match AC-3?") rather than judging
   pass/fail yourself — this is their sign-off, not the agent's verdict.
   Move to the next criterion once they've responded, and note their answer.

Keep a screenshot for every criterion, whether they confirm or flag it —
it becomes the evidence either way.

## Phase 4 — Record the outcome
Once every criterion has been walked, AskUserQuestion: **"Sign off on this CU?"**
- **Yes** — resolve the list's actual next configured status in the release
  flow (`clickup_get_list` / `expand_statuses`; default guess is the next
  step after `FOR BA SIGN-OFF` in `clickup-workflows`'s documented sequence,
  e.g. `READY FOR STAGING`) and confirm it before setting. Comment a short
  sign-off note on the CU.
- **No** — capture exactly which criteria were flagged and why (from Phase
  3's notes). Ask whether this is a defect (→ status `ISSUES FOUND`, comment
  written like a QA Issue per `verify-cu`'s template, screenshots attached)
  or a clarification (→ status `FOR BA TO CONFIRM`, comment @-mentioning
  whoever should answer, per `clickup-workflows`'s convention). Never guess
  which one applies — ask.

## Rules
- This skill never decides pass/fail on its own — every judgment call in
  Phase 3 belongs to the human doing the sign-off.
- No real customer/staff data or credentials anywhere, same as `verify-cu`.
- Don't skip criteria to save time — if time is short, say so and ask
  whether to continue later rather than silently truncating the list.

## Skills to use
- **verify-cu** — the browser/login/navigation mechanics this skill reuses.
- **clickup-workflows** — the CU status flow and its configured-status
  resolution convention.
