/**
 * API Endpoint: /api/avatar/tts
 * Text-to-Speech com suporte a ElevenLabs e Google TTS
 * 
 * POST /api/avatar/tts
 * Body: { text, voice?, emotion?, customSettings? }
 * Response: { audio: "<base64>" } ou streaming
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ttsToBase64, getAvailableVoicePresets, VoiceSettings } from '@/lib/elevenlabs'
import { googleTtsToBase64, isGoogleVoice, getAvailableGoogleVoices } from '@/lib/google-tts'
import { EmotionType, getAvailableEmotions, detectEmotionFromText } from '@/lib/emotion-detector'
import { getTTSStatus, debugTTSEnv } from '@/lib/env-validation'

// Schema de validação
const TTSRequestSchema = z.object({
  text: z.string().min(1, 'Texto é obrigatório').max(5000, 'Texto muito longo (máx 5000 caracteres)'),
  voice: z.string().optional().default('clara'),
  emotion: z.string().optional(),
  customSettings: z.object({
    stability: z.number().min(0).max(1).optional(),
    similarity_boost: z.number().min(0).max(1).optional(),
    style: z.number().min(0).max(1).optional(),
    use_speaker_boost: z.boolean().optional(),
  }).optional(),
  autoDetectEmotion: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    // Parse e valida o body
    const body = await request.json()
    const validatedData = TTSRequestSchema.parse(body)
    
    const { text, voice, customSettings, autoDetectEmotion } = validatedData
    let emotion = validatedData.emotion as EmotionType | undefined
    
    // Auto-detecta emoção se solicitado
    if (autoDetectEmotion && !emotion) {
      emotion = detectEmotionFromText(text)
      console.log('[TTS API] Emoção detectada:', emotion)
    }
    
    console.log('[TTS API] Requisição recebida:', {
      textLength: text.length,
      voice,
      emotion,
      hasCustomSettings: !!customSettings,
    })
    
    let audioBase64: string
    
    // Decide entre Google TTS ou ElevenLabs
    if (isGoogleVoice(voice || '')) {
      console.log('[TTS API] Usando Google TTS')
      audioBase64 = await googleTtsToBase64(text, voice, { emotion })
    } else {
      console.log('[TTS API] Usando ElevenLabs')
      audioBase64 = await ttsToBase64(
        text,
        voice,
        customSettings as Partial<VoiceSettings>,
        emotion
      )
    }
    
    return NextResponse.json({
      ok: true,
      audio: audioBase64,
      metadata: {
        textLength: text.length,
        voice,
        emotion,
        provider: isGoogleVoice(voice || '') ? 'google' : 'elevenlabs',
      },
    })
    
  } catch (error: any) {
    console.error('[TTS API] Erro:', error)
    
    // Erro de validação Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Dados inválidos', 
          details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      )
    }
    
    // Erro de API key não configurada
    if (error.message?.includes('API key não configurada')) {
      return NextResponse.json(
        { 
          ok: false, 
          error: error.message,
          hint: 'Configure ELEVENLABS_API_KEY ou GOOGLE_TTS_API_KEY no .env.local'
        },
        { status: 500 }
      )
    }
    
    // Erro da API externa
    if (error.message?.includes('API error')) {
      return NextResponse.json(
        { ok: false, error: 'Erro no serviço de TTS', details: error.message },
        { status: 502 }
      )
    }
    
    // Erro genérico
    return NextResponse.json(
      { ok: false, error: 'Erro interno ao gerar áudio' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/avatar/tts
 * Retorna informações sobre vozes e emoções disponíveis
 */
export async function GET() {
  try {
    const status = getTTSStatus()
    const envDebug = debugTTSEnv()
    
    return NextResponse.json({
      ok: true,
      status: status.message,
      providers: {
        elevenlabs: status.elevenlabs,
        googleTts: status.googleTts,
      },
      voices: {
        elevenlabs: getAvailableVoicePresets(),
        google: getAvailableGoogleVoices(),
      },
      emotions: getAvailableEmotions(),
      debug: process.env.NODE_ENV === 'development' ? envDebug : undefined,
    })
  } catch (error) {
    console.error('[TTS API] Erro no GET:', error)
    return NextResponse.json(
      { ok: false, error: 'Erro ao obter informações de TTS' },
      { status: 500 }
    )
  }
}
