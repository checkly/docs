import assert from 'node:assert/strict';
import test from 'node:test';
import { extractSnippets, typecheckSnippets } from './typecheck-snippets.mjs';

const fence = '```';

test('extracts only code blocks that import from checkly, with their MDX start line', () => {
  const mdx = [
    '---',
    'title: Test',
    '---',
    '',
    `${fence}ts api.check.ts`,
    `import { ApiCheck } from 'checkly/constructs'`,
    `new ApiCheck('a', { name: 'A', request: { method: 'GET', url: 'https://x.dev' } })`,
    fence,
    '',
    `${fence}ts`,
    `request: { method: 'GET' }`,
    fence,
    '',
    `${fence}bash`,
    `npx checkly test`,
    fence,
  ].join('\n');

  const snippets = extractSnippets(mdx, 'constructs/api-check.mdx');

  assert.equal(snippets.length, 1);
  assert.equal(snippets[0].file, 'constructs/api-check.mdx');
  assert.equal(snippets[0].line, 6);
  assert.equal(snippets[0].ext, 'ts');
  assert.match(snippets[0].code, /^import \{ ApiCheck \}/);
});

test('strips fence indentation and maps js fences to .js', () => {
  const mdx = [
    '<Steps>',
    '  <Step>',
    `    ${fence}javascript`,
    `    const { ApiCheck } = {}`,
    `    import { Frequency } from "checkly/constructs"`,
    `    ${fence}`,
    '  </Step>',
    '</Steps>',
  ].join('\n');

  const [snippet] = extractSnippets(mdx, 'page.mdx');

  assert.equal(snippet.ext, 'js');
  assert.equal(snippet.line, 4);
  assert.equal(snippet.code, 'const { ApiCheck } = {}\nimport { Frequency } from "checkly/constructs"');
});

test('skips a block preceded by a typecheck-skip comment', () => {
  const mdx = [
    '{/* typecheck-skip */}',
    `${fence}ts`,
    `import { ApiCheck } from 'checkly/constructs'`,
    fence,
    '',
    `${fence}ts`,
    `import { ApiCheck } from 'checkly/constructs'`,
    fence,
  ].join('\n');

  const snippets = extractSnippets(mdx, 'page.mdx');

  assert.equal(snippets.length, 1);
  assert.equal(snippets[0].line, 7);
});

function snippet(code, line = 10) {
  return { file: 'page.mdx', line, ext: 'ts', code };
}

test('reports no errors for a valid construct', () => {
  const errors = typecheckSnippets([snippet([
    `import { ApiCheck, AssertionBuilder } from 'checkly/constructs'`,
    `new ApiCheck('a', {`,
    `  name: 'A',`,
    `  request: { method: 'GET', url: 'https://x.dev', assertions: [AssertionBuilder.statusCode().equals(200)] },`,
    `})`,
  ].join('\n'))]);

  assert.deepEqual(errors, []);
});

test('reports a construct API mismatch at the MDX line', () => {
  const errors = typecheckSnippets([snippet([
    `import { ApiCheck } from 'checkly/constructs'`,
    `new ApiCheck('a', {`,
    `  name: 'A',`,
    `  doesNotExist: true,`,
    `  request: { method: 'GET', url: 'https://x.dev' },`,
    `})`,
  ].join('\n'))]);

  assert.equal(errors.length, 1);
  assert.equal(errors[0].file, 'page.mdx');
  assert.equal(errors[0].line, 13);
  assert.match(errors[0].message, /doesNotExist/);
});

test('reports a missing construct export', () => {
  const errors = typecheckSnippets([snippet(`import { NotAConstruct } from 'checkly/constructs'`)]);

  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /NotAConstruct/);
});

test('ignores unresolvable relative imports from multi-file examples', () => {
  const errors = typecheckSnippets([snippet([
    `import { ApiCheck } from 'checkly/constructs'`,
    `import { group } from './group.check'`,
    `new ApiCheck('a', { name: 'A', group, request: { method: 'GET', url: 'https://x.dev' } })`,
  ].join('\n'))]);

  assert.deepEqual(errors, []);
});

test('allows missing required props in snippets marked with a "More options" comment', () => {
  const errors = typecheckSnippets([
    snippet(`import { BrowserCheck, Frequency } from 'checkly/constructs'\nnew BrowserCheck('a', {\n  frequency: Frequency.EVERY_5M,\n  /* More options... */\n})`),
    snippet(`import { TcpMonitor } from 'checkly/constructs'\nnew TcpMonitor('a', {\n  /* More options ... */\n})`),
  ]);

  assert.deepEqual(errors, []);
});

test('still reports wrong props in snippets marked with a "More options" comment', () => {
  const errors = typecheckSnippets([
    snippet(`import { BrowserCheck } from 'checkly/constructs'\nnew BrowserCheck('a', {\n  frequency: 'often',\n  /* More options... */\n})`),
    snippet(`import { BrowserCheck } from 'checkly/constructs'\nnew BrowserCheck('a', {\n  doesNotExist: true,\n  /* More options... */\n})`, 50),
  ]);

  assert.deepEqual(errors.map(e => e.line), [12, 52]);
});

test('reports missing required props in complete snippets', () => {
  const errors = typecheckSnippets([snippet(`import { BrowserCheck } from 'checkly/constructs'\nnew BrowserCheck('a', { name: 'A' })`)]);

  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /'code' is missing/);
});

test('reports syntax errors without hiding type errors in other snippets', () => {
  const errors = typecheckSnippets([
    snippet(`import { ApiCheck } from 'checkly/constructs'\nnew ApiCheck('a', {\n  ...\n})`, 10),
    snippet(`import { NotAConstruct } from 'checkly/constructs'`, 50),
  ]);

  // TypeScript reports the bare `...` at the next token, the closing `}`.
  assert.deepEqual(errors.map(e => e.line), [13, 50]);
});
