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
  # Pick the first interpreter that actually RUNS: the project venv (POSIX or
  # Windows layout), then python3/python/py. On Windows `python3` is often the
  # Microsoft Store placeholder, which exists on PATH but fails to start; trusting
  # `command -v` alone blocked every healthy Python repo there (0.24.0 fix).
  PY=""
  for c in .venv/bin/python .venv/Scripts/python.exe python3 python py; do
    if [ "$c" = py ]; then set -- -3; else set --; fi
    if "$c" "$@" -c "import sys" >/dev/null 2>&1; then PY="$c"; PYARGS="$*"; break; fi
  done
  [ -n "$PY" ] || exit 0   # no working Python: an environment gap, not a failure
  # shellcheck disable=SC2086
  run_py() { command "$PY" $PYARGS "$@"; }

  if run_py -c "import pytest" >/dev/null 2>&1 && [ -d tests ]; then
    # -x: stop at first failure (fast feedback, bounded runtime)
    run_py -m pytest -x -q >"$LOG" 2>&1 || { env_gap || block "pytest failed"; }
  else
    # No test runner available: cheap syntax gate over the project's own code.
    run_py -m compileall -q -x '(\.venv|venv|node_modules|\.git|build|dist)' . \
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
