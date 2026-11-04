import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scripts = dirname(fileURLToPath(import.meta.url));
const href = '/api-reference/usage/existing-probe-url';
const canonical = `https://www.checklyhq.com/docs${href}/`;

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'api-navigation-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, '.github/scripts'), { recursive: true });
  mkdirSync(join(root, 'api-reference'));
  mkdirSync(join(root, 'guides'));
  for (const file of ['api-navigation.mjs', 'generate-sitemap.mjs', 'check-redirect-destinations.mjs', 'detect-new-endpoints.mjs', 'yaml-lite.mjs', 'clean-openapi.mjs', 'sync-api-group-tags.mjs']) {
    copyFileSync(join(scripts, file), join(root, '.github/scripts', file));
  }
  const spec = {
    openapi: '3.0.3', info: { title: 'Probe', version: '1.0' },
    paths: { '/probe': { get: {
      summary: 'Get probe', tags: ['Usage'], responses: { 200: { description: 'OK' } },
      'x-mint': { href, metadata: { canonical } },
    } } },
  };
  const docs = {
    navigation: { tabs: [{ tab: 'API Reference', pages: [{ group: 'API Reference', pages: [
      { group: 'Usage', pages: ['api-reference/openapi.json GET /probe', 'guides/example'] },
    ] }] }] },
    redirects: [{ source: '/reference/getprobe', destination: href }],
  };
  writeFileSync(join(root, 'docs.json'), JSON.stringify(docs));
  writeFileSync(join(root, 'api-reference/openapi.json'), JSON.stringify(spec, null, 2));
  writeFileSync(join(root, 'guides/example.mdx'), '---\ntitle: Example\n---\n');
  const run = (file, ...args) => spawnSync(process.execPath, [join(root, '.github/scripts', file), ...args], { cwd: root, encoding: 'utf8' });
  return { root, spec, docs, run };
}

test('native endpoint URLs stay in the sitemap and redirects without regenerating MDX stubs', (t) => {
  const { root, docs, run } = fixture(t);
  const sitemap = run('generate-sitemap.mjs');
  assert.equal(sitemap.status, 0, sitemap.stderr);
  const xml = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  assert.ok(xml.includes(`<loc>${canonical}</loc>`));
  assert.ok(xml.includes('<loc>https://www.checklyhq.com/docs/guides/example/</loc>'));
  assert.ok(!xml.includes('openapi.json GET'));
  const redirects = run('check-redirect-destinations.mjs');
  assert.equal(redirects.status, 0, redirects.stderr);
  const discovery = run('detect-new-endpoints.mjs');
  assert.equal(discovery.status, 0, discovery.stderr);
  assert.deepEqual(JSON.parse(readFileSync(join(root, 'docs.json'), 'utf8')), docs);
  assert.ok(!existsSync(join(root, 'api-reference/usage')));

  docs.redirects[0].destination = '/guides/example';
  writeFileSync(join(root, 'docs.json'), JSON.stringify(docs));
  const authored = run('check-redirect-destinations.mjs');
  assert.equal(authored.status, 0, authored.stderr);
  rmSync(join(root, 'guides/example.mdx'));
  const stale = run('check-redirect-destinations.mjs');
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /\/reference\/getprobe -> \/guides\/example/);

  docs.redirects[0].destination = '/removed-page';
  writeFileSync(join(root, 'docs.json'), JSON.stringify(docs));
  const broken = run('check-redirect-destinations.mjs');
  assert.equal(broken.status, 1);
  assert.match(broken.stderr, /\/reference\/getprobe -> \/removed-page/);
});

test('an authored MDX file cannot shadow a schema-generated endpoint', (t) => {
  const { root, run } = fixture(t);
  mkdirSync(join(root, 'api-reference/usage'));
  writeFileSync(join(root, `${href}.mdx`), '---\nopenapi: GET /probe\n---\n');
  const result = run('generate-sitemap.mjs');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /would overwrite the schema-generated page/);
});

test('new endpoints with x-mint URLs use native navigation instead of MDX files', (t) => {
  const { root, spec, docs, run } = fixture(t);
  const newHref = '/api-reference/usage/new-probe';
  spec.paths['/new-probe'] = { get: {
    summary: 'Get new probe', tags: ['Usage'], responses: { 200: { description: 'OK' } },
    'x-mint': { href: newHref, metadata: { canonical: `https://www.checklyhq.com/docs${newHref}/` } },
  } };
  writeFileSync(join(root, 'api-reference/openapi.json'), JSON.stringify(spec, null, 2));
  const discovery = run('detect-new-endpoints.mjs');
  assert.equal(discovery.status, 0, discovery.stderr);
  const updated = JSON.parse(readFileSync(join(root, 'docs.json'), 'utf8'));
  const usage = updated.navigation.tabs[0].pages[0].pages[0].pages;
  assert.deepEqual(usage, [...docs.navigation.tabs[0].pages[0].pages[0].pages, 'api-reference/openapi.json GET /new-probe']);
  assert.ok(!existsSync(join(root, 'api-reference/usage')));
  const repeated = run('detect-new-endpoints.mjs');
  assert.equal(repeated.status, 0, repeated.stderr);
  assert.deepEqual(JSON.parse(readFileSync(join(root, 'docs.json'), 'utf8')), updated);
});

test('navigation rejects invalid JSON and noncanonical generated URLs', (t) => {
  const { root, spec, run } = fixture(t);
  spec.paths['/probe'].get.description = 'First line\nSecond line';
  const legacy = JSON.stringify(spec).replace('First line\\nSecond line', 'First line\nSecond line');
  writeFileSync(join(root, 'api-reference/openapi.json'), legacy);
  const malformed = run('generate-sitemap.mjs');
  assert.notEqual(malformed.status, 0);
  assert.match(malformed.stderr, /JSON/);
  spec.paths['/probe'].get['x-mint'].metadata.canonical = canonical.slice(0, -1);
  writeFileSync(join(root, 'api-reference/openapi.json'), JSON.stringify(spec));
  const invalid = run('generate-sitemap.mjs');
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /generated endpoint canonical must be/);
});

test('HTML cleanup preserves valid JSON and Markdown line breaks', (t) => {
  const { root, spec, run } = fixture(t);
  const filename = join(root, 'api-reference/openapi.json');
  spec.paths['/probe'].get.description = '<a href="https://example.com/docs">Docs</a><br><code>x</code><br /><b>bold</b></br><b>legacy<b>';
  writeFileSync(filename, JSON.stringify(spec));
  const result = run('clean-openapi.mjs', filename);
  assert.equal(result.status, 0, result.stderr);
  const cleaned = JSON.parse(readFileSync(filename, 'utf8'));
  assert.equal(cleaned.paths['/probe'].get.description, '[Docs](https://example.com/docs)\n`x`\n**bold**\n**legacy**');
  delete cleaned.paths['/probe'].get.description;
  delete spec.paths['/probe'].get.description;
  assert.deepEqual(cleaned, spec);
});

test('group badges follow all child operations and stale badges fail validation without rewriting navigation', (t) => {
  const { root, spec, docs, run } = fixture(t);
  const group = docs.navigation.tabs[0].pages[0].pages[0];
  group.pages = ['api-reference/openapi.json GET /probe'];
  docs.navigation.tabs.push({ tab: 'Docs', pages: [{ group: 'Legacy guides', tag: 'Deprecated', pages: ['guides/example'] }] });
  spec.paths['/probe'].get.deprecated = true;
  const save = () => {
    writeFileSync(join(root, 'docs.json'), JSON.stringify(docs));
    writeFileSync(join(root, 'api-reference/openapi.json'), JSON.stringify(spec));
  };
  const readGroup = () => JSON.parse(readFileSync(join(root, 'docs.json'), 'utf8')).navigation.tabs[0].pages[0].pages[0];
  save();
  const stale = run('sync-api-group-tags.mjs', '--check');
  assert.equal(stale.status, 1);
  assert.match(stale.stderr, /API group tags are stale: Usage/);
  assert.deepEqual(JSON.parse(readFileSync(join(root, 'docs.json'), 'utf8')), docs);
  const synced = run('sync-api-group-tags.mjs');
  assert.equal(synced.status, 0, synced.stderr);
  assert.deepEqual(readGroup(), { ...group, tag: 'Deprecated' });
  assert.deepEqual(JSON.parse(readFileSync(join(root, 'docs.json'), 'utf8')).navigation.tabs[1], docs.navigation.tabs[1]);
  const first = readFileSync(join(root, 'docs.json'), 'utf8');
  assert.equal(run('sync-api-group-tags.mjs').status, 0);
  assert.equal(readFileSync(join(root, 'docs.json'), 'utf8'), first);
  assert.equal(run('sync-api-group-tags.mjs', '--check').status, 0);

  group.tag = 'Deprecated';
  spec.paths['/active'] = { get: { responses: { 200: { description: 'OK' } } } };
  group.pages.push('api-reference/openapi.json GET /active');
  save();
  assert.equal(run('sync-api-group-tags.mjs', '--check').status, 1);
  assert.equal(run('sync-api-group-tags.mjs').status, 0);
  const { tag, ...withoutTag } = group;
  assert.deepEqual(readGroup(), withoutTag);

  spec.paths['/active'].get.deprecated = true;
  group.pages.push('guides/example');
  save();
  assert.equal(run('sync-api-group-tags.mjs').status, 0);
  assert.deepEqual(readGroup(), withoutTag);
  group.tag = 'New';
  save();
  assert.equal(run('sync-api-group-tags.mjs').status, 0);
  assert.deepEqual(readGroup(), group);

  delete spec.paths['/probe'];
  save();
  const missing = run('sync-api-group-tags.mjs');
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /operation missing from schema/);
  assert.deepEqual(JSON.parse(readFileSync(join(root, 'docs.json'), 'utf8')), docs);
});
