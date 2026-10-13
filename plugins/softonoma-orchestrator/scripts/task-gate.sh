#!/usr/bin/env bash
# TaskCompleted quality gate — project-type aware.
# Exit 0 = allow task completion. Exit 2 = block it and send stderr back as feedback.
# Runs from the agent's working directory. Keep it FAST — it runs on every task completion.
#
# Principles:
#   * Gate only what the project actually configures (scripts/tools present).
#   * Never block on ENVIRONMENT gaps (missing binaries, uninstalled deps) —
#     only on real quality failures. A gate that fails because node_modules or
#     a venv is absent teaches agents to ignore it.
#   * Unknown project types pass through untouched.

set -u
INPUT=$(cat)  # hook payload JSON on stdin (task info); unused for now

LOG=/tmp/gate-run.log
: >"$LOG"

block() {
  echo "Task completion blocked: $1. Fix it before marking this task complete. Log: $LOG" >&2
  exit 2
}

# Failure caused by missing tooling rather than bad code? Then skip, don't block.
env_gap() {
  grep -qiE "command not found|not recognized|No module named|Cannot find module|ENOENT|npm ERR! missing" "$LOG"
}

# ---------------------------------------------------------------- JS / TS
if [ -f package.json ]; then
  # Without installed deps every npm script fails for environment reasons.
  [ -d node_modules ] || exit 0
  if grep -q '"lint"' package.json; then
    npm run -s lint >"$LOG" 2>&1 || { env_gap || block "'npm run lint' failed"; }
  fi
  if grep -q '"typecheck"' package.json; then
    npm run -s typecheck >"$LOG" 2>&1 || { env_gap || block "'npm run typecheck' failed"; }
  fi
  exit 0
fi

# ---------------------------------------------------------------- Python
if [ -f pyproject.toml ] || [ -f requirements.txt ] || [ -f setup.cfg ]; then
  PY=python3
  [ -x .venv/bin/python ] && PY=.venv/bin/python
  command -v "$PY" >/dev/null 2>&1 || exit 0

  if "$PY" -c "import pytest" >/dev/null 2>&1 && [ -d tests ]; then
    # -x: stop at first failure (fast feedback, bounded runtime)
    "$PY" -m pytest -x -q >"$LOG" 2>&1 || { env_gap || block "pytest failed"; }
  else
    # No test runner available: cheap syntax gate over the project's own code.
    "$PY" -m compileall -q -x '(\.venv|venv|node_modules|\.git|build|dist)' . \
      >"$LOG" 2>&1 || { env_gap || block "python compile check failed"; }
  fi
  exit 0
fi

# ---------------------------------------------------------------- PHP / Laravel
if [ -f composer.json ] && [ -d vendor ]; then
  if [ -x vendor/bin/pint ]; then
    vendor/bin/pint --test >"$LOG" 2>&1 || { env_gap || block "'pint --test' failed"; }
  fi
  exit 0
fi

# Unknown project type: nothing to gate.
exit 0
