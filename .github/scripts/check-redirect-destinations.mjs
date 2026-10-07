#!/usr/bin/env node
// Legacy redirects are inbound-only, so Mintlify's broken-links scan does not check them.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getNavigationPages } from './api-navigation.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const docs = JSON.parse(readFileSync(join(root, 'docs.json'), 'utf8'));
const pages = new Set(getNavigationPages(root)
  .filter((page) => page.operation)
  .map((page) => `/${page.slug}`));
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.mdx')) pages.add(`/${relative(root, path).slice(0, -4)}`);
  }
}
walk(root);

const redirects = (docs.redirects ?? []).filter((redirect) => redirect.source.startsWith('/reference/'));
const broken = redirects.filter((redirect) => !pages.has(redirect.destination.split('#')[0]));
if (broken.length) {
  console.error(`${broken.length} /reference/* redirect destination(s) have no matching page:`);
  for (const redirect of broken) console.error(`${redirect.source} -> ${redirect.destination}`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${redirects.length} /reference/* redirect destinations resolve to MDX or schema-generated pages`);
}
