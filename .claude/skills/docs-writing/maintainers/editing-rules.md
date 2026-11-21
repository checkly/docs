
# Docs editing

The maintainers of this repo are the gate on agent output. Most of their recent commits are corrections to agent-written PRs, and the corrections are consistent: they cut what was invented or over-explained, they fix what does not run, and they close the cross-file loose ends the agent left open. Your job is to arrive at their version on the first pass.

## The five habits

1. **Trace every claim.** A sentence that states behavior, a default, a limit, a flag, a field label, or a status must have a source you actually looked at: the CLI types (`node_modules/checkly`), the OpenAPI spec (`api-reference/openapi.json` or `https://api.checklyhq.com/openapi.json`), the product UI, a passing check run, or the previous docs site (`../docs.checklyhq.com`). If you cannot point at the source, cut the claim or ask. "Plausible" is the failure mode: reviewers have deleted whole pages of agent prose that read well and described features that do not exist.
2. **Cut before you add.** The default edit is smaller than you think. Remove filler, scaffolding, and internal mechanics before writing anything new. Hard facts in tables stay; nuanced essays about edge cases (especially of deprecated constructs) go. When in doubt, the one-line user-facing rule beats the accurate paragraph.
3. **Keep siblings parallel.** If you add a note, default, column, or caveat to one command, construct, or section, find its siblings and apply the same change (`checkly test` and `checkly trigger`; `env add` and `env update`; every alert-channel construct page; every analytics endpoint title). Inconsistency between neighbors is the most common review comment.
4. **One source of truth per fact.** A default value lives in its reference table (usually a `constructs/` page) and other pages link to it with an anchor (`/constructs/project#param-cli`). Content repeated across three or more pages becomes a snippet in `snippets/`.
5. **Close the loop in the same change.** A page move without a redirect, a new page missing from `docs.json`, a deleted snippet still imported somewhere: each of these is a defect, not a follow-up.

## Workflow

### 1. Scope

- Read the task and the current page from `origin/main`, not a stale working tree.
- Write down the smallest change that solves it. Do not reformat, reorder imports, or retitle anything outside that scope. Unrelated whitespace or formatting churn is reverted in review.
- Search for the same topic elsewhere (`git grep -n "<term>" -- '*.mdx'`) before adding content. Duplication needs a reason.

### 2. Establish the source of truth

| Claim type | Where to verify |
|---|---|
| Construct props, types, defaults | Type definitions of the latest `checkly` release (`npm run check:snippets` installs it under `.github/snippet-typecheck/node_modules/checkly`), or the `checkly-cli` repo source |
| CLI flags, defaults, output | `npx checkly <cmd> --help` and a real run |
| API endpoints, methods, fields | OpenAPI spec. If an endpoint is not in the spec, it does not get a page |
| UI labels and navigation | The live app. Labels must match exactly, including after redesigns |
| Runtime / version tables | Previous docs and the runtime spec, line by line |
| Behavior of a check | Deploy or `npx checkly test --record` and look at the result |

If a fact cannot be verified with the tools you have, leave it out and flag it in the PR description. Never leave `TODO` or `VERIFY` comments in MDX.

### 3. Edit

Apply the rules below. Make one concern per commit.

### 4. Sweep

Before you stop, run the sweep for your change type (see "Cross-file obligations") and grep for every old term, path, or label you replaced.

### 5. Verify

Run, from the repo root:

```bash Terminal
npm run check:snippets                      # MDX code blocks typecheck against latest checkly
npm run check:links                         # broken internal links
python3 .github/scripts/check_frontmatter.py
node .github/scripts/check-redirect-destinations.mjs
npm run generate-sitemap && git diff --stat sitemap.xml
npx mint dev                                # open each touched page; check rendering, anchors, highlights
```

For any code sample that is meant to run (API check scripts, Playwright tests, construct files), run it. The bar is "runs as written": live endpoints, correct API version, required headers and fields, under the runtime limit.

### 6. Self-review

Go through [self-review.md](self-review.md) against your diff. Then reread the diff once as the reviewer: for each added sentence, ask "what is my source for this?" and "would the page be worse without it?"

## Writing rules

### Voice

- Second person, short declarative sentences. Drop "we" and personal framing where the sentence works without it ("Set to `1` for check runs", not "We set this to `1`").
- No hedges on hard facts. Write "(max `5000`)", not "(max 5000 by default)", unless the value really is configurable.
- No marketing or self-praise: "seamlessly", "robust", "thoroughly validated", "helps maintain the integrity and reliability".
- Explain *why* only where it changes what the reader does, for example in troubleshooting ("hard bounces trigger suppression").
- No em dashes or parentheticals in new prose.
- Do not invent categories with adjectives. "critical checks", "draft pull request", "Degraded agent status" all implied product behavior that does not exist.

### Delete on sight (agent filler)

- `**Use cases:**`, `**Usage:**`, `**Examples:**`, "Key Benefits", "Best Practices", "Common Issues" sections of generic bullets.
- "This command will:" lists that restate the command.
- `<Steps>` that only restate the UI.
- Scenario tabs ("Development Team / Ops Team / Multi-Team").
- A Tabs table or Accordion that repeats the `<ResponseField>`s or main text next to it.
- Sections that already exist in the sidebar ("See also" lists of sibling pages).
- Internal implementation detail users cannot act on (private repo references, feature-flag names, line numbers, file counts).
- Brittle counts that go stale ("132 stub files", "94 unique API paths").

### Terminology

Use the forms that dominate on `main`:

| Use | Not |
|---|---|
| Browser check, API check, Multistep check | browser check (when naming the Checkly type), MultiStep check |
| Playwright Check Suite | Playwright check suite |
| Heartbeat monitor; URL, TCP, DNS, ICMP monitors | heartbeat check. Monitors are the simple uptime types; do not call API checks or Playwright tests "monitors" |
| `CheckGroupV2` with `alertEscalationPolicy` | `CheckGroup` (deprecated; one-line deprecation notice only) |
| availability | "uptime" or "success rate" when naming a metric |
| AI Error Analysis | other capitalizations |
| Microsoft Teams | MS Teams |
| Owner, Admin (roles) | owner, admin |
| `eu-central-1` (default location) | `eu-west-1` |
| status page, private location | Status Page, Private Location (unless the in-product label differs; match the UI when quoting it) |

Capitalize Browser, Heartbeat, etc. when you mean the Checkly check type rather than the generic concept. One term per concept across the frontmatter, body, cards, and any embedded files.

### UI references

- UI elements in **bold**, not 'quotes' and not `code`: **Account settings**, **Generate token**.
- Navigation formula: "Open **Account settings** from the left sidebar, then select **X**", plus a deep link (`https://app.checklyhq.com/settings/user/api-keys`) where one exists.
- Field labels exactly as they appear in the live UI.

### Components

- Fewer components is better. `<Tabs>` or `<AccordionGroup>` wrapping prose becomes headings. Tabs holding only code becomes `<CodeGroup>`. Cards only for navigation on overview pages.
- Accordion only for a genuinely optional path ("Alternative process: manual setup", a real troubleshooting Q&A). Do not wrap prerequisites in one by default.
- Callouts: `<Warning>` for destructive or permanent actions and deprecations, `<Note>` for plan availability and caveats, `<Info>` for limits, `<Tip>` for cross-links. Short callouts are one line. No legacy `<Callout type="…">`, no `>` blockquotes.
- Images: `<Frame><img src alt /></Frame>`. Alt text is a full sentence describing the UI state shown. No PII in screenshots: no real emails, user names, or other customers' resources.
- YouTube: `<YoutubeEmbed id title />` with the real video title, never a raw `<iframe>`.
- No `url()` in `style.css` and no `.js` files under content directories (Mintlify injects them into every page).

### Code samples

- Every block has a language tag. Title is the filename when the reader creates that file (` ```ts api-health.check.ts `), `Terminal` for shell, and the runtime name for multi-language `<CodeGroup>`s.
- Shortened snippets use `/* More options... */`, never `...` or `// ...`, and must still parse. Add the trailing comma before it.
- Complete snippets import everything they use. Abbreviated `defineConfig` examples still include `projectName` and `logicalId`.
- After changing lines, move every `highlight={}` range so it still points at what the prose describes.
- Single quotes in JS/TS. Match the quote and semicolon style of the other blocks on the page.
- Remove props that are irrelevant to the point of the example.
- Use env-var placeholders (`{{API_KEY}}`, `$CHECKLY_API_KEY`) instead of fake IDs or secrets that look real (`abc123-def456`). Use the documented ID format (`pl_....`).
- Examples hit live targets: `https://danube-web.shop`, `httpbin.org`, or the Checkly API. If a target is dead, replace it.
- Playwright: valid locators only (`getByLabel(/email/i)`, not invented options), no `await` on a locator, use `@playwright/test` `test()`.
- Prose must match code. If the code sets `sendDegraded: true`, the sentence says "fails or degrades".
- Show commands rather than describe flags: a commented bash block beats a paragraph about `--target` values.
- Version-specific snippets that cannot match the latest CLI get `{/* typecheck-skip */}` and a reason in the commit body. Fragments get `{/* typecheck-wrap: <Construct> */}`.

### Links

- Relative paths for internal links. Link the specific target (the endpoint page, the `#param-…` anchor, the app deep link), not an overview.
- No old-site paths (`/docs/…`, `/cicd/…`, `/cli/constructs-reference/…`), no underscore slugs, no anchors you have not seen render.
- Support is always `[support@checklyhq.com](mailto:support@checklyhq.com)`, not an in-app link that requires login.
- Community and external links say where they go ("Join the Checkly Slack community").
- After moving content, fix every "above" and "below" reference.

### Titles and headings

- Frontmatter on every page: `title`, `sidebarTitle`, `description`; new pages also get `canonical` with a trailing slash.
- `sidebarTitle` does not repeat the parent group ("Email", not "Email Alert Channel").
- New headings are sentence case. Do not retitle existing headings or titles as a side effect; case standardization is an open decision and drive-by changes create noisy PRs.
- No "Step N:" in headings. Name sections for what the reader does.
- API reference titles follow the CRUD verb pattern consistently across the section: "List all …", "Retrieve a …", "Create a …", "Update a …", "Delete a …". The `openapi:` method must match the verb.

### Page templates

- **Construct pages** (alert channels and similar): `<Tip>` linking the general concept docs; a one-line third-person description ("Sends alert notifications as HTTP requests to any URL."); `<CodeGroup>` with "Basic Example" and "Advanced Example"; one `<ResponseField>` per property with a minimal highlighted snippet; shared option snippets; a `<Note>` on `fromId()` where relevant.
- **Troubleshooting entries** from recurring support questions: short, explain the cause, end with the support mailto.
- **Guides**: follow `.claude/skills/guide-authoring/SKILL.md`.

## Cross-file obligations

| You did this | You must also |
|---|---|
| Added a page | Add it to `docs.json` nav in the same commit; add the overview `<Card>` if the section has one (card text mirrors the page `description`); regenerate `sitemap.xml` |
| Deleted a page | Remove it from `docs.json`; add a redirect in `docs.json` `redirects`; `git grep` inbound links and `<Card href>`s and fix them; regenerate sitemap |
| Moved or renamed a page | Redirect old → new; fix inbound links; update `docs.json`; regenerate sitemap. Redirects for the public site may also need the marketing site repo; say so in the PR |
| Renamed a file, even a one-word slug fix | Redirect the old slug. This is the step most often missed, including on the author's own renames |
| Deleted a nav group's last page | Remove the empty group, and search `docs.json` for every copy of it; groups appear in more than one place |
| Left one page in a group | Flatten it to a plain page entry |
| Touched nav labels | Group names are Title Case, no trailing whitespace; overview pages go first in their group |
| Found a page that is not in the nav | Either add it to the nav or delete it as an unlisted duplicate. Check nav membership before deciding whether a delete needs a redirect: only published URLs need one |
| Inlined or removed a snippet usage | Remove the `import` line; delete the snippet file if nothing else imports it |
| Changed a construct prop, default, or limit | Update the constructs reference table, the matching UI/config page, and any CLI page that mentions it, in one PR |
| Changed a UI label or navigation path | `git grep` the old label across all `.mdx` and update every occurrence |
| Added an API endpoint page | Confirm it exists in the OpenAPI spec; place it in the right nav group, next to its siblings, V2 endpoints above V1 |
| Changed a table | Keep rows in their existing order (often alphabetical) and cell formatting consistent with sibling cells |
| Changed a value repeated on another page | Reconcile both, or replace one with a link to the other |

## Commits and PRs

- Conventional Commits: `docs:`, `docs(cli):`, `docs(api):`, `docs(guides):`, `chore:` for sitemap, `ci:` for workflows. Subject states the outcome ("…so it typechecks").
- One concern per commit. Sitemap regeneration can be its own `chore:` commit.
- Body explains why when it is not obvious, and states what was checked ("No page, config, or workflow references these files").
- Ticket reference in the subject when there is one: `(DOC-107)`.
- PR description lists every claim you could not verify, and anything that needs a change in another repo.

## Reviewing someone else's docs PR

The same checks apply, plus the reviewer stance seen in this repo:

- Use GitHub ```` ```suggestion ```` blocks for concrete wording or formatting fixes, so the author can commit them directly.
- Separate nits ("feel free to fix or move forward") from blockers. Block on: inaccurate claims, code that does not run, missing redirects, broken links, PII in screenshots, guidance that steers readers toward a worse practice.
- Question claims in the reader's terms: "Does this hold? An agent with the CLI can do that too." "How would I set a header on the connection?"
- Ask for completeness against the source: compare an env-var list against the infra PR, an endpoint list against the spec, a construct page against the CLI types.
- Ask for consistency with existing patterns ("On the construct pages we use a `required` column. Should we replicate it here?").
- Ask that a guide and the construct reference it relies on change in the same PR, so they never disagree.
- Frontload what readers come for (the URL, the command) instead of burying it in a section.
- Push back on recommendations that bypass the intended workflow (for example skipping tests with `process.env.CHECKLY` instead of selecting them with projects or tags).

## Go further than the blueprint

The maintainers' history also shows what slips through. Check these explicitly, because the humans often do not:

- Typos and doubled words ("the the", "recieving", "your remove"). Run a spell pass on every touched paragraph.
- Anchors with curly quotes or that no longer exist.
- Fixes applied to one line while the same mistake survives a few lines down (code comments, a second table row).
- The same value stated differently on two pages (`{{$RANDOM_NUMBER}}` range, default locations).
- Content restored verbatim from old docs that carries stale versions, unused or wrong imports, or legacy Hugo syntax.
- Whole-page deletions on provenance alone: before deleting "unverified" content, check whether individual claims are true and documented elsewhere, and keep or move what is correct.
- Brevity edits that drop a nuance the reader needs (a time window, a limit). Cut words, not facts.
