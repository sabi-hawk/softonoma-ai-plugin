---
name: pr-review-fix
description: Review an existing pull request AND fix it until it is ready to merge. Runs the review-pr reviewers, collects every open issue on the PR (bot comments such as CodeRabbit/Copilot/Sonar, unresolved human review comments, failing CI checks, merge conflicts), fixes them strictly inside the PR's own scope, asks the developer about anything business-related or ambiguous instead of assuming, pushes after confirmation, re-checks until the PR is mergeable, approves it, and hands the merge back to the developer. Never merges. Use when asked to "review and fix PR", "make this PR mergeable", "fix the bot comments on PR", "get PR X ready to merge", or invoked as /softonoma-orchestrator:pr-review-fix <pr> [module].
---

# PR Review + Fix Pipeline

This is `review-pr` plus a fix loop. `review-pr` only reports; this command also fixes, re-checks and approves. It stops at "ready to merge": **the merge itself is always the developer's.**

## Hard rules (MANDATORY, apply to every step)
1. **Never merge.** Never run `gh pr merge`, never enable auto-merge, never push to the base branch. The last step is asking the developer to merge.
2. **Stay inside the PR's scope.** The scope is the PR's changed files (`gh pr diff <n> --name-only`) plus the test files that cover them. A fix that needs any other file is NOT made automatically: stop and ask (step 4). No drive-by refactors, renames, formatting sweeps or "while I'm here" improvements, even when a bot suggests them.
3. **Ask, never assume.** Anything touching business rules, product behaviour, user-facing copy, pricing/payment logic, data shape or migrations, or where comments conflict, the intent is unclear, or the agent would have to make an assumption: ask the developer before changing it. A wrong guess costs more than a question.
4. **Interaction:** every question uses the AskUserQuestion tool with selectable options, ALWAYS with "Other (type your own)" last; batch related questions into one call. Never a free-text "reply with" prompt.
5. **Show before push.** Fixes are shown to the developer and pushed only after they confirm. Never force-push; if history would need rewriting, stop and ask.
6. **Writing style** for anything posted to GitHub (replies, review comments, commit messages): plain, short, no em dashes.

$ARGUMENTS = PR number or URL, optionally a module/feature name for parity checking, optionally a team ("team <name>: ...") resolved from the PRIMARY checkout, `$(dirname "$(git rev-parse --git-common-dir)")/.claude/teams/` (never the PR worktree's `.claude/`), same as orchestrate-feature. Requires the GitHub CLI (`gh`) authenticated with push access to the PR branch.

Optional flags: **`skip-<agent>`** (e.g. `skip-performance`) skips that reviewer in step 3c; always name skipped reviewers in the final report.

## Intake wizard (when invoked with no or incomplete arguments)
1. **Team**: picker from `.claude/teams/*.json` if several.
2. **PR**: `gh pr list --limit 15 --json number,title,author` as options ("#142 SLA config parity, @dev") + Other.
3. **Parity source**: existing `knowledge-base/*/` module folders + **No parity check** + Other.

## 1. Stage the PR branch (worktree, never the primary checkout)
```bash
gh pr view <n> --json number,title,body,author,baseRefName,headRefName,headRepositoryOwner,isCrossRepository,maintainerCanModify,files,url
git fetch origin <headRefName>
git worktree add -b pr-<n>-fix ../<repo>-worktrees/pr-<n>-fix origin/<headRefName>
```
Work only in that worktree; pushes go to `origin HEAD:<headRefName>`.
- **Fork PR** (`isCrossRepository: true`): if `maintainerCanModify` is false you cannot push. Run the review, then report that the fixes must be applied by the author and stop before step 5.
- Record the **scope allowlist** now: `gh pr diff <n> --name-only`, plus existing test files that import or cover those files. This list is fixed for the whole run.

## 2. Parity context
Same as review-pr: if `knowledge-base/<module>/` exists, its Business Rules section is the parity checklist. A fix must never move behaviour away from a KB rule; if a bot comment asks for something that contradicts the KB, that is an ASK item, not a fix.

## 3. Collect every open issue
Gather all of these, then de-duplicate (the same problem reported by a bot and a reviewer is one item):

**a. Review threads and comments (bots and humans)**
```bash
gh api graphql -f query='query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){pullRequest(number:$n){
  reviewThreads(first:100){nodes{id isResolved isOutdated path line
    comments(first:20){nodes{id databaseId author{login __typename} body url}}}}}}}' -f o=<owner> -f r=<repo> -F n=<n>
gh api repos/<owner>/<repo>/issues/<n>/comments --paginate   # top-level comments (many bots post summaries here)
gh api repos/<owner>/<repo>/pulls/<n>/reviews --paginate     # review bodies with CHANGES_REQUESTED / COMMENTED
```
Keep unresolved, non-outdated threads and actionable top-level/review comments. Tag each with its source: **bot** (author `__typename` is `Bot`, or login ends in `[bot]`, e.g. coderabbitai, copilot-pull-request-reviewer, sonarcloud, github-advanced-security, dependabot) or **human**. Ignore pure summaries, walkthroughs and praise.

**b. CI checks**: `gh pr checks <n>`; for each failing check read the log (`gh run view <run-id> --log-failed`) and record the real failure (test, lint, type error, build).

**c. Our own review**: run the review-pr reviewers on the diff exactly as review-pr step 3 does ("qa" qa-reviewer, "security" security-reviewer, "performance" performance-reviewer, minus any `skip-<agent>`), plus the coverage check (90% on changed files). Their BLOCKER/MAJOR findings become items; MINOR findings are listed but only fixed if the developer opts in at step 4.

**d. Mergeability**: `gh pr view <n> --json mergeable,mergeStateStatus,reviewDecision`. Conflicts with the base branch are an item.

## 4. Triage (show the developer before changing anything)
Classify every item:
- **FIX**: clear technical defect, fix is inside the scope allowlist, no business meaning (failing test, type error, lint, null check, missing await, obvious bug, missing test for changed code).
- **ASK**: business rule or product behaviour, user-facing text, money/payments, data model or migration, conflicting comments, a fix that needs a file outside the allowlist, a bot suggestion we think is wrong, anything requiring an assumption.
- **NO CHANGE**: false positive or already handled; give the one-line reason.

Present the triage table (source, file:line, issue, class, proposed fix). Then one AskUserQuestion call covering every ASK item (one question per item, options = the concrete choices, e.g. "Apply the bot's suggestion" / "Keep current behaviour" / "Fix it differently" / Other) plus a final question confirming the FIX and NO CHANGE lists. Items the developer answers become FIX or NO CHANGE; an out-of-scope fix only proceeds if they explicitly approve that file.

## 5. Fix (in scope only)
- Small or single-file items: fix directly. Larger sets: dispatch to the matching implementation agent (frontend-dev / backend-dev / integrations-dev / unit-test-engineer for tests), giving each the exact item list AND the file allowlist, with the instruction: "Edit only these files. If a correct fix needs any other file, stop and report instead of editing it."
- Merge conflicts: merge the base branch in (`git merge origin/<baseRefName>`). Resolve only conflicts that are mechanical and inside the allowlist; anything else is an ASK item.
- **Scope gate**: after fixing, `git diff --name-only origin/<headRefName>` must be a subset of the allowlist plus approved extras. Revert anything outside it and raise it as an ASK item.
- Verify locally: lint, typecheck, the project's tests, and coverage on changed files (>= 90%). Do not proceed with red checks.

## 6. Show, then push
Show a fix summary: per item, the file(s) changed, what changed, and which comment/check it addresses; plus the verification results. AskUserQuestion: **Push these fixes** / **Change something first** / **Stop here (keep the worktree)** / Other.
On confirm: commit via **git-ops** (Haiku) with a message such as `fix(pr-<n>): address review comments and failing checks`, then `git push origin HEAD:<headRefName>` (never `--force`).

## 7. Reply and resolve threads
For each addressed thread, reply in the thread (`gh api repos/<owner>/<repo>/pulls/<n>/comments/<databaseId>/replies -f body="Fixed in <short-sha>: <one line>"`); for NO CHANGE items reply with the reason.
- **Bot threads** that were fixed or answered: resolve them (`gh api graphql -f query='mutation($id:ID!){resolveReviewThread(input:{threadId:$id}){thread{isResolved}}}' -f id=<threadId>`).
- **Human threads**: reply, but resolve only if the developer said so in step 4 (by default leave them for the reviewer to resolve).

## 8. Re-check loop
Wait for CI and the bots to re-run on the new commit (`gh pr checks <n> --watch`, then re-read threads). New failures or new comments go back through steps 3 to 7. Maximum **3 rounds**; if the PR still is not clean after that, stop and report what remains and why.

## 9. Ready-to-merge gate
All must hold: every required check green; no unresolved bot threads; every human thread replied to (and resolved, or left for its reviewer with the developer's agreement); `mergeable` is `MERGEABLE`; no conflicts; no open BLOCKER/MAJOR from our own reviewers. If `mergeStateStatus` is `BLOCKED` only because an approval is required, that is expected and handled in step 10.

## 10. Approve and hand over the merge
- If the current `gh` user (`gh api user -q .login`) is **not** the PR author: `gh pr review <n> --approve -b "<short summary of what was reviewed and fixed>"`.
- If they **are** the author (GitHub blocks self-approval): `gh pr review <n> --comment -b "Ready to merge. <short summary of what was reviewed and fixed>"`.
Then tell the developer the PR is ready, with a short report (what was fixed, what was answered as no change, reviewers skipped, anything left for human reviewers) and the PR URL, and ask them to merge it. **Do not merge.**

## 11. Cleanup
After the hand-over: `git worktree remove ../<repo>-worktrees/pr-<n>-fix` and `git branch -D pr-<n>-fix`. If the developer chose "Stop here" in step 6, keep the worktree and tell them its path.
