/**
 * ElevenLabs TTS Integration
 * Suporta voice IDs, nomes amigáveis e configurações personalizadas
 */

import { EmotionType, getVoiceSettingsForEmotion } from './emotion-detector'

// Voice IDs do ElevenLabs
export const VOICE_IDS = {
  bella: '21m00Tcm4TlvDq8ikWAM',      // Bella - feminina, suave
  rachel: 'EXAVITQu4vr4xnSDxMaL',     // Rachel - feminina, natural
  domi: 'AZnzlk1XvdvUeBnXmlld',       // Domi - feminina, expressiva
  amigavel: 'pNInz6obpgDQGcFmaJgB',   // Adam - amigável
  friendly: 'pNInz6obpgDQGcFmaJgB',   // Alias para amigavel
  clara: process.env.ELEVENLABS_VOICE_ID || 'RGymW84CSmfVugnA5tvA', // Voz da Clara
} as const

export type VoicePreset = keyof typeof VOICE_IDS

// Presets de voz com configurações otimizadas para voz natural e humana
export const VOICE_PRESETS: Record<VoicePreset, {
  voiceId: string
  name: string
  description: string
  defaultSettings: VoiceSettings
}> = {
  bella: {
    voiceId: VOICE_IDS.bella,
    name: 'Bella',
    description: 'Voz feminina suave e acolhedora',
    defaultSettings: {
      stability: 0.35,           // Menor = mais expressiva e natural
      similarity_boost: 0.65,    // Moderado para naturalidade
      style: 0.45,               // Expressividade média-alta
      use_speaker_boost: true,
    },
  },
  rachel: {
    voiceId: VOICE_IDS.rachel,
    name: 'Rachel',
    description: 'Voz feminina natural e expressiva',
    defaultSettings: {
      stability: 0.40,
      similarity_boost: 0.70,
      style: 0.50,
      use_speaker_boost: true,
    },
  },
  domi: {
    voiceId: VOICE_IDS.domi,
    name: 'Domi',
    description: 'Voz feminina dinâmica e energética',
    defaultSettings: {
      stability: 0.30,
      similarity_boost: 0.60,
      style: 0.55,
      use_speaker_boost: true,
    },
  },
  amigavel: {
    voiceId: VOICE_IDS.amigavel,
    name: 'Amigável',
    description: 'Voz amigável e acessível',
    defaultSettings: {
      stability: 0.40,
      similarity_boost: 0.65,
      style: 0.40,
      use_speaker_boost: true,
    },
  },
  friendly: {
    voiceId: VOICE_IDS.friendly,
    name: 'Friendly',
    description: 'Alias para voz amigável',
    defaultSettings: {
      stability: 0.40,
      similarity_boost: 0.65,
      style: 0.40,
      use_speaker_boost: true,
    },
  },
  clara: {
    voiceId: VOICE_IDS.clara,
    name: 'Clara',
    description: 'Voz da terapeuta Clara - feminina, empática e acolhedora',
    defaultSettings: {
      stability: 0.30,           // Baixa para expressividade natural
      similarity_boost: 0.75,    // Alta para manter característica
      style: 0.35,               // Moderado
      use_speaker_boost: true,
    },
  },
}

export interface VoiceSettings {
  stability: number        // 0-1: menor = mais expressivo, maior = mais estável
  similarity_boost: number // 0-1: fidelidade à voz original
  style: number           // 0-1: intensidade do estilo
  use_speaker_boost: boolean
}

export interface TTSOptions {
  voice?: string | VoicePreset
  customSettings?: Partial<VoiceSettings>
  emotion?: EmotionType
  modelId?: string
}

/**
 * Retorna lista de presets disponíveis
 */
export function getAvailableVoicePresets() {
  return Object.entries(VOICE_PRESETS).map(([key, preset]) => ({
    id: key,
    name: preset.name,
    description: preset.description,
  }))
}

/**
 * Resolve o voice ID a partir de um nome amigável ou ID direto
 */
function resolveVoiceId(voice: string): string {
  const lowerVoice = voice.toLowerCase()
  
  // Verifica se é um preset conhecido
  if (lowerVoice in VOICE_IDS) {
    return VOICE_IDS[lowerVoice as VoicePreset]
  }
  
  // Verifica variáveis de ambiente
  if (lowerVoice === 'voice_2' || lowerVoice === 'secondary') {
    return process.env.ELEVENLABS_VOICE_ID_2 || VOICE_IDS.rachel
  }
  if (lowerVoice === 'voice_3' || lowerVoice === 'tertiary') {
    return process.env.ELEVENLABS_VOICE_ID_3 || VOICE_IDS.domi
  }
  
  // Se não é um preset, assume que é um voice ID direto
  return voice
}

/**
 * Obtém as configurações de voz combinando preset, emoção e customizações
 */
function getVoiceSettings(
  voice: string,
  emotion?: EmotionType,
  customSettings?: Partial<VoiceSettings>
): VoiceSettings {
  const lowerVoice = voice.toLowerCase()
  
  // Pega configurações padrão do preset ou usa valores base
  let baseSettings: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.3,
    use_speaker_boost: true,
  }
  
  if (lowerVoice in VOICE_PRESETS) {
    baseSettings = { ...VOICE_PRESETS[lowerVoice as VoicePreset].defaultSettings }
  }
  
  // Aplica ajustes de emoção se fornecida
  if (emotion) {
    const emotionSettings = getVoiceSettingsForEmotion(emotion)
    baseSettings = {
      ...baseSettings,
      stability: baseSettings.stability * emotionSettings.stabilityMultiplier,
      style: Math.min(1, baseSettings.style + emotionSettings.styleBoost),
    }
  }
  
  // Aplica customizações do usuário por cima de tudo
  if (customSettings) {
    baseSettings = { ...baseSettings, ...customSettings }
  }
  
  // Garante que os valores estão dentro dos limites
  return {
    stability: Math.max(0, Math.min(1, baseSettings.stability)),
    similarity_boost: Math.max(0, Math.min(1, baseSettings.similarity_boost)),
    style: Math.max(0, Math.min(1, baseSettings.style)),
    use_speaker_boost: baseSettings.use_speaker_boost,
  }
}

/**
 * Converte texto para áudio usando ElevenLabs e retorna em base64
 */
export async function ttsToBase64(
  text: string,
  voice: string = 'clara',
  customSettings?: Partial<VoiceSettings>,
  emotion?: EmotionType
): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  
  if (!apiKey) {
    console.error('[ElevenLabs] API key não configurada (ELEVENLABS_API_KEY)')
    throw new Error('ElevenLabs API key não configurada')
  }
  
  const voiceId = resolveVoiceId(voice)
  const voiceSettings = getVoiceSettings(voice, emotion, customSettings)
  const modelId = 'eleven_multilingual_v2' // Melhor para português
  
  console.log('[ElevenLabs] Gerando TTS:', {
    voiceId,
    textLength: text.length,
    emotion,
    settings: voiceSettings,
  })
  
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: voiceSettings,
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[ElevenLabs] Erro na API:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }
    
    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    
    console.log('[ElevenLabs] TTS gerado com sucesso:', {
      audioSize: audioBuffer.byteLength,
      base64Length: base64Audio.length,
    })
    
    return base64Audio
    
  } catch (error) {
    console.error('[ElevenLabs] Erro ao gerar TTS:', error)
    throw error
  }
}

/**
 * Converte texto para áudio e retorna como ArrayBuffer (para streaming)
 */
export async function ttsToBuffer(
  text: string,
  voice: string = 'clara',
  customSettings?: Partial<VoiceSettings>,
  emotion?: EmotionType
): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  
  if (!apiKey) {
    throw new Error('ElevenLabs API key não configurada')
  }
  
  const voiceId = resolveVoiceId(voice)
  const voiceSettings = getVoiceSettings(voice, emotion, customSettings)
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceSettings,
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
  }
  
  return await response.arrayBuffer()
}
