#!/usr/bin/env node
// `mint broken-links` only validates link paths, so a link to `/page#gone` passes as long as
// `/page` exists. This checks every internal `#fragment` against the anchors Mintlify renders
// on the target page: headings, <ResponseField>/<ParamField> (`param-…`), <Tab>, <Accordion>
// and <Update>.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Mintlify's heading slugs, fitted against the live site (not github-slugger): runs of whitespace
// and `.` become one `-`, `?:()!,;[]` and backticks are dropped, straight quotes turn curly, and
// other punctuation (`&`, `/`, `_`, `→`, `’`, …) is kept.
export function slugify(text) {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*`]/g, '')
    .trim()
    .toLowerCase()
    .replace(/'/g, '’')
    .replace(/"/g, '”')
    .replace(/[?:()!,;[\]]/g, '')
    .replace(/^[\s.]+|[\s.]+$/g, '')
    .replace(/[\s.]+/g, '-');
}

// Component ids (<Tab>, <Accordion>, <Update>) are stricter: quotes are dropped and any other
// run of non-alphanumerics becomes one `-`. `HTTP/3 (HTTPS record)` → `http-3-https-record`.
export function componentSlug(text) {
  return text
    .toLowerCase()
    .replace(/['’"”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// <ResponseField>/<ParamField> ids also split camelCase: `x.fooBar` → `param-x-foo-bar`.
export function paramSlug(name) {
  return `param-${componentSlug(name.replace(/([a-z0-9])([A-Z])/g, '$1-$2'))}`;
}

// Blank out fenced code blocks (and inline code, unless `inline` is false), keeping line numbers.
export function stripCode(source, { inline = true } = {}) {
  let fence = null;
  return source.split('\n').map((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
      return '';
    }
    if (marker) {
      fence = marker[1];
      return '';
    }
    return inline ? line.replace(/(`+)(?:(?!\1).)+?\1/g, (code) => ' '.repeat(code.length)) : line;
  }).join('\n');
}

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`))?.slice(1).find((v) => v !== undefined);

export function extractAnchors(source) {
  const text = stripCode(source, { inline: false });
  const anchors = new Set();
  // A repeated id gets `-2`, `-3`, …; headings and components are counted separately.
  const counter = () => {
    const seen = new Map();
    return (slug) => {
      if (!slug) return;
      const count = seen.get(slug) ?? 0;
      seen.set(slug, count + 1);
      anchors.add(count ? `${slug}-${count + 1}` : slug);
    };
  };
  const addHeading = counter();
  const addComponent = counter();
  for (const line of text.split('\n')) {
    const heading = line.match(/^\s*#{1,6}\s+(.+?)\s*#*\s*$/);
    if (heading) addHeading(slugify(heading[1]));
  }
  for (const [tag] of text.matchAll(/<(?:ResponseField|ParamField)\b[^>]*>/g)) {
    const name = attr(tag, 'name') ?? attr(tag, 'path') ?? attr(tag, 'query') ?? attr(tag, 'body') ?? attr(tag, 'header');
    if (name) anchors.add(paramSlug(name));
  }
  for (const [tag] of text.matchAll(/<(?:Tab|Accordion|Update)\b[^>]*>/g)) {
    const title = attr(tag, 'title') ?? attr(tag, 'label');
    if (attr(tag, 'id') || title) addComponent(attr(tag, 'id') ?? componentSlug(title));
  }
  // Explicit ids on plain HTML elements (component props such as <YouTubeEmbed id> are not ids).
  for (const [, id] of text.matchAll(/<[a-z][a-z0-9]*\b[^>]*\bid=["']([^"']+)["']/g)) anchors.add(id);
  return anchors;
}

// Internal links that carry a fragment, with their 1-based line numbers.
export function extractLinks(source) {
  const links = [];
  stripCode(source).split('\n').forEach((line, index) => {
    const patterns = [/\]\(\s*<?([^)\s>]*#[^)\s>]*)>?(?:\s+"[^"]*")?\s*\)/g, /\bhref=\{?["'`]([^"'`]*#[^"'`]*)["'`]\}?/g];
    for (const pattern of patterns) {
      for (const [, href] of line.matchAll(pattern)) links.push({ href, line: index + 1 });
    }
  });
  return links;
}

const SITE = /^https?:\/\/(?:www\.)?checklyhq\.com\/docs(?=\/|#|$)/;

// Resolve an href to `{ page, fragment }` (page is the repo-relative path without `.mdx`), or
// null for external links.
export function resolveLink(href, fromPage) {
  let target = href.replace(SITE, '');
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) return null;
  const hash = target.indexOf('#');
  const fragment = decodeURIComponent(target.slice(hash + 1));
  let path = target.slice(0, hash).split('?')[0];
  if (!fragment) return null;
  if (!path) return { page: fromPage, fragment };
  path = path.startsWith('/') ? path : posix.join(posix.dirname(`/${fromPage}`), path);
  path = posix.normalize(path).replace(/^\/docs(?=\/)/, '').replace(/\/$/, '').replace(/\.mdx?$/, '');
  return { page: path.replace(/^\//, '') || 'index', fragment };
}

function walk(root, directory = root, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(root, path, files);
    else if (entry.name.endsWith('.mdx')) files.push(relative(root, path).split('\\').join('/'));
  }
  return files;
}

// Anchors of a page, including headings from `.mdx` snippets it imports.
function pageAnchors(root, file, cache) {
  if (cache.has(file)) return cache.get(file);
  const source = readFileSync(join(root, file), 'utf8');
  const anchors = extractAnchors(source);
  cache.set(file, anchors);
  for (const [, spec] of stripCode(source).matchAll(/^import\s+\w+\s+from\s+["']([^"']+\.mdx)["']/gm)) {
    const snippet = spec.startsWith('/') ? spec.slice(1) : posix.join(posix.dirname(file), spec);
    if (existsSync(join(root, snippet))) for (const anchor of pageAnchors(root, snippet, cache)) anchors.add(anchor);
  }
  return anchors;
}

// Returns every internal link whose fragment is not an anchor on its target page.
export function checkAnchors(root) {
  const files = walk(root);
  const known = new Set(files.map((file) => file.slice(0, -4)));
  const cache = new Map();
  const broken = [];
  for (const file of files) {
    const page = file.slice(0, -4);
    for (const link of extractLinks(readFileSync(join(root, file), 'utf8'))) {
      // A snippet's relative links resolve against whichever page imports it.
      if (file.startsWith('snippets/') && !/^(\/|https?:)/.test(link.href)) continue;
      const target = resolveLink(link.href, page);
      if (!target) continue;
      // Missing pages are `mint broken-links`' job; OpenAPI-generated pages have no MDX.
      const targetFile = known.has(target.page) ? `${target.page}.mdx` : known.has(`${target.page}/index`) ? `${target.page}/index.mdx` : null;
      if (!targetFile) continue;
      if (!pageAnchors(root, targetFile, cache).has(target.fragment)) broken.push({ file, ...link, target: targetFile });
    }
  }
  return broken;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const broken = checkAnchors(root);
  if (broken.length) {
    console.error(`${broken.length} link(s) point at an anchor that does not exist on the target page:`);
    for (const link of broken) {
      console.error(`${link.file}:${link.line}: ${link.href} (no such anchor in ${link.target})`);
      if (process.env.GITHUB_ACTIONS) console.log(`::error file=${link.file},line=${link.line}::Broken anchor ${link.href}`);
    }
    process.exitCode = 1;
  } else {
    console.log('OK: every internal #fragment link resolves to an anchor on its target page');
  }
}
