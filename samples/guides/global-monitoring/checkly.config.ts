import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

export default defineConfig({
  projectName: 'Docs guide: Global monitoring',
  logicalId: 'docs-guide-global-monitoring',
  checks: {
    frequency: Frequency.EVERY_10M,
    tags: ['global'],
    checkMatch: '**/__checks__/**/*.check.ts',
  },
  cli: {
    runLocation: 'eu-west-1',
  },
})
