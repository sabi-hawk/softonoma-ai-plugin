---
name: plan-lifecycle
description: The plans/{upcoming,in-progress,done} workflow and plan file format. Use whenever creating, moving, updating, or closing a feature plan, or when breaking a plan into tasks — any mention of "plan", "task breakdown", or moving work between stages.
---

# Plan Lifecycle

Folders. **Resolve the root first; both layouts are supported:**
- **Onboarded layout (0.24.0+, what `project-onboard` creates):** `.claude/plans/{backlog,upcoming,inprogress,done}/` plus `README.md`, `TEMPLATE.md` (one file per ticket, `inprogress/<TICKET>.md`) and `CARRY-OVER.md` (follow-ups that outlive their ticket).
- **Legacy layout:** `plans/{upcoming,in-progress,done}/` at the repo root.
- Rule: use `.claude/plans/` when it exists, else `plans/`; the active folder is `inprogress/` when it exists there, else `in-progress/`. Never create the other layout beside an existing one. Below, `plans/in-progress/` means the resolved active folder.

Stages:
- `backlog/` — captured but parked (onboarded layout)
- `upcoming/` — approved-for-later plans
- `in-progress/` (or `inprogress/`) — exactly the plans currently being implemented
- `done/` — shipped plans (immutable)

A plan moves upcoming → in-progress when implementation is approved, and in-progress → done only after the PR is merged (the developer merges; agents never do). Moves are `git mv` so history is kept.

## Plan file format: `plans/<stage>/<module>.md`

1. **Goal** — one paragraph, link to KB doc and FRD/ClickUp task if any.
2. **Scope / Non-goals**
3. **Task Breakdown** — table: ID, title, layer (FE/BE/FS), depends-on, KB sections covered, Definition of Done. Tasks ≤ half a day each.
4. **Risks & Open Questions**
5. **Status Log** — dated entries appended as things progress (task done, blockers, review rounds, PR link).

When a team is running, mirror the Task Breakdown into the shared team task list 1:1 (same IDs) so disk and task list never diverge. The disk copy is the source of truth if the session dies.

## Team coordination ledger: `plans/in-progress/<module>.team/`

When a team pipeline (orchestrate-feature) runs a plan, the lead maintains a ledger folder next
to the plan so coordination state — not just the task breakdown — survives session loss and is
git-auditable:

```
plans/in-progress/<module>.team/
├── tickets/                       # one file per task, STATUS ENCODED IN FILENAME
│   ├── T001-backend-done-article-model.md
│   ├── T002-frontend-inprogress-crud-ui.md
│   └── T003-e2e-blocked-checkout-flow.md     # blocked → body says on what
├── messages.log                   # append-only, one line per hand-off/decision
└── state.md                       # pipeline snapshot, rewritten at each wave boundary
```

- **Ticket filename**: `<ID>-<agent>-<status>-<slug>.md`, status ∈ `open|inprogress|blocked|done`.
  Status changes are `git mv` renames — never edit status inside the file. Body: goal, depends-on,
  Definition of Done, and a dated notes/hand-off section agents append to.
- **Lookups are globs, not reads**: `ls tickets/*-blocked-*` (what's stuck), `ls tickets/*-frontend-*`
  (one agent's load), `ls tickets/ | grep -cv -- -done-` (remaining).
- **messages.log**: one line per event — `2026-07-27T14:02Z lead->backend: T001 assigned` ·
  `backend->lead: T001 done, model at src/models/article.ts` · `lead: DECISION pagination=cursor
  (best practice, no owner input needed)`. Append-only; never rewritten.
- **state.md**: current phase, ticket summary table, active blockers, next action. Rewritten by the
  lead at every phase/wave boundary. **This is the resume entrypoint**: a fresh session reads
  `state.md` → tickets → messages.log tail and continues the pipeline exactly where it died.
- The ledger moves to `plans/done/` together with the plan (immutable audit trail of who did what).
