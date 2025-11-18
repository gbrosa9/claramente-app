# ClaraMENTE Backend Deployment Guide

## Quick Start

### Development Setup

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd claramente-app
   npm run setup:dev
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Configure Environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Deploy with Docker**
   ```bash
   npm run deploy
   ```

## Environment Configuration

### Required Environment Variables

#### Database
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string for job queues

#### Authentication
- `NEXTAUTH_SECRET`: Strong secret key for JWT tokens
- `NEXTAUTH_URL`: Your application's public URL

#### AI Services
- `OPENAI_API_KEY`: OpenAI API key for LLM services
- `ELEVENLABS_API_KEY`: ElevenLabs API key for text-to-speech
- `LMSTUDIO_URL`: Local LM Studio URL (optional)

#### Optional Services
- `SMTP_*`: Email configuration for notifications
- `SENTRY_DSN`: Error monitoring (recommended for production)

## Docker Deployment Options

### Option 1: Full Docker Stack
```bash
# Production deployment with all services
docker-compose up -d
```

### Option 2: Development with Docker Services
```bash
# Only database and Redis in Docker
docker-compose -f docker-compose.dev.yml up -d
npm run dev
```

### Option 3: Local Development
```bash
# All services running locally
npm run dev
# Requires local PostgreSQL and Redis
```

## Services Architecture

### Core Services
- **Next.js App**: Main application server (Port 3000)
- **WebSocket Server**: Real-time voice sessions (Port 8080)
- **PostgreSQL**: Primary database
- **Redis**: Job queues and caching

### Optional Services
- **Nginx**: Reverse proxy with rate limiting
- **Prisma Studio**: Database administration UI

## Database Management

### Migrations
```bash
# Development
npm run db:migrate

# Production
npm run db:migrate:deploy
```

### Seeding
```bash
# Create initial data
npm run db:seed
```

### Studio
```bash
# Open database admin UI
npm run db:studio
```

## Monitoring and Health

### Health Checks
- **Application**: `GET /api/health`
- **Database**: Included in Docker health checks
- **Redis**: Included in Docker health checks

### Logs
```bash
# View application logs
docker-compose logs app

# View all service logs
docker-compose logs
```

## Security Considerations

### Production Security
- Use strong `NEXTAUTH_SECRET` (32+ characters)
- Configure HTTPS with SSL certificates
- Enable rate limiting in production
- Use secure database passwords
- Regularly update dependencies

### Environment Security
- Never commit `.env.production` to version control
- Use secrets management in cloud deployments
- Restrict database network access
- Enable database authentication

## Scaling and Performance

### Horizontal Scaling
- Run multiple app containers behind load balancer
- Use external Redis cluster for job queues
- Configure database connection pooling

### Performance Optimization
- Enable Redis caching for frequent queries
- Use CDN for static assets
- Configure proper database indexes
- Monitor and optimize SQL queries

## Backup and Recovery

### Database Backups
```bash
# Manual backup
docker exec claramente-db pg_dump -U postgres claramente > backup.sql

# Restore
docker exec -i claramente-db psql -U postgres claramente < backup.sql
```

### File Storage Backups
- Configure volume backups for user uploads
- Use cloud storage for production files

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database status
   docker-compose ps db
   
   # View database logs
   docker-compose logs db
   ```

2. **Migration Failures**
   ```bash
   # Reset database (development only)
   npm run db:reset
   
   # Manual migration
   npx prisma migrate resolve --applied <migration-name>
   ```

3. **Job Queue Issues**
   ```bash
   # Check Redis status
   docker-compose ps redis
   
   # Clear job queue
   redis-cli -h localhost -p 6379 flushall
   ```

4. **WebSocket Connection Problems**
   ```bash
   # Check if WebSocket port is accessible
   curl -I http://localhost:8080
   
   # Verify Nginx configuration
   docker-compose logs nginx
   ```

### Performance Issues
- Monitor database query performance
- Check Redis memory usage
- Review application logs for errors
- Monitor Docker container resources

## Development Workflow

### Code Changes
1. Make changes to source code
2. Tests run automatically (if configured)
3. Database migrations are applied
4. Application reloads automatically

### Database Changes
1. Modify `schema.prisma`
2. Run `npm run db:migrate`
3. Update seed data if needed
4. Test with fresh database

### Deployment Pipeline
1. Code review and testing
2. Build Docker images
3. Run database migrations
4. Deploy application
5. Verify health checks

## API Documentation

The backend provides comprehensive REST APIs:

- **Authentication**: `/api/auth/*`
- **Conversations**: `/api/conversations/*`
- **Messages**: `/api/conversations/*/messages/*`
- **Assessments**: `/api/assessments/*`
- **Voice Sessions**: WebSocket at `/voice`
- **Health Check**: `/api/health`

For detailed API documentation, see the OpenAPI specification (generated automatically).

## Support and Maintenance

### Regular Maintenance
- Update dependencies monthly
- Review and rotate secrets quarterly
- Monitor database performance
- Clean up old logs and backups

### Updates
```bash
# Update dependencies
npm update

# Rebuild containers with updates
docker-compose build --no-cache
```

For additional support, check the application logs and refer to the troubleshooting section above.