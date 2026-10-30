# Multiple tabs, popups & users

A browser **context** is an isolated session — its own cookies and storage; a **page** is a tab within it. Reach for an extra tab when one user opens a window, and an extra context when you need a second, independent user.

## Popups & new tabs

When an action opens a new tab or window, capture the `popup` event — set the wait up **before** the click (promise-before-action, [waiting.md](./waiting.md)):

```ts
const popupPromise = page.waitForEvent('popup')
await page.getByRole('link', { name: 'Open invoice' }).click()
const invoice = await popupPromise
await expect(invoice.getByRole('heading')).toHaveText('Invoice #42')
```

The popup is a full `Page` in the **same context**, so it shares the session (cookies, login). Drive it like any page. To open a tab yourself, use `context.newPage()` — same session, second tab.

## A second user — new context

To act as two independent users in one test (collaboration, presence, an admin watching a customer), give each their own **context** so sessions don't bleed:

```ts
test('admin sees a new order from the customer', async ({ browser }) => {
  const adminContext    = await browser.newContext({ storageState: 'playwright/.auth/admin.json' })
  const customerContext = await browser.newContext({ storageState: 'playwright/.auth/customer.json' })
  const pageAdmin    = await adminContext.newPage()
  const pageCustomer = await customerContext.newPage()

  await pageAdmin.goto('/admin/orders')
  await pageCustomer.goto('/checkout')

  await pageCustomer.getByRole('button', { name: 'Place order' }).click()

  await expect(pageAdmin.getByText('Order #1001')).toBeVisible()   // appears live in the dashboard

  await adminContext.close()
  await customerContext.close()
})
```

Each context can carry a different `storageState`, so the two users are signed in as different accounts — see [auth.md](./auth.md) for capturing per-role state. Close the contexts you create.

### Hand the second user to tests via a fixture

Creating and closing the extra context in every test is boilerplate — wrap it in a fixture so cleanup is automatic and specs read at the user level ([test-structure.md](./test-structure.md)):

```ts base.ts
import { test as base, type Page } from '@playwright/test'

export const test = base.extend<{ pageAdmin: Page }>({
  pageAdmin: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'playwright/.auth/admin.json' })
    await use(await context.newPage())   // hand the admin's page to the test
    await context.close()                // teardown — the test never closes it
  },
})
```

A test now takes `{ page, pageAdmin }` — `page` is the customer (the default fixture), `pageAdmin` is the admin — with no setup or teardown noise in the test body.

## Same context or a new one?

- **New tab, same user** (a link that opens a window, a multi-tab flow) → the popup event or `context.newPage()`.
- **Different user, role, or session** → `browser.newContext()`. Isolation is the whole point — never share one context between two users.

## Drive multiple users with the agent CLI

The agent CLI's **named sessions** are the CLI mirror of contexts: each `-s=<name>` is an isolated browser — its own cookies and storage — so two sessions are two independent users, exactly like two contexts ([debugging.md](./debugging.md)).

```bash
playwright-cli -s=customer open https://danube-web.shop/checkout
playwright-cli -s=admin    open https://danube-web.shop/admin/orders
playwright-cli -s=customer click e12             # the customer places the order
playwright-cli -s=admin    snapshot              # verify it shows up in the admin view
playwright-cli list                              # the active sessions
```

Each session can load its own saved auth (`state-load`) to act as a different role — the CLI counterpart of `newContext({ storageState })` ([auth.md](./auth.md)). `close-all` tears them down.

## Deeper in the docs

- [Handling multiple tabs](https://www.checklyhq.com/learn/playwright/multitab-flows/)
- [Playwright: Pages & popups](https://playwright.dev/docs/pages)
- [Playwright: Browser contexts](https://playwright.dev/docs/browser-contexts)
- [Playwright: Multiple sign-in roles](https://playwright.dev/docs/auth#testing-multiple-roles-together)
