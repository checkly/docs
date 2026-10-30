# Frames & iframes

An `<iframe>` is a separate document — main-page locators stop at its boundary. Step into it with a frame locator, then locate as usual.

## `frameLocator` — step into the frame

```ts
await page
  .frameLocator('iframe[title="Checkout"]')
  .getByRole('button', { name: 'Pay' })
  .click()
```

A frame locator is lazy and auto-waiting, exactly like a normal locator ([locators.md](./locators.md)): it waits for the frame and the element to appear, so no `waitForSelector`. Pick a stable selector for the iframe — its `name`, `title`, or `src` — never a positional one.

## Find the iframe with a user-facing locator

To target the iframe element the user-facing way, locate it and call `.contentFrame()`:

```ts
const checkout = page.getByTitle('Checkout').contentFrame()
await checkout.getByLabel('Card number').fill('4242 4242 4242 4242')
```

Same result as `frameLocator`, but you find the frame with priority-ladder locators instead of a CSS string.

## Nested frames

Chain to step through frames inside frames:

```ts
await page
  .frameLocator('#outer')
  .frameLocator('#inner')
  .getByRole('textbox')
  .fill('hi')
```

## Don't use the handle API

The older `page.frame({ name })` / `elementHandle.contentFrame()` handle approach doesn't auto-wait and is easy to get wrong. Prefer `frameLocator` / `locator.contentFrame()` — they re-resolve on every use and wait for actionability.

## Discovering frame content (agent)

`playwright-cli snapshot` includes the accessibility tree **inside** iframes, so you can read the roles and names to target and author the locator to chain off the frame. → [debugging.md](./debugging.md)

## Deeper in the docs

- [Handling iframes](https://www.checklyhq.com/learn/playwright/iframe-interaction/)
- [Playwright: Frames](https://playwright.dev/docs/frames)
- [Playwright: `FrameLocator`](https://playwright.dev/docs/api/class-framelocator)
- [Playwright: `locator.contentFrame()`](https://playwright.dev/docs/api/class-locator#locator-content-frame)
