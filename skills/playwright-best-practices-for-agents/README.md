# Playwright Best Practices Agent Skill

This directory contains the agent skill for writing, structuring, debugging, and stabilizing Playwright tests in TypeScript/JavaScript — built for coding agents, around Playwright's agent CLI (`playwright-cli`) and its no-GUI debugging flows.

## Structure

```
skills/
└── playwright-best-practices-for-agents/
    ├── README.md      # Documentation about the skill
    ├── SKILL.md       # Core instructions + routing table
    └── references/    # Topic deep-dives, loaded on demand
        ├── locators.md
        ├── assertions.md
        ├── waiting.md
        └── …          # one file per topic in the routing table
```

## What is an Agent Skill?

Agent Skills are a standardized format for giving AI agents specialized knowledge and workflows. This skill teaches agents how to:

- Choose resilient, user-facing locators and write web-first assertions
- Diagnose and fix flaky tests, retries, and parallelism issues
- Handle authentication (SSO, 2FA/TOTP) by persisting and reusing `storageState`
- Mock and intercept network/API requests, files, time, and dates
- Structure projects, fixtures, and config for isolated, independent tests
- Drive Playwright's agent CLI (`playwright-cli`) for no-GUI, token-efficient debugging
- Cover forms, iframes, multiple tabs/contexts, mobile emulation, visual regression, console errors, and CI

## How the Skill Loads

The skill follows the [Agent Skills specification](https://agentskills.io):

- **SKILL.md**: Core rules and a routing table, loaded when the skill is activated.
- **references/**: One file per topic. The agent loads a reference only when the task needs it — each reference ends with links to the full Checkly `/learn` articles for depth.

## Using This Skill

Place this directory where your agent discovers skills (for example, alongside other skills in a `skills/` directory), then let the agent load it when a task involves authoring or reviewing Playwright tests. The agent reads `SKILL.md` first and pulls in `references/` files as needed via the routing table.

## Learn More

- [Checkly Playwright `/learn` guides](https://www.checklyhq.com/learn/playwright/)
- [Playwright documentation](https://playwright.dev/docs/intro)
- [Agent Skills Specification](https://agentskills.io/specification.md)
