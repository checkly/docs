# Continuous integration

The suite that guards merges should run unattended in CI: deterministic, fast, and leaving artifacts you can read after a failure. The environment-driven config that makes a run CI-aware (`forbidOnly`, `retries`, `workers`, `reporter`, `trace`) lives in [config.md](./config.md); this file is about wiring it into a pipeline.

## GitHub Actions

The canonical workflow — install browsers with their OS deps, run, and upload the report even on failure:

```yaml
steps:
  - uses: actions/checkout@v5
  - uses: actions/setup-node@v5
    with:
      node-version: lts/*
  - name: Install dependencies
    run: npm ci
  - name: Install Playwright browsers
    run: npx playwright install --with-deps
  - name: Run Playwright tests
    run: npx playwright test
  - uses: actions/upload-artifact@v4
    if: ${{ !cancelled() }}        # keep the report even when tests fail
    with:
      name: playwright-report
      path: playwright-report/
      retention-days: 30
```

`--with-deps` installs the system libraries the browsers need on the runner — skip it and headless Chromium/WebKit fail to launch. `if: ${{ !cancelled() }}` is the important bit: a failed run is exactly when you want the report.

## Reporters

Set the reporter by environment (config.md's baseline uses `process.env.CI ? 'github' : 'html'`):

- **`github`** — inline annotations on the PR's changed lines. Good default for a single CI job.
- **`html`** — the full browsable report. Upload it as an artifact; download and view locally with `npx playwright show-report`. It's a GUI, so it's for humans — as an agent, read the failure from stdout + `error-context.md` ([debugging.md](./debugging.md)).
- **`blob`** — machine-mergeable output; **required when sharding** (below).
- `list` / `line` / `dot` for terminal output, `json` / `junit` for downstream tooling.

Combine reporters when you want both — e.g. annotations *and* a browsable report:

```ts
reporter: [['github'], ['html']],
```

## Sharding across machines

Split the suite into N independent slices that run on parallel runners. Sharding balances best with `fullyParallel: true` (splits at the test level, not the file level — see [flakiness.md](./flakiness.md)):

```yaml
strategy:
  fail-fast: false
  matrix:
    shardIndex: [1, 2, 3, 4]
    shardTotal: [4]
steps:
  - name: Run shard
    run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
```

Each shard emits a **blob** report; a final job merges them into one HTML report:

```ts
reporter: process.env.CI ? 'blob' : 'html',
```

```sh
# after downloading every shard's blob into ./all-blob-reports
npx playwright merge-reports --reporter html ./all-blob-reports
```

Don't merge by hand — `merge-reports` reconciles retries, flaky markers, and attachments (traces, screenshots) across shards into a single coherent report.

## Capture artifacts for failures

Turn on the artifacts that make a CI failure debuggable without re-running — these are config.md's `use` knobs, and they pay off most in CI:

```ts
use: {
  trace: 'on-first-retry',       // a trace the moment a test retries
  screenshot: 'only-on-failure',
}
```

The blob/HTML report bundles them. Read them with the agent-friendly primitives in [debugging.md](./debugging.md) — `show-trace` and `show-report` are GUIs for a human reviewing the run.

## The same tests as monitors

A Playwright suite that proves a deploy in CI can run unchanged as scheduled [Checkly monitors](https://www.checklyhq.com/?utm_source=ai-skill) from multiple regions: CI proves the change is good before it ships, monitoring proves production *stays* good after. One test asset, two jobs.

## Deeper in the docs

- [Running tests in parallel](https://www.checklyhq.com/learn/playwright/testing-in-parallel/)
- [Playwright: CI](https://playwright.dev/docs/ci-intro)
- [Playwright: Sharding](https://playwright.dev/docs/test-sharding)
- [Playwright: Reporters](https://playwright.dev/docs/test-reporters)
