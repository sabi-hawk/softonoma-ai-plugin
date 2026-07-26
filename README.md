# softonoma-ai-plugin

A home for all of Softonoma's Claude-related custom tooling — plugins, agents, skills, hooks, and workflows used across Softonoma engineering.

Right now it contains a single Claude Code plugin, **`softonoma-orchestrator`**. More custom Claude assets will be added here over time.

## Contents

| Path | What it is |
|------|-----------|
| [`plugins/softonoma-orchestrator/`](plugins/softonoma-orchestrator) | Multi-agent feature-delivery pipeline for Claude Code (13 agents, 79 skills, hooks, coverage/PR gates). |

## `softonoma-orchestrator`

A multi-agent feature pipeline for a modern web stack: **Next.js / Vercel / Tailwind / MongoDB / Redis**, with optional Paymob, WebEngage and LiteAPI integrations, plus legacy **Laravel/Vue** and **Node/NestJS** support.

It drives a feature end-to-end: BA & legacy analysis → prototyping → planning → parallel frontend / backend / integrations implementation → QA, security & performance review → PR gate.

### Agents (13)

`ba-analyst`, `legacy-analyst`, `prototype-builder`, `planner`, `frontend-dev`, `backend-dev`, `integrations-dev`, `unit-test-engineer`, `e2e-playwright`, `qa-reviewer`, `security-reviewer`, `performance-reviewer`, `devops-vercel`.

### Skills (79)

Grouped roughly by area:

- **Orchestration & workflow** — `agent-team-orc`, `orchestrate-feature`, `plan-lifecycle`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `to-spec`, `to-tickets`, `frd-builder`, `status`, `help`.
- **Frontend / Next.js / React** — `nextjs-app-router-patterns`, `nextjs-typescript`, `next-dev-loop`, `next-cache-components-optimizer`, `react-best-practices`, `react-state-management`, `frontend-design`, `responsive-design`, `design-system-patterns`, `tailwind-design-system`, `web-design-guidelines`.
- **Backend / data** — `laravel-best-practices`, `laravel-database-optimization`, `laravel-inertia-react`, `laravel-owasp-security`, `laravel-queues`, `nestjs-best-practices`, `php-best-practices`, `mongodb-connection`, `mongodb-query-optimizer`, `mongodb-schema-design`, `redis-core`, `redis-connections`, `redis-security`, `database-migration`.
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
├── skills/                  # 79 skills
├── hooks/hooks.json         # lifecycle hooks
├── scripts/                 # coverage/task gates, worktree helpers, team monitor
├── tests/                   # plugin tests
└── .mcp.json                # MCP servers (ClickUp)
```

## Installation

Install from a **local clone** of this repo (we don't publish it to a remote marketplace). The marketplace manifest lives inside the plugin folder, so point Claude Code at `plugins/softonoma-orchestrator`, not the repo root:

```bash
# 1. clone (keep the clone — you'll git pull it for updates)
git clone https://github.com/sabi-hawk/softonoma-ai-plugin.git

# 2. inside a Claude Code session (use the full path to the plugin folder):
/plugin marketplace add <path-to>/softonoma-ai-plugin/plugins/softonoma-orchestrator
/plugin install softonoma-orchestrator@softonoma
/reload-plugins
```

Full step-by-step instructions for Windows, macOS and Linux — plus how to update and reload — are in [`plugins/softonoma-orchestrator/README.md`](plugins/softonoma-orchestrator/README.md).

## Contributing

Add new Claude customizations (plugins, standalone skills, agents) under a clear top-level folder and update this README's contents table.

## Credits

Adapted from the open-source `alfred-orchestrator` plugin by InsuranceMarket.ae / AlfredHoldings (MIT licensed) and rebranded for Softonoma. See [`LICENSE`](LICENSE).
