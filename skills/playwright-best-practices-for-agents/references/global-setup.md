# Global setup

Two ways to run work once before the suite: a `globalSetup` function, or a setup **project** that other projects depend on. They solve different problems — pick by whether the work needs the browser and fixtures.

## Setup projects (prefer these)

A setup project is a normal test file that runs first because other projects declare `dependencies: ['setup']` on it. It has the full toolkit — fixtures, `page`, `expect`, `baseURL`, tracing — and shows up in the report like any test. The canonical use is auth: log in once, save `storageState`, and dependents start signed in.

```ts playwright.config.ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'] },
]
```

Reach for a setup project for anything that benefits from the browser or fixtures, or that you want visible — and retried and traced — like a test. Full auth flow in [auth.md](./auth.md); the projects/`dependencies` mechanics in [config.md](./config.md).

## `globalSetup` — bootstrapping outside the runner

`globalSetup` is a single function run **once** before everything, *outside* the test runner — no fixtures, no `page`, and none of the `use` options applied for you (no automatic `baseURL`, no tracing). It does receive the resolved `config`, so you can still read values like `config.projects[0].use.baseURL` when you need them. Reach for it for non-test, non-browser bootstrapping: seed a database, start an external service, mint an API token.

```ts playwright.config.ts
export default defineConfig({
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
})
```

```ts global-setup.ts
import type { FullConfig } from '@playwright/test'

export default async function globalSetup(config: FullConfig) {
  await seedDatabase()
  process.env.API_TOKEN = await mintToken()   // pass data to tests via env vars
}
```

It runs outside any test, so it returns nothing to tests directly — hand data over through `process.env` or a file on disk. An error here fails the whole run before a single test starts.

## Teardown

- A `globalTeardown` function mirrors `globalSetup` for one-time cleanup after the run.
- A setup *project* cleans up with a **teardown project**: point the project's `teardown` at another project that runs once everything depending on it has finished.

```ts playwright.config.ts
projects: [
  { name: 'setup db', testMatch: /global\.setup\.ts/, teardown: 'cleanup db' },
  { name: 'cleanup db', testMatch: /global\.teardown\.ts/ },
]
```

## Which one

- **Auth, or anything needing the browser / fixtures / report** → setup project.
- **Seeding, services, tokens — non-test bootstrapping** → `globalSetup`.

When in doubt, prefer a setup project: it reuses your config and is visible in the report when it breaks.

## Deeper in the docs

- [Playwright: Global setup and teardown](https://playwright.dev/docs/test-global-setup-teardown)
- [Playwright: Projects (dependencies & teardown)](https://playwright.dev/docs/test-projects)
- [Managing authentication](https://www.checklyhq.com/learn/playwright/authentication/)
