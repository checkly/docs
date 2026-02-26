#!/usr/bin/env node

/**
 * notify-slack.mjs
 *
 * Posts a Slack reminder listing open auto-generated API doc PRs.
 * Exits silently if there are no open PRs.
 *
 * Env vars:
 *   DRY_RUN=1        — log what would happen, don't post to Slack
 *   SLACK_BOT_TOKEN  — Slack bot token (xoxb-...)
 *
 * Note: formatTitle() reverses the commit message format produced by
 * detect-new-endpoints.mjs (`docs(api): add {summary} endpoint`).
 * If that format changes, this function must be updated to match.
 */

const DRY_RUN = process.env.DRY_RUN === '1';
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL = '#docs';
const PR_LIST_URL =
  'https://github.com/checkly/docs/pulls?q=is%3Aopen+label%3Aauto-generated';

// ---------------------------------------------------------------------------
// Pure functions (exported for tests)
// ---------------------------------------------------------------------------

export function formatTitle(title) {
  return title
    .replace(/^docs\(api\): add /, '')
    .replace(/ endpoint$/, '')
    .trim();
}

export function buildPayload(prs) {
  const count = prs.length;
  const header =
    `*${count} open API doc PR${count === 1 ? '' : 's'} need${count === 1 ? 's' : ''} review*` +
    ` · <${PR_LIST_URL}|View all ↗>`;
  const list = prs
    .map((pr) => `• <${pr.url}|${formatTitle(pr.title)}>`)
    .join('\n');

  return {
    channel: CHANNEL,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: header } },
      { type: 'section', text: { type: 'mrkdwn', text: list } },
    ],
  };
}
