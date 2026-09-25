# Guides overhaul plan

Branch `onboarding-guides-plan`, PR #522. How to write a guide: `.claude/skills/guide-authoring/SKILL.md`. Update the status column when you start or finish a task. Last updated 2026-09-25.

Status values: `Done` (committed on the branch), `In progress` (edited, not committed), `Not started`, `Blocked`.

## Guides

| # | Task | Page | Status | Notes |
|---|---|---|---|---|
| 1 | Structure a Checkly project | `guides/structuring-a-checkly-project` | Done | Old startup-guide URL redirects here |
| 2 | Turn your Playwright tests into monitors | `guides/playwright-testing-to-monitoring` | Done | `playwright-environments` retired into it |
| 3 | Why monitoring from around the globe is critical | `guides/global-monitoring` | Done | Brand diagrams, real latency data |
| 4 | Alerting that doesn't wake you up for nothing | `guides/alerting` | Done | |
| 5 | Run checks on every deploy | `guides/sdlc-monitoring` | Done | Workflows validated, not executed in CI |
| 6 | Monitor a checkout flow | `guides/monitoring-ecommerce-apps-using-playwright` | Done | |
| 7 | Cover every endpoint with uptime monitors | `guides/uptime-monitoring` | In progress | `create-multiple-monitors` deleted, redirect added, sample and images present. Needs commit |
| 8 | Monitor an API end to end | `guides/api-monitoring` (new) | Not started | Absorbs `monitoring-an-openapi-spec`, `setup-scripts-for-apis`, `monitoring-the-stripe-api`; three redirects |
| 9 | Debug a failed check | `guides/reading-traces` | Not started | Resolve guide: verify step must include an MCP prompt |
| 10 | A status page backed by real monitors | `guides/communicate-availability` | Not started | Communicate guide: verify step must include an MCP prompt |
| 11 | Set up monitoring with an AI coding agent | `guides/agentic-workflows` | In progress | Edited by another session, not committed. Confirm it is on the template |
| 12 | Claude Code walkthrough | `guides/claude-code-monitoring` | In progress | Same as 11 |

## Pages that stay as they are

| Page | Status | Notes |
|---|---|---|
| `guides/keyword-monitoring` | In progress | Kept by decision. File restored from history on 2026-09-25; needs a sidebar entry and commit |
| `guides/monitoring-ecommerce-apps-using-terraform` | In progress | Same as above |

## Moves to Learn

| Task | Status | Notes |
|---|---|---|
| `end-to-end-monitoring` to `learn/monitoring/end-to-end-monitoring` | In progress | File moved, redirect added. Needs a Learn Monitoring nav entry and commit |
| `auto-waiting-methods` merged into `learn/playwright/waits-and-timeouts` | Not started | Redirect required |
| `developer-fixtures` merged into `learn/playwright/test-fixtures` | Not started | Only the Playwright half; redirect required |
| `moving-from-puppeteer-to-playwright` to `learn/playwright/` | Not started | Redirect required. A `comparisons/frameworks/playwright-vs-puppeteer` page appeared uncommitted; decide whether it replaces this |
| `how-to-monitor-broken-links` retired to `learn/playwright/how-to-detect-broken-links` | Not started | Redirect required |

## Navigation and entry points

| Task | Status | Notes |
|---|---|---|
| Regroup Guides sidebar into Getting Started, Detect, Communicate, Resolve, Examples | In progress | Done in `docs.json`, not committed. Still lists `developer-fixtures` and `auto-waiting-methods`, which move to Learn, and lacks the two kept pages |
| Every guide's "Next" link matches sidebar order | Not started | Do after the sidebar is final |
| Rewrite `guides/overview.mdx` | In progress | Cards updated piecemeal; needs one pass once the sidebar is final |
| Quickstart "Go deeper" cards point at guides 1 and 2 | Not started | |
| `index.mdx` and `what-is-checkly.mdx` link to rewritten guides | Not started | `what-is-checkly` still links `sdlc-monitoring` and the checkout guide by old titles |
| Regenerate sitemap | In progress | `sitemap.xml` modified, not committed |
| Update PR #522 body | Not started | Use `gh api -X PATCH repos/checkly/docs/pulls/522` |

## Outside this repo

| Task | Owner | Status |
|---|---|---|
| Commit guide scenes in `checkly-marketing-website/scripts/screenshots/scenes.ts` | Dan | Not started |
| Named reviewer per area: Detect, Communicate, Resolve, AI | Dan | Not started |
| Product: link post-init and empty-state app screens to guide 1 | Product | Not started |
| Re-check success measures 90 days after merge | Dan | Blocked until merge |

Baselines, last 90 days before the overhaul: 3,424 guide page views, 109 referrals from the app, 1 thumbs up and 0 down, 120 searches for "Playwright check suite".
