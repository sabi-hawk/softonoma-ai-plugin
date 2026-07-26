---
name: review-pr
description: Multi-agent review of an existing pull request — QA/parity vs the knowledge base, security, performance, and test coverage — with a consolidated BLOCKER/MAJOR/MINOR report. Use when asked to "review PR", "check this PR", given a PR number/URL, or invoked as /softonoma-orchestrator:review-pr <pr> [module].
---

# PR Review Pipeline

## Interaction rule (MANDATORY, applies to every question in this skill)
Whenever you need anything from the developer, use the AskUserQuestion tool with selectable options — never a free-text "tell me / reply with" prompt. Enumerate the real choices; ALWAYS include "Other (type your own)" as the last option. Multi-select where several items can be chosen. Free text is only what follows an "Other" selection.

$ARGUMENTS = PR number or URL, optionally a module/feature name for parity checking, optionally a team ("team <name>: ...") — resolve the team from the PRIMARY checkout - `$(dirname "$(git rev-parse --git-common-dir)")/.claude/teams/` (never the PR worktree .claude/) - same as orchestrate-feature, and use its reviewer agents. Requires the GitHub CLI (`gh`) authenticated.

## Intake wizard (when invoked with no or incomplete arguments)
1. **Team** — picker from `.claude/teams/*.json` if several.
2. **PR** — run `gh pr list --limit 15 --json number,title,author` and present the open PRs as options ("#142 SLA config parity — @dev") + Other (enter number/URL).
3. **Parity source** — options from existing `knowledge-base/*/` module folders + **No parity check** + Other.
4. **Depth** — **Full review (qa+security+performance+tests)** / **Quick pass (qa only)** / Other.
Then proceed below.

## 1. Stage the PR (never touch the primary checkout)
```bash
gh pr view <n> --json title,body,headRefName,files   # understand scope
git fetch origin pull/<n>/head:pr-<n>
git worktree add ../<repo>-worktrees/pr-<n> pr-<n>
```
Work from that worktree. Compute the diff vs the PR's base branch — review the CHANGED code plus its blast radius, not the whole repo.

## 2. Parity context
Identify the module from the PR title/files (or the argument). If `knowledge-base/<module>/` exists, its Business Rules section is the parity checklist — every rule touching changed behavior must be verified. If no KB doc exists, note "no parity source" in the report and review on general correctness.

## 3. Review (parallel)
When running as TEAMMATES, first create one shared task per review track (e.g. "QA/parity review PR #<n>", "Security review PR #<n>", "Performance review PR #<n>", "Coverage check PR #<n>") so progress is visible on the task list and dashboards; each reviewer claims theirs and marks it complete with a one-line verdict. Spawn "qa" (qa-reviewer), "security" (security-reviewer), "performance" (performance-reviewer) as teammates for large PRs; for small PRs (<~400 changed lines) run them as subagents instead — cheaper, same definitions. Additionally check the test story yourself: do changed files have tests, does `test:coverage` pass, is the 90% changed-files gate met.

## 4. Consolidated report (to the developer, NOT to GitHub)
- Verdict: APPROVE / APPROVE WITH NITS / REQUEST CHANGES
- Findings table: severity (BLOCKER/MAJOR/MINOR), file:line, issue, suggested fix
- Parity: KB rules verified ✓ / gaps found (rule → where it's violated)
- Tests: coverage on changed files, missing scenarios
After the report, AskUserQuestion: "What next?" → **Post findings as PR comments** / **Submit as Request Changes** / **Submit as Approve** / **Do nothing on GitHub**. If posting: draft the `gh pr review` comments (line-anchored) and show them, then AskUserQuestion to confirm submission.

## 5. Cleanup
`git worktree remove ../<repo>-worktrees/pr-<n>` and delete the local `pr-<n>` branch after the review is delivered.
