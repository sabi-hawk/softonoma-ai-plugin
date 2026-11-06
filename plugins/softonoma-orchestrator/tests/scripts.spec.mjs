// tests/scripts.spec.mjs — Part 3: scripts & hooks. Pure bash/node, no Claude needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SCRIPTS = path.join(ROOT, 'scripts');
const toBash = (p) => p.split(path.sep).join('/');

function sh(script, { args = [], cwd, env, input } = {}) {
  return new Promise((resolve) => {
    const p = spawn('bash', [toBash(script), ...args], {
      cwd, env: { ...process.env, ...env },
    });
    let out = '', err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => resolve({ code, out, err }));
    p.on('error', (e) => resolve({ code: -1, out, err: String(e) }));
    if (input != null) p.stdin.write(input);
    p.stdin.end();
  });
}

function tmp(tag) { return fs.mkdtempSync(path.join(os.tmpdir(), tag + '-')); }
function git(cwd, ...args) { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
function initRepo(dir) {
  fs.mkdirSync(dir, { recursive: true });
  git(dir, 'init', '-b', 'main');
  git(dir, 'config', 'user.email', 'test@example.com');
  git(dir, 'config', 'user.name', 'Test');
  git(dir, 'config', 'commit.gpgsign', 'false');
  fs.writeFileSync(path.join(dir, 'README.md'), '# repo\n');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-m', 'init', '--no-verify');
  return dir;
}

// ---------------------------------------------------------------- worktree.sh
test('worktree.sh: new creates worktree with deterministic port in 3100-3999; list shows it; remove cleans it', async () => {
  const base = tmp('wt');
  const repo = initRepo(path.join(base, 'myrepo'));
  const wtRoot = path.join(base, 'myrepo-worktrees');

  const created = await sh(path.join(SCRIPTS, 'worktree.sh'), { args: ['new', 'feat-x'], cwd: repo });
  assert.equal(created.code, 0, 'new should succeed:\n' + created.err);
  const wt = path.join(wtRoot, 'feat-x');
  assert.ok(fs.existsSync(wt), 'worktree dir should exist at ../myrepo-worktrees/feat-x');

  const portFile = path.join(wt, '.worktree-port');
  assert.ok(fs.existsSync(portFile), '.worktree-port should be written');
  const port = Number(fs.readFileSync(portFile, 'utf8').trim());
  assert.ok(port >= 3100 && port <= 3999, `port ${port} must be in 3100-3999`);

  // deterministic: base 3100 + cksum(name) % 900, no collisions on a fresh tree
  const cksum = Number(execFileSync('bash', ['-c', "printf '%s' feat-x | cksum | cut -d' ' -f1"], { encoding: 'utf8' }).trim());
  assert.equal(port, 3100 + (cksum % 900), 'port must be the deterministic cksum-derived value');

  const listed = await sh(path.join(SCRIPTS, 'worktree.sh'), { args: ['list'], cwd: repo });
  assert.equal(listed.code, 0);
  assert.match(listed.out, /feat-x/, 'list should show the worktree');

  const removed = await sh(path.join(SCRIPTS, 'worktree.sh'), { args: ['remove', 'feat-x'], cwd: repo });
  assert.equal(removed.code, 0, 'remove should succeed:\n' + removed.err);
  assert.ok(!fs.existsSync(wt), 'worktree dir should be gone after remove');
});

test('worktree team resolution: git-common-dir from inside a worktree resolves to the primary checkout', async () => {
  const base = tmp('wtres');
  const repo = initRepo(path.join(base, 'myrepo'));
  // teams file created ONLY in the primary checkout
  fs.mkdirSync(path.join(repo, '.claude', 'teams'), { recursive: true });
  fs.writeFileSync(path.join(repo, '.claude', 'teams', 'foo.json'), '{"teamName":"foo"}');

  const created = await sh(path.join(SCRIPTS, 'worktree.sh'), { args: ['new', 'feat-res'], cwd: repo });
  assert.equal(created.code, 0, created.err);
  const wt = path.join(base, 'myrepo-worktrees', 'feat-res');

  // the exact rule used by agent-team-orc to locate the primary checkout's teams dir
  const resolved = execFileSync('bash', ['-c', 'dirname "$(git rev-parse --git-common-dir)"'], { cwd: wt, encoding: 'utf8' }).trim();
  const teamsFile = path.join(resolved, '.claude', 'teams', 'foo.json');
  assert.ok(fs.existsSync(teamsFile), `teams file created only in primary must be found from the worktree via ${resolved}`);
});

// ---------------------------------------------------------- worktree-guard.sh
test('worktree-guard.sh: blocks code edits on main in the primary checkout (exit 2)', async () => {
  const base = tmp('guard');
  const repo = initRepo(path.join(base, 'myrepo'));
  const input = JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: 'src/app.ts' } });
  const r = await sh(path.join(SCRIPTS, 'worktree-guard.sh'), { input, env: { CLAUDE_PROJECT_DIR: repo } });
  assert.equal(r.code, 2, 'edit on main in primary must be blocked');
  assert.match(r.err, /BLOCKED/i);
});

test('worktree-guard.sh: allows the same edit inside a linked worktree (exit 0)', async () => {
  const base = tmp('guard2');
  const repo = initRepo(path.join(base, 'myrepo'));
  const created = await sh(path.join(SCRIPTS, 'worktree.sh'), { args: ['new', 'feat-g'], cwd: repo });
  assert.equal(created.code, 0, created.err);
  const wt = path.join(base, 'myrepo-worktrees', 'feat-g');
  const input = JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: 'src/app.ts' } });
  const r = await sh(path.join(SCRIPTS, 'worktree-guard.sh'), { input, env: { CLAUDE_PROJECT_DIR: wt } });
  assert.equal(r.code, 0, 'edits inside a worktree must be allowed');
});

test('worktree-guard.sh: allows an edit TARGETING a worktree file from a primary-checkout session (exit 0)', async () => {
  const base = tmp('guard4');
  const repo = initRepo(path.join(base, 'myrepo'));
  const created = await sh(path.join(SCRIPTS, 'worktree.sh'), { args: ['new', 'feat-t'], cwd: repo });
  assert.equal(created.code, 0, created.err);
  const wt = path.join(base, 'myrepo-worktrees', 'feat-t');
  // Session runs from the primary checkout (on main), but the file being edited is in the worktree.
  const input = JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: path.join(wt, 'src', 'app.ts') } });
  const r = await sh(path.join(SCRIPTS, 'worktree-guard.sh'), { input, env: { CLAUDE_PROJECT_DIR: repo } });
  assert.equal(r.code, 0, 'target location decides — worktree files are editable from any session cwd');
});

test('worktree-guard.sh: allows .claude/ and plans/ paths on main (exit 0)', async () => {
  const base = tmp('guard3');
  const repo = initRepo(path.join(base, 'myrepo'));
  for (const fp of ['.claude/settings.json', 'plans/upcoming/feature.md', 'CLAUDE.md', 'README.md', 'docs/runbook.md', 'docs/setup/guide.txt', 'NOTES.md']) {
    const input = JSON.stringify({ tool_name: 'Write', tool_input: { file_path: fp } });
    const r = await sh(path.join(SCRIPTS, 'worktree-guard.sh'), { input, env: { CLAUDE_PROJECT_DIR: repo } });
    assert.equal(r.code, 0, `${fp} on main should be allowed`);
  }
});

// ------------------------------------------------------------ coverage-gate.sh
test('coverage-gate.sh: exits nonzero when coverage/tests fail', async () => {
  const dir = initRepo(path.join(tmp('cov'), 'app'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: 'app', version: '1.0.0', scripts: { 'test:coverage': 'node -e "process.exit(1)"' },
  }));
  const r = await sh(path.join(SCRIPTS, 'coverage-gate.sh'), { cwd: dir });
  assert.equal(r.code, 2, 'below-threshold must block with exit 2');
});

test('coverage-gate.sh: exits zero when coverage passes', async () => {
  const dir = initRepo(path.join(tmp('cov2'), 'app'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: 'app', version: '1.0.0', scripts: { 'test:coverage': 'node -e "process.exit(0)"' },
  }));
  git(dir, 'add', '-A');
  git(dir, 'commit', '-m', 'pkg', '--no-verify');
  const r = await sh(path.join(SCRIPTS, 'coverage-gate.sh'), { cwd: dir });
  assert.equal(r.code, 0, 'passing coverage must exit 0:\n' + r.err);
  assert.match(r.out, /Coverage gate passed/);
});

// -------------------------------------------------- hooks + plugin manifests
test('hooks.json + plugin manifests: valid JSON, referenced scripts exist and are executable', () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(ROOT, 'hooks', 'hooks.json'), 'utf8'));
  const plugin = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));
  const market = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'marketplace.json'), 'utf8'));
  assert.equal(plugin.name, 'softonoma-orchestrator');
  assert.ok(Array.isArray(market.plugins) && market.plugins.length >= 1);

  const commands = [];
  for (const arr of Object.values(hooks.hooks)) {
    for (const group of arr) for (const h of group.hooks) commands.push(h.command);
  }
  assert.ok(commands.length >= 2, 'expected several hook commands');
  for (const cmd of commands) {
    // Commands must be interpreter-prefixed ("node <path>" / "bash <path>") so they
    // survive plugin installers that strip Unix exec bits from the cache copy.
    // The path is quoted ("${CLAUDE_PLUGIN_ROOT}/…") so a plugin root with a space survives (0.24.0).
    const m = cmd.match(/^(node|bash) "(\$\{CLAUDE_PLUGIN_ROOT\}\/[^"\s]+)"$/);
    assert.ok(m, `hook command must be "node|bash \${CLAUDE_PLUGIN_ROOT}/<script>": ${cmd}`);
    const [, interpreter, scriptPath] = m;
    const rel = scriptPath.replace('${CLAUDE_PLUGIN_ROOT}', '').replace(/^[/\\]/, '');
    const abs = path.join(ROOT, rel);
    assert.ok(fs.existsSync(abs), `hook script must exist: ${cmd}`);
    assert.equal(interpreter, rel.endsWith('.sh') ? 'bash' : 'node', `interpreter must match script type: ${cmd}`);
    const first = fs.readFileSync(abs, 'utf8').split('\n')[0];
    assert.match(first, /^#!/, `hook script must have a shebang: ${rel}`);
  }
});

// ---------------------------------------------------------------- task-gate.sh
// Project-type aware TaskCompleted gate: blocks only on real quality failures,
// never on environment gaps (missing deps/tools), and skips unknown projects.
const GATE = path.join(SCRIPTS, 'task-gate.sh');

test('task-gate: repo with no recognised project type is allowed', async () => {
  const dir = tmp('gate-none');
  const r = await sh(GATE, { cwd: dir, input: '{}' });
  assert.equal(r.code, 0, r.err);
});

test('task-gate: JS repo without node_modules is skipped (env gap, not a failure)', async () => {
  const dir = tmp('gate-js-nodeps');
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ scripts: { lint: 'definitely-not-a-real-binary' } }));
  const r = await sh(GATE, { cwd: dir, input: '{}' });
  assert.equal(r.code, 0, 'must not block when deps are not installed:\n' + r.err);
});

test('task-gate: JS repo with node_modules and a genuinely failing lint blocks', async () => {
  const dir = tmp('gate-js-fail');
  fs.mkdirSync(path.join(dir, 'node_modules'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ scripts: { lint: 'node -e "console.error(\'lint error\'); process.exit(1)"' } }));
  const r = await sh(GATE, { cwd: dir, input: '{}' });
  assert.equal(r.code, 2, 'real lint failure must block');
  assert.match(r.err, /lint/);
});

test('task-gate: JS repo whose lint fails only because the tool is missing is skipped', async () => {
  const dir = tmp('gate-js-envgap');
  fs.mkdirSync(path.join(dir, 'node_modules'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ scripts: { lint: 'definitely-not-a-real-binary --check' } }));
  const r = await sh(GATE, { cwd: dir, input: '{}' });
  assert.equal(r.code, 0, 'missing tool must skip, not block:\n' + r.err);
});

test('task-gate: Python repo with a syntax error blocks via compile check', async () => {
  const dir = tmp('gate-py-fail');
  fs.writeFileSync(path.join(dir, 'requirements.txt'), 'flask\n');
  fs.writeFileSync(path.join(dir, 'broken.py'), 'def nope(:\n');
  const r = await sh(GATE, { cwd: dir, input: '{}' });
  assert.equal(r.code, 2, 'python syntax error must block');
  assert.match(r.err, /compile check|pytest/);
});

test('task-gate: healthy Python repo is allowed', async () => {
  const dir = tmp('gate-py-ok');
  fs.writeFileSync(path.join(dir, 'requirements.txt'), 'flask\n');
  fs.writeFileSync(path.join(dir, 'fine.py'), 'VALUE = 1\n');
  const r = await sh(GATE, { cwd: dir, input: '{}' });
  assert.equal(r.code, 0, r.err);
});

// ------------------------------------------- worktree-guard.sh: Windows paths (0.24.0)
// On Git Bash the payload carries D:\repo\file or D:/repo/file. The guard must treat
// a drive-letter path as absolute and judge the file's OWN repo: the 0.23 guard did
// not, and on Windows it compared an MSYS path with git's C:/ path, so it never blocked.
const winPath = (p) => (process.platform === 'win32' ? p.replace(/\//g, '\\') : p);
const guardRun = (file, projectDir) => sh(path.join(SCRIPTS, 'worktree-guard.sh'), {
  input: JSON.stringify({ tool_input: { file_path: file } }),
  env: { CLAUDE_PROJECT_DIR: projectDir },
});

test('worktree-guard.sh: a backslash/drive path to code on main is blocked even when the session is elsewhere', async () => {
  const repo = initRepo(path.join(tmp('wgw'), 'repo'));
  const elsewhere = tmp('wgw-other');
  const r1 = await guardRun(winPath(path.join(repo, 'src', 'x.ts')), elsewhere);
  assert.equal(r1.code, 2, 'native path to code on main must block:\n' + r1.err);
  const r2 = await guardRun(path.join(repo, 'a.ts').replace(/\\/g, '/'), elsewhere);
  assert.equal(r2.code, 2, 'forward-slash path to code on main must block:\n' + r2.err);
});

test('worktree-guard.sh: backslash paths to *.md, docs/ and .claude/ on main are allowed; the opt-out allows code', async () => {
  const repo = initRepo(path.join(tmp('wgw2'), 'repo'));
  const elsewhere = tmp('wgw2-other');
  for (const rel of ['notes.md', 'docs/x.ts', '.claude/rules/x.ts']) {
    const r = await guardRun(winPath(path.join(repo, ...rel.split('/'))), elsewhere);
    assert.equal(r.code, 0, `${rel} on main must be allowed:\n` + r.err);
  }
  git(repo, 'config', 'softonoma.worktreeGuard', 'off');
  const r = await guardRun(winPath(path.join(repo, 'a.ts')), elsewhere);
  assert.equal(r.code, 0, 'opted-out repo must allow code:\n' + r.err);
});

// ------------------------------------------------------- onboard-check.sh (0.24.0)
const onboard = (dir) => sh(path.join(SCRIPTS, 'onboard-check.sh'), { input: '{}', env: { CLAUDE_PROJECT_DIR: dir } });

test('onboard-check.sh: speaks for an empty folder or a repo with no setup, exit 0', async () => {
  const empty = tmp('ob-empty');
  const r1 = await onboard(empty);
  assert.equal(r1.code, 0);
  assert.match(r1.out, /new-project/, 'empty folder: expected the new-project hint');
  const repo = initRepo(path.join(tmp('ob-repo'), 'repo'));
  const r2 = await onboard(repo);
  assert.match(r2.out, /new-project/, 'repo without CLAUDE.md/.claude: expected the hint');
});

test('onboard-check.sh: silent when the project or a parent is set up, and for a non-project folder', async () => {
  const ws = tmp('ob-ws');
  fs.writeFileSync(path.join(ws, 'CLAUDE.md'), '# ws\n');
  const child = initRepo(path.join(ws, 'product-repo'));
  const r1 = await onboard(child);
  assert.equal(r1.code, 0);
  assert.equal(r1.out.trim(), '', 'a repo inside a set-up workspace must stay silent');
  const withClaude = initRepo(path.join(tmp('ob-dot'), 'repo'));
  fs.mkdirSync(path.join(withClaude, '.claude'));
  assert.equal((await onboard(withClaude)).out.trim(), '', '.claude/ present: silent');
  const random = tmp('ob-random');
  fs.writeFileSync(path.join(random, 'notes.txt'), 'x');
  assert.equal((await onboard(random)).out.trim(), '', 'a non-project folder: silent');
});
