# Debugging

Playwright's classic debugging tools — the Inspector (`--debug`), UI mode (`--ui`), and the Trace Viewer (`show-trace`) — are **interactive GUIs you can't drive** in an agent session. Skip them. Playwright ships a separate **agent CLI** built for exactly this situation, plus machine-readable failure artifacts. Reach for those instead.

## Read the failure first (zero setup)

1. **stdout call log** — the reporter prints the failing assertion *and* the call log: which locator/assertion timed out and what Playwright actually saw. This is the primary signal — read it before changing anything.
2. **`error-context.md`** — on an `expect` failure, Playwright writes an aria snapshot of the page *at the moment it failed* to `test-results/<test>/error-context.md` (also on `testInfo.errors`). Machine-readable page structure, no re-run needed. *(recent Playwright, ≈1.60)*
3. **Artifacts, not GUIs** — `--trace on` drops `trace.zip` into `test-results/`. The Trace Viewer (`npx playwright show-trace`, [trace.playwright.dev](https://trace.playwright.dev)) is a GUI — fine to hand a human, but as an agent prefer the live session below.

## The agent CLI: `playwright-cli`

A **separate tool** from `npx playwright`, purpose-built for coding agents — install it as a dev dependency (`npm install -D @playwright/cli`) and run it through `npx playwright-cli`, or install it globally (`npm install -g @playwright/cli`) to call `playwright-cli` directly. It runs a persistent browser daemon and, after every command, prints an accessibility **snapshot with element refs** (`e5`, `e15`) you act on. That makes actions deterministic and keeps it token-efficient: it surfaces a structured snapshot instead of dumping the raw DOM into your context. It also ships its own skill — `playwright-cli install --skills`.

Use it to explore a flow and discover locators — the agent-drivable replacement for `codegen`'s GUI recorder:

```bash
playwright-cli open https://danube-web.shop
playwright-cli snapshot                      # accessibility tree + element refs
playwright-cli click e15                     # act on a ref
playwright-cli fill e5 "user@example.com"
```

Each snapshot labels every ref with its role and accessible name — write the `getByRole`/`getByLabel` locator straight from those. (The `eN` refs drive the live session; they don't go into the spec.) Prefix any command with `-s=<name>` for named, isolated sessions.

## Step through a failing test live: `--debug=cli`

The agentic step debugger — non-interactive, so you *can* drive it. Run the test with `--debug=cli`; it pauses and prints a session name, then attach and inspect:

```bash
npx playwright test tests/checkout.spec.ts --debug=cli   # run in background; prints a session name
playwright-cli attach <session-name>
playwright-cli snapshot                       # page state at the pause
playwright-cli step-over                      # advance one action
playwright-cli console error                  # console errors
playwright-cli network                        # network activity
playwright-cli eval "() => document.title"
playwright-cli pause-at tests/checkout.spec.ts:42   # set a breakpoint
playwright-cli resume
```

Attach at the failing step, see why the locator didn't resolve or what the page actually rendered, fix the root cause, re-run. No Inspector, no trace GUI.

## codegen is human-only

`npx playwright codegen` records into the Inspector GUI — you can't drive it as an agent. Use the `playwright-cli` snapshot flow above instead — read roles and names off the snapshot and author the locator yourself. (Same point in [auth.md](./auth.md).)

## Common failures → root cause

Modernized — auto-waiting and web-first assertions replace the old `waitForSelector` advice:

- **element not found / not visible** — usually a wrong or over-specific locator, or you acted before the UI settled. Switch to a user-facing locator; the action already auto-waits. Don't reach for `waitForSelector` / `waitForTimeout`. → [locators.md](./locators.md), [waiting.md](./waiting.md)
- **strict mode violation (resolved to N elements)** — the locator matches more than one node. Narrow it with `.filter()`, a `getByRole` name, or by scoping into a region. → [locators.md](./locators.md)
- **assertion timeout** — the call log shows what was or wasn't there. Either the locator is wrong or the state genuinely never happened; fix the cause, don't bump the timeout. → [assertions.md](./assertions.md)
- **target/page closed** — the context closed mid-action, often a stray navigation or a page closed too early.

> **Stay current.** These primitives are recent and version-gated — `error-context.md` and `--debug=cli` both landed in 2025 releases. Check `npx playwright --version` and `playwright-cli --version`; if they're behind, tell the user to update both packages (`@playwright/test` and `@playwright/cli`).

## Deeper in the docs

- [Playwright agent CLI: introduction](https://playwright.dev/agent-cli/introduction)
- [Agent CLI: test debugging](https://playwright.dev/agent-cli/commands/test-debugging)
- [Debugging scripts](https://www.checklyhq.com/learn/playwright/debugging/) — the human/GUI workflow
- [Debugging common errors](https://www.checklyhq.com/learn/playwright/debugging-errors/)
