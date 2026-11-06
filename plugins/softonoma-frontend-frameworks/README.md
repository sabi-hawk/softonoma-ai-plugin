# softonoma-frontend-frameworks

Optional pack for **softonoma-orchestrator** (version 0.25.0). Angular, Vue/Pinia/VueUse, Nuxt, Svelte, Astro, Vite/Vitest/VitePress and JS monorepo tooling (pnpm, Turborepo, tsdown, UnoCSS, Nitro) skills. Enable in projects built on those frameworks.

## Enable it
```
/plugin install softonoma-frontend-frameworks@softonoma
/reload-plugins
```
Or let `/softonoma-orchestrator:new-project` enable it when it detects the stack (it writes `"softonoma-frontend-frameworks@softonoma": true` into the project's `.claude/settings.json`). Enable it only where the stack needs it: every enabled agent and skill adds its description to every session.

## Agents
None.

## Skills (36)
| Skill | License |
|---|---|
| angular-component | MIT |
| angular-developer | MIT |
| angular-di | MIT |
| angular-directives | MIT |
| angular-forms | MIT |
| angular-http | MIT |
| angular-new-app | MIT |
| angular-routing | MIT |
| angular-signals | MIT |
| angular-ssr | MIT |
| angular-testing | MIT |
| angular-tooling | MIT |
| astro-framework | MIT |
| astro-learning | MIT |
| nitro | MIT |
| nuxt | MIT |
| nuxt-ui | MIT |
| pinia | MIT |
| pnpm | MIT |
| svelte-code-writer | MIT |
| svelte-core-bestpractices | MIT |
| tsdown | MIT |
| turborepo | MIT |
| unocss | MIT |
| vite | MIT |
| vitepress | MIT |
| vitest | MIT |
| vue-adaptable-composable | MIT |
| vue-best-practices | MIT |
| vue-debug-guides | MIT |
| vue-jsx-best-practices | MIT |
| vue-options-api-best-practices | MIT |
| vue-pinia-best-practices | MIT |
| vue-router-best-practices | MIT |
| vue-testing-best-practices | MIT |
| vueuse-functions | MIT |

## Provenance
Copied from the Alfred orchestrator 0.21.0 (MIT, InsuranceMarket.ae), which vendors each skill verbatim from its upstream source with a `license:` field and a "Vendored from" note in the file; both are kept unchanged here. Only the plugin namespace was renamed (`alfred-orchestrator:` → the owning Softonoma plugin). Scripts shipped inside a skill are files only: nothing runs unless a developer invokes that skill.
