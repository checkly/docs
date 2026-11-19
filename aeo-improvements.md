# AEO/GEO improvement plan

Audit date: September 2, 2026 (America/New_York)

## Executive summary

Checkly Docs has a strong technical base for search and answer engines: canonical URLs, one primary H1 on sampled pages, semantic HTML, Article/TechArticle and Breadcrumb structured data, a public sitemap, permissive robots rules, Markdown versions of pages, `llms.txt`, `llms-full.txt`, an MCP discovery header, and an on-site AI assistant. Internal links also pass the local Mintlify broken-link check.

The primary constraint is not a missing “GEO hack.” It is discoverable coverage and authority distribution. Ahrefs estimates that `/docs/` receives about 5.9K monthly organic visits from 235 ranking keywords, but 87.8% of that traffic is attributed to one article, “What is Playwright?”. Only 69 documentation pages appear in Ahrefs' Top pages report. Meanwhile, 38 content pages are absent from navigation and therefore excluded from Mintlify's sitemap, internal search, assistant context, and default indexing. Several of those hidden pages are commercially or technically valuable, including comparison overviews, agentic checks, and API/browser check best-practice pages.

The recommended strategy is:

1. Restore intentional indexation and internal-link equity to valuable hidden pages.
2. Refresh and restructure the highest-opportunity topic clusters around synthetic monitoring, Playwright monitoring, API monitoring, monitoring as code, uptime protocols, and incident response.
3. Make important pages easier to quote accurately by putting a concise answer, prerequisites, verified examples, limitations, and decision guidance near the top.
4. Build authority with original Checkly data, benchmarks, and engineering experience rather than generic definition content.
5. Measure Google generative visibility, AI citations, assisted conversions, and page-level traffic as separate outcomes.

## What AEO/GEO means for this plan

This plan separates three related outcomes:

- **Search and answer-engine visibility:** earning inclusion and citations in Google AI Overviews/AI Mode, ChatGPT search, Perplexity, and similar systems.
- **Agent usability:** making accurate product information easy for coding agents to retrieve through Markdown, `llms.txt`, skills, and MCP.
- **On-site answer quality:** helping users get a correct answer from Checkly's own search and assistant.

Google's current guidance says that its generative search features rely on the core search index and ranking systems. It recommends crawlable, useful, original content and says special AI files, artificial “chunking,” or rewriting solely for AI are unnecessary. Google explicitly says it does not use `llms.txt` for Search. Therefore, `llms.txt` should be maintained for direct agent workflows, not treated as a ranking lever. See [Google's generative AI optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) and [OpenAI's publisher guidance](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq).

## Audit scope and evidence

The audit covered:

- 669 current MDX pages in the repository, excluding `api-reference-old`, snippets, and agent-skill source files.
- 443 editorial/product documentation pages after excluding generated API reference pages.
- `docs.json`, the checked-in sitemap, navigation, page frontmatter, internal links, and AI-related documentation.
- Live rendering and metadata on the documentation homepage and the highest-traffic Playwright page.
- Live `robots.txt`, `/docs/llms.txt`, `/docs/llms-full.txt`, Markdown endpoints, response headers, and `/docs-sitemap.xml`.
- Ahrefs Site Explorer reports for Checkly Docs and four comparison sites.
- Public search results and representative documentation from Grafana, Datadog, and New Relic.
- Local `mint broken-links` and `mint a11y` checks.

Ahrefs figures are third-party estimates, not analytics or Search Console truth. They are best used directionally. The reports were read with “All locations” and monthly volume on September 2, 2026 ET (September 3 UTC in Ahrefs).

## Current performance benchmark

| Documentation scope | Organic keywords | Top 3 keywords | Organic traffic | Referring domains | AI responses | AI-cited pages |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Checkly `/docs/` | 235 | 114 | 5.9K | 795 | 339 | 48 |
| Grafana `/docs/` | 1.9K | 1.1K | 47.9K | 13.2K | 2.5K | 875 |
| Datadog Docs | 3.4K | 1.5K | 50.8K | 7.3K | 1.8K | 1K |
| New Relic Docs | 1.6K | 754 | 10.6K | 4.1K | 632 | 467 |
| Playwright `/docs/` | 774 | 558 | 31.9K | 6.6K | 528 | 91 |

Checkly should not try to match the raw page count of broader observability platforms. The useful benchmark is whether Checkly can own the smaller set of topics where it has differentiated expertise: Playwright-native synthetic monitoring, monitoring as code, API and browser reliability, and developer-led incident workflows.

### Traffic concentration

Ahrefs' top pages estimate attributes approximately 5,176 monthly visits to `learn/playwright/what-is-playwright`, or 87.8% of the documentation's organic traffic. The next pages are estimated at 118 visits for the synthetic monitoring definition and 105 for the API monitoring definition. This creates material downside risk and shows that authority is not flowing broadly through the site.

The highest-traffic page also targets Playwright generally, where the official Playwright documentation has much stronger domain-specific authority. Checkly should preserve this page, but use it as the entry point into a differentiated Playwright-in-production cluster rather than relying on generic Playwright traffic alone.

## What is already strong

### Crawlability and machine-readable access

- Live `robots.txt` returns `200`, allows all user agents, and references the main and docs sitemaps. This permits `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, and `PerplexityBot` through the catch-all rule.
- `/docs/llms.txt` and `/docs/llms-full.txt` both return `200` as plain text.
- HTML responses advertise `llms.txt`, `llms-full.txt`, the API catalog, MCP server card, agent card, and agent-skills index with HTTP `Link` headers.
- Page URLs support `.md` responses with `text/markdown`; those Markdown endpoints correctly return `X-Robots-Tag: noindex, nofollow`, reducing duplicate-index risk.
- The root `llms.txt` is curated around Checkly's platform, differentiators, products, docs, AI resources, and key guides.

### Page semantics and structured data

- The sampled homepage has a single H1, an English language declaration, a canonical URL, and WebSite JSON-LD.
- The sampled Playwright article has a single H1 plus WebPage, BreadcrumbList, Article, and TechArticle JSON-LD with a `dateModified` value.
- Mintlify provides semantic HTML, canonical generation, Open Graph metadata, a sitemap, and mobile support. See [Mintlify's SEO reference](https://www.mintlify.com/docs/optimize/seo).

### Existing AI-native product surfaces

- The contextual menu supports copying, Markdown view, ChatGPT, Claude, and Perplexity.
- Checkly publishes agent skills and an MCP server.
- The on-site “Ask Assistant” surface is available globally.

These are meaningful product advantages. They should be measured as agent usability and activation features, not presented as proof that external answer engines will rank the site.

## Priority findings and recommendations

### 1. Valuable pages are unintentionally hidden from every discovery surface

The repository contains 669 current MDX pages, while `docs.json` references 630 and the live docs sitemap contains 631 URLs. Excluding the homepage, 38 pages are outside navigation. Mintlify excludes hidden pages from search-engine sitemaps, internal search, AI assistant context, and MCP search unless indexing is explicitly enabled.

Examples of likely high-value hidden pages include:

- `comparisons/monitoring-tools/overview.mdx`
- `comparisons/observability-tools/overview.mdx`
- `comparisons/status-pages/overview.mdx`
- `detect/synthetic-monitoring/agentic-checks/overview.mdx`
- `detect/synthetic-monitoring/api-checks/best-practices.mdx`
- `detect/synthetic-monitoring/api-checks/examples.mdx`
- `detect/synthetic-monitoring/browser-checks/best-practices.mdx`
- `detect/synthetic-monitoring/browser-checks/examples.mdx`
- `detect/uptime-monitoring/heartbeat-monitors/configuration.mdx`

Do not enable `"indexing": "all"` blindly. Review each hidden page and choose one of three outcomes: add it to navigation, mark its parent group or tab searchable, or deliberately keep it excluded/noindexed because it is obsolete, duplicative, or incomplete. See [Mintlify's hidden-page behavior](https://mintlify.com/docs/guides/hidden-pages).

### 2. Search and AI visibility is too dependent on generic Playwright content

The “What is Playwright?” page is a valuable acquisition asset, but it sits closer to the official Playwright site's core expertise than Checkly's. It should funnel authority into a coherent cluster that answers the next questions a production engineering team asks:

- How do Playwright tests become production monitors?
- Which tests should run in CI, production, or both?
- How do retries, timeouts, locations, secrets, and alerts change in production?
- When should a team use a Browser Check versus a Playwright Check Suite?
- How should teams debug a production failure using traces and screenshots?

Add a short “Playwright testing vs. Playwright monitoring” decision section and descriptive internal links from the high-traffic article. Consolidate overlapping pages before creating new ones.

### 3. Definition pages are credible but not yet the best quotable sources

The synthetic monitoring page opens with a clear definition, but it competes with MDN, IBM, TechTarget, Elastic, Grafana, Datadog, and New Relic. Public search results for “what is synthetic monitoring” currently favor those domains. Checkly will not win consistently by restating the same definition.

Upgrade definition pages with evidence that only Checkly can supply:
w
- An explicit 40–60 word answer immediately after the title.
- A “synthetic monitoring vs. RUM vs. uptime monitoring” decision table.
- A diagram of a synthetic check from scheduler to location, assertions, retries, alert, trace, and incident.
- Original, dated data from anonymized Checkly runs: failure categories, regional variance, retry outcomes, or MTTD patterns.
- Clear limitations and anti-patterns, not only benefits.
- A short, tested example that connects the concept to a working implementation.
- A named technical reviewer and visible last-reviewed date.

Original evidence is the largest opportunity to earn citations. Google's guidance explicitly favors useful, non-commodity content with first-hand expertise over summaries that anyone could publish.

### 4. Metadata quality is inconsistent across editorial pages

Repository checks found:

- 14 editorial MDX files without `sidebarTitle`, including the root homepage where the omission may be intentional.
- 4 editorial pages without `description`.
- 33 descriptions longer than 160 characters. The initial lightweight scan reported 29 because it did not expand four folded YAML values.
- 89 descriptions shorter than 60 characters. The initial lightweight scan reported 96 because it treated seven folded YAML descriptions as two-character values.
- 69 of 102 explicitly dated editorial pages have a date before 2025.
- 19 pages use absolute Checkly Docs URLs for internal links instead of relative links.
- 15 pages mention prerequisites but do not use the repository's required “Prerequisites” or “Before you begin” Accordion pattern.

The four missing descriptions are the API-check snippets page, browser-check snippets page, Handlebars snippets page, and snippets overview. Descriptions feed both conventional metadata and Mintlify's generated `llms.txt`, so omissions reduce clarity for search, the assistant, and direct agent discovery.

Add a CI lint that requires `title`, `sidebarTitle`, and `description` on editorial MDX and enforces a useful description range. Treat 120–160 characters as a practical editorial target, not a ranking rule. The description should state what the user can accomplish and name the relevant Checkly concept.

### 5. Freshness and trust signals are underused

The live TechArticle schema includes `dateModified`, but the page does not visibly show it and the schema does not include the named author present in frontmatter. The repository also contains a large Playwright learning cluster originally dated 2020–2024. Some pages have been modified recently, but users and answer engines cannot easily distinguish reviewed content from legacy content.

Enable Mintlify's global `metadata.timestamp` setting, then establish a review policy for high-risk and high-traffic pages. For conceptual and comparative content, display a named author or technical reviewer where supported. Validate whether Mintlify can map that identity into Article schema before adding custom JSON-LD; avoid two conflicting Article graphs. See [Mintlify's timestamp setting](https://mintlify.com/docs/organize/settings-structure).

### 6. The AI index is functional but too large and partly inconsistent

`/docs/llms.txt` is approximately 20 KB and contains 107 direct Markdown links plus an aggregated “Docs (203 pages)” bundle. `/docs/llms-full.txt` is approximately 3.15 MB and 67,872 lines. That full file is technically available but too large for convenient use in many model context windows.

The page `ai/llms-txt.mdx` also says the root `https://www.checklyhq.com/llms.txt` lists every documentation page. The live root file is instead a curated corporate index that points readers to `/docs/llms.txt`. Correct this explanation and document both files accurately.

Retain the comprehensive file, but make scoped indexes first-class:

- Product docs
- Constructs/CLI
- API reference
- Playwright monitoring
- Uptime monitoring
- Incident response and traces

Mintlify already emits at least one scoped aggregate (`/docs/_llms/docs.md`). Test every scope for size, content completeness, and resolvable links. Do not claim that this changes Google rankings; it improves direct agent retrieval. See [Mintlify's `llms.txt` behavior](https://www.mintlify.com/docs/ai/llmstxt).

### 7. Answer structure is inconsistent across the corpus

Only 56 of 443 editorial pages use a question-form H2/H3, and 22 contain an FAQ or accordion pattern. The solution is not to mass-produce FAQs. Google [removed the FAQ rich-result feature in 2026](https://developers.google.com/search/updates#june-2026), and its current AI guidance says no special schema is needed for generative results.

Instead, use an answer-first template on priority pages:

1. One-sentence outcome or definition.
2. When to use it and when not to use it.
3. Prerequisites in the required “Prerequisites” or “Before you begin” Accordion.
4. Minimal tested example.
5. Explanation of important choices and failure modes.
6. Verification step and expected result.
7. Related tasks with descriptive anchor text.

Question headings should reflect real user questions only where they improve scanning. Avoid creating multiple near-duplicate pages for long-tail variants.

### 8. Comparisons and decision content are present but poorly discoverable

The repository has comparison pages and overview files, but several comparison overviews are hidden. This weakens consideration-stage coverage for queries such as:

- Playwright monitoring vs. browser testing
- Synthetic monitoring vs. real user monitoring
- Uptime monitoring vs. synthetic monitoring
- Browser Check vs. Playwright Check Suite
- Checkly vs. Datadog Synthetics/Grafana Synthetic Monitoring/New Relic Synthetics

Comparison content must be factual, dated, and sourced. Include explicit evaluation criteria, who each option is for, limitations, and links to vendors' primary documentation. Avoid unsupported “best” claims. Refresh on a fixed cadence and add `noindex` if a page cannot be maintained.

### 9. Accessibility issues weaken machine and human readability

`mint a11y` reports failing color contrast for the configured primary color on light backgrounds and dark color on dark backgrounds. It also reports four videos without alt attributes across two browser-check pages. These are primarily accessibility issues, but better semantics also make documents easier for browser agents to navigate.

Resolve the reported issues and add `mint a11y` to CI. The headless-detection script only disables Segment analytics; it does not hide content and is not currently an indexing blocker.

### 10. Measurement must connect citations to product outcomes

Use a weekly scorecard with separate layers:

| Layer | Primary metrics | Source |
| --- | --- | --- |
| Crawl/index health | Indexed URLs, sitemap coverage, crawl errors, canonical conflicts | Google Search Console, Bing Webmaster Tools |
| Search visibility | Non-brand clicks, impressions, top-3/top-10 keywords, page distribution | Search Console, Ahrefs |
| Generative visibility | Google generative impressions/clicks, AI responses, cited pages, citation share by topic | Search Console generative report, Ahrefs Brand Radar |
| Agent usability | `llms.txt` fetches, Markdown requests, MCP calls, skill installs, failed retrievals | CDN/server logs, MCP telemetry |
| User success | Assistant unanswered queries, source-less answers, helpfulness, docs-to-signup and docs-to-dashboard conversion | Mintlify assistant export, product analytics |

Google recommends Search Console as the first-party source of truth and now exposes dedicated generative AI performance reporting. Third-party AI visibility tools should be treated as directional.

## Topic and content opportunity map

Search the repository before creating any page. In most cases below, refresh or consolidate existing content and strengthen its internal links.

| Topic/question | Intent | Current opportunity | Recommended action | Priority |
| --- | --- | --- | --- | --- |
| What is synthetic monitoring? | Informational | Existing page ranks but trails larger reference sites | Add original data, comparison table, limitations, diagram, and implementation bridge | High |
| Synthetic monitoring vs. RUM | Informational/commercial | Content exists across multiple pages | Create one canonical decision section/page and link both concept clusters to it | High |
| Uptime vs. synthetic monitoring | Commercial | No exact phrase found in editorial MDX | Add a decision page or section after checking overlap with current comparison content | High |
| Playwright tests vs. Playwright monitoring | Commercial | Existing comparison and product pages | Consolidate around a canonical decision page and link from the top traffic article | High |
| Run Playwright tests in production | Transactional | Strong Checkly differentiation | Expand the tested start-to-finish guide with CI and production variants | High |
| API monitoring best practices | Informational/commercial | Existing best-practices page is hidden | Review, expose, refresh, and connect to API quickstart and monitoring definition | High |
| Browser monitoring best practices | Informational/commercial | Existing best-practices page is hidden | Review, expose, refresh, and add production failure modes | High |
| Monitoring as code examples | Informational/transactional | Broad coverage but fragmented | Build a canonical hub linking CLI, Terraform, Pulumi, and reusable examples | High |
| Browser Check vs. Playwright Check Suite | Commercial | Product choice is easy to confuse | Add a concise criteria table to both relevant overview pages | High |
| Playwright timeouts and flaky tests | Informational | Existing pages have organic traction | Refresh examples against current Playwright and link to production monitoring behavior | Medium |
| Heartbeat/cron job monitoring | Informational/transactional | Several configuration pages are hidden | Consolidate navigation and add a complete verified example | Medium |
| gRPC monitoring | Informational/transactional | Product pages exist, but exact topic phrase is absent | Rewrite metadata and intro around user vocabulary; add tested example | Medium |
| DNS, TCP, SSL, and ICMP monitoring | Informational | Good product coverage, weak cluster-level framing | Add an “which uptime monitor?” decision table and hub links | Medium |
| Private-location synthetic monitoring | Commercial/transactional | Existing cluster is deep | Add architecture, security model, scaling guidance, and decision summary | Medium |
| MTTD, MTTR, SLO, SLI, and SLA | Informational | Existing learning pages have modest traffic | Add calculators/examples and connect concepts to actionable Checkly workflows | Medium |
| Agentic monitoring and agent reliability | Emerging/commercial | Existing pages are hidden | Validate terminology and product maturity, then expose one authoritative hub | Medium |

## Editorial acceptance criteria

A priority page is complete when it:

- Has unique `title`, `sidebarTitle`, and outcome-focused `description` frontmatter.
- Has one H1 and a concise direct answer in the first visible paragraph.
- States prerequisites in the required Accordion when the page is procedural.
- Includes a tested basic example and, where useful, an advanced example.
- Explains limitations, failure modes, or when not to use the approach.
- Uses descriptive relative internal links and links to a parent hub and next task.
- Uses original evidence or primary sources for claims that may be contested or change.
- Has a visible reviewed/modified date and an accountable reviewer.
- Is intentionally indexed or intentionally excluded.
- Has valid structured data, no broken links, and no accessibility errors.

## AEO-001 hidden-page disposition

Classification date: September 2, 2026

The 38 pages below are the editorial MDX files that are neither the root homepage nor referenced by `docs.json`. Reusable files in `/snippets`, generated API reference pages, and legacy API reference pages are not part of this inventory.

The classifications use three publishing outcomes:

- **Add to navigation:** The page addresses a user task that belongs in the information architecture. Add it only after completing the stated content or accuracy gate.
- **Make searchable:** Keep the page out of the sidebar, but place it in a hidden `docs.json` group with `searchable: true` so it is included in site search, the sitemap, AI context, MCP results, and `llms.txt`.
- **Keep hidden/noindex:** Keep the page out of navigation and add or retain `hidden: true`. Do not use global `seo.indexing: "all"`, because it would also expose legacy and incomplete pages.

This is the classification record, not approval to publish unreviewed content. Pages classified “Add to navigation” remain excluded until their gate is complete; this avoids indexing inaccurate examples or thin pages merely to increase page count.

| Page | Disposition | Publishing gate or rationale |
| --- | --- | --- |
| `changelog/changelog.mdx` | Make searchable | It is already linked from the global navbar and is useful as a standalone release-note directory, but it does not need a sidebar entry. |
| `communicate/alerts/best-practices.mdx` | Add to navigation | Review product-specific escalation and retry claims, then add it to the Alerts group. |
| `comparisons/monitoring-tools/overview.mdx` | Keep hidden/noindex | It is a 137-word “coming soon” list with no actual comparisons. Publish only when sourced, maintained comparison content exists. |
| `comparisons/observability-tools/overview.mdx` | Keep hidden/noindex | It is a 135-word “coming soon” list with no actual comparisons. Publish only when sourced, maintained comparison content exists. |
| `comparisons/overview.mdx` | Keep hidden/noindex | It is a placeholder with an unrelated description and one sentence of body copy. Replace it before publishing. |
| `comparisons/status-pages/overview.mdx` | Keep hidden/noindex | It is a 145-word “coming soon” list with no actual comparisons. Publish only when sourced, maintained comparison content exists. |
| `comparisons/testing-tools/overview.mdx` | Keep hidden/noindex | It is a 139-word “coming soon” list. The existing framework comparison pages already provide the useful coverage. |
| `concepts/monitors.mdx` | Keep hidden/noindex | It says Checkly offers three monitor types, which no longer matches the current DNS, ICMP, traceroute, gRPC, and SSL navigation. Rewrite before reconsidering. |
| `concepts/overview.mdx` | Keep hidden/noindex | It is primarily an unsourced, forward-looking explanation of Groups rather than a reliable overview of Checkly's core concepts. |
| `constructs/agentic-check.mdx` | Keep hidden/noindex | Retain the existing `hidden: true`; Agentic Checks V1 was deliberately de-surfaced as a legacy capability in August 2026. |
| `detect/synthetic-monitoring/agentic-checks/configuration.mdx` | Keep hidden/noindex | Retain the existing `hidden: true`; this is configuration for the deliberately de-surfaced Agentic Checks V1 capability. |
| `detect/synthetic-monitoring/agentic-checks/overview.mdx` | Keep hidden/noindex | Retain the existing `hidden: true`; this is the overview for the deliberately de-surfaced Agentic Checks V1 capability. |
| `detect/synthetic-monitoring/api-checks/best-practices.mdx` | Add to navigation | Complete the technical and duplication review in AEO-009, then add it to the API Checks group. |
| `detect/synthetic-monitoring/api-checks/examples.mdx` | Add to navigation | Test the examples and consolidate overlap in AEO-009, then add it to the API Checks group. |
| `detect/synthetic-monitoring/api-checks/response-limits.mdx` | Add to navigation | It is already linked from four pages and documents a distinct setting. Verify the current thresholds, then add it to API Checks near Configuration. |
| `detect/synthetic-monitoring/browser-checks/best-practices.mdx` | Add to navigation | Complete the Playwright and Checkly accuracy review in AEO-010, then add it to Browser Checks. |
| `detect/synthetic-monitoring/browser-checks/examples.mdx` | Add to navigation | Replace generic scenarios with tested Checkly examples in AEO-010, then add it to Browser Checks. |
| `detect/synthetic-monitoring/browser-checks/file-system.mdx` | Add to navigation | Validate the runtime file-system constraints and examples, then add it near Browser Check structure and troubleshooting pages. |
| `detect/synthetic-monitoring/multistep-checks/troubleshooting.mdx` | Add to navigation | Expand the thin symptom list with verified diagnosis steps, then add it to Multistep Checks. |
| `detect/uptime-monitoring/alerting.mdx` | Add to navigation | Verify that alert conditions and integrations apply consistently to every current monitor type, then add it to Uptime Monitoring. |
| `detect/uptime-monitoring/cli-configuration.mdx` | Add to navigation | Test the CLI examples and remove overlap with construct reference pages, then add it as the uptime Monitoring as Code guide. |
| `detect/uptime-monitoring/heartbeat-monitors/ci-cd-configuration.mdx` | Add to navigation | Test each pipeline example and consolidate the heartbeat configuration set before adding it. |
| `detect/uptime-monitoring/heartbeat-monitors/cli-configuration.mdx` | Add to navigation | Test both language variants and reconcile them with the Heartbeat construct before adding it. |
| `detect/uptime-monitoring/heartbeat-monitors/configuration.mdx` | Keep hidden/noindex | At 113 words, it does not provide enough information beyond the current overview, quickstart, and examples. Merge useful details instead of indexing it. |
| `detect/uptime-monitoring/heartbeat-monitors/cron-configuration.mdx` | Add to navigation | Test the Linux and Windows examples, then consolidate them into a discoverable heartbeat automation section. |
| `detect/uptime-monitoring/heartbeat-monitors/iac-configuration.mdx` | Add to navigation | Validate whether every named IaC method is supported and link to canonical provider guidance before adding it. |
| `detect/uptime-monitoring/heartbeat-monitors/other.mdx` | Add to navigation | Split or tighten the broad platform examples, verify each one, and give the page a descriptive title before adding it. |
| `detect/uptime-monitoring/locations.mdx` | Add to navigation | Replace the embedded location inventory with an evergreen source or generated list, verify strategy claims, then add it to Uptime Monitoring. |
| `detect/uptime-monitoring/scheduling.mdx` | Add to navigation | Verify supported frequencies and scheduling behavior for all monitor types, then add it to Uptime Monitoring. |
| `detect/uptime-monitoring/tcp-monitors/use-cases.mdx` | Keep hidden/noindex | Retain the existing `hidden: true`; it was deliberately removed from navigation in September 2025 and its service-specific claims require owner review before reversal. |
| `integrations/alerts/overview.mdx` | Keep hidden/noindex | It is a one-sentence placeholder. The existing Alerts & Notifications navigation group already serves as the directory. |
| `integrations/iac/pulumi/examples.mdx` | Add to navigation | Test examples against the current provider, remove overlap with Setup, then add it to the Pulumi group. |
| `integrations/iac/terraform/checks-groups.mdx` | Add to navigation | Validate resources against the current provider and separate or consolidate the broad reference content before adding it. |
| `integrations/iac/terraform/parameterized-resources.mdx` | Add to navigation | Test the file-based parameterization example, then add it to the Terraform group near snippets and variables. |
| `learn/overview.mdx` | Add to navigation | It is already linked from the docs homepage. Add it as the first page in the Learn tab so that navigation, search, and sitemap behavior agree. |
| `platform/snippets/handlebars-snippets.mdx` | Keep hidden/noindex | It documents a legacy syntax, lacks required metadata, uses old component patterns, and should only be reachable from a reviewed legacy note. |
| `platform/snippets/overview.mdx` | Add to navigation | Add the required description, test and modernize the examples, then add a Snippets group or merge it into the existing API and Browser snippets pages. |
| `resolve/traces/export/to-chronosphere.mdx` | Add to navigation | Verify the Chronosphere endpoint and authentication instructions against primary documentation, then add it beside the other trace exporters. |

### AEO-001 implementation sequence

1. Add `hidden: true` to the ten “Keep hidden/noindex” pages that do not already declare it. The three Agentic Checks pages and TCP use-cases page already do.
2. Add the changelog to a hidden, searchable navigation group and verify that it appears in the generated sitemap, site search, assistant context, MCP results, and `llms.txt` without adding a sidebar item.
3. Work through the 23 navigation candidates by cluster. The API and Browser pages belong to AEO-009 and AEO-010; the remaining pages require the page-specific gates above.
4. After each cluster ships, rerun the hidden-page inventory and `mint broken-links`, then inspect the generated sitemap and `llms.txt`. The target is zero unclassified editorial pages, not zero hidden pages.

## AEO-002 metadata remediation

Completion date: September 2, 2026

The YAML-aware remediation covered all 443 editorial pages and made the following changes:

- Added all 14 missing `sidebarTitle` values. The root homepage uses `Documentation Home`; the other values are concise versions of their page titles.
- Added descriptions to the four snippets pages that lacked them. Each description distinguishes UI-managed reusable snippets from local imports in CLI-managed checks where relevant.
- Rewrote all 33 descriptions over 160 characters, including the four folded YAML values missed by the initial scan. The replacements identify the page outcome without generic introductions or repeated sentences.
- Reviewed all 89 descriptions under 60 characters. Rewrote 38 vague or incomplete descriptions on product, guide, concept, and learning pages. Retained 44 concise command, construct, exporter, instrumentation, and changelog descriptions because they already name the exact task or reference subject. Retained seven short descriptions on pages classified as hidden/noindex in AEO-001; those pages require replacement or product review before publication, so metadata expansion would not improve a discovery surface.

## AEO-003 repository linting

- Added `.github/scripts/check_content_quality.py` to detect missing editorial metadata, descriptions over 160 characters, duplicate titles and descriptions, source-level H1 headings, absolute internal documentation links, code fences without language tags, and pages without an explicit indexation decision.
- Captured 159 existing violations in `.github/content-quality-baseline.json`. CI accepts those exact violations but fails when a new or changed violation appears; resolved entries can be pruned with `npm run lint:docs:baseline`.
- Added `npm run lint:docs` for the frontmatter, content-quality, broken-link, and accessibility checks.
- Added the content-quality gate and `mint a11y` to the existing static-docs workflow. The accessibility scan currently reports the known color contrast and four video-alt issues tracked by AEO-014.

Post-change validation reports zero missing `sidebarTitle` values, zero missing descriptions, and zero descriptions over 160 characters in the editorial corpus. Description length is an editorial diagnostic, not a ranking requirement; concise descriptions remain acceptable when they state the page's purpose clearly.

## Tasks to complete

### P0: establish a trustworthy baseline

- [ ] **AEO-001 — Classify all 38 hidden editorial pages.** Classification is complete: 14 keep hidden/noindex, 23 add to navigation after review, and 1 make searchable without a sidebar entry. Implementation and discovery verification remain. **Owner:** Docs. **Effort:** 1–2 days. **Success:** every hidden page has an explicit disposition; sitemap and assistant coverage match that decision.
- [x] **AEO-002 — Fix required editorial metadata.** Added 14 missing `sidebarTitle` values and 4 missing descriptions, rewrote all 33 descriptions over 160 characters, and reviewed all 89 under 60 characters using a YAML-aware inventory. **Owner:** Docs. **Effort:** 1–2 days. **Success:** all 443 editorial pages now have `title`, `sidebarTitle`, and `description`; none has a description over 160 characters.
- [x] **AEO-003 — Add repository linting to CI.** Added a baseline-aware content-quality checker covering required frontmatter, duplicate titles/descriptions, description length, source H1s, relative internal links, code-fence language tags, and intentional indexation. The static workflow retains `mint broken-links` and now runs `mint a11y`. **Owner:** Docs/Engineering. **Effort:** 1 day. **Success:** pull requests fail on new content-quality regressions.
- [x] **AEO-004 — Correct the `llms.txt` documentation.** Distinguished the curated root `/llms.txt` from `/docs/llms.txt`, `/docs/llms-full.txt`, generated scoped bundles, and page-level `.md` endpoints. Verified each example URL and response type against the live site on September 2, 2026. **Owner:** Docs. **Effort:** under 2 hours. **Success:** every documented URL and claim matches the live response.
- [x] **AEO-005 — Export first-party baselines.** Save Search Console page/query data, the generative AI performance report, analytics conversions, Mintlify assistant queries, and CDN crawler logs for the prior 90 days. **Owner:** Growth/Docs. **Effort:** half day. **Success:** baseline dashboard exists before content changes ship.
  - **September 2, 2026:** Captured the Search Console, generative AI, GA4 conversion, and Mintlify Assistant exports and built the private baseline dashboard. Mintlify's crawler-classified page views are the accepted crawler baseline because the accessible Cloudflare account does not contain the `checklyhq.com` zone.
- [x] **AEO-006 — Define the target query set.** Created `aeo-target-queries.md` with 70 queries across synthetic monitoring, Playwright monitoring, API monitoring, monitoring as code, uptime protocols, incident response, and agentic reliability. Every query maps to one canonical page, one of four search intents, and a business intent. **Owner:** Growth/Docs/Product. **Effort:** 1 day. **Success:** each query maps to one canonical page and business intent.

### P1: redistribute authority and improve answer quality

- [ ] **AEO-007 — Rebuild the Playwright-to-monitoring journey.** Add a decision section and strong internal links from `what-is-playwright` into the production-monitoring comparison, Playwright Check Suites, quickstart, timeouts, authentication, and debugging pages. **Owner:** Docs. **Effort:** 1 day. **Success:** at least five descriptive links and a measurable increase in entrances to non-generic Playwright pages.
- [ ] **AEO-008 — Refresh the synthetic monitoring pillar.** Add an answer block, synthetic-vs-RUM-vs-uptime table, limitations, original data, architecture diagram, and tested implementation path. **Owner:** Docs/Product/Data. **Effort:** 3–5 days. **Success:** page is the canonical target for the cluster and gains non-brand impressions and AI citations.
- [ ] **AEO-009 — Expose and refresh API monitoring best practices/examples.** Remove duplication, validate code, add authentication and failure-mode guidance, then add the pages to navigation or a searchable group. **Owner:** Docs/Engineering. **Effort:** 2–3 days. **Success:** pages appear in sitemap, internal search, assistant answers, and MCP results.
- [ ] **AEO-010 — Expose and refresh browser monitoring best practices/examples.** Include locator strategy, retries, timeouts, secrets, regional execution, screenshots/traces, and false-positive handling. **Owner:** Docs/Engineering. **Effort:** 2–3 days. **Success:** same discovery checks as AEO-009.
- [ ] **AEO-011 — Create one monitoring-as-code hub.** Consolidate the choice among CLI, Terraform, and Pulumi; link to tested basic and advanced examples; avoid duplicating implementation pages. **Owner:** Docs/DevRel. **Effort:** 2 days. **Success:** one canonical page owns the concept and routes users to each implementation.
- [ ] **AEO-012 — Add product-choice tables.** Cover Browser Check vs. Playwright Check Suite and URL/TCP/DNS/ICMP/SSL/gRPC monitor selection with concise criteria, limitations, and next steps. **Owner:** Docs/Product. **Effort:** 1–2 days. **Success:** each product overview answers “which one should I use?” without assistant follow-up.
- [ ] **AEO-013 — Enable visible freshness.** Add `metadata.timestamp`, define review cadences, and refresh the highest-traffic pages dated before 2025. Validate how author/reviewer identity can be included without conflicting JSON-LD. **Owner:** Docs. **Effort:** 2–4 days. **Success:** top 25 organic landing pages show a current review signal and named accountability where supported.
- [ ] **AEO-014 — Fix reported accessibility issues.** Adjust theme colors to pass contrast checks and add text alternatives to the four flagged videos. **Owner:** Design/Docs. **Effort:** half day. **Success:** `mint a11y` passes.

### P2: build differentiated authority and distribution

- [ ] **AEO-015 — Publish a recurring Checkly reliability data study.** Use anonymized aggregate data to answer a focused question such as common synthetic failure causes, retry recovery rates, or regional latency variance. Document methodology and limitations. **Owner:** Data/DevRel/Docs. **Effort:** 1–2 weeks. **Success:** earns citations, links, and reuse across at least five relevant pages.
- [ ] **AEO-016 — Refresh factual comparison content.** Review the hidden comparison hubs, choose canonical pages, cite primary vendor docs, add “best for” and limitation criteria, and assign quarterly reviews. **Owner:** Product Marketing/Docs. **Effort:** 1 week. **Success:** indexed comparison pages rank for non-brand decision queries without unsupported claims.
- [ ] **AEO-017 — Build scoped agent indexes.** Validate and promote focused Markdown bundles for product docs, CLI/Constructs, API reference, Playwright monitoring, uptime monitoring, and incident response. Test link resolution and size. **Owner:** Docs/Engineering. **Effort:** 2–3 days. **Success:** agents can retrieve a relevant bundle without loading the 3.15 MB full file.
- [ ] **AEO-018 — Mine assistant failures monthly.** Export unanswered queries, source-less responses, low-rated answers, and searches with no result; map each to content fixes or synonyms. **Owner:** Docs/Support. **Effort:** 2 hours monthly. **Success:** unanswered and source-less answer rates decline month over month.
- [ ] **AEO-019 — Run a citation and ranking review every month.** Recheck the fixed query set in Search Console, Ahrefs, ChatGPT search, Perplexity, and Google generative results where available. Record cited URL, answer accuracy, competitors, and change from baseline. **Owner:** Growth/Docs. **Effort:** half day monthly. **Success:** broader cited-page distribution, not only higher raw response counts.
- [ ] **AEO-020 — Earn links to the priority clusters.** Promote original data, open-source examples, templates, and technical diagrams through Checkly's blog, GitHub projects, partner integrations, conference material, and relevant community answers. **Owner:** DevRel/Growth. **Effort:** ongoing. **Success:** referring domains grow for the synthetic monitoring, Playwright monitoring, and monitoring-as-code clusters.
