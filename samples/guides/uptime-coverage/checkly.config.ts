import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

export default defineConfig({
  projectName: 'Docs guide: Cover every endpoint with uptime monitors',
  logicalId: 'docs-guide-uptime-coverage',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    activated: true,
    frequency: Frequency.EVERY_1M,
    tags: ['guide-uptime-coverage'],
    checkMatch: '**/__checks__/**/*.check.ts',
  },
  cli: { runLocation: 'us-east-1' },
})
