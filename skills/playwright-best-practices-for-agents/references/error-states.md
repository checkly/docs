# Error & edge states

The happy path is the easy half. Test what the app does when the server errors, the network fails, the user goes offline, or a response is slow — that's where real bugs hide. All of these lean on request interception ([network.md](./network.md)).

## Server errors

Force an error response and assert the app shows a real error state — a message, a retry affordance — instead of a blank screen:

```ts
await page.route('**/api/orders', route => route.fulfill({ status: 500, body: 'boom' }))
await page.goto('/orders')
await expect(page.getByRole('alert')).toHaveText(/something went wrong/i)
await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
```

## Network failure & offline

Drop requests to simulate a dead connection, or flip the whole context offline:

```ts
await page.route('**/api/**', route => route.abort())   // requests fail
// …or take the whole context offline:
await context.setOffline(true)
await expect(page.getByText('You are offline')).toBeVisible()
await context.setOffline(false)
```

`route.abort('internetdisconnected')` mimics a specific browser network error if the app branches on the failure type.

## Loading & skeleton states

To prove a loading state actually renders, delay the response so it's observable, then assert it resolves:

```ts
await page.route('**/api/orders', async route => {
  await new Promise(r => setTimeout(r, 1000))   // deliberate, controlled delay
  await route.fulfill({ json: orders })
})
await page.goto('/orders')
await expect(page.getByTestId('skeleton')).toBeVisible()   // shown while pending
await expect(page.getByRole('listitem')).toHaveCount(3)    // then the data
```

The delay lives in *your* mock, under your control — that's different from a `waitForTimeout` against the live app ([waiting.md](./waiting.md)), which is always wrong.

## Assert recovery, not just failure

A good error test also proves the app comes back. Serve the error first, then let a retry succeed — swap the handler so the second call returns 200 — and assert the recovered UI:

```ts
let attempt = 0
await page.route('**/api/orders', route =>
  attempt++ === 0
    ? route.fulfill({ status: 500 })            // first call fails
    : route.fulfill({ json: orders }),          // retry succeeds
)
await page.goto('/orders')
await page.getByRole('button', { name: 'Retry' }).click()
await expect(page.getByRole('listitem')).toHaveCount(3)
```

## Reproduce the error state with the agent CLI

Mock the failure live and confirm the app actually renders an error state — the right alert, a retry affordance, the real copy — before you commit the assertions ([debugging.md](./debugging.md)):

```bash
playwright-cli open https://danube-web.shop/orders
playwright-cli route "**/api/orders" --status=500   # force the server error
playwright-cli reload                                 # re-fetch through the mock
playwright-cli snapshot                               # the rendered error UI → author assertions from it
playwright-cli console error                          # confirm it degrades without throwing
```

The snapshot tells you whether the app degraded gracefully or just blanked — the bug this test exists to catch — and hands you the real alert role and message text to assert against. `network --filter=orders` shows the request fired; `route-list` / `unroute` manage the active mocks.

## Don't forget console errors

An error state shouldn't spew uncaught exceptions while it renders. Pair these tests with the console-error gate in [console-errors.md](./console-errors.md).

## Deeper in the docs

- [Mocking API responses](https://www.checklyhq.com/learn/playwright/mock-api/)
- [Intercepting requests](https://www.checklyhq.com/learn/playwright/intercept-requests/)
- [Playwright: Mock APIs (`abort`, `fulfill`)](https://playwright.dev/docs/mock)
- [Playwright: Network](https://playwright.dev/docs/network)
- [Playwright: `context.setOffline`](https://playwright.dev/docs/api/class-browsercontext#browser-context-set-offline)
