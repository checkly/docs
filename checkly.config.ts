import { defineConfig } from 'checkly'


export default defineConfig({
  projectName: 'Checkly Documentation Site',
  logicalId: 'checkly-docs-site-monitoring',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    activated: true,
    tags: ['docs'],
    checkMatch: '**/__checks__/**/*.check?(-group).{js,ts}',
    // Guide sample projects have their own checkly.config.ts; keep them out of this project.
    ignoreDirectoriesMatch: ['samples/**'],
    runtimeId: '2026.04',
    playwrightConfig: {
      timeout: 120_000,
      expect: { timeout: 30_000 },
      use: { actionTimeout: 0 },
    },
  },
  cli: {
    runLocation: 'us-east-1',
    retries: 2
  }
})
