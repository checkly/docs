import { ApiCheck, AssertionBuilder } from 'checkly/constructs'
import { apiGroup, responseTimes } from './group'

// An endpoint that always takes about two seconds, so you can see the
// degraded state land between the two thresholds in the group.
new ApiCheck('shop-api-slow', {
  name: 'Slow endpoint (httpbin delay)',
  group: apiGroup,
  ...responseTimes,
  request: {
    method: 'GET',
    url: 'https://httpbin.org/delay/2',
    assertions: [AssertionBuilder.statusCode().equals(200)],
  },
})
