# Waiting

Never hard-wait. Hard waits are the most common cause of flaky Playwright tests — they are always either too short (test fails early) or too long (test wastes time), and fluctuating load times make them fail randomly.

```ts
// BAD
await page.waitForTimeout(1000)
await page.getByRole('button', { name: 'Login' }).click()
```

## Trust auto-waiting actions

Actions (`click`, `fill`, `selectOption`, …) wait for the element to be actionable before acting, retrying until the relevant checks pass or the timeout elapses (then they throw `TimeoutError`). No wait statement needed:

```ts
await page.getByRole('button', { name: 'Login' }).click()
```

The locator must first resolve to **exactly one** element (strict mode). The actionability checks themselves:

- **visible** — has a non-empty bounding box and no `visibility: hidden`.
- **stable** — same bounding box for two consecutive animation frames (not animating).
- **receives events** — it's the hit target at the action point (not covered by an overlay).
- **enabled** — no `[disabled]`, disabled `<fieldset>`, or `[aria-disabled]`.
- **editable** — enabled and not `[readonly]`.

Different actions run different checks. `click` waits for all five. `fill` waits for visible, enabled, and editable. The exact list per action is in the [official actionability table](https://playwright.dev/docs/actionability#actionability).

A few low-level calls — `focus`, `press`, and `dispatchEvent` — run **no checks at all**: they fire immediately even if the element is invisible, animating, or covered, and won't retry. Use them only when you deliberately want to bypass the checks (e.g. dispatching a synthetic event a real user couldn't trigger); for normal interactions prefer the real action so you keep auto-waiting.

Use `{ force: true }` only as a last resort: it skips the non-essential checks (e.g. receives-events), so a click can land on a covered or wrong element and hide a real bug.

## Wait for state with web-first assertions

To wait for a state change, assert it — the matcher auto-waits:

```ts
await expect(page.getByRole('button', { name: 'Login' })).toBeDisabled()
await expect(page.getByRole('alert')).toBeHidden()
```

Prefer the async web-first matcher over its sync counterpart — `await expect(loc).toBeVisible()` waits; `await loc.isVisible()` only samples the current moment and invites flakiness.

## Explicit waits — only when you must

For navigation/network, not elements:

- `page.waitForURL('**/login')` — wait for a navigation.
- `page.waitForLoadState()` — defaults to `load`; can take `domcontentloaded`.
- `page.waitForResponse(url)` / `page.waitForRequest(url)` — set up the promise *before* the action that triggers it.
- `page.waitForEvent('popup')` — new windows/tabs.
- `page.waitForFunction(fn)` — last resort for arbitrary in-page state.

```ts
const responsePromise = page.waitForResponse('**/api/login')
await page.getByRole('button', { name: 'Login' }).click()
await responsePromise
```

Avoid `networkidle` (in `waitForLoadState`/`waitForURL`) — it's discouraged and racy. Wait for app state instead.

## Deeper in the docs

- [Waits and timeouts](https://www.checklyhq.com/learn/playwright/waits-and-timeouts/)
- [Navigation](https://www.checklyhq.com/learn/playwright/navigation/)
- [Actionability](https://playwright.dev/docs/actionability)
