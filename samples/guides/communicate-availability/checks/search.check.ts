import { BrowserCheck, Frequency } from 'checkly/constructs'
import * as path from 'path'

new BrowserCheck('storefront-search-browser', {
  name: 'Storefront search (Browser Check)',
  frequency: Frequency.EVERY_10M,
  // The tag is what connects this check to the Storefront component.
  tags: ['status-storefront'],
  code: {
    entrypoint: path.join(__dirname, '../tests/search.spec.ts'),
  },
})
