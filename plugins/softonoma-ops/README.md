# softonoma-ops

Optional pack for **softonoma-orchestrator** (version 0.24.0). Operations add-ons: Axiom log/metrics skills (triage, alerting, dashboards), the ClickUp CU lifecycle skills (raise-cu, pickup-cu, signoff-cu, verify-cu) and the kb skill with its /kb viewer indexer. Enable in projects using Axiom, the ClickUp lifecycle, or an in-app /kb.

## Enable it
```
/plugin install softonoma-ops@softonoma
/reload-plugins
```
Or let `/softonoma-orchestrator:new-project` enable it when it detects the stack (it writes `"softonoma-ops@softonoma": true` into the project's `.claude/settings.json`). Enable it only where the stack needs it: every enabled agent and skill adds its description to every session.

## Agents
None.

## Skills (14)
| Skill | License |
|---|---|
| axiom-alerting | MIT |
| axiom-cost-control | MIT |
| axiom-dashboards | MIT |
| axiom-metrics-chart | MIT |
| axiom-query-metrics | MIT |
| axiom-spl-to-apl | MIT |
| axiom-sre | MIT |
| axiom-triage | see SKILL.md |
| axiom-writing-evals | MIT |
| kb | see SKILL.md |
| pickup-cu | see SKILL.md |
| raise-cu | see SKILL.md |
| signoff-cu | see SKILL.md |
| verify-cu | see SKILL.md |

## Provenance
Copied from the Alfred orchestrator 0.21.0 (MIT, InsuranceMarket.ae), which vendors each skill verbatim from its upstream source with a `license:` field and a "Vendored from" note in the file; both are kept unchanged here. Only the plugin namespace was renamed (`alfred-orchestrator:` → the owning Softonoma plugin). Scripts shipped inside a skill are files only: nothing runs unless a developer invokes that skill.
