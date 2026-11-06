# Plans: one file per ticket

**Every ticket gets a plan file, `inprogress/<TICKET>.md`, before any code.** It is the offline memory:
builders work from it instead of from chat messages, and the next task in the same area starts from it.
Start from `TEMPLATE.md`.

- **The lead writes** the header, Problem, Scope, Decisions and, for any change to a RULE (concurrency, dates,
  money, notifications, who may do what), **the case table FIRST**: each row a situation, its expected result
  and the test that pins it. The builder implements against the table; reviewers probe the table, not only the code.
- **The builder keeps `## Status (builder)` current**: last commit, pushed or not, gate result at which head,
  what is next. The lead reads the file rather than waiting for a message.
- **On merge** the plan moves to `done/` with an `## Outcome` (PRs, merge commits, environments, ticket state).
- A ticket too small for a case table still gets the file: header, Problem, Scope, Status. Five lines is fine.
- Follow-ups that outlive their ticket go in `CARRY-OVER.md` (one line each), not only in the closed plan.

```
.claude/plans/
├── backlog/      ← captured but parked (not scheduled)
├── upcoming/     ← agreed, not started
├── inprogress/   ← active (one <TICKET>.md each; a team run adds <module>.team/ beside it)
├── done/         ← shipped record (immutable)
├── TEMPLATE.md
└── CARRY-OVER.md
```

## Rules
- **Move, don't copy**: a plan lives in exactly one folder (`git mv`).
- Code and docs cite a plan at `.claude/plans/done/<TICKET>.md` from the start (it moves there on merge).
- On completion, fold durable knowledge into the KB (`knowledgebase/modules/<module>`) and `database.md`.
- No secrets and no personal data in any plan.
