# Competitive review & action list

> Working doc. **Not** part of the distributed skill — exclude from packaging like `PLAN.md`.
> Compares our skill against [currents-dev/playwright-best-practices-skill](https://github.com/currents-dev/playwright-best-practices-skill) (analysis: 2026-06-23).

## Verdict

We're **narrower but sharper**. Currents built an encyclopedia (73 files, ~50 topics, code-dump + ToC style). We built an opinionated, agentic field manual (12 files, ~10 clusters). They win on breadth and triggering; we win decisively on agentic utility, accuracy, and judgment — which matter more for a skill an agent consumes.

### Where currents beats us today
- **Breadth / triggering** — keyword-stuffed description activates on ~50 topics; dedicated file ready for each. We have nothing for iframes, Electron, visual regression, component testing, a11y/axe, etc.
- **Self-contained depth** — their core files (debugging 504 lines, flaky-tests 496, github-actions 546) don't lean on external links; ours offload depth to checklyhq.com/learn.

### Where we already crush them
- **Agentic-first** — grepped all their core files: ZERO `playwright-cli`, `--debug=cli`, `error-context.md`, or even `codegen`. Their whole debugging story is `PWDEBUG`, `--ui`, `--debug`, `page.pause()`, `show-trace` — human GUIs an agent can't drive. On the axis that matters most, they're not playing.
- **Accuracy & modernity** — we're on 1.59/1.60 primitives, version-gated; they teach `page.pause()`/`show-trace` as primary.
- **Opinionation / the why** — we explain false-positive vs false-negative locator failures; they list terse `Features:` bullets.
- **Checkly monitor tie-in** — genuine, unique, lightly applied.

## Action list

### 1. Amplify agentic-first framing (priority — cheap, high leverage) — DONE 2026-06-23
- [x] Add a short "Agentic workflow" section to `SKILL.md`: renamed the verify loop to **Agentic workflow (no GUI)**, split into **Author** (discover locators live with `playwright-cli`) and **Run & debug** (run → `error-context.md` → `--debug=cli` → fix root cause).
- [x] Extend the one-line agentic note to every applicable reference — added the missing one to `network.md` ("verify the mock fired via `playwright-cli snapshot`/`network`"). locators/auth/debugging/ci already carried it; assertions/waiting/test-structure/config intentionally stay test-code-focused per `PLAN.md`.
- [x] Frame every human-GUI tool as "capture for a human; as an agent, do X." — audited; all mentions of `--ui`/`--debug`/`show-trace`/`show-report`/`codegen`/Inspector already carry the framing.

### 2. Tighten over-written prose — DONE 2026-06-23
- [x] `assertions.md` — timeout-knob paragraph condensed (~40% shorter).
- [x] `flakiness.md` — `fullyParallel` run-on merged into one clause.
- [x] `waiting.md` — `focus`/`press`/`dispatchEvent` paragraph tightened.
- [~] `network.md` "Don't over-mock" — left as-is on review: the bullets are concrete/scannable; editing would be churn for its own sake.
- [x] Removed the version-check redundancy in `SKILL.md` (it appeared 3×): the top agent-CLI blockquote is now identity-only, the workflow note owns check+install, and the closing "Stay current" note is a one-liner pointing to `debugging.md` (the detailed home).
- [x] Front-loaded blockquote trimmed: the agent-CLI blockquote before the core rules is now ~half its length.

### 3. Close high-frequency breadth gaps — LOCKED 2026-06-23 (granular: one topic per file; see PLAN.md Phase 5)
Build one at a time, Stefan reviews each. 10 → 23 references.
- Thin-spot fills: [x] `test-data.md`  [x] `tags-annotations.md`  [x] `console-errors.md`  [x] `global-setup.md`
- Tier 1: [x] `visual.md`  [x] `files.md`  [x] `iframes.md`  [x] `mobile.md`  (dropped: accessibility, component testing)
- Tier 2: [x] `clock.md`  [x] `multi-context.md`  [ ] `forms.md`  [ ] `error-states.md`  [ ] `graphql.md`  (dropped: drag-drop)
- [x] Tier 3 skipped as a deliberate scope decision (documented in PLAN.md), NOT gap-for-gap.

### 4. Widen description keyword surface for triggering
- [ ] Expand `description` with activity keywords for the new breadth topics so the skill triggers on them.
- [ ] Borrow the tactic, not their text — keep it readable, not a 200-word run-on wall.
- [ ] Do after/alongside #3 so keywords match real coverage.

## Guardrails (from existing PLAN.md conventions)
- Don't copy any third-party reference skill; use only as private inspiration. No competitor links.
- Curated, not exhaustive; lean files + "Deeper in the docs" links out.
- Keep Checkly mentions genuinely in context.
