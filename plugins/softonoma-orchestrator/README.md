# softonoma-orchestrator

Multi-agent feature pipeline for Softonoma projects, built on Claude Code **Agent Teams**.
One prompt → legacy analysis → plan → parallel FE/BE build → parallel QA/security/perf review → PR → cleanup — **fully autonomous**, only pausing for genuine business decisions and the final merge.

> This plugin is **installed from a local clone of this repo** (see [Install](#install-step-by-step)). We are **not** publishing it to a public/remote marketplace — every developer clones the repo and adds it as a *local* marketplace.

---

## Requirements

- **Claude Code**, updated to a recent version (Agent Teams is required):
  ```bash
  claude update
  ```
- **git** on your PATH.
- **Node.js 18+** (only needed if you run the helper scripts in `scripts/`).
- **Agent Teams enabled** — see [step 2](#2-enable-agent-teams).

---

## Install (step by step)

> **Shortcut — install straight from GitHub (no clone needed):** do step 2 (enable agent teams), then inside a Claude Code session run
> `/plugin marketplace add sabi-hawk/softonoma-ai-plugin`, `/plugin install softonoma-orchestrator@softonoma`, `/reload-plugins`.
> Update later with `/plugin marketplace update softonoma`. The clone-based flow below is only needed when developing the plugin itself.

The install flow is the **same on Windows, macOS and Linux**. Only the clone folder and shell differ. Do it once per machine.

### 1. Pick a folder and clone the repo

Clone the repo somewhere permanent (you'll keep the clone around and `git pull` it for updates — don't delete it after installing).

**Windows (PowerShell):**
```powershell
cd $HOME
git clone https://github.com/sabi-hawk/softonoma-ai-plugin.git
# → clone lands at C:\Users\<you>\softonoma-ai-plugin
```

**macOS / Linux (bash/zsh):**
```bash
cd ~
git clone https://github.com/sabi-hawk/softonoma-ai-plugin.git
# → clone lands at ~/softonoma-ai-plugin
```

The plugin itself lives at `softonoma-ai-plugin/plugins/softonoma-orchestrator/`. Remember the full path to that folder — you'll point Claude Code at it in step 3.

### 2. Enable agent teams

Add the experimental flag to your **user** settings file:

- Windows: `C:\Users\<you>\.claude\settings.json`
- macOS / Linux: `~/.claude/settings.json`

```json
{
  "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }
}
```

If the file already has an `"env"` block, just add the key inside it.

### 3. Register the local marketplace and install the plugin

Open Claude Code (in any project), then run these **slash commands** inside the session. Point the marketplace at the plugin folder (the directory that contains `.claude-plugin/marketplace.json`).

> **Use forward slashes `/` in the path on every OS** — including Windows. Give the **full absolute path** to `plugins/softonoma-orchestrator`.

**Windows** (adjust `<you>`):
```
/plugin marketplace add C:/Users/<you>/softonoma-ai-plugin/plugins/softonoma-orchestrator
/plugin install softonoma-orchestrator@softonoma
```

**macOS / Linux:**
```
/plugin marketplace add ~/softonoma-ai-plugin/plugins/softonoma-orchestrator
/plugin install softonoma-orchestrator@softonoma
```

- `softonoma` is the **marketplace** name (from `marketplace.json`), `softonoma-orchestrator` is the **plugin** name.
- Tip: if you launched Claude Code from **inside** the clone, you can use a relative path instead: `/plugin marketplace add ./plugins/softonoma-orchestrator`.

### 4. Reload so the plugin activates

```
/reload-plugins
```

No restart needed. Verify it loaded:

```
/softonoma-orchestrator:help
```

You should see the command/skill reference. Done.

---

## Updating to new changes

When new changes land in the repo, update your **existing clone** — do **not** re-clone into a new folder.

**Windows (PowerShell):**
```powershell
cd $HOME\softonoma-ai-plugin
git pull
```

**macOS / Linux:**
```bash
cd ~/softonoma-ai-plugin
git pull
```

Then, inside a Claude Code session, refresh the marketplace metadata and reload:

```
/plugin marketplace update softonoma
/reload-plugins
```

If a reload alone doesn't pick up the new version, reinstall:

```
/plugin install softonoma-orchestrator@softonoma
/reload-plugins
```

**Or from any terminal (no session needed — works for GitHub installs too):**

```bash
claude plugin marketplace update softonoma
claude plugin update softonoma-orchestrator@softonoma
```

Then restart open Claude Code sessions to apply. `claude plugin list` shows the installed version.

## Reloading plugins

To re-apply plugin changes in a running session at any time (after an update, or after editing a skill/agent locally):

```
/reload-plugins
```

This reloads all active plugins without restarting Claude Code.

---

## Permissions (no "permission denied" on any OS)

The shell scripts used by this plugin's hooks are committed with the executable bit set, so hooks run cleanly on macOS and Linux out of the box. Windows ignores the exec bit and is unaffected.

If a macOS/Linux user ever sees a `permission denied` from a hook, restore the bit on the clone:

```bash
chmod +x ~/softonoma-ai-plugin/plugins/softonoma-orchestrator/scripts/*.sh
```

---

## Running a feature

> [!IMPORTANT]
> **Launch it right, or it won't be autonomous.** Open your Claude Code terminal **in the root folder of the target project** (not a subfolder, not this plugin repo), and start it in **bypass-permissions mode** — e.g. `claude --dangerously-skip-permissions`, or set `"permissions": { "defaultMode": "bypassPermissions" }` in the *project's* `.claude/settings.json`. Bypass mode lets the team run its own commands (git, npm, playwright, worktrees, scripts) unattended instead of pausing on per-tool permission prompts. Only use bypass mode in repos you trust.

With the terminal opened at the project root in bypass-permissions mode:

```
/softonoma-orchestrator:orchestrate-feature Policy Renewals module — legacy source ../blanka, FRD in ClickUp task ABC-123
```

Or just describe the feature in natural language; the lead follows the same pipeline and runs it hands-off to an open PR. The **final PR merge stays with you**; everything up to the open PR is automatic. Quality gates (≥90%/100% coverage, zero blockers, tests green) are enforced by looping, not by asking you.

**Models are pre-configured per agent** and tiered to keep Opus use low without losing quality: **Opus** for judgement (planner, qa-reviewer, security-reviewer, code-reviewer, architect-review, incident-responder), **Sonnet** for building and analysis, **Haiku** for plumbing (git-ops, clickup-ops, devops-vercel). Mechanical work (commits, the push, PRs, tracker updates) is routed to the Haiku agents. Override in an agent's frontmatter if you want.

**First time in a repo:** run `/softonoma-orchestrator:new-project`. It detects the stack, creates `CLAUDE.md` and the standard `.claude/` structure (rules, skills, agents, hooks, knowledge base with change log and lessons, plans with template and carry-over, `docs/SETUP.md`), enables the matching packs and saves the team at `.claude/teams/<name>.json`. `orchestrate-feature` also runs it automatically when the project has no setup. An older setup: `/softonoma-orchestrator:upgrade-project` (add-only). Everything is described in [`WORKFLOW.md`](WORKFLOW.md).

---

## Commands

Type these in Claude Code. Run any command **bare** (no args) for a guided wizard; natural language ("list my teams", "review PR 142") works too.

| Command | What it does |
|---|---|
| `/softonoma-orchestrator:new-project` | Put a project on the workflow: detect the stack, create the standard structure, enable packs, save the team (never overwrites) |
| `/softonoma-orchestrator:upgrade-project` | Add only what an older setup is missing |
| `/softonoma-orchestrator:agent-team-orc` | Team wizard — create / list / show / rename / delete a team for this project |
| `/softonoma-orchestrator:orchestrate-feature team <name>: <feature + docs>` | Full **autonomous** pipeline: BA/legacy → plan → parallel build → test wave (90%/100% coverage + Playwright) → QA/security/perf reviews → PR → cleanup. Only stops for genuine business decisions and the final merge |
| `/softonoma-orchestrator:review-pr team <name>: <pr#> [module]` | Multi-agent PR review with KB parity; consolidated BLOCKER/MAJOR/MINOR verdict. Flags `skip-worktree`, `skip-<agent>` |
| `/softonoma-orchestrator:pr-review-fix <pr#>` | Fix the PR's review comments: only the PR's files, at most 3 rounds, one push per round; never merges |
| `/softonoma-orchestrator:figma-to-ui <link>` | Figma design → implemented, reviewed UI |
| `/softonoma-orchestrator:status` | Running teams/agents + task progress (read-only, terminal) |
| `/softonoma-orchestrator:help` | Full command/skill/script/hook reference |

### Skills (model-invoked; force one with `/softonoma-orchestrator:<skill>`)
The lead auto-loads whichever skills fit the task. Notable groups: **Next.js/React** (nextjs-app-router-patterns, react-best-practices, nextjs-typescript, tailwind-design-system…), **data** (mongodb-*, redis-*), **auth** (better-auth-*), **integrations** (paymob-integration, webengage-integration, liteapi-integration), **legacy** (laravel-*, php-best-practices, nestjs-best-practices), **security** (security-audit, sentry-security-review, gha-security-review, pci-compliance), **process** (kb-builder, plan-lifecycle, writing-plans, commit, pr-writer). Full list: `/softonoma-orchestrator:help`.

### Scripts (`scripts/`, run with node/bash)
| Script | Purpose |
|---|---|
| `node scripts/teams-monitor.mjs [--watch\|--json]` | Terminal view of running teams |
| `bash scripts/worktree.sh new <feature> [base] \| list \| remove <feature>` | Worktree + unique dev port |
| `bash scripts/coverage-gate.sh [base-branch]` | Blocks PR below 90% coverage |
| `node scripts/kb-screenshots.mjs [baseURL]` | Playwright screenshots for the product KB |

### Hooks (always on)
- **worktree-guard** — blocks code edits on main/master/develop/staging/production in the primary checkout (docs, `.claude/`, `plans/`, `*.md` exempt; Windows paths supported since 0.24.0). Opt a repo out: `git config softonoma.worktreeGuard off`.
- **block-secret-writes** — blocks writing credentials and `.env` files.
- **task-gate** — blocks task completion if lint/typecheck (JS/TS), compile/tests (Python, using an interpreter that actually runs) or pint (PHP) fail.
- **onboard-check** (session start) — in a project with no `CLAUDE.md` and no `.claude/`, reminds Claude to offer `new-project`; silent everywhere else.

---

## Monitoring

- Default (all OS): in-process panel — ↑/↓ selects a teammate, Enter opens its transcript, Esc interrupts, Ctrl+T toggles the task list.
- macOS/Linux optional split panes: install tmux, then `claude --teammate-mode auto` (or set `"teammateMode": "auto"`). Not supported in Windows Terminal — Windows devs use in-process mode or WSL+tmux.

## Layout expected in each project repo

The standard structure `new-project` creates is in [`WORKFLOW.md`](WORKFLOW.md) §2 (`.claude/plans/{backlog,upcoming,inprogress,done}/`, `.claude/knowledgebase/`, …). Older projects with `plans/{upcoming,in-progress,done}/` and `knowledge-base/<module>/` at the repo root keep working: the pipeline resolves whichever layout exists.

## Notes

- Agent Teams is experimental: if the terminal dies, in-process teammates are lost. All state (KB, plans, tasks) lives on disk, so re-run the skill and continue.
- Token cost scales per teammate. The pipeline runs phases sequentially and only parallelizes where it pays (FE+BE, the three reviewers).
- One feature = one worktree = one team. Multiple features → multiple lead sessions.

## Agent roster

Core pipeline: ba-analyst, legacy-analyst, planner, frontend-dev, backend-dev, qa-reviewer, security-reviewer, performance-reviewer.
On-demand: prototype-builder (Figma/HTML prototypes), mobile-dev (React Native/Expo iOS+Android), python-backend-dev (FastAPI), integrations-dev (Paymob/WebEngage/LiteAPI), devops-vercel (infra, log drains, deploys), unit-test-engineer + e2e-playwright (test wave), db-performance-reviewer (DB/API performance gate on Prisma/Postgres work — run after every implementation wave that touches a schema, query, or endpoint).
The lead spawns only what the feature needs — 3–5 active teammates max.
Specialists in the core: architect-review, debugger, error-detective, incident-responder, test-automator, tdd-orchestrator, accessibility-expert, ui-ux-designer, api-documenter, docs-architect; Haiku plumbing: git-ops, clickup-ops (ClickUp or Jira). 30 agents and 102 skills in the core.

## Optional packs (enable per project)

| Pack | Agents | Skills | For |
|---|---|---|---|
| softonoma-languages | 13 | 3 | Go, Rust, Java, C#, PHP, Python/Django, GraphQL, shell |
| softonoma-frontend-frameworks | 0 | 36 | Angular, Vue/Nuxt, Svelte, Astro, Vite, pnpm/Turborepo |
| softonoma-mobile | 2 | 22 | React Native / Expo / EAS |
| softonoma-flutter | 1 | 22 | Flutter / Dart |
| softonoma-cloud | 6 | 37 | AWS, Azure, GCP, Terraform, Docker, Kubernetes, GitHub Actions |
| softonoma-databases | 2 | 13 | MariaDB, MySQL/Vitess, Oracle, Aurora, DynamoDB |
| softonoma-data-ai | 4 | 0 | LLM, ML, data pipelines |
| softonoma-seo | 6 | 14 | marketing websites |
| softonoma-ops | 0 | 14 | Axiom, ClickUp CU lifecycle, `/kb` viewer |

Total with the core: **64 agents, 263 skills**. Install one with `/plugin install <pack>@softonoma` then `/reload-plugins`; `new-project` enables them from the detected stack. Every enabled agent and skill adds its description to every session, which is why the rarely used ones are packs.

## Provenance

The packs and the 0.24.0 core additions come from the Alfred orchestrator 0.21.0 (MIT). Vendored skills keep their own `license:` field and "Vendored from" note; see [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md).
