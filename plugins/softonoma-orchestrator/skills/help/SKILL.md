---
name: help
description: Show what the softonoma-orchestrator plugin can do — commands, agents, skills, packs, scripts, hooks. Use when the user asks "help", "list commands", "what can this plugin do", "show plugin commands", or /softonoma-orchestrator:help.
---

# softonoma-orchestrator — Help

Print this reference (compact, adapt to what they asked). The full instructions are in
`${CLAUDE_PLUGIN_ROOT}/WORKFLOW.md` (copied into each onboarded project as `.claude/WORKFLOW.md`).

## Commands (type these)
| Command | What it does |
|---|---|
| `/softonoma-orchestrator:new-project` | Put this project on the workflow: detect the stack, create CLAUDE.md + the standard `.claude/` structure, enable the matching packs, save the team. Never overwrites. |
| `/softonoma-orchestrator:upgrade-project` | Add only what an older setup is missing (lessons, change-log archive, CARRY-OVER, SETUP.md, team location, packs). |
| `/softonoma-orchestrator:orchestrate-feature team <name>: <feature + docs>` | Full pipeline: setup check → KB → plan → parallel build → test wave → 4 reviewers → browser verify → push once → PR → cleanup. Flags: `skip-worktree`, `skip-<agent>`. |
| `/softonoma-orchestrator:review-pr team <name>: <pr#> [module]` | Multi-agent PR review; consolidated BLOCKER/MAJOR/MINOR verdict. Flags: `skip-worktree`, `skip-<agent>`. |
| `/softonoma-orchestrator:pr-review-fix <pr#>` | Fix a PR's review comments until it is ready: only the PR's files, at most 3 rounds, one push per round. Never merges. |
| `/softonoma-orchestrator:figma-to-ui <figma link>` | Figma design → implemented, reviewed UI. |
| `/softonoma-orchestrator:release-readiness` | Go/no-go checklist, smoke tests, rollback plan before a release. |
| `/softonoma-orchestrator:agent-team-orc` | Team wizard (create/list/show/rename/delete). |
| `/softonoma-orchestrator:status` | Running teams/agents + task progress (read-only). |
| `/softonoma-orchestrator:help` | This reference. |

Run any command BARE to get a guided picker. Natural language works too: "set up this project", "review PR 142".

## Agents in the core (30)
- **Pipeline:** ba-analyst, legacy-analyst, planner, prototype-builder, frontend-dev, backend-dev, python-backend-dev, mobile-dev, integrations-dev, unit-test-engineer, e2e-playwright, browser-verifier.
- **Review:** code-reviewer, qa-reviewer, security-reviewer, performance-reviewer, db-performance-reviewer, architect-review.
- **Specialists:** debugger, error-detective, incident-responder, test-automator, tdd-orchestrator, accessibility-expert, ui-ux-designer, api-documenter, docs-architect, devops-vercel.
- **Haiku plumbing:** git-ops (commits, the push, PRs), clickup-ops (ClickUp or Jira updates).

## Packs (optional plugins; enable per project: `/plugin install <pack>@softonoma`)
| Pack | Agents | Skills |
|---|---|---|
| softonoma-languages | 13 | 3 |
| softonoma-frontend-frameworks | 0 | 36 |
| softonoma-mobile | 2 | 22 |
| softonoma-flutter | 1 | 22 |
| softonoma-cloud | 6 | 37 |
| softonoma-databases | 2 | 13 |
| softonoma-data-ai | 4 | 0 |
| softonoma-seo | 6 | 14 |
| softonoma-ops | 0 | 14 |
Total with the core: 64 agents, 263 skills. A project enables only its own stack's packs (fewer tokens per session).

## Skills (model-invoked automatically; force one with /softonoma-orchestrator:<skill>)
Process: project-onboard, orchestrate-feature, agent-team-orc, plan-lifecycle, kb-builder, product-kb, git-worktree-discipline, clickup-workflows, frd-builder, user-stories, to-spec, to-tickets, release-readiness, production-launch.
Review & quality: review-pr, pr-review-fix, find-bugs, security-audit, web-accessibility, core-web-vitals, web-performance, web-quality-audit, postgresql-code-review, sql-code-review.
Stack: Next.js, React, Tailwind, NestJS, FastAPI, Laravel, Prisma, Supabase, Drizzle, Postgres, MongoDB, Redis, BullMQ, Expo, Better Auth, Paymob, WebEngage, LiteAPI, Xero, Vercel.

## Scripts (in the plugin's scripts/)
- `worktree.sh new <feature> [base] | list | remove <feature> | port` — worktree + unique dev port
- `coverage-gate.sh [base-branch]` — coverage gate for the PR
- `kb-screenshots.mjs [baseURL] [--only <module/>]` — Playwright screenshots for the product KB
- `teams-monitor.mjs [--watch|--json]` — terminal view of running teams

## Hooks (always on)
- worktree-guard: blocks code edits on main/master/develop/staging/production in the primary checkout (docs, `.claude/`, `plans/`, `*.md` exempt; Windows paths supported; opt out per repo with `git config softonoma.worktreeGuard off`)
- block-secret-writes: blocks writing credentials and `.env` files
- task-gate: blocks task completion when lint/typecheck (JS/TS), compile/tests (Python) or pint (PHP) fail
- onboard-check (session start): in a project with no CLAUDE.md and no `.claude/`, reminds Claude to offer `new-project`; silent otherwise
