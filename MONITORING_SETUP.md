# Checkly Documentation Site Monitoring Setup

This document provides a complete overview of the monitoring setup for the Checkly documentation site.

## 🎯 Overview

I've created a comprehensive monitoring solution for your Checkly documentation site that includes:

1. **Homepage Availability Monitoring** - Checks if the main docs site is accessible
2. **API Documentation Monitoring** - Monitors the API reference section
3. **CLI Documentation Monitoring** - Monitors the CLI documentation section
4. **User Experience Monitoring** - Browser-based checks for the homepage UX

## 📁 File Structure

```
docs/
├── checkly.config.ts                    # Main Checkly configuration
├── package.json                         # Dependencies and scripts
├── tsconfig.json                        # TypeScript configuration
├── .gitignore                           # Git ignore rules
├── deploy-monitoring.sh                 # Deployment script
├── MONITORING_SETUP.md                  # This file
└── monitoring/
    ├── README.md                        # Monitoring documentation
    ├── docs-monitoring-group.ts         # Main monitoring group
    ├── homepage.check.ts                # Homepage checks
    └── homepage.spec.ts                 # Playwright UX test
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Login to Checkly

```bash
npx checkly login
```

### 3. Deploy Monitoring

```bash
# Option 1: Use the deployment script
./deploy-monitoring.sh

# Option 2: Manual deployment
npm run deploy
```

## 📊 Monitoring Checks

### Homepage Availability Check
- **URL**: `https://docs.checklyhq.com`
- **Frequency**: Every 5 minutes
- **Locations**: US East, EU West, AP Southeast
- **Checks**:
  - Status code 200
  - Response time < 3 seconds
  - Page contains "Checkly Documentation"

### API Documentation Check
- **URL**: `https://docs.checklyhq.com/api-reference`
- **Frequency**: Every 10 minutes
- **Locations**: US East, EU West
- **Checks**:
  - Status code 200
  - Response time < 4 seconds

### CLI Documentation Check
- **URL**: `https://docs.checklyhq.com/cli`
- **Frequency**: Every 10 minutes
- **Locations**: US East, EU West
- **Checks**:
  - Status code 200
  - Response time < 4 seconds

### Homepage User Experience Check
- **URL**: `https://docs.checklyhq.com`
- **Frequency**: Every 15 minutes
- **Locations**: US East, EU West
- **Checks**:
  - Page loads correctly
  - Key navigation elements are visible
  - No console errors
  - Load time < 5 seconds

## 🔔 Alerting Configuration

All checks are configured with:
- **Run-based escalation**: 1-2 failed runs before alerting
- **Reminder notifications**: 2-3 reminders every 10-15 minutes
- **Critical tags**: Homepage checks are tagged as critical

## 🛠️ Customization

### Adding New Checks

1. Create a new check file in the `monitoring/` directory
2. Follow the pattern in `docs-monitoring-group.ts`
3. Test locally: `npm run test`
4. Deploy: `npm run deploy`

### Modifying Existing Checks

1. Edit the appropriate check file
2. Test changes: `npm run test`
3. Deploy updates: `npm run deploy`

## 🔍 Testing

### Local Testing

```bash
# Test all checks locally
npm run test

# Test specific checks
npx checkly test --tags homepage
```

### Manual Triggering

```bash
# Trigger all checks
npm run trigger

# Trigger specific checks
npx checkly trigger --tags critical
```

## 📈 Monitoring Dashboard

Once deployed, you can view your monitoring checks at:
- **Checkly Dashboard**: https://app.checklyhq.com
- **Check Results**: Real-time results and historical data
- **Alert History**: Past alerts and notifications

## 🆘 Troubleshooting

### Common Issues

1. **Authentication Error**
   ```bash
   npx checkly login
   ```

2. **Deployment Failed**
   - Check your Checkly account permissions
   - Verify the target URLs are accessible

3. **Test Failures**
   - Review the check configuration
   - Check if the target site is responding

### Support Resources

- [Checkly Documentation](https://docs.checklyhq.com)
- [Checkly CLI Documentation](https://docs.checklyhq.com/cli)
- [Playwright Documentation](https://playwright.dev)

## 🎉 Next Steps

1. **Review the monitoring setup** in the `monitoring/` directory
2. **Customize checks** based on your specific needs
3. **Set up alert channels** (email, Slack, etc.) in the Checkly dashboard
4. **Monitor the results** and adjust thresholds as needed

## 📞 Support

If you need help with the monitoring setup:
1. Check the `monitoring/README.md` file
2. Review the Checkly documentation
3. Contact the Checkly support team

---

**Happy Monitoring! 🎯**
