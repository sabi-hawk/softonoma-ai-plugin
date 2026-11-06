#!/usr/bin/env bash
# SessionStart hook: if this project has never been put on the Softonoma workflow
# (no CLAUDE.md and no .claude/), tell Claude once so it offers /new-project.
# Silent in every other case, so it costs nothing in an onboarded project, and
# it never creates, edits or blocks anything. Exit 0 always.
set -u
cat >/dev/null 2>&1 || true   # drain the hook payload
DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
DIR=$(printf '%s' "$DIR" | sed 's/\\/\//g')   # Windows separators
# This folder or any parent already set up (Claude Code also loads a parent's
# CLAUDE.md, e.g. a product repo inside a multi-repo workspace) -> nothing to say.
# A .claude/ holding projects/ or plugins/ is a USER config folder (~/.claude),
# not a project setup, so it does not count.
d="$DIR"; prev=""
while [ -n "$d" ] && [ "$d" != "$prev" ]; do
  [ -f "$d/CLAUDE.md" ] && exit 0
  if [ -d "$d/.claude" ] && [ ! -d "$d/.claude/projects" ] && [ ! -d "$d/.claude/plugins" ]; then exit 0; fi
  prev="$d"; d=$(dirname "$d")
done
# A linked worktree: judge the primary checkout instead.
if GCD=$(git -C "$DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null); then
  MAIN=$(dirname "$GCD")
  [ -f "$MAIN/CLAUDE.md" ] && exit 0
  [ -d "$MAIN/.claude" ] && exit 0
  IS_PROJECT=1
else
  IS_PROJECT=0
fi
# Only speak for something that looks like a project (a repo, a manifest, or an
# empty folder about to become one), never for a home directory or a random folder.
if [ "$IS_PROJECT" = 0 ]; then
  for m in package.json pyproject.toml requirements.txt composer.json pubspec.yaml go.mod Cargo.toml pom.xml build.gradle; do
    [ -f "$DIR/$m" ] && IS_PROJECT=1 && break
  done
fi
if [ "$IS_PROJECT" = 0 ] && [ -z "$(ls -A "$DIR" 2>/dev/null)" ]; then IS_PROJECT=1; fi
[ "$IS_PROJECT" = 1 ] || exit 0
echo "Softonoma workflow: this project has no CLAUDE.md and no .claude/ yet. Before any feature work, offer the developer /softonoma-orchestrator:new-project (it creates the standard structure in the plugin's WORKFLOW.md without overwriting anything); /softonoma-orchestrator:orchestrate-feature runs it automatically."
exit 0
