#!/bin/sh

echo "Starting entrypoint script..."

echo "Migrating database..."
npm run migrate:deploy

echo "Seeding database..."
if ! npm run migrate:seed; then
    echo "Database seeding failed! Exiting container..."
    exit 1
fi

echo "Starting pm2..."
pm2-runtime start ecosystem.config.js --env production

echo "Entrypoint script completed."
