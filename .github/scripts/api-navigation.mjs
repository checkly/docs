import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://www.checklyhq.com/docs/';
export const OPENAPI_ENDPOINT = /^(\S+\.json)\s+(get|post|put|patch|delete|head|options)\s+(\/\S+)$/i;

export function readOpenApiSpec(filename) {
  return JSON.parse(readFileSync(filename, 'utf8'));
}

export function getNavigationPages(root) {
  const docs = JSON.parse(readFileSync(join(root, 'docs.json'), 'utf8'));
  const specs = new Map();
  const pages = [];

  function addPage(page) {
    const endpoint = page.match(OPENAPI_ENDPOINT);
    if (!endpoint) {
      pages.push({ slug: page.replace(/^\/+|\/+$/g, '') });
      return;
    }
    const [, source, verb, path] = endpoint;
    const method = verb.toLowerCase();
    if (!specs.has(source)) specs.set(source, readOpenApiSpec(join(root, source)));
    const operation = specs.get(source).paths?.[path]?.[method];
    const href = operation?.['x-mint']?.href;
    if (!href) throw new Error(`${page}: generated endpoints must declare x-mint.href to preserve their URLs`);
    const slug = href.replace(/^\/+|\/+$/g, '');
    if (existsSync(join(root, `${slug}.mdx`))) {
      throw new Error(`${page}: ${slug}.mdx would overwrite the schema-generated page`);
    }
    if (operation['x-mint'].metadata?.canonical !== `${BASE}${slug}/`) {
      throw new Error(`${page}: generated endpoint canonical must be ${BASE}${slug}/`);
    }
    pages.push({ slug, method, path, operation });
  }

  function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (key === 'pages' && Array.isArray(value)) {
        for (const page of value) {
          if (typeof page === 'string') addPage(page);
          else walk(page);
        }
      } else walk(value);
    }
  }
  walk(docs.navigation);
  return pages;
}
