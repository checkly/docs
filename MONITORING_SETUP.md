# Checkly Documentation Site Monitoring

Synthetic monitoring for `www.checklyhq.com/docs`, defined with the Checkly CLI.

## Layout

```
docs/
├── checkly.config.ts        # Project config (locations, defaults, checkMatch)
├── deploy-monitoring.sh     # Convenience wrapper around login + deploy
└── __checks__/
    ├── group.ts             # CheckGroupV2 — `docs-monitoring`
    ├── uptime.check.ts      # URL monitors for homepage, /api-reference, /cli
    ├── homepage-ux.check.ts # Browser check (Playwright)
    └── homepage-ux.spec.ts  # Playwright spec used by homepage-ux.check.ts
```

`checkly.config.ts` discovers checks via `checkMatch: '__checks__/**/*.check.ts'`.

## Checks

| Check                       | Type    | Path                       | Frequency | Locations                          |
| --------------------------- | ------- | -------------------------- | --------- | ---------------------------------- |
| `docs-homepage-uptime`      | URL     | `/`                        | 5 min     | us-east-1, eu-west-1, ap-southeast-1 |
| `docs-api-reference-uptime` | URL     | `/api-reference`           | 10 min    | us-east-1, eu-west-1               |
| `docs-cli-uptime`           | URL     | `/cli`                     | 10 min    | us-east-1, eu-west-1               |
| `docs-homepage-ux`          | Browser | `/`                        | 15 min    | us-east-1, eu-west-1               |

Paths are appended to `DOCS_BASE_URL` (defaults to `https://www.checklyhq.com/docs`). URL monitors follow redirects and assert the final response is HTTP 200 within `degradedResponseTime` / `maxResponseTime` thresholds. The browser check verifies the page loads, the title matches `/Checkly/i`, primary navigation is visible, and there are no console errors.

## Usage

```bash
npx checkly login           # one-time
npx checkly test            # dry-run all checks locally
npx checkly deploy          # push to the Checkly account
npx checkly trigger --tags critical  # on-demand run
```

`./deploy-monitoring.sh` chains login + install + test + deploy.

## Adding a check

1. Add a `*.check.ts` file under `__checks__/`.
2. Attach it to `docsGroup` from `group.ts` so it inherits tags and grouping.
3. `npx checkly test` to validate, then `npx checkly deploy`.

Alert channels are managed in the Checkly dashboard, not in code.
