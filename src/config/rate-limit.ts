import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '../server/lib/logger'

// Check if we have Upstash Redis configuration
const hasUpstashRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

let redis: Redis | null = null

// Only initialize Redis if we have proper Upstash configuration
if (hasUpstashRedis) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

// In-memory rate limiting as fallback
const memoryStore = new Map<string, { count: number; resetTime: number }>()

function cleanupMemoryStore() {
  const now = Date.now()
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetTime) {
      memoryStore.delete(key)
    }
  }
}

async function memoryRateLimit(key: string, limit: number, windowMs: number) {
  cleanupMemoryStore()
  
  const now = Date.now()
  const entry = memoryStore.get(key)
  
  if (!entry) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, limit, reset: now + windowMs, remaining: limit - 1 }
  }
  
  if (now > entry.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + windowMs })
    return { success: true, limit, reset: now + windowMs, remaining: limit - 1 }
  }
  
  entry.count++
  const remaining = Math.max(0, limit - entry.count)
  const success = entry.count <= limit
  
  return { success, limit, reset: entry.resetTime, remaining }
}

// Different rate limits for different endpoints
const rateLimitConfigs = {
  auth: { limit: 50, windowMs: 5 * 60 * 1000 }, // 50 requests per 5 minutes (mais permissivo para desenvolvimento)
  messages: { limit: 30, windowMs: 60 * 1000 }, // 30 messages per minute
  voice: { limit: 10, windowMs: 60 * 1000 }, // 10 voice sessions per minute
  assessments: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 assessments per hour
  api: { limit: 100, windowMs: 60 * 1000 }, // 100 API calls per minute
}

// Create Upstash rate limits only if Redis is available
const upstashRateLimits = redis ? {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '5 m'), // 50 requests per 5 minutes
    analytics: true,
  }),
  
  messages: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
  }),
  
  voice: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
  }),
  
  assessments: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
  }),
  
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  }),
} : null

type RateLimitType = keyof typeof rateLimitConfigs

export async function applyRateLimit(
  request: NextRequest,
  type: RateLimitType = 'api',
  identifier?: string
): Promise<NextResponse | null> {
  try {
    // Get identifier (IP or user ID)
    const id = identifier || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'anonymous'

    let result: { success: boolean; limit: number; reset: number; remaining: number }

    // Use Upstash if available, otherwise use memory-based rate limiting
    if (upstashRateLimits && upstashRateLimits[type]) {
      result = await upstashRateLimits[type].limit(id)
    } else {
      // Fallback to memory-based rate limiting
      const config = rateLimitConfigs[type]
      const key = `${type}:${id}`
      result = await memoryRateLimit(key, config.limit, config.windowMs)
    }

    const { success, limit, reset, remaining } = result

    if (!success) {
      logger.warn({
        identifier: id,
        type,
        limit,
        reset,
        path: request.nextUrl.pathname,
      }, 'Rate limit exceeded')

      return NextResponse.json(
        {
          ok: false,
          error: 'Too many requests',
          details: {
            limit,
            remaining: 0,
            reset: new Date(reset),
          }
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      )
    }

    // Add rate limit headers to successful responses
    request.headers.set('X-RateLimit-Limit', limit.toString())
    request.headers.set('X-RateLimit-Remaining', remaining.toString())
    request.headers.set('X-RateLimit-Reset', reset.toString())

    return null // No rate limit hit
  } catch (error) {
    logger.error({ error, type, identifier }, 'Rate limiting failed')
    // Fail open - don't block requests if rate limiting fails
    return null
  }
}

// Middleware factory for specific rate limits
export function createRateLimitMiddleware(type: RateLimitType) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    return applyRateLimit(request, type)
  }
}

// Pre-configured middlewares
export const authRateLimit = createRateLimitMiddleware('auth')
export const messageRateLimit = createRateLimitMiddleware('messages')
export const voiceRateLimit = createRateLimitMiddleware('voice')
export const assessmentRateLimit = createRateLimitMiddleware('assessments')
export const apiRateLimit = createRateLimitMiddleware('api')

// Rate limit by user ID
export async function applyUserRateLimit(
  request: NextRequest,
  userId: string,
  type: RateLimitType = 'api'
): Promise<NextResponse | null> {
  return applyRateLimit(request, type, `user:${userId}`)
}