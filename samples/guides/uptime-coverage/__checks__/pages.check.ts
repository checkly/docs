import { UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs'
import { responseTimes, shopGroup } from './group'

// Every page a customer can land on. Add a line here to add a monitor.
// The id becomes part of the logical ID, so keep it stable when you reorder.
const pages = [
  { id: 'home', path: '/' },
  { id: 'book', path: '/books/1' },
  { id: 'cart', path: '/cart' },
  { id: 'checkout', path: '/checkout' },
  { id: 'books-api', path: '/api/books' },
]

for (const { id, path } of pages) {
  new UrlMonitor(`shop-${id}`, {
    name: `Shop ${path}`,
    group: shopGroup,
    ...responseTimes,
    request: {
      url: `https://danube-web.shop${path}`,
      followRedirects: true,
      assertions: [UrlAssertionBuilder.statusCode().equals(200)],
    },
  })
}
