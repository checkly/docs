# Locators

Pick locators a user (or screen reader) would recognize, not implementation details. Stable locators are the single biggest lever on test reliability.

## Priority ladder

Prefer, in order:

1. `getByRole(role, { name })` — role + accessible name. Default choice.
2. `getByLabel` / `getByPlaceholder` — form fields.
3. `getByText` / `getByAltText` / `getByTitle` — non-interactive content.
4. `getByTestId` — explicit `data-testid` escape hatch when nothing semantic fits.
5. `locator(css/xpath)` — last resort only.

```ts
await page.getByRole('button', { name: 'Sign in' }).click()
```

Role-name matching is case-insensitive and substring-based, so it survives copy tweaks ("Sign in" → "Sign in now") but still fails when the button text breaks meaningfully.

## Why not CSS/XPath

CSS/XPath tie the test to markup. A class rename (`button-frontpage` → `button-hero`) breaks a passing test (false positive); CMS text breaking to `HEROBUTTON_TXT` leaves a CSS test green while the UI is broken (false negative). User-first locators track what the user sees.

If `getByRole`/`getByLabel` *can't* find your elements, that's often an accessibility smell worth fixing in the app — not a reason to drop to CSS.

## Strict mode & narrowing

Locators run in strict mode: matching >1 element throws. Resolve by narrowing, not by silencing.

- **Chain** to scope into a region — mix semantic and test-id freely: `page.getByTestId('product-grid').getByRole('link', { name: 'Buy' })`.
- `.filter({ hasText })` / `.filter({ hasNotText })` — narrow by content (preferred for dynamic lists).
- `.filter({ has })` / `.filter({ hasNot })` — narrow by a child locator.
- `.or(locator)` / `.and(locator)` — match either/both of two locators.
- `.first()` / `.nth(n)` / `.last()` — positional; brittle in dynamic content, fine for stable lists.

```ts
// Narrow before acting — fails when the user would also be stuck (all sold out)
await page.getByRole('listitem')
  .filter({ hasText: 'available' })
  .getByRole('button', { name: 'buy' })
  .click()
```

## Locators are lazy and reusable

A locator is a *description*, not a captured element. It re-queries the DOM on every use, so define it once, reuse it, and chain off it. Don't `await` a locator on its own — only `await` the action or assertion.

```ts
const product = page.getByRole('listitem').filter({ hasText: 'Product 2' })
await product.getByRole('button', { name: 'Add to cart' }).click()
await expect(product).toContainText('In cart')
```

## Anti-patterns

- CSS/XPath when a role/label exists.
- Positional `.nth()` on lists whose order/content changes.
- Locators that encode DOM structure (`div > div:nth-child(3)`).
- **Pre-checking before acting** — actions already auto-wait, so the guard is redundant:
  ```ts
  // 👎 redundant
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  await page.getByRole('button', { name: 'Login' }).click()
  // 👍 just act — click() waits for actionability
  await page.getByRole('button', { name: 'Login' }).click()
  ```
  (Assert visibility when visibility *is* the thing under test — not as a warm-up to every click. See [waiting.md](./waiting.md).)

## Deeper in the docs

- [Working with selectors](https://www.checklyhq.com/learn/playwright/selectors/)
- [Clicking, typing, hovering](https://www.checklyhq.com/learn/playwright/clicking-typing-hovering/)
- [Playwright locators guide](https://playwright.dev/docs/locators)
