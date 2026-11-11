import { readFileSync, writeFileSync } from 'node:fs';

const filename = process.argv[2];
const spec = JSON.parse(readFileSync(filename, 'utf8'));
const ACCOUNT_HEADER = 'X-Checkly-Account';
const METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
// The only operations that take no account header. The upstream spec also omits the
// header parameter on some operations that need it, so its absence proves nothing.
const BEARER_ONLY = new Set([
  'GET /v1/badges/checks/{checkId}',
  'GET /v1/badges/groups/{groupId}',
  'GET /v1/elements-data',
]);

function clean(value) {
  if (typeof value === 'string') {
    return value
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/g, '[$2]($1)')
      .replace(/<code>([^<]*)<\/code>/g, '`$1`')
      .replace(/<\/br>|<br \/>|<br>/g, '\n')
      .replace(/<b>([^<]*)<\/?b>/g, '**$1**');
  }
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clean(child)]));
  }
  return value;
}

// Mintlify prefills only security scheme inputs from signed-in user data, so the
// account header is a scheme instead of a parameter.
function accountHeaderAsSecurity(document) {
  function resolve(node) {
    if (!node?.$ref) return node;
    const keys = node.$ref.slice(2).split('/').map(key => key.replaceAll('~1', '/').replaceAll('~0', '~'));
    return resolve(keys.reduce((parent, key) => parent?.[key], document));
  }

  function withoutAccountHeader(node) {
    const parameters = node.parameters?.filter(parameter => {
      const { name, in: location } = resolve(parameter) ?? {};
      return location !== 'header' || name?.toLowerCase() !== ACCOUNT_HEADER.toLowerCase();
    });
    if (parameters?.length === node.parameters?.length) return node;
    if (parameters.length > 0) return { ...node, parameters };
    const { parameters: _, ...rest } = node;
    return rest;
  }

  const paths = Object.fromEntries(Object.entries(document.paths).map(([path, pathItem]) => {
    const item = withoutAccountHeader(pathItem);
    return [path, Object.fromEntries(Object.entries(item).map(([key, value]) => {
      if (!METHODS.includes(key)) return [key, value];
      const operation = withoutAccountHeader(value);
      if (!BEARER_ONLY.has(`${key.toUpperCase()} ${path}`)) return [key, operation];
      return [key, { ...operation, security: [{ Bearer: [] }] }];
    }))];
  }));

  return {
    ...document,
    security: [{ Bearer: [], [ACCOUNT_HEADER]: [] }],
    components: {
      ...document.components,
      securitySchemes: {
        ...document.components?.securitySchemes,
        [ACCOUNT_HEADER]: {
          type: 'apiKey',
          in: 'header',
          name: ACCOUNT_HEADER,
          description: 'Your Checkly account ID. Requests act on this account. You can find it under **Account ID** in your [account settings](https://app.checklyhq.com/settings/account/general).',
        },
      },
    },
    paths,
  };
}

writeFileSync(filename, JSON.stringify(accountHeaderAsSecurity(clean(spec))) + '\n');
