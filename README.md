# softonoma-ai-plugin

A home for all of Softonoma's Claude-related custom tooling — plugins, agents, skills, hooks, and workflows used across Softonoma engineering.

Right now it contains a single Claude Code plugin, **`softonoma-orchestrator`**. More custom Claude assets will be added here over time.

## Contents

| Path | What it is |
|------|-----------|
| [`plugins/softonoma-orchestrator/`](plugins/softonoma-orchestrator) | Multi-agent feature-delivery pipeline for Claude Code (13 agents, 82 skills, hooks, coverage/PR gates). |

## `softonoma-orchestrator`

A multi-agent feature pipeline for a modern web stack: **Next.js / Vercel / Tailwind**, **Supabase (Postgres / RLS / Auth)**, **Prisma**, **MongoDB / Redis** and **NestJS**, with optional Paymob, WebEngage and LiteAPI integrations, plus legacy **Laravel/Vue** support.

It drives a feature end-to-end: BA & legacy analysis → prototyping → planning → parallel frontend / backend / integrations implementation → QA, security & performance review → PR gate.

**Starting or adopting a project?** The `project-onboard` skill is the entry point. It covers three modes: **(A)** a brand-new project the AI scaffolds from scratch, **(B)** an existing repo that has no AI workflow yet (learn the codebase → generate a tailored `CLAUDE.md` + `.claude/` → seed the knowledge base from real code → wire the gates), and **(C)** a multi-repo product sharing one `.claude/` via a workspace repo. It vendors the Softonoma **AI Workflow Kit** templates (knowledge base, rules, review agents, feature-workflow loop, secret-blocking hook) so any project ends up on the same disciplined setup.

### Agents (13)

`ba-analyst`, `legacy-analyst`, `prototype-builder`, `planner`, `frontend-dev`, `backend-dev`, `integrations-dev`, `unit-test-engineer`, `e2e-playwright`, `qa-reviewer`, `security-reviewer`, `performance-reviewer`, `devops-vercel`.

### Skills (82)

Grouped roughly by area:

- **Orchestration & workflow** — `project-onboard`, `agent-team-orc`, `orchestrate-feature`, `plan-lifecycle`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `to-spec`, `to-tickets`, `frd-builder`, `status`, `help`.
- **Frontend / Next.js / React** — `nextjs-app-router-patterns`, `nextjs-typescript`, `next-dev-loop`, `next-cache-components-optimizer`, `react-best-practices`, `react-state-management`, `frontend-design`, `responsive-design`, `design-system-patterns`, `tailwind-design-system`, `web-design-guidelines`.
- **Backend / data** — `supabase-patterns`, `prisma-postgres`, `laravel-best-practices`, `laravel-database-optimization`, `laravel-inertia-react`, `laravel-owasp-security`, `laravel-queues`, `nestjs-best-practices`, `php-best-practices`, `mongodb-connection`, `mongodb-query-optimizer`, `mongodb-schema-design`, `redis-core`, `redis-connections`, `redis-security`, `database-migration`.
- **Integrations** — `paymob-integration`, `webengage-integration`, `liteapi-integration`, `better-auth-best-practices`, `better-auth-create-auth`, `better-auth-security`, `better-auth-two-factor`.
- **Architecture & design** — `architecture-patterns`, `api-design-principles`, `codebase-design`, `codebase-research`, `domain-modeling`, `composition-patterns`, `improve-codebase-architecture`.
- **Quality, testing & review** — `test-driven-development`, `webapp-testing`, `playwright-cli`, `find-bugs`, `diagnosing-bugs`, `systematic-debugging`, `requesting-code-review`, `receiving-code-review`, `review-pr`, `pr-writer`, `commit`, `verification-before-completion`, `setup-pre-commit`, `dependency-upgrade`.
- **Security** — `security-audit`, `sast-configuration`, `gha-security-review`, `sentry-security-review`, `pci-compliance`, `threat-mitigation-mapping`.
- **Knowledge & tooling** — `brainstorming`, `kb-builder`, `product-kb`, `skill-writer`, `skill-scanner`, `clickup-workflows`, `git-worktree-discipline`, `prototype`, `vercel-optimize`.

### Layout

```
plugins/softonoma-orchestrator/
├── .claude-plugin/
│   ├── plugin.json          # plugin manifest
│   └── marketplace.json     # marketplace entry
├── agents/                  # 13 subagent definitions
├── skills/                  # 82 skills
├── hooks/hooks.json         # lifecycle hooks
├── scripts/                 # coverage/task gates, worktree helpers, team monitor
├── tests/                   # plugin tests
└── .mcp.json                # MCP servers (ClickUp)
```

## Installation

**Option 1 — straight from GitHub (recommended).** The repo root carries a marketplace manifest, so inside any Claude Code session:

```
/plugin marketplace add sabi-hawk/softonoma-ai-plugin
/plugin install softonoma-orchestrator@softonoma
/reload-plugins
```

**Option 2 — from a local clone** (useful when developing the plugin itself):

```bash
# 1. clone (keep the clone — you'll git pull it for updates)
git clone https://github.com/sabi-hawk/softonoma-ai-plugin.git

# 2. inside a Claude Code session (repo root or the plugin folder both work):
/plugin marketplace add <path-to>/softonoma-ai-plugin
/plugin install softonoma-orchestrator@softonoma
/reload-plugins
```

Full step-by-step instructions for Windows, macOS and Linux — plus how to update and reload — are in [`plugins/softonoma-orchestrator/README.md`](plugins/softonoma-orchestrator/README.md).

## Contributing

Add new Claude customizations (plugins, standalone skills, agents) under a clear top-level folder and update this README's contents table.

## Credits

Adapted from the open-source `alfred-orchestrator` plugin by InsuranceMarket.ae / AlfredHoldings (MIT licensed) and rebranded for Softonoma. See [`LICENSE`](LICENSE).
