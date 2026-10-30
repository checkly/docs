# Onboarding guides plan

Ten guides for the places new Checkly users stall, picked from Mixpanel new-user behavior. How to write a guide: `.claude/skills/guide-authoring/SKILL.md`. Update the status column when you start or finish a task. Last updated 2026-09-28.

Status values: `Done` (committed), `In progress` (edited, not committed), `Not started`, `Blocked`.

## Goal

Ship 10 guides that fix where new users stall, measured by Mixpanel funnels before and after each guide ships. Success means each guide's target funnel step improves against its baseline within 60 days of publishing.

Only about 8% of new users touch the CLI, yet every current guide is written CLI-first. Most new users start in the AI prompt screen or the web app, so these guides meet them there and then move them toward code.

## Evidence

Mixpanel EU project 2294629, users created 2026-07-15 to 2026-09-27 (about 7,950), page views included. Each row is a funnel from a feature's page to its finished action, 14-day window unless noted.

| Started → finished | Guide | Started | Finished | Rate |
|---|---|---|---|---|
| Traces list → OTel ingest on | 8 | 470 | 13 | 3% |
| Playwright create page → deployed | 6 | 236 | 10 | 4% |
| Heartbeat form → first ping | 5 | 193 | 11 | 6% |
| Export to Code → CLI command copied | 7 | 246 | 26 | 11% |
| First alert → check edited (7 days) | 1 | 1,435 | 186 | 13% |
| AI prompt screen → plan approved (signups to 2026-09-13) | 3 | 4,216 | 701 | 17% |
| Alert settings → channel created | 2 | 1,350 | 328 | 24% |
| Multistep form → check saved | 10 | 101 | 24 | 24% |
| Browser check form → check saved | 10 | 624 | 271 | 43% |

For comparison, 25% of all signups create any check within 14 days. Two findings don't fit a funnel:

- 468 new users hit their trial quota, mostly on browser runs. The most common setting is a browser check every 10 minutes.
- Adding an alert channel after a first check is the strongest paid signal: about 12% of those users subscribe within 30 days, against 1.5% of all signups.

## Guides

| # | Guide | Who it's for | Problem it fixes | Success metric | Overlaps with | Priority | Status | Next step |
|---|---|---|---|---|---|---|---|---|
| 1 | Your first alert: is it your site or your check? | Anyone whose first check fails | Many first checks fail early, and few people open the result or fix the check | `Alert Notification Sent` → `Viewed check-session-location-result Page` → `Check Updated` | `reading-traces` (CLI-only today) | P1 | Not started | Write brief; pick a sample check that fails on purpose |
| 2 | Get your first alert into Slack, email or phone | UI users with a check and no alert channel | Most who open alert settings never add a channel, yet adding one is the strongest paid signal | `Viewed alert-settings Page` → `Alert Channel Created` | `alerting` (advanced, CLI) | P1 | Not started | Write brief; decide whether it extends `alerting` or stands alone |
| 3 | Write a prompt that gets you working monitors | New owners on the AI prompt screen | Many never submit a prompt, and most who do stop after the assistant's first reply | `AI Assistant Prompt Submitted` → `AI Assistant Plan Decision` (approved) | None | P1 | Not started | Collect prompts that got a plan on the first reply |
| 4 | Make your trial check runs last | Trial users with browser checks | Trial users burn their browser-run quota with the 10-minute default | `Quota Hit` rate among users with checks | None | P2 | Not started | Confirm trial quota numbers with the product team |
| 5 | Monitor cron jobs and background tasks with heartbeats | Backend and platform engineers | Heartbeats get created but never pinged | `Viewed heartbeats:new Page` → heartbeat created → first ping | None | P2 | Not started | Write brief; sample pings from cron, GitHub Actions and a Kubernetes CronJob |
| 6 | Your first Playwright Check Suite, with no existing tests | Developers new to Playwright | People open the create page, then never run the quickstart | `Viewed checks:playwright:create Page` → `Project Synced` | `playwright-testing-to-monitoring` (assumes tests exist) | P2 | Not started | Write brief; test the quickstart end to end |
| 7 | Move the checks you built in the UI into code | UI users ready for code | People open Export to Code and leave; CLI users convert best (7.9%) | `Export to Code Modal Opened` → `Export to Code Command Copied` / `Files Downloaded` | `structuring-a-checkly-project` | P2 | Not started | Write brief; test Export to Code and import plans |
| 8 | Connect your backend traces with OpenTelemetry | Teams with instrumented backends | Interest in traces is high, setup completion is near zero | `Viewed traces:list Page` → `OTEL Ingest Traces Enabled` | None | P3 | Not started | Write brief; pick one runtime for the sample |
| 9 | You've been added to a Checkly account | Invited and SSO-provisioned teammates | About 990 SSO signups see the new-account prompt, and alert links drop teammates on 404s | Non-owner activity in week 1; `Viewed NotFound Page` rate | None | P3 | Not started | Confirm the cause of 404s from alert links |
| 10 | Monitor a login flow with secrets | Browser and multistep check builders | Browser and multistep create forms are often abandoned before saving | `Viewed checks:browser:create Page` → `Check Created` (BROWSER) | `api-monitoring` (API auth only) | P3 | Not started | Write brief; reuse the auth pattern from the checkout sample |

Runners-up: private locations for internal apps, investigating failures from a coding agent with the Checkly MCP server, and a UI path in `communicate-availability`.

## Measurement and tracking

| Task | Owner | Priority | Status | Notes |
|---|---|---|---|---|
| Build a Mixpanel baseline dashboard for all 10 funnels | TBD | P1 | Not started | Use the success-metric funnels above |
| Fix: v3 status page creation isn't tracked | TBD | P2 | Not started | `Status Page Created` never fires after `Viewed status-pages:next:new Page` |
| Fix: UI creation of env vars and private locations isn't tracked | TBD | P2 | Not started | `POST:/v1/variables` and `POST:/v1/private-locations` only cover the public API |
| Add UTM tags to app links in guides | TBD | P3 | Not started | Agree on a convention so guide traffic shows up in Mixpanel |
| Re-run each guide's funnel 30 and 60 days after it ships | TBD | P2 | Blocked | Until the first guide ships |

How to measure:

- **Cohort:** users whose `$created` falls in the window.
- **Window:** 14-day conversion for setup funnels; 7 days for guide 1.
- **Keep page views in.** `Viewed … Page` events show where people give up. Ignore `App Opened`, `Page Loaded`, `AI Assistant Viewed`, `Build With AI Viewed`, `Sidebar Toggled`, `GET:/v1/*` and auth/session events.
- **Paid signal:** `Account Subscribed` within 30 days. The numbers are small, so read them as direction, not proof.
- **Caveat:** the per-user `Check Created` count only includes UI-created checks. AI- and CLI-created checks fire `Check Created through API`.

## Open questions

- [ ] Should guides 1–4 lead with the web app, even though the guide-authoring skill puts the agent path first?
- [ ] Guides 2 and 6 overlap `alerting` and `playwright-testing-to-monitoring`. New pages, or a beginner section in each?
- [ ] Guide 3 needs examples of prompts that got a plan on the first reply. Can the AI team share anonymized prompts?
- [ ] Guide 9: is the 404 from alert links caused by being signed into the wrong account? If so, the fix is in the product, and the guide only covers the workaround.
- [ ] Guide 4: what are the current trial quotas for browser and API runs?
- [ ] Prioritize by reach (alerts and the AI prompt first) or by the lowest finish rates (traces, Playwright, heartbeats)?
- [ ] Who owns each guide?
