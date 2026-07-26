---
name: production-launch
description: Take a project from "works in dev" to production-ready and through go-live. Use when a launch date is set, when preparing/reviewing production readiness, or when planning cutover from a legacy system. Triggers on "production", "go-live", "launch", "release to prod", "cutover", "migration to production", "readiness review", "rollback plan", "monitoring", "backups", "incident", "smoke test", "launch checklist".
metadata:
  version: "1.0.0"
---

# Production Launch (readiness → cutover → day-2)

Run this as a project, not a vibe: create a dated launch plan in the project's plans folder, work the
checklist in slices, and track every open item with an owner. Grade each area GREEN / AMBER / RED —
launch blocks on any RED in Security, Data, or Rollback.

## 1. Readiness audit (do first, weeks out)

**Security**
- Secrets only in the platform's env store; `.env` never committed (hook enforces); keys rotated from
  any that ever leaked into dev chats/repos; auth flows rate-limited; dependency audit run.
- AuthZ sweep: every endpoint/page enforces role + tenant scope; sensitive data paths get a dedicated
  review (run the security-reviewer agent on the diff of the last months).
- Compliance surface named explicitly (e.g. health data → privacy act obligations, PCI if card data).

**Data**
- Backups: automated, tested by an actual restore drill — a backup that's never been restored is a
  hope, not a backup. Know RPO/RTO numbers.
- Migrations: clean linear history that applies to a fresh database; destructive migrations have
  backfill notes. Staging database is schema-identical to prod.
- Legacy import (if replacing a system): import scripts idempotent + re-runnable (`import:purge` /
  `import:revert` style), a reconciliation report (counts + spot checks per entity), and a data-freeze
  agreement with the client for cutover day.

**Reliability & performance**
- Error tracking wired (Sentry or equivalent) with alerts to a channel someone reads; uptime check on
  the public URL; structured logs queryable in the platform.
- Load sanity: the heaviest real screens/endpoints exercised at expected concurrency; N+1s and
  missing indexes fixed (run the performance-reviewer agent).
- Timeouts/retries on all third-party calls (payments, accounting, email); webhooks verified + idempotent.

**Operations**
- Environments: prod fully separated from staging (DB, storage, keys, third-party accounts —
  sandbox vs live). A staging deploy of the exact release candidate.
- Runbook in the KB: deploy, rollback, restore, rotate-secret, "site is down" first steps —
  each a numbered procedure a stressed human can follow.
- On-call/ownership for launch week agreed and written down.

## 2. Cutover plan (for legacy replacements)

Sequence, with times and owners: data freeze → final import → reconciliation sign-off → DNS/access
switch → smoke test in prod → announce. Define the **go/no-go checkpoint** and the **abort path**
(what gets un-switched, how long that takes, who decides). Parallel-run or read-only fallback on the
legacy system for an agreed window if possible.

## 3. Launch-day smoke test

A written 15–30 min script exercising every business-critical path with real (non-test) accounts:
login/roles, the top 5 workflows, one payment end-to-end, one document/email out, integrations
(accounting sync) — checked off in the plan doc as it runs.

## 4. Day-2 (the week after)

- Watch error tracker + logs daily; triage list in the plan folder; hotfix path defined (branch,
  gate, deploy) and faster than the normal cycle.
- Capture every incident/quirk into the KB requirements-changelog so fixes don't rely on memory.
- Schedule the retro: what AMBERs bit us, close them before feature work resumes fully.

## Checklist (condensed)

- [ ] Secrets clean/rotated; authZ sweep done; compliance named
- [ ] Backup restore drill passed; RPO/RTO known
- [ ] Migrations apply to fresh DB; staging = prod schema
- [ ] Legacy import idempotent + reconciliation report + data freeze agreed
- [ ] Error tracking + alerts + uptime check live
- [ ] Load sanity on heaviest paths; third-party calls have timeouts/retries
- [ ] Runbook (deploy/rollback/restore) written and rehearsed
- [ ] Cutover sequence with go/no-go + abort path
- [ ] Launch-day smoke script written
- [ ] Day-2 watch + hotfix path + retro scheduled
