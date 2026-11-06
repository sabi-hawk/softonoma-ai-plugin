---
description: Put this project on the Softonoma AI workflow — detect the stack, create CLAUDE.md and the standard .claude/ structure (rules, skills, agents, hooks, KB, change log, lessons, plans, SETUP.md, team) and enable the matching plugin packs. Never overwrites existing files.
argument-hint: "[optional: product name, stack, or 'workspace' for a multi-repo product]"
---

Run the **project-onboard** skill (`softonoma-orchestrator:project-onboard`) now, for the current project.

- If the folder already has `CLAUDE.md` or `.claude/`, do NOT re-create anything: switch to **Mode D** (the
  same as `/softonoma-orchestrator:upgrade-project`) and only offer what is missing.
- Otherwise pick Mode A (empty folder or a new app), B (an existing single repo) or C (a multi-repo workspace)
  as the skill describes, detect the stack, choose the packs, and create the structure in
  `${CLAUDE_PLUGIN_ROOT}/WORKFLOW.md` §2.
- Ask only the one batched set of questions the skill lists; decide everything else and record it.

Extra context from the developer: $ARGUMENTS
