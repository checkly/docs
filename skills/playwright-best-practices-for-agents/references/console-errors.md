# Console errors

A test can pass while the browser logs an uncaught exception or a `console.error` — a real bug your assertions never looked at. Turn unexpected browser errors into a test failure.

## Listen for errors

Two signals, in order of value:

- `page.on('pageerror', …)` — **uncaught exceptions** in page code. The high-signal one; an unhandled error is almost always a bug.
- `page.on('console', …)` — console output; filter to `msg.type() === 'error'` for `console.error` calls.

```ts
page.on('pageerror', err => console.log('uncaught:', err.message))
page.on('console', msg => {
  if (msg.type() === 'error') console.log('console.error:', msg.text())
})
```

## Make it a gate with a fixture

Collecting errors and asserting none at the end is per-test boilerplate — make it an **automatic fixture** so every test gets the check for free. The fixture attaches listeners *before* the test body (so nothing is missed on first navigation) and asserts in teardown:

```ts base.ts
import { test as base, expect } from '@playwright/test'

export const test = base.extend<{ failOnError: void }>({
  failOnError: [async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })

    await use()   // run the test

    expect(errors, 'no uncaught or console errors during the test').toEqual([])
  }, { auto: true }],
})
export { expect } from '@playwright/test'
```

## Allowlist real noise — sparingly

Some third-party scripts log benign errors you can't fix. Filter them by pattern, but keep the list **short and reviewed** — a broad filter quietly hides regressions:

```ts
const IGNORE = [/ResizeObserver loop limit exceeded/, /third-party-widget\.js/]
page.on('pageerror', err => {
  if (!IGNORE.some(re => re.test(err.message))) errors.push(err.message)
})
```

## Inspecting errors live

When chasing one error rather than gating the whole suite, `playwright-cli console error` prints the browser console from a driven or attached session — no listeners to wire up. See [debugging.md](./debugging.md).

## Deeper in the docs

- [Debugging common errors](https://www.checklyhq.com/learn/playwright/debugging-errors/)
- [Playwright: `page.on('console')`](https://playwright.dev/docs/api/class-page#page-event-console)
- [Playwright: `page.on('pageerror')`](https://playwright.dev/docs/api/class-page#page-event-page-error)
- [Playwright: `ConsoleMessage`](https://playwright.dev/docs/api/class-consolemessage)
