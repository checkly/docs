import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

export default defineConfig({
  projectName: 'Docs guide: Run checks on every deploy',
  logicalId: 'docs-guide-checks-on-deploy',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    checkMatch: '**/__checks__/**/*.check.ts',
    frequency: Frequency.EVERY_10M,
    locations: ['us-east-1'],
    tags: ['guide-checks-on-deploy'],
  },
  cli: { runLocation: 'us-east-1' },
})
