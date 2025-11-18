# Multi-stage Dockerfile for ClaraMENTE application

# Base stage with Node.js
FROM node:20-alpine AS base
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    curl \
    ffmpeg

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose ports
EXPOSE 3000 8080

# Development command
CMD ["npm", "run", "dev"]

# Dependencies stage for production
FROM base AS deps
ENV NODE_ENV=production

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
ENV NODE_ENV=production

# Install all dependencies for building
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install system dependencies for production
RUN apk add --no-cache \
    libc6-compat \
    ffmpeg \
    curl \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Create directories for uploads and models
RUN mkdir -p /app/uploads /app/models \
    && chown -R nextjs:nodejs /app

# Copy startup script
COPY scripts/start.sh ./
RUN chmod +x start.sh

USER nextjs

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["./start.sh"]