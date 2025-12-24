/**
 * Google Cloud Text-to-Speech Integration
 * Suporta vozes Wavenet para português brasileiro
 */

import { EmotionType, addNaturalProsody } from './emotion-detector'

// Vozes Wavenet disponíveis para pt-BR
export const GOOGLE_VOICES = {
  'pt-BR-Wavenet-A': { name: 'Wavenet A', gender: 'female', description: 'Voz feminina natural' },
  'pt-BR-Wavenet-B': { name: 'Wavenet B', gender: 'male', description: 'Voz masculina natural' },
  'pt-BR-Wavenet-C': { name: 'Wavenet C', gender: 'female', description: 'Voz feminina expressiva' },
  'pt-BR-Wavenet-D': { name: 'Wavenet D', gender: 'male', description: 'Voz masculina profunda' },
  'pt-BR-Wavenet-E': { name: 'Wavenet E', gender: 'female', description: 'Voz feminina suave' },
  'pt-BR-Neural2-A': { name: 'Neural2 A', gender: 'female', description: 'Voz neural feminina' },
  'pt-BR-Neural2-B': { name: 'Neural2 B', gender: 'male', description: 'Voz neural masculina' },
  'pt-BR-Neural2-C': { name: 'Neural2 C', gender: 'female', description: 'Voz neural expressiva' },
} as const

export type GoogleVoiceName = keyof typeof GOOGLE_VOICES

export interface GoogleTTSOptions {
  voiceName?: GoogleVoiceName | string
  speakingRate?: number  // 0.25 a 4.0 (1.0 = normal)
  pitch?: number         // -20.0 a 20.0 (0 = normal)
  emotion?: EmotionType
  useSSML?: boolean
}

/**
 * Retorna lista de vozes Google disponíveis
 */
export function getAvailableGoogleVoices() {
  return Object.entries(GOOGLE_VOICES).map(([id, voice]) => ({
    id,
    ...voice,
  }))
}

/**
 * Verifica se uma voz é do Google TTS
 */
export function isGoogleVoice(voice: string): boolean {
  if (voice.toLowerCase() === 'google') return true
  if (voice.startsWith('pt-BR-Wavenet-')) return true
  if (voice.startsWith('pt-BR-Neural2-')) return true
  if (voice in GOOGLE_VOICES) return true
  return false
}

/**
 * Resolve o nome da voz Google
 */
function resolveGoogleVoice(voice: string): string {
  if (voice.toLowerCase() === 'google') {
    return 'pt-BR-Wavenet-C' // Default: voz feminina expressiva
  }
  return voice
}

/**
 * Ajusta parâmetros de fala baseado na emoção
 */
function getEmotionAudioConfig(emotion?: EmotionType): { speakingRate: number; pitch: number } {
  const defaults = { speakingRate: 1.0, pitch: 0 }
  
  if (!emotion) return defaults
  
  switch (emotion) {
    case 'happy':
    case 'excited':
      return { speakingRate: 1.1, pitch: 2.0 }
    case 'sad':
    case 'melancholic':
      return { speakingRate: 0.9, pitch: -2.0 }
    case 'calm':
    case 'peaceful':
      return { speakingRate: 0.95, pitch: -1.0 }
    case 'empathetic':
    case 'caring':
      return { speakingRate: 0.95, pitch: 0.5 }
    case 'serious':
    case 'professional':
      return { speakingRate: 1.0, pitch: -1.5 }
    case 'encouraging':
    case 'supportive':
      return { speakingRate: 1.05, pitch: 1.0 }
    default:
      return defaults
  }
}

/**
 * Converte texto para áudio usando Google Cloud TTS e retorna em base64
 */
export async function googleTtsToBase64(
  text: string,
  voiceName: string = 'pt-BR-Wavenet-C',
  options: GoogleTTSOptions = {}
): Promise<string> {
  // Tenta múltiplas variáveis de ambiente
  const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    console.error('[Google TTS] API key não configurada (GOOGLE_TTS_API_KEY, GOOGLE_CLOUD_API_KEY, GOOGLE_API_KEY ou GEMINI_API_KEY)')
    throw new Error('Google TTS API key não configurada')
  }
  
  console.log('[Google TTS] API key encontrada:', apiKey.substring(0, 10) + '...')
  
  const resolvedVoice = resolveGoogleVoice(voiceName)
  const emotionConfig = getEmotionAudioConfig(options.emotion)
  
  // Aplica SSML se solicitado e há emoção
  let inputText = text
  let inputType: 'text' | 'ssml' = 'text'
  
  if (options.useSSML !== false && options.emotion) {
    inputText = addNaturalProsody(text, options.emotion)
    inputType = 'ssml'
  }
  
  const requestBody = {
    input: inputType === 'ssml' ? { ssml: inputText } : { text: inputText },
    voice: {
      languageCode: 'pt-BR',
      name: resolvedVoice,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: options.speakingRate ?? emotionConfig.speakingRate,
      pitch: options.pitch ?? emotionConfig.pitch,
      effectsProfileId: ['small-bluetooth-speaker-class-device'], // Otimiza para clareza
    },
  }
  
  console.log('[Google TTS] Gerando áudio:', {
    voice: resolvedVoice,
    textLength: text.length,
    emotion: options.emotion,
    useSSML: inputType === 'ssml',
  })
  
  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Google TTS] Erro na API:', {
        status: response.status,
        error: errorText,
      })
      throw new Error(`Google TTS API error: ${response.status} - ${errorText}`)
    }
    
    const data = await response.json()
    
    if (!data.audioContent) {
      throw new Error('Google TTS não retornou conteúdo de áudio')
    }
    
    console.log('[Google TTS] Áudio gerado com sucesso:', {
      audioLength: data.audioContent.length,
    })
    
    return data.audioContent // Já vem em base64
    
  } catch (error) {
    console.error('[Google TTS] Erro ao gerar áudio:', error)
    throw error
  }
}

/**
 * Converte texto para áudio e retorna como ArrayBuffer
 */
export async function googleTtsToBuffer(
  text: string,
  voiceName: string = 'pt-BR-Wavenet-C',
  options: GoogleTTSOptions = {}
): Promise<ArrayBuffer> {
  const base64Audio = await googleTtsToBase64(text, voiceName, options)
  const binaryString = atob(base64Audio)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}
