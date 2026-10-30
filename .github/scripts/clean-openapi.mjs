import { readFileSync, writeFileSync } from 'node:fs';

const filename = process.argv[2];
const spec = JSON.parse(readFileSync(filename, 'utf8'));

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

writeFileSync(filename, JSON.stringify(clean(spec)) + '\n');
