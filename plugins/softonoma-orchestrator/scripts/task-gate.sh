#!/usr/bin/env bash
# TaskCompleted quality gate.
# Exit 0 = allow task completion. Exit 2 = block it and send stderr back as feedback.
# Runs from the agent's working directory. Keep it FAST — it runs on every task completion.

set -u
INPUT=$(cat)  # hook payload JSON on stdin (task info)

# Only gate repos that look like our Next.js projects
[ -f package.json ] || exit 0

# Cheap gate: lint + typecheck. Add "npm test -- --changed" here once suites are fast enough.
FAIL=""
if grep -q '"lint"' package.json; then
  npm run -s lint >/tmp/gate-lint.log 2>&1 || FAIL="lint"
fi
if [ -z "$FAIL" ] && grep -q '"typecheck"' package.json; then
  npm run -s typecheck >/tmp/gate-type.log 2>&1 || FAIL="typecheck"
fi

if [ -n "$FAIL" ]; then
  echo "Task completion blocked: '$FAIL' failed. Fix it before marking this task complete. Log: /tmp/gate-$([ "$FAIL" = lint ] && echo lint || echo type).log" >&2
  exit 2
fi
exit 0
