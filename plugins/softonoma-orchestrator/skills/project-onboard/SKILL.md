---
name: project-onboard
description: Start or adopt a project with the Softonoma AI workflow. Use when creating a brand-new project from scratch, introducing this plugin/workflow into an existing repo that has no AI setup, or setting up a multi-repo workspace with one shared .claude. Triggers on "new project", "start from scratch", "set up the workflow", "onboard this project", "initialize AI workflow", "adopt the plugin", "bootstrap", "install workflow", "multi-repo", "workspace setup", "no CLAUDE.md yet".
metadata:
  version: "1.0.0"
---

# Project Onboarding (Softonoma)

One entry point for putting a project on the Softonoma AI workflow. First decide the
**mode** — ask the owner if it isn't obvious from context:

| Mode | When |
|------|------|
| **A. New project from scratch** | Nothing exists yet — the AI scaffolds the repo itself (like the Softonoma portal was built). |
| **B. Existing single repo** | A codebase exists but has no (or outdated) `.claude/` / `CLAUDE.md`. |
| **C. Multi-repo workspace** | One product spans several repos (like Dental2You: backend + frontend + admin) that must share one context. |

All modes end the same way: a tailored `CLAUDE.md` + `.claude/` (knowledge base, rules,
skills, hooks, settings), a saved agent-team roster, and a verified quality gate.
The generic templates live in `assets/workflow-kit/` inside this skill (README, INSTALL,
templates with `{{PLACEHOLDER}}`s) — **adapt, don't transcribe**.

## Mode A — new project from scratch

1. **Discover.** Batch the owner questions once: product goal & domain, target stack
   (default Softonoma stack: Next.js App Router + TypeScript strict + Tailwind +
   Supabase Postgres/Auth/RLS, or NestJS + Prisma for a standalone API — see
   `supabase-patterns` / `prisma-postgres` skills), deploy target (Vercel default),
   repo name/remote, gate for "done", and **browser E2E testing (Playwright)? yes/no**
   — yes wires Playwright config + the `e2e-playwright` agent into the team from day one.
2. **Scaffold.** Create the repo (git init, default branch), framework scaffold,
   lint/typecheck/test scripts, `.env.example`, `.gitignore` (secrets patterns), CI if asked.
3. **Install the workflow** — run Mode B steps 3–5 on the fresh scaffold.
4. **First feature via the pipeline.** Prove the loop end-to-end with `orchestrate-feature`
   on a small starter feature before parallelizing bigger work.

## Mode B — existing repo, no workflow yet

Follow `assets/workflow-kit/INSTALL.md` (authoritative detail). Condensed:

1. **Learn the project — read-only.** Stack, package manager, structure, data layer,
   run/test/build/lint commands, git conventions, sensitive files.
2. **Confirm only what you can't infer** (one batched ask): how requirements arrive
   (chat vs tickets vs FRDs → how heavy the plan lifecycle should be), the "done" gate,
   git identity/push policy, hard rules that must never break, and **browser E2E testing
   (Playwright)? yes/no** — yes means: scaffold Playwright (config, auth helper, first smoke
   spec, `test:e2e` script) if absent, and include `e2e-playwright` in the saved team roster
   so every user-facing feature gets E2E specs in the pipeline's test wave.
3. **Generate `.claude/` + root `CLAUDE.md`** from `assets/workflow-kit/templates/`,
   filling placeholders with real values and rewriting prose for *this* project.
   Drop what doesn't apply (no DB → no `database/` or `db-change`; no UI → no
   `browser-verify`). Include `hooks/block-secret-writes.mjs` as-is and wire it in
   `settings.json` with a sensible allow/deny list.
4. **Seed the knowledge base from reality** — the highest-value step. Read the actual
   code; write per-module "how it works now" docs citing real paths; start the dated
   requirements changelog; index the schema in `database/database.md`.
5. **Wire & verify.** Hook paths resolve, permissions match real commands, dry-run the
   gate green. Then run `agent-team-orc` to pick and save the agent roster
   (`.claude/softonoma-team.json`) sized to this project.
6. **Summarize** what was created and every assumption made.

## Mode C — multi-repo workspace (shared `.claude`)

Never duplicate `.claude/` per repo — a product's context is one thing. Pattern
(proven on Dental2You):

1. **Create a workspace repo** (e.g. `<product>-workspace`) that contains: root
   `CLAUDE.md` (the map for ALL repos: stack table, ports, cross-repo golden rules),
   the shared `.claude/` (KB, skills, agents, rules, hooks), `docs/` for preserved
   material, and `scripts/bootstrap.sh` that clones the product repos side-by-side
   inside it.
2. **Gitignore the product repos** in the workspace repo — they keep their own
   remotes, history and PR flow. The workspace repo versions only the shared context.
3. **Always launch Claude Code from the workspace root** so every session sees all
   repos plus the shared KB. KB/rules/plan changes are committed to the workspace repo
   in the same change as the related code lands in a product repo.
4. Then run Mode B steps 1–2 and 4–6 across the repos (one shared `.claude/`, one
   roster, one gate description per repo in `CLAUDE.md`).

## Principles (all modes)

- **Lightweight first** — match the owner's reality; no ceremony they didn't ask for.
- **KB is the source of truth**, updated in the same change as the code.
- **Decide vs ask** — proceed on reversible details and note them; escalate only
  irreversible/costly/conflicting calls.
- **Guardrails as code** — secret-block hook, encoded hard rules, review pass, gates.
- **Verify for real** — green tests aren't "done"; exercise the actual feature.
