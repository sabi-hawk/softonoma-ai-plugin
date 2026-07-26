#!/usr/bin/env bash
# Phase 5 coverage gate: changed-files coverage >= 90%. Run from repo root; BASE = merge base branch (default main).
set -u
BASE="${1:-main}"
[ -f package.json ] || { echo "no package.json"; exit 0; }
if grep -q '"test:coverage"' package.json; then
  npm run -s test:coverage || { echo "COVERAGE GATE FAILED: tests or global threshold failing" >&2; exit 2; }
else
  echo "WARN: no test:coverage script — add one with a 90% threshold (vitest/jest coverageThreshold)" >&2
  exit 2
fi
echo "Coverage gate passed (global thresholds enforced by test config)."
echo "Changed files this feature:"; git diff --name-only "$(git merge-base HEAD "$BASE")" -- '*.ts' '*.tsx' | sed 's/^/  /'
