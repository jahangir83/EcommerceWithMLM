#!/bin/bash

echo "🚀 Deploying AIT Platform..."

# Build the application
echo "🔨 Building application..."
pnpm run build

# Run tests
echo "🧪 Running tests..."
pnpm run test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Deployment aborted."
    exit 1
fi

# Create deployment directory
DEPLOY_DIR="/var/www/ait-platform"
sudo mkdir -p $DEPLOY_DIR

# Copy files
echo "📁 Copying files..."
sudo cp -r dist/ $DEPLOY_DIR/
sudo cp package*.json $DEPLOY_DIR/
sudo cp .env.production $DEPLOY_DIR/.env

# Install production dependencies
cd $DEPLOY_DIR
sudo pnpm ci --only=production

# Restart application with PM2
echo "🔄 Restarting application..."
pm2 restart ait-platform || pm2 start dist/main.js --name ait-platform

echo "✅ Deployment completed!"
echo "🌐 Application is running at your configured domain"
