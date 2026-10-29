import assert from 'node:assert/strict';
import test from 'node:test';
import { findCssUrls } from './check-css-urls.mjs';

test('flags root-relative, relative and absolute url() values with their line', () => {
  const css = [
    '.a { background: url("/images/a.svg"); }',
    ".b { mask: url('images/b.svg'); }",
    '.c { background: url(https://www.checklyhq.com/docs/images/c.svg); }',
  ].join('\n');

  assert.deepEqual(findCssUrls(css), [
    { line: 1, url: '/images/a.svg' },
    { line: 2, url: 'images/b.svg' },
    { line: 3, url: 'https://www.checklyhq.com/docs/images/c.svg' },
  ]);
});

test('ignores url() in comments and keeps line numbers after them', () => {
  const css = [
    '/* Don\'t use url() here,',
    '   not even url("/images/a.svg"). */',
    '.a { background: url("/images/a.svg"); }',
  ].join('\n');

  assert.deepEqual(findCssUrls(css), [{ line: 3, url: '/images/a.svg' }]);
});

test('allows data URIs', () => {
  const css = `.a { mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"); }`;

  assert.deepEqual(findCssUrls(css), []);
});
