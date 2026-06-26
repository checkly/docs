# Tags & annotations

Annotations change **whether or how** a single test runs; tags **group** tests so you can run a slice of the suite. Both keep a large suite navigable.

## Annotations — skip, fixme, fail, slow

| Annotation | Meaning |
|---|---|
| `test.skip()` | Don't run — not applicable here (e.g. a feature absent on one browser). |
| `test.fixme()` | Known broken; don't run, and don't pretend it passes. A tracked TODO. |
| `test.fail()` | Assert the test **currently** fails — flips to a failure the day the bug is fixed, so you notice. |
| `test.slow()` | This test is legitimately slow; triples its timeout instead of a blanket bump. |

Call them conditionally (so the suite self-documents *why*), or unconditionally inside a test:

```ts
import { test, expect } from '@playwright/test'

// Conditional, at definition time
test.skip(({ browserName }) => browserName === 'webkit', 'export not on Safari yet')

test('admin export', async ({ page }) => {
  test.slow()   // big report — needs the extra budget, just for this test
  // …
})
```

A `skip`/`fixme` is a tracked TODO, not a parking lot — and never a way to hide a flake. Fix the cause instead ([flakiness.md](./flakiness.md)).

## `test.only` is a local tool

`test.only` runs just that test while you iterate. Set `forbidOnly: true` in CI so a stray `.only` can't silently shrink the suite to one test ([config.md](./config.md)).

## Tags — group and filter

Tag tests, then run a slice. Use the metadata form (it keeps titles clean):

```ts
test('checkout', { tag: '@smoke' }, async ({ page }) => { /* … */ })

test.describe('billing', { tag: ['@slow', '@billing'] }, () => { /* … */ })
```

Filter a run with `--grep` / `--grep-invert`:

```sh
npx playwright test --grep @smoke              # only smoke tests
npx playwright test --grep-invert @slow        # everything except slow ones
npx playwright test --grep "@smoke|@billing"   # either tag
```

`--grep` matches against the test title **and** its tags. Keep a small, stable vocabulary (`@smoke`, `@slow`, `@quarantine`) rather than ad-hoc labels nobody filters on.

## Steps for readable reports

`test.step('label', async () => { … })` groups actions into labelled phases so a report or trace points at a phase, not a flat action list — reach for it on long flows. Full detail (and the `@step` decorator for Page Objects) is in [test-structure.md](./test-structure.md).

## Custom annotations (metadata)

Attach context that surfaces in the report — an issue link, a reason:

```ts
test('quarantined upload',
  { annotation: { type: 'issue', description: 'https://github.com/acme/app/issues/42' } },
  async ({ page }) => { /* … */ },
)
```

Push them dynamically too: `test.info().annotations.push({ type: 'perf', description: 'slow on staging' })`.

## Deeper in the docs

- [Playwright: Annotations](https://playwright.dev/docs/test-annotations)
- [Playwright: Tags](https://playwright.dev/docs/test-annotations#tag-tests)
- [Playwright: Command line (`--grep`)](https://playwright.dev/docs/test-cli)
