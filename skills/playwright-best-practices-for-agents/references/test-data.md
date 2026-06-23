# Test data

Isolated tests need their own data. Generate it per test (or per worker), seed it through the API, and clean up what you create — never let two tests share a mutable record.

## Make data unique

Parallel workers that reuse the same record race on it — one deletes the row another is asserting on. Give each test data that can't collide: a timestamp, a UUID, or the worker index.

```ts
import { test } from '@playwright/test'

test('creates an order', async ({ page }, testInfo) => {
  const email = `user-${testInfo.workerIndex}-${Date.now()}@example.test`
  // …provision and use `email`; no other worker can generate the same one
})
```

`testInfo.workerIndex` (and `parallelIndex`) identify the worker; combine with a timestamp for global uniqueness. For realistic-looking values use a generator like [`@faker-js/faker`](https://fakerjs.dev/) — but keep it deterministic when an assertion depends on the value.

## Build with factories, not inline literals

A factory returns a valid entity with sensible defaults and lets each test override only the field under test. Specs stay readable, and a schema change touches one place instead of every test.

```ts
type User = { name: string; email: string; plan: 'free' | 'pro' }

export const makeUser = (overrides: Partial<User> = {}): User => ({
  name: 'Test User',
  email: `user-${Date.now()}@example.test`,
  plan: 'free',
  ...overrides,
})

const proUser = makeUser({ plan: 'pro' })   // only the bit that matters is explicit
```

Factories pair naturally with **fixtures**: a fixture calls the factory and hands the test a ready-made entity — and can tear it down afterwards (see the next section, and [test-structure.md](./test-structure.md) for fixtures generally).

## Seed and tear down via the API

Provision state with the `request` fixture in setup — faster and less flaky than clicking through the UI (see [network.md](./network.md), [test-structure.md](./test-structure.md)). Wrap create + delete in a fixture so every test gets fresh data and cleans up after itself.

```ts base.ts
import { test as base } from '@playwright/test'

export const test = base.extend<{ order: Order }>({
  order: async ({ request }, use) => {
    const res = await request.post('/api/orders', { data: makeOrder() })
    const order = await res.json()
    await use(order)                                 // hand it to the test
    await request.delete(`/api/orders/${order.id}`)  // teardown — runs even if the test failed
  },
})
export { expect } from '@playwright/test'
```

Code after `await use(...)` runs whether the test passed or failed, so a failure can't leak data into the next run.

## Share read-only data per worker

Expensive setup that every test only *reads* — a seeded product catalog, a reference account — can be a **worker-scoped** fixture (`{ scope: 'worker' }`), created once per worker and reused. Keep it read-only; mutating shared fixture state reintroduces the races you split the data to avoid ([flakiness.md](./flakiness.md)).

## Anti-patterns

- A hardcoded shared account or row (`user1`) that tests mutate — the classic source of order-dependent flakes.
- Relying on data a previous test left behind. Each test provisions its own.
- Random values where the assertion needs a known one — make *those* deterministic.

## Deeper in the docs

- [Testing APIs with Playwright](https://www.checklyhq.com/learn/playwright/testing-apis/)
- [Playwright: API testing](https://playwright.dev/docs/api-testing)
- [Playwright: `TestInfo` (`workerIndex`, `parallelIndex`)](https://playwright.dev/docs/api/class-testinfo)
