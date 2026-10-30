import { ApiCheck, AssertionBuilder } from 'checkly/constructs'
import * as path from 'path'
import { apiGroup, responseTimes } from './group'

// POST /orders: an authenticated write. The setup script fetches a token and
// builds a unique order; the teardown deletes the order and scrubs the
// token before the response is stored. httpbin.org echoes the request back,
// which is how the assertions can see what was sent.
new ApiCheck('shop-api-create-order', {
  name: 'POST /orders',
  group: apiGroup,
  ...responseTimes,
  setupScript: { entrypoint: path.join(__dirname, 'orders.setup.ts') },
  tearDownScript: { entrypoint: path.join(__dirname, 'orders.teardown.ts') },
  request: {
    method: 'POST',
    url: 'https://httpbin.org/post',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody('$.json.orderId').notEmpty(),
      AssertionBuilder.jsonBody('$.json.items[0].bookId').equals(1),
      AssertionBuilder.jsonBody('$.headers.Authorization').equals('Bearer [REDACTED]'),
    ],
  },
})
