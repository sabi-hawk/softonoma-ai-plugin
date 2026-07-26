---
name: agent-team-orc
description: Interactive team setup wizard. Run at a project's root to understand the project, let the developer pick agents from the available roster, name the team, and save a reusable team template. Use whenever the user runs /softonoma-orchestrator:agent-team-orc, says "set up a team", "create an agent team for this project", "onboard this project", asks to LIST/SHOW existing teams ("what teams do I have", "list teams", "show team X"), or asks to DELETE/RENAME a team.
---

# Agent Team Setup Wizard (/agent-team-orc)


## Team directory resolution (EXACTLY ONE LOCATION - never search)
Run ONE command and use ONE directory:
```bash
TEAMS_DIR="$(dirname "$(git rev-parse --git-common-dir)")/.claude/teams"   # primary checkout of the repo Claude is running in
```
If not inside a git repo, TEAMS_DIR="$PWD/.claude/teams". That is the ONLY place teams live.
FORBIDDEN: globbing or probing any other path - no parent folders, no subfolders/nested repos (e.g. <repo>/<other>/.claude/teams), no legacy softonoma-team.json, no multi-pattern searches. One `ls "$TEAMS_DIR"` answers every list/show/resolve question. If the directory is missing, the answer is simply "no teams yet" for THIS repo.

## Step 0 — Routing (this decides everything; nothing else runs first)
1. $ARGUMENTS is a subcommand → route immediately, no menu: `list` → list teams · `show <name>` → full JSON · `delete <name>` → delete flow · `rename <old> <new>` → rename flow · `create` → Phase 1.
2. NO arguments → you MUST show the Main menu picker before doing anything else — even if conversation context suggests the user wants to create a team. Do not skip to Phase 1.
3. Only after "Create a team" is chosen (via menu or `create`) does Phase 1 begin.

## Interaction rule (MANDATORY)
Every question in this wizard MUST use the AskUserQuestion tool (selectable options), never a free-text "reply with..." prompt. Enumerate the real choices as options and ALWAYS include "Other (type your own)" as the last option for anything open-ended. Use multi-select for the roster pick. The ONLY acceptable free text is what the user types after choosing "Other".

## Main menu (no-argument start)
AskUserQuestion: "What do you want to do?" → options: **Create a team** / **List teams** / **Rename a team** / **Delete a team** / Other.

## Deleting / renaming a team (if asked, do only this and stop)
1. Show the team's JSON and confirm the exact name before anything destructive.
2. Check for anything live that references it: running sessions the user knows about, and worktrees under `../<repo>-worktrees/` for features that were run with this team — list them and WARN. Never remove feature worktrees as part of team deletion; in-flight features keep their worktrees (finish or remove them separately via worktree.sh).
3. On confirmation: delete `.claude/teams/<name>.json` (that file is the team — there is no other team metadata to clean; runtime team state is session-scoped and cleaned up by Claude Code itself).
4. NEVER delete plans/, knowledge-base/, .claude/knowledgebase/, or CLAUDE.md content as part of team deletion — those are project assets shared by all teams. Say so explicitly.
5. Rename = write the new file, delete the old one, remind the user to update any prompts/VK card templates using the old name. Commit the change.

## Listing teams (if asked, do only this and stop)
Read `$TEAMS_DIR/*.json` and show a compact table: team name, roster (comma-separated), default model, created by/at. If asked about one team, show its full JSON. If the folder is empty, say so and offer to create one. Teams are per-project — mention that other repos have their own.

You are running a one-time (per project) setup wizard. Output of this skill is a saved team template at `.claude/softonoma-team.json` — NOT any code and NOT a running team.

## Phase 1 — Name and mode (runs only after "Create a team" was chosen; do not read any project files yet)
Ask exactly two questions before touching the filesystem — both via AskUserQuestion (batching them into one two-tab form is good):
1. "Team name?" → options: `<repo>-core`, `<repo>-review`, `<repo>-build` (derive <repo> from the folder name), Other (type your own).
2. "Creation mode?" → options: **Manual — pick agents from a list (instant)** / **Automatic — I read CLAUDE.md/README/package.json and recommend (slower, tailored)**.

## Phase 2 — Build the roster
**Manual mode:** immediately list every available agent (this plugin's agents + project `.claude/agents/` + user agents), grouped Core pipeline vs On-demand, one line each. Present the roster as a MULTI-SELECT AskUserQuestion (core agents pre-suggested). Then one final AskUserQuestion: "Project description?" → options: **Skip** / Other (type 1–2 sentences). No file scanning.

**Automatic mode:** read ONLY these, in this order, stopping as soon as you have enough signal: `.claude/teams/*.json` (existing teams), `CLAUDE.md`, `README.md`, `package.json`/`composer.json`. Do NOT crawl source folders. Present a 2–3 line project summary, then the recommended roster as a MULTI-SELECT AskUserQuestion with the recommendations pre-selected and reasons in the descriptions ("Laravel legacy referenced → legacy-analyst"); user confirms or adjusts the selection.

Both modes: optionally set default teammate model (default sonnet) and max parallel (default 5).

## Phase 3 — Save the template
Write `$TEAMS_DIR/<team-name>.json` (multiple teams per project are expected — e.g. a build team and a review team):

```json
{
  "teamName": "<name>",
  "project": { "summary": "<from user or scan>", "stack": [], "legacySources": [], "docs": [] },
  "roster": ["..."],
  "defaults": { "teammateModel": "sonnet", "maxParallel": 5 },
  "createdBy": "<user>", "createdAt": "<date>"
}
```
Also: create `plans/{upcoming,in-progress,done}/` and `knowledge-base/` if missing; in automatic mode offer to append the summary to CLAUDE.md. Commit the team file.

## Phase 4 — Tell the user how to work from now on

Explain, briefly: "Team '<name>' is saved. Use it by naming it in your prompt: `/softonoma-orchestrator:orchestrate-feature team <name>: <feature + doc/link>` or `/softonoma-orchestrator:review-pr team <name>: <pr>`. If the project has only one team, naming it is optional. Re-run /agent-team-orc anytime to add another team or change a roster."

Rules: never spawn teammates from this wizard; never overwrite an existing team file without showing a diff and confirming; keep the wizard to 2 questions in manual mode (name, roster) plus the optional description, ~4 in automatic mode.
