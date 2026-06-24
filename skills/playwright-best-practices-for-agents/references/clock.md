# Clock & time

Time-dependent UI — countdowns, "expires in 5 min", "2 hours ago", session timeouts — is flaky against the real clock. `page.clock` makes time deterministic so those assertions are stable.

## Freeze the clock — `setFixedTime`

When the page just *reads* the time (relative timestamps, a displayed date), pin `Date.now()` and `new Date()` to a fixed value:

```ts
await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'))
await page.goto('/')
await expect(page.getByTestId('published')).toHaveText('2 hours ago')
```

`setFixedTime` affects only `Date` — timers (`setTimeout`/`setInterval`) keep running normally. It's the lightest option and pairs well with visual tests ([visual.md](./visual.md)), where a moving clock would cause diffs.

## Control the clock — `install`, then advance

When you need to drive timers — fire a countdown, trigger a session timeout — `install` a fake clock **before navigating**, then move time forward:

```ts
await page.clock.install({ time: new Date('2024-02-02T08:00:00') })
await page.goto('/')

await page.clock.fastForward('05:00')   // +5 minutes
await expect(page.getByText('Session expiring')).toBeVisible()
```

- `fastForward(ticks)` — jump forward by `ms` or a `"mm:ss"` string; fires each due timer **at most once** (like a laptop waking from sleep).
- `runFor(ticks)` — tick forward by a duration, firing **every** timer along the way.
- `pauseAt(time)` — jump to an exact time and **freeze** there; the page reads that time and timers stay paused until you advance or `resume`. Ideal for a deterministic assertion or screenshot.
- `resume()` — let time flow normally again.

## Which to reach for

- Page only **displays** a time → `setFixedTime`.
- You need to **advance** time to fire timers or animations → `install` + `fastForward` / `runFor` / `pauseAt`.

Either way, set the time up **before** `goto` so the app picks up the fake clock from the start.

## Deeper in the docs

- [Playwright: Clock](https://playwright.dev/docs/clock)
- [Playwright: `Clock` API](https://playwright.dev/docs/api/class-clock)
