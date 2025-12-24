import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RiskEventSource, RiskSeverity } from '@prisma/client'
import { recordRiskEvent } from '@/src/server/services/risk-events'
import { recordUserActivityEvent } from '@/src/server/services/user-activity'

const DetectionBodySchema = z.object({
  patientId: z.string().uuid(),
  severity: z.nativeEnum(RiskSeverity),
  signal: z.string().min(1),
  classifier: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  visibleForProfessional: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
})

const ALLOWED_SIGNALS = new Set([
  'suicide_ideation',
  'self_harm',
  'panic_attack',
  'hopelessness',
  'agitation',
  'severe_distress',
])

function authorizeInternal(request: NextRequest) {
  const expectedToken = process.env.RISK_DETECTION_TOKEN
  if (!expectedToken) {
    console.warn('RISK_DETECTION_TOKEN missing. Denying access to detection endpoint.')
    return false
  }
  const headerToken = request.headers.get('x-internal-token')
  return Boolean(headerToken && headerToken === expectedToken)
}

function sanitizeMetadata(metadata?: Record<string, unknown>) {
  if (!metadata || typeof metadata !== 'object') {
    return undefined
  }

  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(metadata)) {
    const lower = key.toLowerCase()
    if (lower.includes('text') || lower.includes('message') || lower.includes('transcript')) {
      continue
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value
    }
  }
  return Object.keys(clean).length > 0 ? clean : undefined
}

export async function POST(request: NextRequest) {
  try {
    if (!authorizeInternal(request)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = DetectionBodySchema.parse(await request.json())

    if (!ALLOWED_SIGNALS.has(body.signal)) {
      return NextResponse.json({ ok: false, error: 'Sinal inválido' }, { status: 400 })
    }

    const cleanMetadata = sanitizeMetadata(body.metadata)

    await recordRiskEvent({
      patientId: body.patientId,
      source: RiskEventSource.CHAT_DETECTION,
      severity: body.severity,
      visibleForProfessional: body.visibleForProfessional ?? true,
      signal: body.signal,
      meta: {
        classifier: body.classifier,
        confidence: body.confidence,
        ...(cleanMetadata ?? {}),
      },
    })

    await recordUserActivityEvent({
      userId: body.patientId,
      eventType: 'risk_detected',
      meta: {
        signal: body.signal,
        severity: body.severity,
        confidence: body.confidence,
      },
    })

    const shouldTriggerCrisis = body.severity === RiskSeverity.CRITICAL

    return NextResponse.json({ ok: true, data: { registered: true, shouldTriggerCrisis } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Dados inválidos', details: error.errors }, { status: 400 })
    }

    console.error('Erro ao registrar detecção de risco:', error)
    return NextResponse.json({ ok: false, error: 'Erro ao registrar evento.' }, { status: 500 })
  }
}
