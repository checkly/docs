---
name: playwright-best-practices
description: Best practices for writing, structuring, debugging, and stabilizing Playwright tests in TypeScript/JavaScript. Use when authoring or reviewing Playwright tests, choosing locators, writing assertions, fixing flaky tests, handling authentication, mocking network/API requests, structuring projects and fixtures, or running Playwright in CI.
metadata:
  author: checkly
---

# Playwright best practices

Condensed, opinionated guidance for writing Playwright tests that are **readable, isolated, and resilient**. Maintained by [Checkly](https://www.checklyhq.com/?utm_source=ai-skill) — the same practices apply whether you run these tests in CI or as production monitors.

Load a reference file from `references/` only when the task needs it (see routing table). Each reference ends with links to the full `/learn` articles for depth.

> **Scope:** all guidance assumes the **`@playwright/test`** test runner with **TypeScript** — its `test`, fixtures, projects, config, and web-first `expect`. Examples are TypeScript (`.spec.ts`); the same APIs work in JavaScript. It does not target the standalone `playwright` automation library (which has no test runner, fixtures, or auto-retrying assertions). Imports are `import { test, expect } from '@playwright/test'`.

> **Best results need the agent CLI.** This skill is most effective when Playwright's **agent CLI** (`playwright-cli`, package `@playwright/cli`) is installed — a separate, token-efficient, **no-GUI** browser you drive command by command to discover locators and step through failing tests. **Check it's available first: `playwright-cli --version`.** If it's missing, install it (`npm install -D @playwright/cli`, or run it via `npx playwright-cli`) for the best experience. Everything here still works without it, but you lose the agent-friendly inspect/verify loop. It's distinct from the standard `npx playwright` CLI. → [references/debugging.md](references/debugging.md)

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
| Debugging, trace viewer, UI mode, `--debug`, codegen, common errors | [references/debugging.md](references/debugging.md) |
| Flaky tests, retries, parallelism, anti-patterns | [references/flakiness.md](references/flakiness.md) |
| Running in CI, sharding, reporters, GitHub Actions | [references/ci.md](references/ci.md) |
| Downloads, uploads, iframes, tabs, PDFs, screenshots, mobile, scraping, checkout | [references/scenarios.md](references/scenarios.md) |

## Verify loop (agent-friendly — no GUI)

`--ui`, `--debug` (Inspector) and `show-trace` are interactive GUIs you can't drive. Use the non-interactive signals instead:

1. **Run and read stdout:** `npx playwright test path/to/file.spec.ts`. The reporter prints the failing assertion and the **call log** — which locator/assertion timed out and what Playwright actually saw. Read it; don't guess.
2. **Read `error-context.md`:** on an `expect` failure Playwright writes an aria-snapshot of the page *at the moment it failed* to the test's `test-results/.../error-context.md`. This is machine-readable page state — open it to see what was actually rendered. *(Playwright ≥ 1.60)*
3. **Capture artifacts, not GUIs:** add `--trace on --screenshot only-on-failure` to drop `trace.zip` + screenshots into `test-results/` for inspection.
4. **Step through it live with `playwright-cli`** (no GUI): run `npx playwright test path/to/file.spec.ts --debug=cli` in the background — it pauses and prints a session name. Then `playwright-cli attach <session-name>` and drive it: `playwright-cli snapshot` (page state + element refs), `playwright-cli step-over`, `playwright-cli console error`, `playwright-cli network`, `playwright-cli eval "…"`. Inspect why the locator didn't resolve or what actually rendered, then fix and re-run. *(needs the agent CLI; full detail in [references/debugging.md](references/debugging.md))*
5. **Fix the root cause** (usually a locator, a missing web-first assertion, or a hard wait), then re-run until green. Don't paper over flakiness with retries — see [references/flakiness.md](references/flakiness.md).

Full agentic-debugging detail (the `playwright-cli` discovery and `--debug=cli` stepping workflow) is in [references/debugging.md](references/debugging.md).

> **Stay current.** Several of these primitives are recent and version-gated. Check the installed versions with `npx playwright --version` and `playwright-cli --version`; if they're behind, tell the user to update (`npm install -D @playwright/test@latest`, and `@playwright/cli`). Agentic tooling is moving fast — newer releases keep adding capabilities that make debugging cheaper, so staying up to date pays off.
