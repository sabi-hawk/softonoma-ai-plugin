# The Softonoma AI workflow — how every project works

This is the one instruction file for the softonoma-orchestrator plugin (0.24.0+). `project-onboard` copies it
into each project as `.claude/WORKFLOW.md`, so the instructions travel with the repo: a new laptop or a lost
chat changes nothing.

---

## 1. Commands

| You want to | Run |
|---|---|
| Put a **new or existing project** on the workflow (creates the whole structure) | `/softonoma-orchestrator:new-project` |
| Bring an **older setup** up to the current structure (adds only what is missing, never overwrites) | `/softonoma-orchestrator:upgrade-project` |
| Build a feature with the full agent pipeline | `/softonoma-orchestrator:orchestrate-feature <feature + link or doc>` |
| Review a PR (multi-agent) | `/softonoma-orchestrator:review-pr <pr#>` (flags: `skip-worktree`, `skip-<agent>`) |
| Fix a PR's review comments until it is ready (at most 3 rounds) | `/softonoma-orchestrator:pr-review-fix <pr#>` |
| Create or change the agent team | `/softonoma-orchestrator:agent-team-orc` |
| See what is running | `/softonoma-orchestrator:status` |
| See everything the plugin can do | `/softonoma-orchestrator:help` |
| Add a stack pack to a project | `/plugin install <pack>@softonoma`, then `/reload-plugins` |
| Get the latest plugin | `/plugin marketplace update softonoma`, then `/reload-plugins` |

**Automatic:** when a session starts in a folder with no `CLAUDE.md` and no `.claude/`, the plugin tells
Claude the project is not set up, and `orchestrate-feature` runs `new-project` itself before any feature.
Nothing is created without a run of the orchestrator or one of the commands above.

---

## 2. What `new-project` creates (the standard structure)

```
<project>/
├── CLAUDE.md                     ← the map: prime directive, golden rules, the workflow, commands
├── docs/
│   └── SETUP.md                  ← what a new machine needs (tools, env files, accounts)
└── .claude/
    ├── WORKFLOW.md               ← this file
    ├── settings.json             ← permissions, secret deny-list, hooks, plugin + packs
    ├── DEVELOPER-GUIDE.md        ← the human's operating manual
    ├── hooks/block-secret-writes.mjs
    ├── rules/                    ← security · testing · conventions · git · change-log (+ design-language for UI)
    │                               one line per rule; area-specific rules carry `paths:` so they load only when needed
    ├── skills/                   ← feature-workflow · deep-research · pr-review-cycle (+ db-change, browser-verify,
    │                               qa-review, find-skills when they apply)
    ├── agents/                   ← context-gatherer · pr-reviewer · security-reviewer · quality-reviewer · professional-qa
    ├── teams/<team>.json         ← the agent roster for the plugin pipeline
    ├── plans/
    │   ├── backlog/ upcoming/ inprogress/ done/
    │   ├── README.md  TEMPLATE.md  CARRY-OVER.md
    ├── database/database.md      ← the data-model index (only when there is a database)
    └── knowledgebase/
        ├── README.md             ← index: product, rules, status, modules
        ├── 07-change-log.md      ← what was done, newest first (current month only)
        ├── 07-change-log-archive/← older months, verbatim
        ├── lessons/              ← the story behind each rule
        ├── modules/              ← durable "how it works now", one per module
        └── research/             ← dossiers written before building
```

A multi-repo product gets ONE shared `.claude/` in a workspace repo that holds the product repos side by side
(git-ignored): never one `.claude/` per repo.

---

## 3. The loop every change follows

1. **Sync** with the remote (before starting, before believing a gate, before pushing).
2. **Research first** (`deep-research` for anything new or unclear; `context-gatherer` for small changes).
3. **Plan file** `.claude/plans/inprogress/<TICKET>.md` from `TEMPLATE.md`; a change to a rule gets the
   **case table first** (situation → expected result → the test that pins it).
4. **Branch** from the base branch.
5. **Implement in small slices**; each subagent brief names the files it may edit.
6. **Test first**, see it fail once, then **the gate** (type-check, lint, tests, build).
7. **Review with subagents**, tiered by risk.
8. **Verify for real**: the browser for UI, the response for an API. Until then it is "implemented and green".
9. **Sync the KB** and write the `07-change-log.md` entry, in the same change.
10. **Push once**, open the PR, run the **AI review cycle** (at most 3 rounds).
11. **The developer tests and merges.** Agents never merge. On merge the plan moves to `done/`.

---

## 4. Plugins: the core and the packs (64 agents, 263 skills in total)

| Plugin | Agents | Skills | Enable when |
|---|---|---|---|
| `softonoma-orchestrator` (core) | 30 | 102 | always |
| `softonoma-languages` | 13 | 3 | Go, Rust, Java, C#, PHP, Python/Django, GraphQL, shell work beyond the core builders |
| `softonoma-frontend-frameworks` | 0 | 36 | Angular, Vue/Nuxt, Svelte, Astro, Vite, pnpm/Turborepo monorepos |
| `softonoma-mobile` | 2 | 22 | React Native / Expo / EAS |
| `softonoma-flutter` | 1 | 22 | Flutter / Dart |
| `softonoma-cloud` | 6 | 37 | AWS, Azure, Google Cloud, Terraform, Docker, Kubernetes, GitHub Actions |
| `softonoma-databases` | 2 | 13 | MariaDB, MySQL/Vitess, Oracle migrations, Aurora, DynamoDB, schema architecture |
| `softonoma-data-ai` | 4 | 0 | LLM features, ML, data pipelines, analytics |
| `softonoma-seo` | 6 | 14 | public marketing websites |
| `softonoma-ops` | 0 | 14 | Axiom logs, the ClickUp CU lifecycle, an in-app `/kb` viewer |

**Why packs:** every enabled agent and skill puts its description into every session. Claude Code keeps the
skill list within about 1% of the context window and drops descriptions past that, and warns when agent
descriptions pass 15,000 tokens. So a project enables only the packs for its own stack; `new-project`
picks them from what it detects (`package.json`, `pubspec.yaml`, `*.tf`, `go.mod`, …).

---

## 5. Models and tokens

- Each agent has a fixed model: **Opus** for judgement (planner, reviewers, architect-review, incident-responder),
  **Sonnet** for building and analysis, **Haiku** for plumbing (`git-ops`, `clickup-ops`, `devops-vercel`).
- **Mechanical work goes to the Haiku agents**: commits, the push, PRs, tracker updates.
- **Push once** per feature (and once per review round): every push runs hooks and usually a preview deploy.
- **Plain subagents by default**; agent teams only for large multi-repo work, kept small (teams cost several
  times the tokens of one session).
- **Rules stay short and scoped**: one line each, stories in `lessons/`, `paths:` on area-specific rules.
- **The change log holds the current month**; read its top, grep the archive.

---

## 6. Safety rails

- The **worktree guard** blocks code edits on `main`/`master`/`develop`/`staging`/`production` in a primary
  checkout (docs, `.claude/`, `plans/` and `*.md` are always allowed; Windows paths supported). Opt a repo out:
  `git config softonoma.worktreeGuard off`.
- The **secret hook** blocks writes of credentials and `.env` files.
- The **task gate** runs lint/typecheck (JS/TS), compile/tests (Python) or pint (PHP) when a task completes.
- **Read-only agents** never change git state; **agents never merge**; the developer decides releases.
