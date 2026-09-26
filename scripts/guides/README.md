# Guide tooling

Tooling behind the product screenshots and diagrams in `images/guides/`. How to write a guide: `.claude/skills/guide-authoring/SKILL.md`.

## Screenshots

`screenshots/` captures the Checkly app with Playwright. Scenes in `scenes.ts` point at the resources each `samples/guides/<slug>` project deploys to the Checkly Marketing account.

```bash
npm run guides:screenshots:auth                              # log in once; saves screenshots/.auth/ (gitignored)
npm run guides:screenshots -- --dry-run                      # list scenes
npm run guides:screenshots -- --tags=guide-global-monitoring # capture one guide
```

Captures land in `screenshots/output/images/`. Check each PNG, then copy it to `images/guides/<slug>/`. When a scene comes back empty, the test session aged out: re-record in the sample project and update the `GUIDE_*` IDs.

## Diagrams

`diagrams/<slug>/<image>.mjs` writes `images/guides/<slug>/<image>.png`. `diagrams/lib.mjs` holds the brand tokens, SVG helpers, and the 2x Playwright renderer.

```bash
node scripts/guides/diagrams/global-monitoring/measured-latency.mjs
node scripts/guides/diagrams/alerting/render.mjs   # Slack and email mockups from the HTML files
```

`global-monitoring/dots.json` is the world dot map. Regenerate it with `gen-dots.mjs` after `npm i --no-save d3-geo topojson-client world-atlas`.
