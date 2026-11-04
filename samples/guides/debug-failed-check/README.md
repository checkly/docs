# Docs guide: Debug a failed check

Sample project for the guide [Debug a failed check](https://www.checklyhq.com/docs/guides/reading-traces/).

One Playwright Check Suite, `Shop checkout`, buys a book on the [Danube demo shop](https://danube-web.shop). **It fails on purpose.** The spec leaves the `Company (optional)` field empty, and the checkout form rejects that. The guide walks from the failing check to that root cause and shows the fix.

## Run it

```bash
npm install
npx checkly deploy
npx checkly checks run --tags=checkout
```

Then follow the guide: `npx checkly checks list --status=failing`, `npx checkly checks get <id>`, `npx checkly assets download`, `npx playwright trace`, and `npx checkly rca run`.

To confirm the diagnosis, fill the company field in `tests/checkout.spec.ts` and run `npx checkly test --record`.

## What was verified

- Deployed to the Checkly Marketing account as "Docs guide: Debug a failed check"; the check fails from `us-east-1` and `eu-west-1`.
- `@playwright/test` is pinned to 1.59.1. Rocky AI could not read traces recorded with 1.63.0 at the time of writing.
- With the company field filled, `npx checkly test --record` passes and the deployed check recovers.
- Raw terminal output used in the guide is in `.captures/` (gitignored).
