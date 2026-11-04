# Cover every endpoint with uptime monitors

Self-contained sample for `/guides/uptime-monitoring`. Run commands from this directory using your own Checkly account credentials.

```bash
npm ci
npx checkly test --record
npx checkly deploy
```

The sample creates five URL monitors for the Danube shop from one array, one URL monitor for a deliberately slow httpbin.org page, and one SSL monitor for the shop's certificate. All seven join the `Shop uptime` group, which sets two parallel locations, a one-failure alert policy, and no retries. URL monitors import shared degraded and failed response-time thresholds.

No alert channels are attached, so this sample records alert states without sending notifications.

To verify a failure, change the slow page URL to `https://httpbin.org/status/503` and the certificate hostname to `expired.badssl.com`, deploy, wait a minute, then restore both and deploy again.

## Author verification

- Deployed to Checkly Marketing as `docs-guide-uptime-coverage`.
- Recorded session `01a0d523-a545-7781-afff-bcead6fdf638`: all seven monitors passed.
- Deployed the 503 and expired-certificate variant on 2026-09-24, observed both monitors fail from both locations with the errors `Expected 503 to be equal to 200` and `chain verification failed`, then restored and redeployed.
- Raw terminal captures live in the gitignored `.captures/` directory.
