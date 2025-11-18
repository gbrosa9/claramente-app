#!/bin/bash
set -e

echo "💻 Setting up development environment..."

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "📋 Created .env.local from .env.example"
    echo "⚠️  Please update .env.local with your actual API keys"
fi

# Start development services
echo "🐳 Starting development database and Redis..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Development environment setup completed!"
echo ""
echo "📝 Next steps:"
echo "  1. Update .env.local with your API keys"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Visit http://localhost:3000"
echo ""
echo "🔧 Useful commands:"
echo "  - npm run dev        # Start development server"
echo "  - npm run db:studio  # Open Prisma Studio"
echo "  - npm test           # Run tests"
echo "  - npm run build      # Build for production"