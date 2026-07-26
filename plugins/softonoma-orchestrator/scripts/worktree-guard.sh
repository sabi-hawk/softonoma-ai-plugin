#!/usr/bin/env bash
# PreToolUse guard: block file edits in the PRIMARY checkout on protected branches.
# Linked worktrees are always allowed. Exit 2 = block (stderr goes back to the agent).
set -u
INPUT=$(cat) # hook payload (unused; cwd is what matters)
DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
git -C "$DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
GD=$(git -C "$DIR" rev-parse --git-dir 2>/dev/null); GCD=$(git -C "$DIR" rev-parse --git-common-dir 2>/dev/null)
[ "$GD" != "$GCD" ] && exit 0   # inside a linked worktree -> fine
# Allow docs/config writes on main (code needs a worktree; config does not)
if printf '%s' "$INPUT" | grep -Eq '"file_path"[[:space:]]*:[[:space:]]*"[^"]*(\.claude/|plans/|knowledge-base/|prototypes/|CLAUDE\.md|README\.md)'; then
  exit 0
fi
BR=$(git -C "$DIR" branch --show-current 2>/dev/null)
case "$BR" in
  main|master|develop|staging|production)
    echo "BLOCKED by git-worktree-discipline: '$BR' in the primary checkout is read-only. Create a worktree first: bash \${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh new <feature>  — then work there." >&2
    exit 2 ;;
esac
exit 0
