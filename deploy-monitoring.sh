#!/bin/bash

# Checkly Documentation Site Monitoring Deployment Script

echo "🚀 Deploying Checkly monitoring for docs site..."

# Check if checkly CLI is installed
if ! command -v checkly &> /dev/null; then
    echo "❌ Checkly CLI not found. Installing..."
    npm install -g @checkly/cli
fi

# Check if user is logged in
if ! checkly whoami &> /dev/null; then
    echo "🔐 Please login to Checkly first:"
    checkly login
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Test the configuration
echo "🧪 Testing configuration..."
npm run test

# Deploy the monitoring
echo "🚀 Deploying monitoring checks..."
npm run deploy

echo "✅ Monitoring deployment complete!"
echo ""
echo "📊 You can view your checks at: https://app.checklyhq.com"
echo "🔍 See MONITORING_SETUP.md for more information"
