import { ApiCheck, AssertionBuilder } from 'checkly/constructs'
import { apiGroup } from './group'

new ApiCheck('shop-api-book-detail', {
  name: 'Book detail',
  group: apiGroup,
  degradedResponseTime: 2000,
  maxResponseTime: 5000,
  request: {
    method: 'GET',
    url: '{{API_BASE_URL}}/books/1',
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.title').equals('Haben oder haben'),
    ],
  },
})
