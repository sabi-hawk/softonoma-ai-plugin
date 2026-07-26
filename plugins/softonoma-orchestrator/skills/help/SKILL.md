---
name: help
description: Show what the softonoma-orchestrator plugin can do — commands, skills, scripts, hooks. Use when the user asks "help", "list commands", "what can this plugin do", "show plugin commands", or /softonoma-orchestrator:help.
---

# softonoma-orchestrator — Help

Print this reference (compact, adapt to what they asked):

## Commands (type these)
| Command | What it does |
|---|---|
| `/softonoma-orchestrator:agent-team-orc` | Team wizard menu (create/list/rename/delete, option-picker UI) |
| `/softonoma-orchestrator:agent-team-orc list` | List teams in this project |
| `/softonoma-orchestrator:agent-team-orc show <name>` | Show one team's config |
| `/softonoma-orchestrator:agent-team-orc delete <name>` | Delete a team (keeps plans/KB) |
| `/softonoma-orchestrator:agent-team-orc rename <old> <new>` | Rename a team |
| `/softonoma-orchestrator:orchestrate-feature team <name>: <feature + docs>` | Full pipeline: KB → plan (gated) → parallel build → test wave (90%/100% coverage + Playwright) → reviews → PR → human gate → cleanup |
| `/softonoma-orchestrator:review-pr team <name>: <pr#> [module]` | Multi-agent PR review with KB parity check; consolidated BLOCKER/MAJOR/MINOR verdict |
| `/softonoma-orchestrator:status` | Show running teams/agents + task progress (read-only) |
| `/softonoma-orchestrator:help` | This reference |

Run any command BARE (no arguments) to get a guided wizard — team, feature/PR, sources all as pickers. All plugin questions use the built-in option picker (arrow keys / multi-select) with "Other" for free text. Natural language works too: "list my teams", "delete team X", "review PR 142".

## Agents (13 — spawned by the lead per feature, defined in the plugin)
ba-analyst, legacy-analyst, planner, prototype-builder, frontend-dev, backend-dev, integrations-dev, unit-test-engineer, e2e-playwright, qa-reviewer, security-reviewer, performance-reviewer, devops-vercel

## Skills (model-invoked automatically; force one with /softonoma-orchestrator:<skill>)
Process: kb-builder, product-kb, plan-lifecycle, git-worktree-discipline, clickup-workflows, frd-builder.
Tech: react-best-practices, nextjs-app-router-patterns, react-state-management, tailwind-design-system, frontend-design, web-design-guidelines, composition-patterns, responsive-design, design-system-patterns, api-design-principles, architecture-patterns, pci-compliance, sast-configuration, threat-mitigation-mapping, database-migration, dependency-upgrade, webapp-testing, vercel-optimize.

## Scripts (bash/node, in the plugin's scripts/)
- `worktree.sh new <feature> [base] | list | remove <feature> | port` — worktree + unique dev port
- `coverage-gate.sh [base-branch]` — blocks PR below 90% coverage
- `kb-screenshots.mjs [baseURL] [--only <module/>]` — Playwright screenshots for the product KB
- `teams-monitor.mjs [--watch|--json]` — terminal view of running teams

## Hooks (always on, enforce automatically)
- worktree-guard: blocks code edits on main/develop in the primary checkout (config/docs exempt)
- task-gate: blocks task completion if lint/typecheck fail
