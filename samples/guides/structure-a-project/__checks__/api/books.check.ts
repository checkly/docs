import { ApiCheck, AssertionBuilder } from 'checkly/constructs'
import { apiGroup } from './group'

new ApiCheck('shop-api-books', {
  name: 'Books catalog',
  group: apiGroup,
  degradedResponseTime: 2000,
  maxResponseTime: 5000,
  request: {
    method: 'GET',
    url: '{{API_BASE_URL}}/books',
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.headers('content-type').contains('application/json'),
      AssertionBuilder.jsonBody('$.length').greaterThan(0),
      AssertionBuilder.jsonBody('$[0].title').notEmpty(),
    ],
  },
})
