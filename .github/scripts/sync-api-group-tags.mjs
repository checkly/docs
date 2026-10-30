import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { OPENAPI_ENDPOINT, readOpenApiSpec } from './api-navigation.mjs';

const root = process.cwd();
const filename = join(root, 'docs.json');
const docs = JSON.parse(readFileSync(filename, 'utf8'));
const specs = new Map();
const changed = [];

function walk(node) {
  if (Array.isArray(node)) return node.flatMap(walk);
  if (typeof node === 'string') {
    const endpoint = node.match(OPENAPI_ENDPOINT);
    if (!endpoint) return [undefined];
    const [, source, method, path] = endpoint;
    if (!specs.has(source)) specs.set(source, readOpenApiSpec(join(root, source)));
    const operation = specs.get(source).paths?.[path]?.[method.toLowerCase()];
    if (!operation) throw new Error(`${node}: operation missing from schema`);
    return [operation];
  }
  if (!node || typeof node !== 'object') return [];

  const operations = Array.isArray(node.pages)
    ? walk(node.pages)
    : Object.values(node).filter(value => value && typeof value === 'object').flatMap(walk);
  if (node.group) {
    const previous = node.tag;
    if (operations.length > 0 && operations.every(operation => operation?.deprecated === true)) {
      node.tag = 'Deprecated';
    } else if (node.tag === 'Deprecated') {
      delete node.tag;
    }
    if (previous !== node.tag) changed.push(node.group);
  }
  return operations;
}

const apiTab = docs.navigation?.tabs?.find(tab => tab.tab === 'API Reference');
if (!apiTab) throw new Error('API Reference tab missing from docs.json');
walk(apiTab);
if (changed.length > 0 && process.argv.includes('--check')) {
  console.error(`API group tags are stale: ${changed.join(', ')}. Run npm run sync:api-group-tags.`);
  process.exitCode = 1;
} else {
  if (changed.length > 0) writeFileSync(filename, JSON.stringify(docs, null, 2) + '\n');
  console.log(`API group tags match the schema; ${changed.length} group(s) updated.`);
}
