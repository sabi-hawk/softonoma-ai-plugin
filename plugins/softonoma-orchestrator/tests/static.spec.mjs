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

// ------------------------------------------------- marketplace plugins
// The repository-root marketplace lists the core and the optional packs (0.24.0).
// Every check below runs over ALL of them, not just the core.
const MARKET_ROOT = path.resolve(ROOT, '..', '..');
const MARKET = JSON.parse(fs.readFileSync(path.join(MARKET_ROOT, '.claude-plugin', 'marketplace.json'), 'utf8'));
const LOCAL_PLUGINS = MARKET.plugins
  .filter((p) => typeof p.source === 'string')
  .map((p) => ({ name: p.name, dir: path.resolve(MARKET_ROOT, p.source) }));
const skillDirsOf = (p) => (fs.existsSync(path.join(p.dir, 'skills')) ? listDirs(path.join(p.dir, 'skills')) : []);
const agentFilesOf = (p) => (fs.existsSync(path.join(p.dir, 'agents'))
  ? fs.readdirSync(path.join(p.dir, 'agents')).filter((n) => n.endsWith('.md')) : []);

test('marketplace: every plugins/* dir is listed, each has a valid plugin.json whose name matches', () => {
  const onDisk = listDirs(path.join(MARKET_ROOT, 'plugins')).sort();
  const listed = LOCAL_PLUGINS.map((p) => path.basename(p.dir)).sort();
  assert.deepEqual(listed, onDisk, 'marketplace.json must list exactly the plugin folders on disk');
  for (const p of LOCAL_PLUGINS) {
    const pj = JSON.parse(fs.readFileSync(path.join(p.dir, '.claude-plugin', 'plugin.json'), 'utf8'));
    assert.equal(pj.name, p.name, `${p.dir}: plugin.json name must equal the marketplace entry`);
    assert.match(pj.version, /^\d+\.\d+\.\d+$/, `${p.name}: semver version`);
  }
  assert.ok(LOCAL_PLUGINS.some((p) => p.name === 'softonoma-orchestrator'), 'the core must be listed');
});

test('totals across the core and the packs: at least 64 agents and 263 skills, no duplicate names', () => {
  const agents = LOCAL_PLUGINS.flatMap((p) => agentFilesOf(p).map((f) => f.replace(/\.md$/, '')));
  const skills = LOCAL_PLUGINS.flatMap(skillDirsOf);
  assert.ok(agents.length >= 64, `expected >= 64 agents, got ${agents.length}`);
  assert.ok(skills.length >= 263, `expected >= 263 skills, got ${skills.length}`);
  const dup = (a) => a.filter((x, i) => a.indexOf(x) !== i);
  assert.deepEqual(dup(agents), [], 'an agent name must live in exactly one plugin');
  assert.deepEqual(dup(skills), [], 'a skill name must live in exactly one plugin');
});

// ----------------------------------------------------------------- skills
test('every skills/*/SKILL.md (core and packs) has valid frontmatter (name + description)', () => {
  let n = 0;
  for (const p of LOCAL_PLUGINS) {
    for (const d of skillDirsOf(p)) {
      const file = path.join(p.dir, 'skills', d, 'SKILL.md');
      assert.ok(fs.existsSync(file), `${p.name}/${d}/SKILL.md must exist`);
      const fm = parseFrontmatter(fs.readFileSync(file, 'utf8'));
      assert.ok(fm, `${p.name}/${d}/SKILL.md must have YAML frontmatter`);
      assert.ok(fm.name && fm.name.length, `${p.name}/${d}/SKILL.md frontmatter must have a name`);
      assert.ok(fm.description && fm.description.length, `${p.name}/${d}/SKILL.md frontmatter must have a description`);
      n++;
    }
  }
  assert.ok(n > 0, 'expected skill dirs');
});

test('every ${CLAUDE_PLUGIN_ROOT} path referenced in a SKILL.md exists in that skill\'s own plugin', () => {
  const rx = /\$\{CLAUDE_PLUGIN_ROOT\}\/([^\s`)'"]+)/g;
  let checked = 0;
  for (const p of LOCAL_PLUGINS) {
    for (const d of skillDirsOf(p)) {
      const text = fs.readFileSync(path.join(p.dir, 'skills', d, 'SKILL.md'), 'utf8');
      let m;
      while ((m = rx.exec(text))) {
        const rel = m[1].replace(/[.,;:)]+$/, ''); // strip trailing punctuation
        assert.ok(fs.existsSync(path.join(p.dir, rel)), `${p.name}/${d}/SKILL.md references missing path: \${CLAUDE_PLUGIN_ROOT}/${rel}`);
        checked++;
      }
    }
  }
  assert.ok(checked > 0, 'expected at least one CLAUDE_PLUGIN_ROOT reference to validate');
});

test('plugin commands/*.md have a description and point at a skill that exists', () => {
  const dir = path.join(ROOT, 'commands');
  const files = fs.readdirSync(dir).filter((n) => n.endsWith('.md'));
  assert.ok(files.includes('new-project.md') && files.includes('upgrade-project.md'), 'onboarding commands must exist');
  const coreSkills = new Set(listDirs(path.join(ROOT, 'skills')));
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const fm = parseFrontmatter(text);
    assert.ok(fm && fm.description, `${f} must have a description`);
    for (const m of text.matchAll(/softonoma-orchestrator:([a-z0-9-]+)/g)) {
      const name = m[1];
      const isCommand = files.includes(name + '.md');
      assert.ok(coreSkills.has(name) || isCommand, `${f} references '${name}', which is neither a core skill nor a command`);
    }
  }
});

// ----------------------------------------------------------------- agents
test('every agents/*.md (core and packs) has valid frontmatter and a legal model', () => {
  const allowedModels = new Set(['sonnet', 'opus', 'haiku', 'inherit']);
  const core = LOCAL_PLUGINS.find((p) => p.name === 'softonoma-orchestrator');
  assert.ok(agentFilesOf(core).length >= 10, 'expected the full core agent roster');
  for (const p of LOCAL_PLUGINS) {
    for (const f of agentFilesOf(p)) {
      const fm = parseFrontmatter(fs.readFileSync(path.join(p.dir, 'agents', f), 'utf8'));
      assert.ok(fm, `${p.name}/${f} must have frontmatter`);
      assert.ok(fm.name && fm.name.length, `${p.name}/${f} must have a name`);
      assert.ok(fm.description && fm.description.length, `${p.name}/${f} must have a description`);
      if (fm.model !== undefined) {
        assert.ok(allowedModels.has(fm.model), `${p.name}/${f} model '${fm.model}' must be one of sonnet/opus/haiku/inherit`);
      }
    }
  }
});

test('every skill named in an agent "Skills to use" section resolves to a skill in the core or a pack', () => {
  const known = new Set(LOCAL_PLUGINS.flatMap(skillDirsOf));
  let checked = 0;
  for (const p of LOCAL_PLUGINS) {
    for (const f of agentFilesOf(p)) {
      const text = fs.readFileSync(path.join(p.dir, 'agents', f), 'utf8').replace(/\r\n/g, '\n');
      const i = text.indexOf('## Skills to use');
      if (i === -1) continue;
      // the section runs to the next level-2 heading (a later "## Working with …" lists AGENTS, not skills)
      const rest = text.slice(i + 3);
      const j = rest.search(/^## /m);
      const section = j === -1 ? rest : rest.slice(0, j);
      const rx = /^-\s+\*\*([a-z0-9-]+)\*\*/gm;
      let m;
      while ((m = rx.exec(section))) {
        assert.ok(known.has(m[1]), `${p.name}/${f} references skill '${m[1]}' but no plugin has skills/${m[1]}/`);
        checked++;
      }
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
