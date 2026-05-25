#!/usr/bin/env node

/**
 * detect-new-endpoints.mjs
 *
 * For every endpoint that exists in api-reference/openapi.json but has no
 * MDX page yet, generate an MDX stub and add it to docs.json navigation.
 * Writes changes directly to the working tree — the caller (CI workflow)
 * is responsible for committing/pushing.
 *
 * Env vars:
 *   DRY_RUN=1    — log what would change, don't write files
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse as yamlParse } from './yaml-lite.mjs';

const DRY_RUN = process.env.DRY_RUN === '1';
const ROOT = process.cwd();
const SPEC_PATH = join(ROOT, 'api-reference', 'openapi.json');
const DOCS_JSON_PATH = join(ROOT, 'docs.json');
const IGNORE_PATH = join(ROOT, '.api-doc-ignore');

// ---------------------------------------------------------------------------
// Tag → directory + docs.json group mapping.
// Built from current repo state. Fallback: slugify the tag.
// ---------------------------------------------------------------------------

const TAG_MAP = {
  'Accounts':              { dir: 'accounts',            group: 'Accounts' },
  'Alert channels':        { dir: 'alert-channels',      group: 'Alert Channels' },
  'Alert notifications':   { dir: 'alert-notifications', group: 'Alert Notifications' },
  'Analytics':             { dir: 'analytics',           group: 'Analytics' },
  'Badges':                { dir: 'badges',              group: 'Badges' },
  'cancel':                { dir: 'cancel',              group: 'Cancel' },
  'Check alerts':          { dir: 'check-alerts',        group: 'Check Alerts' },
  'Check groups':          { dir: 'check-groups',        group: 'Check Groups' },
  'Check results':         { dir: 'check-results',       group: 'Check Results' },
  'Check sessions':        { dir: 'check-sessions',      group: 'Check Sessions' },
  'Check status':          { dir: 'check-status',        group: 'Check Status' },
  'Checks':                { dir: 'checks',              group: 'Checks and Monitors' },
  'Client certificates':   { dir: 'client-certificates', group: 'Client Certificates' },
  'Dashboards':            { dir: 'dashboards',          group: 'Dashboards' },
  'Environment variables': { dir: 'environment-variables', group: 'Environment Variables' },
  'Error Groups':          { dir: 'error-groups',        group: 'Error Groups' },
  'Heartbeats':            { dir: 'heartbeats',          group: 'Checks and Monitors' },
  'Incident Updates':      { dir: 'incident-updates',    group: 'Dashboard Incident Updates' },
  'Incidents':             { dir: 'incidents',           group: 'Dashboard Incidents' },
  'Location':              { dir: 'location',            group: 'Locations' },
  'Maintenance windows':   { dir: 'maintenance-windows', group: 'Maintenance Windows' },
  'Monitors':              { dir: 'monitors',            group: 'Checks and Monitors' },
  'Private locations':     { dir: 'private-locations',   group: 'Private Locations' },
  'Reporting':             { dir: 'reporting',           group: 'Reporting' },
  'Runtimes':              { dir: 'runtimes',            group: 'Runtimes' },
  'Snippets':              { dir: 'snippets',            group: 'Snippets' },
  'Static IPs':            { dir: 'static-ips',          group: 'Static IPs' },
  'Status Page Incidents': { dir: 'status-page-incidents', group: 'Status Page Incidents' },
  'Status Page Services':  { dir: 'status-page-services', group: 'Status Page Services' },
  'Status Pages':          { dir: 'status-pages',        group: 'Status Pages' },
  'Subscriptions':         { dir: 'status-pages',        group: 'Status Page Subscribers' },
  'Test sessions':         { dir: 'test-sessions',       group: 'Test Sessions' },
  'Triggers':              { dir: 'triggers',            group: 'Check Triggers' },
};

// Monitor-type endpoints under the "Checks" or "Monitors" tag go into
// specific subgroups within "Checks and Monitors".
const MONITOR_SUBGROUP_PATTERNS = [
  { pattern: /icmp/i,   dir: 'monitors', subgroup: 'ICMP Monitor' },
  { pattern: /dns/i,    dir: 'monitors', subgroup: 'DNS Monitor' },
  { pattern: /tcp/i,    dir: 'checks',   subgroup: 'TCP Monitor' },
  { pattern: /url/i,    dir: 'monitors', subgroup: 'URL Monitor' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\[.*?\]\s*/g, '')     // strip [beta] etc.
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadSpec() {
  const raw = readFileSync(SPEC_PATH, 'utf-8');
  // OpenAPI descriptions may contain literal control chars (newlines in JSON strings)
  return JSON.parse(raw.replace(/[\x00-\x1f]/g, (ch) => {
    if (ch === '\n') return '\\n';
    if (ch === '\r') return '\\r';
    if (ch === '\t') return '\\t';
    return '';
  }));
}

function loadExclusions() {
  if (!existsSync(IGNORE_PATH)) return new Set();
  const raw = readFileSync(IGNORE_PATH, 'utf-8');
  const parsed = yamlParse(raw);
  const list = parsed?.excluded_endpoints ?? [];
  return new Set(list.map((e) => e.trim()));
}

// Trailing slashes are equivalent in OpenAPI but the spec and existing MDX
// files disagree on them — normalise so `/foo` and `/foo/` match.
function normalisePath(p) {
  return p.length > 1 ? p.replace(/\/+$/, '') : p;
}

function scanExistingMdx() {
  const documented = new Set();
  const apiRefDir = join(ROOT, 'api-reference');

  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!entry.name.endsWith('.mdx')) continue;
      const content = readFileSync(full, 'utf-8');
      const match = content.match(/openapi:\s*(get|post|put|delete|patch)\s+(\/\S+)/i);
      if (match) {
        documented.add(`${match[1].toUpperCase()} ${normalisePath(match[2])}`);
      }
    }
  }
  walk(apiRefDir);
  return documented;
}

function resolveMapping(tag, summary) {
  const mapping = TAG_MAP[tag];
  if (!mapping) {
    // Unknown tag — create new directory and group from tag name
    return { dir: slugify(tag), group: tag, subgroup: null };
  }

  // For tags that map to "Checks and Monitors", check if it's a monitor subtype
  if (mapping.group === 'Checks and Monitors' && (tag === 'Checks' || tag === 'Monitors')) {
    for (const mp of MONITOR_SUBGROUP_PATTERNS) {
      if (mp.pattern.test(summary)) {
        return { dir: mp.dir, group: 'Checks and Monitors', subgroup: mp.subgroup };
      }
    }
  }

  return { dir: mapping.dir, group: mapping.group, subgroup: null };
}

function generateFilename(summary) {
  const slug = slugify(summary);
  return slug || 'unnamed-endpoint';
}

function getVersionSuffix(path) {
  const match = path.match(/^\/(v\d+)\//);
  return match ? `-${match[1]}` : '';
}

function getUniqueFilename(ep) {
  const baseFilename = generateFilename(ep.summary);
  const candidates = [
    baseFilename,
    `${baseFilename}${getVersionSuffix(ep.path)}`,
    `${baseFilename}-${ep.method.toLowerCase()}-${slugify(ep.path)}`,
  ];

  for (const filename of candidates) {
    const mdxPath = join(ROOT, 'api-reference', ep.dir, `${filename}.mdx`);
    if (!existsSync(mdxPath)) {
      return filename;
    }

    const content = readFileSync(mdxPath, 'utf-8');
    const match = content.match(/openapi:\s*(get|post|put|delete|patch)\s+(\/\S+)/i);
    if (match && `${match[1].toUpperCase()} ${match[2]}` === ep.key) {
      return filename;
    }
  }

  return `${baseFilename}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// docs.json updater
// ---------------------------------------------------------------------------

function addToDocsJson(docsJson, pagePath, groupName, subgroupName) {
  // Structure: docsJson.navigation.tabs[] → { tab: "API Reference", pages: [...] }
  const tabs = docsJson.navigation?.tabs ?? [];
  const apiTab = tabs.find((t) => t.tab === 'API Reference');
  if (!apiTab) {
    console.warn('  ⚠ Could not find API Reference tab in docs.json');
    return false;
  }

  // Find "API Reference" group within the API tab's pages
  const apiRefGroup = (apiTab.pages ?? []).find(
    (g) => typeof g === 'object' && g.group === 'API Reference'
  );
  if (!apiRefGroup) {
    console.warn('  ⚠ Could not find "API Reference" group in docs.json');
    return false;
  }

  // Find the target group within API Reference
  let targetGroup = apiRefGroup.pages.find(
    (g) => typeof g === 'object' && g.group === groupName
  );

  // Create group if it doesn't exist
  if (!targetGroup) {
    targetGroup = { group: groupName, pages: [] };
    apiRefGroup.pages.push(targetGroup);
    console.log(`  + Created new group "${groupName}" in docs.json`);
  }

  // If there's a subgroup, find or create it within the target group
  if (subgroupName) {
    let subgroup = targetGroup.pages.find(
      (g) => typeof g === 'object' && g.group === subgroupName
    );
    if (!subgroup) {
      subgroup = { group: subgroupName, pages: [] };
      targetGroup.pages.push(subgroup);
      console.log(`  + Created new subgroup "${subgroupName}" in docs.json`);
    }
    if (!subgroup.pages.includes(pagePath)) {
      subgroup.pages.push(pagePath);
    }
  } else {
    if (!targetGroup.pages.includes(pagePath)) {
      targetGroup.pages.push(pagePath);
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log(DRY_RUN ? '🏃 DRY RUN MODE\n' : '🚀 Scanning for undocumented endpoints\n');

  const spec = loadSpec();
  const exclusions = loadExclusions();
  const documented = scanExistingMdx();

  console.log(`📋 Spec paths: ${Object.keys(spec.paths).length}`);
  console.log(`📄 Already documented: ${documented.size}`);
  console.log(`🚫 Excluded: ${exclusions.size}`);

  // Find undocumented endpoints
  const undocumented = [];
  for (const [rawPath, methods] of Object.entries(spec.paths)) {
    const path = normalisePath(rawPath);
    for (const [method, details] of Object.entries(methods)) {
      if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) continue;
      const key = `${method.toUpperCase()} ${path}`;

      if (documented.has(key)) continue;
      if (exclusions.has(key)) {
        console.log(`  ⏭ ${key} — excluded`);
        continue;
      }

      const tag = details.tags?.[0] ?? '';
      const summary = details.summary ?? '';
      const { dir, group, subgroup } = resolveMapping(tag, summary);

      const ep = { key, method: method.toUpperCase(), path, tag, summary, dir, group, subgroup };
      undocumented.push({ ...ep, filename: getUniqueFilename(ep) });
    }
  }

  if (undocumented.length === 0) {
    console.log('\n✅ All endpoints are documented (or excluded). Nothing to do.');
    return;
  }

  console.log(`\n🆕 Found ${undocumented.length} undocumented endpoint(s):\n`);
  for (const ep of undocumented) {
    console.log(`  ${ep.key}  →  ${ep.dir}/${ep.filename}.mdx  [${ep.group}${ep.subgroup ? ' > ' + ep.subgroup : ''}]`);
  }

  // Mutate docs.json in memory; write once at the end.
  const docsJson = JSON.parse(readFileSync(DOCS_JSON_PATH, 'utf-8'));

  for (const ep of undocumented) {
    const mdxRelPath = `api-reference/${ep.dir}/${ep.filename}.mdx`;
    const docsJsonPagePath = `api-reference/${ep.dir}/${ep.filename}`;

    const mdxDir = join(ROOT, 'api-reference', ep.dir);
    if (!existsSync(mdxDir)) {
      if (!DRY_RUN) mkdirSync(mdxDir, { recursive: true });
      console.log(`  + Created directory: api-reference/${ep.dir}/`);
    }

    // Minimal frontmatter — Mintlify derives the title from the spec summary.
    const mdxContent = `---\nopenapi: ${ep.method.toLowerCase()} ${ep.path}\n---\n`;

    if (!DRY_RUN) {
      writeFileSync(join(ROOT, mdxRelPath), mdxContent);
    }
    console.log(`  + Created ${mdxRelPath}`);

    const added = addToDocsJson(docsJson, docsJsonPagePath, ep.group, ep.subgroup);
    if (!added) {
      throw new Error(`Could not add ${docsJsonPagePath} to docs.json`);
    }
    console.log(`  + Added to docs.json → ${ep.group}${ep.subgroup ? ' > ' + ep.subgroup : ''}`);
  }

  if (!DRY_RUN) {
    writeFileSync(DOCS_JSON_PATH, JSON.stringify(docsJson, null, 2) + '\n');
  }

  console.log(`\n========================================`);
  console.log(`✅ Generated ${undocumented.length} new page(s).`);
}

try {
  main();
} catch (err) {
  console.error('❌ Fatal error:', err);
  process.exit(1);
}
