#!/usr/bin/env node
/**
 * Generates a custom sitemap.xml that OVERRIDES Mintlify's auto-generated one.
 *
 * It mirrors the docs.json navigation (the same set of pages Mintlify indexes)
 * but emits TRAILING-SLASH URLs, matching the form the site actually serves and
 * that each page declares as its canonical. This keeps every SEO signal —
 * served URL, <link rel="canonical">, and sitemap — pointing at the same
 * trailing-slash URL.
 *
 * Re-run whenever docs.json navigation changes:  npm run generate-sitemap
 * CI (.github/workflows/static-docs-checks.yml) fails if the committed
 * sitemap.xml drifts from docs.json.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
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
