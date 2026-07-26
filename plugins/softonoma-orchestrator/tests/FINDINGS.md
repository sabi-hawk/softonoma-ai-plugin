# Test suite findings — softonoma-orchestrator

Automated suite lives in `tests/`, runs via `npm test`. Tests run against throwaway
temp directories — the real `~/.claude` is never touched.

Bugs are logged here as they were found and fixed. Rerun the suite after any change:

```
npm test
```

---

## Bug #1 — `worktree.sh new` created an untracked file that blocked `remove`

**Found by:** `tests/scripts.spec.mjs` › *worktree.sh: new creates worktree … remove cleans it*

**Symptom:** Creating a worktree and immediately removing it (never editing a single
file) failed:

```
fatal: '.../myrepo-worktrees/feat-x' contains modified or untracked files, use --force to delete it
dirty worktree — commit/stash or pass --force manually
```

**Root cause:** `new` wrote the port bookkeeping via a **tracked-tree `.gitignore`**:

```bash
echo "$P" > "$WT/.worktree-port"
grep -qx '.worktree-port' "$WT/.gitignore" 2>/dev/null || echo '.worktree-port' >> "$WT/.gitignore"
```

That leaves `.gitignore` as a brand-new **untracked** file in the worktree, so
`git worktree remove` (which deliberately avoids `--force` for safety) refuses to
delete an otherwise-pristine worktree. The tool's own bookkeeping poisoned the
cleanup path it documents.

**Fix:** Ignore the port file through the shared git exclude
(`$(git rev-parse --git-common-dir)/info/exclude`) instead of writing a file into
the working tree. `.worktree-port` is now ignored everywhere without creating any
untracked/tracked file, so `remove` succeeds on a clean worktree with no `--force`.
(`scripts/worktree.sh`, `new` case.)

---

## Verified good (no change needed)

- All `skills/*/SKILL.md` and `agents/*.md` frontmatter is valid; agent models are
  restricted to sonnet/opus/haiku/inherit; every `${CLAUDE_PLUGIN_ROOT}` path
  referenced by a skill exists.
- Team lifecycle file ops (create/list/show/rename/delete) are repo-isolated: a
  delete in one repo never touches another, and rename preserves content.

## Test-harness notes (not plugin bugs)

- **Executable bit:** NTFS/Windows does not represent the POSIX exec bit, and the
  plugin dir isn't a git checkout here, so "script is executable" is asserted via
  the presence of a `#!` shebang (portable), plus a real `mode & 0o111` check on
  POSIX platforms.
- **Frontmatter parsing:** the static-check parser was extended to handle YAML
  folded/block scalars (e.g. `composition-patterns/SKILL.md` puts its `description:`
  on indented continuation lines) — valid frontmatter, not a defect.
