# Mobile & device emulation

Playwright emulates a mobile browser — viewport, user agent, device scale, touch — but it's still desktop Chromium or WebKit, not a real phone. It's good for responsive layout and touch behavior; it's not a substitute for real-device testing.

## Emulate a device

Spread a descriptor from `devices` to set viewport, user agent, `deviceScaleFactor`, `isMobile`, and `hasTouch` in one go. Do it per project — the usual place ([config.md](./config.md)):

```ts playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  projects: [
    { name: 'iPhone', use: { ...devices['iPhone 13'] } },
    { name: 'Pixel',  use: { ...devices['Pixel 5'] } },
  ],
})
```

Or for a single test or group:

```ts
test.use({ ...devices['iPhone 13'] })
```

`devices['iPhone 13']` runs on WebKit (Mobile Safari user agent); the Pixel runs on Chromium. It's emulation — close enough for layout and touch, but not actual iOS Safari. Real-device coverage needs a device cloud.

## Touch & taps

A device descriptor sets `hasTouch: true`, which enables touch events. Use `tap()` instead of `click()`:

```ts
await page.getByRole('button', { name: 'Menu' }).tap()
```

`tap()` requires touch to be enabled — it is under a mobile device, or set `use: { hasTouch: true }` directly. For low-level taps by coordinate there's `page.touchscreen.tap(x, y)`. Playwright's built-in touch is basic: multi-touch gestures like pinch and swipe aren't first-class, so simulate a swipe by dispatching touch events, or fall back to the equivalent scroll/click where the UI allows.

## Responsive breakpoints

To check a layout at a breakpoint without a full device, set the viewport:

```ts
test('mobile nav collapses', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
})
```

Or run the same specs across several viewport projects to cover multiple breakpoints in one run.

## Deeper in the docs

- [Playwright: Emulation (devices, viewport, touch)](https://playwright.dev/docs/emulation)
- [Playwright: `locator.tap()`](https://playwright.dev/docs/api/class-locator#locator-tap)
- [Config & projects](./config.md)
