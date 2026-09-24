---
name: guide-authoring
description: Write or rewrite a page in the Guides tab. Use whenever a task touches guides/*.mdx, samples/guides/, or images/guides/. Covers the fixed page template (collapsed agent prompt, then CLI steps), the tested-sample and screenshot pipeline, brand diagram rules, and the verification checklist.
metadata:
  author: checkly docs
  established: 2026-09-23
---

# Guide authoring

A guide is a tutorial that ends with something deployed. It has one job, takes 15 to 30 minutes, and every reader arrives having finished the [quickstart](/quickstart). Anything conceptual that would still be true without Checkly belongs in Learn. Anything that documents one feature belongs in product docs; guides link to it and never restate it.

## Non-negotiables

1. **Skills, MCP, and the CLI lead.** Every guide offers a collapsed prompt the reader can hand to their coding agent with Checkly Skills installed. The manual steps that follow use `npx checkly` for every action. Guides in Resolve and Communicate also show the MCP server doing the reading (results, RCA, incidents). The web app is a place to look, never the place to configure.
2. **Every code block is copied verbatim from a sample that passed on Checkly.** No untested code, no placeholder URLs, no `runtimeId` pins.
3. **Every screenshot is of the guide's own deployed checks.** No stock captures, no skeleton states, no account or user chrome.
4. **Diagrams follow the brand system** (see "Diagrams"). If a diagram is mostly text in boxes, it is page content, not an image.
5. **Under 2,000 words.** Split rather than exceed.

## Page template

Fixed order. Do not add sections; fold extra material into a step or cut it.

1. **Frontmatter**: `title`, `sidebarTitle`, `description`, `canonical`. Nothing else.
2. **Outcome**: one sentence starting "By the end of this guide", then a `<Frame>` with the end-state screenshot.
3. **Sample**: one plain sentence linking the sample under `samples/guides/<slug>/` and what it monitors. No Prerequisites accordion.
4. **Let your agent do it**, collapsed in `<Accordion title="Let your agent do it" icon="sparkles">` right after the sample sentence, with no `##` heading: `import GuideAgentIntro from '/snippets/guide-agent-intro.mdx'` and `import { CopyPromptButton } from '/snippets/copy-prompt-button.jsx'`. Render `<GuideAgentIntro />`, then the prompt inside `<div id="ai-setup-prompt">` as a ` ```txt ` block, then `<CopyPromptButton />`, then one sentence: the steps below are what the agent does, in the open. The prompt states the goal, the success criteria, and that the agent must run `npx checkly test --record` and stop for confirmation before `npx checkly deploy`. The prompt carries the gist of the guide and nothing about skills. The snippet links to [Checkly Skills](/ai/skills); never add install or `npx checkly skills` instructions to the page. `npx checkly init` in the quickstart already installs the skill, so every reader has it.
5. **Steps**, three to five `##` headings, each "do this, code block, what you see". Code fences carry the filename. CLI steps show real captured output in a ` ```text Terminal ` fence. Where the app changes, a `<Frame>` screenshot. Browser monitoring shows Playwright Check Suites and Browser Checks as equal paths in a `<CodeGroup>`.
6. **Verify it works**: force a failure or run `npx checkly trigger`, show the result. In Resolve and Communicate guides, also show the same check through the MCP server with a ` ```text Prompt ` example.
7. **Next**: one link to the guide that follows this one in the sidebar order, with a sentence on why.
8. **Reference**: bullet list of the product pages touched. Link [Checkly Skills](/ai/skills) once; add the MCP tools page when MCP appears. No `npx checkly skills` instructions anywhere on the page.

Voice: second person, plain sentences, no em dashes, no parentheticals. Tips and Notes sparingly, one each at most per step.

## Sample pipeline

- `samples/guides/<slug>/` is a self-contained project: `package.json` with `checkly` and `@playwright/test` as devDependencies, `checkly.config.ts` with `projectName: 'Docs guide: <title>'` and `logicalId: 'docs-guide-<slug>'`, and the check files. Never under `__checks__` at the repo root; the root `checkly.config.ts` ignores `samples/**` for this reason.
- Demo targets: the Danube shop at `https://danube-web.shop` (hosted in `us-east-1`, API at `/api/books`) and `httpbin.org`. Checkout on Danube needs the "Company (optional)" field filled.
- From the sample folder, with the repo `.env` sourced: `npx checkly test --record --test-session-name "Docs guide: <title>"`, then `npx checkly deploy --force`. Both deploy to the Checkly Marketing account. Keep `.captures/` (gitignored) with the raw terminal output you paste into the guide.
- `checkly test --grep` matches the check **name**, not the logical ID.
- Playwright Check Suites bundle from the directory of `playwright.config.ts` using the nearest `package.json`.

## Screenshot pipeline

Uses the marketing site harness at `checkly-marketing-website/scripts/screenshots` (skill `screenshot-harness` there).

1. Add scenes tagged `guide-<slug>` to `scenes.ts`; keep IDs in a `GUIDE_<NAME>` const. Test-session and result IDs age out of retention; re-record and update when a capture comes back empty.
2. `npm run screenshots:capture -- --tags=guide-<slug> --account=5d536cc1-f076-446e-a142-21e48dd31986 --scale=2`. Light theme only.
3. Clip to the app content: `clip: { x: 240, y: 58, width: 1200, height: <n> }` drops the sidebar and top bar, which carry the account and user name. Use a tall viewport instead of `fullPage` on scrolling panes.
4. Open every PNG before use. Reject skeleton states, empty states, and any user name, email, or other customers' resources. The Projects page shows other people's repositories; never capture it.
5. Copy to `images/guides/<slug>/<step>.png`. Embed in `<Frame><img src alt /></Frame>` with alt text describing the state.

Known routes: check detail `/checks/<id>`, group `/groups/<id>`, test session `/test-sessions/<id>`, home list search `/?search=<text>`. Expanding group rows on the home list by click does not work; capture the group page.

If the saved session has expired the capture lands on a login page. Ask Dan to run `npm run screenshots:auth` in the marketing repo; it cannot be done non-interactively.

## Diagrams

Only draw what has a spatial or quantitative idea: maps, timelines, bars, coverage spans. Three text cards in a grid is page content, written as bold-led paragraphs or a list.

- Card: deep-blue gradient `#041734` to `#0A2A55`, corner radius 20, border `rgba(120,150,185,0.34)`. Title Inter 24 weight 500 letter-spacing -0.04em, subtitle `#A7B8CB`, one blue callout footer for the takeaway.
- Colors: green `#20DF66`, yellow `#FFBD00`, red `#FF5C5C`, brand blue `#0075FF`. Region IDs in JetBrains Mono.
- World maps: dot matrix from Natural Earth land polygons (world-atlas plus d3-geo), equirectangular, latitude 72 to -58, dots `rgba(139,163,199,0.30)`.
- Ship PNG at 2x rendered with Playwright and Google Fonts Inter. An SVG in an `img` tag cannot use the page's web font.
- Generators live in the worktree's `.context/<slug>-images/` (gitignored): `lib.mjs`, one `build-*.mjs` per image, `render.mjs`.
- Real data beats illustration. Pull per-location results from `GET /v1/check-results/<checkId>` and chart the medians.

## Verification before commit

- `npx checkly test` passes from the sample; `npx checkly deploy --force` done; root `npx checkly deploy --preview` still lists only the docs-site resources.
- `./node_modules/.bin/mint broken-links` clean. Move `.context/attachments` aside first; the Conductor comment files there break the MDX parser. Do not start `mint dev` or open a browser to eyeball pages; the link check and reading the MDX are enough.
- `wc -w` under 2,000.
- A cold read from the quickstart completes the guide without opening another guide first.

## PR conventions

One PR per guide, or a series on one branch. Each commit: the MDX, its sample, its images, its redirects, its overview card, and repointed inbound links. A retired page gets a `docs.json` redirect and every inbound link repointed in the same commit. Update the PR body with `gh api -X PATCH repos/checkly/docs/pulls/<n>`; `gh pr edit` fails on this repo. Leave the marketing repo's `scenes.ts` change for Dan to commit.

## Decisions on record

- Browser Checks and Playwright Check Suites are shown equally, not Check Suites by default.
- "Run checks on every deploy" is its own guide, not a section.
- Terraform e-commerce content becomes a section of the checkout guide; keyword monitoring likewise.
- Light theme screenshots only, clean crops, no drawn annotations.
- Samples and screenshots live in the Checkly Marketing account.
