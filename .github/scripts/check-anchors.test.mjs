import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { checkAnchors, componentSlug, extractAnchors, extractLinks, paramSlug, resolveLink, slugify } from './check-anchors.mjs';

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'check-anchors-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), content);
  }
  return root;
}

test('slugify follows Mintlify heading ids, not github-slugger', () => {
  assert.equal(slugify('Headers & query parameters'), 'headers-&-query-parameters');
  assert.equal(slugify('Import a Swagger / OpenAPI specification'), 'import-a-swagger-/-openapi-specification');
  assert.equal(slugify('`2022.10`'), '2022-10');
  assert.equal(slugify('Deleting vs. detaching removed resources'), 'deleting-vs-detaching-removed-resources');
  assert.equal(slugify('.md endpoints'), 'md-endpoints');
  assert.equal(slugify('How often should I retry?'), 'how-often-should-i-retry');
  assert.equal(slugify("Change members' roles"), 'change-members’-roles');
  assert.equal(slugify('`CHECKLY_RUN_SOURCE` values'), 'checkly_run_source-values');
  assert.equal(slugify('Using `fromId()` to reference an [existing](/x) channel'), 'using-fromid-to-reference-an-existing-channel');
});

test('component and param ids use the stricter slug', () => {
  assert.equal(componentSlug('HTTP/3 (HTTPS record)'), 'http-3-https-record');
  assert.equal(componentSlug("`npx checkly login` doesn't open a browser window"), 'npx-checkly-login-doesnt-open-a-browser-window');
  assert.equal(componentSlug('v7.0.2'), 'v7-0-2');
  assert.equal(paramSlug('x.fooBar'), 'param-x-foo-bar');
  assert.equal(paramSlug('singleRetry(options)'), 'param-single-retry-options');
});

test('extractAnchors collects headings, components and duplicates, ignoring code', () => {
  const anchors = extractAnchors([
    '## Setup',
    '## Setup',
    '```bash',
    '# not a heading',
    '```',
    '<ResponseField name="engine" type="string">',
    '<Tab title="playwright.config.ts">',
    '<Tab title="playwright.config.ts">',
    '<Accordion title="Total Blocking Time (TBT)">',
    '<div id="custom-anchor"></div>',
    '<YouTubeEmbed id="dQw4w9WgXcQ" />',
  ].join('\n'));
  assert.deepEqual([...anchors].sort(), [
    'custom-anchor', 'param-engine', 'playwright-config-ts', 'playwright-config-ts-2',
    'setup', 'setup-2', 'total-blocking-time-tbt',
  ]);
});

test('extractLinks finds markdown and href links, skipping code', () => {
  const links = extractLinks([
    'See [a](/a#one) and <Card href="/b#two">.',
    '`[not](/c#three)`',
    '```md',
    '[nope](/d#four)',
    '```',
    '[external](https://example.com/#five)',
  ].join('\n'));
  assert.deepEqual(links, [
    { href: '/a#one', line: 1 },
    { href: '/b#two', line: 1 },
    { href: 'https://example.com/#five', line: 6 },
  ]);
});

test('resolveLink handles same-page, relative, trailing-slash and absolute docs URLs', () => {
  assert.deepEqual(resolveLink('#x', 'cli/deploy'), { page: 'cli/deploy', fragment: 'x' });
  assert.deepEqual(resolveLink('../platform/groups/#x', 'cli/deploy'), { page: 'platform/groups', fragment: 'x' });
  assert.deepEqual(resolveLink('https://www.checklyhq.com/docs/communicate/retries#x', 'a'), { page: 'communicate/retries', fragment: 'x' });
  assert.deepEqual(resolveLink('/admin/members#change-members%E2%80%99-roles', 'a'), { page: 'admin/members', fragment: 'change-members’-roles' });
  assert.equal(resolveLink('https://example.com/docs#x', 'a'), null);
});

test('checkAnchors reports broken fragments and follows imported snippets', (t) => {
  const root = fixture(t, {
    'snippets/shared.mdx': '## From snippet\n',
    'target.mdx': "import Shared from '/snippets/shared.mdx';\n\n## Real heading\n\n<Shared />\n",
    'source.mdx': [
      '[ok](/target#real-heading)',
      '[snippet](/target#from-snippet)',
      '[broken](/target#gone)',
      '[missing page](/nowhere#x)',
    ].join('\n'),
  });
  assert.deepEqual(checkAnchors(root), [{ file: 'source.mdx', href: '/target#gone', line: 3, target: 'target.mdx' }]);
});
