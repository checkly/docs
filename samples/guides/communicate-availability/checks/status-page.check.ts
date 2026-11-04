import {
  StatusPageV3,
  StatusPageV3AutomationRule,
  StatusPageV3Component,
} from 'checkly/constructs'

export const statusPage = new StatusPageV3('danube-status', {
  name: 'Danube Shop Status',
  url: 'danube-shop-status',
  description: 'Live status of the Danube web shop, measured by synthetic monitors.',
  defaultTheme: 'AUTO',
})

// Components are named the way your users talk about the product.
const shop = new StatusPageV3Component('shop-group', {
  statusPage,
  type: 'GROUP',
  name: 'Danube shop',
  displayOrder: 0,
})

const storefront = new StatusPageV3Component('storefront', {
  statusPage,
  name: 'Storefront',
  description: 'Browsing and searching for books',
  parent: shop,
  displayOrder: 1,
})

const catalogApi = new StatusPageV3Component('catalog-api', {
  statusPage,
  name: 'Catalog API',
  description: 'The public books API',
  parent: shop,
  displayOrder: 2,
})

// When a check tagged status-storefront fails, the storefront is down.
new StatusPageV3AutomationRule('storefront-outage', {
  statusPage,
  name: 'Storefront outage',
  tags: ['status-storefront'],
  firstUpdate: 'Searching for books is failing. We are investigating.',
  lastUpdate: 'Search is working again.',
  components: [{ component: storefront, targetImpact: 'MAJOR_OUTAGE' }],
})

// The storefront reads from the API, so an API failure degrades it too.
new StatusPageV3AutomationRule('catalog-api-outage', {
  statusPage,
  name: 'Catalog API outage',
  tags: ['status-catalog-api'],
  firstUpdate: 'The Catalog API is returning errors. Book listings may be incomplete. We are investigating.',
  lastUpdate: 'The Catalog API has recovered.',
  components: [
    { component: catalogApi, targetImpact: 'MAJOR_OUTAGE' },
    { component: storefront, targetImpact: 'DEGRADED_PERFORMANCE' },
  ],
})
