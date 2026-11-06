---
name: verify-cu
description: Run a hands-on QA pass against a real running environment — open a browser, have the QA person log in themselves, then work through each use case (from a CU's acceptance criteria, or a plain-language scope the QA person gives) capturing evidence, and report pass/fail. Afterwards ask whether a CU is needed and under which ClickUp listing, and if so raise a QA Issue there with status ISSUES FOUND using the standard template, screenshots attached. Use whenever a QA person says "test X on staging/UAT", "verify this CU", "run QA on...", "check the build", or invokes /softonoma-ops:verify-cu.
---

# Verify a CU (/verify-cu)

You are running a hands-on QA pass against a real environment — not writing
unit/E2E specs in a repo (that's the `e2e-playwright` agent, inside the
`orchestrate-feature` pipeline). This drives a real browser through the same
checks a human tester would run, with a human doing the actual login.

## Phase 1 — Scope the run
- **From a CU** — given a CU ID/link ("verify CU ABC-123"), fetch it
  (`clickup_get_task`, `include: ["description"]`) and derive the use-case
  list from its numbered Acceptance Criteria. Note its Environment field for
  the URL/role to use, if filled in.
- **From plain language** — otherwise, take the QA person's description of
  what to test as the use-case list directly: a flow, a page, a regression
  sweep, "whatever they ask". Turn it into a short numbered list and show it
  back before starting, so scope is confirmed rather than assumed.
- Confirm the **environment** (staging / UAT / production) and its URL if
  not already obvious. Prefer staging/UAT; flag rather than assume if the
  only option given looks like production.

## Phase 2 — Log in (the human does this, not you)
Open a real, headed browser (`playwright-cli`) at the app's login page and
hand it over: *"Browser's open at `<url>` — go ahead and log in, then tell
me when you're in."* Never ask for or accept a password/OTP in chat, and
never fill in a login form yourself. Once the QA person confirms they're
logged in, capture the session (`playwright-cli state-save`) so the rest of
the run doesn't need them again, and continue from there. If the session
expires mid-run (bounced back to login), stop and hand the browser back for
a fresh login rather than guessing at credentials.

## Phase 3 — Work the use-case list
For each use case, follow the reconnaissance-then-action pattern (see
`webapp-testing`): navigate, wait for the page to settle (`networkidle`),
screenshot/inspect to find real selectors, act, then assert the expected
outcome. Capture:
- a screenshot at the meaningful end-state of every use case, pass or fail
- extra screenshots/console logs at the exact point of failure for anything that fails
- the exact steps taken, numbered — this becomes "Steps to Reproduce" if a
  CU gets raised later

Map every result 1:1 back to its acceptance criterion or numbered scope item
— don't summarize away which one it was. Never use real customer or staff
data; use synthetic values if the flow needs input.

## Phase 4 — Report
Present a compact report before touching ClickUp:
- per use case: PASS / FAIL, one-line expected vs. actual, screenshot reference
- overall: N/M passed, environment tested, anything blocked or skipped and why

## Phase 5 — Ask about a CU (always ask, even if everything passed)
AskUserQuestion:
1. "Is a CU required for this run?" — Yes / No.
2. If yes: "Which ClickUp listing?" — offer candidate lists if discoverable
   (e.g. the parent CU's own list, via `clickup_get_list`), always with an
   "Other" free-text option. Never guess the listing.

## Phase 6 — Raise the QA Issue (only if Phase 5 said yes)
Fill `references/qa-issue-template.md` **per failing use case** — one CU per
distinct bug, don't lump unrelated failures into a single ticket — using the
steps/screenshots/expected-actual captured in Phase 3. Then create the task:
- **status** — `ISSUES FOUND`. Resolve against the target list's actual
  configured statuses first (`clickup_get_list` / `expand_statuses`) rather
  than assuming the exact label matches.
- **attachments** — every screenshot captured for that use case
  (`clickup_attach_task_file` / `clickup_request_attachment_upload`).
- **linkage** — if a parent CU was being verified, add a comment there
  pointing at the new QA Issue (per `clickup-workflows`'s audit-trail
  convention). Don't change the parent CU's own status — that's BA's call.

Report the created CU link(s) back to the QA person.

If what's found isn't actually a bug but a scope gap or a legitimate change
request, say so and point at `/softonoma-ops:raise-cu`'s Change
Request template instead of forcing it into the QA Issue shape.

## Rules
- No real credentials or customer/staff data anywhere — not in chat, not in
  the CU, not in a screenshot. If a captured screenshot shows real personal
  data, say so and ask before attaching it.
- Never invent a severity, environment, or expected result you didn't
  actually observe — leave it as an Open Question on the ticket instead.
- If everything passes, don't manufacture a CU just to have something to
  show — "no" is a legitimate answer to Phase 5.

## Skills to use
- **clickup-workflows** — the CU status flow, and the ask-once-if-ambiguous
  rule for lists/spaces.
- **playwright-cli** — driving the browser; storage-state for session reuse
  once the human has logged in.
- **webapp-testing** — the reconnaissance-then-action pattern, screenshotting.
- **release-readiness** — for a pre-release pass across several CUs/flows at
  once rather than one CU at a time: its go/no-go checklist and smoke-test
  suite design (critical-journeys-only, under 5 minutes) are the sharper
  tool than working one CU's acceptance criteria when the ask is "is this
  release ready," not "does this ticket work."
- **diagnosing-bugs** — narrowing down *why* a use case failed before writing
  the Actual Result.
