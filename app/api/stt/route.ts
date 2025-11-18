import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/server/auth/config'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { ok: false, error: 'Arquivo de áudio é obrigatório' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg']
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { ok: false, error: 'Tipo de arquivo não suportado' },
        { status: 400 }
      )
    }

    // Validate file size (max 25MB)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: 'Arquivo muito grande (máximo 25MB)' },
        { status: 400 }
      )
    }

    // Transcribe audio using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'pt', // Portuguese
      response_format: 'verbose_json',
    })

    return NextResponse.json({
      ok: true,
      data: {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        segments: transcription.segments,
      }
    })

  } catch (error: any) {
    console.error('STT API error:', error)
    
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
      { ok: false, error: 'Erro ao transcrever áudio' },
      { status: 500 }
    )
  }
}