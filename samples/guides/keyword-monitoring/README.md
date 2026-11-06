# Monitor the content your customers need to see

Self-contained sample for `/guides/keyword-monitoring`. Run commands from this directory using your own Checkly account credentials.

```bash
npm ci
npx checkly test --record
npx checkly deploy
```

The sample has one Playwright test, `tests/home-content.spec.ts`, that asserts the Danube shop's best seller is first on the home page with the right price, the offer banner appears exactly once, the sign-up call to action is visible under any approved wording, and no error copy is shown. `checkly.config.ts` runs it as a Playwright Check Suite every 5 minutes from `us-east-1` and `eu-west-1`. `checks/home-content.check.ts` runs the same spec as a Browser Check with `testOnly: true`, so only the Check Suite deploys.

To verify a failure, change the expected title in the spec to `'Parry Hotter'` and run `npx checkly test --record`.

## Author verification

- `npx playwright test` passed locally.
- Recorded session `01a0dabc-9899-7648-9225-575999f303d6`: both checks passed.
- Deployed to Checkly Marketing as `docs-guide-keyword-monitoring` on 2026-09-25; check ID `386b2001-3d77-4347-aa12-f9930976386b`.
- Recorded failing session `01a0dabd-7289-7340-9df7-81229f61eba4` with the title changed to `'Parry Hotter'`: both checks failed with `Expected "Parry Hotter"`, `Received "Haben oder haben"`. Restored before deploying.
- The strict mode violation output in the guide came from a local run of `expect(page.getByText('$9.95')).toBeVisible()` against the live shop.
- Raw terminal captures live in the gitignored `.captures/` directory.
