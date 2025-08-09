# Checkly Documentation Site Monitoring

This directory contains the monitoring setup for the Checkly documentation site using Checkly's monitoring platform.

## Overview

The monitoring setup includes:

- **Homepage Availability Check**: Monitors the main documentation homepage for availability and response time
- **API Documentation Check**: Monitors the API reference section
- **CLI Documentation Check**: Monitors the CLI documentation section
- **Homepage User Experience Check**: Browser-based check that validates the user experience on the homepage

## Configuration

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Login to Checkly:
   ```bash
   npx checkly login
   ```

### Deployment

Deploy the monitoring checks to Checkly:

```bash
npm run deploy
```

### Testing

Test the checks locally before deploying:

```bash
npm run test
```

### Manual Triggering

Trigger checks manually:

```bash
npm run trigger
```

## Monitoring Checks

### 1. Homepage Availability Check
- **Frequency**: Every 5 minutes
- **Locations**: US East, EU West, AP Southeast
- **Checks**: Status code 200, response time < 3s, contains "Checkly Documentation"

### 2. API Documentation Check
- **Frequency**: Every 10 minutes
- **Locations**: US East, EU West
- **Checks**: Status code 200, response time < 4s

### 3. CLI Documentation Check
- **Frequency**: Every 10 minutes
- **Locations**: US East, EU West
- **Checks**: Status code 200, response time < 4s

### 4. Homepage User Experience Check
- **Frequency**: Every 15 minutes
- **Locations**: US East, EU West
- **Checks**: Page loads correctly, key elements visible, no console errors

## Alerting

All checks are configured with:
- Run-based escalation (1-2 failed runs before alerting)
- Reminder notifications (2-3 reminders every 10-15 minutes)
- Critical tags for homepage checks

## File Structure

```
monitoring/
├── README.md                    # This file
├── docs-monitoring-group.ts     # Main monitoring group and checks
├── homepage.check.ts           # Individual homepage checks
└── homepage.spec.ts            # Playwright test for UX check
```

## Customization

To add new checks or modify existing ones:

1. Edit the appropriate check file in the `monitoring/` directory
2. Test locally with `npm run test`
3. Deploy with `npm run deploy`

## Troubleshooting

### Common Issues

1. **Authentication Error**: Run `npx checkly login` to authenticate
2. **Deployment Failed**: Check your Checkly account permissions
3. **Test Failures**: Verify the target URLs are accessible

### Support

For issues with the monitoring setup, check:
- [Checkly Documentation](https://docs.checklyhq.com)
- [Checkly CLI Documentation](https://docs.checklyhq.com/cli)
- [Playwright Documentation](https://playwright.dev)
