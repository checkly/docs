import { Frequency, UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs'
import { docsGroup } from './group'

// DOCS_BASE_URL lets `checkly test` target a Mintlify PR preview.
// When unset (e.g. on `checkly deploy`), monitors target production.
const baseUrl = process.env.DOCS_BASE_URL || 'https://www.checklyhq.com/docs'

new UrlMonitor('docs-homepage-uptime', {
  name: 'Docs homepage uptime',
  group: docsGroup,
  activated: true,
  frequency: Frequency.EVERY_5M,
  tags: ['docs'],
  degradedResponseTime: 3000,
  maxResponseTime: 10000,
  request: {
    url: `${baseUrl}/`,
    ipFamily: 'IPv4',
    followRedirects: true,
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
})

new UrlMonitor('docs-api-reference-uptime', {
  name: 'Docs API reference uptime',
  group: docsGroup,
  activated: true,
  frequency: Frequency.EVERY_10M,
  degradedResponseTime: 4000,
  maxResponseTime: 10000,
  request: {
    url: `${baseUrl}/api-reference`,
    ipFamily: 'IPv4',
    followRedirects: true,
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
})

new UrlMonitor('docs-cli-uptime', {
  name: 'Docs CLI uptime',
  group: docsGroup,
  activated: true,
  frequency: Frequency.EVERY_10M,
  degradedResponseTime: 4000,
  maxResponseTime: 10000,
  request: {
    url: `${baseUrl}/cli`,
    ipFamily: 'IPv4',
    followRedirects: true,
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
})
