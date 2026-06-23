# Config & projects

`playwright.config.ts` is the single place for shared options. Put common settings under `use`, and use **projects** to run the same tests across browsers, devices, or environments.

## A sensible baseline

Start from a config that's parallel by default and CI-aware, rather than tuning options one by one:

```ts playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,                      // run tests within a file in parallel too
  forbidOnly: !!process.env.CI,             // fail the run if a stray test.only ships
  retries: process.env.CI ? 2 : 0,          // retry only in CI (see flakiness.md)
  workers: process.env.CI ? 1 : undefined,  // cap in CI, auto-pick locally
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.BASE_URL ?? 'https://danube-web.shop',
    trace: 'on-first-retry',                // capture a trace when a test retries
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
})
```

The `process.env.CI ? … : …` pattern tunes each option to its environment: locally you optimize for fast, focused iteration (auto-picked workers, `test.only` allowed, **no retries so you notice flakes immediately**); CI optimizes for determinism and guardrails (capped workers for repeatable ordering, `test.only` rejected, a couple of retries to absorb genuine infra hiccups). Retries are a safety net for infrastructure, not a fix for flaky tests — see [flakiness.md](./flakiness.md). `fullyParallel: true` also runs tests *within* a file concurrently, which has real isolation trade-offs — also covered in [flakiness.md](./flakiness.md).

## Shared options (`use`)

Everything under `use` applies to every test's browser context (a project's `use` overrides it):

- **`baseURL`** — the one to always set. Lets tests call `page.goto('/login')` and keeps environments swappable via an env var.
- **Artifact capture** — `trace`, `screenshot`, `video` (e.g. `'on-first-retry'`, `'only-on-failure'`, `'retain-on-failure'`). The "turn it on" knobs live here; reading a trace is in [debugging.md](./debugging.md).
- **Emulation** — `viewport`, `locale`, `timezoneId`, `colorScheme: 'dark'`, `ignoreHTTPSErrors`.
- **`headless`** — `false` to watch a run locally; leave `true` in CI.

## Projects

Each project runs the suite with its own `use`, and can filter and depend on others:

- `dependencies` sequences projects — the classic use is an auth `setup` project that others depend on (see [auth.md](./auth.md)).
- `testMatch` / `testIgnore` route files to projects (e.g. a smoke project, or per-environment `baseURL`/`retries`).
- Run one project with `npx playwright test --project=chromium`; skip its deps with `--no-deps`.

Parameterize a project by exposing a fixture as an **option** (`[value, { option: true }]`), then override it per project's `use` or per test with `test.use({ ... })` — one spec, many configurations.

## Start your app first (`webServer`)

Let Playwright boot your app before the run and tear it down after, so `npm test` is one command:

```ts
webServer: {
  command: 'npm run start',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,   // reuse a running dev server locally
  timeout: 120_000,
}
```

Point `use.baseURL` at the same `url` so tests stay environment-agnostic.

## Timeouts

Test and assertion budgets are set here too: top-level `timeout` (per test, default 30s) and `expect: { timeout }` (web-first assertions, default 5s). See [assertions.md](./assertions.md) and [waiting.md](./waiting.md) for how these interact with auto-waiting.

## Deeper in the docs

- [Parameterizing projects](https://www.checklyhq.com/learn/playwright/how-to-parameterize-playwright-projects/)
- [Playwright: Projects](https://playwright.dev/docs/test-projects)
- [Playwright: Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright: webServer](https://playwright.dev/docs/test-webserver)
