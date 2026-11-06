# softonoma-languages

Optional pack for **softonoma-orchestrator** (version 0.24.0). Language specialist agents (C#, Django, FastAPI, Go, Java, JavaScript, PHP, Python, Rust, shell, SQL, TypeScript, GraphQL) and shell-scripting skills. Enable in projects whose stack goes beyond the core Next.js/NestJS/FastAPI builders.

## Enable it
```
/plugin install softonoma-languages@softonoma
/reload-plugins
```
Or let `/softonoma-orchestrator:new-project` enable it when it detects the stack (it writes `"softonoma-languages@softonoma": true` into the project's `.claude/settings.json`). Enable it only where the stack needs it: every enabled agent and skill adds its description to every session.

## Agents (13)
| Agent | Model |
|---|---|
| csharp-pro | sonnet |
| django-pro | sonnet |
| fastapi-pro | sonnet |
| golang-pro | sonnet |
| graphql-architect | sonnet |
| java-pro | sonnet |
| javascript-pro | sonnet |
| php-pro | sonnet |
| python-pro | sonnet |
| rust-pro | sonnet |
| shell-pro | sonnet |
| sql-pro | sonnet |
| typescript-pro | sonnet |

## Skills (3)
| Skill | License |
|---|---|
| bash-pro | MIT |
| linux-shell-scripting | MIT |
| powershell-windows | MIT |

## Provenance
Copied from the Alfred orchestrator 0.21.0 (MIT, InsuranceMarket.ae), which vendors each skill verbatim from its upstream source with a `license:` field and a "Vendored from" note in the file; both are kept unchanged here. Only the plugin namespace was renamed (`alfred-orchestrator:` → the owning Softonoma plugin). Scripts shipped inside a skill are files only: nothing runs unless a developer invokes that skill.
