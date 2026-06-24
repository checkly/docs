# Visual regression

Pixel-compare a page or element against a committed baseline to catch unintended visual change. The hard part isn't the assertion — it's keeping renders deterministic, so a diff means a real change and not noise.

## `toHaveScreenshot` — the visual assertion

Auto-retrying: it takes shots until two consecutive ones are stable (waiting out late layout), then compares against the baseline. The first run writes the baseline; later runs compare against it.

```ts
await expect(page).toHaveScreenshot()                                  // viewport
await expect(page).toHaveScreenshot({ fullPage: true })
await expect(page.getByRole('article')).toHaveScreenshot('card.png')   // one element
```

Prefer it over the older `toMatchSnapshot` for anything rendered — `toMatchSnapshot` is for arbitrary buffers or text (a downloaded file, a JSON blob), not pages.

## Structure over pixels — `toMatchAriaSnapshot`

Pixel screenshots are powerful but brittle: any restyle diffs them, and baselines are platform-bound (below). When you care about **structure and content** — the right headings, items, and controls, in the right order — assert the accessibility tree instead. It's auto-retrying like any web-first matcher, stable across platforms, and produces a readable diff:

```ts
await expect(page.getByRole('main')).toMatchAriaSnapshot(`
  - heading "Checkout" [level=1]
  - list:
    - listitem: "Coffee — €4.00"
    - listitem: "Tea — €3.50"
  - button "Pay"
`)
```

Store the expected tree in a file with the `{ name }` form and regenerate it with `--update-snapshots`, the same workflow as screenshots — but without the platform-specific baseline problem.

**Agent tie-in:** this YAML *is* the accessibility tree that `playwright-cli snapshot` prints and that Playwright writes to `error-context.md` on failure ([debugging.md](./debugging.md)) — capture it from a driven session and paste it straight in as the expected value.

## Baselines are platform-specific — generate them where CI runs

Browsers render differently across operating systems (fonts, anti-aliasing), so Playwright suffixes each baseline per platform — `card-chromium-darwin.png`. A baseline captured on your Mac will **always** diff against a Linux CI runner. Generate and commit baselines on the same platform CI uses: run the update inside the [Playwright Docker image](https://playwright.dev/docs/docker) or in the CI job itself. This is the #1 cause of "passes locally, fails in CI" for visual tests.

## Stabilize the render

A visual test is only useful if a diff means a real change. Remove the noise:

- **Animations** — disabled by default (`animations: 'disabled'`); leave it on.
- **Dynamic content** — `mask` the regions that legitimately change (dates, avatars, ads):
  ```ts
  await expect(page).toHaveScreenshot({ mask: [page.getByTestId('timestamp')] })
  ```
- **Fonts / late layout** — the auto-retry waits for a stable shot, but make sure web fonts have loaded first (assert some text is visible before the screenshot).
- **Tolerance** — absorb sub-pixel anti-aliasing noise with `maxDiffPixels` / `maxDiffPixelRatio` (prefer these to a blanket `threshold`):
  ```ts
  await expect(page).toHaveScreenshot({ maxDiffPixels: 100 })
  ```

Set suite-wide defaults in config: `expect: { toHaveScreenshot: { maxDiffPixels: 100 } }`.

## Updating baselines

When a visual change is intentional, regenerate the baselines and **review the new images before committing** — an unreviewed update defeats the whole point:

```sh
npx playwright test --update-snapshots
```

Commit the `*-snapshots/` files in the same change that caused the visual difference.

## Reading a visual diff (agent)

On a mismatch Playwright writes `…-actual.png`, `…-expected.png`, and `…-diff.png` into `test-results/` (and attaches them to the report). Open the `-diff.png` to see exactly what moved — you can view the image directly, no trace GUI needed. → [debugging.md](./debugging.md)

## Plain screenshots ≠ visual assertions

`page.screenshot({ path: 'shot.png' })` just captures an image — useful as a one-off debug artifact, but it asserts nothing. Don't confuse it with `toHaveScreenshot`, which compares against a committed baseline and fails on a diff.

## Deeper in the docs

- [Playwright: Visual comparisons](https://playwright.dev/docs/test-snapshots)
- [Playwright: `toHaveScreenshot`](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot)
- [Playwright: Docker](https://playwright.dev/docs/docker)
