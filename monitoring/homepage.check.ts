import { BrowserCheck, ApiCheck } from 'checkly/constructs'

// Homepage availability check
new ApiCheck('homepage-availability', {
  name: 'Docs Homepage Availability',
  activated: true,
  frequency: 5, // minutes
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
  },
  alertSettings: {
    escalationType: 'RUN_BASED',
    runBasedEscalation: {
      failedRunThreshold: 1
    },
    reminders: {
      amount: 3,
      interval: 15
    }
  }
})

// Homepage browser check for user experience
new BrowserCheck('homepage-user-experience', {
  name: 'Docs Homepage User Experience',
  activated: true,
  frequency: 10, // minutes
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['docs', 'homepage', 'ux', 'critical'],
  code: {
    entrypoint: 'homepage.spec.ts'
  },
  alertSettings: {
    escalationType: 'RUN_BASED',
    runBasedEscalation: {
      failedRunThreshold: 1
    },
    reminders: {
      amount: 2,
      interval: 10
    }
  }
})
