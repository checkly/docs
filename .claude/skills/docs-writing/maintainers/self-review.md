# Docs self-review checklist

Run this against your diff before you finish. Each item comes from a correction the maintainers made more than once.

## Accuracy
- [ ] Every added sentence about behavior, defaults, limits, flags, statuses, or labels has a source I looked at (CLI types, OpenAPI spec, live UI, a real run, previous docs).
- [ ] No invented features, statuses, helpers, categories, or flexibility ("custom schedules", "critical checks", "Degraded" agent status).
- [ ] Construct props are spelled exactly as in the CLI (`sendDegraded`, `multiStepChecks`).
- [ ] API pages exist only for endpoints in the OpenAPI spec, and the `openapi:` method matches.
- [ ] Version and compatibility tables were diffed line by line against their source.
- [ ] Prose matches what the code does.
- [ ] No hedge on a hard limit; no lost nuance (time windows, ranges) from shortening.

## Code
- [ ] `npm run check:snippets` passes.
- [ ] No `...` or `// ...` inside code; shortened blocks use `/* More options... */` and still parse.
- [ ] Complete snippets import everything they use; configs include `projectName` and `logicalId`.
- [ ] Every `highlight={}` range points at the right line after edits.
- [ ] Runnable samples were run: live targets, correct API version, required headers and fields, within runtime limits.
- [ ] No fake-looking IDs or secrets; env-var placeholders instead.
- [ ] Quote and semicolon style matches the rest of the page.
- [ ] Every code block has a language tag and an appropriate title.

## Writing
- [ ] No agent filler: Use cases / Best Practices / Key Benefits / "This command will:" / scenario tabs / restated UI steps.
- [ ] No marketing words, em dashes, parentheticals, or "we" where it is not needed.
- [ ] Terminology matches the table in [editing-rules.md](editing-rules.md#terminology), and one term is used throughout the page, cards, and frontmatter.
- [ ] UI elements bold, labels match the live UI, navigation uses the standard formula.
- [ ] Spell pass done on every touched paragraph; no doubled words.

## Structure
- [ ] The change is the smallest that solves the task; no unrelated formatting, import-order, or title-case churn.
- [ ] Sibling commands, constructs, and sections received the same change.
- [ ] Defaults live in one reference table; other pages link to it with an anchor.
- [ ] No component used where plain headings or a list would do; callout types match their purpose.
- [ ] No table or accordion that duplicates adjacent content.
- [ ] "Above" and "below" references still hold after moves.

## Cross-file
- [ ] New page: in `docs.json`, overview card if applicable, sitemap regenerated.
- [ ] Deleted, moved, or renamed page: redirect added (renames too), inbound links and cards fixed, nav updated, every copy of an emptied group removed, single-page groups flattened.
- [ ] Nav labels: Title Case, no trailing whitespace, overview first.
- [ ] Removed snippet usage: import removed, orphan snippet deleted.
- [ ] Old labels, paths, and terms grepped across all `.mdx`.
- [ ] `npm run check:links`, frontmatter check, redirect-destination check pass.

## Assets
- [ ] Images in `<Frame>`, alt text is a descriptive sentence.
- [ ] No PII, user names, real emails, or other customers' resources in screenshots.
- [ ] Each touched page viewed in `npx mint dev`: renders, lists display correctly, anchors resolve.

## Commit and PR
- [ ] Conventional Commit prefix, outcome-stating subject, ticket reference if there is one.
- [ ] One concern per commit.
- [ ] PR description lists what could not be verified and any change needed in another repo.
