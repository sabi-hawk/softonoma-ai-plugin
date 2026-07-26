#!/usr/bin/env node
// Read-only monitor of running agent teams. Usage: node teams-monitor.mjs [--watch] [--json]
// Reads ~/.claude/teams/* (members) and ~/.claude/tasks/* (task lists). Never writes.
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const HOME = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
const TEAMS = path.join(HOME, 'teams'), TASKS = path.join(HOME, 'tasks');
const args = process.argv.slice(2), WATCH = args.includes('--watch'), JSONOUT = args.includes('--json');

const readJsonDeep = (dir) => { // all .json under dir, parsed defensively
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir, { recursive: true })) {
    const p = path.join(dir, String(f));
    if (!p.endsWith('.json') || !fs.statSync(p).isFile()) continue;
    try { out.push({ file: p, data: JSON.parse(fs.readFileSync(p, 'utf8')) }); } catch {}
  }
  return out;
};
const ago = (ms) => { const m = Math.round((Date.now() - ms) / 60000); return m < 1 ? 'now' : m < 60 ? `${m}m ago` : `${Math.round(m/60)}h ago`; };

function snapshot() {
  const teams = [];
  if (fs.existsSync(TEAMS)) for (const name of fs.readdirSync(TEAMS)) {
    const tdir = path.join(TEAMS, name);
    if (!fs.statSync(tdir).isDirectory()) continue;
    const cfgs = readJsonDeep(tdir);
    // collect member-ish names from any config shape
    const members = new Set();
    for (const { data } of cfgs) {
      const arr = data.members || data.teammates || data.agents || [];
      for (const m of Array.isArray(arr) ? arr : []) members.add(m.name || m.agentType || m.id || String(m));
    }
    // newest mtime anywhere in the team dir = last activity
    let last = fs.statSync(tdir).mtimeMs;
    for (const { file } of cfgs) last = Math.max(last, fs.statSync(file).mtimeMs);
    // tasks for this team
    const counts = {}; let taskTotal = 0;
    for (const { data, file } of readJsonDeep(path.join(TASKS, name))) {
      const list = Array.isArray(data) ? data : (data.tasks || [data]);
      for (const t of list) { if (!t || typeof t !== 'object') continue;
        const st = (t.status || t.state || 'unknown').toLowerCase();
        counts[st] = (counts[st] || 0) + 1; taskTotal++;
        last = Math.max(last, fs.statSync(file).mtimeMs);
      }
    }
    teams.push({ team: name, members: [...members], tasks: counts, taskTotal, lastActivity: last });
  }
  teams.sort((a, b) => b.lastActivity - a.lastActivity);
  return teams;
}

function render() {
  const teams = snapshot();
  if (JSONOUT) { console.log(JSON.stringify(teams, null, 2)); return; }
  if (WATCH) console.clear();
  console.log(`Agent teams on this machine  (${new Date().toLocaleTimeString()})  [read-only]\n`);
  if (!teams.length) { console.log('  no team state found — no teams have run yet (or a custom CLAUDE_CONFIG_DIR is in use)'); return; }
  for (const t of teams) {
    const stale = Date.now() - t.lastActivity > 30 * 60000 ? '  (stale — likely finished/crashed)' : '';
    console.log(`● ${t.team}   last activity ${ago(t.lastActivity)}${stale}`);
    console.log(`   agents: ${t.members.length ? t.members.join(', ') : '(lead only / unknown)'}`);
    const c = Object.entries(t.tasks).map(([k, v]) => `${k}:${v}`).join('  ');
    console.log(`   tasks : ${t.taskTotal ? c : 'none'}\n`);
  }
  console.log('note: this reads state files; a "running" team whose session was killed appears until Claude Code cleans it up.');
}
render();
if (WATCH) setInterval(render, 3000);
