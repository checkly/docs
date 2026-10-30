# Monitor your API end to end

Self-contained sample for `/guides/api-monitoring`. Run commands from this directory using your own Checkly account credentials.

```bash
npm ci
npx checkly test --record
npx checkly deploy
```

The sample creates four API checks in a `Shop API` group that sets two parallel locations, the `API_BASE_URL` group variable, a one-failure alert policy, and no retries. `openapi.yaml` describes the two catalog endpoints of the [Danube demo shop](https://danube-web.shop) that `catalog.check.ts` monitors with status, header, and JSON body assertions. `slow.check.ts` hits a deliberately slow httpbin.org page to show the degraded state. `orders.check.ts` posts to httpbin.org, which echoes the request back, with a setup script that fetches a token and builds a unique order and a teardown script that deletes the order and scrubs the token before assertions run.

No alert channels are attached, so this sample records alert states without sending notifications.

To verify a failure, change the expected title in `catalog.check.ts` from `'Haben oder haben'` to `'Parry Hotter'` and run `npx checkly test --record`.

## Author verification

- Deployed to Checkly Marketing as `docs-guide-api-monitoring` on 2026-09-28; group ID `6924492`.
- Recorded session `01a0e88b-ddc4-77ac-b5a5-0da4142068f1`: three checks passed, the slow endpoint degraded as designed.
- Recorded failing session `01a0e88c-0faa-77e8-a702-7d50a59bd061` with the title changed to `'Parry Hotter'`: `GET /books/{id}` failed with `JSON body property "$.title" equals target "Parry Hotter". Received: Haben oder haben.` Restored before deploying.
- The failure block in the guide shows only the Assertions section of the capture; every other line is verbatim.
- Raw terminal captures live in the gitignored `.captures/` directory.
