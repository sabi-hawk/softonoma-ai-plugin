---
name: product-kb
description: Create or maintain the browsable product knowledge base under .claude/knowledgebase/ (business voice, "The system shall…", one folder per area, renders in the /kb viewer with screenshots). Use for "create a product knowledge base", "update the KB", "document this module for the KB", or after any feature ships that changes user-facing behavior. Distinct from kb-builder (engineering parity docs in knowledge-base/).
---

# Product Knowledge Base (/kb)

Target: `.claude/knowledgebase/` — browsable Markdown matching the HolidayMarket KB conventions so it renders in the `/kb` viewer with no viewer code changes.

## Interaction rule
Any question to the developer uses AskUserQuestion with options + "Other" — e.g. CREATE-mode source selection, or MAINTAIN-mode "these 4 pages look affected — update all?" (multi-select).

## Mode detection (always first)
- `.claude/knowledgebase/` missing → **CREATE** mode: build the full structure below with complete, non-placeholder content for every page, from the given sources (existing docs, prototype, FRDs, the codebase's user-facing behavior, this conversation).
- Exists → **MAINTAIN** mode: read the root README index + affected section, update only pages whose behavior changed, add pages for new screens, keep every existing convention exactly. Never restructure without explicit approval; never leave a page half-updated.

## Structure — one folder per top-level area, each with a `README.md` landing page
- `README.md` (root) — indexes everything; this becomes the `/kb` home page.
- `overview/` — the cross-cutting model everyone must read first: product model, key entities, core business/pricing/payment rules, glossary.
- `pages/` — one file per screen/page covering: what the page shows, where its data comes from (in business terms), its interactions, and the rules it enforces. Keep `pages/_TEMPLATE.md` (copy from this skill's `_TEMPLATE.md`) and standardise every page on it.
- Other top-level folders as the product needs: `integrations/`, `platform/`, `crm/`, `flows/` — same README.md pattern.
- `assets/screenshots/<module>/` — images; referenced with relative links (e.g. `assets/screenshots/hotels/search.png`); copied to `/kb-assets` at build time.

## Voice & conventions (mandatory)
- Business/product point of view, NOT technical: what the user/business can do and the rule enforced. No code, schema, function names, file paths, or library details.
- Requirement statements use "The system shall …".
- Unconfirmed items go in an "Open questions" section per page — never silently guess.
- Prefix draft/internal files or folders with `_` so the viewer hides them.
- Folder `README.md` = the section overview (collapses to the folder URL in the sidebar).
- Every page ends with its screenshot(s). Complete content only — a page with placeholders is worse than no page.

## Screenshots (Playwright)
1. Maintain `.claude/knowledgebase/screenshots.json` — the manifest of what to capture:
```json
{ "auth": "playwright/.auth/user.json",
  "shots": [ { "route": "/hotels", "out": "hotels/search.png", "fullPage": true },
             { "route": "/booking/checkout", "out": "hotels/checkout.png", "viewport": {"width": 390, "height": 844} } ] }
```
2. Run against the worktree's dev server: `node ${CLAUDE_PLUGIN_ROOT}/scripts/kb-screenshots.mjs` (base URL defaults to `http://localhost:$(cat .worktree-port)`; pass a URL to override). Requires playwright in the repo; `auth` is an optional Playwright storageState for logged-in pages (produce it with the e2e setup).
3. Regenerate only the affected module's shots in MAINTAIN mode; commit images with the pages that reference them.
