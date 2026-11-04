import { SslMonitor } from 'checkly/constructs'
import { shopGroup } from './group'

// Every HTTPS page above depends on this one certificate.
// Alert two weeks before it expires, while there is still time to renew.
new SslMonitor('shop-certificate', {
  name: 'Shop certificate',
  group: shopGroup,
  request: {
    hostname: 'danube-web.shop',
    port: 443,
    sslConfig: { alertDaysBeforeExpiry: 14 },
  },
})
