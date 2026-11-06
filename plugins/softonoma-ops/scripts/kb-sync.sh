#!/usr/bin/env bash
# PostToolUse: keep the /kb navigation in sync whenever a KB page is written.
#
# Fires on every Write/Edit, so it must be cheap and silent unless it acted.
# Exit 0 always — a nav refresh failing must never block the agent's work.
set -u
INPUT=$(cat)  # hook payload JSON on stdin

# Only react to writes inside the product knowledge base.
printf '%s' "$INPUT" | grep -Eq '"file_path"[[:space:]]*:[[:space:]]*"[^"]*\.claude/knowledgebase/' || exit 0

DIR="${CLAUDE_PROJECT_DIR:-$PWD}"

# The KB lives in the primary checkout, but edits may come from a linked
# worktree. Resolve to the checkout that actually holds the KB.
ROOT="$DIR"
if [ ! -d "$ROOT/.claude/knowledgebase" ]; then
  if GCD=$(git -C "$DIR" rev-parse --git-common-dir 2>/dev/null); then
    CAND=$(dirname "$GCD")
    [ -d "$CAND/.claude/knowledgebase" ] && ROOT="$CAND"
  fi
fi
[ -d "$ROOT/.claude/knowledgebase" ] || exit 0
# Opt-in (Softonoma 0.24.0): only a KB that already has the /kb viewer index (nav.json,
# created by the kb skill) is kept in sync, so a project that merely has a
# .claude/knowledgebase/ folder is never given a nav.json it did not ask for.
[ -f "$ROOT/.claude/knowledgebase/nav.json" ] || exit 0

command -v node >/dev/null 2>&1 || exit 0

# ${CLAUDE_PLUGIN_ROOT} is set by Claude Code; fall back to this script's dir.
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
INDEXER="$PLUGIN_ROOT/scripts/kb-index.mjs"
[ -f "$INDEXER" ] || exit 0

OUT=$(cd "$ROOT" && node "$INDEXER" --root .claude/knowledgebase 2>&1) || {
  # Surface the reason but don't fail the tool call.
  echo "kb-sync: nav refresh failed — $OUT" >&2
  exit 0
}

# Only speak when something actually changed.
case "$OUT" in
  *"no change"*) : ;;
  *) echo "kb-sync: $OUT" >&2 ;;
esac
exit 0
