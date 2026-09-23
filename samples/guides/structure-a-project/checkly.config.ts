import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'
import { opsEmail } from './__checks__/alert-channels'

export default defineConfig({
  projectName: 'Docs guide: Structure a project',
  logicalId: 'docs-guide-structure-a-project',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    // Defaults every check inherits unless a group or the check overrides them.
    frequency: Frequency.EVERY_10M,
    locations: ['us-east-1', 'eu-west-1'],
    tags: ['shop'],
    alertChannels: [opsEmail],
    // Where to find checks. One folder per service keeps ownership obvious.
    checkMatch: '**/__checks__/**/*.check.ts',
  },
  cli: {
    runLocation: 'eu-west-1',
  },
})
