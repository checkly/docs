import { AlertEscalationBuilder, ApiCheck, AssertionBuilder, Frequency } from 'checkly/constructs'
import { apiGroup } from './group'

new ApiCheck('shop-api-books', {
  name: 'Books catalog',
  group: apiGroup,
  frequency: Frequency.EVERY_1M,
  // Slow is not down: over 1 second is degraded, over 5 seconds fails.
  degradedResponseTime: 1000,
  maxResponseTime: 5000,
  // Two failed runs in a row before anyone hears about it, then one reminder.
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(2, {
    amount: 1,
    interval: 10,
  }),
  request: {
    method: 'GET',
    url: '{{API_BASE_URL}}/books',
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.length').greaterThan(0),
    ],
  },
})
