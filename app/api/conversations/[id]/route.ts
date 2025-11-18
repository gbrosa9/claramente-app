import { NextRequest, NextResponse } from 'next/server'
import { requireOwnershipOrRole, getConversationUserId } from '@/src/server/auth/middleware'
import { prisma } from '@/src/server/db'
import { logger } from '@/src/server/lib/logger'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const authResult = await requireOwnershipOrRole(
      getConversationUserId,
      'PROFESSIONAL',
      'ADMIN'
    )(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const conversation = await prisma.conversation.findUnique({
      where: { 
        id: params.id,
        deletedAt: null 
      },
      include: {
        messages: {
          select: {
            id: true,
            sender: true,
            text: true,
            audioUrl: true,
            createdAt: true,
            metadata: true,
          },
          orderBy: { createdAt: 'asc' },
          take: limit,
        },
        _count: {
          select: { messages: true }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { ok: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      data: { conversation }
    })
  } catch (error) {
    logger.error({ error, conversationId: params.id }, 'Failed to get conversation')
    return NextResponse.json(
      { ok: false, error: 'Failed to get conversation' },
      { status: 500 }
    )
  }
}