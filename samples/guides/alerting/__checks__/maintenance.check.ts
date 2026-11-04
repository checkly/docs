import { MaintenanceWindow } from 'checkly/constructs'

// The API ships every Tuesday at 20:00 UTC. Checks tagged `shop-api` do not run
// for those 30 minutes, so a planned restart is not an incident.
new MaintenanceWindow('api-weekly-deploy', {
  name: 'Shop API weekly deploy',
  tags: ['shop-api'],
  startsAt: new Date('2026-09-29T20:00:00.000Z'),
  endsAt: new Date('2026-09-29T20:30:00.000Z'),
  repeatInterval: 1,
  repeatUnit: 'WEEK',
})
