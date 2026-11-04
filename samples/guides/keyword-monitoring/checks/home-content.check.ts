import { BrowserCheck, Frequency } from 'checkly/constructs'
import * as path from 'path'

// The same spec file as a single Browser Check.
new BrowserCheck('shop-home-content-browser-check', {
  name: 'Shop home page content (Browser Check)',
  frequency: Frequency.EVERY_5M,
  locations: ['us-east-1', 'eu-west-1'],
  code: {
    entrypoint: path.join(__dirname, '../tests/home-content.spec.ts'),
  },
  // Runs with `npx checkly test` but is skipped by `npx checkly deploy`,
  // so this sample deploys only the Check Suite.
  testOnly: true,
})
