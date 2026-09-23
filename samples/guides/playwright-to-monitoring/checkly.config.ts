import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

export default defineConfig({
  projectName: 'Docs guide: Playwright tests to monitors',
  logicalId: 'docs-guide-playwright-to-monitoring',
  checks: {
    // Reuse the Playwright config your tests already run with.
    playwrightConfigPath: './playwright.config.ts',
    playwrightChecks: [
      {
        name: 'Shop critical flows',
        logicalId: 'shop-critical-flows',
        // Run only the `monitoring` project: the @monitor-tagged tests.
        pwProjects: ['monitoring'],
        frequency: Frequency.EVERY_10M,
        locations: ['us-east-1', 'eu-west-1'],
      },
    ],
  },
  cli: {
    runLocation: 'eu-west-1',
  },
})
