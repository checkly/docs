# Style quick reference

`AGENTS.md` has the repo rules (frontmatter, components, snippet markers). This file adds what a
writer gets wrong most often. When `AGENTS.md` and this file disagree, `AGENTS.md` wins.

## Voice

- Second person, present tense, active voice: "Checkly retries the check", not "The check will be
  retried".
- Short sentences, one idea each. Plain words over jargon. Define a term the first time you use it.
- Say what happens, not how good it is. No "simply", "just", "easily", "seamlessly", "powerful",
  "robust", "comprehensive", "effortless".
- No filler openings or closings: "This guide will help you", "In this section we will",
  "Let's dive in", "In conclusion", "Happy monitoring". Start with the fact.
- No hedging you cannot back: "should work", "typically", "in most cases". State the condition
  instead: "If the check runs from a private location, ...".
- Numbers with units and their source: "up to 50", "default 30 seconds". No "a few", "many".

## Casing and terms

Until `AGENTS.md` carries a casing section, use these rules for every line you add or change:

- Headings, frontmatter `title` and `sidebarTitle`, and component `title="..."` props use sentence
  case. Product names, acronyms and other proper names keep their capitals.
- Check and monitor types capitalize the type word only: Browser check, API check, Multistep check,
  URL monitor, Heartbeat monitor. "Playwright Check Suite" and "Monitoring as Code" are product
  names and keep their capitals.
- A single instance of a feature is lowercase: "a status page", "each private location", "the
  alert channel".
- Third-party names use their official casing: GitHub, Node.js, OpenTelemetry, Opsgenie, PagerDuty.
- Use the term the web app shows. If the UI, the API and the CLI use different words for the same
  thing, use the UI word in prose, the code name in code format, and say once that they are the
  same. Ask before introducing a new product term.

## Structure

- One page, one job. Front-load the answer: the first paragraph says what the reader gets.
- Headings name what the reader does or learns. No "Overview" heading under the title, no
  "Introduction", no "Step N:" prefixes.
- Lists for parallel items, numbered lists for sequences, tables for options with several
  attributes. No more than one callout (`<Note>`, `<Tip>`, `<Warning>`) per section.
- Prefer a sentence with a link over repeating another page. Link text names the target
  ("see [Alert channels](/communicate/alerts/channels)"), never "here" or "this page".

## Code and UI

- Every code fence has a language and, for files, a filename: ` ```ts checkly.config.ts `.
  Terminal output goes in ` ```text Terminal `.
- UI labels in bold, exactly as shown, and paths with `>`: **Settings** > **Alerting**.
- Identifiers in code format: constructs, properties, flags, environment variables, file names,
  API paths.
- Placeholders in angle brackets and explained once: `<your-api-key>`. No `foo`, `bar`,
  `example.com` endpoints that would not run.

## Public repository

The docs repo and its PRs are public. Never write customer names, internal hostnames or URLs,
internal ticket text, Slack quotes, unreleased features, pricing not on the pricing page, or code
copied from private repositories.
