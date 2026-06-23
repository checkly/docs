# Network

Playwright lets you observe, block, mock, and replay HTTP traffic, and drive APIs directly. Reach for mocking to **isolate the frontend or pin down dynamic data** — not to paper over the flow you're actually testing (see [Don't over-mock](#dont-over-mock)).

## Observe traffic

Listen to requests and responses as they happen:

```ts
page.on('request', req => console.log('→', req.method(), req.url()))
page.on('response', res => console.log('←', res.status(), res.url()))
```

Prefer waiting on the **UI change** a request causes — a web-first assertion on the element that updates is the most reliable signal. Reach for `page.waitForResponse` only when there's no visible change to assert on (e.g. a background fetch or fire-and-forget call). Never a hard wait. See [waiting.md](./waiting.md).

## Mock with `page.route`

`page.route(urlPattern, handler)` intercepts matching requests before they leave the browser. The handler decides what happens. Glob patterns like `*/**/api/books/*` match regardless of host/port.

**Patch one field, keep the rest real** — fetch the real response, edit it, fulfill:

```ts
await page.route('*/**/api/books/23', async route => {
  const response = await route.fetch()
  const json = await response.json()
  json.stock = '12'                          // pin the dynamic value
  await route.fulfill({ response, json })     // reuse real response, override body
})
```

**Replace the whole payload** — no real call, so the test is faster and independent of the backend:

```ts
await page.route('*/**/api/books/23', route =>
  route.fulfill({ json: { id: 23, title: 'Achilles', stock: '12' } }),
)
```

**Block or pass through:**

- `route.abort()` — drop the request (e.g. block images/trackers to speed up scraping).
- `route.continue()` — let it proceed; pass `{ headers, postData, url }` to rewrite the outgoing request.
- `route.fallback()` — defer to the next matching handler (handlers run last-registered first).

```ts
await page.route('**/*', route =>
  route.request().resourceType() === 'image' ? route.abort() : route.continue(),
)
```

## Record & replay with HAR

When a flow depends on a slow or flaky third-party API, record its traffic once to a HAR file and replay it deterministically. Record with `update: true`, then commit the HAR and replay on every run:

```ts
// Record: hits the network and writes responses to the HAR
await page.routeFromHAR('./hars/books.har', { url: '*/**/api/**', update: true })

// Replay: serve matching requests from the HAR, no network
await page.routeFromHAR('./hars/books.har', { url: '*/**/api/**' })
```

- `update: true` (re)records; omit it to replay.
- `url` scopes which requests the HAR handles — leave the rest live.
- `notFound: 'abort' | 'fallback'` controls unmatched requests (default `abort`).
- `context.routeFromHAR` does the same for every page in a context. You can also capture a HAR from the CLI: `npx playwright open --save-har=books.har --save-har-glob="**/api/**" <url>`.

## API testing with the `request` fixture

The `request` fixture is an [`APIRequestContext`](https://playwright.dev/docs/api/class-apirequestcontext) — a clean HTTP client with no browser. Use it to test/seed APIs directly:

```ts
test('books API responds', async ({ request }) => {
  const res = await request.post('https://api.example.com/graphql', {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN!}` },
    data: { query: '{ books { id } }' },
  })
  expect(res).toBeOK()
  expect((await res.json()).data.books).toHaveLength(3)
})
```

Same context provisions test state via API in setup (faster and less flaky than the UI) and persists auth — see [auth.md](./auth.md) and [test-structure.md](./test-structure.md).

## Don't over-mock

Mocking isolates the frontend and stabilizes dynamic data, but every mocked call is a call you're **no longer testing**. For end-to-end coverage — and especially when the same tests run as production monitors — exercise the real stack:

- Block images/CDNs and you won't catch their outages.
- Mock `/checkout` and you'll miss a broken payment flow.
- Stub third-parties and a tracking script that breaks layout slips through.

Mock to isolate a component or fix a value for a deterministic assertion; keep the path under test real.

## Deeper in the docs

- [Mocking API responses](https://www.checklyhq.com/learn/playwright/mock-api/)
- [Intercepting requests](https://www.checklyhq.com/learn/playwright/intercept-requests/)
- [Testing APIs with Playwright](https://www.checklyhq.com/learn/playwright/testing-apis/)
- [Playwright: Mock APIs (incl. HAR)](https://playwright.dev/docs/mock)
- [Playwright: API testing](https://playwright.dev/docs/api-testing)
