import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { handlePreflight, applyCORS, applySecurityHeaders } from './src/config/cors'
import { applyRateLimit } from './src/config/rate-limit'

export async function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  const preflightResponse = handlePreflight(request)
  if (preflightResponse) {
    return preflightResponse
  }

  const path = request.nextUrl.pathname

  // Get authentication token
  const token = await getToken({ 
    req: request, 
    secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET 
  })
  const isAuth = !!token

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/contact',
    '/planos', 
    '/resources',
    '/chat',
    '/checkout',
    '/voice-call',
    '/therapy',
    '/exercises',
    '/login',
    '/register',
    '/confirm-email',
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy',
    '/auth/callback'
  ]

  const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route + '/'))
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].some(route => 
    path.startsWith(route)
  )
  const isApiAuthRoute = path.startsWith('/api/auth/')
  const isPublicApiRoute = ['/api/contact', '/api/health', '/api/chat', '/api/tts', '/api/stt', '/api/avatar/tts', '/api/voice'].some(route => path.startsWith(route))

  if (!isAuth && !isPublicRoute && !isApiAuthRoute && !isPublicApiRoute) {
    // Redirect unauthenticated users to login
    let from = path
    if (request.nextUrl.search) {
      from += request.nextUrl.search
    }
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, request.url))
  }

  // Role-based access control for authenticated users
  if (isAuth && token) {
    const userRole = token.role as string

    // Admin only routes
    if (path.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Professional only routes  
    if (path.startsWith('/professional') && !['PROFESSIONAL', 'ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Apply rate limiting based on path
  let rateLimitResponse = null

  if (path.startsWith('/api/auth/')) {
    rateLimitResponse = await applyRateLimit(request, 'auth')
  } else if (path.includes('/messages')) {
    rateLimitResponse = await applyRateLimit(request, 'messages')
  } else if (path.startsWith('/api/voice/')) {
    rateLimitResponse = await applyRateLimit(request, 'voice')
  } else if (path.includes('/assessments/')) {
    rateLimitResponse = await applyRateLimit(request, 'assessments')
  } else if (path.startsWith('/api/')) {
    rateLimitResponse = await applyRateLimit(request, 'api')
  }

  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // Continue with the request
  const response = NextResponse.next()

  // Apply CORS headers
  applyCORS(request, response)

  // Apply security headers
  applySecurityHeaders(response)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}