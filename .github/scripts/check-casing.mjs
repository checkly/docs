#!/usr/bin/env node
// Casing check for docs pages (.mdx). Blocks PRs on new casing mistakes.
//
//   node .github/scripts/check-casing.mjs              lines changed since the merge base with origin/main
//   node .github/scripts/check-casing.mjs --base <ref> lines changed since <ref>
//   node .github/scripts/check-casing.mjs --all <file.mdx>...   every line of the given files
//
// Two kinds of rules, both described in AGENTS.md ("Casing and terminology"):
// - Vale, with only the Checkly style (styles/Checkly/*.yml): check and monitor
//   types, third-party names, single feature instances.
// - This script: headings, frontmatter `title`/`sidebarTitle` and component
//   `title="…"` props use sentence case. Names that keep their capitals are in
//   styles/Checkly/proper-nouns.txt.
//
// Only changed lines are checked by default, so existing text never blocks a PR.
// Files under api-reference/ (generated) and api-reference-old/ (legacy) are skipped.

import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
process.chdir(root)

const args = process.argv.slice(2)
const all = args.includes('--all')
const baseIdx = args.indexOf('--base')
const base = baseIdx >= 0 ? args[baseIdx + 1] : process.env.CASING_BASE || 'origin/main'
const norm = (f) => path.relative(root, path.resolve(root, f))
const isDoc = (f) => f.endsWith('.mdx') && !/^api-reference(-old)?\//.test(norm(f)) && existsSync(f)

// file -> Set of line numbers to check (null = every line)
const targets = new Map()
if (all) {
  for (const f of args.filter((a) => a !== '--all' && a !== '--base' && a !== base)) {
    if (isDoc(f)) targets.set(norm(f), null)
  }
} else {
  const mergeBase = execFileSync('git', ['merge-base', base, 'HEAD'], { encoding: 'utf8' }).trim()
  const diff = execFileSync('git', ['diff', '--unified=0', '--no-color', mergeBase, '--', '*.mdx'], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
  let file = null
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      const f = line.slice(4).replace(/^b\//, '')
      file = isDoc(f) ? f : null
      if (file && !targets.has(file)) targets.set(file, new Set())
      continue
    }
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/)
    if (hunk && file) {
      const start = Number(hunk[1])
      const count = hunk[2] === undefined ? 1 : Number(hunk[2])
      for (let i = 0; i < count; i++) targets.get(file).add(start + i)
    }
  }
  for (const [f, lines] of targets) if (lines.size === 0) targets.delete(f)
}

if (targets.size === 0) {
  console.log('Casing check: no changed .mdx lines to check.')
  process.exit(0)
}

const problems = []
const wanted = (file, line) => {
  const lines = targets.get(file)
  return lines === null || lines.has(line)
}

// 1. Vale with the Checkly style only.
const valeConfig = path.join(root, '.github/vale/checkly.ini')
let valeOut = '{}'
try {
  valeOut = execFileSync('vale', [`--config=${valeConfig}`, '--output=JSON', '--no-exit', ...targets.keys()], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
} catch (err) {
  console.error('Casing check: could not run Vale. Install it (https://vale.sh/docs/install) and try again.')
  console.error(err.message)
  process.exit(2)
}
// Lines Vale must not judge: frontmatter and fenced code (Vale misses fences
// nested in JSX components). Spans inside **bold** UI labels, quotes or inline
// code keep the app's or the code's own casing.
const skipLines = new Map()
for (const file of targets.keys()) {
  const set = new Set()
  let fence = false
  let fm = false
  readFileSync(file, 'utf8').split('\n').forEach((raw, idx) => {
    const n = idx + 1
    if (idx === 0 && raw.trim() === '---') { fm = true; set.add(n); return }
    if (fm) { set.add(n); if (raw.trim() === '---') fm = false; return }
    if (/^\s*(```|~~~)/.test(raw)) { fence = !fence; set.add(n); return }
    if (fence) set.add(n)
  })
  skipLines.set(file, set)
}
const insideMarkup = (text, start, end) => {
  for (const re of [/\*\*[^*]+\*\*/g, /`[^`]+`/g, /"[^"]*"/g, /“[^”]*”/g]) {
    for (const m of text.matchAll(re)) if (m.index <= start && m.index + m[0].length >= end) return true
  }
  return false
}
const fileLines = new Map([...targets.keys()].map((f) => [f, readFileSync(f, 'utf8').split('\n')]))
for (const [valeFile, alerts] of Object.entries(JSON.parse(valeOut || '{}'))) {
  const file = norm(valeFile)
  if (!targets.has(file)) continue
  for (const a of alerts) {
    if (!wanted(file, a.Line) || skipLines.get(file).has(a.Line)) continue
    const text = fileLines.get(file)[a.Line - 1] || ''
    if (insideMarkup(text, a.Span[0] - 1, a.Span[1])) continue
    problems.push({ file, line: a.Line, rule: a.Check, message: a.Message })
  }
}

// 2. Sentence case for headings and titles.
const nouns = readFileSync('styles/Checkly/proper-nouns.txt', 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .sort((a, b) => b.length - a.length)
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const nounRe = nouns.length ? new RegExp(`(?<![\\w-])(?:${nouns.map(escape).join('|')})(?![\\w-])`, 'g') : null

function titleCaseWords(text) {
  let t = text
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links: keep the text
    .replace(/[*_]{1,3}/g, '') // emphasis
    .replace(/<[^>]+>/g, ' ') // inline tags
    .replace(/\{[^}]*\}/g, ' ') // expressions
    .replace(/"[^"]*"|“[^”]*”|'[^']*'(?!\w)/g, ' ') // quoted UI labels and error messages
  if (nounRe) t = t.replace(nounRe, ' ')
  const bad = []
  // Split into clauses: the first word after a colon, a sentence end or a
  // numbering like "Step 2:" may be capitalized.
  for (const clause of t.split(/[:.!?]\s+|\s[–—|-]\s/)) {
    const words = clause.trim().split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w))
    words.forEach((w, i) => {
      if (i === 0) return
      const word = w.replace(/^[("'“‘]+|[)"'”’,;!?.]+$/g, '')
      // Plain capitalized words only: acronyms (RCA), mixed case (gRPC,
      // OpenTelemetry) and words with digits are fine.
      if (/^[A-Z][a-z]+(?:['’]s)?$/.test(word)) bad.push(word)
    })
  }
  return bad
}

for (const file of targets.keys()) {
  const lines = readFileSync(file, 'utf8').split('\n')
  let inFence = false
  let inFrontmatter = false
  lines.forEach((raw, idx) => {
    const n = idx + 1
    if (idx === 0 && raw.trim() === '---') return void (inFrontmatter = true)
    if (inFrontmatter) {
      if (raw.trim() === '---') return void (inFrontmatter = false)
      const fm = raw.match(/^(title|sidebarTitle):\s*(['"]?)(.*)\2\s*$/)
      if (fm && wanted(file, n)) {
        const bad = titleCaseWords(fm[3])
        if (bad.length) problems.push({ file, line: n, rule: 'Checkly.SentenceCase', message: `Use sentence case for ${fm[1]} '${fm[3]}' (${bad.join(', ')}). If it's a name, add it to styles/Checkly/proper-nouns.txt.` })
      }
      return
    }
    if (/^\s*(```|~~~)/.test(raw)) return void (inFence = !inFence)
    if (inFence || !wanted(file, n)) return
    const heading = raw.match(/^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/)
    if (heading) {
      const bad = titleCaseWords(heading[1])
      if (bad.length) problems.push({ file, line: n, rule: 'Checkly.SentenceCase', message: `Use sentence case for the heading '${heading[1]}' (${bad.join(', ')}). If it's a name, add it to styles/Checkly/proper-nouns.txt.` })
    }
    for (const m of raw.matchAll(/<(Card|Step|Tab|Accordion|Expandable|Update)\b[^>]*\btitle="([^"]+)"/g)) {
      const bad = titleCaseWords(m[2])
      if (bad.length) problems.push({ file, line: n, rule: 'Checkly.SentenceCase', message: `Use sentence case for the ${m[1]} title '${m[2]}' (${bad.join(', ')}). If it's a name, add it to styles/Checkly/proper-nouns.txt.` })
    }
  })
}

problems.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
for (const p of problems) {
  if (process.env.GITHUB_ACTIONS) console.log(`::error file=${p.file},line=${p.line},title=${p.rule}::${p.message}`)
  console.log(`${p.file}:${p.line}  ${p.rule}  ${p.message}`)
}
const checked = [...targets.values()].reduce((n, s) => n + (s === null ? 0 : s.size), 0)
console.log(
  problems.length
    ? `\nCasing check: ${problems.length} problem(s). The rules are in AGENTS.md under "Casing and terminology".`
    : `Casing check: OK (${targets.size} file(s)${all ? '' : `, ${checked} changed line(s)`}).`,
)
process.exit(problems.length ? 1 : 0)
