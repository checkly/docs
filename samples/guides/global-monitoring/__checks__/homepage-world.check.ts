import { Frequency, UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs'
import { WORLD } from './locations'

// The same request from thirteen places at the same moment.
// Parallel scheduling is what turns "is it up?" into "is it up for whom?".
new UrlMonitor('shop-homepage-world', {
  name: 'Homepage from around the world',
  frequency: Frequency.EVERY_5M,
  locations: [...WORLD],
  runParallel: true,
  degradedResponseTime: 1500,
  maxResponseTime: 10000,
  request: {
    url: 'https://danube-web.shop/',
    followRedirects: true,
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
})
