# AEO target query map

Created: September 2, 2026

This map defines 70 target queries across Checkly's seven priority topic clusters. Each query has one canonical documentation page and one business intent so pages do not compete with each other for the same answer.

## How to use this map

- Treat the query wording as a representation of user intent, not an exact-match phrase to repeat mechanically.
- Strengthen the mapped canonical page before creating new content.
- Use supporting pages to link to the canonical page with descriptive anchor text.
- Reassign a query only when the replacement page is published, indexed, and clearly better suited to answer it.
- Review the map quarterly against Search Console, assistant queries, customer language, and current product capabilities.

Search intent uses four labels: **informational**, **comparison**, **troubleshooting**, and **implementation**. Business intent identifies the next useful outcome for Checkly: **awareness**, **evaluation**, **activation**, **retention**, or **expansion**.

## Synthetic monitoring

| Target query | Search intent | Business intent | Canonical page |
| --- | --- | --- | --- |
| What is synthetic monitoring? | Informational | Awareness | `/learn/monitoring/synthetic-monitoring` |
| How does synthetic monitoring work? | Informational | Awareness | `/learn/monitoring/synthetic-monitoring` |
| What can synthetic monitoring detect? | Informational | Awareness | `/detect/synthetic-monitoring/overview` |
| Synthetic monitoring vs real user monitoring | Comparison | Evaluation | `/learn/monitoring/synthetic-monitoring` |
| Synthetic monitoring vs uptime monitoring | Comparison | Evaluation | `/detect/synthetic-monitoring/overview` |
| Browser checks vs API checks | Comparison | Evaluation | `/detect/synthetic-monitoring/overview` |
| How do I set up synthetic monitoring? | Implementation | Activation | `/quickstart` |
| How do I monitor a critical user journey? | Implementation | Activation | `/detect/synthetic-monitoring/browser-checks/quickstart` |
| Why is my synthetic check flaky? | Troubleshooting | Retention | `/platform/managing-false-positives` |
| How do I investigate a failed synthetic check? | Troubleshooting | Retention | `/guides/reading-traces` |

## Playwright monitoring

| Target query | Search intent | Business intent | Canonical page |
| --- | --- | --- | --- |
| What is Playwright? | Informational | Awareness | `/learn/playwright/what-is-playwright` |
| What is Playwright monitoring? | Informational | Awareness | `/detect/synthetic-monitoring/playwright-monitoring-comparison` |
| Playwright testing vs Playwright monitoring | Comparison | Evaluation | `/detect/synthetic-monitoring/playwright-monitoring-comparison` |
| Browser Check vs Playwright Check Suite | Comparison | Evaluation | `/detect/synthetic-monitoring/playwright-monitoring-comparison` |
| Can I run Playwright tests in production? | Implementation | Activation | `/guides/playwright-testing-to-monitoring` |
| How do I reuse Playwright tests as monitors? | Implementation | Activation | `/detect/synthetic-monitoring/playwright-checks/quickstart` |
| How do I configure a Playwright Check Suite? | Implementation | Activation | `/detect/synthetic-monitoring/playwright-checks/configuration` |
| How do I manage Playwright test timeouts in Checkly? | Troubleshooting | Retention | `/detect/synthetic-monitoring/playwright-checks/timeouts` |
| How do I debug a failed Playwright monitor? | Troubleshooting | Retention | `/learn/playwright/debugging` |
| How do I monitor Playwright performance and Web Vitals? | Implementation | Expansion | `/detect/synthetic-monitoring/playwright-checks/performance-metrics` |

## API monitoring

| Target query | Search intent | Business intent | Canonical page |
| --- | --- | --- | --- |
| What is API monitoring? | Informational | Awareness | `/learn/monitoring/api-monitoring` |
| How does API monitoring work? | Informational | Awareness | `/detect/synthetic-monitoring/api-checks/overview` |
| API monitoring vs API testing | Comparison | Evaluation | `/learn/monitoring/api-monitoring` |
| API checks vs multistep checks | Comparison | Evaluation | `/detect/synthetic-monitoring/multistep-checks/overview` |
| How do I create an API monitor? | Implementation | Activation | `/detect/synthetic-monitoring/api-checks/quickstart` |
| How do I monitor an API from an OpenAPI specification? | Implementation | Activation | `/detect/synthetic-monitoring/api-checks/openapi-spec` |
| How do I authenticate a Checkly API check? | Implementation | Activation | `/detect/synthetic-monitoring/api-checks/configuration` |
| How do I use setup and teardown scripts in API checks? | Implementation | Expansion | `/detect/synthetic-monitoring/api-checks/setup-and-teardown` |
| Why is my Checkly API check failing? | Troubleshooting | Retention | `/detect/synthetic-monitoring/api-checks/troubleshooting` |
| How do I alert on slow API responses? | Implementation | Expansion | `/detect/synthetic-monitoring/api-checks/response-limits` |

## Monitoring as Code

| Target query | Search intent | Business intent | Canonical page |
| --- | --- | --- | --- |
| What is monitoring as code? | Informational | Awareness | `/learn/monitoring/monitoring-as-code` |
| What are the benefits of monitoring as code? | Informational | Evaluation | `/concepts/monitoring-as-code` |
| Checkly CLI vs Terraform vs Pulumi | Comparison | Evaluation | `/cli/cli-vs-terraform-pulumi` |
| Monitoring as code vs monitoring in a UI | Comparison | Evaluation | `/learn/monitoring/monitoring-as-code` |
| How do I get started with monitoring as code? | Implementation | Activation | `/guides/getting-started-with-monitoring-as-code` |
| How do I create Checkly monitors with TypeScript? | Implementation | Activation | `/constructs/overview` |
| How do I import existing Checkly checks into code? | Implementation | Activation | `/cli/importing` |
| How do I test Checkly constructs locally? | Implementation | Retention | `/cli/checkly-test` |
| How do I deploy Checkly monitors from CI? | Implementation | Expansion | `/cli/checkly-deploy` |
| Why did my Checkly CLI deployment fail? | Troubleshooting | Retention | `/cli/checkly-deploy` |

## Uptime protocols

| Target query | Search intent | Business intent | Canonical page |
| --- | --- | --- | --- |
| What is uptime monitoring? | Informational | Awareness | `/guides/uptime-monitoring` |
| Which uptime monitor should I use? | Comparison | Evaluation | `/detect/uptime-monitoring/overview` |
| URL monitor vs API check | Comparison | Evaluation | `/detect/uptime-monitoring/url-monitors/overview` |
| TCP monitor vs HTTP monitor | Comparison | Evaluation | `/detect/uptime-monitoring/tcp-monitors/overview` |
| How do I monitor a website for uptime? | Implementation | Activation | `/detect/uptime-monitoring/url-monitors/quickstart` |
| How do I monitor a TCP port? | Implementation | Activation | `/detect/uptime-monitoring/tcp-monitors/quickstart` |
| How do I monitor DNS records? | Implementation | Activation | `/detect/uptime-monitoring/dns-monitors/configuration` |
| How do I monitor a cron job or scheduled task? | Implementation | Activation | `/detect/uptime-monitoring/heartbeat-monitors/quickstart` |
| How do I monitor SSL certificate expiration? | Implementation | Expansion | `/detect/uptime-monitoring/ssl-monitors/overview` |
| Why is an uptime monitor reporting false positives? | Troubleshooting | Retention | `/platform/managing-false-positives` |

## Incident response

| Target query | Search intent | Business intent | Canonical page |
| --- | --- | --- | --- |
| What is incident response? | Informational | Awareness | `/learn/incidents/what-is-incident-response` |
| What are MTTD and MTTR? | Informational | Awareness | `/learn/incidents/overview` |
| SLI vs SLO vs SLA | Comparison | Evaluation | `/learn/incidents/slo-sla-sli` |
| Status page vs incident management tool | Comparison | Evaluation | `/learn/incidents/anatomy-of-a-status-page` |
| How do I reduce mean time to detection? | Implementation | Evaluation | `/learn/incidents/reduce-mttd` |
| How do I create an incident response playbook? | Implementation | Activation | `/learn/incidents/playbooks` |
| How do I configure Checkly alert escalation? | Implementation | Activation | `/communicate/alerts/configuration` |
| How do I communicate during an outage? | Implementation | Retention | `/learn/incidents/incident-communication` |
| How do I find the root cause of a failed check? | Troubleshooting | Retention | `/learn/incidents/root-cause-with-traces` |
| How do I write an incident postmortem? | Implementation | Retention | `/learn/incidents/postmortems` |

## Agentic reliability

| Target query | Search intent | Business intent | Canonical page |
| --- | --- | --- | --- |
| How can AI agents manage monitoring as code? | Informational | Awareness | `/guides/agentic-workflows` |
| How do coding agents use Checkly documentation? | Informational | Awareness | `/ai/overview` |
| Checkly MCP vs Checkly agent skills | Comparison | Evaluation | `/ai/overview` |
| AI-generated monitors vs manually written monitors | Comparison | Evaluation | `/guides/agentic-workflows` |
| How do I connect an AI agent to Checkly? | Implementation | Activation | `/ai/mcp-server/setup` |
| What can the Checkly MCP server do? | Informational | Evaluation | `/ai/mcp-server/tools` |
| How do I install Checkly skills for an AI agent? | Implementation | Activation | `/ai/skills` |
| How do I secure Checkly MCP access? | Implementation | Retention | `/ai/mcp-server/security-and-permissions` |
| Why can’t my AI agent connect to the Checkly MCP server? | Troubleshooting | Retention | `/ai/mcp-server/troubleshooting` |
| How can an AI agent debug a failed Playwright test? | Troubleshooting | Expansion | `/learn/playwright/debugging-with-ai-agents` |

## Ownership and measurement

| Cluster | Primary owner | Supporting owners | Primary success signal |
| --- | --- | --- | --- |
| Synthetic monitoring | Docs | Product, Growth | Non-brand entrances and citations to the synthetic monitoring pillar |
| Playwright monitoring | Docs | DevRel, Product | Traffic moving from generic Playwright pages into production-monitoring pages |
| API monitoring | Docs | Engineering, Product | API quickstart activation and broader cited-page distribution |
| Monitoring as Code | DevRel | Docs, Engineering | CLI/Constructs engagement and successful first deployments |
| Uptime protocols | Docs | Product, Support | Uptime quickstart completion and fewer product-selection searches |
| Incident response | Docs | Product Marketing, Support | Engagement with alerting, traces, and incident workflow pages |
| Agentic reliability | AI/Docs | Engineering, Product | MCP connections, skill installs, and successful agent retrievals |

## Review rules

1. Track performance at the canonical-page level as well as the exact-query level; answer engines frequently paraphrase prompts.
2. Separate branded from non-branded variants when reporting visibility.
3. Record whether each result is a traditional link, generated answer citation, assistant answer, or MCP retrieval.
4. Do not create a new page for a query variant when the mapped page can answer it clearly with a section.
5. If two pages begin ranking for the same intent, select one canonical target and consolidate content and internal links around it.
