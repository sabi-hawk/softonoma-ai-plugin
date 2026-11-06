# softonoma-ai-plugin

A home for all of Softonoma's Claude-related custom tooling: one marketplace (`softonoma`) holding the
**`softonoma-orchestrator`** plugin (the core, enabled in every project) and nine optional **packs**
enabled per project by stack.

## Contents

| Path | What it is |
|------|-----------|
| [`plugins/softonoma-orchestrator/`](plugins/softonoma-orchestrator) | The core: multi-agent feature pipeline, project onboarding, team wizard, hooks and gates. **30 agents, 102 skills.** |
| [`plugins/softonoma-languages/`](plugins/softonoma-languages) | Language specialists (Go, Rust, Java, C#, PHP, Python/Django, GraphQL, shell). 13 agents, 3 skills. |
| [`plugins/softonoma-frontend-frameworks/`](plugins/softonoma-frontend-frameworks) | Angular, Vue/Nuxt, Svelte, Astro, Vite, pnpm/Turborepo. 36 skills. |
| [`plugins/softonoma-mobile/`](plugins/softonoma-mobile) | React Native / Expo / EAS. 2 agents, 22 skills. |
| [`plugins/softonoma-flutter/`](plugins/softonoma-flutter) | Flutter / Dart. 1 agent, 22 skills. |
| [`plugins/softonoma-cloud/`](plugins/softonoma-cloud) | AWS, Azure, Google Cloud, Terraform, Docker, Kubernetes, GitHub Actions. 6 agents, 37 skills. |
| [`plugins/softonoma-databases/`](plugins/softonoma-databases) | MariaDB, MySQL/Vitess, Oracle, Aurora, DynamoDB, schema architecture. 2 agents, 13 skills. |
| [`plugins/softonoma-data-ai/`](plugins/softonoma-data-ai) | AI, ML and data agents. 4 agents. |
| [`plugins/softonoma-seo/`](plugins/softonoma-seo) | SEO and content for marketing websites. 6 agents, 14 skills. |
| [`plugins/softonoma-ops/`](plugins/softonoma-ops) | Axiom, the ClickUp CU lifecycle, the `/kb` viewer. 14 skills. |

**Total: 64 agents, 263 skills.** A project enables the core plus only the packs for its stack, because every
enabled agent and skill adds its description to every session.

**How every project works** (commands, the structure onboarding creates, the loop, models and tokens, safety
rails): [`plugins/softonoma-orchestrator/WORKFLOW.md`](plugins/softonoma-orchestrator/WORKFLOW.md).

## Installation

**From GitHub (recommended)**, inside any Claude Code session:
```
/plugin marketplace add sabi-hawk/softonoma-ai-plugin
/plugin install softonoma-orchestrator@softonoma
/reload-plugins
```
**From a local clone** (when developing the plugin itself):
```
git clone https://github.com/sabi-hawk/softonoma-ai-plugin.git
/plugin marketplace add <path-to>/softonoma-ai-plugin
/plugin install softonoma-orchestrator@softonoma
/reload-plugins
```
Packs: `/plugin install <pack>@softonoma`, then `/reload-plugins` (or let `new-project` enable them).

## Starting a project

Open Claude Code at the project's root and run:
```
/softonoma-orchestrator:new-project
```
It detects the stack, creates `CLAUDE.md` and the standard `.claude/` structure, enables the matching packs and
saves the agent team, without overwriting anything. An older setup: `/softonoma-orchestrator:upgrade-project`.
`/softonoma-orchestrator:orchestrate-feature` also runs onboarding by itself when a project has no setup.

## Updating (every developer machine)

```
/plugin marketplace update softonoma
/reload-plugins
```
(or from a terminal: `claude plugin marketplace update softonoma` then `claude plugin update softonoma-orchestrator@softonoma`, and restart open sessions). Check what is installed with `claude plugin list`.

Full step-by-step instructions for Windows, macOS and Linux are in
[`plugins/softonoma-orchestrator/README.md`](plugins/softonoma-orchestrator/README.md).

## Tests

```
cd plugins/softonoma-orchestrator && npm test
```
Covers the scripts and hooks (worktree guard incl. Windows paths, task gate, onboarding check, coverage gate),
every agent and skill in the core and the packs (frontmatter, models, script paths, cross-plugin skill
references), the marketplace (every plugin folder listed, names match) and the 64/263 totals.

## Contributing

Add a skill or agent to the core only when most projects need it; otherwise put it in the matching pack (or a
new pack listed in `.claude-plugin/marketplace.json`). Keep descriptions short: they load into every session.

## Credits

Adapted from the open-source `alfred-orchestrator` plugin by InsuranceMarket.ae / AlfredHoldings (MIT licensed)
and extended for Softonoma. See [`LICENSE`](LICENSE) and [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
