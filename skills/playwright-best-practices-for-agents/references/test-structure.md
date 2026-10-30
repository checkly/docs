# Test structure

How to organize tests, share setup, and configure runs so a suite stays fast, isolated, and maintainable.

## Test design principles

- **Short & focused** — one feature per test. If a test's assertions span two features (checkout *and* coupons), split it so a failure points at one thing.
- **Independent** — no test depends on another running first. Each provisions the state it needs, so tests run in any order and in parallel.
- **Set up via API, not the UI** — create users/data through API calls in setup/teardown; it's faster and less flaky than clicking through forms. Only drive the UI for the behavior actually under test.

## Fixtures

Fixtures provide per-test state and replace copy-pasted setup. Built-ins: `page`, `context`, `browser`, `browserName`, `request`.

Define custom fixtures with `test.extend`. They're **lazy** — the setup runs only for tests that request the fixture. Code before `await use(value)` is setup; code after is teardown.

```ts base.ts
import { test as base } from '@playwright/test'

export const test = base.extend<{ webApp: Page }>({
  webApp: async ({ page }, use) => {
    await login(page)        // setup
    await use(page)          // hand the value to the test
    // teardown after the test, if any
  },
})
export { expect } from '@playwright/test'
```

Import `test` from your `base.ts` in spec files to share fixtures across the suite. For setup that must run for **every** test (like global hooks), make it an **automatic fixture** with `{ auto: true }` instead of repeating `beforeEach` in every file.

## Page Object Model

For larger suites, wrap a page's locators and interactions in a class so selectors live in one place and tests read at a higher level. A page object holds the `page`, declares its `Locator`s in the constructor, and exposes action (and optionally assertion) methods.

```ts login-page.ts
export class LoginPage {
  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Email')
    this.submit = page.getByRole('button', { name: 'Sign in' })
  }
  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.submit.click()
  }
}
```

```ts test
const login = new LoginPage(page)
await login.login(process.env.USER_EMAIL!, process.env.USER_PASSWORD!)
```

Reach for POM when locators/flows repeat across many tests; skip it for a handful of simple specs. Fixtures and POM compose well — a fixture can hand a ready-made page object to tests.

For `playwright.config.ts`, projects, `baseURL`, devices, and setup `dependencies`, see [config.md](./config.md).

## Readable steps

Group actions with `test.step('label', async () => { ... })` so reports and traces show meaningful phases instead of a flat action list. The same labels can be applied to Page Object methods automatically with a TypeScript `@step` decorator.

## Deeper in the docs

- [Best practices for writing tests](https://www.checklyhq.com/learn/playwright/writing-tests/)
- [The testing pyramid](https://www.checklyhq.com/learn/playwright/testing-pyramid/)
- [Custom test fixtures](https://www.checklyhq.com/learn/playwright/test-fixtures/)
- [Self-documenting tests with step decorators](https://www.checklyhq.com/learn/playwright/steps-decorators/)
- [Playwright: Page Object Model](https://playwright.dev/docs/pom)
