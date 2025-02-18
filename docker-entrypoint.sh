#!/bin/sh

echo "Starting entrypoint script..."

echo "Migrating database..."
npm run migrate:deploy

echo "Starting pm2..."
pm2-runtime start ecosystem.config.js --env=production --web 5566

echo "Entrypoint script completed."
