---
name: docs-writing
description: Write a new docs page or change an existing one in this Mintlify repo, outside the Guides tab. Use for any task that adds or edits .mdx pages under detect/, communicate/, resolve/, platform/, integrations/, admin/, ai/, cli/, constructs/ or concepts/, documents a new feature or release, or changes docs.json navigation. Covers the page type, finding the page that already covers the topic, collecting proven facts, drafting from example pages, and the checks and review before a pull request.
metadata:
  author: checkly docs
---

# Docs writing

A docs page answers one reader's question with facts that are true for the released product. Most
mistakes in these docs were invented features, wrong flags and samples that never ran. This
workflow exists to stop those, so every step leaves evidence a reviewer can check.

Guides (`guides/`, `samples/guides/`) follow the `guide-authoring` skill instead. Use this skill's
fact and review steps for them too.

## Workflow

Copy this checklist into your notes and tick it off. Keep working files in `.docs-work/<slug>/`
(gitignored).

```text
- [ ] 1. Brief written: .docs-work/<slug>/brief.md
- [ ] 2. Page type and place chosen; existing pages searched
- [ ] 3. Facts collected with sources: .docs-work/<slug>/facts.md
- [ ] 4. Draft written from example pages of the same type
- [ ] 5. Every command and sample run; real output captured
- [ ] 6. .claude/scripts/check-docs.sh passes
- [ ] 7. docs-reviewer pass; blocking findings fixed
- [ ] 8. PR opened with the template and the proof
```

### 1. Brief

Write five lines to `brief.md`: who reads the page, the job they want done, what changed in the
product (with a link to the release, PR or changelog), what is out of scope, and who owns the
product decisions. If you cannot fill a line, ask before writing anything.

### 2. Page type and place

- Pick the type from [page-types.md](page-types.md). One page has one type. A setup task inside a
  concept page goes on its own page and gets linked.
- Do not hand-write generated content: `api-reference/` comes from the OpenAPI spec
  (`update-api-spec.sh`), and runtime pages from `update-runtime-spec.yml`. Fix the source instead,
  or ask.
- Search before you create: `grep -ril "<term>" --include='*.mdx' .` and the titles in `docs.json`.
  Prefer extending the page that already covers the topic. Do not create a page for one setting.
- A new page needs a `docs.json` entry in the right Tab and Group. A moved or renamed page needs a
  `redirects` entry in `docs.json` and every inbound link repointed in the same commit.

### 3. Facts

Every statement about the product needs a source. Delegate the research to the `docs-researcher`
agent with the brief, or follow its rules yourself. `facts.md` is a table:

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | `--force` skips the confirmation | `checkly-cli@v10.2.0 src/commands/deploy.ts:88` | released |

- Sources, best first: running the released product and recording the output; the source code at a
  released tag or deployed commit; the UI label text in the web app source; release notes. Memory,
  old docs pages and PR descriptions are leads, not sources.
- Status is `released`, `behind a flag` or `unreleased`. Document only `released`. Ask about the rest.
- A claim you cannot prove stays out of the page. If it must be there while you ask, mark it
  `[UNVERIFIED]` in the draft; `check-docs.sh` fails until it is gone.

### 4. Draft

- Read two example pages of the same type from [page-types.md](page-types.md) before writing.
- Follow [maintainers/editing-rules.md](maintainers/editing-rules.md): the corrections the docs
  maintainers make to agent-written PRs again and again (filler to delete, terminology, components,
  code samples, cross-file obligations). Then [style.md](style.md) for what it adds.
- Before you state a default or a limit, look it up in
  [maintainers/repo-knowledge.md](maintainers/repo-knowledge.md): it lists facts the docs already
  contradict, conventions per directory and page archetypes. Its
  [facts.json](maintainers/facts.json) is a snapshot of construct defaults; `main` wins.
- Every sentence about the product traces back to a row in `facts.md`.
- Use the exact UI labels, in bold, as the web app shows them. Use the exact construct, property,
  flag and environment variable names, in code format.
- Write only what the reader needs to finish the job. Cut history, marketing and repetition of
  other pages; link to them instead.

### 5. Prove

- Run every command and code sample you show, against the released version it targets. Paste the
  real output into ` ```text Terminal ` fences; shorten it with `...`, never edit it.
- Checkly CLI snippets are typechecked by `npm run check:snippets` (markers in `AGENTS.md`). That
  proves the types, not the behavior: run them too.
- Samples in other languages (SDK setup, Terraform, curl): build them in
  `.docs-work/<slug>/samples/` and run them against a real Checkly account. Record which version
  of each package you used in `facts.md`.
- Screenshots come from a real account in the light theme, with no account names, emails or other
  customers' data. Embed them in `<Frame>` with alt text that describes the state shown.

### 6. Checks

Run `.claude/scripts/check-docs.sh` from the repo root. It runs the CI checks on the whole site
and the line checks on the `.mdx` files you changed, and fails on any `[UNVERIFIED]` marker. A
hook already runs the line checks after every edit; fix what it reports instead of working around
it.

Then go through [maintainers/self-review.md](maintainers/self-review.md) against your diff, item
by item. The reviewer checks the same list, so anything you skip comes back as a finding.

### 7. Review

Hand the diff, `brief.md` and `facts.md` to the `docs-reviewer` agent. It cannot edit files, so its
verdict is independent. Fix every blocking finding, rerun the checks, and ask for a new review
until it passes. Do not argue a finding away without new evidence.

### 8. Pull request

- Branch `docs/<slug>`, conventional commit messages (`docs: ...`), one topic per PR.
- Fill in `.github/pull_request_template.md`. Under "Notes for the Reviewer" say what you proved
  and how, in two or three lines.
- This repository is public. The page, the commits and the PR text must not name customers,
  internal hosts, internal tickets, unreleased features, or text copied from private repositories.
  Product facts from private code are fine once the feature is released; describe behavior, do
  not quote internal code.

## Rules

- When rules disagree: `AGENTS.md` first, then a decision the product owner recorded in
  `brief.md`, then `maintainers/`, then `style.md`.
- Ask rather than guess (`AGENTS.md`). Product names, page placement for a new product area, and
  plan availability are decisions for the product owner: list them as questions, do not decide by
  editing.
- Stay on the topic you were given. Report mistakes you notice on other pages; fix them in a
  separate PR only when asked.
