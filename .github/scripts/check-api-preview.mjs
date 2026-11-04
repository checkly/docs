import { getNavigationPages } from './api-navigation.mjs';

const base = new URL(process.argv[2].replace(/\/?$/, '/'));
const pages = getNavigationPages(process.cwd()).filter((page) => page.operation);
const failures = [];

// Mintlify previews occasionally answer a single request with a 500.
async function verifyPage(url, attempts = 3) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      await response.body?.cancel();
      if (response.ok) return;
      if (response.status < 500) throw Object.assign(new Error(`HTTP ${response.status}`), { final: true });
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (error.final || attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }
}

for (let start = 0; start < pages.length; start += 4) {
  await Promise.all(pages.slice(start, start + 4).map(async ({ slug }) => {
    const url = new URL(`${slug}/`, base);
    try {
      await verifyPage(url);
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
