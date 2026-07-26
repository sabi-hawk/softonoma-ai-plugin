---
name: plan-lifecycle
description: The plans/{upcoming,in-progress,done} workflow and plan file format. Use whenever creating, moving, updating, or closing a feature plan, or when breaking a plan into tasks — any mention of "plan", "task breakdown", or moving work between stages.
---

# Plan Lifecycle

Folders (repo root):
- `plans/upcoming/` — approved-for-later plans
- `plans/in-progress/` — exactly the plans currently being implemented
- `plans/done/` — shipped plans (immutable)

A plan moves upcoming → in-progress when implementation is approved, and in-progress → done only after the human developer approves the merged PR. Moves are `git mv` so history is kept.

## Plan file format: `plans/<stage>/<module>.md`

1. **Goal** — one paragraph, link to KB doc and FRD/ClickUp task if any.
2. **Scope / Non-goals**
3. **Task Breakdown** — table: ID, title, layer (FE/BE/FS), depends-on, KB sections covered, Definition of Done. Tasks ≤ half a day each.
4. **Risks & Open Questions**
5. **Status Log** — dated entries appended as things progress (task done, blockers, review rounds, PR link).

When a team is running, mirror the Task Breakdown into the shared team task list 1:1 (same IDs) so disk and task list never diverge. The disk copy is the source of truth if the session dies.
