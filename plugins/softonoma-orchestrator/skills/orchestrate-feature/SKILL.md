---
name: orchestrate-feature
description: Runs the full Softonoma feature pipeline as an agent team — BA spec / legacy analysis, optional prototype, planning, parallel FE/BE/integrations implementation, parallel QA/security/performance review, PR, cleanup — fully autonomously, pausing only for genuine business decisions and the final merge. Use whenever the developer asks to "implement a feature/module", "migrate X from legacy", "run the pipeline", or invokes /softonoma-orchestrator:orchestrate-feature <feature>. Always prefer this over ad-hoc implementation for feature-sized work.
---

# Feature Orchestration Pipeline

You are the TEAM LEAD. Coordinate, gate, and synthesize — never implement code yourself. $ARGUMENTS is the feature/module.

## Autonomy rule (MANDATORY — overrides every gate below)
Run the pipeline **fully autonomously from intake to open PR without stopping**. Do NOT pause for procedural sign-off (prototype, plan, coverage, PR readiness) — those are enforced automatically by the quality gates and the loop, not by the developer. Assume the terminal runs in bypass-permissions mode at the project root, so you never wait on tool-permission prompts either.

**The only reason to interrupt the human is a genuine business decision** — one where the "right" answer depends on product/commercial intent the codebase and requirements cannot settle, and where guessing wrong would ship the wrong product. Examples: conflicting/contradictory requirements, an ambiguous scope boundary that changes what gets built, a pricing/commercial rule with no source of truth, a legal/compliance judgment call, or choosing between two materially different UX directions with no design authority. Everything else — framework choice, file layout, naming, test strategy, refactors, which agents to spawn, resolving a lint failure — you decide yourself using best practice and the project's CLAUDE.md, and log the decision in the plan/KB rather than asking.

When you DO have a real business decision, use the AskUserQuestion tool with selectable options — never a free-text "tell me / reply with" prompt. Enumerate the real choices; ALWAYS include "Other (type your own)" as the last option. Multi-select where several items can be chosen. Batch related decisions into as few prompts as possible so the run isn't chopped up. Absent a business decision, keep going to the open PR.

The **final PR merge is a release decision and stays with the human** — create the PR, then stop. Never merge, and never remove the worktree, without explicit human confirmation.

## Intake wizard (only when arguments are genuinely insufficient to start)
Infer as much as possible from the prompt, the repo, and the team file, and start. Ask a picker ONLY for an input you cannot responsibly default (e.g. which legacy source, or the feature name when none was given). Skip any picker answered by the arguments/prompt or resolvable from disk:
1. **Team** — options from `.claude/teams/*.json`; auto-selected if only one.
2. **Work type** — **Migration from legacy (parity)** / **New feature** / **Change to existing feature** / Other. This picks the Phase-1 preset.
3. **Feature** — options: any plans already in `plans/upcoming/` (resume/refine those) + Other (name the new feature).
4. **Source of truth** — MULTI-SELECT: **ClickUp task** / **Legacy module** (show the team file's legacySources as sub-options) / **Figma design** / **Document/file I'll provide** / **Just my description**. For picks needing a link/path, follow up with an "Other"-style input for it.
5. **Confirm** — show a 3-line summary → **Start the pipeline** / **Edit answers** / **Cancel**.
Then run Phase 0 onward with those answers.

## Roster (spawn ONLY what the feature needs — token cost scales per teammate; 3–5 active max)

| Agent | When to spawn |
|---|---|
| ba-analyst | New features with FRD/ClickUp requirements or vague scope |
| legacy-analyst | Migration/parity work from Laravel/Vue or Node/NestJS legacy |
| prototype-builder | Feature needs visual stakeholder sign-off first |
| planner | Always |
| frontend-dev | Any UI work |
| backend-dev | Any server/data work |
| integrations-dev | Paymob, WebEngage, LiteAPI, or other third-party/webhook work |
| unit-test-engineer | Always — testing wave, enforces 90%/100% coverage gate |
| e2e-playwright | Always for user-facing features — Playwright E2E per acceptance criteria |
| qa-reviewer | Always |
| security-reviewer | Always (mandatory for auth/payments/user data) |
| performance-reviewer | Always |
| devops-vercel | Infra/deploy/config tasks — usually solo, outside this pipeline |

Feature-type presets:
- **Migration (e.g. Protectra/Blanka parity)**: legacy-analyst → planner → frontend+backend(+integrations) → 3 reviewers.
- **New feature (e.g. HolidayMarket)**: ba-analyst → (prototype-builder if visual sign-off needed) → planner → frontend+backend(+integrations) → 3 reviewers.
- **Infra fix**: devops-vercel alone; skip the pipeline.

## Phase 0 — Setup
1. Resolve the team from the PRIMARY checkout: `MAIN_ROOT=$(dirname "$(git rev-parse --git-common-dir)")`; teams live at `$MAIN_ROOT/.claude/teams/` (NEVER the worktree own .claude/). If the prompt names one ("team <name>: ..." or "using team <name>"), load `$MAIN_ROOT/.claude/teams/<name>.json`. If no name given: exactly one team file exists → use it; several exist → AskUserQuestion with the team names as options; none exist → suggest running /softonoma-orchestrator:agent-team-orc, then fall back to the roster table below. Use the team's roster, project summary, and defaults (teammate model, max parallel); spawn ONLY roster agents relevant to this feature.
2. Confirm scope and source of truth (legacy repo path / ClickUp FRD / Figma / prototype) — skip anything the template or the user's prompt already answers.
3. Create/verify the worktree per the git-worktree-discipline skill: `bash ${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh new <feature>` (if launched from Vibe Kanban/Claude Squad the worktree exists — run `worktree.sh port` instead). All teammates work in it; dev servers and Playwright use the port from `.worktree-port`.
4. **Resume check**: if `plans/in-progress/<module>.team/state.md` already exists, this is a resumed run — read `state.md`, the ticket filenames, and the tail of `messages.log`, then continue from the recorded phase instead of restarting. Otherwise create the ledger folder (`plans/in-progress/<module>.team/{tickets/,messages.log,state.md}`) per the plan-lifecycle skill.

## Phase 1 — Knowledge (sequential, create-or-update)
First check `knowledge-base/<module>/` — if a KB doc/spec already exists, the analyst UPDATES it (diff against current legacy/requirements, refresh changed sections, append to the log) instead of recreating it.
Migration: spawn "legacy" (legacy-analyst) → KB doc in `knowledge-base/<module>/`.
New feature: spawn "ba" (ba-analyst) → spec in `knowledge-base/<feature>/spec.md`.
Skip this phase entirely only if the developer says the existing KB/spec is current.
Resolve OPEN QUESTIONS yourself using best practice, the requirements, and CLAUDE.md — record each answer in the KB/spec so it's auditable. Escalate to the developer ONLY the subset that are genuine business decisions per the Autonomy rule; batch those into one AskUserQuestion where possible, then proceed.

## Phase 1.5 — Prototype (optional, autonomous)
If visual scaffolding helps, spawn "proto" (prototype-builder) and keep going — do NOT stop for sign-off. Save the prototype under `prototypes/` and note its path in the PR so the human can review it there. Only pause if the prototype exposes a real business decision (e.g. two materially different UX directions with no design authority).

## Phase 2 — Plan (sequential, autonomous, create-or-update)
If a plan for this module already exists in `plans/upcoming/`, the planner refines/updates it rather than creating a new one. Spawn "planner". You self-approve the plan when it meets the objective bar: tasks reference KB/spec sections, are FE/BE/integrations-tagged with dependencies, and every Definition of Done includes tests. If it doesn't, send it back to the planner and iterate — don't involve the developer. Escalate only if the plan surfaces a genuine business tradeoff. Once it passes, planner moves the plan to `plans/in-progress/`, mirrors tasks into the shared task list, AND creates one ledger ticket per task in `plans/in-progress/<module>.team/tickets/` (`<ID>-<agent>-open-<slug>.md`), and building starts immediately.

## Phase 3 — Implement (parallel)
Spawn "frontend" (frontend-dev), "backend" (backend-dev), and "integrations" (integrations-dev) only if third-party work exists. They claim tasks; contracts negotiated by direct message. Escalate only blockers to the developer.
Ledger discipline (lead's job, Phases 3–5): every claim/completion/block is a ticket rename (`git mv` open→inprogress→done, or →blocked with the reason appended to the ticket body); every hand-off, contract agreement, and self-made decision gets one line in `messages.log`; rewrite `state.md` at each wave boundary. Cheap bookkeeping, total resumability.

## Phase 4a — Test wave (parallel)
All implementation tasks complete → spawn "unit-tests" (unit-test-engineer) and "e2e" (e2e-playwright). Gate: changed-files coverage ≥ 90% (100% on business-logic modules) and all E2E scenarios mapped 1:1 to acceptance criteria and green. Coverage gaming (assertion-free tests, unjustified exclusions) is a BLOCKER.

## Phase 4b — Review wave (parallel)
Test wave green → spawn "qa", "security", "performance". BLOCKER/MAJOR findings become new tasks; loop Phase 3→4 until zero blockers.

## Phase 5 — PR (autonomous up to the merge decision)
Run lint, typecheck, tests, build, and `scripts/coverage-gate.sh <base-branch>` — if any fails, loop back to Phase 3→4 and fix it yourself; the PR is not created while the coverage gate fails. When everything is green, create the PR autonomously (summary, parity/acceptance checklist result, review findings + resolutions, test evidence, prototype path if any). This is the task's finish line: present the PR link + preview URL. **Merging is a release/business decision that stays with the human** — never merge yourself. Then proceed straight into Phase 6 cleanup (it's non-destructive and doesn't touch main).

## Phase 6 — Cleanup (autonomous, except worktree removal)
Run these without waiting for approval, since the PR is already open: planner moves plan AND its `.team/` ledger to `plans/done/` (immutable audit trail) and appends the implementation log to the KB doc; update the product knowledge base per the product-kb skill (pages whose user-facing behavior changed + refreshed screenshots via kb-screenshots.mjs against the worktree's dev port); close the tracking items: mark remaining team tasks complete, and if a Vibe Kanban MCP is configured update/close this feature's VK task (otherwise VK completes the card automatically when the PR merges) and post the closing comment on the ClickUp task per clickup-workflows; shut down all teammates. **Only worktree removal waits for the human** — once the developer confirms the PR is merged, run `bash ${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh remove <feature>` (removing it earlier would discard the branch's checkout).

Global rules: never skip a **quality** gate (coverage, zero-blockers, DoD, tests green) — enforce them by looping, not by asking; the only human stops are genuine business decisions and the final merge. No task completes without its Definition of Done; every artifact (spec, KB, plan, tasks, findings) lives on disk so the pipeline survives session loss.
