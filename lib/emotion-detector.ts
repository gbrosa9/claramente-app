/**
 * Emotion Detector e Prosódia Natural
 * Mapeia emoções para configurações de voz e gera SSML para naturalidade
 */

// Tipos de emoção suportados
export type EmotionType =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'fearful'
  | 'surprised'
  | 'disgusted'
  | 'calm'
  | 'empathetic'
  | 'caring'
  | 'supportive'
  | 'encouraging'
  | 'serious'
  | 'professional'
  | 'excited'
  | 'melancholic'
  | 'peaceful'
  | 'anxious'
  | 'hopeful'
  | 'thoughtful'

// Configurações de voz para cada emoção
export interface EmotionVoiceSettings {
  stabilityMultiplier: number  // Multiplicador para stability (ElevenLabs)
  styleBoost: number           // Adicional para style (ElevenLabs)
  speakingRate: number         // Taxa de fala para SSML
  pitch: string                // Pitch para SSML (ex: '+2st', '-1st')
  pauseMultiplier: number      // Multiplicador para pausas
}

const EMOTION_SETTINGS: Record<EmotionType, EmotionVoiceSettings> = {
  neutral: {
    stabilityMultiplier: 1.0,
    styleBoost: 0,
    speakingRate: 1.0,
    pitch: '+0st',
    pauseMultiplier: 1.0,
  },
  happy: {
    stabilityMultiplier: 0.85,
    styleBoost: 0.15,
    speakingRate: 1.1,
    pitch: '+2st',
    pauseMultiplier: 0.9,
  },
  sad: {
    stabilityMultiplier: 1.1,
    styleBoost: 0.1,
    speakingRate: 0.85,
    pitch: '-2st',
    pauseMultiplier: 1.3,
  },
  angry: {
    stabilityMultiplier: 0.7,
    styleBoost: 0.25,
    speakingRate: 1.15,
    pitch: '+1st',
    pauseMultiplier: 0.8,
  },
  fearful: {
    stabilityMultiplier: 0.8,
    styleBoost: 0.2,
    speakingRate: 1.2,
    pitch: '+3st',
    pauseMultiplier: 0.7,
  },
  surprised: {
    stabilityMultiplier: 0.75,
    styleBoost: 0.2,
    speakingRate: 1.1,
    pitch: '+4st',
    pauseMultiplier: 0.85,
  },
  disgusted: {
    stabilityMultiplier: 0.9,
    styleBoost: 0.15,
    speakingRate: 0.95,
    pitch: '-1st',
    pauseMultiplier: 1.1,
  },
  calm: {
    stabilityMultiplier: 1.15,
    styleBoost: -0.1,
    speakingRate: 0.9,
    pitch: '-1st',
    pauseMultiplier: 1.2,
  },
  empathetic: {
    stabilityMultiplier: 1.0,
    styleBoost: 0.1,
    speakingRate: 0.92,
    pitch: '+0.5st',
    pauseMultiplier: 1.15,
  },
  caring: {
    stabilityMultiplier: 1.05,
    styleBoost: 0.1,
    speakingRate: 0.9,
    pitch: '+1st',
    pauseMultiplier: 1.2,
  },
  supportive: {
    stabilityMultiplier: 1.0,
    styleBoost: 0.12,
    speakingRate: 0.95,
    pitch: '+1st',
    pauseMultiplier: 1.1,
  },
  encouraging: {
    stabilityMultiplier: 0.9,
    styleBoost: 0.18,
    speakingRate: 1.05,
    pitch: '+2st',
    pauseMultiplier: 0.95,
  },
  serious: {
    stabilityMultiplier: 1.2,
    styleBoost: -0.05,
    speakingRate: 0.95,
    pitch: '-2st',
    pauseMultiplier: 1.1,
  },
  professional: {
    stabilityMultiplier: 1.15,
    styleBoost: 0,
    speakingRate: 1.0,
    pitch: '-1st',
    pauseMultiplier: 1.0,
  },
  excited: {
    stabilityMultiplier: 0.7,
    styleBoost: 0.25,
    speakingRate: 1.2,
    pitch: '+3st',
    pauseMultiplier: 0.75,
  },
  melancholic: {
    stabilityMultiplier: 1.1,
    styleBoost: 0.1,
    speakingRate: 0.8,
    pitch: '-3st',
    pauseMultiplier: 1.4,
  },
  peaceful: {
    stabilityMultiplier: 1.2,
    styleBoost: -0.1,
    speakingRate: 0.85,
    pitch: '-1st',
    pauseMultiplier: 1.3,
  },
  anxious: {
    stabilityMultiplier: 0.75,
    styleBoost: 0.15,
    speakingRate: 1.15,
    pitch: '+2st',
    pauseMultiplier: 0.8,
  },
  hopeful: {
    stabilityMultiplier: 0.95,
    styleBoost: 0.12,
    speakingRate: 1.0,
    pitch: '+1.5st',
    pauseMultiplier: 1.0,
  },
  thoughtful: {
    stabilityMultiplier: 1.1,
    styleBoost: 0.05,
    speakingRate: 0.88,
    pitch: '+0st',
    pauseMultiplier: 1.25,
  },
}

/**
 * Retorna as configurações de voz para uma emoção
 */
export function getVoiceSettingsForEmotion(emotion: EmotionType): EmotionVoiceSettings {
  return EMOTION_SETTINGS[emotion] || EMOTION_SETTINGS.neutral
}

/**
 * Retorna lista de emoções disponíveis
 */
export function getAvailableEmotions(): EmotionType[] {
  return Object.keys(EMOTION_SETTINGS) as EmotionType[]
}

/**
 * Adiciona pausas naturais ao texto baseado em pontuação
 */
function addNaturalPauses(text: string, pauseMultiplier: number): string {
  const basePause = Math.round(300 * pauseMultiplier)
  const longPause = Math.round(500 * pauseMultiplier)
  const veryLongPause = Math.round(700 * pauseMultiplier)
  
  return text
    // Pausa longa após ponto final, exclamação, interrogação
    .replace(/([.!?])\s+/g, `$1<break time="${longPause}ms"/> `)
    // Pausa média após vírgula
    .replace(/,\s+/g, `,<break time="${basePause}ms"/> `)
    // Pausa curta após ponto e vírgula e dois pontos
    .replace(/([;:])\s+/g, `$1<break time="${Math.round(basePause * 0.8)}ms"/> `)
    // Pausa após reticências
    .replace(/\.\.\.\s*/g, `...<break time="${veryLongPause}ms"/> `)
    // Pausa antes de "mas", "porém", "entretanto" (contraste)
    .replace(/\s+(mas|porém|entretanto|contudo|todavia)\s+/gi, 
      `<break time="${Math.round(basePause * 0.6)}ms"/> $1 `)
}

/**
 * Adiciona ênfase em palavras importantes
 */
function addEmphasis(text: string): string {
  // Palavras que merecem ênfase leve
  const emphasisWords = [
    'importante', 'essencial', 'fundamental', 'crucial',
    'sempre', 'nunca', 'muito', 'realmente', 'verdadeiramente',
    'você', 'seu', 'sua', 'seus', 'suas',
  ]
  
  let result = text
  for (const word of emphasisWords) {
    const regex = new RegExp(`\\b(${word})\\b`, 'gi')
    result = result.replace(regex, '<emphasis level="moderate">$1</emphasis>')
  }
  
  return result
}

/**
 * Gera SSML com prosódia natural baseada na emoção
 */
export function addNaturalProsody(text: string, emotion: EmotionType): string {
  const settings = getVoiceSettingsForEmotion(emotion)
  
  // Aplica pausas naturais
  let processedText = addNaturalPauses(text, settings.pauseMultiplier)
  
  // Adiciona ênfase em palavras importantes (opcional, pode ser muito)
  // processedText = addEmphasis(processedText)
  
  // Converte rate para porcentagem
  const ratePercent = Math.round(settings.speakingRate * 100)
  
  // Monta o SSML
  const ssml = `<speak>
  <prosody rate="${ratePercent}%" pitch="${settings.pitch}">
    ${processedText}
  </prosody>
</speak>`
  
  return ssml
}

/**
 * Detecta emoção básica a partir do texto (heurística simples)
 * Para detecção mais precisa, use um modelo de NLP
 */
export function detectEmotionFromText(text: string): EmotionType {
  const lowerText = text.toLowerCase()
  
  // Padrões de emoção
  const patterns: { emotion: EmotionType; keywords: string[] }[] = [
    { emotion: 'happy', keywords: ['feliz', 'alegre', 'contente', 'maravilhoso', 'ótimo', 'incrível', '😊', '😄', '🎉'] },
    { emotion: 'sad', keywords: ['triste', 'chateado', 'deprimido', 'melancólico', 'desanimado', '😢', '😭'] },
    { emotion: 'angry', keywords: ['raiva', 'irritado', 'furioso', 'bravo', 'revoltado', '😠', '😡'] },
    { emotion: 'anxious', keywords: ['ansioso', 'nervoso', 'preocupado', 'apreensivo', 'angustiado'] },
    { emotion: 'calm', keywords: ['calmo', 'tranquilo', 'sereno', 'relaxado', 'em paz'] },
    { emotion: 'empathetic', keywords: ['entendo', 'compreendo', 'sinto muito', 'imagino como', 'deve ser difícil'] },
    { emotion: 'encouraging', keywords: ['você consegue', 'força', 'vai dar certo', 'acredito em você', 'continue'] },
    { emotion: 'hopeful', keywords: ['esperança', 'vai melhorar', 'futuro', 'possibilidade', 'oportunidade'] },
  ]
  
  for (const { emotion, keywords } of patterns) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return emotion
      }
    }
  }
  
  return 'neutral'
}

/**
 * Sugere emoção apropriada para resposta terapêutica
 */
export function suggestTherapeuticEmotion(userEmotion: EmotionType): EmotionType {
  // Mapa de resposta terapêutica apropriada
  const therapeuticResponse: Partial<Record<EmotionType, EmotionType>> = {
    sad: 'empathetic',
    angry: 'calm',
    anxious: 'calm',
    fearful: 'supportive',
    happy: 'encouraging',
    excited: 'supportive',
    melancholic: 'caring',
    hopeful: 'encouraging',
  }
  
  return therapeuticResponse[userEmotion] || 'empathetic'
}
