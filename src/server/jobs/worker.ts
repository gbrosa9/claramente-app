import { Worker, Job } from 'bullmq'
import IORedis from 'ioredis'
import { prisma } from '../db'
import { createLLMService } from '../services/llm'
import { sttService } from '../services/stt'
import { ttsService } from '../services/tts'
import { logger } from '../lib/logger'
import type { LLMJob, STTJob, TTSJob, NotificationJob } from './queues'

const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

// LLM Worker
const llmWorker = new Worker('llm-processing', async (job: Job<LLMJob>) => {
  const { conversationId, messageId, userMessage, userId, context } = job.data
  
  logger.info({ messageId, conversationId }, 'Processing LLM job')

  try {
    // Get conversation context
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          where: { sender: { in: ['USER', 'CLARA'] } },
          select: {
            sender: true,
            text: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 20, // Last 20 messages for context
        },
        user: {
          select: {
            name: true,
            // Add assessment history if needed
          }
        }
      }
    })

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Build context for LLM
    const llmContext = {
      conversationId,
      messages: conversation.messages.map((msg: any) => ({
        role: msg.sender === 'USER' ? 'user' as const : 'assistant' as const,
        content: msg.text || '',
        timestamp: msg.createdAt,
      })),
      userProfile: {
        name: conversation.user.name,
      }
    }

    // Generate response using LLM service
    const llmService = createLLMService()
    const result = await llmService.generateReply(llmContext, userMessage)

    // Save Clara's response
    const claraMessage = await prisma.message.create({
      data: {
        conversationId,
        sender: 'CLARA',
        text: result.response,
        tokensIn: result.tokensUsed.input,
        tokensOut: result.tokensUsed.output,
        metadata: result.metadata,
      }
    })

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    })

    // Enqueue TTS for Clara's response
    const { enqueueTTSProcessing } = await import('./queues')
    await enqueueTTSProcessing({
      messageId: claraMessage.id,
      text: result.response,
      conversationId,
      userId,
    })

    logger.info({ 
      messageId, 
      claraMessageId: claraMessage.id,
      tokensUsed: result.tokensUsed.input + result.tokensUsed.output 
    }, 'LLM job completed')

    return {
      messageId: claraMessage.id,
      response: result.response,
      tokensUsed: result.tokensUsed,
    }
  } catch (error) {
    logger.error({ error, messageId, conversationId }, 'LLM job failed')
    throw error
  }
}, { connection: redis, concurrency: 5 })

// STT Worker
const sttWorker = new Worker('stt-processing', async (job: Job<STTJob>) => {
  const { messageId, audioUrl, conversationId, userId } = job.data
  
  logger.info({ messageId, audioUrl }, 'Processing STT job')

  try {
    // Transcribe audio
    const result = await sttService.transcribeAudio(audioUrl)

    // Update message with transcription
    await prisma.message.update({
      where: { id: messageId },
      data: {
        text: result.text,
        metadata: {
          stt: {
            confidence: result.confidence,
            language: result.language,
            duration: result.duration,
          }
        }
      }
    })

    // If transcription successful and text is meaningful, enqueue LLM processing
    if (result.text && result.text.trim().length > 0 && result.confidence > 0.5) {
      const { enqueueLLMProcessing } = await import('./queues')
      await enqueueLLMProcessing({
        conversationId,
        messageId,
        userMessage: result.text,
        userId,
      })
    }

    logger.info({ 
      messageId, 
      textLength: result.text.length,
      confidence: result.confidence 
    }, 'STT job completed')

    return {
      messageId,
      text: result.text,
      confidence: result.confidence,
    }
  } catch (error) {
    logger.error({ error, messageId, audioUrl }, 'STT job failed')
    throw error
  }
}, { connection: redis, concurrency: 3 })

// TTS Worker
const ttsWorker = new Worker('tts-processing', async (job: Job<TTSJob>) => {
  const { messageId, text, conversationId, userId, voiceSettings } = job.data
  
  logger.info({ messageId, textLength: text.length }, 'Processing TTS job')

  try {
    // Generate speech
    const result = await ttsService.generateTherapeuticVoice(text)

    // Update message with audio URL
    await prisma.message.update({
      where: { id: messageId },
      data: {
        audioUrl: result.audioUrl,
        metadata: {
          tts: {
            duration: result.duration,
            format: result.format,
            provider: 'elevenlabs', // or get from service
          }
        }
      }
    })

    logger.info({ 
      messageId, 
      audioUrl: result.audioUrl,
      duration: result.duration 
    }, 'TTS job completed')

    return {
      messageId,
      audioUrl: result.audioUrl,
      duration: result.duration,
    }
  } catch (error) {
    logger.error({ error, messageId }, 'TTS job failed')
    throw error
  }
}, { connection: redis, concurrency: 2 })

// Notifications Worker
const notificationsWorker = new Worker('notifications', async (job: Job<NotificationJob>) => {
  const { type, recipient, subject, message, data } = job.data
  
  logger.info({ type, recipient }, 'Processing notification job')

  try {
    switch (type) {
      case 'email':
        // TODO: Implement email sending
        logger.info({ recipient, subject }, 'Email notification sent')
        break
      case 'sms':
        // TODO: Implement SMS sending
        logger.info({ recipient }, 'SMS notification sent')
        break
      case 'push':
        // TODO: Implement push notification
        logger.info({ recipient }, 'Push notification sent')
        break
      default:
        throw new Error(`Unsupported notification type: ${type}`)
    }

    return { success: true, type, recipient }
  } catch (error) {
    logger.error({ error, type, recipient }, 'Notification job failed')
    throw error
  }
}, { connection: redis, concurrency: 10 })

// Worker event handlers
const workers = [llmWorker, sttWorker, ttsWorker, notificationsWorker]

workers.forEach(worker => {
  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, queue: job.queueName }, 'Worker job completed')
  })

  worker.on('failed', (job, err) => {
    logger.error({ 
      jobId: job?.id, 
      queue: job?.queueName, 
      error: err 
    }, 'Worker job failed')
  })

  worker.on('error', (err) => {
    logger.error({ error: err }, 'Worker error')
  })
})

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down workers...')
  
  await Promise.all(workers.map(worker => worker.close()))
  await redis.disconnect()
  
  logger.info('Workers shut down')
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

logger.info('Workers started successfully')

export { llmWorker, sttWorker, ttsWorker, notificationsWorker }