---
name: nextjs-typescript
description: Strict TypeScript conventions for Next.js App Router work on the Softonoma stack — tsconfig strictness, typing Server/Client Components, route handlers, server actions, data fetching, and MongoDB/Redis boundaries. Use when writing or reviewing any Next.js + TypeScript code, when tightening types, or when a change "type-checks but breaks at runtime". Pairs with next-dev-loop for runtime verification.
---

# Next.js + TypeScript (Softonoma stack)

Type-safety conventions for Next.js (App Router) + TypeScript across the
Softonoma stack (Next.js/Vercel, MongoDB, Redis, Paymob/WebEngage/LiteAPI).
Goal: code that is correct at runtime, not merely code that compiles.

> For the exhaustive rule sets these conventions distill, install the official
> packs on demand:
> - `npx skills add vercel/next.js` — version-matched Next.js skills (see also **next-dev-loop**, **next-cache-components-optimizer**).
> - `npx skills add vercel-labs/agent-skills --skill react-best-practices` — React/Next performance rules.
> - `npx skills add marius-townhouse/effective-typescript-skills` — 83 "Effective TypeScript" rules (install specific ones with `--skill <name>`).

## Non-negotiable compiler config
`tsconfig.json` must keep these on. If any is off, that is a finding:
- `"strict": true` (implies `strictNullChecks`, `noImplicitAny`, …).
- `"noUncheckedIndexedAccess": true` — `arr[i]` / `obj[key]` are `T | undefined`. Handle the `undefined`.
- `"exactOptionalPropertyType": true` where the codebase already tolerates it.
- `"verbatimModuleSyntax": true` with `import type { … }` for type-only imports.
- Never suppress errors with `// @ts-ignore`; use `// @ts-expect-error <reason>` (it fails when the error disappears) — and only as a last resort.

## Types are erased — they never guard runtime
`instanceof`/type predicates work on values, not interfaces. Data crossing a
trust boundary (request bodies, `searchParams`, DB documents, third-party
webhooks) is `unknown` until validated. **Parse, don't cast:**
- Validate external input with a schema (e.g. Zod) and infer the type from the schema — do not hand-write an interface and `as` the payload into it.
- `as` and non-null `!` are red flags in a review; each one is an unproven runtime claim.

## Server vs Client Components
- Default to Server Components. A Client Component is opt-in with `'use client'` at the top of the file.
- Props passed from a Server Component to a Client Component must be serializable — no functions, class instances, `Date` round-trips assumed, or Mongo `ObjectId`. Convert to plain JSON-safe types (`id.toString()`) at the boundary.
- Type `async` Server Components as returning `Promise<JSX.Element>`; never make a Client Component `async`.

## Route handlers & server actions
- Route handlers: type the return as `Response`/`NextResponse`. In Next.js 15+, `params` and `searchParams` are `Promise`-wrapped — `await` them and type accordingly.
- Server actions: annotate the return type explicitly, validate arguments with a schema at the top, and gate them with auth per `server-auth-actions` guidance. Never trust a hidden form field's type.

## Data layer (MongoDB / Redis)
- Give every collection a document type; treat `find()` results as "shape you asked for" only after projection — unprojected reads are wider than your type implies.
- Redis returns `string | null`. Type it as such and parse; never `JSON.parse(await redis.get(k))` without the null check (`noUncheckedIndexedAccess` mindset).
- Serialize `ObjectId`/`Date` to strings before they leave the server boundary.

## Common "compiles but breaks" traps
- Indexing arrays/records without handling `undefined` (see `noUncheckedIndexedAccess`).
- `as` on `fetch().json()` (it returns `any`/`unknown`) — validate instead.
- Assuming a union is narrowed after an `await` (narrowing is lost across awaits — re-check).
- `useState` initialised without the type it will later hold (e.g. `useState<User | null>(null)`).

## Verify at runtime
Type-checking is necessary, not sufficient. After a change, confirm it actually
works in the running app using the **next-dev-loop** skill (drives `/_next/mcp` +
the browser), and cover the behavior with tests via **test-driven-development**
and **playwright-cli** / the e2e suite.
