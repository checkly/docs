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

import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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

// ---------------------------------------------------------------------------
// Main (only runs when executed directly, not when imported for tests)
// ---------------------------------------------------------------------------

async function main() {
  console.log(DRY_RUN ? '🏃 DRY RUN MODE\n' : '🚀 Checking for open PRs\n');

  if (!DRY_RUN && !SLACK_BOT_TOKEN) {
    console.error('❌ SLACK_BOT_TOKEN env var is required');
    process.exit(1);
  }

  const raw = execSync(
    'gh pr list --label "auto-generated" --state open --json number,title,url',
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'inherit'] }
  ).trim();

  let prs;
  try {
    prs = JSON.parse(raw);
  } catch {
    console.error('❌ Failed to parse gh output:', raw.slice(0, 200));
    process.exit(1);
  }

  if (prs.length === 0) {
    console.log('✅ No open auto-generated PRs. Nothing to post.');
    return;
  }

  console.log(`📋 Found ${prs.length} open PR(s)`);

  const payload = buildPayload(prs);

  if (DRY_RUN) {
    console.log('Would post:\n', JSON.stringify(payload, null, 2));
    return;
  }

  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!data.ok) {
    console.error('❌ Slack API error:', data.error);
    process.exit(1);
  }

  console.log(`✅ Posted reminder for ${prs.length} PR(s) to ${CHANNEL}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('❌ Fatal:', err);
    process.exit(1);
  });
}
