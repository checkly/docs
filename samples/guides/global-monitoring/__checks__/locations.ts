// Every public Checkly location, grouped by continent. Pick from here.
export const AMERICAS = ['us-east-1', 'us-west-2', 'ca-central-1', 'sa-east-1'] as const
export const EUROPE = ['eu-west-1', 'eu-central-1', 'eu-north-1'] as const
export const MIDDLE_EAST_AFRICA = ['me-south-1', 'af-south-1'] as const
export const ASIA_PACIFIC = ['ap-south-1', 'ap-southeast-1', 'ap-northeast-1', 'ap-southeast-2'] as const

export const WORLD = [...AMERICAS, ...EUROPE, ...MIDDLE_EAST_AFRICA, ...ASIA_PACIFIC]
