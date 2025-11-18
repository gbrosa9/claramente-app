import { NextRequest, NextResponse } from 'next/server'

interface CORSOptions {
  origin?: string | string[] | boolean
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
}

const defaultOptions: CORSOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'X-Requested-With',
    'Access-Control-Allow-Origin',
    'X-HTTP-Method-Override',
    'Content-Type',
    'Authorization',
    'Accept',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
}

export function applyCORS(
  request: NextRequest,
  response: NextResponse,
  options: CORSOptions = {}
): NextResponse {
  const opts = { ...defaultOptions, ...options }
  const origin = request.headers.get('origin')
  
  // Handle origin
  if (opts.origin === true) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  } else if (typeof opts.origin === 'string') {
    response.headers.set('Access-Control-Allow-Origin', opts.origin)
  } else if (Array.isArray(opts.origin) && origin) {
    if (opts.origin.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
  }
  
  // Handle methods
  if (opts.methods) {
    response.headers.set('Access-Control-Allow-Methods', opts.methods.join(', '))
  }
  
  // Handle headers
  if (opts.allowedHeaders) {
    response.headers.set('Access-Control-Allow-Headers', opts.allowedHeaders.join(', '))
  }
  
  if (opts.exposedHeaders) {
    response.headers.set('Access-Control-Expose-Headers', opts.exposedHeaders.join(', '))
  }
  
  // Handle credentials
  if (opts.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  // Handle max age
  if (opts.maxAge) {
    response.headers.set('Access-Control-Max-Age', opts.maxAge.toString())
  }
  
  return response
}

// Middleware for handling preflight requests
export function handlePreflight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })
    return applyCORS(request, response)
  }
  return null
}

// CORS middleware factory
export function createCORSMiddleware(options: CORSOptions = {}) {
  return (request: NextRequest, response: NextResponse): NextResponse => {
    return applyCORS(request, response, options)
  }
}

// Security headers middleware
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // HTTPS enforcement
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self' https: wss: ws:",
    "media-src 'self' https:",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  )
  
  return response
}