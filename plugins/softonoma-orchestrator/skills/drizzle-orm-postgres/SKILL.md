---
name: drizzle-orm-postgres
description: Drizzle ORM on PostgreSQL the Softonoma way — schema-in-code organization, drizzle-kit migration discipline, typed queries, transactions, raw SQL escape hatch for PostGIS/geospatial and pg_trgm search, Supabase/pooled connection settings. Use for any task touching Drizzle schema files, drizzle-kit migrations, or Drizzle queries. Triggers on "Drizzle", "drizzle-kit", "drizzle migration", "PostGIS", "geospatial query", "GiST index", "pg_trgm", "ST_DWithin".
metadata:
  version: "1.0.0"
---

# Drizzle ORM on PostgreSQL (Softonoma stack)

For projects on Drizzle (typically NestJS + Supabase Postgres). Where a project uses Prisma,
use the `prisma-postgres` skill instead — never mix the two in one service.

## Schema organization

- Schema lives in code, one file per domain under `src/db/schema/` (e.g. `users.ts`,
  `listings.ts`), re-exported from `src/db/schema/index.ts`. Relations defined alongside tables.
- Enums as `pgEnum` with explicit value lists; shared string unions exported for the app layer.
- Every table: `id` (uuid, `defaultRandom()` or db-generated), `createdAt`/`updatedAt`
  timestamps with timezone. Soft-delete only when the product requires it — say so in the schema.
- Columns Postgres owns (PostGIS geometry/geography, tsvector) are declared with
  `customType` so they exist in the Drizzle schema and migrations, even when queried raw.

## Migration discipline

- **drizzle-kit generates SQL migrations into the repo; CI applies them.** Never push schema
  with `drizzle-kit push` against shared environments, and never edit schema in a dashboard —
  the migration folder is the source of truth.
- One migration per change set, reviewed like code. Hand-edit the generated SQL when needed
  (extensions, GiST/GIN indexes, triggers, RLS statements) — drizzle-kit preserves applied history
  by hash, so edit **before** applying anywhere.
- Extensions (`postgis`, `pg_trgm`) are enabled in an early migration, not clicked on in a console.
- A schema change ships in the same change as: the migration, the query/DTO updates that use
  it, and the project's schema index doc (e.g. `.claude/database/database.md`) when one exists.

## Queries

- Prefer the typed query builder; use `db.query.<table>.findMany({ with: ... })` for relational
  reads. Select only needed columns on hot paths.
- **Transactions** for any multi-table invariant (`db.transaction(async (tx) => ...)`) — e.g.
  accept-request + reserve-listing + decline-others is one transaction or it is wrong.
- Pagination is keyset (cursor on `createdAt`/id) for feeds; offset only for small admin tables.
- N+1: batch with `inArray`, or push the join into one query. Review loops that await per-row.

## Raw SQL escape hatch (PostGIS, search)

Drizzle's `sql` template is the sanctioned escape hatch — parameters are always bound, never
interpolated:

```ts
// nearby search: GiST-indexed, index-friendly ST_DWithin (meters on geography)
const rows = await db.execute(sql`
  select l.id, ST_Distance(l.geo, ST_MakePoint(${lng}, ${lat})::geography) as dist
  from listings l
  where l.status = 'available'
    and l.expires_at > now()
    and ST_DWithin(l.geo, ST_MakePoint(${lng}, ${lat})::geography, ${radiusMeters})
  order by dist asc
  limit ${limit}
`);
```

- Geospatial columns are `geography(Point, 4326)` unless there is a measured reason otherwise;
  index with `using gist`. Distance in meters via geography avoids projection math.
- Fuzzy search with `pg_trgm`: `similarity()`/`%` operators backed by a GIN trgm index; keep a
  synonym table for cross-language terms rather than stuffing logic into SQL.
- Wrap each raw query in a typed repository function with an explicit return type — raw SQL
  never leaks past the data layer.

## Connections (Supabase / pooled)

- Long-lived Node services use the **direct or session-mode** connection string with a sized
  pool (`postgres`/`pg` driver: max ≈ 10 per instance; count instances before raising it).
- Through a transaction-mode pooler (pgbouncer/Supavisor port 6543): **disable prepared
  statements** (`postgres(url, { prepare: false })`) or queries fail intermittently.
- Migrations always run against the **direct** connection, never the pooler.
- The service's DB credentials stay server-side (secrets manager); nothing client-held can reach
  the database when the platform exposes an auto data API — lock it down (RLS deny-all or API off).
