import FormData from 'form-data'
import axios from 'axios'
import { logger } from '../lib/logger'

interface STTResult {
  text: string
  confidence: number
  language: string
  duration: number
}

export class STTService {
  private whisperUrl: string

  constructor(whisperUrl?: string) {
    this.whisperUrl = whisperUrl || process.env.WHISPER_URL || 'http://localhost:9000/v1/audio/transcriptions'
  }

  async transcribeAudio(audioUrl: string): Promise<STTResult> {
    try {
      logger.info({ audioUrl }, 'Starting audio transcription')

      // Download audio file
      const audioResponse = await axios.get(audioUrl, {
        responseType: 'stream',
        timeout: 30000,
      })

      // Prepare form data for Whisper API
      const formData = new FormData()
      formData.append('file', audioResponse.data, {
        filename: 'audio.webm',
        contentType: 'audio/webm',
      })
      formData.append('model', 'whisper-1')
      formData.append('language', 'pt')
      formData.append('response_format', 'verbose_json')

      // Send to Whisper API
      const transcriptionResponse = await axios.post(this.whisperUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        timeout: 60000,
      })

      const result = transcriptionResponse.data

      logger.info({ 
        audioUrl,
        textLength: result.text?.length || 0,
        confidence: result.confidence || 0,
        duration: result.duration || 0 
      }, 'Audio transcription completed')

      return {
        text: result.text || '',
        confidence: result.confidence || 0,
        language: result.language || 'pt',
        duration: result.duration || 0,
      }
    } catch (error) {
      logger.error({ error, audioUrl }, 'Audio transcription failed')
      throw new Error('Failed to transcribe audio')
    }
  }

  async transcribeAudioBuffer(
    audioBuffer: Buffer, 
    filename: string = 'audio.webm',
    contentType: string = 'audio/webm'
  ): Promise<STTResult> {
    try {
      logger.info({ filename, contentType }, 'Starting buffer transcription')

      const formData = new FormData()
      formData.append('file', audioBuffer, {
        filename,
        contentType,
      })
      formData.append('model', 'whisper-1')
      formData.append('language', 'pt')
      formData.append('response_format', 'verbose_json')

      const response = await axios.post(this.whisperUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        timeout: 60000,
      })

      const result = response.data

      logger.info({ 
        filename,
        textLength: result.text?.length || 0,
        confidence: result.confidence || 0 
      }, 'Buffer transcription completed')

      return {
        text: result.text || '',
        confidence: result.confidence || 0,
        language: result.language || 'pt',
        duration: result.duration || 0,
      }
    } catch (error) {
      logger.error({ error, filename }, 'Buffer transcription failed')
      throw new Error('Failed to transcribe audio buffer')
    }
  }

  isHealthy(): boolean {
    // TODO: Implement health check ping to Whisper service
    return true
  }
}

export const sttService = new STTService()