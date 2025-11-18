import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOwnershipOrRole, getConversationUserId } from '@/src/server/auth/middleware'

const StartVoiceSessionSchema = z.object({
  conversationId: z.string(),
})

export async function POST(request: NextRequest) {
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
    const validatedData = StartVoiceSessionSchema.parse(body)

    // Generate session credentials (simplified token for demo)
    const sessionToken = user.id // In production, generate proper JWT
    const wsUrl = `ws://localhost:8080/voice?token=${sessionToken}`

    return NextResponse.json({
      ok: true,
      data: {
        wsUrl,
        sessionToken,
        conversationId: validatedData.conversationId,
        instructions: {
          connect: 'Connect to the WebSocket URL with the provided token',
          startSession: 'Send message with type "start_session" and conversationId',
          sendAudio: 'Send audio chunks with type "audio_chunk" and base64 encoded data',
          sendText: 'Send text with type "text_message" for real-time processing',
          endSession: 'Send message with type "end_session" to close'
        }
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to start voice session' },
      { status: 500 }
    )
  }
}