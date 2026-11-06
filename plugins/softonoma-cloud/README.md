# softonoma-cloud

Optional pack for **softonoma-orchestrator** (version 0.24.0). Cloud and infrastructure: AWS, Azure, Google Cloud, Terraform, Docker and GitHub Actions skills, plus cloud, Kubernetes, Terraform, deployment, observability and troubleshooting agents. Enable in projects hosted on those platforms.

## Enable it
```
/plugin install softonoma-cloud@softonoma
/reload-plugins
```
Or let `/softonoma-orchestrator:new-project` enable it when it detects the stack (it writes `"softonoma-cloud@softonoma": true` into the project's `.claude/settings.json`). Enable it only where the stack needs it: every enabled agent and skill adds its description to every session.

## Agents (6)
| Agent | Model |
|---|---|
| cloud-architect | sonnet |
| deployment-engineer | sonnet |
| devops-troubleshooter | sonnet |
| kubernetes-architect | sonnet |
| observability-engineer | sonnet |
| terraform-specialist | sonnet |

## Skills (37)
| Skill | License |
|---|---|
| alloydb-basics | Apache-2.0 |
| aws-billing-and-cost-management | Apache-2.0 |
| aws-cdk | Apache-2.0 |
| aws-cloudformation | Apache-2.0 |
| aws-containers | Apache-2.0 |
| aws-iam | Apache-2.0 |
| aws-observability | Apache-2.0 |
| aws-serverless | Apache-2.0 |
| azure-ai | MIT |
| azure-deploy | MIT |
| azure-diagnostics | MIT |
| azure-kubernetes | MIT |
| azure-kusto | MIT |
| azure-prepare | MIT |
| azure-quotas | MIT |
| azure-reliability | MIT |
| azure-storage | MIT |
| azure-validate | MIT |
| cloud-logging-configuration-basics | Apache-2.0 |
| cloud-run-basics | Apache-2.0 |
| cloud-sql-basics | Apache-2.0 |
| github-actions-efficiency | MIT |
| github-actions-hardening | MIT |
| gke-cluster-creation | Apache-2.0 |
| google-cloud-networking-observability | Apache-2.0 |
| google-cloud-recipe-auth | Apache-2.0 |
| google-cloud-waf-reliability | Apache-2.0 |
| google-cloud-waf-security | Apache-2.0 |
| launch-with-aws | Apache-2.0 |
| multi-stage-dockerfile | MIT |
| querying-aws-cloudwatch | Apache-2.0 |
| rds-oss | Apache-2.0 |
| terraform-refactor-module | MPL-2.0 |
| terraform-search-import | MPL-2.0 |
| terraform-stacks | MPL-2.0 |
| terraform-style-guide | MPL-2.0 |
| terraform-test | MPL-2.0 |

## Provenance
Copied from the Alfred orchestrator 0.21.0 (MIT, InsuranceMarket.ae), which vendors each skill verbatim from its upstream source with a `license:` field and a "Vendored from" note in the file; both are kept unchanged here. Only the plugin namespace was renamed (`alfred-orchestrator:` → the owning Softonoma plugin). Scripts shipped inside a skill are files only: nothing runs unless a developer invokes that skill.
