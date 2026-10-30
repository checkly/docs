# Assertions

Default to auto-retrying, web-first assertions. They wait for a condition to become true (up to the timeout) instead of checking once, which removes most flakiness.

## Web-first (auto-retrying) — use these

`expect(locator).<matcher>()` polls until it passes or times out:

```ts
await expect(page.getByRole('alert')).toBeVisible()
await expect(page.getByTestId('total')).toHaveText('€42.00')
await expect(page.getByRole('button', { name: 'Pay' })).toBeEnabled()
```

Common matchers: `toBeVisible`, `toBeHidden`, `toBeAttached`, `toBeEnabled`, `toBeDisabled`, `toBeEditable`, `toBeChecked`, `toBeFocused`, `toBeInViewport`, `toHaveText`, `toContainText`, `toHaveValue`, `toHaveValues`, `toHaveCount`, `toHaveAttribute`, `toHaveClass`, `toHaveURL`, `toHaveTitle`. Accessibility-focused matchers exist too — `toHaveRole`, `toHaveAccessibleName`, `toHaveAccessibleDescription` — and `toBeOK` checks a response. All support `.not`, and negation auto-retries too.

Visual/structure assertions — `toHaveScreenshot` (pixel) and `toMatchAriaSnapshot` (accessibility-tree YAML) — are also auto-retrying.

This is a curated set, not the full list. For every matcher (including `toHaveCSS`, `toHaveJSProperty`, `toContainClass`, `toHaveId`, and more) see the [Playwright assertions reference](https://playwright.dev/docs/test-assertions).

`toHaveText`, `toContainText`, and `toHaveCount` work against a locator that matches **many** elements — assert on the set directly instead of looping:

```ts
await expect(page.getByRole('listitem')).toHaveCount(3)
await expect(page.getByRole('listitem')).toContainText(['Coffee', 'Tea', 'Milk'])
```

**Always `await` a web-first assertion.** It's async; a missing `await` doesn't fail loudly — the check is silently skipped and the test passes for the wrong reason.

## Non-retrying — only for plain values

`expect(value).toBe()/toEqual()/toBeGreaterThan()` evaluate once. Use them for deterministic, already-resolved values (numbers, parsed JSON), not for UI state.

## The #1 mistake: awaiting inside expect

```ts
// BAD — reads once, no waiting
expect(await locator.innerText()).toBeTruthy()

// GOOD — web-first, auto-waits
await expect(locator).not.toBeEmpty()
```

`await` goes *outside* `expect(locator)`, and the matcher does the waiting. Never pull a value out with `innerText()`/`textContent()` and assert on it when a web-first matcher exists.

## Soft assertions

`expect.soft(...)` records a failure but lets the test continue, then marks it failed at the end. Good for collecting multiple independent checks (form fields, link sweeps) in one run.

```ts
await expect.soft(page.getByTestId('cookieBanner')).toBeVisible()
```

To bail out mid-test once some have failed, check `expect(test.info().errors).toHaveLength(0)`.

## Timeouts

Web-first assertions retry against the **expect timeout** (default **5s**) — separate from the test timeout (default **30s**) and any action timeout. If something genuinely takes longer than 5s (a slow report, a long upload), don't add a `waitForTimeout` before it — give that one assertion a longer `timeout` instead:

```ts
await expect(page.getByText('Report ready')).toBeVisible({ timeout: 30_000 }) // per call
```

Be deliberate about which knob you turn: a per-assertion `timeout` for one genuinely slow step keeps the rest of the suite fast and signals intent at the call site; raising the project-wide default (`expect: { timeout: 10_000 }` in config) is the honest fix when the whole app is slower (a heavy staging environment), rather than peppering overrides everywhere. For a reusable variant, preconfigure `expect` once and import it:

```ts
const slowExpect = expect.configure({ timeout: 10_000 })
const softExpect = expect.configure({ soft: true })
```

## Custom failure messages

Pass a message as the second arg to `expect` (or `expect.soft`) to make failures self-explanatory in reports and logs:

```ts
await expect(page, 'dashboard should load after login').toHaveTitle(/Dashboard/)
```

## Dynamic / flaky conditions

When no web-first matcher fits, retry the *value* or the *block* instead of hard-waiting.

`expect.poll(fn)` re-runs `fn` until the matcher passes or the timeout hits — ideal for polling an API or any non-locator value:

```ts
await expect
  .poll(async () => (await request.get('/api/orders/42')).status(), { timeout: 10_000 })
  .toBe(200)
```

`expect(async () => { ... }).toPass()` retries a whole block until every assertion inside passes — use it when several conditions must converge together:

```ts
await expect(async () => {
  const order = await getOrder(42)
  expect(order.status).toBe('shipped')
  expect(order.trackingId).toBeTruthy()
}).toPass({ timeout: 10_000 })
```

Note `toPass` defaults to **no timeout** and ignores the global expect timeout — always pass an explicit `timeout` so a never-passing block can't hang the test.

`expect.extend({...})` adds custom matchers for repeated domain checks (e.g. `toBeWithinRange`); merge several matcher modules with `mergeExpects()`.

## Anti-patterns

- `await page.waitForTimeout(3000)` before an assertion — see [waiting.md](./waiting.md).
- Asserting five features in one test — split it; keep assertions focused.
- `toBe()` on text where `toContainText()`/`toHaveText()` would auto-wait.

## Deeper in the docs

- [Assertions — types & best practices](https://www.checklyhq.com/learn/playwright/assertions/)
- [Waits and timeouts](https://www.checklyhq.com/learn/playwright/waits-and-timeouts/)
- [Playwright assertions reference](https://playwright.dev/docs/test-assertions)
