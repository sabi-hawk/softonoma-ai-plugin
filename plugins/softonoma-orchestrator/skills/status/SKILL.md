---
name: status
description: Show which agent teams and agents are currently running on this machine, with task progress — read-only monitoring. Use for "what's running", "team status", "show running teams/agents", or /softonoma-orchestrator:status.
---

# Team Status (read-only)

Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/teams-monitor.mjs --json` and present the result as a compact table: team (session), agents, task counts by status, last activity. Flag stale entries (>30 min inactive) as likely finished/crashed. If empty, say no teams have run yet.

For a terminal self-refreshing view instead:
```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/teams-monitor.mjs --watch
```
Never modify anything under ~/.claude/teams or ~/.claude/tasks — this is a viewer.
