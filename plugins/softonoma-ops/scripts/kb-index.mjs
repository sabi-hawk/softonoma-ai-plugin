#!/usr/bin/env node
// Scan the product knowledge base and emit the navigation manifest the /kb
// viewer reads. Deterministic: same tree in, same nav.json out — so it is safe
// to run on every KB edit from a hook, and to diff in CI.
//
//   node kb-index.mjs [--root <dir>] [--check] [--quiet]
//
//   --check  exit 1 if nav.json is missing or stale (no write). For CI/hooks.
//
// Conventions (see the product-kb skill):
//   - Root README.md is the KB home page.
//   - Each top-level folder is a sidebar section; its README.md is the section
//     landing page and collapses to the folder URL.
//   - Files/folders prefixed with `_` are drafts and are hidden.
//   - `assets/` holds images, never nav entries.
//   - Title = the page's first H1, else Title Case of the file name.
//   - Section order: overview first (it is the read-first material), then any
//     order given in `_order.json`, then the rest alphabetically.

import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_ROOT = path.join('.claude', 'knowledgebase');
const IGNORED_DIRS = new Set(['assets', 'node_modules', '.git']);

function parseArgs(argv) {
  const o = { root: DEFAULT_ROOT, check: false, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') o.root = argv[++i];
    else if (argv[i] === '--check') o.check = true;
    else if (argv[i] === '--quiet') o.quiet = true;
  }
  return o;
}

const hidden = (name) => name.startsWith('_') || name.startsWith('.');

// "booking-lead-and-payment-model" -> "Booking Lead And Payment Model"
function titleCase(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

// Prefer the page's own H1 so authors control the label; fall back to the slug.
// Skips YAML frontmatter and fenced code blocks so a `# comment` inside a shell
// snippet is never mistaken for the title.
function readTitle(file, slug) {
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return titleCase(slug);
  }
  const lines = text.split('\n');
  let i = 0;
  if (lines[0]?.trim() === '---') {
    i = 1;
    while (i < lines.length && lines[i].trim() !== '---') i++;
    i++;
  }
  let fenced = false;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const m = /^#\s+(.+?)\s*$/.exec(line);
    if (m) return m[1].replace(/[*_`]/g, '').trim() || titleCase(slug);
  }
  return titleCase(slug);
}

function readOrder(dir) {
  const f = path.join(dir, '_order.json');
  if (!fs.existsSync(f)) return [];
  try {
    const v = JSON.parse(fs.readFileSync(f, 'utf8'));
    return Array.isArray(v) ? v : Array.isArray(v.sections) ? v.sections : [];
  } catch {
    return []; // a malformed _order.json must not break the build
  }
}

function pagesIn(dir, urlBase) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md') && !hidden(e.name) && e.name !== 'README.md')
    .map((e) => {
      const slug = e.name.replace(/\.md$/, '');
      return {
        slug,
        title: readTitle(path.join(dir, e.name), slug),
        url: `${urlBase}/${slug}`,
        file: path.join(dir, e.name),
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

function build(root) {
  if (!fs.existsSync(root)) {
    throw new Error(
      `knowledge base not found at ${root} — run /softonoma-ops:kb to create it`
    );
  }

  const rootReadme = path.join(root, 'README.md');
  const home = {
    title: fs.existsSync(rootReadme) ? readTitle(rootReadme, 'home') : 'Knowledge Base',
    url: '/kb',
    file: fs.existsSync(rootReadme) ? rootReadme : null,
  };

  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !hidden(e.name) && !IGNORED_DIRS.has(e.name))
    .map((e) => e.name);

  const explicit = readOrder(root).filter((n) => dirs.includes(n));
  const rest = dirs.filter((n) => n !== 'overview' && !explicit.includes(n)).sort();
  const ordered = [
    ...(dirs.includes('overview') && !explicit.includes('overview') ? ['overview'] : []),
    ...explicit,
    ...rest,
  ];

  const sections = ordered.map((name) => {
    const dir = path.join(root, name);
    const url = `/kb/${name}`;
    const readme = path.join(dir, 'README.md');
    return {
      slug: name,
      title: fs.existsSync(readme) ? readTitle(readme, name) : titleCase(name),
      url,
      index: fs.existsSync(readme) ? readme : null,
      pages: pagesIn(dir, url),
    };
  });

  // Top-level loose pages (rare, but don't silently drop them)
  const loose = pagesIn(root, '/kb');

  return {
    generatedBy: 'softonoma-ops/scripts/kb-index.mjs',
    root,
    home,
    sections,
    pages: loose,
    counts: {
      sections: sections.length,
      pages: sections.reduce((n, s) => n + s.pages.length, 0) + loose.length,
    },
  };
}

function main() {
  const { root, check, quiet } = parseArgs(process.argv.slice(2));
  let nav;
  try {
    nav = build(root);
  } catch (e) {
    console.error(`kb-index: ${e.message}`);
    process.exit(check ? 1 : 2);
  }

  const out = path.join(root, 'nav.json');
  const next = JSON.stringify(nav, null, 2) + '\n';
  const prev = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;

  if (check) {
    if (prev !== next) {
      console.error(
        `kb-index: ${out} is ${prev === null ? 'missing' : 'stale'} — run: node scripts/kb-index.mjs`
      );
      process.exit(1);
    }
    if (!quiet) console.log(`kb-index: nav.json up to date (${nav.counts.sections} sections, ${nav.counts.pages} pages)`);
    return;
  }

  if (prev === next) {
    if (!quiet) console.log('kb-index: no change');
    return;
  }
  fs.writeFileSync(out, next);
  if (!quiet) {
    console.log(`kb-index: wrote ${out} — ${nav.counts.sections} sections, ${nav.counts.pages} pages`);
  }
}

main();
