# Run checks on every deploy

Self-contained sample for `/guides/sdlc-monitoring`. Requires Node.js, a Checkly API key, and a Checkly account ID. Export `CHECKLY_API_KEY` and `CHECKLY_ACCOUNT_ID` in your terminal, then run commands from this directory.

```bash
npm ci
npx checkly test --record --env ENVIRONMENT_URL=https://danube-web.shop --test-session-name 'Docs guide: Run checks on every deploy | production'
npx checkly deploy --force
```

One URL monitor checks for HTTP 200; one Browser Check verifies that books are visible. Both are tagged `guide-checks-on-deploy` and scheduled every ten minutes in N. Virginia. Deploy only with the production URL in your shell. The URL monitor resolves `ENVIRONMENT_URL` at build time and defaults to Danube; the browser receives it at runtime, with a deployed Danube default.

## Prove failure and recovery

```bash
export CHECKLY_TEST_ENVIRONMENT=Preview
ENVIRONMENT_URL=https://danube-web.shop/does-not-exist npx checkly test --record --env ENVIRONMENT_URL=https://danube-web.shop/does-not-exist --test-session-name 'Docs guide: Run checks on every deploy | verified failure'
```

Expected exit code: 1. Danube returns HTTP 200 on the wrong path, but the browser fails because no books appear.

```bash
export CHECKLY_TEST_ENVIRONMENT=Production
npx checkly test --record --env ENVIRONMENT_URL=https://danube-web.shop --test-session-name 'Docs guide: Run checks on every deploy | verified pass'
```

Expected exit code: 0, with two passing checks.

```bash
npx checkly trigger --tags guide-checks-on-deploy --record --env ENVIRONMENT_URL=https://danube-web.shop --test-session-name 'Docs guide: Run checks on every deploy | production trigger'
```

Trigger uses the deployed URL monitor's saved URL. Passing a runtime variable does not rebuild that monitor. The Browser Check receives the runtime override.

## GitHub Actions

Copy the two files in `.github/workflows/` to your repository's root `.github/workflows/`. Keep the sample at `samples/guides/checks-on-deploy`, or update both `working-directory` inputs. Update `repoUrl` in `checkly.config.ts` to your repository.

- Configure secret `CHECKLY_API_KEY` and variable `CHECKLY_ACCOUNT_ID`.
- The PR workflow waits for the latest successful GitHub deployment named `Preview` for the exact PR head SHA. Configure your provider to publish deployments and statuses, or adapt that step to your existing deployment step's ready URL output. Fork PRs do not receive secrets.
- Require `Checkly preview job` before merge. With the Checkly GitHub App connected, also require `Checkly preview results`, since `reporting: auto` may detach the Checkly run.
- The production workflow requires a successful deployment status with `production_environment: true` and an `environment_url`. Set the deployment ref to the branch name and SHA to the deployed commit.
- Production uses `reporting: github-actions` to wait and fail the validation job on failed checks. It does not roll back a completed deployment.
- `CHECKLY_TEST_ENVIRONMENT` records the environment label; `ENVIRONMENT_URL` selects the test target. The Action records the event's git metadata. For local runs, commit changes first if you want the recorded SHA to reproduce the exact source.

## Validation record

Deployed to the Checkly Marketing account as `Docs guide: Run checks on every deploy`.

- Failing recorded session: `01a0d494-d1ea-7164-94c3-08cacd198765`.
- Passing recorded session: `01a0d495-01a9-724e-a8b6-ecf38090be39`.
- Passing deployed-check trigger: `01a0d493-02d2-759c-a10b-c812f0f9b9f3`.
- Both workflow files were validated with a YAML parser. **The workflows were not executed in CI.**
- This Browser Check did not expose `CHECKLY_RUN_SOURCE`. Checkly documents that built-in for Playwright Check Suites; do not use it as an environment label.

Raw terminal output is retained locally in the gitignored `.captures/` directory.
