// tests/static.spec.mjs — Part 4: skill/static checks + team lifecycle contract.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

// Frontmatter parser handling both inline `key: value` and YAML block/folded
// scalars (`key:` then indented continuation lines), which real skills use.
function parseFrontmatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const block = text.slice(3, end).replace(/^\r?\n/, '');
  const lines = block.split('\n').map((l) => l.replace(/\r$/, ''));
  const fm = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || /^\s/.test(line)) continue; // blank or continuation (consumed below)
    const m = /^([A-Za-z_][\w-]*):(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (!val) {
      const parts = [];
      while (i + 1 < lines.length && (/^\s+\S/.test(lines[i + 1]) || lines[i + 1].trim() === '')) {
        i++;
        if (lines[i].trim()) parts.push(lines[i].trim());
      }
      val = parts.join(' ');
    }
    val = val.replace(/^['"]|['"]$/g, '');
    if (fm[key] === undefined) fm[key] = val;
  }
  return fm;
}

function listDirs(p) {
  return fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}

// ----------------------------------------------------------------- skills
test('every skills/*/SKILL.md has valid frontmatter (name + description)', () => {
  const skillsDir = path.join(ROOT, 'skills');
  const dirs = listDirs(skillsDir);
  assert.ok(dirs.length > 0, 'expected skill dirs');
  for (const d of dirs) {
    const file = path.join(skillsDir, d, 'SKILL.md');
    assert.ok(fs.existsSync(file), `${d}/SKILL.md must exist`);
    const fm = parseFrontmatter(fs.readFileSync(file, 'utf8'));
    assert.ok(fm, `${d}/SKILL.md must have YAML frontmatter`);
    assert.ok(fm.name && fm.name.length, `${d}/SKILL.md frontmatter must have a name`);
    assert.ok(fm.description && fm.description.length, `${d}/SKILL.md frontmatter must have a description`);
  }
});

test('every ${CLAUDE_PLUGIN_ROOT} path referenced in a SKILL.md exists', () => {
  const skillsDir = path.join(ROOT, 'skills');
  const rx = /\$\{CLAUDE_PLUGIN_ROOT\}\/([^\s`)'"]+)/g;
  let checked = 0;
  for (const d of listDirs(skillsDir)) {
    const file = path.join(skillsDir, d, 'SKILL.md');
    const text = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = rx.exec(text))) {
      let rel = m[1].replace(/[.,;:)]+$/, ''); // strip trailing punctuation
      const abs = path.join(ROOT, rel);
      assert.ok(fs.existsSync(abs), `${d}/SKILL.md references missing path: \${CLAUDE_PLUGIN_ROOT}/${rel}`);
      checked++;
    }
  }
  assert.ok(checked > 0, 'expected at least one CLAUDE_PLUGIN_ROOT reference to validate');
});

// ----------------------------------------------------------------- agents
test('every agents/*.md has valid frontmatter and a legal model', () => {
  const agentsDir = path.join(ROOT, 'agents');
  const allowedModels = new Set(['sonnet', 'opus', 'haiku', 'inherit']);
  const files = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
  assert.ok(files.length >= 10, 'expected the full agent roster');
  for (const f of files) {
    const fm = parseFrontmatter(fs.readFileSync(path.join(agentsDir, f), 'utf8'));
    assert.ok(fm, `${f} must have frontmatter`);
    assert.ok(fm.name && fm.name.length, `${f} must have a name`);
    assert.ok(fm.description && fm.description.length, `${f} must have a description`);
    if (fm.model !== undefined) {
      assert.ok(allowedModels.has(fm.model), `${f} model '${fm.model}' must be one of sonnet/opus/haiku/inherit`);
    }
  }
});

test('every skill named in an agent "Skills to use" section resolves to a real skill dir', () => {
  const skillsDir = path.join(ROOT, 'skills');
  const known = new Set(listDirs(skillsDir));
  const agentsDir = path.join(ROOT, 'agents');
  let checked = 0;
  for (const f of fs.readdirSync(agentsDir).filter((n) => n.endsWith('.md'))) {
    const text = fs.readFileSync(path.join(agentsDir, f), 'utf8');
    const i = text.indexOf('## Skills to use');
    if (i === -1) continue;
    const section = text.slice(i);
    const rx = /^-\s+\*\*([a-z0-9-]+)\*\*/gm;
    let m;
    while ((m = rx.exec(section))) {
      assert.ok(known.has(m[1]), `${f} references skill '${m[1]}' but skills/${m[1]}/ does not exist`);
      checked++;
    }
  }
  assert.ok(checked >= 20, `expected many agent→skill references (got ${checked})`);
});

// -------------------------------------------------- team lifecycle contract
// Models what agent-team-orc's file operations do: the team IS the JSON file at
// <primary>/.claude/teams/<name>.json. create/list/show/rename/delete operate on
// exactly that one directory. These assert the cross-repo isolation invariants.
function teamsDirFor(repo) { return path.join(repo, '.claude', 'teams'); }
function createTeam(repo, name, data) {
  const dir = teamsDirFor(repo);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name + '.json'), JSON.stringify(data, null, 2));
}
function listTeams(repo) {
  const dir = teamsDirFor(repo);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort();
}
function showTeam(repo, name) {
  return JSON.parse(fs.readFileSync(path.join(teamsDirFor(repo), name + '.json'), 'utf8'));
}
function renameTeam(repo, oldName, newName) {
  const dir = teamsDirFor(repo);
  const content = fs.readFileSync(path.join(dir, oldName + '.json'), 'utf8');
  fs.writeFileSync(path.join(dir, newName + '.json'), content); // write new
  fs.rmSync(path.join(dir, oldName + '.json'));                  // delete old
}
function deleteTeam(repo, name) {
  fs.rmSync(path.join(teamsDirFor(repo), name + '.json'));
}

test('team lifecycle: create/list/show/rename/delete with cross-repo isolation', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'teamlc-'));
  const repoA = path.join(base, 'repo-a');
  const repoB = path.join(base, 'repo-b');
  fs.mkdirSync(repoA, { recursive: true });
  fs.mkdirSync(repoB, { recursive: true });

  createTeam(repoA, 'alpha-core', { teamName: 'alpha-core', roster: ['qa2', 'sec2'] });
  createTeam(repoA, 'alpha-review', { teamName: 'alpha-review', roster: ['qa2'] });
  createTeam(repoB, 'beta-build', { teamName: 'beta-build', roster: ['frontend-dev', 'backend-dev'] });

  // list
  assert.deepEqual(listTeams(repoA), ['alpha-core', 'alpha-review']);
  assert.deepEqual(listTeams(repoB), ['beta-build']);

  // show
  assert.deepEqual(showTeam(repoA, 'alpha-core').roster, ['qa2', 'sec2']);

  // rename preserves content
  const before = showTeam(repoA, 'alpha-core');
  renameTeam(repoA, 'alpha-core', 'alpha-core-renamed');
  assert.deepEqual(listTeams(repoA), ['alpha-core-renamed', 'alpha-review']);
  assert.deepEqual(showTeam(repoA, 'alpha-core-renamed'), before, 'rename must preserve content byte-for-byte');
  assert.ok(!fs.existsSync(path.join(teamsDirFor(repoA), 'alpha-core.json')), 'old name must be gone after rename');

  // delete in repo A must never touch repo B
  const bBefore = listTeams(repoB);
  deleteTeam(repoA, 'alpha-review');
  assert.deepEqual(listTeams(repoA), ['alpha-core-renamed']);
  assert.deepEqual(listTeams(repoB), bBefore, 'delete in repo A must not affect repo B');
  assert.ok(fs.existsSync(path.join(teamsDirFor(repoB), 'beta-build.json')), 'repo B team untouched');
});
