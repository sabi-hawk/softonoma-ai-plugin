---
name: kb
description: Build or extend the full product knowledge base and its browsable /kb viewer in the target project. Use for "create the knowledge base", "build the KB site", "add a KB module for X", "set up /kb", "document module X in the KB", or /softonoma-ops:kb [module]. Sources content from the repo's existing KB docs, FRDs and code, writes Markdown to .claude/knowledgebase/, scaffolds the /kb route in the project's own stack, and wires auto-update so new pages appear without code changes.
---

# Knowledge base — build the KB and the `/kb` viewer

You are the LEAD for a KB run. $ARGUMENTS may name a module (add/refresh just that one) or be empty (decide the mode below).

Target shape — the same structure as `stage.holidaymarket.ae/kb` and `imcrm-2.vercel.app/kb`: a left sidebar of collapsible sections, one section per top-level folder, Title-Cased page names, Markdown content, screenshots at the bottom of each page.

## Two things this command owns

1. **Content** — Markdown under `.claude/knowledgebase/`, one folder per module. Format and voice come from the **product-kb** skill; load it and follow it exactly. Do not invent a second convention.
2. **Viewer** — the `/kb` route inside the project, written in the project's own stack, reading the KB tree at runtime so **new files appear with no code change**.

## Mode detection (always first — never ask what you can detect)

| Situation | Mode |
|---|---|
| `.claude/knowledgebase/` missing | **FULL** — build the whole KB + viewer |
| Exists, `$ARGUMENTS` names a module | **MODULE** — add/refresh that module only |
| Exists, no `/kb` route in the app | **VIEWER** — scaffold the viewer against the existing content |
| Exists, both present | **SYNC** — refresh index/nav, update pages whose behaviour changed, add pages for new screens |

State the detected mode in one line before you start.

## Phase 1 — Find the real sources (do not write from imagination)

Search the repo before writing a word. In order of authority:

1. **`.claude/knowledgebase/`** — if present, this is the existing KB. Preserve it; extend, never restructure without approval.
2. **`knowledge-base/`** — the engineering parity docs written by **kb-builder**. This is the richest source: business rules with `file:line` citations. **Translate** it into product voice; do not copy engineering prose into the product KB.
3. **FRDs / ClickUp** — pull linked tasks via **clickup-ops** (Haiku) rather than spending your own tokens on tracker plumbing.
4. **The code** — routes/pages give you the true page inventory; server actions and validators give you the enforced rules.
5. **`plans/`** and prototypes — recent intent that may not be in code yet.

If two sources disagree, the **code is what the system does** and the FRD is what it was meant to do. Record the conflict in that page's "Open questions" — never silently pick one.

## Phase 2 — Structure

Follow **product-kb** exactly:

```
.claude/knowledgebase/
├── README.md                    # KB home — indexes everything
├── _order.json                  # optional: sidebar section order, e.g. ["pages","crm"]
├── overview/                    # read-first cross-cutting material
├── pages/                       # one file per user-facing screen
├── crm/  integrations/  platform/   # further modules as the product needs
└── assets/screenshots/<module>/
```

Rules that the viewer depends on — breaking them breaks the sidebar:

- Every folder has a `README.md`; it is that section's landing page.
- One page per file, `kebab-case.md`. The page's **first H1 becomes its sidebar label** — set it deliberately.
- Prefix drafts with `_` to hide them from the viewer.
- `assets/` is never a nav section.
- Business voice, "The system shall …", no file paths or function names. Unconfirmed items go under "Open questions".

Never leave a placeholder page. A missing page is better than a page that lies.

## Phase 3 — Generate the nav manifest

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/kb-index.mjs
```

Writes `.claude/knowledgebase/nav.json` — sections, pages, titles, URLs. Deterministic, so it is safe to re-run and to diff in CI. `--check` exits 1 when stale (use it in CI). The viewer reads this file, so nav is data, not code.

## Phase 4 — Scaffold the viewer in the project's stack

Detect the stack, then build `/kb` natively. **Do not** add Docusaurus, Nextra, MkDocs or similar: those produce a *separate* site, and the requirement is `/kb` inside the existing app — which is exactly what both reference sites do. A separate generator also means a second build, second deploy and duplicated auth/theming.

| Stack | Where the viewer goes |
|---|---|
| Next.js App Router | `app/kb/[[...slug]]/page.tsx` + `app/kb/layout.tsx` |
| Next.js Pages Router | `pages/kb/[[...slug]].tsx` |
| Laravel + Blade | `routes/web.php` → `resources/views/kb/show.blade.php` |
| Laravel + Inertia/React | Inertia page + controller (load **laravel-inertia-react**) |
| Nuxt / Vue | `pages/kb/[...slug].vue` |
| Angular | a `kb` feature route with a Markdown renderer |
| NestJS API only | serve rendered HTML, or state plainly that there is no UI layer to host `/kb` |

Requirements for whatever you build:

- **Read the tree at request/build time** from `nav.json` + the `.md` files. This is what makes new pages appear automatically — hardcoding a nav list defeats the whole feature.
- **Sidebar** — sections collapsible, section README as the section link, pages Title-Cased from their H1.
- **Content** — render Markdown with GFM (tables are used heavily). Sanitise HTML; KB content is trusted but the renderer should not be a hole.
- **Breadcrumbs** — `Section · Knowledge Base`, matching the reference sites.
- **Screenshots** — resolve `assets/screenshots/...` relative links to a served path.
- Reuse the project's existing layout, typography and theme. The KB should look like the app, not like a docs template.
- Prefer static generation where the stack supports it, so `/kb` costs nothing at runtime.

### Environment gating (decided — implement exactly this)

**`/kb` must not exist in production. It is open, with no auth, everywhere else.**

- In production: the route returns 404 (Next.js: `notFound()`; Laravel: don't register the route). Not a redirect, not a login page — absent.
- Staging, preview and local: fully open, no auth check.
- Always send `noindex, nofollow` and add `Disallow: /kb` to `robots.txt`, as defence in depth for a misconfigured environment.
- Drive it off the project's existing environment variable (`NODE_ENV`, `VERCEL_ENV`, `APP_ENV`); do not introduce a new secret.

This is deliberate: the KB carries pricing, commission and discount rules. Gating by auth would still ship those rules to production; not registering the route means there is nothing to leak. If someone later wants it in production, that is a business decision — surface it, don't just flip the flag.

## Phase 5 — Screenshots

Maintain `.claude/knowledgebase/screenshots.json` and run:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/kb-screenshots.mjs
```

In MODULE/SYNC mode regenerate only the affected module's shots. Commit images with the pages that reference them.

## Phase 6 — Auto-update (verify, don't assume)

Two mechanisms, both required:

1. **The viewer reads the filesystem** — a new `.md` file is a new page with no code change. Verify by adding a scratch page, loading `/kb`, then deleting it.
2. **The `kb-sync` hook** — the softonoma-ops pack ships a `PostToolUse` hook (it acts only once `.claude/knowledgebase/nav.json` exists, i.e. after this skill has built the viewer index) that re-runs `kb-index.mjs` whenever any file under `.claude/knowledgebase/` is written, so `nav.json` can never drift behind the content. It is silent unless the nav actually changed.

Also add `node scripts/kb-index.mjs --check` to the project's CI so a hand-edited `nav.json` cannot land stale.

Confirm both work before reporting done — a KB that silently stops updating is worse than no automation.

## Phase 7 — Ship

- Work in a worktree (**git-worktree-discipline**).
- Commit and PR via **git-ops** (Haiku).
- Post the `/kb` URL and new page list to the ClickUp task via **clickup-ops** (Haiku).
- Report: mode, modules written, page count, viewer path, and anything left in "Open questions".

## Autonomy

Run start-to-PR without pausing for procedural sign-off. Interrupt only for a genuine business decision — a business rule that no source settles, or two sources that conflict where guessing would document the wrong product. Use AskUserQuestion with real options.

## Skills to use
Invoke these softonoma-orchestrator plugin skills (via the Skill tool) when they fit the task at hand:
- **product-kb** — the KB's structure, voice and page template. The authority on content; follow it exactly.
- **kb-builder** — the engineering parity format; your richest source in migration projects, to be translated into product voice.
- **nextjs-app-router-patterns** — routing, static generation and metadata for the Next.js viewer.
- **nextjs-typescript** — typing the nav manifest and page props.
- **tailwind-design-system** — style the viewer with the project's existing tokens.
- **design-system-patterns** — reuse the app's layout and theming rather than inventing a docs look.
- **responsive-design** — the sidebar must collapse sensibly on mobile.
- **web-accessibility** — keyboard navigation and landmarks for the sidebar and content.
- **laravel-inertia-react** — Inertia-based viewer in legacy Laravel projects.
- **nuxt** — Nuxt-based viewer.
- **angular-routing** — Angular feature route for the viewer.
- **playwright-cli** — capture the KB screenshots.
- **next-dev-loop** — prove `/kb` actually renders before calling it done.
- **verification-before-completion** — verify auto-update really works, don't assume.
- **git-worktree-discipline** — never write code outside a worktree.
