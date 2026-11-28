---
name: docs-review
description: Review a docs change in this repo for accuracy, scope, structure and style before it is merged. Use when asked to review a docs branch, diff or pull request, or when the docs-writing workflow reaches its review step. Produces a verdict with blocking and non-blocking findings, each tied to a file and line. Does not edit files.
metadata:
  author: checkly docs
---

# Docs review

You review; you do not fix. Report findings precisely enough that the writer can act without
asking. Read the writer's `brief.md` and `facts.md` in `.docs-work/<slug>/` if they exist.

## How to get the change

- A branch: `git diff origin/main...HEAD -- '*.mdx' docs.json snippets/`
- A pull request: `gh pr diff <number> -R checkly/docs`
- Read every changed page in full, not only the diff: a correct line on a page that now
  contradicts itself is still a defect.

## Checks, in order

### 1. Accuracy (blocking)

For every sentence that states product behavior, a name, a default, a limit, a version, a flag or
a UI label:

- Find its row in `facts.md`. No row, or a source that is memory, an old docs page or a PR
  description: blocking.
- Spot-check at least three claims yourself against the source the row names, and every claim
  about numbers, defaults, plans and versions. Run CLI commands with `--help` or against a test
  account where you can.
- Samples: the writer must have run them. Look for captured output in `.docs-work/<slug>/` and
  check the shown output matches it.
- Any `[UNVERIFIED]` marker left in a page: blocking.

### 2. Scope and place (blocking)

- The page has one type from `.claude/skills/docs-writing/page-types.md` and fits it.
- No duplicate: search for another page that already covers the same task
  (`grep -ril "<term>" --include='*.mdx' .`). Two pages explaining the same setting is blocking.
- New page: in `docs.json` in a sensible Tab and Group. Moved or renamed page: redirect added and
  inbound links repointed.
- Nothing internal or unreleased (see "Public repository" in the style file).

### 3. Cold read (blocking when it fails)

Read the page as the reader in the brief, starting from where they would arrive. Can they finish
the job with this page and the pages it links, without guessing a value or a click? List the
first place where they would get stuck.

### 4. Maintainer rules and style

Go through `.claude/skills/docs-writing/maintainers/self-review.md` item by item, with the rules in
`maintainers/editing-rules.md` and the conventions and archetypes in `maintainers/repo-knowledge.md`.
These are the corrections the maintainers make most often. Blocking: an invented feature or
category, a claim that contradicts the OpenAPI spec or `main`, code that does not run, a missing
redirect or nav entry, a broken link or anchor, PII in a screenshot, a sibling page left saying
the old thing. Everything else is non-blocking, with the rewritten text.

Then check `.claude/skills/docs-writing/style.md` and `AGENTS.md`: casing, UI labels in bold, code
format, code fence languages, alt text, link text, filler and hype words, length. Report each
style point once with all its lines, not once per line. Do not report known debt on lines the
change did not touch (`repo-knowledge.md` lists it).

### 5. Checks

Run `.claude/scripts/check-docs.sh`. Any failure is blocking.

## Verdict

```text
Verdict: PASS | CHANGES NEEDED

Blocking
1. <file>:<line> <what is wrong>. Evidence: <source or command output>. Fix: <what to change>.

Non-blocking
1. <file>:<line> <finding>. Fix: <suggestion>.

Checked claims: <n of m claims traced, which ones you reproduced yourself>
Cold read: <where the reader gets stuck, or "completes">
```

PASS means no blocking findings. Say what your review did not cover, for example screenshots you
could not compare or a sample you could not run.
