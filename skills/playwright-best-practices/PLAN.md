# Plan: `playwright-best-practices` skill

> Working/planning doc. **Not** part of the distributed skill — packaging (plugin manifest / ignore rules) must exclude `PLAN.md`.

## Goal

A condensed, token-efficient, well-structured Playwright best-practices skill for AI-agent consumption. Lives at `skills/playwright-best-practices/`. A `checkly-plugin` pulls it in.

## Constraints (from Stefan)

- **Location:** `skills/playwright-best-practices/SKILL.md` + reference files.
- **Content model:** Hybrid. Skill holds *condensed, original* best-practice rules and **links out** to `/learn/playwright/...` for depth.
- **Do NOT** mirror the `/learn` structure 1:1. **Do NOT** copy any third-party reference skill. Base content on *our* `/learn` material, but reorganize by agent activity.
- **Scope:** Playwright best practices, framework-agnostic. *Light* Checkly mentions sprinkled in (not a sales pitch).
- **Coverage:** as broad as reasonable.
- **Token efficiency:** progressive disclosure — lean always-loaded `SKILL.md`, granular reference files loaded on demand.
- Where `/learn` has holes, the skill still writes correct original guidance (so it isn't gap-for-gap with the docs).

## Conventions (established during review)

Cross-cutting rules from Stefan's feedback — apply to every reference file:

- **Scope is declared once, centrally.** `SKILL.md` states the skill assumes `@playwright/test` + TypeScript. Reference files do **not** repeat "only works with the test runner" hedges.
- **Cross-check before review.** Ground each reference against the **official Playwright docs** (and our `/learn`) before handing it over — don't ship paraphrase-from-memory.
- **Curated, not exhaustive.** Keep "reach for these" lists short, then add an explicit pointer to the full upstream reference (e.g. the assertions matcher list links to playwright.dev). Agents can go deeper if they want.
- **Checkly mentions must be genuinely in context.** No bolted-on product asides (the `markCheckAsDegraded` note was cut from `assertions.md` for this reason). When in doubt, leave it out.
- **No competitor/third-party links.** Don't cite or link external reference skills; use them only as private inspiration. (External *enrichment* sources used for content but **not** linked: a public Playwright workshop site — do not add as a reference.)
- **Links:** relative for cross-file refs — `[x.md](./x.md)` between references, `[references/x.md](references/x.md)` from `SKILL.md`. "Deeper in the docs" = **one link per line**, no `·` dot-joined lists.
- **Be deliberate about timeout knobs** — per-assertion vs project-wide vs test timeout each have a right moment; don't imply one is always correct.
- **Split for tokens.** When a file grows to cover multiple distinct concerns, split it so agents load only what they need (e.g. `config.md` peeled out of `test-structure.md`).

## Progress

- [x] Phase 1 — `SKILL.md` scaffold (reviewed; verify loop reworked to be agent-friendly/no-GUI; version-check + scope notes added).
- [x] Phase 2 — core references: `locators.md` ✓, `assertions.md` ✓, `waiting.md` ✓, `test-structure.md` ✓, `config.md` ✓ (split out), `auth.md` ✓.
- [x] Phase 3 — gap-fill references: `network.md` ✓, `debugging.md` ✓ (centered on `playwright-cli`: failure primitives, agent-CLI discovery, `--debug=cli` live stepping; corrected the bogus trace-CLI), `flakiness.md` ✓ (root-cause table, retries-as-safety-net, isolation + `fullyParallel`/within-file parallelism, detecting via `--repeat-each`), `ci.md` ✓ (GitHub Actions workflow, reporters, sharding + blob/merge-reports, artifact capture, tests-as-monitors). `performance.md` **dropped (Stefan — not needed).**
- [~] Phase 4 — `scenarios.md` **dropped (Stefan — not needed; refs removed from SKILL.md + assertions.md).** Final pass: links all resolve (no dangling/scenarios/performance refs), Checkly "monitors" close thinned (dropped the bolted-on one in `network.md`; kept auth/flakiness/ci + SKILL byline). **Stefan review pending.** Packaging must still exclude `PLAN.md`.

## Design

### Progressive disclosure (3 tiers)

1. **Frontmatter** (~80 tokens) — name + description for triggering.
2. **`SKILL.md` body** (~800–1200 tokens) — the non-negotiable core rules + an activity→reference routing table + a short test/verify loop.
3. **Reference files** (loaded on demand) — one condensed file per activity cluster. Each ends with a "Deeper in the docs" link section pointing to `/learn/playwright/...`.

### `SKILL.md` shape

- **Frontmatter:** `name`, `description` (activity-rich for triggering), `metadata.author: checkly`.
- **Core rules** (always in context): locator-priority ladder, web-first auto-retrying assertions, no hard waits / trust auto-waiting, test isolation + independence, API for setup/teardown. ~8–10 imperative lines.
- **Routing table:** Activity → reference file(s). The agent reads only what the task needs.
- **Verify loop:** how to run tests, read failures, use trace, iterate.

### Reference files (activity-based, NOT a `/learn` mirror)

Proposed set (~11 files). Each is condensed rules-as-data + links out.

| File | Covers | `/learn` base | Original (gap-fill) |
|------|--------|---------------|---------------------|
| `references/locators.md` | priority ladder, strict mode, filtering, when `data-testid` | selectors, clicking-typing-hovering | priority ladder spelled out |
| `references/assertions.md` | web-first vs non-retrying, soft, `expect.poll`/`toPass` | assertions | poll/toPass |
| `references/waiting.md` | auto-waiting, actionability, explicit waits, anti hard-wait | waits-and-timeouts, navigation | — |
| `references/test-structure.md` | test design, fixtures (+scope), POM, steps/decorators | test-fixtures, steps-decorators, writing-tests | **POM** |
| `references/config.md` | `playwright.config.ts`, projects, baseURL, devices, setup dependencies, parameterization | parameterize | **config & projects guide** (split out of test-structure for token savings) |
| `references/auth.md` | storageState + setup project, env creds, TOTP, SSO, API login, multiple roles; agent bootstrap via `playwright-cli` (not codegen GUI) | authentication, bypass-totp, login-*, signup | API login as setup, `playwright-cli` discovery |
| `references/network.md` | route mocking (partial/full), interception, **HAR**, request context, API testing | mock-api, intercept-requests, testing-apis | **HAR record/replay** |
| `references/debugging.md` | **agent-friendly debugging (no GUI)**, codegen, modernized error catalog | debugging, debugging-errors, error-*, codegen | **agentic primitives below**; fix outdated `waitForSelector` advice |

### Agentic debugging — verified primitives (for `references/debugging.md` + SKILL verify loop)

Researched against Playwright release notes/docs (the `/learn` debugging pages predate all of this — flag for docs gap):

- **stdout reporter + call log** — the failing assertion and what Playwright saw print to stdout. Primary signal. (always available)
- **`error-context.md`** *(≥ 1.60)* — on an `expect` failure Playwright writes an aria-snapshot of the page at failure time to `test-results/.../error-context.md`. Machine-readable page state, no GUI. `testInfo.errorContext`. Highest-value agent primitive.
- **❌ CORRECTED — there is no `npx playwright trace open/actions/snapshot/close` CLI.** Earlier research wrongly listed a no-GUI trace-reader subcommand. **Verified false** against the official CLI reference *and* by running `npx playwright` on the local install (1.54.2): the only trace command is `show-trace`, which is a **GUI**. This bogus flow had shipped in the SKILL verify loop (step 4) and is now replaced by the `--debug=cli` + `playwright-cli` live flow below.
- **The agent CLI: `playwright-cli`** (package `@playwright/cli`) — a **separate tool** from `npx playwright`, daemon-backed, ref-based (snapshots return element refs like `e15`), token-efficient (doesn't dump the DOM into context). Install local (`npm install -D @playwright/cli`) or run via `npx playwright-cli` — **do not advise global `-g`** (Stefan). This is the centerpiece of the skill's agentic value. Discovery flow: `open` → `snapshot` → act on refs → `generate-locator <ref>`. Ships its own skill via `playwright-cli install --skills`. Docs: playwright.dev/agent-cli/introduction.
- **`npx playwright test --debug=cli`** *(≥ 1.59)* — non-interactive stepping. Prints a session name → `playwright-cli attach <session-name>` → `snapshot` / `step-over` / `console error` / `network` / `eval` / `pause-at <file>:<line>` / `resume`. **Now in the SKILL verify loop** (step 4).
- **artifacts not GUIs** — `--trace on --screenshot only-on-failure` produce `trace.zip` + screenshots in `test-results/`. The Trace Viewer (`show-trace`, trace.playwright.dev) is a GUI — capture for a human, but as an agent prefer `error-context.md` + the live `--debug=cli` session.
- **Version check** — agent runs `npx playwright --version` and `playwright-cli --version`; if outdated, tell the user to update `@playwright/test` and `@playwright/cli`. Version-gated; tooling moves fast. **In SKILL verify loop.**
- **`npx playwright init-agents`** *(≥ 1.56)* — **DEFERRED from the skill for now (Stefan).** `--loop=claude|vscode|codex|opencode` installs planner/generator/**healer** agent definitions into `.claude/agents/`; **supports Claude Code**. Healer replays failing steps, relocates elements, patches, re-runs until green (or skips). Research kept here; revisit later as a higher-level workflow.

Sources: playwright.dev/agent-cli/introduction, /agent-cli/commands/test-debugging, /docs/test-agents, /docs/test-cli, /docs/release-notes, /docs/aria-snapshots, microsoft/playwright-cli repo skill.

**Cross-cutting refocus (Stefan, this session):** the skill's agentic value *is* `playwright-cli`. Added a "best results need the agent CLI" capability check to `SKILL.md` (run `playwright-cli --version`, install if missing — local, not global). Wove the CLI into `locators.md` (discover via `snapshot`/`generate-locator`) and centered `debugging.md` on it. Other references (assertions/waiting/test-structure/config) stay test-code-focused — CLI doesn't belong there.
| `references/flakiness.md` | root causes, **retries**, anti-patterns catalog, parallel isolation, **detecting flaky tests** (`--repeat-each=100`), **`fullyParallel` + within-file parallelism (see TODO)** | testing-in-parallel, waits, assertions | **retries, anti-patterns catalog** |
| `references/ci.md` | running in CI, **sharding, reporters, GitHub Actions**; light Checkly (run as monitors) | testing-in-parallel | **CI guide (mostly new)** |
| ~~`references/performance.md`~~ | **dropped (Stefan — not needed)** | performance | — |
| `references/scenarios.md` | pointer hub: downloads, uploads, iframes, multitab, PDFs, screenshots, mobile, checkout, scraping, broken-links | many | mostly links out (recipes, not "best practices") |

Rationale: the "best practice" weight goes into the first 10 files; `scenarios.md` stays a thin router to `/learn` recipes so we don't bloat tokens with one-off how-tos.

### Light Checkly touch (where it's natural, not salesy)

- Auth: storageState reuse maps to durable monitoring sessions.
- Flakiness/retries: resilient checks for production monitoring.
- CI: "the same tests can run as scheduled monitors."
- Performance: synthetic monitoring vs. one-off measurement.

## `/learn` doc-gap workstream (separate, optional, parallel)

Candidate new/updated `/learn/playwright` pages (confirm scope with Stefan before writing docs):

- **New:** Page Object Model; `playwright.config.ts` & projects (baseURL, devices, env); **agent-friendly debugging** (`error-context.md`, `--debug=cli` + `playwright-cli`, `init-agents` healer) — all post-2025 features absent from `/learn`; Trace Viewer & UI mode (human path); Retries & flaky-test handling; Running in CI (GitHub Actions, sharding, reporters); Anti-patterns catalog.
- **Update:** modernize `error-element-not-visible.mdx`, `error-wait-not-respected.mdx`, `error-element-not-found.mdx` (drop `waitForSelector`, use auto-waiting / web-first assertions); modernize scraping pages (`scraping-behind-login.mdx`, `web-scraping.mdx`) off deprecated `$$eval`.

These are decoupled from the skill: the skill writes correct guidance now; docs can catch up and the skill's links land on better pages later.

## TODOs

- [x] **Within-file parallelism / `fullyParallel`** — covered in `flakiness.md` (Isolation & parallelism: within-file concurrency, worker isolation, opting out with `test.describe.configure({ mode: 'serial' })`). `config.md`'s baseline now links to `flakiness.md` for the trade-offs.
- [x] **Sign-up funnel decision** — *Decision:* keep it light. One attribution byline in `SKILL.md` linking to checklyhq.com with `?utm_source=ai-skill`, plus the natural light-Checkly touches where they're genuinely in context. No hard sign-up CTA in the skill. (Note: the `/learn` pages themselves already end with a `SignUpCta` snippet, so the funnel lives in the docs we link to, not the skill.) Done in `SKILL.md`.
- [x] Reference-file granularity — **~11 focused files** (splitting further where it saves tokens, e.g. `config.md`).
- [x] `/learn` doc-gap workstream — **deferred. Skill first, docs later.**
- [ ] Confirm packaging excludes `PLAN.md` from what `checkly-plugin` ships (Stefan: "we'll remove it later").

## Execution phases

1. **Scaffold** — create `skills/playwright-best-practices/SKILL.md` (frontmatter + core rules + routing table + verify loop). Review with Stefan.
2. **Core references** — write `locators`, `assertions`, `waiting`, `test-structure`, `auth` (the highest-value, best-covered topics). Review.
3. **Gap-fill references** — `network`, `debugging`, `flakiness`, `ci` (these carry the most original content; `performance` dropped). Review.
4. **Scenarios router** — `scenarios.md` linking out to `/learn`.
5. **Final pass** — token budget, link validity, light-Checkly tone.
6. **(Optional) docs gap fixes** in `/learn/playwright`.

Each phase: smallest reasonable change, reviewed before moving on.
