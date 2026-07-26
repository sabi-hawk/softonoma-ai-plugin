#!/usr/bin/env bash
# Worktree + port manager. new <feature> [base] | list | remove <feature> | port
set -euo pipefail
CMD="${1:-list}"
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || { echo "not a git repo" >&2; exit 1; }
NAME=$(basename "$ROOT")
# if we're inside a linked worktree, resolve the primary checkout for consistent WT_ROOT
COMMON=$(git rev-parse --git-common-dir); PRIMARY=$(dirname "$(cd "$ROOT" && cd "$(dirname "$COMMON")" && pwd)")/$(basename "$(dirname "$COMMON")")
WT_ROOT="$(dirname "$ROOT")/${NAME%-worktrees*}-worktrees"; [[ "$ROOT" == *-worktrees/* ]] && WT_ROOT="$(dirname "$ROOT")"

alloc_port() { # deterministic per feature, collision-checked
  local n="$1" base=3100
  local h; h=$(printf '%s' "$n" | cksum | cut -d' ' -f1)
  local p=$(( base + h % 900 ))
  while { command -v lsof >/dev/null && lsof -i ":$p" >/dev/null 2>&1; } || grep -qsx "$p" "$WT_ROOT"/*/.worktree-port 2>/dev/null; do p=$((p+1)); done
  echo "$p"
}

case "$CMD" in
  new)
    F="${2:?usage: worktree.sh new <feature> [base]}"; B="${3:-main}"
    WT="$WT_ROOT/$F"; BR="feature/$F"
    mkdir -p "$WT_ROOT"
    git fetch origin "$B" --quiet 2>/dev/null || true
    git worktree add -b "$BR" "$WT" "origin/$B" 2>/dev/null || git worktree add -b "$BR" "$WT" "$B"
    P=$(alloc_port "$F"); echo "$P" > "$WT/.worktree-port"
    # Ignore the port file via the shared git exclude (not a tracked-tree .gitignore) so the
    # worktree stays clean and `remove` works without --force on an otherwise-untouched worktree.
    GCD=$(git -C "$WT" rev-parse --path-format=absolute --git-common-dir); mkdir -p "$GCD/info"
    grep -qxF '.worktree-port' "$GCD/info/exclude" 2>/dev/null || echo '.worktree-port' >> "$GCD/info/exclude"
    echo "worktree : $WT"; echo "branch   : $BR"; echo "dev port : $P   -> npm run dev -- -p $P"
    ;;
  port)
    F=$(basename "$ROOT"); P=$(alloc_port "$F"); echo "$P" > "$ROOT/.worktree-port"; echo "dev port : $P"
    ;;
  list) git worktree list ;;
  remove)
    F="${2:?usage: worktree.sh remove <feature>}"; WT="$WT_ROOT/$F"
    git worktree remove "$WT" || { echo "dirty worktree — commit/stash or pass --force manually" >&2; exit 1; }
    git worktree prune; echo "removed $WT (branch kept; delete after merge confirms)"
    ;;
  *) echo "usage: worktree.sh new <feature> [base] | list | remove <feature> | port" >&2; exit 1 ;;
esac
