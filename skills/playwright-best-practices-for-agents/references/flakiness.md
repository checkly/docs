# Flakiness

A flaky test passes and fails without any code change. The cause is almost always a **race between the test and the app**, or **shared state between tests**. Fix the cause — don't mask it with retries.

## Common root causes → fix

| Symptom | Real cause | Fix |
|---|---|---|
| Passes locally, fails in CI | Hard wait too short under load | Drop `waitForTimeout`; trust auto-waiting + web-first assertions → [waiting.md](./waiting.md) |
| Assertion sees stale value | Non-retrying check (`innerText()` then `toBe`) | Web-first `await expect(locator)…` → [assertions.md](./assertions.md) |
| Breaks after unrelated UI change | Brittle locator (CSS/`nth`) | User-facing locators → [locators.md](./locators.md) |
| Fails only when run with others | Shared external state (same DB row, same account) | Each test provisions its own data via API → [test-structure.md](./test-structure.md) |
| Fails when run in a different order | One test depends on another | Make every test independent |
| Random hangs/timeouts on load | `networkidle` / arbitrary timing | Wait on app state (`waitForURL`, a visible result) → [waiting.md](./waiting.md) |

## Retries are a safety net, not a fix

Retries absorb genuine infrastructure hiccups (a dropped connection, a cold start) so one blip doesn't fail the run. They do **not** fix a flaky test — a retry that flips red→green is hiding a real race you should investigate.

```ts playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,   // 0 locally so you notice flakes immediately
  use: { trace: 'on-first-retry' },  // capture a trace the moment a test retries
})
```

Keep retries **off locally** — a flake that only "passes on retry" in CI is one you'll never see if your laptop silently retries it too. When a test does retry, read the `on-first-retry` trace (see [debugging.md](./debugging.md)) to find the race. `test.info().retry` lets a fixture reset external state before a retry attempt if needed.

## Isolation & parallelism

Each test already gets a **fresh browser context** (its own cookies and storage), so browser state never leaks between tests. Flakiness comes from state *outside* the browser and from execution order.

Playwright's default: **files run in parallel, tests within a file run in order on one worker.** Setting `fullyParallel: true` (the [config.md](./config.md) baseline) also spreads tests *within* a file across workers — so two tests in the same file can run at once and **must not** share mutable state or assume an order. That surfaces hidden coupling early: any test relying on a sibling's side effect now fails, forcing each to provision its own state via API ([test-structure.md](./test-structure.md)).

- **Workers are isolated processes.** Nothing is shared across workers except external resources (your DB, test accounts). Give parallel tests distinct data, or they'll race on the same row.
- **Opt a genuinely sequential file out** with `test.describe.configure({ mode: 'serial' })` — a stateful flow that must run in order (note: a failure stops the rest of the file). Prefer independent tests; reach for `serial` only when the flow is truly stateful, since it trades isolation for ordering.
- **Worker-scoped fixtures** (`{ scope: 'worker' }`) share expensive setup across tests in a worker — keep them read-only; mutating shared fixture state reintroduces races.

## Detecting flakiness

A test that "passed once" isn't stable. Prove it by running it many times — and in parallel, to surface races:

```sh
npx playwright test tests/checkout.spec.ts --repeat-each=20   # run it 20× back to back
npx playwright test tests/checkout.spec.ts --retries=3        # does it only pass on retry?
```

If a test fails only in CI, reproduce locally by matching CI's conditions — `fullyParallel: true` and the same `--workers` count — so the race shows up on your machine.

Resilient tests are also resilient [Checkly monitors](https://www.checklyhq.com/?utm_source=ai-skill): the same race that flakes in CI pages you at 3am in production, so fixing the root cause pays off twice.

## Deeper in the docs

- [Running tests in parallel](https://www.checklyhq.com/learn/playwright/testing-in-parallel/)
- [Playwright: Retries](https://playwright.dev/docs/test-retries)
- [Playwright: Parallelism](https://playwright.dev/docs/test-parallel)
