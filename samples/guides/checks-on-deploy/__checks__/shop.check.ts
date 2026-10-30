import { BrowserCheck, UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs'
import * as path from 'path'

const environmentVariables = [
  { key: 'ENVIRONMENT_URL', value: 'https://danube-web.shop' },
]

new UrlMonitor('deploy-shop-url', {
  name: 'Deploy: shop responds',
  request: {
    url: process.env.ENVIRONMENT_URL || 'https://danube-web.shop',
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
})

new BrowserCheck('deploy-shop-browser', {
  name: 'Deploy: shop displays books',
  environmentVariables,
  code: { entrypoint: path.join(__dirname, 'shop.spec.ts') },
})
