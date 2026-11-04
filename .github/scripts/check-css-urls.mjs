#!/usr/bin/env node
// Mintlify inlines custom CSS into every page without rewriting url(). Images
// live under /docs in production but at the root on previews, so no url() path
// works on both. MDX <img> tags are rewritten to Mintlify's CDN, so use those.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function findCssUrls(source) {
  // Blank out comments but keep their newlines so line numbers still match.
  const css = source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
  const found = [];
  for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) {
    if (match[2].startsWith('data:')) continue;
    found.push({ line: css.slice(0, match.index).split('\n').length, url: match[2] });
  }
  return found;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = execFileSync('git', ['ls-files', '*.css'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  let failed = false;

  for (const file of files) {
    for (const { line, url } of findCssUrls(readFileSync(file, 'utf8'))) {
      console.error(`${file}:${line}: url(${url})`);
      failed = true;
    }
  }

  if (failed) {
    console.error('\nDon\'t use url() in CSS: Mintlify serves images under /docs in production but at the root on previews.');
    console.error('Use an <img alt=""> in MDX instead (Mintlify rewrites it to its CDN), or a data: URI.');
    process.exitCode = 1;
  } else {
    console.log(`No url() found in ${files.length} CSS file(s).`);
  }
}
