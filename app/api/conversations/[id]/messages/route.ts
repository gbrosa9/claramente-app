import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOwnershipOrRole, getConversationUserId } from '@/src/server/auth/middleware'
import { prisma } from '@/src/server/db'
import { logger } from '@/src/server/lib/logger'

const CreateMessageSchema = z.object({
  text: z.string().min(1).optional(),
  audioUrl: z.string().url().optional(),
}).refine(data => data.text || data.audioUrl, {
  message: "Either text or audioUrl must be provided"
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const routeParams = await context.params;
  try {
    const authResult = await requireOwnershipOrRole(
      getConversationUserId,
      'PROFESSIONAL',
      'ADMIN'
    )(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { user } = authResult
    const body = await request.json()
    const validatedData = CreateMessageSchema.parse(body)

    // Check if conversation exists and user has access
    const conversation = await prisma.conversation.findUnique({
      where: { 
        id: routeParams.id,
        deletedAt: null 
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { ok: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Create user message
    const message = await prisma.message.create({
      data: {
        conversationId: routeParams.id,
        sender: 'USER',
        text: validatedData.text,
        audioUrl: validatedData.audioUrl,
      },
      select: {
        id: true,
        sender: true,
        text: true,
        audioUrl: true,
        createdAt: true,
      }
    })

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: routeParams.id },
      data: { lastMessageAt: new Date() }
    })

    // If text message, enqueue LLM processing
    if (validatedData.text) {
      const { enqueueLLMProcessing } = await import('@/src/server/jobs/queues')
      await enqueueLLMProcessing({
        conversationId: routeParams.id,
        messageId: message.id,
        userMessage: validatedData.text,
        userId: user.id,
      })
      logger.info({ messageId: message.id, conversationId: routeParams.id }, 'Message queued for LLM processing')
    }

    // If audio message, enqueue STT processing
    if (validatedData.audioUrl) {
      const { enqueueSTTProcessing } = await import('@/src/server/jobs/queues')
      await enqueueSTTProcessing({
        messageId: message.id,
        audioUrl: validatedData.audioUrl,
        conversationId: routeParams.id,
        userId: user.id,
      })
      logger.info({ messageId: message.id, conversationId: routeParams.id }, 'Audio message queued for STT processing')
    }

    logger.info({ 
      userId: user.id, 
      messageId: message.id, 
      conversationId: routeParams.id 
    }, 'Message created')

    return NextResponse.json({
      ok: true,
      data: { message }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    logger.error({ error, conversationId: routeParams.id }, 'Failed to create message')
    return NextResponse.json(
      { ok: false, error: 'Failed to create message' },
      { status: 500 }
    )
  }
}