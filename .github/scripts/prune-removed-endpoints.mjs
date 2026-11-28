#!/usr/bin/env node

/**
 * prune-removed-endpoints.mjs
 *
 * Remove API reference pages for endpoints that are no longer in the spec,
 * so the spec sync job does not stop on them. Runs after the new spec has
 * been written to api-reference/openapi.json and before
 * detect-new-endpoints.mjs.
 *
 * For each menu entry whose endpoint is gone, it:
 *   - removes the entry from docs.json,
 *   - deletes the MDX stub, if the page was one,
 *   - redirects the old URL to the first remaining page of the same menu
 *     group (or the API reference overview), and points existing redirects
 *     that ended at the old URL to the same place.
 *
 * Schema-generated pages take their URL from x-mint.href, which only the
 * previous spec still has. It is read from git (HEAD), or from the path
 * given as the first argument.
 *
 * Env vars:
 *   DRY_RUN=1                 — log what would change, don't write files
 *   PRUNED_ENDPOINTS_FILE=... — append one Markdown list line per removed
 *                               endpoint, for the PR description
 */

import { appendFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { OPENAPI_ENDPOINT, readOpenApiSpec } from './api-navigation.mjs';

const DRY_RUN = process.env.DRY_RUN === '1';
const ROOT = process.cwd();
const SPEC_FILE = 'api-reference/openapi.json';
const DOCS_JSON_PATH = join(ROOT, 'docs.json');
const FALLBACK_DESTINATION = '/api-reference/overview';
const MDX_ENDPOINT = /^openapi:\s*(get|post|put|patch|delete)\s+(\/\S+)\s*$/im;

function normalisePath(p) {
  return p.length > 1 ? p.replace(/\/+$/, '') : p;
}

// Look an operation up regardless of trailing-slash convention.
function findOperation(spec, path, method) {
  const wanted = normalisePath(path);
  for (const [specPath, methods] of Object.entries(spec.paths ?? {})) {
    if (normalisePath(specPath) === wanted && methods?.[method]) return methods[method];
  }
  return undefined;
}

function loadPreviousSpec(argPath) {
  if (argPath) return readOpenApiSpec(argPath);
  try {
    return JSON.parse(execFileSync('git', ['show', `HEAD:${SPEC_FILE}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }));
  } catch {
    // No history to compare with: schema-generated pages lose their redirect,
    // but MDX pages still get one from their own path.
    return { paths: {} };
  }
}

const hrefOf = (operation) => operation?.['x-mint']?.href;
const toUrl = (slug) => `/${slug.replace(/^\/+|\/+$/g, '')}`;

// Describe a menu entry: which endpoint it documents and the URL it serves.
function describeEntry(page) {
  const native = page.match(OPENAPI_ENDPOINT);
  if (native) {
    const [, source, verb, path] = native;
    return { kind: 'native', source, method: verb.toLowerCase(), path };
  }
  const file = join(ROOT, `${page}.mdx`);
  if (!page.startsWith('api-reference/') || !existsSync(file)) return null;
  const match = readFileSync(file, 'utf8').match(MDX_ENDPOINT);
  if (!match) return null;
  return { kind: 'mdx', file, method: match[1].toLowerCase(), path: match[2], url: toUrl(page) };
}

// The URL a remaining menu entry is served at, or null if it has none.
function urlOfEntry(page, spec) {
  if (typeof page !== 'string') return null;
  const native = page.match(OPENAPI_ENDPOINT);
  if (!native) return toUrl(page);
  const href = hrefOf(findOperation(spec, native[3], native[2].toLowerCase()));
  return href ? toUrl(href) : null;
}

// A group whose last page this run removed would show as an empty menu
// heading. Groups that were already empty are left as they are.
function dropEmptiedGroups(node, emptied) {
  if (Array.isArray(node)) return node.forEach((child) => dropEmptiedGroups(child, emptied));
  if (!node || typeof node !== 'object') return;
  for (const value of Object.values(node)) {
    dropEmptiedGroups(value, emptied);
    if (!Array.isArray(value)) continue;
    const kept = value.filter((child) => !(child && typeof child === 'object' && emptied.has(child.pages)));
    value.splice(0, value.length, ...kept);
  }
}

function pruneRemovedEndpoints({ docs, spec, previousSpec }) {
  const removed = [];
  const emptied = new Set();

  function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (key !== 'pages' || !Array.isArray(value)) { walk(value); continue; }
      const gone = [];
      for (const page of value) {
        if (typeof page !== 'string') { walk(page); continue; }
        const entry = describeEntry(page);
        if (!entry) continue;
        // Other spec files are not synced by this job; leave them alone.
        if (entry.kind === 'native' && entry.source !== SPEC_FILE) continue;
        if (findOperation(spec, entry.path, entry.method)) continue;
        const oldHref = hrefOf(findOperation(previousSpec, entry.path, entry.method));
        const url = entry.kind === 'mdx' ? entry.url : oldHref ? toUrl(oldHref) : null;
        gone.push({ page, ...entry, url });
      }
      if (!gone.length) continue;
      const remaining = value.filter((page) => !gone.some((g) => g.page === page));
      value.splice(0, value.length, ...remaining);
      if (!remaining.length) emptied.add(value);
      const destination = remaining.map((page) => urlOfEntry(page, spec)).find(Boolean) ?? FALLBACK_DESTINATION;
      for (const g of gone) removed.push({ ...g, destination });
    }
  }
  walk(docs.navigation);
  if (emptied.size) dropEmptiedGroups(docs.navigation, emptied);

  docs.redirects ??= [];
  for (const r of removed) {
    if (!r.url) continue;
    for (const redirect of docs.redirects) {
      if (redirect.destination.split('#')[0] === r.url) redirect.destination = r.destination;
    }
    if (!docs.redirects.some((redirect) => redirect.source === r.url)) {
      docs.redirects.unshift({ source: r.url, destination: r.destination });
    }
  }
  return removed;
}

function main() {
  const docs = JSON.parse(readFileSync(DOCS_JSON_PATH, 'utf8'));
  const spec = readOpenApiSpec(join(ROOT, SPEC_FILE));
  const previousSpec = loadPreviousSpec(process.argv[2]);
  const removed = pruneRemovedEndpoints({ docs, spec, previousSpec });

  if (!removed.length) {
    console.log('✅ Every API reference page still has its endpoint in the spec.');
    return;
  }

  console.log(`🗑 ${removed.length} endpoint(s) left the spec:\n`);
  const lines = [];
  for (const r of removed) {
    const key = `${r.method.toUpperCase()} ${r.path}`;
    const where = r.url ? `${r.url} → ${r.destination}` : 'no old URL known, no redirect added';
    console.log(`  - ${key}: ${where}`);
    lines.push(r.url
      ? `- \`${key}\`: removed \`${r.url}\`, redirected to \`${r.destination}\``
      : `- \`${key}\`: removed from the menu (no old URL known, no redirect added)`);
    if (r.kind === 'mdx' && !DRY_RUN) rmSync(r.file);
  }

  if (!DRY_RUN) writeFileSync(DOCS_JSON_PATH, JSON.stringify(docs, null, 2) + '\n');
  if (process.env.PRUNED_ENDPOINTS_FILE) appendFileSync(process.env.PRUNED_ENDPOINTS_FILE, lines.join('\n') + '\n');
}

try {
  main();
} catch (err) {
  console.error('❌ Fatal error:', err);
  process.exit(1);
}
