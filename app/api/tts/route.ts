import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/server/auth/config'
import { z } from 'zod'

const TTSRequestSchema = z.object({
  text: z.string().min(1).max(4096),
  voice: z.string().optional().default('female'),
  style: z.string().optional(),
})

const FEMALE_GOOGLE_VOICES: Record<string, string> = {
  female: 'pt-BR-Neural2-C',
  'female_warm': 'pt-BR-Neural2-A',
  'female_soft': 'pt-BR-Wavenet-C',
  'female_bright': 'pt-BR-Neural2-C',
}

const MALE_GOOGLE_VOICES: Record<string, string> = {
  male: 'pt-BR-Neural2-B',
  'male_alt': 'pt-BR-Wavenet-B',
}

type VoiceStyle = 'human' | 'conversational' | 'warm' | 'calm' | 'energetic' | 'neutral'

const STYLE_PRESETS: Record<VoiceStyle, { rate: string; pitch: string; volume: string; breakTime: string }> = {
  human: { rate: 'medium', pitch: '+2st', volume: '+1dB', breakTime: '320ms' },
  conversational: { rate: 'medium', pitch: '+1st', volume: '+1dB', breakTime: '350ms' },
  warm: { rate: 'medium', pitch: '+1st', volume: '+2dB', breakTime: '450ms' },
  calm: { rate: 'slow', pitch: '0st', volume: '+1dB', breakTime: '520ms' },
  energetic: { rate: 'medium', pitch: '+3st', volume: '+1dB', breakTime: '240ms' },
  neutral: { rate: 'medium', pitch: '0st', volume: '0dB', breakTime: '360ms' },
}

interface VoiceSettings {
  speakingRate: number
  pitch: number
  style?: VoiceStyle
}

const VOICE_SETTINGS: Record<string, VoiceSettings> = {
  'pt-BR-Neural2-C': { speakingRate: 1.02, pitch: 0.5, style: 'human' },
  'pt-BR-Neural2-A': { speakingRate: 1.0, pitch: 0, style: 'warm' },
  'pt-BR-Wavenet-C': { speakingRate: 1.0, pitch: 0, style: 'calm' },
  'pt-BR-Neural2-B': { speakingRate: 1.0, pitch: 0, style: 'neutral' },
  'pt-BR-Wavenet-B': { speakingRate: 1.0, pitch: 0, style: 'neutral' },
}

function resolveGoogleVoice(requestedVoice?: string) {
  const voiceKey = (requestedVoice || 'female').toLowerCase()

  if (voiceKey.startsWith('male')) {
    return MALE_GOOGLE_VOICES[voiceKey] || MALE_GOOGLE_VOICES.male
  }

  return FEMALE_GOOGLE_VOICES[voiceKey] || FEMALE_GOOGLE_VOICES.female
}

function getVoiceSettings(voiceName: string): VoiceSettings {
  return VOICE_SETTINGS[voiceName] || { speakingRate: 1.0, pitch: 0, style: 'conversational' }
}

// Google Cloud TTS - Vozes brasileiras:
// 
// JOURNEY (Mais natural, como Google AI Studio):
// pt-BR-Journey-F (feminina) - VOZ MAIS NATURAL E EXPRESSIVA
// pt-BR-Journey-D (masculina)
//
// STUDIO (Alta qualidade profissional):
// pt-BR-Studio-B (feminina) - Voz de estúdio profissional
// pt-BR-Studio-C (masculina)
//
// NEURAL2 (Muito natural):
// pt-BR-Neural2-A (feminina) - Segunda melhor opção
// pt-BR-Neural2-B (masculina)
// pt-BR-Neural2-C (feminina)
//
// WAVENET (Boa qualidade):
// pt-BR-Wavenet-A (feminina)
// pt-BR-Wavenet-B (masculina)

// Remove emojis e caracteres especiais que não devem ser falados
function cleanTextForTTS(text: string): string {
  // Remove emojis
  const withoutEmojis = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '')
  // Remove múltiplos espaços
  const cleaned = withoutEmojis.replace(/\s+/g, ' ').trim()
  return cleaned
}

function escapeForSSML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildSSML(text: string, style: VoiceStyle = 'conversational'): string {
  const preset = STYLE_PRESETS[style] ?? STYLE_PRESETS.conversational
  const sentences = text.match(/[^.!?]+[.!?]?/g) || [text]

  const variations = getProsodyVariations(style, preset)

  const ssmlBody = sentences
    .map((sentence, index) => {
      const trimmed = sentence.trim()
      if (!trimmed) return ''

      const variation = variations[index % variations.length]
      const emphasised = index === 0
        ? `<emphasis level="moderate">${escapeForSSML(trimmed)}</emphasis>`
        : escapeForSSML(trimmed)

      return `<s><prosody rate="${variation.rate}" pitch="${variation.pitch}" volume="${variation.volume}">${emphasised}</prosody></s>`
    })
    .filter(Boolean)
    .join(`<break time="${preset.breakTime}"/>`)

  return `<?xml version="1.0" encoding="UTF-8"?><speak><prosody rate="${preset.rate}" pitch="${preset.pitch}" volume="${preset.volume}">${ssmlBody}</prosody></speak>`
}

function getProsodyVariations(style: VoiceStyle, base: { rate: string; pitch: string; volume: string }): Array<{ rate: string; pitch: string; volume: string }> {
  const variationSets: Record<VoiceStyle, Array<{ rate: string; pitch: string; volume: string }>> = {
    human: [
      { rate: 'medium', pitch: '+2st', volume: '+1dB' },
      { rate: 'medium', pitch: '+1st', volume: '+1dB' },
      { rate: 'medium', pitch: '+3st', volume: '+1dB' },
      { rate: '105%', pitch: '+2st', volume: '+1dB' },
    ],
    conversational: [
      { rate: 'medium', pitch: '+1st', volume: '+1dB' },
      { rate: 'medium', pitch: '+2st', volume: '+1dB' },
    ],
    warm: [
      { rate: 'medium', pitch: '+1st', volume: '+2dB' },
      { rate: 'medium', pitch: '+0.5st', volume: '+2dB' },
    ],
    calm: [
      { rate: 'slow', pitch: '0st', volume: '+1dB' },
      { rate: 'slow', pitch: '-0.5st', volume: '+1dB' },
    ],
    energetic: [
      { rate: 'medium', pitch: '+3st', volume: '+1dB' },
      { rate: '110%', pitch: '+4st', volume: '+1dB' },
    ],
    neutral: [
      { rate: 'medium', pitch: '0st', volume: '0dB' },
      { rate: 'medium', pitch: '+0.5st', volume: '0dB' },
    ],
  }

  return variationSets[style] || [{ rate: base.rate, pitch: base.pitch, volume: base.volume }]
}

async function synthesizeWithGoogleTTS(
  content: string,
  voiceName: string = 'pt-BR-Wavenet-A',
  settings?: { speakingRate?: number; pitch?: number; useSSML?: boolean }
) {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Google API Key missing')

  console.log('Google TTS: usando voz', voiceName)

  const speakingRate = settings?.speakingRate ?? 1.0
  const pitch = settings?.pitch ?? 0
  const input = settings?.useSSML ? { ssml: content } : { text: content }

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input,
      voice: {
        languageCode: 'pt-BR',
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate,
        pitch,
        volumeGainDb: 0,
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Google TTS error response:', errorText)
    throw new Error(`Google TTS API error: ${response.status}`)
  }

  const data = await response.json()
  return Buffer.from(data.audioContent, 'base64')
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional for public pages)
    const session = await getServerSession(authOptions)
    const referer = request.headers.get('referer')
    const isPublicPage = referer?.includes('/voice-call') || referer?.includes('/chat')
    
    if (!session?.user && !isPublicPage) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = TTSRequestSchema.parse(body)

    // Limpar texto de emojis antes de sintetizar
    const cleanedText = cleanTextForTTS(validatedData.text)
    
    // Se só tinha emojis, não gera áudio
    if (!cleanedText || cleanedText.length < 2) {
      return NextResponse.json(
        { ok: false, error: 'Texto vazio após remover emojis', skipAudio: true },
        { status: 400 }
      )
    }

      // Preparar configuração de voz/estilo
      const voiceName = resolveGoogleVoice(validatedData.voice)
      const voiceSettings = getVoiceSettings(voiceName)
      const requestedStyle = validatedData.style?.toLowerCase() as VoiceStyle | undefined
      const finalStyle = (requestedStyle && STYLE_PRESETS[requestedStyle]) ? requestedStyle : voiceSettings.style ?? 'human'

      let audioBuffer: Buffer | null = null
      const ssml = buildSSML(cleanedText, finalStyle)
      console.log('TTS: Gerando áudio com voz Google', voiceName, 'config:', voiceSettings, 'style:', finalStyle, 'texto:', cleanedText.substring(0, 50))

      audioBuffer = await synthesizeWithGoogleTTS(ssml, voiceName, {
        speakingRate: voiceSettings.speakingRate,
        pitch: voiceSettings.pitch,
        useSSML: true,
      })

    if (!audioBuffer) {
      return NextResponse.json(
        { ok: false, error: 'Falha ao gerar áudio', useBrowserTTS: true },
        { status: 500 }
      )
    }

    const audioBytes = new Uint8Array(audioBuffer)

    return new NextResponse(audioBytes, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBytes.byteLength.toString(),
        'Content-Disposition': 'inline; filename="clara-voice.mp3"',
          'Cache-Control': 'public, max-age=3600',
          'X-TTS-Provider': 'google',
      },
    })

  } catch (error: any) {
    console.error('TTS API error:', error)
    
    return NextResponse.json(
      { 
        ok: false, 
        error: error.message || 'Erro ao gerar áudio',
        useBrowserTTS: true
      },
      { status: 500 }
    )
  }
}