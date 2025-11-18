import { Queue, Worker, QueueEvents } from 'bullmq'
import IORedis from 'ioredis'
import { logger } from '../lib/logger'

// Redis connection
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
})

// Queue definitions
export const queues = {
  llm: new Queue('llm-processing', { connection: redis }),
  stt: new Queue('stt-processing', { connection: redis }),
  tts: new Queue('tts-processing', { connection: redis }),
  notifications: new Queue('notifications', { connection: redis }),
} as const

// Job types
export interface LLMJob {
  conversationId: string
  messageId: string
  userMessage: string
  userId: string
  context?: any
}

export interface STTJob {
  messageId: string
  audioUrl: string
  conversationId: string
  userId: string
}

export interface TTSJob {
  messageId: string
  text: string
  conversationId: string
  userId: string
  voiceSettings?: any
}

export interface NotificationJob {
  type: 'email' | 'sms' | 'push'
  recipient: string
  subject?: string
  message: string
  data?: any
}

// Job creators
export async function enqueueLLMProcessing(job: LLMJob) {
  logger.info({ messageId: job.messageId, conversationId: job.conversationId }, 'Enqueuing LLM job')
  
  return await queues.llm.add('process-message', job, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  })
}

export async function enqueueSTTProcessing(job: STTJob) {
  logger.info({ messageId: job.messageId, audioUrl: job.audioUrl }, 'Enqueuing STT job')
  
  return await queues.stt.add('transcribe-audio', job, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  })
}

export async function enqueueTTSProcessing(job: TTSJob) {
  logger.info({ messageId: job.messageId, textLength: job.text.length }, 'Enqueuing TTS job')
  
  return await queues.tts.add('synthesize-speech', job, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  })
}

export async function enqueueNotification(job: NotificationJob) {
  logger.info({ type: job.type, recipient: job.recipient }, 'Enqueuing notification')
  
  return await queues.notifications.add(`send-${job.type}`, job, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 50,
    removeOnFail: 25,
  })
}

// Queue events for monitoring
export const queueEvents = {
  llm: new QueueEvents('llm-processing', { connection: redis }),
  stt: new QueueEvents('stt-processing', { connection: redis }),
  tts: new QueueEvents('tts-processing', { connection: redis }),
  notifications: new QueueEvents('notifications', { connection: redis }),
}

// Health check
export async function checkQueuesHealth(): Promise<{
  healthy: boolean
  queues: Record<string, { waiting: number; active: number; completed: number; failed: number }>
}> {
  try {
    const health: any = { queues: {} }
    
    for (const [name, queue] of Object.entries(queues)) {
      const waiting = await queue.getWaiting()
      const active = await queue.getActive()
      const completed = await queue.getCompleted()
      const failed = await queue.getFailed()
      
      health.queues[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      }
    }
    
    health.healthy = Object.values(health.queues).every((q: any) => q.failed < 10)
    
    return health
  } catch (error) {
    logger.error({ error }, 'Queue health check failed')
    return {
      healthy: false,
      queues: {}
    }
  }
}

// Graceful shutdown
export async function closeQueues() {
  logger.info('Closing queues...')
  
  await Promise.all([
    ...Object.values(queues).map(queue => queue.close()),
    ...Object.values(queueEvents).map(events => events.close()),
    redis.disconnect(),
  ])
  
  logger.info('Queues closed')
}

// Setup queue event listeners
Object.entries(queueEvents).forEach(([name, events]) => {
  events.on('completed', ({ jobId, returnvalue }) => {
    logger.info({ queue: name, jobId, returnvalue }, 'Job completed')
  })
  
  events.on('failed', ({ jobId, failedReason }) => {
    logger.error({ queue: name, jobId, failedReason }, 'Job failed')
  })
  
  events.on('stalled', ({ jobId }) => {
    logger.warn({ queue: name, jobId }, 'Job stalled')
  })
})

process.on('SIGINT', closeQueues)
process.on('SIGTERM', closeQueues)