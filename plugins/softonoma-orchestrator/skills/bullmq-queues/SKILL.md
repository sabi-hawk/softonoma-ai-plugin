---
name: bullmq-queues
description: Background jobs with BullMQ on Redis — queue/worker design, idempotent job handlers, retries with backoff, delayed and recurring jobs (job schedulers), fan-out patterns (notifications, push batches), failure alerting, and NestJS wiring. Use when designing async work, scheduled/recurring jobs, notification fan-out, or debugging stuck/failed BullMQ jobs. Triggers on "BullMQ", "queue", "worker", "background job", "delayed job", "recurring job", "cron job", "fan-out", "job scheduler".
metadata:
  version: "1.0.0"
---

# BullMQ queues (Softonoma stack)

BullMQ on Redis is the default async layer for Node services. API process **adds** jobs;
a separate **worker** process runs them. Never run workers inside the API process in
production — they scale and fail independently.

## Queue design

- One queue per concern, named by what it does: `nearby-alerts`, `push`, `sms`, `media`,
  `reports`, `cleanup`. Not one mega-queue, not one queue per entity.
- Job payloads are small and self-contained ids + parameters — the handler re-reads current
  state from the database. Never serialize whole entities; they go stale in the queue.
- Define queue names, job names and payload types once in a shared module; both API
  (producers) and worker (consumers) import it.

## Handlers: idempotent or wrong

Every handler must tolerate running twice (retries, redeploys, duplicate adds):
- Deterministic **jobId** for naturally-unique work (`push:req-accepted:<requestId>`) so
  duplicate adds collapse.
- Check current state first and exit cleanly when already done ("request already expired,
  nothing to send").
- Time-based truth lives in queries, not jobs: e.g. a listing is expired when `expires_at <
  now()` regardless of whether the expiry job ran — jobs only notify and tidy up.

## Retries, backoff, failure

```ts
queue.add(name, payload, {
  attempts: 5,
  backoff: { type: 'exponential', delay: 3000 },
  removeOnComplete: { age: 86400, count: 1000 },
  removeOnFail: false,            // keep failures inspectable
});
```

- Exhausted jobs land in the failed set — alert on failed-set growth and on queue backlog
  (waiting count, oldest-job age). A silent failed list is an outage you find out about from users.
- External sends (SMS, push, email) get a failover path in the handler (second gateway), not a
  blind retry of the same dead provider.
- Rate-limit politely: BullMQ worker `limiter` for provider caps; business caps (max pushes per
  user per hour, quiet hours) are checked in the handler against Redis/DB, not left to the queue.

## Delayed & recurring

- **Delayed jobs** for per-entity timers: add with `delay` at creation time (request expiry at
  +30min, "listing expires soon" at T-30min). Cancel by deterministic jobId when the entity
  resolves early.
- **Recurring work** uses BullMQ **job schedulers** (`upsertJobScheduler`) — not legacy
  repeatable jobs, not OS cron. Store schedule times in UTC; convert from the business's local
  timezone at write time, and re-upsert the scheduler when the business edits the schedule.
- Pausing a recurring listing = removing/disabling its scheduler, not filtering in the handler.

## Workers & scaling

- Per-queue `concurrency` tuned to the work: IO-bound fan-out high (25–50), CPU-bound (PDF,
  image) low (2–5) or in a separate worker service.
- Graceful shutdown: close workers on SIGTERM (`worker.close()`) so in-flight jobs finish;
  containers get a stop grace period longer than the longest job.
- Fan-out pattern: a coordinator job queries targets and **adds batch jobs** (`addBulk`, chunks
  of ~500); batch jobs do the sends. Never one job that loops over 100k users.
- Redis: dedicated logical DB or key prefix per environment; `maxRetriesPerRequest: null` on the
  worker connection (BullMQ requirement); AOF/managed persistence in production.

## NestJS wiring

- `@nestjs/bullmq`: `BullModule.forRoot` (connection) in the app module, `registerQueue` per
  queue in the owning domain module; processors live in the worker app (same codebase, second
  Nest entrypoint, e.g. `src/worker.ts`) selected by env/entry file.
- Handlers are thin: parse payload → call the same domain service the API uses. Business logic
  never lives in the processor class.
- Tests: unit-test the domain service directly; integration-test handlers with a real Redis
  (testcontainers or CI service) — mocked BullMQ tests prove nothing about delivery semantics.
