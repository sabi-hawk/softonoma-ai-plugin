# softonoma-orchestrator test suite

Rerunnable automated tests for the plugin. **Every test runs against a throwaway
sandbox `CLAUDE_CONFIG_DIR`** built by `fixtures.mjs` under the OS temp dir — the
real `~/.claude` is never read or written.

## Run

```
npm test
```

First-time setup (once):

```
npm install
```

## Layout

| File | Part | Covers |
| --- | --- | --- |
| `scripts.spec.mjs` | 1 | `worktree.sh` (create/list/remove, deterministic port, worktree→primary team resolution), `worktree-guard.sh`, `coverage-gate.sh`, and hook/manifest validity. |
| `static.spec.mjs` | 2 | Skill/agent frontmatter validity, `${CLAUDE_PLUGIN_ROOT}` path existence, and the team-lifecycle file-ops contract with cross-repo isolation. |
| `FINDINGS.md` | 3 | Every bug found + how it was fixed. |

Bugs found and fixed are logged in [`FINDINGS.md`](./FINDINGS.md).
