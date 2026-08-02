---
name: fastapi-python
description: Build and review Python backend services with FastAPI — Pydantic v2 boundary validation, layered architecture (router → controller → service → repository), app-layer authorization, async SQLAlchemy/asyncpg or Supabase-Postgres via hand-applied SQL, Redis+RQ background jobs, and LLM-pipeline service patterns. Use for any task in a FastAPI/Python codebase. Triggers on "FastAPI", "Pydantic", "uvicorn", "APIRouter", "Depends", "RQ worker", "background job", "asyncpg", "SQLAlchemy", "python backend", "py_compile", "pylint".
metadata:
  version: "1.0.0"
---

# FastAPI + Python (Softonoma stack)

Grounded in the ContractPower backend (FastAPI + Pydantic v2 + Supabase Postgres + Redis/RQ +
multi-provider LLM pipelines). Adapt names to the project at hand; its CLAUDE.md and rules win.

## Layered architecture

- New code goes in the layered structure, never the legacy monolith: **Router** (HTTP shape only)
  → **Controller** (request orchestration) → **Service** (business rules) → **Repository** (data
  access). Base classes carry the authenticated user through the stack — no layer re-derives
  identity from raw headers.
- Routers declare `response_model` and status codes; controllers stay thin; services own the
  invariants; repositories own SQL/queries. A rule enforced in a router only is not enforced.
- Migration-in-progress codebases (V1 monolith → V2 layers): touch the monolith only to delegate
  into V2. Never add new business logic to the monolith.

## Boundary validation (Pydantic v2)

- Every request body/query is a Pydantic model — no raw `dict` params on endpoints. Unknown-field
  policy explicit (`model_config = ConfigDict(extra="forbid")` where the project forbids extras).
- Add a filterable param to the model AND the repository query in the same change.
- Never echo secrets or full internal objects in responses; define response models deliberately.

## Authorization (app-layer)

- Many Python+Supabase backends run **without Postgres RLS** — then the service layer IS the
  security boundary. Every list/read/mutation scopes by the caller's org/permissions from the
  authenticated user object, never from request input. Centralize checks (e.g. an access-resolver
  producing `accessible_contract_ids`) instead of ad-hoc per-endpoint filters; new endpoints that
  return derived data (search, exports, AI answers) must reuse the same resolver — derived
  surfaces are where scoping leaks happen.
- JWT: verify (`jwt.decode` with key + audience), never trust unverified claims; validate required
  env secrets at startup — no empty-string fallbacks.

## Database discipline

- With a hosted/production-pointing database, **tooling never applies schema changes**: author
  idempotent `.sql` migrations (guard with `IF NOT EXISTS` / `ON CONFLICT`), present them to the
  owner to run, and update the schema index doc (`.claude/database/database.md`) in the same change.
- Async access via asyncpg/SQLAlchemy async sessions: no sync driver calls inside request handlers;
  paginate unbounded lists; N+1s fixed at the repository layer.

## Background jobs (Redis + RQ)

- Long work (parsing, LLM extraction, crons) goes to RQ queues, never inline in a request. Jobs are
  **idempotent + resumable**: check-before-write, stable job ids, progress persisted so a retry
  continues rather than duplicates (resume guards on re-enqueue).
- Separate pools per workload class (fast parse vs heavy extraction vs cron) so one class can't
  starve another; job args are ids, not fat objects.

## LLM pipeline patterns

- Provider clients behind one internal client/wrapper with timeouts, retries with backoff, and a
  circuit breaker — a hung provider must not hang the request path (run via RQ).
- Prompt/extraction outputs validated like any boundary input (Pydantic), never trusted into SQL.
  Log token/latency metrics, never log document contents or keys.

## Gate (match the project's reality)

- Minimum bar when there's no test suite: `python -m py_compile` on changed files, pylint/isort
  clean, app boots, router registers, and the real endpoint exercised (curl or a script) — then
  push for a proper suite over time: pytest + httpx `AsyncClient` against the app factory, one test
  per business rule, org-isolation tests first (they catch the worst class of bug).

## Checklist

- [ ] New logic in the layered structure (router thin, service owns rules)?
- [ ] Pydantic models at every boundary; filter param + query updated together?
- [ ] Every query scoped by the caller's org/permissions via the central resolver?
- [ ] Schema change = idempotent SQL + owner-runs + schema doc, same change?
- [ ] Heavy work queued (idempotent, resumable, right pool), not inline?
- [ ] LLM calls wrapped (timeout/retry/breaker) and outputs validated?
- [ ] Gate green for real (compiles, boots, endpoint exercised)?
