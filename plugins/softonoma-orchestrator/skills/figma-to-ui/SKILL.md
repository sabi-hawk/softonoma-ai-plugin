---
name: figma-to-ui
description: Turn a Figma design into implemented, reviewable UI in the target repo. Use when the developer provides a Figma link/node and asks to "implement this design", "convert Figma to code/UI", "build this screen from Figma", or invokes /softonoma-orchestrator:figma-to-ui <figma-url>. Pulls design context via the Figma MCP, maps it onto the project's existing design system, implements it, and verifies it at runtime against the design.
---

# Figma → UI

You are the LEAD for a design-implementation run. $ARGUMENTS is a Figma URL (optionally with a node id) plus any scope notes.

Goal: land the design as real UI that uses the project's existing design system — not a pixel-copy built from one-off values.

## Requirements

The **Figma MCP server** must be connected (this plugin declares it in `.mcp.json` as `figma` → `https://mcp.figma.com/mcp`; it uses OAuth, so the first call opens a browser authorization). Verify you actually have Figma tools before starting.

If Figma MCP is **not** available, stop and say so — offer the fallbacks rather than guessing at the design:
1. Ask for an exported PNG/SVG plus the token values, or
2. Ask for a screenshot and implement against the project's design system with explicit assumptions listed.

Never invent spacing, type or color values and present them as "the design".

## Phase 0 — Intake

Infer everything you can from the URL and repo; ask only what you genuinely cannot default. Use the option picker, never free-text prompts.

1. **Figma source** — the URL/node. If the link has no node id, list the top-level frames and let the developer pick.
2. **Target surface** — new route / existing component / design-system primitive. Offer the real paths you find in the repo.
3. **Scope** — MULTI-SELECT: **Static layout** / **Interaction states** (hover/focus/disabled/loading) / **Responsive breakpoints** / **Wire to real data** / **Empty + error states**.
4. **Confirm** — 3-line summary → **Start** / **Edit** / **Cancel**.

## Figma's own skills come first

Figma ships **first-party skills** for driving its MCP server, and they are more authoritative than anything in this plugin about how to call those tools. They are distributed as Figma's own plugin (`figma@softonoma` in our marketplace → `figma/mcp-server-guide`), not vendored here, so they stay current with the server.

**If the `figma` plugin is installed, prefer its skills:**

| Figma skill | Use it for |
|---|---|
| `figma-use` | **Mandatory before any `use_figma` call** — Figma says skipping it causes hard-to-debug failures |
| `figma-design-to-code` / `figma-implement-design` | pulling a design into code (this command's Phases 1–3) |
| `figma-generate-design` | pushing a page/layout back into Figma |
| `figma-generate-library` | building a design system in Figma from code |
| `figma-code-connect` | mapping Figma components to real codebase components — the durable version of Phase 2 |
| `figma-implement-motion` / `figma-use-motion` | animation and transitions |
| `figma-use-figjam` / `figma-use-slides` / `figma-generate-diagram` | FigJam, Slides, diagrams |

If it isn't installed, tell the developer once: `/plugin install figma@softonoma`. You can still proceed on the MCP tools alone — just don't guess at `use_figma` semantics.

The rest of this skill is the **Softonoma-specific** part Figma's skills don't cover: mapping onto *our* design system, choosing *our* agent, and verifying against *our* quality gates.

## Phase 1 — Pull the design context

Use the Figma MCP tools to get design context, screenshots and variable definitions for the node — following `figma-use` if it's available. Extract and write down, as a short spec:

- **Tokens** — spacing scale, type scale, colors, radii, shadows, and the Figma variable names behind them.
- **Layout** — auto-layout direction, gaps, padding, alignment, constraints, min/max sizes.
- **Components** — which Figma components are used, and their variants/props.
- **States** — every state present in the design (and note which the design does *not* specify).
- **Assets** — icons and images that need exporting.

## Phase 2 — Map onto the existing design system (do this before writing UI)

This is the step that makes the output maintainable. Search the repo first:

- Find existing components that already match each Figma component. **Reuse over recreate.**
- Map each Figma token to the project's token (Tailwind theme value, CSS variable, design-system token). Load **design-system-patterns** and **tailwind-design-system**.
- Produce a short mapping table: `Figma value → project token → component`.
- **Flag mismatches explicitly** — a Figma value with no matching token is a decision: extend the token set, or snap to the nearest existing token. Snapping is usually right; adding a one-off literal is usually wrong. If it changes the design system, that is a business/design decision — surface it with AskUserQuestion.

## Phase 3 — Implement

Delegate to the right agent for the repo's framework, and give it the spec plus the mapping table:

| Target | Agent |
|---|---|
| Next.js / React web | **frontend-dev** |
| Angular, Vue/Nuxt, Svelte, Astro | **frontend-dev** (it carries those framework skills) |
| React Native / Expo | **mobile-developer** |
| Flutter | **flutter-expert** |
| Design direction is undecided | **ui-ux-designer** first, then implement |

Rules for the implementer:
- Work in a worktree (**git-worktree-discipline**).
- Reuse design-system components; add new primitives only when nothing fits.
- Implement all states the design specifies, plus sensible empty/error states.
- Semantic markup and keyboard support from the start — load **web-accessibility**.
- Responsive behaviour via the project's breakpoints — load **responsive-design**.

## Phase 4 — Verify against the design

Do not report done on a type-check. Verify at runtime:

1. Run the app (**next-dev-loop**, or the framework's equivalent) and render the surface.
2. Screenshot it with Playwright (**playwright-cli**, **webapp-testing**) at each in-scope breakpoint.
3. Compare against the Figma screenshot from Phase 1 — check spacing rhythm, type scale, color, and every state.
4. Self-check with **web-design-guidelines** and **web-accessibility**.
5. List any **deliberate deviations** from the design with the reason (usually: snapped to an existing token). Deviations are fine; silent ones are not.

## Phase 5 — Hand off

- Tests for logic-bearing UI (**test-driven-development**).
- Commit and PR via **git-ops** (Haiku — don't spend a large model on plumbing).
- Post the before/after screenshots to the ClickUp task via **clickup-ops** when there is one.
- In the PR body: the mapping table, the deviations list, and the screenshots.

## Skills to use
Invoke these softonoma-orchestrator plugin skills (via the Skill tool) when they fit the task at hand:
- **design-system-patterns** — map Figma tokens onto real design tokens and theming.
- **tailwind-design-system** — Tailwind token/component system for the mapping table.
- **frontend-design** — visual judgement where the design leaves gaps.
- **responsive-design** — breakpoint and fluid-layout behaviour.
- **web-design-guidelines** — self-check the built UI for UX/accessibility compliance.
- **web-accessibility** — WCAG conformance for the implemented states.
- **composition-patterns** — component APIs that survive the next design change.
- **next-dev-loop** — prove the surface renders at runtime.
- **playwright-cli** — screenshot the result for comparison.
- **webapp-testing** — browser-level verification strategy.
- **core-web-vitals** — keep the new UI inside performance budgets.
- **git-worktree-discipline** — never write code outside a worktree.
- **verification-before-completion** — prove it matches before calling it done.
