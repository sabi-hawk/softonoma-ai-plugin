# softonoma-data-ai

Optional pack for **softonoma-orchestrator** (version 0.25.1). AI, ML and data agents (ai-engineer, ml-engineer, data-engineer, data-scientist). Enable in projects with LLM features, model serving, pipelines or analytics.

## Enable it
```
/plugin install softonoma-data-ai@softonoma
/reload-plugins
```
Or let `/softonoma-orchestrator:new-project` enable it when it detects the stack (it writes `"softonoma-data-ai@softonoma": true` into the project's `.claude/settings.json`). Enable it only where the stack needs it: every enabled agent and skill adds its description to every session.

## Agents (4)
| Agent | Model |
|---|---|
| ai-engineer | sonnet |
| data-engineer | sonnet |
| data-scientist | sonnet |
| ml-engineer | sonnet |

## Skills
None.

## Provenance
Copied from the Alfred orchestrator 0.21.0 (MIT, InsuranceMarket.ae), which vendors each skill verbatim from its upstream source with a `license:` field and a "Vendored from" note in the file; both are kept unchanged here. Only the plugin namespace was renamed (`alfred-orchestrator:` → the owning Softonoma plugin). Scripts shipped inside a skill are files only: nothing runs unless a developer invokes that skill.
