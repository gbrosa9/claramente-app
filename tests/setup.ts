import { beforeAll, afterAll, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'

// Set test environment variables (use Object.assign to avoid readonly issues)
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_URL: 'file:./test.db',
  NEXTAUTH_SECRET: 'test-secret',
  NEXTAUTH_URL: 'http://localhost:3001'
})

// Test database setup
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db'
    }
  }
})

beforeAll(async () => {
  // Setup SQLite test database
  try {
    await prisma.$executeRaw`PRAGMA foreign_keys = ON`
    
    // Create basic tables for testing
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "verified" BOOLEAN DEFAULT false,
        "avatar" TEXT,
        "settings" TEXT,
        "onboardingCompleted" BOOLEAN DEFAULT false,
        "lastLoginAt" DATETIME,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Conversation" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "summary" TEXT,
        "topic" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT DEFAULT 'ACTIVE',
        "metadata" TEXT,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Message" (
        "id" TEXT PRIMARY KEY,
        "conversationId" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "metadata" TEXT,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Assessment" (
        "id" TEXT PRIMARY KEY,
        "type" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "questions" TEXT NOT NULL,
        "publishedAt" DATETIME,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "UserConsent" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "docVersion" TEXT NOT NULL,
        "accepted" BOOLEAN DEFAULT true,
        "ip" TEXT,
        "userAgent" TEXT,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `

    console.log('✅ Test database setup complete')
  } catch (error) {
    console.warn('⚠️ Test database setup warning:', error)
    // Continue anyway
  }
})

beforeEach(async () => {
  // Clean database before each test
  try {
    await prisma.$executeRaw`DELETE FROM "Message"`
    await prisma.$executeRaw`DELETE FROM "Conversation"`
    await prisma.$executeRaw`DELETE FROM "UserConsent"`
    await prisma.$executeRaw`DELETE FROM "Assessment"`
    await prisma.$executeRaw`DELETE FROM "User"`
  } catch (error) {
    console.warn('Database cleanup warning:', error)
  }
})

afterAll(async () => {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.warn('Database disconnect warning:', error)
  }
})

// Export for use in tests
export { prisma }