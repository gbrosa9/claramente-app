import { addDays, startOfDay } from 'date-fns'
import { RiskEventSource, RiskSeverity } from '@prisma/client'
import { prisma } from '@/src/server/db'

interface RecordRiskEventInput {
  patientId: string
  source: RiskEventSource
  severity: RiskSeverity
  signal?: string | null
  meta?: Record<string, unknown> | null
  visibleForProfessional?: boolean
  createdAt?: Date
}

interface RiskSummaryOptions {
  patientId: string
  windowDays?: number
}

export interface RiskSummary {
  totals: {
    panic: number
    detection: number
    highCritical: number
  }
  series: Array<{
    date: string
    panicCount: number
    detectionCount: number
    highCriticalCount: number
  }>
}

const DEFAULT_META_WHITELIST = new Set([
  'model',
  'version',
  'signal',
  'signal_type',
  'classifier',
  'confidence',
  'score',
  'severity',
])

export function sanitizeRiskMeta(meta?: Record<string, unknown> | null) {
  if (!meta || typeof meta !== 'object') {
    return null
  }

  const clean: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase()
    if (lowerKey.includes('text') || lowerKey.includes('message') || lowerKey.includes('content')) {
      continue
    }
    if (DEFAULT_META_WHITELIST.has(key) || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value
    }
  }

  return Object.keys(clean).length > 0 ? clean : null
}

function toDateKey(date: Date) {
  return startOfDay(date)
}

export async function recordRiskEvent(input: RecordRiskEventInput) {
  const createdAt = input.createdAt ?? new Date()
  const safeMeta = sanitizeRiskMeta(input.meta ?? null)
  const safeSignal = input.signal ? String(input.signal).slice(0, 120) : null

  const event = await prisma.riskEvent.create({
    data: {
      patientId: input.patientId,
      source: input.source,
      severity: input.severity,
      signal: safeSignal ?? undefined,
      meta: safeMeta ?? {},
      visibleForProfessional: input.visibleForProfessional ?? true,
      createdAt,
    },
  })

  const dayKey = toDateKey(createdAt)

  await prisma.riskEventDailyAgg.upsert({
    where: {
      patientId_date: {
        patientId: input.patientId,
        date: dayKey,
      },
    },
    update: {
      panicCount: {
        increment: input.source === RiskEventSource.PANIC_BUTTON ? 1 : 0,
      },
      detectionCount: {
        increment: input.source === RiskEventSource.CHAT_DETECTION ? 1 : 0,
      },
      highCriticalCount: {
        increment: input.severity === RiskSeverity.HIGH || input.severity === RiskSeverity.CRITICAL ? 1 : 0,
      },
    },
    create: {
      patientId: input.patientId,
      date: dayKey,
      panicCount: input.source === RiskEventSource.PANIC_BUTTON ? 1 : 0,
      detectionCount: input.source === RiskEventSource.CHAT_DETECTION ? 1 : 0,
      highCriticalCount: input.severity === RiskSeverity.HIGH || input.severity === RiskSeverity.CRITICAL ? 1 : 0,
    },
  })

  return event
}

export async function getRiskSummary(options: RiskSummaryOptions): Promise<RiskSummary> {
  const windowDays = options.windowDays ?? 30
  const now = new Date()
  const fromDate = toDateKey(addDays(now, -windowDays + 1))

  const [totalPanic, totalDetection, totalHighCritical, daily] = await Promise.all([
    prisma.riskEvent.count({
      where: { patientId: options.patientId, source: RiskEventSource.PANIC_BUTTON },
    }),
    prisma.riskEvent.count({
      where: { patientId: options.patientId, source: RiskEventSource.CHAT_DETECTION },
    }),
    prisma.riskEvent.count({
      where: {
        patientId: options.patientId,
        severity: { in: [RiskSeverity.HIGH, RiskSeverity.CRITICAL] },
      },
    }),
    prisma.riskEventDailyAgg.findMany({
      where: {
        patientId: options.patientId,
        date: {
          gte: fromDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    }),
  ])

  const series = daily.map((item) => ({
    date: item.date.toISOString().slice(0, 10),
    panicCount: item.panicCount,
    detectionCount: item.detectionCount,
    highCriticalCount: item.highCriticalCount,
  }))

  return {
    totals: {
      panic: totalPanic,
      detection: totalDetection,
      highCritical: totalHighCritical,
    },
    series,
  }
}
