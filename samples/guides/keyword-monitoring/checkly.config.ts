import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

export default defineConfig({
  projectName: 'Docs guide: Monitor the content your customers need to see',
  logicalId: 'docs-guide-keyword-monitoring',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    tags: ['guide-keyword-monitoring'],
    checkMatch: '**/checks/**/*.check.ts',
    playwrightConfigPath: './playwright.config.ts',
    playwrightChecks: [
      {
        name: 'Shop home page content',
        logicalId: 'shop-home-content',
        frequency: Frequency.EVERY_5M,
        locations: ['us-east-1', 'eu-west-1'],
      },
    ],
  },
  cli: { runLocation: 'us-east-1' },
})
