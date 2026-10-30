# Docs guide: Route alerts, traces and metrics through Cribl Stream

Sample project for the guide [Route alerts, traces and metrics through Cribl Stream](https://www.checklyhq.com/docs/guides/route-telemetry-through-cribl/).

One Browser check, `OTel demo checkout`, buys a product in a locally running [OpenTelemetry demo](https://opentelemetry.io/docs/demo/) shop. It runs from a private location whose agent sits on the demo's Docker network, and it alerts through one webhook channel, `Cribl Stream`, that posts a single-line JSON event to a Cribl Stream Raw HTTP Source. `collector/config.yaml` has an OpenTelemetry Collector scrape the account's Prometheus endpoint and send the metrics to a Cribl Stream OpenTelemetry Source.

## Run it

```bash
npm install
npx checkly api /v1/private-locations -X POST -F name="OTel demo on this machine" -F slugName=otel-demo-local --jq '{id, key: .keys[0].rawKey}'
docker run -d --name checkly-agent-otel-demo --restart unless-stopped --network opentelemetry-demo -e API_KEY="pl_..." checkly/agent:latest
npx checkly env add CRIBL_ALERTS_URL https://default.main.<Org-ID>.cribl.cloud:20001
npx checkly env add CRIBL_TOKEN <alerts-token> --secret
npx checkly test --record
npx checkly deploy
```

For metrics, create a Prometheus token under **Account settings** > **Integrations** and save it as the only content of `collector/checkly.token`, which is gitignored. Fill in `<your account ID>` and `<Org-ID>` in `collector/config.yaml`, then start the Collector with the OpenTelemetry Source token:

```bash
docker run -d --name checkly-otel-collector --restart unless-stopped --network opentelemetry-demo \
  -v "$PWD/collector/config.yaml:/etc/otelcol-contrib/config.yaml" \
  -v "$PWD/collector/checkly.token:/etc/otelcol-contrib/checkly.token" \
  -e CRIBL_OTEL_TOKEN="<otel-token>" \
  otel/opentelemetry-collector-contrib:0.160.0
```

To see an alert, set the `paymentFailure` flag to `100%` at `http://localhost:8080/feature/` and run `npx checkly checks run --tags=cribl-guide`. Set it back to `off` and run it again for the recovery.

## What was verified

Run on 2026-10-29 against an Enterprise sandbox account (runtime 2026.04) with `checkly` 9.5.0, `checkly/agent:latest` 8.12.0 (`sha256:2cf0b8725f0a16486e96bf3d2e4e8e13abdb7d682cba1d7a0141deb695a41c94`) and the OpenTelemetry demo's `latest` images (main-branch builds from 2026-10-27, newer than the 3.1.0 release; their changelog lists no change to the web checkout or the `paymentFailure` flag since 3.1.0). The demo's proxy was published on host port 8089 instead of 8080 on that machine.

- `npx checkly test --record` passes from `otel-demo-local`; `npx checkly deploy` creates the check with no public locations.
- With `paymentFailure` at `100%`, checkout stays on the cart page (`POST /api/checkout` returns 422 `PAYMENT_FAILED`), the check fails, and the failing run's trace ID is the same trace the demo's Jaeger shows ending in an error on the payment service's `charge` span.
- Checkly raised a failure alert and, after the flag went back to `off`, a recovery alert, and sent both to the `Cribl Stream` channel. **The Cribl side was not reachable during the run**: `CRIBL_ALERTS_URL` pointed at a placeholder host, so both deliveries ended with `FAILURE` / `Server never responded`. No event was seen arriving in Cribl Stream.
- The webhook template renders to one line of valid JSON with Handlebars for double quotes in the title, no tags, three tags, and with and without Rocky AI fields. A backslash in a check name, group or tag still produces invalid JSON.
- `collector/config.yaml` was added on 2026-10-30 and is not yet verified against Cribl Stream.
- Raw terminal output used in the guide is in `.captures/` (gitignored).
