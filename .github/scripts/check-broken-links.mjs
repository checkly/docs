import { getBrokenInternalLinks } from '@mintlify/link-rot';
import { join } from 'node:path';
import { getNavigationPages } from './api-navigation.mjs';

const root = process.cwd();
const generated = new Set(getNavigationPages(root).filter(page => page.operation).map(page => page.slug));
const broken = (await getBrokenInternalLinks(root)).filter(link => !generated.has(link.toString()));

if (broken.length > 0) {
  for (const link of broken) {
    console.error(`${join(link.relativeDir, link.filename)}: ${link.originalPath}`);
  }
  process.exitCode = 1;
} else {
  console.log(`No broken internal links found; checked ${generated.size} generated API destinations.`);
}
