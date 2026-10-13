import { getNavigationPages } from './api-navigation.mjs';

const base = new URL(process.argv[2].replace(/\/?$/, '/'));
const pages = getNavigationPages(process.cwd()).filter((page) => page.operation);
const failures = [];

for (let start = 0; start < pages.length; start += 4) {
  await Promise.all(pages.slice(start, start + 4).map(async ({ slug }) => {
    const url = new URL(`${slug}/`, base);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      await response.body?.cancel();
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      console.log(`OK ${url}`);
    } catch (error) {
      failures.push(`${url}: ${error.message}`);
    }
  }));
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Verified ${pages.length} schema-generated API pages.`);
}
