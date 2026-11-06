# softonoma-seo

Optional pack for **softonoma-orchestrator** (version 0.24.0). SEO and content: six SEO/content agents and fourteen SEO skills (audits, technical SEO, schema markup, programmatic SEO). Enable on public marketing websites.

## Enable it
```
/plugin install softonoma-seo@softonoma
/reload-plugins
```
Or let `/softonoma-orchestrator:new-project` enable it when it detects the stack (it writes `"softonoma-seo@softonoma": true` into the project's `.claude/settings.json`). Enable it only where the stack needs it: every enabled agent and skill adds its description to every session.

## Agents (6)
| Agent | Model |
|---|---|
| content-marketer | sonnet |
| seo-content-auditor | sonnet |
| seo-content-writer | sonnet |
| seo-keyword-strategist | sonnet |
| seo-meta-optimizer | sonnet |
| seo-structure-architect | sonnet |

## Skills (14)
| Skill | License |
|---|---|
| ai-seo | MIT |
| programmatic-seo | MIT |
| seo-analyze | see SKILL.md |
| seo-audit | MIT |
| seo-batch | see SKILL.md |
| seo-content-strategy | MIT |
| seo-delete | see SKILL.md |
| seo-new | see SKILL.md |
| seo-retire | see SKILL.md |
| seo-schema-markup | MIT |
| seo-setup | see SKILL.md |
| seo-status | see SKILL.md |
| seo-technical | MIT |
| seo-update | see SKILL.md |

## Provenance
Copied from the Alfred orchestrator 0.21.0 (MIT, InsuranceMarket.ae), which vendors each skill verbatim from its upstream source with a `license:` field and a "Vendored from" note in the file; both are kept unchanged here. Only the plugin namespace was renamed (`alfred-orchestrator:` → the owning Softonoma plugin). Scripts shipped inside a skill are files only: nothing runs unless a developer invokes that skill.
