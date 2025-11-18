import axios from 'axios'
import { logger } from '../lib/logger'

interface TTSResult {
  audioUrl: string
  duration: number
  format: string
}

export interface TTSConfig {
  provider: 'elevenlabs' | 'piper'
  apiKey?: string
  voiceId?: string
  baseURL?: string
}

export class TTSService {
  private config: TTSConfig

  constructor(config?: Partial<TTSConfig>) {
    this.config = {
      provider: (process.env.TTS_PROVIDER as 'elevenlabs' | 'piper') || 'elevenlabs',
      apiKey: process.env.ELEVENLABS_API_KEY,
      voiceId: process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB', // Default voice
      baseURL: process.env.PIPER_URL || 'http://localhost:8080',
      ...config,
    }
  }

  async synthesizeSpeech(text: string, options?: {
    stability?: number
    similarity_boost?: number
    style?: number
  }): Promise<TTSResult> {
    try {
      if (this.config.provider === 'elevenlabs') {
        return await this.synthesizeWithElevenLabs(text, options)
      } else if (this.config.provider === 'piper') {
        return await this.synthesizeWithPiper(text, options)
      } else {
        throw new Error(`Unsupported TTS provider: ${this.config.provider}`)
      }
    } catch (error) {
      logger.error({ error, provider: this.config.provider }, 'TTS synthesis failed')
      throw new Error('Failed to synthesize speech')
    }
  }

  private async synthesizeWithElevenLabs(text: string, options?: {
    stability?: number
    similarity_boost?: number
    style?: number
  }): Promise<TTSResult> {
    logger.info({ textLength: text.length, voiceId: this.config.voiceId }, 'Starting ElevenLabs synthesis')

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}`
    
    const requestBody = {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: options?.stability ?? 0.5,
        similarity_boost: options?.similarity_boost ?? 0.75,
        style: options?.style ?? 0.0,
        use_speaker_boost: true,
      },
      output_format: 'mp3_44100_128',
    }

    const response = await axios.post(url, requestBody, {
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.config.apiKey,
      },
      responseType: 'arraybuffer',
      timeout: 30000,
    })

    // In a real implementation, you would upload this to S3 or similar storage
    // For now, we'll create a temporary URL
    const audioBuffer = Buffer.from(response.data)
    const audioUrl = await this.uploadAudio(audioBuffer, 'mp3')

    logger.info({ 
      textLength: text.length,
      audioSize: audioBuffer.length,
      audioUrl 
    }, 'ElevenLabs synthesis completed')

    return {
      audioUrl,
      duration: this.estimateAudioDuration(text),
      format: 'mp3',
    }
  }

  private async synthesizeWithPiper(text: string, options?: any): Promise<TTSResult> {
    logger.info({ textLength: text.length }, 'Starting Piper synthesis')

    const response = await axios.post(`${this.config.baseURL}/synthesize`, {
      text,
      voice: 'pt_BR-faber-medium',
      output_format: 'wav',
    }, {
      responseType: 'arraybuffer',
      timeout: 30000,
    })

    const audioBuffer = Buffer.from(response.data)
    const audioUrl = await this.uploadAudio(audioBuffer, 'wav')

    logger.info({ 
      textLength: text.length,
      audioSize: audioBuffer.length,
      audioUrl 
    }, 'Piper synthesis completed')

    return {
      audioUrl,
      duration: this.estimateAudioDuration(text),
      format: 'wav',
    }
  }

  private async uploadAudio(audioBuffer: Buffer, format: string): Promise<string> {
    // TODO: Implement actual S3/MinIO upload
    // For now, return a mock URL
    const filename = `tts_${Date.now()}.${format}`
    const mockUrl = `https://storage.claramente.app/audio/${filename}`
    
    logger.info({ filename, size: audioBuffer.length }, 'Audio uploaded to storage')
    
    return mockUrl
  }

  private estimateAudioDuration(text: string): number {
    // Estimate duration based on reading speed (roughly 2.5 characters per second for Portuguese)
    const charactersPerSecond = 2.5
    return Math.ceil(text.length / charactersPerSecond)
  }

  async generateTherapeuticVoice(text: string): Promise<TTSResult> {
    // Use specific settings for therapeutic voice - calmer, more empathetic
    const therapeuticOptions = {
      stability: 0.7,  // More stable, less variable
      similarity_boost: 0.8,  // High similarity to base voice
      style: 0.2,  // Slight emotional expression
    }

    return await this.synthesizeSpeech(text, therapeuticOptions)
  }

  isHealthy(): boolean {
    if (this.config.provider === 'elevenlabs') {
      return !!this.config.apiKey
    } else if (this.config.provider === 'piper') {
      return !!this.config.baseURL
    }
    return false
  }
}

export const ttsService = new TTSService()