#!/bin/bash
set -e

echo "🚀 Deploying ClaraMENTE application..."

# Load environment variables
if [ -f .env.production ]; then
    source .env.production
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose build

# Start database first
echo "💾 Starting database..."
docker-compose up -d db redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose run --rm migrator

# Seed database if needed
if [ "$SEED_DATABASE" = "true" ]; then
    echo "🌱 Seeding database..."
    docker-compose run --rm -e SEED_DATABASE=true app npm run db:seed
fi

# Start all services
echo "🌟 Starting all services..."
docker-compose up -d

# Check health
echo "🏥 Checking application health..."
sleep 15
curl -f http://localhost:3000/api/health || {
    echo "❌ Health check failed!"
    docker-compose logs app
    exit 1
}

echo "✅ Deployment completed successfully!"
echo "🔗 Application is running at http://localhost:3000"