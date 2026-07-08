#!/usr/bin/env node
/**
 * Generates a custom sitemap.xml that OVERRIDES Mintlify's auto-generated one.
 *
 * Why: Mintlify serves and canonicalizes docs URLs without a trailing slash,
 * but the site actually serves — and Google indexes — the trailing-slash form
 * (and every page now declares a trailing-slash canonical). This emits a sitemap
 * whose <loc>s match that trailing-slash form, so canonical + sitemap + served
 * URL all agree.
 *
 * Source of truth: the docs.json navigation (exactly the pages Mintlify indexes).
 * Output: sitemap.xml at the repo root, which Mintlify serves in place of its
 * auto-generated file (https://www.mintlify.com/docs/optimize/seo).
 *
 * NOTE: this script lives under .github/ on purpose — Mintlify does not build
 * the .github tree, so a stray .mjs here can never break the docs build (a root
 * scripts/*.mjs previously did).
 *
 * Run:  npm run generate-sitemap
 * CI (static-docs-checks) regenerates and fails if the committed file drifts.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = 'https://www.checklyhq.com/docs/'

const docs = JSON.parse(readFileSync(join(ROOT, 'docs.json'), 'utf8'))

// Collect every page slug referenced anywhere in the navigation tree.
const slugs = new Set()
function walk(node) {
  if (Array.isArray(node)) return node.forEach(walk)
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'pages' && Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string') slugs.add(item.replace(/^\/+|\/+$/g, ''))
          else walk(item)
        }
      } else {
        walk(value)
      }
    }
  }
}
walk(docs.navigation)

const urls = [...slugs]
  .sort()
  .map((slug) => `  <url>\n    <loc>${BASE}${slug}/</loc>\n  </url>`)
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

writeFileSync(join(ROOT, 'sitemap.xml'), xml)
console.log(`Wrote sitemap.xml with ${slugs.size} trailing-slash URLs`)
