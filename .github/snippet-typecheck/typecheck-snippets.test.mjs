import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { extractSnippets, mdxFiles, typecheckSnippets } from './typecheck-snippets.mjs';

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

test('extracts JavaScript blocks that require checkly', () => {
  const mdx = [`${fence}js api.check.js`, `const { ApiCheck } = require('checkly/constructs')`, fence].join('\n');

  const snippets = extractSnippets(mdx, 'page.mdx');

  assert.equal(snippets.length, 1);
  assert.equal(snippets[0].ext, 'js');
});

test('reports construct API mismatches in CommonJS snippets', () => {
  const errors = typecheckSnippets([{ ...snippet([
    `const { ApiCheck } = require('checkly/constructs')`,
    `new ApiCheck('a', {`,
    `  name: 'A',`,
    `  request: { method: 'Foo', url: 'https://x.dev' },`,
    `})`,
  ].join('\n')), ext: 'js' }]);

  assert.equal(errors.length, 1);
  assert.equal(errors[0].line, 13);
  assert.match(errors[0].message, /Foo/);
});

test('extracts unmarked blocks that use a checkly export as statement fragments', () => {
  const mdx = [
    `${fence}ts Login Flow`,
    `new BrowserCheck('login', { name: 'Login' })`,
    fence,
    '',
    `${fence}ts`,
    `UrlAssertionBuilder.statusCode().equals(200)`,
    fence,
    '',
    `${fence}js`,
    `const res = await fetch(new Request('https://x.dev'))`,
    fence,
    '',
    `${fence}ts`,
    `const frequency = 'often'`,
    fence,
  ].join('\n');

  const snippets = extractSnippets(mdx, 'page.mdx');

  assert.deepEqual(snippets.map(s => [s.line, s.wrap]), [[2, true], [6, true]]);
});

test('ignores the object literal after an "Equivalent to" comment', () => {
  const errors = typecheckSnippets([
    fragment(`UrlAssertionBuilder.statusCode().equals(200)\n// Equivalent to:\n{ source: 'STATUS_CODE', comparison: 'EQUALS', target: '200' }`, true),
    fragment(`UrlAssertionBuilder.statusCode().isFast()\n// Equivalent to:\n{ source: 'STATUS_CODE' }`, true, 30),
  ]);

  assert.deepEqual(errors.map(e => e.line), [30]);
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

test('extracts fragments marked with typecheck-wrap even without a checkly import', () => {
  const mdx = [
    '{/* typecheck-wrap: ApiCheck */}',
    `${fence}ts REST API`,
    `request: { method: 'GET', url: 'https://x.dev' },`,
    fence,
  ].join('\n');

  const [fragment] = extractSnippets(mdx, 'page.mdx');

  assert.equal(fragment.wrap, 'ApiCheck');
  assert.equal(fragment.line, 3);
});

test('finds MDX files outside node_modules folders at any depth', () => {
  const root = mkdtempSync(join(tmpdir(), 'snippets-'));
  for (const dir of ['docs', 'node_modules/pkg', 'tools/node_modules/pkg']) mkdirSync(join(root, dir), { recursive: true });
  for (const file of ['docs/page.mdx', 'node_modules/pkg/readme.mdx', 'tools/node_modules/pkg/readme.mdx']) writeFileSync(join(root, file), '');

  assert.deepEqual(mdxFiles(root).map(f => f.slice(root.length + 1)), ['docs/page.mdx']);
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

test('allows missing required props on typed variables marked with a "More options" comment', () => {
  const errors = typecheckSnippets([
    fragment(`const trigger: IncidentTrigger = {\n  service: searchService,\n  /* More options... */\n}`, true),
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

function fragment(code, wrap = 'ApiCheck', line = 10) {
  return { file: 'page.mdx', line, ext: 'ts', code, wrap };
}

test('typechecks a property fragment inside the wrap construct with auto-imports', () => {
  const errors = typecheckSnippets([fragment([
    `request: {`,
    `  method: 'GET',`,
    `  url: 'https://x.dev',`,
    `  assertions: [AssertionBuilder.statusCode().equals(200)],`,
    `},`,
    `frequency: Frequency.EVERY_5M,`,
  ].join('\n'))]);

  assert.deepEqual(errors, []);
});

test('reports wrong props in a wrapped fragment at the MDX line', () => {
  const errors = typecheckSnippets([fragment([
    `request: {`,
    `  method: 'GTE',`,
    `  url: 'https://x.dev',`,
    `},`,
  ].join('\n'))]);

  assert.equal(errors.length, 1);
  assert.equal(errors[0].line, 11);
  assert.match(errors[0].message, /GTE/);
});

test('auto-imports node:path for fragments that reference entrypoint files', () => {
  const errors = typecheckSnippets([fragment(`setupScript: { entrypoint: path.join(__dirname, 'setup.ts') },`)]);

  assert.deepEqual(errors, []);
});

test('extracts fragments marked with typecheck-wrap without a construct name', () => {
  const mdx = ['{/* typecheck-wrap */}', `${fence}ts`, `UrlAssertionBuilder.statusCode().equals(200)`, fence].join('\n');

  const [marked] = extractSnippets(mdx, 'page.mdx');

  assert.equal(marked.wrap, true);
});

test('only adds imports to statement fragments', () => {
  const errors = typecheckSnippets([
    fragment(`const alert = AlertEscalationBuilder.runBasedEscalation(2)`, true),
    fragment(`UrlAssertionBuilder.statusCode().equals(200)`, true),
    fragment(`UrlAssertionBuilder.statusCode().isFast()`, true, 30),
  ]);

  assert.deepEqual(errors.map(e => e.line), [30]);
});

test('ignores undeclared lowercase names in fragments, which refer to page context', () => {
  const errors = typecheckSnippets([
    fragment(`new ApiCheck('api', {\n  group,\n  name: 'API',\n  alertChannels: [slackChannel],\n  request: { method: 'GET', url: 'https://x.dev' },\n})`),
    fragment(`new NotAConstruct('a', {})`, true, 30),
    snippet(`import { ApiCheck } from 'checkly/constructs'\nnew ApiCheck('a', { name: 'A', group, request: { method: 'GET', url: 'https://x.dev' } })`, 50),
  ]);

  assert.deepEqual(errors.map(e => e.line), [30, 51]);
});

test('auto-imports type-only exports like IncidentTrigger', () => {
  const errors = typecheckSnippets([
    fragment(`const trigger: IncidentTrigger = {\n  name: 'Search down',\n  description: 'Search is failing',\n  severity: 'MAJOR',\n  notifySubscribers: true,\n  service: searchService,\n}`, true),
    fragment(`const trigger: NotAType = {}`, true, 30),
  ]);

  assert.deepEqual(errors.map(e => e.line), [30]);
});

test('auto-imports only value exports into JavaScript fragments', () => {
  const errors = typecheckSnippets([{ ...fragment(`UrlAssertionBuilder.statusCode().equals(200)`, true), ext: 'js' }]);

  assert.deepEqual(errors, []);
});

test('auto-imports defineConfig from checkly', () => {
  const errors = typecheckSnippets([fragment(`export default defineConfig({\n  projectName: 'P',\n  logicalId: 'p',\n})`, true)]);

  assert.deepEqual(errors, []);
});

test('wraps property fragments that start with a comment', () => {
  const errors = typecheckSnippets([fragment(`// Fail fast\nmaxResponseTime: 'slow',`)]);

  assert.equal(errors.length, 1);
  assert.equal(errors[0].line, 11);
});

test('only adds imports to a marked fragment that already calls the constructor', () => {
  const errors = typecheckSnippets([fragment([
    `new ApiCheck('a', {`,
    `  name: 'A',`,
    `  maxResponseTime: 'slow',`,
    `  request: { method: 'GET', url: 'https://x.dev' },`,
    `})`,
  ].join('\n'))]);

  assert.equal(errors.length, 1);
  assert.equal(errors[0].line, 12);
});

test('reports syntax errors without hiding type errors in other snippets', () => {
  const errors = typecheckSnippets([
    snippet(`import { ApiCheck } from 'checkly/constructs'\nnew ApiCheck('a', {\n  ...\n})`, 10),
    snippet(`import { NotAConstruct } from 'checkly/constructs'`, 50),
  ]);

  // TypeScript reports the bare `...` at the next token, the closing `}`.
  assert.deepEqual(errors.map(e => e.line), [13, 50]);
});
