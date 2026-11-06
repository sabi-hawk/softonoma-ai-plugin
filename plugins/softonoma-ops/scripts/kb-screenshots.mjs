#!/usr/bin/env node
// KB screenshot capture. Usage: node kb-screenshots.mjs [baseURL] [--only <module/prefix>]
// Reads .claude/knowledgebase/screenshots.json; writes into .claude/knowledgebase/assets/screenshots/
import fs from 'node:fs'; import path from 'node:path';
const KB = '.claude/knowledgebase';
const manifestPath = path.join(KB, 'screenshots.json');
if (!fs.existsSync(manifestPath)) { console.error(`missing ${manifestPath}`); process.exit(1); }
const { chromium } = await import('playwright').catch(() => { console.error('playwright not installed in this repo — npm i -D playwright && npx playwright install chromium'); process.exit(1); });
const mf = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
let base = args.find(a => a.startsWith('http')) ||
  (fs.existsSync('.worktree-port') ? `http://localhost:${fs.readFileSync('.worktree-port','utf8').trim()}` : 'http://localhost:3000');
const ctxOpts = {};
if (mf.auth && fs.existsSync(mf.auth)) ctxOpts.storageState = mf.auth;
const browser = await chromium.launch();
const ctx = await browser.newContext(ctxOpts);
let ok = 0, fail = 0;
for (const s of mf.shots) {
  if (only && !s.out.startsWith(only)) continue;
  const page = await ctx.newPage();
  try {
    if (s.viewport) await page.setViewportSize(s.viewport);
    await page.goto(base + s.route, { waitUntil: 'networkidle', timeout: 30000 });
    if (s.waitFor) await page.waitForSelector(s.waitFor, { timeout: 10000 });
    const out = path.join(KB, 'assets/screenshots', s.out);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out, fullPage: s.fullPage !== false });
    console.log(`✓ ${s.route} -> ${s.out}`); ok++;
  } catch (e) { console.error(`✗ ${s.route}: ${e.message.split('\n')[0]}`); fail++; }
  await page.close();
}
await browser.close();
console.log(`done: ${ok} ok, ${fail} failed (base ${base})`);
process.exit(fail ? 1 : 0);
