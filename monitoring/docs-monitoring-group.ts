import { CheckGroup, ApiCheck, BrowserCheck } from 'checkly/constructs'

// Create a monitoring group for the docs site
const docsGroup = new CheckGroup('docs-site-monitoring', {
  name: 'Checkly Documentation Site Monitoring',
  activated: true,
  locations: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  tags: ['docs', 'production'],
  concurrency: 5,
  runParallel: true,
  alertSettings: {
    escalationType: 'RUN_BASED',
    runBasedEscalation: {
      failedRunThreshold: 2
    },
    reminders: {
      amount: 2,
      interval: 10
    }
  }
})

// Homepage availability check
new ApiCheck('homepage-availability', {
  name: 'Docs Homepage Availability',
  activated: true,
  frequency: 5,
  groupId: docsGroup.ref(),
  locations: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  tags: ['docs', 'homepage', 'critical'],
  request: {
    method: 'GET',
    url: 'https://docs.checklyhq.com',
    followRedirects: true,
    assertions: [
      {
        source: 'STATUS_CODE',
        comparison: 'EQUALS',
        target: '200'
      },
      {
        source: 'RESPONSE_TIME',
        comparison: 'LESS_THAN',
        target: '3000'
      },
      {
        source: 'BODY',
        comparison: 'CONTAINS',
        target: 'Checkly Documentation'
      }
    ]
  }
})

// API documentation endpoint check
new ApiCheck('api-docs-availability', {
  name: 'API Documentation Availability',
  activated: true,
  frequency: 10,
  groupId: docsGroup.ref(),
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['docs', 'api', 'important'],
  request: {
    method: 'GET',
    url: 'https://docs.checklyhq.com/api-reference',
    followRedirects: true,
    assertions: [
      {
        source: 'STATUS_CODE',
        comparison: 'EQUALS',
        target: '200'
      },
      {
        source: 'RESPONSE_TIME',
        comparison: 'LESS_THAN',
        target: '4000'
      }
    ]
  }
})

// CLI documentation endpoint check
new ApiCheck('cli-docs-availability', {
  name: 'CLI Documentation Availability',
  activated: true,
  frequency: 10,
  groupId: docsGroup.ref(),
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['docs', 'cli', 'important'],
  request: {
    method: 'GET',
    url: 'https://docs.checklyhq.com/cli',
    followRedirects: true,
    assertions: [
      {
        source: 'STATUS_CODE',
        comparison: 'EQUALS',
        target: '200'
      },
      {
        source: 'RESPONSE_TIME',
        comparison: 'LESS_THAN',
        target: '4000'
      }
    ]
  }
})

// Homepage user experience check
new BrowserCheck('homepage-user-experience', {
  name: 'Docs Homepage User Experience',
  activated: true,
  frequency: 15,
  groupId: docsGroup.ref(),
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['docs', 'homepage', 'ux', 'critical'],
  code: {
    entrypoint: 'homepage.spec.ts'
  }
})
