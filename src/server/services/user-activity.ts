import { prisma } from '@/src/server/db'

const META_KEY_WHITELIST = new Set(['source', 'provider', 'model', 'duration_ms', 'tokens', 'message_length'])

function sanitizeMeta(meta?: Record<string, unknown> | null) {
  if (!meta || typeof meta !== 'object') {
    return {}
  }

  const clean: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(meta)) {
    const lower = key.toLowerCase()
    if (lower.includes('text') || lower.includes('message_body') || lower.includes('transcript')) {
      continue
    }

    if (META_KEY_WHITELIST.has(key) || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value
    }
  }

  return clean
}

interface TrackEventInput {
  userId: string
  eventType: string
  meta?: Record<string, unknown> | null
}

export async function recordUserActivityEvent(input: TrackEventInput) {
  const payload = sanitizeMeta(input.meta)
  await prisma.userActivityEvent.create({
    data: {
      userId: input.userId,
      eventType: input.eventType,
      meta: payload,
    },
  })
}
