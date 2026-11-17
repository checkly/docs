#!/usr/bin/env node
// Line checks for .mdx pages, on the lines changed against the merge base with origin/main, so
// existing text never blocks an edit.
//
// As a Claude Code PostToolUse hook it reads the hook JSON on stdin and checks the edited file;
// exit 2 sends the findings back to the agent. From the shell, pass files as arguments:
//   node .claude/hooks/check-mdx.mjs path/to/page.mdx ...
// Exit 1 then means findings.
//
// Checks: frontmatter (fence, title, description, canonical; sidebarTitle on new pages),
// absolute links to the docs site, code fences without a language, images without alt text,
// "Step N:" headings, and Vale errors except spelling (the repo has no Vale vocabulary yet, so
// spelling flags every product name). Vale is skipped when it is not installed.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const BASE_URL = 'https://www.checklyhq.com/docs/'
const SKIP = /^(api-reference(-old)?|node_modules|skills)\//

function git (root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
}

function repoRoot (file) {
  try {
    return git(path.dirname(file), ['rev-parse', '--show-toplevel']).trim()
  } catch {
    return null
  }
}

function mergeBase (root) {
  for (const ref of ['origin/main', 'main']) {
    try {
      return git(root, ['merge-base', ref, 'HEAD']).trim()
    } catch {}
  }
  return 'HEAD'
}

// Returns { isNew, lines: Set<number> | null }; null means every line counts as changed.
function changedLines (root, rel, base) {
  try {
    git(root, ['cat-file', '-e', `${base}:${rel}`])
  } catch {
    return { isNew: true, lines: null }
  }
  const diff = git(root, ['diff', '--unified=0', '--no-color', base, '--', rel])
  const lines = new Set()
  for (const m of diff.matchAll(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = Number(m[1])
    const count = m[2] === undefined ? 1 : Number(m[2])
    for (let i = start; i < start + count; i++) lines.add(i)
  }
  return { isNew: false, lines }
}

function checkFrontmatter (rel, text, isNew) {
  const out = []
  if (rel.startsWith('snippets/')) return out
  const lines = text.split('\n')
  if (lines[0] !== '---') return [[1, 'frontmatter must start with a line that is exactly `---`']]
  const end = lines.indexOf('---', 1)
  if (end < 0) return [[1, 'frontmatter has no closing `---`']]
  const fm = lines.slice(1, end)
  const value = key => {
    const line = fm.find(l => l.startsWith(`${key}:`))
    return line === undefined ? undefined : line.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, '')
  }
  if (value('openapi') !== undefined) return out
  const slug = rel.replace(/\.mdx$/, '')
  const canonical = slug === 'index' ? BASE_URL : `${BASE_URL}${slug}/`
  if (!value('title')) out.push([1, 'frontmatter needs `title`'])
  if (!value('description')) out.push([1, 'frontmatter needs `description`'])
  if (value('canonical') !== canonical) out.push([1, `frontmatter needs \`canonical: '${canonical}'\``])
  if (isNew && !value('sidebarTitle')) out.push([1, 'a new page needs `sidebarTitle` (AGENTS.md)'])
  return out
}

function checkLines (text) {
  const out = []
  const lines = text.split('\n')
  let inFence = false
  let fenceMark = ''
  let inFrontmatter = lines[0] === '---'
  lines.forEach((line, i) => {
    const n = i + 1
    if (inFrontmatter) {
      if (i > 0 && line === '---') inFrontmatter = false
      return
    }
    const fence = line.match(/^\s*(`{3,}|~{3,})(.*)$/)
    if (fence) {
      if (!inFence) {
        inFence = true
        fenceMark = fence[1]
        if (!fence[2].trim()) out.push([n, 'code fence needs a language, for example ```ts or ```text Terminal'])
      } else if (fence[1].startsWith(fenceMark) && !fence[2].trim()) {
        inFence = false
      }
      return
    }
    if (inFence) return
    if (/\]\(https:\/\/(www\.)?checklyhq\.com\/docs\//.test(line) || /href=["']https:\/\/(www\.)?checklyhq\.com\/docs\//.test(line)) {
      out.push([n, 'link to a docs page with a relative path (/section/page), not https://www.checklyhq.com/docs/'])
    }
    if (/!\[\s*\]\(/.test(line)) out.push([n, 'image needs alt text'])
    if (/^#{1,6}\s+Step\s+\d+\s*[:.]/i.test(line)) out.push([n, 'heading must not start with "Step N:"; name what the reader does'])
  })
  // <img ...> tags may span several lines.
  for (const m of text.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(m[0])) out.push([text.slice(0, m.index).split('\n').length, '<img> needs alt text'])
  }
  return out
}

function checkVale (root, text) {
  let raw
  try {
    // The repo's .vale.ini applies its styles to *.md only; --ext=.md applies them to this page.
    raw = execFileSync('vale', ['--ext=.md', '--output=JSON', '--minAlertLevel=error'], {
      cwd: root, input: text, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'],
    })
  } catch (err) {
    if (err.code === 'ENOENT') return []
    raw = err.stdout
  }
  let alerts
  try {
    alerts = Object.values(JSON.parse(raw || '{}')).flat()
  } catch {
    return []
  }
  return alerts
    .filter(a => a.Check !== 'Vale.Spelling')
    .map(a => [a.Line, `${a.Message} (${a.Check})`])
}

function checkFile (file) {
  const abs = path.resolve(file)
  if (!abs.endsWith('.mdx') || !existsSync(abs)) return []
  const root = repoRoot(abs)
  if (!root || !existsSync(path.join(root, 'docs.json'))) return []
  const rel = path.relative(root, abs)
  if (SKIP.test(rel)) return []
  const text = readFileSync(abs, 'utf8')
  const { isNew, lines } = changedLines(root, rel, mergeBase(root))
  if (lines && lines.size === 0) return []
  const inScope = ([n]) => lines === null || lines.has(n)
  const findings = [
    ...checkFrontmatter(rel, text, isNew),
    ...[...checkLines(text), ...checkVale(root, text)].filter(inScope),
  ]
  const seen = new Set()
  return findings
    .sort((a, b) => a[0] - b[0])
    .map(([n, msg]) => `${rel}:${n}: ${msg}`)
    .filter(s => !seen.has(s) && seen.add(s))
}

const args = process.argv.slice(2)
if (args.length > 0) {
  const findings = args.flatMap(checkFile)
  for (const f of findings) console.log(f)
  process.exit(findings.length > 0 ? 1 : 0)
}

let input = ''
for await (const chunk of process.stdin) input += chunk
let file
try {
  file = JSON.parse(input).tool_input?.file_path
} catch {}
if (!file) process.exit(0)
const findings = checkFile(file)
if (findings.length > 0) {
  console.error(`Docs line checks found problems in lines you changed. Fix them:\n${findings.join('\n')}`)
  process.exit(2)
}
