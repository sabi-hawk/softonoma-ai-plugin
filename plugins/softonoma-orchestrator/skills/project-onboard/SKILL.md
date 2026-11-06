---
name: project-onboard
description: Start or adopt a project with the Softonoma AI workflow — creates the standard structure (CLAUDE.md, .claude/ rules, skills, agents, hooks, settings, knowledge base with change log and lessons, plans with template and carry-over, docs/SETUP.md, the agent team) and enables the plugin packs that match the detected stack. Use for a brand-new project, an existing repo with no AI setup, a multi-repo workspace, or (Mode D) bringing an older setup up to the current structure without overwriting anything. Triggers on "new project", "start from scratch", "set up the workflow", "onboard this project", "initialize AI workflow", "adopt the plugin", "bootstrap", "multi-repo", "workspace setup", "no CLAUDE.md yet", "upgrade the setup", /softonoma-orchestrator:new-project, /softonoma-orchestrator:upgrade-project.
metadata:
  version: "2.0.0"
---

# Project Onboarding (Softonoma)

One entry point for putting a project on the Softonoma AI workflow. The target structure and the loop are
defined in `${CLAUDE_PLUGIN_ROOT}/WORKFLOW.md`; the templates live in `assets/workflow-kit/templates/`
inside this skill (`{{PLACEHOLDER}}`s) — **adapt, don't transcribe**: fill every placeholder with real
values, rewrite prose for THIS project, drop what does not apply.

## Safety rules (all modes)
- **Never overwrite** an existing file. If a target exists, leave it and list it under "kept as is" (Mode D
  may append a clearly marked section only when the owner approves the list).
- **Never read, print or copy secrets** (`.env*` except `.env.example`, keys). Record env KEYS and where they
  come from, never values.
- Write only inside the project root (and the workspace root in Mode C). Do not push; commit only if the
  owner's git policy says so (otherwise leave the files for review).

## Choose the mode
Infer it; ask (AskUserQuestion) only when it is genuinely unclear.

| Mode | When |
|------|------|
| **A. New project from scratch** | An empty folder, or the owner asks for a new app. |
| **B. Existing single repo** | Code exists; no `CLAUDE.md` and no `.claude/`. |
| **C. Multi-repo workspace** | One product spans several repos that must share one context. |
| **D. Upgrade an existing setup** | `CLAUDE.md` or `.claude/` already exists (`/softonoma-orchestrator:upgrade-project`). |

## Step 1 — Learn the project (read-only, all modes)
Stack and package manager, structure, data layer, run/test/build/lint commands, git conventions (default and
base branch, identity, remote), how requirements arrive (chat, Jira, ClickUp), sensitive files.

**Detect the stack → choose the packs** (core `softonoma-orchestrator` is always on):

| Signal in the repo | Pack |
|---|---|
| `@angular/core`, `vue`, `nuxt`, `svelte`, `astro`, a Vite app without Next.js, `pnpm-workspace.yaml`, `turbo.json` | `softonoma-frontend-frameworks` |
| `expo`, `react-native`, `eas.json`, `app.json` with an `expo` key | `softonoma-mobile` |
| `pubspec.yaml` | `softonoma-flutter` |
| `*.tf`, `cdk.json`, `serverless.yml`, SAM `template.yaml`, `azure.yaml`, `cloudbuild.yaml`, Kubernetes manifests, a `Dockerfile` deployed outside Vercel | `softonoma-cloud` |
| `mysql2`, `mariadb`, `oracledb`, DynamoDB clients, a Prisma `provider = "mysql"`, Vitess | `softonoma-databases` |
| `go.mod`, `Cargo.toml`, `pom.xml`/`build.gradle`, `*.csproj`, Django, a GraphQL server | `softonoma-languages` |
| `openai`, `@anthropic-ai/sdk`, `langchain`, `torch`, `scikit-learn`, notebooks, data pipelines | `softonoma-data-ai` |
| A public marketing site (Sanity/Contentful CMS, `next-sitemap`, the owner says SEO matters) | `softonoma-seo` |
| `next-axiom`/`@axiomhq`, ClickUp as the tracker, an in-app `/kb` viewer wanted | `softonoma-ops` |

Next.js, NestJS, FastAPI, Laravel, Prisma, Supabase, Drizzle, MongoDB, Redis, BullMQ, Expo basics, Playwright
and Vercel are covered by the core: no pack needed.

## Step 2 — Confirm only what you cannot infer (one batched AskUserQuestion)
The "done" gate, git identity and push/PR policy (default: push once, the agent opens the PR, the developer
tests and merges), the timezone for change-log entries, hard rules that must never break, **browser E2E
testing (Playwright) yes/no**, and the packs you chose (pre-selected; the owner may add or remove).

## Step 3 — Create the structure (Modes A, B, C)
Create exactly the tree in `WORKFLOW.md` §2, from the templates:

| Target | Template |
|---|---|
| `CLAUDE.md` | `CLAUDE.md.template` |
| `.claude/WORKFLOW.md` | copy `${CLAUDE_PLUGIN_ROOT}/WORKFLOW.md` verbatim |
| `.claude/DEVELOPER-GUIDE.md` | `DEVELOPER-GUIDE.md.template` |
| `.claude/settings.json` | `settings.json.template`: real allow-list commands; `{{PACK_LINES}}` = one `,\n    "<pack>@softonoma": true` per chosen pack |
| `.claude/hooks/block-secret-writes.mjs` | `hooks/block-secret-writes.mjs` (as is) |
| `.claude/rules/{security,testing,conventions,git,change-log}.md` | `rules/*.template` (one line per rule; area-only rules get `paths:` frontmatter) |
| `.claude/skills/{feature-workflow,deep-research,pr-review-cycle}/SKILL.md` (+ `db-change`, `browser-verify`, `qa-review`, `find-skills` when they apply) | `skills/*` |
| `.claude/agents/{context-gatherer,pr-reviewer,security-reviewer,quality-reviewer,professional-qa}.md` | `agents/*.template` |
| `.claude/plans/{backlog,upcoming,inprogress,done}/` + `README.md`, `TEMPLATE.md`, `CARRY-OVER.md` | `plans/*` (empty folders get a `.gitkeep`) |
| `.claude/knowledgebase/README.md`, `modules/`, `research/README.md`, `lessons/README.md`, `07-change-log.md`, `07-change-log-archive/README.md` | `knowledgebase/*` (`frds/` and `reference/` only for large multi-module initiatives) |
| `.claude/database/database.md` | `database/database.md.template` (only when there is a database) |
| `docs/SETUP.md` | `docs/SETUP.md.template` |
| `.gitignore` additions | secrets patterns (`.env`, `.env.*`, `!.env.example`, `*.pem`, `*.key`) |

**Mode A** first scaffolds the repo (git init, framework, lint/typecheck/test scripts, `.env.example`), then
runs Step 3. **Mode C** creates a `<product>-workspace` repo holding root `CLAUDE.md`, the ONE shared
`.claude/`, `docs/`, and a bootstrap script that clones the product repos side by side (git-ignored there);
always launch Claude Code from the workspace root.

## Step 4 — Seed the knowledge base from reality (Modes B, C)
The highest-value step. Read the actual code; write per-module "how it works now" docs in
`knowledgebase/modules/` citing real paths; index the schema in `database/database.md`; fill
`docs/SETUP.md` from `.env.example` and the README.

## Step 5 — Team, gate, log
1. Run **agent-team-orc** to save the roster at `.claude/teams/<team>.json` (core agents + the chosen packs'
   specialists that fit), defaults `teammateModel: sonnet`, `maxParallel: 4`.
2. Dry-run the gate so it is known green; check every hook command path resolves.
3. Write the first `07-change-log.md` entry (the template's onboarding entry), with the clock interpolated in
   the heading command.
4. Tell the owner: what was created, the packs enabled, every assumption, and the one step left to them —
   `/plugin install <pack>@softonoma` for each pack if Claude Code did not offer it, then `/reload-plugins`.

## Mode D — Upgrade an existing setup (add-only)
1. Compare the project against `WORKFLOW.md` §2 and list what is **missing** (e.g. no `CARRY-OVER.md`, no
   `lessons/`, no `07-change-log-archive/`, no `docs/SETUP.md`, no `.claude/WORKFLOW.md`, a team file at the
   old `.claude/softonoma-team.json` instead of `.claude/teams/`, rules without `paths:` that are area-only,
   a change log over ~1 MB, packs the stack needs but `settings.json` does not enable).
2. Show the list with AskUserQuestion (multi-select, all pre-selected, plus "Other").
3. Create only the approved missing pieces from the templates. Never rewrite an existing file: an old team file
   is COPIED to `.claude/teams/<name>.json` (the original stays); a large change log is split into the archive
   only with the owner's yes, verbatim, verified by reassembly.
4. Log the upgrade in `07-change-log.md` and report what was added and what was kept as is.

## Principles
- **Lightweight first**: match how the owner works; no ceremony they did not ask for.
- **The repo is the memory**: rules, KB, plans and the change log, never a chat.
- **Decide vs ask**: proceed on reversible details and note them; ask only on irreversible, costly or
  conflicting calls.
- **Guardrails as code**: secret hook, worktree guard, encoded hard rules, a review pass, the gate.
- **Verify for real**: green tests are not "done".
