import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/src/server/auth/middleware'
import { prisma } from '@/src/server/db'
import { logger } from '@/src/server/lib/logger'

const CreateConversationSchema = z.object({
  title: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const archived = searchParams.get('archived') === 'true'
    
    const skip = (page - 1) * limit

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          userId: user.id,
          archived,
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
          lastMessageAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.conversation.count({
        where: {
          userId: user.id,
          archived,
          deletedAt: null,
        }
      })
    ])

    return NextResponse.json({
      ok: true,
      data: {
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    logger.error({ error }, 'Failed to get conversations')
    return NextResponse.json(
      { ok: false, error: 'Failed to get conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult
    const body = await request.json()
    const validatedData = CreateConversationSchema.parse(body)

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: validatedData.title || 'Nova conversa',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    logger.info({ userId: user.id, conversationId: conversation.id }, 'Conversation created')

    return NextResponse.json({
      ok: true,
      data: { conversation }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    logger.error({ error }, 'Failed to create conversation')
    return NextResponse.json(
      { ok: false, error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}