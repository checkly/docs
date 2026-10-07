import axios from 'axios'

// 1. Delete the order this run created, whatever the main request returned.
const orderId = process.env.ORDER_ID
if (orderId) {
  await axios.delete('https://httpbin.org/delete', { params: { orderId } })
  console.log(`Deleted ${orderId}`)
}

// 2. Scrub the token before the response is stored with the result.
//    Assertions run after this, so they see the scrubbed body.
const body = JSON.parse(response.body)
if (body.headers?.Authorization) {
  body.headers.Authorization = 'Bearer [REDACTED]'
}
response.body = JSON.stringify(body)
