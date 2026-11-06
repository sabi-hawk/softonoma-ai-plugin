#!/usr/bin/env bash
# PreToolUse guard: block file edits in the PRIMARY checkout on protected
# branches. Linked worktrees are always allowed. Exit 2 = block (stderr goes
# back to the agent).
#
# The guard judges THE FILE BEING WRITTEN, not the session's cwd:
# CLAUDE_PROJECT_DIR is fixed at session start to the primary checkout, so an
# agent working correctly inside a linked worktree still reports the primary
# checkout's branch. Resolving from the target path fixes both directions.
#
# Windows (Git Bash): payload paths arrive as `D:\\repo\\file` or `D:/repo/file`.
# They are unescaped and normalised to forward slashes, and a drive-letter path
# counts as absolute (0.24.0; the previous guard treated it as relative and
# judged every edit against the session's repo, which is why some projects had
# to switch it off). Path handling ported from the Alfred orchestrator 0.21.0.
#
# Never blocked: docs/config (`.claude/`, `plans/`, `knowledge-base/`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.env.example`,
# `prototypes/`, `docs/`, any `*.md`). Per-repo opt-out for repos that should
# never be guarded: `git config softonoma.worktreeGuard off`.
set -u
INPUT=$(cat)

# --- extract the target path from the payload -------------------------------
# Write/Edit/MultiEdit use file_path; NotebookEdit uses notebook_path.
raw=$(printf '%s' "$INPUT" | sed -n \
  's/.*"\(file_path\|notebook_path\)"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\2/p' | head -n1)

# Unescape the JSON string, then normalise Windows separators.
path=$(printf '%s' "$raw" | sed -e 's/\\\\/\\/g' -e 's/\\"/"/g' -e 's/\\\//\//g' -e 's/\\/\//g')

# --- docs/config are never code: always allowed -----------------------------
case "/$path" in
  */.claude/*|*/plans/*|*/knowledge-base/*|*/prototypes/*|*/docs/*|*.md) exit 0 ;;
  # repo config, not code: onboarding writes these on a fresh main (0.24.0)
  */.gitignore|*/.gitattributes|*/.editorconfig|*/.env.example) exit 0 ;;
esac

PROJECT="${CLAUDE_PROJECT_DIR:-$PWD}"
PROJECT=$(printf '%s' "$PROJECT" | sed 's/\\/\//g')

is_abs() {
  case "$1" in
    /*) return 0 ;;          # POSIX absolute
    [A-Za-z]:/*) return 0 ;; # Windows drive-absolute (D:/...)
    *) return 1 ;;
  esac
}

# Walk up to the nearest directory that exists (a Write's file usually doesn't).
nearest_dir() {
  d="$1"; prev=""
  while [ -n "$d" ] && [ "$d" != "$prev" ] && [ ! -d "$d" ]; do
    prev="$d"; d=$(dirname "$d")
  done
  [ -d "$d" ] && printf '%s' "$d"
}

DIR=""
if [ -n "$path" ]; then
  if is_abs "$path"; then abs="$path"; else abs="$PROJECT/$path"; fi
  DIR=$(nearest_dir "$(dirname "$abs")")
fi
# No usable path -> the session dir. Conservative on purpose: an unparseable
# payload must not silently disable the guard.
[ -n "$DIR" ] || DIR="$PROJECT"

git -C "$DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0
[ "$(git -C "$DIR" config --get softonoma.worktreeGuard 2>/dev/null)" = "off" ] && exit 0

# --- linked worktree? then it is always fine -------------------------------
# Ask git for BOTH paths in its own absolute format. (Resolving a relative
# --git-common-dir with `cd && pwd` gives an MSYS path, /tmp/x/.git, while git
# reports C:/Users/.../x/.git on Windows: the two never compared equal, so the
# primary checkout looked like a worktree and nothing was ever blocked.)
GD=$(git -C "$DIR" rev-parse --path-format=absolute --git-dir 2>/dev/null) || exit 0
GCD=$(git -C "$DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || exit 0
[ "$GD" != "$GCD" ] && exit 0

# --- primary checkout: block code on protected branches ---------------------
BR=$(git -C "$DIR" branch --show-current 2>/dev/null)
case "$BR" in
  main|master|develop|staging|production)
    echo "BLOCKED by git-worktree-discipline: '$BR' in the primary checkout is read-only. Create a worktree first: bash \${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh new <feature>  — then work there. (Docs, .claude/, plans/ and *.md are always allowed; opt a repo out with: git config softonoma.worktreeGuard off)" >&2
    exit 2 ;;
esac
exit 0
