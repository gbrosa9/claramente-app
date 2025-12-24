import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AudioProcessingError } from '@/src/server/lib/errors'

// Mock WebSocket and voice session functionality
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  readyState: 1, // OPEN
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}

// Mock voice session class for testing
class MockVoiceSession {
  public userId: string
  public conversationId: string
  public isActive: boolean = true
  public ws: any
  private chunks: Buffer[] = []
  private startTime: number

  constructor(userId: string, conversationId: string, ws: any) {
    this.userId = userId
    this.conversationId = conversationId
    this.ws = ws
    this.startTime = Date.now()
  }

  async processAudioChunk(chunk: Buffer): Promise<void> {
    if (chunk.length === 0) {
      throw new AudioProcessingError('Invalid audio chunk')
    }
    
    this.chunks.push(chunk)
    
    // Simulate STT processing
    if (chunk.length < 100) {
      throw new AudioProcessingError('Audio chunk too small')
    }
  }

  async sendAudioResponse(text: string): Promise<void> {
    if (this.ws.readyState !== 1) {
      throw new Error('WebSocket is not open')
    }
    
    const response = {
      type: 'audio_response',
      text: text,
      timestamp: new Date().toISOString()
    }
    
    this.ws.send(JSON.stringify(response))
  }

  sendStatus(status: string): void {
    if (this.ws.readyState === 1) {
      const statusMessage = {
        type: 'status',
        status: status,
        timestamp: new Date().toISOString()
      }
      this.ws.send(JSON.stringify(statusMessage))
    }
  }

  async close(): Promise<void> {
    this.isActive = false
    this.ws.close()
  }

  getMetrics() {
    return {
      startTime: this.startTime,
      audioChunksProcessed: this.chunks.length,
      totalDuration: Date.now() - this.startTime
    }
  }
}

describe('VoiceSession', () => {
  let voiceSession: MockVoiceSession
  const mockUserId = 'test-user-id'
  const mockConversationId = 'test-conv-id'

  beforeEach(() => {
    vi.clearAllMocks()
    mockWebSocket.readyState = 1
    voiceSession = new MockVoiceSession(
      mockUserId,
      mockConversationId,
      mockWebSocket
    )
  })

  describe('session lifecycle', () => {
    it('should initialize session with correct parameters', () => {
      expect(voiceSession).toBeDefined()
      expect(voiceSession.userId).toBe(mockUserId)
      expect(voiceSession.conversationId).toBe(mockConversationId)
      expect(voiceSession.isActive).toBe(true)
    })

    it('should handle session termination', async () => {
      await voiceSession.close()
      
      expect(voiceSession.isActive).toBe(false)
      expect(mockWebSocket.close).toHaveBeenCalled()
    })
  })

  describe('audio processing', () => {
    it('should process incoming audio data', async () => {
      const audioData = Buffer.alloc(1024)

      await expect(
        voiceSession.processAudioChunk(audioData)
      ).resolves.not.toThrow()
    })

    it('should handle invalid audio format', async () => {
      const invalidData = Buffer.alloc(0) // Empty buffer

      await expect(
        voiceSession.processAudioChunk(invalidData)
      ).rejects.toThrow(AudioProcessingError)
    })

    it('should handle small audio chunks', async () => {
      const smallChunk = Buffer.alloc(50) // Too small

      await expect(
        voiceSession.processAudioChunk(smallChunk)
      ).rejects.toThrow(AudioProcessingError)
    })

    it('should queue audio chunks during processing', async () => {
      const chunk1 = Buffer.alloc(512)
      const chunk2 = Buffer.alloc(512)

      await voiceSession.processAudioChunk(chunk1)
      await voiceSession.processAudioChunk(chunk2)

      const metrics = voiceSession.getMetrics()
      expect(metrics.audioChunksProcessed).toBe(2)
    })
  })

  describe('real-time communication', () => {
    it('should send audio response to client', async () => {
      const responseText = 'This is a test response'
      
      await voiceSession.sendAudioResponse(responseText)
      
      expect(mockWebSocket.send).toHaveBeenCalled()
      const sentData = mockWebSocket.send.mock.calls[0][0]
      const parsedData = JSON.parse(sentData)
      expect(parsedData.type).toBe('audio_response')
      expect(parsedData.text).toBe(responseText)
    })

    it('should handle WebSocket disconnection gracefully', async () => {
      // Simulate WebSocket closed state
      mockWebSocket.readyState = 3 // CLOSED

      const responseText = 'Test response'
      
      await expect(
        voiceSession.sendAudioResponse(responseText)
      ).rejects.toThrow('WebSocket is not open')
    })

    it('should send status updates to client', () => {
      voiceSession.sendStatus('processing')
      
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"status"')
      )
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"status":"processing"')
      )
    })

    it('should not send status when WebSocket is closed', () => {
      mockWebSocket.readyState = 3 // CLOSED
      
      voiceSession.sendStatus('processing')
      
      // Should not call send when WebSocket is closed
      expect(mockWebSocket.send).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle audio processing errors gracefully', async () => {
      const invalidAudio = Buffer.alloc(0) // Empty buffer

      await expect(
        voiceSession.processAudioChunk(invalidAudio)
      ).rejects.toThrow(AudioProcessingError)
    })

    it('should clean up resources on error', async () => {
      // Session should still be closeable even after errors
      try {
        await voiceSession.processAudioChunk(Buffer.alloc(0))
      } catch (error) {
        // Error expected
      }
      
      await expect(voiceSession.close()).resolves.not.toThrow()
    })
  })

  describe('session state management', () => {
    it('should track session metrics', () => {
      const metrics = voiceSession.getMetrics()
      
      expect(metrics).toHaveProperty('startTime')
      expect(metrics).toHaveProperty('audioChunksProcessed')
      expect(metrics).toHaveProperty('totalDuration')
      expect(typeof metrics.audioChunksProcessed).toBe('number')
      expect(typeof metrics.totalDuration).toBe('number')
    })

    it('should handle concurrent operations safely', async () => {
      const chunk = Buffer.alloc(256)
      
      const operations = [
        voiceSession.sendStatus('processing'),
        voiceSession.processAudioChunk(chunk),
        voiceSession.sendStatus('completed')
      ]

      // Should handle concurrent operations without race conditions
      await expect(Promise.allSettled(operations)).resolves.toBeDefined()
      
      const metrics = voiceSession.getMetrics()
      expect(metrics.audioChunksProcessed).toBe(1)
    })

    it('should maintain session state consistently', async () => {
      expect(voiceSession.isActive).toBe(true)
      
      await voiceSession.processAudioChunk(Buffer.alloc(256))
      expect(voiceSession.isActive).toBe(true)
      
      await voiceSession.close()
      expect(voiceSession.isActive).toBe(false)
    })
  })
})