# softonoma-databases

Optional pack for **softonoma-orchestrator** (version 0.24.0). Database engines beyond the core Postgres/Prisma/MongoDB/Redis set: MariaDB, MySQL, Vitess, Oracle migrations, Aurora, DynamoDB, plus the database-architect and database-optimizer agents. Enable in projects on those engines or doing schema architecture.

## Enable it
```
/plugin install softonoma-databases@softonoma
/reload-plugins
```
Or let `/softonoma-orchestrator:new-project` enable it when it detects the stack (it writes `"softonoma-databases@softonoma": true` into the project's `.claude/settings.json`). Enable it only where the stack needs it: every enabled agent and skill adds its description to every session.

## Agents (2)
| Agent | Model |
|---|---|
| database-architect | sonnet |
| database-optimizer | sonnet |

## Skills (13)
| Skill | License |
|---|---|
| amazon-aurora-mysql | Apache-2.0 |
| amazon-aurora-postgresql | Apache-2.0 |
| amazon-dynamodb | Apache-2.0 |
| mariadb-features | MIT |
| mariadb-mcp | MIT |
| mariadb-query-optimization | MIT |
| mariadb-replication-and-ha | MIT |
| mariadb-system-versioned-tables | MIT |
| mariadb-vector | MIT |
| mysql-operations | MIT |
| mysql-to-mariadb | MIT |
| oracle-to-mariadb | MIT |
| vitess-scaling | MIT |

## Provenance
Copied from the Alfred orchestrator 0.21.0 (MIT, InsuranceMarket.ae), which vendors each skill verbatim from its upstream source with a `license:` field and a "Vendored from" note in the file; both are kept unchanged here. Only the plugin namespace was renamed (`alfred-orchestrator:` → the owning Softonoma plugin). Scripts shipped inside a skill are files only: nothing runs unless a developer invokes that skill.
