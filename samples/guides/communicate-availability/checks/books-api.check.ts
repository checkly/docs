import { ApiCheck, AssertionBuilder } from 'checkly/constructs'

new ApiCheck('catalog-api-books', {
  name: 'Catalog API: list books',
  // The tag is what connects this check to the Catalog API component.
  tags: ['status-catalog-api'],
  degradedResponseTime: 1000,
  maxResponseTime: 5000,
  request: {
    method: 'GET',
    url: 'https://danube-web.shop/api/books',
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.length').greaterThan(0),
    ],
  },
})
