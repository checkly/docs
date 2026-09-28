import { CheckGroupV2 } from 'checkly/constructs'

// The backend API. The `shop-api` tag is what the deploy window targets.
export const apiGroup = new CheckGroupV2('shop-api', {
  name: 'Shop API',
  tags: ['shop-api'],
  environmentVariables: [
    { key: 'API_BASE_URL', value: 'https://danube-web.shop/api' },
  ],
})
