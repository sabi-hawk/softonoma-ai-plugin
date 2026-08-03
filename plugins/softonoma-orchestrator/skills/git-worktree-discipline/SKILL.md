---
name: git-worktree-discipline
description: Branching and git-worktree rules for multi-team parallel work — worktree creation, branch naming, per-worktree dev-server ports, and cleanup. Use whenever creating a branch or worktree, starting a dev server, beginning any feature work, or cleaning up after a merge. No code is ever written outside a worktree.
---

# Git Worktree Discipline

## The law
1. **No code outside a worktree.** The main checkout stays on `main` and is read-only for agents (a PreToolUse hook blocks edits there). One feature = one worktree = one branch = one team.
2. **Branch naming:** `feature/<kebab-feature-name>` (e.g. `feature/policy-renewals`). Fixes found during review stay on the same branch. Hotfixes: `hotfix/<name>`.
3. **Worktree location:** sibling folder `../<repo>-worktrees/<feature>/` — never nested inside the repo (breaks tooling and gets committed by accident).

## Commands (use the plugin script — it also allocates the dev port)
```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh new <feature> [base-branch]   # create branch + worktree + port
bash ${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh list
bash ${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh remove <feature>              # after merge only
```
If launched from Vibe Kanban or Claude Squad the worktree already exists — do NOT create another; just allocate a port if `.worktree-port` is missing (`worktree.sh port`).

## Parallel dev servers (multiple teams testing at once)
- Every worktree gets a unique port in `.worktree-port` (deterministic from the feature name, collision-checked).
- ALWAYS start dev servers with it: `npm run dev -- -p $(cat .worktree-port)` (Next.js). Same for Playwright `baseURL` and any preview the human is given — report the URL with the port, e.g. `http://localhost:3417`.
- Never start anything on bare `:3000` — that's how two teams clobber each other.

## Commits & cleanup
- Commit early and often on the feature branch; conventional messages (`feat:`, `fix:`, `test:`, `refactor:`) with the plan task ID, e.g. `feat(T3): booking status API`.
- Never rebase/force-push a branch another teammate has checked out; coordinate via the lead.
- After the human confirms the PR is merged: `worktree.sh remove <feature>`, which also runs `git worktree prune`. Stale worktrees older than the done plan are flagged by `worktree.sh list`.

## Guard scope (what the worktree-guard does NOT block)

The PreToolUse guard protects **code** on protected branches (`main|master|develop|staging|production`)
in a primary checkout. It never blocks: files inside linked worktrees; `.claude/`, `plans/`,
`knowledge-base/`, `prototypes/`, `docs/` paths; or any `*.md` file — docs aren't code.
Repos that should never be guarded (e.g. a pure documentation repo) opt out once with:
`git config softonoma.worktreeGuard off`.
