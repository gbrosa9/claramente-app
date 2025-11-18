#!/bin/sh
set -e

echo "🚀 Starting ClaraMENTE application..."

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Seed the database if needed
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database..."
    npm run db:seed
fi

# Start the application
echo "✅ Starting Next.js server..."
exec node server.js