import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/server/auth/config'
import OpenAI from 'openai'
import { z } from 'zod'

const TTSRequestSchema = z.object({
  text: z.string().min(1).max(4096),
  voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional().default('nova'),
})

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional for voice-call)
    const session = await getServerSession(authOptions)
    
    // For voice-call page, allow access without authentication
    const referer = request.headers.get('referer')
    const isVoiceCall = referer?.includes('/voice-call')
    
    if (!session?.user && !isVoiceCall) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = TTSRequestSchema.parse(body)

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: validatedData.voice,
      input: validatedData.text,
      speed: 0.9, // Slightly slower for therapeutic voice
    })

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Return audio file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': 'inline; filename="clara-voice.mp3"',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })

  } catch (error: any) {
    console.error('TTS API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    if (error?.code === 'invalid_api_key') {
      return NextResponse.json(
        { ok: false, error: 'Chave da API OpenAI inválida ou não configurada' },
        { status: 500 }
      )
    }

    if (error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { ok: false, error: 'Cota da API OpenAI esgotada' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { ok: false, error: 'Erro ao gerar áudio' },
      { status: 500 }
    )
  }
}