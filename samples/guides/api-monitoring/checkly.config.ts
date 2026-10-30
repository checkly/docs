import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

export default defineConfig({
  projectName: 'Docs guide: Monitor your API end to end',
  logicalId: 'docs-guide-api-monitoring',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    activated: true,
    frequency: Frequency.EVERY_1M,
    tags: ['guide-api-monitoring'],
    checkMatch: '**/__checks__/**/*.check.ts',
  },
  cli: { runLocation: 'us-east-1' },
})
