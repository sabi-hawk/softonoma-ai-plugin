---
name: clickup-workflows
description: Conventions for working with ClickUp via the ClickUp MCP — pulling FRDs/requirements from tasks, creating implementation tasks, and updating statuses. Use whenever a ClickUp link or task ID is mentioned, or when the pipeline needs to read requirements from or write progress to ClickUp.
---

# ClickUp Workflows

Tools come from the "clickup" MCP server (first use requires the developer to authenticate — if tools fail with auth errors, ask them to complete the ClickUp OAuth prompt).

## Reading requirements (ba-analyst / lead)
1. Given a ClickUp task link/ID, fetch the task: description, custom fields, checklists, attachments list, and comments (comments often contain the real, latest requirement — read them).
2. Treat the task description + latest stakeholder comments as the FRD input; normalize via the frd-builder / kb-builder formats. Note the task ID in the spec header for traceability.

## Writing back (planner / lead)
1. When a plan is approved, create sub-tasks (or a checklist) under the source task mirroring the plan's Task Breakdown — same IDs in the name, e.g. "[T3] Booking status API".
2. Status conventions: move the source task to "In Progress" when the plan enters plans/in-progress/, comment the PR link at Phase 5, and move to review/done states only after the human approves — never mark ClickUp done before the human gate.
3. Comments are the audit trail: post one concise comment per phase transition (analysis done, plan approved, PR ready), not per task.

Rules: never modify tasks outside the feature's scope; never change assignees or due dates unless asked; if a required list/space is ambiguous, AskUserQuestion once with the candidate lists/spaces as options and record the answer in .claude/softonoma-team.json under project notes.
