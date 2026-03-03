#!/usr/bin/env node

import assert from 'node:assert/strict';
import { formatTitle, buildPayload } from './notify-slack.mjs';

// formatTitle
assert.equal(
  formatTitle('docs(api): add List check results endpoint'),
  'List check results'
);
assert.equal(
  formatTitle('docs(api): add Get check group endpoint'),
  'Get check group'
);
// title with no known prefix/suffix passes through unchanged
assert.equal(formatTitle('Some other title'), 'Some other title');

// buildPayload structure
const prs = [
  { number: 1, title: 'docs(api): add List check results endpoint', url: 'https://github.com/checkly/docs/pull/1' },
  { number: 2, title: 'docs(api): add Get check group endpoint',    url: 'https://github.com/checkly/docs/pull/2' },
];
const payload = buildPayload(prs);

assert.equal(payload.channel, '#docs');
assert.equal(payload.blocks.length, 2);
assert.ok(payload.blocks[0].text.text.includes('2 open API doc PRs need review'));
assert.ok(payload.blocks[0].text.text.includes('View all'));
assert.ok(payload.blocks[1].text.text.includes('List check results'));
assert.ok(payload.blocks[1].text.text.includes('Get check group'));

// singular form
const single = buildPayload([prs[0]]);
assert.ok(single.blocks[0].text.text.includes('1 open API doc PR needs review'));

// empty list produces valid but empty block structure
const empty = buildPayload([]);
assert.equal(empty.channel, '#docs');
assert.equal(empty.blocks.length, 2);
assert.equal(empty.blocks[1].text.text, '');

console.log('✅ All tests pass');
