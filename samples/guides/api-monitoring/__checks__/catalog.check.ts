import { ApiCheck, AssertionBuilder } from 'checkly/constructs'
import { apiGroup, responseTimes } from './group'

// GET /books: the list the storefront renders. Status alone is not enough,
// so assert the content type, that the array has books, and that the first
// book has the fields the storefront reads.
new ApiCheck('shop-api-books', {
  name: 'GET /books',
  group: apiGroup,
  ...responseTimes,
  request: {
    method: 'GET',
    url: '{{API_BASE_URL}}/books',
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.headers('content-type').contains('application/json'),
      AssertionBuilder.jsonBody('$.length').greaterThan(0),
      AssertionBuilder.jsonBody('$[0].title').notEmpty(),
      AssertionBuilder.jsonBody('$[0].price').notEmpty(),
    ],
  },
})

// GET /books/{id}: one known record. Pin the value, not just the shape,
// so a data migration that swaps IDs fails the check.
new ApiCheck('shop-api-book-detail', {
  name: 'GET /books/{id}',
  group: apiGroup,
  ...responseTimes,
  request: {
    method: 'GET',
    url: '{{API_BASE_URL}}/books/1',
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.id').equals(1),
      AssertionBuilder.jsonBody('$.title').equals('Haben oder haben'),
      AssertionBuilder.jsonBody('$.author').notEmpty(),
    ],
  },
})
