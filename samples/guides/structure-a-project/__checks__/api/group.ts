import { CheckGroupV2 } from 'checkly/constructs'

// The backend API. The base URL lives on the group, so every API check
// in this folder reads {{API_BASE_URL}} instead of repeating the host.
export const apiGroup = new CheckGroupV2('shop-api', {
  name: 'Shop API',
  tags: ['api'],
  environmentVariables: [
    { key: 'API_BASE_URL', value: 'https://danube-web.shop/api' },
  ],
})
