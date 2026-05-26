# Checkly Documentation Site Monitoring

Synthetic monitoring for `www.checklyhq.com/docs`, defined with the Checkly CLI.

## Layout

```
docs/
├── checkly.config.ts        # Project config (locations, defaults, checkMatch)
└── __checks__/
    ├── alertChannels.ts     # Alert channel definitions (Slack via env var)
    ├── group.ts             # CheckGroupV2 — `docs-monitoring`
    ├── uptime.check.ts      # URL monitors for homepage, /api-reference, /cli
    ├── homepage-ux.check.ts # Browser check (Playwright)
    └── homepage-ux.spec.ts  # Playwright spec used by homepage-ux.check.ts
```

`checkly.config.ts` discovers checks via `checkMatch: '**/__checks__/**/*.check?(-group).{js,ts}'`.

## Checks

All checks belong to the `docs-monitoring` group, which sets the shared defaults:

- **Locations:** us-east-1, eu-west-1, ap-southeast-1 (parallel)
- **Frequency:** 10 min default (overridable per check)
- **Retry strategy:** fixed 30s backoff, 2 retries, same region
- **Alert channel:** Slack `#ops`

| Check                       | Type    | Path             | Frequency override |
| --------------------------- | ------- | ---------------- | ------------------ |
| `docs-homepage-uptime`      | URL     | `/`              | 5 min              |
| `docs-api-reference-uptime` | URL     | `/api-reference` | —                  |
| `docs-cli-uptime`           | URL     | `/cli`           | —                  |
| `docs-homepage-ux`          | Browser | `/`              | 15 min             |

Paths are appended to `DOCS_BASE_URL` (defaults to `https://www.checklyhq.com/docs`). URL monitors follow redirects and assert the final response is HTTP 200 within `degradedResponseTime` / `maxResponseTime` thresholds. The browser check verifies the page loads, the title matches `/Checkly/i`, and primary navigation is visible.

Note: CheckGroupV2 makes `locations`, `runParallel`, and `retryStrategy` non-overridable from individual checks once set on the group. `frequency` and `tags` are inherited defaults that checks can override.

The group is `muted: true` while the new monitoring is being shaken out — checks still run but no alerts fire. Unmute in `__checks__/group.ts` when ready.

## Deploys

Deploys are handled by `.github/workflows/deploy-checks.yml` on merge to `main`. The workflow runs `checkly deploy --force` and sources `CHECKLY_API_KEY`, `CHECKLY_ACCOUNT_ID`, and `SLACK_OPS_WEBHOOK_URL` from GitHub Actions secrets.

PR previews run via `.github/workflows/preview-checks.yml`, which targets the Mintlify PR preview URL with `checkly test --env DOCS_BASE_URL=<preview>`.

## Running locally

```bash
npx checkly login                 # one-time
export SLACK_OPS_WEBHOOK_URL=...   # required for config to parse
npx checkly test                  # dry-run all checks
npx checkly deploy --preview      # preview the diff before deploying
npx checkly trigger --tags critical
```

## Adding a check

1. Add a `*.check.ts` file under `__checks__/`.
2. Attach it to `docsGroup` from `group.ts` so it inherits tags and alert channels.
3. `npx checkly test` to validate; commit and let CI deploy on merge.
