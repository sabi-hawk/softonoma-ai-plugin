# Lessons: the stories behind the rules

The rules in `.claude/rules/` load into every session (or every session that touches their files), so they
stay short: one line per rule. The **why** lives here, one file per rule file (`lessons/git.md`,
`lessons/testing.md`, …): what happened, what it cost, what was measured, and how the rule was amended.

- Each story sits under a short anchor (`<a id="push-once"></a>`) so a rule line can end with
  `(why: lessons/git.md#push-once)`.
- A new rule = one line in the rule file + its story here, in the same change.
- Lessons are read on demand (when a rule is unclear or being changed), never loaded automatically.
