---
name: playwright-best-practices-for-agents
description: Agent-first best practices for writing, structuring, debugging, and stabilizing Playwright tests in TypeScript/JavaScript, built around Playwright's agent CLI (`playwright-cli`) and no-GUI agentic debugging flows. Use when authoring or reviewing Playwright tests: choosing locators, writing web-first assertions, fixing flaky tests, handling authentication (SSO/2FA), mocking network/API requests, structuring projects and fixtures, generating test data, building forms and validation, uploading or downloading files, testing iframes, multiple tabs/popups or multi-user flows, mobile and device emulation, mocking time and dates, visual regression and screenshots, tagging and annotating tests, catching console errors, testing error/offline/loading states, configuring global setup, or running Playwright in CI.
metadata:
  author: checkly
---

# Playwright best practices

Condensed, opinionated guidance for writing Playwright tests that are **readable, isolated, and resilient** — built for coding **agents**, around Playwright's **agent CLI** (`playwright-cli`) and its no-GUI debugging flows. Maintained by [Checkly](https://www.checklyhq.com/?utm_source=ai-skill) — the same practices apply whether you run these tests in CI or as production monitors.

Load a reference file from `references/` only when the task needs it (see routing table). Each reference ends with links to the full `/learn` articles for depth.

> **Scope:** all guidance assumes the **`@playwright/test`** test runner with **TypeScript** — its `test`, fixtures, projects, config, and web-first `expect`. Examples are TypeScript (`.spec.ts`); the same APIs work in JavaScript. It does not target the standalone `playwright` automation library (which has no test runner, fixtures, or auto-retrying assertions). Imports are `import { test, expect } from '@playwright/test'`.

> **The agent CLI is what makes this skill shine.** Playwright's **agent CLI** — `playwright-cli`, package `@playwright/cli` — is a separate, token-efficient, **no-GUI** browser you drive command by command to discover locators and step through failing tests. It's distinct from the standard `npx playwright` CLI, and the **Agentic workflow** below leans on it throughout. → [references/debugging.md](references/debugging.md)

## Core rules (always apply)

1. **Locator priority:** prefer user-facing locators — `getByRole` > `getByLabel` / `getByPlaceholder` / `getByText` > `getByTestId` > CSS/XPath. CSS/XPath tie tests to implementation and break easily. → [references/locators.md](references/locators.md)
2. **Web-first assertions:** use auto-retrying `expect(locator).toBeVisible()` / `toHaveText()` etc. Never assert on a one-shot value you pulled out manually (`innerText()` then `toBe`). → [references/assertions.md](references/assertions.md)
3. **No hard waits:** never `waitForTimeout()`. Trust auto-waiting actions and web-first assertions; for explicit waits use `waitForURL` / `waitForLoadState` / `waitForResponse`. Avoid `networkidle`. → [references/waiting.md](references/waiting.md)
4. **Isolated & independent:** each test sets up its own state and can run in any order, in parallel. No test depends on another. Provision state via API in setup, not through the UI. → [references/test-structure.md](references/test-structure.md), [references/flakiness.md](references/flakiness.md)
5. **One feature per test:** if a test's assertions span more than one feature, split it. Keep tests short and focused.
6. **Reuse auth, don't re-login:** sign in once, persist `storageState`, reuse it across tests via a setup project. → [references/auth.md](references/auth.md)

## Routing table

| When the task is about… | Read |
|---|---|
| Picking selectors, strict mode, `data-testid` | [references/locators.md](references/locators.md) |
| Assertions, soft assertions, `expect.poll`/`toPass` | [references/assertions.md](references/assertions.md) |
| Waiting, auto-waiting, timeouts, navigation | [references/waiting.md](references/waiting.md) |
| Test design, fixtures, Page Object Model, steps | [references/test-structure.md](references/test-structure.md) |
| `playwright.config.ts`, projects, baseURL, devices, setup dependencies | [references/config.md](references/config.md) |
| Login, 2FA/TOTP, SSO, sessions, `storageState` | [references/auth.md](references/auth.md) |
| Mocking, intercepting, `route`, HAR, API testing | [references/network.md](references/network.md) |
| Debugging failures, `playwright-cli`, `--debug=cli`, traces, common errors | [references/debugging.md](references/debugging.md) |
| Flaky tests, retries, parallelism, anti-patterns | [references/flakiness.md](references/flakiness.md) |
| Running in CI, sharding, reporters, GitHub Actions | [references/ci.md](references/ci.md) |
| Test data, factories, unique data, seeding/cleanup | [references/test-data.md](references/test-data.md) |
| Forms, inputs, validation, error messages | [references/forms.md](references/forms.md) |
| File upload & download | [references/files.md](references/files.md) |
| iframes, frames, `frameLocator` | [references/iframes.md](references/iframes.md) |
| Multiple tabs, popups, multiple users/contexts | [references/multi-context.md](references/multi-context.md) |
| Mobile, device emulation, touch, viewport/breakpoints | [references/mobile.md](references/mobile.md) |
| Time/date, clock mocking, countdowns, timeouts | [references/clock.md](references/clock.md) |
| Visual regression, screenshots, `toHaveScreenshot`, aria snapshots | [references/visual.md](references/visual.md) |
| Tags (`@smoke`), `--grep`, `skip`/`fixme`/`slow` annotations | [references/tags-annotations.md](references/tags-annotations.md) |
| Failing tests on `console`/`pageerror` | [references/console-errors.md](references/console-errors.md) |
| `globalSetup`/`globalTeardown`, setup projects | [references/global-setup.md](references/global-setup.md) |
| Error, offline, network-failure, loading states | [references/error-states.md](references/error-states.md) |

## Agentic workflow (no GUI)

The interactive tools — `--ui`, `--debug` (Inspector), `show-trace` — are GUIs you can't drive. Author and debug through the non-interactive signals instead.

> **Having `playwright-cli` available is highly encouraged** — both phases below lean on it. Confirm with `playwright-cli --version` and install it if missing — `npm install -D @playwright/cli`, then run it via `npx playwright-cli` (or install globally with `npm install -g @playwright/cli` to call `playwright-cli` directly). Everything still works without it, but you lose the inspect/verify loop and fall back to guessing.

**Author — discover, don't guess.** Read locators off the live page rather than from source: `playwright-cli open <url>` → `playwright-cli snapshot` prints the accessibility tree — the roles and accessible names that power `getByRole`/`getByLabel` — so you author the user-facing locator straight from what it shows. → [references/locators.md](references/locators.md)

**Run & debug:**

1. **Run and read stdout:** `npx playwright test path/to/file.spec.ts`. The reporter prints the failing assertion and the **call log** — which locator/assertion timed out and what Playwright actually saw. Read it; don't guess.
2. **Read `error-context.md`:** on an `expect` failure Playwright writes an aria-snapshot of the page *at the moment it failed* to the test's `test-results/.../error-context.md`. This is machine-readable page state — open it to see what was actually rendered. *(Playwright ≥ 1.60)*
3. **Capture artifacts, not GUIs:** add `--trace on` to drop `trace.zip` into `test-results/` for inspection.
4. **Step through it live with `playwright-cli`** (no GUI): run `npx playwright test path/to/file.spec.ts --debug=cli` in the background — it pauses and prints a session name. Then `playwright-cli attach <session-name>` and drive it: `playwright-cli snapshot` (page state + element refs), `playwright-cli step-over`, `playwright-cli console error`, `playwright-cli network`, `playwright-cli eval "…"`. Inspect why the locator didn't resolve or what actually rendered, then fix and re-run. *(needs the agent CLI; full detail in [references/debugging.md](references/debugging.md))*
5. **Fix the root cause** (usually a locator, a missing web-first assertion, or a hard wait), then re-run until green. Don't paper over flakiness with retries — see [references/flakiness.md](references/flakiness.md).

Full agentic-debugging detail (the `playwright-cli` discovery and `--debug=cli` stepping workflow) is in [references/debugging.md](references/debugging.md).

> **Stay current.** These primitives are recent and version-gated — check `npx playwright --version` and `playwright-cli --version`, and update both packages if they're behind. Detail in [references/debugging.md](references/debugging.md).
