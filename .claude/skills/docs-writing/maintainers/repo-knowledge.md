# Repo knowledge

Mined from `main` and from careful edits between Nov 2025 and Oct 23 2026. Two bulk sweeps (Jul 6–13 2026 and the cleanup push from Oct 24 2026) are not treated as representative.

## Facts the docs already contradict

Do not cite either side of these as truth. If a PR touches one, point out the conflict and that it needs a product answer, unless the PR resolves it with a source.

| Fact | Conflict | Best source |
|---|---|---|
| Playwright Check Suite max runtime | 30 min on most pages vs 60 min in `platform/private-locations/autoscaling.mdx` | 30 min |
| Traceroute thresholds | 3000/5000 in the monitor configuration page vs 10000/20000 in the construct | OpenAPI and CLI: 10000/20000 |
| API check max response time | "hard capped at 30 s" vs OpenAPI max 45000 | 30 s default, up to 45 s per account |
| TCP thresholds | docs 4000/5000 with a 5000 cap vs OpenAPI 3000/45000 | needs product |
| API check `degradedResponseTime` default | 10000 (construct, CLI JSDoc) vs 5000 (OpenAPI) | needs product |
| Runtime release cadence | "every quarter" vs 1–2 per year in history | history |

[facts.json](facts.json) holds 343 defaults and limits from the construct tables (`facts[]`, with `home` file:line) and 6 known mismatches against OpenAPI (`drift_vs_openapi[]`). It was generated from `main` on 2026-11-02; a value changed since then on `main` wins.

**Hedges on limits:** do not ask to remove "by default" or "up to" from a limit without checking the spec. Several limits really are configurable per account.

## Terminology by provenance

- **Organic** (enforce): API check, Playwright Check Suite, Checkly, lowercase status page / alert channel / check group / error group, `/* More options... */`.
- **Casing of check types and features** follows #734 on `main` (749370d0): Browser check, API check, Multistep check, Heartbeat monitor, URL monitor, TCP monitor, Playwright Check Suite; lowercase private location, status page, alert channel. The casing lint (PR #775) enforces this in CI; do not report casing yourself.
- **Ambiguous** (never flag): the CLI vs Checkly CLI, Monitoring as Code vs MaC, OpenTelemetry vs OTel, root cause analysis vs RCA.

## Conventions by directory

| Convention | Where |
|---|---|
| Double quotes in code | `constructs/` (dominant). Single quotes in `cli/`, `guides/`, `learn/`, `detect/`. Match the directory. |
| `<Frame>` around images | Norm in `detect/`, `guides/`, `admin/`. Never used in `integrations/` and `learn/`; do not ask for it there. |
| Fence titles | `cli/`: `Terminal`. `guides/`: filename or `Terminal`. `constructs/`: untitled or `Basic Example`/`Advanced Example`. |
| Callouts | Tip = cross-link, Note = plan/version gating, Warning = risk/deprecation. |

## Page archetypes

| Archetype | Checkable shape |
|---|---|
| Construct reference | Tip, CodeGroup `Basic Example`/`Advanced Example`, `## Configuration`, tables `Parameter \| Type \| Required \| Default \| Description` with ✅/❌; every table row has a matching `<ResponseField>` |
| Alert-channel construct | Tip, one-line purpose, CodeGroup, `fromId()` Note, `<AlertChannelOptionsText/>` |
| CLI command | "Available since CLI vX" Note, intro "The `checkly X` command…", `## Usage`, options table, ends with `## Related Commands` |
| Uptime monitor overview | What are / How … work / results / Troubleshooting |
| API reference | frontmatter only with `openapi:`; hand-written prose is a deviation |
| Every page | `canonical` = `https://www.checklyhq.com/docs/<path>/`; in nav or `hidden: true` |

## GitHub data

- Timestamps from `gh` and the API (`createdAt`, `updatedAt`, `submitted_at`) are UTC. Run directories and `reviewed.tsv` dates are the machine's local time (`date +%Z`). Convert before comparing them or writing "N hours ago".

## Known debt (do not report on untouched lines)

Em dashes (~395), non-sentence-case `##` headings (~532), we/our/us (~1,500), future "will" (~820), "simply/just/easy" (~310), images without Frame where Frame is the norm (~350), blockquote callouts (~130), fences without language (~75).
