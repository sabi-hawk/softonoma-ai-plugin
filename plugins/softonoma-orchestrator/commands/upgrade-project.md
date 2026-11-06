---
description: Bring an existing Softonoma setup up to the current standard structure — list what is missing (lessons, change-log archive, CARRY-OVER, SETUP.md, WORKFLOW.md, team file location, path-scoped rules, packs for the stack) and add only what you approve. Never overwrites or deletes anything.
argument-hint: "[optional: what to focus on]"
---

Run the **project-onboard** skill (`softonoma-orchestrator:project-onboard`) in **Mode D (upgrade, add-only)**
for the current project:

1. Compare the project with `${CLAUDE_PLUGIN_ROOT}/WORKFLOW.md` §2 and list every missing piece.
2. Show the list with AskUserQuestion (multi-select, all pre-selected) and wait for the answer.
3. Create only the approved pieces from the templates; never rewrite an existing file.
4. Log the upgrade in `.claude/knowledgebase/07-change-log.md` and report what was added and what was kept.

Focus from the developer: $ARGUMENTS
