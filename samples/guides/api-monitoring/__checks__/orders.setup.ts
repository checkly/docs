import axios from 'axios'

// 1. Get a token. A real API would exchange a client secret from
//    process.env for a short-lived token here.
const { data: session } = await axios.get('https://httpbin.org/uuid')
request.headers['Authorization'] = `Bearer ${session.uuid}`

// 2. Build the order with an ID no previous run has used, and keep it
//    where the teardown can find it.
const orderId = `order-${Date.now()}`
process.env.ORDER_ID = orderId
request.body = JSON.stringify({ orderId, items: [{ bookId: 1, quantity: 1 }] })

console.log(`Creating ${orderId}`)
