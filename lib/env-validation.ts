/**
 * Validação de Variáveis de Ambiente
 * Verifica se as chaves de API necessárias estão configuradas
 */

export interface EnvValidationResult {
  isValid: boolean
  missingKeys: string[]
  warnings: string[]
}

/**
 * Verifica se uma variável de ambiente está definida
 */
export function isEnvDefined(key: string): boolean {
  const value = process.env[key]
  return value !== undefined && value !== '' && value !== 'undefined'
}

/**
 * Obtém valor de variável de ambiente ou lança erro
 */
export function getEnvOrThrow(key: string): string {
  const value = process.env[key]
  if (!value || value === 'undefined') {
    throw new Error(`Variável de ambiente ${key} não está configurada`)
  }
  return value
}

/**
 * Verifica se a chave de API está configurada, lança erro se não
 */
export function checkApiKeyOrThrow(keyName: string, serviceName: string): string {
  const value = process.env[keyName]
  if (!value || value === 'undefined') {
    const error = `${serviceName}: API key não configurada. Configure ${keyName} no .env.local`
    console.error(`[ENV] ${error}`)
    throw new Error(error)
  }
  return value
}

/**
 * Valida todas as variáveis de ambiente necessárias para TTS
 */
export function validateTTSEnvironment(): EnvValidationResult {
  const missingKeys: string[] = []
  const warnings: string[] = []
  
  // ElevenLabs (principal)
  if (!isEnvDefined('ELEVENLABS_API_KEY')) {
    missingKeys.push('ELEVENLABS_API_KEY')
  }
  
  // Voice IDs opcionais
  if (!isEnvDefined('ELEVENLABS_VOICE_ID')) {
    warnings.push('ELEVENLABS_VOICE_ID não definido, usando voz padrão')
  }
  
  // Google TTS (alternativa)
  if (!isEnvDefined('GOOGLE_TTS_API_KEY')) {
    warnings.push('GOOGLE_TTS_API_KEY não definido, Google TTS não disponível')
  }
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys,
    warnings,
  }
}

/**
 * Valida ambiente e retorna mensagem de status
 */
export function getTTSStatus(): {
  elevenlabs: boolean
  googleTts: boolean
  message: string
} {
  const hasElevenLabs = isEnvDefined('ELEVENLABS_API_KEY')
  const hasGoogleTts = isEnvDefined('GOOGLE_TTS_API_KEY')
  
  let message = ''
  
  if (hasElevenLabs && hasGoogleTts) {
    message = 'TTS configurado: ElevenLabs (principal) + Google TTS (alternativa)'
  } else if (hasElevenLabs) {
    message = 'TTS configurado: ElevenLabs'
  } else if (hasGoogleTts) {
    message = 'TTS configurado: Google TTS'
  } else {
    message = 'AVISO: Nenhum serviço de TTS configurado'
  }
  
  return {
    elevenlabs: hasElevenLabs,
    googleTts: hasGoogleTts,
    message,
  }
}

/**
 * Lista todas as variáveis de ambiente relacionadas ao TTS
 */
export const TTS_ENV_KEYS = [
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_VOICE_ID',
  'ELEVENLABS_VOICE_ID_2',
  'ELEVENLABS_VOICE_ID_3',
  'ELEVENLABS_FEMALE_VOICE_ID',
  'ELEVENLABS_THERAPEUTIC_VOICE_ID',
  'GOOGLE_TTS_API_KEY',
] as const

/**
 * Retorna status de cada variável de ambiente TTS (para debug)
 */
export function debugTTSEnv(): Record<string, boolean> {
  const status: Record<string, boolean> = {}
  for (const key of TTS_ENV_KEYS) {
    status[key] = isEnvDefined(key)
  }
  return status
}
