import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { logger } from '../lib/logger'

export type UserRole = 'USER' | 'PROFESSIONAL' | 'ADMIN'

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
    verified: boolean
    onboardCompleted: boolean
    termsAccepted: boolean
  }
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedRequest | NextResponse> {
  try {
    const token = await getToken({ req: request, secret: process.env.JWT_SECRET })

    if (!token || !token.sub) {
      logger.warn({ path: request.nextUrl.pathname }, 'Unauthorized access attempt')
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!token.verified) {
      return NextResponse.json(
        { ok: false, error: 'Email verification required' },
        { status: 403 }
      )
    }

    // Attach user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = {
      id: token.sub,
      email: token.email!,
      name: token.name!,
      role: token.role as UserRole,
      verified: token.verified as boolean,
      onboardCompleted: token.onboardCompleted as boolean,
      termsAccepted: token.termsAccepted as boolean,
    }

    return authenticatedRequest
  } catch (error) {
    logger.error({ error, path: request.nextUrl.pathname }, 'Authentication error')
    return NextResponse.json(
      { ok: false, error: 'Authentication failed' },
      { status: 401 }
    )
  }
}

/**
 * Middleware to require specific role
 */
export function requireRole(...roles: UserRole[]) {
  return async (request: NextRequest): Promise<AuthenticatedRequest | NextResponse> => {
    const authResult = await requireAuth(request)

    if (authResult instanceof NextResponse) {
      return authResult // Return error response
    }

    const authenticatedRequest = authResult as AuthenticatedRequest

    if (!roles.includes(authenticatedRequest.user.role)) {
      logger.warn({
        userId: authenticatedRequest.user.id,
        userRole: authenticatedRequest.user.role,
        requiredRoles: roles,
        path: request.nextUrl.pathname
      }, 'Insufficient permissions')

      return NextResponse.json(
        { ok: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    return authenticatedRequest
  }
}

/**
 * Middleware to require resource ownership or specific role
 */
export function requireOwnershipOrRole(
  getResourceUserId: (request: NextRequest) => Promise<string | null>,
  ...allowedRoles: UserRole[]
) {
  return async (request: NextRequest): Promise<AuthenticatedRequest | NextResponse> => {
    const authResult = await requireAuth(request)

    if (authResult instanceof NextResponse) {
      return authResult // Return error response
    }

    const authenticatedRequest = authResult as AuthenticatedRequest

    // Check if user has allowed role
    if (allowedRoles.includes(authenticatedRequest.user.role)) {
      return authenticatedRequest
    }

    // Check if user owns the resource
    try {
      const resourceUserId = await getResourceUserId(request)
      
      if (resourceUserId && resourceUserId === authenticatedRequest.user.id) {
        return authenticatedRequest
      }

      logger.warn({
        userId: authenticatedRequest.user.id,
        resourceUserId,
        userRole: authenticatedRequest.user.role,
        allowedRoles,
        path: request.nextUrl.pathname
      }, 'Access denied: not owner and insufficient role')

      return NextResponse.json(
        { ok: false, error: 'Access denied' },
        { status: 403 }
      )
    } catch (error) {
      logger.error({ error, path: request.nextUrl.pathname }, 'Ownership check failed')
      return NextResponse.json(
        { ok: false, error: 'Access validation failed' },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware to require terms acceptance
 */
export async function requireTermsAcceptance(request: NextRequest): Promise<AuthenticatedRequest | NextResponse> {
  const authResult = await requireAuth(request)

  if (authResult instanceof NextResponse) {
    return authResult // Return error response
  }

  const authenticatedRequest = authResult as AuthenticatedRequest

  if (!authenticatedRequest.user.termsAccepted) {
    return NextResponse.json(
      { ok: false, error: 'Terms acceptance required' },
      { status: 403 }
    )
  }

  return authenticatedRequest
}

/**
 * Helper to extract user ID from conversation
 */
export async function getConversationUserId(request: NextRequest): Promise<string | null> {
  const { prisma } = await import('../db')
  const conversationId = request.nextUrl.pathname.split('/')[3] // /api/conversations/[id]

  if (!conversationId) {
    return null
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userId: true }
    })

    return conversation?.userId || null
  } catch (error) {
    logger.error({ error, conversationId }, 'Failed to get conversation user ID')
    return null
  }
}