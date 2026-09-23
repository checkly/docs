import { CheckGroupV2 } from 'checkly/constructs'

// The storefront: user-facing pages. Runs from three regions so a
// regional CDN problem shows up as a single-location failure.
export const webGroup = new CheckGroupV2('shop-web', {
  name: 'Shop web',
  tags: ['web'],
  locations: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  runParallel: true,
})
