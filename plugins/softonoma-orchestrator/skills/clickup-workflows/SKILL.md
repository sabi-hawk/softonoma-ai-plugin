---
name: clickup-workflows
description: Conventions for working with ClickUp via the ClickUp MCP — the shared CU status flow, pulling FRDs/requirements from tasks, creating implementation tasks, and updating statuses. Use whenever a ClickUp link or task ID is mentioned, or when the pipeline needs to read requirements from or write progress to ClickUp.
---

# ClickUp Workflows

Tools come from the "clickup" MCP server (first use requires the developer to authenticate — if tools fail with auth errors, ask them to complete the ClickUp OAuth prompt).

For BA/PM/product-owner authoring of a CU from scratch, use `/softonoma-ops:raise-cu`. To pick up an APPROVED CU and build it, use `/softonoma-ops:pickup-cu`. For a hands-on QA pass against a running environment (and raising a QA Issue if needed), use `/softonoma-ops:verify-cu`. This skill is the shared status/comment contract all three, and the core engineering pipeline, build on.

## CU status flow (the shared contract)
Every CU moves through three owners in sequence. The engineering agent only touches the middle band — everything before `APPROVED` and everything after `READY TO TEST - STAGE` is set by BA/UX or QA, by hand.

1. **Discovery & design — owned by BA / UX / PM.** `NEW REQUIREMENT` → `IDEA` → `IN PROGRESS - REQ COLLECT` → `READY FOR UI/UX` → `IN PROGRESS - UI/UX` → `READY FOR BA UI/UX REVIEW` → `IN PROGRESS - UI/UX REVISION` → `IN PROGRESS - FOR APPROVAL`.
2. **Build — owned by the agent**, starting the moment a CU is marked `APPROVED`:

   | Trigger | Status the agent sets |
   |---|---|
   | CU reaches `APPROVED` — agent reads it against the knowledge base | *reads only, no change* |
   | KB check raises open questions — agent posts them as a plain-language comment (@-mentioning the CU's creator) and waits | `FOR BA TO CONFIRM` |
   | Creator replies (or there were no questions) — agent starts building | `IN PROGRESS - DEVELOPMENT` |
   | Pull request opened for review | `IN PROGRESS - PR REVIEW` |
   | Pull request merged | `READY TO TEST - STAGE` (or whichever deployed-environment status is confirmed — see `pickup-cu` Phase D) |

3. **Test, sign-off & release — owned by QA / BA**, once the PR merges: `IN PROGRESS - STAGING TEST` → `ISSUES FOUND` (loops back to `FOR BA TO CONFIRM` if BA input is needed) → `READY TO TEST - UAT` → `IN PROGRESS - UAT TEST` → `FOR BA SIGN-OFF` → `READY FOR STAGING` → `READY FOR COMMS & FOR...` → `COMMS. SENT! IN PRODUCTION`.

Status labels above are as agreed in the workshop's "Ticket Handoff Playbook" pre-read (2026-09-08) — confirm against the actual configured statuses on the target list (`clickup_get_list`, or `clickup_get_task` with `expand_statuses`) before setting one; workspace configuration can differ slightly from this reference, and this doc should be updated if the workshop changes the final names.

## While a CU is building (agent ↔ BA)
- Questions from the agent arrive as **one** comment on the CU, in plain language — never code or file names — @-mentioning the CU's creator/reporter inline (`@[Name](user_id)`, resolved via `clickup_resolve_assignees`) so they're notified directly.
- Status flips to `FOR BA TO CONFIRM` — that's the creator's cue to look, and a real stopping point: wait for the reply rather than polling.
- They reply in the same comment thread; the agent picks it back up automatically and sets `IN PROGRESS - DEVELOPMENT`.
- `READY TO TEST - STAGE` (or the confirmed equivalent) appears the moment the PR merges — testing hands back to QA/BA from there.

## Reading requirements (ba-analyst / lead)
1. Given a ClickUp task link/ID, fetch the task: description, custom fields, checklists, attachments list, and comments (comments often contain the real, latest requirement — read them).
2. Treat the task description + latest stakeholder comments as the FRD input; normalize via the frd-builder / kb-builder formats. Note the task ID in the spec header for traceability.

## Writing back (planner / lead)
1. When a plan is approved, create sub-tasks (or a checklist) under the source task mirroring the plan's Task Breakdown — same IDs in the name, e.g. "[T3] Booking status API".
2. Follow the status flow above: move the source task to `IN PROGRESS - DEVELOPMENT` when the plan enters `plans/in-progress/`, to `IN PROGRESS - PR REVIEW` when the PR opens, comment the PR link, and to `READY TO TEST - STAGE` (or the confirmed equivalent) once it merges — never mark a CU done or move it past what the agent owns before the human gate.
3. Comments are the audit trail: post one concise comment per phase transition (analysis done, plan approved, PR ready), not per task.

Rules: never modify tasks outside the feature's scope; never change assignees or due dates unless asked; if a required list/space is ambiguous, AskUserQuestion once with the candidate lists/spaces as options and record the answer in .claude/alfred-team.json under project notes.
