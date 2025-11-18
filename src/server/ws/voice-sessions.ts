import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { parse } from 'url'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../db'
import { sttService } from '../services/stt'
import { ttsService } from '../services/tts'
import { logger } from '../lib/logger'

interface VoiceSession {
  id: string
  userId: string
  conversationId: string
  ws: WebSocket
  startTime: number
  chunks: Buffer[]
  isActive: boolean
}

interface VoiceMessage {
  type: 'start_session' | 'audio_chunk' | 'end_session' | 'text_message'
  sessionId?: string
  conversationId?: string
  data?: any
  chunk?: string // base64 encoded audio
  text?: string
}

class VoiceSessionManager {
  private sessions = new Map<string, VoiceSession>()
  private wss: WebSocketServer

  constructor() {
    this.wss = new WebSocketServer({ 
      port: 8080,
      path: '/voice',
    })

    this.wss.on('connection', this.handleConnection.bind(this))
    logger.info('Voice WebSocket server started on port 8080')
  }

  private async handleConnection(ws: WebSocket, request: IncomingMessage) {
    try {
      // Extract token from query params or headers
      const { query } = parse(request.url || '', true)
      const token = query.token as string || request.headers.authorization?.split(' ')[1]

      if (!token) {
        ws.close(1008, 'Authentication required')
        return
      }

      // Verify JWT token (simplified for WebSocket)
      // In production, you'd want proper JWT verification here
      const user = await this.verifyToken(token)
      if (!user) {
        ws.close(1008, 'Invalid token')
        return
      }

      ws.on('message', (data) => this.handleMessage(ws, Buffer.from(data as ArrayBuffer), user))
      ws.on('close', () => this.handleDisconnection(ws))
      ws.on('error', (error) => logger.error({ error }, 'WebSocket error'))

      logger.info({ userId: user.id }, 'Voice session connected')
    } catch (error) {
      logger.error({ error }, 'Voice connection failed')
      ws.close(1011, 'Internal server error')
    }
  }

  private async verifyToken(token: string): Promise<{ id: string; email: string } | null> {
    try {
      // This is a simplified token verification
      // In production, use proper JWT verification
      const user = await prisma.user.findFirst({
        where: { id: token }, // Simplified - token should be actual JWT
        select: { id: true, email: true }
      })
      return user
    } catch (error) {
      return null
    }
  }

  private async handleMessage(ws: WebSocket, data: Buffer, user: { id: string; email: string }) {
    try {
      const message: VoiceMessage = JSON.parse(data.toString())

      switch (message.type) {
        case 'start_session':
          await this.startSession(ws, message, user)
          break
        
        case 'audio_chunk':
          await this.handleAudioChunk(ws, message, user)
          break
        
        case 'end_session':
          await this.endSession(ws, message, user)
          break
        
        case 'text_message':
          await this.handleTextMessage(ws, message, user)
          break
        
        default:
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Unknown message type' 
          }))
      }
    } catch (error) {
      logger.error({ error, userId: user.id }, 'Voice message handling failed')
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Message processing failed' 
      }))
    }
  }

  private async startSession(ws: WebSocket, message: VoiceMessage, user: { id: string; email: string }) {
    const sessionId = `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const conversationId = message.conversationId!

    // Verify user has access to conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id,
        deletedAt: null,
      }
    })

    if (!conversation) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Conversation not found or access denied' 
      }))
      return
    }

    // Create voice session record
    const voiceSession = await prisma.voiceSession.create({
      data: {
        id: sessionId,
        conversationId,
        status: 'ACTIVE',
        sttEngine: 'whisper',
        ttsEngine: process.env.TTS_PROVIDER || 'elevenlabs',
      }
    })

    // Store session in memory
    this.sessions.set(sessionId, {
      id: sessionId,
      userId: user.id,
      conversationId,
      ws,
      startTime: Date.now(),
      chunks: [],
      isActive: true,
    })

    ws.send(JSON.stringify({
      type: 'session_started',
      sessionId,
      conversationId,
    }))

    logger.info({ sessionId, userId: user.id, conversationId }, 'Voice session started')
  }

  private async handleAudioChunk(ws: WebSocket, message: VoiceMessage, user: { id: string; email: string }) {
    const sessionId = message.sessionId!
    const session = this.sessions.get(sessionId)

    if (!session || !session.isActive) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Session not found or inactive' 
      }))
      return
    }

    if (message.chunk) {
      // Store audio chunk
      const audioBuffer = Buffer.from(message.chunk, 'base64')
      session.chunks.push(audioBuffer)

      // Send acknowledgment
      ws.send(JSON.stringify({
        type: 'chunk_received',
        sessionId,
        chunkIndex: session.chunks.length - 1,
      }))
    }
  }

  private async handleTextMessage(ws: WebSocket, message: VoiceMessage, user: { id: string; email: string }) {
    const sessionId = message.sessionId!
    const session = this.sessions.get(sessionId)

    if (!session || !session.isActive) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Session not found or inactive' 
      }))
      return
    }

    try {
      // Create user message in database
      const userMessage = await prisma.message.create({
        data: {
          conversationId: session.conversationId,
          sender: 'USER',
          text: message.text!,
        }
      })

      // Process with LLM and get response (simplified for real-time)
      const { createLLMService } = await import('../services/llm')
      const llmService = createLLMService()
      
      // Get conversation context (simplified)
      const context = {
        conversationId: session.conversationId,
        messages: [], // In production, load recent messages
        userProfile: { name: 'User' }
      }

      const llmResult = await llmService.generateReply(context, message.text!)

      // Create Clara's response
      const claraMessage = await prisma.message.create({
        data: {
          conversationId: session.conversationId,
          sender: 'CLARA',
          text: llmResult.response,
          tokensIn: llmResult.tokensUsed.input,
          tokensOut: llmResult.tokensUsed.output,
        }
      })

      // Generate TTS for Clara's response
      const ttsResult = await ttsService.generateTherapeuticVoice(llmResult.response)

      // Update Clara's message with audio URL
      await prisma.message.update({
        where: { id: claraMessage.id },
        data: { audioUrl: ttsResult.audioUrl }
      })

      // Send response to client
      ws.send(JSON.stringify({
        type: 'clara_response',
        sessionId,
        messageId: claraMessage.id,
        text: llmResult.response,
        audioUrl: ttsResult.audioUrl,
        duration: ttsResult.duration,
      }))

      logger.info({ 
        sessionId, 
        userMessageId: userMessage.id,
        claraMessageId: claraMessage.id 
      }, 'Real-time message processed')

    } catch (error) {
      logger.error({ error, sessionId }, 'Text message processing failed')
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }))
    }
  }

  private async endSession(ws: WebSocket, message: VoiceMessage, user: { id: string; email: string }) {
    const sessionId = message.sessionId!
    const session = this.sessions.get(sessionId)

    if (!session) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Session not found' 
      }))
      return
    }

    try {
      session.isActive = false
      const duration = Date.now() - session.startTime

      // Process accumulated audio chunks if any
      if (session.chunks.length > 0) {
        const fullAudio = Buffer.concat(session.chunks)
        
        // Transcribe audio
        const transcription = await sttService.transcribeAudioBuffer(
          fullAudio, 
          `session_${sessionId}.webm`, 
          'audio/webm'
        )

        if (transcription.text) {
          // Create message with transcription
          await prisma.message.create({
            data: {
              conversationId: session.conversationId,
              sender: 'USER',
              text: transcription.text,
              metadata: {
                stt: {
                  confidence: transcription.confidence,
                  duration: transcription.duration,
                }
              }
            }
          })
        }
      }

      // Update voice session record
      await prisma.voiceSession.update({
        where: { id: sessionId },
        data: {
          status: 'ENDED',
          durationMs: duration,
          endedAt: new Date(),
        }
      })

      // Remove from memory
      this.sessions.delete(sessionId)

      ws.send(JSON.stringify({
        type: 'session_ended',
        sessionId,
        duration,
        chunksProcessed: session.chunks.length,
      }))

      logger.info({ sessionId, duration, chunks: session.chunks.length }, 'Voice session ended')

    } catch (error) {
      logger.error({ error, sessionId }, 'Session end failed')
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to end session'
      }))
    }
  }

  private handleDisconnection(ws: WebSocket) {
    // Find and cleanup session
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.ws === ws) {
        session.isActive = false
        this.sessions.delete(sessionId)
        
        // Update database
        prisma.voiceSession.update({
          where: { id: sessionId },
          data: {
            status: 'ENDED',
            durationMs: Date.now() - session.startTime,
            endedAt: new Date(),
          }
        }).catch((error: any) => logger.error({ error, sessionId }, 'Failed to update session on disconnect'))

        logger.info({ sessionId }, 'Voice session disconnected')
        break
      }
    }
  }

  getActiveSessions(): number {
    return Array.from(this.sessions.values()).filter(s => s.isActive).length
  }

  getSessionStats() {
    const sessions = Array.from(this.sessions.values())
    return {
      total: sessions.length,
      active: sessions.filter(s => s.isActive).length,
      averageDuration: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (Date.now() - s.startTime), 0) / sessions.length 
        : 0
    }
  }
}

// Create singleton instance
export const voiceSessionManager = new VoiceSessionManager()

// API route for session management
export { VoiceSessionManager }